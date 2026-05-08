# 0001 - Deployment Mode

## Status

Accepted

## Context

Podcast Polisher WASM needs to process podcast audio without accounts, uploads, backend secrets, or shared state. The requested default is GitHub Pages first, with runtime infrastructure only if browser or build-time work is insufficient.

## Decision

Use Mode A: Pure GitHub Pages.

The application will run fully client-side from static files served by GitHub Pages. Audio files remain in the browser and are processed through lazy-loaded WebAssembly modules, Web Workers, browser file APIs, and local browser storage.

The frontend is the whole product. There is no runtime backend, no database, no server-side authentication, and no secrets.

## Consequences

- The public deployment surface is a static GitHub Pages URL.
- Large WASM modules must be lazy-loaded after user action.
- No server-side metrics are available.
- Processing speed depends on the user's browser, CPU, and memory.
- GitHub Pages cannot set COOP/COEP headers, so the app uses single-threaded WASM modules and avoids SharedArrayBuffer-only builds.

## Alternatives Considered

- Mode B: pre-built data. Rejected because v1 has no external dataset to generate.
- Mode C: Docker backend. Rejected because audio processing can happen locally, and a backend would add cost, privacy risk, and operational overhead.
