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

const AQI_ZONES = [
  { max: 50, label: "Good", color: "#4ECDC4" },
  { max: 100, label: "Moderate", color: "#FFD93D" },
  { max: 150, label: "Sensitive", color: "#FF8C42" },
  { max: 200, label: "Unhealthy", color: "#FF6B6B" },
  { max: 300, label: "V.Unhealthy", color: "#C9B8FF" },
  { max: 500, label: "Hazardous", color: "#8B0000" },
];

function getAqiZoneLabel(aqi: number): string {
  for (const zone of AQI_ZONES) {
    if (aqi <= zone.max) return zone.label;
  }
  return "Hazardous";
}

interface AirQualityLungsProps {
  value: number;
  severity: string;
  isActive: boolean;
}

export default function AirQualityLungs({ value, severity, isActive }: AirQualityLungsProps) {
  const color = SEVERITY_COLORS[severity] ?? "#4ECDC4";
  const severityNum = ["calm", "mild", "moderate", "intense", "extreme"].indexOf(severity);
  const zoneLabel = getAqiZoneLabel(value);

  const particles = useMemo(() => {
    const rand = createSeededRandom(42);
    const count = Math.min(60, 15 + severityNum * 10);
    return Array.from({ length: count }, (_, i) => {
      const sizeBase = severityNum <= 1 ? 3 : severityNum <= 2 ? 2 : 1;
      const sizeRange = severityNum <= 1 ? 5 : severityNum <= 2 ? 4 : 3;
      return {
        id: i,
        x: rand() * 100,
        y: rand() * 100,
        size: sizeBase + rand() * sizeRange,
        opacity: 0.15 + rand() * 0.45,
        duration: 8 + rand() * 12,
        delay: rand() * 8,
      };
    });
  }, [severityNum]);

  const aqiPercent = Math.min((value / 500) * 100, 100);

  return (
    <motion.div
      className="relative w-full overflow-hidden rounded-xl"
      style={{
        height: 130,
        background: "rgba(255,255,255,0.015)",
        border: "1px solid var(--border-subtle)",
      }}
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      aria-label={`Air quality visualization, AQI ${value}, ${zoneLabel}`}
    >
      {/* Particle field */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              backgroundColor: color,
              opacity: p.opacity,
              animation: isActive
                ? `particle-drift-${p.id % 4} ${p.duration}s ease-in-out infinite`
                : undefined,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}

        {severityNum >= 3 && (
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at center, ${color}08 0%, transparent 70%)`,
            }}
          />
        )}

        {isActive && (
          <div
            className="absolute inset-0"
            style={{ animation: "breath-cycle 4s ease-in-out infinite" }}
          />
        )}
      </div>

      {/* Central data readout */}
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ zIndex: 2 }}>
        <GlowText value={value} decimals={0} color={color} size="lg" />
        <div
          className="mt-0.5 text-[11px] font-medium"
          style={{ color: "var(--text-secondary)", fontFamily: "var(--font-dm-sans)" }}
        >
          {zoneLabel}
        </div>
      </div>

      {/* AQI colour band at bottom */}
      <div className="absolute bottom-0 left-0 right-0 px-3 pb-2.5" style={{ zIndex: 2 }}>
        <div className="relative h-[4px] w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
          {AQI_ZONES.map((zone, i) => {
            const prevMax = i === 0 ? 0 : AQI_ZONES[i - 1].max;
            const left = (prevMax / 500) * 100;
            const width = ((zone.max - prevMax) / 500) * 100;
            return (
              <div
                key={zone.label}
                className="absolute top-0 h-full"
                style={{
                  left: `${left}%`,
                  width: `${width}%`,
                  backgroundColor: zone.color,
                  opacity: 0.5,
                }}
              />
            );
          })}
          <div
            className="absolute top-[-3px]"
            style={{ left: `${aqiPercent}%`, transform: "translateX(-50%)" }}
          >
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: "4px solid transparent",
                borderRight: "4px solid transparent",
                borderTop: `5px solid ${color}`,
              }}
            />
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes particle-drift-0 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(12px, -8px); }
        }
        @keyframes particle-drift-1 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-10px, 6px); }
        }
        @keyframes particle-drift-2 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(8px, 10px); }
        }
        @keyframes particle-drift-3 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-14px, -6px); }
        }
        @keyframes breath-cycle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; }
        }
      `}</style>
    </motion.div>
  );
}
