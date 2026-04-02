import type { WorkflowEdge, WorkflowNode } from "../../types/entities";
import { deterministicTraversal } from "./traversal";

export interface CampaignGraph {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export function validateAcyclicGraph(graph: CampaignGraph): { ok: boolean; reason?: string } {
  const ordered = deterministicTraversal(graph.nodes, graph.edges);
  if (ordered.length !== graph.nodes.length) {
    return { ok: false, reason: "Cycle detected in workflow graph." };
  }
  return { ok: true };
}
