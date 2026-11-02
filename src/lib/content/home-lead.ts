import type { B2Key } from "@/lib/content/batch02/shared";

/**
 * The homepage's lead card: the page the season is asking about, not the
 * newest featured entry. Before this the lead was `featured[0]`, the most
 * recently published featured entry, so the autumn colours guide (15 Sep)
 * sat there for weeks. Windows are Madrid calendar dates, inclusive, in
 * order and never overlapping; outside them the lead rotates daily through
 * the featured entries. The homepage is regenerated hourly and by the
 * midnight cron, so a window starts within the hour.
 */
export interface LeadWindow {
  from: string;
  to: string;
  key: B2Key;
}

export const HOME_LEAD_WINDOWS: readonly LeadWindow[] = [
  { from: "2026-11-02", to: "2026-11-11", key: "strike11n" },
  { from: "2026-11-12", to: "2026-11-28", key: "voting" },
  { from: "2026-11-29", to: "2026-11-30", key: "electionNight" },
  { from: "2026-12-01", to: "2026-12-08", key: "decemberBridge" },
  { from: "2026-12-09", to: "2026-12-13", key: "marato" },
  { from: "2026-12-14", to: "2026-12-22", key: "loteriaNadal" },
  { from: "2026-12-23", to: "2026-12-30", key: "newYear" },
  { from: "2026-12-31", to: "2026-12-31", key: "grossa" },
  { from: "2027-01-01", to: "2027-01-06", key: "reis" },
  { from: "2027-01-07", to: "2027-02-28", key: "bridges2027" },
  { from: "2027-03-01", to: "2027-03-29", key: "easter2027" },
];

/** The seasonal lead for a Madrid date (YYYY-MM-DD), or null outside every window. */
export function homeLeadKey(today: string): B2Key | null {
  return HOME_LEAD_WINDOWS.find((w) => w.from <= today && today <= w.to)?.key ?? null;
}

/** Which of `count` featured entries leads on `today`: changes every day, same all day. */
export function rotationIndex(today: string, count: number): number {
  if (count <= 0) return 0;
  const days = Math.floor(Date.parse(`${today}T00:00:00Z`) / 86_400_000);
  return ((days % count) + count) % count;
}
