import { daysBetween, shortDate, todayInCatalonia } from "@/lib/content/holidays/calendar";
import { SCHOOL_SOURCE, SCHOOL_YEARS, schoolStatusOn } from "@/lib/content/school/calendar";
import { getMessages } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";

/**
 * The general school calendar: what it says about today, then the three
 * school years the current order sets, side by side.
 *
 * Server-rendered and computed in Europe/Madrid; the route revalidates every
 * few minutes, so "today" is never a day out.
 */
export function SchoolCalendar({ locale }: { locale: Locale }) {
  const t = getMessages(locale).school;
  const today = todayInCatalonia();
  const status = schoolStatusOn(today);
  const day = (iso: string) => shortDate(iso, locale);
  const withYear = (iso: string) => `${day(iso)}${locale === "en" ? " " : " de "}${iso.slice(0, 4)}`;
  const range = ([from, to]: [string, string]) =>
    t.range.replace("{from}", withYear(from)).replace("{to}", withYear(to));

  let headline = t.unknown;
  let next: string | null = null;
  if (status.kind === "christmas" || status.kind === "easter") {
    headline = (status.kind === "christmas" ? t.todayChristmas : t.todayEaster).replace("{until}", withYear(status.until));
  } else if (status.kind === "summer") {
    headline = t.todaySummer.replace("{year}", status.nextStart.label).replace("{start}", withYear(status.nextStart.start));
  } else if (status.kind === "term") {
    headline = t.todayTerm.replace("{year}", status.year.label);
    const template =
      status.nextBreak.kind === "christmas" ? t.nextChristmas : status.nextBreak.kind === "easter" ? t.nextEaster : t.nextSummer;
    next = template
      .replace("{from}", withYear(status.nextBreak.from))
      .replace("{n}", String(daysBetween(today, status.nextBreak.from)));
  }

  const rows: [string, (y: (typeof SCHOOL_YEARS)[number]) => string][] = [
    [t.rowStart, (y) => withYear(y.start)],
    [t.rowEnd, (y) => withYear(y.end)],
    [t.rowEndBatx, (y) => withYear(y.endBatxillerat1)],
    [t.rowFP, (y) => withYear(y.startFP)],
    [t.rowChristmas, (y) => range(y.christmas)],
    [t.rowEaster, (y) => range(y.easter)],
  ];

  return (
    <section className="ci-school" aria-label={t.title}>
      <div className="ci-reservoirs-head">
        <p className="ci-reservoirs-figure">{headline}</p>
        {next ? <p>{next}</p> : null}
        <p className="ci-calc-note">{t.todayCaveat}</p>
      </div>

      <div className="ci-table-scroll">
        <table className="ci-local-table ci-school-table">
          <thead>
            <tr>
              <th scope="col">{t.colYear}</th>
              {SCHOOL_YEARS.map((y) => (
                <th scope="col" key={y.label}>
                  {y.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, value]) => (
              <tr key={label}>
                <th scope="row">{label}</th>
                {SCHOOL_YEARS.map((y) => (
                  <td key={y.label}>{value(y)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="ci-calc-note">
        {t.sourceLine}{" "}
        <a href={SCHOOL_SOURCE.url} rel="noopener" target="_blank">
          {SCHOOL_SOURCE.name}
        </a>{" "}
        ({SCHOOL_SOURCE.publisher}).
      </p>
    </section>
  );
}
