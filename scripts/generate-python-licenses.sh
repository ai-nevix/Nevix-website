#!/usr/bin/env bash
#
# Generates the Python dependency licence inventory (instruction §5).
#
#   ./scripts/generate-python-licenses.sh
#
# Reads the versions installed in the API virtualenv — the ones actually resolved — rather than
# the constraints in pyproject.toml.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_DIR="$REPO_ROOT/apps/api"
OUTPUT="$REPO_ROOT/docs/licenses/python-dependencies.md"

if [ -x "$API_DIR/.venv/Scripts/python.exe" ]; then
  PYTHON="$API_DIR/.venv/Scripts/python.exe"      # Windows
elif [ -x "$API_DIR/.venv/bin/python" ]; then
  PYTHON="$API_DIR/.venv/bin/python"              # Linux / macOS
else
  echo "No virtualenv at apps/api/.venv. Create it first:" >&2
  echo "  cd apps/api && python -m venv .venv && .venv/bin/pip install -e '.[dev]'" >&2
  exit 1
fi

cd "$API_DIR"

"$PYTHON" - "$OUTPUT" <<'PYEOF'
"""Collect installed distribution metadata and render the inventory."""
import sys
from datetime import datetime, timezone
from importlib import metadata

output_path = sys.argv[1]

PERMISSIVE = {
    "MIT", "MIT License", "BSD", "BSD License", "BSD-3-Clause", "BSD-2-Clause",
    "Apache 2.0", "Apache-2.0", "Apache Software License", "ISC", "ISC License",
    "Python Software Foundation License", "PSF", "The Unlicense", "Zlib",
}

REVIEW = {
    "GPL", "GNU General Public License", "LGPL", "GNU Lesser General Public License",
    "AGPL", "Mozilla Public License 2.0 (MPL 2.0)", "MPL-2.0",
}


def normalise(dist) -> str:
    """Prefer the SPDX expression; fall back to classifiers, then the legacy field."""
    meta = dist.metadata

    expression = meta.get("License-Expression")
    if expression:
        return expression.strip()

    classifiers = [
        c.split("::")[-1].strip()
        for c in meta.get_all("Classifier", [])
        if c.startswith("License ::")
    ]

    # "License :: OSI Approved" with no sub-classifier says only that a licence exists, not which
    # one. Some packages (prometheus-fastapi-instrumentator, for example) carry that alone while
    # naming the actual licence in the legacy field, so the uninformative classifier is discarded.
    informative = [c for c in classifiers if c and c != "OSI Approved"]
    if informative:
        return "; ".join(sorted(set(informative)))

    legacy = (meta.get("License") or "").strip()
    if legacy and len(legacy) < 80:
        return legacy

    if classifiers:
        return "; ".join(sorted(set(classifiers)))

    return "UNKNOWN"


rows = []
for dist in metadata.distributions():
    name = dist.metadata.get("Name")
    if not name:
        continue
    rows.append((name, dist.version, normalise(dist), (dist.metadata.get("Summary") or "")[:100]))

rows.sort(key=lambda r: r[0].lower())

def classify(licence: str) -> str:
    if any(p.lower() in licence.lower() for p in PERMISSIVE):
        return "Permitted"
    if any(r.lower() in licence.lower() for r in REVIEW):
        return "Permitted — see notes"
    return "**Verify manually**"

counts = {}
for _, _, licence, _ in rows:
    counts[licence] = counts.get(licence, 0) + 1

timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d")

lines = [
    "# Python Dependency Licence Inventory",
    "",
    "> **Generated file.** Run `./scripts/generate-python-licenses.sh` to regenerate.",
    f"> Generated {timestamp} from the versions installed in `apps/api/.venv`.",
    "",
    f"**{len(rows)}** distributions across **{len(counts)}** distinct licence strings.",
    "",
    "## Summary",
    "",
    "| Licence | Packages | Commercial use |",
    "| --- | ---: | --- |",
]

for licence, count in sorted(counts.items(), key=lambda kv: -kv[1]):
    lines.append(f"| {licence} | {count} | {classify(licence)} |")

lines += [
    "",
    "## All distributions",
    "",
    "| Package | Version | Licence | Purpose |",
    "| --- | --- | --- | --- |",
]

for name, version, licence, summary in rows:
    lines.append(f"| `{name}` | {version} | {licence} | {summary.replace('|', chr(92) + '|')} |")

lines.append("")

with open(output_path, "w", encoding="utf-8", newline="\n") as fh:
    fh.write("\n".join(lines))

print(f"Wrote {output_path}")
print(f"  {len(rows)} distributions, {len(counts)} licence strings")

unverified = [r for r in rows if classify(r[2]) == "**Verify manually**"]
if unverified:
    print(f"  {len(unverified)} need manual verification:")
    for name, version, licence, _ in unverified[:15]:
        print(f"    {name}=={version} — {licence}")
PYEOF
