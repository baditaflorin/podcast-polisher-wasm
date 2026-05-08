# 0016 - Local Git Hooks

## Status

Accepted

## Context

The project must use local hooks instead of GitHub Actions.

## Decision

Use plain `.githooks/` scripts wired through `git config core.hooksPath .githooks`.

Hooks:

- `pre-commit`: format/lint/typecheck plus `gitleaks protect --staged` when installed.
- `commit-msg`: Conventional Commits validation.
- `pre-push`: `make test`, `make build`, and `make smoke`.
- `post-merge` and `post-checkout`: install dependencies if lockfile changes are detected.

Each hook has a matching `make hooks-*` target.

## Consequences

- Contributors can run the exact same checks manually.
- Missing optional tools produce clear installation messages.
- Pushes may take longer because smoke tests run locally.

## Alternatives Considered

- Lefthook. Viable, but plain hooks avoid another runtime dependency.
