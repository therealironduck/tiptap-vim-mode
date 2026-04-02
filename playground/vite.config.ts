import { defineConfig } from "vite";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@tiptap-vim-mode": resolve(__dirname, "../src/index.ts"),
    },
    // Deduplicate @tiptap packages so the extension source and the playground
    // code share one runtime instance, preventing "two copies of tiptap" bugs.
    dedupe: ["@tiptap/core", "@tiptap/pm"],
  },
  optimizeDeps: {
    exclude: ["@tiptap-vim-mode"],
  },
});
