import { findWordSequence, getRelativeTiming } from '../utils/transcriptUtils.js';

export function calculateAllSceneDurations(scenesConfig, allTranscriptWords, textLibrary) {
    scenesConfig.forEach(sc => {
        if (sc.transcriptWords && sc.transcriptWords.length > 0) {
            // If transcriptWords are already populated (e.g. by loadAndPrepareTranscriptData directly from main phrase)
            // we still need to calculate the duration if it wasn't done there.
            if (sc.calculatedContentDuration === undefined) {
                const timing = getRelativeTiming(sc.transcriptWords);
                sc.calculatedContentDuration = timing.totalDur;
            }
        } else if (sc.textConfig && sc.textConfig.phrase) { 
            // This case might be redundant if loadAndPrepareTranscriptData always handles the primary phrase
            // but kept for safety or if a scene might define a phrase without direct transcript mapping initially.
            const phraseWords = sc.textConfig.phrase.replace(/\n/g, ' ').split(" ");
            sc.transcriptWords = findWordSequence(phraseWords, allTranscriptWords);
            if (sc.transcriptWords && sc.transcriptWords.length > 0) {
                const timing = getRelativeTiming(sc.transcriptWords);
                sc.calculatedContentDuration = timing.totalDur;
            } else {
                sc.calculatedContentDuration = 1.0; // Default content duration if no transcript words found for phrase
            }
        } else {
             // If a scene has no transcriptWords from loadAndPrepareTranscriptData and no textConfig.phrase,
            // it might rely on a manually set duration or default. 
            // Ensure calculatedContentDuration has a fallback.
            if (sc.calculatedContentDuration === undefined) {
                 sc.calculatedContentDuration = 1.0; // Default content duration
            }
            // Ensure transcriptWords is an empty array if not populated
            if (!sc.transcriptWords) {
                sc.transcriptWords = [];
            }
        }
    });
} 