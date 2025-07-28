/**
 * First pass at generating a traveling wave animation with 
 * SVG. This tool procedurally generates the *SMIL animation 
 * keys* for a travelling wave effect. 
 * 
 * @author Nick Nagel <nick@nicknagel.com>
 * @copyright 2025 Nick Nagel
 */

/**
 * Place holder configuration for UI text area INPUT
 */
export const placeHolderConfig = `{
  "NUM_FRAMES": 60,
  "NUM_SEGMENTS": 16,
  "AMPLITUDE": 30,
  "WAVELENGTH": 500,
  "WIDTH": 500,
  "HEIGHT": 100,
  "FILL": "none",
  "STROKE": "lime",
  "DURATION": 10
}`;

// Midline: The midline of the wave. Hardcoded for now ... 
const Y_MIDLINE = 50;
// Used for closing the path...
let shape_depth;
let shape_width;

/**
 * Entry point for generating the wave.
 * 
 * @param {*} config 
 * @returns An SVG Group element wrapping a path and it's SMIL wave animation keys...
 */
export function generateTravelingWave(config) {
  const {
    NUM_SEGMENTS = 10,
    NUM_FRAMES = 60,
    AMPLITUDE = 20,
    WAVELENGTH = 1000,
    WIDTH = 100,
    HEIGHT = 50,
    DURATION = 2.0,
    STROKE = 'lime',
    STROKE_WIDTH = 2,
    FILL = 'none'
  } = config;

  // USED ELSEWHERE TO CLOSE PATH ... 
  shape_depth = HEIGHT;
  shape_width = WIDTH;

  const framePaths = [];
  const segmentLength = WIDTH / NUM_SEGMENTS;
  const phaseStep = (2 * Math.PI) / NUM_FRAMES;
  
  for (let f = 0; f < NUM_FRAMES; f++) {
    const phase = f * phaseStep;
    const pathData = generateSineBezierPath(NUM_SEGMENTS, segmentLength, AMPLITUDE, WAVELENGTH, phase);
    framePaths.push(pathData);
  }

  const keyTimes = Array.from({ length: NUM_FRAMES }, (_, i) => (i / (NUM_FRAMES - 1)).toFixed(4)).join(';');
  const values = framePaths.join(';');

  const svgNS = 'http://www.w3.org/2000/svg';

  const group = document.createElementNS(svgNS, 'g');
  const path = document.createElementNS(svgNS, 'path');
  path.setAttribute('stroke', STROKE);
  path.setAttribute('stroke-width', STROKE_WIDTH);
  path.setAttribute('fill', FILL);
  path.setAttribute('d', framePaths[0]);

  const animate = document.createElementNS(svgNS, 'animate');
  animate.setAttribute('attributeName', 'd');
  animate.setAttribute('dur', `${DURATION}s`);
  animate.setAttribute('repeatCount', 'indefinite');
  animate.setAttribute('values', values);
  animate.setAttribute('keyTimes', keyTimes);

  path.appendChild(animate);
  group.appendChild(path);
  return group;
}

/**
 * Generates wave using Bézier paths  
 * @param {*} numSegments    Number of segments in the path
 * @param {*} segmentLength  length of each segment w / numsegments
 * @param {*} amplitude 
 * @param {*} wavelength
 * @param {*} phase
 * @returns 
 */

function generateSineBezierPath(numSegments, segmentLength, amplitude, wavelength, phase) {
  const k = (2 * Math.PI) / wavelength;
  const dx = segmentLength;
  const pathPoints = [];

  for (let i = 0; i <= numSegments; i++) {
    const x = i * dx;
    const y = amplitude * Math.sin(k * x + phase);
    pathPoints.push([x, y]);
  }

  // Convert to a path using cubic Bézier approximations between each pair
  let d = `M ${pathPoints[0][0]},${  Y_MIDLINE   + pathPoints[0][1]}`; 

  for (let i = 0; i < pathPoints.length - 1; i++) {
    const [x0, y0] = pathPoints[i];
    const [x1, y1] = pathPoints[i + 1];

    const cx1 = x0 + dx / 3;
    const cy1 = y0;
    const cx2 = x1 - dx / 3;
    const cy2 = y1;

    d += ` C ${cx1},${50 + cy1} ${cx2},${50 + cy2} ${x1},${50 + y1}`;
  }

  return d;
}


/**
 * Function  to close the wave path for SMIL animation
 * such that you get a 2D rect with the upper side the
 * wave...
 * 
 * @param {point} p1 lower right corner
 * @param {point} p2 lower left corner
 * @param {string} pathData stringified data paths from animation tag 
 *   (SVG) "values" attr...
 * @returns stringified data paths to update animation tag 
 *   (SVG) "values" attr...
 */
function closeWavePaths( p1, p2, pathData ) {
  const x1 = p1.x;
  const y1 = p1.y;
  const x2 = p2.x;
  const y2 = p2.y;
  const paths = pathData.split(";");
  for ( let i = 0; i < paths.length; i++ ) {
      paths[i] = paths[i] + ` L ${x1},${y1} L ${x2},${y2} Z`;
  }
  const closedPathData = paths.join(";");
  return closedPathData;
}

// ----  Handlins for Tool --------
// Following is all UI specific. The module is tied to the 
// UI from this poing down. This is for security purposes;
// The host webpage has a policy dis allowing inlined scripts ... 

import {
  copySvgToClipboard
} from "../copy_svg_to_clipboard.js";

function getConfig() {
  const configJSON = configArea.value;
  return  JSON.parse( configJSON );
}

let configArea;
let waveButton;
let svgDisplay;
let svgContainer;
let copyButton;
let closeButton;
function init() {
    configArea = document.getElementById("wave_config");
    configArea.value = placeHolderConfig;
    waveButton = document.getElementById("wave_button");
    svgDisplay = document.getElementById("svg_display");
    svgContainer = document.getElementById("svg_display_container");
    copyButton = document.getElementById("copy_button");
    closeButton = document.getElementById("close_button");

    waveButton.addEventListener(
      "click",
      (evt) => {
        const currentGroup = document.getElementById( "wave_anim_1" );
        if( currentGroup ) {
          currentGroup.parentNode.removeChild(currentGroup);
        } 
        let config = getConfig();
        const {
          WIDTH,
          HEIGHT
        } = config;
        let waveGroup = generateTravelingWave( config );
        waveGroup.setAttribute("id", "wave_anim_1");
        svgDisplay.setAttribute( "width", `${WIDTH}` );
        svgDisplay.setAttribute( "height", `${ Y_MIDLINE + HEIGHT}` );
        svgDisplay.setAttribute( "viewBox", `-10 0 ${ WIDTH + 10 } ${ Y_MIDLINE + HEIGHT + 20 }` );
        svgDisplay.appendChild(waveGroup);
      }
    );

    copyButton.addEventListener(
      "click",
      (evt) => {
        const svgStr = svgDisplay.outerHTML;
        copySvgToClipboard( svgStr );
      }
    );


    closeButton.addEventListener(
      "click",
      (evt) => {
        const xLeft  = 0;
        const xRight = xLeft + shape_width;
        const yLeft  = Y_MIDLINE + shape_depth ;
        const yRight = Y_MIDLINE + shape_depth ;
        const p1 = { x: xRight, y: yRight };
        const p2 = { x: xLeft,   y: yLeft };
        const animTag = svgDisplay.querySelector( "animate" );
        const data = animTag.getAttribute( "values" );
        const newValues = closeWavePaths( p1, p2, data );
        animTag.setAttribute( "values", newValues )
      }
    );

}
init(); 

