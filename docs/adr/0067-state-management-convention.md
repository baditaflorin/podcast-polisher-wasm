# 0067 - State Management Convention

## Status

Accepted

## Context

The workbench has transient file objects, persistent options, and exportable context.

## Decision

Keep private `File` objects in React state only. Persist settings and last-file context in localStorage. Export project state as JSON without audio bytes.

## Consequences

Reloads can restore the user's settings and remind them which file was active, while preserving browser privacy guarantees.

## Alternatives Considered

- Store audio in IndexedDB: deferred because it changes storage risk and quota behavior.
