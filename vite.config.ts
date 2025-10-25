
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { componentTagger } from "lovable-tagger"
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['lovable-uploads/*.png', 'lovable-uploads/*.jpg'],
      manifest: {
        name: 'Aigent Nakamoto',
        short_name: 'Aigent',
        description: 'Advanced AI agent community platform powered by blockchain technology',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone', // Hides browser UI completely when installed
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/lovable-uploads/3a679f4a-cb41-4679-8e09-d3cb6f5cb993.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/lovable-uploads/3a679f4a-cb41-4679-8e09-d3cb6f5cb993.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10MB limit
        globPatterns: ['**/*.{js,css,html,ico,svg}'], // Exclude large images from precache
        globIgnores: [
          '**/node_modules/**',
          '**/flowchart-elk-definition-*.js', // Skip large mermaid diagram
          '**/lovable-uploads/**' // Don't precache large uploads
        ],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/cdn\.gpteng\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'cdn-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          {
            // Runtime cache for large mermaid diagrams
            urlPattern: /assets\/.*flowchart.*\.js$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'mermaid-diagrams',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          {
            // Runtime cache for images
            urlPattern: /\/lovable-uploads\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 90 // 90 days
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
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
    minify: mode === 'production' ? 'esbuild' : false,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate Mermaid into its own chunk to prevent initialization issues
          mermaid: ['mermaid'],
          vendor: ['react', 'react-dom']
        }
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
