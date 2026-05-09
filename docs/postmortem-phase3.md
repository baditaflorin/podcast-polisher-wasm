# Phase 3 Postmortem

Date: 2026-05-09

## Audit Grids

| Area                                      | Before | After |
| ----------------------------------------- | ------ | ----- |
| Input pathways green                      | 2/11   | 6/11  |
| Input pathways deliberately out of scope  | 0/11   | 3/11  |
| Output pathways green                     | 2/9    | 5/9   |
| Output pathways deliberately out of scope | 0/9    | 4/9   |
| Visible controls wired                    | 16/19  | 19/19 |
| README / UI claims true                   | 11/12  | 12/12 |

## Half-Baked Feature Triage

- Finished: drag/drop, because the UI already promised it visually.
- Finished: multi-file selection visibility, because users selecting several files need to know what happened.
- Finished: state import/export/copy, because audio export alone is not enough for real work.
- Cut from v0.3: arbitrary URL input, because Mode A cannot make it reliable through CORS.
- Cut from v0.3: share URLs, because state files are safer and more complete for this product.

## Codebase Health

| Metric                        | Before | After |
| ----------------------------- | -----: | ----: |
| TODO/FIXME/HACK in app source |      0 |     0 |
| `any` in app source           |      0 |     0 |
| `// @ts-ignore` in app source |      0 |     0 |
| Visible stub-like controls    |      1 |     0 |
| Core DRY issues               |      2 |     1 |

The remaining DRY issue is processing option schema duplication between preference and state boundaries. It is documented in ADR 0064 and should be extracted carefully in a later refactor.

## Stranger Test Response

The cold-run top three issues were fixed: drop input, multi-file visibility, and reloadable work context.

## Documentation Mismatches Fixed

- The README now lists actual input pathways, output artifacts, and limitations.
- Phase 3 docs explicitly mark URL input, folder input, share URLs, print/PDF, and API output as out of scope for Mode A.

## What Surprised Me

The core audio flow was already more complete than the surrounding workbench. The biggest usability problems were not DSP problems; they were ordinary "how do I get my data in and take my work out?" gaps.

## Still-Open Completeness Gaps

1. True process-all batch queue with per-file partial success.
2. IndexedDB/OPFS audio persistence for users who explicitly opt in.
3. Real iOS/Android file-picker test matrix.
4. Shared canonical processing-options schema.
5. Reducer-based workbench state machine to shrink the orchestration component.

## Honest Take

A stranger can now use the app for a single real podcast file end-to-end without help: choose/drop/paste a file, get a first guess, process it, download audio, download metadata, and save state. It is still not a full batch production tool, and imported state intentionally does not restore audio bytes. Those are the specific ways it is not yet "set and forget" for a large backlog.
