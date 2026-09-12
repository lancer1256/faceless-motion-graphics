// src/utils/FrameClock.js
let _currentTimeInSeconds = 0;

/**
 * Sets the current animation time. Called by DeterministicPlayer.
 * @param {number} timeInSeconds - The animation time in seconds.
 */
export function setFrameTime(timeInSeconds) {
    _currentTimeInSeconds = timeInSeconds;
}

/**
 * Gets the current animation time. Used by rendering logic and shaders.
 * @returns {number} The animation time in seconds.
 */
export function getFrameTime() {
    return _currentTimeInSeconds;
}
