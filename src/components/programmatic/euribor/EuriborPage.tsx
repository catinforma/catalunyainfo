import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { MoreCalculators } from "@/components/programmatic/calculators/MoreCalculators";
import { RevisionCalculator } from "@/components/programmatic/mortgage/RevisionCalculator";
import { ShareBar } from "@/components/share/ShareBar";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getMessages } from "@/lib/i18n";
import { hubCrumb } from "@/lib/programmatic/calculators/hub";
import { REF_NAME, REF_SHORT, bareDay, euriborEditions, euriborPath, monthText, ofMonth, points, rate3, type EuriborLocale } from "@/lib/programmatic/euribor/copy";
import { euriborMeta, freshnessText, leadText, nextText } from "@/lib/programmatic/euribor/page";
import { QUOTE, URLS } from "@/lib/programmatic/euribor/rules";
import { BDE_CSV_URL, BDE_TABLE_PDF, REF_IDS, REF_SERIES, boeDayRange, boeLink, change, latestPoint, monthAfter, pointOf, tableRows, yearBefore, type BoeGroup, type RefId } from "@/lib/programmatic/euribor/series";
import type { EuriborData } from "@/lib/programmatic/euribor/server";
import { mortgagePath } from "@/lib/programmatic/mortgage/copy";
import { breadcrumbSchema, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

/**
 * "Euríbor hoy" / "Euríbor avui" / "Euribor today": the official monthly
 * 12-month Euribor from the Banco de España as published in the BOE, the
 * change on the month and the year, the revision calculator, the last 24
 * months with the other official mortgage reference rates (IRPH, IRS, €STR,
 * public debt), when each is published, and why only the monthly figure.
 * No daily Euribor (EMMI licence), no bank named.
 */

const L = <T,>(locale: EuriborLocale, v: Record<EuriborLocale, T>): T => v[locale];
const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function euriborCrumbs(locale: EuriborLocale, label: string): Crumb[] {
  return [{ label: getMessages(locale).common.home, href: `/${locale}/` }, hubCrumb(locale), { label, href: euriborPath(locale) }];
}

export function euriborMetadata(locale: EuriborLocale, data: EuriborData): Metadata {
  const m = euriborMeta(locale, data.series);
  return buildMetadata({ locale, path: euriborPath(locale), title: m.title, description: m.description, translations: euriborEditions() });
}

function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} rel="noopener" target="_blank">
      {children}
    </a>
  );
}

/** The table's columns, in the order of the official list (Orden EHA/2899/2011 art. 27.1). */
const TABLE_IDS: readonly RefId[] = ["euribor", "irph", "irphEuro", "irs5", "estr12", "debt26"];

export function EuriborRoute({ locale, data }: { locale: EuriborLocale; data: EuriborData }) {
  const s = data.series;
  const meta = euriborMeta(locale, s);
  const crumbs = euriborCrumbs(locale, meta.breadcrumb);
  const lead = leadText(locale, s, data.today);
  const freshness = freshnessText(locale, data.live, data.today, data.snapshotAsOf);
  const e = latestPoint(s.euribor);
  const prev = s.euribor.at(-2) ?? null;
  const ago = e ? pointOf(s.euribor, yearBefore(e.month)) : null;
  const rows = tableRows(s);
  const options = s.euribor
    .slice(-24)
    .reverse()
    .map((p) => ({ month: p.month, value: p.value, boe: p.boe }));
  const day = (iso: string) => bareDay(iso, locale);
  const link = (date: string, group: BoeGroup) => boeLink(date, data.resolutions, group);

  const h = L(locale, {
    es: { latest: "El Euríbor oficial del último mes", table: "El Euríbor y los índices oficiales de los últimos 24 meses", others: "Los otros índices oficiales de las hipotecas", when: "Cuándo se publica cada índice", why: "Por qué aquí no hay Euríbor diario", how: "Cómo afecta a tu hipoteca", sources: "Fuentes" },
    ca: { latest: "L'Euríbor oficial de l'últim mes", table: "L'Euríbor i els índexs oficials dels últims 24 mesos", others: "Els altres índexs oficials de les hipoteques", when: "Quan es publica cada índex", why: "Per què aquí no hi ha Euríbor diari", how: "Com afecta la teva hipoteca", sources: "Fonts" },
    en: { latest: "The latest official Euribor", table: "Euribor and the official indices over the last 24 months", others: "The other official mortgage indices", when: "When each index is published", why: "Why there is no daily Euribor here", how: "What it means for your mortgage", sources: "Sources" },
  });

  const lbl = L(locale, {
    es: { value: (m: string) => `Euríbor a un año ${m}`, prev: "Frente al mes anterior", year: "Frente a hace un año", boe: "Publicado en el BOE", month: "Mes", published: "BOE", latest: "Último dato", of: "Mes del dato", resolution: "Resolución" },
    ca: { value: (m: string) => `Euríbor a un any ${m}`, prev: "Respecte al mes anterior", year: "Respecte a fa un any", boe: "Publicat al BOE", month: "Mes", published: "BOE", latest: "Última dada", of: "Mes de la dada", resolution: "Resolució" },
    en: { value: (m: string) => `12-month Euribor ${m}`, prev: "Change on the previous month", year: "Change on a year earlier", boe: "Published in the BOE", month: "Month", published: "BOE", latest: "Latest figure", of: "Month of the figure", resolution: "Resolution" },
  });

  const caption = L(locale, {
    es: "Medias mensuales en %, tal como las publica el Banco de España en el BOE; el mes más reciente, arriba. «—»: aún no publicado. La columna BOE es el día del Euríbor.",
    ca: "Mitjanes mensuals en %, tal com les publica el Banc d'Espanya al BOE; el mes més recent, a dalt. «—»: encara no publicat. La columna BOE és el dia de l'Euríbor.",
    en: "Monthly averages in %, as the Banco de España publishes them in the BOE; newest first. “—”: not published yet. The BOE column is the Euribor's day.",
  });

  const groups: { group: BoeGroup; ids: RefId[]; label: string }[] = [
    { group: "interbank", ids: ["euribor", "irs5", "estr12"], label: L(locale, { es: "Euríbor, IRS a 5 años y €STR (y Míbor)", ca: "Euríbor, IRS a 5 anys i €STR (i Míbor)", en: "Euribor, 5-year IRS and €STR (and Mibor)" }) },
    { group: "debt", ids: ["debt26"], label: REF_NAME[locale].debt26 },
    { group: "irph", ids: ["irph", "irphEuro"], label: L(locale, { es: "IRPH de entidades y tipo de vivienda de la zona euro", ca: "IRPH d'entitats i tipus d'habitatge de la zona euro", en: "IRPH and the euro-area housing loan rate" }) },
  ];
  const whenCols = L(locale, {
    es: ["Índices", "Último publicado", "Día del BOE (últimos 12 meses)", "Siguiente"],
    ca: ["Índexs", "Últim publicat", "Dia del BOE (últims 12 mesos)", "Següent"],
    en: ["Indices", "Latest published", "BOE day (last 12 months)", "Next"],
  });
  const nextOf = (month: string) =>
    L(locale, {
      es: `${capital(monthText(month, "es"))}`,
      ca: `${capital(monthText(month, "ca"))}`,
      en: monthText(month, "en"),
    });
  const dueText = (range: { min: number; max: number }, after: string) =>
    L(locale, {
      es: `Entre el ${range.min} y el ${range.max} de ${monthText(after, "es")}`,
      ca: `Entre el ${range.min} i el ${range.max} ${ofMonth(after, "ca")}`,
      en: `Between ${range.min} and ${range.max} ${monthText(after, "en")}`,
    });

  const how = L(locale, {
    es: [
      "En una hipoteca variable, el tipo de cada periodo es el Euríbor oficial de un mes concreto más el diferencial pactado. La escritura dice qué mes cuenta (a menudo, el publicado uno o dos meses antes de la fecha de revisión) y cada cuánto se revisa (6 o 12 meses).",
      "Por eso no importa el Euríbor de un día: cuenta la media mensual oficial que publica el Banco de España en el BOE, la de esta página.",
      "Si Euríbor + diferencial sale negativo, pagas un 0 % de interés: la ley no permite intereses negativos ni cláusulas suelo en las hipotecas variables (Ley 5/2019, art. 21).",
    ],
    ca: [
      "En una hipoteca variable, el tipus de cada període és l'Euríbor oficial d'un mes concret més el diferencial pactat. L'escriptura diu quin mes compta (sovint, el publicat un o dos mesos abans de la data de revisió) i cada quant es revisa (6 o 12 mesos).",
      "Per això no importa l'Euríbor d'un dia: compta la mitjana mensual oficial que publica el Banc d'Espanya al BOE, la d'aquesta pàgina.",
      "Si Euríbor + diferencial surt negatiu, pagues un 0 % d'interès: la llei no permet interessos negatius ni clàusules terra a les hipoteques variables (Llei 5/2019, art. 21).",
    ],
    en: [
      "On a variable-rate mortgage, each period's rate is the official Euribor of a given month plus the agreed spread (diferencial). Your deed says which month counts (often the one published one or two months before the revision date) and how often it is revised (6 or 12 months).",
      "So a single day's Euribor does not matter: what counts is the official monthly average the Banco de España publishes in the BOE, the one on this page.",
      "If Euribor + spread comes out negative, you pay 0% interest: Spanish law forbids negative interest and interest-rate floors on variable mortgages (Ley 5/2019, art. 21).",
    ],
  });

  const why = L(locale, {
    es: `El Euríbor diario lo calcula el European Money Markets Institute (EMMI), y sus condiciones de uso prohíben redistribuirlo con fines comerciales sin licencia. El dato mensual es otra cosa: la Orden EHA/2899/2011 (art. 27.2) ordena que «${QUOTE.art27publish}» Es ese dato oficial, con el Banco de España como fuente, el que usan las hipotecas y el único que mostramos.`,
    ca: `L'Euríbor diari el calcula l'European Money Markets Institute (EMMI), i les seves condicions d'ús prohibeixen redistribuir-lo amb finalitats comercials sense llicència. La dada mensual és una altra cosa: l'Orden EHA/2899/2011 (art. 27.2) disposa que «${QUOTE.art27publish}» És aquesta dada oficial, amb el Banc d'Espanya com a font, la que fan servir les hipoteques i l'única que mostrem.`,
    en: `The daily Euribor is computed by the European Money Markets Institute (EMMI), whose terms of use forbid redistributing it commercially without a licence. The monthly figure is different: Orden EHA/2899/2011 (art. 27.2) says “${QUOTE.art27publish}” (official rates are published monthly by the Banco de España in the BOE). That official figure, with the Banco de España as the source, is what mortgages use and the only one shown here.`,
  });

  const disclaimer = L(locale, {
    es: "Información, no asesoramiento financiero. Las cifras son las oficiales publicadas; los cálculos son estimaciones. Antes de firmar o renegociar, revisa tu escritura y la FEIN con tu entidad o un profesional independiente.",
    ca: "Informació, no assessorament financer. Les xifres són les oficials publicades; els càlculs són estimacions. Abans de signar o renegociar, revisa l'escriptura i la FEIN amb la teva entitat o un professional independent.",
    en: "Information, not financial advice. The figures are the official published ones; the calculations are estimates. Before you sign or renegotiate, check your deed and FEIN with your lender or an independent professional.",
  });

  const mortgageLink = L(locale, {
    es: ["¿Vas a pedir una hipoteca?", "Calcula la cuota fija, variable o mixta y el cuadro de amortización"],
    ca: ["Demanaràs una hipoteca?", "Calcula la quota fixa, variable o mixta i el quadre d'amortització"],
    en: ["Taking out a mortgage?", "Work out a fixed, variable or mixed instalment and the amortisation table"],
  });

  return (
    <>
      <SiteHeader locale={locale} translations={euriborEditions()} />
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
              {e ? (
                <>
                  <h2 id="ultimo-dato">{h.latest}</h2>
                  <dl className="ci-calc-results">
                    <div className="ci-calc-total">
                      <dt>{lbl.value(ofMonth(e.month, locale))}</dt>
                      <dd>{rate3(e.value, locale)}</dd>
                    </div>
                    {prev ? (
                      <div>
                        <dt>
                          {lbl.prev} ({monthText(prev.month, locale)}: {rate3(prev.value, locale)})
                        </dt>
                        <dd>{points(change(e.value, prev.value), locale)}</dd>
                      </div>
                    ) : null}
                    {ago ? (
                      <div>
                        <dt>
                          {lbl.year} ({monthText(ago.month, locale)}: {rate3(ago.value, locale)})
                        </dt>
                        <dd>{points(change(e.value, ago.value), locale)}</dd>
                      </div>
                    ) : null}
                    <div>
                      <dt>{lbl.boe}</dt>
                      <dd>
                        <A href={link(e.boe, "interbank")}>{day(e.boe)}</A>
                      </dd>
                    </div>
                  </dl>
                </>
              ) : null}

              {options.length ? <RevisionCalculator locale={locale} options={options} defaults={{ balance: 120_000, years: 20, months: 0, spreadPct: 0.8 }} /> : null}
              <p className="text-sm text-[var(--color-muted)]">{disclaimer}</p>
              <p>
                {mortgageLink[0]} <Link href={mortgagePath(locale)}>{mortgageLink[1]}</Link>.
              </p>

              {rows.length ? (
                <>
                  <h2 id="ultimos-24-meses">{h.table}</h2>
                  <div className="ci-table-scroll mt-4">
                    <table className="ci-local-table ci-stack-table">
                      <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">{caption}</caption>
                      <thead>
                        <tr>
                          <th scope="col">{lbl.month}</th>
                          {TABLE_IDS.map((id) => (
                            <th key={id} scope="col">
                              {REF_SHORT[locale][id]}
                            </th>
                          ))}
                          <th scope="col">{lbl.published}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((r) => (
                          <tr key={r.month}>
                            <th scope="row" className="font-normal">
                              {monthText(r.month, locale)}
                            </th>
                            {TABLE_IDS.map((id) => (
                              <td key={id} data-label={REF_SHORT[locale][id]}>
                                {id === "euribor" ? <strong>{rate3(r.values[id], locale)}</strong> : rate3(r.values[id], locale)}
                              </td>
                            ))}
                            <td data-label={lbl.published}>{r.boe ? <A href={link(r.boe, "interbank")}>{day(r.boe)}</A> : "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-sm">
                    {L(locale, { es: "Banco de España, Boletín Estadístico, tabla 19.1:", ca: "Banc d'Espanya, Butlletí Estadístic, taula 19.1:", en: "Banco de España, Statistical Bulletin, table 19.1:" })} <A href={BDE_CSV_URL}>CSV</A> · <A href={BDE_TABLE_PDF}>PDF</A> · <A href={URLS.bdeTable}>{L(locale, { es: "tipos de interés", ca: "tipus d'interès", en: "interest rates" })}</A>
                  </p>
                </>
              ) : null}

              <h2 id="otros-indices">{h.others}</h2>
              <p>
                {L(locale, {
                  es: "La Orden EHA/2899/2011 (art. 27.1) fija qué índices son «tipos de interés oficiales» para las hipotecas:",
                  ca: "L'Orden EHA/2899/2011 (art. 27.1) fixa quins índexs són «tipos de interés oficiales» per a les hipoteques:",
                  en: "Orden EHA/2899/2011 (art. 27.1) sets which indices are official interest rates for mortgages (“tipos de interés oficiales”):",
                })}
              </p>
              <blockquote lang="es">
                {QUOTE.art27list.map((q) => (
                  <p key={q}>{q}</p>
                ))}
              </blockquote>
              <ul>
                {REF_IDS.filter((id) => id !== "euribor").map((id) => {
                  const p = latestPoint(s[id]);
                  if (!p) return null;
                  return (
                    <li key={id}>
                      <strong>{REF_NAME[locale][id]}</strong>: {rate3(p.value, locale)} ({monthText(p.month, locale)};{" "}
                      <A href={link(p.boe, REF_SERIES[id].group)}>BOE {day(p.boe)}</A>)
                      {id === "irph"
                        ? L(locale, {
                            es: ". Es el «IRPH entidades» de muchas hipotecas antiguas.",
                            ca: ". És l'«IRPH entitats» de moltes hipoteques antigues.",
                            en: ". It is the “IRPH entidades” of many older Spanish mortgages.",
                          })
                        : id === "irphEuro"
                          ? L(locale, { es: ". El BOE lo publica «referido al mes anterior».", ca: ". El BOE el publica «referido al mes anterior».", en: ". The BOE publishes it “referido al mes anterior” (for the month before)." })
                          : "."}
                    </li>
                  );
                })}
                <li>
                  <strong>Míbor</strong>:{" "}
                  {L(locale, {
                    es: "el BOE publica el mismo valor que el Euríbor a un año, y solo vale para las hipotecas firmadas antes del 1 de enero de 2000 (Ley 46/1998, art. 32).",
                    ca: "el BOE publica el mateix valor que l'Euríbor a un any, i només val per a les hipoteques signades abans de l'1 de gener de 2000 (Llei 46/1998, art. 32).",
                    en: "the BOE publishes the same value as the 12-month Euribor, and it only applies to mortgages signed before 1 January 2000 (Ley 46/1998, art. 32).",
                  })}
                </li>
              </ul>

              <h2 id="calendario">{h.when}</h2>
              <p>{e ? nextText(locale, s, data.today) : null}</p>
              <div className="ci-table-scroll mt-4">
                <table className="ci-local-table ci-stack-table">
                  <thead>
                    <tr>
                      {whenCols.map((c) => (
                        <th key={c} scope="col">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {groups.map((g) => {
                      const pts = s[g.ids[0]!];
                      const last = latestPoint(pts);
                      const range = boeDayRange(pts);
                      if (!last || !range) return null;
                      const after = (m: string) => monthAfter(m).slice(0, 7);
                      const upcoming = after(last.month);
                      return (
                        <tr key={g.group}>
                          <th scope="row" className="font-normal">
                            {g.label}
                          </th>
                          <td data-label={whenCols[1]}>
                            {capital(monthText(last.month, locale))}: <A href={link(last.boe, g.group)}>{day(last.boe)}</A>
                          </td>
                          <td data-label={whenCols[2]}>{L(locale, { es: `del ${range.min} al ${range.max}`, ca: `del ${range.min} al ${range.max}`, en: `${range.min} to ${range.max}` })}</td>
                          <td data-label={whenCols[3]}>
                            {nextOf(upcoming)}: {dueText(range, after(upcoming))}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-[var(--color-muted)]">
                {L(locale, {
                  es: "La columna «Siguiente» no es una fecha oficial: es el intervalo en que salió el BOE en los últimos 12 meses. El Banco de España no publica un calendario de estas resoluciones.",
                  ca: "La columna «Següent» no és una data oficial: és l'interval en què ha sortit el BOE els últims 12 mesos. El Banc d'Espanya no publica cap calendari d'aquestes resolucions.",
                  en: "The “Next” column is not an official date: it is the range of days the BOE came out on over the last 12 months. The Banco de España publishes no calendar for these resolutions.",
                })}
              </p>

              <h2 id="hipoteca">{h.how}</h2>
              {how.map((p) => (
                <p key={p}>{p}</p>
              ))}

              <h2 id="euribor-diario">{h.why}</h2>
              <p>{why}</p>

              <h2 id="fuentes">{h.sources}</h2>
              <ul className="text-sm">
                <li>
                  BOE: <A href={URLS.ordenArt27}>Orden EHA/2899/2011, art. 27</A> · <A href={URLS.circular}>Circular 5/2012 del Banco de España (anejo 8)</A> · <A href={URLS.ley46}>Ley 46/1998, art. 32</A>
                </li>
                {e ? (
                  <li>
                    {lbl.resolution} {L(locale, { es: "del Banco de España con el Euríbor", ca: "del Banc d'Espanya amb l'Euríbor", en: "of the Banco de España with the Euribor" })} {ofMonth(e.month, locale)}: <A href={link(e.boe, "interbank")}>BOE {day(e.boe)}</A>
                  </li>
                ) : null}
                <li>
                  {L(locale, { es: "Banco de España, tabla 19.1 (series", ca: "Banc d'Espanya, taula 19.1 (sèries", en: "Banco de España, table 19.1 (series" })} {REF_IDS.map((id) => REF_SERIES[id].code).join(", ")}): <A href={BDE_CSV_URL}>be1901.csv</A>.{" "}
                  {L(locale, { es: "Fuente: Banco de España.", ca: "Font: Banc d'Espanya.", en: "Source: Banco de España." })}
                </li>
                <li>
                  <A href={URLS.emmiTerms}>{L(locale, { es: "EMMI: condiciones de uso", ca: "EMMI: condicions d'ús", en: "EMMI: terms of use" })}</A> · <A href={URLS.bdeLegal}>{L(locale, { es: "Banco de España: aviso legal", ca: "Banc d'Espanya: avís legal", en: "Banco de España: legal notice" })}</A>
                </li>
              </ul>

              <MoreCalculators current="euribor" locale={locale} />
            </div>
            <ShareBar locale={locale} path={euriborPath(locale)} title={meta.h1} contentType="euribor" variant="full" />
          </div>
        </article>
      </main>
      <JsonLd json={graph([breadcrumbSchema(crumbs)])} />
      <SiteFooter locale={locale} />
    </>
  );
}
