import { gsap } from 'gsap';
import { overlapNeeded } from '../utils/overlapNeeded.js';
import { getRelativeTiming } from '../utils/transcriptUtils.js'; // For text animations
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'; // For mask target scene switch
import * as THREE from 'three'; // Needed for THREE.UniformsUtils and THREE.ShaderMaterial
import { core, initializeCoreContextParts } from '../coreContext.js';
import { macroScenesConfig } from '../config/sceneSequenceConfig.js';
import { DEFAULT_SHAKE_SEED } from '../utils/cameraShakeUtils.js'; // Import default seed

// Import mask shaders
import { CircularWipeShader } from '../shaders/circularWipeShader.js';
import { HorizontalWipeShader } from '../shaders/horizontalWipeShader.js'; // Example for a new one
import { DiagonalWipeShader } from '../shaders/diagonalWipeShader.js'; // NEW
import { applyObjectShaderMaskAnimation } from './objectMaskHelper.js'; // NEW IMPORT

const shaderRegistry = {
    circularWipe: CircularWipeShader,
    horizontalWipe: HorizontalWipeShader, // Add new shaders here
    diagonalWipe: DiagonalWipeShader, // NEW
};

// Default animation values if not specified in textLibrary
const DEFAULT_TEXT_ANIMATION = {
    fade: { dur: 0.3, ease: "power1.out" },
    slide: { x: -1, dur: 0.3, ease: "power2.out" }
};

function applyCameraShakeToTimeline(timeline, parentMoveGsapStartTime, parentMoveDuration, shakeConfigFromScene, SHOW_GUI, moveId = "unknown_move") {
    if (!shakeConfigFromScene || !shakeConfigFromScene.enabled) {
        return;
    }

    // Merge with defaults to ensure all properties are present in core.activeCameraShake.config
    // This ensures that calculateShakeTransform always receives a complete config object.
    const shakeConfig = {
        enabled: true, // Already checked, but good to have in defaults
        durationFactor: 1.0,
        startTimeOffsetFactor: 0.0,
        positionAmplitude: 0.1,
        positionFrequency: 10,
        rotationAmplitude: 0.005,
        rotationFrequency: 8,
        seed: DEFAULT_SHAKE_SEED,
        fadeInDurationFactor: 0.1,
        fadeOutDurationFactor: 0.1,
        ...shakeConfigFromScene // User config overrides defaults
    };

    const shakeStartTimeOffset = (shakeConfig.startTimeOffsetFactor) * parentMoveDuration;
    const actualShakeDuration = (shakeConfig.durationFactor) * parentMoveDuration; // Renamed for clarity

    if (actualShakeDuration <= 0) {
        if (SHOW_GUI) console.warn(`%c[Shake - ${moveId}] Shake has zero or negative duration (${actualShakeDuration.toFixed(3)}s). Skipping.`, "color: orange");
        return;
    }

    const actualShakeGsapStartTime = parentMoveGsapStartTime + shakeStartTimeOffset;

    // Use a dummy tween that spans the duration of the shake.
    // This allows us to use onStart, onComplete, and onReverseComplete
    // to manage the state correctly during forward play and backward scrubbing.
    const dummyShakeTarget = { value: 0 }; // A dummy object for GSAP to tween

    timeline.to(dummyShakeTarget, {
        value: 1, // Irrelevant value, just needs to be a tween
        duration: actualShakeDuration,
        immediateRender: false, // Important for onStart/onReverseComplete behavior
        onStart: () => { // Fires when playing forward into the shake or scrubbing forward onto its start
            core.activeCameraShake.config = shakeConfig;
            core.activeCameraShake.startTime = actualShakeGsapStartTime;
            core.activeCameraShake.duration = actualShakeDuration;
            if (SHOW_GUI) console.log(`%c[Shake - ${moveId}] ON_START/ACTIVATED at ${actualShakeGsapStartTime.toFixed(3)}s. Duration: ${actualShakeDuration.toFixed(3)}s.`, "color: #00F0C0", shakeConfig);
        },
        onUpdate: () => {
            // This ensures that if we scrub *into the middle* of an active shake,
            // the state is correctly set. This is crucial.
            // We only set it if it's not already this exact shake, to avoid redundant logs/ops.
            if (!core.activeCameraShake.config ||
                core.activeCameraShake.startTime !== actualShakeGsapStartTime ||
                core.activeCameraShake.duration !== actualShakeDuration) {

                // Check if the current timeline time is within this shake's duration
                const currentTime = timeline.time(); // Get current time of this timeline
                if (currentTime >= actualShakeGsapStartTime && currentTime < (actualShakeGsapStartTime + actualShakeDuration)) {
                    core.activeCameraShake.config = shakeConfig;
                    core.activeCameraShake.startTime = actualShakeGsapStartTime;
                    core.activeCameraShake.duration = actualShakeDuration;
                    if (SHOW_GUI) console.log(`%c[Shake - ${moveId}] ON_UPDATE/STATE_RESTORED at ${currentTime.toFixed(3)}s for shake starting ${actualShakeGsapStartTime.toFixed(3)}s.`, "color: #7FFF00");
                }
            }
        },
        onComplete: () => { // Fires when playing forward past the end of the shake
            // Only clear if this specific shake instance was the one active.
            if (core.activeCameraShake.startTime === actualShakeGsapStartTime &&
                core.activeCameraShake.config &&
                core.activeCameraShake.config.seed === shakeConfig.seed) {
                core.activeCameraShake.config = null;
                core.activeCameraShake.startTime = 0;
                core.activeCameraShake.duration = 0;
                if (SHOW_GUI) console.log(`%c[Shake - ${moveId}] ON_COMPLETE/DEACTIVATED at ${(actualShakeGsapStartTime + actualShakeDuration).toFixed(3)}s.`, "color: #FF8C00");
            }
        },
        onReverseComplete: () => { // Fires when scrubbing backward past the start of the shake
            // This means we've left the shake interval by going backwards.
            // Clear the state if this shake was the active one.
            if (core.activeCameraShake.startTime === actualShakeGsapStartTime &&
                core.activeCameraShake.config &&
                core.activeCameraShake.config.seed === shakeConfig.seed) {
                core.activeCameraShake.config = null;
                core.activeCameraShake.startTime = 0;
                core.activeCameraShake.duration = 0;
                if (SHOW_GUI) console.log(`%c[Shake - ${moveId}] ON_REVERSE_COMPLETE/DEACTIVATED at ${actualShakeGsapStartTime.toFixed(3)}s.`, "color: #FF00FF");
            }
        }
    }, actualShakeGsapStartTime); // Place this dummy tween at the calculated start time
}

export function buildMasterTimeline(SHOW_GUI) {
    let previousSceneCamEndTime = 0;
    const timeline = gsap.timeline({ paused: true }); // Create paused
    let staggerCounters = {};

    // Initial setup for the very first scene (time 0)
    const initialSceneConfig = core.scenesConfig[0];
    const initialTargetSceneKey = initialSceneConfig?.targetThreeSceneName || "mainScene";
    const initialThreeSceneObject = core.threeSceneObjects[initialTargetSceneKey];
    const initialGradientShouldBeVisible = initialTargetSceneKey === "mainScene"; // Assuming gradient is only for mainScene

    if (initialThreeSceneObject) {
        timeline.add(() => {
            if (core.renderPass) core.renderPass.scene = initialThreeSceneObject;
            if (core.cameraRigRoot && core.cameraRigRoot.parent !== initialThreeSceneObject) {
                initialThreeSceneObject.attach(core.cameraRigRoot);
            }
            // initialise camera-rig parent key so scrubbing from t=0 works
            core.cameraRigParentKey = initialSceneConfig.targetThreeSceneName || "mainScene";
        }, 0);
    }

    const gradientPlane = core.threeSceneObjects.mainScene?.getObjectByName("gradientBackgroundPlane");
    if (gradientPlane) {
        timeline.set(gradientPlane, { visible: initialGradientShouldBeVisible }, 0);
    }

    // Set bloomPass.enabled based on initial macro scene config
    const initialMacroConfig = macroScenesConfig.find(ms => ms.id === initialTargetSceneKey);
    if (core.bloomPass) {
        const bloomEnabled = initialMacroConfig?.postProcessing?.bloom ?? true;
        timeline.set(core.bloomPass, { enabled: bloomEnabled }, 0);
    }

    core.scenesConfig.forEach((sceneConfig, index) => { // Use core.scenesConfig
        const actualPreviousSceneTrueEndTime = previousSceneCamEndTime;
        const mainSceneCamMoveDuration = sceneConfig.anchorPositioning?.cameraAnimationTarget?.duration || 1.0;
        let currentCamTweenStartTime = previousSceneCamEndTime;
        const sceneMoveId = `${sceneConfig.id}_main_cam_move`; // For logging and unique identification

        if (SHOW_GUI) console.log(`%c[BuildTimeline] Scene: ${sceneConfig.id}, MainCamMoveDur: ${mainSceneCamMoveDuration.toFixed(2)}s, DefaultStartTime: ${currentCamTweenStartTime.toFixed(2)}s`, 'color:purple');

        // --- Camera Animation to position/frame the current scene's anchor ---
        if (index === 0) {
            const firstSceneCamAnimConfig = sceneConfig.anchorPositioning?.cameraAnimationTarget;
            const targetNullIndex = firstSceneCamAnimConfig?.targetNullIndex !== undefined ? firstSceneCamAnimConfig.targetNullIndex : 0;
            const targetNull = core.cameraRigNodes[targetNullIndex];
            if (SHOW_GUI) console.log(`%c[BuildTimeline Scene 0] TargetNullIndex: ${targetNullIndex}, Found: ${targetNull ? targetNull.name : 'NO'}`, 'color:green');
            if (targetNull) {
                const targetZ = firstSceneCamAnimConfig?.targetValues?.z !== undefined ? firstSceneCamAnimConfig.targetValues.z : 45;
                timeline.to(targetNull.position, {
                    z: targetZ,
                    duration: mainSceneCamMoveDuration,
                    ease: firstSceneCamAnimConfig?.ease || "power2.inOut"
                }, 0);
                if (firstSceneCamAnimConfig && firstSceneCamAnimConfig.cameraShake) {
                    applyCameraShakeToTimeline(timeline, currentCamTweenStartTime, mainSceneCamMoveDuration, firstSceneCamAnimConfig.cameraShake, SHOW_GUI, sceneMoveId);
                }
                currentCamTweenStartTime = 0;
                previousSceneCamEndTime = mainSceneCamMoveDuration;
                sceneConfig._mainMoveEndTime = previousSceneCamEndTime;
            } else {
                console.error(`Target null at index ${targetNullIndex} for initial view of scene ${sceneConfig.id} not found.`);
                previousSceneCamEndTime = currentCamTweenStartTime + mainSceneCamMoveDuration;
                sceneConfig._mainMoveEndTime = previousSceneCamEndTime;
            }
        } else if (sceneConfig.anchorPositioning && sceneConfig.anchorPositioning.fromPrevious) {
            const transitionConfig = sceneConfig.anchorPositioning;
            const camAnimTargetConfig = transitionConfig.cameraAnimationTarget;

            if (transitionConfig.transitionType === "cameraMove" && camAnimTargetConfig) {
                const targetNull = core.cameraRigNodes[camAnimTargetConfig.targetNullIndex];
                if (!targetNull) {
                    console.error(`Camera null at index ${camAnimTargetConfig.targetNullIndex} not found for scene ${sceneConfig.id} transition`);
                    previousSceneCamEndTime = currentCamTweenStartTime + mainSceneCamMoveDuration;
                    sceneConfig._mainMoveEndTime = previousSceneCamEndTime;
                    // return; // Exiting forEach loop here isn't standard, just skips this iteration's camera move
                } else {
                    let targetValues = camAnimTargetConfig.targetValues;
                    let overlapAmount = 0;
                    const prevSceneConfigForPercentage = core.scenesConfig[index-1];
                    const prevMainSceneCamMoveDurationForPercentage = prevSceneConfigForPercentage.anchorPositioning?.cameraAnimationTarget?.duration || 1.0;

                    if (transitionConfig.overlapCalculationMode === "percentage" && typeof transitionConfig.overlapValue === 'number') {
                        overlapAmount = transitionConfig.overlapValue * prevMainSceneCamMoveDurationForPercentage;
                    } else {
                        const prevCamEaseName = core.scenesConfig[index-1].anchorPositioning?.cameraAnimationTarget?.ease || "power2.inOut";
                        const currentCamEaseName = camAnimTargetConfig.ease || "power2.inOut";
                        const overlapKey = transitionConfig.overlapKey || "OVERLAP_THRESHOLD_1_2";
                        const prevMainSceneCamMoveDuration = core.scenesConfig[index-1].anchorPositioning?.cameraAnimationTarget?.duration || 1.0;
                        overlapAmount = overlapNeeded(
                            window[overlapKey] || 0.15, 
                            gsap.parseEase(prevCamEaseName), gsap.parseEase(currentCamEaseName),
                            prevMainSceneCamMoveDuration, mainSceneCamMoveDuration
                        );
                    }
                    currentCamTweenStartTime = Math.max(0, previousSceneCamEndTime - overlapAmount); // Ensure not negative
                    if (targetValues) {
                        timeline.to(targetNull.position, {
                            ...targetValues,
                            duration: mainSceneCamMoveDuration,
                            ease: camAnimTargetConfig.ease || "power1.inOut"
                        }, currentCamTweenStartTime);
                        if (camAnimTargetConfig.cameraShake) {
                            applyCameraShakeToTimeline(timeline, currentCamTweenStartTime, mainSceneCamMoveDuration, camAnimTargetConfig.cameraShake, SHOW_GUI, sceneMoveId);
                        }
                    }
                    previousSceneCamEndTime = currentCamTweenStartTime + mainSceneCamMoveDuration;
                    sceneConfig._mainMoveEndTime = previousSceneCamEndTime;
                }
            } else if (transitionConfig.transitionType === "instant" && camAnimTargetConfig) {
                const targetThreeSceneKey = sceneConfig.targetThreeSceneName || "mainScene"; // Default to mainScene if not specified
                const targetThreeSceneObject = core.threeSceneObjects[targetThreeSceneKey];

                if (!targetThreeSceneObject) {
                    console.error(`[BuildTimeline] 'instant' transition for ${sceneConfig.id} missing target THREE.Scene: ${targetThreeSceneKey}. Treating as simple camera move.`);
                    // Fallback: Calculate end time as if it were a simple camera move
                    // The main camera animation for this scene (defined by camAnimTargetConfig)
                    // will still be added by the generic logic if targetNull is found.
                    // Here, we just ensure previousSceneCamEndTime is updated.
                    // The overlap calculation for 'instant' needs a previous scene.
                    if (index > 0) {
                        const prevSceneConfigForOverlap = core.scenesConfig[index - 1];
                        const prevMainSceneCamMoveDurationForOverlap = prevSceneConfigForOverlap.anchorPositioning?.cameraAnimationTarget?.duration || 1.0;
                        // Default to sequential if target scene object is missing for the cut itself
                        currentCamTweenStartTime = previousSceneCamEndTime;
                    } else {
                        currentCamTweenStartTime = 0; // Should not happen if fromPrevious is true
                    }
                    previousSceneCamEndTime = currentCamTweenStartTime + mainSceneCamMoveDuration;
                    sceneConfig._mainMoveEndTime = previousSceneCamEndTime;

                } else {
                    let overlapAmount = 0;
                    const prevSceneConfigForOverlap = core.scenesConfig[index - 1]; // Should exist if fromPrevious is true
                    const prevMainSceneCamMoveDurationForOverlap = prevSceneConfigForOverlap.anchorPositioning?.cameraAnimationTarget?.duration || 1.0;

                    if (transitionConfig.overlapCalculationMode === "percentage" && typeof transitionConfig.overlapValue === 'number') {
                        overlapAmount = transitionConfig.overlapValue * prevMainSceneCamMoveDurationForOverlap;
                    } else if (transitionConfig.overlapCalculationMode === "threshold" && transitionConfig.overlapKey) {
                        const overlapThreshold = window[transitionConfig.overlapKey] || 0.15; // Default if key not found
                        const prevCamEaseName = prevSceneConfigForOverlap.anchorPositioning?.cameraAnimationTarget?.ease || "power2.inOut";
                        const currentCamEaseName = camAnimTargetConfig.ease || "power1.inOut";
                        overlapAmount = overlapNeeded(
                            overlapThreshold,
                            gsap.parseEase(prevCamEaseName),
                            gsap.parseEase(currentCamEaseName),
                            prevMainSceneCamMoveDurationForOverlap,
                            mainSceneCamMoveDuration
                        );
                    } else {
                        if (SHOW_GUI) console.warn(`[BuildTimeline] 'instant' transition for ${sceneConfig.id} missing valid overlap config. Defaulting to 0 overlap (sequential).`);
                        overlapAmount = 0;
                    }

                    currentCamTweenStartTime = Math.max(0, previousSceneCamEndTime - overlapAmount);

                    // --- NEW: actually move the camera rig ---
                    const targetNull = core.cameraRigNodes[camAnimTargetConfig.targetNullIndex];
                    if (targetNull) {
                        timeline.to(
                            targetNull.position,
                            {
                                ...(camAnimTargetConfig.targetValues || {}),
                                duration: mainSceneCamMoveDuration,
                                ease: camAnimTargetConfig.ease || "power1.inOut"
                            },
                            currentCamTweenStartTime           // honours the overlap you just calculated
                        );
                        if (camAnimTargetConfig.cameraShake) {
                            applyCameraShakeToTimeline(timeline, currentCamTweenStartTime, mainSceneCamMoveDuration, camAnimTargetConfig.cameraShake, SHOW_GUI, sceneMoveId);
                        }
                    }

                    // Here, we only schedule the *instant switch actions*.
                    const activationOffset = transitionConfig.activationOffset || 0; // Get offset, default to 0
                    const actualCutTime = currentCamTweenStartTime + activationOffset;

                    // Use timeline.set() for properties that GSAP can automatically reverse when scrubbing.

                    // At the actual cut time:
                    // 1. Switch the main render pass to the new scene.
                    if (core.renderPass) {
                        timeline.set(core.renderPass, { scene: targetThreeSceneObject }, actualCutTime);
                    }
                    // 2. Update the camera rig's desired parent scene key.
                    timeline.set(core, { cameraRigParentKey: targetThreeSceneKey }, actualCutTime);

                    // 3. Ensure the mask pass is disabled.
                    if (core.activeMaskPass) {
                        timeline.set(core.activeMaskPass, { enabled: false }, actualCutTime);
                    }

                    // 4. Set gradient visibility based on the new target scene.
                    if (gradientPlane) {
                        timeline.set(gradientPlane, { visible: (targetThreeSceneKey === "mainScene") }, actualCutTime);
                    }

                    // 5. Set bloom pass enabled state based on the new target scene's macro config.
                    if (core.bloomPass) {
                        const targetMacroConfig = macroScenesConfig.find(ms => ms.id === targetThreeSceneKey);
                        const bloomEnabled = targetMacroConfig?.postProcessing?.bloom ?? true;
                        timeline.set(core.bloomPass, { enabled: bloomEnabled }, actualCutTime);
                    }

                    if (SHOW_GUI) {
                        timeline.call(() => { // For logging, a .call() is fine as it doesn't need reversal.
                            console.log(`%c[BuildTimeline] INSTANT CUT to ${targetThreeSceneKey} scheduled at t=${actualCutTime.toFixed(2)}s (camera move started at t=${currentCamTweenStartTime.toFixed(2)}s)`, "color: red; font-weight: bold;");
                        }, null, actualCutTime); // Log at actualCutTime
                    }

                    // The end time of this scene's main camera movement is determined by its start + duration
                    previousSceneCamEndTime = currentCamTweenStartTime + mainSceneCamMoveDuration;
                    sceneConfig._mainMoveEndTime = previousSceneCamEndTime;
                }
            } else { // Non-"cameraMove" transitions (e.g., radialWipe) that might still have associated camera animation
                if (camAnimTargetConfig && camAnimTargetConfig.targetNullIndex !== undefined) {
                    const targetNull = core.cameraRigNodes[camAnimTargetConfig.targetNullIndex];
                    if (targetNull) {
                        let overlapAmount = 0;
                        const prevSceneConfigForPercentage = core.scenesConfig[index-1];
                        const previousScenesActualMainCameraMoveDuration = prevSceneConfigForPercentage.anchorPositioning?.cameraAnimationTarget?.duration || 1.0;

                        if (transitionConfig.overlapCalculationMode === "percentage" && typeof transitionConfig.overlapValue === 'number') {
                            overlapAmount = transitionConfig.overlapValue * previousScenesActualMainCameraMoveDuration;
                        } else {
                            const prevCamEaseName = core.scenesConfig[index-1].anchorPositioning?.cameraAnimationTarget?.ease || "power2.inOut";
                            const currentCamEaseName = camAnimTargetConfig.ease || "power2.inOut";
                            const overlapKey = transitionConfig.overlapKey || "OVERLAP_THRESHOLD_2_3"; 
                            const prevMainSceneCamMoveDurationForOverlap = core.scenesConfig[index-1].anchorPositioning?.cameraAnimationTarget?.duration || 1.0;
                            overlapAmount = overlapNeeded(
                                window[overlapKey] || 0.05,
                                gsap.parseEase(prevCamEaseName), gsap.parseEase(currentCamEaseName),
                                prevMainSceneCamMoveDurationForOverlap, mainSceneCamMoveDuration 
                            );
                        }
                        currentCamTweenStartTime = Math.max(0, previousSceneCamEndTime - overlapAmount); // Ensure not negative
                        timeline.to(targetNull.position, {
                            ...(camAnimTargetConfig.targetValues || {}),
                            duration: mainSceneCamMoveDuration,
                            ease: camAnimTargetConfig.ease || "power1.inOut"
                        }, currentCamTweenStartTime);
                        if (camAnimTargetConfig.cameraShake) {
                            applyCameraShakeToTimeline(timeline, currentCamTweenStartTime, mainSceneCamMoveDuration, camAnimTargetConfig.cameraShake, SHOW_GUI, sceneMoveId);
                        }
                        previousSceneCamEndTime = currentCamTweenStartTime + mainSceneCamMoveDuration;
                        sceneConfig._mainMoveEndTime = previousSceneCamEndTime;
                    } else { previousSceneCamEndTime = currentCamTweenStartTime + mainSceneCamMoveDuration; sceneConfig._mainMoveEndTime = previousSceneCamEndTime;}
                } else {
                    previousSceneCamEndTime = currentCamTweenStartTime + mainSceneCamMoveDuration;
                    sceneConfig._mainMoveEndTime = previousSceneCamEndTime;
                }
            }
        } else {
            previousSceneCamEndTime = currentCamTweenStartTime + mainSceneCamMoveDuration;
            sceneConfig._mainMoveEndTime = previousSceneCamEndTime;
        }

        // --- Apply Post-Processing Settings and other discrete states for the Current Scene ---
        // This time is generally when the camera has arrived or is arriving to frame the current scene.
        const sceneEffectStartTime = currentCamTweenStartTime; // Adjust if effects need to start earlier/later than cam move start
        const ppConfig = sceneConfig.postProcessing;

        if (ppConfig) {
            // BloomPass settings
            if (core.bloomPass && ppConfig.bloom) {
                timeline.set(core.bloomPass, {
                    strength: ppConfig.bloom.strength,
                    radius: ppConfig.bloom.radius,
                    threshold: ppConfig.bloom.threshold,
                }, sceneEffectStartTime);
            }

            // GaussianBlur settings
            if (core.blurPass && ppConfig.gaussianBlur && core.blurPass.uniforms.blurRadius) {
                timeline.set(core.blurPass.uniforms.blurRadius, { value: ppConfig.gaussianBlur.blurRadius }, sceneEffectStartTime);
            }
        } else { // If no ppConfig for the scene, ensure defaults (e.g., some effects off)
        }

        // --- Asset Animations & Text Animations ---
        let assetAppearanceTimeBase = currentCamTweenStartTime;
        // This logic might need to be generalized if asset appearance depends on the specific mask type/timing
        if (sceneConfig.anchorPositioning?.transitionType === "mask" && window.sceneMarkers && window.sceneMarkers[sceneConfig.id]) {
            assetAppearanceTimeBase = window.sceneMarkers[sceneConfig.id].radialStart;
        }

        if (sceneConfig.contentBlocks) {
            sceneConfig.contentBlocks.forEach(blockConfig => {
                if (blockConfig.type === "asset") {
                    const createdAssetMesh = blockConfig.createdMesh;
                    if (!createdAssetMesh) {
                        if (SHOW_GUI) console.warn(`[BuildTimeline AssetAnim] Mesh for ${blockConfig.id} in ${sceneConfig.id} not found.`);
                        return;
                    }
                    const assetLibEntry = core.assetLibrary[blockConfig.assetConfigId]; // Use core.assetLibrary
                    if (assetLibEntry?.defaultAnimation?.tweens) {
                        // ... (defaultAnimation logic as in original) ...
                        const mainCamMoveDurationForThisScene = sceneConfig.anchorPositioning?.cameraAnimationTarget?.duration || 1.0;
                        let flyDirectionForSwords = 0;
                        if (assetLibEntry.defaultAnimation.tweens.some(t => t.targetValue.toString().includes('flyDirection'))) {
                            if (blockConfig.assetConfigId.toLowerCase().includes("left")) flyDirectionForSwords = -1;
                            if (blockConfig.assetConfigId.toLowerCase().includes("right")) flyDirectionForSwords = 1;
                        }
                        const sceneContext = {
                            mainCamMoveDuration: mainCamMoveDurationForThisScene,
                            flyDirection: flyDirectionForSwords
                        };
                        assetLibEntry.defaultAnimation.tweens.forEach(tweenConfig => {
                            const targetObject = createdAssetMesh;
                            let actualTargetProperty = tweenConfig.targetProperty;
                            let objToAnimate = targetObject;
                            const props = actualTargetProperty.split('.');
                            if (props.length > 1) {
                                for (let i = 0; i < props.length - 1; i++) {
                                    objToAnimate = objToAnimate[props[i]];
                                    if (!objToAnimate) return;
                                }
                                actualTargetProperty = props[props.length - 1];
                            }
                            const tweenVars = { ease: tweenConfig.ease || "none", duration: tweenConfig.durationFactor ? sceneContext.mainCamMoveDuration * tweenConfig.durationFactor : (tweenConfig.duration || 1.0) };
                            tweenVars[actualTargetProperty] = typeof tweenConfig.targetValue === 'function' ? tweenConfig.targetValue(objToAnimate[actualTargetProperty], assetLibEntry, sceneContext) : tweenConfig.targetValue;
                            if (tweenConfig.fromValue !== undefined) {
                                const fromVars = {};
                                fromVars[actualTargetProperty] = typeof tweenConfig.fromValue === 'function' ? tweenConfig.fromValue(objToAnimate[actualTargetProperty], assetLibEntry, sceneContext) : tweenConfig.fromValue;
                                timeline.fromTo(objToAnimate, fromVars, tweenVars, currentCamTweenStartTime + (tweenConfig.startTime || 0));
                            } else {
                                timeline.to(objToAnimate, tweenVars, currentCamTweenStartTime + (tweenConfig.startTime || 0));
                            }
                        });
                    }
                    if (blockConfig.timelineAnimations) {
                        let blockSpecificStartTimeOffset = 0;
                        if (blockConfig.staggerInGroup && blockConfig.staggerInGroup.groupKey && typeof blockConfig.staggerInGroup.delay === 'number') {
                            const key = blockConfig.staggerInGroup.groupKey;
                            staggerCounters[key] = (staggerCounters[key] || 0);
                            blockSpecificStartTimeOffset = staggerCounters[key] * blockConfig.staggerInGroup.delay;
                            staggerCounters[key]++;
                        }
                        blockConfig.timelineAnimations.forEach(animConfig => {
                            const baseAnimStartTimeInScene = animConfig.startTime || 0;
                            let individualAssetAnimStartTime = assetAppearanceTimeBase + blockSpecificStartTimeOffset + baseAnimStartTimeInScene;
                            
                            if (animConfig.animationType === "objectShaderMask") { // NEW: Use the helper
                                applyObjectShaderMaskAnimation(timeline, createdAssetMesh, animConfig, individualAssetAnimStartTime, SHOW_GUI);
                                return; // Skip standard property animation processing
                            }
                            
                            const targetObject = createdAssetMesh;
                            let actualTargetProperty = animConfig.targetProperty;
                            let propertyHost = targetObject;
                            if (!actualTargetProperty) return;
                            const props = actualTargetProperty.split('.');
                            if (props.length > 1) {
                                for (let i = 0; i < props.length - 1; i++) {
                                    propertyHost = propertyHost[props[i]];
                                    if (!propertyHost) return;
                                }
                                actualTargetProperty = props[props.length - 1];
                            }
                            const tweenVars = { ease: animConfig.ease || "power1.out", duration: animConfig.duration || 1.0, repeat: animConfig.repeat, yoyo: animConfig.yoyo, delay: animConfig.delay || 0 };
                            let gsapTarget = propertyHost;
                            let effectiveFromVars = {};
                            if ((actualTargetProperty === 'scale' || actualTargetProperty === 'position' || actualTargetProperty === 'rotation') && typeof animConfig.targetValue === 'object' && animConfig.targetValue !== null && !Array.isArray(animConfig.targetValue)) {
                                gsapTarget = propertyHost[actualTargetProperty];
                                Object.assign(tweenVars, animConfig.targetValue);
                                if (animConfig.fromValue !== undefined && typeof animConfig.fromValue === 'object' && animConfig.fromValue !== null && !Array.isArray(animConfig.fromValue)) {
                                    Object.assign(effectiveFromVars, animConfig.fromValue);
                                }
                            } else {
                                tweenVars[actualTargetProperty] = typeof animConfig.targetValue === 'function' ? animConfig.targetValue(propertyHost[actualTargetProperty], blockConfig, sceneConfig) : animConfig.targetValue;
                                if (animConfig.fromValue !== undefined) {
                                    effectiveFromVars[actualTargetProperty] = typeof animConfig.fromValue === 'function' ? animConfig.fromValue(propertyHost[actualTargetProperty], blockConfig, sceneConfig) : animConfig.fromValue;
                                }
                            }
                            if (animConfig.fromValue !== undefined) {
                                timeline.fromTo(gsapTarget, effectiveFromVars, tweenVars, individualAssetAnimStartTime);
                            } else {
                                timeline.to(gsapTarget, tweenVars, individualAssetAnimStartTime);
                            }
                        });
                    }
                } else if (blockConfig.type === "text" && blockConfig.animationElements && blockConfig.animationElements.length > 0) {
                    if (sceneConfig.transcriptWords && sceneConfig.transcriptWords.length > 0) {
                        const textLibEntry = core.textLibrary[blockConfig.textConfigId]; // Get textLibrary entry
                        const animationElementsPerLine = blockConfig.animationElements; // New structure

                        // Determine default animation settings from textLibEntry
                        const defaultAnimConfig = textLibEntry.defaultAnimation || {};
                        const defaultGranularity = defaultAnimConfig.granularity || 'word'; // Fallback if not in config
                        const defaultLetterStagger = defaultAnimConfig.letterStagger || 0.03; // Fallback
                        const defaultTweens = defaultAnimConfig.tweens || []; // Fallback to empty array

                        const textTranscriptWords = sceneConfig.transcriptWords;
                        const sceneTextTiming = getRelativeTiming(textTranscriptWords);
                        let textBlockMasterTimelineBaseTime = blockConfig.startTextAnimationsAfterOverlap === true ? actualPreviousSceneTrueEndTime : currentCamTweenStartTime;
                        
                        // The new animationElementsPerLine is always an array of lines.
                        // Each line contains units (word meshes or arrays of letter meshes).

                        let overallTranscriptWordIndex = 0; // To track words across all lines for transcript timing

                        animationElementsPerLine.forEach((lineAnimUnits, lineIdx) => {
                            // Get animation config for this specific line, falling back to defaults
                            const lineSpecificAnimConfig = textLibEntry.lines && textLibEntry.lines[lineIdx] && textLibEntry.lines[lineIdx].animation
                                ? textLibEntry.lines[lineIdx].animation
                                : {};

                            const currentGranularity = lineSpecificAnimConfig.granularity || defaultGranularity;
                            const currentLetterStagger = lineSpecificAnimConfig.letterStagger !== undefined ? lineSpecificAnimConfig.letterStagger : defaultLetterStagger; // Stays for letter granularity
                            const currentTweens = lineSpecificAnimConfig.tweens || defaultTweens;

                            lineAnimUnits.forEach((animUnit, unitIdxInLine) => { // animUnit is a word mesh OR an array of letter meshes
                                if (overallTranscriptWordIndex >= textTranscriptWords.length) {
                                    if (SHOW_GUI) console.warn(`[BuildTimeline Text] Ran out of transcript words for scene ${sceneConfig.id}, line ${lineIdx}, unit ${unitIdxInLine}`);
                                    return;
                                }
                                const transcriptWord = textTranscriptWords[overallTranscriptWordIndex];
                                const wordAudioStartTime = sceneTextTiming.relStarts[overallTranscriptWordIndex];
                                const baseAnimStartTimeForUnit = textBlockMasterTimelineBaseTime + Math.max(0, wordAudioStartTime - 0.1); // -0.1 for visual lead

                                if (currentGranularity === 'letter' && Array.isArray(animUnit)) { // Animating letters for this word
                                    animUnit.forEach((letterMesh, letterIdxInWord) => {
                                        if (!letterMesh) return;
                                        const letterBaseTime = baseAnimStartTimeForUnit + (letterIdxInWord * currentLetterStagger);
                                        const meshToAnimate = letterMesh; // Convenience variable

                                        currentTweens.forEach(tweenConfig => {
                                            const { target, from, to, duration, ease, startTimeOffset = 0 } = tweenConfig;
                                            const actualStartTime = letterBaseTime + startTimeOffset;
                                            let gsapTargetObject;

                                            switch (target) {
                                                case "position": gsapTargetObject = meshToAnimate.position; break;
                                                case "scale":    gsapTargetObject = meshToAnimate.scale;    break;
                                                case "rotation": gsapTargetObject = meshToAnimate.rotation; break;
                                                case "self":
                                                default:         gsapTargetObject = meshToAnimate;         break;
                                            }
                                            
                                            const gsapTweenParams = { duration: duration || 0.3, ease: ease || "none", overwrite: "auto" };
                                            let finalToVars = {};
                                            let finalFromVars = {};

                                            if (from) {
                                                // 'from' and 'to' objects in config now define TARGET states or OFFSETS for properties of gsapTargetObject
                                                // For position, scale, rotation, these are often relative to the original state.
                                                // For 'self' properties like fillOpacity, they are absolute.

                                                // Construct the 'to' state for GSAP
                                                Object.keys(to || {}).forEach(key => {
                                                    if (gsapTargetObject === meshToAnimate.position || gsapTargetObject === meshToAnimate.scale || gsapTargetObject === meshToAnimate.rotation) {
                                                        const toOffsetConfig = (to && typeof to[key] === 'number') ? to[key] : 0;
                                                        const fromOffsetConfig = (from && typeof from[key] === 'number') ? from[key] : 0;
                                                        finalToVars[key] = gsapTargetObject[key] + (toOffsetConfig - fromOffsetConfig);
                                                    } else {
                                                        finalToVars[key] = to[key]; // For 'self' properties, 'to' is the absolute target value
                                                    }
                                                });

                                                // Construct the 'from' state for GSAP
                                                Object.keys(from || {}).forEach(key => {
                                                    finalFromVars[key] = (gsapTargetObject === meshToAnimate.position || gsapTargetObject === meshToAnimate.scale || gsapTargetObject === meshToAnimate.rotation)
                                                                     ? gsapTargetObject[key] + from[key] // 'from' values are offsets from original
                                                                     : from[key]; // For 'self' properties, 'from' is the absolute start value
                                                });
                                                timeline.fromTo(gsapTargetObject, { ...finalFromVars }, { ...finalToVars, ...gsapTweenParams }, actualStartTime);
                                            } else {
                                                Object.keys(to || {}).forEach(key => {
                                                    if (gsapTargetObject === meshToAnimate.position || gsapTargetObject === meshToAnimate.scale || gsapTargetObject === meshToAnimate.rotation) {
                                                        const toOffsetConfig = (to && typeof to[key] === 'number') ? to[key] : 0;
                                                        finalToVars[key] = gsapTargetObject[key] + toOffsetConfig;
                                                    } else {
                                                        finalToVars[key] = to[key];
                                                    }
                                                });
                                                timeline.to(gsapTargetObject, { ...finalToVars, ...gsapTweenParams }, actualStartTime);
                                            }
                                        });
                                    });
                                } else if (currentGranularity === 'word' && !Array.isArray(animUnit)) { // Animating word (animUnit is the wordMesh)
                                    const wordMesh = animUnit;
                                    if (!wordMesh) return;
                                    const wordBaseTime = baseAnimStartTimeForUnit;
                                    const meshToAnimate = wordMesh; // Convenience variable
                                    currentTweens.forEach(tweenConfig => {
                                        const { target, from, to, duration, ease, startTimeOffset = 0 } = tweenConfig; // 'from' and 'to' are from config
                                        const actualStartTime = wordBaseTime + startTimeOffset;
                                        let gsapTargetObject;
                                        switch (target) {
                                            case "position": gsapTargetObject = meshToAnimate.position; break;
                                            case "scale":    gsapTargetObject = meshToAnimate.scale;    break;
                                            case "rotation": gsapTargetObject = meshToAnimate.rotation; break;
                                            case "self":
                                            default:         gsapTargetObject = meshToAnimate;         break;
                                        }
                                        
                                        const gsapTweenParams = { duration: duration || 0.3, ease: ease || "none", overwrite: "auto" };
                                        let finalToVars = {};
                                        let finalFromVars = {};
                                        
                                        if (from) {
                                            Object.keys(to || {}).forEach(key => {
                                                if (gsapTargetObject === meshToAnimate.position || gsapTargetObject === meshToAnimate.scale || gsapTargetObject === meshToAnimate.rotation) {
                                                    const toOffsetConfig = (to && typeof to[key] === 'number') ? to[key] : 0;
                                                    const fromOffsetConfig = (from && typeof from[key] === 'number') ? from[key] : 0;
                                                    finalToVars[key] = gsapTargetObject[key] + (toOffsetConfig - fromOffsetConfig);
                                                } else {
                                                    finalToVars[key] = to[key];
                                                }
                                            });
                                            Object.keys(from || {}).forEach(key => {
                                                finalFromVars[key] = (gsapTargetObject === meshToAnimate.position || gsapTargetObject === meshToAnimate.scale || gsapTargetObject === meshToAnimate.rotation)
                                                                 ? gsapTargetObject[key] + from[key]
                                                                 : from[key];
                                            });
                                            timeline.fromTo(gsapTargetObject, { ...finalFromVars }, { ...finalToVars, ...gsapTweenParams }, actualStartTime);
                                        } else {
                                            Object.keys(to || {}).forEach(key => {
                                                if (gsapTargetObject === meshToAnimate.position || gsapTargetObject === meshToAnimate.scale || gsapTargetObject === meshToAnimate.rotation) {
                                                    const toOffsetConfig = (to && typeof to[key] === 'number') ? to[key] : 0;
                                                    finalToVars[key] = gsapTargetObject[key] + toOffsetConfig;
                                                } else {
                                                    finalToVars[key] = to[key];
                                                }
                                            });
                                            timeline.to(gsapTargetObject, { ...finalToVars, ...gsapTweenParams }, actualStartTime);
                                        }
                                    });
                                } else {
                                    if (SHOW_GUI) console.warn(`[BuildTimeline Text] Mismatch between granularity ('${currentGranularity}') and animUnit type for scene ${sceneConfig.id}, line ${lineIdx}, unit ${unitIdxInLine}. AnimUnit is array: ${Array.isArray(animUnit)}`);
                                }
                                overallTranscriptWordIndex++;
                            });
                        });
                    }
                }
            });
        }

        // --- Handle Mask Transition (replaces Radial Wipe specific logic) ---
        if (sceneConfig.anchorPositioning && sceneConfig.anchorPositioning.transitionType === "mask") {
            const maskTransitionConfig = sceneConfig.anchorPositioning;
            const maskParams = maskTransitionConfig.maskParams;

            if (maskParams && maskParams.shaderKey) {
                const prevSceneConfig = index > 0 ? core.scenesConfig[index-1] : null;

                const sourceSceneKey = maskParams.sourceSceneKeyOverride ||
                                       (prevSceneConfig?.targetThreeSceneName ||
                                        macroScenesConfig.find(msc => msc.isDefault)?.id ||
                                        "mainScene");
                const targetSceneKey = maskParams.targetSceneKeyOverride ||
                                       sceneConfig.targetThreeSceneName ||
                                       macroScenesConfig.find(msc => msc.isDefault)?.id ||
                                       "mainScene";

                const sourceThreeSceneObject = core.threeSceneObjects[sourceSceneKey];
                const targetThreeSceneObject = core.threeSceneObjects[targetSceneKey];

                if (!sourceThreeSceneObject || !targetThreeSceneObject) {
                    console.error(`[BuildTimeline] Mask transition for ${sceneConfig.id} missing source or target THREE.Scene! Source: ${sourceSceneKey}, Target: ${targetSceneKey}`);
                    // Potentially skip this transition or handle error by returning or continuing
                }

                const shaderDefinition = shaderRegistry[maskParams.shaderKey];
                if (!shaderDefinition) {
                    console.error(`[BuildTimeline] Shader not found in registry for key: ${maskParams.shaderKey} in scene ${sceneConfig.id}`);
                    // Potentially skip or handle
                }

                // Create a new material instance for this specific transition
                const newMaskMaterial = new THREE.ShaderMaterial({
                    uniforms: THREE.UniformsUtils.clone(shaderDefinition.uniforms),
                    vertexShader: shaderDefinition.vertexShader,
                    fragmentShader: shaderDefinition.fragmentShader,
                    transparent: true // Good default for masks
                });

                if (maskParams.usesRenderTargets) {
                    if (newMaskMaterial.uniforms.tPrev) newMaskMaterial.uniforms.tPrev.value = core.rtPrev.texture;
                    if (newMaskMaterial.uniforms.tNext) newMaskMaterial.uniforms.tNext.value = core.rtNext.texture;
                }
                if (newMaskMaterial.uniforms.aspect && core.renderer) { // Check core.renderer for safety
                    newMaskMaterial.uniforms.aspect.value = core.renderer.domElement.clientWidth / core.renderer.domElement.clientHeight;
                }
                if (newMaskMaterial.uniforms.progress) {
                    newMaskMaterial.uniforms.progress.value = 0.0;
                } else {
                    console.warn(`[BuildTimeline] Mask shader ${maskParams.shaderKey} is missing a 'progress' uniform. Animation might not work as expected.`);
                    newMaskMaterial.uniforms.progress = { value: 0.0 }; // Add a fallback
                }

                if (maskParams.shaderUniforms) {
                    for (const uName in maskParams.shaderUniforms) {
                        if (newMaskMaterial.uniforms[uName]) {
                            newMaskMaterial.uniforms[uName].value = maskParams.shaderUniforms[uName];
                        } else {
                            // If uniform doesn't exist in shader definition, add it (might be risky if shader doesn't expect it)
                            newMaskMaterial.uniforms[uName] = { value: maskParams.shaderUniforms[uName] };
                            if(SHOW_GUI) console.warn(`[BuildTimeline] Added uniform '${uName}' to mask material for ${maskParams.shaderKey} from config, not present in shader definition.`);
                        }
                    }
                }

                const maskEffectStartTime = currentCamTweenStartTime + (maskParams.activationOffset || 0);
                const maskEffectEndTime = maskEffectStartTime + (maskParams.duration || 0.8);

                // Populate sceneMarkers if other parts of your code rely on it (e.g., for asset animation timing)
                window.sceneMarkers = window.sceneMarkers || {}; // Ensure sceneMarkers exists
                window.sceneMarkers[sceneConfig.id] = { 
                    radialStart: maskEffectStartTime, // Keeping 'radialStart' for compatibility if needed
                    radialEnd: maskEffectEndTime
                };

                // Set the material on the activeMaskPass
                timeline.set(core.activeMaskPass, { material: newMaskMaterial }, maskEffectStartTime);
                // Revert to placeholder afterwards so reverse-scrub works
                timeline.set(core.activeMaskPass, { material: core.activeMaskPass.material }, maskEffectEndTime);

                // NEW reversible property sets - store *keys*, not objects
                timeline.set(core, {
                    maskSourceSceneKey: sourceSceneKey,
                    maskTargetSceneKey: targetSceneKey
                }, maskEffectStartTime);

                // Reset keys after transition
                timeline.set(core, {
                    maskSourceSceneKey: null,
                    maskTargetSceneKey: null
                }, maskEffectEndTime);

                if (core.renderPass && sourceThreeSceneObject) {
                    timeline.set(core.renderPass, { scene: sourceThreeSceneObject }, maskEffectStartTime);
                }

                // Parent-selector: let a dummy property carry the desired parent key
                timeline.set(core, { cameraRigParentKey: sourceSceneKey }, maskEffectStartTime);
                timeline.set(core, { cameraRigParentKey: targetSceneKey }, maskEffectEndTime);

                if (gradientPlane) { // Gradient visibility logic (might need to be more nuanced based on source/target scene types)
                    const sourceUsesGradient = sourceSceneKey === "mainScene"; // Example assumption
                    timeline.set(gradientPlane, { visible: sourceUsesGradient }, maskEffectStartTime);
                }
                if (core.activeMaskPass) {
                    timeline.set(core.activeMaskPass, { enabled: true }, maskEffectStartTime);
                    // Progress is already set to 0.0 on the newMaskMaterial
                }
                if (core.bloomPass) {
                    const sourceMacroConfig = macroScenesConfig.find(ms => ms.id === sourceSceneKey);
                    const bloomEnabled = sourceMacroConfig?.postProcessing?.bloom ?? true;
                    timeline.set(core.bloomPass, { enabled: bloomEnabled }, maskEffectStartTime);
                }

                timeline.to(newMaskMaterial.uniforms.progress, { // Animate progress on the new material
                    value: 1.0,
                    duration: maskParams.duration || 0.8,
                    ease: maskParams.ease || "power2.inOut",
                }, maskEffectStartTime);

                // After mask animation:
                if (core.renderPass && targetThreeSceneObject) {
                    timeline.set(core.renderPass, { scene: targetThreeSceneObject }, maskEffectEndTime);
                }
                if (core.activeMaskPass) {
                    timeline.set(core.activeMaskPass, { enabled: false }, maskEffectEndTime);
                }

                if (core.bloomPass) {
                    const targetMacroConfig = macroScenesConfig.find(ms => ms.id === targetSceneKey);
                    const bloomEnabled = targetMacroConfig?.postProcessing?.bloom ?? true;
                    timeline.set(core.bloomPass, { enabled: bloomEnabled }, maskEffectEndTime);
                }
                if (gradientPlane) { // Gradient visibility after mask
                    const targetUsesGradient = targetSceneKey === "mainScene"; // Example assumption
                    timeline.set(gradientPlane, { visible: targetUsesGradient }, maskEffectEndTime);
                }
            }
            // For non-mask and non-instant transitions that might still change the targetThreeSceneName
            // or to ensure the correct scene is set at the start of any scene segment.
            // This also covers the case where transitionType is "cameraMove" explicitly or implicitly.
            else if (sceneConfig.targetThreeSceneName && (transitionConfig.transitionType === "cameraMove" || !transitionConfig.transitionType)) {
                // This condition implies it's not a mask and not an instant cut.
                // If targetThreeSceneName changes, we need to set renderPass.scene etc.
                // This should happen at currentCamTweenStartTime, which is already calculated
                // based on overlap for "cameraMove" type transitions.

                const prevSceneConfig = index > 0 ? core.scenesConfig[index-1] : null;
                const prevTargetSceneName = prevSceneConfig?.targetThreeSceneName || (macroScenesConfig.find(msc => msc.isDefault)?.id || "mainScene");

                if (sceneConfig.targetThreeSceneName !== prevTargetSceneName) {
                    const targetKey = sceneConfig.targetThreeSceneName;
                    const targetObject = core.threeSceneObjects[targetKey];
                    if (targetObject) {
                        // currentCamTweenStartTime is the start of this scene's main camera move
                        timeline.set(core.renderPass, { scene: targetObject }, currentCamTweenStartTime);
                        timeline.set(core, { cameraRigParentKey: targetKey }, currentCamTweenStartTime);

                        if (gradientPlane) {
                            const usesGradient = targetKey === "mainScene";
                            timeline.set(gradientPlane, { visible: usesGradient }, currentCamTweenStartTime);
                        }
                        if (core.bloomPass) {
                            const macroConfig = macroScenesConfig.find(ms => ms.id === targetKey);
                            const bloomEnabled = macroConfig?.postProcessing?.bloom ?? true;
                            timeline.set(core.bloomPass, { enabled: bloomEnabled }, currentCamTweenStartTime);
                        }
                    }
                }
                // The camera animation itself for "cameraMove" is handled by the logic
                // that sets up currentCamTweenStartTime and adds the tween to targetNull.position
                // before this if/else if block for transitionType.
                // The previousSceneCamEndTime and sceneConfig._mainMoveEndTime are also set by that logic.
            }
        } else if (index === 0) { // Handling for the very first scene (index 0)
            // This logic was already present implicitly by falling through,
            // but making it explicit can be clearer.
            // The initial state (renderPass.scene, cameraRigParentKey, gradient, bloom)
            // is set at time 0 before this loop.
            // previousSceneCamEndTime and sceneConfig._mainMoveEndTime are set by the
            // camera animation logic for the first scene.
        }

        // --- Process Intra-Scene Camera Movements ---
        if (sceneConfig.cameraMoves && sceneConfig.cameraMoves.length > 0) {
            // Initialize with the end time of the main camera move for this scene
            let currentReferenceMoveEndTime = sceneConfig._mainMoveEndTime;
            // Characteristics of the move that the *first* intra-scene move will overlap with
            let prevMoveDurationForOverlap = sceneConfig.anchorPositioning?.cameraAnimationTarget?.duration || 1.0;
            let prevMoveEaseNameForOverlap = sceneConfig.anchorPositioning?.cameraAnimationTarget?.ease || "power2.inOut";

            sceneConfig.cameraMoves.forEach((moveConfig, intraMoveIndex) => {
                if (moveConfig.targetNullIndex === undefined || !moveConfig.targetValues) {
                    if (SHOW_GUI) console.warn(`[BuildTimeline] Intra-scene move for ${sceneConfig.id} at index ${intraMoveIndex} missing targetNullIndex or targetValues. Skipping.`);
                    return;
                }
                const targetNull = core.cameraRigNodes[moveConfig.targetNullIndex];
                if (!targetNull) {
                    if (SHOW_GUI) console.warn(`[BuildTimeline] Intra-scene move for ${sceneConfig.id} at index ${intraMoveIndex}: Target null ${moveConfig.targetNullIndex} not found. Skipping.`);
                    return;
                }

                let moveStartTime = currentReferenceMoveEndTime;
                const currentMoveDuration = moveConfig.duration || 1.0;
                const currentMoveEaseName = moveConfig.ease || "power1.inOut";
                const intraMoveId = `${sceneConfig.id}_intra_move_${intraMoveIndex}${moveConfig.id ? '_' + moveConfig.id : ''}`;
                let useDynamicOverlap = false;

                if (moveConfig.overlapCalculationMode && (moveConfig.overlapValue !== undefined || moveConfig.overlapKey)) {
                    let overlapAmount = 0;
                    if (moveConfig.overlapCalculationMode === "percentage" && typeof moveConfig.overlapValue === 'number') {
                        overlapAmount = moveConfig.overlapValue * prevMoveDurationForOverlap;
                        useDynamicOverlap = true;
                    } else if (moveConfig.overlapCalculationMode === "threshold" && moveConfig.overlapKey) {
                        const overlapThresholdValue = window[moveConfig.overlapKey];
                        let threshold = 0.15; // Default threshold
                        if (typeof overlapThresholdValue === 'number') {
                            threshold = overlapThresholdValue;
                        } else if (SHOW_GUI) {
                            console.warn(`[BuildTimeline] Overlap key "${moveConfig.overlapKey}" for intra-scene move in ${sceneConfig.id} not found or not a number in window. Defaulting to ${threshold}.`);
                        }
                        overlapAmount = overlapNeeded(
                            threshold,
                            gsap.parseEase(prevMoveEaseNameForOverlap),
                            gsap.parseEase(currentMoveEaseName),
                            prevMoveDurationForOverlap,
                            currentMoveDuration
                        );
                        useDynamicOverlap = true;
                    } else {
                        if (SHOW_GUI) console.warn(`[BuildTimeline] Intra-scene move for ${sceneConfig.id} at index ${intraMoveIndex} has incomplete overlap config. Falling back to startTime logic.`);
                    }

                    if (useDynamicOverlap) {
                        moveStartTime = currentReferenceMoveEndTime - overlapAmount;
                    }
                }

                if (!useDynamicOverlap) { // Fallback to existing startTime logic if no valid dynamic overlap config
                    const mainSceneCamStartTimeForThisScene = sceneConfig._mainMoveEndTime - (sceneConfig.anchorPositioning?.cameraAnimationTarget?.duration || 1.0);
                    if (moveConfig.startTime && typeof moveConfig.startTime === 'object') {
                        if (moveConfig.startTime.mode === "relativeToPreviousEnd") {
                            moveStartTime = currentReferenceMoveEndTime + (typeof moveConfig.startTime.value === 'number' ? moveConfig.startTime.value : 0);
                        } else if (moveConfig.startTime.mode === "absolute") {
                            moveStartTime = mainSceneCamStartTimeForThisScene + (typeof moveConfig.startTime.value === 'number' && moveConfig.startTime.value >= 0 ? moveConfig.startTime.value : 0);
                        } else {
                            moveStartTime = currentReferenceMoveEndTime; // Default if mode is unknown
                        }
                    } else if (typeof moveConfig.startTime === 'string' && moveConfig.startTime.startsWith("previousEnd")) {
                        const delayMatch = moveConfig.startTime.match(/previousEnd\s*([+-])\s*([\d.]+)/);
                        const sign = delayMatch && delayMatch[1] === '-' ? -1 : 1;
                        const value = delayMatch ? parseFloat(delayMatch[2]) : 0;
                        moveStartTime = currentReferenceMoveEndTime + (sign * value);
                    } else if (typeof moveConfig.startTime === 'number') {
                        moveStartTime = mainSceneCamStartTimeForThisScene + moveConfig.startTime;
                    } else {
                        moveStartTime = currentReferenceMoveEndTime; // Default: sequential
                    }
                }

                timeline.to(targetNull.position, {
                    ...moveConfig.targetValues,
                    duration: currentMoveDuration,
                    ease: currentMoveEaseName,
                }, moveStartTime);

                if (moveConfig.cameraShake) {
                    applyCameraShakeToTimeline(timeline, moveStartTime, currentMoveDuration, moveConfig.cameraShake, SHOW_GUI, intraMoveId);
                }

                // Update for the *next* intra-scene move's potential overlap calculation
                currentReferenceMoveEndTime = moveStartTime + currentMoveDuration;
                prevMoveDurationForOverlap = currentMoveDuration;
                prevMoveEaseNameForOverlap = currentMoveEaseName;

                // Update the overall scene end time if this intra-scene move extends it
                if (currentReferenceMoveEndTime > sceneConfig._mainMoveEndTime) {
                    sceneConfig._mainMoveEndTime = currentReferenceMoveEndTime;
                }
            });
            // After all intra-scene moves, ensure previousSceneCamEndTime (used by the *next* logical scene)
            // reflects the true end of all camera activity in the current scene.
            previousSceneCamEndTime = Math.max(previousSceneCamEndTime, sceneConfig._mainMoveEndTime);
        }
    });

    if (SHOW_GUI) console.log("%c[BuildTimeline] Master timeline fully constructed.", "color: green; font-weight: bold;");
    // Populate core.masterTimeline
    initializeCoreContextParts({ masterTimeline: timeline });
    return timeline; // Return for direct use if needed by caller (e.g. startAnimation)
} 