import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/my-project/',
  plugins: [tailwindcss()],
})