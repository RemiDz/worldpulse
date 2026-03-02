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
import { saveToCache, loadFromCache, isCacheStale } from "@/lib/utils";
import type { SignalData, SignalFetchState, SeverityLevel } from "@/types";

function buildSignalData(
  signalId: string,
  percentage: number,
  severity: SeverityLevel,
  rawValue: number | string,
  unit: string,
  emojiOverride?: string,
  summaryOverride?: string
): SignalData {
  const def = SIGNAL_DEFINITIONS.find((s) => s.id === signalId);
  if (!def) throw new Error(`Unknown signal: ${signalId}`);

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
  const [state, setState] = useState<SignalFetchState>(() => {
    // Try to load from cache for instant display
    const cached = loadFromCache();
    if (cached && !isCacheStale(REFRESH_INTERVAL)) {
      return { ...cached, loading: false };
    }
    return {
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
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const coordsRef = useRef<GeoCoords | null>(null);

  // Get geolocation once
  useEffect(() => {
    if (!navigator.geolocation) {
      coordsRef.current = {
        latitude: DEFAULT_LOCATION.latitude,
        longitude: DEFAULT_LOCATION.longitude,
      };
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        coordsRef.current = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
      },
      () => {
        coordsRef.current = {
          latitude: DEFAULT_LOCATION.latitude,
          longitude: DEFAULT_LOCATION.longitude,
        };
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 }
    );
  }, []);

  const fetchAll = useCallback(async () => {
    try {
      // Client-side calculations (never fail)
      const lunar = getLunarPhase();
      const schumann = getSchumannEstimate();

      // Parallel API fetches
      const coords = coordsRef.current ?? {
        latitude: DEFAULT_LOCATION.latitude,
        longitude: DEFAULT_LOCATION.longitude,
      };

      const [kpResult, solarResult, aqiResult] = await Promise.allSettled([
        fetchKpIndex(),
        fetchSolarWind(),
        fetchAirQuality(coords.latitude, coords.longitude),
      ]);

      // Extract values with fallbacks
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

      // Build signal data array
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
      ];

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
    } catch {
      // If total failure, try cache
      const cached = loadFromCache();
      if (cached) {
        setState({ ...cached, loading: false });
      } else {
        setState((prev) => ({ ...prev, loading: false }));
      }
    }
  }, []);

  useEffect(() => {
    // Small delay to let geolocation resolve
    const timeout = setTimeout(() => {
      fetchAll();
    }, 500);

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
