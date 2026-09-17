#!/usr/bin/env bash
# Adds the repository-local Node toolchain to PATH.
#
# Node is not installed system-wide on every workstation. `.tooling/` holds a portable Node
# distribution (gitignored) so the repo can be built without administrator rights.
#
#   source scripts/env.sh
#
# If Node is already installed system-wide, this script is unnecessary — use the version in
# .nvmrc via nvm/fnm/volta instead.
set -euo pipefail
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOCAL_NODE="$(find "$REPO_ROOT/.tooling" -maxdepth 1 -type d -name 'node-v*' 2>/dev/null | head -1)"
if [ -n "$LOCAL_NODE" ]; then
  export PATH="$LOCAL_NODE:$PATH"
  echo "Using local Node toolchain: $(node --version) (npm $(npm --version))"
else
  echo "No local Node toolchain in .tooling/. Install Node $(cat "$REPO_ROOT/.nvmrc") system-wide." >&2
fi
