// LOAD SPRITES

import {
    svgDocCache,
    loadSvgList
} from "./utilities.js";

import { 
    Vector2D 
} from "./vector.js";

import {
    createFairy
} from "./sprite_factory.js";

import {
    animationController
} from "./animation_controller.js";

import {
    GameController
} from "./nn_game_controller.js";

import {
    ParticleSystem
} from "./nn_particle_system.js";

const l = console.log;

const svgList = [
    "green_fairy_sprite.svg",
];
const PATH = "/svg/wandering/";


function addFairy() {
    const baseId = "green_fairy_sprite";
    const spriteSvg = 
      svgDocCache.svg_slide_0.querySelector("#"+baseId);
    const options = {
        id :   baseId,
        svg :  spriteSvg, 
        position : Vector2D.fromCartesian(0, 0), 
        velocity : Vector2D.fromCartesian(0, 0), 
        acceleration : Vector2D.fromCartesian(0, 0), 
        rotation : 0, 
        scale : {xAxis: 3, yAxis: 3},
    };

    let fSprite = createFairy( options, GameController );
    fSprite.setParticleSystem( particleSystem );
    GameController.addFairy(fSprite);
}

async function init() {
    l( "Initializing..." );
    await loadSvgList ( svgList , PATH );
    animationController.setGameController( GameController );
    // l( "control systems ", animationController );
    // l( "SVG DOC CACHE ", svgDocCache );
    l( "Initialization complete!" );
}




// MAKE THEM FLY AROUND AND EMIT PARTICLES



// ~~~~    event handlers    ~~~~

/**
 * Animation toggle event handler. Buttons will control
 * animation toggle via animation controller. 
 * @param {obj} evt 
 */
const toggleAnimation = ( evt ) => {
    if ( animationController.rafId == 0 ) {
        animationController.startAnim();
        pb.innerText = "Stop";
    }  else {
        animationController.stopAnim();
        pb.innerText = "Play";
    }
};

let pb = null;
let particleSystem = null;
let svgRoot        = null;
document.addEventListener(
    "DOMContentLoaded",
    async (evt) => {
        await init();
        svgRoot = document.querySelector( "#svg2" );
        particleSystem = new ParticleSystem(svgRoot);
        GameController.setParticleSystem(particleSystem);
        addFairy();

        l( "GC ", GameController );

        pb = document.getElementById( "play_button" ); 
        pb.addEventListener(
            "click",
            ( evt ) => {
                toggleAnimation( evt );
            }
        );
    }
);
