"use client";

import { motion } from "framer-motion";
import SignalCard from "@/components/signals/SignalCard";
import type { SignalData } from "@/types";

interface SignalListProps {
  signals: SignalData[];
  loading?: boolean;
}

function SignalSkeleton() {
  return (
    <div className="space-y-3">
      <div
        className="text-[10px] font-bold uppercase tracking-[0.12em]"
        style={{ color: "var(--text-tertiary)" }}
      >
        Signals
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="glass-card overflow-hidden">
          <div className="skeleton h-[3px] w-full" />
          <div className="p-4">
            <div className="flex items-center gap-2.5">
              <div className="skeleton h-5 w-5 rounded" />
              <div className="skeleton h-4 flex-1" />
              <div className="skeleton h-5 w-16 rounded-full" />
            </div>
            <div className="mt-3 pl-[30px]">
              <div className="skeleton h-2 w-full rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SignalList({ signals, loading = false }: SignalListProps) {
  // Show skeleton while loading
  if (loading && signals.length === 0) {
    return <SignalSkeleton />;
  }

  // No signals and not loading — show a fallback message
  if (signals.length === 0) {
    return (
      <div className="space-y-3">
        <div
          className="text-[10px] font-bold uppercase tracking-[0.12em]"
          style={{ color: "var(--text-tertiary)" }}
        >
          Signals
        </div>
        <div className="glass-card p-6 text-center">
          <p
            className="text-[13px]"
            style={{ color: "var(--text-secondary)", fontFamily: "var(--font-dm-sans)" }}
          >
            Connecting to data sources...
          </p>
          <p
            className="mt-1 text-[11px]"
            style={{ color: "var(--text-tertiary)" }}
          >
            Signals will appear shortly
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <motion.div
        className="text-[10px] font-bold uppercase tracking-[0.12em]"
        style={{ color: "var(--text-tertiary)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        Signals
      </motion.div>
      {signals.map((signal, index) => (
        <SignalCard key={signal.id} signal={signal} index={index} />
      ))}
    </div>
  );
}
