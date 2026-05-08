# 0011 - Logging Strategy

## Status

Accepted

## Context

Mode A has no server logs. Browser console noise should be minimal, especially in production.

## Decision

Use a tiny frontend logger wrapper:

- development: allow debug/info/warn/error;
- production: allow warnings and errors only;
- worker progress is surfaced through typed UI events rather than console logs.

Do not log file names, file contents, waveform samples, or other user audio details beyond transient UI state.

## Consequences

- Production console stays clean unless something needs attention.
- Debugging still works locally.
- No server-side log collection exists.

## Alternatives Considered

- External client logging SaaS. Rejected because v1 defaults to no analytics or remote telemetry.
