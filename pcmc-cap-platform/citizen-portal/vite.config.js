import process from "node:process";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig(({ command, mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ""), ...process.env };
  if (command === "build" && env.VERCEL === "1") {
    if (!env.VITE_API_URL?.startsWith("https://"))
      throw new Error(
        "Set VITE_API_URL to the HTTPS backend URL ending in /api before deploying.",
      );
    const api = new URL(env.VITE_API_URL);
    if (["localhost", "127.0.0.1"].includes(api.hostname))
      throw new Error("Production API URL cannot point to localhost.");
  }
  return {
    plugins: [react()],
    resolve: { dedupe: ["react", "react-dom"] },
    server: { host: "127.0.0.1", port: 5173, strictPort: true },
  };
});
