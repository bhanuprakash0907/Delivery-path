/// <reference types="react" />
import type { Graph, NodeMeta } from "@/lib/multistage";

interface Props {
  graph: Graph;
  nodes: NodeMeta[];
  cost: number[];
  next: number[];
}

export function AlgorithmTrace({ graph, nodes, cost, next }: Props) {
  const n = graph.length;
  const labelOf = (id: number) => nodes.find((nd) => nd.id === id)?.label ?? id;

  const steps: { node: number; choices: { j: number; w: number; total: number }[]; chosen: number; cost: number }[] = [];
  for (let i = n - 2; i >= 0; i--) {
    const choices: { j: number; w: number; total: number }[] = [];
    for (let j = i + 1; j < n; j++) {
      if (graph[i][j] && graph[i][j] > 0 && Number.isFinite(cost[j])) {
        choices.push({ j, w: graph[i][j], total: graph[i][j] + cost[j] });
      }
    }
    steps.push({ node: i, choices, chosen: next[i], cost: cost[i] });
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-secondary/40">
        <h3 className="text-sm font-semibold text-foreground">Dynamic programming trace</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Computed backward from destination</p>
      </div>
      <div className="divide-y divide-border max-h-[420px] overflow-auto">
        {steps.map((s) => (
          <div key={s.node} className="px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {labelOf(s.node)}
                </span>
                <span className="text-sm text-foreground font-medium">cost = </span>
                <span className="font-mono text-primary font-bold">
                  {Number.isFinite(s.cost) ? s.cost : "∞"}
                </span>
              </div>
              {s.chosen >= 0 && (
                <span className="text-xs text-muted-foreground">
                  next → <span className="font-mono font-semibold text-accent">{labelOf(s.chosen)}</span>
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {s.choices.length === 0 && <span className="text-xs text-muted-foreground italic">no outgoing edges</span>}
              {s.choices.map((c) => {
                const active = c.j === s.chosen;
                return (
                  <span
                    key={c.j}
                    className={
                      active
                        ? "inline-flex items-center gap-1 rounded-md bg-primary/15 border border-primary/40 px-2 py-1 text-[11px] font-mono text-primary"
                        : "inline-flex items-center gap-1 rounded-md bg-secondary/60 border border-border px-2 py-1 text-[11px] font-mono text-muted-foreground"
                    }
                  >
                    {c.w} + cost({labelOf(c.j)})={c.total}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
