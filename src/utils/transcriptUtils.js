// Helper function to find a sequence of words in the transcript
export function findWordSequence(wordsToFind, allWords) {
    if (!wordsToFind || wordsToFind.length === 0) {
        console.warn('findWordSequence: No words to find');
        return [];
    }
    if (!allWords || !Array.isArray(allWords)) {
        console.error('findWordSequence: Invalid allWords array:', allWords);
        return [];
    }
    console.log('findWordSequence searching for:', wordsToFind, 'in:', allWords);
    
    for (let i = 0; i <= allWords.length - wordsToFind.length; i++) {
        let match = true;
        const potentialSequence = [];
        for (let j = 0; j < wordsToFind.length; j++) {
            const transcriptWord = allWords[i + j];
            if (!transcriptWord || !transcriptWord.word) { // Reverted to .text
                console.warn(`findWordSequence: Invalid transcript word at index ${i + j}:`, transcriptWord);
                match = false;
                break;
            }
            if (transcriptWord.word.toLowerCase().replace(/[^a-z0-9\']/gi, '') !== wordsToFind[j].toLowerCase().replace(/[^a-z0-9\']/gi, '')) { // Reverted to .text
                match = false;
                break;
            }
            potentialSequence.push(allWords[i + j]);
        }
        if (match) {
            console.log('findWordSequence: Found match:', potentialSequence);
            return potentialSequence; // Return the first match found
        }
    }
    console.warn(`Word sequence not found: "${wordsToFind.join(' ')}"`);
    return []; // Return empty if not found
}

// NEW: compute relative word start times and total duration for a scene
export function getRelativeTiming(words) {
    const relStarts = [];
    let t = 0;
    for (const w of words) {
        relStarts.push(t);
        t += (w.end - w.start);
    }
    return { relStarts, totalDur: t };
} 