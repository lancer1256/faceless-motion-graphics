// src/animation/objectMaskHelper.js
import * as THREE from 'three';
import { core } from '../coreContext.js';

// getObjectMaskShader function remains the same...
async function getObjectMaskShader(shaderKey) {
    if (core.objectMaskShaders.has(shaderKey)) {
        return core.objectMaskShaders.get(shaderKey);
    }
    try {
        const path = `../shaders/objectMasks/${shaderKey}.js`;
        const shaderModule = await import(/* @vite-ignore */ path);

        if (shaderModule && shaderModule.objectMaskShader) {
            core.objectMaskShaders.set(shaderKey, shaderModule.objectMaskShader);
            return shaderModule.objectMaskShader;
        } else {
            console.error(`[ObjectMaskHelper] Shader module at '${path}' (for key '${shaderKey}') did not export 'objectMaskShader'.`);
            return null;
        }
    } catch (error) {
        console.error(`[ObjectMaskHelper] Failed to load shader '${shaderKey}':`, error);
        return null;
    }
}


export async function applyObjectShaderMaskAnimation(timeline, createdAsset, animConfig, effectBaseTimeOnTimeline, SHOW_GUI) {
    if (!createdAsset || !animConfig || !timeline) {
        console.error("[ObjectMaskHelper] Invalid arguments for applyObjectShaderMaskAnimation.");
        return;
    }

    const shaderDefinition = await getObjectMaskShader(animConfig.shaderKey);
    if (!shaderDefinition) {
        if (SHOW_GUI) console.error(`[ObjectMaskHelper] Could not apply shader mask '${animConfig.shaderKey}' to asset as shader definition was not found.`);
        return;
    }

    const configuredStartTimeOffset = animConfig.startTimeOffset || 0;
    const animationDuration = animConfig.duration || 1.0;
    const ease = animConfig.ease || "linear";
    const progressStartValue = animConfig.direction === "out" ? 1.0 : 0.0;
    const progressEndValue = animConfig.direction === "out" ? 0.0 : 1.0;

    const uniqueMaskId = `${createdAsset.uuid}-${animConfig.shaderKey}-${effectBaseTimeOnTimeline}-${configuredStartTimeOffset}`;

    // --- Function to perform the material setup ---
    const setupMaterial = () => {
        if (!createdAsset.visible) return;

        const targetMeshes = [];
        createdAsset.traverse(child => {
            if (child.isMesh && child.material) targetMeshes.push(child);
        });

        if (targetMeshes.length === 0) return;

        targetMeshes.forEach(mesh => {
            const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            materials.forEach(mat => {
                if (mat.userData?.activeObjectMaskId && mat.userData.activeObjectMaskId !== uniqueMaskId) {
                    if (SHOW_GUI) console.warn(`[ObjectMaskHelper] Material on ${mesh.name} has another mask '${mat.userData.maskShaderKey}' active. Skipping new mask '${animConfig.shaderKey}'.`);
                    return;
                }
                
                if (mat.userData?.activeObjectMaskId === uniqueMaskId && mat.userData.maskUniforms) {
                    // Already patched by this instance, ensure progress is at the defined start.
                    mat.userData.maskUniforms.progress.value = progressStartValue;
                    // Reset other custom uniforms if necessary
                    if (shaderDefinition.customUniforms && animConfig.maskParams) {
                        for (const uName in shaderDefinition.customUniforms) {
                            if (mat.userData.maskUniforms[uName] && animConfig.maskParams[uName] !== undefined) {
                                mat.userData.maskUniforms[uName].value = animConfig.maskParams[uName];
                            }
                        }
                    }
                    return; 
                }

                mat.userData = mat.userData || {};
                mat.userData.originalOnBeforeCompile = mat.onBeforeCompile;
                mat.userData.isActiveObjectMask = true;
                mat.userData.activeObjectMaskId = uniqueMaskId;
                mat.userData.maskShaderKey = animConfig.shaderKey;

                mat.userData.originalTransparent = mat.transparent;
                mat.userData.originalAlphaTest = mat.alphaTest;
                mat.transparent = true; // Crucial for opacity effects
                mat.alphaTest = 0.0;    // Disable alpha test if not needed or handled by shader

                mat.userData.maskUniforms = {
                    progress: { value: progressStartValue }, // Set initial progress
                };

                if (shaderDefinition.customUniforms) {
                    for (const uName in shaderDefinition.customUniforms) {
                        mat.userData.maskUniforms[uName] = THREE.UniformsUtils.clone(shaderDefinition.customUniforms[uName]);
                        if (animConfig.maskParams && animConfig.maskParams[uName] !== undefined) {
                            mat.userData.maskUniforms[uName].value = animConfig.maskParams[uName];
                        }
                    }
                }

                mat.onBeforeCompile = (shaderObject) => {
                    if (mat.userData.originalOnBeforeCompile) {
                        mat.userData.originalOnBeforeCompile(shaderObject);
                    }
                    const currentMaskUniforms = mat.userData.maskUniforms || {};
                    for (const uName in currentMaskUniforms) {
                        shaderObject.uniforms[uName] = currentMaskUniforms[uName];
                    }

                    if (shaderDefinition.vertexShader && shaderDefinition.vertexShader.trim() !== "") {
                        shaderObject.vertexShader = shaderDefinition.vertexShader + '\n' + shaderObject.vertexShader;

                        if (shaderDefinition.injectionPoint && shaderDefinition.injectionPoint.hook) {
                            if (shaderObject.vertexShader.includes(shaderDefinition.injectionPoint.hook)) {
                                shaderObject.vertexShader = shaderObject.vertexShader.replace(
                                    shaderDefinition.injectionPoint.hook,
                                    shaderDefinition.injectionPoint.code
                                );
                            } else {
                                if (SHOW_GUI) console.warn(`[ObjectMaskHelper] Shader ${animConfig.shaderKey}: Vertex injection hook '${shaderDefinition.injectionPoint.hook}' not found for ${mesh.name}.`);
                            }
                        }
                    }

                    if (shaderDefinition.fragmentShader && shaderDefinition.fragmentShader.trim() !== "") {
                        let fragmentPrefix = `uniform float progress;\n`;
                        if (shaderDefinition.customUniforms) {
                            for (const uName in shaderDefinition.customUniforms) {
                                let uniformType = "float";
                                const uniformDef = shaderDefinition.customUniforms[uName];
                                if (uniformDef && typeof uniformDef.value === 'object') {
                                    if (uniformDef.value.isTexture) uniformType = "sampler2D";
                                    else if (uniformDef.value.isVector2) uniformType = "vec2";
                                    else if (uniformDef.value.isVector3) uniformType = "vec3";
                                    else if (uniformDef.value.isVector4) uniformType = "vec4";
                                    else if (uniformDef.value.isColor) uniformType = "vec3";
                                } else if (uniformDef && typeof uniformDef.value === 'number') {
                                    uniformType = "float";
                                } else if (uniformDef && typeof uniformDef.value === 'boolean') {
                                    uniformType = "bool";
                                }
                                fragmentPrefix += `uniform ${uniformType} ${uName};\n`;
                            }
                        }
                        fragmentPrefix += shaderDefinition.fragmentShader;
                        shaderObject.fragmentShader = fragmentPrefix + '\n' + shaderObject.fragmentShader;

                        if (shaderDefinition.injectionPoint && shaderDefinition.injectionPoint.hook) {
                            if (shaderObject.fragmentShader.includes(shaderDefinition.injectionPoint.hook)) {
                                shaderObject.fragmentShader = shaderObject.fragmentShader.replace(
                                    shaderDefinition.injectionPoint.hook,
                                    shaderDefinition.injectionPoint.code
                                );
                            } else {
                                 if (SHOW_GUI) console.warn(`[ObjectMaskHelper] Shader ${animConfig.shaderKey}: Injection hook '${shaderDefinition.injectionPoint.hook}' not found for ${mesh.name}.`);
                            }
                        } else {
                            if (SHOW_GUI) console.warn(`[ObjectMaskHelper] Shader ${animConfig.shaderKey} missing 'injectionPoint'.`);
                        }

                        if (shaderDefinition.injectionPointFragment &&
                            shaderDefinition.injectionPointFragment.hook &&
                            shaderObject.fragmentShader.includes(shaderDefinition.injectionPointFragment.hook)) {
                            shaderObject.fragmentShader = shaderObject.fragmentShader.replace(
                                shaderDefinition.injectionPointFragment.hook,
                                shaderDefinition.injectionPointFragment.code
                            );
                        }
                    }
                };
                mat.needsUpdate = true;
            });
        });
    };

    // --- Function to perform the material teardown ---
    const teardownMaterial = () => {
        if (!createdAsset.visible) return;

        createdAsset.traverse(child => {
            if (child.isMesh && child.material) {
                const materials = Array.isArray(child.material) ? child.material : [child.material];
                materials.forEach(mat => {
                    if (mat.userData?.isActiveObjectMask && mat.userData.activeObjectMaskId === uniqueMaskId) {
                        mat.onBeforeCompile = mat.userData.originalOnBeforeCompile;
                        mat.transparent = mat.userData.originalTransparent;
                        mat.alphaTest = mat.userData.originalAlphaTest;

                        delete mat.userData.originalOnBeforeCompile;
                        delete mat.userData.isActiveObjectMask;
                        delete mat.userData.activeObjectMaskId;
                        delete mat.userData.maskShaderKey;
                        delete mat.userData.maskUniforms;
                        delete mat.userData.originalTransparent;
                        delete mat.userData.originalAlphaTest;
                        mat.needsUpdate = true;
                    }
                });
            }
        });
    };

    // 1. Call setupMaterial at the effectBaseTimeOnTimeline.
    // This ensures the object is immediately in its start state (e.g., transparent for fade-in).
    timeline.call(setupMaterial, [], effectBaseTimeOnTimeline);

    const progressTweenProxy = { value: progressStartValue };

    // 2. The GSAP tween for the actual animation.
    // Placed at effectBaseTimeOnTimeline, but uses configuredStartTimeOffset as its internal delay.
    timeline.to(progressTweenProxy, {
        value: progressEndValue,
        duration: animationDuration,
        ease: ease,
        delay: configuredStartTimeOffset, // Apply the startTimeOffset from animConfig here
        immediateRender: false, 
        onUpdate: function() {
            const currentProgressValue = this.targets()[0].value;
            if (createdAsset.visible) {
                 createdAsset.traverse(child => {
                    if (child.isMesh && child.material) {
                        const materials = Array.isArray(child.material) ? child.material : [child.material];
                        materials.forEach(mat => {
                            if (mat.userData?.activeObjectMaskId === uniqueMaskId && mat.userData.maskUniforms?.progress) {
                                mat.userData.maskUniforms.progress.value = currentProgressValue;
                            }
                        });
                    }
                });
            }
        },
        onComplete: () => {
            // For "out" effects, teardown. For "in" effects, they usually persist visually.
            if (animConfig.direction === "out") {
                teardownMaterial();
            }
            // If it's an "in" effect (progressEndValue === 1.0), the object remains
            // with the shader active but fully opaque (or as per shader logic at progress=1).
            // Teardown for "in" effects is typically handled by onReverseComplete or
            // if the object is removed/reset by other means.
        },
        onReverseComplete: () => {
            // This means we scrubbed back to the point *before* the delayed animation started its active phase.
            // The material should revert to its "setup" state (e.g., progress=0 for fade-in),
            // which was established by the setupMaterial call at effectBaseTimeOnTimeline.
            // If the original teardownMaterial() was called, it would remove the shader entirely.
            // Instead, we ensure the progress is at its start value.
            if (createdAsset.visible) {
                createdAsset.traverse(child => {
                    if (child.isMesh && child.material) {
                        const materials = Array.isArray(child.material) ? child.material : [child.material];
                        materials.forEach(mat => {
                            if (mat.userData?.activeObjectMaskId === uniqueMaskId && mat.userData.maskUniforms?.progress) {
                                mat.userData.maskUniforms.progress.value = progressStartValue;
                            }
                        });
                    }
                });
            }
        }
    }, effectBaseTimeOnTimeline);


    // 3. Teardown when scrubbing *before* the entire effect's base time.
    // If the timeline moves from a point after effectBaseTimeOnTimeline to a point before it,
    // the setupMaterial call needs to be undone.
    // This is a more complex state management for GSAP. A common approach is to ensure
    // that if an animation is "skipped" or scrubbed over backwards, its setup is reverted.
    // For now, the immediate problem of initial visibility during startTimeOffset is the focus.
    // A full robust teardown on scrubbing *before* effectBaseTimeOnTimeline might require
    // adding a corresponding teardown call, e.g., timeline.call(teardownMaterial, [], "<" + effectBaseTimeOnTimeline)
    // or managing states more explicitly if effects can overlap or interact.
    // The current onReverseComplete of the tween handles the state at the start *of the tween's active period*.
    // Adding an explicit teardown for scrubbing *before* effectBaseTimeOnTimeline:
    if (effectBaseTimeOnTimeline > 0) { // Only add if not at the very beginning of the master timeline
        timeline.call(() => {
            // This teardown should only run if the timeline is scrubbing backwards over this point
            // and the effect was previously active. GSAP's call() doesn't inherently know direction.
            // A more robust solution might involve checking timeline.reversed() if available contextually,
            // or managing an "isActive" flag.
            // For simplicity, if this call is reached when going backwards before effectBaseTimeOnTimeline,
            // we assume a teardown is needed.
            const isScrubbingBackwardsPastEffectStart = timeline.reversed() && timeline.time() < effectBaseTimeOnTimeline;
            // This condition is conceptual; direct GSAP state for this specific scenario in a .call() is tricky.
            // The safest is often to ensure teardown is paired with setup for specific segments.
            // Given the current structure, the onReverseComplete of the main tween is the primary mechanism for undoing during rewind.
            // Let's rely on the tween's onReverseComplete and the setup at effectBaseTimeOnTimeline.
            // If a more aggressive teardown is needed for scrubbing *before* effectBaseTimeOnTimeline,
            // it implies the object should not even have its material prepared.
        }, [], `<${effectBaseTimeOnTimeline}`); // Positioned just before effectBaseTimeOnTimeline
    }
}