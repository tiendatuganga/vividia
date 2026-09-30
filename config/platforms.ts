import type { PlatformConfig, PublicationItem, PublicationKind } from "@/types/publication";

export const platforms: PlatformConfig[] = [
  {
    id: "tiktok",
    name: "TikTok",
    icon: "tiktok",
    videos: 3,
    stories: 2,
    accent: "#211a17",
    accentSoft: "#f0ece8",
  },
  {
    id: "youtube",
    name: "YouTube Shorts",
    icon: "youtube",
    videos: 3,
    stories: 0,
    accent: "#e5483d",
    accentSoft: "#fff0ed",
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: "instagram",
    videos: 3,
    stories: 2,
    accent: "#b33c80",
    accentSoft: "#fceef6",
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: "facebook",
    videos: 3,
    stories: 2,
    accent: "#2877d4",
    accentSoft: "#edf5ff",
  },
];

export const vividiaPlatforms: PlatformConfig[] = platforms.map((platform) => ({
  ...platform,
  id: `vividia-${platform.id}`,
}));

export const bamzukPlatforms: PlatformConfig[] = platforms
  .filter((platform) => platform.id === "tiktok")
  .map((platform) => ({
    ...platform,
    id: `bamzuk-${platform.id}`,
    name: "TikTok Shop",
  }));

export const allPlatforms: PlatformConfig[] = [...platforms, ...vividiaPlatforms, ...bamzukPlatforms];

function createItems(kind: PublicationKind, amount: number): PublicationItem[] {
  const noun = kind === "video" ? "Video" : "Historia";

  return Array.from({ length: amount }, (_, index) => {
    const ordinal = index + 1;
    return {
      id: `${kind}-${ordinal}`,
      distributionId: `${kind}-${ordinal}`,
      label: `${noun} ${ordinal}`,
      kind,
      ordinal,
    };
  });
}

export function getPlatformItems(platform: PlatformConfig): PublicationItem[] {
  return [
    ...createItems("video", platform.videos),
    ...createItems("story", platform.stories),
  ];
}

export function getPlatformTotal(platform: PlatformConfig): number {
  return platform.videos + platform.stories;
}

export function getDailyPublicationTotal(platformList: PlatformConfig[]): number {
  return platformList.reduce(
    (total, platform) => total + getPlatformTotal(platform),
    0,
  );
}

export const dailyPublicationTotal = getDailyPublicationTotal(platforms);
export const vividiaDailyPublicationTotal = getDailyPublicationTotal(vividiaPlatforms);
export const bamzukDailyPublicationTotal = getDailyPublicationTotal(bamzukPlatforms);
