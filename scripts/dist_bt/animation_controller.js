import {
    GameController
} from "./game_controller.js";
import { 
    particleSystem 
} from "./particle_system.js";

// TODO document me ...
const fpsDisplay = document.getElementById( "fps_display" );
export const animationController = {
    previousTimestamp : 0 ,
    rafId : 0,

    update : function (timestamp)  {
        let frameRate = 1000 / (timestamp - this.previousTimestamp);
        frameRate = Math.round( frameRate );
        fpsDisplay.innerText = `FPS: ${frameRate}`;
        // compute delta time in SECONDS (hence divide by 1000)
        const deltaTime = (timestamp - this.previousTimestamp) / 1000;
        this.previousTimestamp = timestamp;
        GameController.updateSprites( deltaTime );
        particleSystem.update( deltaTime );
        this.rafId = requestAnimationFrame( this.update.bind(this) );
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

}

