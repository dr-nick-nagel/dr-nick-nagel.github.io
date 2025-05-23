/**
 * This script defines an SVG "carousel" Using svg document nesting.
 * 
 * Authored by: Nick Nagel (c) 2025
 */


export const svgList = [

    'card_suits.svg',
    'coord_systems_plain.svg',
    'wind_farm_plain.svg',
    'wind_turbine_matrix.svg',
    'plane_plain.svg',
    'isometric_biomes_v2.svg',
    'russian_doll_v1.svg'

];

export const SVG_PATH = "/svg/carousel/";

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


const svgCarousel = document.getElementById("carousel");

/**
 * Dev time scaffolding to dump slide info on demand...
 * 
 * @param {*} evt 
 */
const debugReport = ( evt ) => {
    const slide = evt.currentTarget;
    console.log( slide );
    evt.stopPropagation();
}

const carousel = {
    SEMI_MAJOR_AXIS: 250,
    SEMI_MINOR_AXIS: 100,
    THETA_STEP: 0.5,
    FULL_CIRCLE: 360,
}

let count = 0;

const carouselGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");

async function init() {
    //load svg's
    await loadSvgList( svgList, SVG_PATH );
    // Index SVG CONTENT FOR LATER SORTING
    const svgIndex = Object.keys( svgDocCache ); 
    count = svgIndex.length;
    let degreesOfSeparation = carousel.FULL_CIRCLE / count;
    let angleOfRotation = 0;
    // Initialize the Slide Group G ...
    svgIndex.forEach( 
        (key) => {
            const slide = svgDocCache[key];
        // Due to CHROME NESTED SVG COORDS BUG 
        // create a g element
        let slideG = document.createElementNS(
            "http://www.w3.org/2000/svg", 
            "g"
        );
        slideG.setAttribute("class", "svg-slide-wrapper");
        // to g append svg 
        slideG.appendChild(slide);
        // set transform on g ...
            revolveSvg( slideG, angleOfRotation );
            slide.addEventListener(
                'click',
                debugReport
            );
            carouselGroup.appendChild( slideG );
            angleOfRotation = angleOfRotation + degreesOfSeparation;
        }
    );
    svgCarousel.appendChild( carouselGroup) ;
    // Restack the slides for SVG Painting ... 
    reStackSlides();
}

const sortSlides = ( a, b ) => {
    const aDepth = a.getAttribute( "data-depth" );
    const bDepth = b.getAttribute( "data-depth" );
    return ( aDepth - bDepth ) ;
};


/**
 * Restack the slides to INSURE THAT OVERLAPPING
 * ELEMENTS ARE DISPLAYED CORRECTLY TO PRESERVE THE
 * ILLUSION OF DEPTH...
 */
const reStackSlides = () => {
    let stack = Array.from(
        // carouselGroup.querySelectorAll('svg') 
        carouselGroup.querySelectorAll('.svg-slide-wrapper')
    );
    stack.sort( sortSlides );
    carouselGroup.innerHTML = "";
    // pay attention here! May be better
    // to create a new group element, finish the 
    // work and SWAP to DOM at END!!!
    for( let slide of stack ) {
        carouselGroup.append( slide );
    }

 }


/**
 * Revolve the nested SVG's around the carousel axes. The carousel 
 * has an elliptical shape to give the ILLUSION of depth. So it has
 * MAJOR and MINOR axes. As the carousel revolves the SVG's need to 
 * be scaled to appear to recede into distance. This I did with a 
 * simple heuristic: The scaling is proportional to the minor axis.
 * 
 * The other problem that has to be solved is that SVG DOES NOT PROVIDE
 * A z-index. Sooo the stacking order of the slides has to be changed 
 * on the update. 
 * 
 * IMPORTANT: For this I used a data- attribute on the svg to implement
 * a sort of z-indexing. The SVG groups are sorted stripped and re-inserted
 * under the parent node based on stacking order...
 * 
 * IMPORTANT : BECAUSE OF STUPID CHROME YOU HAVE 
 * TO PUT THE SVG TRANSFORM ON A G WRAPPER. KEEP 
 * THE DATA ATTRIBUTES ON THE NESTED SVG
 * 
 * <g transform=""> --> <svg data- >
 * 
 * @param {*} svgGWrapper 
 * @param {*} theta 
 */
function revolveSvg ( svgGWrapper, theta ) {
    const radians = theta * (Math.PI / 180);
    let xTrans = carousel.SEMI_MAJOR_AXIS * Math.cos( radians ); 
    let yTrans = carousel.SEMI_MINOR_AXIS * Math.sin( radians ); 
    let scaleFactor = 0.25 + 0.15 * ( 1 + Math.sin( radians ) );
    svgGWrapper.setAttribute( 
        "transform", 
        `translate( ${xTrans} ${yTrans} ) scale( ${ scaleFactor } )` 
    );
    svgGWrapper.setAttribute( "data-current-rotation", theta );
    svgGWrapper.setAttribute( "data-depth", yTrans );
}

// let testCounter = 0;
const displayElement = document.getElementById( "fps_display" );
let previousTimestamp = 0;

/**
 * Here's where the magic happens. In order to update the caroucel
 * I need to: 
 * 
 * 1. Get the degree of rotation, and
 * 2. Apply it to all the nested SVG's 
 * 
 * This moves them in the *parent viewport* 
 * 
 * The POINT is that the children's SVG viewport coordinates
 * and associated transformations are maintained in there
 * separate bases ... 
 * 
 * @param {*} timestamp 
 */
function updateCarousel( timestamp ) {
    // Compute the Framerate
    let frameRate = 1000 / (timestamp - previousTimestamp);
    frameRate = Math.round( frameRate );
    previousTimestamp = timestamp;
    displayElement.innerText = `FPS: ${frameRate}`;

    // Get all the svg's on the caroucel
    // IMPORTANT! Notice that they are all wrapped in a 
    // g-element. This is due to a BUG in CHROME such that:
    // It !!fails to execute the transorms when the svg is embedded in HTML!!
    const slideGroup = carouselGroup.querySelectorAll('.svg-slide-wrapper');
    // if ( testCounter < 1 ) {
    //     console.log( slideGroup[0] );
    //     testCounter ++ ;
    // }

    for ( const slideG of slideGroup) {
        const currentTheta = parseFloat( slideG.dataset.currentRotation );
        const nextTheta    = currentTheta + carousel.THETA_STEP;
        revolveSvg( slideG, nextTheta );
    }

    // After updating revolution, adjust stack order as necessary based 
    // simple heuristic.
    reStackSlides();

    // TODO: CONSIDER REMOVING THETA UPDATE. WITH NEW
    // REARCHITECTURE IT IS THETA_STEP THAT DIVES THE UPDATES...
    // theta = theta + carousel.THETA_STEP;
    // theta = theta % carousel.FULL_CIRCLE;

    rafId = requestAnimationFrame( updateCarousel );
}


let running = false;
let rafId   = 0;
/**
 * Just a quick down 'n' dirty animation controller 
 * for demo purps...
 */
function animationController() {
    if( running ) {
        requestAnimationFrame( updateCarousel );
    } else {
        cancelAnimationFrame( rafId );
        console.log(  `stopping animation: ${ rafId } `  ) ;
        ;
    }
}


// Load the assets
document.addEventListener(
    "DOMContentLoaded",
    async () => {
        await init();
        console.log("Initialization complete");
        console.log( `Loaded ${Object.keys( svgDocCache ).length} SVG's` );
    }
);

const DEBUG_MODE = false;
/**
 * Event Listener to get the thing moving. 
 * Also stops it. Attached to SVG so just
 * click the viewport...
 */
svgCarousel.addEventListener(
    "click",
    () => {
        if (DEBUG_MODE) {
            updateCarousel();
        } else {
            running = !running;
            console.log(  `RUNNING: ${ running } `  ) ;
            animationController();
            console.log(  `RAF ID: ${ rafId } `  ) ;
        }
    }
);


