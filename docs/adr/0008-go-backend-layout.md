# 0008 - Go Backend Project Layout

## Status

Accepted

## Context

The bootstrap prompt defines a Go layout for Modes B and C.

## Decision

Skip the Go backend entirely for v1 because ADR 0001 selects Mode A.

No `cmd/`, `internal/`, `pkg/`, `api/`, `configs/`, or Go module is created.

## Consequences

- There is no runtime server, Dockerfile, or Go binary.
- Backend-specific linting and tests are omitted from hooks.
- Future Mode B/C work must add a new ADR before introducing Go.

## Alternatives Considered

- Add an empty Go module for future use. Rejected because it would create misleading maintenance surface.
