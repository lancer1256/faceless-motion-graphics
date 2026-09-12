import * as THREE from 'three';
import { core, initializeCoreContextParts } from '../coreContext.js';

export function setupCameraRig(SHOW_GUI) {
    let maxNullIndexUsed = -1;
    core.scenesConfig.forEach(sceneConfig => {
        if (sceneConfig.anchorPositioning?.cameraAnimationTarget?.targetNullIndex !== undefined) {
            maxNullIndexUsed = Math.max(maxNullIndexUsed, sceneConfig.anchorPositioning.cameraAnimationTarget.targetNullIndex);
        }
        if (sceneConfig.cameraMoves) {
            sceneConfig.cameraMoves.forEach(move => {
                if (move.targetNullIndex !== undefined) {
                    maxNullIndexUsed = Math.max(maxNullIndexUsed, move.targetNullIndex);
                }
            });
        }
    });

    const NUM_CAMERA_RIG_NODES = maxNullIndexUsed >= 0 ? maxNullIndexUsed + 1 : 1;
    if (SHOW_GUI) console.log(`%c[CameraRig] Determined to create ${NUM_CAMERA_RIG_NODES} camera rig nodes. Max index used: ${maxNullIndexUsed}`, 'color:blueviolet');

    const cameraRigNodes = [];
    let parentNode = null;
    let cameraRigRoot = null;

    for (let i = 0; i < NUM_CAMERA_RIG_NODES; i++) {
        const node = new THREE.Object3D();
        node.name = `CameraRigNode_${i}`;
        cameraRigNodes.push(node);
        if (i === 0) {
            cameraRigRoot = node;
            cameraRigRoot.position.set(0, 0, 80);
            if (core.threeSceneObjects.mainScene) {
                core.threeSceneObjects.mainScene.add(cameraRigRoot);
            } else {
                console.error("[CameraRig] core.threeSceneObjects.mainScene not found to add camera rig root.");
            }
        } else {
            parentNode.add(node);
        }
        parentNode = node;
    }
    parentNode.add(core.camera);
    core.camera.position.set(0,0,0);
    core.camera.rotation.set(0,0,0);

    initializeCoreContextParts({
        cameraRigRoot: cameraRigRoot,
        cameraRigNodes: cameraRigNodes,
    });
} 