# Phase 2 Substance Real-Data Audit

Audit date: 2026-05-08
App version: v0.1.0
Commit: 15978e943c6f
Deployment mode: Mode A, GitHub Pages only
Test surface: current GitHub Pages build served locally from `docs/`
Default path tested: choose file, keep default Podcast preset, press Process, observe result

## Fixture Set

The set intentionally spans clean, mildly messy, genuinely messy, broken, adversarial, and huge inputs. Public real-world sources were used where possible; broken and huge files are derived from real HPR audio because failed uploads and too-large episode files are normal user data, not curated demo data.

| ID                     | Input                                                                                                                                                      | Source                                                                                                        | Reality class                    |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| `nasa-short-mp3`       | NASA Apollo 13 "Houston, we've had a problem" MP3, 17.1s, 0.39 MB                                                                                          | https://www.nasa.gov/historical-sounds/                                                                       | Clean short spoken clip          |
| `bell-historic-ogg`    | Alexander Graham Bell speaking Ogg Vorbis, 42.4s, 0.49 MB                                                                                                  | https://commons.wikimedia.org/wiki/File:Alexander_Graham_Bell_speaking.ogg                                    | Noisy/historic speech            |
| `empty-mp3`            | Zero-byte `.mp3` from a failed recorder/export                                                                                                             | Real-derived                                                                                                  | Broken/empty                     |
| `partial-mp3`          | First 160 KB of HPR hpr0001 MP3, about 10.2s                                                                                                               | Real-derived from https://hackerpublicradio.org/eps/hpr0001/index.html                                        | Partial/truncated                |
| `hpr0001-mp3`          | HPR hpr0001 MP3, 22m54s, 20.97 MB                                                                                                                          | https://hackerpublicradio.org/eps/hpr0001/index.html                                                          | Real full podcast episode        |
| `hpr0001-opus`         | HPR hpr0001 Opus, 22m54s, 11.44 MB                                                                                                                         | https://hackerpublicradio.org/download.html                                                                   | Real alternate podcast format    |
| `hpr0001-spx`          | HPR hpr0001 Speex/Ogg `.spx`, 4.68 MB                                                                                                                      | https://hackerpublicradio.org/download.html                                                                   | Legacy podcast format            |
| `hpr4470-unicode-name` | HPR hpr4470 MP3 renamed to `Ședință podcast – test #1.mp3`, 21m40s, 10.53 MB                                                                               | https://hackerpublicradio.org/eps/hpr4470/index.html                                                          | Unicode filename + real episode  |
| `dvids-mp4-video`      | DVIDS/Commons MP4 video with AAC audio, 20.7s, 24.93 MB                                                                                                    | https://commons.wikimedia.org/wiki/File:B-1B_Lancer_Conducts_Mission_During_Operation_Epic_Fury_(999776).webm | Video container with audio track |
| `huge-repeated-mp3`    | HPR hpr0001 MP3 repeated 5x, about 1h54m30s, 104.83 MB in the live audit; committed fixture repeats 3x, 62.90 MB, to stay below GitHub's single-file limit | Real-derived from https://hackerpublicradio.org/eps/hpr0001/index.html                                        | Huge/edge-size episode           |

## Audit Results

Strict useful-pass baseline: 2/10. Raw export completion baseline: 4/10.

`nasa-short-mp3`

- What v1 did: Exported successfully in 3.7s. Reported input loudness -17.3 LUFS and produced `nasa-houston-problem-polished.mp3`.
- What it should have done: This is acceptable, though it should still explain that a very short clip is not enough to infer a podcast-wide loudness profile.
- Failure type: Pass with caveat.
- Manual work the user had to do: None for the happy path.

`bell-historic-ogg`

- What v1 did: Exported successfully in 7.3s. Reported input loudness -15.5 LUFS and produced `alexander-graham-bell-polished.mp3`.
- What it should have done: It should detect historic/noisy speech and surface low confidence for denoise/loudness decisions, instead of treating it exactly like modern podcast speech.
- Failure type: Pass with caveat.
- Manual work the user had to do: The user has to know whether RNNoise is appropriate for archival audio.

`empty-mp3`

- What v1 did: Failed quickly with "The browser could not finish this export" and "Choose an audio file with content."
- What it should have done: Say "This file is empty, probably from a failed recorder/export. Choose the original recording or retry the export." The current wrapper message is too generic.
- Failure type: Obvious but poorly explained.
- Manual work the user had to do: Infer the actual cause and next step.

`partial-mp3`

- What v1 did: Exported successfully in 2.2s and produced `hpr0001-truncated-160kb-polished.mp3`.
- What it should have done: Detect likely truncation or suspiciously short duration relative to the file identity/source and warn before export, or mark the output low-confidence.
- Failure type: Wrong-but-confident.
- Manual work the user had to do: Notice that the exported file is only a fragment.

`hpr0001-mp3`

- What v1 did: After 35s, it was still on "Measuring EBU R128 loudness" with no ETA, no duration estimate, no memory warning, and no cancel button.
- What it should have done: Preflight duration/size, estimate time, show real progress, make the operation cancellable, and recommend safer defaults for a 22m54s episode.
- Failure type: Stuck-feeling long operation.
- Manual work the user had to do: Wait without knowing whether the app is healthy or reload the page to escape.

`hpr0001-opus`

- What v1 did: After 35s, it was still on "Measuring EBU R128 loudness." The UI did not explain Opus support or why this format behaves differently.
- What it should have done: Identify Opus, decode support, duration, channel layout, likely processing cost, and any codec-specific caveats before processing.
- Failure type: Opaque long operation.
- Manual work the user had to do: Guess whether Opus is supported and whether the app is hung.

`hpr0001-spx`

- What v1 did: Automation could pass it into the hidden input, but after 35s it was still measuring. The visible picker accept list does not explicitly include `.spx`.
- What it should have done: Recognize Speex/Ogg as a legacy podcast format, say whether it is supported, and offer a clear conversion path or failure reason.
- Failure type: Format support is hidden and untrusted.
- Manual work the user had to do: Know what Speex is and whether browser/FFmpeg can handle it.

`hpr4470-unicode-name`

- What v1 did: Selected the Unicode filename correctly, then remained on "Measuring EBU R128 loudness" after 35s. No output filename was produced during the observation window.
- What it should have done: Preserve or transliterate the title predictably, preflight the 21m40s episode, and show an ETA/cancel path.
- Failure type: Long operation plus unverified filename policy.
- Manual work the user had to do: Trust that the eventual output name will be sensible.

`dvids-mp4-video`

- What v1 did: When automation bypassed the picker, FFmpeg extracted audio and exported successfully in 4.0s. The normal file picker does not advertise video input, and the UI never says "audio track extracted from video."
- What it should have done: Explicitly support common video containers with audio, or reject them in domain terms. If accepted, explain that the audio track was extracted.
- Failure type: Hidden capability / bad affordance.
- Manual work the user had to do: Know to rename or bypass picker behavior, then infer that video was ignored and audio was used.

`huge-repeated-mp3`

- What v1 did: Accepted a 104.83 MB file and stayed on "Measuring EBU R128 loudness" after 35s. There was no size budget, memory warning, streaming, chunking, ETA, or cancellation.
- What it should have done: Warn before loading the whole file into WASM memory, offer a cancel path, and explain the size/duration cliff.
- Failure type: Potential resource cliff.
- Manual work the user had to do: Decide whether to risk the tab freezing.

## Top 5 Logic Gaps

1. No preflight analysis. The app does not inspect duration, channels, codec/container, audio track presence, sample rate, size, or likely processing cost before running the expensive pipeline.
2. No confidence model. RNNoise, loudness normalization, silence trimming, and container handling are presented as certain even when the input is historic, partial, video-backed, legacy, or huge.
3. No truncated/corrupt detection. A partial MP3 can be polished and exported as if it were a valid episode.
4. No long-job control. Real episode-length audio gives stage-level progress only, with no ETA, no real percent, no cancellation, and no recovery except page reload.
5. Format affordance is mismatched. FFmpeg can handle more than the picker advertises, while legacy formats like `.spx` and common video containers are neither clearly supported nor clearly rejected.

## Top 3 Intuition Failures

1. "It says measuring, but is it stuck?" Long files do not reveal health, remaining time, or safe escape.
2. "It exported, so it must be okay." The truncated MP3 produced an export with no warning or low-confidence marker.
3. "Why can/can't I use this file?" Video audio succeeds if forced in, `.spx` is unclear, and the UI language does not match real recording/container vocabulary.

## Top 3 Feels-Stupid Moments

1. The user has to know which preset/loudness target fits mono speech, stereo podcast, archival audio, or video-extracted audio.
2. The user has to know whether a 20-minute or 100 MB file is safe to run in a browser tab.
3. The user has to know whether denoise/silence trim will help or damage noisy archival speech.

## What Smart Means For This Product

For Podcast Polisher WASM, "smart" means the same visible workflow, but the engine makes a defensible first guess before the user touches settings:

1. On file selection, the app identifies container, codec, duration, channels, sample rate, approximate loudness, silence, and processing cost.
2. It chooses or recommends podcast/voiceover/archive defaults from the input shape, with confidence and a reason.
3. It refuses silent wrongness: partial, empty, suspicious, unsupported, or low-confidence inputs are marked before export.
4. Long jobs show domain progress, ETA, and a real Cancel action that frees the worker.
5. Exports include enough provenance to know what was processed, with what settings, by what app version/commit.

## Phase 2 Substance Success Metrics

1. Real-data pass rate: at least 7/10 audit inputs complete the primary flow with no manual intervention beyond reviewing an inferred first guess.
2. No silent wrongness: 10/10 audit inputs either produce a confidence-bearing export or a domain-specific warning/error before export.
3. Preflight speed: median time from file selection to useful preview is under 1s for files under 25 MB and under 3s for the 104.83 MB edge file.
4. Long-job control: every operation expected to exceed 5s shows ETA/progress and can be cancelled within 500ms.
5. Determinism: re-running the same fixture with the same options produces byte-identical metadata and stable output naming 100% of the time.
6. Error actionability: every recoverable failure includes what failed, why in audio-domain terms, and the next step.
7. Format clarity: `.mp3`, `.ogg`, `.opus`, `.spx`, and common video-with-audio inputs are explicitly accepted with preflight facts or explicitly rejected with a reason.

## Explicit Out Of Scope For Phase 2 Substance

- New product features beyond the current local audio polishing flow.
- Visual polish, theme work, landing-page changes, command palettes, OG images, or marketing copy.
- Architecture escalation away from Mode A static GitHub Pages.
- Server-side processing, accounts, authentication, cloud storage, or cross-device sync.
- Batch queues, multi-file editing, transcripts, chapters, cover art, publishing integrations, or paid plans.
- Replacing FFmpeg/RNNoise wholesale unless an ADR later proves a narrow engine change is required for substance.
