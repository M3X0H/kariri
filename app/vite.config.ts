import { createReadStream, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/* The portrait, the share card and the CVs live at the repository root,
   next to the published index.html, because that is what GitHub Pages
   serves. In dev the Vite root is app/, one level below them, so `./me.jpg`
   fell through to the SPA fallback and came back as index.html — the hero
   portrait rendered as its alt text and the CV link downloaded markup.
   Serving them here costs nothing at build time and makes `npm run dev`
   show the actual site. */
const TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.pdf': 'application/pdf'
};

function repoRootAssets(): Plugin {
  const root = path.resolve(import.meta.dirname, '..');
  const allowed = new Set(['me.jpg', 'og.jpg', 'CVMK.pdf', 'Cvm.pdf']);

  return {
    name: 'kariri-repo-root-assets',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const name = decodeURIComponent((req.url ?? '').split('?')[0]).replace(/^\/+/, '');
        if (!allowed.has(name)) return next();

        const file = path.join(root, name);
        if (!existsSync(file)) return next();

        res.setHeader('Content-Type', TYPES[path.extname(name).toLowerCase()] ?? 'application/octet-stream');
        res.setHeader('Content-Length', statSync(file).size);
        createReadStream(file).pipe(res);
      });
    }
  };
}

/* Builds to app/dist; scripts/publish.mjs then copies the result to the
   repository root, which is what GitHub Pages serves. Vite refuses an
   outDir above its own root, hence the explicit publish step. */
export default defineConfig({
  plugins: [react(), tailwindcss(), repoRootAssets()],
  base: './',
  build: {
    target: 'es2020',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        /* Three is pulled in only by the hero, and only on capable
           devices, so it stays in its own chunk and never blocks paint.

           The two motion engines are split out from app code because they
           are the heavy, rarely-changing half of the bundle: a copy edit
           then reships ~40 kB of app chunk instead of half a megabyte, and
           the browser fetches all three in parallel on a cold load. */
        manualChunks: {
          three: ['three'],
          motion: ['framer-motion'],
          gsap: ['gsap', 'gsap/ScrollTrigger']
        }
      }
    }
  }
});
