"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CloudCheck, LoaderCircle, WifiOff } from "lucide-react";
import { DailyProgress } from "@/components/DailyProgress";
import { Header } from "@/components/Header";
import { PlatformCard } from "@/components/PlatformCard";
import { ResetDayDialog } from "@/components/ResetDayDialog";
import { vividiaPlatforms } from "@/config/platforms";
import { useDailyPublications } from "@/hooks/useDailyPublications";
import { getTodayKey } from "@/lib/dates";
import { createDailySummary } from "@/lib/progress";
import type { PlatformIcon } from "@/types/publication";

const syncMessages = {
  loading: "Conectando con Turso…",
  saving: "Guardando cambios…",
  synced: "Cambios compartidos y guardados.",
  offline: "Sin conexión con Turso. Copia guardada en este dispositivo.",
} as const;

const vividiaSocialLinks: Partial<Record<PlatformIcon, string>> = {
  youtube: "https://www.youtube.com/channel/UChS2DK198-2AV3wwCyTFIOQ",
  instagram: "https://www.instagram.com/vividia_oficial?stkn=bm94a2psMm5jeGEz&utm_source=qr",
  facebook: "https://www.facebook.com/profile.php?id=61594483178356",
};

const vividiaDisplayPlatforms = [
  ...vividiaPlatforms.filter((platform) => platform.icon !== "tiktok"),
  ...vividiaPlatforms.filter((platform) => platform.icon === "tiktok"),
];

export function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(getTodayKey);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const { checks, syncStatus, isReady, toggle, reset } = useDailyPublications(selectedDate);
  const summary = useMemo(
    () => createDailySummary(selectedDate, checks, vividiaPlatforms),
    [selectedDate, checks],
  );

  const closeResetDialog = useCallback(() => setResetDialogOpen(false), []);

  useEffect(() => {
    const intervalId = window.setInterval(() => setSelectedDate(getTodayKey()), 60_000);
    return () => window.clearInterval(intervalId);
  }, []);

  const confirmReset = () => {
    reset(vividiaPlatforms.map((platform) => platform.id));
    setResetDialogOpen(false);
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1180px] px-4 py-4 sm:px-6 sm:py-7 lg:px-8 lg:py-10">
      <div className="space-y-4 sm:space-y-5">
        <Header selectedDate={selectedDate} onReset={() => setResetDialogOpen(true)} brand="vividia" />
        <DailyProgress completed={summary.completed} total={summary.total} percentage={summary.percentage} theme="green" />

        <section aria-label="Publicaciones por plataforma" className={`grid grid-cols-1 gap-4 transition-opacity duration-200 sm:gap-5 lg:grid-cols-2 ${isReady ? "opacity-100" : "pointer-events-none opacity-55"}`}>
          {vividiaDisplayPlatforms.map((platform) => (
            <PlatformCard
              key={platform.id}
              platform={platform}
              checks={checks[platform.id]}
              url={vividiaSocialLinks[platform.icon]}
              showOpenButton
              theme="green"
              disabled={!isReady}
              onToggle={(publicationId) => toggle(platform.id, publicationId)}
            />
          ))}
        </section>

        <footer className="flex items-center justify-center gap-2 pb-4 pt-2 text-center text-xs font-semibold text-black sm:text-sm" aria-live="polite">
          {syncStatus === "offline" ? (
            <WifiOff aria-hidden="true" className="size-4 text-[#478a50]" />
          ) : syncStatus === "loading" || syncStatus === "saving" ? (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin text-[#478a50]" />
          ) : (
            <CloudCheck aria-hidden="true" className="size-4 text-[#4c9560]" />
          )}
          {syncMessages[syncStatus]}
        </footer>
      </div>

      <ResetDayDialog open={resetDialogOpen} dateKey={selectedDate} onCancel={closeResetDialog} onConfirm={confirmReset} theme="green" />
    </main>
  );
}
