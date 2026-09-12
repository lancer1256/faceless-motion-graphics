// src/utils/DeterministicPlayer.js
import { setFrameTime } from './FrameClock.js';
// renderFrameCallback will be set after instantiation.

export class DeterministicPlayer {
    fps = 30; // this is the fallback FPS if none is provided in word timings basic file 
    isPlaying = false;

    #rafID = null;
    #playStartRealTime = 0; // performance.now() when play() was called
    #playStartFrame = 0;    // currentFrame when play() was called

    // This callback will be set to the main renderFrame function.
    renderFrameCallback = () => {
        console.warn("DeterministicPlayer: renderFrameCallback has not been set!");
    };

    constructor(renderFrameFunc) {
        if (renderFrameFunc && typeof renderFrameFunc === 'function') {
            this.renderFrameCallback = renderFrameFunc;
        }
    }

    play() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.#playStartRealTime = performance.now();
        this.#playStartFrame = this.currentFrame;

        const tick = (realTime) => {
            if (!this.isPlaying) { // Check if pause() was called since last tick
                if (this.#rafID) cancelAnimationFrame(this.#rafID);
                this.#rafID = null;
                return;
            }

            const elapsedTimeMs = realTime - this.#playStartRealTime;
            this.currentFrame = this.#playStartFrame + Math.floor(elapsedTimeMs * this.fps / 1000);

            // Optional: Clamp to timeline duration if masterTimeline is available in coreContext
            // This requires coreContext to be imported or masterTimeline duration passed somehow.
            // For now, let's assume it plays indefinitely or is clamped by calling code.

            setFrameTime(this.currentFrame / this.fps);
            this.renderFrameCallback(); // Call the main render function
            this._updateUIDebug(); // Update debug UI if present

            // keep the scrubber in sync while playing
            const scrub = document.getElementById('timeline-scrubber');
            if (scrub) scrub.value = this.currentFrame;

            this.#rafID = requestAnimationFrame(tick);
        };
        this.#rafID = requestAnimationFrame(tick);
        this._togglePlayButtons(true);
    }

    pause() {
        if (!this.isPlaying) return;
        this.isPlaying = false;
        if (this.#rafID) {
            cancelAnimationFrame(this.#rafID);
            this.#rafID = null;
        }
        // currentFrame already holds the frame at which it was paused.
        this._updateUIDebug();
        this._togglePlayButtons(false);
    }

    gotoFrame(frameNumber) {
        // const wasPlaying = this.isPlaying; // If you want to resume play after seek
        if (this.isPlaying) {
            this.pause();
        }
        this.currentFrame = Math.max(0, parseInt(frameNumber, 10) || 0);

        // Optional: Clamp to timeline duration
        // (Requires access to masterTimeline.duration())

        setFrameTime(this.currentFrame / this.fps);
        this.renderFrameCallback(); // Call the main render function
        this._updateUIDebug();

        // Optional: Resume playing if it was playing before seek
        // if (wasPlaying) this.play(); 
        // For strict After Effects style, seeking usually implies pause.
    }

    step(frameCount = 1) {
        this.gotoFrame(this.currentFrame + frameCount);
    }

    get time() {
        return this.currentFrame / this.fps;
    }

    set time(newTimeInSeconds) {
        this.gotoFrame(Math.floor(newTimeInSeconds * this.fps));
    }

    // Helper to update debug UI (scrubber, progress display)
    // This should be called from play's tick, pause, and gotoFrame.
    _updateUIDebug() {
        if (typeof document === 'undefined' || !document.getElementById) return; // Basic check for browser

        const scrubberElement = document.getElementById('timeline-scrubber');
        if (scrubberElement) {
            scrubberElement.value = this.currentFrame;
        }

        const timeEl = document.getElementById('time-display');
        if (timeEl) {
            const secs = (this.currentFrame / this.fps).toFixed(2);
            timeEl.textContent = `${secs} s (f${this.currentFrame})`;
        }
        
        // Add debug info for sword - search in scene config structure
        const swordDebugEl = document.getElementById('sword-debug');
        if (swordDebugEl) {
            if (!window.core) {
                swordDebugEl.innerHTML = "<span style='color:orange'>DEBUG: window.core is not available</span>";
                return;
            }
            
            // Find the sword mesh by searching through the scene config structure
            let swordMesh = null;
            let searchCount = 0;
            
            // Log the core structure to help with debugging
            if (searchCount === 0) {
                searchCount++;
            }
            
            // Try to find the sword in the scene config
            if (window.core.scenesConfig) {
                for (const sceneCfg of window.core.scenesConfig) {
                    if (sceneCfg.contentBlocks) {
                        for (const blockCfg of sceneCfg.contentBlocks) {
                            // Look for a block with id containing "sword" or specific sword id
                            if (blockCfg.id && blockCfg.id.toLowerCase().includes('sword') && blockCfg.createdMesh) {
                                swordMesh = blockCfg.createdMesh;
                                swordDebugEl.innerHTML = `
                                    <strong>${blockCfg.id} Position:</strong><br>
                                    X: ${swordMesh.position.x.toFixed(2)}<br>
                                    Y: ${swordMesh.position.y.toFixed(2)}<br>
                                    Z: ${swordMesh.position.z.toFixed(2)}<br>
                                    <strong>${blockCfg.id} Rotation:</strong><br>
                                    X: ${swordMesh.rotation.x.toFixed(2)} rad (${(swordMesh.rotation.x * 180 / Math.PI).toFixed(1)}°)<br>
                                    Y: ${swordMesh.rotation.y.toFixed(2)} rad (${(swordMesh.rotation.y * 180 / Math.PI).toFixed(1)}°)<br>
                                    Z: ${swordMesh.rotation.z.toFixed(2)} rad (${(swordMesh.rotation.z * 180 / Math.PI).toFixed(1)}°)
                                `;
                                return;
                            }
                        }
                    }
                }
                
                // If we get here, we didn't find the sword
                swordDebugEl.innerHTML = "<span style='color:orange'>No sword meshes found in scenesConfig</span>";
                console.log("Available scenes:", window.core.scenesConfig.map(s => s.id));
                
                // Try to show any mesh found for debugging
                let anyMeshFound = false;
                for (const sceneCfg of window.core.scenesConfig) {
                    if (sceneCfg.contentBlocks) {
                        for (const blockCfg of sceneCfg.contentBlocks) {
                            if (blockCfg.createdMesh) {
                                swordDebugEl.innerHTML += `<br><span style='color:cyan'>Found mesh: ${blockCfg.id}</span>`;
                                anyMeshFound = true;
                                // Only show the first one we find
                                break;
                            }
                        }
                        if (anyMeshFound) break;
                    }
                }
                
                if (!anyMeshFound) {
                    swordDebugEl.innerHTML += "<br><span style='color:red'>No meshes found at all</span>";
                }
            } else {
                swordDebugEl.innerHTML = "<span style='color:orange'>core.scenesConfig not available</span>";
            }
        }
    }

    /* --- helper toggles ▶ / ❚❚ buttons --------------------------- */
    _togglePlayButtons(isPlayingNow) {
        const playBtn  = document.getElementById('btn-play');
        const pauseBtn = document.getElementById('btn-pause');
        if (playBtn)  playBtn.disabled  =  isPlayingNow;
        if (pauseBtn) pauseBtn.disabled = !isPlayingNow;
    }
}
