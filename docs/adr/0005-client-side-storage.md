# 0005 - Client-Side Storage Strategy

## Status

Accepted

## Context

The app needs to remember user preferences without uploading files or syncing accounts.

## Decision

Use `localStorage` for small user preferences such as target loudness, export format, denoise strength, and whether advanced options are expanded.

Do not persist uploaded audio files in v1. Generated object URLs live only for the current browser session.

## Consequences

- User preferences survive reloads.
- Audio privacy remains simple: files stay local and are not written to durable browser storage by default.
- Cross-device sync is not supported.

## Alternatives Considered

- IndexedDB or OPFS. Rejected for v1 because storing large user audio files increases privacy and cleanup complexity.
- Server persistence. Rejected by ADR 0001.
