"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import GlowText from "./shared/GlowText";
import { createSeededRandom } from "./shared/seed";

const SEVERITY_COLORS: Record<string, string> = {
  calm: "#4ECDC4",
  mild: "#7ED88C",
  moderate: "#FFD93D",
  intense: "#FF8C42",
  extreme: "#FF6B6B",
};

interface MagneticFieldProps {
  value: number;
  severity: string;
  isActive: boolean;
}

export default function MagneticField({ value, severity, isActive }: MagneticFieldProps) {
  const color = SEVERITY_COLORS[severity] ?? "#4ECDC4";
  const severityNum = ["calm", "mild", "moderate", "intense", "extreme"].indexOf(severity);

  const ringStroke = 1 + severityNum * 0.4;
  const pulseDuration = Math.max(2, 6 - severityNum);
  const distortion = severityNum * 4;

  const particles = useMemo(() => {
    const rand = createSeededRandom(77);
    if (severityNum < 2) return [];
    const count = 3 + severityNum * 2;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      ring: i % 4,
      offset: (i / count) * 360,
      duration: 4 + rand() * 6,
    }));
  }, [severityNum]);

  const scatteredParticles = useMemo(() => {
    const rand = createSeededRandom(99);
    if (severityNum < 3) return [];
    const count = severityNum === 4 ? 10 : 5;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: 30 + rand() * 240,
      y: 10 + rand() * 100,
      size: 1 + rand() * 2,
      duration: 2 + rand() * 3,
    }));
  }, [severityNum]);

  const kpScale = Array.from({ length: 10 }, (_, i) => i);

  return (
    <motion.div
      className="relative w-full overflow-hidden rounded-xl"
      style={{
        height: 140,
        background: "rgba(255,255,255,0.015)",
        border: "1px solid var(--border-subtle)",
      }}
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      aria-label={`Magnetic field visualization, KP index ${value}, severity ${severity}`}
    >
      <svg
        viewBox="0 0 300 140"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <radialGradient id="earth-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4ECDC4" stopOpacity={0.6} />
            <stop offset="100%" stopColor="#1a5c6b" stopOpacity={0.8} />
          </radialGradient>
          <filter id="ring-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Concentric elliptical rings */}
        {[0, 1, 2, 3].map((ring) => {
          const rx = 35 + ring * 22 - distortion * (ring === 0 ? 0.2 : ring * 0.15);
          const ry = 18 + ring * 11;
          const cx = 150 + distortion * 0.5;
          return (
            <ellipse
              key={ring}
              cx={cx}
              cy={60}
              rx={rx}
              ry={ry}
              fill="none"
              stroke={color}
              strokeWidth={ringStroke}
              opacity={0.15 + severityNum * 0.08}
              filter={severityNum >= 3 ? "url(#ring-glow)" : undefined}
              style={
                isActive
                  ? {
                      animation: `magnetic-pulse ${pulseDuration + ring * 0.5}s ease-in-out infinite`,
                      animationDelay: `${ring * 0.3}s`,
                    }
                  : undefined
              }
            />
          );
        })}

        {/* Earth at center */}
        <circle cx={150 + distortion * 0.5} cy={60} r={8} fill="url(#earth-grad)" />

        {/* Particle dots along rings */}
        {isActive &&
          particles.map((p) => {
            const rx = 35 + p.ring * 22;
            const ry = 18 + p.ring * 11;
            return (
              <circle
                key={`p-${p.id}`}
                r={1.5}
                fill={color}
                opacity={0.6}
                style={{
                  offsetPath: `path('M ${150 - rx + distortion * 0.5} 60 a ${rx} ${ry} 0 1 1 ${rx * 2} 0 a ${rx} ${ry} 0 1 1 ${-rx * 2} 0')`,
                  animation: `ring-travel ${p.duration}s linear infinite`,
                  animationDelay: `${(p.offset / 360) * p.duration}s`,
                }}
              />
            );
          })}

        {/* Scattered particles */}
        {isActive &&
          scatteredParticles.map((p) => (
            <circle
              key={`s-${p.id}`}
              cx={p.x}
              cy={p.y}
              r={p.size}
              fill={color}
              opacity={0.3}
              style={{ animation: `particle-flicker ${p.duration}s ease-in-out infinite` }}
            />
          ))}

        {/* KP Scale */}
        <g transform="translate(75, 125)">
          {kpScale.map((k) => {
            const segColor =
              k <= 3 ? "#4ECDC4" : k <= 5 ? "#FFD93D" : k <= 7 ? "#FF8C42" : "#FF6B6B";
            const filled = k <= Math.round(value);
            return (
              <rect
                key={k}
                x={k * 15}
                y={0}
                width={12}
                height={5}
                rx={1}
                fill={filled ? segColor : "rgba(255,255,255,0.06)"}
                opacity={filled ? 0.8 : 1}
              />
            );
          })}
          <text x={0} y={14} fill="var(--text-tertiary)" fontSize={7} fontFamily="var(--font-dm-sans)">Quiet</text>
          <text x={55} y={14} fill="var(--text-tertiary)" fontSize={7} fontFamily="var(--font-dm-sans)" textAnchor="middle">Active</text>
          <text x={105} y={14} fill="var(--text-tertiary)" fontSize={7} fontFamily="var(--font-dm-sans)" textAnchor="middle">Storm</text>
          <text x={147} y={14} fill="var(--text-tertiary)" fontSize={7} fontFamily="var(--font-dm-sans)" textAnchor="end">Severe</text>
        </g>
      </svg>

      {/* Data readout */}
      <div className="absolute bottom-3 left-0 right-0 text-center">
        <GlowText value={value} suffix="KP" decimals={0} color={color} size="md" />
      </div>

      <style jsx global>{`
        @keyframes magnetic-pulse {
          0%, 100% { transform: scale(1); opacity: ${0.15 + severityNum * 0.08}; }
          50% { transform: scale(${1 + severityNum * 0.02}); opacity: ${0.25 + severityNum * 0.1}; }
        }
        @keyframes ring-travel {
          0% { offset-distance: 0%; }
          100% { offset-distance: 100%; }
        }
        @keyframes particle-flicker {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.5; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; }
        }
      `}</style>
    </motion.div>
  );
}
