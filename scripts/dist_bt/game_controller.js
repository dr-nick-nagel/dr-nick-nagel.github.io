import {
    MissileSprite,
    MohronSprite,

    Vector2D,
    WorldModel,
    spriteConstants
} from "./game_state.js"

import {
    TankSprite,
    tankConstants,
} from "./tank_sprite.js"

import {
    btConstants,
    makeTankBT
}from "./behavior_tree.js";
import { getKeyFromValue } from "./utilities.js";


/**
 * GameController is an intended Singleton responsible for 
 * updating sprites. ALL sprite updates *should* go through
 * GameController. Sprites *must* have an update function.
 * 
 * @param {*} deltaTime interval since update was last called.
 * SEE: AnimationController...
 * 
 */
export const GameController = {

    sprites : [],
    projectiles: [],
    fires: [],
    bloodVirgin : true,
    missileCount: 0,
    serialNo: 0,

    blackboards: {
        tank: {
            cooldowns: {
                insults: 0,
                orders: 0
            },
            sprite: null, 
            accessable : false
        }, 
    },

    // use factory functions to construct behavioral trees
    tankBT :  makeTankBT(),

    // set an accumulator to time BT updates...
    timeAccumulator: 0,
    // at second based intervals...
    tickInterval: 2,


    addSprite : function( sprite ) {
        this.sprites.push( sprite );
        /*
         * TODO 
         * YIKES! this is where things get fast and furious
         * need a way to better integrate BT's with game controller
         * framework ... 
         */
        if( typeof sprite.getBtType === "function"  ) {
            const btType = sprite.getBtType();
            switch( btType ) {
                case btConstants.types.BOMBER :
                    this.blackboards.bomber.sprite    = sprite;
                    break;
                case btConstants.types.COMMANDER : 
                    this.blackboards.commander.sprite = sprite;
                    break;
                case btConstants.types.TANK : 
                    this.blackboards.tank.sprite = sprite;
                    break;
                default:
                    break;
            }
        }

        if ( typeof sprite.getSpriteType === "function" ) {
            if( sprite.getSpriteType() === spriteConstants.MISSILE_TYPE ) {
                this.projectiles.push( sprite );
            }
        }

    },

    /**
     * Remove Sprite object from game. 
     * 
     * Notes: 
     * 
     *   It is assumed the SVG is removed elswhere. This function is only
     *   concerned with the spritelist and other structured related to 
     *   Game control.
     * 
     *   Note that some sprites may be BT controlled and therefore have 
     *   blackboard references requiring removal...
     * 
     * @param {object} sprite  Reference to the Sprite to be removed
     */
    removeSprite : function( sprite ) {
        console.log( "GAME CONTROLLER REMOVE SPRITE TBD" );
        // remove from blackboard if necessary...
        if ( typeof sprite.getBtType === "function" ) {
            const btType = sprite.getBtType;
            switch( btType ) {
                case btConstants.types.BOMBER: 
                    if (this.blackboards.bomber.sprite === sprite) {
                        this.blackboards.bomber.sprite = null;
                    }
                    break;
                case btConstants.types.COMMANDER: 
                    if (this.blackboards.commander.sprite === sprite) {
                        this.blackboards.commander.sprite = null;
                    }
                    break;
                default :
                    break;
            }
        }
        // Remove from projectiles if necessary
        if ( typeof sprite.getSpriteType === "function" ) {
            if( sprite.getSpriteType() === spriteConstants.MISSILE_TYPE ) {
                const idx = this.projectiles.indexOf(sprite);
                if( idx > -1 ) {
                    this.projectiles.splice( idx, 1 );
                }
            }
        }
        const index = this.sprites.indexOf( sprite ); 
        if( index > -1 ) {
            this.sprites.splice( index, 1 );
        }
    },

    odd: false,

    /**
     * Update all the sprites based on delta time.
     * 
     * @param {*} deltaTime interval since update was last called.
     * SEE: AnimationController...
     * 
     */
    updateSprites : function( deltaTime ) {
        // standard call for sprites. go update yourself ... 
        for( const sprite of this.sprites ) {
            sprite.update( deltaTime );
        }
        // Behavioral tree updates ... 
        this.timeAccumulator += deltaTime;
        while ( this.timeAccumulator >= this.tickInterval ) {
            this.odd = !this.odd;
            (this.odd) ? console.log( "\nTICK" ) : console.log( "\nTOCK" ) ;
            // Do BT Updates ...
            // TODO: make bt list *not* hardcoded ... 
            // console.log( "TICK THE BT's" );
            this.tankBT.tick( this.blackboards.tank );
            this.timeAccumulator -= this.tickInterval;
        }
        // collision detection ... 
        // went with smart sprite detection approach. 
        // but retain this command as reference to alternative.
        // this.wolrdwideCollisionDetection();
    },

    /**
     * In case GameController wants to check collisons across sets of 
     * sprites. But prefer sprites smart enough to detect there own 
     * collisions and report to central control in an autonomous 
     * federated system...
     */
    wolrdwideCollisionDetection : function () {
        const targets = WorldModel.targetLocations;
        for (const target of Object.values(targets)) {
            // Iterate backward through the projectiles array
            for (let i = this.projectiles.length - 1; i >= 0; i--) {
                const missile = this.projectiles[i];
                const collision = collisionDetection(
                    missile.getBoundingBox(), 
                    target.boundingBox
                );
                if (collision) {
                    console.log( "PRE", this.projectiles.length );
                    this.destroyMissile(missile); 
                    console.log("EXPLOSION!");

                    console.log( "POST", this.projectiles.length );
                }
            }
        }
    },


    /**
     * Search spritelist and return sprite with given ID
     * @param { string } spriteId 
     * @returns spite handle or NULL
     * 
     * TODO: SPRITE FINDERS?
     */
    getSpriteById( spriteId ) {
        for (let sprite of this.sprites ) {
            if ( spriteId === sprite.id) {
                return sprite;
            }
        }
        return null;
    },
    

    /**
     * The GameController should know about the Sprites in any given game.
     * Let's keep it fairly closely coupled using 'strong composition'.
     * GameController will create sprites on demand (internal or external)
     * and destroy as well.
     */
    createMohronSprite : function( svg, spriteRootNodeId ) {
        const scaleFactor = 2;
        const moronSpriteSvg = svg.getElementById( spriteRootNodeId );
        let spriteId = spriteRootNodeId + "_" + ++this.serialNo;
        moronSpriteSvg.setAttribute( "id", spriteId );
        const svgRoot = document.querySelector( "svg" );
        svgRoot.append( moronSpriteSvg );
        const spriteObj = new MohronSprite(
            spriteId,
            Vector2D.fromCartesian( 350, 220 ),
            Vector2D.fromCartesian( 0, 0 ),
            Vector2D.fromCartesian( 0, 0 ),
            scaleFactor
        );
        spriteObj.updateTransform();
        this.addSprite( spriteObj );
        return spriteId;
    },


    /**
     * Helper function to clone missileSpriteSvg from template 
     * setting all flame effect references to have unique document wide
     * id's along the way...
     * 
     * @param {svg fragement} missileSpriteSvg  SVG TEMPLATE
     * @returns scalar value: the missileClone id
     */
    constructMissileSvg( missileSpriteSvg ) {
        const svgRoot = document.querySelector( "svg" );
        let missileId = "missile_" + ++this.missileCount + "_";
        const missileSvgClone = missileSpriteSvg.cloneNode(true);
        missileSvgClone.setAttribute( "id", missileId );
        const referents = missileSvgClone.querySelectorAll( '[ data-identifier ]' ); 
        for(let referent of referents) {
            let newid = referent.getAttribute("id");
            referent.setAttribute("id", missileId + newid );
        }
        const referers = missileSvgClone.querySelectorAll( '[ data-urlRef ]' );
        const referentTypes = [ 'filter', 'fill', 'mask' ];
        for(let referer of referers) {
            for( const attr of referentTypes ) {
                // insert namespace into URL
                let value = referer.getAttribute( attr );
                if( value ) {
                    value = value.split('#');
                    value = "url(#" + missileId + value[1];
                    referer.setAttribute( attr, value );
                }
            }
        }
        svgRoot.append( missileSvgClone );
        return missileId;
    },


    /**
     * Rockets are launched from launchers. The launcher behavior (AI)
     * should be defined on the launcher sprite itself (they know how
     * to behave and will have intelligent procedural bahaviours). the 
     * game controller should only have to know about the svg and mediate
     * it getting on the dom. And as always it needs to track the sprites for 
     * updates. So the launcher can trigger the launch and has to provide
     * it's identity as argument to the spawn function ... 
     * 
     * @param { MohronSprite Sprite } launcher The rocket launcher 
     * @param { SVG Document or Fragement } missileSpriteSvg containing missile SVG
     * 
     */
    spawnRocket : function( launcher, missileSpriteSvg ) {

        /**
         * Compute the launch point:
         * 1. get an offset vector relative to launcher origin
         * 2. rotate the vector to compensate for launcher orientation
         * 3. add to launcher position  the offset 
         * 4. mirror on y to compensate for about face of sprite ... 
         */
        function computeLaunchPoint() {
            const {x, y} = launcher.pos;
            const scale = launcher.scaleFactor;
            const angle = launcher.getOrientation();
            let mirror = 1;
            if( angle > 90 && angle < 270 ) {
                mirror = -1;
            }
            const offsetVector = Vector2D.fromCartesian( scale * 30,  mirror * scale * -10 );
            offsetVector.rotate( angle ); 
            const launchPosition = Vector2D.fromCartesian( x, y );
            launchPosition.add( offsetVector );
            return launchPosition;
        }
        const lTarget = launcher.getTarget(); 
        const missileId = this.constructMissileSvg( missileSpriteSvg );
        const initPosition = computeLaunchPoint();
        const speed = 500;
        const orientationDegrees = launcher.getOrientation();
        const orientationRadians = Math.PI / 180 * orientationDegrees ;
        const missileSprite = new MissileSprite(
            missileId,
            initPosition,
            Vector2D.fromPolar( speed, orientationRadians ),
            Vector2D.fromCartesian(0, 0),
            2 // scalefactor
        );
        missileSprite.setTarget( lTarget );

        missileSprite.updateTransform();
        this.addSprite( missileSprite );
        // TODO: 
        // Make sure 1. spawned missiles are  are added TO GAME CONTROLLER SPRITE LIST, and
        // Destroyed (including remove from DOM when  missiles hit targets or go out of viewbox bounds...)
        // manage missile flame animations ... 

    },


    /**
     * Destroy missile sprites. 
     * 
     * Destroyers are responsible for DOM SVG management since Sprites
     * may have ideosyncratic SVG elements and time-sensitive effects. The 
     * removeSprite function is only responsible taking sprites out 
     * of the game once SVG has ALREADY been properly disposed.
     */
    destroyMissile: function( missileSpriteRef ) {
        // Remove SVG from DOM
        missileSpriteRef.svg.remove(); 
        // Free any javscript resources
        // Remove from spritelist
        this.removeSprite( missileSpriteRef );
        missileSpriteRef = null;
    },


    createCommanderSprite: function ( svg,  spriteRootNodeId ) {
        const spriteSvg = svg.getElementById( spriteRootNodeId );
        let spriteId = spriteRootNodeId + "_" + ++this.serialNo;
        spriteSvg.setAttribute( "id", spriteId );
        const svgRoot = document.querySelector( "svg" );
        svgRoot.append( spriteSvg );
        // Create the sprite object ... 
        const scaleFactor = 3;
        const spriteObj = new HumpSprite(
            spriteId,
            Vector2D.fromCartesian( 150, 120 ),
            Vector2D.fromCartesian( 0, 0 ),
            Vector2D.fromCartesian( 0, 0 ),
            scaleFactor
        );
        spriteObj.updateTransform();
        this.addSprite( spriteObj );
        return spriteId;
    },

    /**
     * Dev time utility to see stuff in gameworld ... 
     * 
     * @param { center point } svgTarget {x: val, y: val}
     */
    showTargetInSVG : function ( svgTarget ) {
        // Create the circle element
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        // Set the attributes for the circle
        circle.setAttribute('cx', svgTarget.x );
        circle.setAttribute('cy', svgTarget.y );
        circle.setAttribute('r', '20');
        circle.setAttribute('fill', 'red');
        // Append the circle to the SVG root
        const svgRoot = document.querySelector( "svg" );
        svgRoot.appendChild(circle);
    },

    /**
     * constructMissileSVG helper made more generic. 
     * 
     * You can apply  this to effects made with SVG filter effects. 
     * Probably.
     * 
     * The helper is intended to clone filter effect SVG from template 
     * setting all filter references to have unique document wide
     * id's along the way...
     * 
     * IMPORTANT: the expected SVG is ALL AND ONLY the svg fragments 
     * associated with the effect and contained in a g element ... 
     * 
     * @param {svg fragement} effectSvg  SVG TEMPLATE
     * @returns scalar value: the svgClone id
     */
    constructFilterEffectSvg : function( effectSvg ) {

        let effectId = "fe_" + ++this.serialNo + "_";
        const effectSvgClone = effectSvg.cloneNode(true);
        effectSvgClone.setAttribute( "id", effectId );
        const referents = effectSvgClone.querySelectorAll( '[ data-identifier ]' ); 
        for(let referent of referents) {
            let newid = referent.getAttribute("id");
            referent.setAttribute("id", effectId + newid );
        }
        const referers = effectSvgClone.querySelectorAll( '[ data-urlRef ]' );
        const referentTypes = [ 'filter', 'fill', 'mask' ];
        for(let referer of referers) {
            for( const attr of referentTypes ) {
                // insert namespace into URL
                let value = referer.getAttribute( attr );
                if( value ) {
                    value = value.split('#');
                    value = "url(#" + effectId + value[1];
                    referer.setAttribute( attr, value );
                }
            }
        }
        
        return effectSvgClone;
    },

    /**
     * Set the target location aflame ... 
     * 
     * @param {obj} target the worldModel target where to set aflame...
     * @param {SVG } infernoSvg  ALL AND ONLY the svg fragments 
     * associated with the effect and contained in a g element ... 
     */
    setFire : function (  target, infernoSvgTemplate ) {
        // Limit fires. only set ablaze if target not already lit up...
        // Blaze list should never exceed number of tagets. Fire is EXPENSIVE ... 
        const targetKey = getKeyFromValue(
            WorldModel.targetLocations,
            target
        );
        if( this.fires.includes( targetKey )   ) {
            console.log( "SET FIRE EARLY RETURN" );
            return;
        }
        // CONSTRUCT THE SVG
        const infernoSvg = this.constructFilterEffectSvg( infernoSvgTemplate );
        // set the transform 
        const tx = target.center.x;
        const ty = target.center.y;
        const transformValueStr = `translate( ${tx} ${ty} ) scale(1.5, 1.2)`;
        infernoSvg.setAttribute( "transform", transformValueStr )  ;
        // ADD TO DOM
        const svgRoot = document.querySelector( "svg" );
        const insert = svgRoot.querySelector( "#blaze_layer" );
        insert.append( infernoSvg );
        // add to blaze list ...
        this.fires.push( targetKey );
    },

    /**
     * Generic createSprite
     * 
     * Creates a minimal game sprite and adds to sprite list. If append to 
     * DOM is true GC will append sprite svg to SVG root if it can grab it.
     * 
     * Specialized sprite creators should be added for more specific needs.
     * 
     * @param {string} id Sprite SVG id
     * @param {SVG} svg handle to svg root or group 'g' defining sprite 
     * @param {boolean} append if true append sprite svg to svg root (
     *   enables client to inline sprite svg on svg docs or provide
     *   in modular svgs ... ).
     */
    createTankSprite : function ( svg, id, append=false ) {
        const scaleFactor = 1.5;
        const spriteSvg = svg.querySelector( "#" + id );
        let spriteId = id + "_" + ++this.serialNo;
        spriteSvg.setAttribute( "id", spriteId );
        if( append ) {
            const svgRoot = document.querySelector( "svg" );
            svgRoot.append( spriteSvg );
        }
        
        // THIS IS WHY YOU NEED PER SPRITE TYPE CREATE FUNCTIONS.
        // OTHERWISE SET UP A FACTORY ... 
        const spriteObj = new TankSprite(
            spriteId,
            Vector2D.fromCartesian( 50, 25 ),
            Vector2D.fromPolar( 10, 90/180 * Math.PI ),
            Vector2D.fromCartesian( 0, 0 ),
            scaleFactor
        );
        spriteObj.updateTransform();
        this.addSprite( spriteObj );
        return spriteId;
    }


}



/**
 * Checks for a collision between two Axis-Aligned Bounding Boxes.
 * @param {object} boxA - The first bounding box { x, y, width, height }
 * @param {object} boxB - The second bounding box { x, y, width, height }
 * @returns {boolean} True if the boxes are colliding, otherwise false.
 */
export function collisionDetection( boxA, boxB ) {
    // Condition 1: Check if boxA's right edge is to the left of boxB's left edge.
    if (boxA.x + boxA.width < boxB.x) {
        return false;
    }
    
    // Condition 2: Check if boxA's left edge is to the right of boxB's right edge.
    if (boxA.x > boxB.x + boxB.width) {
        return false;
    }
    
    // Condition 3: Check if boxA's bottom edge is above boxB's top edge.
    if (boxA.y + boxA.height < boxB.y) {
        return false;
    }
    
    // Condition 4: Check if boxA's top edge is below boxB's bottom edge.
    if (boxA.y > boxB.y + boxB.height) {
        return false;
    }
    
    // If none of the above conditions are met, the boxes must be overlapping.
    return true;
}


