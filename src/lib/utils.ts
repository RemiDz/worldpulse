import { CACHE_KEY } from "@/lib/constants";
import type { SignalFetchState } from "@/types";

interface CachedData {
  state: SignalFetchState;
  timestamp: number;
}

export function saveToCache(state: SignalFetchState): void {
  try {
    const cached: CachedData = {
      state,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
  } catch {
    // localStorage might be full or unavailable
  }
}

export function loadFromCache(): SignalFetchState | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const cached: CachedData = JSON.parse(raw);

    // Restore Date objects
    if (cached.state.lastUpdated) {
      cached.state.lastUpdated = new Date(cached.state.lastUpdated);
    }
    cached.state.signals = cached.state.signals.map((s) => ({
      ...s,
      lastUpdated: s.lastUpdated ? new Date(s.lastUpdated) : null,
    }));

    return cached.state;
  } catch {
    return null;
  }
}

export function isCacheStale(ttlMs: number): boolean {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return true;
    const cached: CachedData = JSON.parse(raw);
    return Date.now() - cached.timestamp > ttlMs;
  } catch {
    return true;
  }
}

export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}
