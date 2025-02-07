
class Vector2D {

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

/**
 * Utiliy function to see bounding boxes ... 
 * 
 * @param {*} svg 
 * @param {*} x 
 * @param {*} y 
 * @param {*} width 
 * @param {*} height 
 * @param {*} strokeColor 
 * @param {*} strokeWidth 
 * @param {*} fillColor 
 * @returns the created rectangle element
 */
function drawBoundingBox( svg, x, y, width, height, strokeColor = "red", strokeWidth = 1, fillColor = "transparent") {
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", x);
    rect.setAttribute("y", y);
    rect.setAttribute("width", width);
    rect.setAttribute("height", height);
    rect.setAttribute("stroke", strokeColor);
    rect.setAttribute("stroke-width", strokeWidth);
    rect.setAttribute("fill", fillColor);
    svg.appendChild(rect);
    return rect;  
}

/**
 * Utility to draw a box on an SVG given coords and dims as a plain JS 
 * rectangle object {x, y, width, height} ...
 * 
 * @param {*} rectangle 
 * @param {*} strokeColor 
 * @param {*} strokeWidth 
 * @param {*} fillColor 
 * @returns the created rectangle element that was inserted on SVG
 */
function drawBox( svg, rectangle, strokeColor = "red", strokeWidth = 1, fillColor = "transparent") {
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", rectangle.left);
    rect.setAttribute("y", rectangle.top);
    rect.setAttribute("width", rectangle.width);
    rect.setAttribute("height", rectangle.height);
    rect.setAttribute("stroke", strokeColor);
    rect.setAttribute("stroke-width", strokeWidth);
    rect.setAttribute("fill", fillColor);
    svg.appendChild(rect);
    return rect;  
}

/**
 * Gives you the transformed element bounding box dimensions in the 
 * form  {x, y, width, height} given a handle to an SVG Element...
 * 
 * @param { SVGElement } svgElem 
 * @returns A plain javascript object with transformed box dims
 */
function getTransformedBBox( svgElem ) {
    const localBox = svgElem.getBBox();
    const txMatrix = svgElem.getCTM();
    const point = svgElem.ownerSVGElement.createSVGPoint();
    point.x=localBox.x;
    point.y=localBox.y;
    const transPoint = point.matrixTransform( txMatrix );
    // apply scale in x
    const transWidth  = localBox.width * txMatrix.a;
    // apply scael in y
    const transHeight = localBox.height * txMatrix.d;
    const box = {
        left: transPoint.x,
        top:  transPoint.y,
        width:  transWidth,
        height: transHeight
    };
    return box;
}


function intersection( obj1, obj2 ) {
    const bounds1 = getTransformedBBox( obj1 ); 
    const bounds2 = getTransformedBBox( obj2 );
    const test = (
        bounds1.left < bounds2.left + bounds2.width &&
        bounds1.left + bounds1.width > bounds2.left &&
        bounds1.top < bounds2.top + bounds2.height &&
        bounds1.top + bounds1.height > bounds2.top
    );
    return test;
}



class Movable {
    constructor(svg_id, x, y, vx = 0, vy = 0, ax = 0, ay = 0) {
        this.id = svg_id;
        this.svg_group = document.getElementById( svg_id );
        this.px = x;
        this.py = y;
        this.vx = vx;
        this.vy = vy;
        this.ax = ax;
        this.ay = ay;
        this.box_node = null;
        this.isColliding = false;
    }

    move(deltaTime) {
        // Update velocity based on acceleration
        this.vx += this.ax * deltaTime;
        this.vy += this.ay * deltaTime;

        // Update position based on velocity
        this.px += this.vx * deltaTime;
        this.py += this.vy * deltaTime;
    }

    render() {
        this.svg_group.setAttribute( 
            'transform',
            `translate( ${this.px}, ${this.py} )`
        );
        
        // scaffolding for dev time testing...
        // REMOVE ME POST DEV TIME TESTS
        // this.renderBoundingBox();

     }

    getBoundingBox() {
        return getTransformedBBox( this.svg_group ) ;
    }

    renderBoundingBox() {
        if( this.box_node && typeof this.box_node.remove === 'function' ) {
            this.box_node.remove();
        }
        const bb = this.getBoundingBox();
        this.box_node = drawBox( this.svg_group.ownerSVGElement, bb );
    }

    handleCollision() {
        // Just a stub for now...
    }

}



class TargetSprite extends Movable {

    constructor( svg_id, x, y, vx = 0, vy = 0, ax = 0, ay = 0 ) {
        super( svg_id, x, y, vx, vy, ax, ay );
        // What else does a toy soldier need?
    }

    /**
     * Override render for soldier
     */
    render() {

        // this.renderBoundingBox();
    }

    handleCollision() {
        // TODO: HANDLE COLLISION...
        this.rotateSoldier( 90 );
    }

    // DOCUMENT AND BLOG
    // https://chatgpt.com/c/67a4f220-4f20-8010-9806-a5bfb273f889
    rotateSoldier( angle ) {

        // Get current transformation matrix
        let matrix = this.svg_group.transform.baseVal.consolidate()?.matrix;
        if (!matrix) {
            console.error( "[SOLDIER SPRITE] Unable to retrieve svg matrix" );
            return;
        }

        // Get bounding box
        let bbox = this.getBoundingBox();
        // New basis for rotation
        let cx = bbox.left + bbox.width / 2;  
        let cy = bbox.top + bbox.height;

        // Convert angle to radians
        let radians = (angle * Math.PI) / 180;
    
        // Create transformation matrices
        let translateToOrigin = this.svg_group.ownerSVGElement.createSVGMatrix().translate(-cx, -cy);
        let rotateMatrix = this.svg_group.ownerSVGElement.createSVGMatrix().rotate(angle);
        let translateBack = this.svg_group.ownerSVGElement.createSVGMatrix().translate(cx, cy);
    
        // Combine transformations: T_back * R * T_origin * OldMatrix
        let newMatrix = translateBack.multiply(rotateMatrix).multiply(translateToOrigin).multiply(matrix);
    
        // Apply the new matrix
        let transformList = this.svg_group.transform.baseVal;
        let newTransform = this.svg_group.ownerSVGElement.createSVGTransform();
        newTransform.setMatrix(newMatrix);
        transformList.initialize(newTransform);
    }
}

// ----  Animation Controller  ------------------------
const movables = []; // Array to hold moving objects
let previousTimestamp = 0;
let rafId = 0;

const activeCollisions = new Set();

function animationLoop( timestamp ) {
    displayFrameRate( timestamp );
    // Convert ms to seconds (divide by 1000)
    const deltaTime = (timestamp - previousTimestamp) / 1000; 
    // Update all entities
    movables.forEach(
        movable => movable.move( deltaTime )
    );
    checkCollisions();
    cleanupCollisions();
    movables.forEach(
        movable => movable.render()
    );
    previousTimestamp = timestamp;
    rafId = requestAnimationFrame( animationLoop );
}

const startAnimation = () => {
    rafId = requestAnimationFrame(animationLoop);
    previousTimestamp = performance.now();
}

const stopAnimation = () => {
    cancelAnimationFrame( rafId );
}

const displayFrameRate = ( timestamp ) => {
    let frame_rate = 1000 / (timestamp - previousTimestamp);
    frame_rate = Math.round( frame_rate );
    frame_rate_span.innerHTML = `Frame Rate: ${frame_rate} (Interval: ${Math.round(timestamp - previousTimestamp)})`;
}

/**
 * Checks for collisions among sprites...
 */
const checkCollisions = () => {
    // NOTE: This controller has access to a list of "movebles" 
    // (i.e., objects of type movable). The bounds checking is 
    // performed against the SVG element referenced on the moveable
    // object...
    for ( let i=0; i < movables.length; i++ ) {
        for ( let j=i+1; j < movables.length; j++ ) {
            if( intersection( movables[i].svg_group, movables[j].svg_group ) ) {
                //   DEFINE HANDLING COLLISION ON RESPECTIVE MOVABLES...
                handleCollision( movables[i], movables[j] );
            }
        }
    }
}

/**
 * Function for handling collisions. Controller coordinates colliding
 * objects then delegates details of the collision to the objects 
 * themselves who "know how to collide with one another...".
 * 
 * Notice the mechanisms implemented to handle the collision exactly once:
 * 
 * 1. A SET is used to load colliding instance and check each frame
 *    so that handlers don't get called repeatedly, and
 * 
 * 2. Relevant objects in colliding state are tagged with a boolean 
 *    marker...
 *  
 * @param {*} mObj1 
 * @param {*} mObj2 
 */
const handleCollision = ( mObj1, mObj2 ) => {
    const key = `${mObj1.id}-${mObj2.id}`;
    if ( !activeCollisions.has(key) ) {
        nlg(`Handling collision ONCE between ${mObj1.id} and ${mObj2.id}`);
        activeCollisions.add( key );
        mObj1.isColliding = true;
        mObj2.isColliding = true;
        mObj1.handleCollision( mObj2 );
        mObj2.handleCollision( mObj1 );
    }
}

/**
 * Clean up as objects exit colliding state...
 */
const cleanupCollisions = () => {
    activeCollisions.forEach(key => {
        const [id1, id2] = key.split('-');
        const obj1 = movables.find(m => m.id === id1);
        const obj2 = movables.find(m => m.id === id2);

        // If objects no longer overlap, remove from activeCollisions
        if (!intersection(obj1.svg_group, obj2.svg_group)) {
            activeCollisions.delete(key);
            obj1.isColliding = false;
            obj2.isColliding = false;

            nlg( "Collision over" );
        }
    });
};

const reset = () => {
    const tfx = document.getElementById('vx');
    const tfy = document.getElementById('vy');
    stopAnimation();
    const CBID = "cannon_ball_1";
    const shot = movables.find(m => m.id === CBID);
    shot.px = 72;
    shot.py = 168;
    shot.vx = Number(tfx.value) ;
    // Limit vx to three hundred just to make it interesting...
    if( shot.vx > 300 ) {
        shot.vx = 300;
        tfx.value = 300;
    }
    shot.vy=  Number( tfy.value );
    shot.ax = -5;
    shot.ay = 20;
    shot.render();
    nlg( `New Velocity ${shot.vx}, ${shot.vy}` );
}


/**
 * Use fetch (built in to browsers) to load SVG...
 */
async function loadSVG(url, targetElementId) {
    let loadedSVG = null;

    try {
        // Fetch the SVG document as text
        const response = await fetch( url );
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const svgText = await response.text();

        // Parse the fetched SVG text into a DOM element
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
        loadedSVG = svgDoc.documentElement;

        // Find the placeholder SVG node and replace it
        const targetElement = document.getElementById(targetElementId);
        if (targetElement && targetElement.tagName.toLowerCase() === 'svg') {
            targetElement.replaceWith(loadedSVG); // Swap the nodes
        } else {
            console.error(`Target element with ID "${targetElementId}" is not a valid <svg> node.`);
        }
    } catch (error) {
        console.error(`Error loading SVG from ${url}:`, error);
    }

    return loadedSVG;
}

/**
 * Last minute effect using SVG animation to fire the gun!
 *
 */
function fireCannon() {
    let explosion = document.getElementById("cannon_explosion");

    // 1. Make the explosion visible:
    explosion.setAttribute("visibility", "visible");

    // 2. Trigger the animations (Important!):
    const flash = explosion.querySelector("#flash");
    const smoke1 = explosion.querySelector("#smoke1");
    const smoke2 = explosion.querySelector("#smoke2");

    flash.querySelectorAll("animate").forEach(anim => anim.beginElement());
    smoke1.querySelectorAll("animate").forEach(anim => anim.beginElement());
    smoke2.querySelectorAll("animate").forEach(anim => anim.beginElement());


    // 3. Hide the explosion *after* the longest animation completes:
    const longestDuration = 600; // Matches the longest animation (0.6s)
    setTimeout(() => {
        explosion.setAttribute("visibility", "hidden");
    }, longestDuration);
}


// ---- GLOBALS ------------
nlg = console.log;
const BOUNDS = {
    left:   0, 
    top:    0, 
    width:  0, 
    height: 0
}

let frame_rate_span = null;

// ---- SCRIPT EVENT HANDLERS ----------------

const initHandlers = () => {
    const mouse_span = document.getElementById('mouse_coords');
    const viewport = document.getElementById( "svg1" );

    viewport.addEventListener(
        'mousemove', 
        (evt) => {
            //const svg = viewport.querySelector('svg'); 
            const p = viewport.createSVGPoint(); 
            p.x = evt.clientX;
            p.y = evt.clientY;
            const matrix = viewport.getScreenCTM().inverse();
            const cursor =  p.matrixTransform(matrix);
            mouse_span.innerText = `mouse x=${cursor.x.toFixed(0)}, y=${cursor.y.toFixed(0)}`;
      });
      
    const button_start = document.getElementById( 'start_anim' );
    button_start.addEventListener(
        'click',
        () => {
            startAnimation();
            fireCannon();
        }
    );

    const button_stop  = document.getElementById( 'stop_anim' );
    button_stop.addEventListener(
        'click',
        stopAnimation
    );

    const button_reset  = document.getElementById( 'reset_anim' );
    button_reset.addEventListener(
        'click',
        reset
    );

    frame_rate_span = document.getElementById( 'frame_rate' );
};

// scaffolding to figure out some vectors...
// const INIT_COORDS =  Vector2D.fromPolar( 200, Math.PI/12);
// nlg( INIT_COORDS );

document.addEventListener( 
    "DOMContentLoaded",
    async () => {
        // load DEMO SVG 
        const SVG_URL = "/svg/trajectory_3.svg";
        const TARGET_SVG_REPLACE_NODE_ID = "viewport";
        const spritesSvg = await loadSVG(
            SVG_URL,
            TARGET_SVG_REPLACE_NODE_ID
        );
        // EMBEDDED SVG DOCUMENT SHOULD BE THE SINGLE
        // SOURCE OF TRUTH FOR viewport dimensions...
        // get bounds...
        BOUNDS.height = spritesSvg.getAttribute( "height" );
        BOUNDS.width  = spritesSvg.getAttribute( "width" );

        // create movables...
        // ----    CANNON INFO    ----------------------------
        const CANNON_ID = "nn_cannon_1";
        const CANNON_G  = spritesSvg.getElementById( CANNON_ID );
        const CANNON_BBOX = getTransformedBBox ( CANNON_G ) ;
        // const CBOX = drawBox( spritesSvg, CANNON_BBOX ) ; 

        // ----  CANNON BALL INFO ----------------------------
        const CBID = "cannon_ball_1";
        const BALL_G = spritesSvg.getElementById( CBID );

        // ----  TARGET ----------------------------
        const TARGET_ID = "nn_target_1";
        const TARGET_GROUP = spritesSvg.getElementById( TARGET_ID );
        const TARGET_BBOX  = getTransformedBBox(TARGET_GROUP);
        // const TEST_DRAW = drawBox( spritesSvg, TARGET_BBOX) ; 
        const movableTarget = new TargetSprite( TARGET_ID, TARGET_BBOX.left, TARGET_BBOX.top );
        movables.push( movableTarget );
       
        // HARDCODED FOR DEMO. 
        const init_x = 72;
        const init_y = 168; 
        const moveableCannonBall = new Movable( CBID, init_x, init_y );
        // moveableCannonBall.vx=300;
        // moveableCannonBall.vy=-20;
        moveableCannonBall.vx=193;
        moveableCannonBall.vy=-52;
        moveableCannonBall.ax = -5;
        moveableCannonBall.ay = 20;
        movables.push( moveableCannonBall );
        moveableCannonBall.render();
        const BALL_BB  = getTransformedBBox( BALL_G );
        nlg( "____\nInitialized" );
        nlg(`NUM MOVABLES: ${movables.length}`);
        initHandlers();
    }

);




