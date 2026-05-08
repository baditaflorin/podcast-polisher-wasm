# 0007 - Data Generation Pipeline

## Status

Accepted

## Context

Mode B data generation is optional and not required by the selected deployment mode.

## Decision

No offline data-generation pipeline is included in v1.

`make data` is intentionally a no-op that reports Mode A has no generated data artifacts.

## Consequences

- There are no committed Parquet, SQLite, or generated JSON datasets.
- Release artifacts are not needed for v1.

## Alternatives Considered

- Generate demo audio files. Rejected because the app can synthesize a short demo tone in the browser for smoke tests and demos.
