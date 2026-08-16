/* Copies the Vite build from app/dist to the repository root, which is
   what GitHub Pages serves. Only the generated surface is touched:
   index.html and assets/. Everything else at the root (me.jpg, og.jpg,
   the CVs, README, app/) is left alone. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(here, '..', 'dist');
const root = path.resolve(here, '..', '..');

if (!fs.existsSync(dist)) {
  console.error('publish: no dist/ — run vite build first');
  process.exit(1);
}

// Hashed filenames would otherwise pile up release after release.
const assets = path.join(root, 'assets');
fs.rmSync(assets, { recursive: true, force: true });

let copied = 0;
function copyInto(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dest = path.join(to, entry.name);
    if (entry.isDirectory()) copyInto(src, dest);
    else { fs.copyFileSync(src, dest); copied++; }
  }
}

copyInto(dist, root);
console.log(`publish: ${copied} file(s) -> repository root`);
