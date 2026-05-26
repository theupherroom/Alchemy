import type { Busy } from "@/lib/google/calendar";

const SLOT_MINUTES = 30;
const SLOT_STEP_MINUTES = 15; // we search at 15-minute granularity for 30-min windows
const WORK_HOUR_START = 9;
const WORK_HOUR_END = 18;

export type OverlapWindow = { startIso: string; endIso: string };

// Finds the FIRST 30-minute window where neither user is busy, both in working
// hours of the recipient's timezone, between `fromIso` and `toIso`.
// Returns null if no such window exists.
//
// Notes:
//   - All comparisons happen in UTC milliseconds.
//   - Working-hours filter uses Intl.DateTimeFormat with the recipient's IANA
//     timezone to compute the local hour of each candidate slot.
export function findFirstOverlap(
  busyA: Busy[],
  busyB: Busy[],
  fromIso: string,
  toIso: string,
  recipientTimezone: string,
): OverlapWindow | null {
  const allBusy = [...busyA, ...busyB]
    .map((b) => ({
      start: new Date(b.start).getTime(),
      end: new Date(b.end).getTime(),
    }))
    .filter((b) => Number.isFinite(b.start) && Number.isFinite(b.end))
    .sort((a, b) => a.start - b.start);

  const from = new Date(fromIso).getTime();
  const to = new Date(toIso).getTime();
  const slotMs = SLOT_MINUTES * 60_000;
  const stepMs = SLOT_STEP_MINUTES * 60_000;

  // Round `from` up to the next quarter hour.
  let cursor = Math.ceil(from / stepMs) * stepMs;

  while (cursor + slotMs <= to) {
    const slotEnd = cursor + slotMs;

    if (
      isWithinWorkingHours(cursor, recipientTimezone) &&
      isWithinWorkingHours(slotEnd - 1, recipientTimezone) &&
      !conflicts(cursor, slotEnd, allBusy)
    ) {
      return {
        startIso: new Date(cursor).toISOString(),
        endIso: new Date(slotEnd).toISOString(),
      };
    }

    cursor += stepMs;
  }

  return null;
}

function conflicts(
  start: number,
  end: number,
  busy: { start: number; end: number }[],
): boolean {
  for (const b of busy) {
    if (b.end <= start) continue;
    if (b.start >= end) return false; // sorted, future windows can't overlap
    if (b.start < end && b.end > start) return true;
  }
  return false;
}

function isWithinWorkingHours(timestamp: number, timezone: string): boolean {
  try {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      hour12: false,
      weekday: "short",
    });
    const parts = fmt.formatToParts(new Date(timestamp));
    const hourStr = parts.find((p) => p.type === "hour")?.value ?? "0";
    const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
    const hour = parseInt(hourStr, 10);

    if (weekday === "Sat" || weekday === "Sun") return false;
    return hour >= WORK_HOUR_START && hour < WORK_HOUR_END;
  } catch {
    return false;
  }
}
