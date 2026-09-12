export const DiagonalWipeShader = {
    uniforms: {
        tPrev: { value: null },    // Texture of the previous scene
        tNext: { value: null },    // Texture of the next scene
        progress: { value: 0.0 },  // 0 (top-left) to 1 (fully bottom-right revealed)
        aspect: { value: 1.0 }     // width / height of the viewport
        // No feathering uniform needed for a sharp edge
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0); // Full-screen quad
        }
    `,
    fragmentShader: `
        varying vec2 vUv;
        uniform sampler2D tPrev;
        uniform sampler2D tNext;
        uniform float progress; // 0.0 to 1.0
        uniform float aspect;   // Not strictly needed for this specific diagonal if we use UV sum

        void main() {
            // For a wipe from Top-Left to Bottom-Right (assuming UV (0,0) is bottom-left):
            // Top-Left UV is (0,1), Bottom-Right UV is (1,0).
            // Consider the line y = 1-x. Or x+y = 1.
            // We want to reveal tNext in the area where x+y is *decreasing* from 1 (top-left) towards 0,
            // or more simply, where (1-y) > x for the top-left expanding region.
            // Let's use a line that moves from top-left to bottom-right.
            // The line is defined by vUv.x + vUv.y = C.
            // At top-left (0,1), C=1. At bottom-right (1,0), C=1. This is not a moving line.
            // Correct approach: line moves from vUv.x + (1.0 - vUv.y) = C
            // Top-left (0,1) -> 0 + (1-1) = 0. Bottom-right (1,0) -> 1 + (1-0) = 2.
            float val = vUv.x + (1.0 - vUv.y); // Ranges from 0 (top-left) to 2 (bottom-right)
            float threshold = progress * 2.0; // progress 0..1 maps to threshold 0..2
            
            float mixVal = (val < threshold) ? 0.0 : 1.0; // If val is less than threshold, show tNext (mixVal=0)

            gl_FragColor = mix(texture2D(tNext, vUv), texture2D(tPrev, vUv), mixVal);
        }
    `
}; 