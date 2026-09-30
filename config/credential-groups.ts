export interface CredentialGroupAppearance {
  name: string;
  accent: string;
  soft: string;
  border: string;
  foreground: string;
  activeForeground: string;
}

export const credentialGroups: CredentialGroupAppearance[] = [
  {
    name: "Aceitera",
    accent: "#E9BE32",
    soft: "#FFF8D7",
    border: "#EBD67D",
    foreground: "#6B5200",
    activeForeground: "#332600",
  },
  {
    name: "Bamzuk",
    accent: "#F08A24",
    soft: "#FFF0DF",
    border: "#F2BE87",
    foreground: "#92430B",
    activeForeground: "#FFFFFF",
  },
  {
    name: "Italy Pizza",
    accent: "#C86448",
    soft: "#FBEAE5",
    border: "#DFA692",
    foreground: "#843B29",
    activeForeground: "#FFFFFF",
  },
  {
    name: "La Rueca",
    accent: "#628B5B",
    soft: "#EAF3E7",
    border: "#A8C5A2",
    foreground: "#365B31",
    activeForeground: "#FFFFFF",
  },
  {
    name: "Astra Vibe",
    accent: "#8659C7",
    soft: "#F1EAFB",
    border: "#BDA4DF",
    foreground: "#58338D",
    activeForeground: "#FFFFFF",
  },
  {
    name: "A Precio Justo",
    accent: "#69BF35",
    soft: "#EDFAE5",
    border: "#A5DA84",
    foreground: "#337513",
    activeForeground: "#163B05",
  },
  {
    name: "Pajarito",
    accent: "#8B5E3C",
    soft: "#F3E9E1",
    border: "#C9A98F",
    foreground: "#60402A",
    activeForeground: "#FFFFFF",
  },
];

export function normalizeCredentialGroup(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleLowerCase("es");
}

function mixHex(first: string, second: string, secondWeight: number): string {
  const parse = (value: string) => [1, 3, 5].map((index) => Number.parseInt(value.slice(index, index + 2), 16));
  const firstRgb = parse(first);
  const secondRgb = parse(second);
  return `#${firstRgb.map((channel, index) =>
    Math.round(channel * (1 - secondWeight) + secondRgb[index] * secondWeight)
      .toString(16)
      .padStart(2, "0")).join("")}`;
}

export function getCredentialGroupAppearance(groupName: string, customColor?: string): CredentialGroupAppearance | null {
  const normalizedName = normalizeCredentialGroup(groupName);
  const configured = credentialGroups.find((group) => normalizeCredentialGroup(group.name) === normalizedName) ?? null;
  if (!customColor || !/^#[0-9a-f]{6}$/i.test(customColor)) return configured;

  const red = Number.parseInt(customColor.slice(1, 3), 16);
  const green = Number.parseInt(customColor.slice(3, 5), 16);
  const blue = Number.parseInt(customColor.slice(5, 7), 16);
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
  return {
    name: groupName,
    accent: customColor,
    soft: mixHex(customColor, "#ffffff", 0.88),
    border: mixHex(customColor, "#ffffff", 0.55),
    foreground: mixHex(customColor, "#000000", 0.35),
    activeForeground: luminance > 0.65 ? "#1f2937" : "#ffffff",
  };
}
