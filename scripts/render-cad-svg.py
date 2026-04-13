#!/usr/bin/env python3
"""Render CadQuery parts to SVG for web documentation.

Reads cad/path-2-room-temp/ modules (read-only), exports front + iso SVGs
to web/public/cad/. Post-processes each SVG to add a tight viewBox so the
drawing fills the container without wasted whitespace.

Re-run whenever CAD files change.
Usage: python3 scripts/render-cad-svg.py
"""
import sys
import os
import re

PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CAD_DIR = os.path.join(PROJECT, "cad", "path-2-room-temp")
OUT_DIR = os.path.join(PROJECT, "web", "public", "cad")

sys.path.insert(0, CAD_DIR)
os.chdir(CAD_DIR)

import cadquery as cq
from envelope import make_envelope
from end_cap import make_bottom_cap, make_top_cap
from cathode_stack import make_cathode_stack
from anode_mesh import make_anode_mesh
from assembly import make_assembly

os.makedirs(OUT_DIR, exist_ok=True)

COMMON_OPTS = {
    "showAxes": False,
    "showHidden": True,
    "strokeWidth": 0.5,
    "strokeColor": (200, 200, 200),
    "hiddenColor": (80, 80, 80),
}

VIEWS = {
    "front": {"projectionDir": (0, -1, 0), "width": 400, "height": 300},
    "iso": {"projectionDir": (0.57, -0.57, 0.57), "width": 500, "height": 400},
}


def fix_svg_viewbox(svg_path: str):
    """Post-process SVG: parse all path `d` data to find the actual bounding
    box of rendered content, then set viewBox to a tight crop with 5% padding."""
    with open(svg_path) as f:
        content = f.read()

    # Extract all numeric coordinates from path d= attributes
    # CadQuery SVGs use M/L/C/Q commands with absolute coordinates
    path_data = re.findall(r'd="([^"]+)"', content)
    all_coords = []
    for d in path_data:
        nums = re.findall(r'[-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?', d)
        # Coordinates alternate x, y in path data (after M, L, etc.)
        coords = [float(n) for n in nums]
        for i in range(0, len(coords) - 1, 2):
            all_coords.append((coords[i], coords[i + 1]))

    if not all_coords:
        return

    xs = [c[0] for c in all_coords]
    ys = [c[1] for c in all_coords]
    min_x, max_x = min(xs), max(xs)
    min_y, max_y = min(ys), max(ys)

    # But these are in the <g transform="scale(sx,sy) translate(tx,ty)"> space
    # The paths are in user coords BEFORE transform. We need SVG pixel coords.
    # Extract the transform
    m = re.search(
        r'<g\s+transform="scale\(([^,]+),\s*([^)]+)\)\s+translate\(([^,]+),\s*([^)]+)\)"',
        content,
    )
    if not m:
        return

    sx, sy = float(m.group(1)), float(m.group(2))
    tx, ty = float(m.group(3)), float(m.group(4))

    # Transform user coords to SVG pixel coords:
    # svg_x = sx * (user_x + tx)
    # svg_y = sy * (user_y + ty)  (sy is negative → Y flip)
    def to_svg(ux, uy):
        return sx * (ux + tx), sy * (uy + ty)

    svg_coords = [to_svg(c[0], c[1]) for c in all_coords]
    svg_xs = [c[0] for c in svg_coords]
    svg_ys = [c[1] for c in svg_coords]

    vb_min_x = min(svg_xs)
    vb_max_x = max(svg_xs)
    vb_min_y = min(svg_ys)
    vb_max_y = max(svg_ys)

    vb_w = vb_max_x - vb_min_x
    vb_h = vb_max_y - vb_min_y

    # Add 5% padding
    pad_x = vb_w * 0.05
    pad_y = vb_h * 0.05
    vb_min_x -= pad_x
    vb_min_y -= pad_y
    vb_w += 2 * pad_x
    vb_h += 2 * pad_y

    # Replace or add viewBox, remove fixed width/height for responsive scaling
    viewbox = f'viewBox="{vb_min_x:.2f} {vb_min_y:.2f} {vb_w:.2f} {vb_h:.2f}"'

    # Remove existing viewBox if any
    content = re.sub(r'viewBox="[^"]*"\s*', '', content)
    # Replace width/height with viewBox only
    content = re.sub(
        r'width="[^"]*"\s*\n\s*height="[^"]*"',
        viewbox,
        content,
    )

    with open(svg_path, "w") as f:
        f.write(content)

    return f"viewBox cropped to {vb_w:.0f}x{vb_h:.0f}"


def export_part(name, workplane):
    for vn, vo in VIEWS.items():
        opts = {**COMMON_OPTS, **vo}
        out = os.path.join(OUT_DIR, f"{name}_{vn}.svg")
        try:
            cq.exporters.export(workplane, out, exportType="SVG", opt=opts)
            result = fix_svg_viewbox(out)
            size = os.path.getsize(out)
            print(f"  {name}_{vn}.svg: {size:,}B — {result}")
        except Exception as e:
            print(f"  {name}_{vn}.svg: FAILED ({e})")


def export_assembly(name, assembly):
    compound = assembly.toCompound()
    for vn, vo in VIEWS.items():
        opts = {**COMMON_OPTS, **vo, "width": 600, "height": 500}
        out = os.path.join(OUT_DIR, f"{name}_{vn}.svg")
        try:
            cq.exporters.export(compound, out, exportType="SVG", opt=opts)
            result = fix_svg_viewbox(out)
            size = os.path.getsize(out)
            print(f"  {name}_{vn}.svg: {size:,}B — {result}")
        except Exception as e:
            print(f"  {name}_{vn}.svg: FAILED ({e})")


print("Rendering CAD parts to SVG (auto-fit viewBox)...")
print(f"Output: {OUT_DIR}\n")

for label, fn in [
    ("envelope", lambda: make_envelope()),
    ("bottom_cap", lambda: make_bottom_cap()),
    ("top_cap", lambda: make_top_cap()),
    ("anode_mesh", lambda: make_anode_mesh()),
]:
    print(f"[{label}]")
    export_part(label, fn())

for label, fn in [
    ("cathode_stack", lambda: make_cathode_stack()),
    ("assembly", lambda: make_assembly()),
]:
    print(f"[{label}]")
    export_assembly(label, fn())

print("\nDone.")
