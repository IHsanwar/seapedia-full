import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Mengelompokkan library-library besar ke dalam chunk terpisah
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom', 'react-router'],
          'ui-components': [
            '@headlessui/react', 'lucide-react', '@tailwindcss/forms',
            '@heroicons/react', 'clsx', 'tailwind-merge', 'framer-motion'
          ],
          'chartjs': ['chart.js', 'react-chartjs-2']
        }
      }
    }
  }
})
