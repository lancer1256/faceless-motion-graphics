// src/shaders/objectMasks/diamondGridFade.js
export const objectMaskShader = {
    /**
     * Additional uniforms you can animate or set from animConfig.maskParams.
     * - cellSize: size of each diamond cell in UV space
     * - feather: softens the edge so you don’t get harsh pixel aliasing
     */
    customUniforms: {
        cellSize: { value: 0.10 }, // default tile size
        feather:  { value: 0.03 }, // default softness
    },

    // Optional custom vertex shader snippet (we just pass along uv)
    vertexShader: `
        varying vec2 vMaskUv;
        void main() {
            // This runs before the material's normal vertexShader
            // We'll store uv in vMaskUv so we can use it in the fragment injection
            vMaskUv = uv;
        }
    `,

    // This snippet is appended to the fragmentShader, providing our mask function.
    fragmentShader: `
        /**
         * Apply a diamond-grid fade:
         * - "progress" goes from 0..1. At 0, everything is invisible; at 1, fully visible.
         * - "cellSize" controls how big each diamond cell is.
         * - "feather" gives a soft edge near progress
         * - "vMaskUv" is the varying from the vertex stage
         */
        vec4 applyDiamondGridFade(vec4 originalColor, float progress, float cellSize, float feather, vec2 uv) {
            // 1) Scale uv by 1/cellSize to get into "cell coordinates"
            //    Then fract() to find the fractional part within each tile [0..1].
            vec2 cellFrac = fract(uv / cellSize);

            // 2) Shift the cell so its center is at (0.5,0.5).
            //    Then the diamond shape is simply the manhattan distance from center.
            vec2 d = cellFrac - 0.5;
            float distManhattan = abs(d.x) + abs(d.y); // 0 at center, ~1 at corners

            // 3) Compare distManhattan to "progress". If dist < progress => inside the diamond => alpha=1
            //    For softness, we do a smoothstep around progress & progress - feather.
            float edge0 = progress - feather;
            float edge1 = progress;
            // We invert the smoothstep so inside is alpha=1
            float diamondAlpha = 1.0 - smoothstep(edge0, edge1, distManhattan);

            // 4) Multiply the object’s original alpha by diamondAlpha
            vec4 maskedColor = originalColor;
            maskedColor.a *= diamondAlpha;

            return maskedColor;
        }
    `,

    /**
     * Where we inject our custom code. The library will put your function in the fragmentShader,
     * then call it right before `#include <dithering_fragment>`.
     */
    injectionPoint: {
        hook: '#include <dithering_fragment>',
        code: `
            // Our custom uniforms:
            uniform float cellSize;
            uniform float feather;
            // We already have "uniform float progress;" declared by the base system
            // We pass vMaskUv from the custom vertex snippet:
            varying vec2 vMaskUv;

            // Call the diamond fade function:
            gl_FragColor = applyDiamondGridFade(gl_FragColor, progress, cellSize, feather, vMaskUv);

            // Re-include the original dithering line
            #include <dithering_fragment>
        `
    }
};
