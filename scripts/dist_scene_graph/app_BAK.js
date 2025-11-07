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
function updateTransform( svgNode, toMatrixStr, duration = 0, easing = t => t, fromMatrixStr ) {

  if ( ! ( svgNode instanceof SVGGraphicsElement )    ) {
    throw new Error("[updateTransform] svgNode must be an SVGGraphicsElement");
  }

  // Parse matrix strings into numeric arrays
  const parseMatrix = str => {
    const nums = str.trim().split(/\s+/).map( Number );
    if (nums.length !== 6 || nums.some( isNaN )) {
      throw new Error( `[updateTransform] non-valid SVG matrix string: "${str}"` );
    }
    return new DOMMatrix(
      [ nums[0], nums[1], nums[2], nums[3], nums[4], nums[5] ]
    );
  }
    
  const getCurrentMatrix = node => {
    const baseVal = node.transform.baseVal;
    if (baseVal.numberOfItems === 0) {
      // Create identity 
      const M_trans = node.ownerSVGElement.createSVGTransformFromMatrix(
        new DOMMatrix()
      );
      baseVal.initialize( M_trans );
      return M_trans.matrix;
    }
    // or consolodate existing transfrom functions to matrix...
    const consolidated = baseVal.consolidate();
    return consolidated ? consolidated.matrix : new DOMMatrix();
  };
  
  // use from matrix or get current from element
  const from = fromMatrixStr ? parseMatrix( fromMatrixStr ) : getCurrentMatrix( svgNode );
  const to   = parseMatrix( toMatrixStr );

  // If no duration (is 0), transform is instantaneous
  if (duration <= 0) {
    const M_trans = svgNode.ownerSVGElement.createSVGTransformFromMatrix( to) ;
    svgNode.transform.baseVal.initialize( M_trans );
    return Promise.resolve( svgNode );
  }

  l( "DURATION: " + duration );

  // Otherwise animate
  return new Promise( resolve => {

    const startTime = performance.now();
    const transformList = svgNode.transform.baseVal;
    const currentTransform =
      transformList.numberOfItems > 0
        ? transformList.getItem( 0 )
        : svgNode.ownerSVGElement.createSVGTransformFromMatrix( from );

    if (transformList.numberOfItems === 0) transformList.appendItem( currentTransform );

    function step( time ) {

      const t = Math.min( (time - startTime) / duration, 1 );

      const k = easing(  t );

      // Linear interpolation on all 6 components
      const M_step = new DOMMatrix([
        from.a + (to.a - from.a) * k,
        from.b + (to.b - from.b) * k,
        from.c + (to.c - from.c) * k,
        from.d + (to.d - from.d) * k,
        from.e + (to.e - from.e) * k,
        from.f + (to.f - from.f) * k
      ]);

      currentTransform.setMatrix( M_step );

      if (t < 1) {
        requestAnimationFrame( step );
      } else {
        resolve( svgNode );
      }
    }

    requestAnimationFrame(step);
  } );

}



// Easing function 
// function polyNomialEase( duration, t_elapsed, power = 3 ) {
//   const t_elapsed_proportion = t_elapsed / duration;
//   const MIDWAY= 0.5;
//   if ( t_elapsed_proportion < MIDWAY ) {
//     const f_t_elapsed = MIDWAY * Math.pow(2 * t_elapsed_proportion, power);
//     return f_t_elapsed;
//   } else {
//     const f_t_elapsed = 1 - MIDWAY * Math.pow(2 * (1 - t_elapsed_proportion), power);
//     return f_t_elapsed;
//   }
// }


function polyNomialEase(t, p = 3) {
  if (t < 0.5) {
    const  f_t = Math.pow(2 * t, p) / 2;
    //l( t + "  :  " + f_t );
    return f_t;
  } else {
    const  f_t = 1 - Math.pow(2 * (1 - t), p) / 2;
    //l( t + "  :  " + f_t );
    return f_t
  }
}



svgRoot.addEventListener('click', 
  async (event) => {
    console.log( performance.now() );
    await updateTransform(
      document.querySelector("#camera"),
      "4 0 0 4 -800 -400",
      5000,
      polyNomialEase
    );  
    console.log( performance.now() );
  }
);


















// ---- Event Handlers: Mouse Wheel ----------------------------------------
// zoom constant numbers for arithmetic...
const zoom = {
  IN  : -1,
  OUT : 1
};

const CAMERA_NODE_ID = "camera";
const ANIMATION_ID   = "zoom_animation";
const cameraNode    = document.getElementById( CAMERA_NODE_ID );
const zoomAnimation = document.getElementById( ANIMATION_ID );
// SVG transform matrix values...
const transMatrices = [
    "matrix(1, 0, 0, 1, 0, 0)",     
    "matrix(2, 0, 0, 2, -200 , -100)", 
    "matrix(4, 0, 0, 4, -800 , -400)"  
];
// Level of Detail
let lodIndex = 0;

/**
 * Applies the transform matrix corresponding to the new LOD index,
 * using the animateTransform element for a smooth transition.
 * 
 * @param {number} zoomIndex - The target index (0, 1, or 2).
 * 
 */
function applyZoom( zoomIndex ) {
  if ( zoomIndex < 0 || zoomIndex >= transMatrices.length ) {
      return; 
  }
  lodIndex = zoomIndex;
  const matrixStr = transMatrices[ lodIndex ];
  // l( matrixStr );
  
  
  // 3. Set up and start the animation
  
  // Get the current transform value from the camera node to use as the animation 'from' value.
  // NOTE: 'from' is optional, but setting 'to' and starting the animation is enough.
  // The browser automatically interpolates from the current state to the 'to' state.
  
  // Set the target 'to' value for the transition

  zoomAnimation.setAttribute('to', matrixStr);
  zoomAnimation.beginElement();

  l( zoomAnimation );

}

svgRoot.addEventListener('wheel', (event) => {
  event.preventDefault(); 
  const direction = event.deltaY > 0 ? zoom.OUT : zoom.IN; 
  const newLOD = lodIndex + direction;
  applyZoom(newLOD);
  }, 
  { passive: false }
);


l("End transmission!");
