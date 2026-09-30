import { Check } from "lucide-react";
import type { PublicationItem, PublicationTheme } from "@/types/publication";

interface PublicationCheckboxProps {
  item: PublicationItem;
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
  theme?: PublicationTheme;
}

export function PublicationCheckbox({ item, checked, onToggle, disabled, theme = "orange" }: PublicationCheckboxProps) {
  const checkedTheme = {
    orange: { surface: "border-[#9ca3af] bg-[#fff3e9]", box: "border-[#9ca3af] bg-[#e96123]", decoration: "decoration-[#e7a17d]" },
    brown: { surface: "border-[#9ca3af] bg-[#f6f1ee]", box: "border-[#9ca3af] bg-[#6a4b40]", decoration: "decoration-[#a88e83]" },
    green: { surface: "border-[#9ca3af] bg-[#f0f8ef]", box: "border-[#9ca3af] bg-[#4c8c55]", decoration: "decoration-[#91b397]" },
  }[theme];
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={onToggle}
      className={`group flex min-h-[54px] w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition duration-200 active:scale-[0.985] disabled:cursor-wait ${
        checked
          ? `${checkedTheme.surface} text-black shadow-[0_4px_14px_rgba(17,24,39,0.07)]`
          : "border-[#d1d5db] bg-white text-black hover:-translate-y-0.5 hover:border-[#9ca3af] hover:shadow-[0_6px_16px_rgba(17,24,39,0.05)]"
      }`}
    >
      <span className={`grid size-6 shrink-0 place-items-center rounded-lg border-2 transition duration-200 ${checked ? `scale-105 ${checkedTheme.box}` : "border-[#9ca3af] bg-white group-hover:border-[#6b7280]"}`}>
        <Check aria-hidden="true" className={`size-4 text-white transition duration-200 ${checked ? "scale-100 opacity-100" : "scale-50 opacity-0"}`} strokeWidth={3} />
      </span>
      <span className={`text-sm font-bold transition ${checked ? `line-through ${checkedTheme.decoration} decoration-1` : ""}`}>{item.label}</span>
    </button>
  );
}
