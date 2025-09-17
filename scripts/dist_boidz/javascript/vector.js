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
        return "[ " + this.x.toFixed(3) + ", " + this.y.toFixed(3) + " ]";
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

