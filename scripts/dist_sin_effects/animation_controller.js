// ---- ANIMATION CONTROLLER --------------------------------------

const fpsDisplay = document.getElementById( "fps_display" );

export const animationController = {
    previousTimestamp : 0 ,
    rafId : 0,
    sprites : [],

    update : function (timestamp)  {
        // TODO: FACTOR OUT FPS display 
        // display the framerate
        if ( fpsDisplay ) {
            const fps = this.getFPS( timestamp );
            fpsDisplay.textContent = fps.toFixed(0);
        }
        // compute delta time in SECONDS (hence divide by 1000)
        const deltaTime = (timestamp - this.previousTimestamp) / 1000;
        this.previousTimestamp = timestamp;
        this.updateSprites( deltaTime );
        this.renderSprites();
        this.rafId = requestAnimationFrame( this.update.bind(this) );
    },

    updateSprites : function( deltaTime ) {
        for( const sprite of this.sprites ) {
            sprite.update( deltaTime );
        }
    },

    renderSprites : function() {
        for( const sprite of this.sprites ) {
            sprite.render(  );
        }
    },
    

    startAnim : function  ()  {
        const  startTime = performance.now() ;
        this.previousTimestamp = startTime;
        this.update( startTime ) ;
        console.log( "GAME ON! " + startTime  );
    },

    stopAnim : function  ()  {
        cancelAnimationFrame ( this.rafId ) ;
        this.rafId = 0;
        const  stopTime = performance.now();
        console.log( "GAME OFF: " + stopTime  );
    },

    getFPS : function ( timestamp ) {
        let frameRate = 1000 / ( timestamp - this.previousTimestamp );
        return frameRate;
    }

}
