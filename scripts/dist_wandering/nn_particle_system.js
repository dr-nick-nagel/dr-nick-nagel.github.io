
export class ParticleSystem {

    constructor( svgRoot ) {
        this.svgRoot = svgRoot;
        this.particles = [];
        this.particleGroup = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "g"
        );
        this.particleGroup.setAttribute( "id", "particle_group" );
        this.svgRoot.appendChild( this.particleGroup );
    }

    addParticle( particle ) {
        this.particles.push( particle );
        this.particleGroup.appendChild( particle.svg );
    }

    /**
     * Ensure it handles cleanup like removing isteners and/or DOM elements ...
     */
    removeParticle( particle ) {
        if( particle.svg ) {
            particle.svg.remove(); // remove svg from dom...
        }
        const idx = this.particles.indexOf( particle );
        this.particles.splice( idx, 1 );
    }

    // TODO: optimize by not doing dom manipulations in loops
    // SEE: https://chatgpt.com/c/678a75ce-2f10-8010-9827-14554ef186a7

    /**
     * Update the particles. particles will know how to update
     * themselves. Reverse iteration because particlels may call
     * to remove themselves from the array ... 
     * 
     * @param {float} deltaTime   time in seconds
     */
    update( deltaTime ) {
        for( let i = this.particles.length-1; i >=0 ; i -- ) {
            this.particles[i].update( deltaTime );
        }
    }

}
