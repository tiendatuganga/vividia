import { CheckCircle2, ExternalLink } from "lucide-react";
import { BrandIcon } from "@/components/BrandIcon";
import { PublicationCheckbox } from "@/components/PublicationCheckbox";
import { getPlatformItems, getPlatformTotal } from "@/config/platforms";
import type { PlatformChecks, PlatformConfig, PublicationKind, PublicationTheme } from "@/types/publication";

interface PlatformCardProps {
  platform: PlatformConfig;
  checks: PlatformChecks;
  onToggle: (publicationId: string) => void;
  disabled?: boolean;
  url?: string;
  showOpenButton?: boolean;
  theme?: PublicationTheme;
}

function PublicationGroup({
  label,
  kind,
  platform,
  checks,
  onToggle,
  disabled,
  theme,
}: PlatformCardProps & { label: string; kind: PublicationKind }) {
  const items = getPlatformItems(platform).filter((item) => item.kind === kind);
  if (items.length === 0) return null;

  return (
    <div>
      <h3 className="mb-2.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-black">{label}</h3>
      <div className="grid grid-cols-2 gap-2.5 max-[370px]:grid-cols-1">
        {items.map((item) => (
          <PublicationCheckbox
            key={item.id}
            item={item}
            checked={Boolean(checks?.[item.id])}
            disabled={disabled}
            theme={theme}
            onToggle={() => onToggle(item.id)}
          />
        ))}
      </div>
    </div>
  );
}

export function PlatformCard({ platform, checks, onToggle, disabled, url, showOpenButton = false, theme = "orange" }: PlatformCardProps) {
  const total = getPlatformTotal(platform);
  const completed = getPlatformItems(platform).filter((item) => checks?.[item.id]).length;
  const isComplete = total > 0 && completed === total;
  const description = [
    platform.videos > 0 ? `${platform.videos} ${platform.videos === 1 ? "vídeo" : "vídeos"}` : null,
    platform.stories > 0 ? `${platform.stories} ${platform.stories === 1 ? "historia" : "historias"}` : null,
  ].filter(Boolean).join(" · ");

  return (
    <article className="rounded-[24px] border border-[#d1d5db] bg-white p-5 shadow-[0_12px_35px_rgba(17,24,39,0.045)] transition duration-300 hover:border-[#9ca3af] hover:shadow-[0_16px_42px_rgba(17,24,39,0.075)] sm:p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3.5">
          <span className="grid size-12 shrink-0 place-items-center">
            <BrandIcon icon={platform.icon} className="size-8" />
          </span>
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <h2 className="truncate text-lg font-extrabold tracking-[-0.025em] text-black">{platform.name}</h2>
              {url ? (
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Abrir ${platform.name}`}
                  title={`Abrir ${platform.name}`}
                  className="inline-flex min-h-7 shrink-0 items-center gap-1 rounded-full border border-[#d1d5db] bg-white px-2.5 text-[10px] font-extrabold text-[#4b5563] transition hover:border-[#9ca3af] hover:bg-[#f9fafb] hover:text-black"
                >
                  Abrir
                  <ExternalLink aria-hidden="true" className="size-3" />
                </a>
              ) : showOpenButton ? (
                <button
                  type="button"
                  disabled
                  aria-label={`${platform.name} todavía no tiene un enlace configurado`}
                  title="Enlace pendiente"
                  className="inline-flex min-h-7 shrink-0 cursor-default items-center gap-1 rounded-full border border-[#d1d5db] bg-white px-2.5 text-[10px] font-extrabold text-[#9ca3af]"
                >
                  Abrir
                  <ExternalLink aria-hidden="true" className="size-3" />
                </button>
              ) : null}
            </div>
            <p className="mt-0.5 text-xs font-semibold text-black">{description}</p>
          </div>
        </div>

        <div className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-extrabold text-black transition-colors ${isComplete ? "bg-[#e7f4e9]" : "bg-[#f3f4f6]"}`}>
          {isComplete && <CheckCircle2 aria-hidden="true" className="size-4" />}
          {completed}/{total}
        </div>
      </div>

      <div className="space-y-5">
        <PublicationGroup label="Vídeos subidos" kind="video" platform={platform} checks={checks} onToggle={onToggle} disabled={disabled} theme={theme} />
        <PublicationGroup label="Historias subidas" kind="story" platform={platform} checks={checks} onToggle={onToggle} disabled={disabled} theme={theme} />
      </div>
    </article>
  );
}
