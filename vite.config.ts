import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { compilerOptions } from 'vue3-pixi/compiler'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        // 让 Vue 支持 <container>, <sprite> 等 PixiJS 专有标签
        compilerOptions,
      },
    }),
  ],
})