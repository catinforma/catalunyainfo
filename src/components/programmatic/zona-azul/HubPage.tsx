import Link from "next/link";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ShareBar } from "@/components/share/ShareBar";
import { zbeHubLine } from "@/lib/nav/driving-hubs";
import { hubView } from "@/lib/programmatic/zona-azul/copy";
import { BARCELONA_ROW, CITIES } from "@/lib/programmatic/zona-azul/data";
import { zaHubPath } from "@/lib/programmatic/zona-azul/paths";
import type { Source, ZaLocale } from "@/lib/programmatic/zona-azul/types";

import { SourceList, hubCrumbs } from "./CityPage";

/** The first source of each city (its timetable and prices), then Barcelona's: the texts the table was read on. */
function hubSources(): Source[] {
  const own = CITIES.flatMap((c) => c.sources.slice(0, 2).map((s) => ({ ...s, id: `${c.slug}-${s.id}`, publisher: `${s.publisher} (${c.name.es})` })));
  return [...own, BARCELONA_ROW.source];
}

/** "Zona azul por ciudad": one row per city, and the plain answer that the timetable depends on the city. */
export function HubPage({ locale }: { locale: ZaLocale }) {
  const v = hubView(locale);
  const path = zaHubPath(locale);
  const zbe = zbeHubLine(locale);
  const cells = (row: typeof v.barcelona) => (
    <>
      <th scope="row">
        <Link href={row.href}>{row.name}</Link>
      </th>
      <td>{row.weekday}</td>
      <td>{row.saturday}</td>
      <td>{row.sunday}</td>
      <td>{row.hour}</td>
      <td>{row.stay}</td>
    </>
  );

  return (
    <article>
      <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
        <div className="ci-shell py-5 md:py-8 lg:py-12">
          <Breadcrumbs items={hubCrumbs(locale)} locale={locale} />
          <h1 className="ci-measure">{v.h1}</h1>
          <p className="ci-measure mt-3 text-lg text-[var(--color-ink-soft)]">{v.lead}</p>
          <ShareBar locale={locale} path={path} title={v.h1} contentType="zona_azul_hub" />
        </div>
      </header>

      <div className="ci-shell py-10">
        <div className="ci-prose">
          <h2 id="ciudades">{v.headings.table}</h2>
          <div className="ci-table-scroll mt-4">
            <table className="ci-local-table">
              <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">{v.caption}</caption>
              <thead>
                <tr>
                  {[v.cols.city, v.cols.weekday, v.cols.saturday, v.cols.sunday, v.cols.hour, v.cols.stay].map((h) => (
                    <th key={h} scope="col">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {v.rows.map((row) => (
                  <tr key={row.href}>{cells(row)}</tr>
                ))}
                <tr>{cells(v.barcelona)}</tr>
              </tbody>
            </table>
          </div>
          <p>{v.tableNote}</p>
          <p>
            <Link href={v.barcelona.href}>{v.barcelona.name}</Link>: {v.barcelonaNote}
          </p>
          <p>
            {zbe.text} <Link href={zbe.href}>{zbe.label}</Link>
          </p>

          <h2 id="verano">{v.headings.summer}</h2>
          {v.summer.length > 0 ? (
            <ul>
              {v.summer.map((city) => (
                <li key={city.href}>
                  <Link href={city.href}>{city.name}</Link>. {city.lines.join(" ")}
                </li>
              ))}
            </ul>
          ) : null}
          {v.summer.length < v.rows.length ? <p>{v.noSummer}</p> : null}

          <h2 id="preguntas">{v.headings.faq}</h2>
          {v.faq.map((item) => (
            <section key={item.q}>
              <h3>{item.q}</h3>
              <p>{item.a}</p>
            </section>
          ))}

          <SourceList title={v.headings.sources} sources={hubSources()} note={v.checked} locale={locale} />

          <ShareBar locale={locale} path={path} title={v.h1} contentType="zona_azul_hub" variant="full" />
        </div>
      </div>
    </article>
  );
}
