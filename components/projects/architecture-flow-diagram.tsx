"use client";

import type { ArchitectureFlow } from "@/types/project";

interface ArchitectureFlowDiagramProps {
  flow: ArchitectureFlow;
}

export function ArchitectureFlowDiagram({ flow }: ArchitectureFlowDiagramProps) {
  if (flow.nodes.length === 0) {
    return null;
  }

  const nodeMap = new Map(flow.nodes.map((node) => [node.id, node]));
  const orderedIds = topologicalOrder(flow);

  return (
    <div className="architecture-flow">
      <div className="architecture-flow-track">
        {orderedIds.map((id, index) => {
          const node = nodeMap.get(id);
          if (!node) {
            return null;
          }

          const outgoing = flow.edges.filter((edge) => edge.from === id);

          return (
            <div key={id} className="architecture-flow-step">
              <div className="architecture-node">
                <span className="architecture-node-index">{index + 1}</span>
                <div>
                  <p className="architecture-node-label">{node.label}</p>
                  <p className="architecture-node-desc">{node.description}</p>
                </div>
              </div>
              {index < orderedIds.length - 1 ? (
                <div className="architecture-connector" aria-hidden>
                  <span className="architecture-connector-line" />
                  <span className="architecture-connector-arrow">→</span>
                  {outgoing[0]?.label ? (
                    <span className="architecture-connector-label">
                      {outgoing[0].label}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Order nodes by edge direction; fall back to original order. */
function topologicalOrder(flow: ArchitectureFlow): string[] {
  const ids = flow.nodes.map((n) => n.id);
  const inDegree = new Map(ids.map((id) => [id, 0]));
  const adjacency = new Map(ids.map((id) => [id, [] as string[]]));

  for (const edge of flow.edges) {
    if (!inDegree.has(edge.to) || !adjacency.has(edge.from)) {
      continue;
    }
    inDegree.set(edge.to, (inDegree.get(edge.to) ?? 0) + 1);
    adjacency.get(edge.from)!.push(edge.to);
  }

  const queue = ids.filter((id) => (inDegree.get(id) ?? 0) === 0);
  const ordered: string[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    ordered.push(current);
    for (const next of adjacency.get(current) ?? []) {
      const degree = (inDegree.get(next) ?? 1) - 1;
      inDegree.set(next, degree);
      if (degree === 0) {
        queue.push(next);
      }
    }
  }

  return ordered.length === ids.length ? ordered : ids;
}
