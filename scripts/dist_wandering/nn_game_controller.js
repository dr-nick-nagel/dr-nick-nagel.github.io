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
    WorldModel : {
        bounds : {
            x : 0,
            y : 0,
            width : 600,
            height : 500,
        },
    },

    /**
     * Adds sprite to list. 
     * 
     * TODO: how are you going to manage ideosyncratic sprite type
     * requirements?  Boids is good example -- they need to know about
     * their group -- missiles have to destroy -- etc. etc...
     * 
     * I have the feeling game controllers are gonna have to be extensible
     * in which case this has to become a proper base class that can
     * be used out of the box or extended OR composed ... 
     * 
     */
    addSprite : function( sprite ) {
        this.sprites.push( sprite );
    },


    /**
     * Remove Sprite object from game. 
     * 
     * Notes: 
     * 
     *   GC should have repsonsibility for remove ALL traces of sprites
     *   that it has added to the game. That includes the sprite SVG
     *   added to the DOM ... 
     * 
     *   Note that some sprites may be BT controlled and therefore have 
     *   blackboard references requiring removal...
     * 
     * @param {object} sprite  Reference to the Sprite to be removed
     */
    removeSprite : function( sprite ) {
        // remove sprite SVG 
        sprite.svg.remove(); 

        // legacy TODO REFACTOR
        //  remove from blackboard if necessary...
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

        // legacy TODO REFACTOR
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
        this.particleSystem.update( deltaTime );
        // standard call for sprites. go update yourself ... 
        for( const sprite of this.sprites ) {
            sprite.update( deltaTime );
        }
    },

    setParticleSystem : function ( ps ) {
        this.particleSystem = ps;
    },


    /**
     * In case GameController wants to check collisons across sets of 
     * sprites. But prefer sprites smart enough to detect their own 
     * collisions and report to central control in an autonomous 
     * federated system...
     */
    wolrdwideCollisionDetection : function () {
        // This is just a stub ... 
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


    addFairy : function( fairy ) {
        fairy.setWorldModel(this.WorldModel);
        // randomize position
        fairy.pos.x = 50  + Math.random() * 500;
        fairy.pos.y = 100 + Math.random() * 300;
        // randomize velocity
        fairy.vel.x = 100 //+ Math.random() * 10;
        fairy.vel.y = -45 + Math.random() * 90;
        this.addSprite( fairy ) ; 
        fairy.updateTransform();
        // append svg
        const svgRoot = document.querySelector( "#svg2" );
        svgRoot.appendChild( fairy.svg );
    }, 

    clear : function () {
        for( let i = this.sprites.length - 1; i >=0 ; i-- ) {
            this.removeSprite( this.sprites[ i ] );
        }
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


