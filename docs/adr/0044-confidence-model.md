# 0044 Confidence Model

## Status

Accepted

## Context

The app currently exports with no indication of uncertainty. The truncated MP3 audit fixture proved this can create silent wrongness.

## Decision

Each preflight has a confidence score from 0 to 1 and a label: high, medium, or low. Warnings reduce confidence. Fatal issues force confidence to zero. Exports include the score, label, warnings, and reasons in metadata.

## Consequences

The UI can say "review first" without blocking recoverable work. Tests assert confidence behavior for real fixtures and synthetic edge cases.

## Alternatives Considered

- Binary valid/invalid status. Rejected because many real files are usable but require caution.
