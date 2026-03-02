"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import IntensityBar from "@/components/ui/IntensityBar";
import SeverityBadge from "@/components/ui/SeverityBadge";
import AppLinkButton from "@/components/ecosystem/AppLink";
import type { SignalData } from "@/types";

const SEVERITY_COLORS: Record<string, string> = {
  calm: "#4ECDC4",
  mild: "#7ED88C",
  moderate: "#FFD93D",
  intense: "#FF8C42",
  extreme: "#FF6B6B",
};

interface SignalCardProps {
  signal: SignalData;
  index: number;
}

export default function SignalCard({ signal, index }: SignalCardProps) {
  const [expanded, setExpanded] = useState(false);
  const stripeColor = SEVERITY_COLORS[signal.severity] ?? "#4ECDC4";

  return (
    <motion.div
      className="glass-card relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
        delay: 0.08 * index,
      }}
      whileTap={{ scale: 0.985 }}
    >
      {/* Top colour stripe */}
      <div
        className="h-[3px] w-full"
        style={{
          background: expanded
            ? `linear-gradient(90deg, ${stripeColor}, ${stripeColor}80)`
            : stripeColor,
          height: expanded ? 4 : 3,
          transition: "height 0.3s ease",
        }}
      />

      {/* Clickable header */}
      <button
        className="w-full cursor-pointer p-4 pb-3 text-left"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-label={`${signal.name}: ${signal.severity}. Tap to ${expanded ? "collapse" : "expand"} details.`}
      >
        {/* Row 1: emoji + name + badge + chevron */}
        <div className="flex items-center gap-2.5">
          <span className="text-lg leading-none">{signal.emoji}</span>
          <span
            className="flex-1 text-[15px] font-semibold"
            style={{ color: "var(--text-primary)", fontFamily: "var(--font-dm-sans)" }}
          >
            {signal.name}
          </span>
          <SeverityBadge level={signal.severity} />
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <ChevronDown size={16} style={{ color: "var(--text-tertiary)" }} />
          </motion.div>
        </div>

        {/* Row 2: intensity bar (indented to align with text, not emoji) */}
        <div className="mt-2.5 pl-[30px]">
          <IntensityBar
            percentage={signal.percentage}
            severity={signal.severity}
            variant="signal"
            animated={!expanded}
          />
        </div>
      </button>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-3 px-4 pb-4">
              {/* Summary */}
              <motion.p
                className="text-[13px] leading-relaxed"
                style={{ color: "var(--text-secondary)", fontFamily: "var(--font-dm-sans)" }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.3 }}
              >
                {signal.simpleSummary}
              </motion.p>

              {/* Detail box */}
              <motion.div
                className="rounded-xl p-3.5"
                style={{
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid var(--border-subtle)",
                }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <p
                  className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.12em]"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  What&apos;s happening
                </p>
                <p
                  className="text-[12px] leading-relaxed"
                  style={{ color: "var(--text-secondary)", fontFamily: "var(--font-dm-sans)" }}
                >
                  {signal.detailText}
                </p>
              </motion.div>

              {/* Practitioner tip */}
              <motion.div
                className="rounded-xl p-3.5"
                style={{
                  background: `${stripeColor}08`,
                  border: `1px solid ${stripeColor}15`,
                }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.3 }}
              >
                <p
                  className="text-[12px] leading-relaxed"
                  style={{ color: "var(--text-secondary)", fontFamily: "var(--font-dm-sans)" }}
                >
                  <span className="mr-1.5">💡</span>
                  {signal.tip}
                </p>
              </motion.div>

              {/* App links */}
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <AppLinkButton app={signal.appLink} />
                {signal.secondaryAppLink && (
                  <AppLinkButton app={signal.secondaryAppLink} />
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
