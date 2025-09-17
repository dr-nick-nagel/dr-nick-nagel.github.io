/**
 * WorldModel
 * 
 * Artworks (e.g., games) will want a world model. Obviously part
 * the M in MVC, World Model will hold data related to the world of
 * the artwork. This Singleton object should be injected into sprites 
 * through a "setter" method and used for, e.g., bounds checking, etc.
 * 
 */
export const WorldModel = {
    bounds: { 
        x: 0, 
        y: 0,  
        width:  600,
        height: 500,
    },
}
