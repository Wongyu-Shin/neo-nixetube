"""Validation script — LOOCV (Leave-One-Out Cross Validation) of Paschen model.

For each data point, removes it from the dataset, rebuilds the model with
remaining points, and predicts the left-out point. Reports MAPE across all
left-out predictions. This prevents overfitting to reference data.

Usage:
    python sim/validate.py
    python sim/validate.py --verbose
"""

import sys
import numpy as np
from scipy.interpolate import CubicSpline

from nist_data import REFERENCE_DATA


def _predict_loocv(pd_query: float, pd_data: np.ndarray, vb_data: np.ndarray,
                   gas_constants: dict) -> float:
    """Predict Vb at pd_query using all data EXCEPT the point at pd_query.

    Uses log-log cubic spline for interpolation, and power-law extrapolation
    for points outside the training range.
    """
    # Remove the query point
    mask = pd_data != pd_query
    pd_train = pd_data[mask]
    vb_train = vb_data[mask]

    if len(pd_train) < 3:
        return _analytical_predict(pd_query, gas_constants)

    log_pd = np.log(pd_train)
    log_vb = np.log(vb_train)

    if pd_train.min() <= pd_query <= pd_train.max():
        # Interpolation: cubic spline in log-log space
        cs = CubicSpline(log_pd, log_vb)
        return float(np.exp(cs(np.log(pd_query))))
    else:
        # Extrapolation: different strategies for left vs right
        if pd_query < pd_train.min():
            # Left extrapolation (low pd — steep rise, Paschen left branch)
            # Use quadratic in log-log space to capture curvature
            n_pts = min(4, len(pd_train))
            idx = np.argsort(pd_train)[:n_pts]
            deg = min(2, n_pts - 1)
            coeffs = np.polyfit(log_pd[idx], log_vb[idx], deg)
            return float(np.exp(np.polyval(coeffs, np.log(pd_query))))
        else:
            # Right extrapolation (high pd — gentle rise, near-linear in log-log)
            n_pts = min(4, len(pd_train))
            idx = np.argsort(pd_train)[-n_pts:]
            coeffs = np.polyfit(log_pd[idx], log_vb[idx], 1)
            return float(np.exp(np.polyval(coeffs, np.log(pd_query))))


def _analytical_predict(pd: float, constants: dict) -> float:
    """Analytical Paschen formula for extrapolation."""
    A = constants["A"]
    B = constants["B"]
    gamma = constants["gamma"]

    ln_term = np.log(1 + 1 / gamma)
    denom = np.log(A * pd) - np.log(ln_term)
    if denom <= 0:
        return np.nan
    return B * pd / denom


# Fitted constants (from fit_constants.py)
FITTED_CONSTANTS = {
    "Ne": {"A": 4.6508, "B": 58.7049, "gamma": 0.075951},
    "Ar": {"A": 4.9033, "B": 68.9322, "gamma": 0.022117},
    "He": {"A": 2.7009, "B": 48.3416, "gamma": 0.136252},
}


def calculate_loocv_mape(gas: str, verbose: bool = False) -> float:
    """Calculate LOOCV MAPE for a single gas."""
    data = REFERENCE_DATA[gas]
    pd_data = data[:, 0]
    vb_data = data[:, 1]
    constants = FITTED_CONSTANTS.get(gas, {"A": 4.0, "B": 100.0, "gamma": 0.02})

    errors = []
    if verbose:
        print(f"\n{'='*60}")
        print(f"Gas: {gas} (LOOCV)")
        print(f"{'='*60}")
        print(f"{'pd':>8} {'Vb_NIST':>8} {'Vb_pred':>8} {'Error%':>8}")
        print(f"{'-'*8} {'-'*8} {'-'*8} {'-'*8}")

    for i in range(len(pd_data)):
        pd_query = pd_data[i]
        vb_true = vb_data[i]

        vb_pred = _predict_loocv(pd_query, pd_data, vb_data, constants)

        if np.isnan(vb_pred):
            error_pct = 100.0
        else:
            error_pct = abs(vb_pred - vb_true) / vb_true * 100

        errors.append(error_pct)

        if verbose:
            vb_str = f"{vb_pred:.1f}" if not np.isnan(vb_pred) else "NaN"
            print(f"{pd_query:8.1f} {vb_true:8.1f} {vb_str:>8} {error_pct:8.2f}")

    mape = np.mean(errors)
    if verbose:
        print(f"  LOOCV MAPE: {mape:.2f}%")
    return mape


def validate_all(verbose: bool = False) -> float:
    """LOOCV validation across all gases."""
    all_errors = []
    gas_results = {}

    for gas in REFERENCE_DATA:
        mape = calculate_loocv_mape(gas, verbose=verbose)
        gas_results[gas] = mape
        all_errors.append(mape)

    overall_mape = np.mean(all_errors)

    if verbose:
        print(f"\n{'='*60}")
        print("Per-gas LOOCV MAPE:")
        for gas, mape in gas_results.items():
            print(f"  {gas}: {mape:.2f}%")

    # This line is parsed by autoresearch
    print(f"MAPE: {overall_mape:.2f}")
    return overall_mape


if __name__ == "__main__":
    verbose = "--verbose" in sys.argv
    validate_all(verbose=verbose)
