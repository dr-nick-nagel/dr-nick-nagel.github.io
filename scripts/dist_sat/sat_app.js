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
  Camera
} from "./camera.js";
// where camera is the svg camera node...
const cameraObj = new Camera( camera );

// DESKTOP: double-click to toggle zoom
svgRoot.addEventListener(
  "dblclick", 
  async ( evt ) => {
    await cameraObj.toggleZoom();
});


// MOBILE: pinch / spread to handle zoom 
// WOTTA PIA SO LOW LEVEL !!!
let touchStartDistance = 0;

/**
 * Event handler for touching state machine cycle
 * management ... 
 */
svgRoot.addEventListener("touchstart", (e) => {
  // prevent default scrolling, zooming, etc..
  e.preventDefault();  

  if (e.touches.length === 1) {
    const { clientX, clientY } = e.touches[0];
    // Set delay to check for more complex gesture (pinch or spread)
    // panTimer = setTimeout( 
    //     () => {
    //       if ( cameraObj.isZoomedIn ) {
    //         mode = uiStates.PANNING;
    //         cameraObj.startPan(
    //           { clientX: clientX, clientY: clientY }
    //         );
    //       }
    //     },
    //     60 // <--| magic number: delays pan so pinch gets priority
    // );

    if ( cameraObj.isZoomedIn ) {
      mode = uiStates.PANNING;
      cameraObj.startPan(
        { clientX: clientX, clientY: clientY }
      );
    }


  }

  else if (e.touches.length === 2) {

    // Cancel the  pan timer, if length is 2 you're zooming ... 
    // clearTimeout( panTimer );

    mode = uiStates.PINCHING;
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    // get the distanced needed to assess: pinch or spread? 
    // (see next touchmove ... )
    touchStartDistance = Math.hypot(dx, dy);

  }
});

svgRoot.addEventListener("touchmove", (e) => {
  // prevent default scrolling, zooming, etc..
  e.preventDefault();  

  if (mode === uiStates.PINCHING && e.touches.length === 2) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const dist = Math.hypot(dx, dy);
    const delta = dist - touchStartDistance;
    if ( Math.abs( delta ) > 50 ) {
      cameraObj.toggleZoom();
      touchStartDistance = dist;
    }
  }

  else if (mode === uiStates.PANNING && e.touches.length === 1) {
    const  { clientX, clientY } = e.touches[0];
    cameraObj.panMove({ clientX: clientX, clientY: clientY });
  }
});


svgRoot.addEventListener("touchend", (e) => {

  // clearTimeout(panTimer);

  if (mode === uiStates.PANNING && e.touches.length === 0) {
    cameraObj.endPan(  );
  }
  if (e.touches.length < 2) {
    touchStartDistance = 0;
  }
  if (e.touches.length === 0) {
    mode = uiStates.IDLE;
  }
});

// MOUSE: pan handling
svgRoot.addEventListener("mousedown", cameraObj.startPan);
svgRoot.addEventListener("mousemove", cameraObj.panMove);
svgRoot.addEventListener("mouseup", cameraObj.endPan);


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

