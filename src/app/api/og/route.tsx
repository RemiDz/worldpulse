import { ImageResponse } from "next/og";

export const runtime = "edge";

const SEVERITY_COLORS: Record<string, string> = {
  calm: "#4ECDC4",
  mild: "#7ED88C",
  moderate: "#FFD93D",
  intense: "#FF8C42",
  extreme: "#FF6B6B",
};

const SEVERITY_EMOJIS: Record<string, string> = {
  calm: "\uD83D\uDE0C",
  mild: "\uD83C\uDF3F",
  moderate: "\uD83C\uDF0A",
  intense: "\uD83D\uDE30",
  extreme: "\uD83C\uDF0B",
};

const SEVERITY_LABELS: Record<string, string> = {
  calm: "Calm Day",
  mild: "Mild Day",
  moderate: "Moderate Day",
  intense: "Intense Day",
  extreme: "Extreme Day",
};

function getSeverityFromKp(kp: number): string {
  if (kp <= 1) return "calm";
  if (kp <= 2) return "mild";
  if (kp <= 4) return "moderate";
  if (kp <= 6) return "intense";
  return "extreme";
}

export async function GET() {
  let severity = "moderate";
  let kpValue = "3";

  try {
    const res = await fetch(
      "https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json",
      { next: { revalidate: 300 } }
    );
    if (res.ok) {
      const data: string[][] = await res.json();
      for (let i = data.length - 1; i > 0; i--) {
        const kp = parseFloat(data[i][1]);
        if (!isNaN(kp)) {
          severity = getSeverityFromKp(kp);
          kpValue = kp.toFixed(1);
          break;
        }
      }
    }
  } catch {
    // Use defaults
  }

  const color = SEVERITY_COLORS[severity];
  const emoji = SEVERITY_EMOJIS[severity];
  const label = SEVERITY_LABELS[severity];

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#06070b",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />

        {/* Top label */}
        <div
          style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: 16,
            letterSpacing: "0.2em",
            textTransform: "uppercase" as const,
            fontWeight: 700,
            marginBottom: 24,
          }}
        >
          WORLD PULSE
        </div>

        {/* Emoji */}
        <div style={{ fontSize: 80, marginBottom: 16 }}>{emoji}</div>

        {/* Title */}
        <div
          style={{
            color: "rgba(255,255,255,0.9)",
            fontSize: 48,
            fontWeight: 400,
            marginBottom: 8,
          }}
        >
          {label}
        </div>

        {/* Subtitle */}
        <div
          style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: 20,
            marginBottom: 32,
          }}
        >
          KP Index: {kpValue} &middot; How the world feels right now
        </div>

        {/* Bar */}
        <div
          style={{
            width: 400,
            height: 12,
            borderRadius: 6,
            background: "rgba(255,255,255,0.05)",
            position: "relative",
            display: "flex",
          }}
        >
          <div
            style={{
              width: "60%",
              height: "100%",
              borderRadius: 6,
              background: `linear-gradient(90deg, #4ECDC4, ${color})`,
            }}
          />
        </div>

        {/* Branding */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            color: "rgba(255,255,255,0.25)",
            fontSize: 14,
            letterSpacing: "0.15em",
            textTransform: "uppercase" as const,
          }}
        >
          Part of Harmonic Waves
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
