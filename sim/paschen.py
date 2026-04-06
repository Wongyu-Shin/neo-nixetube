"""Paschen curve calculator for gas discharge tubes.

Implements the Paschen law: V_b = B * p * d / (ln(A * p * d) - ln(ln(1 + 1/gamma)))

Where:
  V_b   = breakdown voltage (V)
  p     = gas pressure (Torr)
  d     = electrode gap distance (cm)
  A, B  = gas-dependent first Townsend coefficients
  gamma = secondary electron emission coefficient (Townsend second coefficient)
"""

import numpy as np


# Gas constants (A in 1/(cm·Torr), B in V/(cm·Torr))
# Fitted to NIST/literature experimental data via scipy.optimize (see fit_constants.py)
# Original textbook values from Lieberman & Lichtenberg significantly overestimate Vb
GAS_CONSTANTS = {
    "Ne": {"A": 4.6508, "B": 58.7049, "gamma": 0.075951},
    "Ar": {"A": 4.9033, "B": 68.9322, "gamma": 0.022117},
    "N2": {"A": 12.0, "B": 342.0, "gamma": 0.01},
    "He": {"A": 2.7009, "B": 48.3416, "gamma": 0.136252},
    "Air": {"A": 15.0, "B": 365.0, "gamma": 0.01},
}


def breakdown_voltage(p: float, d: float, gas: str = "Ne") -> float:
    """Calculate Paschen breakdown voltage.

    Args:
        p: Pressure in Torr
        d: Gap distance in cm
        gas: Gas type (Ne, Ar, N2, He, Air)

    Returns:
        Breakdown voltage in Volts. Returns NaN if pd is below minimum.
    """
    constants = GAS_CONSTANTS[gas]
    A = constants["A"]
    B = constants["B"]
    gamma = constants["gamma"]

    pd = p * d

    # Minimum pd for valid Paschen curve
    ln_term = np.log(1 + 1 / gamma)
    pd_min = np.e * ln_term / A  # pd at Paschen minimum

    if pd <= 0:
        return np.nan

    denominator = np.log(A * pd) - np.log(ln_term)
    if denominator <= 0:
        return np.nan

    return B * pd / denominator


def paschen_curve(pd_range: np.ndarray, gas: str = "Ne") -> np.ndarray:
    """Calculate Paschen curve over a range of p*d values.

    Args:
        pd_range: Array of p*d values in Torr·cm
        gas: Gas type

    Returns:
        Array of breakdown voltages in Volts
    """
    return np.array([breakdown_voltage(pd, 1.0, gas) for pd in pd_range])


def paschen_minimum(gas: str = "Ne") -> tuple[float, float]:
    """Find the Paschen minimum (pd_min, V_min) for a gas.

    Returns:
        (pd_min in Torr·cm, V_min in Volts)
    """
    constants = GAS_CONSTANTS[gas]
    A = constants["A"]
    B = constants["B"]
    gamma = constants["gamma"]

    ln_term = np.log(1 + 1 / gamma)
    pd_min = np.e * ln_term / A
    V_min = B * np.e * ln_term / A

    return pd_min, V_min


def optimal_conditions(gas: str = "Ne",
                       target_voltage: float | None = None,
                       pressure_range: tuple[float, float] = (1, 500),
                       gap_range: tuple[float, float] = (0.005, 0.5)) -> dict:
    """Find optimal p, d for a target breakdown voltage.

    Args:
        gas: Gas type
        target_voltage: Desired Vb in Volts. If None, uses Paschen minimum.
        pressure_range: (min, max) pressure in Torr
        gap_range: (min, max) gap in cm

    Returns:
        Dict with optimal conditions
    """
    pd_min, V_min = paschen_minimum(gas)

    if target_voltage is None:
        target_voltage = V_min

    # Search for pd that gives target voltage (right branch of Paschen curve)
    from scipy.optimize import brentq

    def objective(pd):
        v = breakdown_voltage(pd, 1.0, gas)
        if np.isnan(v):
            return -target_voltage
        return v - target_voltage

    # Right branch: pd > pd_min
    try:
        pd_optimal = brentq(objective, pd_min * 1.01, pd_min * 100)
    except ValueError:
        pd_optimal = pd_min

    # Find feasible p, d combinations
    results = []
    for p in np.linspace(pressure_range[0], pressure_range[1], 100):
        d = pd_optimal / p
        if gap_range[0] <= d <= gap_range[1]:
            v = breakdown_voltage(p, d, gas)
            if not np.isnan(v):
                results.append({"p_torr": p, "d_cm": d, "Vb": v, "pd": p * d})

    return {
        "gas": gas,
        "target_voltage": target_voltage,
        "paschen_minimum": {"pd": pd_min, "Vb": V_min},
        "feasible_conditions": results[:10],  # Top 10
    }
