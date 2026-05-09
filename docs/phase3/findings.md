# Phase 3 Findings

## Top Usability Gaps

1. Drag/drop looked supported but did nothing.
2. Multi-file selection collapsed to the first file with no visibility.
3. Users could download audio and metadata but could not save/reload their work context.
4. Clipboard workflows were missing, making support/debug handoff awkward.
5. Reset cleared the visible workbench but did not intentionally clear all Phase 3 session context.

## Half-Baked Features

| Feature              | Decision         | Rationale                                                                     |
| -------------------- | ---------------- | ----------------------------------------------------------------------------- |
| Drop-zone affordance | Finish           | It was already visible and expected by users.                                 |
| Batch input          | Finish partially | Selection and switching are required; batch processing is a separate feature. |
| State persistence    | Finish           | Options existed; reload context needed to be explicit.                        |
| URL input            | Keep out         | CORS makes arbitrary URL processing unreliable in Mode A.                     |
| Share URL            | Keep out         | Private audio workflows and large payloads make file-based state safer.       |

## Codebase Pain Points

1. Workbench orchestration is dense.
2. Processing option schema duplication exists across persistence boundaries.
3. Browser object URL cleanup must be handled carefully in every export path.
4. E2E coverage focused on demo and empty input before Phase 3.
5. Documentation did not clearly separate supported input/output paths from deliberate non-goals.

## Fully Usable Means

- A stranger can bring their own audio by picker, drag/drop, paste, or demo.
- The app gives a first guess and either enables processing or explains what blocked it.
- The user can process, cancel, reset, and switch selected files without stuck states.
- The user can take audio, provenance metadata, or a state file out of the app.
- The README and docs only claim workflows that are wired and tested.

## Success Metrics

- 100% of visible production controls have real handlers.
- 0 TODO/FIXME/HACK markers in app source.
- 0 `any` and 0 `// @ts-ignore` in app source.
- E2E covers project links, demo processing, empty-file blocking, and multi-file/state controls.
- Build, lint, unit tests, smoke tests, high-severity audit, and gitleaks pass.

## Out of Scope

- No runtime backend.
- No URL media fetcher.
- No batch process-all queue.
- No visual polish phase work.
- No changes to the Phase 2 inference or FFmpeg processing engine.
