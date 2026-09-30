import { Settings2 } from "lucide-react";
import { getCredentialGroupAppearance } from "@/config/credential-groups";
import type { CredentialGroupDefinition } from "@/types/credential";

interface CredentialGroupFilterProps {
  groups: CredentialGroupDefinition[];
  value: string | null;
  onChange: (group: string | null) => void;
  onManage: () => void;
}

export function CredentialGroupFilter({ groups, value, onChange, onManage }: CredentialGroupFilterProps) {
  if (groups.length === 0) return null;

  return (
    <nav aria-label="Filtrar cuentas por grupo o proyecto" className="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex w-max min-w-full items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(null)}
          aria-pressed={value === null}
          className={`min-h-9 cursor-pointer rounded-full border px-3.5 text-xs font-extrabold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3976c7]/35 ${
            value === null
              ? "border-[#9ca3af] bg-[#3976c7] text-white shadow-[0_5px_14px_rgba(38,89,166,0.18)]"
              : "border-[#d1d5db] bg-white text-black hover:border-[#9ca3af] hover:bg-[#f9fafb]"
          }`}
        >
          Todas
        </button>

        {groups.map((group) => {
          const selected = value === group.name;
          const appearance = getCredentialGroupAppearance(group.name, group.color);
          return (
            <button
              key={group.name}
              type="button"
              onClick={() => onChange(group.name)}
              aria-pressed={selected}
              style={appearance ? {
                backgroundColor: selected ? appearance.accent : appearance.soft,
                borderColor: selected ? appearance.accent : appearance.border,
                color: selected ? appearance.activeForeground : appearance.foreground,
              } : undefined}
              className={`min-h-9 cursor-pointer rounded-full border px-3.5 text-xs font-extrabold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9ca3af]/35 ${
                appearance
                  ? selected ? "shadow-[0_4px_12px_rgba(17,24,39,0.10)]" : "hover:brightness-[0.97]"
                  : selected
                    ? "border-[#9ca3af] bg-[#f3f4f6] text-black shadow-[0_4px_12px_rgba(17,24,39,0.08)]"
                    : "border-[#d1d5db] bg-white text-black hover:border-[#9ca3af] hover:bg-[#f9fafb]"
              }`}
            >
              {group.name}
            </button>
          );
        })}

        <button
          type="button"
          onClick={onManage}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[#d1d5db] bg-white px-3.5 text-xs font-extrabold text-[#4b5563] transition hover:border-[#9ca3af] hover:bg-[#f9fafb] hover:text-black"
        >
          <Settings2 aria-hidden="true" className="size-3.5" />
          Gestionar
        </button>
      </div>
    </nav>
  );
}
