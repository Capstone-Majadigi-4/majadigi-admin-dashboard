import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss(), react()],
  build: {
    chunkSizeWarningLimit: 1000, // Naikkan limit ke 1000 kB
  },
  server: {
    proxy: {
      "/api": {
        target: "https://157.10.253.219",
        changeOrigin: true,
      },
    },
  },
});
