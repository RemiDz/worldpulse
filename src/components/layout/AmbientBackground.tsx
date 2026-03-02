"use client";

import { useEffect, useState } from "react";

function getTimeOfDayColors() {
  const hour = new Date().getHours();

  if (hour >= 22 || hour < 5) {
    return { teal: "#3ABDB8", violet: "#B8A8F0", coral: "#D87A5A" };
  }
  if (hour >= 5 && hour < 10) {
    return { teal: "#5AD8C8", violet: "#D4C4FF", coral: "#FFA060" };
  }
  if (hour >= 17 && hour < 22) {
    return { teal: "#50D0BC", violet: "#D0C0F8", coral: "#FF9850" };
  }
  return { teal: "#4ECDC4", violet: "#C9B8FF", coral: "#FF8C42" };
}

const DEFAULT_COLORS = { teal: "#4ECDC4", violet: "#C9B8FF", coral: "#FF8C42" };

export default function AmbientBackground() {
  // Start with stable defaults for SSR, update after mount
  const [colors, setColors] = useState(DEFAULT_COLORS);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setColors(getTimeOfDayColors());
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      <div
        className="absolute rounded-full"
        style={{
          width: 400,
          height: 400,
          top: "-5%",
          left: "-10%",
          background: `radial-gradient(circle, ${colors.teal} 0%, transparent 70%)`,
          filter: "blur(70px)",
          opacity: 0.04,
          animation: "orb-drift-1 32s ease-in-out infinite",
          willChange: "transform",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 350,
          height: 350,
          top: "30%",
          right: "-8%",
          background: `radial-gradient(circle, ${colors.violet} 0%, transparent 70%)`,
          filter: "blur(65px)",
          opacity: 0.03,
          animation: "orb-drift-2 38s ease-in-out infinite",
          willChange: "transform",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 450,
          height: 450,
          bottom: "-10%",
          left: "20%",
          background: `radial-gradient(circle, ${colors.coral} 0%, transparent 70%)`,
          filter: "blur(75px)",
          opacity: 0.035,
          animation: "orb-drift-3 28s ease-in-out infinite",
          willChange: "transform",
        }}
      />
    </div>
  );
}
