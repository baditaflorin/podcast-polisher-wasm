# Phase 3 Controls Audit

Date: 2026-05-09

| Control              | Before                | After       | Verification                                                     |
| -------------------- | --------------------- | ----------- | ---------------------------------------------------------------- |
| Choose podcast audio | Works fully           | Works fully | E2E file-picker path.                                            |
| Drop zone            | Stub-like visual only | Works fully | Routed to same file selection handler.                           |
| Demo audio           | Works fully           | Works fully | Smoke test processes demo.                                       |
| Process              | Works fully           | Works fully | Smoke test.                                                      |
| Cancel               | Works fully           | Works fully | Phase 2 cancellation path retained.                              |
| Reset                | Works partially       | Works fully | Clears file, queue, notices, session context, object URLs.       |
| Download audio       | Works fully           | Works fully | Smoke test checks link.                                          |
| Metadata             | Works fully           | Works fully | Smoke test checks link.                                          |
| State                | Not built             | Works fully | Created after processing.                                        |
| Import state         | Not built             | Works fully | Validates `.state.json` before applying settings.                |
| Copy state           | Not built             | Works fully | Uses Clipboard API; disabled until a file has preflight context. |
| Preset               | Works fully           | Works fully | Persists and updates derived options.                            |
| Target loudness      | Works fully           | Works fully | Persists.                                                        |
| Noise mode           | Works fully           | Works fully | Persists.                                                        |
| Export format        | Works fully           | Works fully | Drives MP3/WAV output.                                           |
| Denoise mix          | Works fully           | Works fully | Drives filter chain.                                             |
| High-pass / low-pass | Works fully           | Works fully | Drives filter chain.                                             |
| MP3 bitrate          | Works fully           | Works fully | Disabled for WAV.                                                |
| Trim leading silence | Works fully           | Works fully | Drives filter chain.                                             |

No production UI control remains as a visible placeholder.
