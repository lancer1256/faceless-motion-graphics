// src/shaders/objectMasks/diamondGridMask.js
export const objectMaskShader = {
    // Define any custom uniforms you want beyond "progress":
    // e.g. diamondFrequency (how many diamonds per 1.0 in UV),
    //      feather (soft edge width).
    customUniforms: {
        diamondFrequency: { value: 8.0 }, // # of diamonds across the object
        feather: { value: 0.05 }         // smooth edge width
    },

    // Optionally add text to the vertexShader if you need varyings
    // for a more advanced effect. For now, it's empty.
    vertexShader: `
        // (No special vertex modifications needed for this mask)
    `,

    // The snippet you'll inject into the final fragment shader:
    fragmentShader: `
        // We assume 'progress' is a uniform from the base system,
        // plus we have diamondFrequency, feather from customUniforms.
        // vUv is typically in [0..1], so we tile it to get a repeated grid.
        
        float diamondGridMask(vec2 uv, float progress, float diamondFreq, float feather) {
            // Scale up the UV coordinates
            uv *= diamondFreq;
            
            // The cell coordinate
            vec2 cell = floor(uv);
            // The fractional part (0..1) centered around 0 => range -0.5..+0.5
            vec2 f = fract(uv) - 0.5;
            
            // L1 distance from cell center => diamond shape
            float dist = abs(f.x) + abs(f.y);
            
            // We want the diamond to grow from zero up to half the cell.
            // At dist=0, we are at the center; at dist=0.5, we reach the diamond corners.
            // So "progress" from 0..1 covers dist from 0..0.5.
            // We'll define the "edge" = 0.5 * progress so that:
            //  - progress=0 => edge=0 => diamond is zero sized
            //  - progress=1 => edge=0.5 => diamond is full cell
            float edge = 0.5 * progress;
            
            // We can use a smooth step for a slightly softened boundary.
            // The expression below yields 1.0 inside the diamond, 0.0 outside.
            float inside = 1.0 - smoothstep(edge - feather, edge + feather, dist);
            
            return inside;
        }

        vec4 applyDiamondGridMask(vec4 originalColor,
                                  float progress,
                                  float diamondFreq,
                                  float feather) {
            // Evaluate how "inside" the diamond cell we are
            float maskVal = diamondGridMask(vUv, progress, diamondFreq, feather);
            
            // Multiply alpha so that 1.0 => keep original alpha, 0.0 => fully transparent
            originalColor.a *= maskVal;
            return originalColor;
        }
    `,

    // Tells objectMaskHelper where to inject the above code
    injectionPoint: {
        hook: '#include <dithering_fragment>',
        code: `
gl_FragColor = applyDiamondGridMask(
    gl_FragColor,
    progress,
    diamondFrequency,
    feather
);

#include <dithering_fragment> // keep the original hook
        `
    }
};
