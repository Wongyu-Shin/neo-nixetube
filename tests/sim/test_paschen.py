"""Pytest tests for the Paschen curve simulation.

Covers:
  - NIST reference data integrity (3 tests)
  - Gas constants existence (1 test)
  - Breakdown voltage predictions for 4 bridge configurations (4 tests)
  - LOOCV MAPE validation (1 test)
  - Paschen minimum for Neon (1 test)
"""

import sys
import os

# Add sim/ directory to path so bare imports (nist_data, paschen, etc.) resolve
_SIM_DIR = os.path.join(os.path.dirname(__file__), os.pardir, os.pardir, "sim")
sys.path.insert(0, os.path.abspath(_SIM_DIR))

import numpy as np
import pytest

from nist_data import REFERENCE_DATA
from paschen import breakdown_voltage, paschen_minimum, GAS_CONSTANTS
from validate import validate_all, calculate_loocv_mape


# ---------------------------------------------------------------------------
# NIST Data Integrity (3 tests)
# ---------------------------------------------------------------------------

class TestNISTDataIntegrity:
    """Each gas (Ne, Ar, He) must have non-empty reference data with valid
    pd and Vb values (all positive, pd monotonically increasing)."""

    @pytest.mark.parametrize("gas", ["Ne", "Ar", "He"])
    def test_reference_data_non_empty(self, gas):
        data = REFERENCE_DATA[gas]
        assert data.shape[0] > 0, f"{gas} reference data is empty"
        assert data.shape[1] == 2, f"{gas} reference data should have 2 columns (pd, Vb)"

    @pytest.mark.parametrize("gas", ["Ne", "Ar", "He"])
    def test_reference_data_positive_values(self, gas):
        data = REFERENCE_DATA[gas]
        pd_values = data[:, 0]
        vb_values = data[:, 1]
        assert np.all(pd_values > 0), f"{gas} has non-positive pd values"
        assert np.all(vb_values > 0), f"{gas} has non-positive Vb values"

    @pytest.mark.parametrize("gas", ["Ne", "Ar", "He"])
    def test_reference_data_pd_monotonic(self, gas):
        data = REFERENCE_DATA[gas]
        pd_values = data[:, 0]
        diffs = np.diff(pd_values)
        assert np.all(diffs > 0), (
            f"{gas} pd values are not monotonically increasing: {pd_values}"
        )


# ---------------------------------------------------------------------------
# Gas Constants Exist (1 test)
# ---------------------------------------------------------------------------

class TestGasConstants:
    """All 3 gases (Ne, Ar, He) must have A, B, gamma constants."""

    def test_all_gases_have_constants(self):
        required_gases = ["Ne", "Ar", "He"]
        required_keys = ["A", "B", "gamma"]
        for gas in required_gases:
            assert gas in GAS_CONSTANTS, f"Missing constants for {gas}"
            for key in required_keys:
                assert key in GAS_CONSTANTS[gas], (
                    f"Missing constant '{key}' for {gas}"
                )
                val = GAS_CONSTANTS[gas][key]
                assert isinstance(val, (int, float)), (
                    f"{gas}.{key} should be numeric, got {type(val)}"
                )
                assert val > 0, f"{gas}.{key} should be positive, got {val}"


# ---------------------------------------------------------------------------
# Breakdown Voltage Predictions (4 tests)
# ---------------------------------------------------------------------------

class TestBreakdownVoltage:
    """Bridge configurations must yield Vb within 10% of spec values."""

    def test_bridge1_ne_18torr_2mm(self):
        """Bridge 1: Ne, 18 Torr, 2.0 mm -> Vb ~ 180V (pd=3.6)."""
        vb = breakdown_voltage(p=18.0, d=0.2, gas="Ne")
        assert not np.isnan(vb), "Bridge 1 returned NaN"
        assert vb == pytest.approx(180.0, rel=0.10), (
            f"Bridge 1 Vb={vb:.1f}V, expected ~180V (within 10%)"
        )

    def test_bridge2_ne_10torr_1_5mm(self):
        """Bridge 2: Ne, 10 Torr, 1.5 mm -> Vb ~ 170V (pd=1.5)."""
        vb = breakdown_voltage(p=10.0, d=0.15, gas="Ne")
        assert not np.isnan(vb), "Bridge 2 returned NaN"
        assert vb == pytest.approx(170.0, rel=0.10), (
            f"Bridge 2 Vb={vb:.1f}V, expected ~170V (within 10%)"
        )

    def test_bridge3_ne_230torr_1mm(self):
        """Bridge 3: Ne, 230 Torr, 1.0 mm -> Vb ~ 350V (pd=23)."""
        vb = breakdown_voltage(p=230.0, d=0.1, gas="Ne")
        assert not np.isnan(vb), "Bridge 3 returned NaN"
        assert vb == pytest.approx(350.0, rel=0.10), (
            f"Bridge 3 Vb={vb:.1f}V, expected ~350V (within 10%)"
        )

    def test_argon_alt_11torr_1_9mm(self):
        """Argon alt: Ar, 11 Torr, 1.9 mm -> Vb ~ 207V (pd=2.09)."""
        vb = breakdown_voltage(p=11.0, d=0.19, gas="Ar")
        assert not np.isnan(vb), "Argon alt returned NaN"
        assert vb == pytest.approx(207.0, rel=0.10), (
            f"Argon alt Vb={vb:.1f}V, expected ~207V (within 10%)"
        )


# ---------------------------------------------------------------------------
# LOOCV MAPE (1 test)
# ---------------------------------------------------------------------------

class TestLOOCVValidation:
    """Overall LOOCV MAPE must stay below 3% (generous bound; spec claims 1.79%)."""

    def test_overall_mape_below_3_percent(self):
        overall_mape = validate_all(verbose=False)
        assert overall_mape < 3.0, (
            f"Overall LOOCV MAPE={overall_mape:.2f}% exceeds 3% threshold"
        )


# ---------------------------------------------------------------------------
# Paschen Minimum (1 test)
# ---------------------------------------------------------------------------

class TestPaschenMinimum:
    """For Neon, the analytical Paschen minimum Vb should be between 80V and 120V.
    Literature value is approximately 91V."""

    def test_neon_paschen_minimum_in_range(self):
        pd_min, v_min = paschen_minimum("Ne")
        assert pd_min > 0, f"pd_min should be positive, got {pd_min}"
        assert 80.0 <= v_min <= 120.0, (
            f"Ne Paschen minimum Vb={v_min:.1f}V, expected between 80V and 120V"
        )
