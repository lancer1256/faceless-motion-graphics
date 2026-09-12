// src/config/assetLibraryConfig.js

const MONEY_ROTATION_PRESET = { x: 1.21265476428566, y: -1.49539810310874, z: -0.257610597594363 };

export const assetLibrary = {
    "sword_animated_left": { // Unique ID for this asset configuration
        nameInScene: "SwordAnimatedLeft_from_lib", // For debugging or specific targeting
        type: "gltf", // Explicitly define type
        modelSrc: './assets/low_poly_stack_of_money.glb', // Assuming sword is this model
        refSrc: './assets/low_poly_stack_of_money.glb',   // For scaling reference
        // baseProperties define the intrinsic look/feel of this asset type
        baseProperties: {
            rotation: MONEY_ROTATION_PRESET, // Base rotation for this type of asset
            scaleRelativeToRef: 1, // Default scale factor for this type
            brightnessBoost: 1.0 // Example: no boost for this one
        }
    },
    "sword_animated_right": {
        nameInScene: "SwordAnimatedRight_from_lib",
        type: "gltf",
        modelSrc: './assets/low_poly_stack_of_money.glb',
        refSrc: './assets/low_poly_stack_of_money.glb',
        baseProperties: {
            rotation: MONEY_ROTATION_PRESET,
            scaleRelativeToRef: 1,
            brightnessBoost: 1.0
        }
    },
    "sword_static_1": { // For the non-animated swords
        nameInScene: "SwordStatic1_from_lib",
        type: "gltf",
        modelSrc: './assets/low_poly_stack_of_money.glb',
        refSrc: './assets/low_poly_stack_of_money.glb',
        baseProperties: {
            rotation: MONEY_ROTATION_PRESET,
            scaleRelativeToRef: 1.3,
            brightnessBoost: 1.0
        }
    },
    "sword_static_2": { // Renamed for clarity if it's a distinct type
        nameInScene: "SwordStatic2_from_lib",
        type: "gltf",
        modelSrc: './assets/low_poly_stack_of_money.glb',
        refSrc: './assets/low_poly_stack_of_money.glb',
        baseProperties: {
            rotation: MONEY_ROTATION_PRESET,
            scaleRelativeToRef: 1.3,
            brightnessBoost: 1.0
        }
    },
    "statue_checkmark_style": { // A generic type for the checkmark-like statues
        nameInScene: "StatueCheckmark_from_lib",
        type: "gltf",
        modelSrc: './assets/checkmark.glb',
        refSrc: './assets/checkmark.glb',
        baseProperties: {
            scaleRelativeToRef: 1.0,
            brightnessBoost: 1.0
        }
    },
    "dollar_sign_in_circle": {
        nameInScene: "DollarSignInCircle_from_lib",
        type: "gltf",
        modelSrc: './assets/dollar.glb',
        refSrc: './assets/checkmark.glb',
        baseProperties: {
            scaleRelativeToRef: 1.0,
            brightnessBoost: 1.0,
            color: 0x61f092
        }
    },
    "cake": {
        nameInScene: "Cake_from_lib",
        type: "gltf",
        modelSrc: './assets/mach/cake.glb',
        refSrc: './assets/checkmark.glb',
        baseProperties: {
            scaleRelativeToRef: 1.0,
            brightnessBoost: 1.0
        }
    },
    "church_cross": {
        nameInScene: "ChurchCross_from_lib",
        type: "gltf",
        modelSrc: './assets/mach/church_cross.glb',
        refSrc: './assets/checkmark.glb',
        baseProperties: {
            scaleRelativeToRef: 1.0,
            brightnessBoost: 1.0
        }
    },
    "theater_masks_comedy_tragedy": {
        nameInScene: "TheaterMasksComedyTragedy_from_lib",
        type: "gltf",
        modelSrc: './assets/mach/happy_and_sad_theater_masks_comedy_and_tragedy.glb',
        refSrc: './assets/checkmark.glb',
        baseProperties: {
            scaleRelativeToRef: 1.0,
            brightnessBoost: 1.0
        }
    },
    "heart": {
        nameInScene: "Heart_from_lib",
        type: "gltf",
        modelSrc: './assets/mach/heart.glb',
        refSrc: './assets/checkmark.glb',
        baseProperties: {
            scaleRelativeToRef: 1.0,
            brightnessBoost: 1.0
        }
    },
    "hourglass": {
        nameInScene: "Hourglass_from_lib",
        type: "gltf",
        modelSrc: './assets/mach/hourglass.glb',
        refSrc: './assets/checkmark.glb',
        baseProperties: {
            scaleRelativeToRef: 1.0,
            brightnessBoost: 1.0
        }
    },
    "jester_hat_style_c": {
        nameInScene: "JesterHatStyleC_from_lib",
        type: "gltf",
        modelSrc: './assets/mach/jester_hat_style_c.glb',
        refSrc: './assets/checkmark.glb',
        baseProperties: {
            scaleRelativeToRef: 1.0,
            brightnessBoost: 1.0
        }
    },
    "old_book": {
        nameInScene: "OldBook_from_lib",
        type: "gltf",
        modelSrc: './assets/mach/old_book.glb',
        refSrc: './assets/checkmark.glb',
        baseProperties: {
            scaleRelativeToRef: 1.0,
            brightnessBoost: 1.0
        }
    },
    "diamond": {
        nameInScene: "Diamond_from_lib",
        type: "gltf",
        modelSrc: './assets/diamond.glb',
        refSrc: './assets/checkmark.glb',
        baseProperties: {
            scaleRelativeToRef: 1.0,
            brightnessBoost: 1.0
        }
    },
    "gem": {
        nameInScene: "Gem_from_lib", 
        type: "gltf",
        modelSrc: './assets/gem.glb',
        refSrc: './assets/checkmark.glb',
        baseProperties: {
            scaleRelativeToRef: 2,
            brightnessBoost: 1.0
        }
    },
    "human_brain": {
        nameInScene: "HumanBrain_from_lib",
        type: "gltf",
        modelSrc: './assets/human-brain/source/brain.glb',
        refSrc: './assets/checkmark.glb',
        baseProperties: {
            scaleRelativeToRef: 2.0,
            brightnessBoost: 1.0,
            materialOverride: {
                type: "custom",
                textureSrc: './assets/human-brain/textures/gltf_embedded_0.png',
            }
        }
    },
    "panzer_tank": {
        nameInScene: "PanzerTank_from_lib",
        type: "gltf",
        modelSrc: './assets/panzer_tank.glb',
        refSrc: './assets/checkmark.glb',
        baseProperties: {
            scaleRelativeToRef: 1.0,
            brightnessBoost: 1.0
        }
    },
    "pistol": {
        nameInScene: "Pistol_from_lib",
        type: "gltf",
        modelSrc: './assets/pistol.glb',
        refSrc: './assets/checkmark.glb',
        baseProperties: {
            scaleRelativeToRef: 1.0,
            brightnessBoost: 1.0
        }
    },
    "roman_coin": {
        nameInScene: "RomanCoin_from_lib",
        type: "gltf",
        modelSrc: './assets/roman_coin.glb',
        refSrc: './assets/checkmark.glb',
        baseProperties: {
            scaleRelativeToRef: 1.0,
            brightnessBoost: 1.0
        }
    },
    "trojan_horse": {
        nameInScene: "TrojanHorse_from_lib",
        type: "gltf",
        modelSrc: './assets/trojan_horse.glb',
        refSrc: './assets/checkmark.glb',
        baseProperties: {
            scaleRelativeToRef: 1.0,
            brightnessBoost: 1.0,
            materialOverride: {
                type: "gold",
                textureSrc: './assets/gold_texture.gltf'
            }
        }
    },
    "wooden_trojan_horse": {
        nameInScene: "WoodenTrojanHorse_from_lib",
        type: "gltf",
        modelSrc: './assets/trojan_horse.glb',
        refSrc: './assets/checkmark.glb',
        baseProperties: {
            scaleRelativeToRef: 2.0,
            brightnessBoost: 1.0,
            materialOverride: {
                type: "wood",
                textureSrc: './assets/wood_texture/wooden_gate_1k.gltf'
            }
        }
    },
    "emoji_nerd": {
        nameInScene: "NerdEmoji_from_lib",
        type: "imageSprite", // Different type
        textureSrc: './assets/nerd.png',
        baseProperties: {
            // Scale is defined per instance in contentBlocks for emojis
            // No refSrc or brightnessBoost typically needed for sprites
        }
    },
    "emoji_crazy": {
        nameInScene: "CrazyEmoji_from_lib",
        type: "imageSprite",
        textureSrc: './assets/crazy.png',
        baseProperties: {}
    },
    "emoji_clown": {
        nameInScene: "ClownEmoji_from_lib",
        type: "imageSprite",
        textureSrc: './assets/clown.png',
        baseProperties: {}
    },
    "christmas_stocking": {
        nameInScene: "ChristmasStocking_from_lib",
        type: "gltf",
        modelSrc: './assets/christmas_sock.glb',
        refSrc: './assets/checkmark.glb',
        baseProperties: {
            scaleRelativeToRef: 2,
            brightnessBoost: 1.0
        }
    },
    "human_brain_cloud": {
        nameInScene: "HumanBrainCloud_from_lib",
        type: "gltf",
        modelSrc: './assets/brain_point_cloud.glb',
        refSrc: './assets/checkmark.glb',
        baseProperties: {
            scaleRelativeToRef: 2.0,
            brightnessBoost: 1.0
        }
    },
    "physicalGlassCard_default": { // A default style for physical glass cards
        nameInScene: "PhysicalGlassCard_from_lib",
        type: "physicalGlassCard", // NEW TYPE
        baseProperties: {
            // --- MeshPhysicalMaterial Properties ---
            glassColor: 0xffffff,
            glassRoughness: 0.3,
            glassMetalness: 0.0,
            glassTransmission: 1.0,
            glassThickness: 0.0, // Set to 0 for thin, sharp look as requested
            glassIOR: 2.3,
            glassOpacity: 1.0, // Fully opaque material, transparency via transmission
            envMapIntensity: 1.0,
            specularIntensity: 0.1,

            // --- Geometry Properties ---
            cornerRadiusFactor: 0.12, // Relative to min(width, height)
            padding: { top: 0.2, right: 0.3, bottom: 0.2, left: 0.3 }, // Default padding in world units if auto-sizing
            // Default fixed size if not auto-sizing and no instance override
            defaultWidth: 18.0,
            defaultHeight: 7.0,

            // --- Border Properties ---
            borderEnabled: true,
            borderColor: 0x00ff00, // Green
            borderZOffset: 0.005,   // Slight offset
        }
    }
    // Add other asset configurations here later (statues, emojis)
};