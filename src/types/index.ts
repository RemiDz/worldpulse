export type SeverityLevel = "calm" | "mild" | "moderate" | "intense" | "extreme";

export interface SeverityInfo {
  level: SeverityLevel;
  label: string;
  color: string;
  gradient: string;
  emoji: string;
}

export interface AppLink {
  name: string;
  url: string;
  description: string;
}

export interface SignalDefinition {
  id: string;
  name: string;
  emoji: string;
  simpleSummary: Record<SeverityLevel, string>;
  detail: string;
  tips: Record<SeverityLevel, string>;
  appLink: AppLink;
  secondaryAppLink?: AppLink;
}

export interface SignalData {
  id: string;
  name: string;
  emoji: string;
  percentage: number;
  severity: SeverityLevel;
  rawValue: number | string;
  unit: string;
  simpleSummary: string;
  detailText: string;
  tip: string;
  appLink: AppLink;
  secondaryAppLink?: AppLink;
  lastUpdated: Date | null;
  metadata?: Record<string, unknown>;
}

export type LunarPhase =
  | "new-moon"
  | "waxing-crescent"
  | "first-quarter"
  | "waxing-gibbous"
  | "full-moon"
  | "waning-gibbous"
  | "last-quarter"
  | "waning-crescent";

export interface LunarPhaseInfo {
  phase: LunarPhase;
  illumination: number;
  emoji: string;
  name: string;
  severity: number;
  dayInCycle: number;
}

export interface GuidanceContext {
  overall: number;
  schumann: number;
  kp: number;
  aqi: number;
  lunar: LunarPhaseInfo;
  solarWind: number;
  collective: number;
}

export interface OverallState {
  percentage: number;
  severity: SeverityLevel;
  emoji: string;
  title: string;
  subtitle: string;
}

export interface SignalFetchState {
  signals: SignalData[];
  overall: OverallState;
  guidance: string;
  loading: boolean;
  lastUpdated: Date | null;
}
