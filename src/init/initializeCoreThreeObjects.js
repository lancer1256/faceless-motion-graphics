import * as THREE from 'three';
import { fourCornerGradientVertexShader, fourCornerGradientFragmentShader } from '../shaders/fourCornerGradientShader.js';
import { vignetteVertexShader, vignetteFragmentShader } from '../shaders/vignetteBackgroundShader.js';
import { core, initializeCoreContextParts } from '../coreContext.js';
import { macroScenesConfig } from '../config/sceneSequenceConfig.js';

export function setupCoreThreeObjects(container) {
    // Create all scenes defined in macroScenesConfig
    const threeSceneObjects = {};
    let gradientUniforms = null;
    
    // Create all scenes from config
    macroScenesConfig.forEach(sceneConfig => {
        const scene = new THREE.Scene();
        scene.name = sceneConfig.name;
        
        // Set background based on configuration
        if (sceneConfig.background) {
            if (sceneConfig.background.type === "color" && sceneConfig.background.color !== null) {
                scene.background = new THREE.Color(sceneConfig.background.color);
            }
            else if (sceneConfig.background.type === "shader") {
                // Different shader types can be handled here
                if (sceneConfig.background.shader === "fourCornerGradient") {
                    // Extract colors from config or use defaults
                    const colors = sceneConfig.background.config || {};
                    
                    // Setup gradient background
                    gradientUniforms = {
                        uTime: { value: 0.0 },
                        uColorTopLeft: { value: new THREE.Color(colors.topLeft || 0x006600) },
                        uColorTopRight: { value: new THREE.Color(colors.topRight || 0x005000) },
                        uColorBottomLeft: { value: new THREE.Color(colors.bottomLeft || 0x004000) },
                        uColorBottomRight: { value: new THREE.Color(colors.bottomRight || 0x004000) }
                    };
                    
                    const backgroundPlaneGeometry = new THREE.PlaneGeometry(2, 2);
                    const backgroundMaterial = new THREE.ShaderMaterial({
                        vertexShader: fourCornerGradientVertexShader,
                        fragmentShader: fourCornerGradientFragmentShader,
                        uniforms: gradientUniforms,
                        depthWrite: false,
                        depthTest: false
                    });    
                    const backgroundPlane = new THREE.Mesh(backgroundPlaneGeometry, backgroundMaterial);
                    backgroundPlane.renderOrder = -9999;
                    backgroundPlane.frustumCulled = false;
                    backgroundPlane.name = "gradientBackgroundPlane";
                    
                    // Add background plane to this scene
                    scene.add(backgroundPlane);
                }
                else if (sceneConfig.background.shader === "vignette") {
                    const cfg = sceneConfig.background.config || {};
                    const vignetteUniforms = {
                        uColor: { value: new THREE.Color(cfg.color ?? 0xffffff) },
                        uRadius: { value: cfg.radius ?? 0.45 },
                        uDarkening: { value: cfg.darkening ?? 0.15 },
                        uFeather: { value: cfg.feather ?? 0.5 }
                    };

                    const bgPlaneGeometry = new THREE.PlaneGeometry(2, 2);
                    const bgMaterial = new THREE.ShaderMaterial({
                        vertexShader: vignetteVertexShader,
                        fragmentShader: vignetteFragmentShader,
                        uniforms: vignetteUniforms,
                        depthWrite: false,
                        depthTest: false
                    });

                    const bgPlane = new THREE.Mesh(bgPlaneGeometry, bgMaterial);
                    bgPlane.renderOrder = -9999;
                    bgPlane.frustumCulled = false;
                    bgPlane.name = "vignetteBackgroundPlane";

                    scene.add(bgPlane);
                }
                // Other shader types could be added here
            }
        }
        
        // Add to threeSceneObjects collection
        threeSceneObjects[sceneConfig.id] = scene;
    });

    const camera = new THREE.PerspectiveCamera(
        50,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);

    // --- Conditional Pixel Ratio ---
    const params = new URLSearchParams(window.location.search);
    const isDeterministicOutputMode = params.get('deterministicOutput') === 'true' || window.FORCE_DETERMINISTIC_OUTPUT === true;

    let currentPixelRatio;
    if (isDeterministicOutputMode) {
        currentPixelRatio = 1;
        console.log("[Init] Deterministic Output Mode: pixelRatio forced to 1.");
    } else {
        currentPixelRatio = window.devicePixelRatio || 1; // Fallback to 1 if undefined
        console.log(`[Init] User Display Mode: pixelRatio = ${currentPixelRatio}.`);
    }
    renderer.setPixelRatio(currentPixelRatio);
    // --- End Conditional Pixel Ratio ---

    container.appendChild(renderer.domElement);
    renderer.autoUpdate = false; // CARMACK: Set once and never change
    renderer.outputColorSpace = THREE.SRGBColorSpace; // NEW: Ensure consistent output color space
    renderer.toneMapping = THREE.NoToneMapping; // NEW: Use no tone mapping for raw output, or a consistent one like THREE.ACESFilmicToneMapping

    initializeCoreContextParts({
        renderer: renderer,
        camera: camera,
        threeSceneObjects: threeSceneObjects,
        gradientUniforms: gradientUniforms, // Will be null if no gradient shader is used
    });
} 