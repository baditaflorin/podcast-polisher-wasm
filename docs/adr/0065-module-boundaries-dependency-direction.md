# 0065 - Module Boundaries and Dependency Direction

## Status

Accepted

## Context

The app has UI orchestration, audio-domain logic, metadata, and persistence concerns.

## Decision

UI modules may import audio and metadata helpers. Audio/domain helpers do not import UI. Persistence helpers expose typed functions and zod-validated boundaries.

## Consequences

Phase 3 adds state/session helpers under `app/src/lib/audio/` and keeps React-specific event work in the processing feature.

## Alternatives Considered

- Move all state into the workbench: rejected because import/export schemas belong at a boundary.
