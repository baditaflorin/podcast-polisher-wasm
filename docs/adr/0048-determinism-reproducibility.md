# 0048 Determinism and Reproducibility Guarantees

## Status

Accepted

## Context

Outputs need enough metadata to be rerun and inspected. Random or locale-dependent ordering would make fixture tests fragile.

## Decision

Preflight, output naming, warnings, recommendations, stable source ids, and metadata key ordering are deterministic. Metadata includes schema version, app version, commit, source facts, options, warnings, confidence, and command lines.

## Consequences

The generation timestamp is intentionally variable; tests normalize it when checking determinism.

## Alternatives Considered

- Audio-only export. Rejected because users and tests cannot inspect provenance.
