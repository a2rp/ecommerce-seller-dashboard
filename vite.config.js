import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/ecommerce-seller-dashboard/",
  build: { sourcemap: false },
  plugins: [react()],
});