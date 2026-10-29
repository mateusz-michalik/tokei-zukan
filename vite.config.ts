import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // One bundle of about 500 kB (140 kB gzipped), mostly the detailed watch renderers every screen needs for the
  // sidebar thumbnails. Splitting renderers per model is the fix if that ever matters; until then, warn at 600 kB.
  build: { chunkSizeWarningLimit: 600 },
});
