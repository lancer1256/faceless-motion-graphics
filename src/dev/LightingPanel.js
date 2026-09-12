/* src/dev/LightingPanel.js
   ------------------------------------------------------------
   GUI panel for editing scene lighting.
*/
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { core } from '../coreContext.js';
import * as THREE from 'three'; // For THREE.Color

let lightingGUI;
let lightManager = {
  lights: [],
  helpers: [],
  ambientLight: null
};

// Export function to protect panel-managed lights from config overrides
export function protectPanelManagedLights(scene) {
  if (!scene || !lightManager.targetScene || scene !== lightManager.targetScene) return;
  
  // Prevent scene config from overriding panel-managed lights
  scene.traverse((child) => {
    if (child.userData && child.userData.managedByLightingPanel) {
      // This light is managed by the panel, prevent config override
      child.userData.preventConfigOverride = true;
    }
  });
}

export function initLightingPanel() {
  if (lightingGUI) {
    lightingGUI.destroy();
  }

  lightingGUI = new GUI({ title: 'Scene 12 Lighting Editor', width: 350 });
  lightingGUI.domElement.style.position = 'fixed';
  lightingGUI.domElement.style.top = '150px'; // Position below other GUIs, adjust as needed
  lightingGUI.domElement.style.left = '0px';
  lightingGUI.domElement.style.zIndex = '44'; // Adjust zIndex as needed

  // Get scene 12 from threeSceneObjects - it uses "scene12Specific" as its target scene
  const scene12 = core.threeSceneObjects && core.threeSceneObjects['scene12Specific'];
  
  if (!scene12) {
    console.warn('[LightingPanel] Scene "scene12Specific" not found in core.threeSceneObjects. Make sure scene12Specific is defined.');
    lightingGUI.add({ warning: 'Scene "scene12Specific" not found!' }, 'warning');
    return;
  }

  // Force render update when any property changes
  const triggerRender = () => {
    // Mark scene as needing update
    scene12.userData.needsUpdate = true;
    
    // Force renderer to render next frame
    if (core.renderer) {
      core.renderer.render(scene12, core.camera);
      console.log("[LightingPanel] Triggered render update");
    }
  };

  // Initialize light manager by scanning existing lights
  initializeLightManager(scene12);
  
  // Store reference to scene for config override protection
  lightManager.targetScene = scene12;

  // Light creation functions
  function addDirectionalLight() {
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    light.castShadow = true;
    light.name = `directional_scene12_${lightManager.lights.length + 1}`;
    light.userData.managedByLightingPanel = true; // Mark as panel-managed
    
    const helper = new THREE.DirectionalLightHelper(light, 1);
    
    scene12.add(light);
    scene12.add(helper);
    
    lightManager.lights.push({
      type: 'directional',
      light: light,
      helper: helper,
      name: `Directional ${lightManager.lights.length + 1}`
    });
    
    triggerRender();
    setupLightingGUI();
  }

  function addPointLight() {
    const light = new THREE.PointLight(0xffffff, 1, 10);
    light.position.set(0, 3, 0);
    light.castShadow = true;
    light.name = `point_scene12_${lightManager.lights.length + 1}`;
    light.userData.managedByLightingPanel = true; // Mark as panel-managed
    
    const helper = new THREE.PointLightHelper(light, 0.5);
    
    scene12.add(light);
    scene12.add(helper);
    
    lightManager.lights.push({
      type: 'point',
      light: light,
      helper: helper,
      name: `Point ${lightManager.lights.length + 1}`
    });
    
    triggerRender();
    setupLightingGUI();
  }

  function addSpotLight() {
    const light = new THREE.SpotLight(0xffffff, 1, 10, Math.PI / 4, 0.1);
    light.position.set(0, 5, 0);
    light.target.position.set(0, 0, 0);
    light.castShadow = true;
    light.name = `spot_scene12_${lightManager.lights.length + 1}`;
    light.userData.managedByLightingPanel = true; // Mark as panel-managed
    
    const helper = new THREE.SpotLightHelper(light);
    
    scene12.add(light);
    scene12.add(light.target);
    scene12.add(helper);
    
    lightManager.lights.push({
      type: 'spot',
      light: light,
      helper: helper,
      name: `Spot ${lightManager.lights.length + 1}`
    });
    
    triggerRender();
    setupLightingGUI();
  }

  function addHemisphereLight() {
    const light = new THREE.HemisphereLight(0x87CEEB, 0x8B4513, 0.5);
    light.position.set(0, 5, 0);
    light.name = `hemisphere_scene12_${lightManager.lights.length + 1}`;
    light.userData.managedByLightingPanel = true; // Mark as panel-managed
    
    const helper = new THREE.HemisphereLightHelper(light, 1);
    
    scene12.add(light);
    scene12.add(helper);
    
    lightManager.lights.push({
      type: 'hemisphere',
      light: light,
      helper: helper,
      name: `Hemisphere ${lightManager.lights.length + 1}`
    });
    
    triggerRender();
    setupLightingGUI();
  }

  function addAmbientLight() {
    if (lightManager.ambientLight) {
      console.warn('[LightingPanel] Ambient light already exists');
      return;
    }
    
    const light = new THREE.AmbientLight(0xffffff, 0.4);
    light.name = `ambient_scene12`;
    light.userData.managedByLightingPanel = true; // Mark as panel-managed
    scene12.add(light);
    lightManager.ambientLight = light;
    
    triggerRender();
    setupLightingGUI();
  }

  function removeLight(index) {
    const lightData = lightManager.lights[index];
    if (lightData) {
      scene12.remove(lightData.light);
      scene12.remove(lightData.helper);
      if (lightData.light.target) scene12.remove(lightData.light.target);
      lightManager.lights.splice(index, 1);
      triggerRender();
      setupLightingGUI();
    }
  }

  function removeAmbientLight() {
    if (lightManager.ambientLight) {
      scene12.remove(lightManager.ambientLight);
      lightManager.ambientLight = null;
      triggerRender();
      setupLightingGUI();
    }
  }

  function setupLightingGUI() {
    if (lightingGUI) {
      lightingGUI.destroy();
    }

    lightingGUI = new GUI({ title: 'Scene 12 Lighting Editor', width: 350 });
    lightingGUI.domElement.style.position = 'fixed';
    lightingGUI.domElement.style.top = '150px';
    lightingGUI.domElement.style.left = '0px';
    lightingGUI.domElement.style.zIndex = '44';

    // Light creation buttons
    const createFolder = lightingGUI.addFolder('Create Lights');
    createFolder.add({ add: addDirectionalLight }, 'add').name('Add Directional');
    createFolder.add({ add: addPointLight }, 'add').name('Add Point');
    createFolder.add({ add: addSpotLight }, 'add').name('Add Spot');
    createFolder.add({ add: addHemisphereLight }, 'add').name('Add Hemisphere');
    if (!lightManager.ambientLight) {
      createFolder.add({ add: addAmbientLight }, 'add').name('Add Ambient');
    }

    // Ambient light controls
    if (lightManager.ambientLight) {
      const ambientFolder = lightingGUI.addFolder('Ambient Light');
      ambientFolder.add(lightManager.ambientLight, 'intensity', 0, 2, 0.01)
        .onChange(triggerRender);
      ambientFolder.addColor({ color: lightManager.ambientLight.color.getHex() }, 'color')
        .onChange(value => {
          lightManager.ambientLight.color.setHex(value);
          triggerRender();
        });
      ambientFolder.add({ remove: removeAmbientLight }, 'remove').name('Remove Ambient');
    }

    // Individual light controls
    lightManager.lights.forEach((lightData, index) => {
      const folder = lightingGUI.addFolder(lightData.name);
      
      // Common properties
      folder.add(lightData.light, 'intensity', 0, 3, 0.01)
        .onChange(triggerRender);
      folder.add(lightData.light, 'visible')
        .onChange(triggerRender);
      folder.addColor({ color: lightData.light.color.getHex() }, 'color')
        .onChange(value => {
          lightData.light.color.setHex(value);
          triggerRender();
        });
      
      // Position controls
      const posFolder = folder.addFolder('Position');
      posFolder.add(lightData.light.position, 'x', -20, 20, 0.1)
        .onChange(triggerRender);
      posFolder.add(lightData.light.position, 'y', -20, 20, 0.1)
        .onChange(triggerRender);
      posFolder.add(lightData.light.position, 'z', -20, 20, 0.1)
        .onChange(triggerRender);
      
      // Type-specific controls
      if (lightData.type === 'point') {
        folder.add(lightData.light, 'distance', 0, 50, 0.1)
          .onChange(triggerRender);
        folder.add(lightData.light, 'decay', 0, 2, 0.01)
          .onChange(triggerRender);
      }
      
      if (lightData.type === 'spot') {
        folder.add(lightData.light, 'distance', 0, 50, 0.1)
          .onChange(triggerRender);
        folder.add(lightData.light, 'angle', 0, Math.PI / 2, 0.01)
          .onChange(() => {
            lightData.helper.update();
            triggerRender();
          });
        folder.add(lightData.light, 'penumbra', 0, 1, 0.01)
          .onChange(() => {
            lightData.helper.update();
            triggerRender();
          });
        folder.add(lightData.light, 'decay', 0, 2, 0.01)
          .onChange(triggerRender);
        
        const targetFolder = folder.addFolder('Target');
        targetFolder.add(lightData.light.target.position, 'x', -20, 20, 0.1)
          .onChange(() => {
            lightData.helper.update();
            triggerRender();
          });
        targetFolder.add(lightData.light.target.position, 'y', -20, 20, 0.1)
          .onChange(() => {
            lightData.helper.update();
            triggerRender();
          });
        targetFolder.add(lightData.light.target.position, 'z', -20, 20, 0.1)
          .onChange(() => {
            lightData.helper.update();
            triggerRender();
          });
      }
      
      if (lightData.type === 'hemisphere') {
        folder.addColor({ groundColor: lightData.light.groundColor.getHex() }, 'groundColor')
          .onChange(value => {
            lightData.light.groundColor.setHex(value);
            triggerRender();
          });
      }
      
      if (lightData.type === 'directional') {
        // Shadow camera controls for directional lights
        if (lightData.light.shadow) {
          const shadowFolder = folder.addFolder('Shadow Camera');
          shadowFolder.add(lightData.light.shadow.camera, 'left', -20, 0, 0.1)
            .onChange(triggerRender);
          shadowFolder.add(lightData.light.shadow.camera, 'right', 0, 20, 0.1)
            .onChange(triggerRender);
          shadowFolder.add(lightData.light.shadow.camera, 'top', 0, 20, 0.1)
            .onChange(triggerRender);
          shadowFolder.add(lightData.light.shadow.camera, 'bottom', -20, 0, 0.1)
            .onChange(triggerRender);
          shadowFolder.add(lightData.light.shadow.camera, 'near', 0.1, 10, 0.1)
            .onChange(triggerRender);
          shadowFolder.add(lightData.light.shadow.camera, 'far', 1, 100, 0.1)
            .onChange(triggerRender);
        }
      }
      
      // Helper visibility
      folder.add(lightData.helper, 'visible').name('Show Helper')
        .onChange(triggerRender);
      
      // Remove button
      folder.add({ remove: () => removeLight(index) }, 'remove').name('Remove Light');
    });

    lightingGUI.close(); // Start collapsed
  }

  // Initial setup
  setupLightingGUI();
}

function initializeLightManager(scene) {
  // Reset light manager
  lightManager.lights = [];
  lightManager.helpers = [];
  lightManager.ambientLight = null;

  // Scan existing lights in the scene
  scene.traverse((child) => {
    if (child.isAmbientLight) {
      lightManager.ambientLight = child;
      child.userData.managedByLightingPanel = true; // Mark as panel-managed
    } else if (child.isDirectionalLight || child.isPointLight || child.isSpotLight || child.isHemisphereLight) {
      // Mark as panel-managed
      child.userData.managedByLightingPanel = true;
      // Check if this light already has a helper
      let helper = null;
      const helperName = child.name + '_helper';
      scene.traverse((helperChild) => {
        if (helperChild.name === helperName || 
           (helperChild.isDirectionalLightHelper && helperChild.light === child) ||
           (helperChild.isPointLightHelper && helperChild.light === child) ||
           (helperChild.isSpotLightHelper && helperChild.light === child) ||
           (helperChild.isHemisphereLightHelper && helperChild.light === child)) {
          helper = helperChild;
        }
      });

      // Create helper if it doesn't exist
      if (!helper) {
        if (child.isDirectionalLight) {
          helper = new THREE.DirectionalLightHelper(child, 1);
        } else if (child.isPointLight) {
          helper = new THREE.PointLightHelper(child, 0.5);
        } else if (child.isSpotLight) {
          helper = new THREE.SpotLightHelper(child);
        } else if (child.isHemisphereLight) {
          helper = new THREE.HemisphereLightHelper(child, 1);
        }
        
        if (helper) {
          helper.name = helperName;
          scene.add(helper);
        }
      }

      // Determine light type
      let type = 'unknown';
      if (child.isDirectionalLight) type = 'directional';
      else if (child.isPointLight) type = 'point';
      else if (child.isSpotLight) type = 'spot';
      else if (child.isHemisphereLight) type = 'hemisphere';

      lightManager.lights.push({
        type: type,
        light: child,
        helper: helper,
        name: child.name || `${type.charAt(0).toUpperCase() + type.slice(1)} ${lightManager.lights.length + 1}`
      });
    }
  });

  console.log(`[LightingPanel] Initialized light manager with ${lightManager.lights.length} lights and ${lightManager.ambientLight ? '1' : '0'} ambient light`);
} 