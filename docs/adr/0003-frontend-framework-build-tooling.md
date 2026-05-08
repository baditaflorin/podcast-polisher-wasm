# 0003 - Frontend Framework and Build Tooling

## Status

Accepted

## Context

The UI needs typed state, accessible controls, a polished workflow, and a Pages-friendly static build.

## Decision

Use React, TypeScript strict mode, Vite, Tailwind CSS, Vitest, Playwright, zod, TanStack Query, Comlink, and lucide-react.

Vite builds into `docs/` with `base: "/podcast-polisher-wasm/"`, hashed assets, and a copied `404.html` fallback.

## Consequences

- Development is fast and familiar.
- TypeScript catches pipeline contract regressions early.
- The first-load bundle must be watched because React and UI dependencies count against the asset budget.
- WASM libraries are imported only from worker-side lazy paths.

## Alternatives Considered

- Vanilla TypeScript. Rejected because the UI has enough state and interaction to benefit from React.
- Svelte. Viable, but React has broader ecosystem support for the selected test and query libraries.
