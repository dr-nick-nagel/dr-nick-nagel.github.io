// Load and parse an external SVG file and append it to the DOM
export let TEST_FILE     = "./svg/fk_bone_design.svg";
export let CONTAINER_ID  = "svg_container";

export async function loadAndInsertSVG(url, containerId) {
    try {

      if( url === undefined ) {
          url = TEST_FILE;
      }

      if( containerId === undefined ) {
        containerId = CONTAINER_ID;
      }

      const response = await fetch(url);
      const svgText  = await response.text();
  
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
      const svgElement = svgDoc.documentElement;
  
      // Optional: Set an ID or class for the inserted SVG
      svgElement.id = "svg_root";

      //---------  TEMP TESTING  ------------

      svgElement.setAttribute("width",  "20");
      svgElement.setAttribute("height", "20");
      svgElement.setAttribute("viewBox", "-10 -10 20 20");

      // --------- END  TEMP TESTING  ------------
  
      // Attach to the desired DOM container
      const container = document.getElementById(containerId);
      container.appendChild(svgElement);

    } catch (error) {
      console.error("Error loading SVG:", error);
    }
}


// ---- DOWNLOAD SVG -----------------

/**
 * Download and save the SVG in the work area given:
 * 
 * @param {*} svgElement a handle to the svg root
 * @param {*} filename   name of file to save to (default provided)
 */
export function downloadSvg(svgElement, filename = 'snapshot.svg') {
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgElement);

  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url); // Clean up
}








