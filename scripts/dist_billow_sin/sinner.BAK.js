 /**
  * sinner.js
  * 
  * SVG Creators Collaborative tool. Generates an SVG sinwave path for 
  * numerous applications including creating SVG game art, models, sims
  * animations, etc. etc...
  * 
  * SEE: https://dr-nick-nagel.github.io/blog/billow-effect.html
  * 
  * @author Nick Nagel
  * 
  */

    /**
        * Generates the SVG path data for a sine wave.
        * 
        * For math ...
        * SEE: https://dr-nick-nagel.github.io/blog/billow-effect.html
        *
        * @param {number} period The period (P) of the sine wave.
        * @param {number} amplitude The amplitude of the sine wave.
        * @param {number} xMin The minimum x-value for the wave.
        * @param {number} xMax The maximum x-value for the wave.
        * @param {number} svgViewBoxHeight The height of the SVG's viewBox (e.g., 50 for "0 0 100 50").
        * @param {number} svgViewBoxMinY The minimum Y coordinate of the SVG's viewBox (e.g., 0 for "0 0 100 50").
        * @returns {string} The SVG path data string (e.g., "M x1 y1 L x2 y2 ...").
        */
    export function generateSineWavePath(period, amplitude, xMin, xMax, svgViewBoxHeight, svgViewBoxMinY) {
        const v = 0; // Velocity (fixed at 0 for a static wave)
        const t = 0; // Time (fixed at 0 for a static wave)
        const step = 0.5; // Step size for drawing the curve; smaller step creates a smoother curve

        // Calculate the vertical center of the SVG's viewBox coordinate system.
        // This is used to vertically center the sine wave within the SVG.
        // For a viewBox like "-50 0 100 50", svgViewBoxMinY is 0 and svgViewBoxHeight is 50,
        // so the center is 0 + (50 / 2) = 25.
        const svgCenterY = svgViewBoxMinY + (svgViewBoxHeight / 2);

        /**
        * Calculates the SVG Y-coordinate for a given X-coordinate.
        * The equation used is y(x, t) = amplitude * sin(2*pi*(x - v*t)/P).
        * The result is then adjusted to fit the SVG's coordinate system where
        * y=0 is at the top and positive y values go downwards.
        *
        * @param {number} x The x-coordinate on the wave.
        * @returns {number} The corresponding y-coordinate for SVG drawing.
        */
        function calculateSvgY(x) {
        // Calculate the raw wave Y value based on the sine function
        const waveY = amplitude * Math.sin((2 * Math.PI * (x - v * t)) / period);

        // Adjust the waveY to fit the SVG coordinate system:
        // 1. Subtract waveY from svgCenterY: This inverts the y-axis (positive waveY goes up)
        //    and shifts the wave so its center aligns with the SVG's vertical center.
        return svgCenterY - waveY;
        }

        // Start the path data with a 'Move To' command at the initial xMin
        let pathData = `M ${xMin} ${calculateSvgY(xMin)}`;

        // Loop through the x-range, adding 'Line To' commands for each step
        // This draws the curve by connecting many small line segments.
        for (let x = xMin + step; x <= xMax; x += step) {
        pathData += ` L ${x} ${calculateSvgY(x)}`;
        }

        return pathData;
    }


      /**
        * Updates the sine wave SVG path based on current input values.
        */
    export function updateSineWave() {
        // Parse input values as numbers
        const P = parseFloat(periodInput.value);
        const amplitude = parseFloat(amplitudeInput.value);
        const xMin = parseFloat(xMinInput.value);
        const xMax = parseFloat(xMaxInput.value);

        // Get SVG's current viewBox dimensions to correctly map wave coordinates
        // The viewBox attribute is "minX minY width height"
        const viewBox = sineWaveSvgElement.getAttribute('viewBox').split(' ').map(Number);
        const viewBoxMinY = viewBox[1];   // The second value is minY
        const viewBoxHeight = viewBox[3]; // The fourth value is height

        // Generate the path data using the inlined function
        const pathData = generateSineWavePath(P, amplitude, xMin, xMax, viewBoxHeight, viewBoxMinY);

        // Set the generated path data to the SVG path element
        sineWavePathElement.setAttribute('d', pathData);
    }



    export class Sinner {

        

        constructor(amplitude = 1, frequency = 1, phase = 0, offset = 0) {
          this.amplitude = amplitude;
          this.frequency = frequency;
          this.phase = phase;
          this.offset = offset;
          console.log(`Sinner created with Amplitude: ${this.amplitude}, Frequency: ${this.frequency}, Phase: ${this.phase}, Offset: ${this.offset}.`);
        }
      
        getValueAtTime(time) {
          return this.amplitude * Math.sin(this.frequency * time + this.phase) + this.offset;
        }
      
        toString() {
          return `Sinner: A=${this.amplitude}, F=${this.frequency}, P=${this.phase}, O=${this.offset}`;
        }
      }
      
      export default Sinner;
      
