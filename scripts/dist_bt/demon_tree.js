/**
 * USING BEHAVIOR TREES
 * 
 * Each NPC has:
 * Selector nodes = try children until one succeeds.
 * Sequence nodes = run children in order until one fails.
 * Leaf nodes = actual actions or conditions.
 * 
********************* 
COMMANDER 

Selector
 ├─ Condition: Player in sight?
 │    └─ Action: Shout insult at player
 └─ Action: Shout orders at Demon 2

 FLYER

 Selector
 ├─ Sequence: If alive & ammo > 0
 │    ├─ Action: Pick target (public works, university, etc.)
 │    ├─ Action: Fly to target
 │    └─ Action: Fire missile
 └─ Action: Evade if player is shooting
*********************
 *
 * HERE IS THE BEHAVIOR TREE CORE
 * 
 * SKELETAL BUT MEANT TO BE FLESHED OUT ... 
 * 
 */

// Behavior Tree Node statuses
export const btConstants = {
    SUCCESS : "SUCCESS",
    FAILURE: "FAILURE",
    IN_PROGRESS : "RUNNING",
    types : {
        BOMBER : "MohronSprite",
        COMMANDER: "commander in chief of demons"
    }
}


/**
 * Base Node -- the behavior tree root ... 
 * 
 */
export class BTNode {
    tick(blackboard) { 
        return btConstants.SUCCESS; 
    }
}


/**
 * Root node for a Behavior Tree.
 * Runs *all* children every tick without short-circuiting.
 * 
 * Useful for:
 *  - unconditional actions (logging, animations, bookkeeping, etc.)
 *  - running multiple independent BT branches in parallel
 * 
 * Return policy:
 *   - If ANY child returns IN_PROGRESS → Root returns IN_PROGRESS
 *   - Else if ANY child returns FAILURE → Root returns FAILURE
 *   - Else (all succeeded) → Root returns SUCCESS
 */
export class Root extends BTNode {
    constructor(children) {
        super();
        this.children = children;
    }

    tick(bb) {
        let anyRunning = false;
        let anyFailure = false;

        for (let child of this.children) {
            const status = child.tick(bb);

            if (status === btConstants.IN_PROGRESS) {
                anyRunning = true;
            } else if (status === btConstants.FAILURE) {
                anyFailure = true;
            }
        }

        if (anyRunning) return btConstants.IN_PROGRESS;
        if (anyFailure) return btConstants.FAILURE;
        return btConstants.SUCCESS;
    }
}



/**
 * Defines behavioral tree sequence ... 
 */
export class Sequence extends BTNode {

    constructor(children) {
        super();
        this.children = children;
        this.current = 0;
    }

    /**
     * Periodic function to advance state...
     * 
     * @param {Repository} bb The BT "BlackBoard" ...
     * @returns 
     */
    tick(bb) {
        while (this.current < this.children.length) {
            let status = this.children[this.current].tick(bb);
            if (status === btConstants.IN_PROGRESS || status === btConstants.FAILURE) {
                this.current = 0;
                return status;
            }
            this.current++;
        }
        this.current = 0;
        return btConstants.SUCCESS;
    }

}



class Selector extends BTNode {
    constructor( children ) {
        super();
        this.children = children;
    }
    tick(bb) {
        for (let child of this.children) {
            let status = child.tick(bb);
            if (status !== btConstants.FAILURE) {
                return status; 
            }
        }
        return btConstants.FAILURE;
    }
}

/**
 * Wrapper for conditions created  with condition factories.
 * see e.g., makeCooldownCondition ... 
 * 
 * Note: factory output MUST return  
 * 
 * btConstants.SUCCESS || btConstants.FAILURE;
 * 
 */
export class Condition extends BTNode {
    constructor(fn) {
        super();
        this.fn = fn;
    }
    tick( bb ) {
        const result = this.fn( bb );
        return result ;
    }
}


/**
 * Class *Action* is the workhorse of the behavior tree. It connects 
 * the abstract behavior tree structure and your concrete game world.
 * 
 * Defines an *Action* node on the BT -- a *kind of* BT Node. 
 * 
 * Delegates action calls to associated sprite...
 */
export class Action extends BTNode {

    /**
     * The node doesn’t implement the behavior itself. 
     * Instead, you inject a function (fn) at construction. 
     * That function defines what the action does ...
     * 
     * @param { Function } fn -- a behavior injected by ...
     */
    constructor(fn) { 
        super(); 
        this.fn = fn; 
    }

    /**
     * Overrides the `tick` method from BT base class. 
     * 
     * THIS IS WHERE YOU CALL FOR ACTIONS ON YOUR ASSOCIATED SPRITES.
     * 
     * Sprites are passed in via the black board...
     * 
     * 
     * @param { blackboard } bb The blackboard SEE GAME CONTROLLER ... 
     * @returns STATUS MESSAGE for game controller ... 
     */
    tick( bb ) { 
        return this.fn( bb ); 
    }

}

/**
 * Factory  for the missile launcher demon, Mohron Puss. 
 * 
 * The is factory returns the behavior branchs and leaves associated 
 * with the flyer demon and missile launching behaviors ... 
 * 
 * @returns The "bomber" demon BT.
 */
export function makeBomberBT() {

    const bt = new Root(
        [
            // Cooldown Period ... 
            new Condition(
                makeCooldownCondition( "launchSequence", 3 )
            ),

            new Sequence( [
                // pick target
                new Action(
                    bb => {
                        console.log( "PICK A TARGET" );
                        // exepct btConstants.SUCCESS
                        const result = bb.sprite.pickATarget();
                        return result;
                    }
                ),
                // fly to target
                new Action(
                    bb => {
                        console.log( "Fly to target" );
                        const result = bb.sprite.flyToTarget();
                        return result;
                    }
                ),
                // shout your mandate: "just kill them all"
                new Action(
                    bb => {
                        console.log( "shout" );
                        const result = bb.sprite.shout();
                        return result;
                    }
                ),
                // fire missile
                new Action(
                    bb => {
                        console.log( "fire a missle" );
                        const result = bb.sprite.launchRocket();
                        return result;
                    }
                ),
                // RESET THE SEQUENCE
                new Action(
                    bb => {
                        console.log( "RESET BEHAVIOR TREE SEQUENCE" );
                        const result = bb.sprite.resetBTSequence();
                        return result;
                    }
                ),
            ] ),
        ]
    );

    return bt;

}



// ~~~~ BT CONDITION FACTORIES ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/**
 * This factory function returns a cooldown condition for insertion
 * into a BT sequence. The cooldown specifies an interval to wait 
 * prior to executing a behavior ...  
 * 
 * The blackboard for this function will persist across ticks.
 * 
 * @param { string } key a key to retrieve the interval from the blackboard...
 * @param {number} interval in seconds...
 * @returns closure for insertion into BT
 */
function makeCooldownCondition( key, interval ) {
    return (bb) => {
        const tNow = performance.now() / 1000; // convert msec to seconds
        const tPrev = bb.cooldowns[ key ] || 0;
        if ( (tNow - tPrev) > interval ) {
            bb.cooldowns[key] = tNow;
            return btConstants.SUCCESS;
        }
        return btConstants.FAILURE;
    };
}

/**
 * This factory function returns a *variable* cooldown condition for 
 * insertion into a BT sequence. The cooldown specifies an interval 
 * of random length to wait prior to executing a behavior ...  
 * 
 * The blackboard for this function will persist across ticks.
 * 
 * @param { string } key a key to retrieve the interval from the blackboard...
 * @param {number} interval in seconds...
 * @returns closure for insertion into BT
 */
function makeRandomIntervalCooldownCondition( key, baseInterval ) {
    return (bb) => {
        if( !bb.cooldowns[ key + "_interval" ] ) {
            bb.cooldowns[key + "_interval"] = 3 + baseInterval * Math.random();
        }
        const tNow = performance.now() / 1000 ;
        const tPrev = bb.cooldowns[key] || 0 ;
        const interval = bb.cooldowns[key + "_interval"];
        if (tNow - tPrev > interval) {
            bb.cooldowns[key] = tNow;
            // reset for next cycle
            delete bb.cooldowns[key + "_interval"];
            return btConstants.SUCCESS;
        }
        return btConstants.FAILURE;
    };
}

/**
 * BT Factory function that returns a condition 
 * *closure* which can be inserted in a BT 
 * sequence to conditionalize following behaviors.
 * 
 * @param {number [0,1] } p probability
 * @returns closure for insertion into BT
 */
function makeProbabiltyCondition( p ) {
    return ( bb ) => {
        if( Math.random() < p ) {
            return btConstants.SUCCESS;
        } 
        return btConstants.FAILURE;
    };
}


const INSULT_KEY = 'insults';
const ORDER_KEY  = 'orders';

/**
 * Factory  for the Commander demon, Ronald Rump. 
 * 
 * The is factory returns the behavior branchs and leaves associated 
 * with the commander demon  ... 
 * 
 * @returns The "commander" demon BT.
 */
export function makeCommanderBT() {
    return new Selector([
        // Top priority: Insult the player...
        new Sequence([
            // cool down -- don't shout every tick
            new Condition(
                makeCooldownCondition( INSULT_KEY, 10 )
            ),
            // INSULT THE PLAYER ... 
            new Action(bb => {
                bb.sprite.shout(); // TODO: Tell it what to shout: insult or order...
                return btConstants.SUCCESS;
            })
        ]),
        // Otherwise shout orders maybe
        // new Sequence( [
        //     new Action(bb => {
        //         bb.sprite.shout("Destroy the city!"); 
        //         return btConstants.SUCCESS;
        //     })
        // ] ),
    ]);
}


  


