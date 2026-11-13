import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { MoreCalculators } from "@/components/programmatic/calculators/MoreCalculators";
import { ShareBar } from "@/components/share/ShareBar";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getMessages } from "@/lib/i18n";
import { hubCrumb } from "@/lib/programmatic/calculators/hub";
import { calcPath } from "@/lib/programmatic/calculators/paths";
import { bareDay, elDay, ipcEditions, ipcPath, monthText, rate, signedRate, type IpcLocale } from "@/lib/programmatic/ipc/copy";
import { flashAfter, freshnessText, ipcMeta, leadText } from "@/lib/programmatic/ipc/page";
import { INE_LINKS, IPC_SERIES, IPC_SERIES_IDS, calendarRows, hasCalendarFor, ipcApiUrl, ipcTableUrl, latestFigures, nextReleases, tableRows } from "@/lib/programmatic/ipc/series";
import type { ServerIpcData } from "@/lib/programmatic/ipc/server";
import { breadcrumbSchema, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

/**
 * "IPC hoy" / "IPC avui" / "Spain CPI today": the INE's latest all-items
 * and core CPI (annual and monthly change), the last 24 months, the INE's
 * release calendar (flash and final) for this year and the next one when
 * the INE has published it, what the CPI is used for (pensions, rent, SMI)
 * and how to read it. Every figure comes from the INE's API on the day of
 * the render or from the dated snapshot.
 */

const L = <T,>(locale: IpcLocale, v: Record<IpcLocale, T>): T => v[locale];
const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function ipcCrumbs(locale: IpcLocale, label: string): Crumb[] {
  return [{ label: getMessages(locale).common.home, href: `/${locale}/` }, hubCrumb(locale), { label, href: ipcPath(locale) }];
}

export function ipcMetadata(locale: IpcLocale, data: ServerIpcData): Metadata {
  const m = ipcMeta(locale, latestFigures(data));
  return buildMetadata({ locale, path: ipcPath(locale), title: m.title, description: m.description, translations: ipcEditions() });
}

function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} rel="noopener" target="_blank">
      {children}
    </a>
  );
}

export function IpcRoute({ locale, data }: { locale: IpcLocale; data: ServerIpcData }) {
  const latest = latestFigures(data);
  const meta = ipcMeta(locale, latest);
  const crumbs = ipcCrumbs(locale, meta.breadcrumb);
  const lead = leadText(locale, data, data.today);
  const freshness = freshnessText(locale, data.live.general && data.liveCalendar, data.today, data.snapshotAsOf);
  const rows = tableRows(data);
  const year = Number(data.today.slice(0, 4));
  const calYears = [year, year + 1];
  const cal = calendarRows(data.releases, calYears);
  const nextYearOut = hasCalendarFor(data.releases, year + 1);
  const next = nextReleases(data, data.today);
  const flash = flashAfter(data);
  const day = (iso: string) => bareDay(iso, locale);

  const h = L(locale, {
    es: { latest: "El último dato del IPC", table: "El IPC de los últimos 24 meses", calendar: `Calendario del IPC del INE ${year}-${year + 1}`, uses: "Para qué sirve el IPC", read: "Cómo leer el IPC", sources: "Fuentes" },
    ca: { latest: "L'última dada de l'IPC", table: "L'IPC dels últims 24 mesos", calendar: `Calendari de l'IPC de l'INE ${year}-${year + 1}`, uses: "Per a què serveix l'IPC", read: "Com llegir l'IPC", sources: "Fonts" },
    en: { latest: "The latest CPI figure", table: "Spain's CPI over the last 24 months", calendar: `INE CPI release calendar ${year}-${year + 1}`, uses: "What the CPI is used for", read: "How to read the CPI", sources: "Sources" },
  });

  const labels = L(locale, {
    es: { general: "IPC general, variación anual", generalMonthly: "IPC general, variación mensual", core: "Subyacente, variación anual", coreMonthly: "Subyacente, variación mensual" },
    ca: { general: "IPC general, variació anual", generalMonthly: "IPC general, variació mensual", core: "Subjacent, variació anual", coreMonthly: "Subjacent, variació mensual" },
    en: { general: "All-items CPI, annual change", generalMonthly: "All-items CPI, monthly change", core: "Core, annual change", coreMonthly: "Core, monthly change" },
  });
  const short = L(locale, {
    es: { month: "Mes", general: "General anual", generalMonthly: "General mensual", core: "Subyacente anual", coreMonthly: "Subyacente mensual", published: "Publicado" },
    ca: { month: "Mes", general: "General anual", generalMonthly: "General mensual", core: "Subjacent anual", coreMonthly: "Subjacent mensual", published: "Publicat" },
    en: { month: "Month", general: "All items, annual", generalMonthly: "All items, monthly", core: "Core, annual", coreMonthly: "Core, monthly", published: "Released" },
  });
  const fmt = (id: (typeof IPC_SERIES_IDS)[number], v: number | null) => (id === "generalMonthly" || id === "coreMonthly" ? signedRate(v, locale) : rate(v, locale));

  const latestIntro = latest
    ? L(locale, {
        es: `${capital(monthText(latest.month, "es"))}, publicado por el INE ${latest.published ? `el ${day(latest.published)}` : ""}:`,
        ca: `${capital(monthText(latest.month, "ca"))}, publicat per l'INE ${latest.published ? elDay(latest.published, "ca") : ""}:`,
        en: `${monthText(latest.month, "en")}, released by the INE ${latest.published ? `on ${day(latest.published)}` : ""}:`,
      })
    : "";
  const flashLine = flash
    ? L(locale, {
        es: `Indicador adelantado de ${monthText(flash.month, "es")}: ${rate(flash.value, "es")} anual (INE, ${day(flash.published)}). Es una estimación: el dato definitivo llega a mediados del mes siguiente.`,
        ca: `Indicador avançat de ${monthText(flash.month, "ca")}: ${rate(flash.value, "ca")} anual (INE, ${day(flash.published)}). És una estimació: la dada definitiva arriba a mitjan mes següent.`,
        en: `Flash estimate for ${monthText(flash.month, "en")}: ${rate(flash.value, "en")} a year (INE, ${day(flash.published)}). It is an estimate: the final figure comes in the middle of the next month.`,
      })
    : "";

  const tableCaption = L(locale, {
    es: "Variaciones en %, tal como las publica el INE (base 2025). Solo meses con dato definitivo; el más reciente, arriba.",
    ca: "Variacions en %, tal com les publica l'INE (base 2025). Només mesos amb dada definitiva; el més recent, a dalt.",
    en: "Changes in %, as the INE publishes them (base 2025). Final figures only; newest first.",
  });

  const calCols = L(locale, {
    es: ["Mes del dato", "Adelantado", "Definitivo"],
    ca: ["Mes de la dada", "Avançat", "Definitiu"],
    en: ["Month of the figure", "Flash estimate", "Final figure"],
  });
  const pendingCal = L(locale, { es: "Sin fecha aún", ca: "Encara sense data", en: "Not scheduled yet" });
  const nextBadge = L(locale, { es: "próximo", ca: "proper", en: "next" });
  const calIntro = L(locale, {
    es: "Fechas del calendario oficial del INE (a las 9:00). El adelantado sale a final del mismo mes; el definitivo, con todos los detalles y la subyacente, hacia mitad del mes siguiente.",
    ca: "Dates del calendari oficial de l'INE (a les 9.00). L'avançat surt a final del mateix mes; el definitiu, amb tot el detall i la subjacent, cap a mitjan mes següent.",
    en: "Dates from the INE's official calendar (9:00 Madrid time). The flash estimate comes out at the end of the same month; the final figure, with every detail and core inflation, around the middle of the next month.",
  });
  const calMissing = L(locale, {
    es: `El INE aún no ha publicado su calendario de ${year + 1} (consultado ${data.liveCalendar ? `el ${day(data.today)}` : `el ${day(data.snapshotAsOf)}`}): las fechas de ${year + 1} aparecerán aquí solas cuando lo haga.`,
    ca: `L'INE encara no ha publicat el calendari del ${year + 1} (consultat ${data.liveCalendar ? `el ${day(data.today)}` : `el ${day(data.snapshotAsOf)}`}): les dates del ${year + 1} apareixeran aquí soles quan ho faci.`,
    en: `The INE has not published its ${year + 1} calendar yet (checked on ${data.liveCalendar ? day(data.today) : day(data.snapshotAsOf)}): the ${year + 1} dates will appear here by themselves when it does.`,
  });

  const uses = L<[string, string, string, string][]>(locale, {
    es: [
      ["Pensiones", "Las pensiones contributivas suben cada enero la media del IPC de diciembre a noviembre (art. 58 de la Ley General de la Seguridad Social).", "Calcula la subida de tu pensión en 2027", calcPath("pensions-2027", "es")],
      ["Alquiler", "Si tu contrato de alquiler se actualiza con el IPC, cuenta el último dato publicado en la fecha de actualización; algunos contratos tienen un límite o usan el índice del INE para alquileres (IRAV).", "Calcula cuánto puede subir tu alquiler", calcPath("rent-update", "es")],
      ["Salario mínimo", "El Gobierno tiene en cuenta el IPC, entre otros factores, al fijar el SMI de cada año (art. 27.1 del Estatuto de los Trabajadores).", "Salario mínimo 2027: cuantías y estado", calcPath("smi-2027", "es")],
    ],
    ca: [
      ["Pensions", "Les pensions contributives pugen cada gener la mitjana de l'IPC de desembre a novembre (art. 58 de la Llei general de la Seguretat Social).", "Calcula la pujada de la teva pensió el 2027", calcPath("pensions-2027", "ca")],
      ["Lloguer", "Si el teu contracte de lloguer s'actualitza amb l'IPC, compta l'última dada publicada en la data d'actualització; alguns contractes tenen un límit o fan servir l'índex de l'INE per a lloguers (IRAV).", "Calcula quant pot pujar el teu lloguer", calcPath("rent-update", "ca")],
      ["Salari mínim", "El Govern té en compte l'IPC, entre altres factors, en fixar l'SMI de cada any (art. 27.1 de l'Estatut dels Treballadors).", "Salari mínim 2027: quanties i estat", calcPath("smi-2027", "ca")],
    ],
    en: [
      ["Pensions", "Contributory pensions rise each January by the average CPI from December to November (art. 58 of the General Social Security Act).", "Work out your 2027 pension increase", calcPath("pensions-2027", "en")],
      ["Rent", "If your lease is updated with the CPI, the last figure published on the update date counts; some leases have a cap or use the INE's rental index (IRAV).", "Work out how much your rent can rise", calcPath("rent-update", "en")],
      ["Minimum wage", "The government takes the CPI into account, among other factors, when it sets each year's SMI (Workers' Statute, art. 27.1).", "Minimum wage 2027: amounts and status", calcPath("smi-2027", "en")],
    ],
  });

  const read = L(locale, {
    es: [
      "La variación anual compara el nivel de precios de un mes con el del mismo mes del año anterior: es «la inflación» de la que se habla. La mensual lo compara con el mes anterior y tiene estacionalidad (rebajas, verano).",
      `La inflación subyacente es lo que el INE llama «${IPC_SERIES.core.name.replace(/^Nacional\. Subyacente: /, "").replace(/\. Variación anual\.$/, "")}»: quita lo más volátil para ver la tendencia.`,
      "El indicador adelantado es una primera estimación del IPC general a final de mes; cuenta el dato definitivo, que el INE publica hacia mitad del mes siguiente y es el que sirve para certificados y contratos.",
    ],
    ca: [
      "La variació anual compara el nivell de preus d'un mes amb el del mateix mes de l'any anterior: és «la inflació» de què es parla. La mensual el compara amb el mes anterior i té estacionalitat (rebaixes, estiu).",
      "La inflació subjacent és l'índex general sense aliments no elaborats ni productes energètics: treu el més volàtil per veure la tendència.",
      "L'indicador avançat és una primera estimació de l'IPC general a final de mes; compta la dada definitiva, que l'INE publica cap a mitjan mes següent i és la que serveix per a certificats i contractes.",
    ],
    en: [
      "The annual change compares a month's price level with the same month a year earlier: it is the “inflation” people talk about. The monthly change compares it with the previous month and is seasonal (sales, summer).",
      "Core inflation is the all-items index excluding unprocessed food and energy products: it strips out the most volatile prices to show the trend.",
      "The flash estimate is a first estimate of the all-items CPI at the end of the month; the final figure, which the INE releases around the middle of the next month, is the one used for certificates and contracts.",
    ],
  });

  return (
    <>
      <SiteHeader locale={locale} translations={ipcEditions()} />
      <main id="main">
        <article>
          <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
            <div className="ci-shell py-5 md:py-8 lg:py-12">
              <Breadcrumbs items={crumbs} locale={locale} />
              <h1 className="ci-measure">{meta.h1}</h1>
              <p className="ci-measure mt-4 text-lg text-[var(--color-ink-soft)]">{lead}</p>
              <p className="ci-measure mt-2 text-sm text-[var(--color-muted)]">{freshness}</p>
            </div>
          </header>

          <div className="ci-shell py-10">
            <div className="ci-prose">
              {latest ? (
                <>
                  <h2 id="ultimo-dato">{h.latest}</h2>
                  <p>{latestIntro}</p>
                  <dl className="ci-calc-results">
                    {IPC_SERIES_IDS.map((id) => (
                      <div key={id} className={id === "general" ? "ci-calc-total" : undefined}>
                        <dt>{labels[id]}</dt>
                        <dd>{fmt(id, latest[id])}</dd>
                      </div>
                    ))}
                  </dl>
                  {flashLine ? <p>{flashLine}</p> : null}
                </>
              ) : null}

              {rows.length ? (
                <>
                  <h2 id="ultimos-24-meses">{h.table}</h2>
                  <div className="ci-table-scroll mt-4">
                    <table className="ci-local-table ci-stack-table">
                      <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">{tableCaption}</caption>
                      <thead>
                        <tr>
                          <th scope="col">{short.month}</th>
                          {IPC_SERIES_IDS.map((id) => (
                            <th key={id} scope="col">
                              {short[id]}
                            </th>
                          ))}
                          <th scope="col">{short.published}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((r) => (
                          <tr key={r.month}>
                            <th scope="row" className="font-normal">
                              {monthText(r.month, locale)}
                            </th>
                            {IPC_SERIES_IDS.map((id) => (
                              <td key={id} data-label={short[id]}>
                                {fmt(id, r.values[id])}
                              </td>
                            ))}
                            <td data-label={short.published}>{r.published ? day(r.published) : "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-sm">
                    INE:{" "}
                    {IPC_SERIES_IDS.map((id, i) => (
                      <span key={id}>
                        {i ? " · " : ""}
                        <A href={ipcApiUrl(IPC_SERIES[id])}>{IPC_SERIES[id].code}</A>
                      </span>
                    ))}{" "}
                    · <A href={ipcTableUrl(IPC_SERIES.general)}>{L(locale, { es: "tabla 76125", ca: "taula 76125", en: "table 76125" })}</A> · <A href={ipcTableUrl(IPC_SERIES.core)}>{L(locale, { es: "tabla 76130", ca: "taula 76130", en: "table 76130" })}</A>
                  </p>
                </>
              ) : null}

              <h2 id="calendario">{h.calendar}</h2>
              <p>{calIntro}</p>
              <div className="ci-table-scroll mt-4">
                <table className="ci-local-table ci-stack-table">
                  <thead>
                    <tr>
                      {calCols.map((c) => (
                        <th key={c} scope="col">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cal.map((r) => (
                      <tr key={r.month}>
                        <th scope="row" className="font-normal">
                          {monthText(r.month, locale)}
                        </th>
                        <td data-label={calCols[1]}>
                          {r.flash ? day(r.flash) : pendingCal}
                          {next.flash && r.flash === next.flash.day && r.month === next.flash.month ? <strong> ({nextBadge})</strong> : null}
                        </td>
                        <td data-label={calCols[2]}>
                          {r.final ? day(r.final) : pendingCal}
                          {next.final && r.final === next.final.day && r.month === next.final.month ? <strong> ({nextBadge})</strong> : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {nextYearOut ? null : <p>{calMissing}</p>}
              <p className="text-sm">
                <A href={INE_LINKS.calendar}>{L(locale, { es: "Calendario de publicaciones del INE", ca: "Calendari de publicacions de l'INE", en: "INE release calendar" })}</A> · <A href={INE_LINKS.ics}>{L(locale, { es: "calendario .ics del INE", ca: "calendari .ics de l'INE", en: "INE .ics calendar" })}</A>
              </p>

              <h2 id="para-que-sirve">{h.uses}</h2>
              <ul>
                {uses.map(([title, text, link, href]) => (
                  <li key={title}>
                    <strong>{title}.</strong> {text} <Link href={href}>{link}</Link>.
                  </li>
                ))}
              </ul>

              <h2 id="como-leerlo">{h.read}</h2>
              {read.map((p) => (
                <p key={p}>{p}</p>
              ))}

              <h2 id="fuentes">{h.sources}</h2>
              <ul className="text-sm">
                {IPC_SERIES_IDS.map((id) => (
                  <li key={id}>
                    INE, <A href={ipcTableUrl(IPC_SERIES[id])}>{IPC_SERIES[id].name}</A> ({IPC_SERIES[id].code})
                  </li>
                ))}
                <li>
                  <A href={INE_LINKS.latest}>{L(locale, { es: "INE: IPC, últimos datos", ca: "INE: IPC, últimes dades", en: "INE: CPI, latest data" })}</A> · <A href={INE_LINKS.press}>{L(locale, { es: "notas de prensa del IPC", ca: "notes de premsa de l'IPC", en: "CPI press releases" })}</A>
                </li>
              </ul>

              <MoreCalculators current="ipc" locale={locale} />
            </div>
            <ShareBar locale={locale} path={ipcPath(locale)} title={meta.h1} contentType="ipc" variant="full" />
          </div>
        </article>
      </main>
      <JsonLd json={graph([breadcrumbSchema(crumbs)])} />
      <SiteFooter locale={locale} />
    </>
  );
}
