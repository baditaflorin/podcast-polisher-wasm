# 0017 - Dependency Policy

## Status

Accepted

## Context

Audio processing and browser tooling are easy to underbuild with fragile custom code.

## Decision

Use production-ready libraries for established concerns:

- `@ffmpeg/ffmpeg` and `@ffmpeg/core` for browser FFmpeg WASM;
- React, Vite, TypeScript, Tailwind CSS, zod, TanStack Query, Comlink, lucide-react;
- Vitest and Playwright for tests.

Pin dependency versions through `package-lock.json`. Run `npm audit --audit-level=high` before release. Track GPL obligations for the FFmpeg core dependency in `THIRD_PARTY_NOTICES.md`.

## Consequences

- The app benefits from mature audio and frontend ecosystems.
- Dependency updates must be reviewed deliberately because WASM packages are large and browser-sensitive.
- GPL-covered FFmpeg WASM distribution is documented separately from the MIT app code.

## Alternatives Considered

- Custom codec/filter implementations. Rejected because they would be less correct and harder to maintain.
- CDN-only dependencies. Rejected because the app should build reproducibly from the repository.
