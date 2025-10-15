From 0c8d7b1a2b1c9b8e6a1234567890abcdef123456 Mon Sep 17 00:00:00 2001
From: Andrew’s helper <dev@local>
Date: Wed, 15 Oct 2025 22:00:00 +0100
Subject: [PATCH 1/2] fix(vite): remove conflict markers and set sane defaults

---
 vite.config.ts | 31 +++++++++++++++++++++++++++++++
 1 file changed, 31 insertions(+)
 create mode 100644 vite.config.ts

diff --git a/vite.config.ts b/vite.config.ts
new file mode 100644
index 0000000..1111111
--- /dev/null
+++ b/vite.config.ts
@@ -0,0 +1,31 @@
+// vite.config.ts
+import { defineConfig } from 'vite'
+import react from '@vitejs/plugin-react'
+import path from 'node:path'
+
+// Clean, conflict-free config for React + Tailwind/shadcn
+export default defineConfig({
+  plugins: [react()],
+  resolve: {
+    alias: {
+      '@': path.resolve(__dirname, 'src'),
+    },
+  },
+  server: {
+    port: 5173,
+    strictPort: true,
+  },
+  preview: {
+    port: 5173,
+  },
+})
--
2.46.0
