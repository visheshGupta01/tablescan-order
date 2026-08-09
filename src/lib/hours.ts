import type { DayHours, OpeningHours } from "@/types";

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export const DAYS: { key: string; label: string }[] = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
];

function toMinutes(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

export function todayKey(date = new Date()): string {
  return DAY_KEYS[date.getDay()]!;
}

export function getDayHours(hours: OpeningHours, key: string): DayHours | null {
  return hours?.[key] ?? null;
}

export function isOpenNow(hours: OpeningHours, date = new Date()): boolean {
  const day = getDayHours(hours ?? {}, todayKey(date));
  if (!day || day.closed) return false;
  const open = toMinutes(day.open ?? "");
  const close = toMinutes(day.close ?? "");
  if (open === null || close === null) return false;
  const now = date.getHours() * 60 + date.getMinutes();
  if (close <= open) return now >= open || now < close; // spans midnight
  return now >= open && now < close;
}

export function todayHoursLabel(hours: OpeningHours, date = new Date()): string {
  const day = getDayHours(hours ?? {}, todayKey(date));
  if (!day || day.closed) return "Closed today";
  return `${day.open} – ${day.close}`;
}
