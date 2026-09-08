import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: Number(process.env.PORT) || 8080,
  },
  build: {
    // Reduce chunk size warnings threshold
    chunkSizeWarningLimit: 600,
    // Enable CSS code splitting for faster initial load
    cssCodeSplit: true,
    // Minify for production
    minify: 'esbuild',
    // Target modern browsers for smaller bundles
    target: 'es2020',
    rollupOptions: {
      output: {
        // Optimize chunk naming for better caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks: {
          // Core vendor chunks - smallest possible for initial load
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          // Radix Slot is tiny and used by Button - keep it in core
          'ui-slot': ['@radix-ui/react-slot'],
          // Dialog and dropdown are heavy - defer loading
          'ui-dialog': ['@radix-ui/react-dialog'],
          'ui-dropdown': ['@radix-ui/react-dropdown-menu'],
          // Forms - only loaded on form pages
          'ui-forms': ['@radix-ui/react-checkbox', '@radix-ui/react-label', '@radix-ui/react-select', '@radix-ui/react-radio-group'],
          // Feedback components - deferred after first paint
          'ui-tooltip': ['@radix-ui/react-tooltip'],
          'ui-toast': ['@radix-ui/react-toast'],
          'ui-popover': ['@radix-ui/react-popover'],
          // Layout components - loaded on demand
          'ui-layout': ['@radix-ui/react-tabs', '@radix-ui/react-accordion', '@radix-ui/react-collapsible'],
          // Heavy dependencies in separate chunks - loaded on demand
          'query-vendor': ['@tanstack/react-query'],
          'charts': ['recharts'],
          'motion': ['framer-motion'],
          'pdf': ['@react-pdf/renderer'],
          // Voice/chat - only loaded when user interacts
          'voice': ['@elevenlabs/react'],
          // Utility libraries
          'utils': ['date-fns', 'clsx', 'tailwind-merge', 'class-variance-authority'],
        },
      },
    },
  },
  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['@react-pdf/renderer'], // Heavy, only load when needed
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    // Make CSS non-render-blocking in production (critical CSS is inlined in index.html skeleton)
    mode === "production" && {
      name: 'async-css',
      enforce: 'post' as const,
      transformIndexHtml(html: string) {
        return html.replace(
          /<link rel="stylesheet" crossorigin href="(\/assets\/[^"]+\.css)">/g,
          '<link rel="stylesheet" href="$1" media="print" onload="this.media=\'all\'">' +
          '<noscript><link rel="stylesheet" href="$1"></noscript>'
        );
      },
    },
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
