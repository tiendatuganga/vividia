"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, LoaderCircle, X } from "lucide-react";
import type { Credential } from "@/types/credential";

interface DeleteCredentialDialogProps {
  credential: Credential;
  dependencies: Credential[];
  onCancel: () => void;
  onConfirm: (force: boolean) => Promise<void>;
}

export function DeleteCredentialDialog({ credential, dependencies, onCancel, onConfirm }: DeleteCredentialDialogProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const hasDependencies = dependencies.length > 0;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !deleting) onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [deleting, onCancel]);

  const confirm = async () => {
    setDeleting(true);
    setError("");
    try {
      await onConfirm(hasDependencies);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo eliminar la cuenta.");
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-[#2b1d17]/50 p-4 backdrop-blur-[3px]">
      <div role="alertdialog" aria-modal="true" aria-labelledby="delete-credential-title" className="w-full max-w-lg rounded-[26px] border border-[#d1d5db] bg-white p-5 shadow-[0_28px_90px_rgba(17,24,39,0.3)] sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <span className="grid size-12 place-items-center rounded-2xl bg-[#fff0e8] text-[#d95a24]"><AlertTriangle aria-hidden="true" className="size-6" /></span>
          <button type="button" onClick={onCancel} disabled={deleting} aria-label="Cerrar" className="grid size-10 place-items-center rounded-full text-[#4b5563] hover:bg-[#f3f4f6]"><X aria-hidden="true" className="size-5" /></button>
        </div>
        <h2 id="delete-credential-title" className="mt-5 text-xl font-extrabold tracking-[-0.03em] text-black">Eliminar {credential.name}</h2>

        {hasDependencies ? (
          <div className="mt-3">
            <p className="text-sm font-semibold leading-6 text-black">Esta cuenta se utiliza para iniciar sesión en {dependencies.length} {dependencies.length === 1 ? "plataforma" : "plataformas"}:</p>
            <ul className="mt-3 max-h-44 space-y-2 overflow-y-auto rounded-2xl bg-[#f8f1eb] p-3">
              {dependencies.map((dependency) => <li key={dependency.id} className="rounded-xl bg-white px-3 py-2 text-sm font-extrabold text-black">{dependency.name}</li>)}
            </ul>
            <p className="mt-3 text-sm font-semibold leading-6 text-black">Estas cuentas no se eliminarán, pero quedarán sin credencial relacionada.</p>
          </div>
        ) : (
          <p className="mt-3 text-sm font-semibold leading-6 text-black">Esta acción eliminará la cuenta y no se puede deshacer.</p>
        )}

        {error && <p className="mt-4 rounded-xl bg-[#fff0ec] px-3 py-2 text-sm font-bold text-[#b74722]">{error}</p>}

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button type="button" onClick={onCancel} disabled={deleting} className="min-h-12 rounded-2xl border border-[#d1d5db] bg-white px-4 text-sm font-extrabold text-black hover:bg-[#f3f4f6]">Cancelar</button>
          <button type="button" onClick={confirm} disabled={deleting} className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#c64f2a] px-4 text-sm font-extrabold text-white hover:bg-[#b64120] disabled:opacity-60">
            {deleting && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}
            {hasDependencies ? "Eliminar y desvincular" : "Eliminar cuenta"}
          </button>
        </div>
      </div>
    </div>
  );
}
