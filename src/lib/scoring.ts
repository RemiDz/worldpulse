import type { SeverityLevel } from "@/types";

interface ScoreResult {
  severity: number;
  percentage: number;
}

export function severityFromNumber(n: number): SeverityLevel {
  if (n <= 0.5) return "calm";
  if (n <= 1.5) return "mild";
  if (n <= 2.5) return "moderate";
  if (n <= 3.5) return "intense";
  return "extreme";
}

export function scoreKp(kp: number): ScoreResult {
  // KP 0-1 → calm, 2 → mild, 3-4 → moderate, 5-6 → intense, 7+ → extreme
  if (kp < 2) return { severity: 0, percentage: Math.round(kp / 2 * 20) };
  if (kp < 3) return { severity: 1, percentage: Math.round(20 + (kp - 2) * 20) };
  if (kp < 5) return { severity: 2, percentage: Math.round(40 + (kp - 3) / 2 * 20) };
  if (kp < 7) return { severity: 3, percentage: Math.round(60 + (kp - 5) / 2 * 20) };
  return { severity: 4, percentage: Math.min(100, Math.round(80 + (kp - 7) / 2 * 20)) };
}

export function scoreSchumann(hz: number): ScoreResult {
  // 7.5-7.8 → calm, 7.8-8.0 → mild, 8.0-8.5 → moderate, 8.5-9.5 → intense, 9.5+ → extreme
  if (hz < 7.8) return { severity: 0, percentage: Math.round(Math.max(0, (hz - 7.5) / 0.3 * 20)) };
  if (hz < 8.0) return { severity: 1, percentage: Math.round(20 + (hz - 7.8) / 0.2 * 20) };
  if (hz < 8.5) return { severity: 2, percentage: Math.round(40 + (hz - 8.0) / 0.5 * 20) };
  if (hz < 9.5) return { severity: 3, percentage: Math.round(60 + (hz - 8.5) / 1.0 * 20) };
  return { severity: 4, percentage: Math.min(100, Math.round(80 + (hz - 9.5) / 1.0 * 20)) };
}

export function scoreSolarWind(speed: number): ScoreResult {
  if (speed < 350) return { severity: 0, percentage: Math.round(speed / 350 * 20) };
  if (speed < 400) return { severity: 1, percentage: Math.round(20 + (speed - 350) / 50 * 20) };
  if (speed < 500) return { severity: 2, percentage: Math.round(40 + (speed - 400) / 100 * 20) };
  if (speed < 700) return { severity: 3, percentage: Math.round(60 + (speed - 500) / 200 * 20) };
  return { severity: 4, percentage: Math.min(100, Math.round(80 + (speed - 700) / 300 * 20)) };
}

export function scoreAqi(aqi: number): ScoreResult {
  if (aqi <= 50) return { severity: 0, percentage: Math.round(aqi / 50 * 20) };
  if (aqi <= 100) return { severity: 1, percentage: Math.round(20 + (aqi - 50) / 50 * 20) };
  if (aqi <= 150) return { severity: 2, percentage: Math.round(40 + (aqi - 100) / 50 * 20) };
  if (aqi <= 200) return { severity: 3, percentage: Math.round(60 + (aqi - 150) / 50 * 20) };
  return { severity: 4, percentage: Math.min(100, Math.round(80 + (aqi - 200) / 100 * 20)) };
}

export function scoreLunar(lunarSeverity: number): ScoreResult {
  // Lunar severity is 0-3 from phase calculation. Place percentage at midpoint
  // of each 20% band (10/30/50/70) for visual consistency with other signals.
  const percentage = Math.round(10 + lunarSeverity * 20);
  return { severity: lunarSeverity, percentage };
}

export function calculateOverallPercentage(scores: {
  kp: ScoreResult;
  schumann: ScoreResult;
  solarWind: ScoreResult;
  aqi: ScoreResult;
  lunar: ScoreResult;
  collective: ScoreResult;
}): number {
  const weighted =
    scores.kp.percentage * 0.25 +
    scores.schumann.percentage * 0.20 +
    scores.solarWind.percentage * 0.15 +
    scores.aqi.percentage * 0.15 +
    scores.lunar.percentage * 0.10 +
    scores.collective.percentage * 0.15;

  return Math.round(Math.min(100, Math.max(0, weighted)));
}

export function calculateOverallSeverity(scores: {
  kp: ScoreResult;
  schumann: ScoreResult;
  solarWind: ScoreResult;
  aqi: ScoreResult;
  lunar: ScoreResult;
  collective: ScoreResult;
}): number {
  const weighted =
    scores.kp.severity * 0.25 +
    scores.schumann.severity * 0.20 +
    scores.solarWind.severity * 0.15 +
    scores.aqi.severity * 0.15 +
    scores.lunar.severity * 0.10 +
    scores.collective.severity * 0.15;

  return weighted;
}
