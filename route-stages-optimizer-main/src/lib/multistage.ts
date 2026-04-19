export type Graph = number[][]; // 0 means no edge

export interface MultistageResult {
  cost: number[];
  next: number[];
  path: number[];
  totalCost: number;
}

export const INF = Number.POSITIVE_INFINITY;

export function multistageShortestPath(graph: Graph): MultistageResult {
  const n = graph.length;
  const cost = new Array(n).fill(0);
  const next = new Array(n).fill(-1);

  cost[n - 1] = 0;

  for (let i = n - 2; i >= 0; i--) {
    cost[i] = INF;
    for (let j = i + 1; j < n; j++) {
      const w = graph[i][j];
      if (w && w > 0 && cost[j] !== INF) {
        if (w + cost[j] < cost[i]) {
          cost[i] = w + cost[j];
          next[i] = j;
        }
      }
    }
  }

  const path: number[] = [];
  let cur = 0;
  if (cost[0] !== INF) {
    path.push(0);
    while (cur !== n - 1 && next[cur] !== -1) {
      cur = next[cur];
      path.push(cur);
    }
  }

  return { cost, next, path, totalCost: cost[0] };
}

export interface NodeMeta {
  id: number;
  label: string;
  stage: number;
  stageName: string;
}

export const STAGE_NAMES = [
  "Warehouse",
  "Distribution Center",
  "Local Hub",
  "Customer",
];

// Default sample graph from the spec
export const DEFAULT_GRAPH: Graph = [
  [0, 2, 1, 3, 0, 0, 0, 0],
  [0, 0, 0, 0, 2, 3, 0, 0],
  [0, 0, 0, 0, 6, 7, 0, 0],
  [0, 0, 0, 0, 6, 8, 9, 0],
  [0, 0, 0, 0, 0, 0, 0, 6],
  [0, 0, 0, 0, 0, 0, 0, 4],
  [0, 0, 0, 0, 0, 0, 0, 5],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

// Stage assignment for the 8-node default graph
export const DEFAULT_STAGES: NodeMeta[] = [
  { id: 0, label: "W", stage: 0, stageName: "Warehouse" },
  { id: 1, label: "D1", stage: 1, stageName: "Distribution Center" },
  { id: 2, label: "D2", stage: 1, stageName: "Distribution Center" },
  { id: 3, label: "D3", stage: 1, stageName: "Distribution Center" },
  { id: 4, label: "H1", stage: 2, stageName: "Local Hub" },
  { id: 5, label: "H2", stage: 2, stageName: "Local Hub" },
  { id: 6, label: "H3", stage: 2, stageName: "Local Hub" },
  { id: 7, label: "C", stage: 3, stageName: "Customer" },
];
