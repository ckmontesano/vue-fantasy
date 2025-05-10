import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "@/styles/colors" as *;
          @use "@/styles/spacing" as *;
          @use "@/styles/breakpoints" as *;
          @use "@/styles/fonts" as *;
          @use "@/styles/global" as *;
        `,
      },
    },
  },
  base: "/",
});
