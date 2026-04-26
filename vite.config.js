import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/',
  plugins: [tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        projects: resolve(__dirname, 'projects.html'),
        boulderbot: resolve(__dirname, 'boulderbot.html'),
        cowbot: resolve(__dirname, 'cowbot.html'),
      },
    },
  },
})