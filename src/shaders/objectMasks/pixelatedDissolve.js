export const objectMaskShader = {
    // Custom uniforms for pixel size control
    customUniforms: {
        // Pixel size (higher = larger pixels)
        pixelSize: { value: 10.0 },
        // Optional noise influence (0.0 = no noise, 1.0 = maximum noise)
        noiseStrength: { value: 0.2 }
    },

    // No special vertex shader modifications needed
    vertexShader: `
        varying vec2 vUv;
        
        void main() {
            vUv = uv;
        }
    `,

    // Fragment shader for pixelation
    fragmentShader: `
        varying vec2 vUv;
        
        // Simple hash function for noise
        float hash(vec2 p) {
            return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }
        
        vec4 applyPixelation(vec4 originalColor, float currentProgress, vec2 uv) {
            // Calculate effective pixel size based on progress
            // As progress goes from 0->1, pixel size goes from large->small
            float effectivePixelSize = pixelSize * (1.0 - currentProgress) + 1.0;
            
            // Create pixelated coordinates
            vec2 pixelatedUv = floor(uv * effectivePixelSize) / effectivePixelSize;
            
            // Add some noise to break up the perfect grid if desired
            float noise = hash(pixelatedUv) * noiseStrength;
            
            // Get material color at pixelated coordinates - this will be handled by the injection code
            // This is just a placeholder - the actual sampling happens in the injection code
            vec4 pixelatedColor = originalColor;
            
            // Blend between pixelated and original color based on progress
            // When progress is 0, we're fully pixelated
            // When progress is 1, we're back to the original image
            if (currentProgress < 1.0) {
                // For "in" animation: Pixelated with alpha based on progress
                // For "out" animation: Pixelated fading out to transparent
                pixelatedColor.a *= currentProgress;
                return pixelatedColor;
            } else {
                // Fully transitioned to normal
                return originalColor;
            }
        }
    `,

    // Define where and how to inject our pixelation effect
    injectionPoint: {
        hook: '#include <map_fragment>',
        code: `
#include <map_fragment>

// Apply pixelation effect after textures are sampled but before lighting calculations
float effectiveProgress = progress;
vec2 fragUv = vUv; // Most materials have a vUv, but if not this may need to be adjusted

// Additional randomization based on position for dissolve effect
float randomOffset = hash(fragUv * 3.5) * 0.3;
float dissolveThreshold = effectiveProgress - randomOffset;

// Create pixelated effect
gl_FragColor = applyPixelation(gl_FragColor, effectiveProgress, fragUv);

// Add extra dissolve effect for transitions
if (dissolveThreshold < 0.0) {
    gl_FragColor.a = 0.0;
}
        `
    }
}; 