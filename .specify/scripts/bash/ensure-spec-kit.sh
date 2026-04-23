#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(CDPATH="" cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
SPECIFY_SH="$SCRIPT_DIR/specify.sh"

UPGRADE_COPILOT=false
FORCE=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --upgrade-copilot)
      UPGRADE_COPILOT=true
      shift
      ;;
    --force)
      FORCE=true
      shift
      ;;
    --help|-h)
      cat <<'USAGE'
Usage: ensure-spec-kit.sh [--upgrade-copilot] [--force]

Validate the repo-pinned Spec Kit CLI, ensure the Copilot integration is present,
and ensure the official Git Branching Workflow extension is installed and enabled.

Options:
  --upgrade-copilot  Refresh the installed Copilot integration with the pinned release
  --force            Pass --force to the Copilot integration upgrade
USAGE
      exit 0
      ;;
    *)
      echo "Error: unknown option '$1'" >&2
      exit 1
      ;;
  esac
done

if ! command -v python3 >/dev/null 2>&1; then
  echo "Error: python3 is required for Spec Kit setup checks." >&2
  exit 1
fi

cd "$REPO_ROOT"

"$SPECIFY_SH" check

CURRENT_INTEGRATION="$(python3 - <<'PY'
import json
from pathlib import Path

path = Path('.specify/integration.json')
if not path.exists():
    print('')
else:
    try:
        print(json.loads(path.read_text()).get('integration', ''))
    except Exception:
        print('')
PY
)"

if [[ -z "$CURRENT_INTEGRATION" ]]; then
  "$SPECIFY_SH" integration install copilot
elif [[ "$CURRENT_INTEGRATION" != "copilot" ]]; then
  "$SPECIFY_SH" integration switch copilot
elif [[ "$UPGRADE_COPILOT" == true ]]; then
  upgrade_args=(integration upgrade copilot)
  if [[ "$FORCE" == true ]]; then
    upgrade_args+=(--force)
  fi
  "$SPECIFY_SH" "${upgrade_args[@]}"
fi

GIT_EXTENSION_STATE="$(python3 - <<'PY'
import json
from pathlib import Path

path = Path('.specify/extensions/.registry')
if not path.exists():
    print('missing')
else:
    try:
        data = json.loads(path.read_text())
        meta = data.get('extensions', {}).get('git')
        if not meta:
            print('missing')
        elif meta.get('enabled', False):
            print('enabled')
        else:
            print('disabled')
    except Exception:
        print('missing')
PY
)"

case "$GIT_EXTENSION_STATE" in
  enabled)
    ;;
  disabled)
    "$SPECIFY_SH" extension enable git
    ;;
  *)
    "$SPECIFY_SH" extension add git
    ;;
esac

"$SPECIFY_SH" integration list
"$SPECIFY_SH" extension list

echo "Note: the official setup path only manages the pinned official CLI/integration plus the official git extension."
echo "Note: the community CI Guard pilot is separate and advisory-only; use 'corepack pnpm speckit:ci:setup' when needed."
