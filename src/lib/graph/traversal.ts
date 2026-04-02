import type { WorkflowEdge, WorkflowNode } from "../../types/entities";

export function deterministicTraversal(nodes: WorkflowNode[], edges: WorkflowEdge[]): WorkflowNode[] {
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const incoming = new Map<string, number>();
  const outgoing = new Map<string, WorkflowEdge[]>();

  for (const node of nodes) {
    incoming.set(node.id, 0);
    outgoing.set(node.id, []);
  }

  for (const edge of edges) {
    incoming.set(edge.toNodeId, (incoming.get(edge.toNodeId) ?? 0) + 1);
    outgoing.get(edge.fromNodeId)?.push(edge);
  }

  for (const edgeList of outgoing.values()) {
    edgeList.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return a.branchKey.localeCompare(b.branchKey);
    });
  }

  const queue = [...incoming.entries()]
    .filter(([, count]) => count === 0)
    .map(([id]) => id)
    .sort();

  const ordered: WorkflowNode[] = [];
  while (queue.length > 0) {
    const nextId = queue.shift();
    if (!nextId) {
      break;
    }
    const nextNode = nodeById.get(nextId);
    if (nextNode) {
      ordered.push(nextNode);
    }
    for (const edge of outgoing.get(nextId) ?? []) {
      const count = (incoming.get(edge.toNodeId) ?? 0) - 1;
      incoming.set(edge.toNodeId, count);
      if (count === 0) {
        queue.push(edge.toNodeId);
        queue.sort();
      }
    }
  }
  return ordered;
}
