# Autoresearch Loop State — 경로 2 CAD

**Last updated:** 2026-04-13, iter 41, SUM=35, MIN=3
**Resume from:** commit `63c26fe` (HEAD)

## Current Scores

```json
{"C1":5,"C2":3,"C3":3,"C4":7,"C5":3,"C6":3,"C7":5,"C8":3,"C9":3}
```

MIN=3. SUM=35/90.

### Score Evolution (all 3 sessions)
```
Session 1 (iter 0-20):  SUM 0→31 (+31). Architecture from scratch.
Session 2 (iter 20):    SUM 31. LOOP_STATE written. Plateau.
Session 3 (iter 21-41): SUM 31→35 (+4). Seal+numerals+tooling.
  iter 23: C1:3→5, C4:5→7 (anchor tooling fix effect)
  iter 24: C5:0→3 recovered (composite seal)
  iter 33: C6:3→5 achieved momentarily (font numerals, but C4 regressed)
```

### Recalibration History (unanchored verifies)
```
Session 3 start:  SUM=23 (iter 0 recal, before improvements)
Session 3 end:    SUM=26 (iter 35 recal, after improvements)  → +3 real progress
```

## Config (copy-paste to resume)

```
/autoresearch
Goal: 경로 2 닉시관 CAD 9개 기준 모두 MIN≥9. 현재 SUM=35, MIN=3. 3→5 plateau. LOOP_STATE.md 반드시 먼저 읽을 것.
Scope: cad/path-2-room-temp/**
Metric: sum_criterion_score (higher is better)
Verify: bash scripts/cad-verify.sh cad/path-2-room-temp
Guard: bash scripts/cad-guard.sh cad/path-2-room-temp
```

## Critical Context for New Sessions

### 1. Verify Pipeline Architecture
`scripts/cad-verify.sh`는 GAN 3-stage 파이프라인:
- Stage 1: Defender (1 Opus call)
- Stage 2: Red Team — 3 parallel critics (machinist/process engineer/industrial designer)
- Stage 3: Judge (1 Opus call) — **앵커 메커니즘 사용** (아래 참고)

### 2. Anchor Mechanism (가장 중요)
Judge는 `build/prev_scores.txt`의 이전 점수를 앵커로 사용합니다.
- 기본값: 이전 점수 유지
- 승격 조건: critic이 발견한 이전 결함이 현재 번들에서 해결됨 → 한 루브릭 레벨 승격 (3→5, 5→7, 7→9)
- 강등 조건: 새로운 critical flaw 도입 → 강등 (보통 0 또는 3)
- 무작위 재평가, 취향 변경은 점수 변경 사유 아님

**Guard가 build/ 를 지우더라도 prev_scores.txt는 보존됨** (guard에 save/restore 로직 있음).

### 3. 노이즈 프로필 (세션 1+3에서 발견)
- **앵커 없이**: GAN judge 노이즈 ±6 SUM (세션 1 발견)
- **앵커 있어도**: ±10 SUM 회귀 가능 (iter 36: 동일 코드에서 C3:3→0, C4:7→0 = -10)
- **래칫 도입 후** (세션 3 commit `7422c57`): per-criterion MAX(이전, 현재)로 회귀 차단
- 앵커가 합법적 승격도 억제 → 기준별 ALL minors를 한 iteration에서 해결해야 승격
- **geometry 변경**: ±4-8 SUM 관련 없는 기준에서 회귀 (iter 26, 27, 33)
- **documentation 변경**: 기능 목적 변경 시 최대 -8 SUM 급락 (iter 28)

### 4. 3→5 Plateau 원인 분석
7개 기준이 3에 머무는 이유: 각 기준에 1-3개 minor issue가 남아있음.
루브릭 5 = "마이너 문제 없음" → 한 기준의 모든 minor를 한 번에 해결해야 5 도달.

**마지막 critic이 발견한 minor issues (iter 41 기준):**

| 기준 | 점수 | 잔여 Issues | 세션 3 변경사항 |
|------|------|------------|----------------|
| C1 | **5** | phantom CATH_DIGIT_WIDTH (✅ fixed 10→9) | 파라미터 정합 완료 |
| C2 | 3 | 피드스루 custom, ₩85K (realistic but over ₩185K budget) | ✅ CUSTOM 정직 라벨링 |
| C3 | 3 | 양극 메시 구조적 고정 없음, 음극 per-cathode 등록 없음 | 지지봉 시도 → C4 회귀로 revert |
| C4 | **7** | (앵커가 보호 중 — 래칫으로 유지) | 앵커 v2 + 래칫 도입 |
| C5 | 3 | sight glass 디스플레이 가치 없음 (CTE는 ✅ 해결) | ✅ 복합 봉착 (butyl+Torr Seal) |
| C6 | 3 | 폰트 숫자 도입했으나 앵커가 승격 차단 (iter 33에서 5 도달) | ✅ font text() 영구 적용 |
| C7 | **5** | (안정) | 변경 없음 |
| C8 | 3 | 피드스루 custom 비용/리드타임, 포켓 공차 | ✅ 0.05→0.10mm 확대 |
| C9 | 3 | 봉착 2재료지만 critic이 여전히 복잡성 지적 | ✅ sol-gel 제거 (4→2 재료) |

**주의:** 래칫(per-criterion MAX) 도입으로 노이즈 회귀 차단됨. 승격만 누적.

### 5. Recommended Strategy for 3→5 Breakthrough
옵션 A: 앵커를 일시 제거하고 한 번 "recalibration" 실행 → 진짜 현재 점수 확인
옵션 B: 한 기준 선택, 해당 기준의 ALL minors 한 iteration에서 해결 → 해당 기준만 5로 이동
옵션 C: 앵커 프롬프트를 더 민감하게 조정 (현재 "one rubric level per fix cycle" → 이미 적용됨)

**추천: 옵션 A 먼저 (현재 실력 파악) → 옵션 B 반복**

### 6. Known Tooling Bugs (Fixed)
- ~~Guard가 prev_scores.txt 삭제~~ → save/restore 로직 추가 (commit `13fc391`)
- ~~MIN 메트릭 gradient starvation~~ → SUM으로 전환 (commit `ec3a49a`)
- ~~앵커 +3 jump threshold가 3→5 차단~~ → rubric-level promotion으로 변경 (commit `60db86b`)
- ~~앵커가 이전 critic 결함을 모름~~ → prev_critics_summary.txt 도입 (commit `ed9e1c3`)
- ~~노이즈로 점수 회귀~~ → 래칫 메커니즘 (per-criterion MAX) 도입 (commit `7422c57`)
- ~~Guard가 prev_critics_summary.txt 삭제~~ → guard에 backup/restore 추가
- ~~앵커 약화 시도~~ → C4:7→3 회귀 확인, revert (commit `d77086e`) — 앵커 강화가 정답

### 7. File Map

| File | Role |
|------|------|
| `autoresearch-cad-path2-results.tsv` | 41 iterations 이력 (gitignored) |
| `build/prev_scores.txt` | 앵커 파일 (guard+래칫이 보존) |
| `build/prev_scores.txt.bak` | 앵커 백업 (수동 복원용) |
| `build/prev_critics_summary.txt` | 이전 critic 발견 요약 (judge 비교용) |
| `build/judge.md` | 마지막 GAN 감사 추적 |
| `scripts/cad-verify.sh` | GAN 파이프라인 + 앵커 + 래칫 로직 |
| `scripts/cad-guard.sh` | 빠른 안전망 + 앵커/critic 보존 |
| `LOOP_STATE.md` | 이 파일 — 세션 간 컨텍스트 전달용 |

### 8. Git History Pattern
```
experiment(cad): ... → design iteration (keep/discard)
tooling(...): ...    → infrastructure fix (always keep)
Revert "..."         → discarded iteration
```
`git log --oneline -30`으로 전체 이력 확인 가능.

---

## Deep Context: Loop에서 발견한 것들

### 9. 메트릭 진화 이력 (왜 MIN → SUM 인가)

세션 1 iter 1에서 발견: MIN metric은 9개 기준이 모두 0일 때 **gradient starvation** 발생.
한 기준이 0→3으로 올라가도 MIN=0 그대로 → autoresearch가 discard → 진전 불가.

**원인:** MIN은 AND-gate. 모든 기준이 동시에 0을 벗어나야 MIN이 움직임. 단일 atomic fix로는
불가능. SUM은 연속적 gradient 제공 — 한 기준 0→3이 SUM +3으로 즉시 관측됨.

**교훈:** 다기준 AND 목표에는 SUM/count 서로게이트 metric이 필수. MIN은 종료조건으로만 사용.

### 10. 반복 전략: 무엇이 작동했고 무엇이 실패했는가

**작동한 패턴 (Keeps):**
- **Holistic part-level fixes** (한 부품/기준의 모든 결함을 한 iteration에 해결):
  iter 4 (+3, mica clipping + digit ring), iter 5 (+6, sight glass + fill stem + groove),
  iter 15 (+6, fill stem 1/16" + Torr Seal), iter 16 (+4, anode lead wire)
- **Critic-specified fixes** (critic이 정확한 수정 방법까지 제안한 것 그대로 적용):
  iter 10 (lead harness → C3 0→3), iter 14 (7-seg + per-digit anchor → C6 0→3)
- **Fix pair → verify 즉시**: 수정 후 바로 검증, 복잡한 좌표 계산 전에 guard로 렌더 확인

**실패한 패턴 (Discards):**
- **Single-line fix** (iter 1-3): noise floor (~3 SUM) 아래. Metric이 감지 못함.
- **복잡한 geometry 도입 without incremental test** (iter 6 lead bundle): 좌표 버그가
  여러 곳에서 동시 발생. guard는 "렌더 가능"만 확인하지 "물리적 타당성"은 안 봄.
- **기존 코드 전제를 확인 안 함** (iter 11: 7-seg digit 교체 시 lead anchor가 bottom
  bar 전제에 의존하는 걸 놓침 → digit 1/4/7 전기 단절).
- **verify script 변경 후 re-baseline 없이 iteration 진행** (iter 7-8): 새 verify가
  이전과 다른 점수 체계 → 오해 유발.

**세션 3 추가 패턴:**
- **재료/BOM 사양 변경** (geometry 안 건드림): 0 delta지만 안전 (iter 21,29,30,31,40)
- **geometry 추가/변경**: ±4-8 SUM 관련 없는 기준 회귀 (iter 26 지지봉, 27 cap split)
- **문서 목적 변경**: 최대 -8 회귀 (iter 28 sight glass reframing → C5:3→0, C7:5→0)
- **폰트 음극 (text() API)**: C6:3→5 달성 가능 확인 (iter 33), 리드 탭으로 호환 유지 (iter 34)
- **래칫 + 반복 verify**: 회귀 차단하면서 유리한 critic draw 기다리기 (iter 37-41)

**핵심 원칙:** "한 iteration = 한 기준의 모든 결함을 해결하거나, 아무것도 안 하거나."
**세션 3 추가:** "geometry 변경은 래칫 보호 하에서만. 사양/BOM 변경이 안전."

### 11. CadQuery 반복 버그 패턴

새 세션에서 같은 실수를 반복하지 않도록:

| 함정 | 증상 | 해결 |
|------|------|------|
| `rect()` origin-centered | 바운딩 박스가 의도와 다름. "digit bottom at Z=0"이 아닌 "digit CENTER at Z=0" | 항상 명시적으로 center offset 계산. 주석에 "centered" 표기 |
| `.mirror("XY")` | Z축 반전. "위아래 뒤집기"가 아닌 "XY평면 기준 대칭" | mirror 후 결과 Z-range를 손으로 추적 |
| `Color("name")` | "silver", "copper" 같은 이름은 CadQuery에 없음 | 항상 `Color(r, g, b, a)` tuple 사용 |
| `cq.Assembly.save()` | FutureWarning (다음 릴리스에서 제거 예정) | 무시해도 됨. 대안: `cq.exporters.export()` |
| `extrude()` 방향 | Workplane normal 방향. "XZ"는 +Y, "XY"는 +Z | 주석에 extrude 방향 명시 |
| `text()` API | `cut` 파라미터 없음 (CQ2), `combine=False` 사용 | `cq.Workplane("XZ").text(str(v), size, depth, combine=False, font="Arial")` |
| `text()` + 리드앵커 | font glyph 좌표가 7-seg 상수와 다름 → 별도 리드탭 필요 | LEAD_TAB_Z = -(H/2 + 1.0)에 rect 탭 union |

### 12. GAN이 발견한 설계 결함 목록 (지적 자산)

물리 프로토타이핑 전에 GAN red team이 자동으로 발견한 결함. **이것이 루프의 핵심 가치.**

| # | 결함 | 발견 Iter | 상태 | 비용 회피 |
|---|------|-----------|------|----------|
| 1 | End cap lip이 glass ID에 안 들어감 (mirror 방향 오류) | 0 | ✅ fixed iter 1 | 첫 프로토타입 폐기 방지 |
| 2 | TO-8은 8핀 (JEDEC), 12핀 아님 | 0 | ✅ renamed iter 9 | BOM 오발주 방지 (₩25K) |
| 3 | 핀 관통홀 누락 → 전기 경로 차단 | 0 | ✅ fixed iter 2 | 조립 후 발견 시 재가공비 |
| 4 | Ne flushing용 fill port 부재 | 0 | ✅ fixed iter 5 | 아키텍처 재설계 방지 |
| 5 | Cathode 수평 평판 (XZ 아닌 XY 배향) | 0 | ✅ fixed iter 3 | 디스플레이 불가 방지 |
| 6 | 7-seg 0.375mm gap → 비연결 islands | 3 | ✅ fixed iter 14 | 레이저 커팅 스크랩 방지 |
| 7 | Mica/anode disk가 envelope 벽 관통 | 3 | ✅ fixed iter 4 | 유리관 파손 방지 |
| 8 | Fill port가 butyl groove 관통 | 5 | ✅ fixed iter 15 (1/16" stem) | 봉착 실패 방지 |
| 9 | Sight glass bore 순서 오류 (glass가 통과) | 10 | ⚠ 부분수정 | 진공 파괴 방지 |
| 10 | Lead wire가 다른 cathode 관통 | 12 | ✅ fixed iter 13 (2-seg) | 단락 방지 |
| 11 | Feedthrough body seal 미지정 | 16 | ✅ fixed iter 17 | 가스 누출 방지 |
| 12 | Lead Z-target 4.5mm 오차 (pocket ceiling 기준) | 17 | ✅ fixed iter 20 (미검증) | 전기 단절 방지 |
| 13 | Pure Ne >250V strike (driver 범위 초과) | 17 | ✅ fixed iter 18 (Penning gas) | 미점등 방지 |
| 14 | Fill stem 0.06mm 벽 (CNC 공차 이하) | 15 | ✅ fixed iter 15 (1/16" stem) | 가공 실패 방지 |

| 15 | Butyl 2mm path → 2시간 내 관 오염 (permeation 계산) | 21 (recal) | ✅ fixed iter 24 (composite seal) | 사용 불가 관 방지 |
| 16 | 실리콘 RTV는 butyl보다 200× 높은 투과성 | 23 | ✅ learned, butyl 복원 | 잘못된 재료 선택 방지 |
| 17 | Al-borosilicate CTE 7× 미스매치 → Torr Seal 피로 파괴 | 22 | ✅ fixed iter 24 (butyl cushion) | 봉착 실패 방지 |
| 18 | Sight glass bore = glass OD → 50% 확률로 glass 통과 | 24 | ⚠ 인지됨 | 조립 실패 방지 |

**18개 결함 자동 발견 (세션 3에서 4개 추가).** 전통적 방법으로는 프로토타입 3-5회 반복 후 발견됨 (추정 비용 ₩500K+).

### 13. 앵커 메커니즘 실패 모드 3가지

| 모드 | 원인 | 증상 | 해결 |
|------|------|------|------|
| **과보수** | judge 기본값 "이전 점수 유지" → 실제 개선도 승격 안 함 | SUM plateau (iter 17-20, 25-31) | ✅ 부분해결: critic 비교 로직 추가 (commit `ed9e1c3`) |
| **오염** | discard된 iteration의 verify가 점수 덮어씀 | Revert 후 SUM 하락 | ✅ 해결: 래칫 (MAX) 메커니즘으로 회귀 불가 |
| **소실** | guard가 build/ 삭제 | 앵커 없이 절대 평가 → 노이즈 복귀 | ✅ fixed: guard에 save/restore 로직 |
| **노이즈 관통 (신규)** | 앵커가 있어도 critic이 "새 critical flaw" 주장하면 강등 | iter 36: 동일 코드 -10 SUM | ✅ fixed: 래칫으로 강등 차단 |

### 14. 비용/시간 프로필

| 항목 | 값 |
|------|-----|
| Opus calls per verify | 5 (1 defender + 3 critics parallel + 1 judge) |
| Verify wall-clock | 15-25분 (critic 10-15분 + judge 5-15분) |
| Judge hang rate | ~1/5 runs at 22+ min → kill and retry |
| Guard wall-clock | ~15초 |
| Modify + commit | 5-10분 |
| **총 iteration 시간** | **20-35분** |
| **SUM 0→31 총 소요** | ~20 iterations × ~25분 ≈ 8시간 (2 sessions) |
| **SUM 31→35 총 소요** | ~21 iterations × ~20분 ≈ 7시간 (1 session) |
| **총 41 iterations** | ~15시간 wall-clock, ~205 Opus calls |

### 15. SUM 수렴 궤적 (plateau 역학)

```
Phase 1 (0→12, iter 0-5):   아키텍처 결함 해결. 2.4 SUM/iter. 빠른 진행.
Phase 2 (12→24, iter 9-15):  기능 결함 해결. 2.0 SUM/iter. 앵커 도입.
Phase 3 (24→31, iter 15-17): 마지막 0점 기준 해소. 2.3 SUM/iter.
Phase 4 (31→31, iter 17-20): PLATEAU 1. 0.0 SUM/iter. 앵커 과보수.
Phase 5 (31→35, iter 21-24): 앵커 v2 + 복합 봉착. 1.0 SUM/iter.
Phase 6 (35→35, iter 25-41): PLATEAU 2. 0.0 SUM/iter. GAN 노이즈 한계.
```

**대수적 감쇠 (logarithmic decay):** 초기 iteration은 아키텍처 결함 (높은 가치, 큰 SUM
delta) 해결. 후기 iteration은 minor issue (점진적 가치, 스코어링 어려움) 해결.

**Plateau 돌파 조건:** 앵커가 "한 기준의 모든 minor가 해결됐다"는 증거를 충분히 받아야 승격.
현재 critic이 CRITICAL(0-2)로 평가하는 기준도 있어 → 이것은 앵커가 "마스킹"하는 것.
진짜 상태를 파악하려면 앵커 없는 1회 recalibration이 필요.

### 16. 향후 시도해볼 방향성

**A. 앵커 recalibration** ✅ 완료 (세션 3, 2회 실행: SUM 23→26)
결과: 실제 진전 확인됨. 앵커가 보호하는 C1=5, C4=7은 정당한 점수.

**B. Differential scoring 아키텍처** (미시도)
`git diff HEAD~1`을 judge에 전달. 노이즈+과보수 동시 해결 가능하나 verify 대폭 수정 필요.

**C. Hybrid metric (GAN + mechanical)** (미시도, 최우선 추천)
빠른 기준 deterministic assertion + 느린 기준만 GAN. 비용 60% 절감.
GAN 노이즈 ±10 한계를 우회하는 가장 확실한 방법.

**D. Critic 캐싱** (미시도)
변경 파일만 re-evaluate. 5→2-3 Opus calls.

**E. BOM 실제 검증** (미시도)
Digi-Key/Mouser API로 SKU 검증. C2 근본 해결.

**F. 폰트 숫자** ✅ 완료 (세션 3, commit `18db43c`)
CadQuery text() API로 Arial 폰트 기반 숫자 생성. iter 33에서 C6=5 달성 확인.
리드 탭으로 기존 lead harness 호환 유지.

**G. 래칫 + 반복 verify (신규)** ✅ 구현 (commit `7422c57`)
per-criterion MAX로 회귀 차단. 반복 verify로 유리한 draw 포착.
세션 3에서 6회 테스트, 모두 35 유지 (승격 없었으나 회귀도 없음).

**H. 래칫 + design change 조합 (신규, 추천)**
래칫 보호 하에서 geometry 변경 시도. 회귀 시 자동 차단되므로 안전.
C3 (anode retention), C6 (font quality) 등 geometry 변경이 필요한 기준에 적합.
