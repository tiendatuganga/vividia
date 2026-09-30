import { getDailyPublicationTotal, getPlatformItems, platforms } from "@/config/platforms";
import type { DailyChecks, DailySummary, PlatformConfig } from "@/types/publication";

export function countCompleted(checks: DailyChecks, platformList: PlatformConfig[] = platforms): number {
  return platformList.reduce(
    (total, platform) =>
      total +
      getPlatformItems(platform).filter((item) => checks[platform.id]?.[item.id]).length,
    0,
  );
}

export function createDailySummary(
  date: string,
  checks: DailyChecks,
  platformList: PlatformConfig[] = platforms,
): DailySummary {
  const completed = countCompleted(checks, platformList);
  const total = getDailyPublicationTotal(platformList);
  return {
    date,
    completed,
    total,
    percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}
