import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [preact()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // external libraries
          if (id.includes('node_modules')) {
            return 'ext'
          }

          // Large data files - keep separate
          if (id.includes('src/assets/index.json')) {
            return 'search-index'
          }
          if (id.includes('src/assets')) {
            return 'data'
          }

          // Everything else goes into the app chunk
          // (components, hooks, utils, main app code)
          if (id.includes('src/')) {
            return 'app'
          }
        },
      }
    },
    chunkSizeWarningLimit: 500
  },
  base: '/apps/emoji/',
})
