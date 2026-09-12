import { findWordSequence } from '../utils/transcriptUtils.js';

export async function loadAndPrepareTranscriptData(scenesConfig, textLibrary, loadingProgressElement, SHOW_GUI) {
    let allTranscriptWords = [];
    try {
        const response = await fetch('./sell_online_transcript.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const transcriptJSON = await response.json();
        console.log('Loaded transcript:', transcriptJSON);
        
        if (transcriptJSON && transcriptJSON.results &&
            transcriptJSON.results.channels && transcriptJSON.results.channels[0] &&
            transcriptJSON.results.channels[0].alternatives && transcriptJSON.results.channels[0].alternatives[0] &&
            transcriptJSON.results.channels[0].alternatives[0].words) {
            allTranscriptWords = transcriptJSON.results.channels[0].alternatives[0].words;
            console.log('Extracted words:', allTranscriptWords);
            if (loadingProgressElement) loadingProgressElement.textContent = 'Transcript loaded';

            for (const sceneConfig of scenesConfig) {
                let mainTimingPhrase = null;
                let mainTimingPhraseWords = [];

                if (sceneConfig.contentBlocks && sceneConfig.contentBlocks.length > 0) {
                    const mainTextBlockConfig = sceneConfig.contentBlocks.find(cb => cb.type === "text");
                    if (mainTextBlockConfig && mainTextBlockConfig.textConfigId) {
                        const textLibEntry = textLibrary[mainTextBlockConfig.textConfigId];
                        if (textLibEntry) {
                            if (typeof textLibEntry.phrase === 'string') {
                                mainTimingPhrase = textLibEntry.phrase;
                            } else if (Array.isArray(textLibEntry.lines)) {
                                // Handle the 'lines' array format
                                mainTimingPhrase = textLibEntry.lines.map(line => {
                                    if (typeof line === 'string') return line; // Should not happen with current schema, but good fallback
                                    if (line && typeof line.text === 'string') return line.text;
                                    return ''; // Or handle error/warning
                                }).join('\n'); // Join lines as they were originally, then replace \n with space
                            }
                        }
                    }
                }

                if (mainTimingPhrase) {
                    mainTimingPhraseWords = mainTimingPhrase.replace(/\n/g, ' ').split(" ");
                    sceneConfig.transcriptWords = findWordSequence(mainTimingPhraseWords, allTranscriptWords);

                    if (sceneConfig.transcriptWords.length !== mainTimingPhraseWords.length) {
                        console.error(`Failed to find/match transcript for scene "${sceneConfig.id}" (main phrase: "${mainTimingPhraseWords.join(' ')}"). Found ${sceneConfig.transcriptWords.length}/${mainTimingPhraseWords.length} words.`);
                    }
                    if (SHOW_GUI) console.log(`%c[Init Transcript] Scene ${sceneConfig.id}: Processed main timing phrase, found ${sceneConfig.transcriptWords?.length} words.`, 'color:teal');
                } else {
                    console.warn(`Scene "${sceneConfig.id}" has no main text block with a phrase defined for duration calculation. Default duration will be used.`);
                    sceneConfig.transcriptWords = [];
                }

                if (sceneConfig.transcriptMappings && sceneConfig.transcriptMappings.length > 0) {
                    sceneConfig.transcriptMappings.forEach(mapping => {
                        if (mapping.contentBlockId && mapping.phraseWordsFromTextConfig) {
                            if (SHOW_GUI) console.log(`%c[Init Transcript] Scene ${sceneConfig.id}: Would process mapping for ${mapping.contentBlockId}`, 'color:teal');
                        }
                    });
                }
            }
        } else {
            throw new Error("Transcript data not found or in unexpected format.");
        }
        return allTranscriptWords;
    } catch (error) {
        console.error("Error loading or parsing transcript:", error);
        if (loadingProgressElement) loadingProgressElement.parentElement.textContent = 'Error loading transcript!'; // Update parent to remove progress span
        throw error; // Re-throw the error to be caught by the caller in init()
    }
} 