import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "World Pulse",
    short_name: "World Pulse",
    description: "How the world feels right now",
    start_url: "/",
    display: "standalone",
    background_color: "#06070b",
    theme_color: "#4ECDC4",
    orientation: "portrait",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/apple-touch-icon.svg",
        sizes: "180x180",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
    categories: ["health", "lifestyle", "weather"],
  };
}
