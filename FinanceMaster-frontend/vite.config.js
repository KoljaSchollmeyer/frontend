import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // Leitet alle /api Anfragen im Dev an das Backend weiter
      '/api': {
        target: 'https://financemaster-8cou.onrender.com',
        changeOrigin: true,
        secure: true
      }
    }
  }
});
