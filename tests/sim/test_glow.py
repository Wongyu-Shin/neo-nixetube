"""Tests for glow discharge model (Bridge 3 micro-barrier conditions).

Validates cathode dark space, glow thickness, current density,
spatial structure, non-similarity corrections, and overall MAPE.

Reference: FINDINGS.md Bridge 3 analysis, Raizer (1991), von Engel (1965).
"""

import sys
import os

import numpy as np
import pytest

# Allow imports from sim/
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "sim"))

from glow_model import (
    cathode_dark_space,
    cathode_glow_thickness,
    normal_current_density,
    glow_structure,
)
from glow_reference_data import NEON_DC_DATA
from validate_glow import validate_all


# ---------------------------------------------------------------------------
# 1. dc formula correctness (2 tests)
# ---------------------------------------------------------------------------

class TestCathodeDarkSpace:
    """Cathode dark space thickness predictions at key pressures."""

    def test_dc_at_15_torr(self):
        """Traditional nixie: dc ~ 291 um at 15 Torr."""
        dc_cm = cathode_dark_space(15.0, "Ne")
        dc_um = dc_cm * 1e4
        assert dc_um == pytest.approx(291, rel=0.20), (
            f"dc at 15 Torr = {dc_um:.1f} um, expected ~291 um (+-20%)"
        )

    def test_dc_at_100_torr(self):
        """High pressure: dc ~ 67 um at 100 Torr."""
        dc_cm = cathode_dark_space(100.0, "Ne")
        dc_um = dc_cm * 1e4
        assert dc_um == pytest.approx(67, rel=0.20), (
            f"dc at 100 Torr = {dc_um:.1f} um, expected ~67 um (+-20%)"
        )


# ---------------------------------------------------------------------------
# 2. Glow thickness = 0.7 * dc (1 test)
# ---------------------------------------------------------------------------

class TestGlowThicknessRatio:
    """Cathode glow is always 0.7x the dark space thickness."""

    @pytest.mark.parametrize("pressure", [15, 50, 100, 200, 500])
    def test_glow_dc_ratio_is_0_7(self, pressure):
        dc = cathode_dark_space(pressure, "Ne")
        glow = cathode_glow_thickness(pressure, "Ne")
        ratio = glow / dc
        assert ratio == pytest.approx(0.7, rel=1e-6), (
            f"glow/dc ratio at {pressure} Torr = {ratio:.4f}, expected 0.7"
        )


# ---------------------------------------------------------------------------
# 3. Normal current density p^2 scaling (1 test)
# ---------------------------------------------------------------------------

class TestCurrentDensityScaling:
    """j_n scales as p^2 (similarity law)."""

    def test_jn_ratio_200_vs_100(self):
        """j_n(200 Torr) / j_n(100 Torr) should be 4.0."""
        j100 = normal_current_density(100.0, "Ne")
        j200 = normal_current_density(200.0, "Ne")
        ratio = j200 / j100
        assert ratio == pytest.approx(4.0, rel=0.20), (
            f"j_n ratio 200/100 = {ratio:.2f}, expected 4.0 (+-20%)"
        )


# ---------------------------------------------------------------------------
# 4. Bridge 3 spatial structure (5 tests)
# ---------------------------------------------------------------------------

# (label, pressure_torr, gap_cm, expected_dc_um, expected_glow_um, expected_ratio)
BRIDGE3_CONDITIONS = [
    ("Traditional 15 Torr / 1.5mm", 15, 0.15, 291, 204, 0.33),
    ("100 Torr / 1.0mm", 100, 0.10, 67, 47, 0.114),
    ("200 Torr / 0.5mm", 200, 0.05, 45, 32, 0.153),
    ("300 Torr / 1.0mm", 300, 0.10, 37, 26, 0.063),
    ("500 Torr / 0.5mm", 500, 0.05, 30, 21, 0.102),
]


class TestBridge3SpatialStructure:
    """Bridge 3 glow structure matches FINDINGS.md predictions."""

    @pytest.mark.parametrize(
        "label, pressure, gap_cm, exp_dc, exp_glow, exp_ratio",
        BRIDGE3_CONDITIONS,
        ids=[c[0] for c in BRIDGE3_CONDITIONS],
    )
    def test_bridge3_condition(
        self, label, pressure, gap_cm, exp_dc, exp_glow, exp_ratio
    ):
        result = glow_structure(pressure, gap_cm, "Ne")

        dc_um = result["cathode_dark_space_um"]
        glow_um = result["cathode_glow_um"]
        ratio = result["glow_gap_ratio"]

        assert dc_um == pytest.approx(exp_dc, rel=0.20), (
            f"[{label}] dc = {dc_um:.1f} um, expected ~{exp_dc} um"
        )
        assert glow_um == pytest.approx(exp_glow, rel=0.20), (
            f"[{label}] glow = {glow_um:.1f} um, expected ~{exp_glow} um"
        )
        assert ratio == pytest.approx(exp_ratio, abs=0.05), (
            f"[{label}] glow/gap ratio = {ratio:.3f}, expected ~{exp_ratio}"
        )


# ---------------------------------------------------------------------------
# 5. High-pressure non-similarity effect (1 test)
# ---------------------------------------------------------------------------

class TestNonSimilarity:
    """At high pressure, dc*p exceeds the low-pressure value."""

    def test_dc_p_product_grows_at_high_pressure(self):
        """dc*p at 500 Torr should exceed dc*p at 1 Torr (non-similarity)."""
        dc_1 = cathode_dark_space(1.0, "Ne")
        dc_500 = cathode_dark_space(500.0, "Ne")

        dcp_low = dc_1 * 1.0
        dcp_high = dc_500 * 500.0

        assert dcp_high > dcp_low, (
            f"dc*p at 500 Torr ({dcp_high:.4f}) should exceed "
            f"dc*p at 1 Torr ({dcp_low:.4f}) due to non-similarity"
        )


# ---------------------------------------------------------------------------
# 6. Validation MAPE (1 test)
# ---------------------------------------------------------------------------

class TestValidationMAPE:
    """Overall glow model MAPE stays within acceptable bounds."""

    def test_overall_mape_below_3_percent(self):
        """Combined dc + jn MAPE should be < 3% (generous bound)."""
        mape = validate_all(verbose=False)
        assert mape < 3.0, (
            f"Overall MAPE = {mape:.2f}%, expected < 3%"
        )


# ---------------------------------------------------------------------------
# 7. Reference data integrity (1 test)
# ---------------------------------------------------------------------------

class TestReferenceDataIntegrity:
    """NEON_DC_DATA has entries and all values are positive."""

    def test_neon_dc_data_nonempty_and_positive(self):
        assert NEON_DC_DATA.shape[0] > 0, "NEON_DC_DATA is empty"
        assert NEON_DC_DATA.shape[1] == 2, "NEON_DC_DATA should have 2 columns"
        assert np.all(NEON_DC_DATA > 0), (
            "All pressure and dc values must be positive"
        )
