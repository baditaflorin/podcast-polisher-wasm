# Postmortem

## What Was Built

Podcast Polisher WASM is a static GitHub Pages app that processes podcast audio locally in the browser. It includes upload/demo audio selection, RNNoise model-backed FFmpeg denoising, EBU R128 loudness normalization, MP3/WAV export, version/commit display, GitHub star link, PayPal support link, ADRs, local hooks, tests, and a Pages-ready build in `docs/`.

Live site:

https://baditaflorin.github.io/podcast-polisher-wasm/

Repository:

https://github.com/baditaflorin/podcast-polisher-wasm

## Was Mode A Correct?

Yes. The runtime needs no secrets, accounts, shared writes, or server-only APIs. FFmpeg WASM can perform the core pipeline from a static page. A backend would mainly improve speed for long files, but it would add privacy and operations tradeoffs that are not needed for v1.

## What Worked

- GitHub Pages from `main /docs` worked from the first commit.
- Single-threaded FFmpeg WASM avoids GitHub Pages COOP/COEP limitations.
- The initial app bundle remains below the 200KB gzip budget because FFmpeg assets are lazy-loaded.
- Public GitHub API fetch is enough for live commit display without secrets.

## What Did Not Work

- Exact self-embedding of the final git commit in a committed static file is not possible because the file content changes the commit hash. The page embeds build metadata and fetches the live `main` commit from GitHub as the freshest display.
- Browser processing is slower than native SoX/FFmpeg on a server.

## Surprises

- The current FFmpeg WASM core already includes `arnndn`, `loudnorm`, `alimiter`, and `libmp3lame`, which kept the implementation static and credible.
- The WASM payload is large, but Vite splits it cleanly behind the user action.

## Accepted Tech Debt

- Long podcast files need more manual performance testing across browsers.
- The RNNoise model provenance is documented, but a future release should prefer an upstream model artifact with clearer standalone licensing metadata.
- Smoke tests use a short generated WAV rather than a real multi-minute podcast fixture.

## Next Improvements

1. Add waveform preview and before/after loudness comparison.
2. Add OPFS-backed chunking for very large files.
3. Add optional batch processing for multiple episodes.

## Time

Estimated: one focused weekend.

Actual implementation in this session: scaffold, publish, core app, checks, and documentation in a single build pass.
