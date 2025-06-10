
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
    bloodVirgin : true,

    addSprite : function( sprite ) {
        this.sprites.push( sprite );
    },

    removeSprite : function( sprite ) {
        console.log( "GAME CONTROLLER REMOVE SPRITE TBD" );
    },

    /**
     * Update all the sprites based on delta time.
     * 
     * @param {*} deltaTime interval since update was last called.
     * SEE: AnimationController...
     * 
     */
    updateSprites : function( deltaTime ) {
        for( const sprite of this.sprites ) {
            sprite.update( deltaTime );
        }

    },

}

