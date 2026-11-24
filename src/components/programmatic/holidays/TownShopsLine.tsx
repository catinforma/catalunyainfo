import { todayInCatalonia } from "@/lib/content/holidays/calendar";
import type { DateLocale } from "@/lib/programmatic/holidays/format";
import { townShopsLine } from "@/lib/programmatic/holidays/shops-line";
import type { SnapshotMunicipality } from "@/lib/programmatic/holidays/types";

/**
 * The shop answer for the next Sunday or holiday, first thing in the body of
 * a town holiday page (24 Nov 2026; lib/programmatic/holidays/shops-line.ts).
 * A short paragraph in the page's existing tip callout, with a link to the
 * Christmas table further down. Date-free: it lists dated days (the table's
 * rows, minus the past ones at render time), so it stays true on a page that
 * is not rebuilt for days and needs no nightly rebuild. Nothing from
 * 7 January 2027, when the table goes.
 */
export function TownShopsLine({
  m,
  locale,
  today = todayInCatalonia(),
  tight = false,
}: {
  m: SnapshotMunicipality;
  locale: DateLocale;
  today?: string;
  /** The H2 after it has no top margin (the table-first editions): the line brings its own space below. */
  tight?: boolean;
}) {
  const line = townShopsLine(m, locale, today);
  if (!line) return null;
  return (
    <p className={`ci-callout ci-callout-tip ci-town-shops${tight ? " mb-5" : ""}`}>
      <strong>{line.lead}</strong> {line.text}{" "}
      <a href={line.link.href}>{line.link.label}</a>
    </p>
  );
}
