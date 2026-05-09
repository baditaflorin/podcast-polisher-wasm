# 0062 - Output Pathway Coverage Policy

## Status

Accepted

## Context

Audio and metadata downloads existed, but users could not save or transfer their work context.

## Decision

The supported v0.3 output paths are polished audio download, provenance metadata JSON, project state JSON download, project state import, and copy-to-clipboard state JSON.

## Consequences

State files restore settings and context, but never embed private audio bytes. Users must choose the source recording again after import.

## Alternatives Considered

- Embed audio bytes in state JSON: rejected because it is large and privacy-hostile.
- Encode state in URL hash: rejected for size and reliability.
