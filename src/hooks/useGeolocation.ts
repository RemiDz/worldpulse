"use client";

import { useState, useEffect } from "react";

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  loading: boolean;
  error: string | null;
}

const INITIAL: GeolocationState = {
  latitude: null,
  longitude: null,
  loading: true,
  error: null,
};

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>(() => {
    // SSR guard
    if (typeof window === "undefined") return INITIAL;
    if (!navigator.geolocation) {
      return { ...INITIAL, loading: false, error: "Geolocation not supported" };
    }
    return INITIAL;
  });

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          loading: false,
          error: null,
        });
      },
      () => {
        setState({
          latitude: null,
          longitude: null,
          loading: false,
          error: "Location access denied",
        });
      },
      {
        enableHighAccuracy: false,
        timeout: 10_000,
        maximumAge: 300_000,
      }
    );
  }, []);

  return state;
}
