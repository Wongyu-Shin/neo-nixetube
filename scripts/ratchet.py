#!/usr/bin/env python3
"""scripts/ratchet.py — Noise-Aware Ratchet (SUM=MAX anchor).

Implements harness/features/noise-aware-ratchet.md (axis1=outer,
axis2=in-loop). Three-part rule:

  1. Anchor on best-ever measurement, not previous (SUM=MAX envelope).
  2. Re-measure anchor before comparing (drift removal).
  3. Require candidate beat anchor by margin > noise floor σ (N=3).

Without (1): loop regresses under noise.
Without (2): ratchet inflates over time as env drifts.
Without (3): noise is mistaken for progress.

Source memory: feedback_gan_noise_handling.md (path-2 CAD loop).

Usage from a verify script:

    python3 scripts/ratchet.py decide \\
        --tsv loops/NNN-<slug>/results.tsv \\
        --candidate 87.3 \\
        --direction higher \\
        --sigma 1.5

Returns exit 0 with stdout DECISION=keep|discard, plus DETAIL=...

Subcommands:
    decide   — decide whether to keep the candidate
    measure  — wrap a verify command, re-run N times for σ estimate
    anchor   — print the current best-ever (SUM=MAX) from a TSV
"""
from __future__ import annotations

import argparse
import csv
import statistics
import subprocess
import sys
from pathlib import Path


def read_tsv_metrics(tsv_path: Path, direction: str) -> list[float]:
    """Read kept-iter metrics from an autoresearch results.tsv."""
    if not tsv_path.exists():
        return []
    rows = []
    with tsv_path.open(encoding="utf-8") as fp:
        for ln in fp:
            if ln.startswith("#") or ln.startswith("iteration\t"):
                continue
            parts = ln.rstrip("\n").split("\t")
            if len(parts) < 6:
                continue
            status = parts[5]
            if status not in ("baseline", "keep", "keep (reworked)"):
                continue
            try:
                rows.append(float(parts[2]))
            except ValueError:
                continue
    return rows


def compute_anchor(metrics: list[float], direction: str) -> float | None:
    """SUM=MAX anchor: best-ever value under the direction."""
    if not metrics:
        return None
    return max(metrics) if direction == "higher" else min(metrics)


def beats_anchor(candidate: float, anchor: float, direction: str, margin: float) -> bool:
    """Candidate must beat anchor by a margin > noise floor σ."""
    if direction == "higher":
        return candidate >= anchor + margin
    else:
        return candidate <= anchor - margin


def cmd_decide(ns: argparse.Namespace) -> int:
    direction = ns.direction
    metrics = read_tsv_metrics(Path(ns.tsv), direction)
    anchor = compute_anchor(metrics, direction)
    sigma = float(ns.sigma)

    if anchor is None:
        print(f"DETAIL no anchor in {ns.tsv} — first measurement, accepting")
        print("DECISION=keep")
        return 0

    cand = float(ns.candidate)
    if beats_anchor(cand, anchor, direction, sigma):
        print(
            f"DETAIL candidate={cand} anchor={anchor} margin={sigma} "
            f"direction={direction} — beats anchor by margin"
        )
        print("DECISION=keep")
    else:
        print(
            f"DETAIL candidate={cand} anchor={anchor} margin={sigma} "
            f"direction={direction} — within noise floor of anchor (no improvement)"
        )
        print("DECISION=discard")
    return 0


def cmd_measure(ns: argparse.Namespace) -> int:
    """Run the verify command N times, parse <NAME>=<value> from last line,
    print median + σ. Used for both candidate and anchor re-measurement."""
    n = int(ns.n)
    name = ns.name
    samples: list[float] = []
    for i in range(n):
        try:
            r = subprocess.run(
                ns.cmd,
                shell=True,
                capture_output=True,
                text=True,
                timeout=ns.timeout,
            )
        except subprocess.TimeoutExpired:
            print(f"MEASURE_FAIL run={i+1} timeout", file=sys.stderr)
            continue
        out = (r.stdout or "") + "\n" + (r.stderr or "")
        # find <NAME>=<value> in any line
        for line in out.splitlines()[::-1]:
            if line.startswith(f"{name}="):
                try:
                    samples.append(float(line.split("=", 1)[1].strip()))
                except ValueError:
                    pass
                break
    if not samples:
        print(f"DETAIL no successful runs of `{ns.cmd}` (n={n})")
        print(f"{name}=NaN")
        print("SIGMA=NaN")
        return 1
    med = statistics.median(samples)
    sig = statistics.stdev(samples) if len(samples) >= 2 else 0.0
    print(f"DETAIL samples={samples}")
    print(f"{name}={med}")
    print(f"SIGMA={sig:.4f}")
    return 0


def cmd_anchor(ns: argparse.Namespace) -> int:
    metrics = read_tsv_metrics(Path(ns.tsv), ns.direction)
    a = compute_anchor(metrics, ns.direction)
    if a is None:
        print("DETAIL no anchor")
        print("ANCHOR=NaN")
        return 1
    print(f"DETAIL n_kept={len(metrics)} direction={ns.direction}")
    print(f"ANCHOR={a}")
    return 0


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="ratchet", description="Noise-Aware Ratchet (SUM=MAX anchor).")
    sub = p.add_subparsers(dest="cmd", required=True)

    pd = sub.add_parser("decide", help="keep/discard a candidate vs SUM=MAX anchor")
    pd.add_argument("--tsv", required=True, help="autoresearch results.tsv path")
    pd.add_argument("--candidate", required=True, help="new measurement to compare")
    pd.add_argument("--direction", choices=("higher", "lower"), required=True)
    pd.add_argument("--sigma", default="0", help="noise floor σ (default 0 for deterministic metrics)")
    pd.set_defaults(func=cmd_decide)

    pm = sub.add_parser("measure", help="run verify N times, return median + σ")
    pm.add_argument("--cmd", required=True, help="verify command (shell)")
    pm.add_argument("--name", required=True, help="metric name (lhs of =)")
    pm.add_argument("--n", default="3", help="number of repeat runs (default 3)")
    pm.add_argument("--timeout", type=int, default=600, help="per-run timeout seconds")
    pm.set_defaults(func=cmd_measure)

    pa = sub.add_parser("anchor", help="print SUM=MAX anchor of a TSV")
    pa.add_argument("--tsv", required=True)
    pa.add_argument("--direction", choices=("higher", "lower"), required=True)
    pa.set_defaults(func=cmd_anchor)

    return p


if __name__ == "__main__":
    ns = build_parser().parse_args()
    sys.exit(ns.func(ns))
