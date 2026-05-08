# 0006 - WASM Modules Used

## Status

Accepted

## Context

The requested processing stack maps naturally to open-source audio tooling: FFmpeg for codecs/filtergraph/export, EBU R128 loudness normalization, and RNNoise-style speech denoising.

GitHub Pages cannot configure COOP/COEP headers, so multi-threaded SharedArrayBuffer-only WASM builds are unsuitable for v1.

## Decision

Use the single-threaded `@ffmpeg/core` WASM build through `@ffmpeg/ffmpeg`.

The pipeline uses FFmpeg filters for:

- format decode and encode;
- high-pass and low-pass cleanup;
- denoising with RNNoise-compatible filter support when the bundled core exposes it, with spectral denoise as the static fallback;
- EBU R128 loudness normalization through `loudnorm`;
- true-peak limiting and sample-rate conversion.

Separate SoX and libsndfile WASM modules are not loaded in v1. FFmpeg's codec, demuxing, resampling, and filtergraph coverage provides the required browser-safe equivalent with less payload and fewer failure modes.

## Consequences

- The app remains static and privacy-preserving.
- First-load JS remains small because the FFmpeg worker chunk is loaded only after a file is selected.
- Processing is slower than a native backend, especially for long stereo episodes.
- The UI must describe the actual browser pipeline honestly.

## Alternatives Considered

- Multi-threaded `@ffmpeg/core-mt`. Rejected because GitHub Pages cannot set required isolation headers.
- Dedicated SoX/libsndfile WASM packages. Rejected for v1 because they duplicate FFmpeg functionality and increase payload.
- Runtime backend with native binaries. Rejected by ADR 0001.
