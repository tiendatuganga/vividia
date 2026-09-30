export type PublicationKind = "video" | "story";

export type PlatformIcon = "tiktok" | "youtube" | "instagram" | "facebook";
export type PlatformId = string;
export type PublicationTheme = "orange" | "brown" | "green";

export interface PlatformConfig {
  id: PlatformId;
  name: string;
  icon: PlatformIcon;
  videos: number;
  stories: number;
  accent: string;
  accentSoft: string;
}

export interface PublicationItem {
  id: string;
  distributionId: string;
  label: string;
  kind: PublicationKind;
  ordinal: number;
}

export type PlatformChecks = Record<string, boolean>;
export type DailyChecks = Record<string, PlatformChecks>;

export interface DailySummary {
  date: string;
  completed: number;
  total: number;
  percentage: number;
}

export type SyncStatus = "loading" | "synced" | "saving" | "offline";
