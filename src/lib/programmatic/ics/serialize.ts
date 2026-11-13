/**
 * A minimal iCalendar (RFC 5545) writer for the holiday feeds
 * (lib/programmatic/ics/feeds.ts): one VCALENDAR of all-day VEVENTs, nothing
 * else. Written here rather than pulled in as a dependency because the subset
 * is small and every rule it needs is below:
 *
 *  - lines end in CRLF (3.1), the last one too;
 *  - a content line longer than 75 octets is folded: CRLF plus one space,
 *    the space counting towards the next line's 75 (3.1), never inside a
 *    UTF-8 character;
 *  - TEXT values escape backslash, semicolon, comma and newline (3.3.11);
 *  - an all-day event is DTSTART;VALUE=DATE with DTEND the next day (3.6.1:
 *    DTEND is exclusive), so every client shows one day;
 *  - every VEVENT has UID and DTSTAMP (3.6.1).
 */

export interface IcsEvent {
  /** Stable across regenerations: clients match updates by it. */
  uid: string;
  /** ISO date, "2026-12-25". */
  date: string;
  summary: string;
  description?: string;
  categories?: string[];
  url?: string;
}

export interface IcsCalendar {
  /** PRODID, "-//CatalunyaInfo//Festius//CA". */
  prodId: string;
  /** NAME (RFC 7986) and X-WR-CALNAME. */
  name: string;
  /** DESCRIPTION (RFC 7986) and X-WR-CALDESC. */
  description?: string;
  /** The page the calendar comes from (URL). */
  url?: string;
  /** Where the feed itself lives (SOURCE, RFC 7986). */
  source?: string;
  /** How often clients should fetch it again: REFRESH-INTERVAL (RFC 7986) and X-PUBLISHED-TTL. "P1D". */
  refresh: string;
  /** DTSTAMP of every event: ISO date ("2026-11-06", read as 00:00 UTC) or date-time with Z. */
  stamp: string;
  events: IcsEvent[];
}

const CRLF = "\r\n";
const MAX_OCTETS = 75;
const encoder = new TextEncoder();

/** TEXT value escaping (RFC 5545 3.3.11). */
export function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n|\r|\n/g, "\\n");
}

/**
 * Folds one content line at 75 octets (RFC 5545 3.1). Continuation lines
 * start with a single space, which is part of their 75. Splits only between
 * code points, so a multi-byte character is never cut.
 */
export function foldLine(line: string): string {
  if (encoder.encode(line).length <= MAX_OCTETS) return line;
  const parts: string[] = [];
  let current = "";
  let octets = 0;
  let limit = MAX_OCTETS;
  for (const ch of line) {
    const size = encoder.encode(ch).length;
    if (octets + size > limit) {
      parts.push(current);
      current = "";
      octets = 0;
      limit = MAX_OCTETS - 1;
    }
    current += ch;
    octets += size;
  }
  parts.push(current);
  return parts.join(`${CRLF} `);
}

/** "2026-12-25" → "20261225". */
export function icsDate(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) throw new Error(`ics: not an ISO date: ${iso}`);
  return iso.replace(/-/g, "");
}

/** UTC date-time, "20261106T000000Z", from an ISO date or a date-time. */
export function icsStamp(value: string): string {
  const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00Z` : value);
  if (Number.isNaN(d.getTime())) throw new Error(`ics: not a date: ${value}`);
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** The day after an ISO date, in UTC (no time zone can shift a date-only value). */
export function nextDay(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

function eventLines(e: IcsEvent, stamp: string): string[] {
  return [
    "BEGIN:VEVENT",
    `UID:${e.uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${icsDate(e.date)}`,
    `DTEND;VALUE=DATE:${icsDate(nextDay(e.date))}`,
    `SUMMARY:${escapeText(e.summary)}`,
    ...(e.description ? [`DESCRIPTION:${escapeText(e.description)}`] : []),
    ...(e.categories?.length ? [`CATEGORIES:${e.categories.map(escapeText).join(",")}`] : []),
    ...(e.url ? [`URL;VALUE=URI:${e.url}`] : []),
    // A holiday is a day off, not an appointment: it must not show the reader as busy.
    "TRANSP:TRANSPARENT",
    "END:VEVENT",
  ];
}

/** The whole VCALENDAR, CRLF line ends, folded, ending in CRLF. */
export function serializeCalendar(cal: IcsCalendar): string {
  const uids = new Set<string>();
  for (const e of cal.events) {
    if (uids.has(e.uid)) throw new Error(`ics: duplicate UID ${e.uid}`);
    uids.add(e.uid);
  }
  const stamp = icsStamp(cal.stamp);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:${cal.prodId}`,
    "CALSCALE:GREGORIAN",
    `NAME:${escapeText(cal.name)}`,
    `X-WR-CALNAME:${escapeText(cal.name)}`,
    ...(cal.description ? [`DESCRIPTION:${escapeText(cal.description)}`, `X-WR-CALDESC:${escapeText(cal.description)}`] : []),
    ...(cal.url ? [`URL;VALUE=URI:${cal.url}`] : []),
    ...(cal.source ? [`SOURCE;VALUE=URI:${cal.source}`] : []),
    `REFRESH-INTERVAL;VALUE=DURATION:${cal.refresh}`,
    `X-PUBLISHED-TTL:${cal.refresh}`,
    ...cal.events.flatMap((e) => eventLines(e, stamp)),
    "END:VCALENDAR",
  ];
  return lines.map(foldLine).join(CRLF) + CRLF;
}
