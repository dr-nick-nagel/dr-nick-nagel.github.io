/**
 * World Model module for isometric game. WorldModel holds
 * information related to world state such as tile width / height
 * 2:1 and functions mapping SVG coordinates to and from isometric
 * tiles comprising the "terra firma".
 * 
 * Note: mapping functions assume a 45 degree right rotation of 
 * cartesian coords and 2:1 width to hight (for 45 degree 'depth"
 * rotation) ... 
 */
export const WorldModel = {

    svgWorldCoordsOrigin: {x:0, y:0},
    
    tileWidth:  100,
    tileHeight: 50,

    gameState: {
        t0: 0,  // <--| in seconds
        accumulatedTime: 0,   // <--| in seconds
        accumulatedWealth: 3, // <--| in coins of the realm ...
    },

    /**
     * Get SVG coords given grid coords. isometric map assumes a 
     * 45 degree rightward rotation of cartesian axes and 2:1 
     * tile width to height ... 
     * 
     * @param {number} i th column
     * @param {number} j th row
     */
    isometricMap: function( i, j ) {
        const svgX =  ( i - j ) * this.tileWidth  / 2;
        const svgY =  ( i + j ) * this.tileHeight / 2;
        return { x: svgX, y: svgY };
    },

    /**
     * Get grid coords given screen coords.
     * 
     * NOTES: svgX and svgY must be relative to the 
     * center of the SVG universe.
     * 
     * Please see: https://dr-nick-nagel.github.io/blog/trans-matrix.html
     * 
     * @param {number} svgX SVG viewport coord X
     * @param {number} svgY SVG viewport coord Y
     */
    svgMap: function( svgX, svgY, offsets={ x: 0, y: 0 } ) {
        // These formulas are derived by solving the isometricMap equations.
        const halfW = this.tileWidth  / 2;
        const halfH = this.tileHeight / 2;
        // apply offsets to grids offset from the SVG origin...
        let localX = svgX - offsets.x;
        let localY = svgY - offsets.y;
        let i = 0.5 * ( localX/halfW + localY/halfH );
        let j = 0.5 * ( localY/halfH - localX/halfW );
        i = Math.round(i);
        j = Math.round(j);
        return { i: i, j: j };
    }

}

/**
 * Utility to get the center coordinates of an SVG
 * viewport in SVG world coordinates. Useful for when
 * the viewBox gets changed (animated ... )
 * 
 * Note: SVG MUST contain viewBox specs ... 
 * 
 * @param { svg } svg svg element root
 * @returns center of the SVG viewport in SVG user coords ... 
 */
export function getViewPortCenter( svg ) {
    // get the SVG viewport area as a rectangle ...
    const vBox = svg.viewBox.baseVal;
    const cx   = vBox.x + vBox.width / 2;
    const cy   = vBox.y + vBox.height / 2;
    return { x: cx, y: cy } ;
}

