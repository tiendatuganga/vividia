const DATE_KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function getTodayKey(): string {
  return toDateKey(new Date());
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function fromDateKey(dateKey: string): Date {
  const match = DATE_KEY_PATTERN.exec(dateKey);
  if (!match) return new Date();

  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day), 12);
}

export function addDays(dateKey: string, amount: number): string {
  const date = fromDateKey(dateKey);
  date.setDate(date.getDate() + amount);
  return toDateKey(date);
}

export function formatLongDate(dateKey: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(fromDateKey(dateKey));
}

export function formatShortDate(dateKey: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
  })
    .format(fromDateKey(dateKey))
    .replace(".", "");
}

export function getRecentDateKeys(amount = 7): string[] {
  const today = getTodayKey();
  return Array.from({ length: amount }, (_, index) => addDays(today, -index));
}
