import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" মানে যেকোনো GitHub repo নামেই GitHub Pages-এ কাজ করবে
export default defineConfig({
  plugins: [react()],
  base: "./",
});
