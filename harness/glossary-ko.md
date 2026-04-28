# Harness 번역 글로서리 (영 → 한)

> 이 파일은 `web/app/harness/**/*.mdx` 한국어화 루프의 단일 매핑 권위.
> 모든 페이지에서 같은 영어 용어는 반드시 같은 한국어로 번역되어야 한다.
> 새 용어를 추가/변경한 PR은 5개 페이지 전체에서 grep + 일괄 치환 후 커밋한다.

## 번역하지 않고 그대로 두는 토큰 (Do-Not-Translate)

JSX, import 라인, 코드 펜스 안의 식별자, 파일 경로, 함수명, CLI 명령은 절대 번역하지 않는다.
아래 토큰은 산문 안에서도 영어 그대로 둔다.

- `Claude Code`, `CC`, `claude -p`, `claude --print`
- `MDX`, `JSX`, `TSX`, `Next.js`, `React`, `useState`, `useEffect`
- `tmux`, `pgrep`, `git revert`, `git reset --hard`
- `Article I` … `Article IX` (조항 본문은 한국어, 식별자는 영문 유지)
- `axis1`, `axis2`, `pre-loop`, `in-loop`, `post-loop`
- `SUM`, `MIN`, `SCORES_JSON`, `STAGES_PASSED`, `PROGRESS`
- 컴포넌트명 (`AxisMatrix`, `PhaseTimeline`, `NixieDiagram` 등)

## 핵심 용어 매핑

| English | 한국어 | 비고 |
|---|---|---|
| harness | 하네스 | 음차. 'agent harness' = '에이전트 하네스' |
| autoresearch | 오토리서치 | 음차. 슬래시 명령은 영문 유지 |
| feature | 피처 | catalog의 28개 피처 단위 |
| Article | 조항 | 'Article I' = '조항 I' (본문 표기) |
| Constitution / charter | 헌법 / 헌장 | `harness/CONSTITUTION.md`는 '헌법' |
| Amendment | 개정 | |
| invariant | 불변 조건 | '불변량' 금지 — 수학 용어와 혼동 |
| rippability / rippable | 흡수 가능성 / 흡수 가능한 | CC 본체로 흡수 가능한 외곽 피처 |
| inner / outer | 내부 / 외부 | 축 1 |
| pre-loop / in-loop / post-loop | 루프 진입 전 / 루프 내부 / 루프 종료 후 | 축 2 |
| ratchet / ratchet MAX | 래칫 / 래칫 MAX | 절대 약화 금지 정책. 영문 병기 권장 |
| anchor | 앵커 | 이전 점수 보존 기준 |
| loop | 루프 | |
| iteration / iter | 이터레이션 / iter | 본문은 '이터레이션', 표/로그는 'iter' 유지 |
| HITL (human-in-the-loop) | HITL (사람 개입) | 약어 + 괄호 풀이, 첫 등장 시만 |
| graduated-confirm | 단계적 확인 | L0/L1/L2 안전 등급 |
| guard | 가드 | |
| verifier / verify | 검증기 / 검증하다 | |
| Defender | 디펜더 | GAN 역할명. 음차 |
| Critic / red team | 크리틱 / 레드팀 | |
| Judge | 저지 | 음차 |
| gold-tier | 골드 티어 | |
| component density | 컴포넌트 밀도 | |
| skill | 스킬 | |
| wiki | 위키 | |
| catalog | 카탈로그 | |
| flow | 플로우 | |
| overview | 오버뷰 | |
| half-life | 반감기 | |
| stale | 노후화된 / 오래된 | 문맥에 따라 |
| ripped / absorbed | 떨어져 나간 / 흡수된 | rippability 맥락 |
| commit | 커밋 | git 의미 |
| revert | 리버트 | |
| worktree | 워크트리 | |
| dashboard | 대시보드 | |
| screenshot | 스크린샷 | |
| render | 렌더 / 렌더링 | |
| persistence layer | 영속 계층 | |
| safety tier | 안전 등급 | |
| cadence | 주기 / 케이던스 | |
| statusline | 상태 줄 | tmux/CC 컨텍스트 |
| plateau | 정체 / 플래토 | |
| skill library | 스킬 라이브러리 | |
| meta-agent | 메타 에이전트 | |
| crosscheck | 교차 검증 | |
| scaffold | 스캐폴드 | |
| primitive | 프리미티브 | UX 맥락에서 UI 기본 단위 |

## 문체 규칙

- 어조: **'-한다체'** (서술 평서형). '-합니다체' 금지.
- 코드/식별자 양옆에 공백을 두고 백틱 유지: `` `harness/CONSTITUTION.md` ``
- 영문 병기: 처음 등장하는 핵심 개념은 `한국어 (English)` 형식으로 1회만 병기. 이후는 한국어 단일.
- 숫자/기호: ASCII 그대로. '15+' '≥48' '5/5' 등 표기 유지.
- 표 헤더는 한국어로 번역하되, 코드 식별자(SUM, axis1)가 헤더면 영문 유지.
- JSX 안의 자식 텍스트(`<div>...</div>` 사이)는 번역 대상. 단 `className`/`aria-*` 속성값은 그대로.
- Markdown 링크 텍스트는 번역, URL은 그대로.

## 절대 하지 말 것

- 컴포넌트 import 경로 변경
- `export const metadata = { title: '...' }` 의 `title` 외 다른 키 추가
- JSX 속성 이름 한글화
- 코드 펜스 (```` ``` ````) 내부 수정
- 영어 약어 (CC, MCP, API, JSON, JSX, MDX, GAN, HITL) 풀어쓰기 — 첫 등장 시 괄호 풀이 1회만

## 다음 갱신 트리거

- 새 영어 용어가 MDX에 등장했는데 매핑이 없으면, 글로서리 추가 → 5 페이지 일괄 적용 → 커밋
