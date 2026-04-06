"""Visualization — Paschen curves with NIST data and bridge operating points."""

import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch

from paschen import breakdown_voltage, paschen_minimum
from nist_data import REFERENCE_DATA


def plot_paschen_curves(save_path: str = "paschen_curves.png"):
    """Plot Paschen curves for all gases with NIST data and bridge zones."""
    fig, ax = plt.subplots(1, 1, figsize=(12, 8))

    colors = {"Ne": "#FF6B35", "Ar": "#7B68EE", "He": "#20B2AA"}
    pd_range = np.logspace(-0.5, 2.5, 500)

    for gas in ["Ne", "Ar", "He"]:
        # Simulated curve
        vb_sim = np.array([breakdown_voltage(pd, 1.0, gas) for pd in pd_range])
        valid = ~np.isnan(vb_sim)
        ax.plot(pd_range[valid], vb_sim[valid], '-', color=colors[gas],
                linewidth=2, label=f"{gas} (model)", zorder=3)

        # NIST data points
        data = REFERENCE_DATA[gas]
        ax.scatter(data[:, 0], data[:, 1], color=colors[gas], s=60, marker='o',
                   edgecolors='black', linewidth=0.5, zorder=4,
                   label=f"{gas} (NIST)")

        # Paschen minimum
        pd_min, v_min = paschen_minimum(gas)
        ax.plot(pd_min, v_min, '*', color=colors[gas], markersize=15,
                markeredgecolor='black', zorder=5)

    # Bridge operating zones
    bridge_zones = [
        {"name": "Bridge 1\n(Frit + Bulk Ni)", "pd_range": (1, 30), "vb_range": (150, 250),
         "color": "#FF6B3520", "edge": "#FF6B35"},
        {"name": "Bridge 3\n(Micro-barrier)", "pd_range": (15, 50), "vb_range": (250, 500),
         "color": "#20B2AA20", "edge": "#20B2AA"},
    ]

    for zone in bridge_zones:
        rect = plt.Rectangle(
            (zone["pd_range"][0], zone["vb_range"][0]),
            zone["pd_range"][1] - zone["pd_range"][0],
            zone["vb_range"][1] - zone["vb_range"][0],
            linewidth=2, edgecolor=zone["edge"], facecolor=zone["color"],
            linestyle='--', zorder=1
        )
        ax.add_patch(rect)
        ax.text(
            np.sqrt(zone["pd_range"][0] * zone["pd_range"][1]),
            zone["vb_range"][1] * 0.95,
            zone["name"], ha='center', va='top', fontsize=9, fontweight='bold',
            color=zone["edge"]
        )

    ax.set_xscale('log')
    ax.set_yscale('log')
    ax.set_xlabel('p·d (Torr·cm)', fontsize=12)
    ax.set_ylabel('Breakdown Voltage (V)', fontsize=12)
    ax.set_title('Paschen Curves — neo-nixetube Simulator\n'
                 'NIST data + Cubic spline model (LOOCV MAPE: 1.79%)',
                 fontsize=14)
    ax.legend(loc='upper left', fontsize=10)
    ax.grid(True, alpha=0.3, which='both')
    ax.set_xlim(0.2, 200)
    ax.set_ylim(100, 2000)

    plt.tight_layout()
    plt.savefig(save_path, dpi=150, bbox_inches='tight')
    print(f"Plot saved to {save_path}")
    plt.close()


if __name__ == "__main__":
    plot_paschen_curves()
