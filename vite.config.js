import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Importe entfernt
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'https://financemaster-8cou.onrender.com',
        changeOrigin: true,
        secure: true
      }
    }
  }
})