"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { fetchKpIndex, fetchSolarWind } from "@/lib/api/space-weather";
import { fetchAirQuality } from "@/lib/api/air-quality";
import { getSchumannEstimate } from "@/lib/api/schumann";
import { getLunarPhase } from "@/lib/api/lunar";
import { deriveCollectiveScore } from "@/lib/api/collective";
import {
  scoreKp,
  scoreSchumann,
  scoreSolarWind,
  scoreAqi,
  scoreLunar,
  calculateOverallPercentage,
  calculateOverallSeverity,
  severityFromNumber,
} from "@/lib/scoring";
import { generateGuidance } from "@/lib/guidance";
import {
  SIGNAL_DEFINITIONS,
  SEVERITY_CONFIG,
  SEVERITY_SUBTITLES,
  REFRESH_INTERVAL,
  DEFAULT_LOCATION,
  LUNAR_SIMPLE_SUMMARIES,
} from "@/lib/constants";
import { saveToCache, loadFromCache } from "@/lib/utils";
import type { SignalData, SignalFetchState, SeverityLevel } from "@/types";

const INITIAL_STATE: SignalFetchState = {
  signals: [],
  overall: {
    percentage: 0,
    severity: "calm",
    emoji: "\uD83D\uDE0C",
    title: "Loading\u2026",
    subtitle: "Fetching live data",
  },
  guidance: "",
  loading: true,
  lastUpdated: null,
};

function buildSignalData(
  signalId: string,
  percentage: number,
  severity: SeverityLevel,
  rawValue: number | string,
  unit: string,
  emojiOverride?: string,
  summaryOverride?: string
): SignalData | null {
  const def = SIGNAL_DEFINITIONS.find((s) => s.id === signalId);
  if (!def) return null;

  return {
    id: def.id,
    name: def.name,
    emoji: emojiOverride ?? def.emoji,
    percentage,
    severity,
    rawValue,
    unit,
    simpleSummary: summaryOverride ?? def.simpleSummary[severity],
    detailText: def.detail.replace("{value}", String(rawValue)),
    tip: def.tips[severity],
    appLink: def.appLink,
    secondaryAppLink: def.secondaryAppLink,
    lastUpdated: new Date(),
  };
}

interface GeoCoords {
  latitude: number;
  longitude: number;
}

export function useSignalData(): SignalFetchState {
  const [state, setState] = useState<SignalFetchState>(INITIAL_STATE);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const coordsRef = useRef<GeoCoords>({
    latitude: DEFAULT_LOCATION.latitude,
    longitude: DEFAULT_LOCATION.longitude,
  });

  // Get geolocation once
  useEffect(() => {
    // Try to show cached data immediately
    try {
      const cached = loadFromCache();
      if (cached && cached.signals.length > 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setState({ ...cached, loading: true }); // show cached but keep loading
      }
    } catch {
      // ignore cache errors
    }

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          coordsRef.current = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          };
        },
        () => {
          // Keep default location
        },
        { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 }
      );
    }
  }, []);

  const fetchAll = useCallback(async () => {
    try {
      // Client-side calculations (never fail)
      const lunar = getLunarPhase();
      const schumann = getSchumannEstimate();

      // Parallel API fetches with allSettled — individual failures use fallbacks
      const [kpResult, solarResult, aqiResult] = await Promise.allSettled([
        fetchKpIndex(),
        fetchSolarWind(),
        fetchAirQuality(coordsRef.current.latitude, coordsRef.current.longitude),
      ]);

      // Extract values with safe fallbacks
      const kpValue =
        kpResult.status === "fulfilled" ? kpResult.value.value : 2;
      const solarSpeed =
        solarResult.status === "fulfilled" ? solarResult.value.speed : 380;
      const aqiValue =
        aqiResult.status === "fulfilled" ? aqiResult.value.aqi : 35;

      // Score all signals
      const kpScore = scoreKp(kpValue);
      const schumannScore = scoreSchumann(schumann.frequency);
      const solarScore = scoreSolarWind(solarSpeed);
      const aqiScore = scoreAqi(aqiValue);
      const lunarScore = scoreLunar(lunar.severity);
      const collectiveResult = deriveCollectiveScore(
        kpScore.severity,
        schumannScore.severity,
        solarScore.severity,
        lunarScore.severity
      );
      const collectiveScore = {
        severity: collectiveResult.severity,
        percentage: collectiveResult.percentage,
      };

      const scores = {
        kp: kpScore,
        schumann: schumannScore,
        solarWind: solarScore,
        aqi: aqiScore,
        lunar: lunarScore,
        collective: collectiveScore,
      };

      const overallPercentage = calculateOverallPercentage(scores);
      const overallSeverityNum = calculateOverallSeverity(scores);
      const overallSeverity = severityFromNumber(overallSeverityNum);

      // Build signal data array — filter out nulls defensively
      const signals: SignalData[] = [
        buildSignalData(
          "schumann",
          schumannScore.percentage,
          severityFromNumber(schumannScore.severity),
          schumann.frequency,
          "Hz"
        ),
        buildSignalData(
          "kp",
          kpScore.percentage,
          severityFromNumber(kpScore.severity),
          kpValue,
          "KP"
        ),
        buildSignalData(
          "aqi",
          aqiScore.percentage,
          severityFromNumber(aqiScore.severity),
          aqiValue,
          "AQI"
        ),
        buildSignalData(
          "lunar",
          lunarScore.percentage,
          severityFromNumber(lunarScore.severity),
          `${lunar.illumination}%`,
          "",
          lunar.emoji,
          LUNAR_SIMPLE_SUMMARIES[lunar.phase]
        ),
        buildSignalData(
          "collective",
          collectiveScore.percentage,
          severityFromNumber(collectiveScore.severity),
          Math.round(collectiveResult.severity * 25),
          ""
        ),
        buildSignalData(
          "solarWind",
          solarScore.percentage,
          severityFromNumber(solarScore.severity),
          Math.round(solarSpeed),
          "km/s"
        ),
      ].filter((s): s is SignalData => s !== null);

      // Generate guidance
      const guidance = generateGuidance({
        overall: overallSeverityNum,
        schumann: schumannScore.severity,
        kp: kpScore.severity,
        aqi: aqiScore.severity,
        lunar,
        solarWind: solarScore.severity,
        collective: collectiveScore.severity,
      });

      const config = SEVERITY_CONFIG[overallSeverity];

      const newState: SignalFetchState = {
        signals,
        overall: {
          percentage: overallPercentage,
          severity: overallSeverity,
          emoji: config.emoji,
          title: config.label,
          subtitle: SEVERITY_SUBTITLES[overallSeverity],
        },
        guidance,
        loading: false,
        lastUpdated: new Date(),
      };

      setState(newState);
      saveToCache(newState);
    } catch (err) {
      console.warn("[WorldPulse] Data fetch error:", err);

      // Try cache first
      try {
        const cached = loadFromCache();
        if (cached && cached.signals.length > 0) {
          setState({ ...cached, loading: false });
          return;
        }
      } catch {
        // ignore
      }

      // Last resort: generate fallback data from client-side sources only
      try {
        const lunar = getLunarPhase();
        const schumann = getSchumannEstimate();
        const schumannScore = scoreSchumann(schumann.frequency);
        const lunarScore = scoreLunar(lunar.severity);
        const overallSeverity = severityFromNumber(
          (schumannScore.severity + lunarScore.severity) / 2
        );
        const config = SEVERITY_CONFIG[overallSeverity];

        const fallbackSignals: SignalData[] = [
          buildSignalData(
            "schumann",
            schumannScore.percentage,
            severityFromNumber(schumannScore.severity),
            schumann.frequency,
            "Hz"
          ),
          buildSignalData(
            "lunar",
            lunarScore.percentage,
            severityFromNumber(lunarScore.severity),
            `${lunar.illumination}%`,
            "",
            lunar.emoji,
            LUNAR_SIMPLE_SUMMARIES[lunar.phase]
          ),
        ].filter((s): s is SignalData => s !== null);

        setState({
          signals: fallbackSignals,
          overall: {
            percentage: Math.round(
              (schumannScore.percentage + lunarScore.percentage) / 2
            ),
            severity: overallSeverity,
            emoji: config.emoji,
            title: config.label,
            subtitle: SEVERITY_SUBTITLES[overallSeverity],
          },
          guidance:
            "Some signals are temporarily unavailable. Showing what we can calculate locally.",
          loading: false,
          lastUpdated: new Date(),
        });
      } catch {
        // Absolute last resort
        setState({
          ...INITIAL_STATE,
          loading: false,
          guidance: "Unable to fetch signals right now. Please try again shortly.",
          overall: {
            ...INITIAL_STATE.overall,
            title: "Connecting\u2026",
            subtitle: "Trying to reach data sources",
          },
        });
      }
    }
  }, []);

  useEffect(() => {
    // Small delay to let geolocation resolve, then fetch
    const timeout = setTimeout(fetchAll, 500);

    intervalRef.current = setInterval(fetchAll, REFRESH_INTERVAL);

    return () => {
      clearTimeout(timeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchAll]);

  return state;
}
