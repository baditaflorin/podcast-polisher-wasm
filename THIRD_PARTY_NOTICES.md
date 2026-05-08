# Third-Party Notices

This project is MIT-licensed application code, but it distributes and loads third-party components with their own licenses.

## FFmpeg WASM

- Package: `@ffmpeg/core`
- URL: https://www.npmjs.com/package/@ffmpeg/core
- License: GPL-2.0-or-later
- Use: browser-side FFmpeg core for codec handling, filtergraphs, EBU R128 loudness normalization, denoising, and export.

## FFmpeg JS Wrapper

- Package: `@ffmpeg/ffmpeg`
- URL: https://www.npmjs.com/package/@ffmpeg/ffmpeg
- License: MIT
- Use: browser API wrapper for FFmpeg WASM.

## RNNoise Model for FFmpeg `arnndn`

- File: `app/src/assets/models/std.rnnn`
- Source: https://github.com/richardpl/arnndn-models
- Raw source: https://raw.githubusercontent.com/richardpl/arnndn-models/master/std.rnnn
- Upstream note: the source repository states `std.rnnn` is originally bundled with the Xiph RNNoise implementation.
- Use: RNNoise speech denoising model consumed by FFmpeg's `arnndn` filter.

## Xiph RNNoise

- URL: https://github.com/xiph/rnnoise
- License: BSD-3-Clause
- Use: upstream RNNoise algorithm/model provenance for speech denoising.
