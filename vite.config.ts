import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import suidPlugin from '@suid/vite-plugin';
import { fileURLToPath, URL } from 'url';

export default defineConfig({
  plugins: [suidPlugin(), solidPlugin()],
  server: {
    port: 3001,
  },
  build: {
    target: 'esnext',
  },
  resolve: {
    alias: [
      { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) }
    ]
  }
});
