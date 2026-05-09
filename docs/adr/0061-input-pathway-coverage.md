# 0061 - Input Pathway Coverage Policy

## Status

Accepted

## Context

The workbench displayed a drop zone but only file-picker input worked.

## Decision

The supported v0.3 input paths are single-file picker, multi-file picker with manual file switching, drag/drop, pasted media files, demo audio, imported state, and restored session context. URL input, folders, and deep links are out of scope.

## Consequences

Users have practical browser-native ways to bring their files without a backend. Batch processing all queued files remains a later feature.

## Alternatives Considered

- Process every selected file in sequence: deferred because it would introduce a new feature and more worker lifecycle risk.
- Fetch arbitrary URLs: rejected due CORS and privacy uncertainty on GitHub Pages.
