export const HorizontalWipeShader = {
    uniforms: {
        tPrev: { value: null },    // Texture of the previous scene
        tNext: { value: null },    // Texture of the next scene
        progress: { value: 0.0 },  // 0 (show prev) to 1 (show next, wiped from right to left)
        feather: { value: 0.01 }   // Optional soft edge width
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
        uniform float feather;  // Soft edge width

        void main() {
            // Right-to-left wipe: next scene appears from right and wipe line moves right to left
            float threshold = 1.0 - progress; // At progress=0, threshold=1.0; at progress=1, threshold=0.0
            
            // Create a soft transition using smoothstep
            // mixVal = 1 when x > threshold (show tNext), mixVal = 0 when x < threshold (show tPrev)
            float mixVal = smoothstep(threshold - feather, threshold + feather, vUv.x);
            
            gl_FragColor = mix(texture2D(tPrev, vUv), texture2D(tNext, vUv), mixVal);
        }
    `
}; 