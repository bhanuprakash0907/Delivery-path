import { useMemo } from "react";
import type { Graph, NodeMeta } from "@/lib/multistage";

interface Props {
  graph: Graph;
  nodes: NodeMeta[];
  path: number[];
  highlightNode?: number | null;
}

const STAGE_ICONS: Record<string, string> = {
  Warehouse: "🏭",
  "Distribution Center": "🏢",
  "Local Hub": "🏬",
  Customer: "🏠",
};

export function GraphCanvas({ graph, nodes, path, highlightNode }: Props) {
  const width = 880;
  const height = 460;
  const padX = 80;
  const padY = 60;

  const stages = useMemo(() => {
    const max = Math.max(...nodes.map((n) => n.stage));
    return max + 1;
  }, [nodes]);

  const positions = useMemo(() => {
    const byStage: Record<number, NodeMeta[]> = {};
    nodes.forEach((n) => {
      (byStage[n.stage] ||= []).push(n);
    });
    const map = new Map<number, { x: number; y: number }>();
    Object.entries(byStage).forEach(([s, list]) => {
      const stage = Number(s);
      const x = padX + (stage * (width - 2 * padX)) / Math.max(1, stages - 1);
      list.forEach((node, i) => {
        const y =
          list.length === 1
            ? height / 2
            : padY + (i * (height - 2 * padY)) / (list.length - 1);
        map.set(node.id, { x, y });
      });
    });
    return map;
  }, [nodes, stages]);

  const pathEdges = useMemo(() => {
    const set = new Set<string>();
    for (let i = 0; i < path.length - 1; i++) {
      set.add(`${path[i]}-${path[i + 1]}`);
    }
    return set;
  }, [path]);

  const edges: { from: number; to: number; w: number }[] = [];
  for (let i = 0; i < graph.length; i++) {
    for (let j = 0; j < graph.length; j++) {
      if (graph[i][j] && graph[i][j] > 0) edges.push({ from: i, to: j, w: graph[i][j] });
    }
  }

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-elegant)]">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "var(--gradient-glow)" }} />
      <svg viewBox={`0 0 ${width} ${height}`} className="relative w-full h-auto">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" className="text-muted-foreground" />
          </marker>
          <marker id="arrow-active" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" className="text-primary" />
          </marker>
        </defs>

        {/* stage labels */}
        {Array.from({ length: stages }).map((_, s) => {
          const x = padX + (s * (width - 2 * padX)) / Math.max(1, stages - 1);
          const stageName = nodes.find((n) => n.stage === s)?.stageName ?? `Stage ${s + 1}`;
          return (
            <g key={s}>
              <text x={x} y={24} textAnchor="middle" className="fill-muted-foreground text-[12px] font-medium">
                Stage {s + 1}
              </text>
              <text x={x} y={42} textAnchor="middle" className="fill-foreground text-[13px] font-semibold">
                {stageName}
              </text>
            </g>
          );
        })}

        {/* edges */}
        {edges.map(({ from, to, w }, idx) => {
          const a = positions.get(from);
          const b = positions.get(to);
          if (!a || !b) return null;
          const active = pathEdges.has(`${from}-${to}`);
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const len = Math.hypot(dx, dy);
          const ox = (dx / len) * 28;
          const oy = (dy / len) * 28;
          const x1 = a.x + ox;
          const y1 = a.y + oy;
          const x2 = b.x - ox;
          const y2 = b.y - oy;
          const mx = (x1 + x2) / 2;
          const my = (y1 + y2) / 2;
          return (
            <g key={idx} className={active ? "text-primary" : "text-muted-foreground"}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                strokeWidth={active ? 3 : 1.5}
                opacity={active ? 1 : 0.45}
                markerEnd={active ? "url(#arrow-active)" : "url(#arrow)"}
                strokeDasharray={active ? undefined : "4 4"}
              />
              <g>
                <rect
                  x={mx - 12}
                  y={my - 11}
                  width={24}
                  height={18}
                  rx={6}
                  className={active ? "fill-primary" : "fill-secondary"}
                  opacity={active ? 1 : 0.9}
                />
                <text
                  x={mx}
                  y={my + 3}
                  textAnchor="middle"
                  className={active ? "fill-primary-foreground text-[11px] font-bold" : "fill-foreground text-[11px] font-semibold"}
                >
                  {w}
                </text>
              </g>
            </g>
          );
        })}

        {/* nodes */}
        {nodes.map((n) => {
          const p = positions.get(n.id);
          if (!p) return null;
          const onPath = path.includes(n.id);
          const isHi = highlightNode === n.id;
          const r = 26;
          return (
            <g key={n.id}>
              {(onPath || isHi) && (
                <circle cx={p.x} cy={p.y} r={r + 8} className="fill-primary" opacity={isHi ? 0.4 : 0.18}>
                  {isHi && <animate attributeName="r" values={`${r + 4};${r + 12};${r + 4}`} dur="1.4s" repeatCount="indefinite" />}
                </circle>
              )}
              <circle
                cx={p.x}
                cy={p.y}
                r={r}
                className={onPath ? "fill-primary stroke-primary-glow" : "fill-card stroke-border"}
                strokeWidth={2}
              />
              <text
                x={p.x}
                y={p.y + 5}
                textAnchor="middle"
                className={onPath ? "fill-primary-foreground text-[14px] font-bold" : "fill-foreground text-[14px] font-bold"}
              >
                {n.label}
              </text>
              <text x={p.x} y={p.y + r + 18} textAnchor="middle" className="fill-muted-foreground text-[11px]">
                {STAGE_ICONS[n.stageName] ?? ""}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
