export const objectMaskShader = {
    customUniforms: {
        // aspect: { value: 1.0 } // Optional: if you need to adjust for aspect ratio,
                                // though for a simple UV-based diagonal, it might not be strictly necessary
                                // and would require passing camera/viewport aspect.
                                // For now, we'll assume square UV space behavior.
        // feather: { value: 0.05 } // Optional: for a soft edge (0.0 = sharp)
    },

    vertexShader: ``, // Rely on the original material to provide vUv

    fragmentShader: `
        // Uniforms 'progress' and any from 'customUniforms' will be automatically declared
        // by objectMaskHelper based on its setup and this shader definition.
        // varying vec2 vUv; // This varying is passed from the vertex shader part.

        // Calculates the alpha for a diagonal wipe mask.
        // progress = 0: effect is at its start (e.g., mostly transparent for an "in" wipe)
        // progress = 1: effect is at its end (e.g., mostly opaque for an "in" wipe)
        float getDiagonalMaskAlpha(vec2 uv, float currentProgress) {
            // Wipe from Top-Left to Bottom-Right based on UVs
            // (0,0) is usually bottom-left in WebGL UVs.
            // vUv.y for top is 1, bottom is 0.
            // So, to go from top-left (0,1) to bottom-right (1,0)
            // we can use a value that increases along this diagonal.
            // Consider val = uv.x + (1.0 - uv.y);
            // Top-left (0,1) -> 0 + (1-1) = 0
            // Bottom-right (1,0) -> 1 + (1-0) = 2
            // This value ranges from 0 to 2.
            float wipeValue = uv.x + (1.0 - uv.y);

            // Map progress (0 to 1) to the wipeValue range (0 to 2)
            float threshold = currentProgress * 2.0;

            // Optional feathering for a softer edge
            // float featherAmount = clamp(feather, 0.0, 0.5); // Ensure feather isn't too large
            // float alpha = smoothstep(threshold - featherAmount, threshold + featherAmount, wipeValue);

            // For a sharp edge:
            // If wipeValue is less than the threshold, it's "revealed" (alpha = 1.0)
            // Otherwise, it's "hidden" (alpha = 0.0)
            // This behavior is for a reveal ("in") effect where progress goes 0 to 1.
            // If objectMaskHelper handles "out" by reversing progress (1 to 0), this works directly.
            float alpha = (wipeValue < threshold) ? 1.0 : 0.0;
            
            return alpha;
        }
    `,

    injectionPoint: {
        // A common hook, runs late in the fragment shader, before final color output modifications.
        hook: '#include <dithering_fragment>',
        // The 'code' will replace the 'hook'. So, we must include the hook itself if we want to keep it.
        code: `
// Calculate the mask alpha using our function
float maskAlpha = getDiagonalMaskAlpha(vUv, progress);

// Apply the mask by modulating the original fragment's alpha
gl_FragColor.a *= maskAlpha;

// Re-include the original hook content
#include <dithering_fragment>
        `
    }
}; 