# Programmatic 3D After Effects-Style Video Generation

**Built: May–June 2025**

A program for generating complete 3D After Effects-style videos in code: creative planning, animated typography, 3D asset sourcing and selection, and After Effects-style null-stacked camera movements.

The agent pipeline takes in an audio file, then finds 3D assets on Sketchfab, uses a VLLM to orient the asset properly, determines typography style and camera motion, and generates the full video.

This is a sanitized snapshot of the original `live-editing` history at commit
`f3e6c4639` (`v1 full video`, May 22, 2025). Prototype credentials, debug dumps,
generated frame sequences, and unrelated experiments are not included.

## Demo

- [`demo/faceless-trojan-full.mp4`](demo/faceless-trojan-full.mp4) is the 1080×1920, 60 fps, 27.88-second Trojan horse composition. The historical renderer produced this visual-only MP4 with no audio track.
- [`demo/faceless-lifes-work.mp4`](demo/faceless-lifes-work.mp4) is the 27.77-second “life's work” founder composition rendered in June 2025.

## Requirements

- Node.js 20.17 or newer
- Google Chrome or Chromium
- FFmpeg on `PATH`
- The local asset pack listed in [`assets/REQUIRED_ASSETS.md`](assets/REQUIRED_ASSETS.md)

## Preview

```bash
npm ci
npm run serve:render
```

Then open:

```text
http://127.0.0.1:8081/word_timings_basic.html?deterministicOutput=true
```

Add `&showGui=true` when you want the editor controls. Deterministic mode hides
them so they are never burned into an export.

## Render

Keep the preview server running, then use a second terminal:

```bash
npm run render:parallel
```

The exporter probes the composition, splits the full frame range across four
headless Chrome workers, validates the completed sequence, and encodes
`renders/faceless-trojan-full.mp4` with FFmpeg.

Useful overrides:

```bash
FACELESS_WORKERS=4 \
FACELESS_OUTPUT=/absolute/path/video.mp4 \
FACELESS_FRAMES_DIR=/absolute/path/temporary-frames \
PUPPETEER_EXECUTABLE_PATH=/absolute/path/to/chrome \
npm run render:parallel
```

## Project layout

- `src/config/sceneSequenceConfig.js` — 22-scene composition and camera path
- `src/config/textLibraryConfig.js` — timed transcript and text animation styles
- `src/config/assetLibraryConfig.js` — model, texture, and material definitions
- `src/utils/DeterministicPlayer.js` — exact frame seeking
- `scripts/render_parallel.js` — parallel capture and FFmpeg assembly
- `word_timings_basic.html` — browser render entry point

## Assets and redistribution

The original local prototype used third-party GLB models, textures, emoji
images, and Apple's SF Pro font. Those binaries are kept out of Git until their
redistribution rights are reviewed. The required filenames and directory layout
are documented in `assets/REQUIRED_ASSETS.md`; place licensed copies there to
reproduce the render.

## License

Source code is provided under the ISC License. Third-party assets are not
covered by that license.
