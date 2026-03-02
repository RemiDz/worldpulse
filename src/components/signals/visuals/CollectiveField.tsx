"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

const SEVERITY_COLORS: Record<string, string> = {
  calm: "#4ECDC4",
  mild: "#7ED88C",
  moderate: "#FFD93D",
  intense: "#FF8C42",
  extreme: "#FF6B6B",
};

interface CollectiveFieldProps {
  value: number;
  severity: string;
  isActive: boolean;
  kpPercentage: number;
  solarPercentage: number;
  schumannPercentage: number;
}

interface Node {
  id: number;
  x: number;
  y: number;
  r: number;
}

export default function CollectiveField({
  severity,
  isActive,
  kpPercentage,
  solarPercentage,
  schumannPercentage,
}: CollectiveFieldProps) {
  const color = SEVERITY_COLORS[severity] ?? "#4ECDC4";
  const severityNum = ["calm", "mild", "moderate", "intense", "extreme"].indexOf(severity);

  // Generate nodes deterministically
  const nodes: Node[] = useMemo(() => {
    const count = 15 + severityNum * 3;
    const seed = [
      0.12, 0.87, 0.34, 0.65, 0.23, 0.78, 0.45, 0.91, 0.56, 0.03,
      0.67, 0.38, 0.82, 0.19, 0.53, 0.71, 0.29, 0.94, 0.41, 0.16,
      0.88, 0.62, 0.07, 0.73, 0.48,
    ];
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: 20 + (seed[i % seed.length]) * 260,
      y: 10 + (seed[(i + 7) % seed.length]) * 75,
      r: 2 + (seed[(i + 3) % seed.length]) * (1 + severityNum),
    }));
  }, [severityNum]);

  // Generate connections (each node connects to 2-3 nearest)
  const connections = useMemo(() => {
    const conns: { from: number; to: number; dist: number }[] = [];
    for (let i = 0; i < nodes.length; i++) {
      const distances = nodes
        .map((n, j) => ({
          j,
          dist: Math.hypot(n.x - nodes[i].x, n.y - nodes[i].y),
        }))
        .filter((d) => d.j !== i)
        .sort((a, b) => a.dist - b.dist);

      const connectCount = severityNum >= 3 ? 3 : 2;
      for (let k = 0; k < Math.min(connectCount, distances.length); k++) {
        const pair = [i, distances[k].j].sort();
        if (!conns.some((c) => c.from === pair[0] && c.to === pair[1])) {
          conns.push({ from: pair[0], to: pair[1], dist: distances[k].dist });
        }
      }
    }
    return conns;
  }, [nodes, severityNum]);

  const connectionOpacity = 0.06 + severityNum * 0.06;
  const connectionWidth = 0.5 + severityNum * 0.3;
  const pulseDuration = Math.max(2, 6 - severityNum);

  const factors = [
    { label: "Geomagnetic", value: kpPercentage },
    { label: "Solar Wind", value: solarPercentage },
    { label: "Schumann", value: schumannPercentage },
  ];

  return (
    <motion.div
      className="relative w-full overflow-hidden rounded-xl"
      style={{
        height: 160,
        background: "rgba(255,255,255,0.015)",
        border: "1px solid var(--border-subtle)",
      }}
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      aria-label={`Collective energy field, severity ${severity}`}
    >
      {/* Node network */}
      <svg
        viewBox="0 0 300 95"
        className="absolute left-0 top-0 w-full"
        style={{ height: 95 }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="node-glow">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>

        {/* Connections */}
        {connections.map((c, i) => {
          const a = nodes[c.from];
          const b = nodes[c.to];
          return (
            <line
              key={`c-${i}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={color}
              strokeWidth={connectionWidth}
              opacity={connectionOpacity}
              style={
                isActive
                  ? {
                      animation: `conn-pulse ${pulseDuration + (i % 3)}s ease-in-out infinite`,
                      animationDelay: `${(i * 0.3) % pulseDuration}s`,
                    }
                  : undefined
              }
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => (
          <g key={node.id}>
            {/* Glow */}
            <circle
              cx={node.x}
              cy={node.y}
              r={node.r + 2}
              fill={color}
              opacity={0.1}
              filter="url(#node-glow)"
            />
            {/* Node */}
            <circle
              cx={node.x}
              cy={node.y}
              r={node.r}
              fill={color}
              opacity={0.3 + severityNum * 0.1}
              style={
                isActive
                  ? {
                      animation: `node-breathe ${pulseDuration + (node.id % 2)}s ease-in-out infinite`,
                      animationDelay: `${(node.id * 0.2) % 3}s`,
                    }
                  : undefined
              }
            />
          </g>
        ))}
      </svg>

      {/* Contributing factors */}
      <div className="absolute bottom-2.5 left-3 right-3" style={{ zIndex: 2 }}>
        <div className="space-y-1.5">
          {factors.map((f) => (
            <div key={f.label} className="flex items-center gap-2">
              <span
                className="w-[72px] text-right text-[9px]"
                style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-dm-sans)" }}
              >
                {f.label}
              </span>
              <div className="relative h-[4px] flex-1 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                <motion.div
                  className="absolute left-0 top-0 h-full rounded-full"
                  style={{ backgroundColor: color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${f.value}%` }}
                  transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                />
                {/* Dividers at 25/50/75 */}
                {[25, 50, 75].map((pos) => (
                  <div
                    key={pos}
                    className="absolute top-0 h-full"
                    style={{
                      left: `${pos}%`,
                      width: 1,
                      background: "var(--bg-primary)",
                      zIndex: 1,
                    }}
                  />
                ))}
              </div>
              <span
                className="w-[28px] text-right text-[9px] tabular-nums"
                style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-jetbrains)" }}
              >
                {Math.round(f.value)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes conn-pulse {
          0%, 100% { opacity: ${connectionOpacity}; }
          50% { opacity: ${connectionOpacity + 0.15}; }
        }
        @keyframes node-breathe {
          0%, 100% { transform: scale(1); opacity: ${0.3 + severityNum * 0.1}; }
          50% { transform: scale(${1.1 + severityNum * 0.1}); opacity: ${0.5 + severityNum * 0.1}; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; }
        }
      `}</style>
    </motion.div>
  );
}
