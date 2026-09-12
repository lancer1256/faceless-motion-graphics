export const objectMaskShader = {
    // No customUniforms needed for this simple opacity fade,
    // as 'progress' and 'direction' are automatically supplied by the system.
    customUniforms: {},

    // No vertex shader modifications needed for simple opacity.
    vertexShader: `
        // This is a placeholder. If your mask needs vertex attributes (e.g., custom UVs for noise),
        // you would declare varyings here and assign them in main().
        // Example:
        // varying vec2 vMaskEffectUv;
        // void main() {
        //   vMaskEffectUv = uv; // Or some transformation of uv
        // }
    `,

    // Fragment shader logic to modify alpha.
    fragmentShader: `
        // This GLSL snippet will be injected into the material's fragment shader.
        // It has access to:
        // - uniform float progress;  (0.0 to 1.0, controlled by GSAP)
        // - uniform float direction; (1.0 for "in", -1.0 for "out" - though for this simple shader, progress directly handles it)
        // - All existing uniforms and varyings of the original material.

        // This function will be called by the injected code.
        // It modifies the alpha of the incoming fragment color.
        vec4 applyOpacityFade(vec4 originalColor, float currentProgress) {
            vec4 modifiedColor = originalColor;
            modifiedColor.a *= currentProgress; // progress 0 -> transparent, progress 1 -> original alpha
            return modifiedColor;
        }
    `,

    // Defines how to integrate the fragmentShader GLSL into the main material's shader.
    // For this opacity effect, we want to modify gl_FragColor before its final output.
    // A good injection point is right before dithering or the very end of the shader.
    // We will define a function 'applyOpacityFade' from fragmentShader and call it.
    injectionPoint: {
        hook: '#include <dithering_fragment>', // A common hook at the end of fragment shaders
        // The 'code' will replace the 'hook'. So, we must include the hook itself if we want to keep it.
        code: `
float effectiveProgress = progress; // GSAP tweens progress from 0->1 for "in" or 1->0 for "out"
                                    // So, 'progress' directly represents the desired opacity multiplier.
gl_FragColor = applyOpacityFade(gl_FragColor, effectiveProgress);
#include <dithering_fragment> // Re-include the original hook
        `
    }
}; 