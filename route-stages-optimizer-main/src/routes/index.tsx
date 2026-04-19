import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_GRAPH,
  DEFAULT_STAGES,
  multistageShortestPath,
  type Graph,
} from "@/lib/multistage";
import { GraphCanvas } from "@/components/GraphCanvas";
import { EdgeEditor } from "@/components/EdgeEditor";
import { AlgorithmTrace } from "@/components/AlgorithmTrace";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Truck, Sparkles, Network, Target } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Delivery Route Optimizer — Multistage Graph DP" },
      {
        name: "description",
        content:
          "Interactive visualizer of the multistage graph dynamic programming algorithm for optimal delivery route planning across warehouses, distribution centers and hubs.",
      },
      { property: "og:title", content: "Delivery Route Optimizer — Multistage Graph" },
      {
        property: "og:description",
        content: "Build a delivery network and watch dynamic programming find the minimum-cost route stage by stage.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [graph, setGraph] = useState<Graph>(DEFAULT_GRAPH);
  const nodes = DEFAULT_STAGES;
  const result = useMemo(() => multistageShortestPath(graph), [graph]);

  const [playing, setPlaying] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const timer = useRef<number | null>(null);

  const animatedPath = result.path.slice(0, stepIndex + 1);
  const highlight = result.path[stepIndex] ?? null;

  useEffect(() => {
    if (!playing) return;
    timer.current = window.setTimeout(() => {
      setStepIndex((i) => {
        if (i >= result.path.length - 1) {
          setPlaying(false);
          return i;
        }
        return i + 1;
      });
    }, 750);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [playing, stepIndex, result.path.length]);

  const reset = () => {
    setPlaying(false);
    setStepIndex(0);
  };

  const reachable = Number.isFinite(result.totalCost);

  return (
    <div className="min-h-screen text-foreground" style={{ background: "var(--gradient-hero)" }}>
      {/* Header */}
      <header className="border-b border-border/60 backdrop-blur-sm bg-background/40 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
              <Truck className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight">RouteOptimal</h1>
              <p className="text-[11px] text-muted-foreground -mt-0.5">Multistage Graph · Dynamic Programming</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Time complexity: <span className="font-mono text-foreground">O(V + E)</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground mb-4">
          <Network className="w-3.5 h-3.5 text-primary" />
          Logistics & Supply Chain Optimization
        </div>
        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Find the <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-primary)" }}>cheapest delivery route</span>
        </h2>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          Edit the network of warehouses, distribution centers and hubs. Watch dynamic programming compute the
          minimum-cost path from source to customer — backward, stage by stage.
        </p>
      </section>

      {/* Result strip */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon={<Target className="w-4 h-4" />}
            label="Minimum cost"
            value={reachable ? String(result.totalCost) : "∞"}
            accent
          />
          <StatCard
            icon={<Network className="w-4 h-4" />}
            label="Optimal hops"
            value={reachable ? String(result.path.length - 1) : "—"}
          />
          <StatCard
            icon={<Truck className="w-4 h-4" />}
            label="Path"
            value={
              reachable
                ? result.path.map((id) => nodes.find((n) => n.id === id)?.label).join(" → ")
                : "Unreachable"
            }
            mono
          />
        </div>
      </section>

      {/* Main */}
      <section className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-4">
          <GraphCanvas graph={graph} nodes={nodes} path={animatedPath} highlightNode={highlight} />
          <div className="flex flex-wrap items-center gap-2 justify-center">
            <Button
              onClick={() => {
                if (stepIndex >= result.path.length - 1) setStepIndex(0);
                setPlaying((p) => !p);
              }}
              disabled={!reachable}
              className="gap-2"
            >
              {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {playing ? "Pause" : "Animate route"}
            </Button>
            <Button variant="secondary" onClick={reset} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
            <Button variant="ghost" onClick={() => setGraph(DEFAULT_GRAPH)}>
              Load sample graph
            </Button>
          </div>
        </div>

        <aside className="space-y-4">
          <EdgeEditor graph={graph} nodes={nodes} onChange={setGraph} />
        </aside>
      </section>

      {/* Trace + algorithm */}
      <section className="max-w-7xl mx-auto px-6 pb-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AlgorithmTrace graph={graph} nodes={nodes} cost={result.cost} next={result.next} />
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-secondary/40">
            <h3 className="text-sm font-semibold text-foreground">Algorithm</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Backward dynamic programming on a staged DAG</p>
          </div>
          <pre className="p-4 text-[12px] leading-relaxed font-mono text-foreground/90 overflow-auto">
{`cost[n-1] = 0
for i from n-2 down to 0:
    cost[i] = ∞
    for each edge (i, j):
        if weight(i,j) + cost[j] < cost[i]:
            cost[i]   = weight(i,j) + cost[j]
            next[i]   = j

# Reconstruct path
i = 0
path = [0]
while i != n-1:
    i = next[i]
    path.append(i)`}
          </pre>
          <div className="px-4 pb-4 grid grid-cols-2 gap-3 text-xs">
            <Fact title="Why DP?" body="Overlapping subproblems: each node's optimal cost reuses solutions of later stages." />
            <Fact title="Why staged?" body="Edges only go forward between stages — guarantees a DAG and linear-time solution." />
            <Fact title="vs Dijkstra" body="Dijkstra is general-purpose O((V+E) log V). Multistage DP exploits structure for O(V+E)." />
            <Fact title="Use cases" body="Courier routing, supply chains, project scheduling, network packet paths." />
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        Built with the multistage graph algorithm · Dynamic programming demo
      </footer>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
  mono,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
  mono?: boolean;
}) {
  return (
    <div
      className={
        "rounded-xl border p-4 " +
        (accent
          ? "border-primary/40 bg-card shadow-[var(--shadow-glow)]"
          : "border-border bg-card")
      }
    >
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className={accent ? "text-primary" : ""}>{icon}</span>
        {label}
      </div>
      <div
        className={
          "mt-2 text-2xl font-bold tracking-tight " +
          (accent ? "text-primary " : "text-foreground ") +
          (mono ? "font-mono text-base" : "")
        }
      >
        {value}
      </div>
    </div>
  );
}

function Fact({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/30 p-3">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-primary">{title}</div>
      <div className="mt-1 text-xs text-muted-foreground leading-relaxed">{body}</div>
    </div>
  );
}
