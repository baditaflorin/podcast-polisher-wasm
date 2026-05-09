# 0069 - Type Safety Policy at Boundaries

## Status

Accepted

## Context

Imported JSON and localStorage are untrusted boundaries.

## Decision

Validate imported project state and session state with zod before applying it. Do not use `any` or `// @ts-ignore` in app source.

## Consequences

Malformed state files fail closed and keep current user work intact.

## Alternatives Considered

- Trust JSON shape after parsing: rejected because it creates silent wrongness.
