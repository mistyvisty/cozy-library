import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    // Needed so hot-reload works from inside Docker on Windows/macOS
    watch: { usePolling: true },
  },
});
