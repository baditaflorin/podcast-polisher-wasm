# 0047 Error Taxonomy and Messaging Guidelines

## Status

Accepted

## Context

The audit found generic errors and missing next steps.

## Decision

Errors are either fatal preflight issues or recoverable processing failures. Every message has what, why, and now-what fields. Raw detail may be shown in debug/details but is never the main explanation.

## Consequences

Boundary validation happens before FFmpeg starts. Recoverable processing errors preserve file choice and settings so the user can retry.

## Alternatives Considered

- Continue wrapping all failures in one browser error. Rejected because it hides the cause.
