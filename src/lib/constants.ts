import type { SeverityLevel, SignalDefinition, AppLink } from "@/types";

/* ===== Severity Configuration ===== */
export const SEVERITY_CONFIG: Record<
  SeverityLevel,
  { label: string; color: string; emoji: string }
> = {
  calm: { label: "Calm Day", color: "#4ECDC4", emoji: "\uD83D\uDE0C" },
  mild: { label: "Mild Day", color: "#7ED88C", emoji: "\uD83C\uDF3F" },
  moderate: { label: "Moderate Day", color: "#FFD93D", emoji: "\uD83C\uDF0A" },
  intense: { label: "Intense Day", color: "#FF8C42", emoji: "\uD83D\uDE30" },
  extreme: { label: "Extreme Day", color: "#FF6B6B", emoji: "\uD83C\uDF0B" },
};

export const SEVERITY_SUBTITLES: Record<SeverityLevel, string> = {
  calm: "Today is energetically peaceful",
  mild: "Today is energetically gentle",
  moderate: "Today is energetically moderate",
  intense: "Today is energetically intense",
  extreme: "Today is energetically very active",
};

/* ===== Scoring Weights ===== */
export const SEVERITY_WEIGHTS = {
  kp: 0.25,
  schumann: 0.20,
  solarWind: 0.15,
  aqi: 0.15,
  lunar: 0.10,
  collective: 0.15,
} as const;

/* ===== Refresh Interval ===== */
export const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
export const CACHE_KEY = "worldpulse-signals";

/* ===== Ecosystem Apps ===== */
export const ECOSYSTEM_APPS: Record<string, AppLink> = {
  earthPulse: { name: "Earth Pulse", url: "https://schumann.app", description: "See Earth\u2019s live heartbeat" },
  lunata: { name: "Lunata", url: "https://lunata.app", description: "Follow the moon\u2019s rhythm" },
  airas: { name: "Airas", url: "https://airas.app", description: "Check your local air quality" },
  sonarus: { name: "Sonarus", url: "https://sonarus.app", description: "Vocal frequency analysis" },
  binara: { name: "Binara", url: "https://binara.app", description: "Calming binaural beats for stress" },
  voxara: { name: "Voxara", url: "https://voxara.app", description: "Voice-based stress state analysis" },
  tidara: { name: "Tidara", url: "https://tidara.app", description: "Tidal intelligence" },
  overtoneSinger: { name: "Overtone Singer", url: "https://overtonesinger.com", description: "Find your voice frequencies" },
  harmonicWaves: { name: "Harmonic Waves Hub", url: "https://harmonicwaves.app", description: "Explore the ecosystem" },
};

/* ===== Signal Definitions ===== */
export const SIGNAL_DEFINITIONS: SignalDefinition[] = [
  {
    id: "schumann",
    name: "Earth\u2019s Heartbeat",
    emoji: "\uD83C\uDF0D",
    simpleSummary: {
      calm: "The planet\u2019s natural rhythm is steady",
      mild: "The planet\u2019s natural rhythm is slightly elevated",
      moderate: "The planet\u2019s natural rhythm is faster than usual today",
      intense: "The planet\u2019s natural rhythm is significantly elevated",
      extreme: "The planet\u2019s natural rhythm is very active",
    },
    detail: "Earth has its own pulse called the Schumann Resonance \u2014 a set of electromagnetic waves created by lightning storms circling the planet. The normal frequency is 7.83 Hz. When this rises, many people report feeling restless, heightened sensitivity, or difficulty concentrating.",
    tips: {
      calm: "Earth\u2019s rhythm is steady. A great day for deep meditation and inner work.",
      mild: "Slightly elevated. You might notice subtle shifts in focus. Gentle toning exercises help.",
      moderate: "Noticeable activity. Some people feel buzzy or restless. Low-frequency sounds and grounding tones are helpful.",
      intense: "Significantly elevated. Sensitivity is likely heightened. Deep drones, singing bowls, and barefoot grounding recommended.",
      extreme: "Very high activity. Expect strong emotional and physical responses. Prioritise rest, grounding, and gentle sound healing.",
    },
    appLink: ECOSYSTEM_APPS.earthPulse,
  },
  {
    id: "kp",
    name: "Magnetic Field",
    emoji: "\uD83E\uDDF2",
    simpleSummary: {
      calm: "Earth\u2019s magnetic shield is quiet",
      mild: "Earth\u2019s magnetic shield is slightly disturbed",
      moderate: "Earth\u2019s magnetic shield is moderately disturbed",
      intense: "Earth\u2019s magnetic shield is in a storm",
      extreme: "Earth\u2019s magnetic shield is in a major storm",
    },
    detail: "The KP Index measures disturbances in Earth\u2019s magnetic field, usually caused by solar wind hitting our magnetosphere. Geomagnetic storms can affect sleep, mood, and even migraines. Animals sense them too \u2014 birds may change migration patterns during strong storms.",
    tips: {
      calm: "Magnetic field is quiet. Excellent conditions for sensitive energy work and meditation.",
      mild: "Minor fluctuations. Most people won\u2019t notice, but highly sensitive individuals might feel subtle shifts.",
      moderate: "Moderate disturbance. Headaches and mood changes are common. Sound baths with singing bowls can help stabilise.",
      intense: "Geomagnetic storm active. Expect disrupted sleep, vivid dreams, emotional intensity. Strong grounding practices recommended.",
      extreme: "Major storm. High sensitivity across the board. Prioritise self-care, avoid stressful situations, use grounding frequencies.",
    },
    appLink: ECOSYSTEM_APPS.earthPulse,
  },
  {
    id: "aqi",
    name: "Air Quality",
    emoji: "\uD83C\uDF2C\uFE0F",
    simpleSummary: {
      calm: "The air is clean for deep breathing today",
      mild: "The air could be a little better for deep breathing",
      moderate: "The air isn\u2019t great for deep breathing today",
      intense: "The air is poor for deep breathing today",
      extreme: "The air is hazardous for deep breathing today",
    },
    detail: "Air Quality Index (AQI) in your area measures pollutants, pollen, and particulate matter. For breathwork practitioners, air quality directly affects the safety and effectiveness of deep breathing exercises. Indoor practice is recommended when AQI exceeds 100.",
    tips: {
      calm: "Air is clean. Perfect conditions for outdoor breathwork, meditation, and pranayama.",
      mild: "Generally fine. Sensitive individuals may prefer indoor practice.",
      moderate: "Notable pollution or pollen. Indoor breathwork recommended. Keep windows closed during sessions.",
      intense: "Poor air quality. All breathwork should be done indoors. Use air purification if available.",
      extreme: "Hazardous conditions. Avoid any deep breathing exercises. Focus on gentle, shallow meditation instead.",
    },
    appLink: ECOSYSTEM_APPS.airas,
  },
  {
    id: "lunar",
    name: "Moon Phase",
    emoji: "\uD83C\uDF15", // Will be dynamically replaced
    simpleSummary: {
      calm: "The moon is resting \u2014 surrender and restore",
      mild: "The moon is growing \u2014 energy is building",
      moderate: "Half moon \u2014 time for action and decisions",
      intense: "Full moon \u2014 peak energy and illumination",
      extreme: "New moon \u2014 a powerful time for setting intentions",
    },
    detail: "The moon\u2019s gravitational pull affects Earth\u2019s tides, and many practitioners observe corresponding shifts in emotional and energetic patterns.",
    tips: {
      calm: "Gentle lunar energy. A quiet time for rest and integration.",
      mild: "Building energy. Good for starting new practices or revisiting goals.",
      moderate: "Quarter moon energy. Time for action, decisions, and creative expression.",
      intense: "Full moon energy amplifies everything. Release what no longer serves you. Sound healing with high-frequency instruments supports this.",
      extreme: "New moon \u2014 the most powerful time for intention setting. Journal, meditate, and set clear goals for the cycle ahead.",
    },
    appLink: ECOSYSTEM_APPS.lunata,
  },
  {
    id: "collective",
    name: "How People Feel",
    emoji: "\uD83E\uDEC2",
    simpleSummary: {
      calm: "Collective energy is peaceful right now",
      mild: "Collective energy is slightly tense right now",
      moderate: "Collective energy is noticeably charged right now",
      intense: "Collective energy is highly charged right now",
      extreme: "Collective energy is very charged right now",
    },
    detail: "This signal combines multiple data sources to estimate collective emotional energy. When geomagnetic activity is high, Schumann resonance is elevated, and solar activity is intense, research suggests more people experience stress, anxiety, and emotional sensitivity simultaneously. This collective field can affect you even when your personal circumstances are stable.",
    tips: {
      calm: "Collective energy is settled. A great time for individual deep work and personal practice.",
      mild: "Slight collective tension. Community connection helps. Consider reaching out to fellow practitioners.",
      moderate: "Notable collective stress. Group sessions and community sound healing are extra beneficial right now.",
      intense: "High collective tension. Your healing work matters more than ever. Even 5 minutes of shared humming creates ripples.",
      extreme: "Collective energy is very charged. Prioritise community healing. Group sound baths, virtual sessions \u2014 every bit helps.",
    },
    appLink: ECOSYSTEM_APPS.binara,
    secondaryAppLink: ECOSYSTEM_APPS.voxara,
  },
  {
    id: "solarWind",
    name: "Sun Activity",
    emoji: "\u2600\uFE0F",
    simpleSummary: {
      calm: "The sun is quiet \u2014 calm energy",
      mild: "The sun is mildly active \u2014 expect creativity",
      moderate: "The sun is moderately active \u2014 expect amplified emotions",
      intense: "The sun is very active \u2014 expect big emotions",
      extreme: "The sun is extremely active \u2014 expect intense emotions",
    },
    detail: "Solar wind is charged particles streaming from the sun. The sun goes through 11-year activity cycles, and we\u2019re near the peak of Solar Cycle 25. Higher solar activity sends more charged particles towards Earth, which many people experience as heightened creativity, emotional volatility, and energetic sensitivity.",
    tips: {
      calm: "Solar activity is low. Steady, grounded energy. Good for detailed, focused work.",
      mild: "Mildly active sun. You might feel a slight creative boost. Channel it into making or singing.",
      moderate: "Moderate solar activity. Creativity and emotions both amplified. Heart-centred frequencies (528 Hz) are supportive.",
      intense: "Very active sun. Expect strong emotions and bursts of creative energy. Toning, singing, and movement help channel this.",
      extreme: "Extreme solar activity. Emotional intensity likely. Heart chakra work and vagus nerve stimulation through humming strongly recommended.",
    },
    appLink: ECOSYSTEM_APPS.overtoneSinger,
  },
];

/* ===== Lunar Phase Mapping ===== */
export const LUNAR_PHASE_EMOJIS: Record<string, string> = {
  "new-moon": "\uD83C\uDF11",
  "waxing-crescent": "\uD83C\uDF12",
  "first-quarter": "\uD83C\uDF13",
  "waxing-gibbous": "\uD83C\uDF14",
  "full-moon": "\uD83C\uDF15",
  "waning-gibbous": "\uD83C\uDF16",
  "last-quarter": "\uD83C\uDF17",
  "waning-crescent": "\uD83C\uDF18",
};

export const LUNAR_PHASE_NAMES: Record<string, string> = {
  "new-moon": "New Moon",
  "waxing-crescent": "Waxing Crescent",
  "first-quarter": "First Quarter",
  "waxing-gibbous": "Waxing Gibbous",
  "full-moon": "Full Moon",
  "waning-gibbous": "Waning Gibbous",
  "last-quarter": "Last Quarter",
  "waning-crescent": "Waning Crescent",
};

export const LUNAR_SIMPLE_SUMMARIES: Record<string, string> = {
  "new-moon": "New moon \u2014 a powerful time for setting intentions",
  "waxing-crescent": "The moon is growing \u2014 energy is building",
  "first-quarter": "Half moon \u2014 time for action and decisions",
  "waxing-gibbous": "Almost full \u2014 refinement and preparation",
  "full-moon": "Full moon \u2014 peak energy and illumination",
  "waning-gibbous": "The moon is releasing \u2014 time to let go",
  "last-quarter": "Half moon \u2014 reflection and reassessment",
  "waning-crescent": "Moon resting \u2014 surrender and restore",
};

/* ===== Default Location (fallback if geolocation denied) ===== */
export const DEFAULT_LOCATION = {
  latitude: 54.96,
  longitude: -1.60,
  name: "Gateshead, UK",
};
