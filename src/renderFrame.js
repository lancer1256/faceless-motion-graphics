// src/renderFrame.js
import { core } from './coreContext.js';
import { getFrameTime } from './utils/FrameClock.js';
import { updateSceneStateForTime } from './sceneUpdater.js'; // You just created this

// These variables are module-scoped to renderFrame.js to maintain state across calls
// for the AfterimagePass reset logic.
let lastRenderedFrameTime = -1; // Used to detect time jumps for AfterimagePass

/**
 * Renders a single frame of the animation based on the current time
 * set in the FrameClock.
 */
export function renderFrame() {
    if (!core.composer) {
        console.warn("[RenderFrame] core.composer not available. Skipping render.");
        return;
    }
    // core.player might not be on the core object itself when renderFrame is first called
    // during player instantiation. We'll use window.player if it's set globally for debug,
    // or a default FPS. A cleaner way would be for player to pass its FPS if needed.
    const playerInstance = core.player || window.player; // Prefer core.player when available

    const currentTime = getFrameTime(); // Get time from our deterministic clock

    // 1. Calculate/Update all world state for currentTime
    //    This calls core.masterTimeline.time() and updates gradientUniforms.uTime, etc.
    updateSceneStateForTime(currentTime);

    // 2. Handle stateful post-processing resets (e.g., AfterimagePass)
    //    AfterimagePass logic removed for now.
    lastRenderedFrameTime = currentTime;

    // 3. Prepare for rendering (e.g., render-to-targets for wipes)
    //    core.activeMaskPass.enabled state is controlled by GSAP tweens on core.masterTimeline.
    if (core.activeMaskPass && core.activeMaskPass.enabled) {
        renderToTargetsForMask();
    }

    // 4. Clamp floating point values for critical objects (Full implementation in Milestone 7)
    //    Basic camera clamping for now.
    if (core.camera) {
        const q = 1e-4; // Quantization step
        core.camera.position.set(
            Math.round(core.camera.position.x / q) * q,
            Math.round(core.camera.position.y / q) * q,
            Math.round(core.camera.position.z / q) * q
        );
        // Potentially clamp rotation/quaternion too if drift is observed later
    }

    // 5. Render the final frame using the composer
    core.composer.render();
}

/**
 * Helper function to render scenes to their respective targets for mask transitions.
 * Now generalized for mask transitions that use render targets.
 * Assumes core context objects (renderer, scenes, camera, rtPrev, rtNext) are populated.
 */
function renderToTargetsForMask() {
    // Check if the current mask pass and its material are set up for render targets
    if (!core.activeMaskPass || !core.activeMaskPass.material ||
        !core.activeMaskPass.material.uniforms.tPrev || // Convention: mask shaders needing RTs have tPrev/tNext
        !core.activeMaskPass.material.uniforms.tNext) {
        // This mask doesn't use separate render targets in the expected way, or is not ready.
        return;
    }

    const sourceScene = core.threeSceneObjects[core.maskSourceSceneKey];
    const targetScene = core.threeSceneObjects[core.maskTargetSceneKey];

    // Check for all necessary core components and scene references
    if (!sourceScene || !targetScene ||
        !core.camera || !core.rtPrev || !core.rtNext || !core.renderer) {
        // console.warn("[RenderFrame] Missing core objects or scene refs for renderToTargetsForMask.");
        return;
    }

    // Render the source scene for the mask to rtPrev
    core.renderer.setRenderTarget(core.rtPrev);
    core.renderer.clear();
    core.renderer.render(sourceScene, core.camera);

    // Render the target scene for the mask to rtNext
    core.renderer.setRenderTarget(core.rtNext);
    core.renderer.clear(); // Clears with background of the scene being rendered (e.g., scene3Specific's white bg)
    core.renderer.render(targetScene, core.camera);

    core.renderer.setRenderTarget(null); // Back to default framebuffer for composer
}