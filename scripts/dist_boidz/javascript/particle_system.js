import { 
    Vector2D 
} from "./vector.js";

/**
 * Get a random number somewhere around the emitter where
 * "somewhere around" is within a single dimensional range 
 * speficied by: 
 * 
 * @param {*} min the minimum
 * @param {*} max the maximum
 * 
 * @returns a random scalar within the range
 */
export function getRandInRange( min, max ) {
    min = Math.ceil(min);
    max = Math.floor(max);
    let num = Math.random() * (max - min + 1);
    num = num + min;
    return num; 
}

// TODO BLOGGIT

// Definitely this has to be a blog
// do a blog on the box-muller transform 
// to generate gaussian random samples
// USE the blood spatter and show A B 
// comparison ... 
export function getRandInGaussian( mu = 0, sigma = 1 ) {
    let u1 = Math.random();
    let u2 = Math.random();
    let z0 = Math.sqrt( -2.0 * Math.log( u1 )) * Math.cos( 2 * Math.PI * u2 );
    return z0 * sigma + mu;
}


/** 
 *   The emmiter location is hardcoded in the svg for now
 *   <g id="particles_group"  transform = "translate(250, 100)" />
 */
export const particleSystem = {

    emissionRate : 1,
    particles : [],
    particleGroup : null,
    emitting : false,
    burning :  false,
    timeAccumulator : 0,
    fixedInterval : 1/60,  // ~0.0167 sec

    /**
     * Setter should be called by host at 
     * system initialization (right after c-tor)...
     */
    setFlameEffect : function () {
        this.flameEffect = createEdgeFlame();
    },

    /**
     * Setter should be called by host at 
     * system initialization ...
     */
    setParticleGroup : function ( gRef ) {
        this.particleGroup = gRef;
    },

    startEmitting : function () {
        this.emitting = true;
    },

    stopEmitting : function () {
        this.emitting = false;
    },

    isEmitting : function () {
        return this.emitting;
    },

    isBurning : function() {
        return this.burning;
    },

    /**
     * Call render visible and animate effect 
     */
    startBurning : function() {
        this.flameEffect.setVisible( true );
        this.burning = true;
    },

    stopBurning : function() {
        this.burning = false;
        this.flameEffect.setVisible( false );
    },

    emitParticles : function () {
        for( let i = 0 ; i < this.emissionRate ; i++ ) {
            // create particle 
            const particle = createSmokeParticle(); 
            this.particles.push( particle );
            const grp = this.particleGroup;
            if ( grp.firstChild ) {
                grp.insertBefore( particle.svg, grp.firstChild );
            } else {
                grp.appendChild( particle.svg ) ;
            }
        }
    } , 

    /**
     * The update function for the particle system controller. 
     * 
     * IMPORTANT: notice that we call update on all the particles
     * using the FIXED interval for the system . 
     * 
     * That is, we get delta time (in seconds) from the animation
     * controller which is the *RAF delta*. But the system calls update
     * on particles on a *fixed interval timstep* .  So to insure speed 
     * continuity this update function passes the *fixed interval* not the
     * input deltatime ...  
     * 
     * @param {*} deltatime 
     */
    update : function ( deltatime ) {
        this.timeAccumulator += deltatime;
        while( this.timeAccumulator >= this.fixedInterval ) {
            if( this.isEmitting() ) {
                this.emitParticles();
            }
            for( let p of this.particles ) {
                p.update( this.fixedInterval ); 
            }
            if( this.isBurning ) {
                this.flameEffect.update( this.fixedInterval );
            }
            this.timeAccumulator -= this.fixedInterval
        }
    } ,

    destroyParticle : function( particle ) {
        particle.svg.remove(); 
        const index = this.particles.indexOf( particle ); 
        if( index > -1 ) {
            this.particles.splice( index, 1 );
        }
    }

};


/**
 * Particle base class. Special particles should
 * extend this class. Probably....
 */
export class Particle {

    constructor( id, svg, position, velocity, acceleration, ttl, particleSystem ) {
        this.id = id;
        this.svg = svg;
        this.pos = position;
        this.vel = velocity ;
        this.acceleration = acceleration;
        this.ttl = ttl;
        this.timeAccumulator = 0;
        this.scaleFactor = 1;
        this.particleSystem = particleSystem;
    }


    /**
     * Every particle needs to be able to move. Probably.
     * Expect deltaTime in seconds (i.e. msec / 1000)
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

    update ( interval ) {
        this.timeAccumulator += interval;
        if( this.timeAccumulator >= this.ttl ) {
            this.destroySelf();
        }
        this.move( interval );
        this.updateTransform();
    }

    updateTransform() {
        const {x, y}   = this.pos;
        const scale    = this.scaleFactor;
        // const orientation = this.spriteOrientation;

        let transvalue = "";
        transvalue += `translate( ${x}, ${y} ) `;
        transvalue += `rotate( 0 ) `;
        transvalue += `scale( ${scale} )`;
        this.svg.setAttribute( 'transform', transvalue );
    }

    setScaleFactor( factor ) {
        this.scaleFactor = factor;
    }

    destroySelf() {
        this.particleSystem.destroyParticle( this );
    } 

}

/**
 * Specific smoke effects:
 *   grow particles
 *   fade alpha
 *   increase blur
 */
class SmokeParticle extends Particle {

    constructor ( id, svg, position, velocity, acceleration, ttl, particleSystem ) {
        super ( id, svg, position, velocity, acceleration, ttl, particleSystem );
        this.fadeRate  = 0.1;
        this.alpha     = 0.5;
        this.scaleRate = 0.1;
        this.blur      = 2;
        this.blurRate  = 4;
    }

    /**
     * TODO: REVISIT move logic and sort out timing stuff .. 
     * TODO: refactor so you can call super.update. right now it calls 
     * update transform  in base class ... 
     * @param {} deltaTime 
     */
    update ( deltaTime ) {
        this.timeAccumulator += deltaTime;
        if( this.timeAccumulator >= this.ttl ) {
            this.destroySelf();
        }
        this.move( deltaTime );
        this.alpha -= this.fadeRate * deltaTime;
        this.scaleFactor = this.scaleFactor + this.scaleRate*deltaTime;
        this.blur += this.blurRate * deltaTime;
        this.updateTransform();
        this.svg.setAttribute( 'opacity', `${this.alpha}` );
        // SVG Filter approach
        // this.svg.setAttribute("filter", "url(#smokeBlur_1)");
        // CSS Filter approach Looks better but FPS greatly impacted
        this.svg.style.filter = `blur(${this.blur}px)`;
    }

}


/**
 * TO DO: Particles will have different SVG like sprites. Therefore
 * use particle factory functions (e.g., smoke, dust, stars, flames
 * bullets etc.)...
 */
let serialNo = 0;
function createSmokeParticle() {
    const serial = "p_" + serialNo++;
    const particleSvg = document.createElementNS(
        'http://www.w3.org/2000/svg', 
        'circle'
    );
    particleSvg.setAttribute( "id", serial );
    particleSvg.setAttribute( "cx", `0` );
    particleSvg.setAttribute( "cy", `0` );
    particleSvg.setAttribute( "r", `5` );
    particleSvg.setAttribute( "fill", `black` );
    particleSvg.setAttribute( "opacity", `0.8` );
    const randX = 5 * getRandInGaussian();
    const randY = 5 * getRandInGaussian();
    const randOrient = - ( Math.PI / 2 + getRandInRange( -1.5, -0.5 ) );
    let speed = 50; 
    speed = speed + getRandInGaussian();
    const p = new SmokeParticle(
        serial,
        particleSvg,
        Vector2D.fromCartesian( randX, randY ),
        Vector2D.fromPolar( speed, randOrient ),
        Vector2D.fromCartesian( 0, 0 ),
        5,  // <-- TTL in seconds
        particleSystem
    );
    return p;
}


/**
 * The FlameEffect is *like a particle* but not quite in every way
 */
class FlameEffect {
    
    constructor() {
        this.id="hole_flame_obj";
        this.svg        = document.getElementById('hole_edge_flame');
        this.turbulence = document.getElementById('feTurbulence41');
        this.startTime = performance.now();
        this.animationSpeed = 0.5;
        this.timeAccumulator = 0;
        this.flickerInterval = 0.067;
    }

    /**
     * Like particles (and c.f., sprites) FlameEffect has an update function.
     * FlameEffect.update is tied to the particle system update interval.
     * 
     * trying an accumulator pattern to slow flicker rate.
     * 
     * @param {scalar} interval the *interval* since the last update.
     */
    update ( interval ) {
        this.timeAccumulator += interval;
        while( this.timeAccumulator >= this.flickerInterval ) {
            const speed = this.animationSpeed;
            const t0 = this.startTime;
            const t = performance.now();
            const elapsedTime = t - t0;
            this.turbulence.setAttribute( "seed", elapsedTime * speed );
            this.timeAccumulator -= this.flickerInterval;
        }
    }

    /**
     * Toggle effect visibility 
     * @param {boolean} bool 
     */
    setVisible( bool ) {
        if(bool) {
            this.svg.setAttribute("display", "inline");
        } else {
            this.svg.setAttribute("display", "none");
        }
        
    }

}

function createEdgeFlame() {
    const feObj = new FlameEffect();
    return feObj;
}
