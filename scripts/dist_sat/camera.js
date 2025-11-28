/**
 * Camera.js -- Encapsulates camera functionality (pan and zoom)
 *
 * Designed for SVG / camera coordinate transforms in ES6 environments.
 *
 * Author: N
 * For documentation see: 
 * 
 *   https://dr-nick-nagel.github.io/blog/separating-axis-theorem-sat.html
 */

import {
    getTM,
    updateTransform
} from "./svg_matrix_utilities.js";

import {
    makeRect, 
    transformPolygon, 
    polygonContainsPolygon
} from './sat.js';

const l = console.log;

export class Camera {
    /**
     * @param {SVGGraphicsElement} cameraNode - The node to transform
     * @param {object} options - Configuration for zoom and pan
     */
    constructor(cameraNode, options = {}) {
  
      if ( ! (cameraNode instanceof SVGGraphicsElement) ) {
        throw new Error(  "[CAMERA] cameraNode must be an SVGGraphicsElement");
      }
      this.node = cameraNode;
      this.isZoomedIn = false;
  
      // Zoom matrices (toggle)
      this.zoomedOutMatrix = options.zoomedOutMatrix || "1 0 0 1 0 0";
      this.zoomedInMatrix  = options.zoomedInMatrix  || "3 0 0 3 -650 -450";
  
      // Pan constraints (in SVG world coordinates)
      this.panLimits = options.panLimits || { 
        left: 0, 
        top: 0, 
        right: 600, 
        bottom: 600 
      };
  
      // Pan state
      this.isPanning     = false;
      this.pointerCoords = null;
  
      // Bind methods
      this.toggleZoom = this.toggleZoom.bind(this);
      this.startPan   = this.startPan.bind(this);
      this.panMove    = this.panMove.bind(this);
      this.endPan     = this.endPan.bind(this);
  
    }
  
    /**
     * For now, zoom is just a toggle ... 
     * 
     * @param {scalar} duration   time for effect
     * @param {function} easing   easing function (polynomial)
     */
    async toggleZoom( duration = 5000, easing = t => polyNomialEase (t, 3) ) {
      const targetMatrix = this.isZoomedIn ? this.zoomedOutMatrix : this.zoomedInMatrix;
      await updateTransform(this.node, targetMatrix, duration, easing);
      const endStateMatrix = getTM( this.node );
      this.isZoomedIn = endStateMatrix.a > 1 ;

      console.log( "***********\nZOOM:\n matrix a: ", endStateMatrix );
      console.log( "is ZOOMED IN  ", this.isZoomedIn );


    }

    /**
     * State cycle method to manage panning the camera ...
     * 
     * @param {point} uiCoords client coordinates from UI
     * @returns early if not zoomed in...
     */
    startPan( uiCoords ) {
      // only allow panning if user is zoomed in...

      console.log( "***********\nSTART PAN:\n zoomed?: ", this.isZoomedIn );
      console.log( " panning ", this.isPanning );
      if ( ! this.isZoomedIn )  return;

      const pt = this._getEventPoint( uiCoords );
      this.isPanning     = true;
      this.pointerCoords = pt;

      console.log( "EARLY RETURN FAILED:\n panning ", this.isPanning );

    }
  
    /**
     * State cycle method for panning 
     * @param {point} uiCoords client coordinates from UI
     * @returns 
     */
    panMove( uiCoords ) {



      if ( !this.isPanning ) return;
      const pt = this._getEventPoint( uiCoords ) ;
      const dx = pt.x - this.pointerCoords.x;
      const dy = pt.y - this.pointerCoords.y;
      const currentMatrix = getTM(this.node);
      let e = currentMatrix.e + dx;
      let f = currentMatrix.f + dy;

      const newMatrix = `${currentMatrix.a} ${currentMatrix.b} ${currentMatrix.c} ${currentMatrix.d} ${e} ${f}`;
      
      // TEST PANNING CONSTRAINTS -----------------------
      // SVG VIEWBOX DIMENSIONS
      const svgRoot = this.node.ownerSVGElement;
      const worldViewRect  = makeRect(0, 0, 600, 600);
      // RECTANGLE DIMENSIONS CONTRAINING CAMERA PAN OPERATION
      const cameraRect  = makeRect(180, 60, 455, 360);
      const M_camera    = getTM( this.node ); 
      const cameraRect_trans = transformPolygon(cameraRect, M_camera, svgRoot);
      const isContained = polygonContainsPolygon(cameraRect_trans, worldViewRect);
   
      // -- VIEW TEST RESULTS ----
      // function report() {
      //   l("REPORT\n________");
      //   l( "camera transform matrix\n", M_camera );
      //   l( "Inner coords\n-------- \n", worldViewRect );
      //   l( "Camera Rect (Constraints) \n-------- \n", cameraRect_trans );
      //   l( "CONSTRAINED\n-------- \n", isContained );
      //   l("_______________");
      // }
      // report();

      const display = document.getElementById("test_out");
      if( isContained ) {
        display.style.fill = "green";
        display.textContent = "happy"; 
      } else {
        display.style.fill="red";
        display.textContent = `PANNING: x ${ cameraRect_trans[0].x.toFixed(0)}  y ${ cameraRect_trans[0].y.toFixed(0)}`; 
      }
      // -------------------------
  
      // panning
      updateTransform(this.node, newMatrix, 0); 
      this.pointerCoords = pt;
  
    }
  
    endPan() {
      if ( !this.isPanning ) return;
      this.isPanning     = false;
      this.pointerCoords = null;
    }
  
    /**
     * Helper function to get SVG wolrd coordinates given UI client coords
     * from an event (e.g., mouse, touch, etc...)
     * 
     * @param { point } uiCoords x y client coordinates associated with an event
     * @returns SVG world coords wrapped in a SVG point...
     */
    _getEventPoint( uiCoords ) {
      const svg = this.node.closest('svg');
      if( !svg ) { 
        throw new Error("[Camera _getEventPoint] unable to locate svg root"); 
      }
      const pt = svg.createSVGPoint();
      pt.x = uiCoords.clientX;
      pt.y = uiCoords.clientY;
      return pt.matrixTransform( svg.getScreenCTM().inverse() );
    }

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
 * @param {scalar} p_elapsed_time 
 * @param {scalar} power 
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


/**
 * Example usage:
 * 
 * import {
 *   Camera
 * } from './camera.js';
 * 
 * const groupNode = document.getElementById( "cam_g_element" );
 * const cameraObj = Camera( groupNode );
 */