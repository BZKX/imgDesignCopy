#!/usr/bin/env node
// Normalize any screenshots (png/jpg) to the Chrome Web Store sizes (1280x800).
// - Drop your raw screenshots into store-assets/screenshots-raw/
// - Run: node scripts/normalize-screenshots.mjs
// - Get 1280x800 PNGs in store-assets/screenshots/
//
// Strategy per file:
//   1. If aspect ratio matches 1280:800 (1.6), resize directly.
//   2. Otherwise, "contain" (letterbox) on a neutral dark canvas matching
//      the PromptLens brand, so you never crop out content.

import sharp from 'sharp';
import { readdir, mkdir } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(new URL('.', import.meta.url).pathname, '..');
const RAW = path.join(ROOT, 'store-assets', 'screenshots-raw');
const OUT = path.join(ROOT, 'store-assets', 'screenshots');

const TARGET_W = 1280;
const TARGET_H = 800;
const TARGET_RATIO = TARGET_W / TARGET_H; // 1.6

// Background color for letterboxing — matches site bg
const BG = { r: 13, g: 13, b: 22, alpha: 1 };

async function main() {
  await mkdir(OUT, { recursive: true });
  const files = (await readdir(RAW)).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));

  if (files.length === 0) {
    console.log(`No files in ${RAW}`);
    console.log(`Drop your screenshots there and rerun.`);
    return;
  }

  for (const f of files) {
    const src = path.join(RAW, f);
    const base = path.basename(f, path.extname(f));
    const dst = path.join(OUT, `${base}.png`);

    const img = sharp(src);
    const meta = await img.metadata();
    const srcW = meta.width, srcH = meta.height;
    const srcRatio = srcW / srcH;

    let pipeline;
    if (Math.abs(srcRatio - TARGET_RATIO) < 0.01) {
      // Same aspect ratio — straight resize
      pipeline = img.resize(TARGET_W, TARGET_H, { fit: 'cover' });
    } else {
      // Different ratio — letterbox into 1280x800 canvas
      pipeline = img.resize(TARGET_W, TARGET_H, {
        fit: 'contain',
        background: BG,
      });
    }

    await pipeline.png({ compressionLevel: 9 }).toFile(dst);
    console.log(`✓ ${f}  (${srcW}×${srcH}) → ${base}.png (1280×800)`);
  }

  console.log(`\nAll done. Upload files in ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
