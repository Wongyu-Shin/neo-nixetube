"""Cross-team parity tests: verify web/ hardcoded values match sim/ outputs.

These tests parse the TypeScript component files to extract hardcoded numeric
values, then run the corresponding Python simulation functions and assert
they match within tolerance. This catches drift between the sim source of
truth and the web visualization layer.
"""

import math
import os
import re
import sys

import pytest

# ---------------------------------------------------------------------------
# Path setup — allow importing from sim/
# ---------------------------------------------------------------------------
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SIM_DIR = os.path.join(REPO_ROOT, "sim")
WEB_COMPONENTS = os.path.join(REPO_ROOT, "web", "app", "components")

sys.path.insert(0, SIM_DIR)

from paschen import breakdown_voltage, paschen_minimum  # noqa: E402
from glow_model import cathode_dark_space, CATHODE_PARAMS  # noqa: E402


# ---------------------------------------------------------------------------
# Helpers — read TSX files as text
# ---------------------------------------------------------------------------
def _read_component(filename: str) -> str:
    path = os.path.join(WEB_COMPONENTS, filename)
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


# ===========================================================================
# 1. PaschenChart bridge markers — 4 tests
# ===========================================================================

def _extract_bridges(tsx: str) -> list[dict]:
    """Extract bridge marker objects from PaschenChart.tsx BRIDGES array."""
    # Match objects like { id: "b1", ..., pd: 3.5, vb: 180, ... }
    pattern = (
        r'\{\s*id:\s*"([^"]+)"'     # id
        r'.*?pd:\s*([\d.]+)'         # pd
        r'.*?vb:\s*([\d.]+)'         # vb
    )
    bridges = []
    for m in re.finditer(pattern, tsx, re.DOTALL):
        bridges.append({
            "id": m.group(1),
            "pd": float(m.group(2)),
            "vb": float(m.group(3)),
        })
    return bridges


_PASCHEN_TSX = _read_component("PaschenChart.tsx")
_BRIDGES = _extract_bridges(_PASCHEN_TSX)

# Sanity: we must find exactly 4 bridges
assert len(_BRIDGES) == 4, f"Expected 4 bridges, found {len(_BRIDGES)}"


@pytest.mark.parametrize(
    "bridge",
    _BRIDGES,
    ids=[b["id"] for b in _BRIDGES],
)
def test_paschen_bridge_marker_vb(bridge):
    """Verify that each bridge marker's Vb matches sim breakdown_voltage within 10%."""
    pd = bridge["pd"]
    vb_web = bridge["vb"]

    # Determine gas from bridge id
    gas = "Ar" if bridge["id"] == "ar" else "Ne"

    # Compute: breakdown_voltage(p, d, gas) — we set d=1 cm so p=pd
    vb_sim = breakdown_voltage(pd, 1.0, gas)

    assert not math.isnan(vb_sim), (
        f"breakdown_voltage returned NaN for pd={pd}, gas={gas}"
    )

    rel_err = abs(vb_sim - vb_web) / vb_web
    assert rel_err < 0.10, (
        f"Bridge {bridge['id']}: web Vb={vb_web}, sim Vb={vb_sim:.1f}, "
        f"relative error={rel_err:.2%} exceeds 10%"
    )


# ===========================================================================
# 2. GlowComparison conditions — dc values (1 test, checks all 5)
# ===========================================================================

def _extract_glow_conditions(tsx: str) -> list[dict]:
    """Extract CONDITIONS array from GlowComparison.tsx.

    Each entry has label, dc, glow, ratio, intensity.
    We need the label (to infer pressure) and dc (to compare).
    """
    # Match lines like: { label: "...", dc: 291, glow: 204, ...}
    pattern = (
        r'\{\s*label:\s*"([^"]+)"'
        r'.*?dc:\s*([\d.]+)'
    )
    conditions = []
    for m in re.finditer(pattern, tsx, re.DOTALL):
        conditions.append({
            "label": m.group(1),
            "dc_um": float(m.group(2)),
        })
    return conditions


def _pressure_from_label(label: str) -> float | None:
    """Infer pressure (Torr) from condition label.

    Labels look like:
      "전통 (15T, 1.5mm)"  → 15 Torr
      "1mm @ 100 Torr"     → 100 Torr
      "500μm @ 200 Torr"   → 200 Torr
    """
    # Try "NNN Torr"
    m = re.search(r'(\d+)\s*Torr', label)
    if m:
        return float(m.group(1))
    # Try "NNT" (Korean shorthand for Torr)
    m = re.search(r'(\d+)T\b', label)
    if m:
        return float(m.group(1))
    return None


_GLOW_TSX = _read_component("GlowComparison.tsx")
_GLOW_CONDITIONS = _extract_glow_conditions(_GLOW_TSX)

assert len(_GLOW_CONDITIONS) == 5, (
    f"Expected 5 glow conditions, found {len(_GLOW_CONDITIONS)}"
)


def test_glow_comparison_dc_values():
    """Verify all 5 GlowComparison dc values match cathode_dark_space() within 20%."""
    for cond in _GLOW_CONDITIONS:
        pressure = _pressure_from_label(cond["label"])
        assert pressure is not None, (
            f"Could not infer pressure from label: {cond['label']}"
        )

        dc_sim_cm = cathode_dark_space(pressure, gas="Ne")
        dc_sim_um = dc_sim_cm * 10_000  # cm → μm

        dc_web_um = cond["dc_um"]

        rel_err = abs(dc_sim_um - dc_web_um) / dc_web_um
        assert rel_err < 0.20, (
            f"Condition '{cond['label']}': web dc={dc_web_um}μm, "
            f"sim dc={dc_sim_um:.1f}μm, relative error={rel_err:.2%} exceeds 20%"
        )


# ===========================================================================
# 3. GlowStructure formula params (1 test)
# ===========================================================================

def _extract_glow_structure_params(tsx: str) -> dict:
    """Extract the 3 hardcoded params from GlowStructure.tsx dc formula.

    The formula line looks like:
      const dcCm = 0.375 * (1 + Math.pow(pressure / 134, 0.83)) / pressure;

    We extract dc_pd_0=0.375, p_ref=134, alpha=0.83.
    """
    # Match: <number> * (1 + Math.pow(pressure / <number>, <number>))
    pattern = (
        r'([\d.]+)\s*\*\s*\(1\s*\+\s*Math\.pow\(\s*pressure\s*/\s*([\d.]+)\s*,\s*([\d.]+)\s*\)'
    )
    m = re.search(pattern, tsx)
    assert m, "Could not find dc formula params in GlowStructure.tsx"
    return {
        "dc_pd_0": float(m.group(1)),
        "p_ref": float(m.group(2)),
        "alpha": float(m.group(3)),
    }


_GLOW_STRUCT_TSX = _read_component("GlowStructure.tsx")
_GLOW_PARAMS_WEB = _extract_glow_structure_params(_GLOW_STRUCT_TSX)


def test_glow_structure_formula_params():
    """Verify GlowStructure.tsx dc formula params match glow_model.py MODEL_PARAMS within 5%."""
    sim_params = CATHODE_PARAMS["Ne"]

    pairs = [
        ("dc_pd_0", _GLOW_PARAMS_WEB["dc_pd_0"], sim_params["dc_pd_0"]),
        ("p_ref",    _GLOW_PARAMS_WEB["p_ref"],    sim_params["p_ref"]),
        ("alpha",    _GLOW_PARAMS_WEB["alpha"],     sim_params["alpha"]),
    ]

    for name, web_val, sim_val in pairs:
        rel_err = abs(web_val - sim_val) / sim_val
        assert rel_err < 0.05, (
            f"GlowStructure param '{name}': web={web_val}, sim={sim_val}, "
            f"relative error={rel_err:.2%} exceeds 5%"
        )


# ===========================================================================
# 4. PhysicsConstants Paschen minimum Vb (1 test)
# ===========================================================================

def _extract_paschen_minimum_vb(tsx: str) -> float:
    r"""Extract the Paschen minimum Vb from PhysicsConstants.tsx.

    The CONSTANTS array has an entry like:
      { name: "파셴 최소 (Ne)", value: "pd \u2248 1.5 Torr\u00b7cm", numeric: 91, unit: "V (Vb)", ... }
    """
    # Match the entry with unit containing "V" or "Vb" and name containing 파셴
    pattern = r'name:\s*"[^"]*파셴[^"]*".*?numeric:\s*([\d.]+)'
    m = re.search(pattern, tsx, re.DOTALL)
    assert m, "Could not find Paschen minimum entry in PhysicsConstants.tsx"
    return float(m.group(1))


_PHYSICS_TSX = _read_component("PhysicsConstants.tsx")
_PASCHEN_MIN_VB_WEB = _extract_paschen_minimum_vb(_PHYSICS_TSX)


def test_physics_constants_paschen_minimum():
    """Verify PhysicsConstants.tsx Paschen minimum Vb is approximately 91V (within 20%)."""
    vb_web = _PASCHEN_MIN_VB_WEB

    # Get the analytical Paschen minimum from the sim
    _pd_min, vb_sim = paschen_minimum(gas="Ne")

    rel_err = abs(vb_sim - vb_web) / vb_web
    assert rel_err < 0.20, (
        f"Paschen minimum Vb: web={vb_web}V, sim={vb_sim:.1f}V, "
        f"relative error={rel_err:.2%} exceeds 20%"
    )


# ===========================================================================
# 5. CTEChart material data — soda-lime and Dumet CTE match (1 test)
# ===========================================================================

def _extract_cte_materials(tsx: str) -> dict[str, float]:
    """Extract material CTE values from CTEChart.tsx MATERIALS array.

    Each entry looks like: { name: "소다라임 유리", cte: 9.0, ... }
    Returns dict mapping name → cte.
    """
    pattern = r'name:\s*"([^"]+)".*?cte:\s*([\d.]+)'
    materials = {}
    for m in re.finditer(pattern, tsx, re.DOTALL):
        materials[m.group(1)] = float(m.group(2))
    return materials


_CTE_TSX = _read_component("CTEChart.tsx")
_CTE_MATERIALS = _extract_cte_materials(_CTE_TSX)


def test_cte_chart_soda_lime_dumet_match():
    """Verify soda-lime glass and Dumet wire CTE values match (~9.0 each)."""
    # Find soda-lime glass entry
    soda_lime_cte = None
    dumet_cte = None

    for name, cte in _CTE_MATERIALS.items():
        if "소다라임" in name or "soda" in name.lower():
            soda_lime_cte = cte
        if "듀멧" in name or "dumet" in name.lower():
            dumet_cte = cte

    assert soda_lime_cte is not None, (
        f"Could not find soda-lime glass in CTE materials: {list(_CTE_MATERIALS.keys())}"
    )
    assert dumet_cte is not None, (
        f"Could not find Dumet wire in CTE materials: {list(_CTE_MATERIALS.keys())}"
    )

    # Both should be ~9.0
    assert abs(soda_lime_cte - 9.0) < 1.0, (
        f"Soda-lime CTE={soda_lime_cte}, expected ~9.0"
    )
    assert abs(dumet_cte - 9.0) < 1.0, (
        f"Dumet CTE={dumet_cte}, expected ~9.0"
    )

    # They should match each other
    assert soda_lime_cte == dumet_cte, (
        f"Soda-lime CTE ({soda_lime_cte}) != Dumet CTE ({dumet_cte}); "
        f"these must match for hermetic glass-to-metal seals"
    )
