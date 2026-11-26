import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In development the UI calls the API through this proxy, so the browser sees
// one origin and the FastAPI app needs no CORS configuration.
const API = process.env.VITE_PROXY_TARGET || "http://127.0.0.1:8000";
const API_PATHS = ["/auth", "/chat", "/documents", "/employees", "/admin", "/health"];

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: Object.fromEntries(
      API_PATHS.map((p) => [p, { target: API, changeOrigin: true }])
    ),
  },
});
