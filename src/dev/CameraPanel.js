/* src/dev/CameraPanel.js
   ------------------------------------------------------------
   Left-side lil-gui panel for editing every camera move.
*/
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { core } from '../coreContext.js';
import { buildMasterTimeline } from '../animation/timelineBuilder.js'; // Check path if timelineBuilder moved

let camGUI; // Singleton instance for this panel

export function initCameraPanel() {
  if (camGUI) {
    camGUI.destroy(); // Destroy previous instance if HMR or re-init
  }

  camGUI = new GUI({ title: 'Camera-Editor', width: 300 });
  // Style it to dock on the left
  camGUI.domElement.style.position = 'fixed'; // Ensure it's fixed
  camGUI.domElement.style.top = '0px';      // Align to top
  camGUI.domElement.style.left = '0px';     // Align to left
  camGUI.domElement.style.right = 'auto';   // Override any default right alignment
  camGUI.domElement.style.zIndex = '45';    // Ensure it's above most things, but potentially below main debug panel

  core.scenesConfig.forEach(sceneCfg => {
    const fScene = camGUI.addFolder(sceneCfg.id); // Folder for each logical scene

    // --- Main Camera Animation Target for the scene ---
    const mainCamAnimTarget = sceneCfg.anchorPositioning?.cameraAnimationTarget;
    if (mainCamAnimTarget) {
      const fMainCam = fScene.addFolder('Main Camera Move');
      addNumericSlider(fMainCam, mainCamAnimTarget, 'duration', 0.01, 10, 0.01);
      addEaseDropdown(fMainCam, mainCamAnimTarget, 'ease');
      addNumericSlider(fMainCam, mainCamAnimTarget, 'targetNullIndex', 0, (core.cameraRigNodes?.length || 1) - 1, 1);
      if (mainCamAnimTarget.targetValues) {
        const fTargetValues = fMainCam.addFolder('targetValues');
        exposeScalarRecursive(fTargetValues, mainCamAnimTarget.targetValues, rebuildTL);
      }
    }

    // --- Overlap Configuration ---
    if (sceneCfg.anchorPositioning?.overlapCalculationMode === 'percentage') {
      const fOverlap = fScene.addFolder('Overlap with Previous');
      addNumericSlider(fOverlap, sceneCfg.anchorPositioning, 'overlapValue', 0, 1, 0.01);
    }

    // --- Intra-Scene Camera Moves ---
    if (Array.isArray(sceneCfg.cameraMoves) && sceneCfg.cameraMoves.length > 0) {
      sceneCfg.cameraMoves.forEach((moveConfig, index) => {
        const fIntraMove = fScene.addFolder(`Intra-Scene Move ${index}`);
        addNumericSlider(fIntraMove, moveConfig, 'duration', 0.01, 10, 0.01);
        addEaseDropdown(fIntraMove, moveConfig, 'ease');
        addNumericSlider(fIntraMove, moveConfig, 'targetNullIndex', 0, (core.cameraRigNodes?.length || 1) - 1, 1);
        if (moveConfig.targetValues) {
          const fMoveTargetValues = fIntraMove.addFolder('targetValues');
          exposeScalarRecursive(fMoveTargetValues, moveConfig.targetValues, rebuildTL);
        }
        // Handle startTime if it's a direct number or a structured object
        if (typeof moveConfig.startTime === 'number') {
            addNumericSlider(fIntraMove, moveConfig, 'startTime', -10, 30, 0.01);
        } else if (typeof moveConfig.startTime === 'object' && moveConfig.startTime !== null) {
            const fStartTime = fIntraMove.addFolder('startTime');
            exposeScalarRecursive(fStartTime, moveConfig.startTime, rebuildTL);
        }
      });
    }
  });

  camGUI.add({ exportConfig: () => console.log(JSON.stringify(core.scenesConfig, null, 2)) }, 'exportConfig').name('⬇ Export Camera JSON');
  camGUI.close(); // Start collapsed
}

// --- Helper to add a standard numeric slider ---
function addNumericSlider(folder, hostObject, propertyKey, min = -100, max = 100, step = 0.01) {
  if (hostObject && typeof hostObject[propertyKey] === 'number') {
    folder.add(hostObject, propertyKey, min, max, step)
      .name(propertyKey)
      .onChange(rebuildTL)        // Rebuild on drag for live feedback
      .onFinishChange(rebuildTL); // Rebuild once on release
  }
}

// --- Helper to add an ease dropdown ---
function addEaseDropdown(folder, hostObject, propertyKey) {
  if (hostObject && typeof hostObject[propertyKey] === 'string') {
    folder.add(hostObject, propertyKey, {
      'power1.inOut': 'power1.inOut',
      'power2.inOut': 'power2.inOut',
      'power3.inOut': 'power3.inOut',
      'power4.inOut': 'power4.inOut',
      'back.inOut(1.7)': 'back.inOut(1.7)',
      'expo.inOut': 'expo.inOut',
      'circ.inOut': 'circ.inOut',
      'sine.inOut': 'sine.inOut',
      'none': 'none',
      // Add more common eases or allow custom string input
    })
    .name(propertyKey)
    .onChange(newEase => {
        updateEaseGraph(newEase); // Update graph on change
        rebuildTL();              // Rebuild timeline on change
    })
    .onFinishChange(rebuildTL); // Also rebuild on finish (might be redundant if onChange does it)
  }
}

// --- Generic recursive exposer for nested objects (like targetValues) ---
function exposeScalarRecursive(folder, obj, onFinishCb) {
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    if (typeof value === 'number') {
      folder.add(obj, key, -500, 500, 0.01) // Adjust min/max/step as needed for typical camera values
        .name(key)
        .onChange(onFinishCb)
        .onFinishChange(onFinishCb);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const subFolder = folder.addFolder(key);
      exposeScalarRecursive(subFolder, value, onFinishCb);
    }
    // Non-numeric, non-object properties are currently ignored by this recursive helper
  });
}


let raf = null; // Variable for requestAnimationFrame ID
function rebuildTL() {
  if (raf) cancelAnimationFrame(raf);
  raf = requestAnimationFrame(() => {
    const frame = core.player.currentFrame;

    core.scenesConfig.forEach(sceneCfg => {
      sceneCfg.contentBlocks?.forEach(blockCfg => {
        if (blockCfg.createdMesh) {
          if (blockCfg.position) {
            blockCfg.createdMesh.position.set(blockCfg.position.x || 0, blockCfg.position.y || 0, blockCfg.position.z || 0);
          } else {
            blockCfg.createdMesh.position.set(0, 0, 0);
          }
          if (blockCfg.rotation) {
            blockCfg.createdMesh.rotation.set(blockCfg.rotation.x || 0, blockCfg.rotation.y || 0, blockCfg.rotation.z || 0);
          } else {
            blockCfg.createdMesh.rotation.set(0, 0, 0);
          }
          // --- Scale is intentionally NOT modified here to preserve its original value ---
          /*
          if (blockCfg.scale) {
            blockCfg.createdMesh.scale.set(blockCfg.scale.x || 1, blockCfg.scale.y || 1, blockCfg.scale.z || 1);
          }
          */
          blockCfg.createdMesh.updateMatrixWorld(true);
        }
      });
    });

    if (core.masterTimeline) {
      core.masterTimeline.kill();
    }

    buildMasterTimeline(false);
    core.player?.gotoFrame(frame);
    raf = null;
  });
}

function updateEaseGraph(easeName) {
  const cvs = document.getElementById('ease-graph'); // Assuming this ID exists in your HTML
  const ctx = cvs?.getContext('2d');
  const label = document.getElementById('ease-name'); // Assuming this ID exists
  if (!ctx || !label) {
    console.warn('[CameraPanel] Ease graph canvas or label not found.');
    return;
  }
  const easeFn = window.gsap?.parseEase(easeName);
  if (!easeFn) {
    console.warn(`[CameraPanel] GSAP could not parse ease: ${easeName}`);
    return;
  }

  const W = cvs.width, H = cvs.height;
  ctx.clearRect(0, 0, W, H);
  ctx.strokeStyle = '#f86'; // Different color for camera ease graph
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i <= 100; i++) {
    const t = i / 100, y = 1 - easeFn(t);
    const x = t;
    i === 0 ? ctx.moveTo(x * W, y * H) : ctx.lineTo(x * W, y * H);
  }
  ctx.stroke();
  label.textContent = `Ease: ${easeName}`;
} 