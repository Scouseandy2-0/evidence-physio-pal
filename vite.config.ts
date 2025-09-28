// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(async ({ command }) => {
  const plugins: any[] = [react()]

  // Load lovable-tagger only in dev; it's ESM-only
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
    plugins,
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    optimizeDeps: { exclude: ['lovable-tagger'] },
    ssr: { noExternal: ['lovable-tagger'] }
  }
})


