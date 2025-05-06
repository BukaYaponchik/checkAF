import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    force: true, // Принудительная переоптимизация зависимостей
  },
  server: {
    watch: {
      usePolling: true, // Использовать polling для обнаружения изменений файлов
    },
  },
});
