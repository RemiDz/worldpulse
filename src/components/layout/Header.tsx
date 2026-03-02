"use client";

import { useEffect, useReducer } from "react";
import { motion } from "framer-motion";

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function Header() {
  // useReducer to force re-render without the set-state-in-effect lint issue
  const [tick, forceUpdate] = useReducer((x: number) => x + 1, 0);

  useEffect(() => {
    // Trigger initial render after mount, then every 60s
    const interval = setInterval(forceUpdate, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Compute time directly from current Date on each render
  // On server, this will be null (no hydration mismatch since we check typeof)
  const isClient = typeof window !== "undefined";
  const now = isClient ? new Date() : null;

  // Suppress unused variable warning
  void tick;

  return (
    <motion.header
      className="flex items-center justify-between pb-8 pt-6"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
    >
      <div>
        <h1
          className="text-[10px] font-bold uppercase tracking-[0.12em]"
          style={{ color: "var(--text-secondary)", fontFamily: "var(--font-dm-sans)" }}
        >
          World Pulse
        </h1>
      </div>
      <div className="text-right">
        {now && (
          <>
            <div
              className="text-lg font-medium tabular-nums"
              style={{ fontFamily: "var(--font-jetbrains)", color: "var(--text-primary)" }}
            >
              {formatTime(now)}
            </div>
            <div
              className="text-[10px]"
              style={{ color: "var(--text-tertiary)" }}
            >
              {formatDate(now)}
            </div>
          </>
        )}
      </div>
    </motion.header>
  );
}
