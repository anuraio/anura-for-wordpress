import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      name: "AnuraIncludes",
      formats: ["iife"],
      fileName: "anura-includes",
    },
    target: "es2015",
    minify: true,
    outDir: "dist",
  },
  esbuild: {
    target: "es2015",
  },
});
