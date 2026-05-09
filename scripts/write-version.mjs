import { readFile, writeFile } from "node:fs/promises";
import { execSync } from "node:child_process";

const packageJson = JSON.parse(await readFile("package.json", "utf8"));
const pinnedCommit = await readPinnedPagesCommit();

const metadata = {
  version: packageJson.version,
  commit: process.env.VITE_GIT_COMMIT ?? pinnedCommit ?? readGitCommit(),
  builtAt: "static",
  repositoryUrl: "https://github.com/baditaflorin/podcast-polisher-wasm",
  pagesUrl: "https://baditaflorin.github.io/podcast-polisher-wasm/",
  supportUrl: "https://www.paypal.com/paypalme/florinbadita"
};

await writeFile("docs/version.json", `${JSON.stringify(metadata, null, 2)}\n`);

function readGitCommit() {
  try {
    return execSync("git rev-parse --short=12 HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

async function readPinnedPagesCommit() {
  try {
    return (await readFile(".pages-commit", "utf8")).trim();
  } catch {
    return undefined;
  }
}
