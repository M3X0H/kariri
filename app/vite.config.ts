import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/* Builds to app/dist; scripts/publish.mjs then copies the result to the
   repository root, which is what GitHub Pages serves. Vite refuses an
   outDir above its own root, hence the explicit publish step. */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  build: {
    target: 'es2020',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        // Three is pulled in only by the hero, and only on capable
        // devices, so it stays in its own chunk and never blocks paint.
        manualChunks: { three: ['three'] }
      }
    }
  }
});
