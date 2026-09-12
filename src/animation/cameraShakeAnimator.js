import * as THREE from 'three';
import { core } from '../coreContext.js'; // For accessing activeCameraShake
import { calculateShakeTransform } from '../utils/cameraShakeUtils.js';

const VEC_ZERO = new THREE.Vector3(0,0,0);
const EULER_ZERO = new THREE.Euler(0,0,0, 'YXZ');

/**
 * Applies the active camera shake effect to the provided camera object.
 * If no shake is active, it resets the camera's local transform.
 * @param {THREE.Camera} camera - The camera object to modify.
 * @param {number} globalTime - The current master timeline time.
 */
export function applyActiveCameraShake(camera, globalTime) {
    if (!camera) return;

    const activeShakeState = core.activeCameraShake;

    if (activeShakeState && activeShakeState.config && activeShakeState.config.enabled) {
        const shakeOffsets = calculateShakeTransform(activeShakeState, globalTime);

        // The shake offsets are local to the camera's parent (the last rig node).
        // The camera's base local position/rotation is (0,0,0) before shake.
        camera.position.copy(shakeOffsets.position);
        camera.rotation.copy(shakeOffsets.rotation);
    } else {
        // No active shake, ensure camera is at its default local transform.
        if (!camera.position.equals(VEC_ZERO)) {
            camera.position.copy(VEC_ZERO);
        }
        if (!camera.rotation.equals(EULER_ZERO)) {
           camera.rotation.copy(EULER_ZERO);
        }
    }
    // The camera's matrix will be updated by the main render loop or sceneUpdater
    // after this function call.
} 