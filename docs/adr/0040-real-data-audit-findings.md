# 0040 Real-Data Audit Findings and Substance Metrics

## Status

Accepted

## Context

The v1 happy path processed the demo audio and short clips, but the real-data audit found only 2/10 strict useful passes. Full-length episodes sat in an opaque measuring state, partial MP3 input exported confidently, and format support was unclear.

## Decision

Phase 2 substance is judged against the 10 audit fixtures in `docs/phase2-substance/realdata-audit.md`. The primary success target is at least 7/10 useful first guesses and 10/10 avoidance of silent wrongness.

## Consequences

Work prioritizes inference, validation, confidence, cancellation, and provenance over visual polish. Any behavior change that worsens a fixture needs an explicit ADR update.

## Alternatives Considered

- Add more UI controls first. Rejected because the audit failures come from missing engine judgment, not missing knobs.
- Move processing server-side. Rejected because Mode A remains sufficient and Phase 2 may not escalate architecture.
