# 0049 Inspectability and Debug Surface

## Status

Accepted

## Context

Power users and maintainers need to understand why a file was classified or warned.

## Decision

`?debug=1` exposes internal preflight JSON, activity history, state, confidence reasons, and performance timings. The default UI shows concise domain language, while debug keeps deeper details available.

## Consequences

The debug surface must not expose secrets because Mode A has none. It may include local file names and sampled identifiers already visible to the user.

## Alternatives Considered

- Console logging only. Rejected because production console output is minimized and not discoverable.
