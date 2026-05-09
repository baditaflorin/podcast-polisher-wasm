# Phase 3 Input Pathway Audit

Date: 2026-05-09

| Input pathway          | Before                                 | After           | Notes                                                                                                           |
| ---------------------- | -------------------------------------- | --------------- | --------------------------------------------------------------------------------------------------------------- |
| Single file picker     | Works fully                            | Works fully     | Primary audio/video input.                                                                                      |
| Drag and drop          | Claimed by drop-zone visual, not built | Works fully     | Drop accepts the same media formats as the picker.                                                              |
| Paste / clipboard file | Not built                              | Works fully     | Pasted audio/video files are routed through the same preflight path.                                            |
| Multi-file picker      | Not built                              | Works partially | Multiple files can be selected, inspected, and switched; batch processing remains out of scope for Mode A v0.3. |
| Mobile picker          | Works partially                        | Works partially | Browser file picker uses `audio/*` and common video extensions; real-device matrix is deferred.                 |
| Sample/demo            | Works fully                            | Works fully     | Demo is one entry point, not the only entry point.                                                              |
| Imported state         | Not built                              | Works fully     | Restores settings and source/output audit context; private audio bytes must be chosen again.                    |
| Restored autosave      | Options only                           | Works partially | Settings and last active file context survive reload; audio bytes are never stored.                             |
| URL input              | Not built                              | Out of scope    | Static GitHub Pages cannot fetch arbitrary media URLs through CORS reliably. Users choose or paste files.       |
| Folder input           | Not built                              | Out of scope    | Folder traversal is unnecessary for v0.3 and inconsistent on mobile browsers.                                   |
| Deep links             | Not built                              | Out of scope    | State can be exported/imported as JSON; hash-state is deferred due large option/source payload limits.          |

The key usability failure before Phase 3 was that the workbench visually invited drag/drop, but only the hidden file picker path worked.
