import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
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
          // UI components split by usage pattern - deferred loading
          'ui-core': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-slot'],
          'ui-forms': ['@radix-ui/react-checkbox', '@radix-ui/react-label', '@radix-ui/react-select', '@radix-ui/react-radio-group'],
          'ui-feedback': ['@radix-ui/react-tooltip', '@radix-ui/react-toast', '@radix-ui/react-popover'],
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
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
