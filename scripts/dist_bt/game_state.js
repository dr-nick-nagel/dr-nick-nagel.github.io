
export class Vector2D {

    /**
     * Construct a new vector using either polar or cartesian static initializers ...
     * @param {*} x 
     * @param {*} y 
     */
    constructor( x, y ) {
        this.x = x; 
        this.y = y;

        // ---- BIND METHODS --------
        this.setPolarCoords = this.setPolarCoords.bind(this);
        this.getPolarCoords = this.getPolarCoords.bind(this);
        this.setCartesian   = this.setCartesian.bind(this);
        this.getCartesian   = this.getCartesian.bind(this);
        this.add            = this.add.bind(this);
        this.getDistance    = this.getDistance.bind(this);
        this.multiply       = this.multiply.bind(this);
    }

    /**
     * Factory method to get a Vector2D given speed and direction
     * as defined below:
     * 
     * @param {scalar number} r   speed
     * @param {scalar numer} theta direction in RADIANS
     * @returns a vector of form [x, y]
     */
    static fromPolar(r, theta) {
        const x = r * Math.cos(theta);
        const y = r * Math.sin(theta);
        return new Vector2D(x, y);
    }
    
    static fromCartesian(x, y) {
        return new Vector2D(x, y);
    }

    /**
     * Static utility to convert degrees to radians...
     * @param { float } degrees 
     * @returns radians
     */
    static degreesToRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    /**
     * Static utility to convert radians to degrees...
     * @param { float } radians 
     * @returns degrees
     */
    static radiansToDegrees(radians) {
        return radians * (180 / Math.PI);
    }

    static getDifferenceVector( v1, v2 ) {
        const x = v1.x - v2.x;
        const y = v1.y - v2.y;
        const vDiff = Vector2D.fromCartesian(x, y);
        return vDiff;
    }

    /**
     * Given a vector, v, returns a new normalized vector 
     * (i.e., a vector of unit length with orientation of
     * input vector). 
     * 
     * The special case of the zero vector input returns 
     * a zero vector right back since 0 vector has no 
     * orientation. Client code should accomodate the 
     * special case as necessary.
     * 
     * @param {*} v 
     * @returns 
     */
    static getNormalized( v ) {
        const len = v.length();
        if( len === 0 ) {
            return Vector2D.fromCartesian(0, 0);
        }
        const magnitude  = v.length();
        const x = v.x / magnitude;
        const y = v.y / magnitude;
        const normalized = Vector2D.fromCartesian(x, y);
        return normalized;
    }

    /**
     * Update the vector in place using polar coordinates.
     * 
     * @param {number} r - The new magnitude of the vector.
     * @param {number} theta - The new angle (in radians) of the vector.
     */
    setPolarCoords(r, theta) {
        this.x = r * Math.cos(theta);
        this.y = r * Math.sin(theta);
    }


    /**
     * Get the vector's state in polar coordinates.
     * 
     * @returns {Object} A plain object with `r` (magnitude) and `theta` (angle in radians).
     */
    getPolarCoords() {
        const r     = this.length();
        const theta = Math.atan2(this.y, this.x); 
        return { r, theta };
    }


    /**
     * Set this vector's, cartesian coordinates
     * @param {number} x x coord
     * @param {number} y y coord
     */
    setCartesian(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * Read the cartesian coordinates
     * @param {number} x x-coord
     * @param {number} y y-coord
     * @returns {Object} { x:number, y:number }
     */
    getCartesian(x, y) {
        return ({
            x: this.x ,
            y: this.y = y
        });
    }


    /**
     * Add a given vector to *this* vector
     * 
     * @param {
     * } v2D 
     */
    add( v2D ) {
        this.x += v2D.x;
        this.y += v2D.y;
        return this;
    }

    multiply( scalar ) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }


    getDistance( location ) {
        // expect a Vector2D ...
        const {x, y} = location; 
        const d = Math.sqrt( (x-this.x)**2 + (y-this.y)**2 );
        return d;
    }

    /**
     * get the length of the vector
     */
    length() {
        const l = Math.sqrt( this.x*this.x + this.y*this.y ) ;
        return l;
    }

    /**
     * Get a string representation of the vector
     * 
     * @returns a string representation of the vector
     */
    toString() {
        return "[ " + this.x + ", " + this.y + " ]";
    } 

    getClone() {
        return Vector2D.fromCartesian(
            this.x,  this.y
        );
    }

    /**
     * Get the vector orientation using atan2 to avoid
     * quadrant confusion. 
     * 
     * @returns a scalar value in degrees from -pi (-180) to pi (180 degrees)
     */
    getOrientation() {
        const rad = Math.atan2( this.y, this.x );
        return 180/Math.PI * rad;
    }

    /**
     * Rotate this vector around the origin by a given angle (degrees).
     * COUNTER clockwise, in-place.
     * @param {number} degrees - Rotation angle in [0,360).
     */
    rotate(degrees) {
        // Normalize angle to [0, 360)
        const angle = (degrees % 360 + 360) % 360;
        const radians = angle * Math.PI / 180;

        const cos = Math.cos(radians);
        const sin = Math.sin(radians);

        // COUNTER clockwise rotation: flip sign on sin for clockwise...
        const newX = this.x * cos - this.y * sin;
        const newY = this.x * sin + this.y * cos;

        this.x = newX;
        this.y = newY;

        // allow chaining
        return this; 
    }

}


class Rectangle {

    constructor ( x, y, width, height ) {
        this.x      = x;
        this.y      = y;
        this.width  = width;
        this.height = height;
    }

}


/**
 * WorldModel Singleton
 * 
 * Sprites can access WorldModel for (e.g., bounds checking)
 * 
 */

// TODO: Take this harcoded piece and turn it into something 
// dynamic. E.G. TIE IT TO THE ROOT SVG VIEWPORT... 
export const WorldModel = {

    bounds: { 
        x: 0, 
        y: 0,  
        width:  1200,
        height: 900,
    },

    targetLocations: {
        "publicServices": {
            center: { x: 510, y: 130 },
            launchPoint: { x: 1000, y: 320 },
            boundingBox: { x: 450, y: 80, width: 120, height: 100 },
        },
        "hallOfScience": {
            center: { x: 1070, y: 430 },
            launchPoint: { x: 100, y: 450 },
            boundingBox: { x: 1010, y: 380, width: 120, height: 100 },
        },
        "ministryOfEducation": {
            center: { x: 360, y: 520 },
            launchPoint: { x: 1080, y: 130 },
            boundingBox: { x: 300, y: 470, width: 120, height: 100 },
        },
        "ministryOfHealth" : {
            center: { x: 1060, y: 300 },
            launchPoint: { x: 200, y: 200 },
            boundingBox: { x: 1000, y: 250, width: 120, height: 100 },
        },
        "hallOfFreedom" : {
            center: { x: 100, y: 250 },
            launchPoint: { x: 1100, y: 300 },
            boundingBox: { x: 40, y: 200, width: 120, height: 100 },
        }
    },

}

export const spriteConstants = {
    MISSILE_TYPE: "projectile",
}

/**
 * Base class for 'moveable' entities like sprites and 
 * particles...
 */
export class Moveable {

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


// import { 
//     audioController ,
//     audioConstants
// } from "./audio_controller.js";

import {
    GameController,
    collisionDetection
} from "./game_controller.js"

import {
    btConstants
} from "./behavior_tree.js"

import {
    getKeyFromValue
} from "./utilities.js"


/**
 * SM States...
 */
export const moConstants = {
    flightStates : {
        PREFLIGHT: "flight preconditions aply",
        INFLIGHT: "flying to target in progress",
        POSTFLIGHT: "target reached"
    },
}

/**
 * Prototype Character Boss for Attack of the Demons...
 * 
 * Notice the spriteOrientation. It is INDEPENDENT of the
 * direction of velocity by design. The sprite can face (
 * and aim ) in different directions than it is flying. 
 * Orientation is a scalar and represented in degrees from 
 * right pointing x-axis ... 
 * 
 */
export class MohronSprite extends Moveable {

    constructor( id, p, v, a, scale ) {
        super(p, v, a) ;
        this.svg = document.getElementById( id );
        this.id = id;
        this.scaleFactor = scale;
        this.currentFrame = 0;
        this.accumulator = 0;
        this.fixedInterval = 0.05;
        this.missileSvg = null;
        this.smokeSvg = null;
        this.spriteOrientation = 0;
        this.target = null;
        this.flightState = moConstants.flightStates.PREFLIGHT;
    }

    updateTransform(  ) {
        const {x, y}   = this.pos;
        const scale    = this.scaleFactor;
        const orientation = this.spriteOrientation;
        // mirror the svg if the sprite is upside down...
        let mirror = 1;
        if( orientation > 90 && orientation < 270 ) {
            mirror = -1;
        }
        let transvalue = "";
        transvalue += `translate( ${x}, ${y} ) `;
        transvalue += `rotate( ${ orientation } ) `;
        transvalue += `scale( ${scale}, ${ mirror*scale }  )`;
        this.svg.setAttribute( 'transform', transvalue );
    }
    
    wrap() {
        // horizontal wrap
        if( this.pos.x > WorldModel.bounds.width ) {
            this.pos.x = WorldModel.bounds.x ;
        } else if ( this.pos.x < WorldModel.bounds.x ) {
            this.pos.x = WorldModel.bounds.width;
        }
        // vertical wrap
        if( this.pos.y > WorldModel.bounds.height ) {
            this.pos.y = WorldModel.bounds.y;
        } else if ( this.pos.y < WorldModel.bounds.y ) {
            this.pos.y = WorldModel.bounds.height;
        }
    }

    move( deltaTime ) {
        super.move( deltaTime );
        this.wrap();
    }

    /**
     * This sprite uses animation frames. 
     */
    renderFrame(  ) {
        // RENDER STUB
    }

    /**
     * 
     * @param { timestamp } deltaTime expected in seconds...
     */
    update( deltaTime ) {
        this.move(deltaTime);
        this.updateTransform();
        this.accumulator += deltaTime;
        while( this.accumulator >= this.fixedInterval ) {
            this.renderFrame();
            this.accumulator -= this.fixedInterval;
        }
    }


    setMissleSvg( missleSvg ) {
        this.missileSvg = missleSvg;
    }

    setSmokeSvg( smokeSvg ) {
        this.smokeSvg = smokeSvg;
    }

    /**
     * Mutator for spriteOrientation. 
     * 
     * Notice how we
     * 
     * 1. Normalize orientation to [0, 360) , and
     * 2. track the direction on a class member, direction of rotation
     * 
     * We need the direction of rotation in order to maintain 
     * valid orientations: 
     * 
     * ANY ANGLE BETWEEN  RIGHT_WRAP_MIN and RIGHT_MAX is VALID . 
     * ANY ANGLE BETWEEN  LEFT_MIN and LEFT_MAX is VALID . 
     * 
     * Otherwise we need to clamp the sprite orienation ...
     * 
     * NOTE: The roation problem is further complicated because 
     * positive y is down in computer graphics. Therefore clockwise
     * and counter clockwise defined in positive or negative degree 
     * changes are switched. 
     * 
     * @param {number} degrees angular rotation in degrees
     */
    setOrientation( degrees ) {
        const CLOCKWISE = "clock" ;
        const ANTICLOCKWISE = "counter" ;
        const NOT_ROTATING = "not rotating";
        // Define hemicircle boundaries
        // const RIGHT_MIN = 0;
        const RIGHT_MAX = 45;
        const LEFT_MIN = 135;
        const LEFT_MAX = 225;
        const RIGHT_WRAP_MIN = 315; 
        // const RIGHT_WRAP_MAX = 360;

        // Normalize the new angle ...
        const newAngle = (degrees % 360 + 360) % 360;
        const currentAngle = this.spriteOrientation;

        // determine direction of rotation using shortest angular distance
        // to circumvent the 0/360 edge case ... 
        // a classic trick to read 350 --> 10 as a counter clockwise 
        // change as oppose to a wide -340 shift...
        const distance = ( newAngle - currentAngle + 540 ) % 360 - 180;
        let rotation;
        if (distance > 0) {
            rotation = ANTICLOCKWISE;
        } else if (distance < 0) {
            rotation = CLOCKWISE;
        } else {
            rotation = NOT_ROTATING;
        }
        // Finally in a position to enforce constraints ... 
        if( rotation === ANTICLOCKWISE ) {
            if ( newAngle >= RIGHT_MAX && newAngle <=  LEFT_MIN ) { 
                this.spriteOrientation = LEFT_MIN;
            } else if ( newAngle >= LEFT_MAX && newAngle <=  RIGHT_WRAP_MIN ) { 
                this.spriteOrientation = RIGHT_WRAP_MIN;
            } else {
                this.spriteOrientation = newAngle;
            }
        } else if( rotation === CLOCKWISE ) {
            if ( newAngle <= RIGHT_WRAP_MIN && newAngle >=  LEFT_MAX ) { 
                this.spriteOrientation = LEFT_MAX;
            } else if ( newAngle <= LEFT_MIN && newAngle >=  RIGHT_MAX ) { 
                this.spriteOrientation = RIGHT_MAX;
            } else {
                this.spriteOrientation = newAngle;
            }
        }
        this.updateTransform();
    }

    getOrientation(  ) {
        return this.spriteOrientation;
    }

    getTarget() {
        return this.target;
    }

    setTarget( target ) {
        this.target = target;
    } 
    

    /**
     * Sprite behaviors (and animations) can be defined on sprite functions.
     * Sprites have to know what they can do. 
     */
    fireRocket() {
        // Get an offset vector to offset smoke and launch point from 
        // THIS sprite (MohRon) origin. ROTATE offset vector to compensate
        // for THIS sprite orientation. Then add to position the OFFSET to
        // get the effect launchpoint ... 
        const {x, y} = this.pos;
        const scale = this.scaleFactor;
        const angle = this.spriteOrientation;
        let mirror = 1;
        if( angle > 90 && angle < 270 ) {
            mirror = -1;
        }
        const offsetVector = Vector2D.fromCartesian( scale * 30,  mirror * scale * -10 );
        offsetVector.rotate( angle ); 
        const smokePosition = Vector2D.fromCartesian( x, y );
        smokePosition.add( offsetVector );
        this.smokeSvg.setAttribute(
            'transform',
            `translate( ${smokePosition.x}, ${smokePosition.y} ) rotate(${ angle })`
        );
        // trigger SMOKE animations
        const animations = [
            document.getElementById( 'animSmokeTurbulence' ),
            document.getElementById( 'animSmokeBlur' ),
            document.getElementById( 'animSmokeOpacity' ),
            document.getElementById( 'animSmokeRx' ),
        ];
        const smoke = document.getElementById("particle_phase_0");
        smoke.setAttribute( "opacity", "1" );
        for( let anim of animations ) {
            anim.beginElement();
        }
        GameController.spawnRocket( this, this.missileSvg );
    }

    /**
     * Provides a Behavior Tree type for use in GameController.
     * 
     * SEE GameController
     */
    getBtType () {
        return( btConstants.types.BOMBER );
    }

    /**
     * Shouting behavior for Moh' Ron
     */
    shout () {
        // wait for commander to finish shouting... 
        setTimeout(
            () => {
                audioController.play( audioConstants.KILLEM_ALL );
            }, 
            1500
        );
        return btConstants.SUCCESS;
    }


    /**
     * Sprite must know how to pick a target. If it has a target in 
     * mind skip it. Else pick from world target list ... 
     * 
     * @returns A status for behavior tree evaluation. SEE NN's Blog ...
     */
    pickATarget () {
        if( this.target === null ) {
            const pValue = Math.random();
            console.log( pValue );
            if( pValue < 0.2 ) {
                this.target = WorldModel.targetLocations.publicServices;
            } else if ( pValue < 0.4 ) {
                this.target = WorldModel.targetLocations.hallOfScience;
            } else if ( pValue < 0.6 ) {
                this.target = WorldModel.targetLocations.ministryOfEducation;
            } else if ( pValue < 0.8 ) {
                this.target = WorldModel.targetLocations.ministryOfHealth;
            } else if ( pValue < 1 ) {
                this.target = WorldModel.targetLocations.hallOfFreedom;
            }
        }
        console.log( 
            "MohRon Current target:", 
            getKeyFromValue( WorldModel.targetLocations, this.target ) 
        );
        return btConstants.SUCCESS;
    }


    /**
     * 1. Adjust your velocity and accelaration to go to target 
     * 2. Fly to target
     */
    flyToTarget () {
        switch ( this.flightState ) {
            case moConstants.flightStates.PREFLIGHT :
                // Set velocity (speed and direction) to launch point
                const targetCoords = this.target.launchPoint;
                const directionVector = Vector2D.getDifferenceVector(targetCoords, this.pos);
                const normal = Vector2D.getNormalized(directionVector);
                let speed = 100;
                normal.multiply( speed );
                this.vel = normal;
                this.flightState = moConstants.flightStates.INFLIGHT;

                // DEV TIME DEBUGGING...
                console.log( "Targeting: ", getKeyFromValue( 
                    WorldModel.targetLocations , 
                    this.target ) );
                console.log( "Coords: ", this.target.center );
                console.log( "launch: ", this.target.launchPoint );
                //GameController.showTargetInSVG( this.target.center );


                return( btConstants.IN_PROGRESS );
            case moConstants.flightStates.INFLIGHT :
                // are we there yet?
                let myBox = { 
                    x: this.pos.x - 75, 
                    y: this.pos.y - 75 , 
                    width: 150, 
                    height: 150
                } ;
                let targetBox = { 
                    x: this.target.launchPoint.x - 75,
                    y: this.target.launchPoint.y - 75, 
                    width: 150, 
                    height: 150
                } ;
                let colliding = collisionDetection( myBox, targetBox ); 
                if( colliding ) {
                    this.flightState = moConstants.flightStates.POSTFLIGHT;
                } 
                return btConstants.IN_PROGRESS;
            case moConstants.flightStates.POSTFLIGHT :
                console.log( "POST FLIGHT" );
                return btConstants.SUCCESS;
        }
    }

    /**
     * Wrapper for the missile launch. This function is responsible for 
     * state management for the Behavior Tree, and ultimately, for 
     * firing the rocket. See demon_tree.js .... and [NN's blog](TBD) for more
     * details...
     */
    launchRocket () {
        // Orient to target 
        const targetCoords = this.target.center;
        const directionVector = Vector2D.getDifferenceVector(targetCoords, this.pos);
        const normal = Vector2D.getNormalized(directionVector);
        const orientation = normal.getOrientation();
        this.setOrientation( orientation );
        // Fire
        this.fireRocket();
        return btConstants.SUCCESS;
    }

    /**
     * Reset BT state variables to repeat this sequence with 
     * fresh start ... 
     */
    resetBTSequence () {
        this.target = null;
        this.flightState = moConstants.flightStates.PREFLIGHT;
    }


}


/**
 * Prototype Missile for Attack of the Demons...
 */
export class MissileSprite extends Moveable {

    constructor( id, p, v, a, scale=1 ) {
        super(p, v, a) ;
        this.svg = document.getElementById( id );
        this.id = id;
        this.scaleFactor = scale;
        this.currentFrame = 0;
        this.accumulator = 0;
        this.fixedInterval = 0.05;
        this.destroyCalled = false;
        this.target = null;
    }

    updateTransform(  ) {
        const {x, y}   = this.pos;
        const scale    = this.scaleFactor;
        const rotationCorrection = -90;
        // expect degrees
        const orientation = this.vel.getOrientation();
        const rotation = rotationCorrection + orientation;
        this.svg.setAttribute(
            'transform',
            `translate( ${x}, ${y} ) rotate( ${rotation} ) scale( ${ scale } )`
        );
    }
    
    /**
     * For this game, missiles should cease to exist 
     * when they go offscreen. In this case they must 
     * call for their own destruction ...
     */
    wrap() {
        // horizontal wrap
        if( this.pos.x > WorldModel.bounds.width ) {
            if( !this.destroyCalled ) {
                GameController.destroyMissile( this );
                this.destroyCalled = true;
            }
        } else if ( this.pos.x < WorldModel.bounds.x ) {
            if( !this.destroyCalled ) {
                GameController.destroyMissile( this );
                this.destroyCalled = true;
            }
        }
        // vertical wrap
        if( this.pos.y > WorldModel.bounds.height ) {
            if( !this.destroyCalled ) {
                GameController.destroyMissile( this );
                this.destroyCalled = true;
            }
        } else if ( this.pos.y < WorldModel.bounds.y ) {
            if( !this.destroyCalled ) {
                GameController.destroyMissile( this );
                this.destroyCalled = true;
            }
        }
    }

    move( deltaTime ) {
        super.move( deltaTime );
        this.wrap();
    }

    /**
     * This sprite uses animation frames. 
     */
    renderFrame(  ) {
        // RENDER STUB
    }

    /**
     * 
     * @param { timestamp } deltaTime expected in seconds...
     */
    update( deltaTime ) {
        this.move(deltaTime);
        this.updateTransform();
        this.accumulator += deltaTime;
        while( this.accumulator >= this.fixedInterval ) {
            this.renderFrame();
            this.accumulator -= this.fixedInterval;
        }
        if( this.hitTarget() ) {
            // DESTROY MISSILE
            if( !this.destroyCalled ) {
                GameController.destroyMissile( this );
                this.destroyCalled = true;
            }
            // EXPLODE

            GameController.setFire( 
                this.target , 
                WorldModel.svg.infernoEffectTemplate
            ) ;
        }
    }

    /**
     * Let others know your sprite type ... 
     */
    getSpriteType () {
        return spriteConstants.MISSILE_TYPE;
    }

    getBoundingBox () {
        return {
            x: this.pos.x - 20,
            y: this.pos.y - 40,
            width:  40,
            height: 80,
        };
    }

    /**
     * GameController set's the launcher's current target on the 
     * missile. Think of it as a "guided missile"  ;)
     * 
     * @param {object} target  See WorldModel target list...
     */
    setTarget( target ) {
        this.target = target;
    } 
    

    /**
     * Smart sprite collision detection. Compare YOUR BB against
     * your TARGET ... 
     */
    hitTarget () {
        const myBB = this.getBoundingBox();
        const hit = collisionDetection( myBB, this.target.boundingBox );
        return hit;
    }

}


