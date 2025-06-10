/**
 * Quick One-Off director namespace object to run the animation loop
 * for the "Road to Oz" illustration ... 
 * 
 * NOTE TO SELF: Keep this isolated! No unwanted side effects please!
 * 
 */
export const OzLoopDirector = {
    
    timeLess1 : null,
    rafId:      null,
    bubbleEmitter : null,

    animLoop : function (timestamp) {
      if (! this.timeLess1 ) this.timeLess1 = timestamp;
      let dt = timestamp - this.timeLess1;
      this.timeLess1 = timestamp;
      this.glindaUpdate( dt) ;
      this.sparkleEmitter.update( dt );
      requestAnimationFrame( this.animLoop.bind(this) );
    },

    startAnim : function () {
        console.log( "OzDirector: off to see the Wiz..." );
        if( ! this.glindaSprtGrp ) {
            this.glindaSprtGrp = document.getElementById( "glinda_container" )
        }
        this.bubbleEmitter = BubbleEmitter;
        if ( ! this.sparkleEmitter.container ) {
            const svg = document.getElementById("svg_slide_4");
            this.sparkleEmitter.init(svg);
        }
        this. rafId = requestAnimationFrame( this.animLoop.bind(this) );
    },

    stopAnim : function () {
        cancelAnimationFrame( this.rafId );
    },

    t: 0,
    duration: 10_000,
    glindaSprtGrp: document.getElementById( "glinda_container" ),

    glindaUpdate: function ( dt ) {
        this.t = (this.t + dt) % this.duration;
        // Normalize 0 → 1
        let progress = this.t / this.duration;
        // Reflect back (0 → 1 → 0)
        let reflected = progress < 0.5
          ? progress * 2
          : (1 - progress) * 2;
        // Path: move & scale
        // gentle curve
        let x = 80 - 20 * Math.sin(reflected * Math.PI); 
        //let y = 100 - 80 * reflected; // upward
        // use parametric math for easier tweaking
        let yBase = 80;
        let yAmplitude = 60;
        let y = yBase - yAmplitude * reflected;

        let s = 1 - 0.7 * reflected; // scale down
        this.glindaSprtGrp.setAttribute(
            "transform", `translate(${x},${y}) scale(${s})`
        );
        // trigger bubble emitter at current position
        this.bubbleEmitter.updateBubbles(dt, x, y);

    } ,

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    sparkleEmitter : {
        container: null, // SVG group for sparkles
        particles: [],
        maxParticles: 50,
        spawnRate: 0.05, // particles/ms
        timeSinceLastSpawn: 0,
    
        init( svgRoot ) {
            this.container = document.createElementNS("http://www.w3.org/2000/svg", "g");
            this.container.setAttribute("id", "oz_sparkle_cloud");
            svgRoot.getElementById("bubble_layer_lower").appendChild(this.container);
        },
    
        update( dt ) {
            this.timeSinceLastSpawn += dt;
            while (this.timeSinceLastSpawn > 1000 * this.spawnRate && this.particles.length < this.maxParticles) {
                this.spawnParticle();
                this.timeSinceLastSpawn -= 1000 * this.spawnRate;
            }
    
            // Update & fade particles
            this.particles = this.particles.filter(p => {
                p.age += dt;
                const lifeRatio = p.age / p.lifespan;
                if (lifeRatio > 1) {
                    this.container.removeChild(p.el);
                    return false;
                }
                const scale = 0.8 + 0.3 * Math.sin(p.age * 0.01); // bob
                p.el.setAttribute("transform", `translate(${p.x},${p.y}) scale(${scale})`);
                p.el.setAttribute("opacity", `${1 - lifeRatio}`);
                return true;
            });
        },
    
        spawnParticle() {
            const sparkle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            const x = 75 + (Math.random() - 0.5) * 30; // Centered over Oz
            const y = 20 + (Math.random() - 0.5) * 20;
            const size = 0.25 + Math.random() * 0.1;
            sparkle.setAttribute("r", size);
            sparkle.setAttribute("fill", "yellow");
            sparkle.setAttribute("opacity", "0.7");
            this.container.appendChild(sparkle);
            this.particles.push({
                el: sparkle,
                x,
                y,
                age: 0,
                lifespan: 2000 + Math.random() * 2000,
            });
        }
    },
    
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


    test: function () {
        console.log("testing 1,23,");
        // console.log( this.glindaSprtGrp );
    }

}


export const BubbleEmitter = {
    bubbles: [],
    parent: null,
    maxBubbles: 100,
    spawnInterval: 200, // ms
    lastSpawn: 0,
  
    emitAt(x, y) {

      if (! this.parent) this.parent=document.getElementById("bubble_layer_lower");

      const r = 5 + Math.random() * 5;
      const angle = Math.random() * 2 * Math.PI;
      const radius = 20; // Glinda's main bubble radius
      const offsetX = Math.cos(angle) * Math.random() * radius;
      const offsetY = Math.sin(angle) * Math.random() * radius;
  
      const bubble = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      bubble.setAttribute("cx", x + offsetX);
      bubble.setAttribute("cy", y + offsetY);
      bubble.setAttribute("r", r.toFixed(1));
      bubble.setAttribute("fill", "white");
      bubble.setAttribute("opacity", 0.25);
  
      this.parent.appendChild(bubble);
  
      this.bubbles.push({
        el: bubble,
        x: x + offsetX,
        y: y + offsetY,
        r,
        ttl: 3000 + Math.random() * 1000,
        age: 0,
        bobPhase: Math.random() * 2 * Math.PI,
        bobAmp: 2 + Math.random() * 2, // gentle bobbing
        bobSpeed: 1 + Math.random() * 2,
      });
  
      // Cap total number of bubbles
      if (this.bubbles.length > this.maxBubbles) {
        if (! this.parent) this.parent=document.getElementById("bubble_layer_upper");
        const dead = this.bubbles.shift();
        this.parent.removeChild(dead.el);
      }
    },
  
    updateBubbles(dt, x, y) {
      this.lastSpawn += dt;
      if (this.lastSpawn >= this.spawnInterval) {
        this.lastSpawn = 0;

        this.emitAt(x, y);

      }
  
      for (let i = this.bubbles.length - 1; i >= 0; i--) {
        const b = this.bubbles[i];
        b.age += dt;
  
        if (b.age > b.ttl) {
          this.parent.removeChild(b.el);
          this.bubbles.splice(i, 1);
          continue;
        }
  
        // Bobbing animation (horizontal sine wave)
        const bobOffset = b.bobAmp * Math.sin((b.age / 1000) * b.bobSpeed + b.bobPhase);
        b.el.setAttribute("cx", (b.x + bobOffset).toFixed(1));
      }
    }
  };
  

