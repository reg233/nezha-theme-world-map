import react from "@vitejs/plugin-react";
// import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          antd: ["antd"],
          echarts: ["echarts", "echarts-for-react"],
          lodash: ["lodash-es"],
        },
      },
    },
  },
  plugins: [react()],
  // plugins: [
  //   react(),
  //   visualizer({ brotliSize: true, gzipSize: true, open: true }),
  // ],
  server: {
    open: true,
    proxy: {
      "/api": {
        target: "http://localhost:23334",
        changeOrigin: true,
      },
      "/ws": {
        target: "ws://localhost:23334",
        ws: true,
      },
    },
  },
});
