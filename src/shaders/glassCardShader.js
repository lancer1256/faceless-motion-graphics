import * as THREE from 'three';

export const GlassCardShader = {
    uniforms: {
        // Card Shape & Appearance
        uCardDimensions: { value: new THREE.Vector2(100, 100) },
        uCornerRadius: { value: 0.08 },                        // As fraction of screen height
        uBaseColor: { value: new THREE.Color(0xffffff) },
        uBaseOpacity: { value: 0.15 },
        uBlurWidth: { value: 0.05 },        // Edge blur width
        uResolution: { value: new THREE.Vector2(1, 1) }
    },

    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,

    fragmentShader: `
        precision highp float;
        varying vec2 vUv;
        
        uniform vec2 uCardDimensions;
        uniform float uCornerRadius;
        uniform vec3 uBaseColor;
        uniform float uBaseOpacity;
        uniform float uBlurWidth;
        uniform vec2 uResolution;

        // Signed Distance Function for a Rounded Box
        float sdRoundedBox(vec2 p, vec2 b, float r) {
            vec2 q = abs(p) - b + r;
            return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
        }

        // Simple RoundRect function with blur
        float RR(vec2 uv, float rad) {
            // Preserve aspect ratio
            vec2 box = vec2(rad * uResolution.x / uResolution.y, rad);
            float d = sdRoundedBox(uv, box, uCornerRadius);
            float aa = fwidth(d);
            return smoothstep(-uBlurWidth, uBlurWidth, d);
        }

        void main() {
            // Convert UVs to centered coordinate system
            vec2 uv = (vUv - 0.5) * 2.0; // Convert 0-1 to -1 to 1
            uv.x *= uResolution.x / uResolution.y; // Aspect correction
            
            // Determine card size based on a factor (e.g., 0.2 for 20% of viewport height)
            float cardHalfHeight = 0.2; 
            vec2 boxHalfExtents = vec2(cardHalfHeight * (uResolution.x / uResolution.y), cardHalfHeight);
            
            // uCornerRadius is assumed to be in normalized screen units (fraction of screen height)
            float actualCornerRadius = uCornerRadius;

            // Calculate signed distance from the rounded box edge
            // d < 0 inside, d = 0 on edge, d > 0 outside
            float d = sdRoundedBox(uv, boxHalfExtents, actualCornerRadius);
            
            // Calculate mask value for smooth transition at the edge
            // maskVal: 0 deep inside, 1 far outside, effectively 0.5 at the exact edge (d=0)
            float maskVal = smoothstep(-uBlurWidth, uBlurWidth, d);

            // finalAlpha is the opacity of the card itself
            float finalAlpha = (1.0 - maskVal) * uBaseOpacity;
            
            vec3 finalColor = uBaseColor;

            // Add a subtle highlight effect to the edges
            float highlightStrength = 0.4; // INCREASED for visibility

            if (uBlurWidth > 0.0001) { // Apply highlight only if there's some blur
                // highlightFactor is 1.0 at the center of the blurred edge (d=0),
                // and fades to 0 at the inner/outer extents of the blur.
                float highlightFactor = 1.0 - smoothstep(0.0, 1.0, abs(d / uBlurWidth));
                
                // Ensure highlight is only applied within the card's visible alpha
                highlightFactor *= step(0.001, (1.0 - maskVal)); 

                finalColor += vec3(highlightStrength) * highlightFactor;
            }

            if (finalAlpha < 0.001) {
                discard; // Discard pixel if fully transparent
            }
            
            gl_FragColor = vec4(clamp(finalColor, 0.0, 1.0), finalAlpha); // Clamp color to avoid overbrightening
        }
    `
};