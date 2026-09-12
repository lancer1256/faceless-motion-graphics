// src/shaders/objectMasks/diamondGrid.js
// ▸ Works whether or not the mesh has real UVs.
// ▸ No reliance on Three’s USE_UV define.
// ▸ Still uses your snippet-injection pipeline (no extra main()).

export const objectMaskShader = {

    customUniforms: {
      gridScale: { value: 12.0 }   // diamonds per 1 UV-ish unit
    },
  
    /* 1.  Declare our own varying (no assignment yet) */
    vertexShader: `
      varying vec2 vMaskUv;
    `,
  
    /* 2.  Helper + varying declaration for fragment stage */
    fragmentShader: `
      varying vec2 vMaskUv;
  
      vec4 diamondGridMask(vec4 col, float p, float scale){
          /* cell in [-½,+½]^2 */
          vec2 cell = fract(vMaskUv * scale) - 0.5;
          float d = abs(cell.x) + abs(cell.y);   // diamond contour
          col.a *= step(d, p);                   // keep if inside
          return col;
      }
    `,
  
    /* 3.  Insert TWO small code blocks at the proper hooks */
    injectionPoint: {
      /* ─ vertex: run AFTER built-in <begin_vertex> so position is set */
      hook: '#include <begin_vertex>',
      code: `
          /* After begin_vertex, transformed position is in position.
             Map XY world units to a stable 0-1 grid. */
          vMaskUv = transformed.xy;
          vMaskUv *= 0.05;         // simple world-→-grid scale
      `
    },
  
    /* 4.  Because our structure allows one injectionPoint, we embed
          the fragment call via a second unique marker that’s always
          present: <dithering_fragment>. */
    injectionPointFragment: {      // <<< new key we’ll read in helper
      hook: '#include <dithering_fragment>',
      code: `
  gl_FragColor = diamondGridMask(gl_FragColor, progress, gridScale);
  #include <dithering_fragment>
      `
    }
  };
  