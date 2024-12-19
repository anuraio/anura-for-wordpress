import solid from 'vite-plugin-solid'
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  plugins: [solid()],
  resolve: {
    conditions: ['development', 'browser'],
    alias: {
      '~': path.resolve(__dirname, './src'),
    },
  },
  test: {
    watch: false,
    environment: 'jsdom',
    setupFiles: ['node_modules/@testing-library/jest-dom/vitest'],
    server: {
      deps: {
        inline: ['@solidjs/testing-library', '@solidjs/router'],
      },
    },
  },
  server: {
    port: 3030,
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        entryFileNames: `[name].js`,
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`
      }
    }
  }
})