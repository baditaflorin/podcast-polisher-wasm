# Phase 2 Substance Postmortem

Date: 2026-05-09
Version: v0.2.3
Mode: A, GitHub Pages only

## Real-Data Pass Rate

Before: strict useful-pass 2/10; raw export completion 4/10.

After: useful first guess 9/10; no silent wrongness 10/10. The empty file is blocked intentionally before FFmpeg starts.

| Fixture                | Before                         | After                                                    |
| ---------------------- | ------------------------------ | -------------------------------------------------------- |
| `nasa-short-mp3`       | Exported, no short-clip caveat | Podcast guess, medium confidence, short-clip warning     |
| `bell-historic-ogg`    | Exported, no archive caveat    | Archive guess, medium confidence, denoise review warning |
| `empty-mp3`            | Generic browser failure        | Blocked before FFmpeg with empty recording explanation   |
| `partial-mp3`          | Wrong-but-confident export     | Low-confidence partial warning before export             |
| `hpr0001-mp3`          | Opaque measuring after 35s     | Archive guess, long-job warning, cancellable processing  |
| `hpr0001-opus`         | Opaque measuring after 35s     | Voiceover guess, Opus/long-job warnings                  |
| `hpr0001-spx`          | Hidden legacy support          | Archive guess, low confidence, Speex/duration warnings   |
| `hpr4470-unicode-name` | Opaque measuring after 35s     | Voiceover guess, Unicode filename normalization warning  |
| `dvids-mp4-video`      | Hidden video-audio extraction  | Podcast guess, explicit audio-extraction warning         |
| `huge-repeated-mp3`    | Resource cliff with no warning | Archive guess, large-file and long-job warnings          |

## Top 5 Logic Gaps

1. No preflight analysis: closed with bounded signature, size, duration, codec, channel, and source-shape inference.
2. No confidence model: closed with high/medium/low confidence, warning impacts, visible explanations, and metadata.
3. No truncated/corrupt detection: improved with partial-file and tiny-file warnings before export.
4. No long-job control: improved with long-job warnings and worker termination via Cancel; observed cancel response was 47ms.
5. Format affordance mismatch: improved picker support and explicit language for Opus, Speex/Ogg, and video containers.

## Smart Behaviors Delivered

- File selection now produces a first guess without pressing Process.
- Warnings explain what happened, why it matters, and what to do next.
- Low-confidence/partial/empty cases are no longer silent.
- Long processing jobs can be cancelled.
- Export metadata sidecars include version, commit, source id, source facts, options, commands, warning codes, confidence, and output facts.
- `?debug=1` exposes preflight, state, progress, issue codes, and activity history.

## Determinism Check

The fixture suite asserts deterministic preflight output for identical input. Metadata JSON is stable when `generatedAt` is fixed; the live timestamp remains intentionally variable.

Result: pass.

## Performance Numbers

Preflight was measured through the built Pages app on the committed fixture set.

Median file-selection-to-preview: 89ms.
P95: 226ms.
Worst: 226ms on `hpr0001-spx`.
Huge fixture: 85ms for the 62.90 MB committed large file.
Cancel response: 47ms on `hpr0001-mp3` after processing started.

## What Surprised Me

The browser could infer enough from bounded byte samples to make the app feel much smarter without pulling FFmpeg into preflight. The biggest shift was not more DSP; it was refusing to pretend uncertain files were normal.

## Still Open For Phase 3

1. True streaming/chunked FFmpeg input for very large files.
2. More accurate duration and channel probing for legacy Ogg/Speex without waiting for FFmpeg.
3. Post-export loudness verification on the generated output.
4. A richer repair path for partial files, such as showing likely decoded duration and byte truncation evidence.
5. Optional OPFS caching so repeat processing does not rewrite large files into WASM memory.

## Honest Take

It no longer feels like a toy at the input judgment layer: real files get immediate, domain-aware guesses and warnings. The heavy processing layer is still browser-FFmpeg-bound, so very large episodes can be slow, but the app is honest about that now and gives the user a way out.
