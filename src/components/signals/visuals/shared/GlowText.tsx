"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface GlowTextProps {
  value: number;
  suffix?: string;
  decimals?: number;
  color: string;
  subtitle?: string;
  size?: "lg" | "md";
}

export default function GlowText({
  value,
  suffix = "",
  decimals = 0,
  color,
  subtitle,
  size = "lg",
}: GlowTextProps) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    const duration = 800;
    const from = 0;
    const to = value;

    startRef.current = performance.now();

    function tick(now: number) {
      const elapsed = now - startRef.current;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (to - from) * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  const fontSize = size === "lg" ? "text-2xl" : "text-lg";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div
        className={`${fontSize} font-bold tabular-nums`}
        style={{
          fontFamily: "var(--font-jetbrains)",
          color,
          textShadow: `0 0 20px ${color}40, 0 0 40px ${color}20`,
        }}
      >
        {display.toFixed(decimals)}
        {suffix && (
          <span className="ml-1 text-[11px] font-normal opacity-60">{suffix}</span>
        )}
      </div>
      {subtitle && (
        <div
          className="mt-0.5 text-[10px]"
          style={{ color: "var(--text-tertiary)" }}
        >
          {subtitle}
        </div>
      )}
    </motion.div>
  );
}
