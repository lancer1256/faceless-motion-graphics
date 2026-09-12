/* src/dev/EffectsPanel.js
   ------------------------------------------------------------
   GUI panel for editing post-processing effects.
*/
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { core } from '../coreContext.js';

let effectsGUI;

export function initEffectsPanel() {
  if (effectsGUI) {
    effectsGUI.destroy();
  }

  effectsGUI = new GUI({ title: 'Effects Editor', width: 300 });
  effectsGUI.domElement.style.position = 'fixed';
  effectsGUI.domElement.style.top = '250px'; // Position below other GUIs
  effectsGUI.domElement.style.left = '0px';
  effectsGUI.domElement.style.zIndex = '45'; // Adjust zIndex as needed

  // Bloom Pass Controls
  if (core.bloomPass) {
    const fBloom = effectsGUI.addFolder('Bloom');
    fBloom.add(core.bloomPass, 'enabled').name('Enabled');
    fBloom.add(core.bloomPass, 'strength', 0, 3, 0.01).name('Strength');
    fBloom.add(core.bloomPass, 'radius', 0, 2, 0.01).name('Radius');
    fBloom.add(core.bloomPass, 'threshold', 0, 1, 0.01).name('Threshold');
  }

  // Standard Blur Pass Controls
  if (core.blurPass) {
    const fBlur = effectsGUI.addFolder('Full-Screen Blur');
    fBlur.add(core.blurPass, 'enabled').name('Enabled');
    fBlur.add(core.blurPass.uniforms.blurRadius, 'value', 0, 5, 0.01).name('Blur Radius');
  }

  // Vignette Blur Pass Controls
  if (core.vignetteBlurPass) {
    const fVignetteBlur = effectsGUI.addFolder('Vignette Blur');
    fVignetteBlur.add(core.vignetteBlurPass, 'enabled').name('Enabled')
      .onChange(() => {
        // Force a render to see the change immediately
        if (core.player) core.player.renderFrameCallback();
      });
    
    // Add debug toggle
    fVignetteBlur.add(core.vignetteBlurPass.uniforms.debugMode, 'value').name('Debug (Red)')
      .onChange(() => {
        // Force a render to see the change immediately
        if (core.player) core.player.renderFrameCallback();
      });
    
    // Separate X and Y radius controls
    fVignetteBlur.add(core.vignetteBlurPass.uniforms.vignetteRadiusX, 'value', 0.05, 1, 0.01).name('Radius X')
      .onChange(() => {
        if (core.player) core.player.renderFrameCallback();
      });
    fVignetteBlur.add(core.vignetteBlurPass.uniforms.vignetteRadiusY, 'value', 0.05, 1, 0.01).name('Radius Y')
      .onChange(() => {
        if (core.player) core.player.renderFrameCallback();
      });
    
    fVignetteBlur.add(core.vignetteBlurPass.uniforms.vignetteFeather, 'value', 0, 1, 0.01).name('Feather')
      .onChange(() => {
        if (core.player) core.player.renderFrameCallback();
      });
    fVignetteBlur.add(core.vignetteBlurPass.uniforms.maxBlurRadius, 'value', 0, 10, 0.1).name('Max Blur')
      .onChange(() => {
        if (core.player) core.player.renderFrameCallback();
      });
    
    const centerFolder = fVignetteBlur.addFolder('Center Position');
    centerFolder.add(core.vignetteBlurPass.uniforms.vignetteCenter.value, 'x', 0, 1, 0.01).name('X')
      .onChange(() => {
        if (core.player) core.player.renderFrameCallback();
      });
    centerFolder.add(core.vignetteBlurPass.uniforms.vignetteCenter.value, 'y', 0, 1, 0.01).name('Y')
      .onChange(() => {
        if (core.player) core.player.renderFrameCallback();
      });
    
    // Open by default to make it visible
    fVignetteBlur.open();
  }


  effectsGUI.close(); // Start collapsed
} 