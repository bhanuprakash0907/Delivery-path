import { useState } from "react";
import type { Graph, NodeMeta } from "@/lib/multistage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";

interface Props {
  graph: Graph;
  nodes: NodeMeta[];
  onChange: (g: Graph) => void;
}

export function EdgeEditor({ graph, nodes, onChange }: Props) {
  const [from, setFrom] = useState<number>(0);
  const [to, setTo] = useState<number>(1);
  const [weight, setWeight] = useState<string>("5");

  const edges: { from: number; to: number; w: number }[] = [];
  for (let i = 0; i < graph.length; i++) {
    for (let j = 0; j < graph.length; j++) {
      if (graph[i][j] && graph[i][j] > 0) edges.push({ from: i, to: j, w: graph[i][j] });
    }
  }

  const labelOf = (id: number) => nodes.find((n) => n.id === id)?.label ?? id;

  const addEdge = () => {
    const w = Number(weight);
    if (!w || w <= 0 || from === to) return;
    const fromStage = nodes[from].stage;
    const toStage = nodes[to].stage;
    if (toStage <= fromStage) return;
    const next = graph.map((row) => [...row]);
    next[from][to] = w;
    onChange(next);
  };

  const removeEdge = (i: number, j: number) => {
    const next = graph.map((row) => [...row]);
    next[i][j] = 0;
    onChange(next);
  };

  const updateWeight = (i: number, j: number, w: number) => {
    if (w <= 0) return;
    const next = graph.map((row) => [...row]);
    next[i][j] = w;
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <h4 className="text-sm font-semibold mb-3 text-foreground">Add a route</h4>
        <div className="grid grid-cols-[1fr_1fr_90px_auto] gap-2 items-end">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">From</label>
            <select
              value={from}
              onChange={(e) => setFrom(Number(e.target.value))}
              className="w-full h-9 rounded-md bg-input border border-border px-2 text-sm text-foreground"
            >
              {nodes.slice(0, -1).map((n) => (
                <option key={n.id} value={n.id}>
                  {n.label} ({n.stageName})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">To</label>
            <select
              value={to}
              onChange={(e) => setTo(Number(e.target.value))}
              className="w-full h-9 rounded-md bg-input border border-border px-2 text-sm text-foreground"
            >
              {nodes
                .filter((n) => n.stage > nodes[from].stage)
                .map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.label} ({n.stageName})
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Cost</label>
            <Input value={weight} onChange={(e) => setWeight(e.target.value)} type="number" min={1} className="h-9" />
          </div>
          <Button onClick={addEdge} size="sm" className="h-9">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-2 border-b border-border bg-secondary/40">
          <h4 className="text-sm font-semibold text-foreground">
            Active routes <span className="text-muted-foreground font-normal">({edges.length})</span>
          </h4>
        </div>
        <div className="max-h-72 overflow-auto divide-y divide-border">
          {edges.map(({ from: i, to: j, w }) => (
            <div key={`${i}-${j}`} className="flex items-center justify-between px-4 py-2 hover:bg-secondary/30">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-mono font-semibold text-primary">{labelOf(i)}</span>
                <span className="text-muted-foreground">→</span>
                <span className="font-mono font-semibold text-primary">{labelOf(j)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  value={w}
                  onChange={(e) => updateWeight(i, j, Number(e.target.value))}
                  className="h-7 w-16 text-xs"
                />
                <Button size="sm" variant="ghost" onClick={() => removeEdge(i, j)} className="h-7 w-7 p-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
          {edges.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">No routes yet — add one above.</div>
          )}
        </div>
      </div>
    </div>
  );
}
