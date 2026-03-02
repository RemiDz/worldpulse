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

interface SolarCoronaProps {
  value: number; // speed in km/s
  severity: string;
  isActive: boolean;
}

interface Particle {
  angle: number;
  distance: number;
  speed: number;
  size: number;
  opacity: number;
}

export default function SolarCorona({ value, severity, isActive }: SolarCoronaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const rotationRef = useRef(0);
  const prefersReducedMotion = useRef(false);

  const color = SEVERITY_COLORS[severity] ?? "#4ECDC4";
  const severityNum = ["calm", "mild", "moderate", "intense", "extreme"].indexOf(severity);

  const sunRadius = 24;
  const rayLength = 20 + severityNum * 8;
  const rayOpacity = 0.15 + severityNum * 0.15;
  const particleCount = 10 + severityNum * 5;
  const particleSpeed = value < 400 ? 0.3 : value < 500 ? 0.5 : value < 700 ? 0.8 : 1.2;

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
  }, []);

  // Initialize particles
  useEffect(() => {
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      angle: Math.random() * Math.PI * 2,
      distance: sunRadius + Math.random() * 60,
      speed: particleSpeed * (0.5 + Math.random()),
      size: 1 + Math.random() * 2,
      opacity: 0.3 + Math.random() * 0.5,
    }));
  }, [particleCount, particleSpeed]);

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
    const cx = w / 2;
    const cy = 55; // sun position

    ctx.clearRect(0, 0, w, h);

    // Corona rays
    const rayCount = 14;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotationRef.current);

    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 2;
      const len = rayLength + Math.sin(i * 1.7) * 8;
      const tipWidth = 2 + severityNum;

      ctx.save();
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(-tipWidth, sunRadius);
      ctx.lineTo(0, sunRadius + len);
      ctx.lineTo(tipWidth, sunRadius);
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, sunRadius, 0, sunRadius + len);
      grad.addColorStop(0, `rgba(255, 140, 66, ${rayOpacity})`);
      grad.addColorStop(1, "rgba(255, 140, 66, 0)");
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
    }

    // Extra halo for extreme
    if (severityNum >= 3) {
      const haloGrad = ctx.createRadialGradient(0, 0, sunRadius, 0, 0, sunRadius + rayLength + 15);
      haloGrad.addColorStop(0, `${color}15`);
      haloGrad.addColorStop(1, "transparent");
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(0, 0, sunRadius + rayLength + 15, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // Sun body
    const sunGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, sunRadius);
    sunGrad.addColorStop(0, "#FFF8E7");
    sunGrad.addColorStop(0.6, "#FFD93D");
    sunGrad.addColorStop(1, "#FF8C42");
    ctx.beginPath();
    ctx.arc(cx, cy, sunRadius, 0, Math.PI * 2);
    ctx.fillStyle = sunGrad;
    ctx.fill();

    // Sun inner glow
    ctx.beginPath();
    ctx.arc(cx, cy, sunRadius + 3, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255, 248, 231, 0.1)";
    ctx.lineWidth = 4;
    ctx.filter = "blur(2px)";
    ctx.stroke();
    ctx.filter = "none";

    // Particles
    for (const p of particlesRef.current) {
      const px = cx + Math.cos(p.angle) * p.distance;
      const py = cy + Math.sin(p.angle) * p.distance;

      // Fade as they go further
      const fade = Math.max(0, 1 - (p.distance - sunRadius) / 80);
      const particleOpacity = p.opacity * fade;

      if (particleOpacity > 0.02) {
        // Color interpolation: yellow near sun → severity color far away
        const t = Math.min((p.distance - sunRadius) / 60, 1);
        ctx.beginPath();
        ctx.arc(px, py, p.size * fade, 0, Math.PI * 2);
        ctx.fillStyle =
          t < 0.5
            ? `rgba(255, 220, 100, ${particleOpacity})`
            : `${color}${Math.round(particleOpacity * 255).toString(16).padStart(2, "0")}`;
        ctx.fill();
      }
    }

    // Speed arc gauge at bottom
    const arcCx = cx;
    const arcCy = h - 8;
    const arcRadius = 40;
    const arcStart = Math.PI;
    const arcEnd = Math.PI * 2;

    // Background arc
    ctx.beginPath();
    ctx.arc(arcCx, arcCy, arcRadius, arcStart, arcEnd);
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 4;
    ctx.stroke();

    // Filled arc
    const speedFraction = Math.min(Math.max((value - 200) / 600, 0), 1);
    const fillEnd = arcStart + speedFraction * Math.PI;

    const arcGrad = ctx.createLinearGradient(arcCx - arcRadius, arcCy, arcCx + arcRadius, arcCy);
    arcGrad.addColorStop(0, "#4ECDC4");
    arcGrad.addColorStop(0.35, "#FFD93D");
    arcGrad.addColorStop(0.65, "#FF8C42");
    arcGrad.addColorStop(1, "#FF6B6B");

    ctx.beginPath();
    ctx.arc(arcCx, arcCy, arcRadius, arcStart, fillEnd);
    ctx.strokeStyle = arcGrad;
    ctx.lineWidth = 4;
    ctx.stroke();

    // Needle dot
    const needleX = arcCx + Math.cos(fillEnd) * arcRadius;
    const needleY = arcCy + Math.sin(fillEnd) * arcRadius;
    ctx.beginPath();
    ctx.arc(needleX, needleY, 3, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    // Tick marks
    const ticks = [
      { speed: 350, label: "350" },
      { speed: 500, label: "500" },
      { speed: 700, label: "700" },
    ];
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.font = "6px var(--font-dm-sans)";
    ctx.textAlign = "center";
    for (const tick of ticks) {
      const tickFraction = (tick.speed - 200) / 600;
      const tickAngle = arcStart + tickFraction * Math.PI;
      const tx = arcCx + Math.cos(tickAngle) * (arcRadius + 8);
      const ty = arcCy + Math.sin(tickAngle) * (arcRadius + 8);
      ctx.fillText(tick.label, tx, ty);
    }
  }, [value, color, severityNum, rayLength, rayOpacity]);

  useEffect(() => {
    if (!isActive) {
      cancelAnimationFrame(rafRef.current);
      // Draw static version
      draw();
      return;
    }

    if (prefersReducedMotion.current) {
      draw();
      return;
    }

    let lastTime = 0;
    function animate(time: number) {
      if (time - lastTime > 16) {
        rotationRef.current += 0.001; // Very slow rotation

        // Update particles
        for (const p of particlesRef.current) {
          p.distance += p.speed;
          if (p.distance > sunRadius + 80) {
            p.distance = sunRadius;
            p.angle = Math.random() * Math.PI * 2;
          }
        }

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
        height: 150,
        background: "rgba(255,255,255,0.015)",
        border: "1px solid var(--border-subtle)",
      }}
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      aria-label={`Solar wind visualization, ${value} km/s, severity ${severity}`}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ display: "block" }}
      />

      {/* Data readout */}
      <div className="absolute bottom-1.5 left-0 right-0 text-center" style={{ zIndex: 2 }}>
        <GlowText value={value} suffix="km/s" decimals={0} color={color} subtitle="normal: <400 km/s" size="md" />
      </div>
    </motion.div>
  );
}
