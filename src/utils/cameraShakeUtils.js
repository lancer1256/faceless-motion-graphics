import * as THREE from 'three';

export const DEFAULT_SHAKE_SEED = 42;

/**
 * Simple pseudo-random number generator (0 to 1).
 * @param {number} n - Input seed/value.
 * @returns {number} Pseudo-random number between 0 and 1.
 */
export function hash(n) {
    // A common simple hash function
    let x = Math.sin(n) * 43758.5453123;
    return x - Math.floor(x);
}

/**
 * Generates a noise value in the [-1, 1] range.
 * @param {number} time - Current time value for noise calculation (often scaled by frequency).
 * @param {number} offset - An offset to vary the noise pattern (e.g., for different axes).
 * @param {number} seed - The master seed for the noise pattern.
 * @returns {number} Noise value between -1 and 1.
 */
export function noise(time, offset, seed) {
    const val = hash(time + seed + offset);
    return (val * 2 - 1); // Map to -1 to 1 range
}

/**
 * Calculates the camera shake transform (position offset and rotation offset)
 * for a given active shake configuration and global time.
 * @param {object} activeShakeState - The state object from core.activeCameraShake { config, startTime, duration }.
 * @param {number} globalTime - The current master timeline time.
 * @returns {object} An object { position: THREE.Vector3, rotation: THREE.Euler } representing local shake offsets.
 */
export function calculateShakeTransform(activeShakeState, globalTime) {
    const { config: shakeConfig, startTime: shakeAbsStartTime, duration: shakeAbsDuration } = activeShakeState;

    if (!shakeConfig || !shakeConfig.enabled || shakeAbsDuration <= 0) {
        return { position: new THREE.Vector3(0, 0, 0), rotation: new THREE.Euler(0, 0, 0, 'YXZ') };
    }

    const elapsedShakeTime = globalTime - shakeAbsStartTime;
    let localShakeProgress = elapsedShakeTime / shakeAbsDuration;

    // If outside the active duration of this specific shake instance, return no offset.
    // This is a safeguard; timeline calls should manage activation/deactivation.
    if (localShakeProgress < 0 || localShakeProgress > 1) {
        return { position: new THREE.Vector3(0, 0, 0), rotation: new THREE.Euler(0, 0, 0, 'YXZ') };
    }

    // Ensure localShakeProgress is clamped, mainly for precision issues at boundaries.
    localShakeProgress = THREE.MathUtils.clamp(localShakeProgress, 0, 1);

    // Calculate shake intensity with fade in/out
    let intensity = 1.0;
    // Ensure factors are numbers, default to 0 if not, to prevent NaN with undefined * number
    const fadeInFactor = typeof shakeConfig.fadeInDurationFactor === 'number' ? shakeConfig.fadeInDurationFactor : 0.0;
    const fadeOutFactor = typeof shakeConfig.fadeOutDurationFactor === 'number' ? shakeConfig.fadeOutDurationFactor : 0.0;

    const fadeInDuration = fadeInFactor * shakeAbsDuration;
    const fadeOutStartTime = shakeAbsDuration - (fadeOutFactor * shakeAbsDuration);

    if (fadeInDuration > 0 && elapsedShakeTime < fadeInDuration) {
        intensity = elapsedShakeTime / fadeInDuration;
    } else if (fadeOutFactor > 0 && elapsedShakeTime > fadeOutStartTime && (shakeAbsDuration - fadeOutStartTime) > 0) { // Avoid division by zero
        intensity = (shakeAbsDuration - elapsedShakeTime) / (shakeAbsDuration - fadeOutStartTime);
    }
    intensity = THREE.MathUtils.clamp(intensity, 0, 1);
    intensity = THREE.MathUtils.smootherstep(intensity, 0, 1); // Apply a smoothstep to the intensity itself

    const posAmp = shakeConfig.positionAmplitude || 0;
    const posFreq = shakeConfig.positionFrequency || 0;
    const rotAmp = shakeConfig.rotationAmplitude || 0;
    const rotFreq = shakeConfig.rotationFrequency || 0;
    const seed = shakeConfig.seed !== undefined ? shakeConfig.seed : DEFAULT_SHAKE_SEED;

    const posTime = localShakeProgress * posFreq;
    const offsetX = intensity * posAmp * noise(posTime, 1.0, seed);
    const offsetY = intensity * posAmp * noise(posTime, 2.0, seed);
    const offsetZ = intensity * posAmp * noise(posTime, 3.0, seed); // Optional Z shake

    const rotTime = localShakeProgress * rotFreq;
    const offsetRotX = intensity * rotAmp * noise(rotTime, 4.0, seed);
    const offsetRotY = intensity * rotAmp * noise(rotTime, 5.0, seed);
    const offsetRotZ = intensity * rotAmp * noise(rotTime, 6.0, seed);

    return {
        position: new THREE.Vector3(offsetX, offsetY, offsetZ),
        rotation: new THREE.Euler(offsetRotX, offsetRotY, offsetRotZ, 'YXZ') // Use a consistent Euler order
    };
} 