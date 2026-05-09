import { readFile, writeFile } from "node:fs/promises";
import { execSync } from "node:child_process";

const packageJson = JSON.parse(await readFile("package.json", "utf8"));
const existingCommit = await readExistingPagesCommit();

const metadata = {
  version: packageJson.version,
  commit: process.env.VITE_GIT_COMMIT ?? existingCommit ?? readGitCommit(),
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

async function readExistingPagesCommit() {
  try {
    const metadata = JSON.parse(await readFile("docs/version.json", "utf8"));
    return metadata.commit;
  } catch {
    return undefined;
  }
}
