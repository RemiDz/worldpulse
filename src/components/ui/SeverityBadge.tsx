"use client";

import type { SeverityLevel } from "@/types";

const SEVERITY_CONFIG: Record<SeverityLevel, { color: string; bg: string; label: string }> = {
  calm: { color: "#4ECDC4", bg: "rgba(78, 205, 196, 0.12)", label: "Calm" },
  mild: { color: "#7ED88C", bg: "rgba(126, 216, 140, 0.12)", label: "Mild" },
  moderate: { color: "#FFD93D", bg: "rgba(255, 217, 61, 0.12)", label: "Moderate" },
  intense: { color: "#FF8C42", bg: "rgba(255, 140, 66, 0.12)", label: "Intense" },
  extreme: { color: "#FF6B6B", bg: "rgba(255, 107, 107, 0.12)", label: "Extreme" },
};

interface SeverityBadgeProps {
  level: SeverityLevel;
  className?: string;
}

export default function SeverityBadge({ level, className = "" }: SeverityBadgeProps) {
  const config = SEVERITY_CONFIG[level];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${className}`}
      style={{ background: config.bg }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: config.color }}
      />
      <span
        className="text-[10px] font-bold uppercase tracking-[0.06em]"
        style={{ color: config.color, fontFamily: "var(--font-dm-sans)" }}
      >
        {config.label}
      </span>
    </span>
  );
}
