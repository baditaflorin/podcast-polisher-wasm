# 0009 - Configuration and Secrets Management

## Status

Accepted

## Context

Static frontend applications cannot safely contain secrets. The app needs only public URLs and build metadata.

## Decision

Use build-time Vite variables for public configuration only:

- `VITE_APP_BASE`
- `VITE_REPOSITORY_URL`
- `VITE_PAGES_URL`
- `VITE_SUPPORT_URL`

Commit `.env.example` with placeholders. Never commit real `.env` files, tokens, keys, certificates, or private hostnames. Run `gitleaks protect --staged` in pre-commit when available.

## Consequences

- The frontend contains no secrets.
- Configuration can be inspected safely in the built assets.
- Secret scanning is local because the project intentionally uses no GitHub Actions.

## Alternatives Considered

- Runtime config endpoint. Rejected by ADR 0001.
- Encrypted frontend secrets. Rejected because client-side encrypted secrets are still client-side secrets.
