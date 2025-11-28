const l = console.log;

const uiStates = {
  IDLE: "idle",
  PANNING: "swiping finger to pan camera",
  PINCHING: "pinch or spread to zoom",
}; 

let mode = uiStates.IDLE;
let panStartCoords = null;
let panTimer  = null;

// injectible ...
const  svgRoot = document.querySelector( "svg#ginnungagap_debug" );


// find a pot of gold...
const target = { x: 331, y: 230, radius: 50 };
const camera = document.getElementById( "camera" );

// ~~~~  EVENT HANDLER FOR POT OF GOLD ~~~~~~~~~~~~~~~~~~~~~~~~~
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
      text += `${pt.x.toFixed(0)}, ${pt.y.toFixed(0)} `;
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


// ~~~~  CAMERA HANDLING ~~~~~~~~~~~~~~~~~~~~~~~~~
import {
  CamStateMachine
} from "./csm.js"

import {
  Camera
} from "./camera.js";

// camera is the svg camera node...
const cameraObj = new Camera( camera );
const csm       = new CamStateMachine( svgRoot, cameraObj );


// ~~~~~~~~ SCROLLING FUNCTIONS ~~~~~~~~~~~~~~~~

/**
 * Decorator (Higher order Function) that throttles execution of the 
 * decorated function (i.e., constrains execution to the specified 
 * interval)
 * 
 * @param {function} fnc The function to throttle.
 * @param {number} interval The time in milliseconds to limit the function calls.
 * @returns the decorated function ... 
 */
function throttle(fnc, interval) {
  let ready = true;
  return function() {
    const context = this;
    const args    = arguments;
    if ( ready ) {
      fnc.apply( context, args) ;
      ready = false;
      setTimeout( () => ready = true, interval );
    }
  }
}

// elements
const scrollable     = document.querySelector( "main.content" );
const floatSectionStartElem = document.querySelector( "#start_float" );
const floatSectionEndElem   = document.querySelector( "#end_float" );
const floater = document.querySelector( "div.floater" );
/**
 * Scrolling function to float and pin a target content block 
 * based on defined section boundaries...
 */
function floatElementOnScroll(  ) {
  // pinnable content
  const floating = floater.classList.contains('float_me');
  const floatRect = floater.getBoundingClientRect();
  // document offests
  let floatStartBoundary = floatSectionStartElem.offsetTop;
  let floatEndBoundary   = floatSectionEndElem.offsetTop;
  // current scroll position 
  const scrollPosition = scrollable.scrollTop;

  if( floating ) {
    floatStartBoundary -= floatRect.height;
    // floatEndBoundary -= floatRect.height;
  }

  if( scrollPosition > floatStartBoundary && scrollPosition < floatEndBoundary ) {
    if ( !floating ) {
      floater.classList.add( "float_me" );
      // scrollBy Scrolls by specified amount. Need to correct for the floated content; 
      // Subtract out height of floater ...
      scrollable.scrollBy( 0, - floatRect.height );
    }
  } else {
    if( floating ) {
      floater.classList.remove( "float_me" );
      // scrollBy Scrolls by specified amount. Need to correct for the floated content; 
      // add back in the height of floater ...
      scrollable.scrollBy( 0, + floatRect.height );
    }
  }

}

scrollable.addEventListener(
  'scroll', 
  throttle( floatElementOnScroll  , 100 )
);

