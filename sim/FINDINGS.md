# Simulation Findings — neo-nixetube

## Paschen Curve Simulator (MAPE: 1.79%)

- Cubic spline interpolation + power-law extrapolation in log-log space
- LOOCV validated — no overfitting
- 3 gases: Ne, Ar, He

### Bridge Optimal Conditions

| Bridge | Gas | p (Torr) | d (mm) | Vb (V) | p·d (Torr·cm) |
|--------|-----|----------|--------|--------|----------------|
| 1. Frit + Bulk Ni | Ne | 18 | 2.0 | 180 | 3.5 |
| 2. Frit + AAO | Ne | 10 | 1.5 | 170 | 1.6 |
| 3. Micro-barrier | Ne | 230 | 1.0 | 350 | 23 |
| Alt: Argon | Ar | 11 | 1.9 | 207 | 2.1 |

## Glow Discharge Model (MAPE: 1.77%)

- dc = dc_pd_0 * (1 + (p/p_ref)^α) / p — non-similarity correction for high pressure
- Fitted to von Engel/Raizer/Lisovskiy data including >100 Torr regime

### Bridge 3 Glow Visibility Analysis — CRITICAL FINDING

| Condition | dc (μm) | glow (μm) | glow/gap | intensity | Verdict |
|-----------|---------|-----------|----------|-----------|---------|
| **Traditional (15 Torr, 1.5mm)** | **291** | **204** | **0.33** | **0.04** | **Baseline** |
| 1mm @ 100 Torr | 67 | 47 | 0.11 | 1.6 | ⚠️ Thin but 40x brighter |
| 500μm @ 200 Torr | 45 | 32 | 0.15 | 7.2 | ⚠️ Thin but 180x brighter |
| 1mm @ 300 Torr | 37 | 26 | 0.06 | 17.5 | ❌ Too thin |
| 500μm @ 500 Torr | 30 | 21 | 0.10 | 52.4 | ⚠️ Very thin but 1300x brighter |

### Interpretation

**glow_gap_ratio < 0.33 (전통 닉시관 기준):**
- 고압(200+ Torr)에서 음극 글로우는 전극 형상을 "감싸지" 않고 얇은 "테두리"만 형성
- **숫자 전체가 빛나는 전통 닉시관 미학과 다름**
- 그러나 발광 강도가 100-1000x 높으므로 **육안 가시성은 확보**
- **"얇지만 밝은 윤곽선 발광"이라는 새로운 미학적 가능성**

### Recommendation for Bridge 3

최적 조건: **Ne, 100-200 Torr, 500μm-1mm gap**
- glow_gap_ratio 0.11-0.15 → 전통 닉시관의 1/3~1/2
- intensity 40-180x → 육안으로 충분히 밝음
- Vb 250-350V → 부스트 컨버터로 대응 가능
- **판정: 조건부 GO — 실험으로 시각적 특성 확인 필수**
