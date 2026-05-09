# 0071 - Stranger Test Findings and Response

## Status

Accepted

## Context

No separate person was available during this autonomous pass, so the stranger test used a private-browser cold run with real fixtures.

## Decision

Fix the top three observed issues: unwired drag/drop, no visible multi-file queue, and no reloadable state artifact.

## Consequences

A first-time user can now bring files through common browser paths and leave with audio plus state/provenance artifacts.

## Alternatives Considered

- Delay for an external tester: rejected because the user requested autonomous fire-and-forget execution.
