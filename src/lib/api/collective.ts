/**
 * Derives a collective stress/sentiment score from other signals.
 * Per the spec: "Use a combination of the OTHER signals to derive a collective score.
 * If KP is high AND Schumann is elevated AND solar wind is active, collective stress is likely elevated."
 */
export function deriveCollectiveScore(
  kpSeverity: number,
  schumannSeverity: number,
  solarWindSeverity: number,
  lunarSeverity: number
): { severity: number; percentage: number } {
  // Weighted composite: KP and Schumann are strongest indicators
  const composite =
    kpSeverity * 0.35 +
    schumannSeverity * 0.25 +
    solarWindSeverity * 0.25 +
    lunarSeverity * 0.15;

  const severity = Math.round(Math.min(4, Math.max(0, composite)));
  const percentage = Math.round(Math.min(100, Math.max(0, composite * 25)));

  return { severity, percentage };
}
