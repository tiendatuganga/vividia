import { siFacebook, siInstagram, siTiktok, siYoutube } from "simple-icons";
import type { PlatformIcon } from "@/types/publication";

const icons = {
  tiktok: siTiktok,
  youtube: siYoutube,
  instagram: siInstagram,
  facebook: siFacebook,
};

export function BrandIcon({ icon, className }: { icon: PlatformIcon; className?: string }) {
  const brand = icons[icon];

  return (
    <svg aria-label={`Logo de ${brand.title}`} className={className} viewBox="0 0 24 24" fill={`#${brand.hex}`}>
      <path d={brand.path} />
    </svg>
  );
}
