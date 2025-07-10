/**
 * Copy svg to clipboard 
 * 
 * support copy to clipboard ...
 *
 * @param {string} svgStr - expects a well-formed svg as string to put it on the clipboard 
 *   as a recognized 'image/svg+xml' type
 * 
 * @returns {Promise<boolean>} - A Promise that resolves to true if the copy
 * operation was successful, or false if it failed.
 */
export async function copySvgToClipboard( svgStr ) {
    try {
        // Check if the Clipboard API is available in the browser
        if ( navigator.clipboard && navigator.clipboard.writeText ) {
            await navigator.clipboard.writeText( svgStr );
            alert ('Data copied to clipboard.');
            return true;
        } else {
            alert('Sorry -- your browser will not support copy.');
            return false;
        }
    } catch (err) {
        console.error('Error copying data to clipboard: ', err);
        return false;
    }
}
