import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    conditions: ["development", "browser"],
    alias: {
      "~": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    watch: false,
    environment: "jsdom",
    setupFiles: ['./src/test-setup.ts'],
    server: {
      deps: {
        inline: ["@testing-library/user-event"],
      },
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json"],
      reportsDirectory: "./coverage",
      include: [
        "src/**/*.{ts,tsx}",
      ],
      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/index.tsx",
        "node_modules/**",
        "dist/**",
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },
  },
  server: {
    port: 3030,
  },
  build: {
    target: "esnext",
    rollupOptions: {
      input: "./src/index.tsx",
      output: {
        entryFileNames: `[name].js`,
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`,
      },
    },
  },
});
