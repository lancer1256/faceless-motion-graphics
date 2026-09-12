// Utility: crude finite-difference derivative of an ease
function _easeVel(ease, t, h = 0.0001) {
    return (ease(t + h) - ease(t - h)) / (2 * h);
}

/**
 * Calculate seconds of overlap needed so velocity never dips below
 * (threshold * peak) when chaining tween A into tween B.
 * @param {number} threshold – fraction e.g. 0.05
 * @param {Function} easeA   – easing fn of tween A
 * @param {Function} easeB   – easing fn of tween B
 * @param {number} durA      – seconds of tween A
 * @param {number} durB      – seconds of tween B
 * @param {number} samples   – resolution (default 300)
 */
export function overlapNeeded(threshold, easeA, easeB, durA, durB, samples = 300) {
    // peak velocities
    let vMaxA = 0, vMaxB = 0;
    for (let i = 0; i <= samples; i++) {
        const t = i / samples;
        vMaxA = Math.max(vMaxA, Math.abs(_easeVel(easeA, t)));
        vMaxB = Math.max(vMaxB, Math.abs(_easeVel(easeB, t)));
    }
    // last t in A above threshold
    let lastFastA = 1;
    for (let i = samples; i >= 0; i--) {
        const t = i / samples;
        if (Math.abs(_easeVel(easeA, t)) >= vMaxA * threshold) {
            lastFastA = t;
            break;
        }
    }
    // first t in B above threshold
    let firstFastB = 0;
    for (let i = 0; i <= samples; i++) {
        const t = i / samples;
        if (Math.abs(_easeVel(easeB, t)) >= vMaxB * threshold) {
            firstFastB = t;
            break;
        }
    }
    const deadZone = (1 - lastFastA) * durA + firstFastB * durB;
    return deadZone;
} 