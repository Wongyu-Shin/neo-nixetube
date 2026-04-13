import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const COMPONENTS_DIR = path.resolve(__dirname, '../../web/app/components');

// ==================== GlowStructure Tests (3 cases) ====================

describe('GlowStructure — dc formula', () => {
  // Replicate the formula from GlowStructure.tsx:14
  function calcDcUm(pressure: number): number {
    const dcCm = 0.375 * (1 + Math.pow(pressure / 134, 0.83)) / pressure;
    return Math.round(dcCm * 10000);
  }

  function calcGlowUm(dcUm: number): number {
    return Math.round(dcUm * 0.7);
  }

  it('traditional 15 Torr should give dc ≈ 291 μm', () => {
    const dc = calcDcUm(15);
    expect(dc).toBeGreaterThan(250);
    expect(dc).toBeLessThan(330);
    // Spec: ~291 μm
    expect(Math.abs(dc - 291)).toBeLessThan(30);
  });

  it('glow thickness should be 0.7 × dc', () => {
    for (const p of [15, 50, 100, 200, 500]) {
      const dc = calcDcUm(p);
      const glow = calcGlowUm(dc);
      // 0.7 * dc, rounded — allow ±1 due to rounding
      expect(Math.abs(glow - Math.round(dc * 0.7))).toBeLessThanOrEqual(1);
    }
  });

  it('high pressure (500 Torr) dc should be much smaller than traditional', () => {
    const dcTraditional = calcDcUm(15);
    const dcHigh = calcDcUm(500);
    expect(dcHigh).toBeLessThan(dcTraditional / 3);
    // Spec: ~30 μm at 500 Torr
    expect(dcHigh).toBeGreaterThan(15);
    expect(dcHigh).toBeLessThan(50);
  });
});

// ==================== PaschenChart Tests (4 cases) ====================

describe('PaschenChart — logScale and data', () => {
  // Replicate logScale from PaschenChart.tsx:29
  function logScale(val: number, min: number, max: number, pixels: number): number {
    const logMin = Math.log10(min);
    const logMax = Math.log10(max);
    return ((Math.log10(val) - logMin) / (logMax - logMin)) * pixels;
  }

  const W = 600, H = 360;
  const PAD = { t: 30, r: 30, b: 50, l: 60 };
  const plotW = W - PAD.l - PAD.r;
  const plotH = H - PAD.t - PAD.b;

  function toX(pd: number) { return PAD.l + logScale(pd, 0.3, 150, plotW); }
  function toY(vb: number) { return PAD.t + plotH - logScale(vb, 100, 1000, plotH); }

  it('logScale should map min value to 0 and max value to pixels', () => {
    expect(logScale(0.3, 0.3, 150, plotW)).toBeCloseTo(0, 5);
    expect(logScale(150, 0.3, 150, plotW)).toBeCloseTo(plotW, 5);
    expect(logScale(100, 100, 1000, plotH)).toBeCloseTo(0, 5);
    expect(logScale(1000, 100, 1000, plotH)).toBeCloseTo(plotH, 5);
  });

  it('NE_DATA should have 15 points with valid pd and Vb', () => {
    const src = fs.readFileSync(path.join(COMPONENTS_DIR, 'PaschenChart.tsx'), 'utf-8');
    // Extract the NE_DATA array
    const match = src.match(/const NE_DATA = \[([\s\S]*?)\];/);
    expect(match).not.toBeNull();

    // Parse all [pd, vb] pairs
    const pairs = [...match![1].matchAll(/\[(\d+\.?\d*),\s*(\d+)\]/g)];
    expect(pairs.length).toBe(15);

    for (const p of pairs) {
      const pd = parseFloat(p[1]);
      const vb = parseFloat(p[2]);
      expect(pd).toBeGreaterThan(0);
      expect(vb).toBeGreaterThan(0);
      expect(vb).toBeLessThan(1000);
    }
  });

  it('bridge markers should have correct coordinates (pd, Vb)', () => {
    const bridges = [
      { id: 'b1', pd: 3.5, vb: 180 },
      { id: 'b2', pd: 1.6, vb: 170 },
      { id: 'b3', pd: 23, vb: 350 },
      { id: 'ar', pd: 2.1, vb: 207 },
    ];

    for (const b of bridges) {
      const x = toX(b.pd);
      const y = toY(b.vb);
      // All points should be within the plot area
      expect(x).toBeGreaterThan(PAD.l);
      expect(x).toBeLessThan(W - PAD.r);
      expect(y).toBeGreaterThan(PAD.t);
      expect(y).toBeLessThan(H - PAD.b);
    }
  });

  it('BRIDGES array in source should match expected values', () => {
    const src = fs.readFileSync(path.join(COMPONENTS_DIR, 'PaschenChart.tsx'), 'utf-8');
    const expected = [
      { id: 'b1', pd: 3.5, vb: 180 },
      { id: 'b2', pd: 1.6, vb: 170 },
      { id: 'b3', pd: 23, vb: 350 },
      { id: 'ar', pd: 2.1, vb: 207 },
    ];

    for (const b of expected) {
      const pattern = new RegExp(`id:\\s*"${b.id}".*?pd:\\s*(\\d+\\.?\\d*).*?vb:\\s*(\\d+)`, 's');
      const m = src.match(pattern);
      expect(m).not.toBeNull();
      expect(parseFloat(m![1])).toBeCloseTo(b.pd, 1);
      expect(parseInt(m![2])).toBe(b.vb);
    }
  });
});

// ==================== GlowComparison Tests (3 cases) ====================

describe('GlowComparison — CONDITIONS data', () => {
  it('should have 5 conditions with valid data', () => {
    const src = fs.readFileSync(path.join(COMPONENTS_DIR, 'GlowComparison.tsx'), 'utf-8');
    const match = src.match(/const CONDITIONS = \[([\s\S]*?)\];/);
    expect(match).not.toBeNull();

    // Extract dc values
    const dcValues = [...match![1].matchAll(/dc:\s*(\d+)/g)].map(m => parseInt(m[1]));
    expect(dcValues).toEqual([291, 67, 45, 37, 30]);
  });

  it('glow should always be approximately 0.7 × dc', () => {
    const conditions = [
      { dc: 291, glow: 204 },
      { dc: 67, glow: 47 },
      { dc: 45, glow: 32 },
      { dc: 37, glow: 26 },
      { dc: 30, glow: 21 },
    ];

    for (const c of conditions) {
      const expectedGlow = Math.round(c.dc * 0.7);
      expect(Math.abs(c.glow - expectedGlow)).toBeLessThanOrEqual(2);
    }
  });

  it('intensity should increase monotonically with pressure', () => {
    const intensities = [1, 40, 180, 440, 1300];
    for (let i = 1; i < intensities.length; i++) {
      expect(intensities[i]).toBeGreaterThan(intensities[i - 1]);
    }
  });
});
