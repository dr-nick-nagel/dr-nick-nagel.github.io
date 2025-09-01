import { 
    Vector2D,
    HumpSprite,
    WorldModel,
    // MohronSprite,
    // MissileSprite

} from "./game_state.js";

import {
  svgDocCache,
  loadSvgList,
  createSvgCoordsFinder

} from "/artists/demons/javascript/utilities.js"

import {
    audioConstants,
    audioController
} from "./audio_controller.js";

export const DEMONS_SVG_LIST = [
    'hump_sprite.svg', 
    'mohron_sprite.svg',
    'smokering.svg',
    'backgrounds/city_afire.svg',
    'rocket.svg',
    'inferno_effect.svg',
];

export const DEMONS_SVG_PATH = "/artists/demons/svg/";

// TODO: REMOVE REFERENCES
const domContainers = {
    "launchScreenSvgContainer": document.getElementById( "launch_screen_container" ),
};



let humpSprite   = null;
let tempSolutionHandle = null;
let launchScreenSvg = null;
//let smokering = null;
let svgRoot = null;


import {
    GameController
} from "./game_controller.js"

async function initGamePage () {
    console.log("initializing ... ");
    await loadSvgList( DEMONS_SVG_LIST, DEMONS_SVG_PATH );

    svgRoot = document.querySelector( "svg" );

    // SET UP GAME SCREEN GAME 
    // TODO: FACTOR OUT TO GAME CONTROLLER
    const screenDimensions = {
        x: 1200,
        y: 900
    }

    // PUT IN BACKGROUND LAYER
    const gameBackground = svgDocCache.svg_slide_3.querySelector("#game_backdrop");
    svgRoot.append( gameBackground );

    // BLAZE LAYER TO LIGHT UP THE SKY
    const blazeLayer = document.createElementNS( 'http://www.w3.org/2000/svg', 'g' );
    blazeLayer.setAttribute( "id", "blaze_layer" );
    svgRoot.append( blazeLayer );

    // is this evil? I'm 'injecting' an SVG TEMPLATE onto the world model ... 
    const infernoEffect = svgDocCache.svg_slide_5;
    const infernoSvg = infernoEffect.getElementById( "inferno_effect_g" );
    WorldModel["svg"] = {}
    WorldModel.svg.infernoEffectTemplate = infernoSvg;



    // INITIALIZE THE HUMPER ... 
    const HUMPSPRITE_ID = "hump_sprite";
    const humpSpriteSvg = svgDocCache.svg_slide_0;
    GameController.createCommanderSprite( humpSpriteSvg, HUMPSPRITE_ID );


    // CREATE THE MOHRON VILLAIN
    const MORON_ID = "mohron_sprite";
    const mohId = GameController.createMohronSprite( svgDocCache.svg_slide_1, MORON_ID );
    // TEST DRIVE ROCKET SPRITE DEV
    // TODO: MOVE OUT TO MUSK SPRITE SINCE IT'S MUSK SPRITE BEHAVIOUR
    const TEMPLATE_ID = "rocket_sprite";
    // Note we pull all and ONLY the template 'g' out of svg doc here... 
    const missileSpriteSvg = svgDocCache.svg_slide_4.getElementById( TEMPLATE_ID );
    
    // TEMPORARY ONE-OFF: ACCESS MOHRON DIRECTLY AND SET EFFECT SVG's
    tempSolutionHandle =  GameController.getSpriteById( mohId );
    tempSolutionHandle.setMissleSvg( missileSpriteSvg );
    // Note we pull all and ONLY the template 'g' out of svg doc here... 
    const smokeRingSVG = svgDocCache.svg_slide_2.getElementById( "explosion_1" );
    svgRoot.append( smokeRingSVG );
    tempSolutionHandle.setSmokeSvg( smokeRingSVG ); 
    audioController.addClip( 
        document.getElementById( audioConstants.NO_RIGHT_TO_EXIST )
    );
    audioController.addClip(
        document.getElementById("musk_kill_all_clip")
    );
  
    console.log( "ready!" );

    // console.log( "GC", GameController.blackboards );

}



document.addEventListener(
    "DOMContentLoaded",
    async () => {
        // await initLaunchPage();
        await initGamePage();
        // testPage();

        // Turn on to get screen coords...
        svgRoot.addEventListener(
            "click",
            createSvgCoordsFinder( svgRoot )
        );

    }
);


    // TEST ROCKET FIRE ... 
const testButton = document.getElementById("test_button");
testButton.addEventListener(
    "click",
    () => {
        // audioController.play( "musk_kill_all_clip" );
        // tempSolutionHandle.fireRocket();
    }
);



document.addEventListener('keydown', (event) => {
    let newAngle;
    switch (event.key) {
        case 'ArrowUp':
            break;
        case 'ArrowRight':
            newAngle = tempSolutionHandle.getOrientation() + 10
            console.log( newAngle );
            tempSolutionHandle.setOrientation(
                newAngle
            );
            break;
        case 'ArrowDown':
            logMohRonState() ; 
            break;
        case 'ArrowLeft':
            newAngle = tempSolutionHandle.getOrientation() - 10
            console.log( newAngle );
            tempSolutionHandle.setOrientation(
                newAngle
            );
            break;
    }
});

import {
    animationController
} from "./animation_controller.js"

// TODO: FACTOR THIS AND VECTOR2D ITSELF OUT TO INDEPENDENT MODULE...
function testVector2D() {
    const speed        = 10; 
    const angleDegrees = 90; 
    const angleRadians = Math.PI / 180 * angleDegrees; 
    console.log( "Assert: 90 Degrees is: ", angleRadians, Math.PI / 2 );
}
// testVector2D();

