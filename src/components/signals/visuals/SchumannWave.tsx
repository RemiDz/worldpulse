"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import GlowText from "./shared/GlowText";

const SEVERITY_COLORS: Record<string, string> = {
  calm: "#4ECDC4",
  mild: "#7ED88C",
  moderate: "#FFD93D",
  intense: "#FF8C42",
  extreme: "#FF6B6B",
};

interface SchumannWaveProps {
  value: number;
  severity: string;
  isActive: boolean;
}

export default function SchumannWave({ value, severity, isActive }: SchumannWaveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const offsetRef = useRef(0);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
  }, []);

  const color = SEVERITY_COLORS[severity] ?? "#4ECDC4";
  const severityNum = ["calm", "mild", "moderate", "intense", "extreme"].indexOf(severity);
  const amplitude = 12 + severityNum * 8;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const midY = h / 2;

    ctx.clearRect(0, 0, w, h);

    // Baseline dotted line
    ctx.setLineDash([4, 6]);
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(w, midY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Ghost wave (7.83 Hz baseline)
    const baseFreq = 7.83;
    ctx.strokeStyle = "rgba(255,255,255,0.07)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < w; x++) {
      const t = (x / w) * Math.PI * 4;
      const y = midY + Math.sin(t * (baseFreq / 8) + offsetRef.current * 0.5) * (amplitude * 0.5);
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Glow layer for primary wave
    ctx.strokeStyle = color + "30";
    ctx.lineWidth = 8;
    ctx.filter = "blur(4px)";
    ctx.beginPath();
    for (let x = 0; x < w; x++) {
      const t = (x / w) * Math.PI * 4;
      const y = midY + Math.sin(t * (value / 8) + offsetRef.current) * amplitude;
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    ctx.filter = "none";

    // Primary wave
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let x = 0; x < w; x++) {
      const t = (x / w) * Math.PI * 4;
      const y = midY + Math.sin(t * (value / 8) + offsetRef.current) * amplitude;
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Center "now" line
    ctx.setLineDash([2, 4]);
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.stroke();
    ctx.setLineDash([]);
  }, [value, color, amplitude]);

  useEffect(() => {
    if (!isActive) {
      cancelAnimationFrame(rafRef.current);
      return;
    }

    if (prefersReducedMotion.current) {
      draw();
      return;
    }

    let lastTime = 0;
    function animate(time: number) {
      if (time - lastTime > 16) {
        offsetRef.current += 0.03;
        draw();
        lastTime = time;
      }
      rafRef.current = requestAnimationFrame(animate);
    }
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isActive, draw]);

  return (
    <motion.div
      className="relative w-full overflow-hidden rounded-xl"
      style={{
        height: 120,
        background: "rgba(255,255,255,0.015)",
        border: "1px solid var(--border-subtle)",
      }}
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      aria-label={`Schumann resonance waveform at ${value} Hz, severity ${severity}`}
    >
      {/* Data readout */}
      <div className="absolute left-3 top-2.5 z-10">
        <GlowText
          value={value}
          suffix="Hz"
          decimals={2}
          color={color}
          subtitle="baseline 7.83 Hz"
          size="md"
        />
      </div>

      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ display: "block" }}
      />
    </motion.div>
  );
}
