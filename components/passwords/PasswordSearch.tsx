import { Search, X } from "lucide-react";

interface PasswordSearchProps {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
}

export function PasswordSearch({ value, onChange, resultCount }: PasswordSearchProps) {
  return (
    <section aria-label="Buscar cuentas">
      <label className="flex min-h-[58px] items-center gap-3 rounded-2xl border border-[#d1d5db] bg-white px-4 transition focus-within:border-[#9ca3af] focus-within:ring-4 focus-within:ring-[#3976c7]/10">
        <Search aria-hidden="true" className="size-5 shrink-0 text-[#3976c7]" />
        <input
          type="text"
          role="searchbox"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Busca tu contraseña"
          className="min-w-0 flex-1 bg-transparent text-base font-bold text-black outline-none placeholder:font-medium placeholder:text-[#6b7280]"
        />
        {value && (
          <button type="button" onClick={() => onChange("")} aria-label="Limpiar búsqueda" className="grid size-10 shrink-0 place-items-center rounded-xl text-[#4b5563] transition hover:bg-[#f3f4f6] hover:text-[#3976c7]">
            <X aria-hidden="true" className="size-4" />
          </button>
        )}
      </label>
      {value && <p className="px-2 pt-2 text-xs font-bold text-[#6b7280]">{resultCount} {resultCount === 1 ? "resultado" : "resultados"}</p>}
    </section>
  );
}
