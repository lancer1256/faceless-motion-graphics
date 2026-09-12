import * as THREE from 'three';

export const VignetteBlurShader = {
    uniforms: {
        tDiffuse: { value: null },
        resolution: { value: new THREE.Vector2() }, // Screen resolution
        aspect: { value: 1.0 }, // Screen aspect ratio (width / height)
        
        // Vignette controls
        vignetteCenter: { value: new THREE.Vector2(0.5, 0.5) }, // Center of the clear area (0,0 to 1,1)
        vignetteRadiusX: { value: 0.3 },  // Radius of the clear area in X direction (0.0 to ~0.7)
        vignetteRadiusY: { value: 0.3 },  // Radius of the clear area in Y direction (0.0 to ~0.7)
        vignetteFeather: { value: 0.4 }, // Softness of the transition from clear to blurry (0.0 to 1.0)
        
        // Blur controls
        maxBlurRadius: { value: 2.0 }, // Max blur sigma at the very edges
        
        // Debug mode
        debugMode: { value: false }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        varying vec2 vUv;
        uniform sampler2D tDiffuse;
        uniform vec2 resolution;
        uniform float aspect;
        uniform vec2 vignetteCenter;
        uniform float vignetteRadiusX;
        uniform float vignetteRadiusY;
        uniform float vignetteFeather;
        uniform float maxBlurRadius;
        uniform bool debugMode;

        // Gaussian PDF (Probability Density Function)
        float gaussianPdf(float x, float sigma) {
            return 0.39894 * exp(-0.5 * x * x / (sigma * sigma)) / sigma;
        }

        void main() {
            // Calculate normalized position from center
            vec2 pos = vUv - vignetteCenter;
            // Correct aspect ratio for X (wider screens need wider ellipse)
            pos.x *= aspect;
            
            // Calculate normalized distance using elliptical shape
            float normX = pos.x / vignetteRadiusX;
            float normY = pos.y / vignetteRadiusY;
            float ellipticalDist = sqrt(normX * normX + normY * normY);

            // Determine blur intensity based on elliptical distance
            float blurIntensity = smoothstep(1.0, 1.0 + vignetteFeather, ellipticalDist);
            
            // Debug mode: show the vignette area in red
            if (debugMode) {
                if (blurIntensity > 0.01) {
                    // Red tint in the blur area, intensity based on blur amount
                    vec4 originalColor = texture2D(tDiffuse, vUv);
                    gl_FragColor = vec4(mix(originalColor.rgb, vec3(1.0, 0.0, 0.0), blurIntensity * 0.8), 1.0);
                    return;
                } else {
                    // Normal color in the clear area
                    gl_FragColor = texture2D(tDiffuse, vUv);
                    return;
                }
            }
            
            // Apply progressive blur intensity with a power curve for more natural falloff
            // This creates a more dramatic blur effect toward the edges
            float currentSigma = pow(blurIntensity, 1.5) * maxBlurRadius;

            // If sigma is very small, no need to blur (or blur is negligible)
            if (currentSigma < 0.1) {
                gl_FragColor = texture2D(tDiffuse, vUv);
                return;
            }

            vec2 invSize = 1.0 / resolution;
            float weightSum = gaussianPdf(0.0, currentSigma);
            vec3 diffuseSum = texture2D(tDiffuse, vUv).rgb * weightSum;
            
            // Use the same loop structure as the standard Gaussian blur
            // Sample consistently up to 10 pixels out (matches standard shader)
            for (int i = 1; i < 10; i++) {
                float x = float(i);
                float weight = gaussianPdf(x, currentSigma);
                
                // Sample in both directions at once (horizontal and vertical)
                // This matches the approach in the standard GaussianBlurShader
                vec2 uvOffsetH = vec2(x * invSize.x, 0.0);
                diffuseSum += texture2D(tDiffuse, vUv + uvOffsetH).rgb * weight;
                diffuseSum += texture2D(tDiffuse, vUv - uvOffsetH).rgb * weight;
                
                vec2 uvOffsetV = vec2(0.0, x * invSize.y);
                diffuseSum += texture2D(tDiffuse, vUv + uvOffsetV).rgb * weight;
                diffuseSum += texture2D(tDiffuse, vUv - uvOffsetV).rgb * weight;
                
                weightSum += 4.0 * weight;
            }
            
            gl_FragColor = vec4(diffuseSum / weightSum, 1.0);
        }
    `
}; 