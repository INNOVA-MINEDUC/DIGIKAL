import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },

  /**
   * En el build de producción se eliminan TODAS las llamadas a console.* y los
   * `debugger`. Es la garantía de verdad: no depende de que nadie se acuerde de
   * quitarlos, y sigue funcionando para lo que se añada mañana.
   *
   * En la consola del navegador cualquiera lee esos mensajes, y varios volcaban
   * datos reales (la lista completa de usuarios, respuestas del API, la URL
   * interna del backend).
   *
   * `npm run dev` no se ve afectado: esto sólo aplica al build.
   */
  esbuild: {
    drop: ['console', 'debugger'],
  },
})
