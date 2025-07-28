export const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * This class defines a SerpentineSkeleton (SS) for the SVG CC framework. 
 * SS is designed for composition with sprites that need to exhibit serpentine
 * motion -- i.e., motion that can be modeled on a traveling wave (like serpents,
 * seaweeds, mermaids swimming etc.).
 */
export class SerpentineSkeleton  {

  constructor( options = {} ) {
    this.length = options.length || 200;
    this.numSamples = options.numSamples || 10;
    this.midline = options.midline || 50;
    this.amplitude = options.amplitude || 10;
    this.wavelength = options.wavelength || 200;
    this.width = options.width || 10; 
    this.phase = options.phase || 0;
    this.shift = options.shift || 1;
    this.upperPoints = [];
    this.lowerPoints = [];
    // {x, y, angleRadians}
    this.spine = []; 
  }

  /**
   * SVG CC update function for a SerpentineSkeleton component. This function updates
   * the spine, upper and lower points of the skeleton by:
   * 
   * 1. shifting the phase,
   * 2. recalculating the tangents and normals off the spine, and
   * 3. obtaining the the new edge points of the ribbon shape.
   * 
   * see: https://https://dr-nick-nagel.github.io/blog/ribbon-effect.html
   * 
   * for deets...
   * 
   * @param {number} deltaTime previous interval in seconds (expect 
   * floating point decimal accumulation of time interval since last update...)
   * 
   */
  updateSamples( deltaTime ) {
    this.upperPoints.length = 0;
    this.lowerPoints.length = 0;
    this.spine.length = 0;
    this.phase += this.shift * deltaTime; 
    // note: this algo gives you end points so points total = numSamples + 1
    // number of SEGMENTS is points total - 1 ... consider the implications...
    // store the segments as VECTORS AFTER The spine is sampled... 
    for (let i = 0; i <= this.numSamples; i++) {
      const x = i / this.numSamples * this.length;
      // compute the spine data sample 
      const yCenter =
        this.midline + this.amplitude * Math.sin(
          (2 * Math.PI * x / this.wavelength) + this.phase
        );
      // get the upper and lower edge points...
      // Calculate derivative dy/dx where 
      // dy/dx = A * (2pi/lambda) * cos( (2pi*x/lambda) + phi )
      const B = (2 * Math.PI / this.wavelength);
      const dy_dx = this.amplitude * B * Math.cos((B * x) + this.phase);
      // Tangent vector (Tx, Ty) = (1, dy_dx)
      const Tx = 1; 
      const Ty = dy_dx; 
      // Calculate angle of the tangent in radians
      const angleRadians = Math.atan2(Ty, Tx);
      const angleDegrees = angleRadians * (180 / Math.PI);
      // Store spine data including angle for attached parts
      const currentSegment = { 
          x: x, 
          y: yCenter, 
          angleRadians: angleRadians, 
          angleDegrees: angleDegrees,
          segmentVector: { dx: 0, dy: 0 } 
        };
      this.spine.push( currentSegment );
      // Calculate perpendicular vector for ribbon width
      let Px = -Ty;
      let Py = Tx;
      const magnitudeP = Math.sqrt(Px * Px + Py * Py);
      // Normalize
      let Nx = Px / magnitudeP;
      let Ny = Py / magnitudeP;
      // Calculate upper and lower points
      const halfWidth = this.width / 2;
      this.upperPoints.push({ x: x + Nx * halfWidth, y: yCenter + Ny * halfWidth });
      this.lowerPoints.push({ x: x - Nx * halfWidth, y: yCenter - Ny * halfWidth });
    }
    // Now that we have the spine data ...
    // store the spine segment *vector* as a distance with
    // origin at segment and length [dx, dy] vector components
    // Now that spine is built, compute segmentVectors
    for ( let i = 0; i < this.spine.length; i++ ) {
      const curr = this.spine[i];
      // Handle the endpoint edge-case: 
      // there is no "next" so use the previous vector
      // to enable orienting head and so forth ... 
      if (i === this.spine.length - 1) {
        const prev = this.spine[i - 1];
        curr.segmentVector = {
          dx: prev.segmentVector.dx,
          dy: prev.segmentVector.dy
        };
      } else {
        const next = this.spine[i + 1];
        curr.segmentVector = {
          dx: next.x - curr.x,
          dy: next.y - curr.y
        };
      }
    }
  }
  
  update( deltaTime ) {
      this.updateSamples( deltaTime );
  }

  /**
  * Gives you the path data for the serpentine shape
  */
  getPathData() {
      // SAMPLE RECT DATA
      // d="M 50,40 L 250,40 L 250,60 L 50,60 Z"
      let dStr = "M ";
      const { x, y } = this.upperPoints[0];
      dStr += `${x}, ${y} `;
      for( let i=1; i < this.upperPoints.length; i++ ) {
          const { x, y } = this.upperPoints[ i ];
          dStr += `L ${x}, ${y} `;
      }
      // reverse the array direction for lowerpoints 
      for( let i = this.lowerPoints.length-1; i >= 0; i-- ) {
          const { x, y } = this.lowerPoints[ i ];
          dStr += `L ${x}, ${y} `;
      }
      dStr += "Z";
      return dStr;
  }

  /**
   * Get spine data for attaching appendages, and other interactions...
   * @param {integer} index spine segment 
   * @returns {object | null} expect { x, y, angleRadians } where x, y is position and
   * angleRadians is the tangent angle for that segment ... 
   */
  getSpineSegmentData( index ) {
      if ( index < 0 || index > ( this.spine.length - 1 ) ) {
        console.error( "[SerpentineSkeleton] index oob", index );
        return( null );
      }
      return this.spine[index];
  }

}


// -------------  SEAWEED SKELETON ---------------------------------

export const seaweedConfig = {
    midline: 0,
    amplitudeGrowthPower: 0.5,
    numSamples: 10,
}

export const mermaidConfig = {
  midline: 3,
  amplitudeGrowthPower: 0.5,
  numSamples: 10,
  phase: 0,
  length:100,
  shift: 5
}

export class FixedPointSkeleton  {

  constructor( options = {} ) {
    this.length = options.length || 200;
    this.numSamples = options.numSamples || 10;
    this.midline = options.midline || 0;
    this.amplitude = options.amplitude || 10;
    this.wavelength = options.wavelength || 200;
    this.width = options.width || 10; 
    this.phase = options.phase || 0;
    this.shift = options.shift || 1;
    this.amplitudeGrowthPower = options.amplitudeGrowthPower || 0.5;
    this.upperPoints = [];
    this.lowerPoints = [];
    this.spine = []; 
  }


  /**
   * Samples according to the equation: 
   * 
   *   y = A * ( x / length ) ^ P * sin( kx +- Phi )
   * 
   * Thense derivatives are calculated at each sample point to get tangents
   * from which normals are dervived. Phase shift creates wave effect. 
   * reverse apparent motion direction by changing phase shift operation 
   * (add or subtract).
   * 
   * Note the use of P (amplitude growth power) . It controls the wave 
   * action that propagates out from the root. typical range [ 0, 2 ]
   * 
   * @param { seconds } deltaTime interval in seconds (e.g., 0.5 is half a sec)
   */
  updateSamples( deltaTime ) {
    // clear path arrays
    this.upperPoints.length = 0;
    this.lowerPoints.length = 0;
    this.spine.length = 0;

    // update phase ... 
    this.phase += this.shift * deltaTime; 
    // Sample the curve at current shift...
    // Pre-calculate k for brevity
    const K = (2 * Math.PI / this.wavelength); 
    const yInit = this.midline; 
    for (let i = 0; i <= this.numSamples; i++) {
      const x = i / this.numSamples * this.length;
      // x goes from 0 to length, so normalizedX goes from 0 to 1
      const normalizedX = x / this.length; 
      // this is where we scale the amplitude ... 
      // A = xNormed ^ AmpGrowthPower
      const amplitudeScale = Math.pow( normalizedX, this.amplitudeGrowthPower ); 

      // The core wave displacement: Argument for the sine function
      // This is where you can reverse the wave energy . So e.g., you
      // can get MEDUSA's SNAKEY HAIR with a mind of its own using + ...  

      const waveSinArg = (K * x) - this.phase; 
      // const waveSinArg = (K * x) + this.phase;

      const waveDisplacement = this.amplitude * amplitudeScale * Math.sin(waveSinArg);
      // yCenter: starts at `yInit` (midline) at x=0, and then waves relative to that
      const yCenter = yInit + waveDisplacement;

      // --- Calculate the derivative (dy/dx) for the tangent ---
      let dy_dx;
      if (x === 0) {
          dy_dx = 0; 
      } else {
          // Derivative of f(x) = A * (x/L)^P * sin(Kx - phi)
          // Let C = A / (L^P)
          // dy_dx = C * [ P * x^(P-1) * sin(Kx - phi) + x^P * K * cos(Kx - phi) ]
          const C = this.amplitude / Math.pow(this.length, this.amplitudeGrowthPower);
          const term1_f_prime_g = this.amplitudeGrowthPower * Math.pow(x, this.amplitudeGrowthPower - 1) * Math.sin(waveSinArg);
          const term2_f_g_prime = Math.pow(x, this.amplitudeGrowthPower) * K * Math.cos(waveSinArg);
          dy_dx = C * (term1_f_prime_g + term2_f_g_prime);
      }
      // Wave still propagates along the X-axis primarily
      const Tx = 1; 
      const Ty = dy_dx;
      const angleRad = Math.atan2(Ty, Tx);
      const angleDeg = angleRad * (180 / Math.PI);
      this.spine.push({ x: x, y: yCenter, angleRad: angleRad, angleDeg: angleDeg, Tx: Tx, Ty: Ty });

      // Calculate perpendicular vector for ribbon shape width
      let Px = -Ty;
      let Py = Tx;
      const magnitudeP = Math.sqrt(Px * Px + Py * Py);
      // Normalize
      let Nx = Px / magnitudeP;
      let Ny = Py / magnitudeP;
      // Calculate upper and lower points
      const halfWidth = this.width / 2;
      this.upperPoints.push({ x: x + Nx * halfWidth, y: yCenter + Ny * halfWidth });
      this.lowerPoints.push({ x: x - Nx * halfWidth, y: yCenter - Ny * halfWidth });
    }

    // Now that spine is built, compute segmentVectors
    // store the spine segment *vector* as a distance with
    // origin at segment and length [dx, dy] (vector components)
    // pointing to next sement (x, y)
    for ( let i = 0; i < this.spine.length; i++ ) {
      const curr = this.spine[i];
      // Handle the endpoint edge-case: 
      // there is no "next" so use the previous vector
      // to enable orienting head and so forth ... 
      if (i === this.spine.length - 1) {
        const prev = this.spine[i - 1];
        curr.segmentVector = {
          dx: prev.segmentVector.dx,
          dy: prev.segmentVector.dy
        };
      } else {
        const next = this.spine[i + 1];
        curr.segmentVector = {
          dx: next.x - curr.x,
          dy: next.y - curr.y
        };
      }
    }

  }
  
  update( deltaTime ) {
      this.updateSamples( deltaTime );
  }

  /**
  * Gives you the path data for the sea weed shape
  */
  getPathData() {
      // SAMPLE RECT DATA
      // d="M 50,40 L 250,40 L 250,60 L 50,60 Z"
      let dStr = "M ";
      const { x, y } = this.upperPoints[0];
      dStr += `${x}, ${y} `;
      for( let i=1; i < this.upperPoints.length; i++ ) {
          const { x, y } = this.upperPoints[ i ];
          dStr += `L ${x}, ${y} `;
      }
      // reverse the array direction for lowerpoints 
      for( let i = this.lowerPoints.length-1; i >= 0; i-- ) {
          const { x, y } = this.lowerPoints[ i ];
          dStr += `L ${x}, ${y} `;
      }
      dStr += "Z";
      return dStr;
  }

  /**
   * Get spine data for attaching appendages, and other interactions...
   * @param {integer} index spine segment 
   * @returns {object | null} expect { x, y, angleRadians } where x, y is position and
   * angleRadians is the tangent angle for that segment ... 
   */
  getSpineSegmentData( index ) {
      if ( index < 0 || index > ( this.spine.length - 1 ) ) {
        console.error( "[SerpentineSkeleton] index oob", index );
        return( null );
      }
      return this.spine[index];
  }

}


// ------------  HERE BE Mermaids  --------------------------------
export class MermaidSprite {

  constructor( svgGroupElement, skeleton ) {
    this.spriteGroup = svgGroupElement;
    this.skin = svgGroupElement.querySelector( "#tail" ); 
    this.skeleton = skeleton;
    this.tailGroup = svgGroupElement.querySelector( "#tf_group" );
    this.torsoGroup = svgGroupElement.querySelector( "#torso" );



    // -- DEAL WITH THE HAIR ----
    this.hairGroup = svgGroupElement.querySelector( "#hair_group" );
    this.hairShape = svgGroupElement.querySelector( "#hair_shape" );
    const HAIR_CONFIG = {
        midline: 0,
        amplitudeGrowthPower: 0.5,
        numSamples: 10,
        length: 50,
        width: 8,
        shift: 3
    }
    this.hairSkeleton = new FixedPointSkeleton( HAIR_CONFIG );




    // generate init curve ... 
    this.skeleton.update(0);
    this.hairSkeleton.update( 0 );

    this.render();

  }

  update( deltaTime ) {
    // 1. Update the ribbon component's internal calculations
    this.skeleton.update(deltaTime);
    this.hairSkeleton.update(deltaTime);
  }


  /**
   * RENDER HELPER: Render the mermaid's tail based on segment data 
   * from the FixedPointSkeleton... 
   * 
   * @param { spine object } spineData --> { Tx, Ty , angleDeg ... }
   */
  renderTail( spineData ) {
    // sort of "override" the computation of "ribbon" uppers and lowers
    // for to *taper* the tail ...
    const upperSegPoints = [];
    const lowerSegPoints = [];

    for ( let i=0; i<spineData.length; i++ ) {
      // GIVEN: { Tx, Ty }
      //   Calculate perpendicular vector for ribbon shape width
      let Px = - spineData[i].Ty;
      let Py = spineData[i].Tx;
      const magnitudeP = Math.sqrt(Px * Px + Py * Py);
      //   NORMALIZE THE PERP
      let Nx = Px / magnitudeP;
      let Ny = Py / magnitudeP;
      //   SCALE THE NORMAL TO GET distance 
      //   vector for upper and lower points
      const taperFactor = 0.07;
      const taper = 1.3 - i * taperFactor;
      Nx *= taper;
      Ny *= taper;
      //   Calculate upper and lower points
      const halfWidth = this.skeleton.width / 2;
      upperSegPoints.push({ x: spineData[i].x + Nx * halfWidth, y: spineData[i].y + Ny * halfWidth });
      lowerSegPoints.push({ x: spineData[i].x - Nx * halfWidth, y: spineData[i].y - Ny * halfWidth });
    }
    // construct the skin shap path ... 
    let dStr = "M ";
    const { x, y } = upperSegPoints[0];
    dStr += `${x}, ${y} `;
    for( let i=1; i < upperSegPoints.length; i++ ) {
        const { x, y } = upperSegPoints[ i ];
        dStr += `L ${x}, ${y} `;
    }
    // reverse the array direction for lowerpoints 
    for( let i = lowerSegPoints.length-1; i >= 0; i-- ) {
        const { x, y } = lowerSegPoints[ i ];
        dStr += `L ${x}, ${y} `;
    }
    dStr += "Z";
    let pathData = dStr;
    this.skin.setAttribute( "d", pathData );
  }



  /**
   * RENDER HELPER: Render the mermaid's tail based on segment data 
   * from the FixedPointSkeleton... 
   * 
   * @param { spine object } spineData --> { Tx, Ty , angleDeg ... }
   */
  renderHair( hairSpineData ) {
    // sort of "override" the computation of "ribbon" uppers and lowers
    // for to *taper* the tail ...
    const upperSegPoints = [];
    const lowerSegPoints = [];

    for ( let i=0; i<hairSpineData.length; i++ ) {
      // GIVEN: { Tx, Ty }
      //   Calculate perpendicular vector for ribbon shape width
      let Px = - hairSpineData[i].Ty;
      let Py = hairSpineData[i].Tx;
      const magnitudeP = Math.sqrt(Px * Px + Py * Py);
      //   NORMALIZE THE PERP
      let Nx = Px / magnitudeP;
      let Ny = Py / magnitudeP;
      //   SCALE THE NORMAL TO GET distance 
      //   vector for upper and lower points
      const taperFactor = 0.12;
      const taper = 1.3 - i * taperFactor;
      Nx *= taper;
      Ny *= taper;
      //   Calculate upper and lower points
      const halfWidth = this.hairSkeleton.width / 2;
      upperSegPoints.push({ x: hairSpineData[i].x + Nx * halfWidth, y: hairSpineData[i].y + Ny * halfWidth });
      lowerSegPoints.push({ x: hairSpineData[i].x - Nx * halfWidth, y: hairSpineData[i].y - Ny * halfWidth });
    }
    // construct the skin shap path ... 
    let dStr = "M ";
    const { x, y } = upperSegPoints[0];
    dStr += `${x}, ${y} `;
    for( let i=1; i < upperSegPoints.length; i++ ) {
        const { x, y } = upperSegPoints[ i ];
        dStr += `L ${x}, ${y} `;
    }
    // reverse the array direction for lowerpoints 
    for( let i = lowerSegPoints.length-1; i >= 0; i-- ) {
        const { x, y } = lowerSegPoints[ i ];
        dStr += `L ${x}, ${y} `;
    }
    dStr += "Z";
    let pathData = dStr;
    this.hairShape.setAttribute( "d", pathData );
    this.hairShape.setAttribute( 
      "transform", 
      "translate( -53 -15 )" 
    );
  }




  /**
   * Render the mermaid sprite based on segment data from the 
   * FixedPointSkeleton component ...
   */
  render() {
      const spineData = this.skeleton.spine;
      // -- RENDER THE TAIL SHAPE PROCEDURALLY ----
      this.renderTail(spineData);
      // -- ATTACH TAIL FINS ----------
      // todo: store tail segment index as object property?
      const tailSeg = this.skeleton.getSpineSegmentData( 
        spineData.length - 1
       );
      this.tailGroup.setAttribute(
        'transform', 
        `translate( ${tailSeg.x-2 },  ${tailSeg.y+1} ) rotate( ${tailSeg.angleDeg} )`
      );

      // -- ROTATE THE TORSO ----------
      const torsoSeg = this.skeleton.getSpineSegmentData( 0 );
      this.torsoGroup.setAttribute(
        'transform', 
        `rotate( ${ (tailSeg.angleDeg) * 0.15 } )`
      );


      // mermaid hair ... 
      this.renderHair( this.hairSkeleton.spine );

      // const hairShapeData = this.hairSkeleton.getPathData();
      // this.hairShape.setAttribute(
      //   "d", hairShapeData

      // );

  }

}

// ------------  HERE BE SEA WEED  --------------------------------

export class SeaweedSprite {

    constructor( svgGroupElement, skeleton ) {
      this.spriteGroup = svgGroupElement;
      this.skin = svgGroupElement.querySelector( "#seaweed_path" ); 
      this.skeleton = skeleton;

      // generate init curve ... 
      this.skeleton.update(0);
      this.render();

    }

    update( deltaTime ) {
      // 1. Update the ribbon component's internal calculations
      this.skeleton.update(deltaTime);

    }

    render() {
        // 1. Render the sprite based on path data from the 
        // FixedPointSkeleton component ...
        const pathData = this.skeleton.getPathData();
        this.skin.setAttribute( "d", pathData );


    }

}


// ------------  HERE BE DRAGONS ----------------------------------
export class DragonSprite { 

  constructor( svgGroupElement, skeleton )  {

    this.spriteGroup = svgGroupElement;
    this.skin = svgGroupElement.querySelector( "#dragon_sprite_body_skin" );
    // Composition: The DragonSprite HAS-A SerpantineSkeleton
    this.serpentineSkeleton = skeleton;

    this.headGroup     = svgGroupElement.querySelector( "#head" );
    this.frontLegGroup = svgGroupElement.querySelector( "#leg_front" );
    this.rearLegGroup  = svgGroupElement.querySelector( "#leg_rear" );
    this.tailQuillsGroup = svgGroupElement.querySelector( "#tail" );

    // set indices for attachements...
    this.headSegmentIndex = this.serpentineSkeleton.numSamples - 1;
    this.tailSegmentIndex = 0; 
    this.frontLegIndex = Math.floor( 0.80 * this.serpentineSkeleton.numSamples );
    this.rearLegIndex  = Math.floor( 0.30 * this.serpentineSkeleton.numSamples );

    this.initSVG(); 

  }

  doAppendages() {

    // attach the head 
    const headSeg = this.serpentineSkeleton.getSpineSegmentData( this.headSegmentIndex );
    this.headGroup.setAttribute(
      'transform', 
      `translate( ${headSeg.x + headSeg.segmentVector.dx},  ${headSeg.y+headSeg.segmentVector.dy} ) rotate( ${headSeg.angleDegrees} )`
    );
    // attach the tail
    const tailSeg = this.serpentineSkeleton.getSpineSegmentData( this.tailSegmentIndex );
    this.tailQuillsGroup.setAttribute(
      'transform', 
      `translate( ${tailSeg.x },  ${tailSeg.y} ) rotate( ${tailSeg.angleDegrees} )`
    );
    // attach the front leg
    const fLegSeg = this.serpentineSkeleton.getSpineSegmentData( this.frontLegIndex );
    this.frontLegGroup.setAttribute(
      'transform', 
      `translate( ${fLegSeg.x },  ${fLegSeg.y} ) rotate( ${fLegSeg.angleDegrees} )`
    );
    // attach the rear leg
    const rLegSeg = this.serpentineSkeleton.getSpineSegmentData( this.rearLegIndex );
    this.rearLegGroup.setAttribute(
      'transform', 
      `translate( ${rLegSeg.x },  ${rLegSeg.y} ) rotate( ${rLegSeg.angleDegrees} )`
    );
  }

  initSVG() {
    // generate init curve ... 
    this.serpentineSkeleton.update(0);
    this.render();
    // You can manage z-index by appending order, e.g., legs before ribbon if they go under.
    // this.mainDragonGroup.insertBefore(this.frontLegElement, this.ribbonPathElement);
  }

  update(deltaTime) {
    // 1. Update the ribbon component's internal calculations
    this.serpentineSkeleton.update(deltaTime);


    // You can also add secondary animations for legs here, e.g.:
    // const legPhase = (this.ribbonComponent.phase + (frontLegData.x / 10)) * 5; // Example
    // this.frontLegElement.setAttribute('transform', `translate(...) rotate(...) rotate(${Math.sin(legPhase) * 15})`);

  }

  render() {
    // 1. Render the sprite based on path data from the SerpantineSkeleton component
    const pathData = this.serpentineSkeleton.getPathData();
    this.skin.setAttribute( "d", pathData );
    this.doAppendages();
  }
}



// ------------  HERE BE CENTIPEDES ----------------------------------
/**
 * Configuration options for a Centipede Sprite Skeleton
 * 
 * The number of segments is determined by the number of samples 
 * (10 for the centipede).
 * 
 * I want the pede spine to map to 1/2 of a sine period. So:
 * 
 *   1. SET LENGTH TO 100
 *   2. SET WAVE LENGTH TO 200 
 * 
 * Lambda 2X the length gives you half a period for the spine actions...  
 */
export const  centipedeSkeletonConfig = {
    numSamples: 10,
    length: 100,
    wavelength: 200,
    width: 10,
    shift: 10
}

/**
 * Centipede Sprite. 
 * 
 * Based on this cute little bugger ... 
 * https://commons.wikimedia.org/wiki/File:Scutigera_coleoptrata_2.jpg
 * 
 * More nature inspired art... 
 */
export class CentipedeSprite { 

  /**
   * Use the c-tor to set up the SVG parts ... 
   * 
   * There is a body segment that can attach to spine segments
   * Legs too. Upper and lower. (note: the naming got messed up
   * but doesn't matter ... think upper is lowr...)
   * 
   * @param {*} svgGroupElement SVG g root for the sprite ... 
   * @param {*} skeleton  The skeleton component (SEE CONFIG ABOVE)
   */
  constructor( svgGroupElement, skeleton )  {
    this.spriteGroup = svgGroupElement;
    // Composition: The DragonSprite HAS-A SerpantineSkeleton
    this.serpentineSkeleton = skeleton;
    // Set up sprite SVG
    this.headGroup = svgGroupElement.querySelector( "#head" );
    this.tailGroup = svgGroupElement.querySelector( "#tail" );
    this.bodySegment = svgGroupElement.querySelector( "#body" );
    this.upperLegGroup = svgGroupElement.querySelector( "#leg_front_upper" );
    this.lowerLegGroup = svgGroupElement.querySelector( "#leg_front_lower" );

    for( let i =0 ; i < this.serpentineSkeleton.numSamples ; i++ ) {
      const segment = this.bodySegment.cloneNode( true ); 
      segment.setAttribute( "id", `body-segment-${i}` )
      // upper legs
      const segUL = this.upperLegGroup.cloneNode(true);
      segUL.setAttribute( "id", `body-upper-leg-${i}` );
      // lower legs
      const segLL = this.lowerLegGroup.cloneNode(true);
      segLL.setAttribute( "id", `body-lower-leg-${i}` );
      // document order layers body on top of legs
      this.spriteGroup.appendChild( segUL );
      this.spriteGroup.appendChild( segLL );
      this.spriteGroup.appendChild( segment );
    }

    this.bodySegment.setAttribute( "display", "none" );
    this.lowerLegGroup.setAttribute( "display", "none" );
    this.upperLegGroup.setAttribute( "display", "none" );

    // Initial update of skeleton to do first sample 
    // and intialize data...
    this.serpentineSkeleton.update(0);
    
    // set indices for head and tail attachements...
    this.headSegmentIndex = this.serpentineSkeleton.numSamples - 1;
    this.tailSegmentIndex = 0;
    // initial render to set transforms ... 
    this.render();

  }

  /**
   * Update function for the sprite. 
   * 
   * shift and resample the skeleton ... 
   * 
   * @param {*} deltaTime 
   */
  update(deltaTime) {
    // update the skeleton 
    this.serpentineSkeleton.update(deltaTime);
  }

  /**
   * Render function for the sprite. In SVG render is somewhat  of a misnomer. 
   * What it really does is update the SVG transformations which *causes* the
   * browser to render ... 
   */
  render() {
    // Do transforms on all the body segments... 
    const bodySegments = this.spriteGroup.querySelectorAll('g[id*="body-segment"]');
    const llSegments = this.spriteGroup.querySelectorAll('g[id*="body-lower-leg"]');
    const ulSegments = this.spriteGroup.querySelectorAll('g[id*="body-upper-leg"]');
    for( let i =0 ; i < this.serpentineSkeleton.numSamples ; i++ ) {
      const spineSegment = this.serpentineSkeleton.getSpineSegmentData( i );
      let tranStr = "";
      tranStr += "translate( ";
      tranStr += spineSegment.x + " " + spineSegment.y;
      tranStr += " ) rotate( ";
      tranStr += spineSegment.angleDegrees;
      tranStr += " )";
      bodySegments[i].setAttribute( "transform", tranStr );
      llSegments[i].setAttribute( "transform", tranStr );
      ulSegments[i].setAttribute( "transform", tranStr );
    }
    // Transform the head 
    const headSeg = this.serpentineSkeleton.getSpineSegmentData( this.headSegmentIndex );
    this.headGroup.setAttribute(
      'transform', 
      `translate( ${headSeg.x + headSeg.segmentVector.dx},  ${headSeg.y+headSeg.segmentVector.dy} ) rotate( ${headSeg.angleDegrees} )`
    );
    // Transform the tail
    const tailSeg = this.serpentineSkeleton.getSpineSegmentData( this.tailSegmentIndex );
    this.tailGroup.setAttribute(
      'transform', 
      `translate( ${tailSeg.x},  ${tailSeg.y} ) rotate( ${tailSeg.angleDegrees} )`
    );

  }
}

