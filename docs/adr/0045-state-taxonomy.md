# 0045 State Taxonomy and State Machine

## Status

Accepted

## Context

Real files exposed stuck-feeling states and stale async risks.

## Decision

The workbench uses the state taxonomy in `docs/phase2-substance/states.md`: `idle`, `analyzing`, `ready`, `blocked`, `running`, `done`, `error`, and `cancelled`. Preflight and processing operations carry job ids so stale async results cannot overwrite newer state.

## Consequences

Every state must have an exit. Running jobs must expose cancellation. Reset and file change clear stale downloads/errors.

## Alternatives Considered

- Keep the four-state v1 model. Rejected because it cannot represent analysis, blocked files, or cancellation honestly.
