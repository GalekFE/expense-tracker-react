import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Expense Tracker',
        short_name: 'Expenses',
        description: 'Track your expenses with AI receipt scanning',
        theme_color: '#ffffff',
        background_color: '#f9f9f7',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/expense-tracker-react/',
        start_url: '/expense-tracker-react/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      }
    })
  ],
  base: '/expense-tracker-react/'
})
