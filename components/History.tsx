import { CheckCircle2, Clock3 } from "lucide-react";
import { formatShortDate } from "@/lib/dates";
import type { DailySummary } from "@/types/publication";

interface HistoryProps {
  days: DailySummary[];
}

export function History({ days }: HistoryProps) {
  return (
    <section aria-labelledby="history-title" className="rounded-[24px] border border-[#d1d5db] bg-white p-5 shadow-[0_12px_35px_rgba(17,24,39,0.04)] sm:p-7">
      <div className="mb-4">
        <p className="mb-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-black">Últimos 7 días</p>
        <h2 id="history-title" className="text-xl font-extrabold tracking-[-0.03em] text-black">Historial</h2>
      </div>

      <div className="divide-y divide-[#e5e7eb]">
        {days.map((day) => {
          const isComplete = day.completed === day.total;

          return (
            <div
              key={day.date}
              className="grid min-h-[58px] w-full grid-cols-[minmax(64px,0.7fr)_1fr_auto] items-center gap-3 rounded-xl px-2 text-left sm:grid-cols-[1fr_2fr_auto] sm:px-3"
            >
              <span className="font-extrabold text-black first-letter:uppercase">{formatShortDate(day.date)}</span>
              <span className="flex items-center gap-2.5">
                {isComplete ? <CheckCircle2 aria-hidden="true" className="size-4 shrink-0 text-[#4b9a5a]" /> : <Clock3 aria-hidden="true" className="size-4 shrink-0 text-[#6b7280]" />}
                <span className="text-sm font-bold text-black">{day.completed}/{day.total}</span>
                <span className="hidden h-1.5 max-w-32 flex-1 overflow-hidden rounded-full bg-[#e5e7eb] sm:block">
                  <span className={`block h-full rounded-full ${isComplete ? "bg-[#5aa467]" : "bg-[#ed762e]"}`} style={{ width: `${day.percentage}%` }} />
                </span>
              </span>
              <span className="text-sm font-extrabold text-black">{day.percentage}%</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
