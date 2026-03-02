"use client";

import AmbientBackground from "@/components/layout/AmbientBackground";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroCard from "@/components/hero/HeroCard";
import SignalList from "@/components/signals/SignalList";
import { useSignalData } from "@/hooks/useSignalData";

export default function Home() {
  const { signals, overall, guidance, loading, lastUpdated } = useSignalData();

  return (
    <main className="relative min-h-dvh">
      <AmbientBackground />
      <div
        className="relative mx-auto max-w-[520px] px-4 pb-8"
        style={{ zIndex: 1 }}
      >
        <Header />

        <HeroCard
          overall={overall}
          guidance={guidance}
          lastUpdated={lastUpdated}
          loading={loading}
        />

        <SignalList signals={signals} loading={loading} />

        <Footer />
      </div>
    </main>
  );
}
