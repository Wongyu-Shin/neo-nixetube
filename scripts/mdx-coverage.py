#!/usr/bin/env python3
"""scripts/mdx-coverage.py — measure how many CAD parameters are documented in web/app/.

Reads cad/path-2-room-temp/parameters.py, extracts all literal constants,
adds key derived values, then scans web/app/**/*.{mdx,tsx,ts} for presence
of each value. Outputs a coverage percentage.

Output contract: last stdout line is a bare float (0-100) for autoresearch.
"""
import re, os, glob, sys

PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CAD_DIR = os.path.join(PROJECT, "cad", "path-2-room-temp")
WEB_DIR = os.path.join(PROJECT, "web", "app")

# --- 1. Extract literal params from parameters.py ---
params: dict[str, object] = {}
with open(os.path.join(CAD_DIR, "parameters.py")) as f:
    for line in f:
        m = re.match(r'^([A-Z_]+)\s*=\s*(.+?)(?:\s*#.*)?$', line)
        if not m:
            continue
        name, raw = m.group(1), m.group(2).strip()
        try:
            params[name] = float(raw)
        except ValueError:
            if raw.startswith('"') or raw.startswith("'"):
                params[name] = raw.strip('"').strip("'")
            # Skip computed references (contain uppercase letters = other vars)

# --- 2. Add key derived params not expressed as literals ---
if "ENVELOPE_OD" in params and "ENVELOPE_WALL" in params:
    params["ENVELOPE_ID"] = float(params["ENVELOPE_OD"]) - 2 * float(params["ENVELOPE_WALL"])

# --- 3. Load all web content ---
web_content = ""
for path in glob.glob(os.path.join(WEB_DIR, "**", "*"), recursive=True):
    if path.endswith((".mdx", ".tsx", ".ts", ".jsx", ".js")):
        try:
            web_content += open(path).read() + "\n"
        except Exception:
            pass

# --- 4. Check coverage ---
covered = []
missing = []

for name in sorted(params):
    val = params[name]
    found = False

    if isinstance(val, float):
        # Generate candidate string forms: "25.0", "25", "25.00"
        candidates = {str(val), f"{val:g}"}
        if val == int(val):
            candidates.add(str(int(val)))
        found = any(c in web_content for c in candidates)
    elif isinstance(val, str):
        found = val in web_content

    if found:
        covered.append(name)
    else:
        missing.append(name)

total = len(params)
pct = len(covered) / total * 100 if total else 0

# --- 5. Report ---
print(f"Parameter coverage: {len(covered)}/{total} = {pct:.1f}%")
if missing:
    print(f"\nMissing ({len(missing)}):")
    for m in missing:
        print(f"  {m} = {params[m]}")
print()
# Last line: bare float for autoresearch
print(f"{pct:.1f}")
