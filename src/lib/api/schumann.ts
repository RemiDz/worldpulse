interface SchumannResult {
  frequency: number;
  amplitude: number;
}

/**
 * Estimates the Schumann Resonance frequency.
 * Uses a deterministic function based on time to produce
 * realistic-looking variation around the 7.83 Hz base.
 * This changes at most every ~15 minutes for stability.
 */
export function getSchumannEstimate(): SchumannResult {
  const BASE_FREQ = 7.83;
  const now = new Date();

  // Use a stable time bucket (changes every 15 min)
  const bucket = Math.floor(now.getTime() / (15 * 60 * 1000));

  // Deterministic pseudo-random based on bucket
  const seed1 = Math.sin(bucket * 12.9898) * 43758.5453;
  const seed2 = Math.sin(bucket * 78.233) * 43758.5453;
  const rand1 = seed1 - Math.floor(seed1); // 0-1
  const rand2 = seed2 - Math.floor(seed2); // 0-1

  // Hour-of-day cycle (subtle 0.2 Hz swing)
  const hourRad = (now.getHours() / 24) * Math.PI * 2;
  const hourFactor = Math.sin(hourRad) * 0.2;

  // Day-of-month cycle (subtle 0.15 Hz swing)
  const dayRad = (now.getDate() / 30) * Math.PI * 2;
  const dayFactor = Math.sin(dayRad) * 0.15;

  // Random jitter within ±0.3 Hz
  const jitter = (rand1 - 0.5) * 0.6;

  const frequency = BASE_FREQ + hourFactor + dayFactor + jitter;
  const clampedFreq = Math.max(7.5, Math.min(9.8, frequency));

  // Amplitude varies between 8 and 18
  const amplitude = 8 + rand2 * 10;

  return {
    frequency: Math.round(clampedFreq * 100) / 100,
    amplitude: Math.round(amplitude * 10) / 10,
  };
}
