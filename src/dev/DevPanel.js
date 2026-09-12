/*  src/dev/DevPanel.js – v2
    ---------------------------------------------------------
    Reflects the whole scenesConfig tree in lil-gui.
    Any numeric edits update live meshes and rebuild GSAP.
*/
import { GUI }   from 'three/addons/libs/lil-gui.module.min.js';
import { core }  from '../coreContext.js'; // Ensure this path is correct
import { buildMasterTimeline } from '../animation/timelineBuilder.js'; // Ensure this path is correct

let gui;   // single instance for this panel

export function initDevPanel() {
  /* destroy previous panel (hot reload safe) */
  if (gui) {
    gui.destroy();
  }

  gui = new GUI({ title: 'Scene-Editor', width: 320 }); // Slightly wider for more properties
  window.__devGUI = gui;               // for console experiments

  /* ──────────────────────────────────────────
     Iterate logical scenes / content blocks
  ────────────────────────────────────────── */
  core.scenesConfig.forEach(sceneCfg => {
    const fScene = gui.addFolder(sceneCfg.id); // Folder for each logical scene

    sceneCfg.contentBlocks?.forEach(blockCfg => {
      const fBlock = fScene.addFolder(blockCfg.id); // Folder for each content block

      /* 1️⃣  Primitive transforms (position, rotation, scale) for the block itself */
      if (blockCfg.createdMesh) { // Only if a mesh exists to be transformed
        exposeVec3Controls(fBlock, blockCfg, 'position', updateMeshAndFrame);
        exposeVec3Controls(fBlock, blockCfg, 'rotation', updateMeshAndFrame, Math.PI); // Max PI for rotation
      } else {
        fBlock.add({ info:'(No createdMesh for direct transform)' }, 'info');
      }

      /* 2️⃣  timelineAnimations array from contentBlockConfig */
      if (Array.isArray(blockCfg.timelineAnimations)) {
        blockCfg.timelineAnimations.forEach((tweenObject, index) => {
          const ftw = fBlock.addFolder(`Timeline Tween ${index}`);
          exposeTweenProperties(ftw, tweenObject);
        });
      }

      /* 3️⃣ defaultAnimation.tweens from assetLibrary (if applicable) */
      const assetLibEntry = core.assetLibrary[blockCfg.assetConfigId];
      const defaultTweens = assetLibEntry?.defaultAnimation?.tweens;
      if (Array.isArray(defaultTweens)) {
        defaultTweens.forEach((tweenObject, index) => {
          // Note: These tweens from assetLibrary are part of the asset's definition.
          // Editing them here will change core.assetLibrary, which might be desired
          // for live-tweaking defaults, or might be unexpected if you only want
          // to override per-instance. For now, we edit them directly.
          const ftw = fBlock.addFolder(`Lib Default Tween ${index}`);
          exposeTweenProperties(ftw, tweenObject);
        });
      }
    });
  });

  /* Helper button to regenerate the panel if config structure changes drastically */
  gui.add({ refreshPanel: initDevPanel }, 'refreshPanel').name('↻ Regenerate Panel');
  gui.add({ exportSceneConfig: () => console.log(JSON.stringify(core.scenesConfig, null, 2)) }, 'exportSceneConfig').name('⬇ Export Scene JSON');

  gui.close(); // Start collapsed
}

/* ────────────────── Generic UI Builder Helpers ─────────────────── */

/** Helper to expose X, Y, Z controls for a Vector3-like object property */
function exposeVec3Controls(folder, hostObject, propertyKey, onChangeCallback, maxVal = 100, stepVal = 0.01) {
  if (hostObject && hostObject[propertyKey] && typeof hostObject[propertyKey] === 'object') {
    const vecFolder = folder.addFolder(propertyKey);
    ['x', 'y', 'z'].forEach(axis => {
      if (typeof hostObject[propertyKey][axis] === 'number') {
        vecFolder.add(hostObject[propertyKey], axis, -maxVal, maxVal, stepVal)
          .name(axis)
          .onChange(() => onChangeCallback(hostObject)) // Update mesh on drag
          .onFinishChange(() => onChangeCallback(hostObject)); // And on release
      }
    });
  }
}

/** Helper to expose all properties of a tween object */
function exposeTweenProperties(folder, tweenObject) {
  Object.keys(tweenObject).forEach(key => {
    const value = tweenObject[key];

    if (typeof value === 'number') {
      // Sensible defaults for min/max/step, can be customized if needed
      let min = -100, max = 100, step = 0.01;
      if (key === 'startTime') { min = -20; max = 20; }
      if (key === 'duration' || key === 'durationFactor') { min = 0.01; max = 20; }
      // Add more specific ranges if other numeric keys are common

      folder.add(tweenObject, key, min, max, step)
        .name(key)
        .onChange(rebuildTL) // Rebuild timeline on drag for live feedback
        .onFinishChange(rebuildTL); // And on release
    } else if (key === 'ease' && typeof value === 'string') {
      folder.add(tweenObject, key, { // Provide a list of common eases
        'power1.out': 'power1.out',
        'power2.inOut': 'power2.inOut',
        'power3.inOut': 'power3.inOut',
        'back.out(1.7)': 'back.out(1.7)',
        'expo.out': 'expo.out',
        'circ.out': 'circ.out',
        'sine.out': 'sine.out',
        'none': 'none',
      })
      .name('ease')
      .onChange(newEase => {
        updateEaseGraph(newEase); // Update graph preview
        rebuildTL(); // Rebuild timeline
      })
      .onFinishChange(rebuildTL);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // For nested objects like 'targetValue: {x, y, z}'
      const subFolder = folder.addFolder(key);
      exposeScalarRecursive(subFolder, value, rebuildTL); // Pass rebuildTL as the onFinishCb
    }
    // Other types (boolean, string not 'ease') are currently not added to GUI.
  });
}

/** Generic recursive helper to expose all scalar (number) properties in an object */
function exposeScalarRecursive(folder, obj, onFinishCb) {
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    if (typeof value === 'number') {
      folder.add(obj, key, -500, 500, 0.01) // General min/max/step
        .name(key)
        .onChange(onFinishCb) // Callback on drag
        .onFinishChange(onFinishCb); // Callback on release
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const subFolder = folder.addFolder(key);
      exposeScalarRecursive(subFolder, value, onFinishCb);
    }
  });
}

/* ─────────────────── Visual Update Callbacks ─────────────────── */

/** Updates the live mesh transform and re-renders the current frame */
function updateMeshAndFrame(blockCfg) {
  const mesh = blockCfg.createdMesh;
  if (!mesh) return;

  if (blockCfg.position) mesh.position.copy(blockCfg.position);
  if (blockCfg.rotation) mesh.rotation.set(blockCfg.rotation.x || 0, blockCfg.rotation.y || 0, blockCfg.rotation.z || 0);
  
  mesh.updateMatrixWorld(true); // Important after direct manipulation

  // Re-render the current frame to see the change immediately
  if (core.player) {
    core.player.gotoFrame(core.player.currentFrame);
  }
}

let tlRebuildReq = null; // requestAnimationFrame ID for debouncing rebuildTL
function rebuildTL() {
  if (tlRebuildReq) cancelAnimationFrame(tlRebuildReq);
  tlRebuildReq = requestAnimationFrame(() => {
    const frame = core.player.currentFrame;

    // Explicitly reset all createdMeshes to their config-defined initial state
    core.scenesConfig.forEach(sceneCfg => {
      sceneCfg.contentBlocks?.forEach(blockCfg => {
        if (blockCfg.createdMesh) {
          if (blockCfg.position) blockCfg.createdMesh.position.set(blockCfg.position.x || 0, blockCfg.position.y || 0, blockCfg.position.z || 0);
          else blockCfg.createdMesh.position.set(0,0,0);
          if (blockCfg.rotation) blockCfg.createdMesh.rotation.set(blockCfg.rotation.x || 0, blockCfg.rotation.y || 0, blockCfg.rotation.z || 0);
          else blockCfg.createdMesh.rotation.set(0,0,0);
          blockCfg.createdMesh.updateMatrixWorld(true);
        }
      });
    });

    if (core.masterTimeline) {
      core.masterTimeline.kill();
    }

    buildMasterTimeline(false); // Rebuild with objects in their pristine initial states
    core.player?.gotoFrame(frame); // Jump back to the exact deterministic frame

    tlRebuildReq = null;
  });
}

/** Updates the ease graph display in the main HTML debug panel */
function updateEaseGraph(easeName) {
  const canvas = document.getElementById('ease-graph');
  const ctx    = canvas?.getContext('2d');
  const label  = document.getElementById('ease-name');
  if (!ctx) {
    console.warn('[DevPanel] No canvas context found for ease graph.');
    return;
  }

  const gsapEase = window.gsap?.parseEase(easeName);
  if (!gsapEase) {
    console.warn(`[DevPanel] GSAP could not parse ease: ${easeName}`);
    return;
  }

  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0,0,W,H);
  ctx.strokeStyle = '#68f'; // Blue for DevPanel's ease graph
  ctx.lineWidth   = 2;
  ctx.beginPath();
  for (let i=0;i<=100;i++){
      const t = i/100;
      const y = 1-gsapEase(t); // Invert Y for typical graph display (0 at bottom)
      const x = t;
      if (i===0) ctx.moveTo(x*W, y*H);
      else       ctx.lineTo(x*W, y*H);
  }
  ctx.stroke();
  if (label) label.textContent = `Ease: ${easeName}`;
}