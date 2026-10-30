/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Vitest's persistent module cache keys a module on its own source, not on the files its import.meta.glob matches.
  // Vercel restores node_modules between builds, so a cached src/catalog/index.ts would miss newly added watches.
  // The whole suite takes about a second without it.
  test: { fsModuleCache: false },
  // One bundle of about 500 kB (140 kB gzipped), mostly the detailed watch renderers every screen needs for the
  // sidebar thumbnails. Splitting renderers per model is the fix if that ever matters; until then, warn at 600 kB.
  build: { chunkSizeWarningLimit: 600 },
});
