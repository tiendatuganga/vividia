"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { FileSpreadsheet, FileUp, LoaderCircle, ShieldAlert, X } from "lucide-react";
import { parseGooglePasswordCsv } from "@/lib/csv";
import type { ImportedCredential } from "@/types/credential";

interface ImportPasswordsProps {
  onCancel: () => void;
  onImport: (items: ImportedCredential[]) => Promise<void>;
}

export function ImportPasswords({ onCancel, onImport }: ImportPasswordsProps) {
  const [items, setItems] = useState<ImportedCredential[]>([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !importing) onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [importing, onCancel]);

  const readFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    setFileName(file.name);

    try {
      if (file.size > 5 * 1024 * 1024) throw new Error("El CSV no puede superar los 5 MB.");
      const parsed = parseGooglePasswordCsv(await file.text());
      if (parsed.length === 0) throw new Error("No se encontraron cuentas válidas en el CSV.");
      setItems(parsed);
    } catch (reason) {
      setItems([]);
      setError(reason instanceof Error ? reason.message : "No se pudo leer el CSV.");
    }
  };

  const submit = async () => {
    if (items.length === 0) return;
    setImporting(true);
    setError("");
    try {
      await onImport(items);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo completar la importación.");
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-[#2b1d17]/50 p-4 backdrop-blur-[3px]">
      <div role="dialog" aria-modal="true" aria-labelledby="import-title" className="w-full max-w-xl rounded-[26px] border border-[#d1d5db] bg-white p-5 shadow-[0_28px_90px_rgba(17,24,39,0.3)] sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <span className="grid size-12 place-items-center rounded-2xl bg-[#edf4fd] text-[#3976c7]"><FileSpreadsheet aria-hidden="true" className="size-6" /></span>
          <button type="button" onClick={onCancel} disabled={importing} aria-label="Cerrar" className="grid size-10 place-items-center rounded-full text-[#4b5563] hover:bg-[#f3f4f6]"><X aria-hidden="true" className="size-5" /></button>
        </div>
        <h2 id="import-title" className="mt-5 text-xl font-extrabold tracking-[-0.03em] text-black">Importar desde Google</h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-black">Selecciona el CSV exportado desde Google Password Manager. El archivo se procesa localmente antes de guardar las cuentas.</p>

        <label className="mt-5 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-[20px] border-2 border-dashed border-[#d1d5db] bg-[#f9fafb] px-4 text-center transition hover:border-[#9ca3af] hover:bg-[#f3f4f6]">
          <FileUp aria-hidden="true" className="size-6 text-[#3976c7]" />
          <span className="mt-2 text-sm font-extrabold text-black">{fileName || "Seleccionar archivo CSV"}</span>
          <input type="file" accept=".csv,text/csv" onChange={readFile} disabled={importing} className="sr-only" />
        </label>

        {items.length > 0 && (
          <div className="mt-4 rounded-2xl border border-[#d1d5db] bg-white p-4">
            <p className="text-sm font-extrabold text-black">{items.length} {items.length === 1 ? "cuenta encontrada" : "cuentas encontradas"}</p>
            <p className="mt-1 truncate text-xs font-semibold text-black">{items.slice(0, 4).map((item) => item.name).join(" · ")}{items.length > 4 ? "…" : ""}</p>
          </div>
        )}

        <div className="mt-4 flex gap-3 rounded-2xl bg-[#fff6e9] p-4 text-black">
          <ShieldAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#d56b2d]" />
          <p className="text-xs font-bold leading-5">Cada fila se importará como una cuenta independiente. No se crearán relaciones “Continuar con Google” automáticamente.</p>
        </div>

        {error && <p className="mt-4 rounded-xl bg-[#fff0ec] px-3 py-2 text-sm font-bold text-[#b74722]">{error}</p>}

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button type="button" onClick={onCancel} disabled={importing} className="min-h-12 rounded-2xl border border-[#d1d5db] bg-white px-4 text-sm font-extrabold text-black hover:bg-[#f3f4f6]">Cancelar</button>
          <button type="button" onClick={submit} disabled={items.length === 0 || importing} className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#3976c7] px-4 text-sm font-extrabold text-white hover:bg-[#2d63ad] disabled:opacity-50">
            {importing && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}
            Importar {items.length || ""}
          </button>
        </div>
      </div>
    </div>
  );
}
