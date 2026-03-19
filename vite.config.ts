import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          saltds: ["@salt-ds/core", "@salt-ds/icons"],
          aggrid: ["ag-grid-community", "ag-grid-react"],
          highcharts: ["highcharts", "highcharts-react-official"],
        },
      },
    },
  },
  test: {
    globals: true,
    include: ["src/test/**/*.{test,spec}.{ts,tsx}"],
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      thresholds: {
        lines: 90,
        branches: 85,
        statements: 90,
      },
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/main.tsx",
        "src/App.tsx",
        "src/test/**",
        "src/lib/moduleRegistry.ts",
        "src/types/**",
      ],
    },
  },
});
