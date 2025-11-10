const l = console.log;
l("Begin ...");

/**
 * Factory function that creates an event handler to report mouse coordinates
 * within an SVG element.
 *
 * @param {SVGSVGElement} svgElement - The SVG element to track mouse events in.
 * @returns {function(MouseEvent): void} - An event handler function.
 */
export function createSvgCoordsFinder( svg ) {
  return function( evt ) {
      let pt = svg.createSVGPoint();
      pt.x = evt.clientX;
      pt.y = evt.clientY;
      let transformed = pt.matrixTransform(
          svg.getScreenCTM().inverse()
      );
      console.log(`SVG COORDS: (  ${transformed.x.toFixed(2)}, ${transformed.y.toFixed(2)}  )`);
  };
}


/**
 * Get the *local* transformation matrix on an element (i.e., 
 * the transform matrix between the element and its parent). 
 * 
 * @param(SVG Graphics Element) el -- any SVG graphics element
 *
 * @returns any transformations applied to the element in 
 * matrix form or identity matrix if none.
 */
function getTM( el ) {
    const svg = el.ownerSVGElement || el;
    const list = el.transform?.baseVal;
    if (!list || list.numberOfItems === 0)
      return svg.createSVGMatrix(); // identity
    return list.consolidate().matrix;
}

// Extend SVGGraphicsElement (covers <g>, <path>, <rect>, <circle>, etc.)
if ( !SVGGraphicsElement.prototype.getTM ) {
    SVGGraphicsElement.prototype.getTM = function() {
      const svg = this.ownerSVGElement || this;
      const list = this.transform?.baseVal;
      if (!list || list.numberOfItems === 0) {
        return svg.createSVGMatrix(); // return the identity matrix
      }
      // Consolidate the transform list into a single matrix
      const consolidated = list.consolidate();
      // defensive coding against browsers that return null 
      // rather than identity...
      return consolidated ? consolidated.matrix : svg.createSVGMatrix();
    };
}

/**
 * SVGGraphicsElement prototype extension to get the 
 * *cumulative transformation matrix* relative to any
 * arbitrary ancestor in the SVG scene graph ... 
 */
if ( !SVGGraphicsElement.prototype.getRelativeCTM ) {
    /**
     * Get the *cumulative transformation matrix* relative to ...
     * 
     * @param( SVGGraphicsElement) ancestralGE -- any arbitrary 
     *  ancestor in the SVG scene graph ... 
     *
     * @returns the cumulative transformation matrix between nodes... 
     */
    SVGGraphicsElement.prototype.getRelativeCTM = function( ancestralGE ) {
      if ( !( ancestralGE instanceof SVGGraphicsElement ) ) {
        throw new TypeError("[getRelativeCTM]: parameter is not an SVGGraphicsElement");
      }
      // Ensure the element is on the SVG DOM
      const svg = this.ownerSVGElement;
      if (!svg || svg !== ancestralGE.ownerSVGElement) {
        throw new Error("[getRelativeCTM]: Elements must share the same <svg> root...");
      }
      // ( Multiply elementCTM by inverse( ancestorCTM ) )
      const elementCTM = this.getCTM();
      const ancestorCTM = ancestralGE.getCTM();
      const relativeMatrix = ancestorCTM.inverse().multiply( elementCTM );
      return relativeMatrix;
    };
}

// injectible ...
let svgRoot = document.querySelector( "svg#ginnungagap" );
document.addEventListener( 
  'DOMContentLoaded' , 
  (evt) => {
    document.addEventListener(
      "click",
      createSvgCoordsFinder( svgRoot )
    );
  }
);

/**
 * Updates or animates an SVG element's transform matrix. 
 * 
 * Requires a target node and matrix as string. 
 * 
 * If a duration is provided the animation is smoothly tweened with 
 * (optional)  easing. 
 * 
 * If from matrix is supplied it will be used else current matrix is
 * pulled off element ... 
 *
 * @param {SVGElement} svgNode - Target SVG element.
 * @param {string} toMatrixStr - Target matrix string "a b c d e f".
 * @param {number} [duration=0] - Duration in ms. 0 = instant update.
 * @param {function} [ easing=(t)=>t ] - Easing function: t in [0,1] → eased t.
 * @param {string} [fromMatrixStr] - Optional starting matrix string. 
 *                                   If omitted, current transform is used.
 * @returns {Promise<SVGElement>} Resolves with the target node on completion.
 */
function updateTransform(svgNode, toMatrixStr, duration = 0, easing = t => t, fromMatrixStr = null) {
  if (!(svgNode instanceof SVGGraphicsElement)) {
    throw new Error("[updateTransform] svgNode must be an SVGGraphicsElement");
  }

  const parseMatrix = str => {
    const nums = str.trim().split(/\s+/).map(Number);
    if (nums.length !== 6 || nums.some(isNaN)) {
      throw new Error(`[updateTransform] non-valid SVG matrix string: "${str}"`);
    }
    return { a: nums[0], b: nums[1], c: nums[2], d: nums[3], e: nums[4], f: nums[5] };
  };

  const M_from = getTM(svgNode);
  const from = fromMatrixStr ? parseMatrix(fromMatrixStr) : { a: M_from.a, b: M_from.b, c: M_from.c, d: M_from.d, e: M_from.e, f: M_from.f };
  const to = parseMatrix(toMatrixStr);

  const svgEl = svgNode.ownerSVGElement;

  // Instantaneous update
  if (duration <= 0) {
    const finalMatrix = svgEl.createSVGMatrix();
    finalMatrix.a = to.a;
    finalMatrix.b = to.b;
    finalMatrix.c = to.c;
    finalMatrix.d = to.d;
    finalMatrix.e = to.e;
    finalMatrix.f = to.f;
    const transform = svgEl.createSVGTransformFromMatrix(finalMatrix);
    svgNode.transform.baseVal.initialize(transform);
    return Promise.resolve(svgNode);
  }

  // Animated interpolation
  return new Promise(resolve => {
    const startTime = performance.now();

    function step(time) {
      const tElapsed = Math.min((time - startTime) / duration, 1);
      const k = easing(tElapsed);

      // Linear interpolation of numeric values
      const interp = {
        a: from.a + (to.a - from.a) * k,
        b: from.b + (to.b - from.b) * k,
        c: from.c + (to.c - from.c) * k,
        d: from.d + (to.d - from.d) * k,
        e: from.e + (to.e - from.e) * k,
        f: from.f + (to.f - from.f) * k
      };

      // Apply interpolated values
      const M_step = svgEl.createSVGMatrix();
      M_step.a = interp.a;
      M_step.b = interp.b;
      M_step.c = interp.c;
      M_step.d = interp.d;
      M_step.e = interp.e;
      M_step.f = interp.f;

      // Replace transform on node
      let transform = svgNode.transform.baseVal.numberOfItems > 0
        ? svgNode.transform.baseVal.getItem(0)
        : svgEl.createSVGTransform();
      transform.setMatrix(M_step);
      if (svgNode.transform.baseVal.numberOfItems === 0) svgNode.transform.baseVal.appendItem(transform);

      if (tElapsed < 1) {
        requestAnimationFrame(step);
      } else {
        resolve(svgNode);
      }
    }

    requestAnimationFrame(step);
  });
}


/**
 * Callback Easing function for camera transitions.
 * Collaborates with update transform to ease in and out.
 *  
 * INPUTS:
 * 1. time elapsed (over DURATION of ANIMATION)
 * 2. power for polynomial ease shape ... 
 * 
 * OUTPUT f(t) -- the value on the s polynomial curve 
 * (NORMALIZED TO BETWEEN 0 and 1  [0 <--> 1] )
 * 
 * @param {*} p_elapsed_time 
 * @param {*} power 
 * @returns scalar between 0 and 1 reflecting polynomial shape ...
 */
function polyNomialEase( p_elapsed_time, power = 3 ) {
  const MIDWAY= 0.5;
  let f_t_elapsed = 0;
  if ( p_elapsed_time < MIDWAY ) {
    f_t_elapsed = MIDWAY * Math.pow(2 * p_elapsed_time, power);
  } else {
    f_t_elapsed = 1 - MIDWAY * Math.pow(2 * (1 - p_elapsed_time), power);
  }
  return f_t_elapsed;
}


// svgRoot.addEventListener('click', 
//   async (event) => {

//     await updateTransform(
//       document.querySelector("#camera"),
//       // "6 0 0 6 -1200 -600",
// "6 0 0 6 -1500 -900",
//       // "4 0 0 4 -800 -400",
//       5000,
//       polyNomialEase
//     );  

//   }
// );


const target = { x: 331, y: 230, radius: 50 };
const camera = document.getElementById( "camera" );
const potStyles = document.getElementById("style_wrapper");
const balloon   = document.getElementById("text_balloon");
const coordText = document.getElementById("coordText");
svgRoot.addEventListener('pointerdown', 
  ( event ) => {
    const pt = svgRoot.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    const svgP = pt.matrixTransform( camera.getScreenCTM().inverse() );
    // hit test
    const dx = svgP.x - target.x;
    const dy = svgP.y - target.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < target.radius) {
      potStyles.classList.add("fade-in");
      let text = "";
      text += "client coords: ";
      text += `${pt.x}, ${pt.y} `;
      text += "SVG coords: ";
      text += `${ svgP.x.toFixed(0) }, ${ svgP.y.toFixed(0) } `;
      coordText.textContent = text;
      balloon.classList.add("show");
      requestAnimationFrame(() => {
        balloon.classList.remove("show");
      });
    }
  }
);


// ---- CAMERA Encapsulation .... ----------------------------------------

/**
 * Encapsulates camera functionality (pan and zoom)
 * Artwork specific ... 
 * 
 * 
 */
class Camera {
  /**
   * @param {SVGGraphicsElement} cameraNode - The node to transform
   * @param {object} options - Configuration for zoom and pan
   */
  constructor(cameraNode, options = {}) {

    if (!(cameraNode instanceof SVGGraphicsElement)) {
      throw new Error(  "[CAMERA] cameraNode must be an SVGGraphicsElement");
    }
    this.node = cameraNode;
    this.isZoomedIn = false;

    // Zoom matrices (toggle)
    this.zoomedOutMatrix = options.zoomedOutMatrix || "1 0 0 1 0 0";
    this.zoomedInMatrix  = options.zoomedInMatrix  || "6 0 0 6 -1500 -900";

    // Pan constraints (in SVG world coordinates)
    this.panLimits = options.panLimits || { left: 0, top: 0, right: 600, bottom: 600 };

    // Pan state
    this.isPanning   = false;
    this.lastPointer = null;

    // Bind methods
    this.toggleZoom = this.toggleZoom.bind(this);
    this.startPan   = this.startPan.bind(this);
    this.panMove    = this.panMove.bind(this);
    this.endPan     = this.endPan.bind(this);

  }

  async toggleZoom( duration = 5000, easing = t => polyNomialEase (t, 3) ) {
    const targetMatrix = this.isZoomedIn ? this.zoomedOutMatrix : this.zoomedInMatrix;
    await updateTransform(this.node, targetMatrix, duration, easing);
    this.isZoomedIn = !this.isZoomedIn;
  }

  startPan( event ) {
    // Only allow pan when zoomed
    if (!this.isZoomedIn) return; 
    event.preventDefault();
    const pt = this._getEventPoint(event);
    this.isPanning   = true;
    this.lastPointer = pt;
  }

  panMove( event ) {
    if (!this.isPanning) return;
    event.preventDefault();

    const pt = this._getEventPoint(event);

    const dx = pt.x - this.lastPointer.x;
    const dy = pt.y - this.lastPointer.y;

    const currentMatrix = getTM(this.node);
    let e = currentMatrix.e + dx;
    let f = currentMatrix.f + dy;

    // Clamp to pan limits
    e = Math.min(Math.max(e, this.panLimits.left), this.panLimits.right);
    f = Math.min(Math.max(f, this.panLimits.top), this.panLimits.bottom);

    const newMatrix = `${currentMatrix.a} ${currentMatrix.b} ${currentMatrix.c} ${currentMatrix.d} ${e} ${f}`;
    updateTransform(this.node, newMatrix, 0); // instant pan

    this.lastPointer = pt;
  }

  endPan(event) {
    if (!this.isPanning) return;
    this.isPanning = false;
    this.lastPointer = null;
  }

  _getEventPoint( event ) {
    // Works for touch or mouse
    const svg = this.node.ownerSVGElement;
    const pt = svg.createSVGPoint();
    if (event.touches && event.touches[0]) {
      pt.x = event.touches[0].clientX;
      pt.y = event.touches[0].clientY;
    } else {
      pt.x = event.clientX;
      pt.y = event.clientY;
    }
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }
}

// ---- Camera initialization ----------
const cameraObj = new Camera(camera);

// DESKTOP: double-click to toggle zoom
svgRoot.addEventListener(
  "dblclick", 
  async ( evt ) => {
    await cameraObj.toggleZoom();
});


// MOBILE: pinch / spread to handle zoom 
let touchStartDist = 0;

svgRoot.addEventListener("touchstart", (e) => {
  if (e.touches.length === 2) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    touchStartDist = Math.hypot(dx, dy);
  }
});

svgRoot.addEventListener("touchend", (e) => {
  if (e.touches.length < 2 && touchStartDist) {
    touchStartDist = 0; 
  }
});

/**
 * TODO: RESUME HERE
 * 
 * THE TOGGLE IS NOT GOOD FOR PINCH/SPREAD GESTURES ... 
 * 
 */
svgRoot.addEventListener("touchmove", (e) => {
  if (e.touches.length === 2) {
    e.preventDefault(); 
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const dist = Math.hypot(dx, dy);
    const delta = dist - touchStartDist;

    if (Math.abs(delta) > 50) { 
      cameraObj.toggleZoom();
      touchStartDist = dist; 
    }
  }
});


  // MOUSE: pan handling
  // svgRoot.addEventListener("mousedown", camera.startPan);
  // svgRoot.addEventListener("mousemove", camera.panMove);
  // svgRoot.addEventListener("mouseup", camera.endPan);
  

l("End transmission!");
