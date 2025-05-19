
const boneButton  = document.getElementById ( "bone_button" );
const saveButton  = document.getElementById ( "save_svg" );

saveButton.addEventListener(
    'click',
    function() {
        const svgEl = document.querySelector('svg');
        downloadSvg(svgEl, 'fk_snapshot.svg');
        alert( "SVG Download Link Created!" );
    }
);

boneButton.addEventListener(
    'click',
    addBone
); 

/**
 * CONVERT CLIENT COORDS TO SVG COORDS
 * @returns SVG POINT
 * 
 * TOD0: ABSTRACT OUT TO UTILITIES ...
 */
function getSVGPoint(svg, clientX, clientY) {
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const svgPoint = pt.matrixTransform( svg.getScreenCTM().inverse() );
    return svgPoint;
}

/**
 * Get angle of mouse coords *RELATIVE to axes with LOCAL PIVOT POINT*
 * @returns angle in degrees from arctan2 (range -180 to 180 with + 90
 * pointing *down* as in CG systems)...
 * 
 * 
 */
function getDirection(pivotX, pivotY, svgX, svgY ) {
    const radians = Math.atan2( svgY - pivotY, svgX - pivotX );
    const degrees = radians * ( 180 / Math.PI );
    return degrees;
}

/**
 * Get Euclidean Distance between 2 points in SVG ...
 * 
 * @param {*} svgP0 
 * @param {*} svgP1 
 * @returns 
 */
function getSvgDistance( svgP0, svgP1 ) {
    return ( 
        Math.sqrt ( 
            Math.pow( (svgP1.x - svgP0.x), 2 ) + Math.pow( (svgP1.y - svgP0.y), 2 ) 
        ) 
    )
}

export class Bone {
    constructor(svgGroupElement, boneData) {
      this.el = svgGroupElement;     
      this.data = boneData;
      this.origin       = this.el.querySelector('[id^="origin_"]');
      this.direction    = this.el.querySelector('[id^="arrow_head_"]');
      this.lengthMarker = this.el.querySelector( '[id^="length_marker_"]' );

      this.dragEvent = {
        initDrag: ( e ) => {
            e.stopPropagation();
            this.dragging = true;
            // the screen transformation matrix
            const CTM = this.origin.getScreenCTM();
            const p = this.origin.ownerSVGElement.createSVGPoint();
            p.x = e.clientX;
            p.y = e.clientY;
            const svgLoc = p.matrixTransform(  CTM.inverse() );
            this.startingPoint = svgLoc;
            this.currentTransform = this.el.transform.baseVal.consolidate()?.matrix ;
        },
        endDrag: ( e ) => {
            e.stopPropagation();
            this.dragging=false;
        },
        drag: ( e ) => {
            e.stopPropagation();
            if( ! this.dragging ) return;
            const p = this.origin.ownerSVGElement.createSVGPoint();
            p.x = e.clientX;
            p.y = e.clientY;
            const CTM = this.origin.getScreenCTM();
            const svgLoc = p.matrixTransform(  CTM.inverse() );
            const delX = svgLoc.x - this.startingPoint.x;
            const delY = svgLoc.y - this.startingPoint.y;
            // update transform on the g element
            const nextTransform = this.currentTransform.translate(delX, delY);
            const matrixStr = 
                `matrix( ${nextTransform.a} ${nextTransform.b} ${nextTransform.c} ${nextTransform.d} ${nextTransform.e} ${nextTransform.f} )`;
            this.el.setAttribute( "transform", matrixStr );
            document.getElementById( "coords_display" )
                .innerText=`( ${ nextTransform.e.toFixed(2)  } , ${  nextTransform.f.toFixed(2)  } )`;
            document.getElementById( "screen_coords_display" )
                .innerText=`( ${ e.clientX.toFixed(2) } , ${ e.clientY.toFixed(2) } )`;
        }
      };

      this.rotationEvent = {
          startAngle: 0,
          rotationStart : (evt) => {
            evt.stopPropagation();
            const svgMouseCoords = getSVGPoint( this.el.ownerSVGElement, evt.clientX, evt.clientY );
            // GET THE PIVOT POINT FROM Tx MATRIX
            const currentTransformMatrix = this.el.transform.baseVal.consolidate()?.matrix ;
            const tx = currentTransformMatrix.e ;
            const ty = currentTransformMatrix.f ;
            this.pivotPoint = { x: tx, y: ty };

            this.rotationEvent.startAngle = getDirection( 
                tx, 
                ty, 
                svgMouseCoords.x, 
                svgMouseCoords.y 
            );
            this.rotating = true;
          },

          rotate : (evt) => {
              evt.stopPropagation();
              if ( !this.rotating ) return;
              // GET THE PIVOT POINT FROM Tx MATRIX
              const currentTransformMatrix = this.el.transform.baseVal.consolidate()?.matrix ;
              const tx = currentTransformMatrix.e ;
              const ty = currentTransformMatrix.f ;
              this.pivotPoint = { x: tx, y: ty };

              // get the mouse coords in SVG
              const svgMouseCoords = getSVGPoint( this.el.ownerSVGElement, evt.clientX, evt.clientY );
              const mouseX = svgMouseCoords.x;
              const mouseY = svgMouseCoords.y;
              // Get the direction as an angle
              const angle = getDirection( this.pivotPoint.x, this.pivotPoint.y, mouseX, mouseY );
              document.getElementById( "angle_display" ).innerText=`( ${ Math.round( angle ) } )`;
              const deltaAngle = angle - this.rotationEvent.startAngle;

              // ROTATION MATH
              // create a rotation matrix to encapsulate the deltas
              // note that we (1) UNDO translation (moves to origin) 
              // (2) do the rotation and (3) REDO the translation
              // to get the matrix. The operations show in reverse order 
              // in code...
              const rotationMatrix = this.el.ownerSVGElement.createSVGMatrix()
                  .translate( tx, ty )
                  .rotate( deltaAngle )
                  .translate( -tx, -ty );
              // get the NEW transformation matrix to transition into...
              // Matrix multiply the current transform matrix by the 
              // rotation matrix...
              const nextTransformMatrix = rotationMatrix.multiply( currentTransformMatrix );
            // UPDATE The transform attribute on the bone group...
            const matrixStr = 
                `matrix( ${nextTransformMatrix.a} ${nextTransformMatrix.b} ${nextTransformMatrix.c} ${nextTransformMatrix.d} ${nextTransformMatrix.e} ${nextTransformMatrix.f} )`;
            this.el.setAttribute( "transform", matrixStr );
            // important! update startangle post condition
            // else you loose control...
            this.rotationEvent.startAngle = angle;
            
          },

          rotationEnd : (evt) => {
              evt.stopPropagation();
              this.rotating = false;

          },

      };

      this.lengthChangeEvent = {

        start : (evt) => {
            evt.stopPropagation();
            this.lengthening = true ; 
        },

        drag: ( evt ) => {
            evt.stopPropagation();
            if( ! this.lengthening ) return;
            // GET THE CURSOR COORDINTATES IN SVG USER COORD SYSTEM 
            const mouseSvgCoords = getSVGPoint( this.el.ownerSVGElement, evt.clientX, evt.clientY );
            // GET THE BONE TRANSFORM MATRIX FOR PURE SVG USER COORDS ( i.e.., no screen BULLSHIT )
            const boneTransformMatrix = this.el.transform.baseVal.consolidate()?.matrix;
            // GET THE UNTRANSFORMED ORIGIN COORDS into an SVG Point
            const boneLocalOrigin = this.el.ownerSVGElement.createSVGPoint();
            boneLocalOrigin.x = parseFloat( this.origin.getAttribute("cx") );
            boneLocalOrigin.y = parseFloat( this.origin.getAttribute("cy") );
            const boneOriginTransformed = boneLocalOrigin.matrixTransform( boneTransformMatrix );
            // GET THE EUCLIDEAN DISTANCE FROM CURSOR TO TRANSFORMED BONE ORIGIN
            const distance = getSvgDistance( boneOriginTransformed, mouseSvgCoords );
            // PROJECT THE NEW LENGTH ONTO THE X AXIS OF THE GROUP'S LOCAL COORDINATE SYSTEM
            // (WORKS BECAUSE THE BONE'S INITIAL ORIENTATION IS ZERO DEGREES
            // IN THE SVG INITIAL COORDINATE SYSTEM)
            this.lengthMarker.setAttribute( "cx", distance );
        },

        end: (evt) => {
            this.lengthening = false ; 
        },

      };

      this._initEventListeners();
      this._lengthFromSvg();

    }

    /**
     * Get the Euclidian distance from bone origin to the SVG arrow tip.
     * Get the arrow tip through regex matching the relevant SVG path data...
     */
    _lengthFromSvg() {
        const x = parseFloat( this.lengthMarker.getAttribute( "cx" ) );
        const y = parseFloat( this.lengthMarker.getAttribute( "cy" ) );
        // Euclidean distance
        const length = Math.hypot(
            x - parseFloat( this.origin.getAttribute("cx") ), 
            y - parseFloat( this.origin.getAttribute("cy"))
        );
        this.data.length = length;
    }
  
    _initEventListeners() {
        this.origin.addEventListener(
            'mousedown',
            (e) => { this.dragEvent.initDrag ( e ); }
        );
        window.addEventListener(
            'mousemove',
            (e) => { this.dragEvent.drag ( e ); }
        );
        window.addEventListener(
            'mouseup',
            (e) => { this.dragEvent.endDrag ( e ); }
        );

        this.direction.addEventListener(
            'mousedown',
            (evt) => { this.rotationEvent.rotationStart(evt) }
        );
        window.addEventListener(
            'mousemove',
            (evt) => { this.rotationEvent.rotate(evt) }
        );
        window.addEventListener(
            'mouseup',
            (evt) => { this.rotationEvent.rotationEnd(evt) }
        );
        this.lengthMarker.addEventListener(
            'mousedown',
            (evt) => { this.lengthChangeEvent.start(evt) }
        );
        window.addEventListener(
            'mousemove',
            (evt) => { this.lengthChangeEvent.drag(evt) }
        );

        window.addEventListener(
            'mouseup',
            (evt) => { this.lengthChangeEvent.end(evt) }
        );
    }
}


let counter = 0;
function generateUid( clone ) {
    ++counter;
    clone.setAttribute("id", `bone_${counter}` );
    clone.querySelector( "#shape_0" ).setAttribute( "id", `shape_${counter}` );
    clone.querySelector( "#axes_0" ).setAttribute( "id", `axes_${counter}` );
    clone.querySelector( "#origin_0" ).setAttribute( "id", `origin_${counter}` );
    clone.querySelector( "#arrow_head_0" ).setAttribute( "id", `arrow_head_${counter}` );
    clone.querySelector( "#length_marker_0" ).setAttribute( "id", `length_marker_${counter}` );
}

let bCount = 0;
function addBone(  ) {
    const BONE_LAYER_ID = "bone_layer";
    const template = document.getElementById("bone_0");
    const clone    = template.cloneNode(true);
    generateUid(clone);
    clone.setAttribute("transform", `translate( 0 0) rotate( 0 )`);
    document.getElementById("bone_layer").appendChild(clone);

    bCount ++ ;
    boneButton.setAttribute("disabled", true);

    const testBone = new Bone( 
        clone, 
        {
            x: clone.querySelector('[id^="origin_"]').getAttribute("cx"),
            y: clone.querySelector('[id^="origin_"]').getAttribute("cy"),
            angle: 0,
            length: 0,
            parent:null,
            children: []
        } 
    );

}

