#!/usr/bin/env bash
set -euo pipefail

if [ ! -d node_modules ]; then
  npm install
  exit 0
fi

if [ package-lock.json -nt node_modules ]; then
  npm install
fi
