import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: false,
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: (id: string): string | undefined => {
          // E6-S5: Code-splitting optimization
          // Separate heavy dependencies from main bundle using strict path matching
          // to avoid false positives (e.g., 'react-hook-form-validator' matching 'react-hook-form')
          if (id.includes('/node_modules/react-hook-form/')) {
            return 'vendor-forms';
          }
          if (id.includes('/node_modules/@hookform/')) {
            return 'vendor-forms';
          }
          if (id.includes('/node_modules/focus-trap-react/')) {
            return 'vendor-focus-trap';
          }
          if (id.includes('/node_modules/react-beautiful-dnd/')) {
            return 'vendor-dnd';
          }
          if (id.includes('/node_modules/@tanstack/react-query/')) {
            return 'vendor-query';
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})

