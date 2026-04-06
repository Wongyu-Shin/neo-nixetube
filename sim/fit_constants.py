"""Fit Paschen curve constants (A, B, gamma) to NIST reference data.

Uses scipy.optimize.minimize to find optimal constants for each gas.
"""

import numpy as np
from scipy.optimize import minimize

from nist_data import REFERENCE_DATA


def paschen_vb(pd: float, A: float, B: float, gamma: float) -> float:
    """Paschen formula with arbitrary constants."""
    if pd <= 0:
        return np.nan
    ln_term = np.log(1 + 1 / gamma)
    denom = np.log(A * pd) - np.log(ln_term)
    if denom <= 0:
        return np.nan
    return B * pd / denom


def fit_gas(gas: str) -> dict:
    """Fit A, B, gamma for a gas to minimize MAPE against NIST data."""
    data = REFERENCE_DATA[gas]
    pd_vals = data[:, 0]
    vb_nist = data[:, 1]

    def objective(params):
        A, B, gamma = params
        if A <= 0 or B <= 0 or gamma <= 0 or gamma >= 1:
            return 1e6
        errors = []
        for pd, vn in zip(pd_vals, vb_nist):
            vs = paschen_vb(pd, A, B, gamma)
            if np.isnan(vs):
                errors.append(1.0)  # 100% penalty
            else:
                errors.append(abs(vs - vn) / vn)
        return np.mean(errors) * 100  # MAPE

    # Try multiple initial guesses
    best_result = None
    best_mape = 1e6

    initial_guesses = [
        [4.0, 100.0, 0.02],   # textbook Ne
        [12.0, 180.0, 0.07],  # textbook Ar
        [3.0, 34.0, 0.10],    # textbook He
        [5.0, 150.0, 0.05],   # intermediate
        [8.0, 200.0, 0.03],
        [2.0, 80.0, 0.1],
        [10.0, 300.0, 0.01],
    ]

    for x0 in initial_guesses:
        result = minimize(
            objective,
            x0,
            method="Nelder-Mead",
            options={"maxiter": 10000, "xatol": 1e-6, "fatol": 1e-6},
        )
        if result.fun < best_mape:
            best_mape = result.fun
            best_result = result

    A, B, gamma = best_result.x
    return {"A": round(A, 4), "B": round(B, 4), "gamma": round(gamma, 6), "mape": round(best_mape, 2)}


if __name__ == "__main__":
    for gas in REFERENCE_DATA:
        result = fit_gas(gas)
        print(f"{gas}: A={result['A']}, B={result['B']}, gamma={result['gamma']}, MAPE={result['mape']}%")
