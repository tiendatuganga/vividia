import { allPlatforms, getPlatformItems } from "@/config/platforms";
import type { DailyChecks } from "@/types/publication";

const STORAGE_KEY = "italy-pizza:publication-control:v1";
const SCHEMA_VERSION = 1;

interface PublicationStore {
  schemaVersion: number;
  dates: Record<string, DailyChecks>;
}

function emptyStore(): PublicationStore {
  return { schemaVersion: SCHEMA_VERSION, dates: {} };
}

export function createEmptyDailyChecks(): DailyChecks {
  return Object.fromEntries(
    allPlatforms.map((platform) => [
      platform.id,
      Object.fromEntries(getPlatformItems(platform).map((item) => [item.id, false])),
    ]),
  );
}

function normalizeDay(value: unknown): DailyChecks {
  const source = value && typeof value === "object" ? (value as DailyChecks) : {};
  const empty = createEmptyDailyChecks();

  for (const platform of allPlatforms) {
    for (const item of getPlatformItems(platform)) {
      empty[platform.id][item.id] = Boolean(source[platform.id]?.[item.id]);
    }
  }

  return empty;
}

function readStore(): PublicationStore {
  if (typeof window === "undefined") return emptyStore();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();

    const parsed = JSON.parse(raw) as Partial<PublicationStore>;
    if (!parsed.dates || typeof parsed.dates !== "object") return emptyStore();

    return {
      schemaVersion: SCHEMA_VERSION,
      dates: parsed.dates,
    };
  } catch {
    return emptyStore();
  }
}

function writeStore(store: PublicationStore): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export const publicationStorage = {
  getDay(dateKey: string): DailyChecks {
    return normalizeDay(readStore().dates[dateKey]);
  },

  getDays(dateKeys: string[]): Record<string, DailyChecks> {
    const store = readStore();
    return Object.fromEntries(dateKeys.map((dateKey) => [dateKey, normalizeDay(store.dates[dateKey])]));
  },

  saveDay(dateKey: string, checks: DailyChecks): void {
    const store = readStore();
    store.dates[dateKey] = normalizeDay(checks);
    writeStore(store);
  },

  resetDay(dateKey: string, platformIds?: string[]): DailyChecks {
    const store = readStore();
    if (!platformIds?.length) {
      delete store.dates[dateKey];
    } else {
      const day = normalizeDay(store.dates[dateKey]);
      const empty = createEmptyDailyChecks();
      for (const platformId of platformIds) {
        if (empty[platformId]) day[platformId] = empty[platformId];
      }
      store.dates[dateKey] = day;
    }
    writeStore(store);
    return normalizeDay(store.dates[dateKey]);
  },
};
