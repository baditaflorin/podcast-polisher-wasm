# 0043 Domain Vocabulary and UI Language

## Status

Accepted

## Context

Messages such as "FFmpeg exec failed" or "unsupported file" do not help podcast users recover.

## Decision

User-facing language uses podcast/audio terms: recording, episode, audio track, loudness, mono voice, archive, legacy codec, partial file, export, and processing cost. Errors and warnings include what happened, why it matters, and the next step.

## Consequences

Raw FFmpeg details stay in expandable/debug views. The primary UI avoids implementation jargon unless the user asks for details.

## Alternatives Considered

- Preserve raw technical errors. Rejected because it makes recoverable cases feel broken.
