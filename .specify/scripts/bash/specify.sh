#!/usr/bin/env bash

set -euo pipefail

SPEC_KIT_VERSION="${SPEC_KIT_VERSION:-v0.8.0}"
SPEC_KIT_SOURCE="${SPEC_KIT_SOURCE:-git+https://github.com/github/spec-kit.git@${SPEC_KIT_VERSION}}"

if ! command -v uvx >/dev/null 2>&1; then
  echo "Error: uvx is required to run the pinned Spec Kit CLI." >&2
  echo "Install uv first: https://docs.astral.sh/uv/" >&2
  exit 1
fi

exec uvx --quiet --no-progress --from "$SPEC_KIT_SOURCE" specify "$@"
