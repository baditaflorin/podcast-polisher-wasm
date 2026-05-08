# 0014 - Error Handling Conventions

## Status

Accepted

## Context

Browser audio processing can fail because of unsupported files, memory pressure, codec limitations, or WASM loading problems.

## Decision

Use typed `Result`-style values at module boundaries and UI-visible errors for user actions.

Error messages must:

- explain what failed in plain language;
- avoid exposing stack traces in production UI;
- include a recovery action when possible;
- preserve the original error in development logs.

Worker errors are serialized into `{ code, message, detail? }` payloads.

## Consequences

- The UI can show useful recovery states.
- Tests can assert stable error codes.
- Developers still have enough detail locally.

## Alternatives Considered

- Throw through the UI tree. Rejected because worker and browser errors need user-friendly handling.
