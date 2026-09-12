import * as THREE from 'three';

/**
 * Calculates the world position of the camera at the conceptual "end" of a given scene's
 * configured camera moves. This function reads directly from scene configurations
 * and does not depend on a live GSAP timeline or live Three.js camera rig objects.
 *
 * @param {object} forSceneConfig - The scene config for which to determine the camera's end position.
 * @param {Array<object>} allSceneConfigs - The entire array of scene configurations.
 * @param {object} threeSceneObjects - The map of THREE.Scene objects (e.g., core.threeSceneObjects)
 *                                     to get the world matrix of the rig's parent scene.
 * @returns {THREE.Vector3} The calculated world position of the camera.
 */
export function getCameraWorldPositionAtSceneEndFromConfig(forSceneConfig, allSceneConfigs, threeSceneObjects) {
    // Determine the number of camera rig nodes from ALL scene configs (max targetNullIndex)
    let maxNullIndexUsed = -1;
    allSceneConfigs.forEach(sc => {
        if (sc.anchorPositioning?.cameraAnimationTarget?.targetNullIndex !== undefined) {
            maxNullIndexUsed = Math.max(maxNullIndexUsed, sc.anchorPositioning.cameraAnimationTarget.targetNullIndex);
        }
        sc.cameraMoves?.forEach(move => {
            if (move.targetNullIndex !== undefined) {
                maxNullIndexUsed = Math.max(maxNullIndexUsed, move.targetNullIndex);
            }
        });
    });
    const numCameraRigNodes = maxNullIndexUsed >= 0 ? maxNullIndexUsed + 1 : 1;

    // Initialize local transforms for each conceptual rig node.
    const nodeLocalPositions = [];
    for (let i = 0; i < numCameraRigNodes; i++) {
        nodeLocalPositions.push(new THREE.Vector3()); // Default to (0,0,0) local to parent
    }

    // Set the initial local position of CameraRigNode_0 (hardcoded from setupCameraRig.js logic)
    if (numCameraRigNodes > 0) {
        nodeLocalPositions[0].set(0, 0, 80);
    }

    // Iterate through scenes up to and including the forSceneConfig
    // to accumulate the "final" local positions of nodes based on config.
    for (const sc of allSceneConfigs) {
        // Apply main cameraAnimationTarget for sc
        const mainAnim = sc.anchorPositioning?.cameraAnimationTarget;
        if (mainAnim && mainAnim.targetNullIndex !== undefined && mainAnim.targetValues) {
            const nodeIdx = mainAnim.targetNullIndex;
            if (nodeLocalPositions[nodeIdx]) {
                nodeLocalPositions[nodeIdx].set(
                    mainAnim.targetValues.x || nodeLocalPositions[nodeIdx].x, // Keep current if not specified
                    mainAnim.targetValues.y || nodeLocalPositions[nodeIdx].y,
                    mainAnim.targetValues.z || nodeLocalPositions[nodeIdx].z
                );
            }
        }

        // Apply intra-scene cameraMoves for sc
        sc.cameraMoves?.forEach(move => {
            if (move.targetNullIndex !== undefined && move.targetValues) {
                const nodeIdx = move.targetNullIndex;
                if (nodeLocalPositions[nodeIdx]) {
                    nodeLocalPositions[nodeIdx].set(
                        move.targetValues.x || nodeLocalPositions[nodeIdx].x, // Keep current if not specified
                        move.targetValues.y || nodeLocalPositions[nodeIdx].y,
                        move.targetValues.z || nodeLocalPositions[nodeIdx].z
                    );
                }
            }
        });

        if (sc.id === forSceneConfig.id) {
            break; // Stop after processing the target scene (forSceneConfig)
        }
    }

    // Determine the world matrix of the rig's root parent THREE.Scene
    let rigParentSceneKey = "mainScene"; // Default initial parent
    for (const sc of allSceneConfigs) {
        // Update rigParentSceneKey if the current scene config specifies a targetThreeSceneName
        if (sc.targetThreeSceneName) {
            rigParentSceneKey = sc.targetThreeSceneName;
        }
        // If this is the scene we're calculating for, this is the final parent key.
        if (sc.id === forSceneConfig.id) {
            // If forSceneConfig itself specifies a targetThreeSceneName, it overrides.
            if (forSceneConfig.targetThreeSceneName) {
                 rigParentSceneKey = forSceneConfig.targetThreeSceneName;
            }
            break;
        }
    }

    const parentThreeScene = threeSceneObjects[rigParentSceneKey] || threeSceneObjects.mainScene; // Fallback to mainScene
    let worldMatrix = new THREE.Matrix4(); // Start with identity
    if (parentThreeScene) {
        parentThreeScene.updateWorldMatrix(true, false);
        worldMatrix.copy(parentThreeScene.matrixWorld);
    }

    // Accumulate local transforms to get the world matrix of the last node
    for (let i = 0; i < numCameraRigNodes; i++) {
        const localNodeMatrix = new THREE.Matrix4().setPosition(nodeLocalPositions[i]);
        worldMatrix.multiply(localNodeMatrix);
    }

    const cameraWorldPosition = new THREE.Vector3();
    cameraWorldPosition.setFromMatrixPosition(worldMatrix);
    return cameraWorldPosition;
} 