const csmState = {
    IDLE: "idle",
    PANNING: "user is panning",
    ZOOMING: "user is zooming",
};

/**
 * This class defines a state machine to handle touch events on mobile.
 * The web API for mobile is low level so this guy is repsonsible for
 * tracking touch events. He handles:
 * 
 * 1. pinch/spread gestures to toogle zoom, and
 * 
 * 2. swiping around to handle camera pan ... 
 * 
 * NOTE: the state cycle methods are closely mirrored in 
 * @see camera.js which is repsonsible for the matrix math. 
 * This guy should ONLY ...
 * 
 * 1. Track the touches, and
 * 
 * 2. Pass the client coordinates to camera for scene graph operations... 
 *  
 */
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

        // DESKTOP: double-click to toggle zoom
        this.svgRoot.addEventListener(
            "dblclick", 
            async ( evt ) => {
                await this.camera.toggleZoom();
            }
        );

        // MOUSE: pan handling
        // IMPORTANT: camera functions get called with mouse events which works.
        // Why? Because the event objects have clientX and clientY coordinates ... 
        this.svgRoot.addEventListener("mousedown", this.camera.startPan);
        this.svgRoot.addEventListener("mousemove", this.camera.panMove);
        this.svgRoot.addEventListener("mouseup",   this.camera.endPan);

    }

    /**
     * Handle touch start: 
     * 
     * Start with panning (one touch) and abort the pan 
     * and move to zooming for two touch ... 
     * 
     * @param { touchevent } evt one or two touches for swiping vs. zoom ... 
     */
    touchStart( evt ) {
        evt.preventDefault();
        const touches = evt.touches;
        if ( touches.length === 1 ) {
            this.csmState = csmState.PANNING;
            const { clientX, clientY } =  touches[0];
            this.camera.startPan( { clientX:clientX, clientY:clientY } );
        } else if ( touches.length === 2 ) {
            // abort pan if one touch detected first...
            this.camera.endPan();
            // switch to zoom ... 
            this.csmState = csmState.ZOOMING;
            // compute touch point distance ... 
            const t1 = touches[0];
            const t2 = touches[1];
            this.touchDistanceInit = Math.sqrt(
                Math.pow(t2.clientX - t1.clientX, 2) + 
                Math.pow(t2.clientY - t1.clientY, 2)
            );
        }
    }

    /**
     * Handle touch move: 
     * 
     * Pan if one touch track for zoom else... 
     * 
     * @param { touchevent } evt one or two touches for swiping vs. zoom ... 
     */
    touchMove( evt ) {
        evt.preventDefault();
        const touches = evt.touches;
        if ( touches.length === 1 ) {
            if ( this.csmState === csmState.PANNING ) {
                const { clientX, clientY } =  touches[0];
                this.camera.panMove( { clientX:clientX, clientY:clientY } );
            }
        } else if ( touches.length === 2 ) {
            // GET THE CURRENT TOUCH DISTANCE, distance
            // compute touch point distance ... 
            const t1 = touches[0];
            const t2 = touches[1];
            // Euclidean distance ... 
            const currentDistance = Math.sqrt(
                Math.pow(t2.clientX - t1.clientX, 2) + 
                Math.pow(t2.clientY - t1.clientY, 2)
            );
            // DETERMINE IS IT PINCH OR SPREAD (for possible use later ...)
            const deltaDistance = currentDistance - this.touchDistanceInit;
            const gesture = deltaDistance < 0 ? "PINCH" : "SPREAD";
        }
    }

    touchEnd( evt ) {
        evt.preventDefault();
        this.endTouch( evt );
    }

    touchCancel( evt ) {
        evt.preventDefault();
        this.endTouch( evt );
    }

    /**
     * Handle touch end: Same for touch cancelled ... 
     * 
     * 1. Ensure that zoom only gets called once (it is an eased toggle 
     *    on the transform ) 
     * 2. Call corresponding  end functions on camera object...
     * 3. Set CSM state  back to idle Pan if one touch track for zoom else... 
     * 
     * @param { touchevent } evt one or two touches for swiping vs. zoom ... 
     */
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

