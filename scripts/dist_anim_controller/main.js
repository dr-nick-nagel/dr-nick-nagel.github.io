import {
    svgDocCache,
    loadSvgList,
    createSvgCoordsFinder,
} from "./utilities.js";

import {
    WickedSprite,
    BillowSprite,
    Vector2D
} from "./game_state.js";

import  {
    GameController,
}  
from './game_controller.js' ;

// ---- ANIMATION CONTROLLER --------------------------------------
// TODO: FACTOR OUT TO A CONTROLLER MODULE ...
const fpsDisplay = document.getElementById( "fps_display" );
const fpsDisplayMove = document.getElementById( "fps_display_move" );

export const animationController = {
    previousTimestamp : 0 ,
    rafId : 0,

    update : function (timestamp)  {
        let frameRate = 1000 / (timestamp - this.previousTimestamp);
        frameRate = Math.round( frameRate );
        fpsDisplay.innerText = `FPS: ${frameRate}`;
        fpsDisplayMove.innerText = `FPS: ${frameRate}`;
        // compute delta time in SECONDS (hence divide by 1000)
        const deltaTime = (timestamp - this.previousTimestamp) / 1000;
        this.previousTimestamp = timestamp;
        GameController.updateSprites( deltaTime );
        DiagramDirector.updateAnimation( deltaTime );
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

// ---- DiagramController --------
/**
 * Singleton reponsible for directing animation
 * on the diagram ... 
 */
export const DiagramDirector = {

    smiling : false,
    DIAGRAM_SVG : null,
    SVG_NS : "http://www.w3.org/2000/svg",
    DELTA_BLOCK_SYMBOL : "#delta_block_symbol",
    ANIM_INIT_COORDS : { x: 187, y:-15  } ,
    ANIM_END_COORDS :  { x: 187, y:65   } ,
    deltaBlocks : null,
    accumulator : 0,

    updateAnimation : function ( deltaTime ) {
        // I = sum over block anim durations
        const INTERVAL = 4 * 0.5;
        this.accumulator += deltaTime;
        while( this.accumulator >= INTERVAL ) {
            //console.log( "handle interval", this.accumulator );
            // RESET BLOCK ANIMATIONS
            this.resetSmils();
            this.startSmils();
            // trigger OUTPUT ANIMATION
            const intervalAnim = document.getElementById( "text_group_anim" );
            intervalAnim.beginElement();
            this.shakeIt();
            this.accumulator -= INTERVAL;
        }
    },

    init : function() {
        if( this.DIAGRAM_SVG === null ) {
            this.DIAGRAM_SVG = document.getElementById( svgDocCache.svg_slide_3.id);
        }
        if( this.deltaBlocks === null ) {
            this.deltaBlocks = this.createDeltaBlocks();
            this.DIAGRAM_SVG.appendChild( this.deltaBlocks );
        }
    },
            
    /**
     * Animate a falling block. 
     */
    getBlockAnim: function( count ) {
        const FROM = `${this.ANIM_INIT_COORDS.x} ${count * this.ANIM_INIT_COORDS.y}`;
        // where 15 is  the height of the block in svg user coords...
        const TO   = `${this.ANIM_END_COORDS.x} ${this.ANIM_END_COORDS.y - count * 15}`;
        const anim = document.createElementNS(this.SVG_NS, "animateTransform");
        anim.setAttribute("attributeName", "transform");
        anim.setAttribute("type", "translate");
        anim.setAttribute("from", FROM);
        anim.setAttribute("to",   TO);
        anim.setAttribute("dur", "0.5s");

        // anim.setAttribute("begin", `${ count  * 0.5}s`);
        anim.setAttribute("begin", "indefinite");

        anim.setAttribute("fill", "freeze");
        return( anim );
    },

    /**
     * Generate a 'use' element for a delta t block
     * 
     * @returns the use element
     */
    useSymbol: function( count ) {
        const use = document.createElementNS( this.SVG_NS, "use" );
        use.setAttributeNS(null, "href", this.DELTA_BLOCK_SYMBOL );
        use.setAttributeNS(null, "width", "15");
        use.setAttributeNS(null, "height", "15");
        use.setAttributeNS(
            null, 
            "transform", 
            `translate( ${this.ANIM_INIT_COORDS.x} ${this.ANIM_INIT_COORDS.y} )`
        );
        return (  use ) ;
    },

    createDeltaBlocks : function(  ) {
        const NUM_BLOCKS = 4;
        const group = document.createElementNS( this.SVG_NS, "g" );
        group.setAttribute( "id", "delta_blocks" );
        for (let i = 0; i < NUM_BLOCKS; i++) {
            const useElem = this.useSymbol( i );
            useElem.appendChild(  this.getBlockAnim( i )  );
            group.appendChild(useElem);
        }
        return( group );
    },

    /**
     * In order to reset the SMIL animations that end frozen
     * it looks like you have to 
     *   (1) Remove them from the elements they modify, and 
     *   (2) Replace with same anims in initial state
     * So you kinda have to used SVG DOM functions to set the
     * SMILs for these cases (as opposed to harcoding in the 
     * SVG...) There is no one-size-fits-all solution...
     */
    resetSmils : function() {
        // where this.deltaBlocks is an SVG group element...
        const deltaTSymbols =  this.deltaBlocks.querySelectorAll("use");
        for( let t=0; t < deltaTSymbols.length; t++ ) {
            const anim = deltaTSymbols[t].querySelector( "animateTransform" );
            if( anim ) {
                // remove animation to reset
                deltaTSymbols[t].removeChild(anim);
                // add new animation node
                deltaTSymbols[t].appendChild( this.getBlockAnim( t ) );
            }
        }
    },

    /**
     * Start SMIL anims on the deltaT blocks...
     */
    startSmils : function() {
        const deltaBlockAnims = this.deltaBlocks.querySelectorAll("animateTransform");
        const offset = parseFloat( deltaBlockAnims[0].getAttribute("dur") );
        for( let t = 0 ;  t < deltaBlockAnims.length; t++  ) {
            const start = t*offset;
            deltaBlockAnims[t].beginElementAt( start );
        } 
    },

    /**
     * Handler for the SMIL animations. This function has to 
     * orchestrate the SMIL animations on the diagram. It has to:
     * 
     * 1. toggle the animations, and
     * 2. coordinate the start times of the delta drops 
     * 3. coordinate the the timing on the "update" 
     *    (illustrated in the diagram)
     * 
     * @param {*} evt 
     */
    doSmil : function( evt )  {
        const gearAnims = [
            document.getElementById("gradientAnim"),
            document.getElementById("gearAnim")
        ];
        const deltaBlockAnims = this.deltaBlocks.querySelectorAll( "animateTransform" );
        if ( ! this.smiling ) {
            // Initialize the fixed interval accumulator
            this.accumulator = 0;
            // Trigger SMIL animations
            gearAnims.forEach( anim => anim.beginElement() );
            this.startSmils();
        }  else {
            // STOP SMIL animations
            gearAnims.forEach( anim => anim.endElement() );
            deltaBlockAnims.forEach( anim => anim.endElement() );
            this.resetSmils();
        }
        this.smiling = ! this.smiling;
    },

    shakeIt : function() {
        const INTENSITY = 10;
        const DURATION  = 300; // MSEC
        const t0 = performance.now();
        const sceneGroup = document.getElementById( "tremor_wrap" );
        function jitter ( t ) {
            const interval = t - t0;
            const length = interval / DURATION;
            if( length < 1 ) {
                // shake it bebe
                const dx = (Math.random() - 0.5) * 2 * INTENSITY;
                const dy = (Math.random() - 0.5) * 2 * INTENSITY;
                sceneGroup.setAttribute( "transform", `translate( ${dx} ${dy} )` );
            } else {
                sceneGroup.setAttribute( "transform", `translate( 0 0 )` );
            }
          requestAnimationFrame( jitter);
        }
        requestAnimationFrame( jitter);
    }
    
}


// ---- DEMO INITIALIZATION -------------------
// ---- SVG DOCS TO LOAD ----------------------
const svgList = [
    'billow.svg',
    'wicked_background_v2.svg',
    'wicked_witch.svg',
    'anim_fixed_int_update.svg',
    'road_to_oz.svg',
];
const SVG_PATH = "/svg/svg_anim_raf/";
// --------------------------------------------

let diagramSvg = null;
let billowSvg  = null;
async function loadSvgs () {
    await loadSvgList(svgList, SVG_PATH);
    billowSvg = svgDocCache.svg_slide_0;
    billowSvg.setAttribute( "width", "100"  );
    billowSvg.setAttribute( "height", "100" );
    billowSvg.setAttribute( "viewBox",  "0 0 50 50" ); 
    const container = document.getElementById( "svg_container_billow" );
    container.appendChild( svgDocCache.svg_slide_0 );
    // add the diagram ...
    diagramSvg = svgDocCache.svg_slide_3;
    const dContainer = document.getElementById( "fixed_interval_diagram" );
    dContainer.appendChild( diagramSvg );
    // add the road to Oz ...
    const OZ = svgDocCache.svg_slide_4;
    const ozContainer = document.getElementById( "oz_wrap" );
    ozContainer.appendChild( OZ );
}

let billowSprite = null;
function initBillowSprite() {
    let pos = new Vector2D( 0, 0 );
    let vel = new Vector2D( 0, 0 );
    let acc = new Vector2D( 0, 0 );
    billowSprite = new BillowSprite( billowSvg.id, pos, vel, acc );
    GameController.addSprite( billowSprite );
}


function initFilghtDemo () {

    const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
    const flightContainer = document.getElementById('flight_container');
    // add background
    let svgBackground = svgDocCache[ 'svg_slide_1' ]; 
    svgBackground.setAttribute( "width", "350" );
    svgBackground.setAttribute( "height", "117" );
    svgBackground.setAttribute( "viewBox", "0 0 300 100" );
    flightContainer.appendChild(svgBackground);
    
    // add sprite
    let flightSpriteSvg = svgDocCache[ 'svg_slide_2' ];
    let witchSpriteGroup = document.createElementNS( SVG_NAMESPACE, "g" );
    let ws = flightSpriteSvg.querySelectorAll( "g" ); 
    for ( const node of ws ) {
        witchSpriteGroup.appendChild( node );
    }
    witchSpriteGroup.setAttribute( "id", "witch_1" );
    witchSpriteGroup.style.display = "none";
    svgBackground.appendChild( witchSpriteGroup );
    const initPosX = parseInt( svgBackground.getAttribute( "width" ) );
    let pos = new Vector2D( initPosX, 50 );

    let vel = new Vector2D( -100, 0 );
    let acc = new Vector2D( 0, 0 );
    // MAKE THE FLIGHT SPRITE
    let flightSprite = new WickedSprite( witchSpriteGroup.id, pos, vel, acc );
    // SEND TO GAME CONTROLLER TO UPATE FRAMES
    for ( const path of flightSprite.animFrames ) {
        path.style.display="none";
    }
    flightSprite.animFrames[0].style.display="inline";
    GameController.addSprite( flightSprite );
    
}

import {
    OzLoopDirector
} from "./road_to_oz.js";

async function init() {
    await loadSvgs();
    initBillowSprite();
    initFilghtDemo();
    DiagramDirector.init();
    OzLoopDirector.startAnim();
    //OzLoopDirector.test();
} 

init();

// ----  UI  HACKS --------------------

// ANIMATION CONTROL BUTTONS
// pb play button for BILLOW
// fb play button for FLIGHT
const pb = document.getElementById( "play_billow" );
const fb = document.getElementById( "play_flight" );
const diagButton = document.getElementById( "play_widget" );

/**
 * Animation toggle event handler. Buttons will control
 * animation toggle via animation controller. 
 * @param {*} evt 
 */
const toggleAnimation = ( evt ) => {
    if ( animationController.rafId == 0 ) {
        animationController.startAnim();
        DiagramDirector.doSmil();
        pb.innerText = "Stop";
        fb.innerText = "Stop";
        diagButton.innerText = "Stop";
    }  else {
        animationController.stopAnim();
        DiagramDirector.doSmil();
        pb.innerText = "Play";
        fb.innerText = "Play";
        diagButton.innerText = "Run";
    }
}

pb.addEventListener(
    "click",
    ( evt ) => {
        toggleAnimation( evt );
    }
);

fb.addEventListener(
    "click",
    ( evt ) => {
        toggleAnimation( evt );
        document.getElementById("witch_1").style.display="inline";
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

diagButton.addEventListener(
    'click',
    (evt) => {
        toggleAnimation( evt );
    }
);

