import react from "@vitejs/plugin-react";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

type PackageJson = {
  version: string;
};

const packageJson = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf8")
) as PackageJson;

function readGitCommit(): string {
  if (process.env.VITE_GIT_COMMIT) {
    return process.env.VITE_GIT_COMMIT;
  }

  try {
    return execSync("git rev-parse --short=12 HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

export default defineConfig({
  root: "app",
  base: "/podcast-polisher-wasm/",
  publicDir: "../public",
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
    __APP_COMMIT__: JSON.stringify(readGitCommit()),
    __APP_BUILT_AT__: JSON.stringify(new Date().toISOString()),
    __REPOSITORY_URL__: JSON.stringify("https://github.com/baditaflorin/podcast-polisher-wasm"),
    __PAGES_URL__: JSON.stringify("https://baditaflorin.github.io/podcast-polisher-wasm/"),
    __SUPPORT_URL__: JSON.stringify("https://www.paypal.com/paypalme/florinbadita")
  },
  build: {
    outDir: "../docs",
    emptyOutDir: false,
    sourcemap: true,
    assetsDir: "assets",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("@ffmpeg/")) {
            return "ffmpeg";
          }
          if (id.includes("node_modules")) {
            return "vendor";
          }
        }
      }
    }
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./app/src", import.meta.url))
    }
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"]
  }
});
