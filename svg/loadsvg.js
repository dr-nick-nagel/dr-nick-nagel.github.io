/**
 * Load and parse an SVG document given a URL. 
 * Put the SVG root on the DOM and return a handle 
 * to it.
 *
 * @param( string ) url a url pointing to the document.
 * @param( string ) ReplaceNodeId the id of the svg placeholder 
 * node to replace...
 * 
 * @returns The SVG root node...
 */
async function loadSvg( url, domId ) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const svgText = await response.text();
        
        // Parse the fetched SVG text into a DOM element
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
        const svgRoot = svgDoc.documentElement;
        // Find the placeholder SVG node and *replace* it
        const targetElement = document.getElementById( domId );
        // Check for dom isertion point...
        if (targetElement && targetElement.tagName.toLowerCase() === 'svg') {
            targetElement.replaceWith( svgRoot ); // Swap the nodes
        } else {
            console.error(
              `Target element with ID "${targetElementId}" is not a valid <svg> node.`
            );
        }
        return svgRoot;
    } catch (error) {
        console.error(`Error loading SVG from ${url}:`, error);
    }
}


