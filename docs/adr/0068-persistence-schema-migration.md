# 0068 - Persistence Schema and Migration Policy

## Status

Accepted

## Context

Phase 3 adds an explicit state file and session key.

## Decision

Project state uses `podcast-polisher.state.v1`. Local session state uses `podcast-polisher-session-v1`. Invalid persisted data is ignored or rejected with an actionable message.

## Consequences

Future breaking changes must add a new schema version and a migration or a clear import error.

## Alternatives Considered

- Reuse provenance metadata as project state: rejected because provenance describes an output while project state restores settings/context.
