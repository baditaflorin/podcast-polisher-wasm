# 0002 - Architecture Overview and Module Boundaries

## Status

Accepted

## Context

The app needs an approachable podcast post-production workflow while keeping heavy audio work isolated from the UI thread.

## Decision

Use a static React application with these module boundaries:

- `app/`: Vite entrypoint, shell, styling, PWA registration.
- `app/features/processing/`: podcast post-production UI and orchestration.
- `app/lib/audio/`: pure audio pipeline configuration, command building, parsing, and worker client.
- `app/workers/`: Web Worker implementation that lazy-loads WASM modules.
- `app/lib/metadata/`: version, commit, repository, and support-link metadata.
- `docs/`: GitHub Pages output plus project documentation.
- `scripts/`: local automation, smoke tests, hooks, and helper scripts.

## Consequences

- UI responsiveness is preserved because FFmpeg work runs in a Worker.
- Audio command-building logic remains unit-testable without browser WASM.
- Documentation and Pages artifacts coexist under `docs/`.

## Alternatives Considered

- Single-file app. Rejected because it would mix UI, worker orchestration, and DSP command logic.
- Runtime API service. Rejected by ADR 0001.
