import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Relative asset paths so the build works under a project-pages subpath
  // (https://user.github.io/<repo>/) as well as at a domain root.
  base: "./",
  plugins: [react()],
});
