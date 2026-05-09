# 0066 - Error Handling Convention

## Status

Accepted

## Context

Phase 2 introduced actionable errors. Phase 3 adds input and state import errors.

## Decision

User-facing errors keep the `what`, `why`, and `nowWhat` shape. Recoverable state-import failures do not clear existing work.

## Consequences

Invalid state files produce a domain message rather than a raw stack trace.

## Alternatives Considered

- Throw from handlers and rely on a boundary: rejected because localized input errors should keep the workbench usable.
