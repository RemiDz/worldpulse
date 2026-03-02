"use client";

import { motion } from "framer-motion";

const PHASE_MARKERS = [
  { angle: 0, emoji: "\uD83C\uDF11", label: "New" },
  { angle: 90, emoji: "\uD83C\uDF13", label: "1st Q" },
  { angle: 180, emoji: "\uD83C\uDF15", label: "Full" },
  { angle: 270, emoji: "\uD83C\uDF17", label: "Last Q" },
];

const PHASE_ANGLE_MAP: Record<string, number> = {
  "new-moon": 0,
  "waxing-crescent": 45,
  "first-quarter": 90,
  "waxing-gibbous": 135,
  "full-moon": 180,
  "waning-gibbous": 225,
  "last-quarter": 270,
  "waning-crescent": 315,
};

/**
 * Generate SVG path for the lit portion of the moon.
 *
 * The lit area is bounded by two arcs from the top of the disc to the bottom:
 *   1. A semicircular arc along the outer (always-lit) edge
 *   2. An elliptical arc for the terminator whose rx varies with illumination
 *
 * Northern Hemisphere convention:
 *   Waxing = lit from the RIGHT   |   Waning = lit from the LEFT
 */
function getMoonLitPath(
  cx: number,
  cy: number,
  r: number,
  illumination: number,
  phase: string,
): string {
  const fraction = illumination / 100;

  // Edge cases
  if (fraction <= 0) return ""; // new moon — nothing lit
  if (fraction >= 1) {
    // full moon — entire circle
    return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx} ${cy + r} A ${r} ${r} 0 1 1 ${cx} ${cy - r} Z`;
  }

  const isWaxing =
    phase.includes("waxing") || phase === "first-quarter" || phase === "full-moon";

  // Terminator ellipse x-radius: 0 at quarters, r at new/full
  const tx = Math.abs(2 * fraction - 1) * r;
  const moreThanHalf = fraction > 0.5;

  const top = `${cx} ${cy - r}`;
  const bot = `${cx} ${cy + r}`;

  if (isWaxing) {
    // Outer arc: right semicircle (sweep=1 = clockwise in SVG y-down)
    const outer = `A ${r} ${r} 0 0 1 ${bot}`;
    // Terminator arc back to top
    const sweep = moreThanHalf ? 1 : 0;
    const terminator = `A ${tx} ${r} 0 0 ${sweep} ${top}`;
    return `M ${top} ${outer} ${terminator} Z`;
  } else {
    // Outer arc: left semicircle (sweep=0 = counter-clockwise)
    const outer = `A ${r} ${r} 0 0 0 ${bot}`;
    const sweep = moreThanHalf ? 0 : 1;
    const terminator = `A ${tx} ${r} 0 0 ${sweep} ${top}`;
    return `M ${top} ${outer} ${terminator} Z`;
  }
}

interface LunarOrbitProps {
  severity: string;
  isActive: boolean;
  phase: string;
  phaseName: string;
  illumination: number;
  dayInCycle: number;
}

export default function LunarOrbit({
  isActive,
  phase,
  phaseName,
  illumination,
  dayInCycle,
}: LunarOrbitProps) {
  const currentAngle = PHASE_ANGLE_MAP[phase] ?? 0;
  const moonRadius = 36;
  const moonCx = 150;
  const moonCy = 55;

  const litPath = getMoonLitPath(moonCx, moonCy, moonRadius, illumination, phase);

  return (
    <motion.div
      className="relative w-full overflow-hidden rounded-xl"
      style={{
        height: 150,
        background: "rgba(255,255,255,0.015)",
        border: "1px solid var(--border-subtle)",
      }}
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      aria-label={`Moon phase: ${phaseName}, ${illumination}% illuminated, day ${Math.round(dayInCycle)} of 29.5`}
    >
      <svg
        viewBox="0 0 300 150"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <radialGradient id="moon-lit" cx="40%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#FFFBF0" />
            <stop offset="50%" stopColor="#F5F0E8" />
            <stop offset="100%" stopColor="#D4CFC4" />
          </radialGradient>
          <filter id="moon-glow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Orbit track */}
        <ellipse
          cx={moonCx}
          cy={moonCy}
          rx={100}
          ry={40}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1"
          strokeDasharray="3 5"
          style={
            isActive
              ? { animation: "orbit-rotate 60s linear infinite", transformOrigin: `${moonCx}px ${moonCy}px` }
              : undefined
          }
        />

        {/* Phase markers on orbit */}
        {PHASE_MARKERS.map((marker) => {
          const rad = (marker.angle * Math.PI) / 180;
          const mx = moonCx + Math.cos(rad) * 100;
          const my = moonCy + Math.sin(rad) * 40;
          const isCurrent = Math.abs(marker.angle - currentAngle) < 46;
          return (
            <g key={marker.angle}>
              <circle
                cx={mx}
                cy={my}
                r={isCurrent ? 5 : 3}
                fill={isCurrent ? "#F5F0E8" : "rgba(255,255,255,0.15)"}
                filter={isCurrent ? "url(#moon-glow)" : undefined}
              />
              <text
                x={mx}
                y={my + (marker.angle > 90 && marker.angle < 270 ? 14 : -8)}
                textAnchor="middle"
                fill="var(--text-tertiary)"
                fontSize="7"
                fontFamily="var(--font-dm-sans)"
              >
                {marker.label}
              </text>
            </g>
          );
        })}

        {/* Moon outer glow */}
        <circle
          cx={moonCx}
          cy={moonCy}
          r={moonRadius + 4}
          fill="none"
          stroke="rgba(245,240,232,0.08)"
          strokeWidth="8"
          filter="url(#moon-glow)"
        />

        {/* Moon shadow base (dark circle) */}
        <circle cx={moonCx} cy={moonCy} r={moonRadius} fill="#12131a" />

        {/* Moon lit portion — arc-based rendering */}
        {litPath && (
          <path d={litPath} fill="url(#moon-lit)" />
        )}

        {/* Subtle surface texture on the lit area */}
        {illumination > 0 && (
          <circle
            cx={moonCx}
            cy={moonCy}
            r={moonRadius}
            fill="none"
            stroke="rgba(255,255,255,0.03)"
            strokeWidth="0.5"
          />
        )}

        {/* Phase name */}
        <text
          x={moonCx}
          y="106"
          textAnchor="middle"
          fill="var(--text-primary)"
          fontSize="12"
          fontFamily="var(--font-instrument)"
          fontStyle="italic"
        >
          {phaseName}
        </text>

        {/* Illumination bar */}
        <g transform="translate(75, 118)">
          <rect x="0" y="0" width="150" height="4" rx="2" fill="rgba(255,255,255,0.06)" />
          <rect
            x="0"
            y="0"
            width={150 * (illumination / 100)}
            height="4"
            rx="2"
            fill="url(#moon-lit)"
            opacity={0.6}
          />
          <text
            x="155"
            y="6"
            fill="var(--text-tertiary)"
            fontSize="8"
            fontFamily="var(--font-jetbrains)"
          >
            {illumination}%
          </text>
        </g>

        {/* Cycle day */}
        <text
          x={moonCx}
          y="138"
          textAnchor="middle"
          fill="var(--text-tertiary)"
          fontSize="8"
          fontFamily="var(--font-dm-sans)"
        >
          Day {Math.round(dayInCycle)} of 29.5
        </text>
      </svg>

      <style jsx global>{`
        @keyframes orbit-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .lunar-orbit-anim * { animation: none !important; }
        }
      `}</style>
    </motion.div>
  );
}
