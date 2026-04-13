"""Borosilicate glass envelope — COTS Pyrex tube."""
import cadquery as cq
from parameters import ENVELOPE_OD, ENVELOPE_ID, ENVELOPE_LENGTH


def make_envelope() -> cq.Workplane:
    outer = cq.Workplane("XY").circle(ENVELOPE_OD / 2).extrude(ENVELOPE_LENGTH)
    inner = cq.Workplane("XY").circle(ENVELOPE_ID / 2).extrude(ENVELOPE_LENGTH)
    return outer.cut(inner)


if __name__ == "__main__":
    e = make_envelope()
    cq.exporters.export(e, "build/envelope.step")
