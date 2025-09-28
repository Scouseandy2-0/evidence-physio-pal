import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import legacy from '@vitejs/plugin-legacy';
import { fileURLToPath, URL } from 'node:url';
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    mode === 'production' && legacy({
      targets: ['iOS >= 13', 'Safari >= 13'],
      modernPolyfills: true,
      renderLegacyChunks: true,
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    target: ['safari13', 'es2018']
  },
  optimizeDeps: {
    exclude: ["lovable-tagger"],
  },
}));

