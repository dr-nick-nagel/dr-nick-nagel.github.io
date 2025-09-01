import {
    Vector2D,
    Moveable,
    WorldModel
} from "./game_state.js"

import {
    collisionDetection
} from "./game_controller.js"

import {
    btConstants
} from "./behavior_tree.js"

import { 
    particleSystem 
} from "./particle_system.js";


export const tankConstants = {
    btState: {
        IDLE: "idle",

        SEEK: "tbd",

        TARGET: "target",
        DESTROY: "destroy",
    },

    seekStates : { 
        PRE_FLIGHT: 0,
        IN_FLIGHT:  1,
        ARRIVED  :  2
    },
};


export class TankSprite extends Moveable {

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
        this.target = { x:255, y: 110 };

        this.wayPoints = [
            //{ x: 50, y: 25 },
            { x: 15, y: 113 },
            { x: 47, y: 164 },
            { x: 170, y: 165 },
        ];
        this.currentWayPoint = 0;
        this.seekState = tankConstants.seekStates.PRE_FLIGHT;
        this._rotationCorrection = 90;
        // view bounding boxes at dev time ... 
        // this.addBBoxes();
    }

    updateTransform(  ) {
        const {x, y}   = this.pos;
        const scale    = this.scaleFactor;
        const orientation = this.spriteOrientation;
        // UPDATE THE TANK TRANSORM ... 
        let transvalue = "";
        transvalue += `translate( ${x}, ${y} ) `;
        transvalue += `rotate( ${ this._rotationCorrection + this.vel.getOrientation() } ) `;
        transvalue += `scale( ${scale} )`;
        this.svg.setAttribute( 'transform', transvalue );
        // ROTATE THE GUN TURRET
        const turret = this.svg.querySelector( "#gun_turret" );
        turret.setAttribute( "transform", `rotate( ${orientation} )` );
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

    /**
     * This sprite uses animation frames. 
     */
    renderFrame(  ) {
        // RENDER STUB
    }

    setMissleSvg( missleSvg ) {
        this.missileSvg = missleSvg;
    }

    setSmokeSvg( smokeSvg ) {
        this.smokeSvg = smokeSvg;
    }


    /**
     * Mutator for sprite orientation. For the tank, spriteOrientation is used 
     * to rotate the gun turret. 
     * 
     * @param {number} degrees angular measure
     */
    setOrientation( degrees ) {
        const newAngle = degrees;
        this.spriteOrientation = newAngle;
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
    fire() {
        let explosion = document.getElementById("cannon_explosion");
        let explosion2 = document.getElementById("wall_explosion");

        const rooftop_1 = document.getElementById("rooftop_1");
        const rubble = document.getElementById("rubble");
        const hole = document.getElementById("hole");

        // 1. Make the explosions visible:
        explosion.setAttribute("visibility", "visible");
        explosion2.setAttribute("visibility", "visible");
    
        // 2. Trigger the animations (Important!):
        const flash = explosion.querySelector("#flash");
        const smoke1 = explosion.querySelector("#smoke1");
        const smoke2 = explosion.querySelector("#smoke2");
        const flash2 = explosion2.querySelector("#wall_flash");
        const smoke12 = explosion2.querySelector("#wall_smoke1");
        const smoke22 = explosion2.querySelector("#wall_smoke2");

    
        flash.querySelectorAll("animate").forEach(anim => anim.beginElement());
        smoke1.querySelectorAll("animate").forEach(anim => anim.beginElement());
        smoke2.querySelectorAll("animate").forEach(anim => anim.beginElement());


        setTimeout(() => {
            flash2.querySelectorAll("animate").forEach(anim => anim.beginElement());
            smoke12.querySelectorAll("animate").forEach(anim => anim.beginElement());
            smoke22.querySelectorAll("animate").forEach(anim => anim.beginElement());
        }, 90);

    
        // 3. Hide the explosion *after* the longest animation completes:
        const longestDuration = 600; // Matches the longest animation (0.6s)
        setTimeout(() => {
            explosion.setAttribute("visibility", "hidden");
        }, longestDuration);
        setTimeout(() => {
            explosion2.setAttribute("visibility", "hidden");
        }, 800);

        // 4. show destruction:
        const waitPeriod = 100; 
        setTimeout(() => {
            rooftop_1.setAttribute( "display", "none" );
            rubble.setAttribute( "display", "inline" );
            hole.setAttribute( "display", "inline" );
            particleSystem.startBurning();
            particleSystem.startEmitting();
        }, waitPeriod);

        return btConstants.SUCCESS;
    }



    /**
     * Provides a Behavior Tree type for use in GameController.
     * 
     * SEE GameController
     */
    getBtType () {
        return( btConstants.types.TANK );
    }


    /**
     * Dev time utility to see bounding box  ...
     */
    addBBoxes() {

        let myBox = { 
            x: this.pos.x - 10, 
            y: this.pos.y - 10 , 
            width: 20, 
            height: 20
        } ;
        // Create the SVG rectangle element using the SVG namespace
        const bb = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        // Set the attributes of the rectangle
        bb.setAttribute( 'x', -10 );
        bb.setAttribute( 'y', -10);
        bb.setAttribute( 'width', 20 );
        bb.setAttribute( 'height', 20 );
        bb.setAttribute( 'stroke', 'red' );
        bb.setAttribute( 'fill', 'none' );
        // this.svg.appendChild( bb );

        const gW = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        gW.setAttribute( "id", "way_points" );

        const svgRoot = document.getElementById( "svg1" );
        for( let wp of this.wayPoints ) {
            // Create the SVG rectangle element using the SVG namespace
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            // Set the attributes of the rectangle
            rect.setAttribute( 'x', wp.x - 10 );
            rect.setAttribute( 'y', wp.y - 10);
            rect.setAttribute( 'width', 20 );
            rect.setAttribute( 'height', 20 );
            rect.setAttribute( 'stroke', 'blue' );
            rect.setAttribute( 'fill', 'none' );
            gW.appendChild( rect );

            svgRoot.appendChild( rect );
        }

    }




    /**
     * 
     * @param {Vector2D} vCurrent   -- current POSITION vector
     * @param { Point } waypointCoords  -- target waypoint coordinates
     * @returns new heading vector (caller should set velocity to this)
     */
    setCourse(  waypointCoords /*vCurrent, waypointCoords*/ ) {

        const l = console.log;
        let radianStep = 0.5;

        const vPos = this.pos;

        const directionVector = Vector2D.getDifferenceVector( waypointCoords, vPos );
        const normal = Vector2D.getNormalized( directionVector );

        const { r, theta } = normal.getPolarCoords();

        l(`  POSITION:  ${ vPos.x + ", " + vPos.y }`);
        l(`  TARGET ${ waypointCoords.x + ", " + waypointCoords.y }`);
        l(`  normal to target ${ r + ", " + theta }`);

        const vVel  = this.vel;
        const velPolar  = vVel.getPolarCoords();
        l(`  velocity ${ velPolar.r + ", " + velPolar.theta }`);

        let  newTheta; 

        if ( velPolar.theta < theta ) {
            newTheta = velPolar.theta + radianStep;
        } else if ( velPolar.theta > theta ) {
            newTheta = velPolar.theta + radianStep;
        }


        let speed = 10;
        let newVelocity = Vector2D.fromPolar( speed, newTheta );

        this.vel = newVelocity;

        // return newVelocity;

        //TODO RESUME HERE --- BUG IS THIS IS A CLOSURE FIX IT.

        // normal.multiply( speed );
        // return  normal;

    }



    /**
     * Defines the seek behavior for this sprite's BEHAVIOR TREE ... 
     * 
     * 1. Adjust your velocity and accelaration to go to target 
     * 2. follow the path set out in your waypoints ... 
     * 
     */
    seek () {
        const l = console.log;
        l("SEEK");

        const seekStates = tankConstants.seekStates;
        
        // GET WAY POINT:
        const wayPoint = this.wayPoints[ this.currentWayPoint ];
        switch ( this.seekState ) {
            case seekStates.PRE_FLIGHT: 
                // SET COURSE for the first waypoint


                this.setCourse( wayPoint )

                this.seekState = tankConstants.seekStates.IN_FLIGHT;
                return btConstants.IN_PROGRESS;
            case seekStates.IN_FLIGHT: 


                // stay on track. update velocity on each tick 'till your 
                // reach the next waypoint...
                this.setCourse( wayPoint )


                // CHECK: ARE WE THERE YET?
                let myBox = { 
                    x: this.pos.x - 10, 
                    y: this.pos.y - 10 , 
                    width: 20, 
                    height: 20
                } ;
                let wayPointBox = { 
                    x: wayPoint.x - 10,
                    y: wayPoint.y - 10, 
                    width: 20, 
                    height: 20,
                } ;
                let colliding = collisionDetection( myBox, wayPointBox ); 
                /* DEV TIME CODE TO VIEW BOUNDING BOXES...*/
                const bb = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                bb.setAttribute( 'x', myBox.x );
                bb.setAttribute( 'y', myBox.y );
                bb.setAttribute( 'width', myBox.width );
                bb.setAttribute( 'height', myBox.height );
                bb.setAttribute( 'stroke', 'red' );
                bb.setAttribute( 'fill', 'none' );
                const svgRoot = document.getElementById( "svg1" );
                svgRoot.appendChild( bb );
                
                if( colliding ) {
                    // GET THE NEXT WAYPOINT
                    this.currentWayPoint ++ ;
                    if( this.currentWayPoint < this.wayPoints.length ) {
                        const nextPoint = this.wayPoints[ this.currentWayPoint ] ;


                        this.setCourse( wayPoint );


                        return btConstants.IN_PROGRESS;
                    } else {

                        // May have to hack velocity with  orientation 
                        this.vel = Vector2D.fromCartesian( 0, 0 );

                        this.seekState = tankConstants.seekStates.ARRIVED;
                        return btConstants.SUCCESS;
                    }
                }
                return btConstants.IN_PROGRESS;
            default : 
                this.seekState = tankConstants.seekStates.ARRIVED;
                return btConstants.SUCCESS;
        }
    }

    /**
     * Defines the targeting behavior for the tank's BEHAVIOR TREE
     * (namely rotates the gun turret) ...
     * 
     * @returns SUCCESS status for to advance the behavior tree traversal.
     */
    targetForDestruction() {
        // Get the normal vector to the target location
        const currentPosition = this.pos;
        const targetPosition  = this.target;
        const targetVector = Vector2D.getDifferenceVector( targetPosition, currentPosition );
        const normal = Vector2D.getNormalized( targetVector );
        // Adjust your orientation to match the normal direction ... 
        const rotation = normal.getOrientation();
        this.setOrientation( rotation ) ; 
        return btConstants.SUCCESS;
    }


    /**
     * Reset BT state variables to repeat this sequence with 
     * fresh start ... 
     */
    resetBTSequence () {
        //STUB
    }



}