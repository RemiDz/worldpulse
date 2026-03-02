"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { SeverityLevel } from "@/types";

const ZONE_COLORS = [
  "rgba(78, 205, 196, 0.10)",  // calm teal
  "rgba(255, 217, 61, 0.10)",  // moderate amber
  "rgba(255, 140, 66, 0.10)",  // intense orange
  "rgba(255, 107, 107, 0.10)", // extreme coral
];

const SEVERITY_GRADIENTS: Record<SeverityLevel, string> = {
  calm: "linear-gradient(90deg, #4ECDC4, #4ECDC4)",
  mild: "linear-gradient(90deg, #4ECDC4, #7ED88C)",
  moderate: "linear-gradient(90deg, #4ECDC4, #FFD93D)",
  intense: "linear-gradient(90deg, #FFD93D, #FF8C42)",
  extreme: "linear-gradient(90deg, #FF8C42, #FF6B6B)",
};

const SEVERITY_COLORS: Record<SeverityLevel, string> = {
  calm: "#4ECDC4",
  mild: "#7ED88C",
  moderate: "#FFD93D",
  intense: "#FF8C42",
  extreme: "#FF6B6B",
};

interface IntensityBarProps {
  percentage: number;
  severity: SeverityLevel;
  variant?: "hero" | "signal";
  showLabels?: boolean;
  showNeedle?: boolean;
  showPercentage?: boolean;
  animated?: boolean;
}

export default function IntensityBar({
  percentage,
  severity,
  variant = "signal",
  showLabels = false,
  showNeedle = false,
  showPercentage = true,
  animated = true,
}: IntensityBarProps) {
  const reduced = useReducedMotion();
  const isHero = variant === "hero";
  const barHeight = isHero ? 14 : 8;
  const clamped = Math.max(0, Math.min(100, percentage));
  const shouldAnimate = animated && !reduced;

  return (
    <div className="w-full">
      <div className="flex items-center gap-3">
        {/* Bar container */}
        <div className="relative flex-1" style={{ height: barHeight, borderRadius: barHeight / 2 }}>
          {/* Zone background segments */}
          <div className="absolute inset-0 flex overflow-hidden" style={{ borderRadius: barHeight / 2 }}>
            {ZONE_COLORS.map((color, i) => (
              <div key={i} className="flex-1" style={{ background: color }} />
            ))}
          </div>

          {/* Gradient fill overlay */}
          <motion.div
            className="absolute inset-y-0 left-0"
            style={{
              background: SEVERITY_GRADIENTS[severity],
              borderRadius: barHeight / 2,
              boxShadow: isHero ? `0 0 12px ${SEVERITY_COLORS[severity]}40` : undefined,
            }}
            initial={shouldAnimate ? { width: "0%" } : { width: `${clamped}%` }}
            animate={{ width: `${clamped}%` }}
            transition={
              shouldAnimate
                ? { duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.4 }
                : { duration: 0 }
            }
          />

          {/* Solid divider cuts at 25%, 50%, 75% — highest z-index */}
          {[25, 50, 75].map((pos) => (
            <div
              key={pos}
              className="absolute inset-y-0"
              style={{
                left: `${pos}%`,
                width: 2,
                background: "var(--bg-primary)",
                zIndex: 10,
                transform: "translateX(-1px)",
              }}
            />
          ))}

          {/* White needle indicator (hero only) */}
          {showNeedle && (
            <motion.div
              className="absolute"
              style={{
                top: -3,
                bottom: -3,
                width: 2,
                background: "rgba(255, 255, 255, 0.9)",
                borderRadius: 1,
                zIndex: 5,
                boxShadow: "0 0 6px rgba(255, 255, 255, 0.5)",
              }}
              initial={shouldAnimate ? { left: "0%" } : { left: `${clamped}%` }}
              animate={{ left: `${clamped}%` }}
              transition={
                shouldAnimate
                  ? { duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.4 }
                  : { duration: 0 }
              }
            />
          )}
        </div>

        {/* Percentage label */}
        {showPercentage && (
          <span
            className="shrink-0 text-[11px] font-bold tabular-nums"
            style={{
              fontFamily: "var(--font-jetbrains)",
              color: "var(--text-secondary)",
              minWidth: 32,
              textAlign: "right",
            }}
          >
            {Math.round(clamped)}%
          </span>
        )}
      </div>

      {/* Zone labels (hero only) */}
      {showLabels && (
        <div className="mt-1.5 flex" style={{ paddingRight: showPercentage ? 44 : 0 }}>
          {["Calm", "Moderate", "Intense", "Extreme"].map((label) => (
            <span
              key={label}
              className="flex-1 text-center text-[9px] font-bold uppercase"
              style={{
                color: "var(--text-tertiary)",
                fontFamily: "var(--font-dm-sans)",
                letterSpacing: "0.05em",
              }}
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
