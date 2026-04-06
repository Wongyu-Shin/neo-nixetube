# neo-nixetube - Project Notes

## Project Overview

- **목표**: 1980년대 이후 기술발전이 멈춘 닉시관(Nixie Tube)을, 2026년 현재까지 약 50년간 발전된 과학/공학 성과를 활용하여, 관련 장비와 전문 기술이 없는 아마추어도 닉시관 제조/개선을 달성할 수 있는지에 대한 PoC
- **위치**: 대한민국 서울
- **작업자 배경**: SWE (현직), 물리학 전공 (학부) - 소자공학/전자공학 학부 수준 지식 보유

## 핵심 질문들

1. 현대 재료과학/나노기술로 닉시관의 전극 구조를 개선할 수 있는가?
2. 3D 프린팅/CNC 등 아마추어 접근 가능한 장비로 유리 가공이 가능한가?
3. 진공/가스 봉입을 DIY 수준에서 달성할 수 있는가?
4. 형광체/인광체 등 현대 소재로 발광 효율을 높일 수 있는가?

---

## Autoresearch Plugin 사용 가이드

### 개요

Karpathy의 autoresearch 철학 기반. **목표 설정 -> 메트릭 정의 -> 자율 반복 루프** 패턴.
핵심: 한 번에 하나의 변경 -> 측정 -> 개선이면 유지 / 아니면 되돌림 -> 반복.

### 사용 가능한 커맨드 (10개)

| 커맨드 | 용도 | 이 프로젝트에서의 활용 |
|--------|------|----------------------|
| `/autoresearch` | 메트릭 기반 자율 개선 루프 (핵심) | 문서/설계 품질 점수 반복 개선 |
| `/autoresearch:plan` | 목표에서 Scope/Metric/Verify 도출 위자드 | 뭘 측정해야 할지 모를 때 먼저 실행 |
| `/autoresearch:debug` | 버그 탐지 (과학적 방법론) | 설계 문서의 논리적 오류 탐지 |
| `/autoresearch:fix` | 에러 자동 수정 루프 | 발견된 문제 순차 수정 |
| `/autoresearch:security` | STRIDE + OWASP 보안 감사 | (SW 산출물 있을 때) |
| `/autoresearch:ship` | 8단계 출하 워크플로우 | 최종 산출물 정리/배포 |
| `/autoresearch:scenario` | 시나리오/엣지케이스 탐색 | 닉시관 제조 시나리오 파생 탐색 |
| `/autoresearch:predict` | 다중 페르소나 스웜 예측 | 전문가 관점별 타당성 사전 분석 |
| `/autoresearch:reason` | 적대적 토론 기반 수렴 | 핵심 설계 결정 시 다각도 검증 |
| `/autoresearch:learn` | 코드베이스 문서 자동 생성 | 리서치 결과 문서화 |

### 기본 문법

```
/autoresearch
Goal:       <개선 목표 - 구체적 수치 포함 권장>
Scope:      <수정 가능한 파일 glob 패턴>
Metric:     <추적할 숫자> (higher is better | lower is better)
Verify:     <메트릭을 출력하는 셸 커맨드>
Guard:      <항상 통과해야 할 안전 커맨드> (선택)
Iterations: <반복 횟수> (생략 시 무한)
```

### 7가지 원칙

1. **제약 = 자율의 조건** - 범위/메트릭/시간을 제한해야 자율 동작 가능
2. **전략(인간) vs 전술(에이전트) 분리** - WHY는 내가, HOW는 Claude가
3. **메트릭은 기계적이어야** - "좋아 보인다" 불가. 숫자로 파싱 가능해야 함
4. **검증은 빨라야** - 빠른 검증 = 더 많은 실험 = 더 좋은 결과
5. **반복 비용이 행동을 결정** - 5분/회 -> 하룻밤 100회 실험 가능
6. **Git이 기억** - 모든 실험이 커밋. 이력에서 패턴 학습
7. **한계를 솔직히** - 못하는 건 못한다고 말해야

### 이 프로젝트에서의 활용 시나리오

#### 1단계: 리서치 및 타당성 분석

```
/autoresearch:predict
Goal: 아마추어 닉시관 제조의 기술적 타당성 분석
Scope: docs/**/*.md, research/**/*.md
--depth deep
--adversarial
```

다중 전문가 페르소나(재료공학, 진공기술, 전자공학, DIY 메이커)가 각 관점에서 분석.

#### 2단계: 시나리오 탐색

```
/autoresearch:scenario
Scenario: 서울에서 아마추어가 닉시관을 처음부터 제조하는 과정
Domain: hardware
--depth deep
--focus edge-cases,failures
```

제조 과정의 각 단계별 실패 모드, 필요 장비, 대안 탐색.

#### 3단계: 핵심 설계 결정

```
/autoresearch:reason
닉시관 봉입 가스로 네온 vs 아르곤 혼합가스 중 어떤 것이 아마추어 제조에 적합한가?
--mode debate
--judges 5
--iterations 5
```

적대적 토론을 통해 설계 결정의 근거를 수렴.

#### 4단계: 문서 품질 반복 개선 (코드/문서가 쌓인 후)

```
/autoresearch
Goal: 기술 문서의 완성도를 90% 이상으로
Scope: docs/**/*.md
Metric: completeness score (higher is better)
Verify: python scripts/doc-score.py
Iterations: 20
```

### 주의사항

- **Git 레포 필수**: autoresearch는 git을 기억장치로 사용. `git init` 필요
- **Verify 커맨드 사전 테스트**: 루프 시작 전 수동으로 실행해서 숫자 파싱 확인
- **Bounded 먼저**: 처음엔 `Iterations: 5~10`으로 동작 확인 후 무한 모드 사용
- **Guard 적극 활용**: 메트릭 외의 품질(기존 테스트 등)을 보호
- **Scope 좁게**: 넓은 Scope는 예상치 못한 변경 유발

### 체이닝 패턴

커맨드를 순차적으로 연결하여 워크플로우 구성 가능:

- `predict -> scenario -> reason` : 분석 -> 탐색 -> 결정
- `debug -> fix -> ship` : 탐지 -> 수정 -> 배포
- `plan -> autoresearch -> ship` : 계획 -> 실행 -> 배포

### 참고

- 플러그인 버전: 1.9.0 (by Udit Goenka)
- 문서 위치: `~/.claude/plugins/marketplaces/autoresearch/guide/`
- 핵심 문서: `getting-started.md`, `autoresearch.md`, `advanced-patterns.md`, `chains-and-combinations.md`
