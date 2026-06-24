import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
  test: {
    globals: true,
    include: ["lib/**/*.test.{ts,tsx}", "app/**/*.test.{ts,tsx}", "*.test.{ts,tsx}"],
    setupFiles: ["./vitest.setup.ts"],
  },
});
