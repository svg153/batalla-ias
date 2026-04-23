#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(CDPATH="" cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
SPECIFY_SH="$SCRIPT_DIR/specify.sh"
SOURCE_DIR="$REPO_ROOT/.specify/community/ci-guard-pilot"
MODE="ensure"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --status)
      MODE="status"
      shift
      ;;
    --help|-h)
      cat <<'USAGE'
Usage: ensure-ci-guard-pilot.sh [--status]

Install or inspect the vendored CI Guard pilot for this repo.

Notes:
  - This is a community/unverified Spec Kit extension pilot.
  - The repo uses it as advisory guidance only, not as a hard merge gate.
  - Source is vendored locally under .specify/community/ci-guard-pilot/ for reproducibility.
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
  echo "Error: python3 is required for CI Guard pilot checks." >&2
  exit 1
fi

if [[ ! -d "$SOURCE_DIR" ]]; then
  echo "Error: missing vendored CI Guard pilot source at $SOURCE_DIR" >&2
  exit 1
fi

cd "$REPO_ROOT"

echo "Note: CI Guard is a community/unverified Spec Kit extension pilot in this repo."
echo "Note: Results are advisory only; do not treat them as a hard merge gate here."

STATE="$(python3 - <<'PY'
import json
from pathlib import Path
path = Path('.specify/extensions/.registry')
if not path.exists():
    print('missing')
else:
    try:
        data = json.loads(path.read_text())
    except Exception:
        print('missing')
    else:
        meta = data.get('extensions', {}).get('ci-guard')
        if not meta:
            print('missing')
        elif meta.get('enabled', False):
            print('enabled')
        else:
            print('disabled')
PY
)"

if [[ "$MODE" == "ensure" ]]; then
  case "$STATE" in
    enabled)
      ;;
    disabled)
      "$SPECIFY_SH" extension enable ci-guard
      ;;
    missing)
      "$SPECIFY_SH" extension add "$SOURCE_DIR" --dev
      ;;
  esac
fi

"$SPECIFY_SH" extension list

python3 - <<'PY'
from pathlib import Path
commands = [
    'speckit.ci-guard.check',
    'speckit.ci-guard.report',
    'speckit.ci-guard.gate',
    'speckit.ci-guard.drift',
    'speckit.ci-guard.badge',
]
missing = [cmd for cmd in commands if not Path(f'.github/agents/{cmd}.agent.md').exists()]
if missing:
    raise SystemExit(f"Error: missing generated Copilot agent files: {', '.join(missing)}")
print('CI Guard pilot commands:')
for cmd in commands:
    print(f'  - {cmd}')
print('Config file: .speckit-ci.yml')
PY
