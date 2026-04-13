#!/usr/bin/env python3
"""scripts/cad-diagram-coverage.py — measure CAD diagram coverage in MDX.

Checks:
  1. SVG files exist in web/public/cad/ for each part × view
  2. MDX references each SVG via <img> or similar tag

Parts: envelope, bottom_cap, top_cap, cathode_stack, anode_mesh, assembly
Views: front, iso

Output contract: last stdout line is a bare float (0-100) for autoresearch.
"""
import os
import glob

PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SVG_DIR = os.path.join(PROJECT, "web", "public", "cad")
MDX_FILE = os.path.join(PROJECT, "web", "app", "path-roomtemp", "page.mdx")

PARTS = ["envelope", "bottom_cap", "top_cap", "cathode_stack", "anode_mesh", "assembly"]
VIEWS = ["front", "iso"]

# Load MDX content
mdx_content = ""
if os.path.exists(MDX_FILE):
    with open(MDX_FILE) as f:
        mdx_content = f.read()

# Also scan all web/app files for references
web_content = mdx_content
for path in glob.glob(os.path.join(PROJECT, "web", "app", "**", "*"), recursive=True):
    if path.endswith((".mdx", ".tsx", ".ts")) and path != MDX_FILE:
        try:
            web_content += "\n" + open(path).read()
        except Exception:
            pass

total = 0
covered = 0
missing = []

for part in PARTS:
    for view in VIEWS:
        total += 1
        svg_name = f"{part}_{view}.svg"
        svg_path = os.path.join(SVG_DIR, svg_name)

        svg_exists = os.path.exists(svg_path) and os.path.getsize(svg_path) > 100
        mdx_refs = svg_name in web_content or f"/cad/{svg_name}" in web_content

        if svg_exists and mdx_refs:
            covered += 1
        else:
            reasons = []
            if not svg_exists:
                reasons.append("no SVG")
            if not mdx_refs:
                reasons.append("no MDX ref")
            missing.append(f"  {svg_name}: {', '.join(reasons)}")

pct = covered / total * 100 if total else 0

print(f"CAD diagram coverage: {covered}/{total} = {pct:.1f}%")
if missing:
    print(f"\nMissing ({len(missing)}):")
    print("\n".join(missing))
print()
print(f"{pct:.1f}")
