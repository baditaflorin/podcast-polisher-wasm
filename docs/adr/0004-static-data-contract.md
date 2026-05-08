# 0004 - Static Data Contract

## Status

Accepted

## Context

Mode A has no generated external data, but the static app still needs a stable contract for app metadata, demo assets, and browser-fetchable public information.

## Decision

Use this static contract:

- `docs/version.json`: build metadata with `version`, `commit`, `builtAt`, `repositoryUrl`, `pagesUrl`, and `supportUrl`.
- `docs/manifest.webmanifest`: installable PWA metadata.
- `docs/404.html`: SPA fallback for GitHub Pages.

The app may also fetch unauthenticated public GitHub API data for the latest `main` commit. This is best-effort and never required for processing audio.

## Consequences

- Version and support metadata can render without a backend.
- Public GitHub API rate limits may affect live commit freshness, so the embedded build metadata remains the fallback.
- There is no static dataset versioning path in v1 because there are no data artifacts.

## Alternatives Considered

- Store metadata only in JavaScript constants. Rejected because `version.json` is easy to inspect and smoke-test.
- Mode B artifacts. Rejected by ADR 0001.
