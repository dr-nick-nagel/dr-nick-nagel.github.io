const csmState = {
    IDLE: "idle",
    PANNING: "user is panning",
    ZOOMING: "user is zooming",
};


export class CamStateMachine {

    constructor( svgRoot, camera ) {

        this.svgRoot  = svgRoot;
        this.camera   = camera;
        this.csmState = csmState.IDLE;
        this.touchDistanceInit = 0;
        

        this.svgRoot.addEventListener(
            "touchstart",
            this.touchStart.bind(this)
        );
        this.svgRoot.addEventListener(
            "touchmove",
            this.touchMove.bind(this)
        );
        this.svgRoot.addEventListener(
            "touchend",
            this.touchEnd.bind(this)
        );
        this.svgRoot.addEventListener(
            "touchcancel",
            this.touchCancel.bind(this)
        );

    }

    touchStart( evt ) {
        evt.preventDefault();

        const touches = evt.touches;
        console.log( "==== TOUCHSTART ====\n  a touch: ", touches.length );

        if ( touches.length === 1 ) {
            console.log( "handle 1 touch" );
            this.csmState = csmState.PANNING;
            const { clientX, clientY } =  touches[0];



            console.log( "does cam think it's zoomed in?   ", this.camera.isZoomedIn ); 

            this.camera.startPan( { clientX:clientX, clientY:clientY } );

        } else if ( touches.length === 2 ) {
            console.log( "handle 2 touches" );

            this.camera.endPan();

            this.csmState = csmState.ZOOMING;
            // compute touch point distance ... 
            const t1 = touches[0];
            const t2 = touches[1];
            this.touchDistanceInit = Math.sqrt(
                Math.pow(t2.clientX - t1.clientX, 2) + 
                Math.pow(t2.clientY - t1.clientY, 2)
            );

            console.log( "----\n  t1 ", t1 );
            console.log( "  t2 ", t2 );
            console.log( "  initial  distance", this.touchDistanceInit );

        }

    }

    touchMove( evt ) {
        evt.preventDefault();
        const touches = evt.touches;
        console.log( "==== TOUCHMOVE ====\n  a touch: ", touches.length );

        if ( touches.length === 1 ) {
            console.log( "handle 1 touch" );
            if ( this.csmState === csmState.PANNING ) {
                // if( this.camera.isZoomedIn ) {
                    //console.log( touches[0] );
                    const { clientX, clientY } =  touches[0];
                    this.camera.panMove( { clientX:clientX, clientY:clientY } );
                // }
            }

        } else if ( touches.length === 2 ) {
            console.log( "handle 2 touches" );

            // GET THE CURRENT DISTANCE, distance
            // compute touch point distance ... 
            const t1 = touches[0];
            const t2 = touches[1];
            const currentDistance = Math.sqrt(
                Math.pow(t2.clientX - t1.clientX, 2) + 
                Math.pow(t2.clientY - t1.clientY, 2)
            );
            // IS IT PINCH OR SPREAD
            const deltaDistance = currentDistance - this.touchDistanceInit;
            const gesture = deltaDistance < 0 ? "PINCH" : "SPREAD";


            console.log( "----\n  distance      ", currentDistance );
            console.log( " - initial  distance", this.touchDistanceInit );
            console.log( "  __\n  delta distance", deltaDistance );
            console.log( " GESTURE", gesture );

        }
        
    }

    touchEnd( evt ) {
        evt.preventDefault();
        const touches = evt.touches;

        console.log( "==== TOUCHEND ====\n  a touch: ", touches.length );
        
        this.endTouch( evt );

        console.log( "a end: ", touches.length );
        console.log( "STATE: ", this.csmState );
        
    }

    touchCancel( evt ) {
        evt.preventDefault();
        const touches = evt.touches;

        console.log( "==== TOUCH CANCELLED ====\n  a touch: ", touches.length );
        this.endTouch( evt );

        console.log( "a cancel: ", touches.length );
        console.log( "STATE: ", this.csmState );
    }

    endTouch( evt ) {
        // only call zoom once (if your are in zooming state ... )
        if ( this.csmState === csmState.ZOOMING ) {
            this.camera.toggleZoom();
        }
        this.camera.endPan();
        this.csmState = csmState.IDLE;
    }

    /**
     * Get a string report with various features
     * (Mainly for debugging ... )
     */
    toString() {
        let report = "========  Camera State Machine Report  ========";
        report += "State:\t\t" + this.csmState;
        report += "Camera ZOOM state:\t" + this.camera.isZoomedIn;
        report += "Camera Pan limits:\t" + this.camera.panLimits;
        return report;
    }

}

