# 0046 Performance Budgets and Measurement Plan

## Status

Accepted

## Context

Browser-only FFmpeg processing can be slow for full episodes and risky for huge files.

## Decision

Preflight reads bounded samples and should return under 1s for files under 25 MB and under 3s for the huge audit file. Jobs expected to exceed 5s must show cancellation. Processing remains in the worker.

## Consequences

The app must warn before obvious resource cliffs. Exact FFmpeg progress is best effort, but UI state must remain responsive.

## Alternatives Considered

- Stream FFmpeg input through OPFS immediately. Deferred because it is a larger architecture change and not required to remove silent wrongness.
