# 0041 Input Robustness and Normalization Policy

## Status

Accepted

## Context

Users bring MP3, Ogg/Vorbis, Opus, Speex/Ogg, video containers with audio, Unicode filenames, empty files, partial files, and oversized episodes.

## Decision

The browser performs bounded preflight on file selection. It sniffs extension plus magic bytes, normalizes display and output names, marks empty files fatal, marks suspicious/legacy/huge/video inputs as recoverable warnings, and never starts FFmpeg for fatal files.

## Consequences

Preflight must be deterministic and fast. It may not read entire huge files except for bounded samples. It may give conservative warnings when certainty is impossible.

## Alternatives Considered

- Let FFmpeg discover everything. Rejected because it creates opaque long waits and raw errors.
- Require users to pick a format manually. Rejected because the product should infer the obvious first.
