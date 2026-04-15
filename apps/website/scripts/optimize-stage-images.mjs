import sharp from 'sharp';
import { readdir, stat } from 'node:fs/promises';
import { join, parse } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../public/stage/', import.meta.url));
const MAX_EDGE = 1600;
const QUALITY = 85;

async function walk(dir) {
  const out = [];
  for (const name of await readdir(dir)) {
    const full = join(dir, name);
    const s = await stat(full);
    if (s.isDirectory()) out.push(...(await walk(full)));
    else if (/\.png$/i.test(name)) out.push(full);
  }
  return out;
}

const files = await walk(ROOT);
let totalBefore = 0, totalAfter = 0;

for (const src of files) {
  const { dir, name } = parse(src);
  const dest = join(dir, `${name}.webp`);
  const before = (await stat(src)).size;
  const meta = await sharp(src).metadata();
  const long = Math.max(meta.width ?? 0, meta.height ?? 0);
  const pipeline = sharp(src).rotate(); // auto-orient via EXIF
  if (long > MAX_EDGE) {
    pipeline.resize({
      width: meta.width > meta.height ? MAX_EDGE : undefined,
      height: meta.height >= meta.width ? MAX_EDGE : undefined,
      fit: 'inside',
      withoutEnlargement: true,
    });
  }
  await pipeline.webp({ quality: QUALITY, effort: 6 }).toFile(dest);
  const after = (await stat(dest)).size;
  totalBefore += before;
  totalAfter += after;
  const ratio = ((1 - after / before) * 100).toFixed(1);
  console.log(
    `${src.replace(ROOT, '')}  ${(before / 1024 / 1024).toFixed(2)} MB → ${(after / 1024).toFixed(0)} KB  (-${ratio}%)`
  );
}

console.log(
  `\nTotal: ${(totalBefore / 1024 / 1024).toFixed(1)} MB → ${(totalAfter / 1024 / 1024).toFixed(1)} MB  (-${(((1 - totalAfter / totalBefore) * 100)).toFixed(1)}%)`
);
