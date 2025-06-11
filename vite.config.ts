import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Blackbox',
        icons: [
          {
            src: '/icon.svg',
            sizes: '192x192',
            type: 'image/svg',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.(js|ts|css|html|png|svg)'],
      },
    }),
  ],
})
