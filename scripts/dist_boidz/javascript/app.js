
import { 
    animationController 
} from "./animation_controller.js";

import {
    tunableParamDefaults,
} from "./boid.js";

import { 
    GameController 
} from "./game_system.js";

import {
    // SpriteRegistry,
    createBoid,
    createWaspBoid
} from "./sprite_factory.js";

import { 
    Vector2D 
} from "./vector.js";

import {
    WorldModel
} from "./world_model.js";

import{
    svgDocCache,
    loadSvgList
} from "./utilities.js";


const l = console.log;
const SVG_PATH = "/svg/boidz/";

const SVG_LIST = [
    "demon_boid.svg",
    "wasp_boid.svg",
];


/**
 * Initialize a Swarm ... 
 * 
 * @param { number } count Number of wasps...
 * @param {dictionary } tunableParameters  Boid Parameters
 */
async function initSwarm( count, tunableParameters  ) {
    const spriteId  = "waspboid";
    const spriteSVG = svgDocCache['svg_slide_1'].getElementById( spriteId );
    /*
    * NOTE: the sprite init option format is defined in
    * the sprite class. The svg is gonna get cloned in 
    * the factory. The ID will be made serial and unique.
    * IMPORTANT: NEW VECTOR INSTANCES MUST BE USED ON EACH
    * BOID ...  
    */
    const initOptions = {
        id :   spriteId,
        svg :  spriteSVG,
        rotation  : 0,
        scale : { xAxis: 1, yAxis: 1 },
    }
    for ( let i=0 ; i<count ; i++ ) {
        initOptions.position = Vector2D.fromCartesian( 0, 0 );
        initOptions.velocity = Vector2D.fromCartesian( 0, 0 );
        initOptions.acceleration = Vector2D.fromCartesian( 0, 0 );
        // INJECT GAME CONTROLLER REF TO BOID SO IT CAN KILL ITSELF...
        const testSprite = createWaspBoid( initOptions, GameController );
        // SET A LEADER (OPTIONAL)
        if ( i === 0 ) {
            testSprite.setLeader( true );
        }
        GameController.addBoid( testSprite );
        // INJECT HANDLE TO ARRAY FOR EA SPRITE (REQUIRED FOR BOIDS ROOLZ)
        testSprite.setCollection( GameController.sprites );
        testSprite.setWorldModel( WorldModel );
        testSprite.setTunableParameters( tunableParameters );
    }
}


/**
 * Initialize a Legion ... 
 * 
 * @param { number } count Number of demons...
 * @param {dictionary } tunableParameters  Boid Parameters
 */
async function initLegion( count, tunableParameters ) {
    const spriteId  = "demon_boid";
    const spriteSVG = svgDocCache['svg_slide_0'].getElementById( spriteId );
    const initOptions = {
        id :   spriteId,
        svg :  spriteSVG,
        rotation  : 0,
        scale : { xAxis: 1, yAxis: 1 },
    }
    for ( let i=0 ; i<count ; i++ ) {
        initOptions.position = Vector2D.fromCartesian( 0, 0 );
        initOptions.velocity = Vector2D.fromCartesian( 0, 0 );
        initOptions.acceleration = Vector2D.fromCartesian( 0, 0 );
        // INJECT GAME CONTROLLER REF TO BOID SO IT CAN KILL ITSELF...
        const testSprite = createBoid( initOptions, GameController );
        // SET A LEADER (OPTIONAL)
        if ( i === 0 ) {
            testSprite.setLeader( true );
        }
        GameController.addBoid( testSprite );
        // INJECT HANDLE TO ARRAY FOR EA SPRITE (REQUIRED FOR BOIDS ROOLZ)
        testSprite.setCollection( GameController.sprites );
        testSprite.setWorldModel( WorldModel );
        testSprite.setTunableParameters( tunableParameters );
    }
}

const boidTypes = {
    WASP_BOID:'wasp',
    DEMON_BOID:'demon',
}

let boidModel = boidTypes.WASP_BOID;
let count = 3;

async function init () {
    l( "initializing" );
    GameController.clear();
    const tunableParameters = tunableParamDefaults;

    await loadSvgList(SVG_LIST, SVG_PATH);
    switch ( boidModel ) {
        case boidTypes.DEMON_BOID : 
            await initLegion( count, tunableParameters );
            break;
        case boidTypes.WASP_BOID : 
            await initSwarm( count, tunableParameters );
            break;
    }

    l( GameController );
    l( "initialization complete!" );
}

// ---- APP EVENT HANDLERS ------------------



document.addEventListener(
    "DOMContentLoaded",
    (evt) => {

        const resetBtn = document.getElementById( "init_btn" ); 
        resetBtn.addEventListener(
            "click",
            async ( evt ) => {
                await init();
                if( resetBtn.textContent === "Init" ) {
                    resetBtn.textContent = "Reset";
                }
            }
        );

        const countSlider = document.getElementById( "count_slider" ) ;
        // set once on DOM content loaded (default value) ... 
        countSlider.value  = 3;
        const countDisplay = document.getElementById( "count_display" );
        countDisplay.textContent = parseInt( countSlider.value );
        countSlider.addEventListener(
            "input",
            (evt) => {
                count = parseInt( evt.target.value );
                countDisplay.textContent = count;
            }
        ); 

    }
);



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

const pb = document.getElementById( "play_button" ); 
pb.addEventListener(
    "click",
    ( evt ) => {
        toggleAnimation( evt );
    }
);

/**
 * Single frame advance to test animation ... 
 */
let deltaTime = 0 ; 
let interval  = 0.02;
function testAnim( evt ) {
    deltaTime += interval;
    GameController.updateSprites( deltaTime );
}
let globalTestSprite = null;
function testRotation ( evt ) {
    const input = document.getElementById( "input_1" ); 
    const degrees = input.value ;
    l( "Test degrees: ", degrees );
    globalTestSprite.rotation =  degrees ;
    globalTestSprite.updateTransform(  );
}



//  ---------  DROPDOWN SELECTOR -----------------------
document.addEventListener('DOMContentLoaded', () => {
    const dropdown = document.querySelector('.sprite-dropdown');
    const selectedOption = dropdown.querySelector('.selected-option img');
    const optionsList = dropdown.querySelector('.options-list');
  
    dropdown.addEventListener('click', () => {
      dropdown.classList.toggle('open');
      dropdown.setAttribute('aria-expanded', dropdown.classList.contains('open'));
    });
  
    optionsList.addEventListener('click', (e) => { 
      e.stopPropagation(); 
      const selectedItem = e.target.closest('li');
      if (selectedItem) {
        const img = selectedItem.querySelector('img');
        selectedOption.src = img.src;
        selectedOption.alt = img.alt;
        dropdown.classList.remove('open');

        const CHOICE = selectedItem.dataset.value;
        switch( CHOICE ) {
            case "wasp_boid" : 
                boidModel = boidTypes.WASP_BOID;
                break;
            case "demon_boid" : 
                boidModel = boidTypes.DEMON_BOID;
                break;
        }
      }

    });
  
    // Close the dropdown if the user clicks outside of it
    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('open');
        dropdown.setAttribute('aria-expanded', false);
      }
    });
  });
//  ----------------------------------------------------



//  --------   TUNABLE PARAMETERS   -----------------------------
// A reference to your default parameters
// import { tunableParamDefaults } from './your-params-file.js';

// Get a reference to the main parameters object to be updated
// const tunableParams = { ...tunableParamDefaults }; 
const tunableParams = tunableParamDefaults ;

document.addEventListener('DOMContentLoaded', () => {
  const panel = document.getElementById('controls-panel');
  
  // A helper function to set initial values and listen for changes
  const setupSlider = (id, paramKey, displayElementId, isNested = false, nestedKey = null) => {
    const slider = document.getElementById(id);
    const valueSpan = document.getElementById(displayElementId);
    
    // Set initial value from defaults
    const initialValue = isNested ? tunableParams[paramKey][nestedKey] : tunableParams[paramKey];
    slider.value = initialValue;
    valueSpan.textContent = initialValue.toFixed(4);
    
    // Listen for changes
    slider.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      if (isNested) {
        tunableParams[paramKey][nestedKey] = value;
      } else {
        tunableParams[paramKey] = value;
      }
      valueSpan.textContent = value.toFixed(4);
      // OPTIONAL: Add *dynamic update* to boids sim
    });

  };

  // Setup each slider with the corresponding default value
  setupSlider('avoidance', 'AVOIDANCE', 'avoidance-value');
  setupSlider('alignment', 'ALIGNMENT', 'alignment-value');
  setupSlider('cohesion', 'COHESION', 'cohesion-value');
  setupSlider('separation-radius', 'SEPARATION_RADIUS', 'separation-radius-value');
  setupSlider('alignment-radius', 'ALIGNMENT_RADIUS', 'alignment-radius-value');
  setupSlider('coherence-radius', 'COHERENCE_RADIUS', 'coherence-radius-value');
  setupSlider('turning-factor', 'TURNING_FACTOR', 'turning-factor-value');
  setupSlider('leader-bias', 'LEADER_BIAS', 'leader-bias-value');
  
  // Setup nested speed limits
  setupSlider('speed-max', 'speedLimits', 'speed-max-value', true, 'MAX');
  setupSlider('speed-min', 'speedLimits', 'speed-min-value', true, 'MIN');
});


document.addEventListener('DOMContentLoaded', () => {
    const panel = document.getElementById('controls-panel');
    const toggleBtn = document.getElementById('toggle-btn');
    const controlsContent = document.getElementById('controls-content');
    // Add event listener for the OPEN button
    toggleBtn.addEventListener('click', () => {
      const isMinimized = panel.classList.toggle('minimized');
      toggleBtn.disabled = true;
    });
    // Close widget for the parameters view ...
    const closeWidget = document.getElementById( "cntrl_tp_minimize" );
    closeWidget.addEventListener(
        "click",
        (evt) => {
            const isMinimized = panel.classList.toggle('minimized');
            toggleBtn.disabled = false;
        }
    )
});


//  ---------------  END TUNABLE PARAMS     ---------------------------




const tb = document.getElementById( 'test_button' );

tb.addEventListener(
    "click",
    ( evt ) => {
        testRotation( evt );
    }
);

