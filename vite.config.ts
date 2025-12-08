import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
