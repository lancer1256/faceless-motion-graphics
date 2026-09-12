const params = new URLSearchParams(window.location.search);
const isDeterministicOutputMode = params.get('deterministicOutput') === 'true' || window.FORCE_DETERMINISTIC_OUTPUT === true;

if (isDeterministicOutputMode) {
    document.body.classList.add('deterministic-mode');
    // You might also want to set specific dimensions for the container directly via JS
    // if CSS overrides are tricky, but CSS is cleaner.
}

import * as THREE from 'three';
import { gsap } from 'gsap';
import { Text } from 'troika-three-text';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { scenesConfig } from 'scene_config';
import { textLibrary } from 'text_library_config';
import { assetLibrary } from 'asset_library_config';
import { createTextForSceneContentBlock, createAssetForSceneContentBlock } from 'scene_content_factory';
import { fixOcclusion } from "occlusion_fixer";
import { overlapNeeded } from "overlap_needed";
import { GaussianBlurShader } from "gaussian_blur_shader";
import { fourCornerGradientVertexShader, fourCornerGradientFragmentShader } from "four_corner_gradient_shader";
import { CircularWipeShader } from "circular_wipe_shader";
import { findWordSequence, getRelativeTiming } from "transcript_utils";
import { setupCoreThreeObjects } from "initialize_core_three_objects";
import { loadAndPrepareTranscriptData } from "load_transcript_data";
import { createSceneAnchors } from "create_scene_anchors";
import { createContentFromConfig } from "create_content_from_config";
import { setupPostProcessing } from "setup_post_processing";
import { setupLighting } from "setup_lighting";
import { setupCameraRig } from "setup_camera_rig";
import { calculateAllSceneDurations } from "calculate_scene_durations";
import { buildMasterTimeline } from "timeline_builder";
import "custom_ease_charles";
import { core, initializeCoreContextParts } from './coreContext.js';
import { DeterministicPlayer } from './utils/DeterministicPlayer.js';
import { renderFrame } from './renderFrame.js';
import { registerAssetForPreload as registerAsset, loadRegisteredAssets, assetCache as preloadedAssetCache } from './utils/PreloadManager.js';
import { setupVignetteControls } from './utils/vignetteControls.js';

/* ──────────────────────────────────────────────────────────────
   initAppEntrypoint becomes a *factory*.
   - 1st arg:  overrides (configs coming from HMR)
   - 2nd arg:  options  → { mode:'cold' | 'hot' }
────────────────────────────────────────────────────────────── */

export async function initApp(
  overrides = {},
  { mode = 'cold' } = {}
) {

  /* 1️⃣ merge overrides (HMR) into singletons before anything uses them */
  if (overrides.scenesConfig)  Object.assign(scenesConfig,  overrides.scenesConfig);
  if (overrides.textLibrary)   Object.assign(textLibrary,   overrides.textLibrary);
  if (overrides.assetLibrary)  Object.assign(assetLibrary,  overrides.assetLibrary);

  if (overrides.gradientShaders) {
    const gradMod = await import('./shaders/fourCornerGradientShader.js');
    Object.assign(gradMod, overrides.gradientShaders);
  }

  /* ------------------------------------------------------------
     Resolve the DOM container exactly once.  In a hot reload
     we might STILL need its reference (for setupPostProcessing
     etc.), so do it unconditionally and fall back to the
     existing renderer's parent if the element is missing.
  ------------------------------------------------------------ */
  let container = document.getElementById('animation-container');
  if (!container && core.renderer?.domElement?.parentElement) {
    container = core.renderer.domElement.parentElement;
  }

/* -----------------------------------------------------------------
   Configuration
------------------------------------------------------------------ */
const SHOW_GUI = params.get('showGui') === 'true' || !isDeterministicOutputMode;
const DEBUG_OCCLUSION = false; // Set to true to show debug visualization for occlusion testing

// Text for third sub-scene
const WHITE_BACKGROUND_COLOR = 0xffffff;
// DOM Elements
const loadingElement = document.getElementById('loading');
const loadingProgress = document.getElementById('loading-progress');

// THREE.js Setup
// Core THREE.js objects (scene, camera, renderer, etc.) will now be accessed via `core.xxx`
// Global window properties for these are being phased out.
// e.g., window.cameraRigRoot becomes core.cameraRigRoot
// e.g., window.masterTimeline becomes core.masterTimeline

// Render targets for radial wipe
// These (rtPrev, rtNext, wipePass) will also be moved to core context via setupPostProcessing
let gui; // GUI controller
const loadedGltfCache = new Map(); // Cache for GLTF models from assetLibrary - Now managed by PreloadManager's assetCache
// Reference holders for 3rd scene
let leonardoGroup;
// let scene3; // This specific variable might not be needed if using core.threeSceneObjects.scene3Specific
let scene3RenderTarget;
// let circleMaskPass;

// --- NEW: For Radial Wipe Pattern (from basic_camera_movement.html) ---
let rtPrev, rtNext; // Render targets for previous and next scenes
let wipePass;       // ShaderPass for the circular wipe transition
// --- END NEW ---

// GSAP masterTimeline will be stored in core.masterTimeline

// Transcript word storage
let allTranscriptWords = []; // This one is still needed to hold the initially fetched transcript

// Clock for shader animations
// let clock; // REMOVE THREE.Clock, will use FrameClock via DeterministicPlayer

// Uniforms for the gradient background shader
// let gradientUniforms; // Will be core.gradientUniforms

// Initialize Scene
async function init() {
    console.log("[Init] Starting initialization...");
    // --- Call the new setup function ---
    console.log("[Init] Setting up Core Three Objects...");
    /* ---------- Stage 1  core Three objects (cold only) ---------- */
    if (mode === 'cold') {
      setupCoreThreeObjects(container); // This function now populates core.renderer, core.camera, core.threeSceneObjects, core.gradientUniforms
    }
    console.log("[Init] Core Three Objects setup complete.");

    // Initialize core context with loaded configs (scenesConfig, etc. are already loaded globally in your current setup)
    console.log("[Init] Initializing Core Context Parts (configs)...");
    initializeCoreContextParts({
        scenesConfig: scenesConfig, // scenesConfig is a global from scene_config.js
        assetLibrary: assetLibrary, // assetLibrary is a global from asset_library_config.js
        textLibrary: textLibrary,   // textLibrary is a global from text_library_config.js
        // allTranscriptWords will be added after it's loaded
    });
    console.log("[Init] Core Context Parts (configs) initialized.");

    console.log("[Init] Assigning core to window.core...");
    window.core = core;
    console.log("[Init] core assigned to window.core:", !!window.core);

    if (mode === 'cold' && !core.__assetsRegistered) {
      console.log("[Init] Starting Asset Registration Phase...");
      if (scenesConfig && assetLibrary && textLibrary) { // Added textLibrary for font registration
        scenesConfig.forEach(sceneConfig => {
            sceneConfig.contentBlocks?.forEach(blockConfig => {
                if (blockConfig.type === "asset") {
                    const assetConfigId = blockConfig.assetConfigId;
                    const assetLibEntry = assetLibrary[assetConfigId];
                    console.log(`[Init DEBUG] Processing asset block: ${blockConfig.id}, assetConfigId: ${assetConfigId}, assetLibEntry:`, JSON.parse(JSON.stringify(assetLibEntry || {})));
                    if (assetLibEntry && assetLibEntry.type === "gltf") {
                        if (assetLibEntry.modelSrc) registerAsset(assetLibEntry.modelSrc, 'gltf');
                        if (assetLibEntry.refSrc) registerAsset(assetLibEntry.refSrc, 'gltf');
                    } else if (assetLibEntry && assetLibEntry.type === "imageSprite") {
                        console.log(`[Init DEBUG] Registering imageSprite texture: ${assetLibEntry.textureSrc}`);
                        if (assetLibEntry.textureSrc) registerAsset(assetLibEntry.textureSrc, 'texture');
                    }
                } else if (blockConfig.type === "text") { // Register fonts from text blocks
                    const textLibEntry = textLibrary[blockConfig.textConfigId];
                    if (textLibEntry && textLibEntry.fontUrl) {
                        registerAsset(textLibEntry.fontUrl, 'font');
                    }
                }
            });
        });
        // Register fonts directly from textLibrary if some aren't used in scenesConfig initially
        for (const key in textLibrary) {
            if (textLibrary[key].fontUrl) registerAsset(textLibrary[key].fontUrl, 'font');
        }
      } else {
          console.warn("[Init] scenesConfig, assetLibrary, or textLibrary not available for asset registration.");
      }
      console.log("[Init] Asset Registration Phase Complete.");
      core.__assetsRegistered = true;
    }

    // Create Scene Anchors
    if (mode === 'cold' && !core.__anchorsCreated) {
      console.log("[Init] Creating Scene Anchors...");
      createSceneAnchors(SHOW_GUI);
      console.log("[Init] Scene Anchors created.");
      core.__anchorsCreated = true;
    }

    // --- Load and Prepare Transcript Data ---
    console.log("[Init] Loading and preparing transcript data...");
    try {
        allTranscriptWords = await loadAndPrepareTranscriptData(scenesConfig, textLibrary, loadingProgress, SHOW_GUI);
    } catch (error) {
        console.error("[Init] Error loading transcript data:", error);
        return; // Stop initialization if transcript loading fails
    }
    initializeCoreContextParts({ allTranscriptWords: allTranscriptWords }); // Update core with loaded transcript
    console.log("[Init] Transcript data loaded and prepared.");
    // --- End Transcript Data ---

    if (mode === 'cold') {
      console.log("[Init] Starting Preload of Registered Assets...");
      try {
        await loadRegisteredAssets(loadingProgress); // loadingProgress is the span element
      } catch (error) {
        loadingElement.textContent = 'Error loading critical assets!';
        console.error("[Init] Preloading failed:", error);
        return;
      }
      console.log("[Init] Preload of Registered Assets Complete.");
    } else {
      /* hot-reload → hide loading overlay immediately */
      loadingElement.style.display = 'none';
    }

    // Set up post-processing
    console.log("[Init] Setting up post-processing...");
    // const postProcessingObjects = setupPostProcessing(renderer, scene, camera, scene3, container, GaussianBlurShader, CircularWipeShader);
    // composer = postProcessingObjects.composer;
    // afterimagePass = postProcessingObjects.afterimagePass;
    // bloomPass = postProcessingObjects.bloomPass;
    // rtPrev = postProcessingObjects.rtPrev;
    // rtNext = postProcessingObjects.rtNext;
    // wipePass = postProcessingObjects.wipePass;
    // setupPostProcessing now uses core.renderer, core.camera, core.threeSceneObjects.mainScene, core.threeSceneObjects.scene3Specific
    // It populates core.composer, core.afterimagePass, core.bloomPass, core.wipePass, core.rtPrev, core.rtNext, core.renderPass, core.blurPass
    /* ---------- Stage 4  camera rig & post-fx (cold only) -------- */
    if (mode === 'cold') {
      setupPostProcessing(container, GaussianBlurShader, CircularWipeShader);
    }
    console.log("[Init] Post-processing setup complete.");
    
    // Add lights for better text visibility
    console.log("[Init] Setting up lighting...");
    // setupLighting(scene);
    setupLighting(); // Uses core.threeSceneObjects.mainScene internally
    console.log("[Init] Lighting setup complete.");
    
    // NEW: Dynamically determine and create the chain of camera nulls
    console.log("[Init] Setting up camera rig...");
    // setupCameraRig(scenesConfig, scene, camera, SHOW_GUI);
    if (mode === 'cold') { // This was part of Stage 4 in the original diff, combining here with camera rig.
        setupCameraRig(SHOW_GUI);
    }
    console.log("[Init] Camera rig setup complete.");
    
    // --- NEW: Load content based on scenesConfig ---
    if (mode === 'cold' && !core.__contentPlaced) {
      console.log("[Init] Creating content from config (including parenting and sizing)...");
      await createContentFromConfig(
            scenesConfig, textLibrary, assetLibrary,
            SHOW_GUI, preloadedAssetCache,
            createTextForSceneContentBlock,
            createAssetForSceneContentBlock);
      console.log("[Init] Content from config fully processed (created, parented, sized).");
      core.__contentPlaced = true;
    }
    
    /* ------------------------------------------------------------
       Occlusion pre-pass (runs while timeline is still paused)
    ------------------------------------------------------------ */

    // 1️⃣ Build the timeline first (so _mainMoveEndTime values exist)
    console.log("[Init] Building master timeline (first pass for occlusion)...");
    /* ---------- Stage 5  timeline  (always) ---------------------- */
    if (core.masterTimeline) core.masterTimeline.kill();
    // startAnimation();                   // Populates core.masterTimeline and ensures it's paused
    // buildMasterTimeline(SHOW_GUI) is inside startAnimation.
    // The original diff just had buildMasterTimeline(SHOW_GUI);
    // Let's assume startAnimation which calls buildMasterTimeline is the target.
    startAnimation(); // This calls buildMasterTimeline
    console.log("[Init] Master timeline (first pass for occlusion) built. Duration:", core.masterTimeline ? core.masterTimeline.duration() : 'N/A');

    /* -----------------------------------------------------------------
       2️⃣  WAIT until every block flagged isOcclusionMainObjectToCheck
           has finished Troika's async glyph/build pass.
    ------------------------------------------------------------------ */
    const occlusionRefSyncs = [];
    core.scenesConfig.forEach(sc => {
        sc.contentBlocks?.forEach(cb => {
            if (cb.isOcclusionMainObjectToCheck &&
                cb.createdMesh &&
                typeof cb.createdMesh.sync === 'function') {
                occlusionRefSyncs.push(cb.createdMesh.sync());
            }
        });
    });
    await Promise.all(occlusionRefSyncs);
    if (SHOW_GUI) console.log('[OCCLUSION-DEBUG] all reference text meshes synced');

    // renderer.autoUpdate = false;        // no accidental draws during pre-pass
    // core.renderer.autoUpdate is already false from initializeCoreThreeObjects
    console.log("[Init] Starting occlusion calculation pass...");
    const originalTime = 0;
    if (core.masterTimeline) core.masterTimeline.pause(0); // Ensure paused at 0 before occlusion seeks

    // scenesConfig.forEach(sc => { // Use core.scenesConfig
    core.scenesConfig.forEach(sc => { // Use core.scenesConfig
        if (!sc.contentBlocks.some(b => b.isOcclusionMainObjectToCheck)) return;

        const endT = sc._mainMoveEndTime;   // we'll set this in Step 3 c
        // window.masterTimeline.time(endT, true);           // seek (no render)
        // scene.updateMatrixWorld(true);      // refresh matrices in whichever scene is active
        // scene3.updateMatrixWorld(true);
        // fixOcclusion(sc.id, camera);
        if (core.masterTimeline && typeof endT === 'number') {
            core.masterTimeline.time(endT, false); // seek (no render, no events)
            if (core.threeSceneObjects.mainScene) core.threeSceneObjects.mainScene.updateMatrixWorld(true);
            if (core.threeSceneObjects.scene3Specific) core.threeSceneObjects.scene3Specific.updateMatrixWorld(true);
            // Iterate over all scenes in core.threeSceneObjects if more exist and need updates
            // for (const sceneName in core.threeSceneObjects) {
            //    if (core.threeSceneObjects[sceneName]) core.threeSceneObjects[sceneName].updateMatrixWorld(true);
            // }
            fixOcclusion(sc.id, core.camera); // Pass core.camera
        }
    });
    // window.masterTimeline.time(originalTime, true);       // back to t 0
    // renderer.autoUpdate = true;
    if (core.masterTimeline) core.masterTimeline.time(originalTime, false);       // back to t 0
    console.log("[Init] Occlusion calculation pass complete.");
    // if (window.sceneAnchors["scene3_..."] && ...) { // Deferred
    // }

    
    console.log("[Init] Building master timeline (final pass)...");
    // startAnimation(); // Final build of core.masterTimeline, should also pause it.
    // This is a second call to startAnimation() in the original code.
    // The diff implies buildMasterTimeline is called again.
    if (core.masterTimeline) core.masterTimeline.kill(); // Kill previous before rebuilding
    startAnimation(); // Rebuild timeline
    if (core.masterTimeline) core.masterTimeline.pause(0); // Explicitly ensure paused.
    console.log("[Init] Master timeline (final pass) built. Duration:", core.masterTimeline ? core.masterTimeline.duration() : 'N/A');

    loadingElement.style.display = 'none';
    // animate(); // Old animate() loop is GONE
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    // --- Milestone 2: Initialize DeterministicPlayer & Render First Frame ---
    console.log("[Init] Initializing DeterministicPlayer.");
    const player = new DeterministicPlayer(renderFrame);
    player.fps = 60;
    initializeCoreContextParts({ player });
    console.log("[Init] Assigning player to window.player...");
    window.player = player; // Also on window for easy console access during debugging
    console.log("[Init] player assigned to window.player:", !!window.player);

    // Setup Debug Scrubber if GUI is enabled
    if (SHOW_GUI) {
        const scrubber = document.getElementById('timeline-scrubber');
        if (scrubber && core.masterTimeline) {
            const totalFrames = Math.floor(core.masterTimeline.duration() * player.fps);
            scrubber.max = totalFrames;
            scrubber.value = 0;
            console.log(`[Init] Scrubber setup: maxFrames=${totalFrames}, duration=${core.masterTimeline.duration()}s, fps=${player.fps}`);

            scrubber.addEventListener('input', (event) => {
                if (player) player.gotoFrame(parseInt(event.target.value, 10));
            });
            // Player's _updateUIDebug method will handle updating scrubber display during play/pause
        }
    }

    console.log("[Init] Rendering initial frame (frame 0).");
    /* ---------- Stage 6  first frame (always) -------------------- */
    player.gotoFrame(0); // This will call setFrameTime(0) and then renderFrame()

    /* ---------- Dev-GUI panel (cold AND hot) ---------- */
    if (SHOW_GUI) {
      const { initDevPanel } = await import('./dev/DevPanel.js');
      initDevPanel();      // destroys previous gui if it existed

     // --- NEW: Initialize Camera Panel ---
     const { initCameraPanel } = await import('./dev/CameraPanel.js');
     initCameraPanel();

     // --- Initialize Lighting Panel ---
     const { initLightingPanel } = await import('./dev/LightingPanel.js');
     initLightingPanel();
     
     // --- Initialize Effects Panel ---
     const { initEffectsPanel } = await import('./dev/EffectsPanel.js');
     initEffectsPanel();
    }

    /* wire UI buttons -------------------------------------------- */
    document.getElementById('btn-play')?.addEventListener('click', () => player.play());
    document.getElementById('btn-pause')?.addEventListener('click', () => player.pause());

    // Add key listener for vignette controls
    window.addEventListener('keydown', function(event) {
        // Toggle vignette controls with "v" key
        if (event.key === 'v') {
            const controlsElem = document.getElementById('vignette-controls');
            if (controlsElem) {
                controlsElem.remove();
            } else {
                const controls = setupVignetteControls();
                if (controls) {
                    controls.id = 'vignette-controls';
                }
            }
        }
    });
}

// Animation loop
function animate() {
    // requestAnimationFrame(animate);
    
    // Update time for gradient shader
    // if (gradientUniforms && scene.getObjectByName("gradientBackgroundPlane")?.visible) {
    //     gradientUniforms.uTime.value = clock.getElapsedTime();
    // }
    // THIS ENTIRE FUNCTION WILL BE REPLACED BY DeterministicPlayer + renderFrame() in Milestone 2
    // For now, its contents should be removed or the function itself removed.
    // // Update time for gradient shader
    // if (core.gradientUniforms && core.threeSceneObjects.mainScene?.getObjectByName("gradientBackgroundPlane")?.visible) {
    //     // core.gradientUniforms.uTime.value = getFrameTime(); // This would use FrameClock
    // }

    // --- NEW: Render scenes to targets before composer if wipePass is active ---
    // if (wipePass && wipePass.enabled) {
    //      renderToTargets();
    // }
    // if (core.wipePass && core.wipePass.enabled) {
    //      renderToTargets(); // This logic moves to renderFrame()
    // }

    // Use composer instead of renderer for post-processing effects
    // composer.render();
    // if (core.composer) core.composer.render(); // This logic moves to renderFrame()
}

// Handle window resize
function onWindowResize() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // camera.aspect = width / height;
    // camera.updateProjectionMatrix();
    if (core.camera) {
        core.camera.aspect = width / height;
        core.camera.updateProjectionMatrix();
    }
    
    // renderer.setSize(width, height);
    if (core.renderer) {
        core.renderer.setPixelRatio(1); // Maintain pixelRatio 1 (from Milestone 6)
        core.renderer.setSize(width, height);
    }
    
    // Update composer and effects for new size
    // composer.setSize(width, height);
    if (core.composer) core.composer.setSize(width, height);

    // Update resolution uniform for gaussian blur shader
    // const pixelRatio = renderer.getPixelRatio();
    // const blurPass = composer.passes.find(pass => pass.uniforms && pass.uniforms.blurRadius);
    // if (blurPass) {
    //     blurPass.uniforms.resolution.value.set(width * pixelRatio, height * pixelRatio);
    // }
    if (core.blurPass) { // Access blurPass from core context
        core.blurPass.uniforms.resolution.value.set(width, height); // No pixelRatio multiplication if it's 1
    }

    // Update vignette blur pass resolution and aspect ratio
    if (core.vignetteBlurPass) {
        core.vignetteBlurPass.uniforms.resolution.value.set(width, height);
        core.vignetteBlurPass.uniforms.aspect.value = width / height;
    }

    // --- NEW: Update for Radial Wipe Pattern ---
    // if (rtPrev) rtPrev.setSize(width * pixelRatio, height * pixelRatio);
    // if (rtNext) rtNext.setSize(width * pixelRatio, height * pixelRatio);
    // if (wipePass) {
    //     wipePass.uniforms.aspect.value = width / height;
    // }
    if (core.rtPrev) core.rtPrev.setSize(width, height); // No pixelRatio multiplication if it's 1
    if (core.rtNext) core.rtNext.setSize(width, height); // No pixelRatio multiplication if it's 1
    if (core.activeMaskPass && core.activeMaskPass.material && core.activeMaskPass.material.uniforms.aspect) { // Access activeMaskPass from core context
        core.activeMaskPass.material.uniforms.aspect.value = width / height;
    }
    // --- END NEW ---

    // After resize, current frame should be re-rendered by the player
    // if (core.player) core.player.gotoFrame(core.player.currentFrame); // This will be added in Milestone 2
}

    function startAnimation() {
  

    // Calculate content duration from transcript for each scene (used for text reveals)
    // calculateAllSceneDurations(scenesConfig, allTranscriptWords, textLibrary);
    calculateAllSceneDurations(core.scenesConfig, core.allTranscriptWords, core.textLibrary); // Use core context
    
   
    // Call the new timeline builder function
    // It will set window.masterTimeline and return it (though we might not need to reassign here if window.masterTimeline is sufficient)
    // const masterTimeline = buildMasterTimeline(scenesConfig, SHOW_GUI, assetLibrary, composer, afterimagePass, bloomPass, wipePass);
    const newMasterTimeline = buildMasterTimeline(SHOW_GUI); // buildMasterTimeline now uses core context internally and populates core.masterTimeline
    // window.masterTimeline = newMasterTimeline; // Keep for debug if needed, but core.masterTimeline is canonical

    if (SHOW_GUI) console.log("%c[Animation] Master timeline fully constructed.", "color: green; font-weight: bold;"); 
}


    // NEW: Render scenes to their respective targets (adapted for scene/scene3)
    function renderToTargets() {
    // if (!scene || !camera || !scene3 || !rtPrev || !rtNext || !renderer) return;
    if (!core.threeSceneObjects.mainScene || !core.camera || !core.threeSceneObjects.scene3Specific || !core.rtPrev || !core.rtNext || !core.renderer) return;

    // Render current main scene (scene 1 & 2 content) to rtPrev
    // renderer.setRenderTarget(rtPrev);
    // renderer.clear(); 
    // renderer.render(scene, camera); // `scene` contains "if you want to..." and "without resistance"
    core.renderer.setRenderTarget(core.rtPrev);
    core.renderer.clear(); 
    core.renderer.render(core.threeSceneObjects.mainScene, core.camera);

    // Render the next scene (scene3 content: "stop acting", leos) to rtNext
    // renderer.setRenderTarget(rtNext);
    // renderer.clear(); // Clears with scene3.background (white)
    // renderer.render(scene3, camera);
    core.renderer.setRenderTarget(core.rtNext);
    core.renderer.clear(); // Clears with background of the scene being rendered
    core.renderer.render(core.threeSceneObjects.scene3Specific, core.camera);

    // renderer.setRenderTarget(null); // Back to default framebuffer for composer
    core.renderer.setRenderTarget(null); // Back to default framebuffer for composer
}

/* run the original init() now that all helpers are defined */
await init();

/* ---------- disposer handed back to HMR ------------ */
return () => {
  core.player?.pause();
  core.masterTimeline?.kill();
  if (window.gui?.destroy) window.gui.destroy();
};
} /* ← END of export async function initApp */
