import { KeyRound, Pizza, ShoppingCart, Sprout } from "lucide-react";

export type AppSection = "bamzuk" | "social" | "vividia" | "passwords";

interface SectionSwitcherProps {
  activeSection: AppSection;
  onChange: (section: AppSection) => void;
}

const options = [
  { id: "bamzuk" as const, label: "Bamzuk TikTok Shop", icon: ShoppingCart },
  { id: "social" as const, label: "Italy Pizza", icon: Pizza },
  { id: "vividia" as const, label: "Vividia", icon: Sprout },
  { id: "passwords" as const, label: "Contraseñas", icon: KeyRound },
];

const activeColors: Record<AppSection, string> = {
  bamzuk: "bg-[#e96123] shadow-[0_7px_18px_rgba(204,77,25,0.22)]",
  social: "bg-[#5b4035] shadow-[0_7px_18px_rgba(62,42,34,0.22)]",
  vividia: "bg-[#478a50] shadow-[0_7px_18px_rgba(48,112,62,0.22)]",
  passwords: "bg-[#3976c7] shadow-[0_7px_18px_rgba(38,89,166,0.22)]",
};

const activePositions: Record<AppSection, string> = {
  bamzuk: "translate-x-0",
  social: "translate-x-full",
  vividia: "translate-x-[200%]",
  passwords: "translate-x-[300%]",
};

export function SectionSwitcher({ activeSection, onChange }: SectionSwitcherProps) {
  return (
    <nav
      aria-label="Secciones de la aplicación"
      className="relative mx-auto grid min-h-[58px] w-full max-w-[900px] grid-cols-4 rounded-full border border-[#d1d5db] bg-[#f3f4f6]/85 p-1.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.85),0_10px_28px_rgba(17,24,39,0.08)] backdrop-blur-xl"
    >
      <span
        aria-hidden="true"
        className={`absolute inset-y-1.5 left-1.5 w-[calc(25%-3px)] rounded-full transition-[transform,background-color,box-shadow] duration-300 ease-out ${activeColors[activeSection]} ${activePositions[activeSection]}`}
      />

      {options.map(({ id, label, icon: Icon }) => {
        const isActive = activeSection === id;

        return (
          <button
            key={id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(id)}
            aria-label={label}
            title={label}
            className={`relative z-10 flex min-h-11 items-center justify-center gap-1.5 rounded-full px-1 text-[11px] font-extrabold transition-colors duration-300 active:scale-[0.98] lg:gap-2 lg:px-3 lg:text-[15px] ${
              isActive ? "text-white" : "text-black"
            }`}
          >
            <Icon aria-hidden="true" className="size-5 lg:size-4" strokeWidth={2.2} />
            <span className="hidden whitespace-nowrap lg:inline">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
