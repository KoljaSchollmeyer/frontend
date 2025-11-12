import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Only load vue-devtools in dev to avoid SSR/localStorage issues during CI builds
export default defineConfig(async ({ command }) => {
  const plugins = [vue()]
  if (command === 'serve') {
    const { default: vueDevTools } = await import('vite-plugin-vue-devtools')
    plugins.push(vueDevTools())
  }
  return {
    plugins,
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
  }
});
