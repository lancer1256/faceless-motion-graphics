import { core } from '../coreContext.js';
import { resolveSceneContentRelationshipsAndSizing } from '../utils/sceneContentFactory.js';

export async function createContentFromConfig(scenesConfig, textLibrary, assetLibrary, SHOW_GUI, loadedGltfCache, createTextForSceneContentBlock, createAssetForSceneContentBlock) {
    const contentCreationPromises = [];

    for (const sceneConfig of scenesConfig) {
        const parentAnchor = core.sceneAnchors[sceneConfig.id];
        if (!parentAnchor) {
            console.error(`[ContentCreation] Anchor not found for scene ID: ${sceneConfig.id}. Skipping content creation for this scene.`);
            continue;
        }

        const factoryDependencies = {
            SHOW_GUI: SHOW_GUI,
            loadedGltfCache: loadedGltfCache
        };

        if (sceneConfig.contentBlocks) {
            for (const blockConfig of sceneConfig.contentBlocks) {
                if (blockConfig.type === "text") {
                    const textLibEntry = textLibrary[blockConfig.textConfigId];
                    if (SHOW_GUI) { 
                        console.log(`%c[ContentCreation - Text] For '${blockConfig.id}' in scene '${sceneConfig.id}', textLibEntry:`, 'color: fuchsia', textLibEntry, 'blockConfig:', JSON.parse(JSON.stringify(blockConfig)));
                    }
                    if (!textLibEntry) {
                        console.error(`[ContentCreation - Text] textLibrary entry not found for id: ${blockConfig.textConfigId} in block ${blockConfig.id}. Skipping.`);
                        continue;
                    }
                    contentCreationPromises.push(
                        createTextForSceneContentBlock(textLibEntry, blockConfig, parentAnchor, factoryDependencies)
                    );
                } else if (blockConfig.type === "asset") {
                    const assetLibEntry = assetLibrary[blockConfig.assetConfigId];
                    if (SHOW_GUI) { 
                        console.log(`%c[ContentCreation - Asset] For '${blockConfig.id}' in scene '${sceneConfig.id}', assetLibEntry:`, 'color: fuchsia', assetLibEntry, 'blockConfig:', JSON.parse(JSON.stringify(blockConfig)));
                    }
                    if (!assetLibEntry) {
                        console.error(`[ContentCreation - Asset] assetLibrary entry not found for id: ${blockConfig.assetConfigId} in block ${blockConfig.id}. Skipping.`);
                        continue;
                    }
                    contentCreationPromises.push(
                        createAssetForSceneContentBlock(assetLibEntry, blockConfig, parentAnchor, factoryDependencies)
                    );
                }
            }
        }
    }
    await Promise.all(contentCreationPromises);
    if (SHOW_GUI) console.log('%c[ContentCreation] All initial mesh/group creation promises resolved.', 'color:mediumseagreen');

    if (SHOW_GUI) console.log("[ContentCreation] Resolving content parenting and dynamic sizing...");
    for (const sceneConfig of scenesConfig) {
        const sceneAnchor = core.sceneAnchors[sceneConfig.id];
        if (sceneAnchor) {
            await resolveSceneContentRelationshipsAndSizing(sceneConfig, SHOW_GUI, sceneAnchor);
        } else {
            if (SHOW_GUI) console.warn(`[ContentCreation] Scene anchor not found for ${sceneConfig.id} during sizing pass.`);
        }
    }
    if (SHOW_GUI) console.log('%c[ContentCreation] Content parenting and dynamic sizing complete.', 'color:mediumseagreen');
} 