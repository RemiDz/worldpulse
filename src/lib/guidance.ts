import type { GuidanceContext } from "@/types";

export function generateGuidance(ctx: GuidanceContext): string {
  // Easter egg: all signals calm
  if (
    ctx.kp === 0 &&
    ctx.schumann === 0 &&
    ctx.solarWind === 0 &&
    ctx.aqi === 0 &&
    ctx.collective === 0
  ) {
    return "\u2728 Rare alignment \u2014 all signals are calm. An extraordinary day for deep healing work.";
  }

  const parts: string[] = [];

  // Priority 1: High KP + high Schumann
  if (ctx.kp >= 3 && ctx.schumann >= 3) {
    parts.push(
      "Strong geomagnetic and Schumann activity today. Grounding practices are essential \u2014 singing bowls, barefoot walking, and root frequencies help stabilise."
    );
  }

  // Priority 2: Poor air quality
  if (ctx.aqi >= 3) {
    parts.push(
      "Air quality is poor. All breathwork should be done indoors."
    );
  }

  // Priority 3: Significant lunar phases
  if (ctx.lunar.phase === "full-moon") {
    parts.push(
      "Full moon energy amplifies everything. Release what no longer serves you."
    );
  } else if (ctx.lunar.phase === "new-moon") {
    parts.push(
      "New moon \u2014 a powerful window for intention setting and reflection."
    );
  }

  // If we have specific advice, return it (max 2 sentences)
  if (parts.length > 0) {
    return parts.slice(0, 2).join(" ");
  }

  // Fallback based on overall severity
  if (ctx.overall <= 1) {
    return "Beautiful calm day. Perfect for deep meditation, sensitive energy work, or outdoor sound sessions.";
  }
  if (ctx.overall <= 2) {
    return "Moderate activity today. Stay mindful and listen to your body. Sound healing and gentle movement are supportive.";
  }
  if (ctx.overall <= 3) {
    return "Intense day. Take things slow. Prioritise grounding, self-care, and gentle sound healing.";
  }
  return "Very high activity across multiple signals. Deep rest and strong grounding practices are strongly recommended today.";
}
