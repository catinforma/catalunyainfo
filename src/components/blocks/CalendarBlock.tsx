"use client";

import type { Block } from "@/lib/content/blocks";
import { renderInline } from "@/lib/content/inline";
import { formatDate } from "@/lib/format";
import { getMessages } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";

/**
 * A list of dates, with a download that adds them to the reader's calendar.
 *
 * The .ics is built in the browser from the payload. There is no server round
 * trip and no third-party calendar service, which keeps a list of who
 * downloaded what out of anyone else's hands.
 *
 * Every date comes from the editorial package. Nothing here derives a date:
 * a public-holiday calendar that quietly computes Easter is a calendar that
 * will eventually be wrong in a year nobody checks.
 */

type CalendarBlockType = Extract<Block, { type: "calendar" }>;

/** `2027-01-01` -> `20270101`, the only date form iCalendar accepts for all-day. */
function icsDate(iso: string): string {
  return iso.replaceAll("-", "");
}

/** DTEND on an all-day event is exclusive, so it is the day after the last one. */
function dayAfter(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return icsDate(date.toISOString().slice(0, 10));
}

/** RFC 5545 wants CRLF, and commas, semicolons and backslashes escaped. */
function escapeText(value: string): string {
  return value.replace(/([\\,;])/g, "\\$1").replace(/\n/g, "\\n");
}

function buildIcs(block: CalendarBlockType, origin: string): string {
  const stamp = `${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CatalunyaInfo//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(block.title)}`,
  ];

  for (const [index, event] of block.events.entries()) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${icsDate(event.date)}-${index}@catalunyainfo.com`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${icsDate(event.date)}`,
      `DTEND;VALUE=DATE:${dayAfter(event.endDate ?? event.date)}`,
      `SUMMARY:${escapeText(event.title)}`,
    );
    const description = [event.scope, event.note].filter(Boolean).join(" — ");
    if (description) lines.push(`DESCRIPTION:${escapeText(description)}`);
    lines.push(`URL:${origin}`, "TRANSP:TRANSPARENT", "END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return `${lines.join("\r\n")}\r\n`;
}

export function CalendarBlock({
  block,
  locale,
}: {
  block: CalendarBlockType;
  locale: Locale;
}) {
  const t = getMessages(locale);

  function download() {
    const ics = buildIcs(block, window.location.href);
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${block.filename}.ics`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    // Revoked on the next tick: Safari needs the object to still exist when
    // the click is handled.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  return (
    <section className="ci-calendar" aria-label={block.title}>
      <h3 className="ci-calendar-title">{block.title}</h3>
      {block.intro ? <p className="ci-calendar-intro">{renderInline(block.intro)}</p> : null}

      <ol className="ci-calendar-list">
        {block.events.map((event, index) => (
          <li key={`${event.date}-${index}`}>
            <time dateTime={event.date} className="ci-numeric">
              {formatDate(new Date(`${event.date}T12:00:00Z`), locale, "short")}
            </time>
            <span className="ci-calendar-name">{event.title}</span>
            {event.scope ? <span className="ci-calendar-scope">{event.scope}</span> : null}
            {event.note ? <span className="ci-calendar-note">{event.note}</span> : null}
          </li>
        ))}
      </ol>

      <p className="ci-calendar-actions">
        <button type="button" className="ci-btn ci-btn-primary" onClick={download}>
          {block.downloadLabel || t.calendar.download}
        </button>
        <span className="ci-calendar-hint">{t.calendar.hint}</span>
      </p>

      {block.note ? <p className="ci-calendar-source">{renderInline(block.note)}</p> : null}
    </section>
  );
}
