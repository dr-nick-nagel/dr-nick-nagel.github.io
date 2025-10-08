import { Movable }    from "/scripts/dist_boidz/javascript/movable.js";
import { 
    BoidSprite ,
    WaspBoid
} from "/scripts/dist_boidz/javascript/boid.js";


// Import other sprite types as needed

// import {
//     TyhondSprite,
//     Food
// } from "../artists/g/js_game/t_sprites.js";

import {
    FairySprite
} from "./fairies.js";


export const SpriteRegistry = {
    MovableType: Movable, // <--| Base type for sprites...
    BoidType: BoidSprite,
    // Register new sprite types here ...
    WaspBoidType: WaspBoid,
    // TyhondSpriteType: TyhondSprite,
    // FoodType: Food,
    // ---- N SPRITES ----
    FairyType : FairySprite,
};

let serialNo = 0;

/**
 * Factory function to create sprites. The factory pattern is a *very good idea* 
 * for the game system.
 * 
 *   + It decouples sprite logic from the logic needed to manage the collections
 *   + It centralizes creation logic instead of scattering it all over the place
 *   + It makes it easier to track  and avoid circular dependencies
 * 
 * Since new kinds of sprites can get created at any time this factory make the 
 * system readily  extensible. If you have a new sprite type, register it here...
 * 
 * @param {string} type    - The type of sprite to create (e.g., 'boid').
 * @param {object} options - Configuration options for the sprite.
 * @param {GameController} GameController - Reference to the GameController.
 * @returns {sprite object} A new Sprite instance.
 */
export function createSprite( type, options, GameController ) {

    const SpriteType = SpriteRegistry[ type ] ;

    if ( ! SpriteType ) {
        throw new Error( `[Sprite Factory] Unknown type: ${type}. Sprite types MUST be registered at the factory.` );
    }

    // Options MUST correctly map to constructor arguments .
    // The format must be specified... 
    const { 
        id, 
        svg, 
        position, 
        velocity, 
        acceleration, 
        rotation = 0, 
        scale = {xAxis: 1, yAxis: 1},
    } = options;

    // create the instance:
    spriteInstance = new SpriteType(
        id, 
        svg, 
        position, 
        velocity, 
        acceleration,
        GameController
    );

    spriteInstance.id += "_" + serialNo ++;
    return spriteInstance;
}

/**
 * Create new Boids ... 
 * 
 * @param { object literal } options boid init options (SEE boid.js)
 * @param { GameController } GameController  (see game_system.js)
 * @returns  Boid Instance ...
 */
export function createBoid( options, GameController ) {
    // Options MUST correctly map to constructor arguments .
    // The format must be specified in the sprite def itself... 

    const { 
        id, 
        svg, 
        position, 
        velocity, 
        acceleration, 
        rotation = 0, 
        scale = {xAxis: 1, yAxis: 1},
    } = options;

    let svgClone = svg.cloneNode( true ) ; 
    let sid = id + "_" + serialNo ++;
    svgClone.setAttribute( "id", sid );

    // create the instance:
    const spriteInstance = new SpriteRegistry.BoidType(
        sid, 
        svgClone, 
        position, 
        velocity, 
        acceleration,
        rotation, 
        scale ,
        GameController
    );

    return spriteInstance;

}

// ... create other specific sprite factory functions ...

export function createWaspBoid( options, GameController ) {
    // Options MUST correctly map to constructor arguments .
    // The format must be specified in the sprite def itself... 

    const { 
        id, 
        svg, 
        position, 
        velocity, 
        acceleration, 
        rotation = 0, 
        scale = {xAxis: 1, yAxis: 1},
    } = options;

    let svgClone = svg.cloneNode( true ) ; 
    let sid = id + "_" + serialNo ++;
    svgClone.setAttribute( "id", sid );

    // create the instance:
    const spriteInstance = new SpriteRegistry.WaspBoidType(
        sid, 
        svgClone, 
        position, 
        velocity, 
        acceleration,
        rotation, 
        scale ,
        GameController
    );

    return spriteInstance;

}


// -- Tyhond's Sprite Factories -----------
/**
 * Create a TyhondSprite given ...
 * 
 * @param { object } options  sprite config options
 * @param { object } GameController  Handle to game controller singleton
 * @returns { TyhondSprite } sprite instance ... 
 */
// export function createTyhondSprite( options, GameController ) {
//     // Options MUST correctly map to constructor arguments .
//     // The format must be specified in the sprite def itself... 
//     const { 
//         id, 
//         svg, 
//         position, 
//         velocity, 
//         acceleration, 
//         rotation = 0, 
//         scale = {xAxis: 1, yAxis: 1},
//         gridPosition = {i:0,j:0},
//     } = options;

//     let svgClone = svg.cloneNode( true ) ; 
//     let sid = id + "_" + serialNo ++;
//     svgClone.setAttribute( "id", sid );

//     // create the instance:
//     const spriteInstance = new SpriteRegistry.TyhondSpriteType(
//         sid, 
//         svgClone, 
//         position, 
//         velocity, 
//         acceleration,
//         rotation, 
//         scale ,
//         gridPosition,
//         GameController
//     );

//     return spriteInstance;
// }


/**
 * The factory method is only responsible for 
 * 
 * 1. cloning GIVEN svg (client attaches SVG via options), 
 * 2. Creating and attaching the SVG to a sprite instance. 
 * 
 * The factory returns a handle to the instance so it can be 
 * added to the game controller...
 */
// export function createFoodSprite( options, controllerSubsystem ) {

//     // Options MUST correctly map to constructor arguments ...
//     const { 
//         id, 
//         svg, 
//         position, 
//         rotation = 0, 
//         scale = {xAxis: 1, yAxis: 1},
//         isoCoords,
//         growthFactor,
//     } = options;

//     let svgClone = svg.cloneNode( true ) ; 
//     let sid = id + "_" + serialNo ++;
//     svgClone.setAttribute( "id", sid );
//     svgClone.setAttribute( "display", "inline" );

//     let foodItemSprt = new SpriteRegistry.FoodType( 
//         sid,
//         svgClone,
//         position,
//         rotation,
//         scale,
//         isoCoords,
//         growthFactor,
//         controllerSubsystem
//     ) ;

//     return foodItemSprt;
// }


/**
 * Create new Fairies ... 
 * 
 * @param { object literal } options fairy init options (SEE fairies.js)
 * @param { GameController } GameController  (see game_system.js)
 * @returns  Fairy Instance ...
 */
export function createFairy( options, GameController ) {
    // Options MUST correctly map to constructor arguments .
    // The format must be specified in the sprite def itself... 

    const { 
        id, 
        svg, 
        position, 
        velocity, 
        acceleration, 
        rotation = 0, 
        scale = {xAxis: 1, yAxis: 1},
    } = options;

    let svgClone = svg.cloneNode( true ) ; 
    let sid = id + "_" + serialNo ++;
    svgClone.setAttribute( "id", sid );

    // create the instance:
    const spriteInstance = new SpriteRegistry.FairyType(
        sid, 
        svgClone, 
        position, 
        velocity, 
        acceleration,
        rotation, 
        scale ,
        GameController
    );

    return spriteInstance;

}







