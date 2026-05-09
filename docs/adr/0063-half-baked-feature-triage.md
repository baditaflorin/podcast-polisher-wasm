# 0063 - Half-Baked Feature Triage Decisions

## Status

Accepted

## Context

Phase 3 prioritizes finishing, hiding, or explicitly cutting confusing partial features.

## Decision

Finish drag/drop, multi-file visibility, state import/export, copy state, and reset semantics. Keep URL input, share URLs, folders, and process-all batching out of scope for this release.

## Consequences

The UI has no visible dead controls. Some omitted workflows are documented as deliberate limits.

## Alternatives Considered

- Hide the drop zone styling: rejected because drag/drop is straightforward and expected.
- Add every catalog pathway: rejected because that would create new half-built features.
