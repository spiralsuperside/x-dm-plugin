import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import manifestDev from "./manifest/manifest.dev.json";
import manifestProd from "./manifest/manifest.prod.json";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    crx({
      manifest: mode === "production" ? manifestProd : manifestDev
    })
  ]
}));
