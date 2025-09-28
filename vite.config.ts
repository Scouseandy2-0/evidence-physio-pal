// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig(async ({ command }) => {
  const plugins: any[] = [react()]

  // Load lovable-tagger only for `vite serve` (dev). It is ESM-only.
  if (command === 'serve') {
    try {
      const mod = await import('lovable-tagger')
      const maybePlugin = (mod as any).default ?? mod
      const pluginInstance =
        typeof maybePlugin === 'function' ? maybePlugin() : maybePlugin
      if (pluginInstance) plugins.push(pluginInstance)
    } catch (e) {
      // Optional: don't crash dev if the package isn't present
      console.warn('[vite] lovable-tagger not loaded:', (e as Error).message)
    }
  }

  return {
    plugins,
    optimizeDeps: {
      // prevent esbuild from trying to prebundle the ESM-only package
      exclude: ['lovable-tagger']
    },
    // Harmless even if you don't use SSR; helps if you ever do.
    ssr: {
      noExternal: ['lovable-tagger']
    }
  }
})

