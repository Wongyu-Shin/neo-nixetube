"""
10 digit cathodes — standup orientation with connected digit profiles,
mica spacer frame, and a pin-to-cathode lead wire harness.

Geometry convention:
  - Digit plane is the XZ plane (digit stands UP along Z, width along X).
  - Stack axis is Y — digits are offset along Y so viewer looking down -Y
    sees digit 0 at front, digit 9 at back. This is the standard IN-14/IN-18
    orientation: Nixie long axis = Z, viewing axis = Y.
  - Origin Y = 0 is the center of the stack.
"""
import math

import cadquery as cq
from parameters import (
    CATH_FOIL_THICKNESS,
    CATH_DIGIT_HEIGHT,
    CATH_DIGIT_WIDTH,
    CATH_PITCH,
    CATH_COUNT,
    FT_PIN_PCD,
    FT_PIN_COUNT,
    FT_PIN_LENGTH_IN,
)

LEAD_WIRE_D = 0.4   # 0.4 mm Ni lead wire (spot-welded to digit foil)


def _cylinder_between(start: tuple, end: tuple, diameter: float):
    """
    Build a cylinder of given diameter from start to end (3D points).
    Uses rotation about (axis ⊥ to both +Z and direction) by acos(dz/length).
    """
    sx, sy, sz = start
    ex, ey, ez = end
    dx, dy, dz = ex - sx, ey - sy, ez - sz
    length = math.sqrt(dx * dx + dy * dy + dz * dz)
    if length < 1e-6:
        return None
    cyl = cq.Workplane("XY").circle(diameter / 2).extrude(length)
    if abs(dx) < 1e-9 and abs(dy) < 1e-9:
        if dz < 0:
            return cyl.translate((sx, sy, sz - length))
        return cyl.translate((sx, sy, sz))
    # Rotation: cylinder is along +Z. Rotate so axis aligns with (dx,dy,dz).
    # Axis of rotation = (0,0,1) × (dx,dy,dz) = (-dy, dx, 0).
    axis = (-dy, dx, 0)
    cos_angle = max(-1.0, min(1.0, dz / length))
    angle_deg = math.degrees(math.acos(cos_angle))
    cyl = cyl.rotate((0, 0, 0), axis, angle_deg)
    return cyl.translate((sx, sy, sz))


def make_lead_harness() -> cq.Workplane:
    """
    10 lead wires — TWO-SEGMENT routing per cathode to avoid piercing other
    cathode foils. Each lead has:
      1. Vertical drop: from digit bottom-center DOWN axially (-Z) past the
         entire stack, parallel to tube axis. Stays at the digit's own Y
         offset so it doesn't cross any other digit's XZ plane.
      2. Radial reach: from the bottom of the drop (at "lead routing plane"
         Z = -10) outward in XY to the assigned pin position.

    Routing plane Z = -10 is below the digit stack bottom (-7.5) so all leads
    travel through "empty" space below all foils until they fan out to pins.
    """
    from parameters import END_CAP_THICKNESS, FT_BODY_HEIGHT, ENVELOPE_LENGTH
    stack_center_idx = (CATH_COUNT - 1) / 2.0
    # Pin tip world Z: cap starts at -END_CAP_THICKNESS, pocket ceiling is at
    # -END_CAP_THICKNESS + FT_BODY_HEIGHT, pin extends +Z by FT_PIN_LENGTH_IN.
    pin_tip_world_z = -END_CAP_THICKNESS + FT_BODY_HEIGHT + FT_PIN_LENGTH_IN
    stack_center_world_z = ENVELOPE_LENGTH / 2
    pin_z_local = pin_tip_world_z - stack_center_world_z  # ≈ -22.5
    routing_z = -10.0                          # below all digits (z_min=-7.5)
    digit_bottom_z = -CATH_DIGIT_HEIGHT / 2    # = -7.5

    bundle = None
    for i in range(CATH_COUNT):
        digit_y = (i - stack_center_idx) * CATH_PITCH
        theta = math.radians(60 + 30 * i)
        pin_x = (FT_PIN_PCD / 2) * math.cos(theta)
        pin_y = (FT_PIN_PCD / 2) * math.sin(theta)

        # Segment 1: vertical drop at digit's own Y (no cross-stack pierce).
        # Anchor at per-digit guaranteed-inside point (handles digits 1/4/7
        # which lack a bottom bar 'd').
        anchor_x, anchor_z = DIGIT_LEAD_ANCHOR[i]
        seg1 = _cylinder_between(
            (anchor_x, digit_y, anchor_z),
            (anchor_x, digit_y, routing_z),
            LEAD_WIRE_D,
        )
        # Segment 2: radial reach from drop-bottom to pin
        seg2 = _cylinder_between(
            (anchor_x, digit_y, routing_z),
            (pin_x, pin_y, pin_z_local),
            LEAD_WIRE_D,
        )
        for seg in (seg1, seg2):
            if seg is None:
                continue
            bundle = seg if bundle is None else bundle.union(seg)

    return bundle if bundle is not None else cq.Workplane("XY").box(0.01, 0.01, 0.01)

# Styled font-based numeral cathodes — unique curved silhouette per digit.
# CadQuery text() generates proper shaped numerals from the OS font engine,
# replacing the former 7-segment rectangular bars. A lead wire tab at the
# bottom of each digit maintains compatibility with the existing lead harness.
DIGIT_FONT = "Arial"
DIGIT_FONT_SIZE = CATH_DIGIT_HEIGHT  # 15mm tall

# Per-digit lead-wire anchor: (X, Z) at bottom-center of the lead tab.
# All digits get a tab at (0, -8.5) — below the font glyph bottom edge,
# ensuring the anchor point is inside solid material regardless of glyph shape.
LEAD_TAB_Z = -CATH_DIGIT_HEIGHT / 2 - 1.0  # 1mm below digit bottom
DIGIT_LEAD_ANCHOR = {i: (0.0, LEAD_TAB_Z) for i in range(10)}


def make_digit(value: int) -> cq.Workplane:
    """Styled font-based numeral cathode with lead wire tab. The font generates
    proper curved/calligraphic shapes (IN-14/IN-18 style). A rectangular tab
    at the bottom connects to the lead harness anchor point."""
    # Font-rendered numeral shape
    digit = (
        cq.Workplane("XZ")
        .text(str(value), DIGIT_FONT_SIZE, CATH_FOIL_THICKNESS,
              combine=False, font=DIGIT_FONT, halign="center", valign="center")
    )
    # Lead wire tab: small rectangle extending from digit bottom to anchor point.
    # This ensures the lead harness has solid material to attach to.
    tab = (
        cq.Workplane("XZ")
        .center(0.0, LEAD_TAB_Z)
        .rect(2.0, 3.0)  # 2mm wide × 3mm tall tab below digit
        .extrude(CATH_FOIL_THICKNESS)
    )
    digit = digit.union(tab)
    return digit


def make_mica_spacer(y_offset: float) -> cq.Workplane:
    """
    Mica spacer plate for the cathode stack.

    The mica is a flat 0.3 mm plate in the XZ plane at `y_offset` from the tube
    centerline. Because it sits at a non-zero Y inside a cylindrical envelope
    (ID = ENVELOPE_ID), its width must be chord-limited: the maximum |X| at
    offset y is sqrt(R² - y²) where R = ENVELOPE_ID/2. The plate width is set
    to 2 * max_half_width * safety (0.9).
    Returned geometry is a rectangle in the XZ plane extruded along ±Y by
    the mica thickness, centered at Y=0. The caller must translate to
    (0, y_offset, stack_center_z).
    """
    from parameters import ENVELOPE_ID
    mica_thickness = 0.3
    R = ENVELOPE_ID / 2
    if abs(y_offset) >= R:
        raise ValueError(f"mica y_offset {y_offset} exceeds envelope radius {R}")
    half_width = (R * R - y_offset * y_offset) ** 0.5 * 0.9  # 10% safety margin
    width = 2 * half_width
    # Height: use full cathode digit height plus ~4 mm top/bottom margin
    height = CATH_DIGIT_HEIGHT + 4.0

    plate = (
        cq.Workplane("XZ")
        .rect(width, height)
        .extrude(mica_thickness)
    )
    # Central digit slot — so the plate doesn't occlude the glow path
    slot = (
        cq.Workplane("XZ")
        .rect(CATH_DIGIT_WIDTH + 1, CATH_DIGIT_HEIGHT + 1)
        .extrude(mica_thickness)
    )
    return plate.cut(slot)


def make_cathode_stack() -> cq.Assembly:
    """
    Build the full stack: 10 digit foils (0..9) offset along Y, separated
    by 2 mica spacers (front + back of stack). Each digit plane is XZ
    at offset y = (i - (N-1)/2) * CATH_PITCH, so the stack is centered on Y=0.
    """
    asm = cq.Assembly(name="cathode_stack")

    stack_center = (CATH_COUNT - 1) / 2.0
    for i in range(CATH_COUNT):
        y = (i - stack_center) * CATH_PITCH
        asm.add(
            make_digit(i),
            name=f"cathode_{i}",
            loc=cq.Location(cq.Vector(0, y, 0)),
            color=cq.Color(0.9, 0.9, 0.9, 1.0),
        )

    # Mica spacer plates at the front and back of the stack.
    # Digits are origin-centered (Z ∈ [-7.5, +7.5]), so mica plates go at
    # Z=0 (NOT CATH_DIGIT_HEIGHT/2 — that was a seed bug that displaced
    # spacers 7.5 mm above the digit centers).
    front_y = -(stack_center + 0.6) * CATH_PITCH
    back_y = (stack_center + 0.6) * CATH_PITCH
    asm.add(
        make_mica_spacer(front_y),
        name="mica_front",
        loc=cq.Location(cq.Vector(0, front_y, 0)),
        color=cq.Color(0.95, 0.9, 0.6, 1.0),
    )
    asm.add(
        make_mica_spacer(back_y),
        name="mica_back",
        loc=cq.Location(cq.Vector(0, back_y, 0)),
        color=cq.Color(0.95, 0.9, 0.6, 1.0),
    )

    # Lead wire harness — 10 thin Ni wires connecting each digit's bottom
    # edge to its assigned TO-8 pin. This is the electrical path that the
    # critic team flagged as missing in earlier iterations (C3/C5 critical).
    asm.add(
        make_lead_harness(),
        name="lead_harness",
        color=cq.Color(0.85, 0.85, 0.9, 1.0),
    )

    return asm


if __name__ == "__main__":
    stack = make_cathode_stack()
    stack.save("build/cathode_stack.step", "STEP")
