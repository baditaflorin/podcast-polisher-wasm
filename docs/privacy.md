# Privacy

Podcast Polisher WASM runs fully in your browser.

## What Is Collected

Nothing. The app ships with no analytics, no telemetry, no account system, and no backend.

## Audio Files

Audio files are processed locally with browser APIs and WebAssembly. They are not uploaded by this app.

## Network Requests

The static app may request:

- app assets from https://baditaflorin.github.io/podcast-polisher-wasm/
- public repository metadata from https://api.github.com/repos/baditaflorin/podcast-polisher-wasm/commits/main
- external links only when you click them, such as https://github.com/baditaflorin/podcast-polisher-wasm or https://www.paypal.com/paypalme/florinbadita

## Local Storage

The app stores processing preferences in `localStorage`. It does not store uploaded audio files in durable browser storage.
