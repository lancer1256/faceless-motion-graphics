// src/utils/sceneContentFactory.js
import * as THREE from 'three';
import { Text } from 'troika-three-text';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { assetCache as preloadedAssetCache } from '../utils/PreloadManager.js';

// --- NEW HELPER FUNCTION (or move to a separate geometry utils file) ---
function createRoundedRectShape(width, height, radius) {
    const shape = new THREE.Shape();
    const x = -width / 2;
    const y = -height / 2;
    // Ensure radius is not too large for the dimensions, and not negative
    const R = Math.max(0, Math.min(radius, width / 2, height / 2));

    shape.moveTo(x, y + R);
    shape.lineTo(x, y + height - R);
    shape.quadraticCurveTo(x, y + height, x + R, y + height);
    shape.lineTo(x + width - R, y + height);
    shape.quadraticCurveTo(x + width, y + height, x + width, y + height - R);
    shape.lineTo(x + width, y + R);
    shape.quadraticCurveTo(x + width, y, x + width - R, y);
    shape.lineTo(x + R, y);
    shape.quadraticCurveTo(x, y, x, y + R);
    return shape;
}

// --- UTILITY FUNCTIONS NOW LOCAL TO THIS MODULE ---

// ROBUST TEXT CREATION FUNCTION (Moved here)
async function createDynamicTextRobust({
    id, lines, widthTargets, fontUrl, color = 0x000000,
    baseFontSize = 4, 
    gapSpec = { mode: "ratio", value: -0.1 }, 
    letterSpacingFactor = -0.1, 
    wordSpacingFactor = 0.2,
    // Legacy support for phrase string
    phrase,
    // SHOW_GUI needs to be passed if used inside here, or handled by caller
    // For simplicity, I'll assume SHOW_GUI is passed to the exported functions if needed by their logs.
    // If createDynamicTextRobust itself needs SHOW_GUI for its own warnings, it should be a param here too.
    // Let's add it as a param for createDynamicTextRobust for its internal warnings.
    SHOW_GUI,
    textLibEntryForAnimConfig // Pass the full textLibEntry to access defaultAnimation, line-specific animation, and textAlign configs
    }) {
    const group = new THREE.Group();
    group.name = `${id}_TextGroup_Root`;
    const lineInfo = []; // Will store { lg, hScaled, wScaled, textAlign }
    const allLinesAnimatableElements = []; // This will be structured based on granularity
    // NEW: Map to store detailed layout data for each line, crucial for relative positioning
    const lineLayoutDataMap = new Map();
    // NEW: Array to maintain original processing order and access line configs
    const lineProcessingOrder = [];

    // Convert legacy format to lines format if needed
    let processedLines = [];
    if (lines) {
        // New format: use provided lines array directly
        processedLines = Array.isArray(lines) ? lines : [lines];
    } else if (phrase) {
        // Legacy format: split phrase into lines and then into words
        processedLines = phrase.split('\n').map(lineText => lineText.split(' '));
    } else {
        if (SHOW_GUI) console.warn(`[${id}] No text content provided (neither 'lines' nor 'phrase')`);
        return group; // Return empty group
    }

    // Determine default animation settings from textLibEntry
    const defaultAnimConfig = textLibEntryForAnimConfig?.defaultAnimation || {};
    const defaultGranularity = defaultAnimConfig.granularity || 'word';
    // letterStagger from defaultAnimConfig will be used in timelineBuilder if line-specific is not set

    // --- PASS 1: Mesh Creation, Initial Sizing, and Data Collection ---
    for (let i = 0; i < processedLines.length; ++i) {
        const lineConfig = processedLines[i]; // This is the object like { lineId, text, textAlign, ... }
        const lineId = lineConfig.lineId;
        // Store resolved textAlign config (object or string)
        const resolvedTextAlignConfig = lineConfig.textAlign || (textLibEntryForAnimConfig?.lines?.[i]?.textAlign) || 'center';

        lineProcessingOrder.push({ lineIndex: i, lineConfig, lineId, resolvedTextAlignConfig });

        // Determine animation config for the current line (granularity, stagger)
        // Fallback from line-specific to textLibEntry's defaultAnimation settings
        const lineSpecificAnimConfig = textLibEntryForAnimConfig?.lines && textLibEntryForAnimConfig.lines[i] && textLibEntryForAnimConfig.lines[i].animation
            ? textLibEntryForAnimConfig.lines[i].animation
            : {};
        const currentLineGranularity = lineSpecificAnimConfig.granularity || defaultGranularity;
        const words = lineConfig.text ? lineConfig.text.split(' ') : [];
        const lineColor = lineConfig.color !== undefined ? lineConfig.color : color;
        
        const currentLineFontSize = Array.isArray(baseFontSize) ? (baseFontSize[i] || baseFontSize[0] || 4.0) : (baseFontSize || 4.0);
        const lg = new THREE.Group();
        lg.name = `${id}_Line${i}`;
        let xCursor = 0;
        const currentLineAnimatableUnits = []; // Stores word meshes or arrays of letter meshes for this line

        for (const w of words) {
            if (currentLineGranularity === 'letter') {
                const wordGroup = new THREE.Group(); // Group for letters of a single word
                wordGroup.name = `${id}_Line${i}_Word${words.indexOf(w)}`;
                let xCursorLetter = 0;
                const lettersForThisWord = []; // To be added to currentLineAnimatableUnits

                for (const char of w) {
                    const letterMesh = new Text();
                    letterMesh.text = char;
                    letterMesh.font = fontUrl;
                    letterMesh.fontSize = currentLineFontSize;
                    letterMesh.anchorX = 'left';
                    letterMesh.anchorY = 'middle';
                    letterMesh.color = new THREE.Color(lineColor);
                    // Set Troika's letterSpacing. For single char, it might not do much visually on its own,
                    // but it's good to set it for consistency if Troika uses it for any internal metrics.
                    const calculatedLetterSpacing = letterSpacingFactor * currentLineFontSize / 10;
                    letterMesh.letterSpacing = calculatedLetterSpacing;
                    if (SHOW_GUI && i === 0 && words.indexOf(w) === 0 && Array.from(w).indexOf(char) === 0) { // Log first letter of first word of first line
                        console.log(`%c[TextDebug - ${id}] First letter ('${char}') anchorX: ${letterMesh.anchorX}, anchorY: ${letterMesh.anchorY}`, 'color: orange');
                    }

                    // letterMesh.position.x will be set relative to wordGroup
                    await new Promise(r => letterMesh.sync(r));

                    const letterBB = letterMesh.geometry.boundingBox;
                    const letterWidthPx = (letterBB && letterBB.max && letterBB.min && !letterBB.isEmpty())
                                        ? (letterBB.max.x - letterBB.min.x)
                                        : (char === ' ' ? currentLineFontSize * 0.25 : 0); // Fallback width, give space a bit, others 0 if no bbox

                    letterMesh.position.x = xCursorLetter;

                    // Determine if this is the last character of the current word string 'w'
                    const charIndex = Array.from(w).indexOf(char); // Handles multi-byte chars if 'w' was from complex script
                    const isLastCharInWord = (charIndex === w.length - 1 && w.length > 0);

                    let spacingToApplyAfterChar = calculatedLetterSpacing;
                    if (char === ' ' || isLastCharInWord) { // No letter spacing after a space char itself, or after the last char of a word
                        spacingToApplyAfterChar = 0;
                    }

                    xCursorLetter += letterWidthPx + spacingToApplyAfterChar;

                    wordGroup.add(letterMesh);
                    lettersForThisWord.push(letterMesh); // Store for animation targeting
                }
                wordGroup.position.x = xCursor; // Position the wordGroup within the line group
                lg.add(wordGroup);
                currentLineAnimatableUnits.push(lettersForThisWord); // Add array of letter meshes for this word

                // Measure the actual width of the wordGroup for advancing xCursor
                const wordGroupBB = new THREE.Box3().setFromObject(wordGroup);
                const actualWordWidthPx = (wordGroupBB.max.x - wordGroupBB.min.x);
                xCursor += actualWordWidthPx + (currentLineFontSize * wordSpacingFactor);

            } else { // Word granularity (existing logic)
                const wordMesh = new Text();
                wordMesh.text = w;
                wordMesh.font = fontUrl;
                wordMesh.fontSize = currentLineFontSize;
                wordMesh.anchorX = 'left';
                wordMesh.anchorY = 'middle';
                wordMesh.color = new THREE.Color(lineColor);
                wordMesh.letterSpacing = letterSpacingFactor * currentLineFontSize / 10;
                wordMesh.position.x = xCursor;
                if (SHOW_GUI && i === 0 && words.indexOf(w) === 0) { // Log first word of first line
                    console.log(`%c[TextDebug - ${id}] First word ('${w}') anchorX: ${wordMesh.anchorX}, anchorY: ${wordMesh.anchorY}`, 'color: orange');
                }
                await new Promise(r => wordMesh.sync(r));

                const wordBB = wordMesh.geometry.boundingBox;
                const wordWidthPx = (wordBB && wordBB.max && wordBB.min) ? (wordBB.max.x - wordBB.min.x) : (currentLineFontSize * 0.6 * w.length); // Fallback width
                xCursor += wordWidthPx + (currentLineFontSize * wordSpacingFactor);
                lg.add(wordMesh);
                currentLineAnimatableUnits.push(wordMesh); // Add the word mesh itself
            }
        }
        allLinesAnimatableElements.push(currentLineAnimatableUnits); // Add this line's animatable units

        const unscaled = new THREE.Box3().setFromObject(lg);
        const w0 = unscaled.max.x - unscaled.min.x;
        const h0 = unscaled.max.y - unscaled.min.y;

        const targetW = (widthTargets && i < widthTargets.length) ? widthTargets[i] : (widthTargets ? widthTargets.at(-1) : undefined);
        let scale = 1.0;
        if (w0 > 0 && targetW !== undefined && targetW > 0) {
            scale = Math.min(targetW / w0, 1); 
        } else if (w0 === 0 && words.join("").length > 0) { // Only warn if there was text
             if (SHOW_GUI) console.warn(`[${id}] Line ${lg.name} (content: "${words.join(' ')}") had zero width before scaling. Scale set to 1.`);
            scale = 1;
        } else if (w0 === 0) {
            scale = 1;
        }
        
        lg.scale.setScalar(scale);
        // lineInfo.push({ lg, hScaled: h0 * scale, wScaled: w0 * scale, textAlign: lineTextAlign }); // OLD: Store textAlign
        // NEW: Store in lineLayoutDataMap
        const currentLineKey = lineId || `_index_${i}`;
        if (lineId && lineLayoutDataMap.has(lineId)) {
            if (SHOW_GUI) console.warn(`[TextFactory - ${id}] Duplicate lineId detected: "${lineId}" during Pass 1. Layout might be unpredictable for lines referencing it. Ensure lineIds are unique within a text block.`);
        }
        lineLayoutDataMap.set(currentLineKey, {
            lg: lg,
            wScaled: w0 * scale,
            hScaled: h0 * scale,
            config: lineConfig, // Store the original line config
            textAlignConfig: resolvedTextAlignConfig, // Store the resolved textAlign config
            lineIndex: i, // Store original index for sorting/reference
            finalYPositionInGroup: null, // Initialize finalYPositionInGroup
            finalXPositionInGroup: null, // Initialize finalXPositionInGroup
        });

        group.add(lg);
    }

    // --- PASS 2: Vertical Positioning ---
    let yCursor = 0; // Use yCursor for clarity
    for (let i = 0; i < lineProcessingOrder.length; ++i) {
        const { lineIndex, lineConfig, lineId } = lineProcessingOrder[i];
        const currentLineKey = lineId || `_index_${lineIndex}`;
        const currentLineData = lineLayoutDataMap.get(currentLineKey);

        if (!currentLineData) {
            if (SHOW_GUI) console.warn(`[TextFactory - ${id}] Data not found in lineLayoutDataMap for key: ${currentLineKey} during vertical pass (index ${i}).`);
            continue;
        }

        const { lg, hScaled } = currentLineData;
        const currentLineHeight = hScaled || 0;
        let gapToPrevLine = 0;

        if (i === 0) {
            yCursor = currentLineHeight / 2;
        } else {
            const prevLineOrderEntry = lineProcessingOrder[i - 1];
            const prevLineKey = prevLineOrderEntry.lineId || `_index_${prevLineOrderEntry.lineIndex}`;
            const prevLineData = lineLayoutDataMap.get(prevLineKey);
            const prevH = prevLineData ? (prevLineData.hScaled || 0) : 0;

            let gapWorld;
            if (gapSpec.mode === 'abs') {
                gapWorld = gapSpec.value;
            } else { 
                const hRef = Math.min(prevH, currentLineHeight);
                gapWorld = gapSpec.value * hRef;
            }
            gapToPrevLine = gapWorld; // Store the calculated gap
            yCursor -= (prevH / 2) + (currentLineHeight / 2) + gapWorld;
        }
        lg.position.y = yCursor;
        currentLineData.finalYPositionInGroup = yCursor; // Store it

        // Log the final dimensions and gap
        if (SHOW_GUI) {
            console.log(`%c[TextLayout Vertical - ${id}] Line ${lineIndex} ('${lineConfig.text?.substring(0,10)}...'): Set Y to ${yCursor.toFixed(2)}. Scaled H: ${hScaled.toFixed(2)}, Gap: ${gapToPrevLine.toFixed(2)}`, 'color: dodgerblue');
        }
    }

    // --- PASS 3: Horizontal Alignment (Two-Pass Approach) ---

    // Initialize finalXPositionInGroup for all lines to undefined
    lineLayoutDataMap.forEach(data => {
        data.finalXPositionInGroup = undefined;
    });

    // --- Pass 3.A: Resolve Absolute and Backward-Relative Alignments ---
    if (SHOW_GUI) console.log(`%c[TextLayout Pass 3.A - ${id}] Starting: Resolve Absolute & Backward-Relative`, 'color: blue');
    for (const { lineIndex, lineConfig, lineId: currentLineId } of lineProcessingOrder) {
        const currentLineKey = currentLineId || `_index_${lineIndex}`;
        const currentLineData = lineLayoutDataMap.get(currentLineKey);

        if (!currentLineData) continue; // Should have been caught earlier

        // Skip if already processed (e.g., if we were to adapt this for more passes)
        if (currentLineData.finalXPositionInGroup !== undefined) continue;

        const { lg, wScaled, textAlignConfig } = currentLineData;
        let calculatedXThisPass = undefined;

        if (typeof textAlignConfig === 'string' || (typeof textAlignConfig === 'object' && (textAlignConfig.type === 'absolute' || !textAlignConfig.type))) {
            // ABSOLUTE ALIGNMENT
            const alignAnchor = typeof textAlignConfig === 'string' ? textAlignConfig : (textAlignConfig.positionInSpaceRelativeToLine || 'center');
            if (isFinite(wScaled)) {
                switch (alignAnchor) {
                    case 'left': calculatedXThisPass = 0; break;
                    case 'right': calculatedXThisPass = -wScaled; break;
                    case 'center': default: calculatedXThisPass = -wScaled / 2; break;
                }
            } else {
                calculatedXThisPass = 0; // Fallback
                if (SHOW_GUI && lineConfig.text?.length > 0) console.warn(`[TextLayout Pass 3.A Absolute - ${id}] Line ${lineIndex} ('${lineConfig.text?.substring(0,10)}...') has non-finite wScaled (${wScaled}). Defaulting X to 0.`);
            }
            if (SHOW_GUI) {
                const logWScaled = typeof wScaled === 'number' && isFinite(wScaled) ? wScaled.toFixed(2) : "N/A";
                const logCalcX = typeof calculatedXThisPass === 'number' && isFinite(calculatedXThisPass) ? calculatedXThisPass.toFixed(2) : "N/A";
                console.log(`%c[TextLayout Pass 3.A Absolute - ${id}] Line ${lineIndex} ('${lineConfig.text?.substring(0,10)}...'): Align '${alignAnchor}', X: ${logCalcX}, W_scaled: ${logWScaled}`, 'color: mediumpurple');
            }
        } else if (typeof textAlignConfig === 'object' && textAlignConfig.type === 'relative') {
            // RELATIVE ALIGNMENT - Attempt to resolve if target's X is already known (backward/sideways reference)
            const { targetLineId, positionInSpaceRelativeToLine, specificAlignmentForThisText: rawSpecificAlignment } = textAlignConfig;
            const specificAlignment = rawSpecificAlignment || positionInSpaceRelativeToLine;
            const targetLineData = lineLayoutDataMap.get(targetLineId);

            if (!targetLineData) {
                if (SHOW_GUI) console.warn(`[TextLayout Pass 3.A Relative - ${id}] Target lineId "${targetLineId}" not found for line ${lineIndex} ('${lineConfig.text?.substring(0,10)}...'). Will be re-evaluated in Pass 3.B.`);
                // Defer to Pass 3.B
            } else if (targetLineData.finalXPositionInGroup !== undefined) {
                // Target's X is known, so this is a backward or sideways relative alignment. Resolve now.
                let targetLineEffectiveXStart = targetLineData.finalXPositionInGroup;
                let targetAnchorPointX = 0;
                if (isFinite(targetLineData.wScaled)) {
                    switch (positionInSpaceRelativeToLine) {
                        case 'left':   targetAnchorPointX = targetLineEffectiveXStart; break;
                        case 'center': targetAnchorPointX = targetLineEffectiveXStart + targetLineData.wScaled / 2; break;
                        case 'right':  targetAnchorPointX = targetLineEffectiveXStart + targetLineData.wScaled; break;
                        default:       targetAnchorPointX = targetLineEffectiveXStart; break;
                    }
                } else { targetAnchorPointX = targetLineEffectiveXStart; }

                let selfAnchorOffset = 0;
                if (isFinite(wScaled)) {
                    switch (specificAlignment) {
                        case 'left':   selfAnchorOffset = 0; break;
                        case 'center': selfAnchorOffset = wScaled / 2; break;
                        case 'right':  selfAnchorOffset = wScaled; break;
                        default:       selfAnchorOffset = 0; break;
                    }
                }
                calculatedXThisPass = targetAnchorPointX - selfAnchorOffset;
                if (SHOW_GUI) { 
                    const logTargetXStart = typeof targetLineEffectiveXStart === 'number' && isFinite(targetLineEffectiveXStart) ? targetLineEffectiveXStart.toFixed(2) : "N/A";
                    const logTargetW = typeof targetLineData?.wScaled === 'number' && isFinite(targetLineData.wScaled) ? targetLineData.wScaled.toFixed(2) : "N/A";
                    const logTargetAnchorPt = typeof targetAnchorPointX === 'number' && isFinite(targetAnchorPointX) ? targetAnchorPointX.toFixed(2) : "N/A";
                    const logSelfW = typeof wScaled === 'number' && isFinite(wScaled) ? wScaled.toFixed(2) : "N/A";
                    const logSelfOffset = typeof selfAnchorOffset === 'number' && isFinite(selfAnchorOffset) ? selfAnchorOffset.toFixed(2) : "N/A";
                    const logCalcX = typeof calculatedXThisPass === 'number' && isFinite(calculatedXThisPass) ? calculatedXThisPass.toFixed(2) : "N/A";
                    console.log(
                        `%c[TextLayout Pass 3.A Relative (Backward/Side) - ${id}] Line ${lineIndex} ('${lineConfig.text?.substring(0,10)}...'): RelTo: "${targetLineId}" (posInSpace: ${positionInSpaceRelativeToLine}, specificAlign: ${specificAlignment}). ` +
                        `TgtXStart: ${logTargetXStart}, TgtW: ${logTargetW} => TgtAnchorPt: ${logTargetAnchorPt}. ` +
                        `SelfW: ${logSelfW}, SelfAlignOffset: ${logSelfOffset} => Resolved X: ${logCalcX}`,
                        'color: darkcyan'
                    );
                }
            } else {
                // Target's X is NOT known yet. This is a forward reference. Skip in this pass.
                if (SHOW_GUI) console.log(`%c[TextLayout Pass 3.A Relative - ${id}] Line ${lineIndex} ('${lineConfig.text?.substring(0,10)}...'): Target "${targetLineId}" X not yet resolved (forward ref). Deferring to Pass 3.B.`, 'color: orange');
            }
        }

        if (calculatedXThisPass !== undefined) {
            lg.position.x = calculatedXThisPass;
            currentLineData.finalXPositionInGroup = calculatedXThisPass;
        }
    }

    // --- Pass 3.B: Resolve Forward-Relative Alignments & Defaults ---
    if (SHOW_GUI) console.log(`%c[TextLayout Pass 3.B - ${id}] Starting: Resolve Forward-Relative & Defaults`, 'color: blue');
    for (const { lineIndex, lineConfig, lineId: currentLineId } of lineProcessingOrder) {
        const currentLineKey = currentLineId || `_index_${lineIndex}`;
        const currentLineData = lineLayoutDataMap.get(currentLineKey);

        if (!currentLineData) continue;

        // Skip if already processed in Pass 3.A
        if (currentLineData.finalXPositionInGroup !== undefined) {
            continue;
        }

        const { lg, wScaled, textAlignConfig } = currentLineData;
        let calculatedXThisPass = undefined; 

        if (typeof textAlignConfig === 'object' && textAlignConfig.type === 'relative') {
            const { targetLineId, positionInSpaceRelativeToLine, specificAlignmentForThisText: rawSpecificAlignment } = textAlignConfig;
            const specificAlignment = rawSpecificAlignment || positionInSpaceRelativeToLine;
            const targetLineData = lineLayoutDataMap.get(targetLineId);

            if (!targetLineData) {
                if (SHOW_GUI) console.warn(`[TextLayout Pass 3.B Relative - ${id}] Target lineId "${targetLineId}" (for line ${lineIndex} '${lineConfig.text?.substring(0,10)}') still not found. Defaulting to absolute center.`);
                calculatedXThisPass = isFinite(wScaled) ? -wScaled / 2 : 0;
            } else if (targetLineData.finalXPositionInGroup === undefined) {
                if (SHOW_GUI) console.warn(`[TextLayout Pass 3.B Relative - ${id}] Target line "${targetLineId}" (for line ${lineIndex} '${lineConfig.text?.substring(0,10)}') still has no finalXPositionInGroup. This might be a multi-level forward dependency or cycle. Defaulting current line to absolute center.`);
                calculatedXThisPass = isFinite(wScaled) ? -wScaled / 2 : 0;
            } else {
                let targetLineEffectiveXStart = targetLineData.finalXPositionInGroup;
                let targetAnchorPointX = 0;
                if (isFinite(targetLineData.wScaled)) {
                    switch (positionInSpaceRelativeToLine) {
                        case 'left':   targetAnchorPointX = targetLineEffectiveXStart; break;
                        case 'center': targetAnchorPointX = targetLineEffectiveXStart + targetLineData.wScaled / 2; break;
                        case 'right':  targetAnchorPointX = targetLineEffectiveXStart + targetLineData.wScaled; break;
                        default:       targetAnchorPointX = targetLineEffectiveXStart; break;
                    }
                } else { targetAnchorPointX = targetLineEffectiveXStart; }

                let selfAnchorOffset = 0;
                if (isFinite(wScaled)) {
                    switch (specificAlignment) {
                        case 'left':   selfAnchorOffset = 0; break;
                        case 'center': selfAnchorOffset = wScaled / 2; break;
                        case 'right':  selfAnchorOffset = wScaled; break;
                        default:       selfAnchorOffset = 0; break;
                    }
                }
                calculatedXThisPass = targetAnchorPointX - selfAnchorOffset;
                 if (SHOW_GUI) { 
                    const logTargetXStart = typeof targetLineEffectiveXStart === 'number' && isFinite(targetLineEffectiveXStart) ? targetLineEffectiveXStart.toFixed(2) : "N/A";
                    const logTargetW = typeof targetLineData?.wScaled === 'number' && isFinite(targetLineData.wScaled) ? targetLineData.wScaled.toFixed(2) : "N/A";
                    const logTargetAnchorPt = typeof targetAnchorPointX === 'number' && isFinite(targetAnchorPointX) ? targetAnchorPointX.toFixed(2) : "N/A";
                    const logSelfW = typeof wScaled === 'number' && isFinite(wScaled) ? wScaled.toFixed(2) : "N/A";
                    const logSelfOffset = typeof selfAnchorOffset === 'number' && isFinite(selfAnchorOffset) ? selfAnchorOffset.toFixed(2) : "N/A";
                    const logCalcX = typeof calculatedXThisPass === 'number' && isFinite(calculatedXThisPass) ? calculatedXThisPass.toFixed(2) : "N/A";
                    console.log(
                        `%c[TextLayout Pass 3.B Relative (Forward) - ${id}] Line ${lineIndex} ('${lineConfig.text?.substring(0,10)}...'): RelTo: "${targetLineId}" (posInSpace: ${positionInSpaceRelativeToLine}, specificAlign: ${specificAlignment}). `+
                        `TgtXStart: ${logTargetXStart}, TgtW: ${logTargetW} => TgtAnchorPt: ${logTargetAnchorPt}. ` +
                        `SelfW: ${logSelfW}, SelfAlignOffset: ${logSelfOffset} => Resolved X: ${logCalcX}`,
                        'color: teal'
                    );
                }
            }
        } else {
            if (SHOW_GUI) console.warn(`[TextLayout Pass 3.B - ${id}] Line ${lineIndex} ('${lineConfig.text?.substring(0,10)}') reached Pass 3.B unexpectedly (not relative or already processed). Defaulting to absolute center. Config:`, textAlignConfig);
            calculatedXThisPass = isFinite(wScaled) ? -wScaled / 2 : 0;
        }

        if (calculatedXThisPass !== undefined) {
            lg.position.x = calculatedXThisPass;
            currentLineData.finalXPositionInGroup = calculatedXThisPass;
        } else {
            const fallbackX = isFinite(wScaled) ? -wScaled / 2 : 0;
            lg.position.x = fallbackX;
            currentLineData.finalXPositionInGroup = fallbackX;
            if (SHOW_GUI) console.error(`[TextLayout Pass 3.B - ${id}] Line ${lineIndex} ('${lineConfig.text?.substring(0,10)}') had no X position calculated after all passes. Defaulted to ${fallbackX.toFixed(2)}. This indicates a logic flaw or unhandled case.`);
        }
    }
    // --- End of PASS 3 ---
    group.updateMatrixWorld(true);
    const gbb = new THREE.Box3().setFromObject(group); // Bounding box of the group with potentially mixed-aligned lines
    if (!gbb.isEmpty()) {
        const cx = (gbb.min.x + gbb.max.x) / 2;
        const cy = (gbb.min.y + gbb.max.y) / 2;
        if (isFinite(cx) && isFinite(cy)) {
            group.position.set(-cx, -cy, 0);
            group.updateMatrix();
            group.updateMatrixWorld(true);
            if (SHOW_GUI) {
                console.log(`%c[TextDebug - ${id}] Text group centered. BBox min: (${gbb.min.x.toFixed(2)}, ${gbb.min.y.toFixed(2)}), max: (${gbb.max.x.toFixed(2)}, ${gbb.max.y.toFixed(2)}). Offset applied: (-${cx.toFixed(2)}, -${cy.toFixed(2)})`, 'color: orange');
            }
        } else {
            group.position.set(0,0,0);
            if (SHOW_GUI) console.warn(`[${id}] Group bounding box center was non-finite. Group not centered.`);
        }
    } else {
        group.position.set(0,0,0);
        if (processedLines.flat().length > 0 && SHOW_GUI) { // Only warn if there was text
            const textForLog = processedLines.map(l => (typeof l === 'object' && l.text) ? l.text : (Array.isArray(l) ? l.join(' ') : l)).join(' ');
            console.warn(`%c[TextDebug Centering - ${id}] Text group bounding box is empty but text content exists: "${textForLog.substring(0,30)}..."`, 'color: red');
        }
    }
    // Return both the visual group and the structured animatable elements
    return {
        textGroup: group,
        animatableElements: allLinesAnimatableElements,
        computedLineLayouts: lineLayoutDataMap // Pass the map back
    };
}

// Utility: largest dimension (x, y or z) of an object (Moved here)
function getBoundingMaxDimension(object) {
    if (!object) return 0;
    const bbox = new THREE.Box3();
    // It's safer to check if setFromObject can even work
    try {
        bbox.setFromObject(object, true); // true to update world matrix if needed
    } catch (e) {
        console.warn("getBoundingMaxDimension: Could not compute bounding box for object", object, e);
        return 0;
    }
    if (bbox.isEmpty()) return 0;
    const size = new THREE.Vector3();
    bbox.getSize(size);
    return Math.max(size.x, size.y, size.z);
}

// Utility: apply emissive boost (Moved here)
function applyBrightnessFactor(object, factor, { max = 5 } = {}) {
    if (!object) return;
    const boost = Math.min(factor, max);
    object.traverse(child => {
        if (child.isMesh && child.material) {
            const originalMaterial = child.material;
            const materials = Array.isArray(originalMaterial) ? originalMaterial : [originalMaterial];
            
            const newMaterials = materials.map(mat => {
                if (!mat) return null;
                const clonedMat = mat.clone(); // Clone the material
                
                if (clonedMat.emissive) {
                    if (clonedMat.emissive.r === 0 && clonedMat.emissive.g === 0 && clonedMat.emissive.b === 0 && clonedMat.color) {
                        clonedMat.emissive.copy(clonedMat.color);
                    }
                } else if (clonedMat.color) { // Ensure emissive exists
                    clonedMat.emissive = clonedMat.color.clone();
                }
                
                if (clonedMat.emissive) { // Check again if emissive was created
                    clonedMat.emissiveIntensity = (clonedMat.emissiveIntensity || (clonedMat.emissive.r > 0 || clonedMat.emissive.g > 0 || clonedMat.emissive.b > 0 ? 1 : 0)) * boost;
                }
                return clonedMat;
            });

            if (Array.isArray(originalMaterial)) {
                child.material = newMaterials.filter(m => m !== null);
            } else if (newMaterials[0]) {
                child.material = newMaterials[0];
            }
        }
    });
}

// Function to create a gold material
function createGoldMaterial() {
    return new THREE.MeshStandardMaterial({
        color: 0xffdf00,       // Gold color
        metalness: 1.0,        // Maximum metalness
        roughness: 0.05,       // Lower roughness for more reflectivity (was 0.1)
        emissive: 0xffb000,    // Warm emissive glow
        emissiveIntensity: 0.2, // Subtle glow
        envMapIntensity: 2.0,   // Increased environment reflection
        clearcoat: 0.5,         // Add clearcoat for extra shine
        clearcoatRoughness: 0.1 // Slightly rough clearcoat
    });
}

// Function to create a wood material
function createWoodMaterial() {
    // Create texture loader if needed
    const textureLoader = new THREE.TextureLoader();
    
    // Use the actual wood textures we found in the directory
    const woodTexture = {
        color: textureLoader.load('./assets/wood_texture/textures/wooden_gate_diff_1k.jpg'),
        normal: textureLoader.load('./assets/wood_texture/textures/wooden_gate_nor_gl_1k.jpg'),
        roughnessMetallic: textureLoader.load('./assets/wood_texture/textures/wooden_gate_arm_1k.jpg') // ARM = Ambient Occlusion, Roughness, Metallic
    };
    
    // Apply proper texture settings
    [woodTexture.color, woodTexture.normal, woodTexture.roughnessMetallic].forEach(texture => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2, 2); // Adjust tiling as needed
    });
    
    return new THREE.MeshStandardMaterial({
        map: woodTexture.color,
        normalMap: woodTexture.normal,
        aoMap: woodTexture.roughnessMetallic, // Use R channel for AO
        roughnessMap: woodTexture.roughnessMetallic, // Use G channel for roughness
        metalnessMap: woodTexture.roughnessMetallic, // Use B channel for metalness
        color: 0xffffff, // Use white to let the texture color show through
        metalness: 1.0,  // Base metalness, will be multiplied by metalness map
        roughness: 1.0,  // Base roughness, will be multiplied by roughness map
        envMapIntensity: 0.5 // Subtle environment reflections
    });
}

// --- EXPORTED FACTORY FUNCTIONS ---
const gltfLoaderInstance = new GLTFLoader();

export async function createTextForSceneContentBlock(textLibEntry, contentBlockConfig, parentAnchor, { SHOW_GUI, textWordsGlobalRef }) {
    if (!textLibEntry) {
        console.error(`Text library entry not found for content block ID: ${contentBlockConfig.textConfigId}`, contentBlockConfig);
        return null;
    }

    // Process input based on whether it uses new 'lines' format or legacy 'phrase' format
    let linesForRobust;
    
    if (textLibEntry.lines) {
        // New schema: pass lines array directly
        linesForRobust = textLibEntry.lines;
    } else if (textLibEntry.phrase) {
        // Legacy schema: split phrase into lines of words
        linesForRobust = textLibEntry.phrase.split('\n').map(lineText => lineText.split(' '));
    } else {
        console.error(`Text entry has neither 'lines' nor 'phrase' property: ${contentBlockConfig.textConfigId}`);
        return null;
    }
    
    // Now createDynamicTextRobust is called directly as it's in the same module
    const { textGroup, animatableElements, computedLineLayouts } = await createDynamicTextRobust({
        id: textLibEntry.idForMesh || contentBlockConfig.id,
        lines: linesForRobust,
        widthTargets: textLibEntry.widthTargets,
        textLibEntryForAnimConfig: textLibEntry, // Pass the whole entry for animation config access
        fontUrl: textLibEntry.fontUrl,
        color: textLibEntry.color,
        baseFontSize: textLibEntry.baseFontSize,
        gapSpec: textLibEntry.gapSpec,
        letterSpacingFactor: textLibEntry.letterSpacingFactor,
        wordSpacingFactor: textLibEntry.wordSpacingFactor,
        SHOW_GUI: SHOW_GUI // Pass SHOW_GUI to it
    });

    if (!textGroup) { // If createDynamicTextRobust failed (e.g., no lines)
        console.error(`[ContentFactory] Text group creation failed for ${contentBlockConfig.id}`);
        return null;
    }

    if (textLibEntry.groupRotation) {
        textGroup.rotation.set(
            textLibEntry.groupRotation.x || 0,
            textLibEntry.groupRotation.y || 0,
            textLibEntry.groupRotation.z || 0
        );
    }

    if (contentBlockConfig.position) {
        textGroup.position.set(
            contentBlockConfig.position.x || 0,
            contentBlockConfig.position.y || 0,
            contentBlockConfig.position.z || 0
        );
    }
    if (contentBlockConfig.rotation) {
        const currentEuler = new THREE.Euler().setFromQuaternion(textGroup.quaternion, 'YXZ');
        currentEuler.x += contentBlockConfig.rotation.x || 0;
        currentEuler.y += contentBlockConfig.rotation.y || 0;
        currentEuler.z += contentBlockConfig.rotation.z || 0;
        textGroup.setRotationFromEuler(currentEuler);
    }
    if (contentBlockConfig.scale) {
        textGroup.scale.set(
            contentBlockConfig.scale.x || 1,
            contentBlockConfig.scale.y || 1,
            contentBlockConfig.scale.z || 1
        );
    }
    
    if (textLibEntry.lineZOffsets && textGroup.children.length > 0) {
        textGroup.children.forEach((lineMeshGroup, lineIdx) => {
            if (textLibEntry.lineZOffsets[lineIdx] !== undefined && lineMeshGroup.isGroup) { // Check if it's a group (a line)
                 lineMeshGroup.position.z = textLibEntry.lineZOffsets[lineIdx];
            }
        });
    }

    parentAnchor.add(textGroup);
    if (SHOW_GUI) {
        // Get display text for logging - either from phrase or by joining lines
        const displayText = textLibEntry.phrase || 
                           (textLibEntry.lines ? textLibEntry.lines.map(line => 
                               typeof line === 'string' ? line : 
                               (line.text || (Array.isArray(line) ? line.join(' ') : ''))
                           ).join('\n') : '');
        console.log(`%c[ContentFactory] Created text "${displayText.substring(0,15)}..." for ${parentAnchor.name}`, 'color: mediumseagreen');
    }

    // Store animatable word meshes directly on the contentBlockConfig
    // This replaces populating global window.textWords, window.textWords2, etc.
    contentBlockConfig.animationElements = animatableElements; // Assign the structured elements

    if (SHOW_GUI) {
        let elementCount = 0;
        animatableElements.forEach(line => {
            line.forEach(unit => {
                if (Array.isArray(unit)) elementCount += unit.length; // letters
                else elementCount++; // word
            });
        });
        console.log(`%c[ContentFactory] Stored ${elementCount} animatable elements on contentBlock '${contentBlockConfig.id}' organized by ${animatableElements.length} lines`, 'color: mediumseagreen', animatableElements);
    }

    // If the old format is expected by any code, flatten the structure for backward compatibility
    // This needs to be carefully considered if _flatAnimationElements is truly needed.
    // For now, let's assume it might be, and populate it.
    contentBlockConfig._flatAnimationElements = [];

    // --- NEW: Populate lineLayouts on contentBlockConfig using computedLineLayouts ---
    contentBlockConfig.lineLayouts = [];
    if (computedLineLayouts) { // Check if the map was returned
        textGroup.updateMatrixWorld(true); // Ensure textGroup's world matrix is current
        const inverseTextGroupMatrix = new THREE.Matrix4().copy(textGroup.matrixWorld).invert();

        // Create an array from the map to sort it by original lineIndex for consistent output
        const sortedLayoutData = Array.from(computedLineLayouts.values()).sort((a, b) => a.lineIndex - b.lineIndex);

        for (const data of sortedLayoutData) {
            const { lg, wScaled, hScaled, finalXPositionInGroup, finalYPositionInGroup, config, lineIndex } = data;
            const lineIdFromConfig = config.lineId; // Get lineId from the original line config object

            let localBoundsMin = { x: 0, y: 0, z: 0 };
            let localBoundsMax = { x: 0, y: 0, z: 0 };

            if (lg && lg.children.length > 0) {
                const tempBox = new THREE.Box3();
                // Traverse direct children of lg (which are word/letter Troika meshes or word groups)
                lg.children.forEach(lgChild => {
                    lgChild.updateWorldMatrix(true, false); // Ensure lgChild's world matrix is up-to-date
                    // If lgChild is a group itself (e.g. wordGroup for letter granularity), traverse its meshes
                    if (lgChild.isGroup) {
                        lgChild.traverse(mesh => {
                            if (mesh.isMesh && mesh.geometry && mesh.geometry.boundingBox && !mesh.geometry.boundingBox.isEmpty()) {
                                mesh.updateWorldMatrix(true, false);
                                const meshBBoxWorld = new THREE.Box3().setFromObject(mesh);
                                tempBox.union(meshBBoxWorld.applyMatrix4(inverseTextGroupMatrix));
                            }
                        });
                    } else if (lgChild.isMesh && lgChild.geometry && lgChild.geometry.boundingBox && !lgChild.geometry.boundingBox.isEmpty()) {
                        const childBBoxWorld = new THREE.Box3().setFromObject(lgChild);
                        tempBox.union(childBBoxWorld.applyMatrix4(inverseTextGroupMatrix));
                    }
                });
                 if (!tempBox.isEmpty()) {
                    localBoundsMin = { x: tempBox.min.x, y: tempBox.min.y, z: tempBox.min.z };
                    localBoundsMax = { x: tempBox.max.x, y: tempBox.max.y, z: tempBox.max.z };
                }
            }

            contentBlockConfig.lineLayouts.push({
                lineId: lineIdFromConfig, 
                originalLineIndex: lineIndex, 
                text: config.text,
                x: finalXPositionInGroup || 0, 
                y: finalYPositionInGroup || 0, 
                z: lg.position.z,
                width: wScaled || 0, 
                height: hScaled || 0,
                boundingBoxLocal: { min: localBoundsMin, max: localBoundsMax }
            });
        }
        if (SHOW_GUI) console.log(`%c[ContentFactory - ${contentBlockConfig.id}] Populated lineLayouts on contentBlockConfig:`, 'color: darkturquoise', JSON.parse(JSON.stringify(contentBlockConfig.lineLayouts)));
    }

    if (animatableElements && animatableElements.length > 0) {
        animatableElements.forEach(lineUnits => {
            lineUnits.forEach(unit => {
                if (Array.isArray(unit)) { // It's an array of letter meshes
                    contentBlockConfig._flatAnimationElements.push(...unit);
                } else { // It's a single word mesh
                    contentBlockConfig._flatAnimationElements.push(unit);
                }
            });
        });
        if (SHOW_GUI) {
            console.log(`%c[ContentFactory] Created _flatAnimationElements with ${contentBlockConfig._flatAnimationElements.length} total elements for '${contentBlockConfig.id}'`, 'color: skyblue');
        }
    } else {
        if (SHOW_GUI) console.warn(`%c[ContentFactory Debug - ${contentBlockConfig.id}] animatableElements is empty or null.`, 'color: red', animatableElements);
    }
    
    contentBlockConfig.createdMesh = textGroup;      // expose for occlusion & other tools
    return textGroup;
}

export async function createAssetForSceneContentBlock(assetLibEntry, contentBlockConfig, parentAnchor, { SHOW_GUI, moneyGroupGlobalRef, loadedGltfCache }) {
    if (!assetLibEntry) {
        console.error(`[ContentFactory Error] Asset library entry not found for content block ID: ${contentBlockConfig.assetConfigId}`, contentBlockConfig);
        return null;
    }
    if (SHOW_GUI) { // Log the blockConfig object *as received* by the factory
        console.log(`%c[ContentFactory - Received] For '${contentBlockConfig.id}', received contentBlockConfig is:`, 'color: teal', JSON.parse(JSON.stringify(contentBlockConfig)));
        console.log(`%c[ContentFactory - Received] For '${contentBlockConfig.id}', direct received contentBlockConfig object:`, 'color: teal', contentBlockConfig);
    }

    const textureLoader = new THREE.TextureLoader();
    let assetInstanceRoot;

    if (SHOW_GUI) console.log(`%c[ContentFactory - ${contentBlockConfig.id}] Processing asset. Library Entry:`, 'color:darkorange', assetLibEntry);

    if (assetLibEntry.type === "gltf") {
        let gltfSceneNode;
        if (loadedGltfCache.has(assetLibEntry.modelSrc)) {
            gltfSceneNode = loadedGltfCache.get(assetLibEntry.modelSrc).clone(true);
            if (SHOW_GUI) console.log(`%c[ContentFactory] Cloned ${assetLibEntry.modelSrc} from cache for ${contentBlockConfig.id}`, 'color: coral');
        } else {
            const gltf = await gltfLoaderInstance.loadAsync(assetLibEntry.modelSrc);
            loadedGltfCache.set(assetLibEntry.modelSrc, gltf.scene); // Cache the original scene from GLTF result
            gltfSceneNode = gltf.scene.clone(true);
            if (SHOW_GUI) console.log(`%c[ContentFactory] Loaded ${assetLibEntry.modelSrc} for ${contentBlockConfig.id}`, 'color: coral');
            if (!gltfSceneNode && SHOW_GUI) console.error(`%c[ContentFactory Error - ${contentBlockConfig.id}] gltf.scene was null/undefined after load!`, 'color: red');
        }
        assetInstanceRoot = gltfSceneNode;

        // Apply material override if specified
        if (assetLibEntry.baseProperties.materialOverride) {
            const materialOverride = assetLibEntry.baseProperties.materialOverride;
            
            if (materialOverride.type === "gold") {
                const goldMaterial = createGoldMaterial();
                
                // Apply gold material to all meshes
                assetInstanceRoot.traverse(child => {
                    if (child.isMesh && child.material) {
                        // Store original material for potential later restoration
                        child._originalMaterial = child.material;
                        // Replace with gold material
                        child.material = goldMaterial;
                    }
                });
                
                if (SHOW_GUI) console.log(`%c[ContentFactory] Applied gold material to ${contentBlockConfig.id}`, 'color: gold');
            }
            else if (materialOverride.type === "wood") {
                const woodMaterial = createWoodMaterial();
                
                // Apply wood material to all meshes
                assetInstanceRoot.traverse(child => {
                    if (child.isMesh && child.material) {
                        // Store original material for potential later restoration
                        child._originalMaterial = child.material;
                        // Replace with wood material
                        child.material = woodMaterial;
                    }
                });
                
                if (SHOW_GUI) console.log(`%c[ContentFactory] Applied wood material to ${contentBlockConfig.id}`, 'color: saddlebrown');
            } else if (materialOverride.type === "custom") {
                // For materials like the human brain with multiple specific maps
                const { textureSrc, normalMapSrc, roughnessMapSrc, alphaMapSrc } = materialOverride;

                assetInstanceRoot.traverse((child) => {
                    if (child.isMesh && child.material) {
                        const originalMaterial = child.material;
                        // If material is an array, process each one
                        const materials = Array.isArray(originalMaterial) ? originalMaterial : [originalMaterial];

                        const newMaterials = materials.map(mat => {
                            if (!mat) return null;
                            const newMaterial = mat.clone(); // Clone to preserve original & cache

                            if (textureSrc) {
                                newMaterial.map = textureLoader.load(textureSrc);
                            }
                            if (normalMapSrc) {
                                newMaterial.normalMap = textureLoader.load(normalMapSrc);
                            }
                            if (roughnessMapSrc) {
                                // If the material is MeshStandardMaterial or MeshPhysicalMaterial, it will have roughnessMap
                                if (newMaterial.isMeshStandardMaterial || newMaterial.isMeshPhysicalMaterial) {
                                    newMaterial.roughnessMap = textureLoader.load(roughnessMapSrc);
                                }
                            }
                            if (alphaMapSrc) {
                                newMaterial.alphaMap = textureLoader.load(alphaMapSrc);
                                newMaterial.transparent = true; // Necessary for alphaMap to work
                            }

                            // Apply brain-specific material properties that worked in the HTML viewer
                            if (newMaterial.isMeshStandardMaterial || newMaterial.isMeshPhysicalMaterial) {
                                // Set pink base color like in the HTML viewer
                                newMaterial.color.setHex(0xecb29f);
                                // Set metalness and roughness for shininess
                                newMaterial.metalness = 0.3;
                                newMaterial.roughness = 0.5;
                                // Ensure it's not transparent unless alpha map is used
                                if (!alphaMapSrc) {
                                    newMaterial.transparent = false;
                                    newMaterial.opacity = 1.0;
                                }
                            }

                            // Ensure PBR materials have some base roughness/metalness if maps aren't fully defining them
                            // This is a gentle touch; if the GLTF already has these, they are preserved by clone.
                            // Only set if the maps aren't present and the values are at their defaults (e.g. roughness 1)
                            if (newMaterial.isMeshStandardMaterial || newMaterial.isMeshPhysicalMaterial) {
                                if (!newMaterial.roughnessMap && newMaterial.roughness === 1.0) {
                                    newMaterial.roughness = 0.7; // Default if no map and fully rough
                                }
                                if (!newMaterial.metalnessMap && newMaterial.metalness === 0.0) {
                                     // Don't set metalness by default unless specified, to preserve non-metallic originals
                                }
                            }
                            
                            newMaterial.needsUpdate = true;
                            return newMaterial;
                        });

                        if (Array.isArray(originalMaterial)) {
                            child.material = newMaterials.filter(m => m !== null);
                        } else if (newMaterials[0]) {
                            child.material = newMaterials[0];
                        }
                    }
                });
            }
        }

        let baseScaleToApply = new THREE.Vector3(1,1,1);
        if (assetLibEntry.refSrc && assetLibEntry.baseProperties.scaleRelativeToRef) {
            let refGltfSceneNode;
            if (loadedGltfCache.has(assetLibEntry.refSrc)) {
                refGltfSceneNode = loadedGltfCache.get(assetLibEntry.refSrc);
            } else {
                const refGltf = await gltfLoaderInstance.loadAsync(assetLibEntry.refSrc);
                loadedGltfCache.set(assetLibEntry.refSrc, refGltf.scene);
                refGltfSceneNode = refGltf.scene;
            }
            // getBoundingMaxDimension is now local to this module
            const modelNativeSize = getBoundingMaxDimension(assetInstanceRoot);
            const refNativeSize = getBoundingMaxDimension(refGltfSceneNode);
            if (modelNativeSize > 1e-5 && refNativeSize > 1e-5) {
                const factor = (refNativeSize / modelNativeSize) * assetLibEntry.baseProperties.scaleRelativeToRef;
                baseScaleToApply.set(factor, factor, factor);
            } else {
                console.warn(`[ContentFactory] Could not determine native sizes for scaling ${assetLibEntry.nameInScene || contentBlockConfig.id}. Using direct scale.`);
                const directScale = assetLibEntry.baseProperties.scaleRelativeToRef || 1;
                baseScaleToApply.set(directScale, directScale, directScale);
            }
        } else if (assetLibEntry.baseProperties.scale) {
            baseScaleToApply.set(
                assetLibEntry.baseProperties.scale.x || 1,
                assetLibEntry.baseProperties.scale.y || 1,
                assetLibEntry.baseProperties.scale.z || 1
            );
        }
        assetInstanceRoot.scale.copy(baseScaleToApply);

        if (assetLibEntry.baseProperties.color) {
            const newColor = new THREE.Color(assetLibEntry.baseProperties.color);
            assetInstanceRoot.traverse(child => {
                if (child.isMesh && child.material) {
                    const originalMaterial = child.material;
                    const materials = Array.isArray(originalMaterial) ? originalMaterial : [originalMaterial];
                    
                    materials.forEach(mat => {
                        if (mat && mat.color) { // Check if material has a color property
                            mat.color.set(newColor);
                        }
                    });
                }
            });
            if (SHOW_GUI) console.log(`%c[ContentFactory] Applied base color ${newColor.getHexString()} to ${contentBlockConfig.id}`, 'color: coral');
        }

        if (assetLibEntry.baseProperties.brightnessBoost && assetLibEntry.baseProperties.brightnessBoost !== 1) {
            // applyBrightnessFactor is now local to this module
            applyBrightnessFactor(assetInstanceRoot, assetLibEntry.baseProperties.brightnessBoost);
            if (SHOW_GUI) console.log(`%c[ContentFactory] Applied brightness boost ${assetLibEntry.baseProperties.brightnessBoost} to ${contentBlockConfig.id}`, 'color: coral');
        }

        if (assetLibEntry.baseProperties.rotation) {
            assetInstanceRoot.rotation.set(
                assetLibEntry.baseProperties.rotation.x || 0,
                assetLibEntry.baseProperties.rotation.y || 0,
                assetLibEntry.baseProperties.rotation.z || 0
            );
        }
        if (SHOW_GUI && assetInstanceRoot) console.log(`%c[ContentFactory - ${contentBlockConfig.id}] GLTF instance created/cloned:`, 'color: darkorange', assetInstanceRoot);
        else if (SHOW_GUI && !assetInstanceRoot) console.error(`%c[ContentFactory Error - ${contentBlockConfig.id}] assetInstanceRoot is NULL after GLTF processing!`, 'color: red');

    } else if (assetLibEntry.type === "imageSprite") {
        let texture;
        console.log(`[ContentFactory DEBUG] Looking for imageSprite texture: ${assetLibEntry.textureSrc}`);
        console.log(`[ContentFactory DEBUG] Current preloadedAssetCache keys:`, Array.from(preloadedAssetCache.keys()));
        if (preloadedAssetCache && preloadedAssetCache.has(assetLibEntry.textureSrc)) {
            texture = preloadedAssetCache.get(assetLibEntry.textureSrc);
            if (SHOW_GUI) console.log(`%c[ContentFactory] Using preloaded texture ${assetLibEntry.textureSrc} for ${contentBlockConfig.id}`, 'color: darkorange');
        } else {
            console.error(`[ContentFactory Error] Texture ${assetLibEntry.textureSrc} not found in preloadedAssetCache! Ensure it was registered and loaded.`);
            return null;
        }
        const material = new THREE.MeshBasicMaterial({
            map: texture, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide
        });
        const geometry = new THREE.PlaneGeometry(1, 1);
        assetInstanceRoot = new THREE.Mesh(geometry, material);
        if (SHOW_GUI && assetInstanceRoot) console.log(`%c[ContentFactory - ${contentBlockConfig.id}] Sprite instance created:`, 'color: darkorange', assetInstanceRoot);
        else if (SHOW_GUI && !assetInstanceRoot) console.error(`%c[ContentFactory Error - ${contentBlockConfig.id}] assetInstanceRoot is NULL after Sprite processing!`, 'color: red');

        if (assetLibEntry.baseProperties.scale) {
            assetInstanceRoot.scale.set(
                assetLibEntry.baseProperties.scale.x || 1,
                assetLibEntry.baseProperties.scale.y || 1,
                assetLibEntry.baseProperties.scale.z || 1
            );
        }
    } else if (assetLibEntry.type === "physicalGlassCard") {
        const baseProps = assetLibEntry.baseProperties;
        // Merge instance-specific properties over base properties
        const instanceProps = contentBlockConfig.properties || {};
        const effectiveProps = { ...baseProps, ...instanceProps };
        // If padding is an object, ensure deep merge for padding
        if (baseProps.padding && instanceProps.padding) {
            effectiveProps.padding = { ...baseProps.padding, ...instanceProps.padding };
        } else if (instanceProps.padding) {
            effectiveProps.padding = { ...instanceProps.padding };
        }

        const cardGroup = new THREE.Group();
        // cardGroup.name will be set later from assetLibEntry.nameInScene or contentBlockConfig.id

        const glassMaterial = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(effectiveProps.glassColor !== undefined ? effectiveProps.glassColor : 0xffffff),
            roughness: effectiveProps.glassRoughness !== undefined ? effectiveProps.glassRoughness : 0.3,
            metalness: effectiveProps.glassMetalness !== undefined ? effectiveProps.glassMetalness : 0.0,
            transmission: effectiveProps.glassTransmission !== undefined ? effectiveProps.glassTransmission : 1.0,
            thickness: effectiveProps.glassThickness !== undefined ? effectiveProps.glassThickness : 0.0,
            ior: effectiveProps.glassIOR !== undefined ? effectiveProps.glassIOR : 1.5,
            transparent: true,
            opacity: effectiveProps.glassOpacity !== undefined ? effectiveProps.glassOpacity : 1.0,
            envMapIntensity: effectiveProps.envMapIntensity !== undefined ? effectiveProps.envMapIntensity : 1.0,
            specularIntensity: effectiveProps.specularIntensity !== undefined ? effectiveProps.specularIntensity : 0.1,
            side: THREE.DoubleSide,
        });

        // Initial placeholder geometry (1x1 with small radius)
        // Will be updated by sizing logic if auto-sizing, or by instance-specific width/height.
        const initialWidth = contentBlockConfig.width || effectiveProps.defaultWidth || 1;
        const initialHeight = contentBlockConfig.height || effectiveProps.defaultHeight || 1;
        const initialRadiusFactor = effectiveProps.cornerRadiusFactor !== undefined ? effectiveProps.cornerRadiusFactor : 0.1;
        const initialCornerRadius = Math.min(initialWidth, initialHeight) * initialRadiusFactor;

        const initialShape = createRoundedRectShape(initialWidth, initialHeight, initialCornerRadius);
        const glassGeometry = new THREE.ShapeGeometry(initialShape);
        const glassPaneMesh = new THREE.Mesh(glassGeometry, glassMaterial);
        glassPaneMesh.name = "GlassPane";
        glassPaneMesh.renderOrder = contentBlockConfig.renderOrder || 0;
        cardGroup.add(glassPaneMesh);

        contentBlockConfig._physicalGlassCardData = {
            group: cardGroup,
            paneMesh: glassPaneMesh,
            material: glassMaterial,
            effectiveProps: effectiveProps, // Store effectiveProps
            // Store padding and cornerRadiusFactor for sizing logic
            padding: { ...(effectiveProps.padding || { top: 0.1, right: 0.1, bottom: 0.1, left: 0.1 }) },
            cornerRadiusFactor: initialRadiusFactor,
            // Store explicit width/height from instance config if provided
            fixedWidth: contentBlockConfig.width,
            fixedHeight: contentBlockConfig.height,
        };

        if (effectiveProps.borderEnabled) {
            const borderMaterial = new THREE.LineBasicMaterial({
                color: new THREE.Color(effectiveProps.borderColor !== undefined ? effectiveProps.borderColor : 0x00ff00),
                // linewidth: baseProps.borderThickness || 1, // linewidth has limitations
            });
            const borderGeometry = new THREE.BufferGeometry().setFromPoints(initialShape.getPoints());
            const borderLine = new THREE.LineLoop(borderGeometry, borderMaterial);
            borderLine.name = "GlassBorder";
            borderLine.position.z = effectiveProps.borderZOffset !== undefined ? effectiveProps.borderZOffset : 0.005;
            borderLine.renderOrder = (contentBlockConfig.renderOrder || 0) + 1;
            cardGroup.add(borderLine);
            contentBlockConfig._physicalGlassCardData.borderMesh = borderLine;
            contentBlockConfig._physicalGlassCardData.borderMaterial = borderMaterial;
        }
        assetInstanceRoot = cardGroup;
        if (SHOW_GUI) console.log(`%c[ContentFactory - ${contentBlockConfig.id}] PhysicalGlassCard instance created:`, 'color: cyan', assetInstanceRoot);
    } else {
        console.error(`[ContentFactory Error] Unknown asset type in library: "${assetLibEntry.type}" for ${contentBlockConfig.id}`);
        return null; // Early exit if unknown type
    }

    // If assetInstanceRoot is still undefined here, it means neither GLTF nor imageSprite logic successfully created it.
    if (!assetInstanceRoot) {
        console.error(`%c[ContentFactory Error - ${contentBlockConfig.id}] assetInstanceRoot is still not defined before final assignment (type: ${assetLibEntry.type}). Check loading logic or asset paths.`, 'color:red');
        return null; // Early exit if mesh/group wasn't created
    }

    assetInstanceRoot.name = assetLibEntry.nameInScene || contentBlockConfig.id;

    if (contentBlockConfig.position) {
        assetInstanceRoot.position.set(
            contentBlockConfig.position.x || 0,
            contentBlockConfig.position.y || 0,
            contentBlockConfig.position.z || 0
        );
    }
    if (contentBlockConfig.rotation) {
        // Ensure we are working with 'XYZ' order consistently for these additions
        assetInstanceRoot.rotation.order = 'XYZ'; // Explicitly set/keep default order

        // Add instance-specific rotation offsets to the current 'XYZ' Euler angles
        assetInstanceRoot.rotation.x += contentBlockConfig.rotation.x || 0;
        assetInstanceRoot.rotation.y += contentBlockConfig.rotation.y || 0;
        assetInstanceRoot.rotation.z += contentBlockConfig.rotation.z || 0;
    }
    if (contentBlockConfig.scale) {
        assetInstanceRoot.scale.x *= contentBlockConfig.scale.x || 1;
        assetInstanceRoot.scale.y *= contentBlockConfig.scale.y || 1;
        assetInstanceRoot.scale.z *= contentBlockConfig.scale.z || 1;
    }
    
    parentAnchor.add(assetInstanceRoot);
    contentBlockConfig.createdMesh = assetInstanceRoot; // Store the created mesh
    if (SHOW_GUI) {
        console.log(`%c[ContentFactory] Assigned createdMesh to blockConfig '${contentBlockConfig.id}':`, 'color: lightblue', contentBlockConfig.createdMesh); // The log you added
        // Log the whole blockConfig to see if the property sticks immediately
        console.log(`%c[ContentFactory] Full blockConfig for '${contentBlockConfig.id}' after assignment:`, 'color: lightcyan', JSON.parse(JSON.stringify(contentBlockConfig))); // Use stringify to see a snapshot
    }

    if (SHOW_GUI) console.log(`%c[ContentFactory] Created asset "${assetInstanceRoot.name}" for ${parentAnchor.name}`, 'color: coral');
    return assetInstanceRoot;
}

export async function resolveSceneContentRelationshipsAndSizing(sceneConfig, SHOW_GUI, sceneAnchor) {
    const blocksById = new Map();
    sceneConfig.contentBlocks.forEach(cb => blocksById.set(cb.id, cb));

    // --- Pass 1: Parent items to their designated parents ---
    for (const blockConfig of sceneConfig.contentBlocks) {
        if (blockConfig.parentIdInScene && blockConfig.createdMesh) {
            const parentBlockConfig = blocksById.get(blockConfig.parentIdInScene);
            if (parentBlockConfig && parentBlockConfig.createdMesh) {
                parentBlockConfig.createdMesh.add(blockConfig.createdMesh); // Add child to parent

                // Set local transform of the child relative to the parent
                if (blockConfig.position) {
                    blockConfig.createdMesh.position.set(blockConfig.position.x || 0, blockConfig.position.y || 0, blockConfig.position.z || 0);
                }
                if (blockConfig.rotation) {
                    blockConfig.createdMesh.rotation.set(blockConfig.rotation.x || 0, blockConfig.rotation.y || 0, blockConfig.rotation.z || 0);
                }
                if (blockConfig.scale) {
                    blockConfig.createdMesh.scale.set(blockConfig.scale.x || 1, blockConfig.scale.y || 1, blockConfig.scale.z || 1);
                }
                blockConfig.createdMesh.updateMatrix();
                if (SHOW_GUI) console.log(`%c[Relationships] Parented '${blockConfig.id}' to '${blockConfig.parentIdInScene}'.`, 'color: orange');
            } else {
                if (SHOW_GUI) console.warn(`[Relationships] Parent block '${blockConfig.parentIdInScene}' not found or its mesh not created for child '${blockConfig.id}'.`);
            }
        }
    }

    // --- Pass 2: Size PhysicalGlassCards based on content or fixed dimensions ---
    for (const blockConfig of sceneConfig.contentBlocks) {
        if (blockConfig.type === "asset" && blockConfig._physicalGlassCardData) {
            const cardData = blockConfig._physicalGlassCardData;
            const cardGroup = cardData.group;
            const cardPaneMesh = cardData.paneMesh;
            const cardPadding = cardData.padding;
            const cornerRadiusFactor = cardData.cornerRadiusFactor;

            let desiredWidth, desiredHeight;
            let hasContentForSizing = false; // Initialize here
            let contentBoundingBox = new THREE.Box3(); // Initialize here for auto-sizing case

            if (cardData.fixedWidth !== undefined && cardData.fixedHeight !== undefined) {
                // Use fixed dimensions if provided in instance config
                desiredWidth = cardData.fixedWidth;
                desiredHeight = cardData.fixedHeight;
                if (SHOW_GUI) console.log(`%c[SizingDebug - ${blockConfig.id}] Card using fixed dimensions W: ${desiredWidth}, H: ${desiredHeight}.`, 'color: turquoise');
            } else {
                // Auto-size based on content
                const childSyncPromises = [];

                cardGroup.children.forEach(childMesh => {
                    if (childMesh !== cardPaneMesh && (!cardData.borderMesh || childMesh !== cardData.borderMesh)) {
                        if (childMesh.isTroikaText && typeof childMesh.sync === 'function') {
                            childSyncPromises.push(new Promise(resolve => childMesh.sync(resolve)));
                        }
                    }
                });
                await Promise.all(childSyncPromises); // Wait for text sync

                cardGroup.children.forEach(childMesh => {
                    childMesh.updateMatrixWorld(true);
                    if (childMesh !== cardPaneMesh && (!cardData.borderMesh || childMesh !== cardData.borderMesh)) {
                        if (SHOW_GUI && childMesh.isTroikaText) {
                            console.log(`%c[SizingDebug - ${blockConfig.id}] Child text '${childMesh.text?.substring(0,20)}...' local pos in card: (${childMesh.position.x.toFixed(2)}, ${childMesh.position.y.toFixed(2)}, ${childMesh.position.z.toFixed(2)})`, 'color: coral');
                        }

                        // We need the bounding box of the childMesh (e.g., the textGroup)
                        // *in the coordinate system of the cardGroup*.
                        // The childMesh.matrix is its local transform relative to cardGroup.
                        // We iterate through the *actual renderable children* of the textGroup (the Troika meshes)
                        // and transform their bounding boxes into the cardGroup's space.

                        if (childMesh.isGroup) { // Assuming childMesh is the textGroup
                            childMesh.traverse(grandChild => {
                                grandChild.updateMatrixWorld(true);
                                if (grandChild.isMesh && grandChild.geometry && grandChild.geometry.boundingBox && !grandChild.geometry.boundingBox.isEmpty()) {
                                    const grandChildBBox = grandChild.geometry.boundingBox.clone();
                                    // Need matrix from grandChild to cardGroup
                                    // grandChild.matrixWorld would be to the scene.
                                    // We need grandChild.matrix (local to its parent, the textGroup)
                                    // then textGroup.matrix (local to cardGroup)
                                    const matrixToCardGroup = new THREE.Matrix4().multiplyMatrices(
                                        childMesh.matrix, // textGroup's matrix relative to cardGroup
                                        grandChild.matrix // individual text line/word's matrix relative to textGroup
                                    );
                                    grandChildBBox.applyMatrix4(matrixToCardGroup);
                                    contentBoundingBox.union(grandChildBBox);
                                    hasContentForSizing = true;
                                     if (SHOW_GUI) {
                                        console.log(`%c[SizingDebug - ${blockConfig.id}] GrandChild '${grandChild.name}' bbox (in card space): Min(${grandChildBBox.min.x.toFixed(2)},${grandChildBBox.min.y.toFixed(2)}), Max(${grandChildBBox.max.x.toFixed(2)},${grandChildBBox.max.y.toFixed(2)})`, 'color: lightblue');
                                    }
                                }
                            });
                        } else if (childMesh.isMesh && childMesh.geometry && childMesh.geometry.boundingBox) { // If child is a direct mesh
                            const tempBox = childMesh.geometry.boundingBox.clone();
                            tempBox.applyMatrix4(childMesh.matrix); // Transform to cardGroup's local space
                            if (!tempBox.isEmpty()) {
                                contentBoundingBox.union(tempBox);
                                hasContentForSizing = true;
                            }
                        } else {
                            const childBoxLocalToChild = new THREE.Box3().setFromObject(childMesh);
                            if (!childBoxLocalToChild.isEmpty()){ // Fallback for non-geometry based objects or groups
                                const tempBox = childBoxLocalToChild.clone(); // Already somewhat local if direct child
                                // This might need more robust local space conversion if children are deeply nested.
                                contentBoundingBox.union(tempBox);
                                hasContentForSizing = true;
                            }
                        }
                    }
                });

                if (hasContentForSizing) {
                    const contentSize = contentBoundingBox.getSize(new THREE.Vector3());
                    desiredWidth = contentSize.x + (cardPadding.left || 0) + (cardPadding.right || 0);
                    desiredHeight = contentSize.y + (cardPadding.top || 0) + (cardPadding.bottom || 0); // This is height of the content's bbox + padding
                } else {
                    desiredWidth = cardData.effectiveProps.defaultWidth !== undefined ? cardData.effectiveProps.defaultWidth : 1;
                    desiredHeight = cardData.effectiveProps.defaultHeight !== undefined ? cardData.effectiveProps.defaultHeight : 1;
                }
                if (SHOW_GUI && cardData.fixedWidth === undefined && hasContentForSizing) { // Log only if auto-sizing AND has content
                    const contentSize = new THREE.Vector3(); contentBoundingBox.getSize(contentSize);
                    console.log(`%c[SizingDebug - ${blockConfig.id}] FINAL Content BBox for Sizing (local to card): Min(${contentBoundingBox.min.x.toFixed(2)}, ${contentBoundingBox.min.y.toFixed(2)}), Max(${contentBoundingBox.max.x.toFixed(2)}, ${contentBoundingBox.max.y.toFixed(2)}). Size: W ${contentSize.x.toFixed(2)}, H ${contentSize.y.toFixed(2)}`, 'color: fuchsia');
                }
            }

            desiredWidth = Math.max(0.01, desiredWidth);
            desiredHeight = Math.max(0.01, desiredHeight);
            const actualCornerRadius = Math.min(desiredWidth, desiredHeight) * cornerRadiusFactor;

            const newShape = createRoundedRectShape(desiredWidth, desiredHeight, actualCornerRadius);
            if (cardPaneMesh.geometry) cardPaneMesh.geometry.dispose();
            cardPaneMesh.geometry = new THREE.ShapeGeometry(newShape);

            if (cardData.borderMesh) {
                if (cardData.borderMesh.geometry) cardData.borderMesh.geometry.dispose();
                cardData.borderMesh.geometry = new THREE.BufferGeometry().setFromPoints(newShape.getPoints());
            }

            // After resizing the card, the card's origin (0,0) is its center.
            // The text was parented and positioned at (e.g.) (0,0,0.01) relative to the card's *original* (0,0).
            // This local position of the text does not change when the card resizes.
            // The card effectively expands/contracts around the text's local position.
            // If the text's own origin (due to anchorY and group centering) is its visual middle,
            // and it's placed at (0,0,z) in the card, it should remain visually centered in the card.
            if (SHOW_GUI) {
                 console.log(`%c[SizingDebug - ${blockConfig.id}] Card pane mesh position (local to cardGroup): (${cardPaneMesh.position.x.toFixed(2)}, ${cardPaneMesh.position.y.toFixed(2)})`, 'color: magenta');
            }
            // Content within the card is already positioned locally. The card expands/contracts around it.
        }
    }
}