// generateTravelingWave.js
// ES6 module to procedurally generate a traveling sine wave SMIL animation in SVG



export function generateTravelingWave(config) {
  const {
    // NUM_SEGMENTS = 10,
    NUM_SEGMENTS = 100,
    NUM_FRAMES = 60,
    AMPLITUDE = 20,
    WAVELENGTH = 100,
    // WIDTH = 100,
    WIDTH = 1000,
    HEIGHT = 100,
    DURATION = 2.0, // in seconds
    STROKE = 'lime',
    STROKE_WIDTH = 2,
    FILL = 'none'
  } = config;

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
  let d = `M ${pathPoints[0][0]},${50 + pathPoints[0][1]}`; // baseline is y=50

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

