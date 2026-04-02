import { Background, Controls, ReactFlow, type Edge, type Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const nodes: Node[] = [
  {
    id: "source",
    position: { x: 20, y: 80 },
    data: { label: "Target Source" },
    type: "input"
  },
  {
    id: "template",
    position: { x: 250, y: 80 },
    data: { label: "Template + Spintax" }
  },
  {
    id: "send",
    position: { x: 500, y: 80 },
    data: { label: "Warmup + DM + Follow-up" },
    type: "output"
  }
];

const edges: Edge[] = [
  { id: "e1-2", source: "source", target: "template", label: "deterministic order" },
  { id: "e2-3", source: "template", target: "send", label: "branch + pacing" }
];

export function CampaignFlow() {
  return (
    <div style={{ height: 220, border: "1px solid #ddd", borderRadius: 8 }}>
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
