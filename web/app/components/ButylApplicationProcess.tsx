"use client";

import { useState } from "react";

interface Step {
  id: string;
  num: number;
  title: string;
  color: string;
  detail: string;
}

const STEPS: Step[] = [
  {
    id: "degrease",
    num: 1,
    title: "접합면 탈지",
    color: "#7B9EB8",
    detail:
      "유리 돔 하단 림과 TO-8 헤더 플랜지를 IPA로 탈지. 먼지/유분은 부틸 접착력 저하 원인.",
  },
  {
    id: "butyl-tape",
    num: 2,
    title: "부틸 테이프 적용",
    color: "#6BA368",
    detail:
      "핫멜트 부틸 테이프(폭 4mm)를 헤더 플랜지 둘레에 한 바퀴. 겹침 없이 연속 — 겹침은 기밀 약점.",
  },
  {
    id: "heat-gun",
    num: 3,
    title: "히트건 가열 + 밀착",
    color: "#ef8f44",
    detail:
      "히트건 200°C를 부틸에 10-15초 → 연화 → 유리 돔을 올려놓고 균일 압착. 편심 주의.",
  },
  {
    id: "torrseal",
    num: 4,
    title: "Torr Seal 도포",
    color: "#D4A853",
    detail:
      "부틸 봉착부 외부 노출면에 Torr Seal UHV 에폭시를 3mm 연속 비드로 도포. 끊김 없이 한 바퀴. 24시간 경화.",
  },
  {
    id: "cured",
    num: 5,
    title: "경화 완료",
    color: "#B8A9C9",
    detail:
      "상온 24시간 경화. 손가락 눌러도 변형 없음 확인. 돔 흔들림 없어야 함.",
  },
];

/* ── SVG illustration for each step ── */

function StepIllustration({
  stepId,
  active,
}: {
  stepId: string;
  active: boolean;
}) {
  const o = active ? 1 : 0.55;

  switch (stepId) {
    /* Step 1 — IPA wipe: dome rim + header flange + wipe cloth */
    case "degrease":
      return (
        <g opacity={o}>
          {/* Header flange base */}
          <rect
            x={22}
            y={80}
            width={56}
            height={10}
            rx={2}
            fill="#7B9EB818"
            stroke="#7B9EB8"
            strokeWidth={active ? 1.2 : 0.6}
          />
          <text
            x={50}
            y={88}
            fill="#7B9EB8"
            fontSize="5"
            textAnchor="middle"
            opacity={0.7}
          >
            헤더 플랜지
          </text>
          {/* Header pins */}
          {[30, 40, 50, 60, 70].map((px) => (
            <line
              key={px}
              x1={px}
              y1={90}
              x2={px}
              y2={100}
              stroke="#7B9EB860"
              strokeWidth={1}
            />
          ))}
          {/* Glass dome outline (above, separated) */}
          <path
            d="M 28 75 Q 28 40, 50 35 Q 72 40, 72 75"
            fill="none"
            stroke="#7B9EB8"
            strokeWidth={active ? 1.2 : 0.6}
            strokeDasharray={active ? "none" : "3 2"}
          />
          <text
            x={50}
            y={55}
            fill="#7B9EB8"
            fontSize="5"
            textAnchor="middle"
            opacity={0.7}
          >
            유리 돔
          </text>
          {/* IPA wipe cloth */}
          <rect
            x={60}
            y={70}
            width={18}
            height={8}
            rx={2}
            fill="#7B9EB830"
            stroke="#7B9EB8"
            strokeWidth={0.8}
          />
          <text
            x={69}
            y={76}
            fill="#7B9EB8"
            fontSize="4"
            textAnchor="middle"
            fontWeight="bold"
          >
            IPA
          </text>
          {/* Wipe motion arrows */}
          {active && (
            <>
              <line
                x1={78}
                y1={74}
                x2={84}
                y2={74}
                stroke="#7B9EB8"
                strokeWidth={0.6}
              />
              <polygon points="83,72 86,74 83,76" fill="#7B9EB8" />
            </>
          )}
        </g>
      );

    /* Step 2 — Butyl tape wrapping around flange */
    case "butyl-tape":
      return (
        <g opacity={o}>
          {/* Header flange */}
          <rect
            x={22}
            y={80}
            width={56}
            height={10}
            rx={2}
            fill="#7B9EB818"
            stroke="#7B9EB860"
            strokeWidth={0.6}
          />
          {/* Header pins */}
          {[30, 40, 50, 60, 70].map((px) => (
            <line
              key={px}
              x1={px}
              y1={90}
              x2={px}
              y2={100}
              stroke="#7B9EB840"
              strokeWidth={1}
            />
          ))}
          {/* Butyl tape ring on top of flange */}
          <ellipse
            cx={50}
            cy={80}
            rx={28}
            ry={6}
            fill="none"
            stroke="#6BA368"
            strokeWidth={active ? 2.5 : 1.5}
            strokeLinecap="round"
          />
          {/* Tape roll to the side */}
          <circle
            cx={88}
            cy={60}
            r={8}
            fill="#6BA36820"
            stroke="#6BA368"
            strokeWidth={0.8}
          />
          <circle cx={88} cy={60} r={4} fill="#111116" stroke="#6BA36860" strokeWidth={0.5} />
          <text
            x={88}
            y={74}
            fill="#6BA368"
            fontSize="4"
            textAnchor="middle"
          >
            부틸 테이프
          </text>
          {/* Application arrow */}
          {active && (
            <>
              <line
                x1={82}
                y1={66}
                x2={74}
                y2={76}
                stroke="#6BA368"
                strokeWidth={0.6}
                strokeDasharray="2 1"
              />
              <polygon points="75,74 73,78 77,76" fill="#6BA368" />
            </>
          )}
          {/* 4mm label */}
          <text
            x={50}
            y={72}
            fill="#6BA368"
            fontSize="4"
            textAnchor="middle"
            opacity={0.8}
          >
            폭 4mm
          </text>
        </g>
      );

    /* Step 3 — Heat gun + dome placement */
    case "heat-gun":
      return (
        <g opacity={o}>
          {/* Header flange */}
          <rect
            x={22}
            y={80}
            width={56}
            height={10}
            rx={2}
            fill="#7B9EB818"
            stroke="#7B9EB860"
            strokeWidth={0.6}
          />
          {/* Butyl on flange (softening) */}
          <ellipse
            cx={50}
            cy={80}
            rx={28}
            ry={5}
            fill="#ef8f4425"
            stroke="#ef8f44"
            strokeWidth={1.5}
          />
          {/* Heat gun body */}
          <rect
            x={2}
            y={52}
            width={20}
            height={10}
            rx={2}
            fill="#ef8f4430"
            stroke="#ef8f44"
            strokeWidth={0.8}
          />
          {/* Heat gun nozzle */}
          <rect
            x={22}
            y={54}
            width={8}
            height={6}
            rx={1}
            fill="#ef8f4440"
            stroke="#ef8f44"
            strokeWidth={0.6}
          />
          <text
            x={12}
            y={50}
            fill="#ef8f44"
            fontSize="4"
            textAnchor="middle"
          >
            200°C
          </text>
          {/* Heat waves */}
          {active && (
            <>
              <path
                d="M 30 57 Q 34 54, 38 57"
                fill="none"
                stroke="#ef8f4480"
                strokeWidth={0.6}
              />
              <path
                d="M 32 60 Q 36 57, 40 60"
                fill="none"
                stroke="#ef8f4460"
                strokeWidth={0.6}
              />
              <path
                d="M 34 63 Q 38 60, 42 63"
                fill="none"
                stroke="#ef8f4440"
                strokeWidth={0.6}
              />
            </>
          )}
          {/* Glass dome descending */}
          <path
            d="M 28 70 Q 28 42, 50 37 Q 72 42, 72 70"
            fill="none"
            stroke="#7B9EB8"
            strokeWidth={active ? 1.2 : 0.6}
          />
          {/* Downward arrow showing placement */}
          {active && (
            <>
              <line
                x1={50}
                y1={30}
                x2={50}
                y2={36}
                stroke="#7B9EB8"
                strokeWidth={0.8}
              />
              <polygon points="48,35 50,38 52,35" fill="#7B9EB8" />
            </>
          )}
          {/* Pressure arrows */}
          {active && (
            <>
              <line
                x1={35}
                y1={25}
                x2={35}
                y2={32}
                stroke="#ef8f4460"
                strokeWidth={0.5}
              />
              <polygon points="34,31 35,34 36,31" fill="#ef8f4480" />
              <line
                x1={65}
                y1={25}
                x2={65}
                y2={32}
                stroke="#ef8f4460"
                strokeWidth={0.5}
              />
              <polygon points="64,31 65,34 66,31" fill="#ef8f4480" />
            </>
          )}
          {/* Header pins */}
          {[30, 40, 50, 60, 70].map((px) => (
            <line
              key={px}
              x1={px}
              y1={90}
              x2={px}
              y2={100}
              stroke="#7B9EB840"
              strokeWidth={1}
            />
          ))}
        </g>
      );

    /* Step 4 — Polysulfide application around outside */
    case "polysulfide":
      return (
        <g opacity={o}>
          {/* Header flange */}
          <rect
            x={22}
            y={80}
            width={56}
            height={10}
            rx={2}
            fill="#7B9EB818"
            stroke="#7B9EB860"
            strokeWidth={0.6}
          />
          {/* Header pins */}
          {[30, 40, 50, 60, 70].map((px) => (
            <line
              key={px}
              x1={px}
              y1={90}
              x2={px}
              y2={100}
              stroke="#7B9EB840"
              strokeWidth={1}
            />
          ))}
          {/* Glass dome sealed */}
          <path
            d="M 28 80 Q 28 42, 50 37 Q 72 42, 72 80"
            fill="#7B9EB808"
            stroke="#7B9EB860"
            strokeWidth={0.6}
          />
          {/* Butyl layer (inner, thin) */}
          <ellipse
            cx={50}
            cy={80}
            rx={27}
            ry={4}
            fill="#6BA36815"
            stroke="#6BA36850"
            strokeWidth={0.5}
          />
          {/* Polysulfide bead (outer, thicker) */}
          <ellipse
            cx={50}
            cy={80}
            rx={32}
            ry={8}
            fill={active ? "#D4A85320" : "#D4A85310"}
            stroke="#D4A853"
            strokeWidth={active ? 1.5 : 0.8}
          />
          <text
            x={50}
            y={68}
            fill="#D4A853"
            fontSize="4"
            textAnchor="middle"
            opacity={0.8}
          >
            Torr Seal
          </text>
          {/* Syringe / applicator */}
          {active && (
            <>
              <rect
                x={80}
                y={68}
                width={14}
                height={5}
                rx={1}
                fill="#D4A85330"
                stroke="#D4A853"
                strokeWidth={0.6}
              />
              <line
                x1={80}
                y1={70.5}
                x2={76}
                y2={76}
                stroke="#D4A853"
                strokeWidth={0.6}
              />
              <circle cx={76} cy={78} r={1} fill="#D4A853" />
            </>
          )}
          {/* 24h label */}
          <text
            x={50}
            y={106}
            fill="#D4A853"
            fontSize="4"
            textAnchor="middle"
            opacity={0.7}
          >
            24시간 경화
          </text>
        </g>
      );

    /* Step 5 — Completed sealed assembly with checkmark */
    case "cured":
      return (
        <g opacity={o}>
          {/* Header flange */}
          <rect
            x={22}
            y={80}
            width={56}
            height={10}
            rx={2}
            fill="#7B9EB818"
            stroke="#7B9EB860"
            strokeWidth={0.6}
          />
          {/* Header pins */}
          {[30, 40, 50, 60, 70].map((px) => (
            <line
              key={px}
              x1={px}
              y1={90}
              x2={px}
              y2={100}
              stroke="#7B9EB860"
              strokeWidth={1}
            />
          ))}
          {/* Glass dome sealed */}
          <path
            d="M 28 80 Q 28 42, 50 37 Q 72 42, 72 80"
            fill="#B8A9C908"
            stroke="#B8A9C9"
            strokeWidth={active ? 1.2 : 0.6}
          />
          {/* Butyl + polysulfide sealed ring */}
          <ellipse
            cx={50}
            cy={80}
            rx={30}
            ry={6}
            fill="#6BA36815"
            stroke={active ? "#B8A9C9" : "#B8A9C960"}
            strokeWidth={active ? 1.2 : 0.6}
          />
          {/* Checkmark */}
          <path
            d="M 42 55 L 48 63 L 62 45"
            fill="none"
            stroke="#6BA368"
            strokeWidth={active ? 2.5 : 1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Status text */}
          <text
            x={50}
            y={106}
            fill="#B8A9C9"
            fontSize="4"
            textAnchor="middle"
            opacity={0.8}
          >
            기밀 봉착 완료
          </text>
          {/* Subtle glow ring when active */}
          {active && (
            <ellipse
              cx={50}
              cy={80}
              rx={34}
              ry={9}
              fill="none"
              stroke="#B8A9C920"
              strokeWidth={3}
            />
          )}
        </g>
      );

    default:
      return null;
  }
}

export default function ButylApplicationProcess() {
  const [activeStep, setActiveStep] = useState<number>(0);

  const active = STEPS[activeStep];

  const cardW = 100;
  const cardH = 120;
  const arrowW = 20;
  const totalW = STEPS.length * cardW + (STEPS.length - 1) * arrowW;
  const svgW = 600;
  const svgH = 220;
  const offsetX = (svgW - totalW) / 2;

  return (
    <figure className="my-8">
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="w-full max-w-2xl mx-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          width={svgW}
          height={svgH}
          fill="#111116"
          rx="8"
          stroke="#ffffff10"
          strokeWidth="0.5"
        />

        {/* Title */}
        <text
          x={svgW / 2}
          y={18}
          fill="#e8e8e8"
          fontSize="11"
          fontWeight="bold"
          textAnchor="middle"
        >
          유리 돔 부틸 봉착 공정 — 5단계
        </text>

        {STEPS.map((step, i) => {
          const isActive = activeStep === i;
          const cx = offsetX + i * (cardW + arrowW);

          return (
            <g key={step.id}>
              {/* Step card */}
              <g
                onClick={() => setActiveStep(i)}
                style={{ cursor: "pointer" }}
              >
                {/* Card background */}
                <rect
                  x={cx}
                  y={28}
                  width={cardW}
                  height={cardH}
                  rx={6}
                  fill={isActive ? step.color + "18" : "#ffffff06"}
                  stroke={isActive ? step.color : "#ffffff15"}
                  strokeWidth={isActive ? 1.5 : 0.6}
                />

                {/* Step number badge */}
                <circle
                  cx={cx + 14}
                  cy={40}
                  r={7}
                  fill={isActive ? step.color + "35" : "#ffffff10"}
                  stroke={step.color}
                  strokeWidth={isActive ? 1.2 : 0.6}
                />
                <text
                  x={cx + 14}
                  y={43}
                  fill={step.color}
                  fontSize="7"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {step.num}
                </text>

                {/* SVG illustration area */}
                <svg
                  x={cx}
                  y={28}
                  width={cardW}
                  height={cardH}
                  viewBox="0 0 100 120"
                >
                  <StepIllustration stepId={step.id} active={isActive} />
                </svg>
              </g>

              {/* Step title below card */}
              <text
                x={cx + cardW / 2}
                y={162}
                fill={isActive ? step.color : "#999"}
                fontSize="7"
                fontWeight={isActive ? "bold" : "normal"}
                textAnchor="middle"
              >
                {step.title}
              </text>

              {/* Arrow to next step */}
              {i < STEPS.length - 1 && (
                <g>
                  <line
                    x1={cx + cardW + 3}
                    y1={28 + cardH / 2}
                    x2={cx + cardW + arrowW - 3}
                    y2={28 + cardH / 2}
                    stroke="#ffffff30"
                    strokeWidth={1}
                  />
                  <polygon
                    points={`${cx + cardW + arrowW - 5},${28 + cardH / 2 - 3} ${cx + cardW + arrowW - 1},${28 + cardH / 2} ${cx + cardW + arrowW - 5},${28 + cardH / 2 + 3}`}
                    fill="#ffffff30"
                  />
                </g>
              )}
            </g>
          );
        })}

        {/* Bottom hint */}
        <text
          x={svgW / 2}
          y={svgH - 6}
          fill="#666"
          fontSize="7"
          textAnchor="middle"
        >
          각 단계를 클릭하여 상세 일러스트와 설명을 확인하세요
        </text>
      </svg>

      {/* Info panel below */}
      {active && (
        <div
          className="max-w-2xl mx-auto mt-2 rounded-lg border p-3 transition-all duration-200"
          style={{
            borderColor: active.color + "40",
            backgroundColor: active.color + "08",
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold border"
              style={{
                borderColor: active.color,
                color: active.color,
                backgroundColor: active.color + "20",
              }}
            >
              {active.num}
            </span>
            <span className="text-sm font-medium" style={{ color: active.color }}>
              {active.title}
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-1.5 leading-relaxed">
            {active.detail}
          </p>
        </div>
      )}
    </figure>
  );
}
