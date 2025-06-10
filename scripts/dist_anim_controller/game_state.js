
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
    }

    multiply( scalar ) {
        this.x *= scalar;
        this.y *= scalar;
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
        width:  360,
        height: 700,
    },
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


/**
 * This prototype enables a walk cycle using 
 * KeyFrame animation. Key frame animation requires 
 * updates on a fixed interval.
 * 
 * See My Blog for details:
 * 
 * https://dr-nick-nagel.github.io/blog/raf-time.html
 * 
 */
export class WalkerSprite extends Moveable {

    constructor( id, p, v, a ) {
        super(p, v, a) ;
        this.svg = document.getElementById( id );
        this.id = id;
        this.currentFrame = 0;
        this.accumulator = 0;
        this.fixedInterval = 0.25;
    }

    updateTransform( scaleFactor = 1, rotation = 0 ) {

          // move the keyframe window as a loop
          // slide forward until end
          // TODO: CONSIDER GETTING THIS DYNAMICALLY OFF OF VIEWBOX
          const windowWidth   = 50; 
          const numFrames     = 8;
          let x0 = this.currentFrame * windowWidth;
          let viewBoxValue = `${x0} 0 50 50`;
          this.svg.setAttribute( "viewBox", viewBoxValue );

          if( this.currentFrame < numFrames-1 ) {
              this.currentFrame += 1;
          } else {
              this.currentFrame=0;
          }
    }

    update( deltaTime ) {
        this.accumulator += deltaTime;
        while( this.accumulator >= this.fixedInterval ) {
            this.updateTransform();
            this.accumulator -= this.fixedInterval;
        }
    }

}

/**
 * This prototype enables a billowing effect using 
 * KeyFrame animation. Key frame animation requires 
 * updates on a fixed interval.
 * 
 * See My Blog for details:
 * 
 * https://dr-nick-nagel.github.io/blog/raf-time.html
 * 
 */
export class BillowSprite extends Moveable {

    constructor( id, p, v, a ) {
        super(p, v, a) ;
        this.svg = document.getElementById( id );
        this.id = id;
        this.currentFrame = 0;
        this.accumulator = 0;
        this.fixedInterval = 0.1;
    }

    updateTransform( scaleFactor = 1, rotation = 0 ) {
          // TODO: NO MAGIC NUMBERS PLEASE
          // FIGURE OUT HOW TO PARAMETERIZE THESE
          const windowHeight  = 50;
          const numFrames     = 8;  
          let y0 = this.currentFrame * windowHeight;
          let viewBoxValue = `0 ${y0} 50 50`;
          this.svg.setAttribute( "viewBox", viewBoxValue );
          if( this.currentFrame < numFrames-1 ) {
              this.currentFrame += 1;
          } else {
              this.currentFrame=0;
          }
    }

    update( deltaTime ) {
        this.accumulator += deltaTime;
        while( this.accumulator >= this.fixedInterval ) {
            this.updateTransform();
            this.accumulator -= this.fixedInterval;
        }
    }

}

/**
 * This prototype enables a billowing effect using 
 * KeyFrame animation. Key frame animation requires 
 * updates on a fixed interval.
 * 
 * See My Blog for details:
 * 
 * https://dr-nick-nagel.github.io/blog/raf-time.html
 * 
 */
export class WickedSprite extends Moveable {

    constructor( id, p, v, a ) {
        super(p, v, a) ;
        this.svg = document.getElementById( id );
        this.id = id;
        this.currentFrame = 0;
        this.accumulator = 0;
        this.fixedInterval = 0.05;
        this.animFrames = document.querySelectorAll( "#cloak path" );
    }

    updateTransform( scaleFactor = 2, rotation = 0 ) {
        const scale = `scale(${scaleFactor})`;
        const {x, y}   = this.pos;
        this.svg.setAttribute(
            'transform',
            `translate( ${x}, ${y}) ${scale} rotate(${rotation} )`
        );
    }
    
    wrap() {
        const sprtGrp = document.getElementById( this.id );
        const witchBounds = sprtGrp.getBoundingClientRect();
        // horizontal wrap
        if( this.pos.x > WorldModel.bounds.width ) {
            this.pos.x = WorldModel.bounds.x ;
        } else if ( this.pos.x + witchBounds.width < WorldModel.bounds.x ) {
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
     * This sprite uses animation frames. `renderFrame` Causes
     * the current frame to display and hides the previous 
     * (all frames should be hidden except the current). The
     * sprite should have the first frame visible on 
     * initialization...
     */
    renderFrame(  ) {
        const numFrames     = 4;  
        this.animFrames[ this.currentFrame ].style.display="inline";
        // Calculate the index of the previous frame. Use modulo to handle wrap
        const previousFrameIndex = (this.currentFrame - 1 + numFrames) % numFrames;
        this.animFrames[previousFrameIndex].style.display = "none";
        // Move to the next frame
        this.currentFrame = (this.currentFrame + 1) % numFrames;
    }

    update( deltaTime ) {
        this.move(deltaTime);
        this.updateTransform();

        this.accumulator += deltaTime;
        while( this.accumulator >= this.fixedInterval ) {
            this.renderFrame();
            this.accumulator -= this.fixedInterval;
        }

    }

}

