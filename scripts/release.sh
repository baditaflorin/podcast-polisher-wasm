#!/usr/bin/env bash
set -euo pipefail

VERSION="$(node -p "require('./package.json').version")"
TAG="v${VERSION}"

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Release requires a clean worktree." >&2
  exit 1
fi

if git rev-parse "$TAG" >/dev/null 2>&1; then
  echo "Tag ${TAG} already exists." >&2
  exit 1
fi

npm run audit:high
make lint
make test
make build
make smoke

git tag -a "$TAG" -m "release: ${TAG}"
git push origin main "$TAG"

echo "Released ${TAG}"
