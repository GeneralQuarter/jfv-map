import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import suidPlugin from '@suid/vite-plugin';
import { fileURLToPath, URL } from 'url';
import { VitePWA, VitePWAOptions } from 'vite-plugin-pwa';

const pwaOptions: Partial<VitePWAOptions> = {
  mode: 'development',
  base: '/',
  includeAssets: ['favicon.ico', 'logo192.png', 'logo512.png', 'logo512mask.png'],
  manifest: {
    name: 'Jardin Forestier des Vallées - Map',
    short_name: 'JFV Map',
    theme_color: '#795548',
    icons: [
      {
        src: 'logo192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'logo512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: 'logo512mask.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  },
  devOptions: {
    enabled: process.env.SW_DEV === 'true',
    type: 'module',
    navigateFallback: 'index.html',
  },
}

if (process.env.SW === 'true') {
  pwaOptions.srcDir = 'src';
  pwaOptions.filename = 'prompt-sw.ts';
  pwaOptions.strategies = 'injectManifest';
}

export default defineConfig({
  plugins: [suidPlugin(), solidPlugin(), VitePWA(pwaOptions)],
  server: {
    port: 3001,
  },
  build: {
    target: 'esnext',
    sourcemap: process.env.SOURCEMAP === 'true'
  },
  resolve: {
    alias: [
      { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) }
    ]
  }
});
