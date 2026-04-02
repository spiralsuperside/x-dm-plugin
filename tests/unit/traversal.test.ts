import { describe, expect, it } from "vitest";
import { deterministicTraversal } from "../../src/lib/graph/traversal";
import type { WorkflowEdge, WorkflowNode } from "../../src/types/entities";

function node(id: string): WorkflowNode {
  const now = new Date().toISOString();
  return {
    id,
    campaignId: "c1",
    kind: "target_source",
    config: {},
    schemaVersion: 1,
    createdAt: now,
    updatedAt: now
  };
}

function edge(id: string, from: string, to: string, priority: number, branchKey: string): WorkflowEdge {
  const now = new Date().toISOString();
  return {
    id,
    campaignId: "c1",
    fromNodeId: from,
    toNodeId: to,
    priority,
    branchKey,
    schemaVersion: 1,
    createdAt: now,
    updatedAt: now
  };
}

describe("deterministicTraversal", () => {
  it("returns stable order", () => {
    const nodes = [node("A"), node("B"), node("C"), node("D")];
    const edges = [edge("e1", "A", "C", 2, "b"), edge("e2", "A", "B", 1, "a"), edge("e3", "B", "D", 1, "a")];
    const first = deterministicTraversal(nodes, edges).map((n) => n.id);
    const second = deterministicTraversal(nodes, edges).map((n) => n.id);
    expect(first).toEqual(second);
    expect(first[0]).toBe("A");
  });
});
