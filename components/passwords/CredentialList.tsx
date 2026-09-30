import { KeyRound, SearchX } from "lucide-react";
import { CredentialCard } from "@/components/passwords/CredentialCard";
import type { Credential } from "@/types/credential";

interface CredentialListProps {
  credentials: Credential[];
  searching: boolean;
  loading: boolean;
  onCreate: () => void;
  onOpen: (credentialId: string) => void;
}

export function CredentialList({ credentials, searching, loading, onCreate, onOpen }: CredentialListProps) {
  if (loading && credentials.length === 0) {
    return (
      <div className="space-y-2" aria-label="Cargando cuentas">
        {[0, 1, 2].map((item) => <div key={item} className="h-[68px] animate-pulse rounded-[18px] border border-[#e5e7eb] bg-white/65" />)}
      </div>
    );
  }

  if (credentials.length === 0) {
    return (
      <div className="rounded-[24px] border border-[#d1d5db] bg-white px-5 py-12 text-center shadow-[0_10px_32px_rgba(17,24,39,0.04)]">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#edf4fd] text-[#3976c7]">
          {searching ? <SearchX aria-hidden="true" className="size-7" /> : <KeyRound aria-hidden="true" className="size-7" />}
        </span>
        <h2 className="mt-5 text-xl font-extrabold tracking-[-0.03em] text-black">
          {searching ? "No encontramos esa cuenta" : "Todavía no hay cuentas"}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-[#6b7280]">
          {searching ? "Prueba buscando por plataforma, correo, usuario o nota." : "Añade la primera cuenta para empezar tu gestor de accesos."}
        </p>
        {!searching && <button type="button" onClick={onCreate} className="mt-5 min-h-11 rounded-full bg-[#3976c7] px-5 text-sm font-extrabold text-white hover:bg-[#2d63ad]">Nueva cuenta</button>}
      </div>
    );
  }

  return (
    <section aria-label="Todas las cuentas" className="space-y-2">
      {credentials.map((credential) => (
        <CredentialCard key={credential.id} credential={credential} onOpen={onOpen} />
      ))}
    </section>
  );
}
