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

  // Calculate the shadow clip for the moon phase
  // illumination 0% = new moon (all shadow), 100% = full moon (all lit)
  // We use an ellipse overlay to create the terminator line
  const isWaxing = currentAngle < 180;
  const illFraction = illumination / 100;

  // Terminator ellipse rx: 0 at quarters, moonRadius at new/full
  // For waxing: shadow on left. For waning: shadow on right.
  const terminatorRx = Math.abs(2 * illFraction - 1) * moonRadius;
  const isMoreThanHalf = illFraction > 0.5;

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
      aria-label={`Moon phase: ${phaseName}, ${illumination}% illuminated, day ${dayInCycle} of 29.5`}
    >
      <svg
        viewBox="0 0 300 150"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <radialGradient id="moon-lit" cx="40%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#FFFBF0" />
            <stop offset="60%" stopColor="#F5F0E8" />
            <stop offset="100%" stopColor="#D4CFC4" />
          </radialGradient>
          <clipPath id="moon-clip">
            <circle cx="150" cy="55" r={moonRadius} />
          </clipPath>
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
          cx="150"
          cy="55"
          rx="100"
          ry="40"
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1"
          strokeDasharray="3 5"
          style={
            isActive
              ? { animation: "orbit-rotate 60s linear infinite", transformOrigin: "150px 55px" }
              : undefined
          }
        />

        {/* Phase markers on orbit */}
        {PHASE_MARKERS.map((marker) => {
          const rad = (marker.angle * Math.PI) / 180;
          const mx = 150 + Math.cos(rad) * 100;
          const my = 55 + Math.sin(rad) * 40;
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
          cx="150"
          cy="55"
          r={moonRadius + 4}
          fill="none"
          stroke="rgba(245,240,232,0.08)"
          strokeWidth="8"
          filter="url(#moon-glow)"
        />

        {/* Moon base (shadow side) */}
        <circle cx="150" cy="55" r={moonRadius} fill="#12131a" />

        {/* Moon lit portion */}
        <g clipPath="url(#moon-clip)">
          {/* Full lit circle */}
          <circle cx="150" cy="55" r={moonRadius} fill="url(#moon-lit)" />

          {/* Shadow overlay — creates the phase shape */}
          {illumination < 100 && illumination > 0 && (
            <ellipse
              cx="150"
              cy="55"
              rx={terminatorRx}
              ry={moonRadius}
              fill={isMoreThanHalf ? "#12131a" : "url(#moon-lit)"}
              style={{
                transform: isWaxing ? undefined : "scaleX(-1)",
                transformOrigin: "150px 55px",
              }}
            />
          )}

          {/* If new moon (0%), cover everything */}
          {illumination === 0 && (
            <circle cx="150" cy="55" r={moonRadius} fill="#12131a" />
          )}

          {/* If less than 50% and waxing, the shadow covers from left */}
          {!isMoreThanHalf && illumination > 0 && (
            <rect
              x={isWaxing ? 150 - moonRadius : 150}
              y={55 - moonRadius}
              width={moonRadius}
              height={moonRadius * 2}
              fill="#12131a"
            />
          )}

          {/* If more than 50% and waxing, reveal right side */}
          {isMoreThanHalf && illumination < 100 && (
            <rect
              x={isWaxing ? 150 : 150 - moonRadius}
              y={55 - moonRadius}
              width={moonRadius}
              height={moonRadius * 2}
              fill="url(#moon-lit)"
            />
          )}
        </g>

        {/* Phase name */}
        <text
          x="150"
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
          x="150"
          y="138"
          textAnchor="middle"
          fill="var(--text-tertiary)"
          fontSize="8"
          fontFamily="var(--font-dm-sans)"
        >
          Day {Math.round(dayInCycle)} of 29.5
        </text>
      </svg>

      <style jsx>{`
        @keyframes orbit-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; }
        }
      `}</style>
    </motion.div>
  );
}
