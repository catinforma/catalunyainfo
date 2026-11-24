import { AdSlot } from "@/components/AdSlot";
import { crumbPath } from "@/components/share/ShareBar";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { CalculatorNextStep, MoreCalculators } from "@/components/programmatic/calculators/MoreCalculators";
import { ShareBar } from "@/components/share/ShareBar";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getMessages } from "@/lib/i18n";
import { B2_TITLES, b2href } from "@/lib/content/batch02/shared";
import { hubCrumb } from "@/lib/programmatic/calculators/hub";
import { calcPath } from "@/lib/programmatic/calculators/paths";
import { CMP_HEADINGS, calculatorLinks, cmpDisclaimer, cmpFresh, cmpLead, cmpMeta, exampleCase } from "@/lib/programmatic/inheritance-compare/copy";
import { CSV_ATTRIBUTION, CSV_LICENCE } from "@/lib/programmatic/inheritance-compare/csv";
import { cmpFaq } from "@/lib/programmatic/inheritance-compare/faq";
import { VERIFICATION_NOTES } from "@/lib/programmatic/inheritance-compare/notes";
import { CSV_FILENAME, CSV_PATH, cmpEditions, cmpPath } from "@/lib/programmatic/inheritance-compare/paths";
import { RULES_AS_OF, STATE_QUOTE, STATE_SOURCES } from "@/lib/programmatic/inheritance-compare/state";
import { TERRITORIES, exampleRows } from "@/lib/programmatic/inheritance-compare/territories";
import type { Cell, CmpLocale, CmpSource, Territory } from "@/lib/programmatic/inheritance-compare/types";
import { elDay, money, percent, sinceDay } from "@/lib/programmatic/inheritance-tax/copy";
import { STATE_QUOTE as ISD_STATE_QUOTE } from "@/lib/programmatic/inheritance-tax/regions/state";
import { absoluteUrl } from "@/lib/site";
import { breadcrumbSchema, datasetSchema, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

import { SortableExample, type ExampleTableRow } from "./SortableExample";

/**
 * "Impuesto de sucesiones por comunidad": the rules of the 21 territories side
 * by side (lib/programmatic/inheritance-compare/territories.ts), each cell
 * with its article, the date its wording applies from and, further down, the
 * law's own words; one worked example computed wherever every rule it needs
 * was read (the four communities with a calculator through its engine); the
 * gifts from parents to children; the CSV of the same data; FAQ; sources.
 * Server-rendered; only the example table's sort buttons run in the browser.
 */

const L = <T,>(locale: CmpLocale, v: Record<CmpLocale, T>): T => v[locale];

export function cmpMetadata(locale: CmpLocale): Metadata {
  const m = cmpMeta(locale);
  return buildMetadata({ locale, path: cmpPath(locale), title: m.title, description: m.description, translations: cmpEditions() });
}

function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} rel="noopener" target="_blank">
      {children}
    </a>
  );
}

const PENDING: Record<CmpLocale, string> = { ca: "Pendent de verificar", es: "Pendiente de verificar", en: "Pending verification" };

function since(iso: string, locale: CmpLocale) {
  return sinceDay(iso, locale);
}

/** A cell: the summary, then "(Ley X, art. Y · since …)" linking the text read. */
function CellView({ t, cell, locale }: { t: Territory; cell: Cell; locale: CmpLocale }) {
  if (cell.pending) {
    return (
      <>
        <strong>{PENDING[locale]}.</strong> {cell.text[locale]}
      </>
    );
  }
  const src = cell.cite ? t.sources[cell.cite.src] : undefined;
  return (
    <>
      {cell.text[locale]}
      {cell.cite && src ? (
        <span className="mt-1 block text-xs text-[var(--color-muted)]">
          <A href={src.url}>
            {src.short}, art. {cell.cite.art}
          </A>
          {cell.from ? ` · ${since(cell.from, locale)}` : null}
        </span>
      ) : null}
    </>
  );
}

function RulesTable({ cols, rows }: { cols: string[]; rows: { key: string; head: ReactNode; cells: ReactNode[] }[] }) {
  return (
    <div className="ci-table-scroll mt-4">
      <table className="ci-local-table ci-stack-table">
        <thead>
          <tr>
            {cols.map((c) => (
              <th key={c} scope="col">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key}>
              <th scope="row" className="align-top font-semibold" data-label={cols[0]}>
                {r.head}
              </th>
              {r.cells.map((c, j) => (
                <td key={j} className="align-top" data-label={cols[j + 1]}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Quote({ text, src }: { text: string; src?: CmpSource }) {
  return (
    <blockquote lang="es">
      <p>«{text}»</p>
      {src ? (
        <footer className="text-sm">
          <A href={src.url}>{src.short}</A>
        </footer>
      ) : null}
    </blockquote>
  );
}

export function InheritanceCompareRoute({ locale }: { locale: CmpLocale }) {
  const meta = cmpMeta(locale);
  const hd = CMP_HEADINGS[locale];
  const faq = cmpFaq(locale);
  const M = (n: number) => money(n, locale);
  const P = (n: number) => percent(n, locale);
  const crumbs = [{ label: getMessages(locale).common.home, href: `/${locale}/` }, hubCrumb(locale), { label: meta.breadcrumb, href: cmpPath(locale) }];
  const regime = (t: Territory) => (t.regime === "foral" ? L(locale, { ca: " (foral)", es: " (foral)", en: " (foral)" }) : t.regime === "city" ? L(locale, { ca: " (normes estatals)", es: " (normas estatales)", en: " (state rules)" }) : "");
  const head = (t: Territory) => (
    <>
      {t.name[locale]}
      {regime(t)}
    </>
  );

  const rows = exampleRows();
  const exampleCols = L(locale, {
    ca: ["Territori", "Reduccions aplicades", "Base liquidable", "Quota", "Bonificació", "A pagar"],
    es: ["Territorio", "Reducciones aplicadas", "Base liquidable", "Cuota", "Bonificación", "A pagar"],
    en: ["Territory", "Reductions applied", "Net taxable base", "Tax", "Rebate", "To pay"],
  });
  const exampleTable: ExampleTableRow[] = rows.map(({ territory: t, result: r }) => {
    const links = calculatorLinks(t, locale);
    if (!r) {
      const reason = t.example.kind === "pending" ? t.example.reason[locale] : "";
      return { id: t.id, name: `${t.name[locale]}${regime(t)}`, toPay: null, order: TERRITORIES.indexOf(t), cells: ["—", "—", "—", "—", `${PENDING[locale]}: ${reason}`], href: links?.inheritance };
    }
    return {
      id: t.id,
      name: `${t.name[locale]}${regime(t)}`,
      toPay: r.toPay,
      order: TERRITORIES.indexOf(t),
      cells: [M(r.baseImponible - r.baseLiquidable), M(r.baseLiquidable), M(r.quotaTributaria), r.quotaTributaria > 0 && r.bonusPct > 0 ? P(r.bonusPct) : "—", M(r.toPay)],
      href: links?.inheritance,
    };
  });

  const inheritanceCols = L(locale, {
    ca: ["Territori", "Fills (21+) i cònjuge: reducció", "Bonificació grups I i II", "Habitatge habitual", "Germans (grup III)"],
    es: ["Territorio", "Hijos (21+) y cónyuge: reducción", "Bonificación grupos I y II", "Vivienda habitual", "Hermanos (grupo III)"],
    en: ["Territory", "Children (21+) and spouse: reduction", "Rebate, groups I and II", "Habitual home", "Siblings (group III)"],
  });
  const giftCols = L(locale, {
    ca: ["Territori", "Reducció o bonificació", "Requisit de forma"],
    es: ["Territorio", "Reducción o bonificación", "Requisito de forma"],
    en: ["Territory", "Reduction or rebate", "Formal requirement"],
  });

  const cellLabel = L(locale, {
    ca: { groupII: "Fills i cònjuge", bonus: "Bonificació", home: "Habitatge habitual", groupIII: "Germans", giftBenefit: "Donació de pares a fills", giftFormal: "Requisit de forma de la donació" },
    es: { groupII: "Hijos y cónyuge", bonus: "Bonificación", home: "Vivienda habitual", groupIII: "Hermanos", giftBenefit: "Donación de padres a hijos", giftFormal: "Requisito de forma de la donación" },
    en: { groupII: "Children and spouse", bonus: "Rebate", home: "Habitual home", groupIII: "Siblings", giftBenefit: "Gift from parent to child", giftFormal: "Formal requirement of the gift" },
  });

  const pendingCount = TERRITORIES.reduce((n, t) => n + [t.inheritance.groupII, t.inheritance.bonus, t.inheritance.home, t.inheritance.groupIII, t.gift.benefit, t.gift.formal].filter((c) => c.pending).length, 0);
  const builtCalcs = TERRITORIES.filter((t) => t.calculator);

  const citation = L(locale, {
    ca: `Font: CatalunyaInfo, «${meta.h1}», a partir del BOE, els butlletins oficials i les normes forals (llegits ${elDay(RULES_AS_OF, "ca")}). ${absoluteUrl(cmpPath("ca"))}`,
    es: `Fuente: CatalunyaInfo, «${meta.h1}», a partir del BOE, los boletines oficiales y las normas forales (leídos ${elDay(RULES_AS_OF, "es")}). ${absoluteUrl(cmpPath("es"))}`,
    en: `Source: CatalunyaInfo, "${meta.h1}", compiled from the BOE, the official bulletins and the foral norms (read ${elDay(RULES_AS_OF, "en")}). ${absoluteUrl(cmpPath("en"))}`,
  });

  const allSources = new Map<string, CmpSource>();
  for (const t of TERRITORIES) for (const s of Object.values(t.sources)) allSources.set(s.url, s);
  allSources.set(STATE_SOURCES.lofca.url, STATE_SOURCES.lofca);

  const dataset = datasetSchema({
    path: cmpPath(locale),
    name: meta.h1,
    description: meta.description,
    locale,
    creator: "CatalunyaInfo",
    license: CSV_LICENCE,
    isBasedOn: [...allSources.values()].map((s) => s.url),
    spatialCoverage: L(locale, { ca: "Espanya", es: "España", en: "Spain" }),
    temporalCoverage: RULES_AS_OF.slice(0, 4),
    dateModified: RULES_AS_OF,
  });
  const datasetNode = dataset ? { ...dataset, distribution: { "@type": "DataDownload", encodingFormat: "text/csv", contentUrl: absoluteUrl(CSV_PATH) } } : null;
  const faqSchema = { "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };

  const limits = L(locale, {
    ca: [
      "Només els casos més comuns: fills de 21 anys o més, cònjuge i germans, l'habitatge habitual i la donació de pares a fills. Els nets, els menors de 21 anys, la discapacitat, les assegurances de vida, l'empresa familiar i els usdefruits tenen regles pròpies a cada norma.",
      "L'exemple suposa patrimoni previ zero; amb més patrimoni, el coeficient pot pujar a les comunitats que el fan dependre del patrimoni.",
      "Als territoris forals, la norma es resumeix per als grups I i II; les cel·les que no s'han pogut llegir amb seguretat diuen «pendent de verificar».",
      "Les cel·les resumeixen; el que val és el text de la norma, que s'enllaça a cada una.",
    ],
    es: [
      "Solo los casos más comunes: hijos de 21 años o más, cónyuge y hermanos, la vivienda habitual y la donación de padres a hijos. Los nietos, los menores de 21 años, la discapacidad, los seguros de vida, la empresa familiar y los usufructos tienen reglas propias en cada norma.",
      "El ejemplo supone patrimonio previo cero; con más patrimonio, el coeficiente puede subir en las comunidades que lo hacen depender del patrimonio.",
      "En los territorios forales, la norma se resume para los grupos I y II; las celdas que no se han podido leer con seguridad dicen «pendiente de verificar».",
      "Las celdas resumen; lo que vale es el texto de la norma, que se enlaza en cada una.",
    ],
    en: [
      "Only the most common cases: children aged 21 or more, spouses and siblings, the habitual home and gifts from parents to children. Grandchildren, under-21s, disability, life insurance, family businesses and usufructs have their own rules in each law.",
      "The example assumes no prior wealth; with more, the coefficient can rise in the regions that tie it to the heir's wealth.",
      "For the foral territories the rules are summed up for groups I and II; cells that could not be read with confidence say \"pending verification\".",
      "Cells are summaries; what counts is the text of the law, linked from each one.",
    ],
  });

  return (
    <>
      <SiteHeader locale={locale} translations={cmpEditions()} />
      <main id="main">
        <article>
          <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
            <div className="ci-shell py-5 md:py-8 lg:py-12">
              <Breadcrumbs items={crumbs} locale={locale} />
              <h1 className="ci-measure">{meta.h1}</h1>
              <p className="ci-measure mt-4 text-lg text-[var(--color-ink-soft)]">{cmpLead(locale)}</p>
              <p className="ci-measure mt-2 text-sm text-[var(--color-muted)]">{cmpFresh(locale)}</p>
            </div>
          </header>

          <div className="ci-shell py-10">
            <div className="ci-prose">
              <p className="ci-callout text-sm">{cmpDisclaimer(locale)}</p>

              <h2 id="ejemplo">{hd.example}</h2>
              <p>{exampleCase(locale)}</p>
              <SortableExample
                cols={exampleCols}
                rows={exampleTable}
                labels={L(locale, {
                  ca: { sortBy: "Ordena", cheapest: "De menys a més", dearest: "De més a menys", byName: "Per nom" },
                  es: { sortBy: "Ordenar", cheapest: "De menos a más", dearest: "De más a menos", byName: "Por nombre" },
                  en: { sortBy: "Sort", cheapest: "Lowest first", dearest: "Highest first", byName: "By name" },
                })}
              />
              <p className="text-sm text-[var(--color-muted)]">
                {L(locale, {
                  ca: `Reduccions: parentiu i habitatge, en l'ordre de la llei. Quota: després del coeficient del grup II amb patrimoni previ zero. A Catalunya, Madrid, Andalusia i la Comunitat Valenciana ho calcula la calculadora del web (enllaçada al nom); a la resta, les normes citades a sota, pas a pas, amb arrodoniment al cèntim. Un territori sense alguna de les normes llegides no es calcula.`,
                  es: `Reducciones: parentesco y vivienda, en el orden de la ley. Cuota: tras el coeficiente del grupo II con patrimonio previo cero. En Cataluña, Madrid, Andalucía y la Comunidad Valenciana lo calcula la calculadora de la web (enlazada en el nombre); en el resto, las normas citadas abajo, paso a paso, con redondeo al céntimo. Un territorio sin alguna de las normas leídas no se calcula.`,
                  en: `Reductions: kinship and the home, in the law's order. Tax: after the group II coefficient with no prior wealth. For Catalonia, Madrid, Andalusia and the Valencia region the site's own calculator works it out (linked from the name); elsewhere, the rules quoted below, step by step, rounded to the cent. A territory missing any rule is not computed.`,
                })}
              </p>
              <AdSlot kind="top" locale={locale} path={crumbPath(crumbs)} />
              <CalculatorNextStep current="inheritance-tax-by-region" locale={locale} />

              <h2 id="herencias">{hd.inheritance}</h2>
              <p>
                {L(locale, {
                  ca: "Grup II: fills i descendents de 21 anys o més, cònjuge (i, segons la norma, parella registrada) i ascendents. Grup III: germans, nebots, oncles i parents per afinitat. Les reduccions es resten de la base; la bonificació, de la quota.",
                  es: "Grupo II: hijos y descendientes de 21 años o más, cónyuge (y, según la norma, pareja registrada) y ascendientes. Grupo III: hermanos, sobrinos, tíos y parientes por afinidad. Las reducciones se restan de la base; la bonificación, de la cuota.",
                  en: "Group II: children and descendants aged 21 or more, the spouse (and, depending on the law, a registered partner) and ascendants. Group III: siblings, nephews, nieces, uncles, aunts and in-laws. Reductions come off the base; the rebate comes off the tax.",
                })}
              </p>
              <RulesTable
                cols={inheritanceCols}
                rows={TERRITORIES.map((t) => ({
                  key: t.id,
                  head: head(t),
                  cells: [t.inheritance.groupII, t.inheritance.bonus, t.inheritance.home, t.inheritance.groupIII].map((c, i) => <CellView key={i} t={t} cell={c} locale={locale} />),
                }))}
              />

              <h2 id="donaciones">{hd.gifts}</h2>
              <p>
                {L(locale, {
                  ca: "Una donació d'un pare o una mare a un fill de 21 anys o més. Un immoble paga on és; els diners i la resta de béns, on viu qui els rep (Llei 22/2009, art. 32). Les bonificacions solen exigir una forma concreta: si no es compleix, es perden.",
                  es: "Una donación de un padre o una madre a un hijo de 21 años o más. Un inmueble paga donde está; el dinero y el resto de bienes, donde vive quien los recibe (Ley 22/2009, art. 32). Las bonificaciones suelen exigir una forma concreta: si no se cumple, se pierden.",
                  en: "A gift from a parent to a child aged 21 or more. A property is taxed where it is; cash and other assets where the person receiving them lives (Law 22/2009, art. 32). Rebates usually require a specific form: miss it and the rebate is lost.",
                })}
              </p>
              <RulesTable cols={giftCols} rows={TERRITORIES.map((t) => ({ key: t.id, head: head(t), cells: [t.gift.benefit, t.gift.formal].map((c, i) => <CellView key={i} t={t} cell={c} locale={locale} />) }))} />

              <h2 id="que-norma">{hd.which}</h2>
              <ul>
                <li>
                  {L(locale, {
                    ca: "Herència: la norma de la comunitat on la persona morta va viure més dies dels cinc anys anteriors a la mort, compte de data a data (Llei 22/2009, arts. 28 i 32). No importa on viuen els hereus ni on són els béns.",
                    es: "Herencia: la norma de la comunidad donde la persona fallecida vivió más días de los cinco años anteriores al fallecimiento, contados de fecha a fecha (Ley 22/2009, arts. 28 y 32). No importa dónde viven los herederos ni dónde están los bienes.",
                    en: "Inheritance: the rules of the region where the deceased lived the most days of the five years before the death, counted date to date (Law 22/2009, arts. 28 and 32). Where the heirs live or the assets are does not matter.",
                  })}
                </li>
                <li>
                  {L(locale, {
                    ca: "Una comunitat pot millorar una reducció estatal (aleshores la substitueix) o crear-ne de pròpies; on no ha regulat res, s'apliquen les de la Llei 29/1987.",
                    es: "Una comunidad puede mejorar una reducción estatal (entonces la sustituye) o crear otras propias; donde no ha regulado nada, se aplican las de la Ley 29/1987.",
                    en: "A region may improve a state reduction (which it then replaces) or create its own; where it has regulated nothing, those of Law 29/1987 apply.",
                  })}
                </li>
                <li>
                  {L(locale, {
                    ca: "Ceuta i Melilla no tenen normes pròpies: s'hi aplica la Llei 29/1987, amb la bonificació del seu art. 23 bis, i la gestiona l'Agència Tributària estatal. El País Basc i Navarra tenen el seu propi impost (concert i conveni econòmic).",
                    es: "Ceuta y Melilla no tienen normas propias: se aplica la Ley 29/1987, con la bonificación de su art. 23 bis, y la gestiona la Agencia Tributaria estatal. El País Vasco y Navarra tienen su propio impuesto (concierto y convenio económico).",
                    en: "Ceuta and Melilla have no rules of their own: Law 29/1987 applies, with the rebate of its art. 23 bis, managed by the State Tax Agency. The Basque Country and Navarre have their own tax (economic agreement and convention).",
                  })}
                </li>
              </ul>
              <Quote text={ISD_STATE_QUOTE.residence} src={STATE_SOURCES.lofca} />
              <Quote text={STATE_QUOTE.improved} src={STATE_SOURCES.lofca} />
              <p>
                {L(locale, {
                  ca: "El termini, els certificats i el notari, per ordre:",
                  es: "El plazo, los certificados y el notario, por orden:",
                  en: "The deadline, the certificates and the notary, in order:",
                })}{" "}
                <Link href={b2href("deathSteps", locale)}>{B2_TITLES.deathSteps[locale]}</Link>
              </p>

              <h2 id="calculadoras">{hd.calculators}</h2>
              <p>
                {L(locale, {
                  ca: "Per al teu cas exacte (una altra edat, parentiu, assegurança de vida o patrimoni previ), les calculadores pas a pas:",
                  es: "Para tu caso exacto (otra edad, parentesco, seguro de vida o patrimonio previo), las calculadoras paso a paso:",
                  en: "For your exact case (another age, relationship, life insurance or prior wealth), the step-by-step calculators:",
                })}
              </p>
              <ul>
                {builtCalcs.map((t) => {
                  const links = calculatorLinks(t, locale)!;
                  return (
                    <li key={t.id}>
                      <Link href={links.inheritance}>{L(locale, { ca: `Successions: ${t.name.ca}`, es: `Sucesiones: ${t.name.es}`, en: `Inheritance tax: ${t.name.en}` })}</Link> ·{" "}
                      <Link href={links.gift}>{L(locale, { ca: `Donacions: ${t.name.ca}`, es: `Donaciones: ${t.name.es}`, en: `Gift tax: ${t.name.en}` })}</Link>
                    </li>
                  );
                })}
                <li>
                  <Link href={calcPath("plusvalia", locale)}>{L(locale, { ca: "Plusvàlua municipal en heretar un habitatge", es: "Plusvalía municipal al heredar una vivienda", en: "Plusvalía municipal tax on an inherited home" })}</Link>
                </li>
              </ul>

              <h2 id="textos">{hd.texts}</h2>
              <p>
                {L(locale, {
                  ca: `Les paraules de la llei per a cada cel·la, en castellà tal com es publiquen, i el text consolidat llegit. ${pendingCount > 0 ? `${pendingCount} cel·les queden pendents de verificar: no s'han pogut llegir amb seguretat i no s'hi posa cap xifra.` : ""}`,
                  es: `Las palabras de la ley para cada celda, tal como se publican, y el texto consolidado leído. ${pendingCount > 0 ? `${pendingCount} celdas quedan pendientes de verificar: no se han podido leer con seguridad y no se pone ninguna cifra.` : ""}`,
                  en: `The law's words for each cell, in Spanish as published, and the consolidated text read. ${pendingCount > 0 ? `${pendingCount} cells are pending verification: they could not be read with confidence, so no figure is given.` : ""}`,
                })}
              </p>
              {TERRITORIES.map((t) => {
                const main = t.sources[t.mainSource]!;
                const cells: [string, Cell][] = [
                  [cellLabel.groupII, t.inheritance.groupII],
                  [cellLabel.bonus, t.inheritance.bonus],
                  [cellLabel.home, t.inheritance.home],
                  [cellLabel.groupIII, t.inheritance.groupIII],
                  [cellLabel.giftBenefit, t.gift.benefit],
                  [cellLabel.giftFormal, t.gift.formal],
                ];
                return (
                  <details key={t.id} id={`texto-${t.id}`} className="mt-3">
                    <summary>
                      <strong>{t.name[locale]}</strong>: {main.name}
                    </summary>
                    <p className="text-sm">
                      {main.publisher}, {main.ref}. {L(locale, { ca: "Llegit", es: "Leído", en: "Read" })} {elDay(main.read, locale)}. <A href={t.agency.url}>{t.agency.name[locale]}</A>
                    </p>
                    {VERIFICATION_NOTES[t.id] ? (
                      <p className="text-sm">
                        <strong>{L(locale, { ca: "Nota de la revisió", es: "Nota de la revisión", en: "Note from the check" })}:</strong> {VERIFICATION_NOTES[t.id]![locale]}
                      </p>
                    ) : null}
                    {cells.map(([label, cell]) =>
                      cell.quotes?.length ? (
                        <section key={label}>
                          <h3 className="text-base">{label}</h3>
                          {cell.quotes.map((q) => {
                            const text = typeof q === "string" ? q : q.text;
                            const src = typeof q === "string" ? (cell.cite ? t.sources[cell.cite.src] : undefined) : t.sources[q.src];
                            return <Quote key={text} text={text} src={src} />;
                          })}
                        </section>
                      ) : null,
                    )}
                  </details>
                );
              })}

              <h2 id="descarga">{hd.csv}</h2>
              <p>
                {L(locale, {
                  ca: `Totes les cel·les i l'exemple en un fitxer: una fila per territori i dada, amb l'estat (verificat o pendent), el resum, l'article, la norma, la data d'aplicació i l'enllaç al text. Separat per comes, UTF-8. Cada fila porta «${CSV_ATTRIBUTION}». Reutilitzable amb llicència CC BY 4.0 citant aquesta pàgina.`,
                  es: `Todas las celdas y el ejemplo en un archivo: una fila por territorio y dato, con el estado (verificado o pendiente), el resumen, el artículo, la norma, la fecha de aplicación y el enlace al texto. Separado por comas, UTF-8. Cada fila lleva «${CSV_ATTRIBUTION}». Reutilizable con licencia CC BY 4.0 citando esta página.`,
                  en: `Every cell and the example in one file: one row per territory and item, with the status (verified or pending), the summary (in Spanish), the article, the law, the date it applies from and the link to the text. Comma-separated, UTF-8. Each row carries "${CSV_ATTRIBUTION}". Reusable under CC BY 4.0, citing this page.`,
                })}
              </p>
              <p>
                <a href={CSV_PATH} download>
                  {L(locale, { ca: `Descarregar ${CSV_FILENAME}`, es: `Descargar ${CSV_FILENAME}`, en: `Download ${CSV_FILENAME}` })}
                </a>{" "}
                · <A href={CSV_LICENCE}>CC BY 4.0</A>
              </p>
              <p className="text-sm">
                {L(locale, { ca: "Per citar aquesta pàgina:", es: "Para citar esta página:", en: "To cite this page:" })} <q>{citation}</q>
              </p>

              <h2 id="preguntas">{hd.faq}</h2>
              {faq.map((f) => (
                <section key={f.q}>
                  <h3>{f.q}</h3>
                  <p>{f.a}</p>
                </section>
              ))}

              <h2 id="fuentes">{hd.sources}</h2>
              <p>
                {L(locale, {
                  ca: `Llegides ${elDay(RULES_AS_OF, "ca")}. Els textos consolidats del BOE no tenen valor oficial: el té la publicació al butlletí.`,
                  es: `Leídas ${elDay(RULES_AS_OF, "es")}. Los textos consolidados del BOE no tienen valor oficial: lo tiene la publicación en el boletín.`,
                  en: `Read ${elDay(RULES_AS_OF, "en")}. The BOE's consolidated texts are not official: the bulletin publication is.`,
                })}
              </p>
              <ul className="text-sm">
                {[...allSources.values()].map((s) => (
                  <li key={s.url}>
                    <A href={s.url}>{s.name}</A> ({s.publisher}, {s.ref})
                  </li>
                ))}
              </ul>

              <h2 id="limites">{hd.limits}</h2>
              <ul>
                {limits.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
              <p className="text-sm text-[var(--color-muted)]">{cmpDisclaimer(locale)}</p>

              <MoreCalculators current="inheritance-tax-by-region" locale={locale} />
            </div>
            <ShareBar locale={locale} path={cmpPath(locale)} title={meta.h1} contentType="inheritance_tax_comparison" variant="full" />
          </div>
        </article>
      </main>
      <JsonLd json={graph([breadcrumbSchema(crumbs), ...(datasetNode ? [datasetNode] : []), faqSchema])} />
      <SiteFooter locale={locale} />
    </>
  );
}
