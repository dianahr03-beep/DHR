// Solo para generar la vista previa en un solo archivo (npm run build:preview)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  build: { outDir: 'dist-preview' },
})
