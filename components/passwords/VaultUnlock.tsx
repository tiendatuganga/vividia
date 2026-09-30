"use client";

import { FormEvent, useState } from "react";
import { Eye, EyeOff, KeyRound, LoaderCircle, LockKeyhole } from "lucide-react";
import type { VaultStatus } from "@/hooks/useVault";

interface VaultUnlockProps {
  status: VaultStatus;
  error: string;
  onUnlock: (password: string) => Promise<void>;
}

export function VaultUnlock({ status, error, onUnlock }: VaultUnlockProps) {
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError("");

    if (!password) {
      setFormError("Escribe la contraseña maestra actual.");
      return;
    }

    setSubmitting(true);
    try {
      await onUnlock(password);
      setPassword("");
    } catch (reason) {
      setFormError(reason instanceof Error ? reason.message : "No se pudo iniciar la migración.");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="grid min-h-[420px] place-items-center rounded-[26px] border border-[#e5e7eb] bg-white">
        <div className="text-center text-black">
          <LoaderCircle aria-hidden="true" className="mx-auto size-7 animate-spin text-[#3976c7]" />
          <p className="mt-3 text-sm font-bold">Preparando tus contraseñas…</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return <p className="rounded-2xl border border-[#f1c9ba] bg-[#fff6f2] px-4 py-4 text-sm font-bold text-[#a9552f]">{error}</p>;
  }

  return (
    <section className="overflow-hidden rounded-[26px] border border-[#e5e7eb] bg-white shadow-[0_14px_42px_rgba(17,24,39,0.06)]">
      <div className="bg-[linear-gradient(135deg,#5792dc_0%,#3976c7_52%,#285da8_100%)] px-5 py-7 text-white sm:px-8 sm:py-9">
        <div className="mb-5 grid size-12 place-items-center rounded-2xl border border-white/20 bg-white/15 backdrop-blur-sm">
          <LockKeyhole aria-hidden="true" className="size-6" />
        </div>
        <p className="mb-1 text-sm font-semibold text-blue-50/85">Último paso</p>
        <h1 className="text-3xl font-extrabold tracking-[-0.045em] sm:text-4xl">Desactivar contraseña maestra</h1>
      </div>

      <form onSubmit={submit} className="mx-auto max-w-xl px-5 py-8 sm:px-8 sm:py-10">
        <p className="mb-6 rounded-2xl bg-[#f3f4f6] p-4 text-sm font-medium leading-6 text-black">
          Escribe la clave actual una última vez para convertir las contraseñas existentes. Después la aplicación abrirá directamente y no volverá a bloquearse.
        </p>

        <label className="block">
          <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.12em] text-black">Contraseña maestra actual</span>
          <span className="flex items-center rounded-2xl border border-[#d1d5db] bg-white px-3 focus-within:border-[#9ca3af] focus-within:ring-3 focus-within:ring-[#3976c7]/10">
            <KeyRound aria-hidden="true" className="size-5 shrink-0 text-[#6b7280]" />
            <input
              type={visible ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              className="min-h-13 min-w-0 flex-1 bg-transparent px-3 text-sm font-bold outline-none"
              autoFocus
            />
            <button type="button" onClick={() => setVisible((current) => !current)} aria-label={visible ? "Ocultar" : "Mostrar"} className="grid size-10 place-items-center rounded-xl text-[#6b7280] hover:bg-[#f3f4f6]">
              {visible ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
            </button>
          </span>
        </label>

        {(formError || error) && <p className="mt-4 rounded-xl bg-[#fff0ec] px-3 py-2 text-sm font-bold text-[#b74722]">{formError || error}</p>}

        <button type="submit" disabled={submitting} className="mt-6 flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#3976c7] px-5 text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(38,89,166,0.2)] transition hover:bg-[#2d63ad] active:scale-[0.99] disabled:opacity-60">
          {submitting && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}
          Desactivar y continuar
        </button>
      </form>
    </section>
  );
}
