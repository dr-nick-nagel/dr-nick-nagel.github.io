export const svgDocCache = {};

/**
 * Load and store a set of SVG documents. Stores *references* to 
 * the SVG document roots in *svgDocCache* . indexed by id's 
 * (re)generates app-wide unique id's on load...
 * Callers generally *should *await* completion of this function...
 * 
 * @param {*} list An iterable of svg filenames for to load
 * @param {*} path Path to the SVG files...
 */
export async function loadSvgList( list, path ) {

    let serial_no = 0;

    for( let svgDoc of list ) {
        let loadedSVG = null;
        const url = path + svgDoc;

        try {

            // Fetch the SVG document as text
            const response = await fetch( url );
            if ( !response.ok ) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            // parse the doc
            const svgText = await response.text();
            const parser  = new DOMParser();
            const svgDoc  = parser.parseFromString(svgText, 'image/svg+xml');
            loadedSVG = svgDoc.documentElement;
            // store in cache
            const svgId = "svg_slide_" + serial_no ++;
            loadedSVG.setAttribute( "id", svgId );
            svgDocCache[ svgId ] = loadedSVG;

        } catch (error) {
            console.error(`Error loading SVG from ${url}:`, error);
        }
    } 

}


/**
 * Factory function that creates an event handler to report mouse coordinates
 * within an SVG element.
 *
 * @param {SVGSVGElement} svgElement - The SVG element to track mouse events in.
 * @returns {function(MouseEvent): void} - An event handler function.
 */
export function createSvgCoordsFinder( svg ) {

    return function( evt ) {
        let pt = svg.createSVGPoint();
        pt.x = evt.clientX;
        pt.y = evt.clientY;
        let transformed = pt.matrixTransform(
            svg.getScreenCTM().inverse()
        );
        console.log(`SVG COORDS: (  ${transformed.x.toFixed(2)}, ${transformed.y.toFixed(2)}  )`);

    };
}
  


// Key for saving game state to local storage
const USER_STORAGE_KEY = "SvgCCGameState";
/**
 * Minimal utility to save game state to user's local storage ...
 * 
 * @param {json} gameState serialized game state
 */
export function saveGameState( gameState ) {
  try {
    const data = JSON.stringify( gameState );
    localStorage.setItem( USER_STORAGE_KEY, data );
  } catch (err) {
    console.error("Error saving game state:", err);
  }
}

/**
 * Minimal utility to load game state to user's local storage ...
 * 
 * @returns Serialized game state as JSON
 */
export function loadGameState() {
  try {
    const data = localStorage.getItem( USER_STORAGE_KEY );
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error("Error loading game state:", err);
    return null;
  }
}

// Example IncrementalGameState skeleton
const IncrementalGameState = {
  t0: Math.floor(Date.now() / 1000),
  accumulatedWealth: 0,
  timeInGame: 0,
  gameSprites: [],
  foodSprites: [],
};

// Example usage
// saveGameState(IncrementalGameState);
// const restored = loadGameState();
// console.log("Restored game state:", restored);


