import * as THREE from 'three';
import { core } from '../coreContext.js';

export function setupLighting() {
    // Ensure core.lighting exists
    core.lighting = core.lighting || {};

    // Base ambient light (provides minimal global illumination)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    // Add to the primary scene, assuming lighting is mainly for it.
    // If other scenes in core.threeSceneObjects need specific lighting, add it there.
    if (core.threeSceneObjects.mainScene) core.threeSceneObjects.mainScene.add(ambientLight);
    core.lighting.ambientLight = ambientLight;
    
    // Three-point lighting setup
    // 1. Key light (main illumination)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(-2, 0, 5); // Left side, slightly forward
    if (core.threeSceneObjects.mainScene) core.threeSceneObjects.mainScene.add(keyLight);
    core.lighting.keyLight = keyLight;
    
    // 2. Fill light (fills shadows created by key light)
    const fillLight = new THREE.DirectionalLight(0xffffcc, 0.6); // Slightly warmer
    fillLight.position.set(3, 0, 4); // Right side, slightly forward
    if (core.threeSceneObjects.mainScene) core.threeSceneObjects.mainScene.add(fillLight);
    core.lighting.fillLight = fillLight;
    
    // 3. Rim/Back light (separates subject from background)
    const rimLight = new THREE.DirectionalLight(0xccccff, 0.3); // Slightly cooler
    rimLight.position.set(0, 3, -5); // Above and behind
    if (core.threeSceneObjects.mainScene) core.threeSceneObjects.mainScene.add(rimLight);
    core.lighting.rimLight = rimLight;
}

/**
 * Creates and adds lights to a given anchor object based on configuration.
 * @param {Array<Object>} lightingConfigs - Array of light configuration objects.
 * @param {THREE.Object3D} anchorObject - The anchor to which lights will be added.
 */
export function createAndAddLightsToAnchor(lightingConfigs, anchorObject) {
    if (!lightingConfigs || !anchorObject) {
        console.warn("[Lighting] createAndAddLightsToAnchor called with invalid lightingConfigs or anchorObject.");
        return;
    }

    console.log(`[Lighting] Setting up ${lightingConfigs.length} custom light(s) for anchor: ${anchorObject.name}`);

    lightingConfigs.forEach(lightConfig => {
        // Check if a panel-managed light with the same name already exists
        const expectedLightName = lightConfig.id ? `${anchorObject.name}_light_${lightConfig.id}` : null;
        if (expectedLightName) {
            // Check if there's already a panel-managed light with this name in the scene
            let existingPanelLight = null;
            anchorObject.parent.traverse((child) => {
                if (child.name === expectedLightName && child.userData && child.userData.managedByLightingPanel) {
                    existingPanelLight = child;
                }
            });
            
            if (existingPanelLight) {
                console.log(`[Lighting] Skipping config light '${lightConfig.id}' - already managed by lighting panel`);
                return; // Skip this light config as it's managed by the panel
            }
        }

        let light;
        const color = lightConfig.color || 0xffffff;
        const intensity = lightConfig.intensity || 1;
        const position = lightConfig.position || { x: 0, y: 0, z: 0 };

        console.log(`[Lighting] Creating light: ID '${lightConfig.id || "N/A"}', Type '${lightConfig.type}', Intensity '${intensity}', Position '${JSON.stringify(position)}'`);

        switch (lightConfig.type) {
            case "ambient":
                light = new THREE.AmbientLight(color, intensity);
                break;
            case "directional":
                light = new THREE.DirectionalLight(color, intensity);
                if (lightConfig.castShadow) {
                    light.castShadow = true;
                }
                break;
            case "point":
                light = new THREE.PointLight(color, intensity, lightConfig.distance || 0, lightConfig.decay !== undefined ? lightConfig.decay : 1);
                if (lightConfig.castShadow) {
                    light.castShadow = true;
                }
                break;
            case "spot":
                light = new THREE.SpotLight(
                    color,
                    intensity,
                    lightConfig.distance || 0,
                    lightConfig.angle || Math.PI / 3,
                    lightConfig.penumbra || 0,
                    lightConfig.decay !== undefined ? lightConfig.decay : 1
                );
                if (lightConfig.castShadow) {
                    light.castShadow = true;
                }
                break;
            default:
                console.warn(`[Lighting] Unknown light type: ${lightConfig.type} for anchor ${anchorObject.name}`);
                return; // Skip unknown light types
        }

        light.position.set(position.x, position.y, position.z);
        if (lightConfig.id) {
            light.name = `${anchorObject.name}_light_${lightConfig.id}`;
        }

        // For DirectionalLight and SpotLight, set up the target
        if (light.target) { 
            const targetObject = new THREE.Object3D();
            if (lightConfig.targetPosition) {
                targetObject.position.set(
                    lightConfig.targetPosition.x || 0,
                    lightConfig.targetPosition.y || 0,
                    lightConfig.targetPosition.z || 0
                );
            } else {
                targetObject.position.set(0,0,0); // Default to anchor's local origin if not specified
            }
            anchorObject.add(targetObject); 
            light.target = targetObject;
        }
        
        anchorObject.add(light);

        // Store light reference if an ID is provided
        if (lightConfig.id) {
            core.lighting = core.lighting || {};
            if (!core.lighting.sceneSpecific) core.lighting.sceneSpecific = {};
            if (!core.lighting.sceneSpecific[anchorObject.name]) core.lighting.sceneSpecific[anchorObject.name] = {};
            core.lighting.sceneSpecific[anchorObject.name][lightConfig.id] = light;
        }
    });
} 