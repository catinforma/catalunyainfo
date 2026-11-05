import { CHRISTMAS_SHOPS_CHECKED, compactDays } from "@/lib/content/batch02/shops-christmas";
import { RESOLUTION_COUNCILS, christmasTownRows, townLabel } from "@/lib/content/batch02/shops-christmas-towns";
import type { Locale } from "@/lib/i18n/config";
import { dayMonthYear } from "@/lib/programmatic/holidays/format";

import { LocalHolidaysFilter } from "./LocalHolidaysFilter";

/**
 * "Can shops open over Christmas in my town?": every municipality of
 * Catalonia with the Sundays and holidays from 29 November to 31 December
 * 2026 when general-timetable shops may open (Resolució EMT/4342/2025 and its
 * defaults).
 *
 * Built like the local-holiday table: the whole table is in the HTML, the
 * filter box only hides rows. The rows sit in a scroll box so 947 towns do not
 * push the rest of the guide off the page.
 */

const COPY: Record<
  Locale,
  {
    summary: (n: number) => string;
    label: string;
    placeholder: string;
    empty: string;
    region: string;
    colTown: string;
    colDays: string;
    notOn: string;
    note: (listed: number, checked: string) => string;
  }
> = {
  ca: {
    summary: (n) => `Els ${n} municipis de Catalunya, amb els diumenges i festius del 29 de novembre al 31 de desembre de 2026 en què hi poden obrir les botigues amb horari general. El 25 i el 26 de desembre no n'hi pot obrir cap.`,
    label: "Busca el teu municipi",
    placeholder: "Per exemple: Sabadell, Manresa, Olot…",
    empty: "Cap municipi coincideix amb la cerca.",
    region: "Dies d'obertura comercial de cada municipi",
    colTown: "Municipi",
    colDays: "Poden obrir (29 nov. – 31 des.)",
    notOn: "no:",
    note: (listed, checked) =>
      `Resolució EMT/4342/2025 (DOGC 27.11.2025): els ${listed} ajuntaments que hi consten amb els seus dies i, per a la resta, els dies per defecte que fixa la mateixa resolució. Consultada el ${checked}.`,
  },
  es: {
    summary: (n) => `Los ${n} municipios de Cataluña, con los domingos y festivos del 29 de noviembre al 31 de diciembre de 2026 en que pueden abrir las tiendas con horario general. El 25 y el 26 de diciembre no puede abrir ninguna.`,
    label: "Busca tu municipio",
    placeholder: "Por ejemplo: Sabadell, Manresa, Olot…",
    empty: "Ningún municipio coincide con la búsqueda.",
    region: "Días de apertura comercial de cada municipio",
    colTown: "Municipio",
    colDays: "Pueden abrir (29 nov. – 31 dic.)",
    notOn: "no:",
    note: (listed, checked) =>
      `Resolución EMT/4342/2025 (DOGC 27.11.2025): los ${listed} ayuntamientos que figuran en ella con sus días y, para el resto, los días por defecto que fija la misma resolución. Consultada el ${checked}.`,
  },
  en: {
    summary: (n) => `All ${n} towns in Catalonia, with the Sundays and holidays from 29 November to 31 December 2026 when shops on the general timetable may open. None may open on 25 or 26 December.`,
    label: "Find your town",
    placeholder: "For example: Sabadell, Manresa, Olot…",
    empty: "No town matches your search.",
    region: "Shop opening days in each town",
    colTown: "Town",
    colDays: "May open (29 Nov – 31 Dec)",
    notOn: "not",
    note: (listed, checked) =>
      `Resolució EMT/4342/2025 (DOGC 27 Nov 2025): the ${listed} councils it lists with their own days and, for every other town, the default days the same resolution sets. Checked on ${checked}.`,
  },
};

export function ShopsChristmas({ locale }: { locale: Locale }) {
  const t = COPY[locale];
  const rows = christmasTownRows();
  return (
    <section className="ci-local" aria-label={t.region}>
      <p className="ci-local-summary">{t.summary(rows.length)}</p>
      <LocalHolidaysFilter label={t.label} placeholder={t.placeholder} empty={t.empty} />
      {/* Focusable so the scroll box can be scrolled from the keyboard. */}
      <div className="max-h-[32rem] overflow-y-auto" role="region" aria-label={`${t.colTown} · ${t.colDays}`} tabIndex={0}>
        <table className="ci-local-table">
          <thead>
            <tr>
              <th scope="col">{t.colTown}</th>
              <th scope="col">{t.colDays}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name}>
                <td>{townLabel(row.name, locale)}</td>
                <td>
                  {compactDays(row.open, locale)}
                  {row.swapped.length > 0 ? (
                    <strong>
                      {" "}
                      ({t.notOn} {compactDays(row.swapped, locale)})
                    </strong>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="ci-calc-note">{t.note(RESOLUTION_COUNCILS, dayMonthYear(CHRISTMAS_SHOPS_CHECKED, locale))}</p>
    </section>
  );
}
