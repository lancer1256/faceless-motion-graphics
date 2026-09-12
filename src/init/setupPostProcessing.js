import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { core, initializeCoreContextParts } from '../coreContext.js';
import { VignetteBlurShader } from '../shaders/vignetteBlurShader.js';
import { macroScenesConfig } from '../config/sceneSequenceConfig.js';

export function setupPostProcessing(container, GaussianBlurShader, CircularWipeShader) {
    const composer = new EffectComposer(core.renderer);
    // The main RenderPass. Its scene might change during wipes.
    // Initialize with the primary scene from core.threeSceneObjects.
    const mainRenderPass = new RenderPass(core.threeSceneObjects.mainScene, core.camera);
    composer.addPass(mainRenderPass);

    const bloomParams = {
        strength: 0.34,
        radius: 0.7,
        threshold: 0.2
    };
    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(container.clientWidth, container.clientHeight),
        bloomParams.strength,
        bloomParams.radius,
        bloomParams.threshold
    );
    composer.addPass(bloomPass);

    // Enable or disable bloomPass by default based on macroScenesConfig
    const defaultMacro = macroScenesConfig.find(ms => ms.isDefault);
    bloomPass.enabled = defaultMacro?.postProcessing?.bloom ?? true;

    const blurPass = new ShaderPass(GaussianBlurShader);
    // Get the actual pixel ratio that was set on the renderer
    const activePixelRatio = core.renderer.getPixelRatio();
    blurPass.uniforms.resolution.value.set(
        container.clientWidth * activePixelRatio, // Actual buffer width
        container.clientHeight * activePixelRatio  // Actual buffer height
    );
    blurPass.uniforms.blurRadius.value = 0.9;
    composer.addPass(blurPass);

    // NEW: Vignette Blur Pass
    const vignetteBlurPass = new ShaderPass(VignetteBlurShader);
    vignetteBlurPass.uniforms.resolution.value.set(
        container.clientWidth * activePixelRatio,
        container.clientHeight * activePixelRatio
    );
    vignetteBlurPass.uniforms.aspect.value = container.clientWidth / container.clientHeight;
    // Stronger default values for better visibility
    vignetteBlurPass.uniforms.vignetteRadiusX.value = 0.2;   // Smaller clear area in X direction
    vignetteBlurPass.uniforms.vignetteRadiusY.value = 0.3;   // Slightly larger clear area in Y direction
    vignetteBlurPass.uniforms.vignetteFeather.value = 0.5;   // Softer transition
    vignetteBlurPass.uniforms.maxBlurRadius.value = 6.0;     // Much stronger blur for better visibility
    vignetteBlurPass.uniforms.debugMode.value = false;        // Enable debug mode initially
    vignetteBlurPass.enabled = true;                         // Explicitly enable the effect
    composer.addPass(vignetteBlurPass);

    // Lights for scene3 (the wiped-to scene)
    const ambientLightWipe = new THREE.AmbientLight(0xffffff, 0.7);
    if (core.threeSceneObjects.scene3Specific) core.threeSceneObjects.scene3Specific.add(ambientLightWipe);
    const dirLightWipe = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLightWipe.position.set(5, 10, 7.5);
    if (core.threeSceneObjects.scene3Specific) core.threeSceneObjects.scene3Specific.add(dirLightWipe);

    const renderTargetParams = {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        samples: activePixelRatio === 1 ? 4 : 0 // Only use MSAA on RTs if not already supersampling via pixelRatio > 1
    };
    const rtPrev = new THREE.WebGLRenderTarget(
        container.clientWidth * activePixelRatio, // Actual buffer width
        container.clientHeight * activePixelRatio, // Actual buffer height
        renderTargetParams
    );
    const rtNext = rtPrev.clone(); // rtNext will also have actual buffer dimensions

    // Placeholder material for the generic mask pass
    // The actual material will be set by timelineBuilder for each transition.
    const placeholderShader = {
        uniforms: {
            // progress: { value: 0.0 } // A common uniform, but not strictly needed for placeholder
        },
        vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position,1.0); }`,
        fragmentShader: `varying vec2 vUv; void main() { gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0); }` // Transparent
    };
    const activeMaskPass = new ShaderPass(new THREE.ShaderMaterial(placeholderShader));
    // We don't set tPrev/tNext or other specific uniforms here;
    // timelineBuilder will do it per transition by replacing the material.
    activeMaskPass.enabled = false; // GSAP will control this
    composer.addPass(activeMaskPass);



    initializeCoreContextParts({
        composer: composer,
        renderPass: mainRenderPass,
        bloomPass: bloomPass,
        blurPass: blurPass,
        vignetteBlurPass: vignetteBlurPass,
        activeMaskPass: activeMaskPass, // Updated name
        rtPrev: rtPrev,
        rtNext: rtNext,
    });
} 