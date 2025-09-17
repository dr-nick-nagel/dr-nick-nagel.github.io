import { Movable }    from "./movable.js";
import { 
    BoidSprite ,
    WaspBoid
} from "./boid.js";


// Import other sprite types as needed


export const SpriteRegistry = {
    MovableType: Movable, // <--| Base type for sprites...
    BoidType: BoidSprite,
    // Register new sprite types here ...
    WaspBoidType: WaspBoid,

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



