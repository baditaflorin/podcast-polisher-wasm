# Phase 3 Stranger Test

Date: 2026-05-09

Tester: autonomous cold run in a private browser context with real fixtures, because no separate human tester was available during this fire-and-forget pass.

## Input Used

- `test/fixtures/realdata/nasa-short-mp3.mp3`
- `test/fixtures/realdata/bell-historic-ogg.ogg`
- `test/fixtures/realdata/empty-mp3.mp3`

## Observations

1. The first visual affordance looked like a drop zone, but drag/drop was not wired before Phase 3.
2. Selecting more than one file gave no visible queue before Phase 3.
3. After producing a useful result, there was no way to save the work context and reload it later.
4. Empty files were correctly blocked with an actionable message.
5. The repo and PayPal links were visible and worked from the header.

## Top Three Fixes Shipped

1. Drag/drop now routes through the same validated media input pathway as file picker selection.
2. Multi-file input now shows a queue and lets users switch the active file.
3. State JSON can be downloaded, imported, and copied.

## Remaining Confusions

- Batch process-all is not available, so the queue is selection-oriented.
- Imported state cannot restore private audio bytes by design; the user must choose the source file again.
