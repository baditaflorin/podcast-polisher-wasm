# Architecture

## C4 Context

```mermaid
flowchart LR
  creator["Person: Podcast creator"]
  app["System: Podcast Polisher WASM<br/>Static browser podcast post-production"]
  pages["External system: GitHub Pages<br/>Static asset hosting"]
  github["External system: GitHub<br/>Repository and public commit metadata"]
  paypal["External system: PayPal<br/>Optional support link"]

  creator -->|"uses in browser"| app
  pages -->|"serves"| app
  app -->|"fetches public latest commit"| github
  creator -->|"stars repository"| github
  creator -->|"supports project"| paypal
```

## C4 Container

```mermaid
flowchart LR
  subgraph browser["User browser"]
    ui["Container: React UI<br/>Controls, progress, export download"]
    worker["Container: Audio Worker<br/>Comlink Web Worker"]
    ffmpeg["Container: FFmpeg WASM<br/>Decode, RNNoise arnndn, EBU R128 loudnorm, export"]
    storage["Container: localStorage<br/>Processing preferences"]
  end

  pages["GitHub Pages<br/>Static files from main /docs"]
  github["GitHub API<br/>Public commit metadata"]

  pages --> ui
  ui -->|"File + options"| worker
  worker -->|"filtergraph commands"| ffmpeg
  ui -->|"read/write"| storage
  ui -->|"best-effort fetch"| github
```

## Module Boundaries

- `app/src/features/processing/`: workbench UI.
- `app/src/lib/audio/`: options, command builder, demo WAV generation, worker client.
- `app/workers/`: FFmpeg worker.
- `docs/`: GitHub Pages output plus Markdown docs and ADRs.
- `scripts/`: local checks, preview server, release helper.
