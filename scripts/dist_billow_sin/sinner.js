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

export class Sinner {

    /**
     *  Construct a sinner given params or use defaults ...
     * 
     * @param {*} amplitude of the wave
     * @param {*} period 
     * @param {*} xMin      minimum value of x for sampling
     * @param {*} xMax      maximum value of x for sampling
     */
    constructor(amplitude = 25, period = 50, xMin = -50, xMax = 50) {
        this.period = period;
        this.amplitude = amplitude;
        this.xMin = xMin;
        this.xMax = xMax;
    }

    /**
     * HERE's the BEEF
     * Calculates the SVG Y-coordinate for a given X-coordinate.
     * The equation used is:
     * 
     *      y(x, t) = amplitude * sin( 2*pi* (x - v*t) / P )
     * 
     * The result is then adjusted to fit the SVG's coordinate system where
     * y=0 is at the top and positive y values go downwards.
     *
     * @param {number} x The x-coordinate on the wave.
     * @returns {number} The corresponding y-coordinate for SVG drawing.
     */
    calculateSvgY( x ) {
        const v = 0;      // Velocity (fixed at 0 for a static wave)
        const t = 0;      // Time (fixed at 0 for a static wave)
        const waveY = this.amplitude * Math.sin((2 * Math.PI * (x - v * t)) / this.period);
        // Adjust the waveY to fit the SVG coordinate system: y = -1 * y ...
        return -1 * waveY;
    }


    /**
     * Generates the SVG path data for a sine wave.
     * 
     * For math ...
     * SEE: https://dr-nick-nagel.github.io/blog/billow-effect.html
     *
     */
    generateSineWavePath() {
        const step = 0.5; // Step size for drawing the curve; smaller step creates a smoother curve
        // Start the path data with a 'Move To' command at the initial xMin
        let pathData = `M ${this.xMin} ${this.calculateSvgY(this.xMin)}`;
        // Loop through the x-range, adding 'Line To' commands for each step
        // This draws the curve by connecting many small line segments.
        for (let x = this.xMin + step; x <= this.xMax; x += step) {
            pathData += ` L ${x} ${this.calculateSvgY(x)}`;
        }
        return pathData;
    }


    /**
    * Controller function to update model. Notifies caller with new model
    * data.
    * 
    * TD WARNING: MVC VIOLATION. MODEL SHOULD UPDATE VIEW COMPONENTS. PAY
    * OFF TD ON PROD REFACTOR. THE MODEL SHOULD REGISTER AND UPDATE CONCERNED
    * VIEWS ... 
    */
    updateSineWave(amplitude, period, xMin, xMax) {
        this.period = period;
        this.amplitude = amplitude;
        this.xMin = xMin;
        this.xMax = xMax;
        const pathData = this.generateSineWavePath();
        return pathData;
    }

}

export default Sinner;
