import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: '0.0.0.0', // Listen on all available network interfaces
    port: 4000, // Changed port to avoid conflict
    strictPort: false, // Try another port if 4000 is in use
    cors: true, // Enable CORS
    open: true, // Automatically open browser
  },
  preview: {
    port: 4000, // Changed port to avoid conflict
    host: '0.0.0.0', // Listen on all available network interfaces
    open: true, // Automatically open browser
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger({
      disableNotifications: true, // Disable automatic notifications
      silent: true, // Reduce console output
      notifyOnce: true, // Prevent notification loops
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
