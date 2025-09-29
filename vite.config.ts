<<<<<<< HEAD
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { fileURLToPath, URL } from 'node:url'
=======
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { fileURLToPath, URL } from 'node:url';
import { componentTagger } from "lovable-tagger";
>>>>>>> eaac5ff1bb72f745971ee2badaa300c5cfe4a194

<<<<<<< HEAD
export default defineConfig(async ({ command }) => {
  const plugins: any[] = [react()]

  // Load lovable-tagger ONLY in dev (it's ESM-only)
  if (command === 'serve') {
    try {
      const mod = await import('lovable-tagger')
      const p = (mod as any).default ?? mod
      if (typeof p === 'function') plugins.push(p())
    } catch (e) {
      console.warn('[vite] lovable-tagger not loaded:', (e as Error).message)
    }
  }

  return {
    // Critical for Capacitor native builds: emit RELATIVE urls
    base: '',
    plugins,
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
=======
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    componentTagger(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
>>>>>>> eaac5ff1bb72f745971ee2badaa300c5cfe4a194
    },
<<<<<<< HEAD
    optimizeDeps: { exclude: ['lovable-tagger'] },
    ssr: { noExternal: ['lovable-tagger'] },
    build: {
      sourcemap: false,
      reportCompressedSize: false,
      target: 'es2020',
      chunkSizeWarningLimit: 2000
    },
    esbuild: { legalComments: 'none' }
  }
})
=======
  },
  optimizeDeps: {
    exclude: ["lovable-tagger"],
  },
});
>>>>>>> eaac5ff1bb72f745971ee2badaa300c5cfe4a194


