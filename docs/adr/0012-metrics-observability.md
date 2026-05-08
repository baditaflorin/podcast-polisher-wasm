# 0012 - Metrics and Observability

## Status

Accepted

## Context

Mode A cannot expose Prometheus metrics. Usage analytics would add privacy considerations.

## Decision

Ship with no analytics by default.

Observability is limited to local UI state, local smoke tests, browser devtools, and public GitHub Pages availability checks. `docs/privacy.md` documents that no usage analytics are collected.

## Consequences

- No PII or audio metadata is collected.
- Product usage is not measured automatically.
- Any future analytics require an opt-in ADR and privacy update.

## Alternatives Considered

- Plausible analytics. Rejected for v1 because the app can launch without tracking.
- Custom beacon endpoint. Rejected because it would introduce a backend-like surface.
