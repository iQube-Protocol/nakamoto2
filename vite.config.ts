
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { componentTagger } from "lovable-tagger"

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'mermaid'
    ],
    exclude: ['fsevents']
  },
  build: {
    target: 'es2022',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate Mermaid into its own chunk to prevent initialization issues
          mermaid: ['mermaid'],
          vendor: ['react', 'react-dom']
        }
      }
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false
    },
    watch: {
      usePolling: false,
      interval: 1000,
      binaryInterval: 3000,
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/build/**',
        '**/.DS_Store',
        '**/Thumbs.db'
      ]
    }
  },
  define: {
    // Ensure consistent environment
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  }
}))
