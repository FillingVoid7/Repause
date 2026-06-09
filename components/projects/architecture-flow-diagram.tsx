"use client";

import React, { useEffect, useRef, useState } from "react";
import type { ArchitectureFlow } from "@/types/project";

interface ArchitectureFlowDiagramProps {
  flow: ArchitectureFlow;
}

type EdgePath = {
  id: string;
  d: string;
  label?: string;
};

export function ArchitectureFlowDiagram({ flow }: ArchitectureFlowDiagramProps) {
  if (flow.nodes.length === 0) return null;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [paths, setPaths] = useState<EdgePath[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const orderedIds = topologicalOrder(flow);

  useEffect(() => {
    function updatePaths() {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const newPaths: EdgePath[] = [];

      for (const edge of flow.edges) {
        const fromEl = nodeRefs.current[edge.from];
        const toEl = nodeRefs.current[edge.to];
        if (!fromEl || !toEl) continue;

        const f = fromEl.getBoundingClientRect();
        const t = toEl.getBoundingClientRect();

        const startX = f.right - rect.left - 8;
        const startY = f.top + f.height / 2 - rect.top;
        const endX = t.left - rect.left + 8;
        const endY = t.top + t.height / 2 - rect.top;

        // Smooth cubic bezier curve
        const dx = Math.max(40, Math.abs(endX - startX) / 2);
        const d = `M ${startX} ${startY} C ${startX + dx} ${startY} ${endX - dx} ${endY} ${endX} ${endY}`;

        newPaths.push({ id: `${edge.from}->${edge.to}`, d, label: edge.label });
      }

      setPaths(newPaths);
    }

    function updateScrollState() {
      const el = scrollRef.current;
      if (!el) {
        setCanScrollLeft(false);
        setCanScrollRight(false);
        return;
      }
      setCanScrollLeft(el.scrollLeft > 8);
      setCanScrollRight(el.scrollLeft + el.clientWidth + 8 < el.scrollWidth);
    }

    updatePaths();
    updateScrollState();
    const ro = new ResizeObserver(() => updatePaths());
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", () => {
      updatePaths();
      updateScrollState();
    });
    if (scrollRef.current) scrollRef.current.addEventListener("scroll", updateScrollState);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", () => {
        updatePaths();
        updateScrollState();
      });
      if (scrollRef.current) scrollRef.current.removeEventListener("scroll", updateScrollState);
    };
  }, [flow]);

  return (
    <div ref={containerRef} className="architecture-flow relative">
      <svg className="architecture-svg absolute inset-0 -z-10 w-full h-full" aria-hidden>
        <defs>
          <linearGradient id="arch-grad" x1="0" x2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="var(--accent-hover)" stopOpacity="0.9" />
          </linearGradient>
          <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 L2,4 z" fill="url(#arch-grad)" />
          </marker>
        </defs>

        {paths.map((p) => (
          <path
            key={p.id}
            d={p.d}
            fill="none"
            stroke="url(#arch-grad)"
            strokeWidth={2.5}
            strokeLinecap="round"
            markerEnd="url(#arrowhead)"
            className="architecture-path"
          />
        ))}
      </svg>

      <div ref={scrollRef} className="architecture-scroll">
        <div className="architecture-flow-track">
          {orderedIds.map((id, idx) => {
          const node = flow.nodes.find((n) => n.id === id);
          if (!node) return null;

          return (
            <div
              key={id}
              ref={(el) => {
                nodeRefs.current[id] = el || null;
              }}
              className="arch-card group"
              style={{ order: idx }}
            >
              <div className="arch-card-inner">
                <div className="arch-icon" aria-hidden>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="rgba(255,255,255,0.06)" />
                    <path d="M7 12h10M12 7v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="arch-body">
                  <div className="arch-title">{node.label}</div>
                  <div className="arch-desc">{node.description}</div>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>

      {/* Scroll controls */}
      <button
        type="button"
        aria-label="Scroll left"
        className={`arch-scroll-btn arch-scroll-left ${canScrollLeft ? "visible" : "invisible"}`}
        onClick={() => {
          const el = scrollRef.current;
          if (!el) return;
          const delta = Math.floor(el.clientWidth * 0.8);
          el.scrollBy({ left: -delta, behavior: "smooth" });
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <button
        type="button"
        aria-label="Scroll right"
        className={`arch-scroll-btn arch-scroll-right ${canScrollRight ? "visible" : "invisible"}`}
        onClick={() => {
          const el = scrollRef.current;
          if (!el) return;
          const delta = Math.floor(el.clientWidth * 0.8);
          el.scrollBy({ left: delta, behavior: "smooth" });
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

/** Order nodes by edge direction; fall back to original order. */
function topologicalOrder(flow: ArchitectureFlow): string[] {
  const ids = flow.nodes.map((n) => n.id);
  const inDegree = new Map(ids.map((id) => [id, 0]));
  const adjacency = new Map(ids.map((id) => [id, [] as string[]]));

  for (const edge of flow.edges) {
    if (!inDegree.has(edge.to) || !adjacency.has(edge.from)) continue;
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
      if (degree === 0) queue.push(next);
    }
  }

  return ordered.length === ids.length ? ordered : ids;
}
