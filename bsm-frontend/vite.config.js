import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill"; // <-- 1. Import plugin mới

export default defineConfig({
  plugins: [react(), tailwindcss()], // Giữ nguyên các plugin cũ của bạn
  
  // 2. Thêm phần cấu hình này vào để giả lập module Node.js
  optimizeDeps: {
    esbuildOptions: {
      plugins: [NodeModulesPolyfillPlugin()],
    },
  },
});