import {
    Vector2D
}  from "./vector.js";

/**
 * Base class for 'moveable' entities like sprites and 
 * particles...
 */
export class Movable {

    constructor( initPosition, initVelocity, acceleration ) {
        this.pos = initPosition;
        this.vel = initVelocity;
        this.acceleration = acceleration;

        // ---- bind methods ------------------------
        this.move = this.move.bind( this );
        this.isInBounds = this.isInBounds.bind(this);
    }

    /**
     * Every Moveable needs to be able to move.
     * expect deltaTime in seconds (i.e. msec / 1000)
     * 
     * Update velocity by adding accelaration. To make it 
     * time-based you need to factor in the interval between
     * current and last frame (i.e., multiply acceleration by 
     * deltaTime). Exepct delta Time in seconds...
     * 
     * Update position by adding velocity. You also need to 
     * account for delta time...
     * 
     * See: https://dr-nick-nagel.github.io/blog/kinematics.html
     */
    move ( deltaTime ) {
        this.vel.x += this.acceleration.x * deltaTime;
        this.vel.y += this.acceleration.y * deltaTime;
        this.pos.x += this.vel.x * deltaTime;
        this.pos.y += this.vel.y * deltaTime;
    }

    /**
     * Check whether a movable is within a particular bounded region 
     * defined by ...
     * 
     * @param {*} rect 
     * 
     * @returns true if so else false
     */
    isInBounds ( rect ) {
        return (
            this.pos.x >= rect.x &&
            this.pos.y >= rect.y &&
            this.pos.x <= rect.x + rect.width &&
            this.pos.y <= rect.y + rect.height
        );
    }

}


export class FairySprite extends Movable {

    /**
     * Fairy c-tor ... 
     * @param {*} id 
     * @param {*} svg 
     * @param {*} p 
     * @param {*} v 
     * @param {*} a 
     * @param {*} r 
     * @param {*} s 
     * @param {GameController} gc reference to the GameController (injected by the factory)
     */
    constructor (id, svg, p, v, a, r, s, gc ) {
        super( p, v, a );
        this.rotation = r;
        this.scale    = s;
        this.id  = id;
        this.svg = svg; 
        this.gameController = gc;
        this.emissionRate   = 1;
        this.maxSpeed       = 100;

        // Wander parameters (basically a circle in front of the sprite...)
        // WAS Math.random() * 2 * Math.PI;
        this.wanderTheta    = 0.5 * ( -(Math.PI/4)  + Math.random() * (Math.PI / 2) ) ;  
        this.wanderRadius   = 25;
        this.wanderDistance = 60;
        this.wanderJitter   = 5; //0.5;

        // -------- Debug visualization ----------------------
        this.debug = true;
        // Debug elements (created lazily)
        this.debugElements = {
            circle: null,
            target: null,
            line: null,
        };

    } 

    destroy () { 
        //Stubbed?
    }

    /**
     * SVG transform update for DOM. This is the *view* update.
     * it updates sprite's position, rotation and scale in light
     * of changes to the sprite model...
     */
    updateTransform (  ) {
        const { x, y } = this.pos;
        const rotation = this.rotation;
        const scale    = this.scale;
        const bbox = this.svg.getBBox();
        // const Y_OFFSET = bbox.height / 2 - 10; // <--| 10 is just a constant
        const xOffset = (bbox.width / 2)  * scale.xAxis;
        const yOffset = (bbox.height / 2) * scale.yAxis;
        this.svg.setAttribute(
            'transform',
            `translate( ${x-xOffset} ${y-yOffset} ) rotate( ${rotation} ) scale( ${scale.xAxis} ${scale.yAxis} )`
        );
    }

    /**
     * Apply wander steering force to simulate smooth, organic 
     * directional drift (wandering behavior).
     */
    wander(deltaTime) {
        this.wanderTheta += ( Math.random() * 2 - 1 ) * this.wanderJitter * deltaTime;
        let wanderVector   = Vector2D.getNormalized( this.vel );
        const circleCenter = wanderVector.multiply( this.wanderDistance );
        const displacement = Vector2D.fromCartesian (
            this.wanderRadius * Math.cos( this.wanderTheta ),
            this.wanderRadius * Math.sin( this.wanderTheta )
        );
        const wanderForce = circleCenter.add(displacement);
        this.acceleration.x += (wanderForce.x - this.vel.x) * 10;  //0.2;
        this.acceleration.y += (wanderForce.y - this.vel.y) * 10; //0.2;

        // ---- DEBUG VIZ ----------------
        if (this.debug) {
            this.renderDebug(circleCenter, displacement);
        } else {
            this.clearDebug();
        }
    }

    /**
     * Fairies wander about (using Reynolds' wander concept...)
     * 
     * @param {*} deltaTime 
     */
    move( deltaTime ) {
        // Reset acceleration each frame
        // (ELSE runaway acceleration bug...
        this.acceleration.x = 0;
        this.acceleration.y = 0;

        // update the acceleration  
        this.wander( deltaTime );
        // Literally integrate motion ... 
        super.move( deltaTime );

        // Limit velocity magnitude (optional but recommended)
        // TODO: WHY IS THIS BROKEN?
        const speed = this.vel.length();
        if (speed > this.maxSpeed) {
            let vNorm = Vector2D.getNormalized( this.vel );
            vNorm     = vNorm.multiply(this.maxSpeed);
            this.vel.x = vNorm.x;
            this.vel.y = vNorm.y;
        }

        this.wrap();
    }

    update ( deltaTime ) {
        this.move( deltaTime );
        this.updateTransform();
        this.emitFairyDust();
    }

    wrap() {
        // horizontal wrap
        if( this.pos.x > this.WorldModel.bounds.width ) {
            this.pos.x = this.WorldModel.bounds.x ;
        } else if ( this.pos.x < this.WorldModel.bounds.x ) {
            this.pos.x = this.WorldModel.bounds.width;
        }
        // vertical wrap
        if( this.pos.y > this.WorldModel.bounds.height ) {
            this.pos.y = this.WorldModel.bounds.y;
        } else if ( this.pos.y < this.WorldModel.bounds.y ) {
            this.pos.y = this.WorldModel.bounds.height;
        }
    }


    setWorldModel( WorldModel ) {
        this.WorldModel = WorldModel;
    }

    setParticleSystem( ps ) {
        this.particleSystem = ps;
    }

    /**
     * Function to support persisting sprites. 
     * 
     * Note: only serializable properties get serialized:
     * id's positions, etc. What you cannot serialize are
     * e.g., references to controllers, DOM representations 
     * (namely SVG) etc.. These things have to get re-injected
     * back at the factory and/or by the GC ... 
     * 
     * @returns object propertie ready for serialization 
     */
    serialize() {
        let serialized = {
            id: this.id,
            pos: this.pos,
            vel: this.vel,
            acceleration: this.acceleration,
            rotation: this.rotation,
            scale: this.scale,
        }
        return serialized;
    }

    createFairyDust () {
        function particleSvg () {
            const circle = 
                document.createElementNS(
                    "http://www.w3.org/2000/svg", 
                    "circle"
                );
            circle.setAttribute( "cx", 0 );
            circle.setAttribute( "cy", 0 );
            circle.setAttribute( "r", "1" );
            circle.setAttribute( "fill", "green" );
            return( circle );
        }
        const pos = Vector2D.fromCartesian(
            this.pos.x,
            this.pos.y
        );
        const vel = Vector2D.fromCartesian(
            0,
            0.25
        );
        const acc = Vector2D.fromCartesian(
            0,
            0
        );
        const rot = 0;
        const scale = {xAxis:1, yAxis:1};
        const ttl = 2; // <--| seconds
        const svg = particleSvg();
        const pSystem = this.particleSystem;

        let dust = new FairyDust( 
            pos,
            vel,
            acc,
            rot,
            scale,
            ttl,
            svg,
            pSystem
         );
        return dust;
    }

    /**
     * Turns this sprite into a particle emmiter ... 
     */
    emitFairyDust() {
        for ( let i=0; i<this.emissionRate; i++ ) {
            const d = this.createFairyDust();
            this.particleSystem.addParticle( d );
        }
    }


    // ---- DEBUG VISUALIZATION ----------------------------------
    renderDebug(circleCenter, displacement) {
        const cx = this.pos.x + circleCenter.x;
        const cy = this.pos.y + circleCenter.y;
        const tx = cx + displacement.x;
        const ty = cy + displacement.y;

        const svgRoot = this.svg.ownerSVGElement || this.svg;

        // Create debug elements once
        if (!this.debugElements.circle) {
            const ns = "http://www.w3.org/2000/svg";

            const circle = document.createElementNS(ns, "circle");
            circle.setAttribute("fill", "none");
            circle.setAttribute("stroke", "cyan");
            circle.setAttribute("stroke-width", "0.5");

            const target = document.createElementNS(ns, "circle");
            target.setAttribute("r", "2");
            target.setAttribute("fill", "magenta");

            const line = document.createElementNS(ns, "line");
            line.setAttribute("stroke", "yellow");
            line.setAttribute("stroke-width", "0.5");

            svgRoot.appendChild(circle);
            svgRoot.appendChild(line);
            svgRoot.appendChild(target);

            this.debugElements = { circle, target, line };
        }

        // Update positions
        const { circle, target, line } = this.debugElements;
        circle.setAttribute("cx", cx);
        circle.setAttribute("cy", cy);
        circle.setAttribute("r", this.wanderRadius);
        line.setAttribute("x1", this.pos.x);
        line.setAttribute("y1", this.pos.y);
        line.setAttribute("x2", cx);
        line.setAttribute("y2", cy);
        target.setAttribute("cx", tx);
        target.setAttribute("cy", ty);
    }

    clearDebug() {
        const svgRoot = this.svg.ownerSVGElement || this.svg;
        const { circle, target, line } = this.debugElements;
        if (circle) svgRoot.removeChild(circle);
        if (target) svgRoot.removeChild(target);
        if (line) svgRoot.removeChild(line);
        this.debugElements = { circle: null, target: null, line: null };
    }


}

/**
 * Fairy dust particles. Like sprites, particles 
 * should be defined with their own class which extends 
 * Movable ...  
 */
export class FairyDust extends Movable {

    /**
     * The emmitter should inject a handle to the revelevent
     * controller (particle system) ...
     * 
     * @param {*} p 
     * @param {*} v 
     * @param {*} a 
     * @param {*} ttl 
     * @param {*} svg 
     * @param {object} controllerSubsystem -- the particle system controller
     */
    constructor ( p, v, a, r, s, ttl, svg, controllerSubsystem ) {
        super( p, v, a );
        this.rotation = r;
        this.scale    = s;
        this.ttl = ttl;
        this.svg = svg; 
        this.particleSystem = controllerSubsystem;
        this.timeAccumulator = 0;
    }

    move( deltaTime ) {
        super.move( deltaTime ) ;
    }

    updateTransform() {
        const { x, y } = this.pos;
        const rotation = this.rotation;
        const scale    = this.scale;
        this.svg.setAttribute(
            'transform',
            `translate( ${x} ${y} ) rotate( ${rotation} ) scale( ${scale.xAxis} ${scale.yAxis} )`
        );
    }

    update( deltaTime ) {
        this.timeAccumulator += deltaTime;
        this.move( deltaTime );
        this.updateTransform();      
        if  ( this.timeAccumulator > this.ttl ) {
            this.particleSystem.removeParticle( this );
        }
    }

}
