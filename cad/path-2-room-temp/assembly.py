"""Top-level assembly for 경로 2 Nixie tube. Exports STEP of the full stack."""
import cadquery as cq

import math

from parameters import (
    ENVELOPE_LENGTH,
    END_CAP_THICKNESS,
    END_CAP_LIP_HEIGHT,
    CATH_COUNT,
    CATH_PITCH,
    CATH_DIGIT_HEIGHT,
    ANODE_WIRE_D,
    FILL_STEM_OD,
    FILL_STEM_ID,
    FILL_STEM_LENGTH,
    FT_PIN_PCD,
    FT_PIN_LENGTH_IN,
)
from envelope import make_envelope
from end_cap import make_bottom_cap, make_top_cap
from cathode_stack import make_cathode_stack
from anode_mesh import make_anode_mesh


def make_fill_stem() -> cq.Workplane:
    """1/16 inch Cu capillary stem extruded along -Z (protrudes below bottom cap)."""
    outer = (
        cq.Workplane("XY")
        .circle(FILL_STEM_OD / 2)
        .extrude(FILL_STEM_LENGTH)
    )
    inner = (
        cq.Workplane("XY")
        .circle(FILL_STEM_ID / 2)
        .extrude(FILL_STEM_LENGTH)
    )
    return outer.cut(inner)


def make_assembly() -> cq.Assembly:
    asm = cq.Assembly(name="nixie_path2_room_temp")

    # Envelope at origin, extends +Z
    asm.add(make_envelope(), name="envelope", color=cq.Color(0.8, 0.9, 1.0, 0.3))

    # Bottom cap: base sits BELOW envelope at Z ∈ [-5, 0],
    # lip enters glass ID at Z ∈ [0, 4]. Has fill-port through-hole.
    asm.add(
        make_bottom_cap(),
        name="bottom_cap",
        loc=cq.Location(cq.Vector(0, 0, -END_CAP_THICKNESS)),
        color=cq.Color(0.5, 0.5, 0.5, 1.0),
    )

    # Fill-port stem: 1/16" Cu capillary INSERTED into the bottom-cap fill hole.
    # Stem occupies local Z ∈ [0, FILL_STEM_LENGTH]. With translation -12,
    # stem world Z ∈ [-12, 0] → 5 mm overlap with bottom cap (Z ∈ [-5, 0])
    # plus 7 mm protrusion below for crimp-sealing post-Ne flush.
    # X offset matches end_cap.py make_bottom_cap fill_offset = 8.15.
    asm.add(
        make_fill_stem(),
        name="fill_stem",
        loc=cq.Location(cq.Vector(8.15, 0, -FILL_STEM_LENGTH)),
        color=cq.Color(0.7, 0.45, 0.2, 1.0),   # copper
    )

    # Cathode stack: digits in XZ plane (standing up), offset along Y (depth).
    # CadQuery rect() is origin-centered, so the digit Z origin is the digit
    # CENTER (not bottom). Place stack at envelope center directly so digit
    # centers align with the anode center (also at ENVELOPE_LENGTH/2).
    stack_z_base = ENVELOPE_LENGTH / 2
    asm.add(
        make_cathode_stack(),
        name="cathodes",
        loc=cq.Location(cq.Vector(0, 0, stack_z_base)),
    )

    # Anode mesh sits in FRONT of the cathode stack (closer to viewer, -Y side)
    # as a vertical XZ-plane grid — viewer looks through anode mesh into the
    # glowing cathode behind it. The mesh is chord-clipped to the envelope.
    stack_half_depth = (CATH_COUNT - 1) / 2 * CATH_PITCH
    anode_y = -(stack_half_depth + 1.5)
    asm.add(
        make_anode_mesh(y_offset=anode_y),
        name="anode",
        loc=cq.Location(cq.Vector(0, anode_y, ENVELOPE_LENGTH / 2)),
        color=cq.Color(0.75, 0.75, 0.75, 1.0),
    )

    # Anode lead wire: connects the mesh to pin 0 (angle 0° on PCD).
    # Two segments like cathode leads: (1) vertical drop from anode center
    # to routing plane Z=-10 (stack-local), then (2) radial reach to pin 0.
    # In world coords: anode at (0, anode_y, 30), routing plane at
    # Z = 30 - 10 = 20, pin 0 at (3.75, 0, 4 + FT_PIN_LENGTH_IN) = (3.75, 0, 12).
    anode_lead_d = 0.4
    pin0_x = FT_PIN_PCD / 2   # angle 0° → (r, 0)
    # Pin tip world Z: cap at -5, pocket ceiling at -5+4.5=-0.5, pin extends +8.
    pin0_world_z = -END_CAP_THICKNESS + 4.5 + FT_PIN_LENGTH_IN  # = 7.5
    routing_world_z = 20.0                  # = stack_center - 10

    seg1 = (
        cq.Workplane("XY")
        .circle(anode_lead_d / 2)
        .extrude(ENVELOPE_LENGTH / 2 - routing_world_z)
        .translate((0, anode_y, routing_world_z))
    )
    # Seg2: from (0, anode_y, routing_z) to (pin0_x, 0, pin0_world_z)
    dx = pin0_x
    dy = 0 - anode_y
    dz = pin0_world_z - routing_world_z
    seg2_len = math.sqrt(dx * dx + dy * dy + dz * dz)
    seg2 = cq.Workplane("XY").circle(anode_lead_d / 2).extrude(seg2_len)
    # Rotate: axis = (-dy, dx, 0), angle = acos(dz/len)
    cos_a = max(-1.0, min(1.0, dz / seg2_len))
    angle_d = math.degrees(math.acos(cos_a))
    seg2 = seg2.rotate((0, 0, 0), (-dy, dx, 0), angle_d)
    seg2 = seg2.translate((0, anode_y, routing_world_z))
    anode_lead = seg1.union(seg2)
    asm.add(
        anode_lead,
        name="anode_lead",
        color=cq.Color(0.85, 0.85, 0.9, 1.0),
    )

    # Top cap: mirrored so lip points -Z into glass ID, base sits ABOVE
    # envelope at Z ∈ [60, 65] with lip at Z ∈ [57, 60]. Has central sight-glass bore.
    top_cap = make_top_cap().mirror("XY")
    asm.add(
        top_cap,
        name="top_cap",
        loc=cq.Location(cq.Vector(0, 0, ENVELOPE_LENGTH + END_CAP_THICKNESS)),
        color=cq.Color(0.5, 0.5, 0.5, 1.0),
    )

    return asm


if __name__ == "__main__":
    a = make_assembly()
    a.save("build/assembly.step", "STEP")
    print("assembly.step written")
