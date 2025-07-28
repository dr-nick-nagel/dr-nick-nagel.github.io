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

// init();

