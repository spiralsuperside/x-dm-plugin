import type { WorkflowEdge } from "../../types/entities";

export interface BranchPath {
  branchKey: string;
  nodePath: string[];
}

export function deriveBranchPaths(edges: WorkflowEdge[], rootNodeId: string): BranchPath[] {
  const map = new Map<string, WorkflowEdge[]>();
  for (const edge of edges) {
    const list = map.get(edge.fromNodeId) ?? [];
    list.push(edge);
    map.set(edge.fromNodeId, list);
  }
  for (const list of map.values()) {
    list.sort((a, b) => a.priority - b.priority || a.branchKey.localeCompare(b.branchKey));
  }

  const paths: BranchPath[] = [];
  const walk = (nodeId: string, branchKey: string, path: string[]) => {
    const next = map.get(nodeId) ?? [];
    if (next.length === 0) {
      paths.push({
        branchKey: branchKey || "default",
        nodePath: [...path, nodeId]
      });
      return;
    }
    for (const edge of next) {
      walk(edge.toNodeId, edge.branchKey || branchKey, [...path, nodeId]);
    }
  };
  walk(rootNodeId, "default", []);
  return paths;
}
