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
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core vendor chunks - smallest possible for initial load
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          // UI components split by usage pattern
          'ui-core': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'ui-forms': ['@radix-ui/react-checkbox', '@radix-ui/react-label', '@radix-ui/react-select', '@radix-ui/react-radio-group'],
          'ui-feedback': ['@radix-ui/react-tooltip', '@radix-ui/react-toast', '@radix-ui/react-popover'],
          'ui-layout': ['@radix-ui/react-tabs', '@radix-ui/react-accordion', '@radix-ui/react-collapsible'],
          // Heavy dependencies in separate chunks
          'query-vendor': ['@tanstack/react-query'],
          'charts': ['recharts'],
          'motion': ['framer-motion'],
          'pdf': ['@react-pdf/renderer'],
          // Utility libraries
          'utils': ['date-fns', 'clsx', 'tailwind-merge', 'class-variance-authority'],
        },
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
