import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import * as THREE from 'three'; // For TextureLoader

const gltfLoader = new GLTFLoader(); // Single instance for loading
const fontLoader = new FontLoader();
const textureLoader = new THREE.TextureLoader();
export const assetCache = new Map(); // Cache: url -> original loaded asset (e.g., GLTF.scene)

const uniqueAssetUrls = {
    gltf: new Set(),
    font: new Set(),
    texture: new Set(),
};

const VALID_TYPES = new Set(['gltf', 'font', 'texture']);

/**
 * Register an asset URL for preloading. Assets are only loaded once even if registered multiple times.
 * @param {string} url - The URL of the asset to preload
 * @param {string} type - The type of asset ('gltf', 'font', 'texture')
 */
export function registerAssetForPreload(url, type) {
    if (!url) {
        console.warn('[PreloadManager] Attempted to register asset with empty URL');
        return;
    }

    // ―― "Crash at frame-0, not 10 000" ―― J.C.
    if (!VALID_TYPES.has(type)) {
        throw new Error(
            `[PreloadManager] Unknown asset type "${type}" for url "${url}". ` +
            `Expected one of ${Array.from(VALID_TYPES).join(', ')}`
        );
    }

    console.log(`[PreloadManager DEBUG] Attempting to register asset: Type: ${type}, URL: ${url}`);

    if (type === 'gltf') {
        uniqueAssetUrls.gltf.add(url);
        console.log(`[PreloadManager DEBUG] Registered GLTF: ${url}. Current unique GLTFs:`, Array.from(uniqueAssetUrls.gltf));
    } else if (type === 'font') {
        uniqueAssetUrls.font.add(url);
        console.log(`[PreloadManager DEBUG] Registered Font: ${url}. Current unique Fonts:`, Array.from(uniqueAssetUrls.font));
    } else if (type === 'texture') {
        uniqueAssetUrls.texture.add(url);
        console.log(`[PreloadManager DEBUG] Registered Texture: ${url}. Current unique Textures:`, Array.from(uniqueAssetUrls.texture));
    }
}

/**
 * Load all registered assets and cache them. Updates progress in the provided element if any.
 * @param {HTMLElement} [loadingProgressElement] - Optional element to update with loading progress
 */
export async function loadRegisteredAssets(loadingProgressElement) {
    const gltfUrlsToLoad = Array.from(uniqueAssetUrls.gltf);
    const fontUrlsToLoad = Array.from(uniqueAssetUrls.font);
    const textureUrlsToLoad = Array.from(uniqueAssetUrls.texture);
    const totalToLoad = gltfUrlsToLoad.length + fontUrlsToLoad.length + textureUrlsToLoad.length;
    let loadedCount = 0;
    let currentPhase = "assets";

    if (totalToLoad === 0) {
        console.log('[PreloadManager] No assets registered for preloading.');
        if (loadingProgressElement) loadingProgressElement.textContent = '';
        return;
    }

    console.log(`[PreloadManager] Starting preload of ${totalToLoad} unique asset(s).`);
    console.log('[PreloadManager DEBUG] URLs to load:');
    console.log('[PreloadManager DEBUG]   GLTFs:', gltfUrlsToLoad);
    console.log('[PreloadManager DEBUG]   Fonts:', fontUrlsToLoad);
    console.log('[PreloadManager DEBUG]   Textures:', textureUrlsToLoad);
    if (loadingProgressElement) loadingProgressElement.textContent = `(${currentPhase} 0/${totalToLoad})`;

    currentPhase = "GLTFs";
    for (const url of gltfUrlsToLoad) {
        if (!assetCache.has(url)) {
            try {
                console.log(`[PreloadManager] Loading GLTF: ${url}`);
                const gltf = await gltfLoader.loadAsync(url);
                // Store the scene which can be cloned, not the raw GLTF
                assetCache.set(url, gltf.scene);
                console.log(`[PreloadManager DEBUG] Cached GLTF scene: ${url}`, gltf.scene);
            } catch (error) {
                console.error(`[PreloadManager] Failed to load GLTF: ${url}`, error);
                throw error;
            }
        }
        loadedCount++;
        if (loadingProgressElement) {
            loadingProgressElement.textContent = `(${currentPhase} ${loadedCount}/${totalToLoad})`;
        }
    }

    currentPhase = "Fonts";
    for (const url of fontUrlsToLoad) {
        const isJsonFont = url.trim().toLowerCase().endsWith('.json');

        // Skip binary OTF/TTF — Troika will fetch and cache them on demand
        if (!isJsonFont) {
            console.log(`[PreloadManager] Skipping binary font preload: ${url}`);
            loadedCount++;
            if (loadingProgressElement) {
                loadingProgressElement.textContent =
                    `(${currentPhase} ${loadedCount}/${totalToLoad})`;
            }
            continue;
        }

        if (!assetCache.has(url)) {
            try {
                console.log(`[PreloadManager] Loading Font JSON: ${url}`);
                const font = await fontLoader.loadAsync(url);
                assetCache.set(url, font);
                console.log(`[PreloadManager DEBUG] Cached Font JSON: ${url}`, font);
            } catch (error) {
                console.error(`[PreloadManager] Failed to load Font JSON: ${url}`, error);
                throw error;
            }
        }
        loadedCount++;
        if (loadingProgressElement) {
            loadingProgressElement.textContent =
                `(${currentPhase} ${loadedCount}/${totalToLoad})`;
        }
    }

    currentPhase = "Textures";
    for (const url of textureUrlsToLoad) {
        if (!assetCache.has(url)) {
            try {
                console.log(`[PreloadManager] Loading Texture: ${url}`);
                const texture = await textureLoader.loadAsync(url);
                assetCache.set(url, texture);
                console.log(`[PreloadManager DEBUG] Cached Texture: ${url}`, texture);
            } catch (error) {
                console.error(`[PreloadManager] Failed to load Texture: ${url}`, error);
                throw error;
            }
        }
        loadedCount++;
        if (loadingProgressElement) {
            loadingProgressElement.textContent = `(${currentPhase} ${loadedCount}/${totalToLoad})`;
        }
    }

    console.log('[PreloadManager] All registered assets preloaded successfully.');
    console.log('[PreloadManager DEBUG] Final assetCache contents:', Array.from(assetCache.entries()));
} 