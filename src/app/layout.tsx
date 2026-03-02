import type { Metadata, Viewport } from "next";
import { Instrument_Serif, DM_Sans, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "World Pulse \u2014 How the World Feels Right Now",
  description:
    "Real-time awareness of the forces shaping how we feel. From Earth\u2019s magnetic field to collective emotional currents \u2014 translated into guidance for healing practitioners.",
  keywords: [
    "schumann resonance today",
    "geomagnetic storm effects on humans",
    "why cant I sleep tonight",
    "full moon effects on mood",
    "why is everyone stressed today",
    "why do I feel anxious today",
    "energy forecast",
    "sound healing",
    "earth frequency",
  ],
  metadataBase: new URL("https://worldpulse.app"),
  openGraph: {
    title: "World Pulse \u2014 How the World Feels Right Now",
    description:
      "The energy forecast for your mind, body, and practice.",
    images: [{ url: "/api/og", width: 1200, height: 630 }],
    type: "website",
    siteName: "World Pulse",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: "World Pulse \u2014 How the World Feels Right Now",
    description:
      "The energy forecast for your mind, body, and practice.",
    images: ["/api/og"],
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#06070b",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {process.env.NODE_ENV === "production" && (
          <Script
            defer
            data-domain="worldpulse.app"
            src="https://plausible.io/js/script.js"
            strategy="afterInteractive"
          />
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "World Pulse",
              description:
                "Real-time earth intelligence dashboard for healing practitioners",
              url: "https://worldpulse.app",
              applicationCategory: "HealthApplication",
              operatingSystem: "Any",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
            }),
          }}
        />
      </head>
      <body
        className={`${instrumentSerif.variable} ${dmSans.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
