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
let SVG_ROOT = null;
document.addEventListener( 
  'DOMContentLoaded' , 
  (evt) => {
    SVG_ROOT = document.getElementById("TESTER"); 
    document.addEventListener(
      "click",
      createSvgCoordsFinder( SVG_ROOT )
    );
  }
);


l("End transmission!");
