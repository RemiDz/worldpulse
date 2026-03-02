import type { LunarPhase, LunarPhaseInfo } from "@/types";

const SYNODIC_MONTH = 29.53059;
const KNOWN_NEW_MOON = new Date("2000-01-06T18:14:00Z").getTime();

interface PhaseConfig {
  phase: LunarPhase;
  name: string;
  emoji: string;
  severity: number;
}

const PHASES: PhaseConfig[] = [
  { phase: "new-moon", name: "New Moon", emoji: "\uD83C\uDF11", severity: 3 },
  { phase: "waxing-crescent", name: "Waxing Crescent", emoji: "\uD83C\uDF12", severity: 0 },
  { phase: "first-quarter", name: "First Quarter", emoji: "\uD83C\uDF13", severity: 2 },
  { phase: "waxing-gibbous", name: "Waxing Gibbous", emoji: "\uD83C\uDF14", severity: 1 },
  { phase: "full-moon", name: "Full Moon", emoji: "\uD83C\uDF15", severity: 3 },
  { phase: "waning-gibbous", name: "Waning Gibbous", emoji: "\uD83C\uDF16", severity: 1 },
  { phase: "last-quarter", name: "Last Quarter", emoji: "\uD83C\uDF17", severity: 2 },
  { phase: "waning-crescent", name: "Waning Crescent", emoji: "\uD83C\uDF18", severity: 0 },
];

export function getLunarPhase(date: Date = new Date()): LunarPhaseInfo {
  const daysSinceKnown = (date.getTime() - KNOWN_NEW_MOON) / (1000 * 60 * 60 * 24);
  const lunarAge = ((daysSinceKnown % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;

  // Illumination using cosine curve
  const illumination =
    Math.round(((1 - Math.cos((lunarAge / SYNODIC_MONTH) * 2 * Math.PI)) / 2) * 100);

  // Map lunarAge to one of 8 phases
  const phaseIndex = Math.floor((lunarAge / SYNODIC_MONTH) * 8) % 8;
  const config = PHASES[phaseIndex];

  return {
    phase: config.phase,
    illumination,
    emoji: config.emoji,
    name: config.name,
    severity: config.severity,
    dayInCycle: Math.round(lunarAge * 10) / 10,
  };
}
