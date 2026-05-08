# 0015 - Deployment Topology

## Status

Accepted

## Context

Mode C deployment artifacts are not needed for a pure GitHub Pages app.

## Decision

Use GitHub Pages only:

- source: `main /docs`;
- live URL: `https://baditaflorin.github.io/podcast-polisher-wasm/`;
- rollback: revert the commit that changed `docs/`;
- redeploy: rebuild locally, commit `docs/`, and push `main`.

No `deploy/` directory, Docker Compose, nginx, Prometheus, or GHCR image is included.

## Consequences

- Operations are simple and transparent.
- There is no server to patch, monitor, or back up.
- Static hosting limitations apply.

## Alternatives Considered

- Docker backend behind nginx. Rejected by ADR 0001.
