# 0042 Inference Engine

## Status

Accepted

## Context

The current pipeline applies one default preset to every file. The audit showed mono episodes, historic audio, video audio, and legacy formats need different explanations and sometimes different defaults.

## Decision

The inference engine produces an `AudioPreflight` object with facts, shape, recommended preset, confidence, reasons, warnings, and fatal issues. It uses deterministic heuristics: file signature, extension, size, filename signals, browser duration/channels where available, and conservative thresholds.

## Consequences

Inference is explainable and testable without FFmpeg. Low confidence is surfaced instead of hidden. The app recommends settings but lets the user keep control.

## Alternatives Considered

- Machine-learning classification. Rejected as unnecessary, opaque, and too large for v1 Mode A.
- No recommendation, warnings only. Rejected because "useful first guess" is a core Phase 2 requirement.
