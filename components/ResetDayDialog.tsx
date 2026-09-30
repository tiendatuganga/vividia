"use client";

import { useEffect, useRef } from "react";
import { AlertCircle, X } from "lucide-react";
import { formatLongDate } from "@/lib/dates";
import type { PublicationTheme } from "@/types/publication";

interface ResetDayDialogProps {
  open: boolean;
  dateKey: string;
  onCancel: () => void;
  onConfirm: () => void;
  theme?: PublicationTheme;
}

export function ResetDayDialog({ open, dateKey, onCancel, onConfirm, theme = "orange" }: ResetDayDialogProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const resetTheme = {
    orange: { icon: "bg-[#fff0e5] text-[#df5c22]", button: "bg-[#e65e23] shadow-[0_8px_20px_rgba(218,83,27,0.2)] hover:bg-[#d9511b]" },
    brown: { icon: "bg-[#f1ebe8] text-[#68483d]", button: "bg-[#65483e] shadow-[0_8px_20px_rgba(72,48,39,0.2)] hover:bg-[#51382f]" },
    green: { icon: "bg-[#e8f4e7] text-[#3f824d]", button: "bg-[#478a50] shadow-[0_8px_20px_rgba(63,130,77,0.2)] hover:bg-[#397844]" },
  }[theme];

  useEffect(() => {
    if (!open) return;
    cancelButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#2b1d17]/45 p-4 backdrop-blur-[3px]" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onCancel()}>
      <div role="alertdialog" aria-modal="true" aria-labelledby="reset-title" aria-describedby="reset-description" className="w-full max-w-md rounded-[26px] border border-[#d1d5db] bg-white p-5 shadow-[0_28px_90px_rgba(17,24,39,0.3)] sm:p-7">
        <div className="mb-5 flex items-start justify-between gap-4">
          <span className={`grid size-12 place-items-center rounded-2xl ${resetTheme.icon}`}>
            <AlertCircle aria-hidden="true" className="size-6" />
          </span>
          <button type="button" onClick={onCancel} aria-label="Cerrar" className="grid size-10 place-items-center rounded-full text-[#4b5563] transition hover:bg-[#f3f4f6]">
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>
        <h2 id="reset-title" className="text-xl font-extrabold tracking-[-0.03em] text-black">¿Reiniciar este día?</h2>
        <p id="reset-description" className="mt-2 text-sm font-medium leading-6 text-black first-letter:uppercase">
          Se desmarcarán todas las publicaciones del {formatLongDate(dateKey)}. El resto del historial no cambiará.
        </p>
        <div className="mt-7 grid grid-cols-2 gap-3">
          <button ref={cancelButtonRef} type="button" onClick={onCancel} className="min-h-12 rounded-2xl border border-[#d1d5db] bg-white px-4 text-sm font-extrabold text-black transition hover:bg-[#f3f4f6] active:scale-[0.98]">
            Cancelar
          </button>
          <button type="button" onClick={onConfirm} className={`min-h-12 rounded-2xl px-4 text-sm font-extrabold text-white transition active:scale-[0.98] ${resetTheme.button}`}>
            Sí, reiniciar
          </button>
        </div>
      </div>
    </div>
  );
}
