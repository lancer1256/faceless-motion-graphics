// src/config/sceneSequenceConfig.js

/**
 * macroScenesConfig defines the top-level THREE.Scene objects used in the animation.
 * 
 * Unlike scenesConfig which defines logical scenes/sequences within the animation,
 * macroScenesConfig defines the actual Three.js scene objects that will be created.
 * 
 * Each logical scene from scenesConfig can target which macroScene its content
 * should be placed in using the targetThreeSceneName property.
 */
export const macroScenesConfig = [
    {
        id: "mainScene",         // ID for referencing this scene in core.threeSceneObjects
        name: "mainScene",       // Name property to set on THREE.Scene (for debugging)
        background: {
            type: "shader",
            shader: "fourCornerGradient", // Refers to fourCornerGradientShader.js
            config: {
                topLeft: 0x006600,
                topRight: 0x005000,
                bottomLeft: 0x004000,
                bottomRight: 0x004000
            }
        },
        isDefault: true,          // This is the default/initial scene
        postProcessing: {
            bloom: true,          // Enable bloom for this macro scene by default
            vignetteBlur: true    // Enable vignette blur for this macro scene by default
        }
    },
    {
        id: "scene3Specific",
        name: "scene3Specific",
        background: {
            type: "shader",
            shader: "vignette",
            config: {
                color: 0xffffff,  // Base white
                radius: 0.02,     // Where vignette starts (0 – 0.5)
                darkening: 0.15,   // Edge darkening amount
                feather: 2      // Higher value creates softer edge transition
            }
        },
        isDefault: false,
        postProcessing: {
            bloom: false,         // Disable bloom for this macro scene by default
            vignetteBlur: true   // Enable vignette blur for this macro scene by default
        }
    },
    { // NEW MACRO SCENE FOR SCENE 5
        id: "scene5Specific",
        name: "scene5Specific",
        background: {
            type: "color", // Or "color"
            color: 0x000000
        },
        isDefault: false,
        postProcessing: {
            bloom: { strength: 0.74, radius: 0.7, threshold: 0.2 },
            vignetteBlur: { 
                enabled: true,
                radiusX: 0.2,
                radiusY: 0.3,
                feather: 0.4,
                maxBlurRadius: 2.0,
                center: { x: 0.5, y: 0.5 }
            },
            gaussianBlur: { blurRadius: 0.9 }
        }
    },
    // NEW MACRO SCENE FOR SCENE 9
    {
        id: "scene9Specific",
        name: "scene9Specific",
        background: {
            type: "color",
            color: 0x000000 // Black background
        },
        isDefault: false,
        postProcessing: { // Assuming similar PP settings to scene5Specific or your desired defaults
            bloom: { strength: 0.74, radius: 0.7, threshold: 0.2 }, // Example
            vignetteBlur: {
                enabled: true,
                radiusX: 0.2,
                radiusY: 0.3,
                feather: 0.4,
                maxBlurRadius: 2.0,
                center: { x: 0.5, y: 0.5 }
            }, // Example
            gaussianBlur: { blurRadius: 0.9 } // Example
        }
    },
    // NEW MACRO SCENE FOR SCENE 12
    {
        id: "scene12Specific",
        name: "scene12Specific",
        background: {
            type: "shader",
            shader: "vignette",
            config: {
                color: 0xffffff,  // Base white
                radius: 0.02,     // Where vignette starts (0 – 0.5)
                darkening: 0.15,   // Edge darkening amount
                feather: 2      // Higher value creates softer edge transition
            }
        },
        isDefault: false,
        postProcessing: {
            bloom: { strength: 0.0, radius: 0.0, threshold: 1 },
        }
    },
    // NEW MACRO SCENE FOR SCENE 15
    {
        id: "scene15Specific",
        name: "scene15Specific",
        background: {
            type: "color",
            color: 0x000000 // Black background
        },
        isDefault: false,
        postProcessing: {
            bloom: { strength: 0.34, radius: 0.7, threshold: 0.2 },
            vignetteBlur: { 
                enabled: true,
                radiusX: 0.2,
                radiusY: 0.3,
                feather: 0.4,
                maxBlurRadius: 2.0,
                center: { x: 0.5, y: 0.5 }
            },
            gaussianBlur: { blurRadius: 0.9 }
        }
    },
    {
        id: "scene17Specific",
        name: "scene17Specific", 
        background: {
            type: "color",
            color: 0x000000 // Black background
        },
        isDefault: false,
        postProcessing: {
            bloom: { strength: 0.34, radius: 0.7, threshold: 0.2 },
            vignetteBlur: { 
                enabled: true,
                radiusX: 0.2,
                radiusY: 0.3,
                feather: 0.4,
                maxBlurRadius: 2.0,
                center: { x: 0.5, y: 0.5 }
            },
            gaussianBlur: { blurRadius: 0.9 }
        }
    },
    {
        id: "scene19Specific",
        name: "scene19Specific",
        background: {
            type: "color",
            color: 0x000000 // Black background
        },
        isDefault: false,
        postProcessing: {
            bloom: { strength: 0.34, radius: 0.7, threshold: 0.2 },
            vignetteBlur: { 
                enabled: true,
                radiusX: 0.2,
                radiusY: 0.3,
                feather: 0.4,
                maxBlurRadius: 2.0,
                center: { x: 0.5, y: 0.5 }
            },
            gaussianBlur: { blurRadius: 0.9 }
        }
    },
    {
        id: "scene20Specific",
        name: "scene20Specific",
        background: {
            type: "color",
            color: 0x000000 // Black background
        },
        isDefault: false,
        postProcessing: {
            bloom: { strength: 0.34, radius: 0.7, threshold: 0.2 },
            vignetteBlur: { 
                enabled: true,
                radiusX: 0.2,
                radiusY: 0.3,
                feather: 0.4,
                maxBlurRadius: 2.0,
                center: { x: 0.5, y: 0.5 }
            },
            gaussianBlur: { blurRadius: 0.9 }
        }
    },
    {
        id: "scene21Specific",
        name: "scene21Specific",
        background: {
            type: "color",
            color: 0x000000 // Black background
        },
        isDefault: false,
        postProcessing: {
            bloom: { strength: 0.34, radius: 0.7, threshold: 0.2 },
            vignetteBlur: { 
                enabled: true,
                radiusX: 0.2,
                radiusY: 0.3,
                feather: 0.4,
                maxBlurRadius: 2.0,
                center: { x: 0.5, y: 0.5 }
            },
            gaussianBlur: { blurRadius: 0.9 }
        }
    },
    {
        id: "scene22Specific",
        name: "scene22Specific",
        background: {
            type: "color",
            color: 0x000000 // Black background
        },
        isDefault: false,
        postProcessing: {
            bloom: { strength: 0.34, radius: 0.7, threshold: 0.2 },
            vignetteBlur: { 
                enabled: true,
                radiusX: 0.2,
                radiusY: 0.3,
                feather: 0.4,
                maxBlurRadius: 2.0,
                center: { x: 0.5, y: 0.5 }
            },
            gaussianBlur: { blurRadius: 0.9 }
        }
    }
    // Additional macro scenes can be added here as needed
];

const DEFAULT_SHAKE_SEED_CONFIG = 42;

export const scenesConfig = [
    {
        id: "scene1_intro", // Unique ID for this logical scene
        anchorPositioning: {
            fromPrevious: false, // This is the first scene
            worldPosition: { x: 0, y: 0, z: 0 }, // Scene 1 anchor at world origin
            // Defines how the camera initially views THIS scene's anchor (scene1_intro_Anchor)
            cameraAnimationTarget: { // For the initial view of Scene 1
                targetNullIndex: 0, // Animate CameraRigNode_0
                targetValues: { z: 45 }, // The original zoom for Scene 1
                duration: 1.14, // Example: Derived from old dur1_zoom_dynamic (content + padding)
                ease: "power2.inOut"
            }
        },
        lighting: [ // Example: Add a point light to scene1's anchor
            {
                id: "s1_anchor_pointlight",
                type: "point", // 'ambient', 'directional', 'point', 'spot'
                color: 0xffccaa,
                intensity: 0.8,
                distance: 50, // Optional: for point/spot
                decay: 2,     // Optional: for point
                position: { x: 0, y: 2, z: 1 } // Relative to this scene's anchor
            },
            {
                id: "s1_anchor_dirlight",
                type: "directional",
                color: 0xaaccff,
                intensity: 0.4,
                position: { x: 1, y: 3, z: 2 }, // Position of the light source relative to anchor
                targetPosition: { x: 0, y: 0, z: 0 }, // Point towards anchor's origin (optional, defaults to this)
                castShadow: true // Optional
            }
        ],
        contentBlocks: [
            {
                id: "s1_main_text_block",
                type: "text",
                textConfigId: "s1_intro_main_phrase", // Matches ID in textLibraryConfig.js
                position: { x: 0, y: 0, z: 0 },    // Text block centered on the Scene 1 anchor
                rotation: { x: 0, y: 0, z: 0 },
                scale: { x: 1, y: 1, z: 1 }
            },
            {
                id: "s1_sword_L",
                type: "asset",
                assetConfigId: "sword_animated_left",
                position: { x: 0, y: -.5, z: 68 },  // Local to Scene 1 anchor
                rotation: { x: .27, y: .2, z: .26 },     // Instance yaw offset
                scale: { x: 1, y: 1, z: 1 },
                timelineAnimations: [
                    {
                        targetProperty: "position.x",
                        targetValue: 20,
                        durationFactor: 1,
                        ease: "power2.inOut",
                        startTime: 0.1
                    },
                    {
                        targetProperty: "position.y",
                        targetValue: 0,
                        duration: 1,
                        ease: "power2.inOut",
                        startTime: 0.1
                    },
                    {
                        targetProperty: "position.z",
                        targetValue: 80,
                        duration: 1,
                        ease: "power2.inOut",
                        startTime: 0.1
                    },
                    {
                        targetProperty: "rotation.x",
                        targetValue: -.5,
                        duration: 1,
                        ease: "power2.inOut",
                        startTime: 0
                    }
                ]
            },
            {
                id: "s1_sword_R",
                type: "asset",
                assetConfigId: "sword_animated_right",
                position: { x: 0, y: -.5, z: 65 },  // Same as left
                rotation: { x: .27, y: .2, z: .26 }, // Same as left
                scale: { x: 1, y: 1, z: 1 },
                timelineAnimations: [
                    {
                        targetProperty: "position.x",
                        targetValue: -20,
                        durationFactor: 1,
                        ease: "power2.inOut",
                        startTime: 0.1
                    },
                    {
                        targetProperty: "position.y",
                        targetValue: 0,
                        duration: 1,
                        ease: "power2.inOut",
                        startTime: 0.1
                    },
                    {
                        targetProperty: "position.z",
                        targetValue: 80,
                        duration: 1,
                        ease: "power2.inOut",
                        startTime: 0.1
                    },
                    {
                        targetProperty: "rotation.x",
                        targetValue: -.5,
                        duration: 1,
                        ease: "power2.inOut",
                        startTime: 0
                    }
                ]
            },
            {
                id: "s1_sword_front",
                type: "asset",
                assetConfigId: "sword_static_1",
                position: { x: 3, y: -4, z: 28 },     // Local to Scene 1 anchor
                rotation: { x: 0, y: 0.15, z: 0 },
                scale: { x: 1, y: 1, z: 1 },
                timelineAnimations: []
            },
            {
                id: "s1_sword_back",
                type: "asset",
                assetConfigId: "sword_static_2",
                position: { x: -3.5, y: 2, z: -16 },  // Local to Scene 1 anchor
                rotation: { x: 0, y: -0.2, z: 0 },
                scale: { x: 1, y: 1, z: 1 }
            }
        ],
        cameraMoves: [], // For any additional camera movements WITHIN Scene 1
        postProcessing: {
            bloom: { strength: 0.34, radius: 0.7, threshold: 0.2 },
            gaussianBlur: { blurRadius: 0.9 },
            vignetteBlur: { 
                enabled: true,
                radiusX: 0.2,
                radiusY: 0.3,
                feather: 0.4,
                maxBlurRadius: 2.0,
                center: { x: 0.5, y: 0.5 }
            }
            /* Scene 1 specific post-processing if any */
        },
        transcriptMappings: [ /* For Scene 1 text if needed */ ]
    },
    // SCENE 2 CONFIGURATION
    {
        id: "scene2_resistance",
        anchorPositioning: {
            fromPrevious: true,
            transitionType: "cameraMove",
            // How to position THIS scene's anchor (scene2_resistance_Anchor)
            // relative to the PREVIOUS scene's anchor (scene1_intro_Anchor).
            placementRelativeToPreviousAnchor: {
                method: "offsetFromPrevious", // Simplified method name
                offset: { x: 32, y: 0, z: 0 } // Direct X, Y, Z offset for the anchor from previous anchor
            },
            // How the camera rig animates to frame this newly positioned scene2_resistance_Anchor.
            // This defines the transition camera move.
            cameraAnimationTarget: { // For the initial view of Scene 1
                targetNullIndex: 1, // Animate CameraRigNode_1 for Scene 2's pan
                // Target values for CameraRigNode_1's LOCAL position.
                // These should correspond to the anchor's offset to frame it correctly.
                // Plus the specific Z push for this null.
                targetValues: { 
                    x: 32, // Matches anchor's x offset
                    y: 0,  // Matches anchor's y offset
                    z: 0  // Specific Z push for CameraRigNode_1
                },
                duration: 1.33, // Example: Derived from old dur2_pan_dynamic
                ease: "power2.inOut"
                // duration will be calculated from transcript by startAnimation
            },
            // overlapKey: "OVERLAP_THRESHOLD_1_2", // Used by startAnimation to get window.OVERLAP_THRESHOLD_1_2 -- No longer primary if mode is percentage
            overlapCalculationMode: "percentage", 
            overlapValue: 0.30
        },
        contentBlocks: [
            {
                id: "s2_main_text_block",
                type: "text",
                textConfigId: "s2_resistance_phrase", // From textLibraryConfig.js
                position: { x: 0, y: 0, z: 0 },    // Scene 2 text centered on Scene 2 anchor
                rotation: { x: 0, y: .1, z: 0 },
                scale: { x: 1, y: 1, z: 1 },
                isOcclusionMainObjectToCheck: true,
                startTextAnimationsAfterOverlap: true
            },
            {
                id: "s2_statue_TL",
                type: "asset",
                assetConfigId: "statue_checkmark_style", // From assetLibraryConfig.js
                position: { x: -5.60, y: 0.68, z: 12.44 }, // Local to Scene 2 anchor
                rotation: { x: 0.06000, y: 0.61000, z: 0.25000 },
                scale: { x: 1.30, y: 1.30, z: 1.30 }, // Instance scale
                runOcclusionCheckAndMove: true
            },
            {
                id: "s2_statue_BL",
                type: "asset",
                assetConfigId: "statue_checkmark_style",
                position: { x: -5.60, y: -10.00, z: 11.84 }, // Local to Scene 2 anchor
                rotation: { x: -0.12000, y: 0.43000, z: -6.28319 },
                scale: { x: 0.93, y: 0.93, z: 0.93 },
            },
            {
                id: "s2_statue_TR",
                type: "asset",
                assetConfigId: "statue_checkmark_style",
                position: { x: 7.76, y: 4.76, z: -15.12 }, // Local to Scene 2 anchor
                rotation: { x: 0.06000, y: -0.12000, z: 0.43000 },
                scale: { x: 1.30, y: 1.30, z: 1.30 },
                runOcclusionCheckAndMove: true
            },
            {
                id: "s2_statue_BR",
                type: "asset",
                assetConfigId: "statue_checkmark_style",
                position: { x: 10.68, y: -10.00, z: -20.00 }, // Local to Scene 2 anchor
                rotation: { x: 0.43000, y: 0.61000, z: -0.12000 },
                scale: { x: 1.30, y: 1.30, z: 1.30 },
            }
        ],
        cameraMoves: [],
        postProcessing: {
            bloom: { strength: 0.34, radius: 0.7, threshold: 0.2 },
            gaussianBlur: { blurRadius: 0.9 },
            vignetteBlur: { 
                enabled: true,
                radiusX: 0.2,
                radiusY: 0.3,
                feather: 0.4,
                maxBlurRadius: 2.0,
                center: { x: 0.5, y: 0.5 }
            }
            /* Scene 2 specific post-processing if any */
        },
        transcriptMappings: [ /* For Scene 2 text if needed */ ]
    },
    // SCENE 3 CONFIGURATION (Updated Emojis)
    {
        id: "scene3_stopActing",
        targetThreeSceneName: "scene3Specific", // Content for this scene lives in the 'scene3' THREE.js object
        anchorPositioning: {
            fromPrevious: true,
            // How to position THIS scene's anchor (scene3_stopActing_Anchor)
            // This anchor will be parented to the 'scene3' THREE.js object.
            // Its world position relative to the previous scene's end state is complex due to the wipe.
            // For a wipe, the *camera* often moves first, then the wipe reveals the new scene's content
            // which is already "in place" in its own THREE.Scene.
            // Let's assume the anchor for scene3 content is at (0,0,0) within the 'scene3Specific' THREE.js scene.
            // The cameraAnimationTarget below will handle the camera zoom (Null3) into this.
            placementRelativeToPreviousAnchor: {
                method: "offsetFromPrevious", // New method: anchor is at origin of its targetThreeSceneName
                offset: { x: 0, y: 0, z: -35 }
            },
            transitionType: "mask", // UPDATED
            // Camera move (e.g. null3 zoom) that happens *leading into or during* the wipe
            cameraAnimationTarget: {
                targetNullIndex: 2, // Animate CameraRigNode_2 for Scene 3's zoom
                targetValues: { x: 0, y: 0, z: -45 }, // This is the local animation for Null3
                duration: 1.19, // Example: Derived from old dur3_finalZoom_cam_tween_dynamic
                ease: "power2.inOut",
            },
            maskParams: { // UPDATED from wipeParams
                shaderKey: "circularWipe", // NEW: Key to find the shader
                activationOffset: 0.1, // Delay for wipe start relative to this scene's camera move start
                duration: 0.8,         // Wipe duration
                ease: "power2.inOut",  // Ease for the wipe progress uniform
                usesRenderTargets: true // NEW: This mask type uses render targets
            },
            // overlapKey: "OVERLAP_THRESHOLD_2_3", -- No longer primary if mode is percentage
            overlapCalculationMode: "percentage", 
            overlapValue: 0.30
            // switchesToTargetThreeScene: true // Implicit if targetThreeSceneName is different from previous
        },
        lighting: [ // Example: Add a spotlight to scene3's anchor
            {
                id: "s3_spotlight_on_text",
                type: "spot",
                color: 0xffffff,
                intensity: 10.5,
                position: { x: 0, y: 0, z: 10 }, // Above and in front of the text anchor
                targetPosition: { x: 0, y: 0, z: 0 }, // Pointing at the text anchor's origin
                angle: Math.PI / 8, // Angle of the spotlight cone
                penumbra: 0.2,    // Softness of the cone edge
                distance: 100,     // Max range of the light
                castShadow: true
            }
        ],
        contentBlocks: [
            {
                id: "s3_main_text_block",
                type: "text",
                textConfigId: "s3_stop_acting_phrase",
                position: { x: 0, y: 0, z: 0 }, // Text centered on Scene 3 anchor (in scene3Specific)
                rotation: { x: 0, y: 0, z: 0 },
                scale: { x: 1, y: 1, z: 1 },
                startTextAnimationsAfterOverlap: true
            },
            // Emojis for Scene 3 - these were originally in leonardoGroup, child of Scene 3 text.
            // Now, they are siblings to the text, all parented to scene3_stopActing_Anchor.
            // Their positions are relative to scene3_stopActing_Anchor.
            {
                id: "s3_emoji_nerd", type: "asset", assetConfigId: "emoji_nerd",
                position: { x: -17.30, y: -1.70, z: -28.00 }, // Original leoPositions
                rotation: { x: -0.4300, y: 0.6700, z: 0.3100 },
                scale: { x: 9.00, y: 9.00, z: 1.50 }, // This is the final scale the instance should have
                staggerInGroup: { 
                    groupKey: "scene3_emojis_pop_in",
                    delay: 0
                },
                timelineAnimations: [
                    { 
                        targetProperty: "scale", 
                        fromValue: { x: 0.0001, y: 0.0001, z: 0.0001 },
                        targetValue: { x: 9.00, y: 9.00, z: 1.50 },
                        startTime: 0,
                        duration: 0.6,
                        ease: "back.out(1.7)"
                    }
                ]
            },
            {
                id: "s3_emoji_crazy", type: "asset", assetConfigId: "emoji_crazy",
                position: { x: 4.90, y: -8.40, z: 11.80 },
                rotation: { x: 0.1200, y: -0.7000, z: -0.2400 },
                scale: { x: 9.00, y: 9.00, z: 1.50 },
                staggerInGroup: { 
                    groupKey: "scene3_emojis_pop_in",
                    delay: 0.15
                },
                timelineAnimations: [
                    { 
                        targetProperty: "scale", 
                        fromValue: { x: 0.0001, y: 0.0001, z: 0.0001 },
                        targetValue: { x: 7.20, y: 7.20, z: 1.20 },
                        startTime: 0,
                        duration: 0.6,
                        ease: "back.out(1.7)"
                    }
                ]
            },
            {
                id: "s3_emoji_clown", type: "asset", assetConfigId: "emoji_clown",
                position: { x: 9.00, y: 17.80, z: -28.52 },
                rotation: { x: 0.1200, y: -0.1500, z: -0.1500 },
                scale: { x: 9.06, y: 9.06, z: 1.51 }, // Set a fixed scale for visibility
                staggerInGroup: { 
                    groupKey: "scene3_emojis_pop_in",
                    delay: 0.15
                },
                timelineAnimations: [
                    { 
                        targetProperty: "scale", 
                        fromValue: { x: 0.0001, y: 0.0001, z: 0.0001 },
                        targetValue: { x: 4.3875, y: 4.3875, z: 0.735 },
                        startTime: 0,
                        duration: 0.6,
                        ease: "back.out(1.7)"
                    }
                ]
            }
        ],
        postProcessing: {
            bloom: { strength: 0.0, radius: 0.0, threshold: 1.0 },
            gaussianBlur: { blurRadius: 0.9 },
            
            vignetteBlur: { 
                enabled: true,
                radiusX: 0.2,
                radiusY: 0.3,
                feather: 0.4,
                maxBlurRadius: 2.0,
                center: { x: 0.5, y: 0.5 }
            }
        }
    },
    // SCENE 4 CONFIGURATION (Like You're Selling)
    {
        id: "scene4_likeYoureSelling",
        targetThreeSceneName: "scene3Specific", // Same scene as scene3
        anchorPositioning: {
            fromPrevious: true,
            placementRelativeToPreviousAnchor: {
                method: "offsetFromPrevious",
                offset: { x: 30, y: 0, z: -10 } // 50 units to the right as requested
            },
            transitionType: "cameraMove",
            cameraAnimationTarget: {
                targetNullIndex: 3, // Next available null index
                targetValues: { x: 30, y: 0, z: 0 }, // Maintain same z as scene3
                duration: 1.262, // As requested
                ease: "power2.inOut"
            },
            // overlapKey: "OVERLAP_THRESHOLD_3_4" -- No longer primary if mode is percentage
            overlapCalculationMode: "percentage",
            overlapValue: 0.30
        },
        contentBlocks: [
            {
                id: "s4_main_text_block",
                type: "text",
                textConfigId: "s4_like_youre_selling_phrase",
                position: { x: 0, y: 0, z: 0 },
                rotation: { x: -.34, y: .11, z: 0 },
                scale: { x: 1, y: 1, z: 1 },
                isOcclusionMainObjectToCheck: true,
                startTextAnimationsAfterOverlap: true
            },
            // Reusing Scene 2's statue setup as requested
            {
                id: "s4_statue_TL",
                type: "asset",
                assetConfigId: "dollar_sign_in_circle",
                position: { x: -5.5, y: 10.85, z: 7.23 },
                rotation: { x: .86, y: 0.06, z: 0.25000 },
                scale: { x: 1.30, y: 1.30, z: 1.30 },
                runOcclusionCheckAndMove: true
            },
            {
                id: "s4_statue_BL",
                type: "asset",
                assetConfigId: "dollar_sign_in_circle",
                position: { x: -5.50, y: -9.10, z: 27.24 },
                rotation: { x: -0.12000, y: 0.43000, z: -6.28319 },
                scale: { x: 0.93, y: 0.93, z: 0.93 }
            },
            {
                id: "s4_statue_TR",
                type: "asset",
                assetConfigId: "dollar_sign_in_circle",
                position: { x: 14.51, y: 10.87, z: -63.71 },
                rotation: { x: -.1000, y: 0.23000, z: -.23000 },
                scale: { x: 1.30, y: 1.30, z: 1.30 },
                runOcclusionCheckAndMove: true
            },
            {
                id: "s4_statue_BR",
                type: "asset",
                assetConfigId: "dollar_sign_in_circle",
                position: { x: 10.68, y: -10, z: -20 },
                rotation: { x: -0.31, y: 0.13, z: -0.12 },
                scale: { x: 1.30, y: 1.30, z: 1.30 }
            }
        ],
        cameraMoves: [],
        lighting: [
            // 1. Key light (main illumination)
            {
                id: "s4_key_light",
                type: "directional",
                color: 0xffffff,
                intensity: .25,
                position: { x: 0, y: -15, z: 5 },
                targetPosition: { x: 0, y: 0, z: 0 },
            },
            // 2. Fill light (fills shadows created by key light)
            {
                id: "s4_fill_light",
                type: "directional",
                color: 0xffffcc,
                intensity: 0.6,
                position: { x: 3, y: 0, z: 4 }
            },
            // 3. Rim/Back light (separates subject from background)
            {
                id: "s4_rim_light",
                type: "directional",
                color: 0xccccff,
                intensity: 0.3,
                position: { x: 0, y: 3, z: -5 }
            }
        ],
        postProcessing: {
            bloom: { strength: 0.0, radius: 0.0, threshold: 1.0 },
            gaussianBlur: { blurRadius: 0.9 },
            vignetteBlur: { 
                enabled: true,
                radiusX: 0.2,
                radiusY: 0.3,
                feather: 0.4,
                maxBlurRadius: 2.0,
                center: { x: 0.5, y: 0.5 }
            }
        }
    },
    // SCENE 5 CONFIGURATION (Think of Your Marketing)
    {
        id: "scene5_thinkMarketing",
        targetThreeSceneName: "scene5Specific", // UPDATED to new macro scene
        anchorPositioning: {
            fromPrevious: true,
            placementRelativeToPreviousAnchor: {
                method: "offsetFromPrevious",
                offset: { x: 0, y: 0, z: 5 } // 64 units up as requested
            },
            transitionType: "mask", // UPDATED
            cameraAnimationTarget: {
                targetNullIndex: 4,
                targetValues: { x: 0, y: 0, z: 35 },
                duration: 1.345, // As requested
                ease: "power2.inOut"
            },
            maskParams: { // NEW
                shaderKey: "diagonalWipe",
                duration: .15, // Adjust as needed
                ease: "power2.inOut",  // Linear progress for a steady wipe, or choose another
                activationOffset: 0.45, // Start wipe slightly after camera move begins
                usesRenderTargets: true
            },
            // overlapKey: "OVERLAP_THRESHOLD_4_5" -- No longer primary if mode is percentage
            overlapCalculationMode: "percentage", 
            overlapValue: 0.30
        },
        contentBlocks: [
            {
                id: "s5_main_text_block",
                type: "text",
                textConfigId: "s5_think_marketing_phrase",
                position: { x: 0, y: 0, z: 0 },
                rotation: { x: -0.26, y: 0, z: 0 },
                scale: { x: 1, y: 1, z: 1 },
                isOcclusionMainObjectToCheck: true,
                startTextAnimationsAfterOverlap: true
            }
        ],
        cameraMoves: [],
        postProcessing: {
            bloom: { strength: 0.34, radius: 0.7, threshold: 0.2 },
            gaussianBlur: { blurRadius: 0.9 },
            
            vignetteBlur: { 
                enabled: true,
                radiusX: 0.2,
                radiusY: 0.3,
                feather: 0.4,
                maxBlurRadius: 2.0,
                center: { x: 0.5, y: 0.5 }
            }
        }
    },
    // SCENE 6 CONFIGURATION (As)
    {
        id: "scene6_as",
        targetThreeSceneName: "scene5Specific", // Same scene as scene5
        anchorPositioning: {
            fromPrevious: true,
            placementRelativeToPreviousAnchor: {
                method: "offsetFromPrevious",
                offset: { x: 0, y: 0, z: 30 } // 50 units offset in Z as requested
            },
            transitionType: "cameraMove",
            cameraAnimationTarget: {
                targetNullIndex: 5, // Next available null index
                targetValues: { x: 0, y: 0, z: 30 }, // Matching the Z offset of 50
                duration: 1.24, // Similar duration to other scenes
                ease: "power2.inOut"
            },
            overlapCalculationMode: "percentage", 
            overlapValue: 0.30
        },
        contentBlocks: [
            {
                id: "s6_main_text_block",
                type: "text",
                textConfigId: "s6_as_phrase",
                position: { x: -13.57, y: 18.37, z: 0 },
                rotation: { x: -0.26, y: 0, z: 0 },
                scale: { x: 1, y: 1, z: 1 },
                isOcclusionMainObjectToCheck: true,
                startTextAnimationsAfterOverlap: true
            },
            {
                id: "s6_trojan_horse",
                type: "asset",
                assetConfigId: "wooden_trojan_horse",
                position: { x: 2.4, y: -70, z: 0 }, // Positioned at the origin
                rotation: { x: 0, y: 0, z: 0 },
                scale: { x: 2, y: 2, z: 2 },
                runOcclusionCheckAndMove: false,
                timelineAnimations: [
                    {
                        targetProperty: "position.y",
                        targetValue: -15.35,
                        from: -70,
                        duration: 1.1,
                        ease: "power2.out",
                        startTime: 0.2
                    }
                ]
            }
        ],
        cameraMoves: [],
        lighting: [
            // 1. Key light (main illumination)
            {
                id: "s6_key_light",
                type: "point",
                color: 0x996900,
                intensity: 500,
                position: { x: -12, y: -15, z: -10 }
            },
            // 2. Fill light (fills shadows created by key light)
            {
                id: "s6_fill_light",
                type: "directional",
                color: 0x996900,
                intensity: 0.6,
                position: { x: 3, y: 0, z: 4 }
            },
            // 3. Rim/Back light (separates subject from background)
            {
                id: "s6_rim_light",
                type: "directional",
                color: 0x996900,
                intensity: 0.3,
                position: { x: 0, y: 3, z: -5 }
            },
            // 4. Ambient light (overall scene illumination)
            {
                id: "s6_ambient_light",
                type: "ambient",
                color: 0xffffff,
                intensity: 1.5
            }
        ],
        postProcessing: {}
    },
    // SCENE 7 CONFIGURATION (On The Outside)
    {
        id: "scene7_onTheOutside",
        targetThreeSceneName: "scene5Specific", // Using black background from scene5
        anchorPositioning: {
            fromPrevious: true,
            placementRelativeToPreviousAnchor: {
                method: "offsetFromPrevious",
                offset: { x: 18, y: 0, z: 0 } // 20 units to the right
            },
            transitionType: "cameraMove",
            cameraAnimationTarget: {
                targetNullIndex: 6, // Next available null index (Scene 6 used 5)
                targetValues: { x: 23, y: 0, z: 0 }, // Matching the X offset
                duration: 1.25, // Standard duration
                ease: "power2.inOut"
            },
            overlapCalculationMode: "percentage", 
            overlapValue: 0.30
        },
        contentBlocks: [
            {
                id: "s7_main_text_block",
                type: "text",
                textConfigId: "s7_on_the_outside_phrase", // To be defined in textLibraryConfig.js
                position: { x: 0, y: 13, z: 0 }, // Centered on Scene 7 anchor
                rotation: { x: 0, y: 0, z: 0 },
                scale: { x: 1, y: 1, z: 1 },
                isOcclusionMainObjectToCheck: true, // Assume it might be occluded, standard practice
                startTextAnimationsAfterOverlap: true
            }
        ],
        cameraMoves: [
            {
                id: "s7_camera_move",
                type: "cameraMove",
                targetNullIndex: 7,
                targetValues: { x: 3, y: -1, z: -20 },
                duration: 1,
                ease: "power2.inOut",
                overlapCalculationMode: "percentage",
                overlapValue: 0.40
            },
            {
                id: "s7_camera_move_2",
                type: "cameraMove",
                targetNullIndex: 8,
                targetValues: { x: 0, y: -3, z: 0 },
                duration: 1,
                overlapCalculationMode: "percentage",
                overlapValue: 0.40,
                ease: "power2.inOut"
            },
            {
                id: "s7_camera_move_3",
                type: "cameraMove",
                targetNullIndex: 9,
                targetValues: { x: 0, y: -3, z: 0 },
                duration: 1,
                overlapCalculationMode: "percentage",
                overlapValue: 0.40,
                ease: "power2.inOut"
            }
        ], // No additional camera moves within the scene
        // Lighting: Not explicitly defined, will rely on text material properties or scene5Specific's setup.
        // PostProcessing: Will inherit from scene5Specific's macroSceneConfig entry.
        postProcessing: {}
    },
    // SCENE 8 CONFIGURATION (Inside Your Offer)
    {
        id: "scene8_insideYourOffer",
        targetThreeSceneName: "scene5Specific", // Using same black background from scene5
        anchorPositioning: {
            fromPrevious: true,
            placementRelativeToPreviousAnchor: {
                method: "offsetFromPrevious",
                offset: { x: -52, y: 0, z: 0 } // 50 units to the left as requested
            },
            transitionType: "cameraMove",
            cameraAnimationTarget: {
                targetNullIndex: 10, // Next available null index (Scene 7 used 9)
                targetValues: { x: -60, y: 20, z: 0 }, // Matching the X offset with requested Y movement
                duration: 0.95, // As requested
                ease: "power2.inOut"
            },
            overlapCalculationMode: "percentage", 
            overlapValue: 0.30 // As requested
        },
        contentBlocks: [
            {
                id: "s8_main_text_block",
                type: "text",
                textConfigId: "s8_inside_your_offer_phrase",
                position: { x: 0, y: 13, z: 0 },
                rotation: { x: 0, y: 0, z: 0 },
                scale: { x: 1, y: 1, z: 1 },
                isOcclusionMainObjectToCheck: true,
                startTextAnimationsAfterOverlap: true
            }
        ],
        postProcessing: {},
        cameraMoves: [
            {
                id: "s8_camera_move",
                type: "cameraMove",
                targetNullIndex: 11,
                targetValues: { x: 0, y: -2, z: 0 },
                duration: 0.9,
                ease: "power2.inOut",
                overlapCalculationMode: "percentage",
                overlapValue: 0.30
            }
        ]
    },
    // NEW SCENE 9
    {
        id: "scene9_hardCutExample",
        targetThreeSceneName: "scene9Specific", // Targets the new macro scene
        anchorPositioning: {
            fromPrevious: true,
            transitionType: "instant", // NEW: Denotes a hard cut
            activationOffset: 0.45, // NEW: Cut happens 0.2s after Scene 9's camera starts moving
            placementRelativeToPreviousAnchor: {
                method: "offsetFromPreviousCameraPosition",
                offset: { x: 0, y: 0, z: 0 } // Scene 9 anchor relative to Scene 8 anchor
            },
            cameraAnimationTarget: {
                targetNullIndex: 12, // Assuming this null index is available and sequential
                targetValues: { x: 0, y: 0, z: 45 }, // Camera move to frame Scene 9 anchor
                duration: 0.97, // Duration of Scene 9's camera move
                ease: "power2.inOut"
            },
            overlapCalculationMode: "percentage",
            overlapValue: 0.30 // Scene 9's camera move starts when Scene 8's move is 65% done
        },
        contentBlocks: [
            {
                id: "s9_main_text_block",
                type: "text",
                textConfigId: "s9_instead_of_phrase",
                position: { x: 0, y: 0, z: 0 },
                rotation: { x: 0, y: 0, z: 0 },
                scale: { x: 1, y: 1, z: 1 },
                isOcclusionMainObjectToCheck: true,
                startTextAnimationsAfterOverlap: true
            }
        ],
        postProcessing: { /* Scene 9 specific overrides if needed, else inherits from macro */ }
    },
    // NEW SCENE 10
    {
        id: "scene10_buyTheseSocks",
        targetThreeSceneName: "scene9Specific", // Targets the new scene10 macro scene
        anchorPositioning: {
            fromPrevious: true,
            transitionType: "cameraMove",
            placementRelativeToPreviousAnchor: {
                method: "offsetFromPrevious",
                offset: { x: 25, y: 0, z: 0 } // 25 units to the right from scene9
            },
            cameraAnimationTarget: {
                targetNullIndex: 13, // Next available null index
                targetValues: { x: 25, y: 0, z: -10 }, // Match the offset
                duration: 1.212, // Standard duration
                ease: "power2.inOut"
            },
            overlapCalculationMode: "percentage",
            overlapValue: 0.30 // Standard overlap value
        },
        contentBlocks: [
            {
                id: "s10_main_text_block",
                type: "text",
                textConfigId: "s10_buy_these_socks_phrase",
                position: { x: 0, y: -1, z: 0.01 }, // Centered on card, slightly in front
                rotation: { x: 0, y: 0, z: 0 },
                scale: { x: 1, y: 1, z: 1 },
                parentIdInScene: "s10_glass_pane", // This links it to the glass card
                isOcclusionMainObjectToCheck: true,
                startTextAnimationsAfterOverlap: true
            },
            {
                id: "s10_christmas_stocking",
                type: "asset",
                assetConfigId: "christmas_stocking",
                position: { x: 1.78, y: 9.05, z: -5 }, // Z index -5 as requested
                rotation: { x: -0.12, y: 0, z: -0.17 },
                scale: { x: 1, y: 1, z: 1 },
                timelineAnimations: []
            },
            {
                id: "s10_glass_pane",
                type: "asset",
                assetConfigId: "physicalGlassCard_default",
                position: { x: 0, y: 0, z: -2 },
                rotation: { x: 0, y: 0, z: 0 },
                scale: { x: 1, y: 1, z: 1 },
                properties: {
                    glassColor: 0xffffff,
                    glassRoughness: 0.4,
                    glassMetalness: 0.0,
                    glassTransmission: 1.0,
                    glassThickness: 0.0,
                    glassIOR: 2.3,
                    glassOpacity: 1.0,
                    envMapIntensity: 1.0,
                    specularIntensity: 0.1,
                    cornerRadiusFactor: 0.40,
                    padding: { top: 0.6, right: 1, bottom: 0.6, left: 1 },
                    borderEnabled: true,
                    borderColor: 0xc90000,
                    borderZOffset: 0.005
                },
                timelineAnimations: []
            }
        ],
        lighting: [
            {
                id: "s10_key_light",
                type: "directional",
                color: 0xffffff,
                intensity: .5,
                position: { x: 0, y: 0, z: 5 },
                targetPosition: { x: 0, y: 0, z: 0 }
            },
            {
                id: "s10_ambient_light",
                type: "ambient",
                color: 0xffffff,
                intensity: 2.0
            }
        ],
        postProcessing: {}
    },
    // NEW SCENE 11
    {
        id: "scene11_feetHurt",
        targetThreeSceneName: "scene9Specific", // Same scene as scene10
        anchorPositioning: {
            fromPrevious: true,
            transitionType: "cameraMove",
            placementRelativeToPreviousAnchor: {
                method: "offsetFromPrevious",
                offset: { x: 25, y: 0, z: 0 } // 25 units to the right from scene10
            },
            cameraAnimationTarget: {
                targetNullIndex: 14, // Next available null index
                targetValues: { x: 25, y: 0, z: 5 }, // Match the offset
                duration: 0.972, // Standard duration
                ease: "power2.inOut"
            },
            overlapCalculationMode: "percentage",
            overlapValue: 0.30 // Standard overlap value
        },
        contentBlocks: [
            {
                id: "s11_main_text_block",
                type: "text",
                textConfigId: "s11_feet_hurt_phrase",
                position: { x: 0, y: 1, z: 0.01 }, // Centered on card, slightly in front
                rotation: { x: 0, y: 0, z: 0 },
                scale: { x: 1, y: 1, z: 1 },
                isOcclusionMainObjectToCheck: true,
                startTextAnimationsAfterOverlap: true
            },
            {
                id: "s11_christmas_stocking",
                type: "asset",
                assetConfigId: "christmas_stocking",
                position: { x: 1.78, y: 11.05, z: -5 }, // Z index -5 as requested
                rotation: { x: -0.12, y: 0, z: -0.17 },
                scale: { x: 1, y: 1, z: 1 },
                timelineAnimations: []
            },
            {
                id: "s11_glass_pane",
                type: "asset",
                assetConfigId: "physicalGlassCard_default",
                position: { x: 0, y: 0, z: -2 },
                rotation: { x: 0, y: 0, z: 0 },
                scale: { x: 1, y: 1, z: 1 },
                properties: {
                    glassColor: 0xffffff,
                    glassRoughness: 0.4,
                    glassMetalness: 0.0,
                    glassTransmission: 1.0,
                    glassThickness: 0.0,
                    glassIOR: 2.3,
                    glassOpacity: 1.0,
                    envMapIntensity: 1.0,
                    specularIntensity: 0.1,
                    cornerRadiusFactor: 0.20,
                    padding: { top: 0.6, right: 1, bottom: 0.6, left: 1 },
                    height: 20.0,
                    width: 20.0,
                    borderEnabled: true,
                    borderColor: 0x1ff42c,
                    borderZOffset: 0.005
                },
                timelineAnimations: []
            }
        ],
        lighting: [],
        cameraMoves: [
            {
                targetValues: { z: 10 },
                duration: 2.45,
                ease: "sine.in",
                overlapCalculationMode: "percentage",
                targetNullIndex: 15,
                overlapValue: 0.30
            }
        ],
        postProcessing: {}
    },
    // NEW SCENE 12
    {
        id: "scene12_theBrain",
        targetThreeSceneName: "scene12Specific",
        anchorPositioning: {
            fromPrevious: true,
            transitionType: "mask",
            placementRelativeToPreviousAnchor: {
                method: "offsetFromPrevious",
                offset: { x: 0, y: 0, z: -50 }
            },
            cameraAnimationTarget: {
                targetNullIndex: 16, // Next available null index
                targetValues: { x: 0, y: 0, z: -40 },
                duration: 1.0,
                ease: "power2.inOut",
                cameraShake: {
                    enabled: true,
                    durationFactor: .10,
                    startTimeOffsetFactor: 0.4,
                    positionAmplitude: 0.09,
                    positionFrequency: 10,
                    rotationAmplitude: 0.05,
                    rotationFrequency: 9,
                    seed: 200,
                    fadeInDurationFactor: 0.1,
                    fadeOutDurationFactor: 0.1,
                }
            },
            maskParams: {
                shaderKey: "circularWipe",
                activationOffset: 0.3,
                duration: 0.5,
                ease: "power2.inOut",
                usesRenderTargets: true
            },
            overlapCalculationMode: "percentage",
            overlapValue: 0.30
        },
        contentBlocks: [
            {
                id: "s12_main_text_block",
                type: "text",
                textConfigId: "s12_the_phrase",
                position: { x: -10.96, y: 10, z: 0 },
                rotation: { x: 0, y: 0, z: 0 },
                scale: { x: 1, y: 1, z: 1 },
                isOcclusionMainObjectToCheck: true,
                startTextAnimationsAfterOverlap: true
            },
            {
                id: "s12_brain",
                type: "asset",
                assetConfigId: "human_brain",
                position: { x: 0, y: 0, z: 0 },
                rotation: { x: 0, y: 2.11, z: 0 },
                scale: { x: 1, y: 1, z: 1 },
                timelineAnimations: [
                    {
                        targetProperty: "rotation.x",
                        fromValue: 2,
                        targetValue: 0,
                        duration: 1.3,
                        ease: "power2.out",
                        startTime: 0
                    },
                    {
                        targetProperty: "rotation.y",
                        fromValue: 2.11,
                        targetValue: 1.48,
                        duration: 1.3,
                        ease: "power2.out",
                        startTime: 0
                    }
                ]
            }
        ],
        lighting: [
            {
                id: "s12_rim_light", 
                type: "spot",
                color: 0xffffff,
                intensity: 4,
                distance: 100,
                decay: 0,
                angle: 2.5,
                position: { x: 20, y: 18.6, z: 20 }
            },
            {
                id: "s12_rim_light_2",
                type: "spot", 
                color: 0xffffff,
                intensity: 1,
                distance: 100,
                decay: 0,
                angle: 2.5,
                position: { x: 4, y: 0, z: 40 }
            },
            {
                id: "s12_ambient_light",
                type: "ambient",
                color: 0xffffff,
                intensity: 2
            }
        ],
        postProcessing: {
            bloom: { strength: 0.0, radius: 0.0, threshold: 1 },
            vignetteBlur: { 
                enabled: true,
                radiusX: 0.2,
                radiusY: 0.3,
                feather: 0.4,
                maxBlurRadius: 2.0,
                center: { x: 0.5, y: 0.5 }
            },
            gaussianBlur: { blurRadius: 0.9 }
        }
    },
    // NEW SCENE 13
    {
        id: "scene13_letsMessageIn",
        targetThreeSceneName: "scene12Specific", // Same macro scene as Scene 12
        anchorPositioning: {
            fromPrevious: true,
            transitionType: "cameraMove",
            placementRelativeToPreviousAnchor: {
                method: "offsetFromPrevious",
                offset: { x: 0, y: -3.6, z: 15 } // 15 units in z direction from Scene 12
            },
            cameraAnimationTarget: {
                targetNullIndex: 17, // Next available null index
                targetValues: { x: 0, y: 0, z: 25 }, // Match the offset
                duration: 1.88, // As requested
                ease: "power2.inOut"
            },
            overlapCalculationMode: "percentage",
            overlapValue: 0.30 // Standard overlap value
        },
        contentBlocks: [
            {
                id: "s13_main_text_block",
                type: "text",
                textConfigId: "s13_lets_message_in_phrase", // Reference to the text we added in textLibraryConfig.js
                position: { x: 0, y: 0, z: 0 },
                rotation: { x: -.34, y: 0, z: -.04 },
                scale: { x: 1, y: 1, z: 1 },
                isOcclusionMainObjectToCheck: true,
                startTextAnimationsAfterOverlap: true
            }
        ],
        postProcessing: {
            bloom: { strength: 0.0, radius: 0.0, threshold: 1 },
            vignetteBlur: { 
                enabled: true,
                radiusX: 0.2,
                radiusY: 0.3,
                feather: 0.4,
                maxBlurRadius: 2.0,
                center: { x: 0.5, y: 0.5 }
            },
            gaussianBlur: { blurRadius: 0.9 }
        }
    },
    // NEW SCENE 14
    {
        id: "scene14_notSalesPitch",
        targetThreeSceneName: "scene12Specific", // Same macro scene as Scenes 12 and 13
        anchorPositioning: {
            fromPrevious: true,
            transitionType: "cameraMove",
            placementRelativeToPreviousAnchor: {
                method: "offsetFromPrevious",
                offset: { x: 35, y: 8, z: 0 } // 25 units in x direction from Scene 13
            },
            cameraAnimationTarget: {
                targetNullIndex: 18, // Next available null index
                targetValues: { x: 35, y: 0, z: 0 }, // 25 units in x direction
                duration: 2.468, // 1.5 seconds as requested
                ease: "power2.inOut"
            },
            overlapCalculationMode: "percentage",
            overlapValue: 0.30 // Standard overlap value
        },
        contentBlocks: [
            {
                id: "s14_main_text_block",
                type: "text",
                textConfigId: "s14_not_sales_pitch_phrase", // Reference to the text we added in textLibraryConfig.js
                position: { x: 0, y: 0, z: 0 },
                rotation: { x: 0, y: 0, z: 0 },
                scale: { x: 1, y: 1, z: 1 },
                isOcclusionMainObjectToCheck: true,
                startTextAnimationsAfterOverlap: true
            }
        ],
        postProcessing: {} // No additional post-processing needed
    },
    // NEW SCENE 15 (Text-only)
    {
        id: "scene15_onceInside",
        targetThreeSceneName: "scene15Specific", // Use the new macro scene
        anchorPositioning: {
            fromPrevious: true,
            transitionType: "instant", // Instant transition as requested
            activationOffset: 0.55, // NEW: Cut half way through the scene
            placementRelativeToPreviousAnchor: {
                method: "offsetFromPrevious",
                offset: { x: 0, y: -5, z: 10 } // Z at 30 as requested
            },
            cameraAnimationTarget: {
                targetNullIndex: 19, // Next available null index
                targetValues: { x: 0, y: 0, z: 15 }, // Z at 45 as requested
                duration: 1.568, // 1.87 seconds as requested
                ease: "power2.inOut"
            },
            overlapCalculationMode: "percentage",
            overlapValue: 0.30
        },
        contentBlocks: [
            {
                id: "s15_main_text_block",
                type: "text",
                textConfigId: "s15_once_inside_phrase", // Will add this to textLibraryConfig.js
                position: { x: 0, y: 0, z: 0 },
                rotation: { x: 0, y: 0, z: 0 },
                scale: { x: 1, y: 1, z: 1 },
                isOcclusionMainObjectToCheck: true,
                startTextAnimationsAfterOverlap: true
            }
        ],
        lighting: [], // Removed all lighting
        postProcessing: {} // No additional post-processing needed
    },
    // NEW SCENE 16
    {
        id: "scene16_yourOfferUnfold",
        targetThreeSceneName: "scene15Specific", // Same parent scene as scene 15
        anchorPositioning: {
            fromPrevious: true,
            transitionType: "cameraMove",
            placementRelativeToPreviousAnchor: {
                method: "offsetFromPrevious",
                offset: { x: 0, y: -5, z: 90 } // Z offset of -50 relative to scene 15
            },
            cameraAnimationTarget: {
                targetNullIndex: 20, // Next available null index
                targetValues: { x: 0, y: -5, z: 75 }, // Z at 50 as requested
                duration: 1.196, // Duration of 1.6 as requested
                ease: "power2.inOut"
            },
            overlapCalculationMode: "percentage",
            overlapValue: 0.30
        },
        contentBlocks: [
            {
                id: "s16_main_text_block",
                type: "text",
                textConfigId: "s16_your_offer_unfold_phrase",
                position: { x: 0, y: -7.3, z: 0 },
                rotation: { x: 0, y: 0, z: 0 },
                scale: { x: 1, y: 1, z: 1 },
                isOcclusionMainObjectToCheck: true,
                startTextAnimationsAfterOverlap: true
            },
            {
                id: "s16_brain",
                type: "asset",
                assetConfigId: "human_brain",
                position: { x: 0, y: 0, z: 0 },
                rotation: { x: 0, y: 2.11, z: 0 },
                scale: { x: 1, y: 1, z: 1 },
                timelineAnimations: [
                    {
                        targetProperty: "rotation.x",
                        fromValue: 2,
                        targetValue: 0,
                        duration: 1.3,
                        ease: "power2.out",
                        startTime: 0.5

                    },
                    {
                        targetProperty: "rotation.y",
                        fromValue: 2.11,
                        targetValue: 1.48,
                        duration: 1.3,
                        ease: "power2.out",
                        startTime: 0.5
                    }
                ]
            }
        ],
        lighting: [
            {
                id: "s16_rim_light", 
                type: "spot",
                color: 0xffffff,
                intensity: 3,
                distance: 100,
                decay: 0,
                angle: 2.5,
                position: { x: 20, y: 18.6, z: 20 }
            },
            {
                id: "s16_rim_light_2",
                type: "spot", 
                color: 0xffffff,
                intensity: 1,
                distance: 100,
                decay: 0,
                angle: 2.5,
                position: { x: 4, y: 0, z: 40 }
            },
            {
                id: "s16_ambient_light",
                type: "ambient",
                color: 0xffffff,
                intensity: 2
            }
        ],
        postProcessing: {
            bloom: { strength: 0.34, radius: 0.7, threshold: 0.2 },
            vignetteBlur: { 
                enabled: true,
                radiusX: 0.2,
                radiusY: 0.3,
                feather: 0.4,
                maxBlurRadius: 2.0,
                center: { x: 0.5, y: 0.5 }
            },
            gaussianBlur: { blurRadius: 0.9 }
        },
        cameraMoves: [
            {
                targetValues: { y: -3 },
                duration: 1.68,
                ease: "power2.inOut",
                targetNullIndex: 21,
                overlapCalculationMode: "percentage",
                overlapValue: 0.30
            }
        ]
    },
    // NEW SCENE 17
    {
        id: "scene17_packagePitch",
        targetThreeSceneName: "scene17Specific", // Same parent scene as scenes 15 and 16
        anchorPositioning: {
            fromPrevious: true,
            transitionType: "mask",
            placementRelativeToPreviousAnchor: {
                method: "offsetFromPrevious",
                offset: { x: 30, y: 0, z: 0 } // 30 units in X direction from Scene 16
            },
            cameraAnimationTarget: {
                targetNullIndex: 22, // Next available null index
                targetValues: { x: 30, y: 0, z: 0 }, // Match the offset
                duration: 1.636, // Duration of 1.78 as requested
                ease: "power2.inOut"
            },
            maskParams: {
                shaderKey: "horizontalWipe",
                activationOffset: 0.35,
                duration: .3,
                ease: "power2.inOut",
                usesRenderTargets: true
            },
            overlapCalculationMode: "percentage", 
            overlapValue: 0.30
        },
        contentBlocks: [
            {
                id: "s17_main_text_block",
                type: "text",
                textConfigId: "s17_package_pitch_phrase",
                position: { x: 0, y: 0, z: 0 },
                rotation: { x: 0, y: 0, z: 0 },
                scale: { x: 1, y: 1, z: 1 },
                isOcclusionMainObjectToCheck: true,
                startTextAnimationsAfterOverlap: true
            }
        ],
        lighting: [], // No additional lighting needed
        postProcessing: {} // No additional post-processing needed
    },
    // NEW SCENE 18
    {
        id: "scene18_insideValue",
        targetThreeSceneName: "scene17Specific", // Scene 17 specific as requested
        anchorPositioning: {
            fromPrevious: true,
            transitionType: "cameraMove",
            placementRelativeToPreviousAnchor: {
                method: "offsetFromPrevious",
                offset: { x: 0, y: -50, z: 0 } // -50 camera offset as requested
            },
            cameraAnimationTarget: {
                targetNullIndex: 23, // Next available null index
                targetValues: { x: 0, y: -50, z: 0 }, // Match the offset
                duration: 1.30, // Duration of 1.32 as requested
                ease: "power2.inOut"
            },
            overlapCalculationMode: "percentage",
            overlapValue: 0.30
        },
        contentBlocks: [
            {
                id: "s18_main_text_block",
                type: "text",
                textConfigId: "s18_inside_value_phrase",
                position: { x: 0, y: 10, z: 0 }, // y=10 as requested
                rotation: { x: 0, y: 0, z: 0 },
                scale: { x: 1, y: 1, z: 1 },
                isOcclusionMainObjectToCheck: true,
                startTextAnimationsAfterOverlap: true
            },
            {
                id: "s18_diamond",
                type: "asset",
                assetConfigId: "gem", // Diamond asset as requested
                position: { x: 0, y: 0, z: 0 }, // Starting at y=-2
                rotation: { x: 0, y: 0, z: 0 }, // Starting at z=-1
                scale: { x: 1, y: 1, z: 1 },
                timelineAnimations: [
                    {
                        targetProperty: "rotation.z",
                        fromValue: -2,
                        targetValue: 0,
                        duration: 2.0, // 1 second as requested
                        ease: "power2.out",
                        startTime: 0
                    },
                    {
                        targetProperty: "rotation.y",
                        fromValue: -2,
                        targetValue: 2,
                        duration: 3.0, // 1 second as requested
                        ease: "power2.out",
                        startTime: 0
                    }
                ]
            }
        ],
        lighting: [
            {
                id: "s18_rim_light", 
                type: "spot",
                color: 0xffffff,
                intensity: 3,
                distance: 100,
                decay: 0,
                angle: 2.5,
                position: { x: 20, y: 18.6, z: 20 }
            },
            {
                id: "s18_rim_light_2",
                type: "spot", 
                color: 0xffffff,
                intensity: 1,
                distance: 100,
                decay: 0,
                angle: 2.5,
                position: { x: 4, y: 0, z: 40 }
            },
            {
                id: "s18_ambient_light",
                type: "ambient",
                color: 0xffffff,
                intensity: 10
            }
        ],
        postProcessing: {
            bloom: { strength: 0.34, radius: 0.7, threshold: 0.2 },
            vignetteBlur: { 
                enabled: true,
                radiusX: 0.2,
                radiusY: 0.3,
                feather: 0.4,
                maxBlurRadius: 2.0,
                center: { x: 0.5, y: 0.5 }
            },
            gaussianBlur: { blurRadius: 0.9 }
        }
    },
    // NEW SCENE 19
    {
        id: "scene19_andTheyll",
        targetThreeSceneName: "scene19Specific", // New macro scene
        anchorPositioning: {
            fromPrevious: true,
            transitionType: "instant", // Instant transition as requested
            activationOffset: 0.3, // Activation offset for instant transition
            placementRelativeToPreviousAnchor: {
                method: "offsetFromPrevious",
                offset: { x: 0, y: 0, z: 0 } // No difference in xyz values
            },
            cameraAnimationTarget: {
                targetNullIndex: 24, // Next available null index
                targetValues: { x: 0, y: 0, z: 0 }, // No difference in xyz values
                duration: 0.45, // Duration as requested
                ease: "power2.inOut"
            },
            overlapCalculationMode: "percentage",
            overlapValue: 0
        },
        contentBlocks: [
            {
                id: "s19_main_text_block",
                type: "text",
                textConfigId: "s19_and_theyll_phrase", // Text config for "and they'll"
                position: { x: 0, y: 0, z: 0 },
                rotation: { x: 0, y: 0, z: 0 },
                scale: { x: 1, y: 1, z: 1 },
                isOcclusionMainObjectToCheck: true,
                startTextAnimationsAfterOverlap: true
            }
                 ],
         lighting: [], // No additional lighting
         postProcessing: {
             bloom: { strength: 0.34, radius: 0.7, threshold: 0.2 },
             vignetteBlur: { 
                 enabled: true,
                 radiusX: 0.2,
                 radiusY: 0.3,
                 feather: 0.4,
                 maxBlurRadius: 2.0,
                 center: { x: 0.5, y: 0.5 }
             },
             gaussianBlur: { blurRadius: 0.9 }
         }
    },
    // NEW SCENE 20
    {
        id: "scene20_welcomeIt",
        targetThreeSceneName: "scene20Specific", // New macro scene
        anchorPositioning: {
            fromPrevious: true,
            transitionType: "instant", // Instant transition as requested
            activationOffset: 0, // Activation offset for instant transition
            placementRelativeToPreviousAnchor: {
                method: "offsetFromPrevious",
                offset: { x: 0, y: 0, z: 0 } // No difference in xyz values
            },
            cameraAnimationTarget: {
                targetNullIndex: 25, // Next available null index
                targetValues: { x: 0, y: 0, z: 0 }, // No difference in xyz values
                duration: 0.5, // Duration as requested
                ease: "power2.inOut"
            },
            overlapCalculationMode: "percentage",
            overlapValue: 0
        },
        contentBlocks: [
            {
                id: "s20_main_text_block",
                type: "text",
                textConfigId: "s20_welcome_it_phrase", // Text config for "welcome it"
                position: { x: 0, y: 0, z: 0 },
                rotation: { x: 0, y: 0, z: 0 },
                scale: { x: 1, y: 1, z: 1 },
                isOcclusionMainObjectToCheck: true,
                startTextAnimationsAfterOverlap: true
            }
        ],
        lighting: [], // No additional lighting
        postProcessing: {
            bloom: { strength: 0.34, radius: 0.7, threshold: 0.2 },
            vignetteBlur: { 
                enabled: true,
                radiusX: 0.2,
                radiusY: 0.3,
                feather: 0.4,
                maxBlurRadius: 2.0,
                center: { x: 0.5, y: 0.5 }
            },
            gaussianBlur: { blurRadius: 0.9 }
        }
    },
    // NEW SCENE 21
    {
        id: "scene21_in",
        targetThreeSceneName: "scene21Specific", // New macro scene
        anchorPositioning: {
            fromPrevious: true,
            transitionType: "instant", // Instant transition as requested
            activationOffset: 0, // Activation offset for instant transition
            placementRelativeToPreviousAnchor: {
                method: "offsetFromPrevious",
                offset: { x: 0, y: 0, z: 0 } // No difference in xyz values
            },
            cameraAnimationTarget: {
                targetNullIndex: 26, // Next available null index
                targetValues: { x: 0, y: 0, z: 0 }, // No difference in xyz values
                duration: .5, // Duration as requested
                ease: "power2.inOut"
            },
            overlapCalculationMode: "percentage",
            overlapValue: 0
        },
        contentBlocks: [
            {
                id: "s21_main_text_block",
                type: "text",
                textConfigId: "s21_in_phrase", // Text config for "in"
                position: { x: 0, y: 0, z: 0 },
                rotation: { x: 0, y: 0, z: 0 },
                scale: { x: 1, y: 1, z: 1 },
                isOcclusionMainObjectToCheck: true,
                startTextAnimationsAfterOverlap: true
            }
            ],
         lighting: [], // No additional lighting
         postProcessing: {
             bloom: { strength: 0.34, radius: 0.7, threshold: 0.2 },
             vignetteBlur: { 
                 enabled: true,
                 radiusX: 0.2,
                 radiusY: 0.3,
                 feather: 0.4,
                 maxBlurRadius: 2.0,
                 center: { x: 0.5, y: 0.5 }
             },
             gaussianBlur: { blurRadius: 0.9 }
         }
    },
    // NEW SCENE 22
    {
        id: "scene22_marketingPsychology",
        targetThreeSceneName: "scene22Specific", // New macro scene
        anchorPositioning: {
            fromPrevious: true,
            transitionType: "instant", // Instant transition as requested
            activationOffset: 0, // Activation offset for instant transition
            placementRelativeToPreviousAnchor: {
                method: "offsetFromPrevious",
                offset: { x: 0, y: 0, z: 0 } // No difference in xyz values
            },
            cameraAnimationTarget: {
                targetNullIndex: 27, // Next available null index
                targetValues: { x: 0, y: 0, z: 0 }, // No difference in xyz values
                duration: 1.5, // Duration as requested
                ease: "power2.inOut"
            },
            overlapCalculationMode: "percentage",
            overlapValue: 0
        },
        contentBlocks: [
            {
                id: "s22_main_text_block",
                type: "text",
                textConfigId: "s22_marketing_psychology_phrase", // Text config for "marketing psychology series"
                position: { x: 0, y: 0, z: 0 }, // Y position decreased by 5 (from +5 to 0)
                rotation: { x: 0, y: 0, z: 0 },
                scale: { x: 1, y: 1, z: 1 },
                isOcclusionMainObjectToCheck: true,
                startTextAnimationsAfterOverlap: true
            },
            {
                id: "s22_handle_text_block",
                type: "text",
                textConfigId: "s22_collins_ecom_phrase", // Text config for "@collins.ecom"
                position: { x: 0, y: -20, z: 0 }, // Y position decreased by 10 (from -10 to -20)
                rotation: { x: 0, y: 0, z: 0 },
                scale: { x: 1, y: 1, z: 1 },
                isOcclusionMainObjectToCheck: false, // Secondary text
                startTextAnimationsAfterOverlap: true
            }
        ],
        lighting: [], // No additional lighting,
        cameraMoves: [
            {
                targetValues: { z: 1 },
                duration: 2,
                ease: "power2.inOut",
                targetNullIndex: 28,
            }
        ],
        postProcessing: {
            bloom: { strength: 0.34, radius: 0.7, threshold: 0.2 },
            vignetteBlur: { 
                enabled: true,
                radiusX: 0.2,
                radiusY: 0.3,
                feather: 0.4,
                maxBlurRadius: 2.0,
                center: { x: 0.5, y: 0.5 }
            },
            gaussianBlur: { blurRadius: 0.9 }
        }
    }
];