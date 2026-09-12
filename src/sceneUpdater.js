// src/sceneUpdater.js
import { core } from './coreContext.js';
import { applyActiveCameraShake } from './animation/cameraShakeAnimator.js'; // Import the new animator

/**
 * Updates all visual state of the scene to reflect the given time.
 * This includes seeking the master GSAP timeline and updating any
 * non-GSAP shader uniforms or other time-dependent properties.
 * @param {number} timeInSeconds - The target animation time.
 */
export function updateSceneStateForTime(timeInSeconds) {
  // 1. Make sure the timeline exists
  if (!core.masterTimeline) return;

  // 2. Apply every GSAP track for this absolute time
  core.masterTimeline.time(timeInSeconds, false);

  /* ──────────────────────────────────────────────────────────────
     ▼ NEW deterministic parent-sync  ──────────────────────────── */
  // Keep the camera rig rooted in whichever THREE.Scene the main
  // RenderPass is drawing.  Ensures correct scene graph if we jump
  // into the middle of a wipe or any other scene switch.
  if (core.cameraRigRoot && core.cameraRigParentKey) {
      const desiredParent = core.threeSceneObjects[core.cameraRigParentKey];
      if (desiredParent && core.cameraRigRoot.parent !== desiredParent) {
          // Detach from old parent first if it exists and is not null
          if (core.cameraRigRoot.parent) {
              core.cameraRigRoot.parent.remove(core.cameraRigRoot);
          }
          desiredParent.add(core.cameraRigRoot); // Use add, attach might try to preserve world transform
      }
      // Ensure the camera rig root itself is at its GSAP-defined pose
      // (GSAP animates its children, the root's base pose is usually static or set once)
      // This update is important if the rig root itself was moved or reparented.
      core.cameraRigRoot.updateMatrixWorld(true); 
  }
  /* ────────────────────────────────────────────────────────────── */

  // Ensure all rig nodes and the camera itself have their matrices updated
  // based on GSAP animations before applying shake.
  // The camera is parented to the last rig node. Its local transform is (0,0,0) by default
  // relative to that last rig node after GSAP has done its work.
  if (core.camera) {
      // The camera's world matrix depends on its parents (the rig nodes).
      // GSAP has updated the rig nodes.
      // We explicitly set the camera's local transform to zero *before* shake is applied.
      // This ensures that shake is always additive to a known base (local 0,0,0).
      core.camera.position.set(0,0,0);
      core.camera.rotation.set(0,0,0, 'YXZ'); // Ensure consistent Euler order
      core.camera.updateMatrix(); // Update local matrix based on (0,0,0)
      // The world matrix will be updated after shake or at the end of this function.
  }


  // 3. Apply active camera shake (modifies core.camera.position and .rotation locally)
  // This happens *after* GSAP has positioned the rig nodes and we've reset the camera's
  // local transform, and *before* the final world matrix update for the camera.
  if (core.camera) {
      applyActiveCameraShake(core.camera, timeInSeconds);
      // After shake is applied to local transform, update its local matrix.
      // The world matrix will be updated below.
      core.camera.updateMatrix();
  }

  // 4. Update shader uniforms that are driven continuously by time
  if (core.gradientUniforms) {
    core.gradientUniforms.uTime.value = timeInSeconds;
  }

  // 5. (future frame-seeded passes, particles, etc.)

  // Finally, ensure the entire scene graph from the active scene's root is updated,
  // including the camera which might have been reparented or shaken.
  // This is critical for the renderer.
  const currentRenderPassScene = core.renderPass ? core.renderPass.scene : null;
  if (currentRenderPassScene) {
      // This updates world matrices for all objects in the scene being rendered,
      // including the cameraRigRoot (if it's in this scene) and subsequently the camera.
      currentRenderPassScene.updateMatrixWorld(true); 
  } else if (core.threeSceneObjects.mainScene) {
      // Fallback if renderPass.scene isn't set yet (e.g., during initial setup)
      core.threeSceneObjects.mainScene.updateMatrixWorld(true); 
  }
  
  // It's generally good practice to ensure the camera's own world matrix is
  // explicitly updated after all modifications, though updateMatrixWorld on its
  // parent scene should typically cover it if the camera is part of that scene graph.
  // However, if the camera was just reparented, this ensures its matrix is correct.
  if (core.camera) {
      core.camera.updateMatrixWorld(true); 
  }
}
