/* Hot-Module orchestrator
   - boots the experience once
   - listens for changes in the three config modules (and shader)
   - tears everything down before re-booting
*/
import { initApp } from '../initAppEntrypoint.js';
import { protectPanelManagedLights } from './LightingPanel.js';
import { core } from '../coreContext.js';

let disposeCurrent = null;

/* ---------- first (cold) boot ---------- */
boot({}, 'cold');

async function boot(overrides, mode = 'cold') {
  // dispose old instance
  if (disposeCurrent) {
    await disposeCurrent();   // runs the disposer returned by initApp
    disposeCurrent = null;
  }
  // create a fresh one
  disposeCurrent = await initApp(overrides, { mode });
  
  // Protect panel-managed lights from config overrides
  if (mode === 'hot') {
    // On hot reload, protect existing panel-managed lights
    setTimeout(() => {
      // Use setTimeout to ensure scenes are fully set up
      Object.values(core.threeSceneObjects || {}).forEach(scene => {
        protectPanelManagedLights(scene);
      });
    }, 100);
  }
}

/* ---------- HMR wires ---------- */
if (import.meta.hot) {
  import.meta.hot.accept(
    [
      'scene_config',
      'text_library_config',
      'asset_library_config',
      '../shaders/fourCornerGradientShader.js'
    ],
    (mods) => {
      /* each index may be undefined if that file didn't change */
      const overrides = {};
      if (mods[0]?.scenesConfig)  overrides.scenesConfig  = mods[0].scenesConfig;
      if (mods[1]?.textLibrary)   overrides.textLibrary   = mods[1].textLibrary;
      if (mods[2]?.assetLibrary)  overrides.assetLibrary  = mods[2].assetLibrary;
      if (mods[3])                overrides.gradientShaders = mods[3];

      if (overrides.assetLibrary) {
          core.__assetsRegistered = false;
          core.__contentPlaced    = false;   // content must be rebuilt if assets differ
      }
      if (overrides.textLibrary) {
          core.__contentPlaced    = false;   // text meshes need rebuild
      }
      if (overrides.scenesConfig) {
          // anchors or content might move; but we decide to keep them
          // If you want fresh anchors on big layout edits:
          // core.__anchorsCreated = false;
      }

      boot(overrides, 'hot');   // hot-reload
    }
  );

  /* make sure we clean up if THIS file itself changes */
  import.meta.hot.dispose(() => disposeCurrent && disposeCurrent());
}