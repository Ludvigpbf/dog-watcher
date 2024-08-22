import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";
import { VitePWA } from "vite-plugin-pwa";

// Assuming your certs are located in the ./certs directory
const certPath = path.resolve(__dirname, "cert", "localhost.crt");
const keyPath = path.resolve(__dirname, "cert", "localhost.key");

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },
      /*  includeAssets: ["favicon.svg", "robots.txt", "apple-touch-icon.png"], */
      manifest: {
        name: "Dog Watcher App",
        short_name: "Dog Watcher",
        description: "A application to help you keep track of your dog",
        theme_color: "#3f51b5",
        icons: [
          {
            src: "favicon.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@components": path.resolve(__dirname, "src/components"),
      "@styles": path.resolve(__dirname, "src/styles"),
      "@redux": path.resolve(__dirname, "src/redux"),
      "@views": path.resolve(__dirname, "src/views"),
      "@locales": path.resolve(__dirname, "locales"),
      "@assets": path.resolve(__dirname, "src/assets"),
      "@utils": path.resolve(__dirname, "src/utils"),
      "@interfaces": path.resolve(__dirname, "src/interfaces"),
      "@api": path.resolve(__dirname, "src/api"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    https: {
      cert: fs.readFileSync(certPath),
      key: fs.readFileSync(keyPath),
    },
  },
});
