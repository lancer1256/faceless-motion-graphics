import * as THREE from 'three';
import { core, initializeCoreContextParts } from '../coreContext.js';
import { getCameraWorldPositionAtSceneEndFromConfig } from '../utils/cameraConfigUtils.js'; // Adjust path if necessary
import { createAndAddLightsToAnchor } from './setupLighting.js';

export function createSceneAnchors(SHOW_GUI) {
    const sceneAnchors = {}; // Local temporary object to build up anchors

    for (const sceneConfig of core.scenesConfig) { // Use core.scenesConfig
        const anchor = new THREE.Object3D();
        anchor.name = `${sceneConfig.id}_Anchor`;
        let calculatedAnchorWorldPos = new THREE.Vector3(0, 0, 0);
        let targetSceneForAnchor = core.threeSceneObjects.mainScene; // Default to mainScene from core
        const currentSceneIndex = core.scenesConfig.indexOf(sceneConfig);

        if (sceneConfig.anchorPositioning) {
            // Determine target THREE.Scene for this anchor first
            if (sceneConfig.targetThreeSceneName && core.threeSceneObjects[sceneConfig.targetThreeSceneName]) {
                targetSceneForAnchor = core.threeSceneObjects[sceneConfig.targetThreeSceneName];
            }

            const placementConfig = sceneConfig.anchorPositioning.placementRelativeToPreviousAnchor;
            const placementMethod = placementConfig?.method;
            const placementOffset = placementConfig?.offset || { x: 0, y: 0, z: 0 };

            if (sceneConfig.anchorPositioning.worldPosition) {
                calculatedAnchorWorldPos.set(
                    sceneConfig.anchorPositioning.worldPosition.x || 0,
                    sceneConfig.anchorPositioning.worldPosition.y || 0,
                    sceneConfig.anchorPositioning.worldPosition.z || 0
                );
            } else if (sceneConfig.anchorPositioning.fromPrevious && placementMethod === "offsetFromPreviousCameraPosition") {
                if (currentSceneIndex === 0) {
                    console.warn(`[Init Anchors] Scene '${sceneConfig.id}' is first, cannot use 'offsetFromPreviousCameraPosition'. Defaulting anchor to world origin.`);
                    calculatedAnchorWorldPos.set(0, 0, 0);
                } else {
                    const prevSceneConfig = core.scenesConfig[currentSceneIndex - 1];
                    const prevCamWorldPos = getCameraWorldPositionAtSceneEndFromConfig(prevSceneConfig, core.scenesConfig, core.threeSceneObjects);
                    calculatedAnchorWorldPos.set(
                        prevCamWorldPos.x + placementOffset.x,
                        prevCamWorldPos.y + placementOffset.y,
                        prevCamWorldPos.z + placementOffset.z
                    );
                    if (SHOW_GUI) {
                        console.log(`%c[Init Anchors] Anchor ${anchor.name} using 'offsetFromPreviousCameraPosition'. Prev cam END pos (config-derived): (${prevCamWorldPos.x.toFixed(2)}, ${prevCamWorldPos.y.toFixed(2)}, ${prevCamWorldPos.z.toFixed(2)}), Offset: (${placementOffset.x}, ${placementOffset.y}, ${placementOffset.z}). Target World: (${calculatedAnchorWorldPos.x.toFixed(2)}, ${calculatedAnchorWorldPos.y.toFixed(2)}, ${calculatedAnchorWorldPos.z.toFixed(2)})`, 'color: #32CD32'); // LimeGreen
                    }
                }
            } else if (sceneConfig.anchorPositioning.fromPrevious && placementMethod === "offsetFromPrevious") {
                let previousAnchorTrueWorldPosition = new THREE.Vector3(0,0,0);
                if (currentSceneIndex > 0) {
                    const previousSceneId = core.scenesConfig[currentSceneIndex - 1].id;
                    const prevAnchor = sceneAnchors[previousSceneId]; // Check local sceneAnchors being built
                    if (prevAnchor) {
                        // To get true world position, after it's added and its parent's matrix is updated:
                        // This assumes prevAnchor and its parent are already processed and their world matrices are valid.
                        prevAnchor.updateWorldMatrix(true, false);
                        prevAnchor.getWorldPosition(previousAnchorTrueWorldPosition);
                    } else {
                        if (SHOW_GUI) console.warn(`[Init Anchors] Previous anchor '${previousSceneId}' not found in sceneAnchors map for 'offsetFromPrevious' method for scene '${sceneConfig.id}'. Using (0,0,0) as previous anchor world position.`);
                    }
                }
                calculatedAnchorWorldPos.set(
                    previousAnchorTrueWorldPosition.x + (placementOffset.x || 0),
                    previousAnchorTrueWorldPosition.y + (placementOffset.y || 0),
                    previousAnchorTrueWorldPosition.z + (placementOffset.z || 0)
                );
            } else if (placementMethod === "atOriginOfTargetScene") {
                // calculatedAnchorWorldPos remains (0,0,0), which will be interpreted as local to targetSceneForAnchor
                // This is effectively placing the anchor at the origin of its designated THREE.Scene.
                // The worldToLocal conversion below will handle this correctly.
                calculatedAnchorWorldPos.set(0,0,0);
            } else if (!sceneConfig.anchorPositioning.fromPrevious && !sceneConfig.anchorPositioning.worldPosition) {
                // Default for the very first scene if no worldPosition is specified, or any scene with no positioning.
                calculatedAnchorWorldPos.set(0,0,0);
            }
        } else { // No anchorPositioning block, default to world origin
            calculatedAnchorWorldPos.set(0,0,0);
        }

        // Convert the calculatedAnchorWorldPos (intended as a WORLD position)
        // to the local space of the targetSceneForAnchor.
        targetSceneForAnchor.updateWorldMatrix(true, false); // Ensure parent's world matrix is up-to-date
        const localPositionForAnchor = targetSceneForAnchor.worldToLocal(calculatedAnchorWorldPos.clone());
        anchor.position.copy(localPositionForAnchor);

        targetSceneForAnchor.add(anchor);
        sceneAnchors[sceneConfig.id] = anchor; // Add to local temporary object
        anchor.updateMatrixWorld(true); // Ensure anchor's own world matrix is correct after adding and positioning.

        // ---> Integration point for scene-specific lighting <---
        if (sceneConfig.lighting && sceneConfig.lighting.length > 0) {
            // console.log(`[createSceneAnchors] Calling createAndAddLightsToAnchor for ${anchor.name}`);
            createAndAddLightsToAnchor(sceneConfig.lighting, anchor);
        }
        // ---> End of lighting integration <---

        if (SHOW_GUI) {
            const targetSceneName = Object.keys(core.threeSceneObjects).find(key => core.threeSceneObjects[key] === targetSceneForAnchor) || "unknownScene";
            const worldPosForLog = new THREE.Vector3();
            anchor.getWorldPosition(worldPosForLog);
            console.log(`%c[Init Anchors] Created anchor: ${anchor.name} in scene '${targetSceneName}'. Local Pos: (${anchor.position.x.toFixed(2)}, ${anchor.position.y.toFixed(2)}, ${anchor.position.z.toFixed(2)}). Approx World Pos: (${worldPosForLog.x.toFixed(2)}, ${worldPosForLog.y.toFixed(2)}, ${worldPosForLog.z.toFixed(2)})`,
                        'color: blueviolet');
        }
    }

    initializeCoreContextParts({ sceneAnchors: sceneAnchors }); // Populate core.sceneAnchors
} 