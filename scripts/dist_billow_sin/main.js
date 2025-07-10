import {
    svgDocCache,
    loadSvgList,
} from "../dist_anim_controller/utilities.js";

import {
    BillowSprite,
    Vector2D
} from "../dist_anim_controller/game_state.js";

import  {
    GameController,
}  
from '../dist_anim_controller/game_controller.js' ;

// ---- ANIMATION CONTROLLER --------------------------------------
// TODO: FACTOR OUT TO A CONTROLLER MODULE ...
const fpsDisplay = document.getElementById( "fps_display" );

export const animationController = {
    previousTimestamp : 0 ,
    rafId : 0,

    update : function (timestamp)  {
        let frameRate = 1000 / (timestamp - this.previousTimestamp);
        frameRate = Math.round( frameRate );
        fpsDisplay.innerText = `FPS: ${frameRate}`;

        // compute delta time in SECONDS (hence divide by 1000)
        const deltaTime = (timestamp - this.previousTimestamp) / 1000;
        this.previousTimestamp = timestamp;
        GameController.updateSprites( deltaTime );

        this.rafId = requestAnimationFrame( this.update.bind(this) );
    },

    startAnim : function  ()  {
        const  startTime = performance.now() ;
        this.previousTimestamp = startTime;
        this.update( startTime ) ;
        console.log( "GAME ON! " + startTime  );
    },

    stopAnim : function  ()  {
        cancelAnimationFrame ( this.rafId ) ;
        this.rafId = 0;
        const  stopTime = performance.now();
        console.log( "GAME OFF: " + stopTime  );
    },

}


// ---- DEMO INITIALIZATION -------------------
// ---- SVG DOCS TO LOAD ----------------------
const svgList = [
    'billow.svg',
];
const SVG_PATH = "/svg/svg_anim_raf/";
// --------------------------------------------

// let diagramSvg = null;
let billowSvg  = null;
async function loadSvgs () {
    await loadSvgList(svgList, SVG_PATH);
    billowSvg = svgDocCache.svg_slide_0;
    billowSvg.setAttribute( "width", "100"  );
    billowSvg.setAttribute( "height", "100" );
    billowSvg.setAttribute( "viewBox",  "0 0 50 50" ); 
    const container = document.getElementById( "svg_container_billow" );
    container.appendChild( svgDocCache.svg_slide_0 );
}

let billowSprite = null;
function initBillowSprite() {
    let pos = new Vector2D( 0, 0 );
    let vel = new Vector2D( 0, 0 );
    let acc = new Vector2D( 0, 0 );
    billowSprite = new BillowSprite( billowSvg.id, pos, vel, acc );
    GameController.addSprite( billowSprite );
}



async function init() {
    await loadSvgs();
    initBillowSprite();
} 

init();

// ----  UI  HACKS --------------------

// ANIMATION CONTROL BUTTONS
// pb play button for BILLOW
const pb = document.getElementById( "play_billow" );

/**
 * Animation toggle event handler. Buttons will control
 * animation toggle via animation controller. 
 * @param {*} evt 
 */
const toggleAnimation = ( evt ) => {
    if ( animationController.rafId == 0 ) {
        animationController.startAnim();
        // DiagramDirector.doSmil();
        pb.innerText = "Stop";
    }  else {
        animationController.stopAnim();
        // DiagramDirector.doSmil();
        pb.innerText = "Play";
    }
}

pb.addEventListener(
    "click",
    ( evt ) => {
        toggleAnimation( evt );
    }
);

// TEST BUTTON FOR BILLOW EFFECT
const tb = document.getElementById( "update_billow" );
tb.addEventListener(
    "click",
    () => {
        billowSprite.updateTransform();
    }
);
