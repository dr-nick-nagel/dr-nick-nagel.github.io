
const l=console.log;


import {
    createSvgCoordsFinder,
    svgDocCache,
    loadSvgList,
} from "/scripts/dist_boidz/javascript/utilities.js";

import {
    WorldModel
} from "/scripts/dist_iso/world_model.js";

import {
    Vector2D
} from "/scripts/dist_boidz/javascript/vector.js"


// ========   Function to draw the grid =================================
/**
 * Render the isometric grid ... 
 * 
 * @param { svg } svg svg root
 */
function renderGrid( svg ) {
    const RED_FILL = 'ff8080';
    const WHITE_FILL='ffaaaa';
    let fill = WHITE_FILL;
    const offsetX  = 0;  //svg.viewBox.baseVal.width / 2;
    const offsetY  = 0;  //svg.viewBox.baseVal.height / 4;
    const gridSize = 5;
    const grid = svg.querySelector( "#isometric_grid" );

    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            if ( (x % 2 === 0) && ( y % 2 !== 0 ) ) {
                fill = RED_FILL;
            } else if( (x % 2 !== 0) && ( y % 2 === 0 ) ) {
                fill = RED_FILL;
            } else {
                fill = WHITE_FILL;
            }
            const { x: isoX, y: isoY } = WorldModel.isometricMap(x, y);
            const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            const points = `
                ${offsetX + isoX},${offsetY + isoY}
                ${offsetX + isoX + WorldModel.tileWidth / 2},${offsetY + isoY + WorldModel.tileHeight / 2}
                ${offsetX + isoX},${offsetY + isoY + WorldModel.tileHeight}
                ${offsetX + isoX - WorldModel.tileWidth / 2},${offsetY + isoY + WorldModel.tileHeight / 2}
            `;
            polygon.setAttribute('points', points);
            polygon.setAttribute('fill', `#${fill}`);
            // polygon.setAttribute('stroke', '#500');
            // polygon.setAttribute('stroke-width', '1');
            grid.appendChild(polygon);
        }
    }
}



// ========   ISOSPRITE =================================

export class IsoSprite {

    /**
     * ISO c-tructor ... 
     * @param {*} id 
     * @param {*} svg 
     * @param {*} p 
     * @param {*} r 
     * @param {*} s 
     * @param { object } gPos isometric grid indices i, j position
     */
    constructor (id, svg, p, r, s, gPos, gc ) {
        this.pos      = p;
        this.rotation = r;
        this.scale    = s;
        this.id       = id;
        this.svg      = svg; 
        this.gridPosition = gPos;
    } 


    /**
     * SVG transform update for DOM. This is the *view* update.
     * it updates sprite's position, rotation and scale in light
     * of changes to the sprite model...
     */
    updateTransform (  ) {
        const { x, y } = this.pos;
        const rotation = this.rotation;
        const scale    = this.scale;
        const bbox = this.svg.getBBox();
        const Y_OFFSET = 0;  //bbox.height / 2 - 10; // <--| 10 is just a constant
        this.svg.setAttribute(
            'transform',
            `translate( ${x} ${y-Y_OFFSET} ) rotate( ${rotation} ) scale( ${scale.xAxis} ${scale.yAxis} )`
        );
    }


    move( key ) {
        // In this game sprites move around the grid using arrow keys 
        // or arrow controls on phonium .... 
        switch ( key ) {
            case 'ArrowUp':
                this.gridPosition.i -= 1;
                break;
            case 'ArrowRight':
                this.gridPosition.j -= 1;
                break;
            case 'ArrowDown':
                this.gridPosition.i += 1;
                break;
            case 'ArrowLeft':
                this.gridPosition.j += 1;
                break;
        }
        //Clamp within platform bounds
        // hard-coded min/max for now...
        const MIN = 0;
        const MAX = 3;
        this.gridPosition.i = Math.max( 
            MIN, 
            Math.min( MAX, this.gridPosition.i )
        );
        this.gridPosition.j = Math.max( 
            MIN, 
            Math.min( MAX, this.gridPosition.j )
        );

// get SVG and update transform 
// TODO : RESUME HERE ... SET UP GAME CONTROL ... 
const svgCoords = this.WorldModel.isometricMap( this.gridPosition.i, this.gridPosition.j );
this.pos.x = svgCoords.x;
this.pos.y = svgCoords.y;
// console.log( this.pos.toString() );
this.updateTransform();

    }

    // update ( deltaTime ) {
    //     // super.move( deltaTime );
    //     this.updateTransform();
    // }


    setWorldModel( WorldModel ) {
        this.WorldModel = WorldModel;
    }

}






// ==============   APP   =============================
l("Begin!");
const LIST = [
    "white_queen.svg",
];
const PATH = "/svg/isometric/";
await loadSvgList(  LIST, PATH );

const DEFS  = svgDocCache.svg_slide_0.querySelector( "defs" );
const QUEEN = svgDocCache.svg_slide_0.querySelector( "#white_queen" );

const svgRoot = document.getElementById("svg_host");
const overlay = document.getElementById("grid_overlay");


renderGrid( svgRoot );  
svgRoot.insertBefore( DEFS, overlay );
svgRoot.insertBefore( QUEEN, overlay );

const id = QUEEN.id;
const svg = QUEEN;
const p = Vector2D.fromCartesian(  0, 0 );
const r = 0;
const s = {xAxis: 1, yAxis: 1};
const gPos = {i:0,j:0};

const whiteQueen = new  IsoSprite( id, svg, p, r, s, gPos ) ;
whiteQueen.setWorldModel( WorldModel );


/**
 * Move a sprite with arrow keys ... 
 */
document.addEventListener(
    'keydown', 
    (event) => {
        whiteQueen.move( event.key );
    }
);

const qControls = {
    up    : document.getElementById( "up_arrow" ) ,
    down  : document.getElementById( "d_arrow" ) ,
    left  : document.getElementById( "l_arrow" ) ,
    right : document.getElementById( "r_arrow" ) ,
};

qControls.up.addEventListener(
    'click',
    (evt) => {
        whiteQueen.move( "ArrowUp" );
    }
);

qControls.down.addEventListener(
    'click',
    (evt) => {
        whiteQueen.move( "ArrowDown" );
    }
);

qControls.left.addEventListener(
    'click',
    (evt) => {
        whiteQueen.move( "ArrowLeft" );
    }
);

qControls.right.addEventListener(
    'click',
    (evt) => {
        whiteQueen.move( "ArrowRight" );
    }
);



const abutton = document.getElementById("a_button");
const svgAnim = document.getElementById("rules_anim_root");

// USE?
const audioClips = {
    align: null,
    separate: null,
    cohere: null,
};

document.addEventListener(
    'DOMContentLoaded',
    (evt) => {

        
    }
);

abutton.addEventListener(
    'click',
    (evt) => {
        doAlignment(evt);
    }
);
