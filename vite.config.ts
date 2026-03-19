import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { resolve } from "path"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  test: {
    globals: true,                        // vi, describe, it, expect available globally
    include: ["src/test/**/*.{test,spec}.{ts,tsx}"],
    environment: "jsdom",                 // DOM simulation
    setupFiles: ["./src/test/setup.ts"],  // runs before every test file
    css: false,                           // skip CSS parsing — not needed in unit tests
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      thresholds: {
        lines:      90,
        branches:   85,
        statements: 90,
      },
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/main.tsx",
        "src/App.tsx",
        "src/test/**",
        "src/lib/moduleRegistry.ts",   // side-effect only file
          "src/types/**",  // types only, no logic
      ],
    },
  },
})