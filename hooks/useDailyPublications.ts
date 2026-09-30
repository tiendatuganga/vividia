"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getRecentDateKeys } from "@/lib/dates";
import { fetchPublicationDays, resetPublicationDay, savePublicationCheck } from "@/lib/publication-api";
import { createEmptyDailyChecks, publicationStorage } from "@/lib/publication-storage";
import type { DailyChecks, SyncStatus } from "@/types/publication";

interface DailyState {
  dateKey: string;
  checks: DailyChecks;
  days: Record<string, DailyChecks>;
  syncStatus: SyncStatus;
}

export function useDailyPublications(dateKey: string) {
  const [dailyState, setDailyState] = useState<DailyState>(() => ({
    dateKey: "",
    checks: createEmptyDailyChecks(),
    days: {},
    syncStatus: "loading",
  }));
  const stateRef = useRef(dailyState);
  const pendingMutations = useRef(0);
  const mutationQueue = useRef<Promise<void>>(Promise.resolve());
  const commitState = useCallback((next: DailyState) => {
    stateRef.current = next;
    setDailyState(next);
  }, []);

  useEffect(() => {
    const dateKeys = [...new Set([dateKey, ...getRecentDateKeys(7)])];
    const cachedDays = publicationStorage.getDays(dateKeys);
    const controller = new AbortController();
    let cancelled = false;

    const timeoutId = window.setTimeout(() => {
      commitState({
        dateKey,
        checks: cachedDays[dateKey],
        days: cachedDays,
        syncStatus: "loading",
      });
      void refresh();
    }, 0);

    const refresh = async () => {
      if (pendingMutations.current > 0) return;

      try {
        const remoteDays = await fetchPublicationDays(dateKeys, controller.signal);
        if (cancelled) return;

        for (const [day, checks] of Object.entries(remoteDays)) {
          publicationStorage.saveDay(day, checks);
        }

        if (stateRef.current.dateKey === dateKey) {
          commitState({
            dateKey,
            checks: remoteDays[dateKey],
            days: remoteDays,
            syncStatus: "synced",
          });
        }
      } catch {
        if (cancelled || controller.signal.aborted) return;
        const current = stateRef.current;
        if (current.dateKey === dateKey) commitState({ ...current, syncStatus: "offline" });
      }
    };

    const intervalId = window.setInterval(() => void refresh(), 10_000);

    return () => {
      cancelled = true;
      controller.abort();
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, [commitState, dateKey]);

  const enqueueMutation = useCallback((mutationDate: string, task: () => Promise<void>) => {
    pendingMutations.current += 1;
    const current = stateRef.current;
    if (current.dateKey === mutationDate) commitState({ ...current, syncStatus: "saving" });

    mutationQueue.current = mutationQueue.current
      .catch(() => undefined)
      .then(task)
      .then(() => {
        pendingMutations.current -= 1;
        if (pendingMutations.current === 0) {
          const latest = stateRef.current;
          if (latest.dateKey === mutationDate) commitState({ ...latest, syncStatus: "synced" });
        }
      })
      .catch(() => {
        pendingMutations.current -= 1;
        const latest = stateRef.current;
        if (latest.dateKey === mutationDate) commitState({ ...latest, syncStatus: "offline" });
      });
  }, [commitState]);

  const toggle = useCallback(
    (platformId: string, publicationId: string) => {
      const current = stateRef.current;
      if (current.dateKey !== dateKey) return;

      const checked = !current.checks[platformId]?.[publicationId];
      const next: DailyChecks = {
        ...current.checks,
        [platformId]: {
          ...current.checks[platformId],
          [publicationId]: checked,
        },
      };
      const nextState: DailyState = {
        ...current,
        checks: next,
        days: { ...current.days, [dateKey]: next },
        syncStatus: "saving",
      };

      commitState(nextState);
      publicationStorage.saveDay(dateKey, next);
      enqueueMutation(dateKey, () => savePublicationCheck(dateKey, platformId, publicationId, checked));
    },
    [commitState, dateKey, enqueueMutation],
  );

  const reset = useCallback((platformIds?: string[]) => {
    const empty = publicationStorage.resetDay(dateKey, platformIds);
    const current = stateRef.current;
    const nextState: DailyState = {
      ...current,
      dateKey,
      checks: empty,
      days: { ...current.days, [dateKey]: empty },
      syncStatus: "saving",
    };

    commitState(nextState);
    enqueueMutation(dateKey, () => resetPublicationDay(dateKey, platformIds));
  }, [commitState, dateKey, enqueueMutation]);

  return {
    checks: dailyState.checks,
    days: dailyState.days,
    syncStatus: dailyState.syncStatus,
    isReady: dailyState.dateKey === dateKey,
    toggle,
    reset,
  };
}
