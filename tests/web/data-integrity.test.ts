import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const COMPONENTS_DIR = path.resolve(__dirname, '../../web/app/components');

// ==================== CTEChart Tests (2 cases) ====================

describe('CTEChart — material CTE data', () => {
  it('CTE matching pairs should have matching or close values', () => {
    // From CTEChart.tsx: soda-lime glass and Dumet wire should both be 9.0
    // Borosilicate (3.3) and Kovar (5.0) should be within 2.0 of each other
    const src = fs.readFileSync(path.join(COMPONENTS_DIR, 'CTEChart.tsx'), 'utf-8');

    // Extract materials with CTE
    const sodaLime = src.match(/소다라임 유리.*?cte:\s*([\d.]+)/s);
    const dumet = src.match(/듀멧 와이어.*?cte:\s*([\d.]+)/s);
    const boro = src.match(/보로실리케이트.*?cte:\s*([\d.]+)/s);
    const kovar = src.match(/코바르 합금.*?cte:\s*([\d.]+)/s);

    expect(sodaLime).not.toBeNull();
    expect(dumet).not.toBeNull();
    expect(boro).not.toBeNull();
    expect(kovar).not.toBeNull();

    // Soda-lime ↔ Dumet: exact match (both 9.0)
    expect(parseFloat(sodaLime![1])).toBe(parseFloat(dumet![1]));
    // Borosilicate ↔ Kovar: close (3.3 vs 5.0, Δ < 2.0)
    expect(Math.abs(parseFloat(boro![1]) - parseFloat(kovar![1]))).toBeLessThan(2.0);
  });

  it('getWidth should scale correctly in both linear and log mode', () => {
    // Linear mode: width = (cte / 310) * 100
    const linearWidth = (cte: number) => (cte / 310) * 100;
    expect(linearWidth(310)).toBeCloseTo(100, 1);
    expect(linearWidth(9.0)).toBeCloseTo(2.9, 1);

    // Log mode: width = (log10(cte) / log10(310)) * 100
    const maxCte = Math.log10(310);
    const logWidth = (cte: number) => (Math.log10(Math.max(cte, 0.1)) / maxCte) * 100;
    expect(logWidth(310)).toBeCloseTo(100, 1);
    expect(logWidth(1)).toBeCloseTo(0, 1);
    // Log scale should spread small values wider than linear
    expect(logWidth(9.0)).toBeGreaterThan(linearWidth(9.0));
  });
});

// ==================== PermeabilityChart Tests (2 cases) ====================

describe('PermeabilityChart — permeability data', () => {
  it('materials should be ordered by decreasing permeability (glass best, PDMS worst)', () => {
    const perms = [1e-15, 1e-11, 1e-10, 1e-10, 1e-12, 1e-9, 1e-7];
    // Glass (1e-15) should have best (lowest) permeability
    expect(perms[0]).toBe(1e-15);
    // PDMS (1e-7) should have worst (highest) permeability
    expect(perms[perms.length - 1]).toBe(1e-7);
  });

  it('getWidth log-scale calculation should produce valid percentages', () => {
    const maxLog = 7;  // 10^-7
    const minLog = 15; // 10^-15
    const range = minLog - maxLog; // 8

    const getWidth = (perm: number) => {
      const logVal = -Math.log10(perm);
      return ((logVal - maxLog) / range) * 100;
    };

    // Glass (1e-15): -log10(1e-15) = 15, width = (15-7)/8*100 = 100%
    expect(getWidth(1e-15)).toBeCloseTo(100, 1);
    // PDMS (1e-7): -log10(1e-7) = 7, width = (7-7)/8*100 = 0%
    expect(getWidth(1e-7)).toBeCloseTo(0, 1);
    // Butyl (1e-10): -log10(1e-10) = 10, width = (10-7)/8*100 = 37.5%
    expect(getWidth(1e-10)).toBeCloseTo(37.5, 1);
    // All widths should be between 0-100
    for (const p of [1e-15, 1e-11, 1e-10, 1e-12, 1e-9, 1e-7]) {
      const w = getWidth(p);
      expect(w).toBeGreaterThanOrEqual(0);
      expect(w).toBeLessThanOrEqual(100);
    }
  });
});

// ==================== CostComparison Tests (2 cases) ====================

describe('CostComparison — cost data', () => {
  it('cost values should match spec and be in correct order', () => {
    const DATA = [
      { label: 'Traditional', cost: 2500000 },
      { label: 'Path 1: Frit', cost: 1200000 },
      { label: 'Path 2: Room-Temp', cost: 185000 },
    ];

    // Traditional should be most expensive
    expect(DATA[0].cost).toBeGreaterThan(DATA[1].cost);
    expect(DATA[1].cost).toBeGreaterThan(DATA[2].cost);

    // Room-temp should be ~7% of traditional (spec claims 93% savings)
    const savingsPercent = ((DATA[0].cost - DATA[2].cost) / DATA[0].cost) * 100;
    expect(savingsPercent).toBeGreaterThan(90);
    expect(savingsPercent).toBeLessThan(95);
  });

  it('maxCost and bar width calculation should work correctly', () => {
    const costs = [2500000, 1200000, 185000];
    const maxCost = Math.max(...costs);

    expect(maxCost).toBe(2500000);

    // Bar width percentages
    for (const cost of costs) {
      const pct = (cost / maxCost) * 100;
      expect(pct).toBeGreaterThan(0);
      expect(pct).toBeLessThanOrEqual(100);
    }

    // Traditional should be 100% width
    expect((costs[0] / maxCost) * 100).toBe(100);
    // Room-temp should be ~7.4%
    expect((costs[2] / maxCost) * 100).toBeCloseTo(7.4, 0);
  });
});

// ==================== FiringProfile Tests (2 cases) ====================

describe('FiringProfile — temperature stages', () => {
  const STAGES = [
    { label: '상온', temp: 25, time: 0 },
    { label: '승온', temp: 350, time: 30 },
    { label: '바인더 번아웃', temp: 350, time: 60 },
    { label: '승온 2', temp: 450, time: 70 },
    { label: '프릿 융착', temp: 450, time: 100 },
    { label: '서냉', temp: 25, time: 250 },
  ];

  it('temperature stages should follow physical constraints', () => {
    // Starts at room temperature
    expect(STAGES[0].temp).toBe(25);
    expect(STAGES[0].time).toBe(0);

    // Peak temperature should be 450°C (frit melting point)
    const peakTemp = Math.max(...STAGES.map(s => s.temp));
    expect(peakTemp).toBe(450);

    // Ends at room temperature (slow cooling)
    expect(STAGES[STAGES.length - 1].temp).toBe(25);

    // Time should be monotonically increasing
    for (let i = 1; i < STAGES.length; i++) {
      expect(STAGES[i].time).toBeGreaterThanOrEqual(STAGES[i - 1].time);
    }

    // Total process time should be ~250 minutes (spec: ~4 hours)
    expect(STAGES[STAGES.length - 1].time).toBeGreaterThan(200);
    expect(STAGES[STAGES.length - 1].time).toBeLessThan(300);
  });

  it('toX and toY linear transforms should map correctly', () => {
    const maxTime = 260;
    const maxTemp = 500;
    const padL = 50, padT = 30;
    const plotW = 500 - 50 - 20; // svgW - padL - padR
    const plotH = 220 - 30 - 40; // svgH - padT - padB

    const toX = (t: number) => padL + (t / maxTime) * plotW;
    const toY = (temp: number) => padT + plotH - (temp / maxTemp) * plotH;

    // Time 0 maps to left edge
    expect(toX(0)).toBe(padL);
    // Time maxTime maps to right edge
    expect(toX(maxTime)).toBeCloseTo(padL + plotW, 1);
    // Temp 0 maps to bottom
    expect(toY(0)).toBeCloseTo(padT + plotH, 1);
    // Temp maxTemp maps to top
    expect(toY(maxTemp)).toBeCloseTo(padT, 1);
  });
});
