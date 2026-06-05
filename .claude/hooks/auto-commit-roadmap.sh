#!/usr/bin/env bash
set -euo pipefail

payload="$(cat)"

file_path="$(
  PAYLOAD="$payload" python3 - <<'PY'
import json
import os

try:
    data = json.loads(os.environ.get("PAYLOAD", "{}"))
except json.JSONDecodeError:
    print("")
else:
    print(data.get("tool_input", {}).get("file_path", ""))
PY
)"

repo_root="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"
cd "$repo_root"

case "$file_path" in
  */docs/ROADMAP.md|docs/ROADMAP.md|ROADMAP.md)
    ;;
  *)
    exit 0
    ;;
esac

if git diff --quiet -- docs/ROADMAP.md; then
  exit 0
fi

git add docs/ROADMAP.md
git commit -m "chore(roadmap): update" -- docs/ROADMAP.md
