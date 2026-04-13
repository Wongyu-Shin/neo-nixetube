"""
Front anode mesh — nickel wire/photo-etched grid in the XZ plane at front of
the cathode stack. Chord-clipped to fit inside the envelope at its Y offset.
"""
import cadquery as cq
from parameters import ANODE_WIRE_D, ANODE_CELL, ENVELOPE_ID


def make_anode_mesh(y_offset: float = 0.0) -> cq.Workplane:
    """
    Build a flat grid in the XZ plane extruded along +Y by the wire diameter.
    Plate width is chord-limited to the envelope inner radius at `y_offset`:
        max_half_width = sqrt((ID/2)² - y_offset²) * 0.9
    This guarantees the plate does not penetrate the envelope wall when placed
    at (0, y_offset, *) inside the tube.
    """
    R = ENVELOPE_ID / 2
    if abs(y_offset) >= R:
        raise ValueError(f"anode y_offset {y_offset} exceeds envelope radius {R}")
    half_width = (R * R - y_offset * y_offset) ** 0.5 * 0.9
    width = 2 * half_width
    height = 24.0  # tall enough to cover cathode digit region + margin

    plate = (
        cq.Workplane("XZ")
        .rect(width, height)
        .extrude(ANODE_WIRE_D)
    )

    # Grid holes for mesh appearance
    nx = int(width / ANODE_CELL)
    nz = int(height / ANODE_CELL)
    x_offset = -((nx - 1) * ANODE_CELL) / 2
    z_offset = -((nz - 1) * ANODE_CELL) / 2
    holes = None
    for i in range(nx):
        for j in range(nz):
            x = x_offset + i * ANODE_CELL
            z = z_offset + j * ANODE_CELL
            hole = (
                cq.Workplane("XZ")
                .moveTo(x, z)
                .rect(ANODE_CELL - ANODE_WIRE_D, ANODE_CELL - ANODE_WIRE_D)
                .extrude(ANODE_WIRE_D)
            )
            holes = hole if holes is None else holes.union(hole)
    if holes is not None:
        plate = plate.cut(holes)
    return plate


if __name__ == "__main__":
    a = make_anode_mesh()
    cq.exporters.export(a, "build/anode_mesh.step")
