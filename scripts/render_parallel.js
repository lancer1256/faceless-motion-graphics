const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');
const puppeteer = require('puppeteer');

const URL = process.env.FACELESS_RENDER_URL ||
  'http://127.0.0.1:8081/word_timings_basic.html?deterministicOutput=true';
const CHROME = process.env.PUPPETEER_EXECUTABLE_PATH ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const WORKERS = Math.max(1, Number(process.env.FACELESS_WORKERS || 4));
const WIDTH = Number(process.env.FACELESS_WIDTH || 1080);
const HEIGHT = Number(process.env.FACELESS_HEIGHT || 1920);
const FRAME_DIR = process.env.FACELESS_FRAMES_DIR ||
  path.join(os.tmpdir(), 'faceless-trojan-frames');
const OUTPUT = process.env.FACELESS_OUTPUT ||
  path.resolve(__dirname, '../renders/faceless-trojan-full.mp4');

async function openReadyPage(browser) {
  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });
  page.on('pageerror', error => console.error(`PAGE ERROR: ${error.message}`));
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForFunction(
    () => window.player && typeof window.player.gotoFrame === 'function' &&
      window.core?.masterTimeline?.duration() > 0,
    { timeout: 180000 }
  );
  return page;
}

async function captureRange(workerIndex, startFrame, endFrame) {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await openReadyPage(browser);
    const canvas = await page.$('#animation-container canvas');
    if (!canvas) throw new Error('Animation canvas was not found.');

    for (let frame = startFrame; frame <= endFrame; frame += 1) {
      await page.evaluate(value => window.player.gotoFrame(value), frame);
      await canvas.screenshot({
        type: 'png',
        path: path.join(FRAME_DIR, `frame_${String(frame).padStart(5, '0')}.png`),
      });
      if ((frame - startFrame + 1) % 50 === 0 || frame === endFrame) {
        console.log(`Worker ${workerIndex + 1}: ${frame - startFrame + 1}/${endFrame - startFrame + 1}`);
      }
    }
  } finally {
    await browser.close();
  }
}

function encode(frameCount, fps) {
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  return new Promise((resolve, reject) => {
    const args = [
      '-framerate', String(fps),
      '-start_number', '0',
      '-i', path.join(FRAME_DIR, 'frame_%05d.png'),
      '-frames:v', String(frameCount),
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-preset', 'medium',
      '-crf', '20',
      '-movflags', '+faststart',
      '-y', OUTPUT,
    ];
    const child = execFile('ffmpeg', args, { maxBuffer: 20 * 1024 * 1024 });
    child.stderr.pipe(process.stderr);
    child.on('error', reject);
    child.on('exit', code => code === 0 ? resolve() : reject(new Error(`FFmpeg exited ${code}`)));
  });
}

async function main() {
  if (!fs.existsSync(CHROME)) throw new Error(`Chrome not found at ${CHROME}`);
  fs.mkdirSync(FRAME_DIR, { recursive: true });
  for (const name of fs.readdirSync(FRAME_DIR)) {
    if (/^frame_\d{5}\.png$/.test(name)) fs.unlinkSync(path.join(FRAME_DIR, name));
  }

  const probeBrowser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  let duration;
  let fps;
  try {
    const page = await openReadyPage(probeBrowser);
    ({ duration, fps } = await page.evaluate(() => ({
      duration: window.core.masterTimeline.duration(),
      fps: window.player.fps,
    })));
  } finally {
    await probeBrowser.close();
  }

  const frameCount = Math.floor(duration * fps) + 1;
  const workerCount = Math.min(WORKERS, frameCount);
  const chunkSize = Math.ceil(frameCount / workerCount);
  console.log(`${duration.toFixed(3)}s at ${fps} fps = ${frameCount} frames; ${workerCount} workers`);

  const jobs = [];
  for (let index = 0; index < workerCount; index += 1) {
    const start = index * chunkSize;
    const end = Math.min(frameCount - 1, start + chunkSize - 1);
    if (start <= end) jobs.push(captureRange(index, start, end));
  }
  await Promise.all(jobs);

  const frames = fs.readdirSync(FRAME_DIR).filter(name => /^frame_\d{5}\.png$/.test(name));
  if (frames.length !== frameCount) {
    throw new Error(`Expected ${frameCount} frames, found ${frames.length}`);
  }
  await encode(frameCount, fps);
  console.log(`Rendered ${OUTPUT}`);
}

main().then(
  () => process.exit(0),
  error => {
    console.error(error.stack || error.message);
    process.exit(1);
  }
);
