// src/coreContext.js

// This object will hold references to all core components of the animation system.
// It helps avoid using global `window` properties and makes dependencies more explicit.
export const core = {
    // THREE.js essentials
    renderer: null,
    camera: null,
    // No default scene, scene3 here. They will be added to threeSceneObjects.
    threeSceneObjects: {}, // Will hold { sceneName1: THREE.Scene, sceneName2: THREE.Scene, ... }

    // Post-processing
    composer: null,
    renderPass: null,   // The main RenderPass instance in the composer
    bloomPass: null,
    blurPass: null,     // Gaussian blur pass instance
    activeMaskPass: null, // Renamed from wipePass
    rtPrev: null,       // WebGLRenderTarget for wipe transition (previous scene)
    rtNext: null,       // WebGLRenderTarget for wipe transition (next scene)
    // NEW: these two strings hold the keys (from threeSceneObjects)
    // that the mask pass should use *for the current frame*.
    maskSourceSceneKey: null,
    maskTargetSceneKey: null,

    // Animation System
    masterTimeline: null, // The main GSAP Master Timeline instance
    scenesConfig: null,   // The loaded scenesConfig array
    assetLibrary: null,   // The loaded assetLibrary object
    textLibrary: null,    // The loaded textLibrary object
    allTranscriptWords: [], // Loaded transcript words for reference

    // Scene Structure
    sceneAnchors: {},   // Populated by createSceneAnchors: { sceneId: THREE.Object3D }
    cameraRigRoot: null,  // The root Object3D of the camera rig
    cameraRigNodes: [],   // Array of Object3Ds forming the camera rig chain
    cameraRigParentKey: null, // NEW: key of the scene that should parent the camera rig

    // Active Camera Shake State
    activeCameraShake: {
        config: null,       // The specific cameraShake config object from sceneSequenceConfig
        startTime: 0,       // Absolute master timeline time when this shake effect started
        duration: 0,        // Calculated absolute duration of this shake effect on the master timeline
    },

    // Shaders & Miscellaneous
    gradientUniforms: null, // Uniforms for the fourCornerGradientShader (likely for a primary scene)

    // Hot-reload flags
    __assetsRegistered : false,
    __anchorsCreated   : false,
    __contentPlaced    : false,

    // Player (will be set later)
    player: null,
    objectMaskShaders: new Map(), // NEW: Cache for loaded object mask shader definitions
};

/**
 * Helper function to update parts of the core context.
 * @param {object} parts - An object with properties to merge into the core context.
 */
export function initializeCoreContextParts(parts) {
    Object.assign(core, parts);
    // The special handling for threeSceneObjects.mainScene and .scene3Specific is removed.
    // Functions creating THREE.Scene instances will now directly populate core.threeSceneObjects.
    // e.g., core.threeSceneObjects['myFirstScene'] = new THREE.Scene();
}
