import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const port = Number(process.argv[2] ?? process.env.PORT ?? 4173);
const docsRoot = resolve("docs");
const basePath = "/podcast-polisher-wasm/";

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".webmanifest", "application/manifest+json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".wasm", "application/wasm"],
  [".rnnn", "application/octet-stream"],
  [".map", "application/json; charset=utf-8"],
  [".png", "image/png"]
]);

const server = createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "127.0.0.1"}`);

  if (!url.pathname.startsWith(basePath)) {
    response.writeHead(302, { Location: basePath });
    response.end();
    return;
  }

  const relativePath = decodeURIComponent(url.pathname.slice(basePath.length));
  const safePath = normalize(relativePath).replace(/^(\.\.[/\\])+/, "");
  const candidate = resolve(join(docsRoot, safePath || "index.html"));
  const filePath =
    candidate.startsWith(docsRoot) && existsSync(candidate) ? candidate : join(docsRoot, "index.html");
  const stat = statSync(filePath);

  if (stat.isDirectory()) {
    response.writeHead(302, { Location: `${url.pathname.replace(/\/?$/, "/")}index.html` });
    response.end();
    return;
  }

  response.writeHead(200, {
    "Content-Type": mimeTypes.get(extname(filePath)) ?? "application/octet-stream",
    "Cache-Control": "no-store"
  });
  createReadStream(filePath).pipe(response);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Pages preview: http://127.0.0.1:${port}${basePath}`);
});

process.on("SIGTERM", () => server.close());
process.on("SIGINT", () => server.close());
