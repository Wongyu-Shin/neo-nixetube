# 경로 2 — 상온 봉착 닉시관 CAD

실제 제조에 참고되는 production-grade 도면. 경로 2 (butyl + polysulfide 상온 봉착 +
sol-gel SiO₂ overcoat + neon flushing) 아키텍처.

## Files

| File | Role |
|------|------|
| `parameters.py` | Single source of truth — all dimensions in mm |
| `envelope.py` | Borosilicate glass tube (COTS) |
| `end_cap.py` | Aluminum end cap with butyl groove + TO-8 pocket |
| `cathode_stack.py` | 10 digit cathodes, 0.2 mm Ni foil, 1.5 mm pitch |
| `anode_mesh.py` | Front mesh disk |
| `assembly.py` | Top-level assembly, exports `build/assembly.step` |
| `bom.yaml` | Machine-readable bill of materials with vendors + costs |

## Build

```bash
cd cad/path-2-room-temp
python3 assembly.py   # → build/assembly.step
```

## Evaluation criteria (autoresearch loop)

Each iteration is scored 0-10 on 9 criteria (see user rubric). Loop terminates
when `min(criteria) >= 9`. Rubric:

| Score | Meaning |
|-------|---------|
| 0 | 치명적 오류 1건 이상 (조립불가 / 기능결함) |
| 3 | 치명적 오류 없음, 마이너 문제 1건 이상 |
| 5 | 마이너 문제 없음, 특장점 없음 |
| 7 | 타 비교군에 못지않거나 일부 우월 |
| 9 | 동일 제품군 대비 월등한 장점 2개 이상 |
| 10 | 이론상 만점 (실존 불가) |

9 criteria: 치수정확성, 기성품일치, 조립가능성, 공간·공정무모순, 용도적합성,
미학, 디스플레이적합성, 제조용이성, 공정효율성.

## Baseline status

Seed state — expected initial MIN score ~4-5. Known gaps the loop should close:

- 디지트 음극은 단순 사각 블랭크. 실제 7-segment 또는 스타일화된 숫자 프로파일 필요.
- end_cap의 butyl 그루브 위치가 근사. 실제 글래스 ID와의 압축 인터퍼런스 검증 필요.
- feedthrough 모델은 pocket만 있음. 실제 TO-8 핀 기하 + 조립 위치 필요.
- anode mesh는 구멍 격자 근사. 실제 woven mesh 또는 photo-etched 패턴으로 대체.
- 치수는 상용 Pyrex 25x1.5x60 SKU 기반이지만 벤더 데이터시트 대조 필요.
