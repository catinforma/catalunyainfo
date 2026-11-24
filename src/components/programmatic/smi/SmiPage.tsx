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
import { hubCrumb } from "@/lib/programmatic/calculators/hub";
import { bareDay, elDay, money, netSalaryPreset, pct, smiEditions, smiPath, type SmiLocale } from "@/lib/programmatic/smi/copy";
import { currentYear, increaseOn, officialYears, prorated12 } from "@/lib/programmatic/smi/engine";
import { smiHowTo } from "@/lib/programmatic/smi/howto";
import { freshnessText, leadText, smiMeta, statusOf } from "@/lib/programmatic/smi/page";
import { DRAFT_2027, NORMS, OFFICIAL_2027_READ, QUOTE, SMI_2026, SMI_HISTORY, SMI_RULES_AS_OF, boeUrl, type SmiYear } from "@/lib/programmatic/smi/rules";
import type { LiveBoe } from "@/lib/programmatic/smi/engine";
import { wagePath } from "@/lib/programmatic/average-salary/copy";
import { ipremPath } from "@/lib/programmatic/iprem/copy";
import { IPREM_MONTHLY, IPREM_YEAR } from "@/lib/programmatic/iprem/rules";
import { percent } from "@/lib/programmatic/net-salary/copy";
import { DEFAULT_INPUT as NET_DEFAULT, calculateNetSalary } from "@/lib/programmatic/net-salary/engine";
import { SMI_DEDUCTION } from "@/lib/programmatic/net-salary/rules-2026";
import { breadcrumbSchema, calculatorAppSchema, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

import { SmiCalculator } from "./SmiCalculator";

/**
 * "Salario mínimo (SMI) 2027" / "Salari mínim (SMI) 2027" / "Spain minimum
 * wage (SMI) 2027": the last SMI in the BOE with every amount (month in 14
 * and 12 payments, year, day, domestic hour, short contracts), a part-time
 * calculator, where 2027 stands from official documents only (the
 * committee's report, the Ministry's draft, the Council of Ministers, the
 * BOE, checked live every hour), each decree from 2018 with its BOE link,
 * and the SMI's income tax rule.
 */

export type SmiPageData = LiveBoe & { today: string };

const L = <T,>(locale: SmiLocale, v: Record<SmiLocale, T>): T => v[locale];
/** "el 3 de novembre de 2026", "l'1 de gener de 2027". */
const caDay = (iso: string) => elDay(iso, "ca");

export function smiCrumbs(locale: SmiLocale, label: string): Crumb[] {
  return [{ label: getMessages(locale).common.home, href: `/${locale}/` }, hubCrumb(locale), { label, href: smiPath(locale) }];
}

export function smiMetadata(locale: SmiLocale, data: SmiPageData): Metadata {
  const m = smiMeta(locale, statusOf(data));
  return buildMetadata({ locale, path: smiPath(locale), title: m.title, description: m.description, translations: smiEditions() });
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

function AmountsTable({ y, locale, caption, draft = false }: { y: Omit<SmiYear, "norm" | "boeId" | "published" | "effectiveFrom" | "year">; locale: SmiLocale; caption: string; draft?: boolean }) {
  const rows: [string, string][] = L(locale, {
    es: [
      ["Al mes, en 14 pagas", money(y.monthly, "es")],
      ["Al mes, en 12 pagas (extras prorrateadas)", money(prorated12(y), "es")],
      ["Al año (jornada completa)", money(y.annual, "es")],
      ["Al día", money(y.daily, "es")],
      ["Empleo de hogar por horas, por hora trabajada", money(y.domesticHourly, "es")],
      ["Contratos temporales de hasta 120 días, por jornada", money(y.temporaryDaily, "es")],
    ],
    ca: [
      ["Al mes, en 14 pagues", money(y.monthly, "ca")],
      ["Al mes, en 12 pagues (extres prorratejades)", money(prorated12(y), "ca")],
      ["L'any (jornada completa)", money(y.annual, "ca")],
      ["Al dia", money(y.daily, "ca")],
      ["Treball de la llar per hores, per hora treballada", money(y.domesticHourly, "ca")],
      ["Contractes temporals de fins a 120 dies, per jornada", money(y.temporaryDaily, "ca")],
    ],
    en: [
      ["A month, in 14 payments", money(y.monthly, "en")],
      ["A month, in 12 payments (extras spread out)", money(prorated12(y), "en")],
      ["A year (full time)", money(y.annual, "en")],
      ["A day", money(y.daily, "en")],
      ["Domestic work paid by the hour, per hour worked", money(y.domesticHourly, "en")],
      ["Fixed-term contracts of up to 120 days, per working day", money(y.temporaryDaily, "en")],
    ],
  });
  const head = L(locale, { es: ["Concepto", draft ? "Proyecto (no aprobado)" : "Importe bruto"], ca: ["Concepte", draft ? "Projecte (no aprovat)" : "Import brut"], en: ["Item", draft ? "Draft (not approved)" : "Gross amount"] });
  return (
    <div className="ci-table-scroll mt-4">
      <table className="ci-local-table">
        <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">{head[0]}</th>
            <th scope="col">{head[1]}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k}>
              <th scope="row" className="font-normal">
                {k}
              </th>
              <td>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SmiRoute({ locale, data }: { locale: SmiLocale; data: SmiPageData }) {
  const status = statusOf(data);
  const meta = smiMeta(locale, status);
  const crumbs = smiCrumbs(locale, meta.breadcrumb);
  const lead = leadText(locale, status, data.today);
  const freshness = freshnessText(locale, data.checked, data.today);
  const years = officialYears(status);
  const shown = currentYear(status, data.today);
  const official27 = status.kind === "official" ? status.year : null;
  // The 2027 decree as typed in rules.ts (RD 1013/2026): its own quotes (QUOTE.rd1013*) print only then.
  const decree27 = status.kind === "official" && status.source === "rules" ? status.year : null;
  // The worked examples quote RD 1013/2026's own articles, so they print only for the decree typed in rules.ts.
  const howTo = decree27 ? smiHowTo(locale, decree27) : null;
  const day = (iso: string) => bareDay(iso, locale);
  const d = DRAFT_2027;
  const heard = data.today > d.hearingTo;
  const lastYear = official27 ? official27.year : SMI_2026.year;
  const sameAsDraft =
    official27 !== null && official27.monthly === d.monthly && official27.daily === d.daily && official27.annual === d.annual && official27.domesticHourly === d.domesticHourly && official27.temporaryDaily === d.temporaryDaily;

  const h = L(locale, {
    es: { y27: "SMI 2027: las cuantías oficiales", y26: "SMI 2026: todas las cuantías", status: "SMI 2027: qué es oficial y qué no", when: "¿Cuándo se aprueba el SMI de cada año?", paid: "¿Desde cuándo se cobra el SMI de 2027?", history: `Historia del SMI de 2018 a ${lastYear}`, irpf: "¿El SMI paga IRPF?", sources: "Fuentes" },
    ca: { y27: "SMI 2027: les quanties oficials", y26: "SMI 2026: totes les quanties", status: "SMI 2027: què és oficial i què no", when: "Quan s'aprova l'SMI de cada any?", paid: "Des de quan es cobra l'SMI del 2027?", history: `Història de l'SMI del 2018 al ${lastYear}`, irpf: "L'SMI paga IRPF?", sources: "Fonts" },
    en: { y27: "SMI 2027: the official amounts", y26: "SMI 2026: every amount", status: "SMI 2027: what is official and what is not", when: "When is each year's SMI approved?", paid: "When is the 2027 SMI first paid?", history: `Spain's minimum wage from 2018 to ${lastYear}`, irpf: "Does the SMI pay income tax?", sources: "Sources" },
  });

  /* The decree's own answers (19 Nov 2026): same SMI everywhere in Spain (final provision one) and paid from January (final provision three). */
  const decreeText = decree27
    ? L(locale, {
        es: {
          scope: "Es el mismo en toda España, también en Cataluña: lo fija el Gobierno porque la legislación laboral es competencia exclusiva del Estado (disposición final primera). Tu convenio colectivo puede fijar un salario mayor, nunca uno menor.",
          paid: `Desde la nómina de enero de 2027. El ${decree27.norm.replace(/, de \d{1,2} de [a-z]+$/, "")} salió en el BOE el ${day(decree27.published)}, antes de empezar el año, y se aplica desde el ${day(decree27.effectiveFrom)}: a diferencia de 2022 a 2026, no hay subida con efectos atrasados que cobrar después (disposición final tercera):`,
        },
        ca: {
          scope: "És el mateix a tot Espanya, també a Catalunya: el fixa el Govern perquè la legislació laboral és competència exclusiva de l'Estat (disposició final primera, text oficial en castellà). El teu conveni col·lectiu pot fixar un salari més alt, mai un de més baix.",
          paid: `Des de la nòmina de gener del 2027. El ${decree27.norm.replace(/, de \d{1,2} de [a-z]+$/, "").replace("Real Decreto", "Reial decret")} va sortir al BOE ${caDay(decree27.published)}, abans de començar l'any, i s'aplica des ${caDay(decree27.effectiveFrom).replace(/^el /, "del ").replace(/^l'/, "de l'")}: a diferència del 2022 al 2026, no hi ha pujada amb efectes endarrerits per cobrar després (disposició final tercera):`,
        },
        en: {
          scope: "It is the same all over Spain, Catalonia included: the government sets it because labour legislation is the State's exclusive competence (final provision one; official text in Spanish). Your collective agreement can set higher pay, never lower.",
          paid: `From the January 2027 payslip. ${decree27.norm.replace(/, de \d{1,2} de [a-z]+$/, "").replace("Real Decreto", "Royal Decree")} came out in the BOE on ${day(decree27.published)}, before the year starts, and applies from ${day(decree27.effectiveFrom)}: unlike 2022 to 2026, there is no rise backdated to January to be paid later (final provision three; official text in Spanish):`,
        },
      })
    : null;

  const caption = (y: SmiYear) =>
    L(locale, {
      es: `SMI ${y.year}, ${y.norm} (${y.boeId}). Importes brutos; en 12 pagas = anual ÷ 12.`,
      ca: `SMI ${y.year}, ${y.norm} (${y.boeId}). Imports bruts; en 12 pagues = anual ÷ 12.`,
      en: `SMI ${y.year}, ${y.norm} (${y.boeId}). Gross amounts; in 12 payments = yearly ÷ 12.`,
    });

  const y26Text = L(locale, {
    es: [
      `El Real Decreto 126/2026 (BOE del ${day(SMI_2026.published)}) fija el SMI para cualquier actividad, sin distinción de sexo ni edad:`,
      "Es para la jornada completa: con menos horas se cobra la parte proporcional (art. 1):",
      `Al año no puede ser menos de ${money(SMI_2026.annual, "es")}: «${QUOTE.rd126annual}» (art. 3.1). Cuenta solo el salario en dinero, no el que se paga en especie. Las empleadas y empleados de hogar que trabajan por horas tienen su propio mínimo por hora, que ya incluye las pagas extra y las vacaciones (art. 4.2):`,
      "Y se aplica desde el 1 de enero aunque el decreto saliera en febrero (disposición final tercera):",
    ],
    ca: [
      `El Reial decret 126/2026 (BOE del ${day(SMI_2026.published)}) fixa l'SMI per a qualsevol activitat, sense distinció de sexe ni edat (text oficial en castellà):`,
      "És per a la jornada completa: amb menys hores es cobra la part proporcional (art. 1):",
      `L'any no pot ser menys de ${money(SMI_2026.annual, "ca")}: «${QUOTE.rd126annual}» (art. 3.1). Compta només el salari en diners, no el que es paga en espècie. Les treballadores i els treballadors de la llar que treballen per hores tenen un mínim propi per hora, que ja inclou les pagues extra i les vacances (art. 4.2):`,
      "I s'aplica des de l'1 de gener encara que el decret sortís al febrer (disposició final tercera):",
    ],
    en: [
      `Royal Decree 126/2026 (BOE of ${day(SMI_2026.published)}) sets the SMI for any activity, regardless of sex or age (official text in Spanish):`,
      "It is for a full-time week: with fewer hours you get the proportional part (art. 1):",
      `A year cannot add up to less than ${money(SMI_2026.annual, "en")}: “${QUOTE.rd126annual}” (art. 3.1). Only pay in money counts, not pay in kind. Domestic workers paid by the hour have their own hourly minimum, which already includes extra payments and holidays (art. 4.2):`,
      "And it applies from 1 January even though the decree came out in February (final provision three):",
    ],
  });

  const pending = L(locale, { es: "Pendiente", ca: "Pendent", en: "Pending" });
  const done = L(locale, { es: "Hecho", ca: "Fet", en: "Done" });
  const offBadge = L(locale, { es: "Oficial", ca: "Oficial", en: "Official" });
  const inBoe = status.kind !== "draft";
  const boeLink = status.kind === "official" ? boeUrl(status.year) : status.kind === "published" ? boeUrl(status.hit) : null;
  const boeTitle = status.kind === "official" ? status.year.norm : status.kind === "published" ? status.hit.title : "";
  const statusRows: [string, string, ReactNode][] = L(locale, {
    es: [
      [done, "Informe de la comisión de expertos", `La Comisión Asesora para el Análisis del SMI entregó su informe el ${day(d.committee.delivered)}: propone subirlo un ${pct(d.committee.increase, 1, "es")}, hasta ${money(d.committee.annual, "es")} al año (${money(d.committee.monthly, "es")} al mes en 14 pagas). Lo recoge la memoria del proyecto del Ministerio.`],
      [
        done,
        "Proyecto de real decreto del Ministerio de Trabajo",
        `Publicado el ${day(d.published)} para audiencia pública (del ${day(d.hearingFrom)} al ${day(d.hearingTo)}): ${money(d.monthly, "es")} al mes en 14 pagas, ${money(d.annual, "es")} al año, ${money(d.daily, "es")} al día y ${money(d.domesticHourly, "es")} la hora en el empleo de hogar (+${pct(d.increase, 1, "es")}), con entrada en vigor prevista el ${day(d.plannedFrom)}. ${sameAsDraft ? "El real decreto aprobado mantiene estas cuantías." : "Es un proyecto: puede cambiar antes de aprobarse."}`,
      ],
      [done, "Consulta a sindicatos y patronal", `El ${day(d.socialDialogue)} se convocó la mesa de diálogo social con CEOE, CEPYME, CCOO y UGT (art. 27.1 del Estatuto de los Trabajadores exige consultarles).`],
      [inBoe ? done : pending, "Aprobación en el Consejo de Ministros", inBoe ? "Aprobado: el real decreto ya está en el BOE." : "Aún no aprobado."],
      [inBoe ? offBadge : pending, "Publicación en el BOE", boeLink ? <A href={boeLink}>{boeTitle}</A> : "Aún no publicado. Lo comprobamos en el BOE cada hora: esta página cambia el día que salga."],
    ],
    ca: [
      [done, "Informe de la comissió d'experts", `La Comissió Assessora per a l'Anàlisi de l'SMI va lliurar l'informe ${caDay(d.committee.delivered)}: proposa apujar-lo un ${pct(d.committee.increase, 1, "ca")}, fins a ${money(d.committee.annual, "ca")} l'any (${money(d.committee.monthly, "ca")} al mes en 14 pagues). Ho recull la memòria del projecte del Ministeri.`],
      [
        done,
        "Projecte de reial decret del Ministeri de Treball",
        `Publicat ${caDay(d.published)} per a audiència pública (del ${day(d.hearingFrom)} al ${day(d.hearingTo)}): ${money(d.monthly, "ca")} al mes en 14 pagues, ${money(d.annual, "ca")} l'any, ${money(d.daily, "ca")} al dia i ${money(d.domesticHourly, "ca")} l'hora en el treball de la llar (+${pct(d.increase, 1, "ca")}), amb entrada en vigor prevista ${caDay(d.plannedFrom)}. ${sameAsDraft ? "El reial decret aprovat manté aquestes quanties." : "És un projecte: pot canviar abans d'aprovar-se."}`,
      ],
      [done, "Consulta a sindicats i patronal", `${capitalise(caDay(d.socialDialogue))} es va convocar la mesa de diàleg social amb CEOE, CEPYME, CCOO i UGT (l'art. 27.1 de l'Estatut dels Treballadors obliga a consultar-los).`],
      [inBoe ? done : pending, "Aprovació al Consell de Ministres", inBoe ? "Aprovat: el reial decret ja és al BOE." : "Encara no aprovat."],
      [inBoe ? offBadge : pending, "Publicació al BOE", boeLink ? <A href={boeLink}>{boeTitle}</A> : "Encara no publicat. Ho comprovem al BOE cada hora: aquesta pàgina canvia el dia que surti."],
    ],
    en: [
      [done, "Expert committee report", `The advisory committee on the SMI delivered its report on ${day(d.committee.delivered)}: it proposes a ${pct(d.committee.increase, 1, "en")} rise, to ${money(d.committee.annual, "en")} a year (${money(d.committee.monthly, "en")} a month in 14 payments). The Ministry's impact report on the draft records it.`],
      [
        done,
        "Ministry of Labour draft royal decree",
        `Published on ${day(d.published)} for public comment (${day(d.hearingFrom)} to ${day(d.hearingTo)}): ${money(d.monthly, "en")} a month in 14 payments, ${money(d.annual, "en")} a year, ${money(d.daily, "en")} a day and ${money(d.domesticHourly, "en")} an hour for domestic work (+${pct(d.increase, 1, "en")}), planned to apply from ${day(d.plannedFrom)}. ${sameAsDraft ? "The approved royal decree keeps these amounts." : "It is a draft: it can change before approval."}`,
      ],
      [done, "Consultation with unions and employers", `On ${day(d.socialDialogue)} the social dialogue table met with CEOE, CEPYME, CCOO and UGT (Workers' Statute art. 27.1 requires consulting them).`],
      [inBoe ? done : pending, "Approval by the Council of Ministers", inBoe ? "Approved: the royal decree is in the BOE." : "Not approved yet."],
      [inBoe ? offBadge : pending, "Publication in the BOE", boeLink ? <A href={boeLink}>{boeTitle}</A> : "Not published yet. We check the BOE every hour: this page changes the day it comes out."],
    ],
  });

  const notOfficial = official27
    ? L(locale, {
        es: `Lo que no es oficial: las cifras que publican los medios, las que piden sindicatos o patronal y las previsiones. Aquí solo damos importes de documentos oficiales (BOE, Ministerio de Trabajo). El de 2027 ya lo es: está en el BOE y vale para tu nómina desde el ${day(official27.effectiveFrom)}.`,
        ca: `El que no és oficial: les xifres que publiquen els mitjans, les que demanen sindicats o patronal i les previsions. Aquí només donem imports de documents oficials (BOE, Ministeri de Treball). El del 2027 ja ho és: és al BOE i val per a la teva nòmina des ${caDay(official27.effectiveFrom).replace(/^el /, "del ").replace(/^l'/, "de l'")}.`,
        en: `What is not official: figures in the press, what unions or employers ask for, and forecasts. We only print amounts from official documents (the BOE, the Ministry of Labour). 2027's now is: it is in the BOE and applies to your payslip from ${day(official27.effectiveFrom)}.`,
      })
    : L(locale, {
        es: "Lo que no es oficial: las cifras que publican los medios, las que piden sindicatos o patronal y las previsiones. Aquí solo damos importes de documentos oficiales (BOE, Ministerio de Trabajo) y el de 2027 no vale para tu nómina hasta que el real decreto salga en el BOE.",
        ca: "El que no és oficial: les xifres que publiquen els mitjans, les que demanen sindicats o patronal i les previsions. Aquí només donem imports de documents oficials (BOE, Ministeri de Treball) i el del 2027 no val per a la teva nòmina fins que el reial decret surti al BOE.",
        en: "What is not official: figures in the press, what unions or employers ask for, and forecasts. We only print amounts from official documents (the BOE, the Ministry of Labour), and 2027's does not apply to your payslip until the royal decree is in the BOE.",
      });
  const draftDocs = L(locale, { es: ["Proyecto de real decreto (PDF)", "Memoria del análisis de impacto normativo (PDF)", "Audiencia pública del Ministerio"], ca: ["Projecte de reial decret (PDF)", "Memòria de l'anàlisi d'impacte normatiu (PDF)", "Audiència pública del Ministeri"], en: ["Draft royal decree (PDF, Spanish)", "Regulatory impact report (PDF, Spanish)", "Ministry's public consultation page"] });
  const draftQuote = L(locale, { es: "La memoria del Ministerio lo resume así:", ca: "La memòria del Ministeri ho resumeix així:", en: "The Ministry's impact report sums it up:" });

  const febYears = SMI_HISTORY.filter((y) => y.year >= 2022);
  const whenText = L(locale, {
    es: [
      "El Gobierno lo fija cada año por real decreto, después de consultar a sindicatos y patronal (art. 27.1 del Estatuto de los Trabajadores):",
      `Desde 2022 el real decreto ha salido en el BOE en febrero (${febYears.map((y) => day(y.published).replace(/ de \d{4}$/, "")).join(", ")}) con efectos desde el 1 de enero, así que la subida de enero se cobra después con atrasos.${official27 ? "" : ` El proyecto de 2027 prevé entrar en vigor el ${day(d.plannedFrom)}.`}`,
    ],
    ca: [
      "El Govern el fixa cada any per reial decret, després de consultar sindicats i patronal (art. 27.1 de l'Estatut dels Treballadors):",
      `Des del 2022 el reial decret ha sortit al BOE al febrer (${febYears.map((y) => day(y.published).replace(/ de \d{4}$/, "")).join(", ")}) amb efectes des de l'1 de gener, així que la pujada de gener es cobra després amb endarreriments.${official27 ? "" : ` El projecte del 2027 preveu entrar en vigor ${caDay(d.plannedFrom)}.`}`,
    ],
    en: [
      "The government sets it every year by royal decree, after consulting unions and employers (Workers' Statute, art. 27.1):",
      `Since 2022 the decree has come out in the BOE in February (${febYears.map((y) => day(y.published).replace(/ \d{4}$/, "")).join(", ")}) with effect from 1 January, so January's rise is paid later as back pay.${official27 ? "" : ` The 2027 draft plans to apply from ${day(d.plannedFrom)}.`}`,
    ],
  });

  const histCols = L(locale, {
    es: ["Año", "Al mes (14 pagas)", "Al año", "Al día", "Hogar, por hora", "Subida", "Real decreto (BOE)"],
    ca: ["Any", "Al mes (14 pagues)", "L'any", "Al dia", "Llar, per hora", "Pujada", "Reial decret (BOE)"],
    en: ["Year", "A month (14 payments)", "A year", "A day", "Domestic, per hour", "Rise", "Royal decree (BOE)"],
  });
  const histNote = L(locale, {
    es: "En 2021 los importes de 2020 siguieron hasta agosto (disposición adicional sexta del Real Decreto-ley 38/2020) y los de la tabla se aplican desde el 1 de septiembre. Subida: sobre el mes del año anterior.",
    ca: "El 2021 els imports del 2020 van continuar fins a l'agost (disposició addicional sisena del Reial decret llei 38/2020) i els de la taula s'apliquen des de l'1 de setembre. Pujada: sobre el mes de l'any anterior.",
    en: "In 2021 the 2020 amounts stayed until August (additional provision six of Royal Decree-law 38/2020) and the table's apply from 1 September. Rise: on the previous year's monthly figure.",
  });
  const histRows = years.filter((y) => y.year <= 2026 || official27);

  const irpf = L(locale, {
    es: [
      "No debería: el Real Decreto-ley 5/2026 (art. 28, convalidado por el Congreso) reescribió la deducción por rendimientos del trabajo de la Ley del IRPF (disposición adicional 61.ª) con efectos desde el 1 de enero de 2026, porque, según su preámbulo,",
      "Sí cotizas a la Seguridad Social. Para ver tu neto con cotizaciones y la retención de tu nómina:",
      `calcula el sueldo neto del SMI de ${shown.year}`,
    ],
    ca: [
      "No hauria de pagar-ne: el Reial decret llei 5/2026 (art. 28, convalidat pel Congrés) va reescriure la deducció per rendiments del treball de la Llei de l'IRPF (disposició addicional 61a) amb efectes des de l'1 de gener del 2026, perquè, segons el preàmbul,",
      "Sí que cotitzes a la Seguretat Social. Per veure el teu net amb cotitzacions i la retenció de la nòmina:",
      `calcula el sou net de l'SMI del ${shown.year}`,
    ],
    en: [
      "It should not: Royal Decree-law 5/2026 (art. 28, validated by Congress) rewrote the income tax deduction for employment income (additional provision 61 of the IRPF Law) with effect from 1 January 2026 because, in its preamble's words,",
      "You do pay Social Security contributions. To see your net pay with contributions and your payslip's withholding:",
      `work out the net pay of the ${shown.year} SMI`,
    ],
  });

  // The 2026 SMI in net, with the net salary engine (2026 rules: the SMI deduction is the 2026 law's, 17,094 €).
  const net14 = calculateNetSalary({ ...NET_DEFAULT, gross: SMI_2026.annual, payments: 14 });
  const net12 = calculateNetSalary({ ...NET_DEFAULT, gross: SMI_2026.annual, payments: 12 });
  const D = SMI_DEDUCTION;
  const netCols = L(locale, {
    es: ["SMI 2026 en neto", "14 pagas", "12 pagas"],
    ca: ["SMI 2026 en net", "14 pagues", "12 pagues"],
    en: ["2026 SMI, net", "14 payments", "12 payments"],
  });
  const netRows: [string, string, string][] = L(locale, {
    es: [
      ["Neto en cada nómina ordinaria", money(net14.net.perPayment, "es"), money(net12.net.perPayment, "es")],
      ["Neto en cada paga extra (junio y diciembre)", money(net14.net.extraPayment ?? 0, "es"), "—"],
      ["Neto al año", money(net14.net.annual, "es"), money(net12.net.annual, "es")],
      ["Seguridad Social (tu parte), al año", money(net14.ss.annual, "es"), money(net12.ss.annual, "es")],
      [`Retención de IRPF (${percent(net14.irpf.rate, "es")}), al año`, money(net14.irpf.annual, "es"), money(net12.irpf.annual, "es")],
    ],
    ca: [
      ["Net a cada nòmina ordinària", money(net14.net.perPayment, "ca"), money(net12.net.perPayment, "ca")],
      ["Net a cada paga extra (juny i desembre)", money(net14.net.extraPayment ?? 0, "ca"), "—"],
      ["Net a l'any", money(net14.net.annual, "ca"), money(net12.net.annual, "ca")],
      ["Seguretat Social (la teva part), l'any", money(net14.ss.annual, "ca"), money(net12.ss.annual, "ca")],
      [`Retenció d'IRPF (${percent(net14.irpf.rate, "ca")}), l'any`, money(net14.irpf.annual, "ca"), money(net12.irpf.annual, "ca")],
    ],
    en: [
      ["Net in each ordinary payslip", money(net14.net.perPayment, "en"), money(net12.net.perPayment, "en")],
      ["Net in each extra payment (June and December)", money(net14.net.extraPayment ?? 0, "en"), "—"],
      ["Net a year", money(net14.net.annual, "en"), money(net12.net.annual, "en")],
      ["Social Security (your share), a year", money(net14.ss.annual, "en"), money(net12.ss.annual, "en")],
      [`IRPF withholding (${percent(net14.irpf.rate, "en")}), a year`, money(net14.irpf.annual, "en"), money(net12.irpf.annual, "en")],
    ],
  });
  const netText = L(locale, {
    es: [
      `El SMI de 2026 (${money(SMI_2026.annual, "es")} al año) en neto, soltero, sin hijos, contrato indefinido, en Cataluña o cualquier comunidad de régimen común: ${money(net14.net.perPayment, "es")} en cada nómina en 14 pagas (y ${money(net14.net.extraPayment ?? 0, "es")} en cada paga extra), o ${money(net12.net.perPayment, "es")} al mes en 12 pagas.`,
      `La retención puede ser mayor que el IRPF final: la nómina retiene ${money(net14.irpf.annual, "es")} al año porque el algoritmo de retención de la Agencia Tributaria no aplica la deducción de la disposición adicional 61.ª de la Ley del IRPF (${money(D.full, "es")} hasta ${money(D.fullUpTo, "es")}; menos el 20 % de lo que pase de esa cifra, hasta desaparecer en ${money(D.endBelow, "es")}). Con esa deducción, quien gana hasta ${money(D.fullUpTo, "es")} no debería pagar IRPF y recupera la retención al presentar la Renta ${D.returnYear}; la cifra exacta depende de la escala de su comunidad y exige no tener otras rentas no exentas de más de ${money(D.otherIncomeMax, "es")}.`,
      "Con otra situación familiar o contrato:",
    ],
    ca: [
      `L'SMI del 2026 (${money(SMI_2026.annual, "ca")} l'any) en net, solter, sense fills, contracte indefinit, a Catalunya o qualsevol comunitat de règim comú: ${money(net14.net.perPayment, "ca")} a cada nòmina en 14 pagues (i ${money(net14.net.extraPayment ?? 0, "ca")} a cada paga extra), o ${money(net12.net.perPayment, "ca")} al mes en 12 pagues.`,
      `La retenció pot ser més alta que l'IRPF final: la nòmina reté ${money(net14.irpf.annual, "ca")} l'any perquè l'algoritme de retenció de l'Agència Tributària no aplica la deducció de la disposició addicional 61a de la Llei de l'IRPF (${money(D.full, "ca")} fins a ${money(D.fullUpTo, "ca")}; menys el 20 % del que passi d'aquesta xifra, fins a desaparèixer a ${money(D.endBelow, "ca")}). Amb aquesta deducció, qui guanya fins a ${money(D.fullUpTo, "ca")} no hauria de pagar IRPF i recupera la retenció en presentar la renda ${D.returnYear}; la xifra exacta depèn de l'escala de la seva comunitat i exigeix no tenir altres rendes no exemptes de més de ${money(D.otherIncomeMax, "ca")}.`,
      "Amb una altra situació familiar o contracte:",
    ],
    en: [
      `The 2026 SMI (${money(SMI_2026.annual, "en")} a year) in net pay, single, no children, open-ended contract, in Catalonia or any common-regime region: ${money(net14.net.perPayment, "en")} in each payslip on 14 payments (and ${money(net14.net.extraPayment ?? 0, "en")} in each extra payment), or ${money(net12.net.perPayment, "en")} a month on 12 payments.`,
      `Withholding may be more than the final tax: payroll withholds ${money(net14.irpf.annual, "en")} a year because the Tax Agency's withholding algorithm does not apply the deduction in additional provision 61 of the IRPF Law (${money(D.full, "en")} up to ${money(D.fullUpTo, "en")}; minus 20% of the pay above that, down to nothing at ${money(D.endBelow, "en")}). With that deduction, employees earning up to ${money(D.fullUpTo, "en")} should pay no IRPF and get the withholding back when they file the ${D.returnYear} return; the exact figure depends on their region's scale, and it requires no more than ${money(D.otherIncomeMax, "en")} of other non-exempt income.`,
      "For another family situation or contract:",
    ],
  });

  // The 2027 figures were read in the decree on OFFICIAL_2027_READ, after the rest (SMI_RULES_AS_OF).
  const amountsRead = decree27 ? OFFICIAL_2027_READ : SMI_RULES_AS_OF;
  const disclaimer = L(locale, {
    es: `Importes brutos oficiales del BOE (revisados el ${day(amountsRead)}). Tu convenio colectivo puede fijar un salario mayor, que es el que te corresponde; el SMI es el mínimo para cualquier trabajo.`,
    ca: `Imports bruts oficials del BOE (revisats ${caDay(amountsRead)}). El teu conveni col·lectiu pot fixar un salari més alt, que és el que et correspon; l'SMI és el mínim per a qualsevol feina.`,
    en: `Official gross amounts from the BOE (checked on ${day(amountsRead)}). Your collective agreement may set higher pay, which is what you are owed; the SMI is the floor for any job.`,
  });

  const sourceNorms = [NORMS.et, NORMS.rdl38_2020, NORMS.rdl5_2026, NORMS.lirpfDa61, NORMS.rd1620_2011];

  return (
    <>
      <SiteHeader locale={locale} translations={smiEditions()} />
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
              <SmiCalculator locale={locale} years={years} initialYear={shown.year} />
              <p className="text-sm text-[var(--color-muted)]">{disclaimer}</p>
              <CalculatorNextStep current="smi-2027" locale={locale} />

              {official27 ? (
                <>
                  <h2 id="smi-2027">{h.y27}</h2>
                  <AmountsTable y={official27} locale={locale} caption={caption(official27)} />
                  <p className="text-sm">
                    <A href={boeUrl(official27)}>{official27.norm}</A> ({official27.boeId})
                  </p>
                  {decreeText ? (
                    <>
                      <p>{decreeText.scope}</p>
                      <Quote>{QUOTE.rd1013competence}</Quote>
                    </>
                  ) : null}
                </>
              ) : null}

              {howTo ? (
                <>
                  <h2 id="como-se-calcula">{howTo.heading}</h2>
                  <p>{howTo.yearly}</p>
                  <Quote>{QUOTE.rd1013annual}</Quote>
                  <p>{howTo.twelve}</p>
                  <p>{howTo.partTimeRule}</p>
                  <Quote>{QUOTE.rd1013partTime}</Quote>
                  <p>{howTo.examplesIntro}</p>
                  <ul>
                    {howTo.examples.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                  <p>{howTo.hourly}</p>
                  <Quote>{QUOTE.rd1013domestic}</Quote>
                  <p className="text-sm text-[var(--color-muted)]">
                    {howTo.source} <A href={boeUrl(decree27!)}>{decree27!.boeId}</A>
                  </p>
                </>
              ) : null}

              <h2 id="smi-2026">{h.y26}</h2>
              <p>{y26Text[0]}</p>
              <Quote>{QUOTE.rd126art1}</Quote>
              <AmountsTable y={SMI_2026} locale={locale} caption={caption(SMI_2026)} />
              <p>{y26Text[1]}</p>
              <Quote>{QUOTE.rd126partTime}</Quote>
              <p>{y26Text[2]}</p>
              <Quote>{QUOTE.rd126domestic}</Quote>
              <p>{y26Text[3]}</p>
              <Quote>{QUOTE.rd126effects}</Quote>

              <h2 id="smi-2027-estado">{h.status}</h2>
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
              {official27 ? null : (
                <>
                  <AmountsTable
                    y={d}
                    locale={locale}
                    draft
                    caption={L(locale, {
                      // Same past/present switch as the lead (smi/page.ts), so the two never disagree.
                      es: `Proyecto de real decreto del SMI para 2027 (Ministerio de Trabajo, ${day(d.published)}), que ${heard ? "estuvo" : "está"} en audiencia pública hasta el ${day(d.hearingTo)}. No aprobado ni publicado en el BOE.`,
                      ca: `Projecte de reial decret de l'SMI per al 2027 (Ministeri de Treball, ${day(d.published)}), que ${heard ? "va estar" : "està"} en audiència pública fins al ${day(d.hearingTo)}. No aprovat ni publicat al BOE.`,
                      en: `Draft royal decree on the 2027 SMI (Ministry of Labour, ${day(d.published)}), ${heard ? "which was" : "which is"} open to public comment until ${day(d.hearingTo)}. Not approved or published in the BOE.`,
                    })}
                  />
                  <p>{draftQuote}</p>
                  <Quote>{QUOTE.mainProposal}</Quote>
                  <p className="text-sm">
                    <A href={d.urls.draft}>{draftDocs[0]}</A> · <A href={d.urls.main}>{draftDocs[1]}</A> · <A href={d.urls.listing}>{draftDocs[2]}</A>
                  </p>
                </>
              )}
              <p>{notOfficial}</p>

              <h2 id="cuando">{h.when}</h2>
              <p>{whenText[0]}</p>
              <Quote>{QUOTE.et27}</Quote>
              <p>{whenText[1]}</p>
              {decreeText ? (
                <>
                  <h3 id="cuando-se-cobra">{h.paid}</h3>
                  <p>{decreeText.paid}</p>
                  <Quote>{QUOTE.rd1013effects}</Quote>
                </>
              ) : null}

              <h2 id="historia">{h.history}</h2>
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
                    {[...histRows].reverse().map((y) => {
                      const prev = histRows.find((p) => p.year === y.year - 1) ?? null;
                      const rise = increaseOn(prev, y);
                      return (
                        <tr key={y.year}>
                          <th scope="row">{y.year}</th>
                          <td data-label={histCols[1]}>{money(y.monthly, locale)}</td>
                          <td data-label={histCols[2]}>{money(y.annual, locale)}</td>
                          <td data-label={histCols[3]}>{money(y.daily, locale)}</td>
                          <td data-label={histCols[4]}>{money(y.domesticHourly, locale)}</td>
                          <td data-label={histCols[5]}>{rise === null ? "—" : `+${pct(rise, 1, locale)}`}</td>
                          <td data-label={histCols[6]}>
                            <A href={boeUrl(y)}>{y.norm.replace(/, de \d{1,2} de [a-záéíóú]+$/i, "")}</A>
                            <br />
                            <span className="text-sm text-[var(--color-muted)]">
                              {y.boeId} · {day(y.published)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-sm">{histNote}</p>
              <p>
                {L(locale, {
                  es: "El SMI es el mínimo legal. Lo que se cobra de verdad, de media y de mediana, por comunidad, edad, sexo y sector, lo mide el INE:",
                  ca: "L'SMI és el mínim legal. El que es cobra de debò, de mitjana i de mediana, per comunitat, edat, sexe i sector, ho mesura l'INE:",
                  en: "The SMI is the legal floor. What people actually earn, mean and median, by region, age, sex and sector, is measured by the INE:",
                })}{" "}
                <Link href={wagePath(locale)}>{L(locale, { es: "Salario medio en España (INE)", ca: "Salari mitjà a Espanya (INE)", en: "Average salary in Spain (INE)" })}</Link>.
              </p>
              <p>
                {L(locale, {
                  es: `No hay que confundirlo con el IPREM (${money(IPREM_MONTHLY, "es")} al mes en ${IPREM_YEAR}), que desde 2004 sustituye al SMI como referencia de ayudas y subsidios:`,
                  ca: `No s'ha de confondre amb l'IPREM (${money(IPREM_MONTHLY, "ca")} al mes el ${IPREM_YEAR}), que des del 2004 substitueix l'SMI com a referència d'ajuts i subsidis:`,
                  en: `Not to be confused with the IPREM (${money(IPREM_MONTHLY, "en")} a month in ${IPREM_YEAR}), which since 2004 replaces the SMI as the yardstick for benefits and subsidies:`,
                })}{" "}
                <Link href={ipremPath(locale)}>{L(locale, { es: `IPREM ${IPREM_YEAR}`, ca: `IPREM ${IPREM_YEAR}`, en: `IPREM ${IPREM_YEAR}` })}</Link>.
              </p>

              <h2 id="irpf">{h.irpf}</h2>
              <p>{irpf[0]}</p>
              <Quote>{QUOTE.rdl5irpf}</Quote>
              <p>{netText[0]}</p>
              <div className="ci-table-scroll mt-4">
                <table className="ci-local-table">
                  <thead>
                    <tr>
                      {netCols.map((c, k) => (
                        <th key={c} scope="col" className={k > 0 ? "text-right" : undefined}>
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {netRows.map(([k, a, b]) => (
                      <tr key={k}>
                        <th scope="row" className="font-normal">
                          {k}
                        </th>
                        <td className="whitespace-nowrap text-right tabular-nums">{a}</td>
                        <td className="whitespace-nowrap text-right tabular-nums">{b}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>{netText[1]}</p>
              <p>
                {netText[2]} <Link href={netSalaryPreset(locale, SMI_2026.annual, 14)}>{L(locale, { es: "calcula el sueldo neto del SMI de 2026", ca: "calcula el sou net de l'SMI del 2026", en: "work out the net pay of the 2026 SMI" })}</Link> (14 {L(locale, { es: "pagas", ca: "pagues", en: "payments" })}) · <Link href={netSalaryPreset(locale, SMI_2026.annual, 12)}>12 {L(locale, { es: "pagas", ca: "pagues", en: "payments" })}</Link>.
              </p>
              {shown.year !== 2026 ? (
                <p>
                  {irpf[1]} <Link href={netSalaryPreset(locale, shown.annual, 14)}>{irpf[2]}</Link> (14 {L(locale, { es: "pagas", ca: "pagues", en: "payments" })}) · <Link href={netSalaryPreset(locale, shown.annual, 12)}>12 {L(locale, { es: "pagas", ca: "pagues", en: "payments" })}</Link>.
                </p>
              ) : null}

              <h2 id="fuentes">{h.sources}</h2>
              <ul className="text-sm">
                {(official27 ? [...SMI_HISTORY, official27] : SMI_HISTORY)
                  .slice()
                  .reverse()
                  .map((y) => (
                    <li key={y.boeId}>
                      <A href={boeUrl(y)}>{y.norm}, por el que se fija el salario mínimo interprofesional para {y.year}</A> ({y.boeId})
                    </li>
                  ))}
                {status.kind === "published" ? (
                  <li>
                    <A href={boeUrl(status.hit)}>{status.hit.title}</A> ({status.hit.boeId})
                  </li>
                ) : null}
                {sourceNorms.map((n) => (
                  <li key={n.url}>
                    <A href={n.url}>{n.name}</A> ({n.ref})
                  </li>
                ))}
                <li>
                  {L(locale, { es: "Ministerio de Trabajo y Economía Social", ca: "Ministeri de Treball i Economia Social", en: "Ministry of Labour and Social Economy" })}: <A href={d.urls.draft}>{draftDocs[0]}</A> · <A href={d.urls.main}>{draftDocs[1]}</A>
                </li>
              </ul>

              <MoreCalculators current="smi-2027" locale={locale} />
            </div>
            <ShareBar locale={locale} path={smiPath(locale)} title={meta.h1} contentType="smi_2027" variant="full" />
          </div>
        </article>
      </main>
      <JsonLd json={graph([breadcrumbSchema(crumbs), calculatorAppSchema({ name: meta.h1, path: smiPath(locale), description: meta.description, locale, category: "FinanceApplication" })])} />
      <SiteFooter locale={locale} />
    </>
  );
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
