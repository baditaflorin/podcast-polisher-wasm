# 0064 - DRY Consolidation Map

## Status

Accepted

## Context

Phase 3 found two relevant duplications: input handling around different browser events, and processing option schemas across persistence boundaries.

## Decision

All browser input events now route through `selectFiles`. Processing option schema duplication remains documented until the next source-compatible extraction.

## Consequences

Input behavior is consistent. The remaining schema duplication is explicit and covered by tests.

## Alternatives Considered

- Extract a shared schema immediately: deferred because it touches persistence and project-state boundaries late in the release.
