import { RotateCcw } from "lucide-react";
import { formatLongDate, getTodayKey } from "@/lib/dates";

interface HeaderProps {
  selectedDate: string;
  onReset: () => void;
  brand?: "bamzuk" | "italy" | "vividia";
}

export function Header({ selectedDate, onReset, brand = "italy" }: HeaderProps) {
  const isToday = selectedDate === getTodayKey();
  const brandContent = {
    bamzuk: {
      icon: "🛒",
      name: "Bamzuk TikTok Shop",
      surface: "bg-[linear-gradient(135deg,#f18527_0%,#ed6824_48%,#df4d1e_100%)] shadow-[0_18px_50px_rgba(174,70,26,0.17)]",
    },
    italy: {
      icon: "🍕",
      name: "Italy Pizza",
      surface: "bg-[linear-gradient(135deg,#826357_0%,#65483e_52%,#493229_100%)] shadow-[0_18px_50px_rgba(72,48,39,0.18)]",
    },
    vividia: {
      icon: "🌿",
      name: "Vividia",
      surface: "bg-[linear-gradient(135deg,#78ad5b_0%,#4d914f_52%,#327346_100%)] shadow-[0_18px_50px_rgba(52,112,66,0.18)]",
    },
  }[brand];

  return (
    <header className={`relative isolate overflow-hidden rounded-[26px] px-5 py-6 text-white sm:px-8 sm:py-8 lg:px-10 ${brandContent.surface}`}>
      <div className="absolute -right-16 -top-20 -z-10 size-64 rounded-full border-[42px] border-white/8" />
      <div className="absolute -bottom-20 left-[38%] -z-10 size-44 rounded-full bg-white/6 blur-2xl" />

      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] backdrop-blur-sm">
            <span aria-hidden="true" className="text-base leading-none">{brandContent.icon}</span>
            {brandContent.name}
          </div>
          <p className="mb-1 text-sm font-semibold text-white/85">
            {isToday ? "Actividad diaria de redes sociales" : "Consulta de publicaciones"}
          </p>
          <h1 className="text-[clamp(1.7rem,6vw,2.7rem)] font-extrabold leading-tight tracking-[-0.045em] first-letter:uppercase">
            {formatLongDate(selectedDate)}
          </h1>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-full border border-white/25 bg-white/12 px-4 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20 active:scale-[0.98]"
        >
          <RotateCcw aria-hidden="true" className="size-4" />
          Reiniciar día
        </button>
      </div>
    </header>
  );
}
