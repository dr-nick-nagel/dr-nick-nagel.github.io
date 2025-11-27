/**
 * Get the *local* transformation matrix on an element (i.e., 
 * the transform matrix between the element and its parent). 
 * 
 * @param(SVG Graphics Element) el -- any SVG graphics element
 *
 * @returns any transformations applied to the element in 
 * matrix form or identity matrix if none.
 */
export function getTM( el ) {
    const svg = el.ownerSVGElement || el;
    const list = el.transform?.baseVal;
    if (!list || list.numberOfItems === 0)
      return svg.createSVGMatrix(); // identity
    return list.consolidate().matrix;
}

// Extend SVGGraphicsElement (covers <g>, <path>, <rect>, <circle>, etc.)
// IN CASE YOU WANT TO ADD TO OBJECT PROTOTYPE ...
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
export function updateTransform(svgNode, toMatrixStr, duration = 0, easing = t => t, fromMatrixStr = null) {
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
  
