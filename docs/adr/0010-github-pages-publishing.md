# 0010 - GitHub Pages Publishing Strategy

## Status

Accepted

## Context

The live GitHub Pages URL is a first-class deliverable from commit one. The repository also needs Markdown documentation under `docs/adr/`.

## Decision

Publish from `main` branch `/docs`.

Vite writes the application into `docs/` with `emptyOutDir: false`, preserving Markdown documentation. The build process cleans only generated web assets before rebuilding. `.gitignore` intentionally does not ignore `docs/`.

The app uses:

- base path `/podcast-polisher-wasm/`;
- hashed assets under `docs/assets/`;
- `docs/404.html` as the SPA fallback;
- `docs/.nojekyll` to prevent Jekyll processing.

No custom domain is in scope for v1.

## Consequences

- Pages serves both the app and documentation from the same directory.
- Built assets are committed.
- Care is needed so build cleanup does not delete ADRs or documentation.

## Alternatives Considered

- `gh-pages` branch. Rejected because it adds a separate publish branch and makes local review of Pages output less direct.
- Root publishing. Rejected because generated frontend files would clutter repository root.
