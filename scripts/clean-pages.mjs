import { rm } from "node:fs/promises";

const generatedPaths = [
  "docs/assets",
  "docs/index.html",
  "docs/404.html",
  "docs/manifest.webmanifest",
  "docs/icon.svg",
  "docs/sw.js",
  "docs/version.json"
];

await Promise.all(generatedPaths.map((path) => rm(path, { recursive: true, force: true })));
