import { Plus } from "lucide-react";

interface PasswordsHeaderProps {
  onCreate: () => void;
}

export function PasswordsHeader({ onCreate }: PasswordsHeaderProps) {
  return (
    <header className="relative isolate overflow-hidden rounded-[22px] bg-[linear-gradient(135deg,#5792dc_0%,#3976c7_50%,#285da8_100%)] px-5 py-4 text-white shadow-[0_14px_38px_rgba(38,89,166,0.16)] sm:px-7 sm:py-5 lg:px-8">
      <div className="absolute -right-12 -top-20 -z-10 size-52 rounded-full border-[34px] border-white/8" />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-[clamp(1.35rem,4.5vw,2rem)] font-extrabold leading-tight tracking-[-0.04em]">Tus accesos en un solo lugar</h1>

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onCreate} className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-white px-3.5 text-xs font-extrabold text-[#326fbd] shadow-[0_6px_16px_rgba(38,89,166,0.14)] transition hover:bg-[#f5f9ff] active:scale-[0.98] sm:text-sm">
            <Plus aria-hidden="true" className="size-4" strokeWidth={2.8} />
            Nueva cuenta
          </button>
        </div>
      </div>
    </header>
  );
}
