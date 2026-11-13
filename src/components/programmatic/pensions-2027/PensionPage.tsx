import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { ShareBar } from "@/components/share/ShareBar";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getMessages } from "@/lib/i18n";
import { IPREM_MONTHLY } from "@/lib/programmatic/employment/rules";
import { PAY_DATES_PATH } from "@/lib/programmatic/employment/paths";
import { MINIMUM_COLS, MINIMUM_LABEL, bareDay, elDay, euros, monthText, pct, pensionEditions, pensionPath, percentText, type PensionLocale } from "@/lib/programmatic/pensions-2027/copy";
import { DEFAULT_INPUT, novemberScenarios, perMonth, type RateStatus } from "@/lib/programmatic/pensions-2027/engine";
import { freshnessText, leadText, pensionMeta, statusOn } from "@/lib/programmatic/pensions-2027/page";
import {
  GENDER_GAP_2026,
  INE_FINAL_DAY,
  INE_FLASH_DAY,
  MAX_PENSION_2026,
  MINIMUMS_2026,
  MINIMUM_INCOME_LIMIT_2026,
  NORMS,
  OFFICIAL_LINKS,
  PENSION_RULES_AS_OF,
  PNC_2026_ANNUAL,
  PNC_RENT_SUPPLEMENT_2026,
  QUOTE,
  REVALUATION_2026,
  type OfficialMinimum,
} from "@/lib/programmatic/pensions-2027/rules";
import type { ServerPensionData } from "@/lib/programmatic/pensions-2027/server";
import { SERIES, apiSeriesUrl, tableUrl } from "@/lib/programmatic/rent-update/ine";
import { breadcrumbSchema, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

import { PensionCalculator } from "./PensionCalculator";

/**
 * "Subida de las pensiones 2027" / "Pujada de les pensions 2027" / "Spain
 * pension increase 2027": where the 2027 figure stands today (provisional
 * with the INE months released, then flash, final and official), the
 * calculator with the 1.000 € example worked out, the twelve CPI months, the
 * law quoted, no deviation payment, the 2026 minimum and non-contributory
 * pensions and IPREM from the BOE, and what is not official yet.
 */

const L = <T,>(locale: PensionLocale, v: Record<PensionLocale, T>): T => v[locale];

export function pensionCrumbs(locale: PensionLocale, label: string): Crumb[] {
  return [
    { label: getMessages(locale).common.home, href: `/${locale}/` },
    { label, href: pensionPath(locale) },
  ];
}

export function pensionMetadata(locale: PensionLocale, data: ServerPensionData): Metadata {
  const m = pensionMeta(locale, statusOn(data.ipc, data.today));
  return buildMetadata({ locale, path: pensionPath(locale), title: m.title, description: m.description, translations: pensionEditions() });
}

function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} rel="noopener" target="_blank">
      {children}
    </a>
  );
}

function Quote({ children }: { children: string }) {
  return (
    <blockquote lang="es">
      <p>«{children}»</p>
    </blockquote>
  );
}

function MinimumsTable({ rows, locale, caption }: { rows: readonly OfficialMinimum[]; locale: PensionLocale; caption: string }) {
  const c = MINIMUM_COLS[locale];
  const unit = L(locale, { es: ["/año", "/mes"], ca: ["/any", "/mes"], en: [" a year", " a month"] });
  const cell = (annual: number | null) =>
    annual === null ? (
      "—"
    ) : (
      <>
        {euros(annual, locale)}
        {unit[0]}
        <br />
        <span className="text-[var(--color-muted)]">
          {euros(perMonth(annual), locale)}
          {unit[1]}
        </span>
      </>
    );
  return (
    <div className="ci-table-scroll mt-4">
      <table className="ci-local-table ci-stack-table">
        <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">{c.kind}</th>
            <th scope="col">{c.spouse}</th>
            <th scope="col">{c.single}</th>
            <th scope="col">{c.spouseNot}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <th scope="row" className="font-normal">
                {MINIMUM_LABEL[locale][r.id]}
              </th>
              <td data-label={c.spouse}>{cell(r.spouse)}</td>
              <td data-label={c.single}>{cell(r.single)}</td>
              <td data-label={c.spouseNot}>{cell(r.spouseNotDependent)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PensionRoute({ locale, data }: { locale: PensionLocale; data: ServerPensionData }) {
  const status = statusOn(data.ipc, data.today);
  const meta = pensionMeta(locale, status);
  const crumbs = pensionCrumbs(locale, meta.breadcrumb);
  const lead = leadText(locale, status, data.today);
  const freshness = freshnessText(locale, data.live, data.today, data.snapshotAsOf);
  const scenarios = status ? novemberScenarios(status) : [];
  const official = status?.official ?? null;
  const day = (iso: string) => bareDay(iso, locale);

  const h = L(locale, {
    es: {
      months: "Los 12 meses del IPC que cuentan",
      scenarios: "Qué subida saldría según el IPC de noviembre",
      law: "Qué dice la ley",
      paguilla: "¿Habrá «paguilla» en 2027?",
      status: "Qué es oficial y qué no todavía",
      minimums: "Pensiones mínimas de 2026",
      pnc: "Pensiones no contributivas e IPREM de 2026",
      pay: "Cuándo se cobra",
      sources: "Fuentes",
    },
    ca: {
      months: "Els 12 mesos de l'IPC que compten",
      scenarios: "Quina pujada sortiria segons l'IPC de novembre",
      law: "Què diu la llei",
      paguilla: "Hi haurà «paguilla» el 2027?",
      status: "Què és oficial i què no encara",
      minimums: "Pensions mínimes del 2026",
      pnc: "Pensions no contributives i IPREM del 2026",
      pay: "Quan es cobra",
      sources: "Fonts",
    },
    en: {
      months: "The 12 CPI months that count",
      scenarios: "Which increase each November CPI figure would give",
      law: "What the law says",
      paguilla: "Will there be a catch-up payment (“paguilla”) in 2027?",
      status: "What is official and what is not yet",
      minimums: "Minimum pensions in 2026",
      pnc: "Non-contributory pensions and IPREM in 2026",
      pay: "When pensions are paid",
      sources: "Sources",
    },
  });

  const cols = L(locale, {
    es: ["Mes", "IPC general (variación anual)", "Publicado por el INE"],
    ca: ["Mes", "IPC general (variació anual)", "Publicat per l'INE"],
    en: ["Month", "CPI, all items (annual change)", "Released by the INE"],
  });
  const pendingCell = (iso: string | null) =>
    L(locale, {
      es: iso ? `Pendiente: ${day(iso)}` : "Pendiente",
      ca: iso ? `Pendent: ${day(iso)}` : "Pendent",
      en: iso ? `Due ${day(iso)}` : "Not released",
    });
  const flashCell = L(locale, { es: "adelantado", ca: "avançat", en: "flash" });
  const meanLabel = L(locale, {
    es: (s: RateStatus) => (s.kind === "provisional" ? `Media de los ${s.known} meses publicados` : "Media de los 12 meses"),
    ca: (s: RateStatus) => (s.kind === "provisional" ? `Mitjana dels ${s.known} mesos publicats` : "Mitjana dels 12 mesos"),
    en: (s: RateStatus) => (s.kind === "provisional" ? `Average of the ${s.known} released months` : "12-month average"),
  });
  const caption = L(locale, {
    es: "Variación anual del IPC general en %, tal como la publica el INE (serie IPC290750). Cuenta el dato definitivo; el adelantado de final de mes es una estimación.",
    ca: "Variació anual de l'IPC general en %, tal com la publica l'INE (sèrie IPC290750). Compta la dada definitiva; l'avançada de final de mes és una estimació.",
    en: "Annual change in the all-items CPI in %, as the INE publishes it (series IPC290750). The final figure counts; the end-of-month flash is an estimate.",
  });

  const scenarioIntro = L(locale, {
    es: "No es una previsión: es la cuenta. La subida será la media de los 12 meses, redondeada a un decimal como hizo el Gobierno para 2026; según lo que dé noviembre, saldría:",
    ca: "No és una previsió: és el compte. La pujada serà la mitjana dels 12 mesos, arrodonida a un decimal com va fer el Govern per al 2026; segons el que doni novembre, sortiria:",
    en: "Not a forecast, only arithmetic. The increase will be the 12-month average, rounded to one decimal as the government did for 2026; depending on November's figure it would be:",
  });
  const scenarioCols = L(locale, {
    es: ["IPC de noviembre de 2026", "Subida de las pensiones"],
    ca: ["IPC de novembre de 2026", "Pujada de les pensions"],
    en: ["November 2026 CPI", "Pension increase"],
  });
  const rangeCell = (from: number | null, to: number | null) => {
    const f = from === null ? null : pct(from, 1, locale);
    const t = to === null ? null : pct(to, 1, locale);
    if (f === null) return L(locale, { es: `${t} o menos`, ca: `${t} o menys`, en: `${t} or less` });
    if (t === null) return L(locale, { es: `${f} o más`, ca: `${f} o més`, en: `${f} or more` });
    return f === t ? f : L(locale, { es: `de ${f} a ${t}`, ca: `de ${f} a ${t}`, en: `${f} to ${t}` });
  };

  const lawParas = L(locale, {
    es: {
      intro: "El artículo 58.2 de la Ley General de la Seguridad Social, en la redacción de la Ley 21/2021 y del Real Decreto-ley 2/2023:",
      negative: "Y si la media sale negativa (art. 58.3):",
      extra: "La pensión máxima y las mínimas se actualizan en el mismo porcentaje, aunque las mínimas tienen además una subida adicional hasta 2027 (disposición adicional 53ª, más abajo). La ley no dice cómo redondear: para 2026 el Gobierno lo expresó «con un decimal».",
      y2026: `Para 2026 la subida fue del ${pct(REVALUATION_2026, 1, "es")}: «${QUOTE.rdl3_2026}» (Real Decreto-ley 3/2026, BOE del 4 de febrero de 2026; el primer decreto, el 16/2025, no fue convalidado por el Congreso). El porcentaje lo da la ley, pero cada año lo aprueba el Gobierno en una norma publicada en el BOE.`,
    },
    ca: {
      intro: "L'article 58.2 de la Llei general de la Seguretat Social, en la redacció de la Llei 21/2021 i del Reial decret llei 2/2023 (text oficial en castellà):",
      negative: "I si la mitjana surt negativa (art. 58.3):",
      extra: "La pensió màxima i les mínimes s'actualitzen en el mateix percentatge, tot i que les mínimes tenen a més una pujada addicional fins al 2027 (disposició addicional 53a, més avall). La llei no diu com s'arrodoneix: per al 2026 el Govern ho va expressar «con un decimal».",
      y2026: `Per al 2026 la pujada va ser del ${pct(REVALUATION_2026, 1, "ca")}: «${QUOTE.rdl3_2026}» (Reial decret llei 3/2026, BOE del 4 de febrer de 2026; el primer decret, el 16/2025, no va ser convalidat pel Congrés). El percentatge el dona la llei, però cada any l'aprova el Govern en una norma publicada al BOE.`,
    },
    en: {
      intro: "Article 58.2 of the General Social Security Act (LGSS), as worded by Law 21/2021 and Royal Decree-law 2/2023 (official text in Spanish):",
      negative: "And if the average is negative (art. 58.3):",
      extra: "The maximum and minimum pensions are updated by the same percentage, although minimum pensions also get an extra rise up to 2027 (additional provision 53, below). The law does not say how to round: for 2026 the government expressed it “con un decimal” (to one decimal).",
      y2026: `For 2026 the increase was ${pct(REVALUATION_2026, 1, "en")}: “${QUOTE.rdl3_2026}” (Royal Decree-law 3/2026, BOE of 4 February 2026; the first decree, 16/2025, was not validated by the Congress). The law gives the percentage, but each year the government approves it in a rule published in the BOE.`,
    },
  });

  const paguilla = L(locale, {
    es: [
      "No. La «paguilla» era la paga única con la que se compensaba a los pensionistas cuando la inflación real superaba la prevista: la ley de 1994 subía las pensiones con el IPC previsto y, si el real era mayor, «se les abonará la diferencia en un pago único, antes del 1 de abril del ejercicio posterior» (art. 48, redacción anterior a 2014).",
      "Desde la Ley 21/2021 (en vigor en 2022) la subida se calcula con la inflación ya medida, la media de diciembre a noviembre, así que no hay desviación que compensar, y el artículo 58 vigente no prevé ningún pago por desviación. Si la inflación de 2027 es alta, se notará en la subida de 2028.",
    ],
    ca: [
      "No. La «paguilla» era la paga única amb què es compensava els pensionistes quan la inflació real superava la prevista: la llei de 1994 apujava les pensions amb l'IPC previst i, si el real era més alt, «se les abonará la diferencia en un pago único, antes del 1 de abril del ejercicio posterior» (art. 48, redacció anterior al 2014).",
      "Des de la Llei 21/2021 (vigent el 2022) la pujada es calcula amb la inflació ja mesurada, la mitjana de desembre a novembre, així que no hi ha desviació a compensar, i l'article 58 vigent no preveu cap pagament per desviació. Si la inflació del 2027 és alta, es notarà en la pujada del 2028.",
    ],
    en: [
      "No. The “paguilla” was the one-off payment that made up for inflation above the forecast: the 1994 Act raised pensions by the forecast CPI and, if actual inflation was higher, “se les abonará la diferencia en un pago único, antes del 1 de abril del ejercicio posterior” (art. 48, wording before 2014: the difference was paid as a lump sum before 1 April).",
      "Since Law 21/2021 (in force in 2022) the increase uses inflation already measured, the December-to-November average, so there is no gap to make up, and the current article 58 provides for no catch-up payment. If inflation is high in 2027, it shows in the 2028 increase.",
    ],
  });

  const pending = L(locale, { es: "Pendiente", ca: "Pendent", en: "Pending" });
  const done = L(locale, { es: "Oficial", ca: "Oficial", en: "Official" });
  const statusRows: [string, string, string][] = L(locale, {
    es: [
      [done, "La regla", "Media del IPC de diciembre a noviembre (art. 58.2 LGSS); si es negativa, no bajan (art. 58.3)."],
      [done, "Las cifras de 2026", `Subida del ${pct(REVALUATION_2026, 1, "es")}, mínimas, máxima y no contributivas: Real Decreto-ley 3/2026 y Real Decreto 241/2026 (BOE).`],
      [
        official ? done : pending,
        "El porcentaje de 2027",
        official
          ? `${percentText(status!, "es")}: ${official.norm} (BOE del ${day(official.published)}).`
          : `Depende del IPC de noviembre (INE: adelantado el ${day(INE_FLASH_DAY)}, definitivo el ${day(INE_FINAL_DAY)}) y de la norma que apruebe el Gobierno (para 2026, el Real Decreto-ley 16/2025 salió el 24 de diciembre y, al no convalidarse, el 3/2026 el 4 de febrero).`,
      ],
      [official?.minimums ? done : pending, "Las pensiones mínimas de 2027", "Suben al menos lo mismo y, por la disposición adicional 53ª, lo necesario para alcanzar el umbral de pobreza de un hogar de dos adultos. Las fija la norma de cada año: no las publicamos hasta que salgan en el BOE."],
      [official?.pncAnnual ? done : pending, "Las no contributivas y el IPREM de 2027", "Las no contributivas suben, al menos, el mismo porcentaje (art. 62) y tienen su propia subida adicional (DA 53ª.5). El IPREM lo fijan los Presupuestos: sigue en 600 € al mes desde 2023."],
    ],
    ca: [
      [done, "La regla", "Mitjana de l'IPC de desembre a novembre (art. 58.2 LGSS); si és negativa, no baixen (art. 58.3)."],
      [done, "Les xifres del 2026", `Pujada del ${pct(REVALUATION_2026, 1, "ca")}, mínimes, màxima i no contributives: Reial decret llei 3/2026 i Reial decret 241/2026 (BOE).`],
      [
        official ? done : pending,
        "El percentatge del 2027",
        official
          ? `${percentText(status!, "ca")}: ${official.norm} (BOE ${elDay(official.published, "ca").replace(/^(el |l')/, "del ")}).`
          : `Depèn de l'IPC de novembre (INE: avançat ${elDay(INE_FLASH_DAY, "ca")}, definitiu ${elDay(INE_FINAL_DAY, "ca")}) i de la norma que aprovi el Govern (per al 2026, el Reial decret llei 16/2025 va sortir el 24 de desembre i, com que no es va convalidar, el 3/2026 el 4 de febrer).`,
      ],
      [official?.minimums ? done : pending, "Les pensions mínimes del 2027", "Pugen almenys el mateix i, per la disposició addicional 53a, el necessari per arribar al llindar de pobresa d'una llar de dos adults. Les fixa la norma de cada any: no les publiquem fins que surtin al BOE."],
      [official?.pncAnnual ? done : pending, "Les no contributives i l'IPREM del 2027", "Les no contributives pugen, almenys, el mateix percentatge (art. 62) i tenen una pujada addicional pròpia (DA 53a.5). L'IPREM el fixen els pressupostos: continua en 600 € al mes des del 2023."],
    ],
    en: [
      [done, "The rule", "Average CPI from December to November (LGSS art. 58.2); if negative, pensions do not fall (art. 58.3)."],
      [done, "The 2026 figures", `Increase of ${pct(REVALUATION_2026, 1, "en")}, minimum, maximum and non-contributory pensions: Royal Decree-law 3/2026 and Royal Decree 241/2026 (BOE).`],
      [
        official ? done : pending,
        "The 2027 percentage",
        official
          ? `${percentText(status!, "en")}: ${official.norm} (BOE of ${day(official.published)}).`
          : `Depends on November's CPI (INE: flash on ${day(INE_FLASH_DAY)}, final on ${day(INE_FINAL_DAY)}) and on the rule the government approves (for 2026, Royal Decree-law 16/2025 came out on 24 December and, as it was not validated, 3/2026 on 4 February).`,
      ],
      [official?.minimums ? done : pending, "2027 minimum pensions", "They rise at least as much and, under additional provision 53, as much as needed to reach the poverty line for a two-adult household. Each year's rules set them: we will not print them until they are in the BOE."],
      [official?.pncAnnual ? done : pending, "2027 non-contributory pensions and IPREM", "Non-contributory pensions rise by at least the same percentage (art. 62) and get their own extra rise (DA 53.5). The State Budget sets the IPREM: it has stayed at €600 a month since 2023."],
    ],
  });

  const minIntro = L(locale, {
    es: "Si tu pensión contributiva no llega a estos importes y tus otros ingresos no superan el límite, la Seguridad Social te paga un complemento hasta la mínima. Importes del Real Decreto 241/2026, anexo I (en 14 pagas; al mes = anual ÷ 14):",
    ca: "Si la teva pensió contributiva no arriba a aquests imports i els altres ingressos no superen el límit, la Seguretat Social et paga un complement fins a la mínima. Imports del Reial decret 241/2026, annex I (en 14 pagues; al mes = anual ÷ 14):",
    en: "If your contributory pension is below these amounts and your other income is under the limit, Social Security tops it up to the minimum. Amounts from Royal Decree 241/2026, annex I (in 14 payments; monthly = yearly ÷ 14):",
  });
  const minCaption = L(locale, {
    es: "Cuantías mínimas de las pensiones contributivas, 2026 (BOE-A-2026-6977)",
    ca: "Quanties mínimes de les pensions contributives, 2026 (BOE-A-2026-6977)",
    en: "Minimum contributory pensions, 2026 (BOE-A-2026-6977)",
  });
  const minAfter = L(locale, {
    es: `Límite de ingresos para cobrar el complemento: ${euros(MINIMUM_INCOME_LIMIT_2026.single, "es")} al año sin cónyuge a cargo y ${euros(MINIMUM_INCOME_LIMIT_2026.spouse, "es")} con cónyuge a cargo. El complemento no se revaloriza: cada año se recalcula sobre la nueva mínima.`,
    ca: `Límit d'ingressos per cobrar el complement: ${euros(MINIMUM_INCOME_LIMIT_2026.single, "ca")} l'any sense cònjuge a càrrec i ${euros(MINIMUM_INCOME_LIMIT_2026.spouse, "ca")} amb cònjuge a càrrec. El complement no es revaloritza: cada any es recalcula sobre la nova mínima.`,
    en: `Income limit for the top-up: ${euros(MINIMUM_INCOME_LIMIT_2026.single, "en")} a year with no dependent spouse and ${euros(MINIMUM_INCOME_LIMIT_2026.spouse, "en")} with one. The top-up itself is not revalued: it is worked out again each year on the new minimum.`,
  });
  const min2027 = L(locale, {
    es: "Las mínimas de 2027 no son oficiales todavía. La ley fija el último paso de su subida adicional:",
    ca: "Les mínimes del 2027 encara no són oficials. La llei fixa l'últim pas de la seva pujada addicional:",
    en: "The 2027 minimums are not official yet. The law sets the last step of their extra rise:",
  });
  const min2027After = L(locale, {
    es: "Y las cuantías las determina la norma de cada año (DA 53ª.6). Las añadiremos cuando se publiquen en el BOE.",
    ca: "I les quanties les determina la norma de cada any (DA 53a.6). Les afegirem quan es publiquin al BOE.",
    en: "And the amounts are set by each year's rules (DA 53.6). We will add them when the BOE publishes them.",
  });

  const pncItems = L(locale, {
    es: [
      `Pensión no contributiva de jubilación o invalidez: ${euros(PNC_2026_ANNUAL, "es")} al año, ${euros(perMonth(PNC_2026_ANNUAL), "es")} al mes en 14 pagas (RD 241/2026, art. 21.1). Es el importe íntegro: cada pensión se reduce según los ingresos del hogar.`,
      `Complemento de alquiler para quien cobra la no contributiva y vive de alquiler: ${euros(PNC_RENT_SUPPLEMENT_2026, "es")} al año (art. 21.2).`,
      `IPREM: ${euros(IPREM_MONTHLY, "es")} al mes, ${euros(IPREM_MONTHLY * 12, "es")} al año (${euros(IPREM_MONTHLY * 14, "es")} cuando la norma lo toma con pagas extra). Lo fijó la Ley 31/2022 de Presupuestos para 2023 y sigue vigente con los Presupuestos prorrogados.`,
      `Pensión máxima: ${euros(MAX_PENSION_2026.monthly, "es")} al mes o ${euros(MAX_PENSION_2026.annual, "es")} al año. Complemento de brecha de género: ${euros(GENDER_GAP_2026, "es")} al mes (RDL 3/2026).`,
    ],
    ca: [
      `Pensió no contributiva de jubilació o invalidesa: ${euros(PNC_2026_ANNUAL, "ca")} l'any, ${euros(perMonth(PNC_2026_ANNUAL), "ca")} al mes en 14 pagues (RD 241/2026, art. 21.1). És l'import íntegre: cada pensió es redueix segons els ingressos de la llar.`,
      `Complement de lloguer per a qui cobra la no contributiva i viu de lloguer: ${euros(PNC_RENT_SUPPLEMENT_2026, "ca")} l'any (art. 21.2).`,
      `IPREM: ${euros(IPREM_MONTHLY, "ca")} al mes, ${euros(IPREM_MONTHLY * 12, "ca")} l'any (${euros(IPREM_MONTHLY * 14, "ca")} quan la norma el pren amb pagues extra). El va fixar la Llei 31/2022 de pressupostos per al 2023 i continua vigent amb els pressupostos prorrogats.`,
      `Pensió màxima: ${euros(MAX_PENSION_2026.monthly, "ca")} al mes o ${euros(MAX_PENSION_2026.annual, "ca")} l'any. Complement de bretxa de gènere: ${euros(GENDER_GAP_2026, "ca")} al mes (RDL 3/2026).`,
    ],
    en: [
      `Non-contributory retirement or invalidity pension: ${euros(PNC_2026_ANNUAL, "en")} a year, ${euros(perMonth(PNC_2026_ANNUAL), "en")} a month in 14 payments (RD 241/2026, art. 21.1). That is the full amount: each pension is reduced by the household's income.`,
      `Rent supplement for non-contributory pensioners who rent their home: ${euros(PNC_RENT_SUPPLEMENT_2026, "en")} a year (art. 21.2).`,
      `IPREM: ${euros(IPREM_MONTHLY, "en")} a month, ${euros(IPREM_MONTHLY * 12, "en")} a year (${euros(IPREM_MONTHLY * 14, "en")} where a rule counts extra payments). Set by Law 31/2022, the 2023 State Budget, and still in force with the budget rolled over.`,
      `Maximum pension: ${euros(MAX_PENSION_2026.monthly, "en")} a month or ${euros(MAX_PENSION_2026.annual, "en")} a year. Gender-gap supplement: ${euros(GENDER_GAP_2026, "en")} a month (RDL 3/2026).`,
    ],
  });
  const pncLaw = L(locale, {
    es: "Para 2027, la ley solo dice el mínimo (art. 62 LGSS):",
    ca: "Per al 2027, la llei només diu el mínim (art. 62 LGSS):",
    en: "For 2027 the law only sets a floor (LGSS art. 62):",
  });

  const payText = L(locale, {
    es: [
      "La pensión se cobra como tarde el primer día hábil de cada mes; en junio y noviembre llega con la paga extra, que también se revaloriza.",
      "Calendario mes a mes",
    ],
    ca: ["La pensió es cobra com a molt tard el primer dia hàbil de cada mes; al juny i al novembre arriba amb la paga extra, que també es revaloritza.", "Calendari mes a mes"],
    en: ["Pensions are paid by the first business day of each month at the latest; in June and November they come with the extra payment, which is revalued too.", "Month-by-month calendar"],
  });

  const disclaimer = L(locale, {
    es: `Simulación orientativa, no vinculante, con los datos oficiales del INE y las normas publicadas en el BOE (revisadas el ${day(PENSION_RULES_AS_OF)}). El importe que cobres lo fija la Seguridad Social: concurrencia de pensiones, complementos, retenciones de IRPF o una norma posterior pueden cambiarlo. Consulta tu caso en la Seguridad Social.`,
    ca: `Simulació orientativa, no vinculant, amb les dades oficials de l'INE i les normes publicades al BOE (revisades ${elDay(PENSION_RULES_AS_OF, "ca")}). L'import que cobris el fixa la Seguretat Social: concurrència de pensions, complements, retencions d'IRPF o una norma posterior el poden canviar. Consulta el teu cas a la Seguretat Social.`,
    en: `An estimate for guidance only, not binding, from the INE's official figures and the rules published in the BOE (checked on ${day(PENSION_RULES_AS_OF)}). Social Security sets the amount you are paid: several pensions, supplements, income tax withholding or a later rule can change it. Check your own case with Social Security.`,
  });
  const ssLink = L(locale, { es: "Seguridad Social: revalorización", ca: "Seguretat Social: revaloració", en: "Social Security: revaluation (Spanish)" });

  const sourceNorms = (["lgss58", "lgss62", "lgssDa53", "ley21", "rdl3", "rd241", "pge2023", "lgss1994"] as const).map((n) => NORMS[n]);

  return (
    <>
      <SiteHeader locale={locale} translations={pensionEditions()} />
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
              {status ? <PensionCalculator locale={locale} status={status} initial={DEFAULT_INPUT} /> : null}
              <p className="text-sm text-[var(--color-muted)]">
                {disclaimer} <A href={OFFICIAL_LINKS.ssRevaluation}>{ssLink}</A>.
              </p>

              {status ? (
                <>
                  <h2 id="ipc">{h.months}</h2>
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
                        {status.months.map((m) => {
                          const flash = m.value === null && status.flash?.month === m.month ? status.flash : null;
                          return (
                            <tr key={m.month}>
                              <th scope="row" className="font-normal">
                                {monthText(m.month, locale)}
                              </th>
                              <td data-label={cols[1]}>{m.value !== null ? pct(m.value, 1, locale) : flash ? `${pct(flash.value, 1, locale)} (${flashCell})` : "—"}</td>
                              <td data-label={cols[2]}>{m.value !== null && m.published ? day(m.published) : pendingCell(m.published)}</td>
                            </tr>
                          );
                        })}
                        {status.mean !== null ? (
                          <tr>
                            <th scope="row">{meanLabel(status)}</th>
                            <td data-label={cols[1]}>
                              <strong>{pct(status.mean, 2, locale)}</strong>
                              {status.kind === "provisional" ? null : ` → ${percentText(status, locale)}`}
                            </td>
                            <td data-label={cols[2]}>{status.kind === "provisional" ? L(locale, { es: "Provisional", ca: "Provisional", en: "Provisional" }) : ""}</td>
                          </tr>
                        ) : null}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-sm">
                    INE: <A href={tableUrl(SERIES.ipc)}>{`IPC ${SERIES.ipc.code}`}</A> · <A href={apiSeriesUrl(SERIES.ipc)}>API</A> · <A href={OFFICIAL_LINKS.ineCalendar}>{L(locale, { es: "Calendario del INE", ca: "Calendari de l'INE", en: "INE release calendar" })}</A>
                  </p>
                </>
              ) : null}

              {scenarios.length ? (
                <>
                  <h2 id="escenarios">{h.scenarios}</h2>
                  <p>{scenarioIntro}</p>
                  <div className="ci-table-scroll mt-4">
                    <table className="ci-local-table">
                      <thead>
                        <tr>
                          <th scope="col">{scenarioCols[0]}</th>
                          <th scope="col">{scenarioCols[1]}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scenarios.map((s) => (
                          <tr key={s.percent}>
                            <td>{rangeCell(s.from, s.to)}</td>
                            <td>{pct(s.percent, 1, locale)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : null}

              <h2 id="ley">{h.law}</h2>
              <p>{lawParas.intro}</p>
              <Quote>{QUOTE.art58_2}</Quote>
              <p>{lawParas.negative}</p>
              <Quote>{QUOTE.art58_3}</Quote>
              <p>{lawParas.extra}</p>
              <p>{lawParas.y2026}</p>

              <h2 id="paguilla">{h.paguilla}</h2>
              {paguilla.map((p) => (
                <p key={p}>{p}</p>
              ))}

              <h2 id="oficial">{h.status}</h2>
              <dl>
                {statusRows.map(([badge, term, text]) => (
                  <div key={term} className="mt-3">
                    <dt className="font-semibold">
                      {term} <span className="text-sm font-normal text-[var(--color-muted)]">({badge})</span>
                    </dt>
                    <dd className="m-0">{text}</dd>
                  </div>
                ))}
              </dl>

              <h2 id="minimas">{h.minimums}</h2>
              <p>{minIntro}</p>
              <MinimumsTable rows={MINIMUMS_2026} locale={locale} caption={minCaption} />
              <p className="text-sm">{minAfter}</p>
              {official?.minimums ? (
                <MinimumsTable rows={official.minimums} locale={locale} caption={`${minCaption.replace("2026", "2027").replace(/\(BOE-A-[^)]+\)/, `(${official.boeId})`)}`} />
              ) : (
                <>
                  <p>{min2027}</p>
                  <Quote>{QUOTE.da53_2027}</Quote>
                  <p>{min2027After}</p>
                </>
              )}

              <h2 id="no-contributivas">{h.pnc}</h2>
              <ul>
                {pncItems.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
              <p>{pncLaw}</p>
              <Quote>{QUOTE.art62}</Quote>
              <p className="text-sm">
                <A href={OFFICIAL_LINKS.imsersoPnc}>IMSERSO · {L(locale, { es: "pensiones no contributivas", ca: "pensions no contributives", en: "non-contributory pensions" })}</A>
              </p>

              <h2 id="cobro">{h.pay}</h2>
              <p>
                {payText[0]} <Link href={PAY_DATES_PATH[locale]}>{payText[1]}</Link>.
              </p>

              <h2 id="fuentes">{h.sources}</h2>
              <ul className="text-sm">
                {sourceNorms.map((n) => (
                  <li key={n.url}>
                    <A href={n.url}>{n.name}</A> ({n.ref})
                  </li>
                ))}
                {official ? (
                  <li>
                    <A href={official.url}>{official.norm}</A> ({official.boeId})
                  </li>
                ) : null}
                <li>
                  INE: <A href={tableUrl(SERIES.ipc)}>IPC {SERIES.ipc.code}</A> · <A href={OFFICIAL_LINKS.ineIpc}>{L(locale, { es: "últimos datos del IPC", ca: "últimes dades de l'IPC", en: "latest CPI release" })}</A>
                </li>
                <li>
                  <A href={OFFICIAL_LINKS.ssRevaluation}>{ssLink}</A>
                </li>
              </ul>
            </div>
            <ShareBar locale={locale} path={pensionPath(locale)} title={meta.h1} contentType="pensions_2027" variant="full" />
          </div>
        </article>
      </main>
      <JsonLd json={graph([breadcrumbSchema(crumbs)])} />
      <SiteFooter locale={locale} />
    </>
  );
}
