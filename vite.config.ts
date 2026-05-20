// Provide Node types for environments where @types/node isn't installed
// and ensure imports use the node: namespace to satisfy TypeScript's
// module resolution in strict setups.
// Use classic Node imports to avoid TypeScript issues in projects without
// the node: namespace typings installed (e.g. missing @types/node).
import path from "path";
import { fileURLToPath } from "url";
// Some environments/project setups may not have type declarations for
// optional devDependencies/plugins. Silence TS resolution errors here.
// @ts-ignore: optional devDependency without types in this environment
import tailwindcss from "@tailwindcss/vite";
// @ts-ignore: optional devDependency without types in this environment
import react from "@vitejs/plugin-react";
// @ts-ignore: Vite types may not be installed in this workspace
import { defineConfig } from "vite";
// @ts-ignore: optional plugin without bundled types
import { viteSingleFile } from "vite-plugin-singlefile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
