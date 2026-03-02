"use client";

import { motion } from "framer-motion";
import IntensityBar from "@/components/ui/IntensityBar";
import AnimatedNumber from "@/components/ui/AnimatedNumber";
import type { OverallState } from "@/types";

const SEVERITY_COLORS: Record<string, string> = {
  calm: "#4ECDC4",
  mild: "#7ED88C",
  moderate: "#FFD93D",
  intense: "#FF8C42",
  extreme: "#FF6B6B",
};

interface HeroCardProps {
  overall: OverallState;
  guidance: string;
  lastUpdated: Date | null;
  loading?: boolean;
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export default function HeroCard({
  overall,
  guidance,
  lastUpdated,
  loading = false,
}: HeroCardProps) {
  const glowColor = SEVERITY_COLORS[overall.severity] ?? "#4ECDC4";

  if (loading) {
    return (
      <div className="glass-card mb-8 p-6">
        <div className="flex items-center justify-between">
          <div className="skeleton h-3 w-20" />
          <div className="skeleton h-3 w-16" />
        </div>
        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="skeleton h-16 w-16 rounded-full" />
          <div className="skeleton h-8 w-48" />
          <div className="skeleton h-4 w-56" />
        </div>
        <div className="mt-6">
          <div className="skeleton h-3.5 w-full" />
        </div>
        <div className="mt-4">
          <div className="skeleton h-16 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="glass-card relative mb-8 overflow-hidden p-6"
      style={{
        borderColor: `${glowColor}15`,
        boxShadow: `0 4px 24px rgba(0,0,0,0.2), 0 0 40px ${glowColor}08`,
      }}
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{
              background: glowColor,
              animation: "live-pulse 2s ease-in-out infinite",
            }}
          />
          <span
            className="text-[10px] font-bold uppercase tracking-[0.12em]"
            style={{ color: "var(--text-secondary)", fontFamily: "var(--font-dm-sans)" }}
          >
            Right Now
          </span>
        </div>
        {lastUpdated && (
          <span
            className="text-[10px]"
            style={{ color: "var(--text-tertiary)" }}
          >
            Updated {timeAgo(lastUpdated)}
          </span>
        )}
      </div>

      {/* Emoji + Title */}
      <div className="mt-6 flex flex-col items-center">
        <motion.div
          className="relative"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
        >
          {/* Glow behind emoji */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle, ${glowColor}30 0%, transparent 70%)`,
              transform: "scale(2.5)",
              animation: "breathe 4s ease-in-out infinite",
            }}
          />
          <span className="relative block text-[64px] leading-none">
            {overall.emoji}
          </span>
        </motion.div>

        <motion.h2
          className="mt-3 text-[32px] leading-tight"
          style={{ fontFamily: "var(--font-instrument)", color: "var(--text-primary)" }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.7 }}
        >
          {overall.title}
        </motion.h2>

        <motion.p
          className="mt-1 text-[15px]"
          style={{ color: "var(--text-secondary)", fontFamily: "var(--font-dm-sans)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          {overall.subtitle}
        </motion.p>
      </div>

      {/* Hero intensity bar */}
      <motion.div
        className="mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <IntensityBar
          percentage={overall.percentage}
          severity={overall.severity}
          variant="hero"
          showLabels
          showNeedle
          showPercentage={false}
        />
        <div className="mt-3 text-center">
          <span style={{ fontFamily: "var(--font-jetbrains)", color: "var(--text-primary)" }}>
            <AnimatedNumber
              value={overall.percentage}
              suffix="%"
              className="text-2xl font-bold tabular-nums"
            />
          </span>
        </div>
      </motion.div>

      {/* Guidance */}
      {guidance && (
        <motion.div
          className="mt-5 rounded-xl p-4"
          style={{
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid var(--border-subtle)",
          }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <p
            className="text-[13px] leading-relaxed"
            style={{ color: "var(--text-secondary)", fontFamily: "var(--font-dm-sans)" }}
          >
            <span className="mr-1.5">💡</span>
            {guidance}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
