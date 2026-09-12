import { core } from '../coreContext.js';

/**
 * Creates a simple UI panel for controlling vignette parameters in real-time
 */
export function setupVignetteControls() {
    // Locate the scene3Specific scene and get its vignette uniforms
    const scene3 = core.threeSceneObjects?.scene3Specific;
    if (!scene3) {
        console.warn("Cannot setup vignette controls: scene3Specific not found");
        return;
    }
    
    // Find the vignette plane in the scene
    const vignettePlane = scene3.getObjectByName("vignetteBackgroundPlane");
    if (!vignettePlane || !vignettePlane.material || !vignettePlane.material.uniforms) {
        console.warn("Cannot setup vignette controls: vignette plane not found or missing uniforms");
        return;
    }
    
    const uniforms = vignettePlane.material.uniforms;
    
    // Create UI container
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.right = '20px';
    container.style.top = '20px';
    container.style.background = 'rgba(0, 0, 0, 0.7)';
    container.style.color = 'white';
    container.style.padding = '15px';
    container.style.borderRadius = '5px';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.zIndex = '1000';
    container.style.width = '280px';
    
    // Add title
    const title = document.createElement('h3');
    title.textContent = 'Vignette Controls';
    title.style.margin = '0 0 10px 0';
    title.style.textAlign = 'center';
    container.appendChild(title);
    
    // Helper function to create a labeled slider
    function createSlider(label, min, max, value, step, callback) {
        const group = document.createElement('div');
        group.style.marginBottom = '10px';
        
        const labelEl = document.createElement('div');
        labelEl.textContent = `${label}: ${value.toFixed(2)}`;
        labelEl.style.marginBottom = '5px';
        
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = min;
        slider.max = max;
        slider.step = step;
        slider.value = value;
        slider.style.width = '100%';
        
        slider.oninput = function() {
            const val = parseFloat(this.value);
            labelEl.textContent = `${label}: ${val.toFixed(2)}`;
            callback(val);
            
            // Force re-render the current frame
            if (core.player) {
                core.player.gotoFrame(core.player.currentFrame);
            }
        };
        
        group.appendChild(labelEl);
        group.appendChild(slider);
        return group;
    }
    
    // Radius slider
    container.appendChild(createSlider(
        'Radius', 
        0, 0.5, 
        uniforms.uRadius.value, 
        0.01, 
        value => { uniforms.uRadius.value = value; }
    ));
    
    // Darkening slider
    container.appendChild(createSlider(
        'Darkening', 
        0, 1, 
        uniforms.uDarkening.value, 
        0.02, 
        value => { uniforms.uDarkening.value = value; }
    ));
    
    // Feather slider
    container.appendChild(createSlider(
        'Feather', 
        0, 3, 
        uniforms.uFeather.value, 
        0.1, 
        value => { uniforms.uFeather.value = value; }
    ));
    
    // Add save configuration button
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Copy Config';
    saveBtn.style.width = '100%';
    saveBtn.style.padding = '8px';
    saveBtn.style.backgroundColor = '#4CAF50';
    saveBtn.style.border = 'none';
    saveBtn.style.color = 'white';
    saveBtn.style.borderRadius = '4px';
    saveBtn.style.cursor = 'pointer';
    saveBtn.style.marginTop = '10px';
    
    saveBtn.onclick = function() {
        const config = {
            radius: uniforms.uRadius.value,
            darkening: uniforms.uDarkening.value,
            feather: uniforms.uFeather.value
        };
        
        // Format as config object
        const configText = `config: {
    color: 0xffffff,
    radius: ${config.radius.toFixed(2)},
    darkening: ${config.darkening.toFixed(2)},
    feather: ${config.feather.toFixed(2)}
}`;
        
        navigator.clipboard.writeText(configText)
            .then(() => {
                saveBtn.textContent = 'Copied!';
                setTimeout(() => { 
                    saveBtn.textContent = 'Copy Config';
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
                saveBtn.textContent = 'Failed to copy';
                setTimeout(() => { 
                    saveBtn.textContent = 'Copy Config';
                }, 2000);
            });
    };
    
    container.appendChild(saveBtn);
    
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '5px';
    closeBtn.style.right = '10px';
    closeBtn.style.backgroundColor = 'transparent';
    closeBtn.style.border = 'none';
    closeBtn.style.color = 'white';
    closeBtn.style.fontSize = '20px';
    closeBtn.style.cursor = 'pointer';
    
    closeBtn.onclick = function() {
        document.body.removeChild(container);
    };
    
    container.appendChild(closeBtn);
    
    // Add to document
    document.body.appendChild(container);
    
    return container;
} 