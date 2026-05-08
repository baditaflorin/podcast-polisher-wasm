# 0013 - Testing Strategy

## Status

Accepted

## Context

The product needs confidence in command construction, metadata parsing, UI behavior, and the Pages build.

## Decision

Use:

- Vitest for TypeScript unit tests colocated with source.
- Playwright for a headless happy-path smoke test against a locally served `docs/` build.
- `scripts/smoke.sh` as the Mode A smoke entrypoint.
- `make test`, `make test-integration`, `make smoke`, `make lint`, and `make build` as the canonical commands.

The smoke test checks that the homepage loads, metadata renders, the worker-backed processing UI accepts a demo audio item, and the app reaches a successful export path or a clear browser capability error.

## Consequences

- Tests stay fast enough for local hooks.
- WASM execution is tested in the browser rather than mocked in unit tests.
- Long real-world podcast files remain manual acceptance tests in v1.

## Alternatives Considered

- GitHub Actions. Rejected by the prompt.
- Full audio golden-master tests. Deferred because browser FFmpeg output varies by codec and would slow hooks.
