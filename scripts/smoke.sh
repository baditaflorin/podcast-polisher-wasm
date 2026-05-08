#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-$((30000 + RANDOM % 10000))}"
BASE_URL="http://127.0.0.1:${PORT}/podcast-polisher-wasm/"
LOG_FILE="tmp/smoke-server.log"

npm run build

test -s docs/index.html
test -s docs/version.json
grep -q "Podcast Polisher WASM" docs/index.html
grep -q "assets/" docs/index.html

mkdir -p tmp
node scripts/pages-server.mjs "$PORT" >"$LOG_FILE" 2>&1 &
SERVER_PID="$!"

cleanup() {
  kill "$SERVER_PID" >/dev/null 2>&1 || true
}
trap cleanup EXIT

node scripts/wait-for-url.mjs "$BASE_URL" 30000
PLAYWRIGHT_BASE_URL="$BASE_URL" npx playwright test --project=chromium
