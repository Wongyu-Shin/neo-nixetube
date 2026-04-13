"""
Aluminum end cap with:
  - Lip sized to realistic glass ID tolerance (±0.3 mm)
  - Circumferential Torr Seal reservoir groove on the lip OD
  - TO-8 feedthrough pocket + 12 pin through-holes
  - Variant geometry: top cap has a central sight-glass bore,
    bottom cap has an off-axis fill-port through-hole.

Composite seal: IIR butyl rubber fills the lip-to-glass annulus (inner,
flexible, absorbs CTE mismatch + low gas permeability). Torr Seal rigid
epoxy overcoats the exposed external joint face (outer, near-zero perm,
protected from CTE cycling by butyl cushion). Total path: 4mm + 3mm = 7mm.
"""
import math

import cadquery as cq
from parameters import (
    END_CAP_OD,
    END_CAP_THICKNESS,
    END_CAP_GROOVE_WIDTH,
    END_CAP_GROOVE_DEPTH,
    END_CAP_LIP_HEIGHT,
    ENVELOPE_ID,
    LIP_OD_CLEARANCE,
    FT_BODY_OD,
    FT_BODY_HEIGHT,
    FT_PIN_PCD,
    FT_PIN_COUNT,
    FT_PIN_DIAMETER,
    FT_PIN_CLEARANCE,
    SIGHT_GLASS_OD,
    SIGHT_GLASS_THICKNESS,
    FILL_STEM_OD,
)

# Pin clearance hole sized for standard 0.7 mm drill bit. These holes require
# a separate drill-press step (15K+ RPM spindle, not the desktop CNC Nomad
# which maxes at 10K RPM). Use the feedthrough body as a drill guide jig for
# positional accuracy. Hermetic seal is in the glass beads, not the Al holes.
# Annular gaps are sealed with Torr Seal vacuum epoxy after header insertion.
PIN_CLEARANCE_HOLE_D = FT_PIN_DIAMETER + FT_PIN_CLEARANCE  # ≈ 0.66 mm
LIP_OD_RADIUS = (ENVELOPE_ID - LIP_OD_CLEARANCE) / 2  # ~10.7 mm worst-case safe


def _base_cap() -> cq.Workplane:
    """Common base: disk + lip + butyl groove on lip OD + pocket + pin holes."""
    # Base disk
    cap = (
        cq.Workplane("XY")
        .circle(END_CAP_OD / 2)
        .extrude(END_CAP_THICKNESS)
    )

    # Lip on +Z face
    cap = (
        cap.faces(">Z")
        .workplane()
        .circle(LIP_OD_RADIUS)
        .extrude(END_CAP_LIP_HEIGHT)
    )

    # Circumferential butyl reservoir groove on the lip OD — axial width
    # END_CAP_GROOVE_WIDTH, recessed by END_CAP_GROOVE_DEPTH below LIP_OD_RADIUS.
    # Apply butyl over full lip OD, seat glass. Groove retains excess butyl.
    # After cure: apply Torr Seal overcoat on exposed external joint face.
    groove_z_center = END_CAP_THICKNESS + END_CAP_LIP_HEIGHT * 0.6
    groove_ring = (
        cq.Workplane("XY")
        .workplane(offset=groove_z_center - END_CAP_GROOVE_WIDTH / 2)
        .circle(LIP_OD_RADIUS + 0.1)                       # outer (slightly proud)
        .circle(LIP_OD_RADIUS - END_CAP_GROOVE_DEPTH)      # inner
        .extrude(END_CAP_GROOVE_WIDTH)
    )
    cap = cap.cut(groove_ring)

    # Feedthrough pocket on bottom face (-Z). Header slides into pocket with
    # 0.10 mm/side clearance (centered in desktop CNC tolerance band ±0.05-0.10).
    # Torr Seal fills the annular gap for hermeticity.
    pocket = (
        cq.Workplane("XY")
        .circle(FT_BODY_OD / 2 + 0.10)
        .extrude(FT_BODY_HEIGHT)
    )
    cap = cap.cut(pocket)

    # 12 pin clearance through-holes (punch through entire cap height)
    total_height = END_CAP_THICKNESS + END_CAP_LIP_HEIGHT
    for i in range(FT_PIN_COUNT):
        theta = 2 * math.pi * i / FT_PIN_COUNT
        x = (FT_PIN_PCD / 2) * math.cos(theta)
        y = (FT_PIN_PCD / 2) * math.sin(theta)
        pin_hole = (
            cq.Workplane("XY")
            .moveTo(x, y)
            .circle(PIN_CLEARANCE_HOLE_D / 2)
            .extrude(total_height)
        )
        cap = cap.cut(pin_hole)

    return cap


def make_bottom_cap() -> cq.Workplane:
    """
    Bottom cap: base + fill port through-hole offset from axis.

    Fill port at fill_offset = 8.15 with hole radius ≈ 1.69 mm:
      - outer hole edge radius from axis = 9.84 < groove inner 9.9 ✓
      - inner hole edge radius from axis = 6.46 > pocket OD 6.4 ✓
    The full-height extrude penetrates both base disk and lip safely
    because the hole stays inside the groove inner radius circumferentially.
    """
    cap = _base_cap()
    total_height = END_CAP_THICKNESS + END_CAP_LIP_HEIGHT
    fill_offset = 8.15
    fill_hole = (
        cq.Workplane("XY")
        .moveTo(fill_offset, 0)
        .circle(FILL_STEM_OD / 2 + 0.1)
        .extrude(total_height)
    )
    cap = cap.cut(fill_hole)
    return cap


def make_top_cap() -> cq.Workplane:
    """Top cap: base + central sight-glass bore for axial viewing."""
    cap = _base_cap()
    total_height = END_CAP_THICKNESS + END_CAP_LIP_HEIGHT
    # Sight glass bore — central through-hole that will be sealed with a
    # sapphire/borosilicate window and sol-gel bonded. The bore must clear
    # the feedthrough pocket depth, so use full-height cut.
    sight_bore = (
        cq.Workplane("XY")
        .circle(SIGHT_GLASS_OD / 2)
        .extrude(total_height)
    )
    cap = cap.cut(sight_bore)
    # Seat shelf for the sight glass: widen the -Z face of the bore by 0.5 mm
    # for the glass disk to rest on, recessed by SIGHT_GLASS_THICKNESS.
    shelf = (
        cq.Workplane("XY")
        .circle(SIGHT_GLASS_OD / 2 + 0.5)
        .extrude(SIGHT_GLASS_THICKNESS)
    )
    cap = cap.cut(shelf)
    return cap


# Backwards compatibility alias — older code imported make_end_cap.
def make_end_cap() -> cq.Workplane:
    """Alias for the bottom cap variant (for legacy callers)."""
    return make_bottom_cap()


if __name__ == "__main__":
    b = make_bottom_cap()
    cq.exporters.export(b, "build/end_cap_bottom.step")
    t = make_top_cap()
    cq.exporters.export(t, "build/end_cap_top.step")
