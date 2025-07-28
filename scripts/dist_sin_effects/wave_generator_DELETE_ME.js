// waveGenerator.js (ES6 Module)

/**
 * Helper to parse a specific d-attribute format into a flat array of numbers.
 * Assumes format: "m X0,Y0 c C1x_seg1,C1y_seg1 C2x_seg1,C2y_seg1 X_mid,Y_mid C1x_seg2,C1y_seg2 C2x_seg2,C2y_seg2 X_end,Y_end"
 * Expects 14 numerical values.
 * @param {string} dString - The SVG path data string.
 * @returns {number[]|null} An array of numbers or null if parsing fails.
 */
function parseDAttribute(dString) {
    const numberRegex = /[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?/g;
    const allNumbers = dString.match(numberRegex)?.map(Number);

    if (!allNumbers || allNumbers.length !== 14) {
        console.error("D-attribute parsing error: Expected 14 numbers, got", allNumbers ? allNumbers.length : 0, "for string:", dString);
        return null;
    }
    return allNumbers;
}

/**
 * Generates an SVG path data string from a flat array of 14 numbers.
 * @param {number[]} numbersArray - Array of 14 numbers [X0, Y0, C1x1, C1y1, C2x1, C2y1, X1, Y1, C1x2, C1y2, C2x2, C2y2, X2, Y2].
 * @returns {string} The SVG path data string.
 * @throws {Error} If the input array does not contain exactly 14 elements.
 */
function generateDAttribute(numbersArray) {
    if (numbersArray.length !== 14) {
        throw new Error("Numbers array must contain 14 elements for this d-attribute format.");
    }
    const [X0, Y0, C1x1, C1y1, C2x1, C2y1, X1, Y1, C1x2, C1y2, C2x2, C2y2, X2, Y2] = numbersArray;
    return `m ${X0},${Y0} c ${C1x1},${C1y1} ${C2x1},${C2y1} ${X1},${Y1} ${C1x2},${C1y2} ${C2x2},${C2y2} ${X2},${Y2}`;
}

/**
 * Linearly interpolates between two numerical arrays.
 * @param {number[]} arr1 - The starting array of numbers.
 * @param {number[]} arr2 - The ending array of numbers.
 * @param {number} t - The interpolation factor (0.0 to 1.0).
 * @returns {number[]} The interpolated array.
 */
function interpolateArrays(arr1, arr2, t) {
    if (arr1.length !== arr2.length) {
        throw new Error("Arrays must have the same length for interpolation.");
    }
    const result = [];
    for (let i = 0; i < arr1.length; i++) {
        result.push(arr1[i] + (arr2[i] - arr1[i]) * t);
    }
    return result;
}

/**
 * Generates an array of interpolated d-attribute strings for SMIL animation.
 * This function takes your core keyframes and generates additional intermediate frames
 * by linearly interpolating the numerical components of their path data.
 * @param {string[]} baseDStrings - An array of your core d-attribute strings (e.g., init, tweenX, midpoint, tweenXPrime, init).
 * @param {number[]} baseKeyTimes - The normalized keyTimes corresponding to baseDStrings (e.g., [0.0, 0.25, 0.50, 0.75, 1.0]).
 * @param {number} totalKeyframesDesired - The total number of keyframes you want in the final SMIL animation (e.g., 9, 17, etc.).
 * @returns {{values: string, keyTimes: string}} An object containing the 'values' and 'keyTimes' strings for SMIL.
 */
export function generateSmoothedWaveAnimation(baseDStrings, baseKeyTimes, totalKeyframesDesired) {
    const parsedBaseKeyframes = baseDStrings.map(parseDAttribute);
    if (parsedBaseKeyframes.some(kf => kf === null)) {
        console.error("Failed to parse one or more base D-attribute strings.");
        return { values: "", keyTimes: "" };
    }

    const finalValues = [];
    const finalKeyTimes = [];

    // totalKeyframesDesired includes the start AND end (which are the same for looping)
    // So, we need (totalKeyframesDesired - 1) segments.
    const numInterpolationSteps = totalKeyframesDesired - 1;

    for (let i = 0; i <= numInterpolationSteps; i++) {
        const currentTimeRatio = i / numInterpolationSteps;

        // Find the segment between which currentTimeRatio falls
        let segmentStartIndex = 0;
        for (let j = 0; j < baseKeyTimes.length - 1; j++) {
            if (currentTimeRatio >= baseKeyTimes[j] && currentTimeRatio < baseKeyTimes[j+1]) {
                segmentStartIndex = j;
                break;
            }
            // Handle the case where currentTimeRatio exactly matches the last baseKeyTime
            if (j === baseKeyTimes.length - 2 && currentTimeRatio === baseKeyTimes[j+1]) {
                segmentStartIndex = j + 1;
                break;
            }
        }
        
        let interpolatedFrame;
        // If we are exactly on a base keyframe, use its direct value to avoid floating point issues
        if (baseKeyTimes.includes(currentTimeRatio)) {
            interpolatedFrame = parsedBaseKeyframes[baseKeyTimes.indexOf(currentTimeRatio)];
        } else {
            const startBaseFrame = parsedBaseKeyframes[segmentStartIndex];
            const endBaseFrame = parsedBaseKeyframes[segmentStartIndex + 1];
            const startBaseTime = baseKeyTimes[segmentStartIndex];
            const endBaseTime = baseKeyTimes[segmentStartIndex + 1];

            // Calculate the interpolation 't' within the current base segment (0 to 1)
            let t_in_segment = 0;
            if (endBaseTime !== startBaseTime) {
                t_in_segment = (currentTimeRatio - startBaseTime) / (endBaseTime - startBaseTime);
            }
            interpolatedFrame = interpolateArrays(startBaseFrame, endBaseFrame, t_in_segment);
        }

        finalValues.push(generateDAttribute(interpolatedFrame));
        finalKeyTimes.push(currentTimeRatio.toFixed(3)); // Keep 3 decimal places for keyTimes
    }

    return {
        values: finalValues.join(';'),
        keyTimes: finalKeyTimes.join(';')
    };
}