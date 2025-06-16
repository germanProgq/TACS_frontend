import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import compression from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240,
    }),
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240,
    }),
    visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html'
    })
  ],
  build: {
    target: 'es2018',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.trace'],
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core vendor chunk
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor'
            }
            // Three.js and related 3D libraries
            if (id.includes('three') || id.includes('@react-three')) {
              return 'three-vendor'
            }
            // Animation libraries
            if (id.includes('framer-motion') || id.includes('gsap') || id.includes('@react-spring')) {
              return 'animation-vendor'
            }
            // Utilities
            if (id.includes('react-device-detect') || id.includes('@use-gesture') || id.includes('lenis')) {
              return 'utils-vendor'
            }
            // All other vendor code
            return 'vendor'
          }
          // App code splitting
          if (id.includes('src/components/Interactive3D')) {
            return 'interactive-3d'
          }
          if (id.includes('src/components') && (id.includes('Performance') || id.includes('About'))) {
            return 'heavy-components'
          }
          if (id.includes('src/utils')) {
            return 'utils'
          }
        },
        assetFileNames: (assetInfo) => {
          let extType = assetInfo.name?.split('.').at(-1)
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType!)) {
            extType = 'img'
          }
          return `assets/${extType}/[name]-[hash][extname]`
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
    cssCodeSplit: true,
    sourcemap: false,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      'framer-motion',
      'react-device-detect',
      'gsap',
      '@gsap/react',
      'lenis'
    ],
    exclude: ['@react-three/drei/core/Html']
  },
  server: {
    hmr: {
      overlay: false,
      port: 5174
    },
    host: true,
    port: 5174
  }
})