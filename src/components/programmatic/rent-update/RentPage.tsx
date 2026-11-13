import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { MoreCalculators } from "@/components/programmatic/calculators/MoreCalculators";
import { ShareBar } from "@/components/share/ShareBar";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getMessages } from "@/lib/i18n";
import { hubCrumb } from "@/lib/programmatic/calculators/hub";
import { DECIMALS, SERIES_LABEL, elDay, monthText, pct, rentEditions, rentPath, type RentLocale } from "@/lib/programmatic/rent-update/copy";
import { defaultExample } from "@/lib/programmatic/rent-update/engine";
import { SERIES, tableUrl } from "@/lib/programmatic/rent-update/ine";
import { lastMonths, leadText, nextRelease, rentMeta } from "@/lib/programmatic/rent-update/page";
import { GENCAT_LATEST_RESOLUTIONS, IRAV_DEFINITION_ES, NORMS, OFFICIAL_LINKS, RENT_RULES_AS_OF } from "@/lib/programmatic/rent-update/rules";
import type { ServerRentData } from "@/lib/programmatic/rent-update/server";
import { breadcrumbSchema, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

import { RentCalculator } from "./RentCalculator";

/**
 * "Actualizar el alquiler" / "Actualitzar el lloguer" / "Rent increase in
 * Spain": the answer for today first (computed from the INE figures of this
 * render), the calculator with that example already worked out, the last
 * twelve months of the IPC and the IRAV, then the rules by kind of
 * contract, with the BOE texts and the INE pages they come from.
 */

const L = <T,>(locale: RentLocale, v: Record<RentLocale, T>): T => v[locale];

export function rentCrumbs(locale: RentLocale, label: string): Crumb[] {
  return [
    { label: getMessages(locale).common.home, href: `/${locale}/` },
    hubCrumb(locale),
    { label, href: rentPath(locale) },
  ];
}

export function rentMetadata(locale: RentLocale, data: ServerRentData): Metadata {
  const m = rentMeta(locale, data.series);
  return buildMetadata({ locale, path: rentPath(locale), title: m.title, description: m.description, translations: rentEditions() });
}

function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} rel="noopener" target="_blank">
      {children}
    </a>
  );
}

export function RentRoute({ locale, data }: { locale: RentLocale; data: ServerRentData }) {
  const meta = rentMeta(locale, data.series);
  const crumbs = rentCrumbs(locale, meta.breadcrumb);
  const lead = leadText(locale, data.series, data.today);
  const rows = lastMonths(data.series, 12);
  const next = nextRelease(data.series);
  const allLive = data.live.ipc && data.live.irav;

  const freshness = allLive
    ? L(locale, {
        es: `Datos leídos del INE ${elDay(data.today, "es")}. ${next?.published ? `Próximo dato: ${monthText(next.month, "es")}, ${elDay(next.published, "es")}.` : ""}`,
        ca: `Dades llegides de l'INE ${elDay(data.today, "ca")}. ${next?.published ? `Pròxima dada: ${monthText(next.month, "ca")}, ${elDay(next.published, "ca")}.` : ""}`,
        en: `Figures read from the INE ${elDay(data.today, "en")}. ${next?.published ? `Next release: ${monthText(next.month, "en")}, ${elDay(next.published, "en")}.` : ""}`,
      })
    : L(locale, {
        es: `No hemos podido leer el INE en este momento: las cifras son las de nuestra copia ${elDay(data.snapshotAsOf, "es")}.`,
        ca: `No hem pogut llegir l'INE en aquest moment: les xifres són les de la nostra còpia ${elDay(data.snapshotAsOf, "ca")}.`,
        en: `We could not read the INE just now: the figures are from our copy taken ${elDay(data.snapshotAsOf, "en")}.`,
      });

  const h = L(locale, {
    es: {
      table: "El IPC y el IRAV de los últimos 12 meses",
      which: "Qué límite tiene tu contrato",
      month: "Qué mes del índice cuenta",
      how: "Cómo se aplica la subida",
      irav: "Qué es el IRAV",
      cat: "En Cataluña: zonas de mercado tensionado",
      sources: "Fuentes",
    },
    ca: {
      table: "L'IPC i l'IRAV dels últims 12 mesos",
      which: "Quin límit té el teu contracte",
      month: "Quin mes de l'índex compta",
      how: "Com s'aplica la pujada",
      irav: "Què és l'IRAV",
      cat: "A Catalunya: zones de mercat tensionat",
      sources: "Fonts",
    },
    en: {
      table: "The CPI and the IRAV over the last 12 months",
      which: "Which cap applies to your contract",
      month: "Which month of the index counts",
      how: "How the increase is applied",
      irav: "What the IRAV is",
      cat: "In Catalonia: rent-controlled areas",
      sources: "Sources",
    },
  });

  const cols = L(locale, {
    es: ["Mes", "IPC general", "IRAV", "Publicado"],
    ca: ["Mes", "IPC general", "IRAV", "Publicat"],
    en: ["Month", "CPI (all items)", "IRAV", "Released"],
  });
  const caption = L(locale, {
    es: "Variación anual en %, tal como la publica el INE. La actualización usa el último mes publicado el día del aniversario del contrato.",
    ca: "Variació anual en %, tal com la publica l'INE. L'actualització fa servir l'últim mes publicat el dia de l'aniversari del contracte.",
    en: "Annual change in %, as the INE publishes it. The update uses the latest month released on the contract's anniversary.",
  });

  const cases = L<[string, string][]>(locale, {
    es: [
      ["Vivienda, contrato firmado desde el 26 de mayo de 2023", "Desde 2025, la subida no puede pasar del IRAV (disposición adicional undécima de la LAU, añadida por la Ley 12/2023). Si el contrato dice IPC o un porcentaje fijo más alto, se aplica el IRAV."],
      [
        "Vivienda, contrato firmado antes del 26 de mayo de 2023",
        "Hasta el 7 de octubre de 2026 se aplicaba lo que dijera el contrato (con el IPC como tope si se firmó desde el 6 de marzo de 2019). Desde el 8 de octubre de 2026 también tiene el tope del IRAV: el Real Decreto-ley 29/2026 reescribió la disposición transitoria cuarta de la Ley 12/2023 y el Congreso lo convalidó el 12 de noviembre de 2026.",
      ],
      ["Actualizaciones de 2023 y 2024", "En 2023 el tope era la variación del Índice de Garantía de Competitividad (IGC), que la Ley 2/2015 deja entre el 0 y el 2 %; en 2024, el 3 % (Real Decreto-ley 6/2022, art. 46). Valían para todos los contratos de vivienda; un arrendador que no era gran tenedor podía pactar otra subida con el inquilino."],
      ["Del 22 de marzo al 29 de abril de 2026", "El Real Decreto-ley 8/2026 limitó la subida al 2 % hasta que el Congreso lo derogó (BOE del 30 de abril de 2026)."],
      ["Local de negocio u otro uso", "Manda el contrato (art. 4.3 de la LAU): ninguno de estos límites se aplica. Si dice IPC, se aplica el IPC entero."],
      ["Contrato sin cláusula de actualización", "La renta no se actualiza (art. 18.1 LAU: «En defecto de pacto expreso, no se aplicará actualización de rentas»). Si la cláusula prevé actualizar sin decir con qué índice, la redacción vigente del art. 18.1 manda usar el IRAV."],
    ],
    ca: [
      ["Habitatge, contracte signat des del 26 de maig de 2023", "Des del 2025, la pujada no pot passar de l'IRAV (disposició addicional onzena de la LAU, afegida per la Llei 12/2023). Si el contracte diu IPC o un percentatge fix més alt, s'aplica l'IRAV."],
      [
        "Habitatge, contracte signat abans del 26 de maig de 2023",
        "Fins al 7 d'octubre de 2026 s'aplicava el que digués el contracte (amb l'IPC com a sostre si es va signar des del 6 de març de 2019). Des del 8 d'octubre de 2026 també té el sostre de l'IRAV: el Reial decret llei 29/2026 va reescriure la disposició transitòria quarta de la Llei 12/2023 i el Congrés el va convalidar el 12 de novembre de 2026.",
      ],
      ["Actualitzacions del 2023 i el 2024", "El 2023 el sostre era la variació de l'Índex de Garantia de Competitivitat (IGC), que la Llei 2/2015 deixa entre el 0 i el 2 %; el 2024, el 3 % (Reial decret llei 6/2022, art. 46). Valien per a tots els contractes d'habitatge; un arrendador que no era gran tenidor podia pactar una altra pujada amb l'inquilí."],
      ["Del 22 de març al 29 d'abril de 2026", "El Reial decret llei 8/2026 va limitar la pujada al 2 % fins que el Congrés el va derogar (BOE del 30 d'abril de 2026)."],
      ["Local de negoci o un altre ús", "Mana el contracte (art. 4.3 de la LAU): cap d'aquests límits no s'hi aplica. Si diu IPC, s'aplica l'IPC sencer."],
      ["Contracte sense clàusula d'actualització", "La renda no s'actualitza (art. 18.1 LAU: «En defecto de pacto expreso, no se aplicará actualización de rentas»). Si la clàusula preveu actualitzar sense dir amb quin índex, la redacció vigent de l'art. 18.1 mana fer servir l'IRAV."],
    ],
    en: [
      ["Housing lease signed on or after 26 May 2023", "Since 2025 the increase cannot exceed the IRAV (additional provision 11 of the LAU, added by Law 12/2023). If the contract says CPI or a higher fixed percentage, the IRAV applies instead."],
      [
        "Housing lease signed before 26 May 2023",
        "Until 7 October 2026 the contract decided (with the CPI as a ceiling if it was signed on or after 6 March 2019). Since 8 October 2026 the IRAV cap applies too: Royal Decree-law 29/2026 rewrote transitional provision 4 of Law 12/2023, and the Congress validated it on 12 November 2026.",
      ],
      ["Updates in 2023 and 2024", "In 2023 the cap was the change in the Competitiveness Guarantee Index (IGC), which Law 2/2015 keeps between 0 and 2%; in 2024, 3% (Royal Decree-law 6/2022, art. 46). They applied to every housing lease; a landlord who was not a large landlord could agree a different increase with the tenant."],
      ["22 March to 29 April 2026", "Royal Decree-law 8/2026 capped the increase at 2% until the Congress repealed it (BOE, 30 April 2026)."],
      ["Shop, office or other non-housing lease", "The contract decides (LAU art. 4.3): none of these caps applies. If it says CPI, the full CPI applies."],
      ["Contract with no update clause", "The rent is not updated (LAU art. 18.1: “En defecto de pacto expreso, no se aplicará actualización de rentas”). If the clause provides for an update without naming the index, the current wording of art. 18.1 says to use the IRAV."],
    ],
  });

  const monthParas = L(locale, {
    es: [
      "La ley no habla del mes del aniversario, sino del último índice publicado ese día: «tomando como mes de referencia para la actualización el que corresponda al último índice que estuviera publicado en la fecha de actualización del contrato» (art. 18.1 LAU).",
      "El INE publica el IPC definitivo y el IRAV el mismo día, hacia mediados del mes siguiente. Un contrato que cumple años el 5 de un mes suele usar el dato de dos meses antes; uno que los cumple el 20, el del mes anterior. La calculadora lo mira en el calendario del INE. El IPC adelantado de final de mes es una estimación y no cuenta.",
    ],
    ca: [
      "La llei no parla del mes de l'aniversari, sinó de l'últim índex publicat aquell dia: «tomando como mes de referencia para la actualización el que corresponda al último índice que estuviera publicado en la fecha de actualización del contrato» (art. 18.1 LAU).",
      "L'INE publica l'IPC definitiu i l'IRAV el mateix dia, cap a mitjan mes següent. Un contracte que fa anys el dia 5 d'un mes sol fer servir la dada de dos mesos abans; un que en fa el 20, la del mes anterior. La calculadora ho mira al calendari de l'INE. L'IPC avançat de final de mes és una estimació i no compta.",
    ],
    en: [
      "The law does not use the anniversary's month but the latest index released on that day: “tomando como mes de referencia para la actualización el que corresponda al último índice que estuviera publicado en la fecha de actualización del contrato” (LAU art. 18.1).",
      "The INE releases the final CPI and the IRAV on the same day, around the middle of the following month. A contract whose anniversary is on the 5th usually takes the figure from two months earlier; one on the 20th, the previous month's. The calculator checks the INE's release calendar. The flash CPI at the end of the month is an estimate and does not count.",
    ],
  });

  const howParas = L(locale, {
    es: [
      "La renta actualizada se paga desde el mes siguiente a que una parte lo notifique a la otra por escrito, indicando el porcentaje aplicado; vale una nota en el recibo del mes anterior. El inquilino puede pedir el certificado del INE (art. 18.2 LAU).",
      "Solo se actualiza una vez al año, en la fecha en que se cumple cada año de contrato, y solo si el contrato lo prevé.",
    ],
    ca: [
      "La renda actualitzada es paga des del mes següent que una part ho notifiqui a l'altra per escrit, indicant el percentatge aplicat; val una nota al rebut del mes anterior. L'inquilí pot demanar el certificat de l'INE (art. 18.2 LAU).",
      "Només s'actualitza un cop l'any, en la data en què es compleix cada any de contracte, i només si el contracte ho preveu.",
    ],
    en: [
      "The updated rent is due from the month after one party notifies the other in writing, stating the percentage applied; a note on the previous month's receipt is valid. The tenant can ask for the INE certificate (LAU art. 18.2).",
      "The rent is updated once a year, on the date each year of the contract is completed, and only if the contract provides for it.",
    ],
  });

  const iravIntro = L(locale, {
    es: "El Índice de Referencia para la Actualización de Arrendamientos de Vivienda lo elabora el INE por mandato de la Ley 12/2023 y lo publica cada mes desde enero de 2025 (el primer dato, de noviembre de 2024). Su definición, en palabras del INE:",
    ca: "L'Índex de Referència per a l'Actualització d'Arrendaments d'Habitatge l'elabora l'INE per mandat de la Llei 12/2023 i el publica cada mes des del gener de 2025 (la primera dada, de novembre de 2024). La seva definició, en paraules de l'INE:",
    en: "The Reference Index for Updating Housing Leases (IRAV) is produced by the INE under Law 12/2023 and released every month since January 2025 (the first figure, for November 2024). Its definition, in the INE's words (Spanish):",
  });
  const iravAfter = L(locale, {
    es: "Por eso el IRAV nunca supera la variación anual del IPC general del mismo mes.",
    ca: "Per això l'IRAV mai no supera la variació anual de l'IPC general del mateix mes.",
    en: "That is why the IRAV is never above the all-items CPI annual change for the same month.",
  });

  const resolutions = GENCAT_LATEST_RESOLUTIONS.names.join(L(locale, { es: " y ", ca: " i ", en: " and " }));
  const catParas = L(locale, {
    es: [
      `La Generalitat aplica el límite de precio del alquiler en los municipios declarados zona de mercado residencial tensionado; las últimas resoluciones son la ${resolutions} (${GENCAT_LATEST_RESOLUTIONS.dogc}, ${elDay(GENCAT_LATEST_RESOLUTIONS.date, "es").replace(/^el /, "")}). Ese límite, con el índice estatal de referencia, se aplica a la renta inicial de los contratos nuevos (art. 17.6 y 17.7 LAU); la actualización anual de un contrato en vigor sigue las reglas de arriba. No lo calculamos aquí: la Generalitat tiene la lista de municipios y el enlace a la calculadora del índice estatal.`,
    ],
    ca: [
      `La Generalitat aplica el límit del preu del lloguer als municipis declarats zona de mercat residencial tensat; les últimes resolucions són la ${resolutions} (${GENCAT_LATEST_RESOLUTIONS.dogc}, ${elDay(GENCAT_LATEST_RESOLUTIONS.date, "ca").replace(/^el /, "")}). Aquest límit, amb l'índex estatal de referència, s'aplica a la renda inicial dels contractes nous (art. 17.6 i 17.7 LAU); l'actualització anual d'un contracte vigent segueix les regles de dalt. No el calculem aquí: la Generalitat té la llista de municipis i l'enllaç a la calculadora de l'índex estatal.`,
    ],
    en: [
      `The Generalitat applies the rent price limit in towns declared tight housing markets (zonas de mercado residencial tensionado); the latest resolutions are ${resolutions} (${GENCAT_LATEST_RESOLUTIONS.dogc}, ${elDay(GENCAT_LATEST_RESOLUTIONS.date, "en").replace(/^on /, "")}). That limit, with the state reference price index, applies to the starting rent of new contracts (LAU art. 17.6 and 17.7); the yearly update of a running contract follows the rules above. We do not calculate it here: the Generalitat has the list of towns and the link to the state index calculator.`,
    ],
  });
  const catLinks = L<[string, string][]>(locale, {
    es: [
      [OFFICIAL_LINKS.gencatLimit, "Limitación del precio del alquiler (Generalitat, en catalán)"],
      [OFFICIAL_LINKS.gencatTowns, "Lista de municipios en zona tensionada"],
      [OFFICIAL_LINKS.gencatRules, "Normativa"],
    ],
    ca: [
      [OFFICIAL_LINKS.gencatLimit, "Limitació del preu del lloguer de l'habitatge (Generalitat)"],
      [OFFICIAL_LINKS.gencatTowns, "Llista de municipis en zona tensada"],
      [OFFICIAL_LINKS.gencatRules, "Normativa"],
    ],
    en: [
      [OFFICIAL_LINKS.gencatLimit, "Rent price limit (Generalitat, in Catalan)"],
      [OFFICIAL_LINKS.gencatTowns, "Towns in tight-market areas"],
      [OFFICIAL_LINKS.gencatRules, "Rules"],
    ],
  });

  const disclaimer = L(locale, {
    es: `Es un cálculo orientativo con los datos oficiales del INE y las normas publicadas en el BOE (revisadas ${elDay(RENT_RULES_AS_OF, "es")}), no asesoramiento jurídico. Lo que diga tu contrato, si el arrendador es gran tenedor o un cambio de ley posterior pueden cambiar el resultado. Ante una discrepancia, consulta un profesional o la oficina de vivienda de tu ayuntamiento.`,
    ca: `És un càlcul orientatiu amb les dades oficials de l'INE i les normes publicades al BOE (revisades ${elDay(RENT_RULES_AS_OF, "ca")}), no assessorament jurídic. El que digui el teu contracte, si l'arrendador és gran tenidor o un canvi de llei posterior poden canviar el resultat. Davant d'una discrepància, consulta un professional o l'oficina d'habitatge del teu ajuntament.`,
    en: `This is an estimate from the INE's official figures and the rules published in the BOE (checked ${elDay(RENT_RULES_AS_OF, "en")}), not legal advice. Your contract's wording, whether the landlord is a large landlord, or a later change in the law can change the result. If in doubt, ask a professional or your town council's housing office.`,
  });

  const ministry = L(locale, {
    es: "El INE remite a la calculadora del Ministerio de Vivienda para los contratos con IRAV:",
    ca: "L'INE remet a la calculadora del Ministeri d'Habitatge per als contractes amb IRAV:",
    en: "For IRAV contracts, the INE points to the Ministry of Housing's own calculator:",
  });

  const sourceNorms = (["lau18", "lauDa11", "lau4", "ley12Dt4", "rdl29", "rdl29Valid", "rdl6art46", "ley2Annex", "rdl8", "rdl8Repeal"] as const).map((id) => NORMS[id]);

  return (
    <>
      <SiteHeader locale={locale} translations={rentEditions()} />
      <main id="main">
        <article>
          <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
            <div className="ci-shell py-5 md:py-8 lg:py-12">
              <Breadcrumbs items={crumbs} locale={locale} />
              <h1 className="ci-measure">{meta.h1}</h1>
              {lead ? <p className="ci-measure mt-4 text-lg text-[var(--color-ink-soft)]">{lead}</p> : null}
              <p className="ci-measure mt-2 text-sm text-[var(--color-muted)]">{freshness}</p>
            </div>
          </header>

          <div className="ci-shell py-10">
            <div className="ci-prose">
              <RentCalculator locale={locale} series={data.series} initial={defaultExample(data.today)} />
              <p className="text-sm text-[var(--color-muted)]">{disclaimer}</p>

              <h2 id="indices">{h.table}</h2>
              <div className="ci-table-scroll mt-4">
                <table className="ci-local-table ci-stack-table">
                  <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">{caption}</caption>
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
                      <tr key={r.month}>
                        <th scope="row" className="font-normal">
                          {monthText(r.month, locale)}
                        </th>
                        <td data-label={cols[1]}>{r.ipc === null ? "—" : pct(r.ipc, DECIMALS.ipc, locale)}</td>
                        <td data-label={cols[2]}>{r.irav === null ? "—" : pct(r.irav, DECIMALS.irav, locale)}</td>
                        <td data-label={cols[3]}>{r.published ? elDay(r.published, locale).replace(/^(el |l'|on )/, "") : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm">
                INE: <A href={tableUrl(SERIES.ipc)}>{`${SERIES_LABEL[locale].ipc}, ${SERIES.ipc.code}`}</A> ·{" "}
                <A href={tableUrl(SERIES.irav)}>{`IRAV, ${SERIES.irav.code}`}</A>
              </p>

              <h2 id="limite">{h.which}</h2>
              <dl>
                {cases.map(([term, text]) => (
                  <div key={term} className="mt-3">
                    <dt className="font-semibold">{term}</dt>
                    <dd className="m-0">{text}</dd>
                  </div>
                ))}
              </dl>

              <h2 id="mes">{h.month}</h2>
              {monthParas.map((p) => (
                <p key={p}>{p}</p>
              ))}

              <h2 id="aplicar">{h.how}</h2>
              {howParas.map((p) => (
                <p key={p}>{p}</p>
              ))}
              <p>
                {ministry} <A href={OFFICIAL_LINKS.ministryCalculator}>mivau.gob.es</A>.
              </p>

              <h2 id="irav">{h.irav}</h2>
              <p>{iravIntro}</p>
              <blockquote lang="es">
                <p>{IRAV_DEFINITION_ES}</p>
              </blockquote>
              <p>
                {iravAfter} <A href={OFFICIAL_LINKS.iravPage}>INE · IRAV</A> · <A href={OFFICIAL_LINKS.iravMethod}>{L(locale, { es: "Metodología", ca: "Metodologia", en: "Methodology" })}</A>
              </p>

              <h2 id="catalunya">{h.cat}</h2>
              {catParas.map((p) => (
                <p key={p}>{p}</p>
              ))}
              <ul>
                {catLinks.map(([href, label]) => (
                  <li key={href}>
                    <A href={href}>{label}</A>
                  </li>
                ))}
              </ul>

              <h2 id="fuentes">{h.sources}</h2>
              <ul className="text-sm">
                {sourceNorms.map((n) => (
                  <li key={n.ref + n.name}>
                    <A href={n.url}>{n.name}</A> ({n.ref})
                  </li>
                ))}
                <li>
                  INE ({L(locale, { es: "series", ca: "sèries", en: "series" })}): <A href={tableUrl(SERIES.ipc)}>IPC {SERIES.ipc.code}</A> ·{" "}
                  <A href={tableUrl(SERIES.irav)}>IRAV {SERIES.irav.code}</A> · <A href={tableUrl(SERIES.igc)}>IGC {SERIES.igc.code}</A>
                </li>
              </ul>

              <MoreCalculators current="rent-update" locale={locale} />
            </div>
            <ShareBar locale={locale} path={rentPath(locale)} title={meta.h1} contentType="rent_update" variant="full" />
          </div>
        </article>
      </main>
      <JsonLd json={graph([breadcrumbSchema(crumbs)])} />
      <SiteFooter locale={locale} />
    </>
  );
}
