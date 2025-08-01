import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // This rule proxies any request that starts with "/api"
      // to your backend server.
      "/api": {
        // IMPORTANT: Replace this with the actual URL of your backend server.
        // Vercel's local development server typically runs on port 3000.
        target: "http://localhost:3000",

        // This is necessary for the backend to receive the correct host header.
        changeOrigin: true,

        // If your backend server is not using HTTPS, you can leave this as is.
        // For self-signed certificates, you might set secure: false.
      },
    },
  },
});
