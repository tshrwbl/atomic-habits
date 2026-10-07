import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  base: '/atomic-habits/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'apple-touch-icon.png', 'favicon-64.png', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'Atomic Habits - Tiny Changes, Remarkable Results',
        short_name: 'Atomic Habits',
        description: 'Identity-based habit tracker built on the 4 Laws of Behavior Change by James Clear.',
        theme_color: '#FFD23F',
        background_color: '#EFF8F7',
        display: 'standalone',
        start_url: '/atomic-habits/',
        scope: '/atomic-habits/',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
      }
    }),
  ],
});
