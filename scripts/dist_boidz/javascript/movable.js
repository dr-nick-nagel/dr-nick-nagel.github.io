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

