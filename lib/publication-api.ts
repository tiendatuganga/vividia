import { createEmptyDailyChecks } from "@/lib/publication-storage";
import type { DailyChecks } from "@/types/publication";

interface PublicationRecord {
  dateKey: string;
  platformId: string;
  publicationId: string;
}

async function readError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error ?? "No se pudo sincronizar con Turso.";
  } catch {
    return "No se pudo sincronizar con Turso.";
  }
}

export async function fetchPublicationDays(
  dateKeys: string[],
  signal?: AbortSignal,
): Promise<Record<string, DailyChecks>> {
  const response = await fetch(`/api/publications?dates=${encodeURIComponent(dateKeys.join(","))}`, {
    cache: "no-store",
    signal,
  });

  if (!response.ok) throw new Error(await readError(response));

  const data = (await response.json()) as { records?: PublicationRecord[] };
  const days = Object.fromEntries(dateKeys.map((dateKey) => [dateKey, createEmptyDailyChecks()]));

  for (const record of data.records ?? []) {
    const platform = days[record.dateKey]?.[record.platformId];
    if (platform && record.publicationId in platform) platform[record.publicationId] = true;
  }

  return days;
}

export async function savePublicationCheck(
  dateKey: string,
  platformId: string,
  publicationId: string,
  checked: boolean,
): Promise<void> {
  const response = await fetch("/api/publications", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dateKey, platformId, publicationId, checked }),
  });

  if (!response.ok) throw new Error(await readError(response));
}

export async function resetPublicationDay(dateKey: string, platformIds?: string[]): Promise<void> {
  const response = await fetch("/api/publications", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dateKey, platformIds }),
  });

  if (!response.ok) throw new Error(await readError(response));
}
