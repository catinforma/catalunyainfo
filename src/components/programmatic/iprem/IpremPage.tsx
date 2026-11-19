import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { CalculatorNextStep, MoreCalculators } from "@/components/programmatic/calculators/MoreCalculators";
import { ShareBar } from "@/components/share/ShareBar";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getMessages } from "@/lib/i18n";
import { bonoSocialPath } from "@/lib/programmatic/bono-social/copy";
import { BASE_MULTIPLIER, PER_EXTRA_ADULT, PER_MINOR, QUOTE as BONO_QUOTE, SPECIAL_BONUS } from "@/lib/programmatic/bono-social/rules";
import { calcPath } from "@/lib/programmatic/calculators/paths";
import { hubCrumb } from "@/lib/programmatic/calculators/hub";
import { bareDay, elDay, euros, ipremEditions, ipremPath, money, times, type IpremLocale } from "@/lib/programmatic/iprem/copy";
import { freshnessText, historyNote, historyRows, housingRows, ipremFaq, ipremMeta, leadText, legalAidRows, bonoSocialRows, multiplesTable, unemploymentRows } from "@/lib/programmatic/iprem/page";
import { IPREM_14, IPREM_ANNUAL, IPREM_DAILY, IPREM_MONTHLY, IPREM_RULES_AS_OF, IPREM_YEAR, LAW_2023, QUOTE, SOURCES, STATUS_2027, IPREM_LAWS, lawUrl } from "@/lib/programmatic/iprem/rules";
import { pct } from "@/lib/programmatic/rent-update/copy";
import { smiPath } from "@/lib/programmatic/smi/copy";
import { subsidyPath } from "@/lib/programmatic/unemployment-subsidy/copy";
import { INCOME_LIMIT_SHARE } from "@/lib/programmatic/unemployment-subsidy/rules";
import { absoluteUrl } from "@/lib/site";
import { ORGANIZATION_ID, breadcrumbSchema, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

import { IpremCalculator } from "./IpremCalculator";

/**
 * "IPREM 2026" / "IPREM 2026" / "IPREM 2026 (Spain)": the figures in force
 * (day, month, year in 12 and 14 payments) with the BOE text that fixes
 * them and why it still applies, the calculator (multiples and "my income
 * is x times the IPREM"), 12 vs 14 payments, what happens in 2027, the
 * common limits in IPREM multiples (bono social, free legal aid, State
 * Housing Plan rent aid, unemployment subsidy and benefit limits), a
 * multiples table, the history 2004–2026 from the BOE, FAQ, sources and
 * limits. Every figure comes from lib/programmatic/iprem/rules.ts.
 */

const L = <T,>(locale: IpremLocale, v: Record<IpremLocale, T>): T => v[locale];

export function ipremCrumbs(locale: IpremLocale): Crumb[] {
  return [{ label: getMessages(locale).common.home, href: `/${locale}/` }, hubCrumb(locale), { label: ipremMeta(locale).breadcrumb, href: ipremPath(locale) }];
}

export function ipremMetadata(locale: IpremLocale): Metadata {
  const m = ipremMeta(locale);
  return buildMetadata({ locale, path: ipremPath(locale), title: m.title, description: m.description, translations: ipremEditions() });
}

function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} rel="noopener" target="_blank">
      {children}
    </a>
  );
}

function Quote({ text, href, label }: { text: string; href: string; label: string }) {
  return (
    <blockquote lang="es">
      <p>«{text}»</p>
      <footer className="text-sm">
        <A href={href}>{label}</A>
      </footer>
    </blockquote>
  );
}

function Table({ cols, rows, caption, stack = true }: { cols: string[]; rows: ReactNode[][]; caption?: string; stack?: boolean }) {
  return (
    <div className="ci-table-scroll mt-4">
      <table className={stack ? "ci-local-table ci-stack-table" : "ci-local-table"}>
        {caption ? <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">{caption}</caption> : null}
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
          {rows.map((r, i) => (
            <tr key={i}>
              <th scope="row" className="font-normal">
                {r[0]}
              </th>
              {r.slice(1).map((cell, k) => (
                <td key={k} data-label={cols[k + 1]}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function IpremRoute({ locale }: { locale: IpremLocale }) {
  const meta = ipremMeta(locale);
  const crumbs = ipremCrumbs(locale);
  const M = (n: number) => money(n, locale);
  const E = (n: number) => euros(n, locale);
  const T = (n: number) => times(n, locale);
  const P = (n: number) => pct(n, Number.isInteger(n) ? 0 : 1, locale);
  const day = (iso: string) => bareDay(iso, locale);
  const on = (iso: string) => elDay(iso, locale);
  const faq = ipremFaq(locale);
  const u = unemploymentRows();
  const s27 = STATUS_2027;
  const y = IPREM_YEAR;

  const hd = L(locale, {
    es: { now: `IPREM ${y}: todas las cuantías`, why: `¿Por qué sigue el IPREM de 2023?`, pays: "¿IPREM de 12 o de 14 pagas?", next: `IPREM ${y + 1}: qué pasa el 1 de enero`, limits: "Límites habituales en veces el IPREM", bono: "Bono social eléctrico", aid: "Justicia gratuita", housing: "Ayuda al alquiler (Plan Estatal de Vivienda 2026-2030)", dole: "Subsidio por desempleo y paro", multiples: "¿Cuánto es 1, 1,5, 2 o 3 veces el IPREM?", history: "Historia del IPREM de 2004 a 2026", what: "Qué es el IPREM", faq: "Preguntas frecuentes", sources: "Fuentes", limitsOf: "Lo que esta página no hace" },
    ca: { now: `IPREM ${y}: totes les quanties`, why: "Per què continua l'IPREM del 2023?", pays: "IPREM de 12 o de 14 pagues?", next: `IPREM ${y + 1}: què passa l'1 de gener`, limits: "Límits habituals en vegades l'IPREM", bono: "Bo social elèctric", aid: "Justícia gratuïta", housing: "Ajut al lloguer (Pla Estatal d'Habitatge 2026-2030)", dole: "Subsidi per desocupació i atur", multiples: "Quant és 1, 1,5, 2 o 3 vegades l'IPREM?", history: "Història de l'IPREM del 2004 al 2026", what: "Què és l'IPREM", faq: "Preguntes freqüents", sources: "Fonts", limitsOf: "El que aquesta pàgina no fa" },
    en: { now: `IPREM ${y}: every amount`, why: "Why is the 2023 IPREM still in force?", pays: "12-payment or 14-payment IPREM?", next: `IPREM ${y + 1}: what happens on 1 January`, limits: "Common limits in IPREM multiples", bono: "Bono social for electricity", aid: "Free legal aid (justicia gratuita)", housing: "Rent aid (State Housing Plan 2026-2030)", dole: "Unemployment subsidy and benefit", multiples: "How much is 1, 1.5, 2 or 3 times the IPREM?", history: "Spain's IPREM from 2004 to 2026", what: "What the IPREM is", faq: "Questions", sources: "Sources", limitsOf: "What this page does not do" },
  });

  const law = LAW_2023;
  const da90 = L(locale, { es: "Ley 31/2022, disposición adicional nonagésima", ca: "Llei 31/2022, disposició addicional norantena", en: "Law 31/2022, additional provision 90" });
  const nowRows: ReactNode[][] = L(locale, {
    es: [
      ["Al día", <strong key="d">{M(IPREM_DAILY)}</strong>],
      ["Al mes", <strong key="m">{M(IPREM_MONTHLY)}</strong>],
      ["Al año, 12 pagas", <strong key="a">{M(IPREM_ANNUAL)}</strong>],
      ["Al año, 14 pagas", <strong key="b">{M(IPREM_14)}</strong>],
    ],
    ca: [
      ["Al dia", <strong key="d">{M(IPREM_DAILY)}</strong>],
      ["Al mes", <strong key="m">{M(IPREM_MONTHLY)}</strong>],
      ["L'any, 12 pagues", <strong key="a">{M(IPREM_ANNUAL)}</strong>],
      ["L'any, 14 pagues", <strong key="b">{M(IPREM_14)}</strong>],
    ],
    en: [
      ["A day", <strong key="d">{M(IPREM_DAILY)}</strong>],
      ["A month", <strong key="m">{M(IPREM_MONTHLY)}</strong>],
      ["A year, 12 payments", <strong key="a">{M(IPREM_ANNUAL)}</strong>],
      ["A year, 14 payments", <strong key="b">{M(IPREM_14)}</strong>],
    ],
  });

  const nowText = L(locale, {
    es: [
      `Las cuantías de ${y} son las que fijó para 2023 la disposición adicional nonagésima de la Ley 31/2022 (BOE del ${day(law.published)}):`,
      `Y la del IPREM de 14 pagas, en la letra d):`,
      `No hay otra ley de presupuestos desde entonces: el BOE no tiene ninguna para 2024, 2025 ni ${y}. La Constitución prorroga automáticamente los presupuestos anteriores, y con ellos su IPREM:`,
      `El SEPE, que paga el subsidio y el paro con estas cifras, publica para ${y} ${M(IPREM_MONTHLY)} al mes y ${M(IPREM_ANNUAL)} al año, con esta nota:`,
    ],
    ca: [
      `Les quanties del ${y} són les que va fixar per al 2023 la disposició addicional norantena de la Llei 31/2022 (BOE del ${day(law.published)}, text oficial en castellà):`,
      `I la de l'IPREM de 14 pagues, a la lletra d):`,
      `No hi ha cap altra llei de pressupostos des d'aleshores: el BOE no en té cap per al 2024, el 2025 ni el ${y}. La Constitució prorroga automàticament els pressupostos anteriors, i amb ells el seu IPREM:`,
      `El SEPE, que paga el subsidi i l'atur amb aquestes xifres, publica per al ${y} ${M(IPREM_MONTHLY)} al mes i ${M(IPREM_ANNUAL)} l'any, amb aquesta nota:`,
    ],
    en: [
      `The ${y} amounts are the ones additional provision 90 of Law 31/2022 set for 2023 (BOE of ${day(law.published)}, official text in Spanish):`,
      `And the 14-payment IPREM, in letter d):`,
      `No budget act has been passed since: the BOE holds none for 2024, 2025 or ${y}. The Constitution automatically extends the previous budget, and with it its IPREM:`,
      `SEPE, which pays the unemployment subsidy and benefit with these figures, publishes ${M(IPREM_MONTHLY)} a month and ${M(IPREM_ANNUAL)} a year for ${y}, with this note:`,
    ],
  });

  const paysText = L(locale, {
    es: [
      `Lo dice cada norma, y la diferencia es de ${M(IPREM_14 - IPREM_ANNUAL)} al año. El IPREM anual «normal» es el de 12 pagas, ${M(IPREM_ANNUAL)} (12 × ${M(IPREM_MONTHLY)}). El de 14 pagas, ${M(IPREM_14)}, se usa en dos casos:`,
      `Cuando la norma lo dice expresamente: el bono social eléctrico («IPREM de 14 pagas», Real Decreto 897/2017) o el Plan Estatal de Vivienda 2026-2030 («referido a 14 pagas», Real Decreto 326/2026, art. 8.2.b).`,
      `Cuando una norma anterior a julio de 2004 hablaba del salario mínimo «en cómputo anual»: desde el Real Decreto-ley 3/2004 esas referencias son al IPREM, y la letra d) les da la cuantía de 14 pagas, salvo que excluyeran las pagas extra.`,
      `La justicia gratuita, por ejemplo, usa el anual de 12 pagas: la Generalitat lo cuantifica así en su trámite (${M(legalAidRows()[0].amount)} para una persona sin unidad familiar, dos veces ${M(IPREM_ANNUAL)}).`,
    ],
    ca: [
      `Ho diu cada norma, i la diferència és de ${M(IPREM_14 - IPREM_ANNUAL)} l'any. L'IPREM anual «normal» és el de 12 pagues, ${M(IPREM_ANNUAL)} (12 × ${M(IPREM_MONTHLY)}). El de 14 pagues, ${M(IPREM_14)}, s'usa en dos casos:`,
      `Quan la norma ho diu expressament: el bo social elèctric («IPREM de 14 pagas», Reial decret 897/2017) o el Pla Estatal d'Habitatge 2026-2030 («referido a 14 pagas», Reial decret 326/2026, art. 8.2.b).`,
      `Quan una norma anterior al juliol del 2004 parlava del salari mínim «en còmput anual»: des del Reial decret llei 3/2004 aquestes referències són a l'IPREM, i la lletra d) els dona la quantia de 14 pagues, tret que excloguessin les pagues extra.`,
      `La justícia gratuïta, per exemple, usa l'anual de 12 pagues: la Generalitat la quantifica així al seu tràmit (${M(legalAidRows()[0].amount)} per a una persona sense unitat familiar, dues vegades ${M(IPREM_ANNUAL)}).`,
    ],
    en: [
      `Each rule says, and the gap is ${M(IPREM_14 - IPREM_ANNUAL)} a year. The plain yearly IPREM is the 12-payment one, ${M(IPREM_ANNUAL)} (12 × ${M(IPREM_MONTHLY)}). The 14-payment one, ${M(IPREM_14)}, applies in two cases:`,
      `Where the rule says so: the bono social for electricity («IPREM de 14 pagas», Royal Decree 897/2017) or the State Housing Plan 2026-2030 («referido a 14 pagas», Royal Decree 326/2026, art. 8.2.b).`,
      `Where a rule from before July 2004 referred to the minimum wage «en cómputo anual»: since Royal Decree-law 3/2004 those references are to the IPREM, and letter d) gives them the 14-payment amount unless they left out the extra payments.`,
      `Free legal aid, for example, uses the 12-payment yearly figure: the Generalitat's own page puts it that way (${M(legalAidRows()[0].amount)} for a person with no family unit, twice ${M(IPREM_ANNUAL)}).`,
    ],
  });

  const nextText = L(locale, {
    es: [
      `El IPREM de ${y + 1} lo tiene que fijar la Ley de Presupuestos de ${y + 1}:`,
      `Esa ley no existe ni está en trámite. El Gobierno dictó en junio las normas para elaborarla (Orden HAC/557/2026), pero las Cortes se disolvieron el ${day(s27.dissolution.published)} con la convocatoria de elecciones del ${day(s27.dissolution.elections)} (Real Decreto 806/2026):`,
      "Las nuevas cámaras se reúnen después de las elecciones:",
      `Si el 1 de enero de ${y + 1} no hay ley de presupuestos, la Ley General Presupuestaria repite la regla de la Constitución:`,
      `Por tanto, mientras el BOE no publique una nueva ley de presupuestos, el IPREM sigue siendo el de la Ley 31/2022: ${M(IPREM_MONTHLY)} al mes, ${M(IPREM_ANNUAL)} al año y ${M(IPREM_14)} en 14 pagas. Revisamos el BOE y el SEPE en enero; esta página cambiará el día que haya otra cuantía. Cualquier cifra «del IPREM ${y + 1}» distinta que veas antes es una previsión, no una norma.`,
    ],
    ca: [
      `L'IPREM del ${y + 1} l'ha de fixar la Llei de pressupostos del ${y + 1}:`,
      `Aquesta llei no existeix ni està en tràmit. El Govern va dictar al juny les normes per elaborar-la (Ordre HAC/557/2026), però les Corts es van dissoldre el ${day(s27.dissolution.published)} amb la convocatòria d'eleccions del ${day(s27.dissolution.elections)} (Reial decret 806/2026):`,
      "Les noves cambres es reuneixen després de les eleccions:",
      `Si l'1 de gener del ${y + 1} no hi ha llei de pressupostos, la Llei general pressupostària repeteix la regla de la Constitució:`,
      `Per tant, mentre el BOE no publiqui una nova llei de pressupostos, l'IPREM continua sent el de la Llei 31/2022: ${M(IPREM_MONTHLY)} al mes, ${M(IPREM_ANNUAL)} l'any i ${M(IPREM_14)} en 14 pagues. Revisem el BOE i el SEPE al gener; aquesta pàgina canviarà el dia que hi hagi una altra quantia. Qualsevol xifra «de l'IPREM ${y + 1}» diferent que vegis abans és una previsió, no una norma.`,
    ],
    en: [
      `The ${y + 1} IPREM has to be set by the ${y + 1} budget act:`,
      `That act does not exist and is not before parliament. The government issued the rules for drafting it in June (Orden HAC/557/2026), but the Cortes were dissolved on ${day(s27.dissolution.published)} when elections were called for ${day(s27.dissolution.elections)} (Royal Decree 806/2026):`,
      "The new chambers meet after the elections:",
      `If there is no budget act on 1 January ${y + 1}, the General Budget Act repeats the Constitution's rule:`,
      `So until the BOE publishes a new budget act, the IPREM stays the one of Law 31/2022: ${M(IPREM_MONTHLY)} a month, ${M(IPREM_ANNUAL)} a year and ${M(IPREM_14)} in 14 payments. We re-read the BOE and SEPE in January; this page changes the day there is another amount. Any different "${y + 1} IPREM" figure you see before then is a forecast, not law.`,
    ],
  });

  // Bono social (RD 897/2017 art. 3), from the bono social module's engine.
  const hh = (adults: number, minors: number) =>
    L(locale, {
      es: `${adults === 1 ? "1 adulto" : `${adults} adultos`}${minors ? ` y ${minors === 1 ? "1 menor" : `${minors} menores`}` : ""}`,
      ca: `${adults === 1 ? "1 adult" : `${adults} adults`}${minors ? ` i ${minors === 1 ? "1 menor" : `${minors} menors`}` : ""}`,
      en: `${adults === 1 ? "1 adult" : `${adults} adults`}${minors ? ` and ${minors === 1 ? "1 minor" : `${minors} minors`}` : ""}`,
    });
  const bonoCols = L(locale, {
    es: ["Hogar", "Veces el IPREM (14 pagas)", "Vulnerable hasta", "Vulnerable severo hasta"],
    ca: ["Llar", "Vegades l'IPREM (14 pagues)", "Vulnerable fins a", "Vulnerable sever fins a"],
    en: ["Household", "Times the IPREM (14 payments)", "Vulnerable up to", "Severely vulnerable up to"],
  });
  const bonoRows: ReactNode[][] = bonoSocialRows().map((r) => [hh(r.adults, r.minors), `${T(r.multiplier)} ×`, M(r.vulnerable), M(r.severe)]);
  const bm = { base: T(BASE_MULTIPLIER), adult: T(PER_EXTRA_ADULT), minor: T(PER_MINOR), special: T(SPECIAL_BONUS) };
  const bonoText = L(locale, {
    es: `Ingresos anuales de todo el hogar hasta ${bm.base} veces el IPREM de 14 pagas (${M(BASE_MULTIPLIER * IPREM_14)}) para una persona sola, más ${bm.adult} veces (${M(PER_EXTRA_ADULT * IPREM_14)}) por cada adulto y ${bm.minor} (${M(PER_MINOR * IPREM_14)}) por cada menor; con discapacidad, violencia de género, terrorismo, dependencia, familia monoparental o electrodependencia, ${bm.special} vez más (${M(SPECIAL_BONUS * IPREM_14)}). Con la mitad, vulnerable severo. Sin circunstancias especiales:`,
    ca: `Ingressos anuals de tota la llar fins a ${bm.base} vegades l'IPREM de 14 pagues (${M(BASE_MULTIPLIER * IPREM_14)}) per a una persona sola, més ${bm.adult} vegades (${M(PER_EXTRA_ADULT * IPREM_14)}) per cada adult i ${bm.minor} (${M(PER_MINOR * IPREM_14)}) per cada menor; amb discapacitat, violència de gènere, terrorisme, dependència, família monoparental o electrodependència, ${bm.special} vegada més (${M(SPECIAL_BONUS * IPREM_14)}). Amb la meitat, vulnerable sever. Sense circumstàncies especials:`,
    en: `Yearly income of the whole household up to ${bm.base} times the 14-payment IPREM (${M(BASE_MULTIPLIER * IPREM_14)}) for one person alone, plus ${bm.adult} times (${M(PER_EXTRA_ADULT * IPREM_14)}) per further adult and ${bm.minor} (${M(PER_MINOR * IPREM_14)}) per minor; with disability, gender violence, terrorism, dependency, a single parent or electrodependency, ${bm.special} more (${M(SPECIAL_BONUS * IPREM_14)}). At half that, severely vulnerable. With no special circumstance:`,
  });
  const bonoLink = L(locale, { es: "Comprueba si tienes derecho al bono social eléctrico", ca: "Comprova si tens dret al bo social elèctric", en: "Check whether you qualify for the bono social" });

  const aidCols = L(locale, {
    es: ["Unidad familiar", "Veces el IPREM", "Ingresos brutos al año, hasta"],
    ca: ["Unitat familiar", "Vegades l'IPREM", "Ingressos bruts l'any, fins a"],
    en: ["Family unit", "Times the IPREM", "Gross yearly income up to"],
  });
  const aidLabel: Record<string, Record<IpremLocale, string>> = {
    alone: { es: "Una persona sin unidad familiar", ca: "Una persona sense unitat familiar", en: "One person with no family unit" },
    under4: { es: "Unidad familiar de menos de 4 miembros", ca: "Unitat familiar de menys de 4 membres", en: "Family unit of fewer than 4" },
    from4: { es: "4 o más miembros, o familia numerosa", ca: "4 o més membres, o família nombrosa", en: "4 or more, or a large family" },
    exceptional: { es: "Excepcional (art. 5: familia numerosa especial, salud, discapacidad…)", ca: "Excepcional (art. 5: família nombrosa especial, salut, discapacitat…)", en: "Exceptional (art. 5: special large family, health, disability…)" },
  };
  const aidRows: ReactNode[][] = legalAidRows().map((r) => [aidLabel[r.id]![locale], `${T(r.multiple)} ×`, M(r.amount)]);
  const aidText = L(locale, {
    es: ["La Ley 1/1996 reconoce abogado y procurador gratis, sin patrimonio suficiente, con estos ingresos brutos anuales de la unidad familiar (IPREM anual, 12 pagas):", "La Generalitat de Catalunya, que la tramita en Cataluña con los colegios de abogados, lo cuantifica igual:"],
    ca: ["La Llei 1/1996 reconeix advocat i procurador gratuïts, sense patrimoni suficient, amb aquests ingressos bruts anuals de la unitat familiar (IPREM anual, 12 pagues):", "La Generalitat de Catalunya, que la tramita a Catalunya amb els col·legis d'advocats, la quantifica igual:"],
    en: ["Law 1/1996 grants a free lawyer and court representative, without sufficient assets, at these gross yearly incomes of the family unit (yearly IPREM, 12 payments):", "The Generalitat de Catalunya, which processes it in Catalonia with the bar associations, puts the same figures:"],
  });

  const houseCols = L(locale, {
    es: ["Quién", "Veces el IPREM (14 pagas)", `Con el IPREM de ${y}`],
    ca: ["Qui", "Vegades l'IPREM (14 pagues)", `Amb l'IPREM del ${y}`],
    en: ["Who", "Times the IPREM (14 payments)", `With the ${y} IPREM`],
  });
  const houseLabel: Record<string, Record<IpremLocale, string>> = {
    general: { es: "En general (ingresos de todos los que viven en la vivienda)", ca: "En general (ingressos de tots els qui viuen a l'habitatge)", en: "In general (income of everyone living in the home)" },
    raised: { es: "Familia numerosa general, monoparental, discapacidad del 33 % o víctimas de terrorismo", ca: "Família nombrosa general, monoparental, discapacitat del 33 % o víctimes de terrorisme", en: "General large family, single parent, 33% disability or terrorism victims" },
    highest: { es: "Familia numerosa especial o discapacidad del 65 %", ca: "Família nombrosa especial o discapacitat del 65 %", en: "Special large family or 65% disability" },
  };
  const houseRows: ReactNode[][] = housingRows().map((r) => [houseLabel[r.id]![locale], `${T(r.multiple)} ×`, M(r.amount)]);
  const houseText = L(locale, {
    es: ["El Plan Estatal de Vivienda 2026-2030 (Real Decreto 326/2026) cuenta los ingresos en veces el IPREM de 14 pagas, el vigente en el periodo de esos ingresos:", "Para la ayuda al alquiler, el límite de ingresos anuales es este (art. 116.1.c). Lo convoca y lo resuelve cada comunidad autónoma, que puede tener requisitos propios:"],
    ca: ["El Pla Estatal d'Habitatge 2026-2030 (Reial decret 326/2026) compta els ingressos en vegades l'IPREM de 14 pagues, el vigent en el període d'aquests ingressos:", "Per a l'ajut al lloguer, el límit d'ingressos anuals és aquest (art. 116.1.c). El convoca i el resol cada comunitat autònoma, que pot tenir requisits propis:"],
    en: ["The State Housing Plan 2026-2030 (Royal Decree 326/2026) counts income in times the 14-payment IPREM in force for the period of that income:", "For rent aid, the yearly income limit is this (art. 116.1.c). Each region calls and decides it, and may add requirements:"],
  });

  const doleCols = L(locale, {
    es: ["Qué", "% del IPREM", "Al mes"],
    ca: ["Què", "% de l'IPREM", "Al mes"],
    en: ["What", "% of the IPREM", "A month"],
  });
  const doleRows: ReactNode[][] = L(locale, {
    es: [
      ["Subsidio, días 1 a 180", P(u.subsidy[0]!.share * 100), M(u.subsidy[0]!.monthly)],
      ["Subsidio, días 181 a 360", P(u.subsidy[1]!.share * 100), M(u.subsidy[1]!.monthly)],
      ["Subsidio, desde el día 361", P(u.subsidy[2]!.share * 100), M(u.subsidy[2]!.monthly)],
      ["Subsidio para mayores de 52 años", P(u.over52.share * 100), M(u.over52.monthly)],
      ["Paro: mínimo sin hijos", `${P(u.pct.min[0] * 100)} (IPREM + 1/6)`, M(u.min.none)],
      ["Paro: mínimo con hijos", `${P(u.pct.min[1] * 100)} (IPREM + 1/6)`, M(u.min.children)],
      ["Paro: máximo sin hijos", `${P(u.pct.max[0] * 100)} (IPREM + 1/6)`, M(u.max.none)],
      ["Paro: máximo con 1 hijo", `${P(u.pct.max[1] * 100)} (IPREM + 1/6)`, M(u.max.one)],
      ["Paro: máximo con 2 o más hijos", `${P(u.pct.max[2] * 100)} (IPREM + 1/6)`, M(u.max.two)],
    ],
    ca: [
      ["Subsidi, dies 1 a 180", P(u.subsidy[0]!.share * 100), M(u.subsidy[0]!.monthly)],
      ["Subsidi, dies 181 a 360", P(u.subsidy[1]!.share * 100), M(u.subsidy[1]!.monthly)],
      ["Subsidi, des del dia 361", P(u.subsidy[2]!.share * 100), M(u.subsidy[2]!.monthly)],
      ["Subsidi per a més grans de 52 anys", P(u.over52.share * 100), M(u.over52.monthly)],
      ["Atur: mínim sense fills", `${P(u.pct.min[0] * 100)} (IPREM + 1/6)`, M(u.min.none)],
      ["Atur: mínim amb fills", `${P(u.pct.min[1] * 100)} (IPREM + 1/6)`, M(u.min.children)],
      ["Atur: màxim sense fills", `${P(u.pct.max[0] * 100)} (IPREM + 1/6)`, M(u.max.none)],
      ["Atur: màxim amb 1 fill", `${P(u.pct.max[1] * 100)} (IPREM + 1/6)`, M(u.max.one)],
      ["Atur: màxim amb 2 fills o més", `${P(u.pct.max[2] * 100)} (IPREM + 1/6)`, M(u.max.two)],
    ],
    en: [
      ["Subsidy, days 1 to 180", P(u.subsidy[0]!.share * 100), M(u.subsidy[0]!.monthly)],
      ["Subsidy, days 181 to 360", P(u.subsidy[1]!.share * 100), M(u.subsidy[1]!.monthly)],
      ["Subsidy, from day 361", P(u.subsidy[2]!.share * 100), M(u.subsidy[2]!.monthly)],
      ["Subsidy for over-52s", P(u.over52.share * 100), M(u.over52.monthly)],
      ["Benefit (paro): minimum, no children", `${P(u.pct.min[0] * 100)} (IPREM + 1/6)`, M(u.min.none)],
      ["Benefit: minimum, with children", `${P(u.pct.min[1] * 100)} (IPREM + 1/6)`, M(u.min.children)],
      ["Benefit: maximum, no children", `${P(u.pct.max[0] * 100)} (IPREM + 1/6)`, M(u.max.none)],
      ["Benefit: maximum, 1 child", `${P(u.pct.max[1] * 100)} (IPREM + 1/6)`, M(u.max.one)],
      ["Benefit: maximum, 2 or more children", `${P(u.pct.max[2] * 100)} (IPREM + 1/6)`, M(u.max.two)],
    ],
  });
  const doleText = L(locale, {
    es: [
      `El subsidio por desempleo es un porcentaje del IPREM mensual, igual para todos (LGSS, art. 278), y el paro contributivo tiene un mínimo y un máximo sobre el IPREM más una sexta parte (${M(u.sixth)}, art. 270.3). Son las cifras que publica el SEPE para ${y}:`,
      `Cuidado: el límite de ingresos para cobrar el subsidio no es el IPREM, sino el ${P(INCOME_LIMIT_SHARE * 100)} del salario mínimo sin pagas extra: ${E(u.incomeLimit)} al mes en ${y} (SMI de ${M(u.smiMonthly)}).`,
    ],
    ca: [
      `El subsidi per desocupació és un percentatge de l'IPREM mensual, igual per a tothom (LGSS, art. 278), i l'atur contributiu té un mínim i un màxim sobre l'IPREM més una sisena part (${M(u.sixth)}, art. 270.3). Són les xifres que publica el SEPE per al ${y}:`,
      `Compte: el límit d'ingressos per cobrar el subsidi no és l'IPREM, sinó el ${P(INCOME_LIMIT_SHARE * 100)} del salari mínim sense pagues extra: ${E(u.incomeLimit)} al mes el ${y} (SMI de ${M(u.smiMonthly)}).`,
    ],
    en: [
      `The unemployment subsidy is a share of the monthly IPREM, the same for everyone (LGSS art. 278), and the contributory benefit has a floor and a ceiling on the IPREM plus one sixth (${M(u.sixth)}, art. 270.3). These are the figures SEPE publishes for ${y}:`,
      `Careful: the income limit for the subsidy is not the IPREM but ${P(INCOME_LIMIT_SHARE * 100)} of the minimum wage without extra payments: ${E(u.incomeLimit)} a month in ${y} (SMI of ${M(u.smiMonthly)}).`,
    ],
  });
  const doleLinks = L(locale, {
    es: ["Calcula tu subsidio por desempleo", "Calcula tu paro", "Salario mínimo 2027"],
    ca: ["Calcula el teu subsidi per desocupació", "Calcula el teu atur", "Salari mínim 2027"],
    en: ["Work out your unemployment subsidy", "Work out your unemployment benefit", "Minimum wage 2027"],
  });

  const multCols = L(locale, {
    es: ["Veces el IPREM", "Al mes", "Al año, 12 pagas", "Al año, 14 pagas"],
    ca: ["Vegades l'IPREM", "Al mes", "L'any, 12 pagues", "L'any, 14 pagues"],
    en: ["Times the IPREM", "A month", "A year, 12 payments", "A year, 14 payments"],
  });
  const multRows: ReactNode[][] = multiplesTable().map((r) => [`${T(r.multiple)} ×`, M(r.monthly), M(r.annual12), M(r.annual14)]);

  const histCols = L(locale, {
    es: ["Año", "Al día", "Al mes", "Al año (12 pagas)", "Al año (14 pagas)", "Subida", "Norma (BOE)"],
    ca: ["Any", "Al dia", "Al mes", "L'any (12 pagues)", "L'any (14 pagues)", "Pujada", "Norma (BOE)"],
    en: ["Year", "A day", "A month", "A year (12 payments)", "A year (14 payments)", "Rise", "Rule (BOE)"],
  });
  const hist = historyRows();
  const histNote = L(locale, {
    es: "Importes tal como los publica el BOE (el de 14 pagas es el de la letra d de cada ley: en 2008, 7.131,80 €). Subida: del IPREM mensual sobre el año anterior con cifra. «—»: sin ley de presupuestos ese año; no ponemos cifra donde ningún texto oficial la da.",
    ca: "Imports tal com els publica el BOE (el de 14 pagues és el de la lletra d de cada llei: el 2008, 7.131,80 €). Pujada: de l'IPREM mensual sobre l'any anterior amb xifra. «—»: sense llei de pressupostos aquell any; no hi posem xifra on cap text oficial no la dona.",
    en: "Amounts as the BOE publishes them (the 14-payment one is each act's letter d: in 2008, €7,131.80). Rise: of the monthly IPREM over the previous year with a figure. “—”: no budget act that year; we print no figure where no official text gives one.",
  });

  const whatText = L(locale, {
    es: ["El indicador público de renta de efectos múltiples (IPREM) nació en julio de 2004 para que las ayudas dejaran de depender del salario mínimo, que iba a subir más deprisa:", "Desde entonces el salario mínimo solo es la referencia del trabajo; para lo demás cuenta el IPREM:"],
    ca: ["L'indicador públic de renda d'efectes múltiples (IPREM) va néixer el juliol del 2004 perquè els ajuts deixessin de dependre del salari mínim, que havia de pujar més de pressa:", "Des d'aleshores el salari mínim només és la referència de la feina; per a la resta compta l'IPREM:"],
    en: ["The IPREM (public multiple-effects income indicator) was created in July 2004 so that benefits would stop depending on the minimum wage, which was set to rise faster:", "Since then the minimum wage is only the yardstick for pay; for everything else the IPREM counts:"],
  });

  const disclaimer = L(locale, {
    es: `Información orientativa, no vinculante. Las cuantías del IPREM son las del BOE (revisadas ${on(IPREM_RULES_AS_OF)}); cada ayuda tiene sus propios requisitos y su forma de contar los ingresos, y la decide el organismo que la gestiona (SEPE, la comercializadora de referencia, la comisión de justicia gratuita o tu comunidad autónoma).`,
    ca: `Informació orientativa, no vinculant. Les quanties de l'IPREM són les del BOE (revisades ${on(IPREM_RULES_AS_OF)}); cada ajut té els seus requisits i la seva manera de comptar els ingressos, i el decideix l'organisme que el gestiona (SEPE, la comercialitzadora de referència, la comissió de justícia gratuïta o la teva comunitat autònoma).`,
    en: `For guidance only, not binding. The IPREM amounts are the BOE's (checked ${on(IPREM_RULES_AS_OF)}); each benefit has its own requirements and way of counting income, and the body that runs it decides (SEPE, the reference supplier, the legal aid commission or your region).`,
  });
  const sepeLink = L(locale, { es: "Cuantías oficiales del SEPE", ca: "Quanties oficials del SEPE (en castellà)", en: "SEPE's official amounts (in Spanish)" });

  const limits = L(locale, {
    es: ["No decide si tienes derecho a una ayuda: compara tus ingresos con un múltiplo del IPREM; cada norma pide más requisitos.", "No da cuantías del IPREM de 2019, 2020, 2024 ni 2025: ningún texto oficial que tengamos las fija para esos años (presupuestos prorrogados).", "No recoge los indicadores propios de las comunidades autónomas (como el IRSC de Cataluña) ni los límites de cada convocatoria autonómica o municipal.", `No da ninguna cifra del IPREM de ${y + 1} hasta que la publique el BOE.`],
    ca: ["No decideix si tens dret a un ajut: compara els teus ingressos amb un múltiple de l'IPREM; cada norma demana més requisits.", "No dona quanties de l'IPREM del 2019, el 2020, el 2024 ni el 2025: cap text oficial que tinguem no les fixa per a aquells anys (pressupostos prorrogats).", "No recull els indicadors propis de les comunitats autònomes (com l'IRSC de Catalunya) ni els límits de cada convocatòria autonòmica o municipal.", `No dona cap xifra de l'IPREM del ${y + 1} fins que la publiqui el BOE.`],
    en: ["It does not decide whether you qualify: it compares your income with a multiple of the IPREM; each rule asks for more.", "It gives no IPREM amounts for 2019, 2020, 2024 or 2025: no official text we hold sets them for those years (budgets extended).", "It does not cover the regions' own indicators (such as Catalonia's IRSC) or the limits of each regional or local call.", `It gives no ${y + 1} IPREM figure until the BOE publishes one.`],
  });

  const lbl = {
    da90a: `${da90}, ${L(locale, { es: "letras a) a c)", ca: "lletres a) a c)", en: "letters a) to c)" })}`,
    da90d: `${da90}, ${L(locale, { es: "letra d)", ca: "lletra d)", en: "letter d)" })}`,
    ce: L(locale, { es: "Constitución Española, art. 134.4", ca: "Constitució Espanyola, art. 134.4", en: "Spanish Constitution, art. 134.4" }),
    lgp: L(locale, { es: "Ley 47/2003, General Presupuestaria, art. 38.1", ca: "Llei 47/2003, general pressupostària, art. 38.1", en: "General Budget Act (Law 47/2003), art. 38.1" }),
    sepe: L(locale, { es: "SEPE, Cuantías anuales", ca: "SEPE, Cuantías anuales", en: "SEPE, Cuantías anuales" }),
    rdl3: (art: string) => L(locale, { es: `Real Decreto-ley 3/2004, art. ${art}`, ca: `Reial decret llei 3/2004, art. ${art}`, en: `Royal Decree-law 3/2004, art. ${art}` }),
    rd806: (art: string) => L(locale, { es: `Real Decreto 806/2026, art. ${art}`, ca: `Reial decret 806/2026, art. ${art}`, en: `Royal Decree 806/2026, art. ${art}` }),
    rd897: (art: string) => L(locale, { es: `Real Decreto 897/2017, art. ${art}`, ca: `Reial decret 897/2017, art. ${art}`, en: `Royal Decree 897/2017, art. ${art}` }),
    ley1: (art: string) => L(locale, { es: `Ley 1/1996, art. ${art}`, ca: `Llei 1/1996, art. ${art}`, en: `Law 1/1996, art. ${art}` }),
    rd326: (art: string) => L(locale, { es: `Real Decreto 326/2026, art. ${art}`, ca: `Reial decret 326/2026, art. ${art}`, en: `Royal Decree 326/2026, art. ${art}` }),
    lgss: (art: string) => L(locale, { es: `Ley General de la Seguridad Social, art. ${art}`, ca: `Llei general de la Seguretat Social, art. ${art}`, en: `General Social Security Act, art. ${art}` }),
    gencat: L(locale, { es: "Generalitat de Catalunya, trámite «Assistència jurídica gratuïta» (actualizado el 10.02.2026)", ca: "Generalitat de Catalunya, tràmit «Assistència jurídica gratuïta» (actualitzat el 10.02.2026)", en: "Generalitat de Catalunya, «Assistència jurídica gratuïta» (updated 10.02.2026)" }),
  };

  const appSchema = {
    "@type": "WebApplication",
    name: meta.appName,
    url: absoluteUrl(ipremPath(locale)),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    inLanguage: locale,
    isAccessibleForFree: true,
    publisher: { "@id": ORGANIZATION_ID },
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description: meta.description,
  };
  const faqSchema = {
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <>
      <SiteHeader locale={locale} translations={ipremEditions()} />
      <main id="main">
        <article>
          <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
            <div className="ci-shell py-5 md:py-8 lg:py-12">
              <Breadcrumbs items={crumbs} locale={locale} />
              <h1 className="ci-measure">{meta.h1}</h1>
              <p className="ci-measure mt-4 text-lg text-[var(--color-ink-soft)]">{leadText(locale)}</p>
              <p className="ci-measure mt-2 text-sm text-[var(--color-muted)]">{freshnessText(locale)}</p>
            </div>
          </header>

          <div className="ci-shell py-10">
            <div className="ci-prose">
              <IpremCalculator locale={locale} />
              <p className="text-sm text-[var(--color-muted)]">
                {disclaimer} <A href={SOURCES.sepe.url}>{sepeLink}</A>.
              </p>
              <CalculatorNextStep current="iprem" locale={locale} />

              <h2 id="iprem-2026">{hd.now}</h2>
              <Table
                stack={false}
                cols={L(locale, { es: ["IPREM", `${y}`], ca: ["IPREM", `${y}`], en: ["IPREM", `${y}`] })}
                rows={nowRows}
                caption={L(locale, { es: `${law.short}, ${law.provision} (${law.boeId}), prorrogada en ${y}.`, ca: `${da90} (${law.boeId}), prorrogada el ${y}.`, en: `${da90} (${law.boeId}), extended in ${y}.` })}
              />
              <p>{nowText[0]}</p>
              <Quote text={QUOTE.da90} href={SOURCES.pge2023.url} label={lbl.da90a} />
              <p>{nowText[1]}</p>
              <Quote text={QUOTE.da90d} href={SOURCES.pge2023.url} label={lbl.da90d} />

              <h3 id="por-que">{hd.why}</h3>
              <p>{nowText[2]}</p>
              <Quote text={QUOTE.ce134} href={SOURCES.ce.url} label={lbl.ce} />
              <p>{nowText[3]}</p>
              <Quote text={QUOTE.sepe} href={SOURCES.sepe.url} label={lbl.sepe} />

              <h2 id="12-o-14-pagas">{hd.pays}</h2>
              <p>{paysText[0]}</p>
              <ul>
                <li>{paysText[1]}</li>
                <li>{paysText[2]}</li>
              </ul>
              <Quote text={QUOTE.replacesSmi} href={SOURCES.rdl3_2004.url} label={lbl.rdl3("2.3")} />
              <p>{paysText[3]}</p>

              <h2 id="iprem-2027">{hd.next}</h2>
              <p>{nextText[0]}</p>
              <Quote text={QUOTE.yearly} href={SOURCES.rdl3_2004.url} label={lbl.rdl3("2.2")} />
              <p>{nextText[1]}</p>
              <Quote text={QUOTE.dissolved} href={SOURCES.rd806.url} label={lbl.rd806("1")} />
              <p>{nextText[2]}</p>
              <Quote text={QUOTE.constitutive} href={SOURCES.rd806.url} label={lbl.rd806("5")} />
              <p>{nextText[3]}</p>
              <Quote text={QUOTE.lgp38} href={SOURCES.lgp.url} label={lbl.lgp} />
              <p>
                <strong>{nextText[4]}</strong>
              </p>

              <h2 id="limites">{hd.limits}</h2>
              <h3 id="bono-social">{hd.bono}</h3>
              <p>{bonoText}</p>
              <Table cols={bonoCols} rows={bonoRows} />
              <Quote text={BONO_QUOTE.income} href={SOURCES.rd897.url} label={lbl.rd897("3.2.a")} />
              <Quote text={BONO_QUOTE.increments} href={SOURCES.rd897.url} label={lbl.rd897("3.2.a")} />
              <p>
                <Link href={bonoSocialPath(locale)}>{bonoLink}</Link>
              </p>

              <h3 id="justicia-gratuita">{hd.aid}</h3>
              <p>{aidText[0]}</p>
              <Table cols={aidCols} rows={aidRows} />
              <Quote text={QUOTE.legalAid} href={SOURCES.ley1_1996.url} label={lbl.ley1("3.1")} />
              <Quote text={QUOTE.legalAidExceptional} href={SOURCES.ley1_1996.url} label={lbl.ley1("5.1")} />
              <p>{aidText[1]}</p>
              <Quote text={QUOTE.legalAidGencat} href={SOURCES.gencatAjg.url} label={lbl.gencat} />

              <h3 id="alquiler">{hd.housing}</h3>
              <p>{houseText[0]}</p>
              <Quote text={QUOTE.housingBase} href={SOURCES.rd326.url} label={lbl.rd326("8.2.b")} />
              <p>{houseText[1]}</p>
              <Table cols={houseCols} rows={houseRows} />
              <Quote text={QUOTE.housingRent} href={SOURCES.rd326.url} label={lbl.rd326("116.1.c")} />

              <h3 id="subsidio">{hd.dole}</h3>
              <p>{doleText[0]}</p>
              <Table cols={doleCols} rows={doleRows} />
              <Quote text={QUOTE.subsidy} href={SOURCES.lgss.url} label={lbl.lgss("278")} />
              <Quote text={QUOTE.subsidy52} href={SOURCES.lgss.url} label={lbl.lgss("280.4")} />
              <Quote text={QUOTE.benefitLimits} href={SOURCES.lgss.url} label={lbl.lgss("270.3")} />
              <p>
                <strong>{doleText[1]}</strong>
              </p>
              <Quote text={QUOTE.subsidyIncome} href={SOURCES.lgss.url} label={lbl.lgss("275.1")} />
              <ul>
                <li>
                  <Link href={subsidyPath(locale)}>{doleLinks[0]}</Link>
                </li>
                <li>
                  <Link href={calcPath("unemployment", locale)}>{doleLinks[1]}</Link>
                </li>
              </ul>
              <p>
                {L(locale, { es: "La pensión no contributiva de incapacidad deja trabajar con el IPREM más la pensión como tope:", ca: "La pensió no contributiva d'incapacitat deixa treballar amb l'IPREM més la pensió com a límit:", en: "The non-contributory invalidity pension allows work up to the IPREM plus the pension:" })}{" "}
                <Link href={calcPath("non-contributory-pension", locale)}>{L(locale, { es: "calcula la pensión no contributiva", ca: "calcula la pensió no contributiva", en: "work out the non-contributory pension" })}</Link>.
              </p>

              <h2 id="veces-iprem">{hd.multiples}</h2>
              <Table cols={multCols} rows={multRows} caption={L(locale, { es: `Con el IPREM de ${y}: ${M(IPREM_MONTHLY)} al mes, ${M(IPREM_ANNUAL)} o ${M(IPREM_14)} al año.`, ca: `Amb l'IPREM del ${y}: ${M(IPREM_MONTHLY)} al mes, ${M(IPREM_ANNUAL)} o ${M(IPREM_14)} l'any.`, en: `With the ${y} IPREM: ${M(IPREM_MONTHLY)} a month, ${M(IPREM_ANNUAL)} or ${M(IPREM_14)} a year.` })} />

              <h2 id="historia">{hd.history}</h2>
              <div className="ci-table-scroll mt-4">
                <table className="ci-local-table ci-stack-table">
                  <thead>
                    <tr>
                      {histCols.map((c) => (
                        <th key={c} scope="col">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...hist].reverse().map((r) => {
                      const note = historyNote(r, locale);
                      return (
                        <tr key={r.year}>
                          <th scope="row">{r.year}</th>
                          <td data-label={histCols[1]}>{r.amounts ? E(r.amounts.daily) : "—"}</td>
                          <td data-label={histCols[2]}>{r.amounts ? E(r.amounts.monthly) : "—"}</td>
                          <td data-label={histCols[3]}>{r.amounts ? E(r.amounts.annual) : "—"}</td>
                          <td data-label={histCols[4]}>{r.amounts ? E(r.amounts.annual14) : "—"}</td>
                          <td data-label={histCols[5]}>{r.rise === null ? "—" : r.rise === 0 ? pct(0, 0, locale) : `+${pct(r.rise, 1, locale)}`}</td>
                          <td data-label={histCols[6]}>
                            <A href={lawUrl(r.law)}>{r.law.short}</A>
                            {r.kind === "law" ? `, ${r.law.provision}` : ` (${L(locale, { es: "prorrogada", ca: "prorrogada", en: "extended" })})`}
                            <br />
                            <span className="text-sm text-[var(--color-muted)]">
                              {r.law.boeId} · {day(r.law.published)}
                              {note ? ` · ${note}` : ""}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-sm">{histNote}</p>

              <h2 id="que-es">{hd.what}</h2>
              <p>{whatText[0]}</p>
              <Quote text={QUOTE.created} href={SOURCES.rdl3_2004.url} label={lbl.rdl3("2.1")} />
              <p>
                {whatText[1]}{" "}
                <Link href={smiPath(locale)}>{doleLinks[2]}</Link>.
              </p>

              <h2 id="preguntas">{hd.faq}</h2>
              {faq.map((f) => (
                <section key={f.q}>
                  <h3>{f.q}</h3>
                  <p>{f.a}</p>
                </section>
              ))}

              <h2 id="fuentes">{hd.sources}</h2>
              <ul className="text-sm">
                {Object.values(SOURCES).map((s) => (
                  <li key={s.url}>
                    <A href={s.url}>{s.name}</A> ({s.publisher}, {s.ref})
                  </li>
                ))}
                {[...IPREM_LAWS]
                  .reverse()
                  .filter((l) => l.boeId !== law.boeId && l.boeId !== "BOE-A-2004-12010")
                  .map((l) => (
                    <li key={l.boeId}>
                      <A href={lawUrl(l)}>{l.norm}</A>, {l.provision} ({l.boeId})
                    </li>
                  ))}
                <li>
                  <A href={`https://www.boe.es/buscar/doc.php?id=${s27.budgetRules.boeId}`}>{s27.budgetRules.norm}</A> ({s27.budgetRules.boeId})
                </li>
              </ul>
              <p className="text-sm">
                {L(locale, { es: `Todo leído ${on(IPREM_RULES_AS_OF)}.`, ca: `Tot llegit ${on(IPREM_RULES_AS_OF)}.`, en: `All read ${on(IPREM_RULES_AS_OF)}.` })}
              </p>

              <h2 id="lo-que-no-hace">{hd.limitsOf}</h2>
              <ul>
                {limits.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
              <p className="text-sm text-[var(--color-muted)]">{disclaimer}</p>

              <MoreCalculators current="iprem" locale={locale} />
            </div>
            <ShareBar locale={locale} path={ipremPath(locale)} title={meta.h1} contentType="iprem_calculator" variant="full" />
          </div>
        </article>
      </main>
      <JsonLd json={graph([breadcrumbSchema(crumbs), appSchema, faqSchema])} />
      <SiteFooter locale={locale} />
    </>
  );
}
