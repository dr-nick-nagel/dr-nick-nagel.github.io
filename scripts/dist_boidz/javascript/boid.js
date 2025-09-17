import { 
    Vector2D 
} from "./vector.js";


import { 
    Movable 
} from "./movable.js";

export class BoidSprite extends Movable {

    /**
     * Boid constructor ... 
     * @param {*} id 
     * @param {*} svg 
     * @param {*} p 
     * @param {*} v 
     * @param {*} a 
     * @param {*} r 
     * @param {*} s 
     * @param {GameController} gc reference to the GameController 
     *   (injected by the factory)
     */
    constructor (id, svg, p, v, a, r, s, gc ) {
        super( p, v, a );
        this.rotation = r;
        this.scale    = s;
        this.id  = id;
        this.svg = svg; 
        this.gc = gc;
    } 

    destroy () {

    }


    updateTransform (  ) {
        const { x, y } = this.pos;
        const rotation = this.rotation;
        const scale    = this.scale;
        this.svg.setAttribute(
            'transform',
            `translate( ${x} ${y} ) rotate( ${rotation} ) scale( ${scale.xAxis} ${scale.yAxis} )`
        );
    }


    update ( deltaTime ) {
        // apply boid rules which all update your velocity ... 
        this.applyBoidRules();
        super.move( deltaTime );
        this.turnabout();
        this.limitSpeed();
        this.rotation = Math.atan2(this.vel.y, this.vel.x) * 180 / Math.PI;
        this.updateTransform();

    }

    limitSpeed() {
        const limits = this.params.speedLimits;
        const mySpeed = this.vel.length();
        if( mySpeed > limits.MAX ) {
            this.vel.x = this.vel.x / mySpeed * limits.MAX;
            this.vel.y = this.vel.y / mySpeed * limits.MAX;
        } else if ( mySpeed < limits.MIN ) {
            if (mySpeed > 0) {
                this.vel.x = (this.vel.x / mySpeed) * limits.MIN;
                this.vel.y = (this.vel.y / mySpeed) * limits.MIN;
            } else {
                // kick it off in a small random direction if speed == 0
                this.vel.x = limits.MIN * (Math.random() * 2 - 1);
                this.vel.y = limits.MIN * (Math.random() * 2 - 1);
            }
        }
    }

    /**
     * Standard wrapping for sprites. 
     */
    wrap() {
        if( ! this.worldModel ) {
            return;
        }
        const x = this.worldModel.bounds.x;
        const y = this.worldModel.bounds.y;
        const width = this.worldModel.bounds.width;
        const height = this.worldModel.bounds.height;
        // horizontal wrap
        if( this.pos.x > width ) {
            this.pos.x = x ;
        } else if ( this.pos.x < x ) {
            this.pos.x = width;
        }
        // vertical wrap
        if( this.pos.y > height ) {
            this.pos.y = y;
        } else if ( this.pos.y < y ) {
            this.pos.y = height;
        }
    }


    /**
     * Turnabout at boundaries ... 
     */
    turnabout() {
        if( ! this.worldModel ) {
            return;
        }
        const x = this.worldModel.bounds.x + 50;
        const y = this.worldModel.bounds.y + 50;
        const width = this.worldModel.bounds.width -50;
        const height = this.worldModel.bounds.height -50;
        const turnfactor = this.params.TURNING_FACTOR;
        // horizontal turns
        if( this.pos.x > width ) {
            this.vel.x -= turnfactor;
        } else if ( this.pos.x < x ) {
            this.vel.x += turnfactor;
        }
        // vertical turns
        if( this.pos.y > height ) {
            this.vel.y -= turnfactor;
        } else if ( this.pos.y < y ) {
            this.vel.y += turnfactor;
        }
    }

    /**
     * The app can inject this Boid's group
     * 
     * @param { array like structure } group the collection of organisms 
     * of which this boid is a part ...
     * 
     */
    setCollection( group ) {
        this.group = group;
    }


    /**
     * Should be injected by app ... 
     * 
     * @param { object } wm The world model
     */
    setWorldModel( wm ) {
        this.worldModel = wm;
    }

    setTunableParameters ( params ) {
        this.params = params;
    }

    setLeader( bool ) {
        this.leader = bool;
    }

    isLeader() {
        return this.leader;
    }
    

    /**
     * This is the heart of the boid. Da rools is as follows:
     * 
     * 1. separate: get away from me! protected range 
     * 2. align: steer in the same direction as others in "visible range"
     * 3. cohere: steer toward the CENTER of boids in range 
     *    (i.e., in your sphere of influence...)
     */
    applyBoidRules() {
        const params = this.params;
        const grp = this.group;
        const myPosition = this.pos;
    
        // Accumulators for all three rules
        let sepX = 0, sepY = 0;
        let vXsum = 0, vYsum = 0, alignCount = 0;
        let pXsum = 0, pYsum = 0, cohereCount = 0;

        // Leader bias accumulators
        let leaderVelX = 0, leaderVelY = 0, leaderCount = 0;

        for (let i = 0; i < grp.length; i++) {
            const other = grp[i];
            if (other === this) continue;
    
            const d = myPosition.getDistance(other.pos);
    
            // Separation
            if (d < params.SEPARATION_RADIUS) {
                sepX += myPosition.x - other.pos.x;
                sepY += myPosition.y - other.pos.y;
            }
    
            // Alignment
            if (d < params.ALIGNMENT_RADIUS) {
                vXsum += other.vel.x;
                vYsum += other.vel.y;
                alignCount++;
            }
    
            // Cohesion
            if (d < params.COHERENCE_RADIUS) {
                pXsum += other.pos.x;
                pYsum += other.pos.y;
                cohereCount++;
            }

            // Leader bias
            if (other.isLeader) {
                leaderVelX += other.vel.x;
                leaderVelY += other.vel.y;
                leaderCount++;
            }

        }
    
        // Apply separation
        this.vel.x += sepX * params.AVOIDANCE;
        this.vel.y += sepY * params.AVOIDANCE;
    
        // Apply alignment
        if (alignCount > 0) {
            const vXavg = vXsum / alignCount;
            const vYavg = vYsum / alignCount;
            this.vel.x += (vXavg - this.vel.x) * params.ALIGNMENT;
            this.vel.y += (vYavg - this.vel.y) * params.ALIGNMENT;
        }
    
        // Apply cohesion
        if (cohereCount > 0) {
            const cx = pXsum / cohereCount;
            const cy = pYsum / cohereCount;
            this.vel.x += (cx - this.pos.x) * params.COHESION;
            this.vel.y += (cy - this.pos.y) * params.COHESION;
        }

        // Apply leader bias at the end
        if (leaderCount > 0) {
            const lXavg = leaderVelX / leaderCount;
            const lYavg = leaderVelY / leaderCount;
            this.vel.x += (lXavg - this.vel.x) * params.LEADER_BIAS;
            this.vel.y += (lYavg - this.vel.y) * params.LEADER_BIAS;
        }

    }
    
    /**
     * Origininal implementation (sub-optimal performance)
     * retained for pedagogical purps and side-by-side performance
     * improvement demos ...
     */
    applyBoidRulesV0() {
        this.separate();
        this.align();
        this.cohere();
    }


    /**
     * Separation RULE:
     * 
     * for everyone else in the group: 
     *   if they are within circle of influence,
     *   if they are too close, move to distance oneself ...
     */
    separate() {
        const avoidance = this.params.AVOIDANCE;
        const radius    = this.params.SEPARATION_RADIUS;
        const grp       = this.group;
        const myPosition = this.pos;
        let sepX = 0;
        let sepY = 0;

        for (let i = 0; i < grp.length; i++) {
            const other = grp[i];
            if (other != this) {
                const otherPosition = other.pos;
                const d = myPosition.getDistance( otherPosition ); 
                if ( d < radius ) {
                    sepX += myPosition.x - otherPosition.x;
                    sepY += myPosition.y - otherPosition.y;
                } 
            }
        } 

        this.vel.x += sepX * avoidance;
        this.vel.y += sepY * avoidance;
    }

    /**
     * Alignment RULE:
     * 
     * for everyone else in the group: 
     *   if they are within circle of influence,
     *   if steer in same direction ...
     */
    align() {
        const vMatchFactor = this.params.ALIGNMENT;
        const radius       = this.params.ALIGNMENT_RADIUS;
        const grp = this.group;
        const myPosition = this.pos;
        let vXavg     = 0;
        let vYavg     = 0;
        let neighbors = 0;
        for (let i = 0; i < grp.length; i++) {
            const other = grp[i];
            if (other != this) {
                const otherVelocity = other.vel;
                const d = myPosition.getDistance( other.pos ); 
                if ( d < radius ) {
                    vXavg += otherVelocity.x;
                    vYavg += otherVelocity.y;
                    neighbors += 1;
                } 
            }
        } 
        if ( neighbors > 0 ) {
            vXavg = vXavg / neighbors;
            vYavg = vYavg / neighbors;
            this.vel.x += ( vXavg - this.vel.x ) * vMatchFactor;
            this.vel.y += ( vYavg - this.vel.y ) * vMatchFactor;
        }
    }


    /**
     * Coherence  RULE:
     * 
     * steer gently toward center of mass for boids in range ...
     */
    cohere() {
        const coherenceFactor = this.params.COHESION;
        const radius          = this.params.COHERENCE_RADIUS;
        const grp = this.group;
        const myPosition = this.pos;
        let pXavg     = 0;
        let pYavg     = 0;
        let neighbors = 0;
        for (let i = 0; i < grp.length; i++) {
            const other = grp[i];
            if (other != this) {
                const otherPosition = other.pos;
                const d = myPosition.getDistance( otherPosition ); 
                if ( d < radius ) {
                    pXavg += otherPosition.x;
                    pYavg += otherPosition.y;
                    neighbors += 1;
                } 
            }
        } 
        if ( neighbors > 0 ) {
            pXavg = pXavg / neighbors;
            pYavg = pYavg / neighbors;
            this.vel.x += ( pXavg - this.pos.x ) * coherenceFactor;
            this.vel.y += ( pYavg - this.pos.y ) * coherenceFactor;
        }
    }

}


export const tunableParamDefaults = {
    AVOIDANCE: 0.05,
    ALIGNMENT: 0.05,
    COHESION:  0.0005,
    SEPARATION_RADIUS: 8,
    ALIGNMENT_RADIUS: 40,
    COHERENCE_RADIUS: 40,
    TURNING_FACTOR: 0.2, 
    LEADER_BIAS : 0.01,
    speedLimits : {
        MAX: 40,
        MIN: 0,
    }
};


/**
 * DEFINES THE FORMAT FOR INITIALIZATION OPTIONS 
 * FOR THE BOIDS ...
 */
const initializationOptions = {
    id :   "tbd",
    svg :  null,
    position :     Vector2D.fromCartesian( 0, 0 ),
    velocity :     Vector2D.fromCartesian( 0, 0 ),
    acceleration : Vector2D.fromCartesian( 0, 0 ),
    rotation  : 0,
    scale : { xAxis: 1, yAxis: 1 },

}

/**
 * Extension of the  BoidSprite to use Wasp SVG
 * Wasp SVG requires special treatment of the SVG presentation:
 * it has to be shown clamped to particular angle ranges and
 * mirrored across the Y axis when oriented to face left... 
 */
export class WaspBoid extends BoidSprite {

    constructor (id, svg, p, v, a, r, s, gc ) {
        super( id, svg, p, v, a, r, s, gc );
    } 

    /**
     * Override of the parent UpdateTransform method.
     * 
     * IMPORTANT NOTES: 
     * 
     * 1. The sprite *model* has velocity and rotation which are related
     *    to orientation. 
     * 
     * 2. That said, the sprite's orientation as rendered in SVG should be
     *    treated *independently* of velocity direction.
     * 
     * 3. Given these needs, WaspBoid introduces *spriteOrientation* to the model.
     *    `spriteOrienation` is the model param that determines the SVG sprite's rotation
     *    for presentation.
     * 
     * 4. The orientation is a *scalar* property in *degrees of angular rotation*. It should be 
     *    normalized to range = [0, 360].
     * 
     * Important *this.spriteOriention* is *not* the same as this.rotation as used in the 
     * base class BoidSprite. `this.rotation` is used in the boid bevior methods.  MESS 
     * WITH IT AT YOUR OWN RISK. Instead, this.spriteOrientation is provided for 
     * *presentation logic* which is the responsibility of `update transform`.  
     * 
     * SpriteOrientation is designed for positive Y facing "down" with clockwise 
     * rotation (which is how SVG transforms rotate). 
     * 
     * `update transform` 
     * 
     * 1. obtains position coords, 
     * 2. obtains spriteOrientation (using current rotation)
     * 3. Enforces constraints on SVG rotation and scaling.
     *    A. Sprite is constrained to face RIGHT or face LEFT reflecting velocity direction
     *    B. Left face is achieved by *reflecting about the Y axis* (i.e., -1 * y-axis scale)
     * 
     * BOTTOM LINE: THE SPRITE ORIENTATION ACCESSORS ARE INTENDED AND DESIGNED TO ENFORCE 
     * A NORMALIZED ANGLE FROM 0 TO 360 DEGREES. THE updateTransform LOGIC ASSUMES THE
     * rotation FROM THE STEERING LOGIC IS CORRECTED FOR POSITIVE Y DOWN. THEREFORE 
     * LOGIC IS BASED ON A 360 DEGREE CIRCLE WITH CLOCKWISE ROTATION...
     */
    updateTransform () {
        const { x, y } = this.pos;
        const rotation = this.rotation;
        this.setOrientation( rotation ); 
        let orientation = this.getOrientation();
        let {xAxis, yAxis} = this.scale;
        // enforce orientation constrains: clamp to range limits if outside 
        // acceptable rotation boundaries (keep sprites from flying upside down...) 
        if( orientation > 30 && orientation <= 90 ) {
            orientation = 30;
        } else if( orientation > 90 && orientation <= 150 ) {
            orientation = 150;
        } else if( orientation > 180 && orientation <= 270 ) {
            orientation = 180;
        } else if( orientation > 270 && orientation <= 360 ) {
            orientation = 0;
        }
        // Mirror the sprite to face left or right depending on velocity direction 
        if ( orientation > 90 && orientation < 270 ) {
            yAxis = -1 * yAxis;
        } 
        // update the transform ( view update ... )
        this.svg.setAttribute(
            'transform',
            `translate( ${x} ${y} ) rotate( ${orientation} ) scale( ${xAxis} ${yAxis} )`
        );
    }


    /**
     * Mutator for spriteOrientation. Notice how we  normalize orientation
     * to range [0, 360).
     * 
     * @param {number} degrees angular rotation in degrees
     */
    setOrientation( degrees ) {
        // normalize the angle 
        const angle = ( degrees % 360 + 360 ) % 360;
        this.spriteOrientation = angle;
    }

    
    getOrientation(  ) {
        return this.spriteOrientation;
    }

}

