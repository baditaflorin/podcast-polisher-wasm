import { execSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";

const packageJson = JSON.parse(await readFile("package.json", "utf8"));

function git(command) {
  try {
    return execSync(command, { encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

const metadata = {
  version: packageJson.version,
  commit: git("git rev-parse HEAD"),
  builtAt: new Date().toISOString(),
  repositoryUrl: "https://github.com/baditaflorin/podcast-polisher-wasm",
  pagesUrl: "https://baditaflorin.github.io/podcast-polisher-wasm/",
  supportUrl: "https://www.paypal.com/paypalme/florinbadita"
};

await writeFile("docs/version.json", `${JSON.stringify(metadata, null, 2)}\n`);
