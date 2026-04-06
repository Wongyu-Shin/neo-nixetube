"use client";

import { useState } from "react";

interface TreeNode {
  id: string;
  label: string;
  detail: string;
  color: string;
  children?: TreeNode[];
}

const TREE: TreeNode = {
  id: "root",
  label: "Week 2 결과",
  detail: "핵심 실험 A(부틸), B(프릿), C(플러싱)의 결과에 따라 경로 결정",
  color: "#D4A853",
  children: [
    {
      id: "ac-pass",
      label: "A(부틸)✓ + C(플러싱)✓",
      detail: "상온 봉착 + 가스 플러싱 모두 성공",
      color: "#6BA368",
      children: [
        { id: "ac-result", label: "상온 경로 우선 추진", detail: "Week 4에서 첫 점등 시도. 비용 ₩185K, 장비 불필요.", color: "#6BA368" },
      ],
    },
    {
      id: "a-pass-c-fail",
      label: "A(부틸)✓ + C(플러싱)✗",
      detail: "봉착 성공하지만 가스 치환 부족",
      color: "#D4A853",
      children: [
        { id: "hybrid", label: "하이브리드 경로", detail: "상온 봉착 + 전통 진공 충전. 장비 일부 필요.", color: "#D4A853" },
      ],
    },
    {
      id: "b-pass",
      label: "B(프릿)✓",
      detail: "프릿 실링 기밀 테스트 성공",
      color: "#7B9EB8",
      children: [
        { id: "frit-go", label: "프릿 경로 추진", detail: "Week 5-6에서 첫 점등. 비용 ₩1.2M, 전기로+펌프 필요.", color: "#7B9EB8" },
      ],
    },
    {
      id: "all-fail",
      label: "A, B 모두 ✗",
      detail: "자체 봉착 모두 실패",
      color: "#C17B5E",
      children: [
        { id: "collab", label: "네온사인 기술자 협업", detail: "을지로 기술자 네트워크 활용 또는 상용 기밀 헤더+에폭시 최소 경로", color: "#C17B5E" },
      ],
    },
    {
      id: "no-gas",
      label: "네온 가스 확보 ✗",
      detail: "네온 가스 공급처 확보 실패",
      color: "#B8A9C9",
      children: [
        { id: "argon", label: "아르곤 대체", detail: "색상 변경(보라색), 네온사인 업체 충전 서비스 재시도", color: "#B8A9C9" },
      ],
    },
  ],
};

function TreeNodeComponent({
  node,
  depth,
  expanded,
  onToggle,
  selected,
  onSelect,
}: {
  node: TreeNode;
  depth: number;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const isExpanded = expanded.has(node.id);
  const isSelected = selected === node.id;
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className={depth > 0 ? "ml-6 border-l border-white/[0.06] pl-4" : ""}>
      <button
        onClick={() => {
          if (hasChildren) onToggle(node.id);
          onSelect(node.id);
        }}
        className={`w-full text-left rounded-lg px-4 py-3 mb-2 border transition-all duration-200 ${
          isSelected
            ? "border-opacity-40 bg-opacity-10"
            : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
        }`}
        style={{
          borderColor: isSelected ? node.color + "60" : undefined,
          backgroundColor: isSelected ? node.color + "10" : undefined,
        }}
      >
        <div className="flex items-center gap-2">
          {hasChildren && (
            <span
              className="text-xs transition-transform duration-200"
              style={{ color: node.color, transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)", display: "inline-block" }}
            >
              ▶
            </span>
          )}
          {!hasChildren && (
            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: node.color }} />
          )}
          <span className="text-sm font-medium" style={{ color: isSelected ? node.color : "#e8e8e8" }}>
            {node.label}
          </span>
        </div>
        {isSelected && (
          <p className="text-xs text-stone-400 mt-1 ml-5">{node.detail}</p>
        )}
      </button>
      {hasChildren && isExpanded && (
        <div className="mt-1">
          {node.children!.map((child) => (
            <TreeNodeComponent
              key={child.id}
              node={child}
              depth={depth + 1}
              expanded={expanded}
              onToggle={onToggle}
              selected={selected}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function DecisionTree() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["root"]));
  const [selected, setSelected] = useState<string | null>("root");

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <figure className="my-8">
      <div className="max-w-xl mx-auto">
        <TreeNodeComponent
          node={TREE}
          depth={0}
          expanded={expanded}
          onToggle={toggleExpand}
          selected={selected}
          onSelect={setSelected}
        />
      </div>
      <figcaption className="text-center text-stone-500 text-xs mt-3">
        노드를 클릭하여 의사결정 분기를 탐색. ▶ 아이콘으로 하위 경로 펼치기/접기.
      </figcaption>
    </figure>
  );
}
