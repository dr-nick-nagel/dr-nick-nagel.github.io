export const SVG_NS = "http://www.w3.org/2000/svg";

export class RibbonSprite  {

  constructor( 
    svgRibbonShape,  
    numSamples,
  ) {

    
    this.svgRibbonShape = svgRibbonShape;
    this.numSamples = numSamples ? numSamples : 10;

    this.upperPoints  = [];
    this.lowerPoints  = [];
    this.spine = [];

    this. ribbonWidth  = 10; 
    this. ribbonLength = 200;
    this. midline      = 50;

    this.phase = 0;
    this.shift = 0.05;
    this. amplitude    = 10;
    this. wavelength   = 200;





  }


  updateSamples() {

    this.upperPoints.length = 0;
    this.lowerPoints.length = 0;
    this.spine.length       = 0;
  
    this.phase += this.shift; 
  
    for ( let i = 0; i <= this.numSamples; i++ ) {
      const x = i / this.numSamples * this.ribbonLength ; 
      // compute the spine data sample 
      const yCenter =  
        this.midline + this.amplitude * Math.sin( 
          ( 2 * Math.PI * x / this.wavelength ) + this.phase 
        ); 
      this.spine.push( {x: x, y: yCenter} );
      // get the upper and lower edge points...
      // Calculate derivative dy/dx
      // dy/dx = A * (2pi/lambda) * cos( (2pi*x/lambda) + phi )
      // see: https://https://dr-nick-nagel.github.io/blog/ribbon-effect.html
      const B = (2 * Math.PI / this.wavelength); 
      const dy_dx = this.amplitude * B * Math.cos( (B * x) + this.phase );





      // Tangent vector (Tx, Ty) = (1, dy_dx)
      // const Tx = 1;

      const Ty = dy_dx;
      const TanVector = [ 1, dy_dx ];



      // console.log ( TanVector ) ;
      // tanVectors.push( TanVector );
  
      // GET THE  Perpendicular vector (Px, Py) = (-Ty, Tx)

      let Px = -Ty;
      let Py = Tx;

      const PerpVector = [ Px, Py ];

      // console.log ( PerpVector ) ;
      // perpVectors.push( PerpVector );
  
      // Normalize the PERPS to get the NORMALS 
      const magnitudeP = Math.sqrt(Px*Px + Py*Py);
      let Nx = Px;
      let Ny = Py;
      Nx /= magnitudeP;
      Ny /= magnitudeP;
      const NormalVector = [ Nx, Ny ];

      // console.log ( PerpVector ) ;
      // normalVectors.push( NormalVector );
  
      // Calculate upper and lower points

      const upperX = x + Nx * this.ribbonWidth / 2;
      const upperY = yCenter + Ny * this.ribbonWidth / 2;
  
      const lowerX = x - Nx * this.ribbonWidth / 2;
      const lowerY = yCenter - Ny * this.ribbonWidth / 2;
  
      this.upperPoints.push({x: upperX, y: upperY});
      this.lowerPoints.push({x: lowerX, y: lowerY});
  
    }
  }
  







  render(  ) {

    // draw the path

    // trigger the (re)rendering of SVG 

    this.svgShapePath.data = svgPathData;

  }



}



