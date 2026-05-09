# Phase 2 Substance Plan

This plan is ranked by user impact on the real-data audit set, not by implementation novelty. The surface area stays the same: one local audio polishing workbench on GitHub Pages.

## Selected Substance Items

1. Item 6: Auto-detect audio structure on file selection: container, likely codec, duration when available, channel shape, file size, source kind, and processing cost.
2. Item 8: Show a useful first guess immediately after input, before the user presses Process.
3. Item 16: Attach confidence scores to every major inference and expose them in the UI and metadata.
4. Item 12: Add domain-aware validation for empty, suspiciously short, huge, legacy, video-backed, and unknown files.
5. Item 32: Rewrite errors so every failure has what/why/now-what language.
6. Item 26: Make long processing cancellable by terminating the active worker and returning to an intentional state.
7. Item 24: Enumerate reachable UI states and test the important transitions.
8. Item 25: Ensure every state has a user-actionable exit.
9. Item 27: Make file changes and repeated Process clicks deterministic under concurrency.
10. Item 14: Export provenance as a deterministic metadata sidecar with version, commit, source facts, confidence, warnings, and options.
11. Item 38: Include output provenance fields needed to rerun the same operation.
12. Item 35: Make output names and metadata deterministic for identical input/options.
13. Item 22: Give every source a stable human-readable ID derived from normalized name, size, and sampled bytes.
14. Item 18: Surface anomalies, including very short clips, large memory risk, video containers, legacy Speex/Ogg, and unknown formats.
15. Item 17: Suggest concrete fixes or next steps for each warning/error.
16. Item 19: Explain why the app inferred a preset or confidence score.
17. Item 13: Recognize common input shapes: short clip, full episode, archive/historic speech, video with audio, legacy podcast format, huge episode, broken file.
18. Item 15: Bake in audio conventions: extension and magic-byte sniffing, safe filename normalization, mono voice loudness target, and video audio extraction language.
19. Item 9: Normalize derived metadata and output names by default.
20. Item 1: Run the parser against the 10 real-world fixtures plus synthetic edge cases.
21. Item 2: Cover filename/format variants, including Unicode names and legacy extensions.
22. Item 3: Define size and duration budgets, including the browser memory cliff.
23. Item 4: Handle partial inputs without silent success.
24. Item 5: Handle adversarial inputs such as empty files, malformed headers, and unknown signatures.
25. Item 29: Keep heavy FFmpeg work in the existing Web Worker and keep preflight bounded on the main thread.
26. Item 31: Cache preflight results by file identity during the session.
27. Item 33: Validate at the file boundary before FFmpeg starts.
28. Item 34: Separate recoverable warnings from fatal errors.
29. Item 36: Keep an inspectable activity log for support/debugging.
30. Item 37: Add a `?debug=1` surface with internal preflight, confidence, performance, and state details.

## Implementation Order

1. Commit this plan and ADRs.
2. Commit the real-data fixture set and expected contracts.
3. Add pure preflight/inference modules and fixture tests.
4. Wire preflight into the workbench, with confidence, warnings, suggestions, and explanations.
5. Add cancellation, state machine guards, and recoverable/fatal error handling.
6. Add deterministic provenance metadata and debug/activity surfaces.
7. Re-run the fixture suite, update the audit pass rate, build docs, bump version, tag, and publish.

## Acceptance Criteria

- At least 7 of 10 audit fixtures produce a useful first guess without manual setup.
- All 10 fixtures avoid silent wrongness.
- Long jobs have a visible cancel path.
- Every fatal/recoverable issue says what failed, why, and what to do next.
- Metadata sidecars are deterministic for identical input and options, ignoring the intentionally variable generation timestamp.
- Mode A remains intact: no backend, no secrets, no server runtime.
