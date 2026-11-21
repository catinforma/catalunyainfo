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
import { calcPath } from "@/lib/programmatic/calculators/paths";
import { B2_TITLES, b2href } from "@/lib/content/batch02/shared";
import { hubCrumb } from "@/lib/programmatic/calculators/hub";
import { PAY_DATES_PATH } from "@/lib/programmatic/employment/paths";
import { pensionPath } from "@/lib/programmatic/pensions-2027/copy";
import { MIN_LABEL, day, elDay, euros, perMonth, perYear, whole, widowEditions, widowPath, type WpLocale } from "@/lib/programmatic/widow-pension/copy";
import type { WidowResult } from "@/lib/programmatic/widow-pension/engine";
import { DEFAULT_INPUT, examples, headline, widowFaq, widowMeta, type ExampleId } from "@/lib/programmatic/widow-pension/page";
import {
  AMOUNTS_YEAR,
  BURDENS_CEILING_SS,
  CONCURRENCE_MIN_SHARE,
  FORM_DATE,
  GENDER_GAP,
  GENDER_GAP_MAX_CHILDREN,
  INCOME_LIMIT,
  LGSS_ANCHOR,
  MAX_PENSION,
  OFFICIAL_PROCEDURE,
  ORPHANS_MAX_SHARE,
  PAYMENTS_ORDINARY,
  QUOTE,
  RDL31_CHECKED,
  RDL31_CONVALIDATED,
  RDL31_CONVALIDATION_BOE,
  RDL31_IN_FORCE,
  RULES_AS_OF,
  SOURCES,
  WIDOW_MINIMUMS,
  WIDOW_MINIMUM_IDS,
  burdensCeiling,
  round2,
} from "@/lib/programmatic/widow-pension/rules";
import { absoluteUrl } from "@/lib/site";
import { ORGANIZATION_ID, breadcrumbSchema, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

import { WidowPensionCalculator } from "./WidowPensionCalculator";

/**
 * "Pensión de viudedad: requisitos y cuánto se cobra" / "Pensió de viduïtat"
 * / "Spain widow's pension": the calculator (server-rendered on a
 * 66-year-old widow or widower of a retirement pensioner), then the three
 * percentages with their conditions, the 2026 minimums and their income
 * rules, the deceased's contributions, spouses, parejas de hecho (the
 * RDL 31/2026 change), separation and divorce, the prestación temporal, the
 * base reguladora, compatibility and remarriage, the official procedure,
 * worked examples, questions, sources and limits. Every figure comes from
 * rules.ts through the engine.
 */

const L = <T,>(locale: WpLocale, v: Record<WpLocale, T>): T => v[locale];

export function widowCrumbs(locale: WpLocale): Crumb[] {
  return [{ label: getMessages(locale).common.home, href: `/${locale}/` }, hubCrumb(locale), { label: widowMeta(locale).breadcrumb, href: widowPath(locale) }];
}

export function widowMetadata(locale: WpLocale): Metadata {
  const m = widowMeta(locale);
  return buildMetadata({ locale, path: widowPath(locale), title: m.title, description: m.description, translations: widowEditions() });
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

const md = (text: string) => text.split(/\*\*/).map((p, i) => (i % 2 ? <strong key={i}>{p}</strong> : p));

function exampleLabel(id: ExampleId, locale: WpLocale): string {
  const labels: Record<ExampleId, Record<WpLocale, string>> = {
    "married-52": {
      es: "Casada, 55 años, trabaja (18.000 € al año); él estaba de alta con 500 días; base 1.800 €",
      ca: "Casada, 55 anys, treballa (18.000 € l'any); ell estava d'alta amb 500 dies; base 1.800 €",
      en: "Married, 55, works (€18,000 a year); he was registered with 500 days; base €1,800",
    },
    "retired-60": {
      es: "Viudo de una jubilada, 70 años, 1.200 € de intereses al año; base 1.400 €",
      ca: "Vidu d'una jubilada, 70 anys, 1.200 € d'interessos l'any; base 1.400 €",
      en: "Widower of a retired woman, 70, €1,200 of interest a year; base €1,400",
    },
    "burdens-70": {
      es: "Pareja de hecho sin inscribir, 2 hijos comunes, 3 años empadronados; accidente de tráfico; 42 años, sin ingresos; base 1.900 €",
      ca: "Parella de fet sense inscriure, 2 fills comuns, 3 anys empadronats; accident de trànsit; 42 anys, sense ingressos; base 1.900 €",
      en: "Unregistered partner, 2 children together, 3 years on the padrón; traffic accident; 42, no income; base €1,900",
    },
    divorced: {
      es: "Divorciada, 63 años, pensión compensatoria de 6.000 € al año; él era pensionista; base 1.600 €",
      ca: "Divorciada, 63 anys, pensió compensatòria de 6.000 € l'any; ell era pensionista; base 1.600 €",
      en: "Divorced, 63, compensatory pension of €6,000 a year; he was a pensioner; base €1,600",
    },
    temporal: {
      es: "Casado 8 meses, enfermedad anterior a la boda, sin hijos comunes; 50 años, trabaja; base 2.000 €",
      ca: "Casat 8 mesos, malaltia anterior al casament, sense fills comuns; 50 anys, treballa; base 2.000 €",
      en: "Married 8 months, illness before the wedding, no children together; 50, works; base €2,000",
    },
    "work-accident": {
      es: "Accidente de trabajo en su primer año de empleo (menos de 500 días); 50 años; base 2.400 €",
      ca: "Accident de treball en el primer any de feina (menys de 500 dies); 50 anys; base 2.400 €",
      en: "Work accident in the first year of the job (under 500 days); 50; base €2,400",
    },
    "partner-none": {
      es: "Pareja de hecho sin inscribir, sin hijos comunes, 3 años empadronados; 48 años",
      ca: "Parella de fet sense inscriure, sense fills comuns, 3 anys empadronats; 48 anys",
      en: "Unregistered partner, no children together, 3 years on the padrón; 48",
    },
    "no-base": {
      es: "Viuda de un jubilado, 67 años, sin otros ingresos; base reguladora aún desconocida",
      ca: "Vídua d'un jubilat, 67 anys, sense altres ingressos; base reguladora encara desconeguda",
      en: "Widow of a retired man, 67, no other income; base reguladora not known yet",
    },
  };
  return labels[id][locale];
}

function accessCell(r: WidowResult, locale: WpLocale): string {
  if (r.access.kind === "pension") return L(locale, { es: "Sí, vitalicia", ca: "Sí, vitalícia", en: "Yes, for life" });
  if (r.access.kind === "temporal") return L(locale, { es: "Prestación temporal (2 años)", ca: "Prestació temporal (2 anys)", en: "Temporary benefit (2 years)" });
  return L(locale, { es: `No (art. ${r.access.articles[0]})`, ca: `No (art. ${r.access.articles[0]})`, en: `No (art. ${r.access.articles[0]})` });
}

function amountCell(r: WidowResult, locale: WpLocale): string {
  if (r.access.kind === "none") return "—";
  const M = (n: number) => perMonth(n, locale);
  if (!r.amount || !r.total) {
    if (r.floor.status === "full" || r.floor.status === "partial") return L(locale, { es: `Mínimo ${M(r.floor.monthly)}`, ca: `Mínim ${M(r.floor.monthly)}`, en: `Minimum ${M(r.floor.monthly)}` });
    return "—";
  }
  const pay = L(locale, { es: `${r.amount.payments} pagas`, ca: `${r.amount.payments} pagues`, en: `${r.amount.payments} payments` });
  if (r.total.monthly > r.amount.monthly) {
    return L(locale, {
      es: `${M(r.amount.monthly)} + complemento = ${M(r.total.monthly)} (${pay})`,
      ca: `${M(r.amount.monthly)} + complement = ${M(r.total.monthly)} (${pay})`,
      en: `${M(r.amount.monthly)} + top-up = ${M(r.total.monthly)} (${pay})`,
    });
  }
  const capped = r.amount.cappedByCompensatory ? L(locale, { es: ", rebajada a la compensatoria", ca: ", rebaixada a la compensatòria", en: ", cut to the compensatory pension" }) : "";
  return `${M(r.amount.monthly)} (${pay}${capped})`;
}

export function WidowPensionRoute({ locale }: { locale: WpLocale }) {
  const meta = widowMeta(locale);
  const crumbs = widowCrumbs(locale);
  const h = headline();
  const faq = widowFaq(locale);
  const P = (n: number) => whole(n, locale);
  const E = (n: number) => euros(n, locale);
  const M = (n: number) => perMonth(n, locale);
  const Y = (n: number) => perYear(n, locale);
  const on = (iso: string) => elDay(iso, locale);
  const D = (iso: string) => day(iso, locale);

  const lead = L(locale, {
    es: `La pensión de viudedad es el ${P(h.general)} de la base reguladora de la persona fallecida, el ${P(h.senior)} si tienes ${h.seniorAge} años o más y no tienes otros ingresos, o el ${P(h.burdens)} si tienes cargas familiares e ingresos bajos. En 2026 la mínima va de ${M(h.minUnder60)} a ${M(h.minCharges)}. Hace falta que el fallecido tuviera ${h.altaDays} días cotizados en 5 años (o 15 años sin estar de alta; nada si fue un accidente) y, si erais pareja de hecho, convivencia empadronados e inscripción. Comprueba tu caso:`,
    ca: `La pensió de viduïtat és el ${P(h.general)} de la base reguladora de la persona morta, el ${P(h.senior)} si tens ${h.seniorAge} anys o més i no tens altres ingressos, o el ${P(h.burdens)} si tens càrregues familiars i ingressos baixos. El 2026 la mínima va de ${M(h.minUnder60)} a ${M(h.minCharges)}. Cal que la persona morta tingués ${h.altaDays} dies cotitzats en 5 anys (o 15 anys sense estar d'alta; res si va ser un accident) i, si éreu parella de fet, convivència empadronats i inscripció. Comprova el teu cas:`,
    en: `Spain's widow's pension is ${P(h.general)} of the deceased's base reguladora, ${P(h.senior)} if you are ${h.seniorAge} or over with no other income, or ${P(h.burdens)} with family dependants and a low income. In 2026 the minimum runs from ${M(h.minUnder60)} to ${M(h.minCharges)}. The deceased needs ${h.altaDays} days of contributions in 5 years (or 15 years if not registered; none after an accident) and unmarried partners need cohabitation on the padrón and a registration. Check your case:`,
  });
  const fresh = L(locale, {
    es: `Normas revisadas ${on(RULES_AS_OF)} en el BOE (Ley General de la Seguridad Social, texto consolidado con última actualización del 11/11/2026; Decreto 3158/1966; Real Decreto 900/2018; Orden de 13/02/1967; Real Decreto 241/2026) y en la Seguridad Social. Cuantías de ${AMOUNTS_YEAR}.`,
    ca: `Normes revisades ${on(RULES_AS_OF)} al BOE (Llei general de la Seguretat Social, text consolidat amb última actualització de l'11/11/2026; Decret 3158/1966; Reial decret 900/2018; Ordre de 13/02/1967; Reial decret 241/2026) i a la Seguretat Social. Quanties del ${AMOUNTS_YEAR}.`,
    en: `Rules checked ${on(RULES_AS_OF)} in the BOE (General Social Security Act, consolidated text last updated 11/11/2026; Decreto 3158/1966; Royal Decree 900/2018; Order of 13/02/1967; Royal Decree 241/2026) and with Social Security. ${AMOUNTS_YEAR} amounts.`,
  });
  const disclaimer = L(locale, {
    es: "Simulación orientativa, no vinculante, con las normas del Régimen General. Decide el Instituto Nacional de la Seguridad Social con tus documentos y la vida laboral del fallecido; los regímenes especiales, las mutualidades y Clases Pasivas (funcionarios del Estado) tienen reglas propias. La solicitud oficial:",
    ca: "Simulació orientativa, no vinculant, amb les normes del règim general. Decideix l'Institut Nacional de la Seguretat Social amb els teus documents i la vida laboral de la persona morta; els règims especials, les mutualitats i Classes Passives (funcionaris de l'Estat) tenen regles pròpies. La sol·licitud oficial:",
    en: "An estimate for guidance only, not binding, under the rules for employees (Régimen General). Spain's National Social Security Institute (INSS) decides from your documents and the deceased's working life; special schemes, mutual societies and Clases Pasivas (state civil servants) have their own rules. The official application:",
  });
  const procedureLink = L(locale, {
    es: "cómo pedir la pensión de viudedad (Seguridad Social)",
    ca: "com demanar la pensió de viduïtat (Seguretat Social, en castellà)",
    en: "how to apply for the widow's pension (Social Security, in Spanish)",
  });

  const hd = L(locale, {
    es: { pct: "Cuánto se cobra: el 52 %, el 60 % o el 70 %", min: `Pensión mínima de viudedad ${AMOUNTS_YEAR}`, deceased: "Requisitos de la persona fallecida", spouse: "Cónyuge: cuándo cuenta el año de matrimonio", partner: "Parejas de hecho: lo que cambió el 21 de octubre de 2026", divorce: "Separación, divorcio y nulidad", temporal: "Prestación temporal de viudedad", base: "La base reguladora: cómo se calcula", compat: "Trabajo, otras pensiones, nuevo matrimonio y extinción", apply: "Cómo se pide y desde cuándo se cobra", examples: "Ejemplos", faq: "Preguntas frecuentes", sources: "Fuentes oficiales", limits: "Qué no calcula y cómo leemos la norma" },
    ca: { pct: "Quant es cobra: el 52 %, el 60 % o el 70 %", min: `Pensió mínima de viduïtat ${AMOUNTS_YEAR}`, deceased: "Requisits de la persona morta", spouse: "Cònjuge: quan compta l'any de matrimoni", partner: "Parelles de fet: el que va canviar el 21 d'octubre de 2026", divorce: "Separació, divorci i nul·litat", temporal: "Prestació temporal de viduïtat", base: "La base reguladora: com es calcula", compat: "Feina, altres pensions, nou matrimoni i extinció", apply: "Com es demana i des de quan es cobra", examples: "Exemples", faq: "Preguntes freqüents", sources: "Fonts oficials", limits: "Què no calcula i com llegim la norma" },
    en: { pct: "How much: 52%, 60% or 70%", min: `${AMOUNTS_YEAR} minimum widow's pension`, deceased: "What the person who died needs", spouse: "Spouses: when the year of marriage matters", partner: "Unmarried partners: what changed on 21 October 2026", divorce: "Separation, divorce and annulment", temporal: "Temporary widow's benefit", base: "The base reguladora: how it is worked out", compat: "Work, other pensions, remarriage and loss of the pension", apply: "How to apply and from when it is paid", examples: "Worked examples", faq: "Questions", sources: "Official sources", limits: "What it does not cover, and how we read the rules" },
  });
  const lgss = (art: string) => L(locale, { es: `Ley General de la Seguridad Social, ${art}`, ca: `Llei general de la Seguretat Social, ${art}`, en: `General Social Security Act, ${art}` });
  const ss = L(locale, { es: "Seguridad Social", ca: "Seguretat Social (en castellà)", en: "Social Security (in Spanish)" });
  const d3158 = L(locale, { es: "Decreto 3158/1966, art. 31", ca: "Decret 3158/1966, art. 31", en: "Decreto 3158/1966, art. 31" });
  const rd900 = (art: string) => L(locale, { es: `Real Decreto 900/2018, ${art}`, ca: `Reial decret 900/2018, ${art}`, en: `Royal Decree 900/2018, ${art}` });
  const orden = L(locale, { es: "Orden de 13 de febrero de 1967, art. 11", ca: "Ordre de 13 de febrer de 1967, art. 11", en: "Order of 13 February 1967, art. 11" });
  const rd241 = (art: string) => L(locale, { es: `Real Decreto 241/2026, ${art}`, ca: `Reial decret 241/2026, ${art}`, en: `Royal Decree 241/2026, ${art}` });
  const rdl31 = (art: string) => L(locale, { es: `Real Decreto-ley 31/2026, ${art}`, ca: `Reial decret llei 31/2026, ${art}`, en: `Royal Decree-law 31/2026, ${art}` });

  /* Percentages ------------------------------------------------------------ */
  const pctCols = L(locale, { es: ["Porcentaje", "Cuándo", "Norma"], ca: ["Percentatge", "Quan", "Norma"], en: ["Rate", "When", "Rule"] });
  const pctRows: [number, string, string][] = L(locale, {
    es: [
      [h.general, "Con carácter general.", "Decreto 3158/1966, art. 31.1 (Real Decreto 1795/2003)"],
      [h.senior, `Desde los ${h.seniorAge} años, sin derecho a otra pensión pública (española o extranjera), sin ingresos de trabajo y con rentas de capital, actividades o ganancias de hasta ${E(INCOME_LIMIT)} al año.`, "Real Decreto 900/2018, arts. 2 y 3"],
      [h.burdens, `Con cargas familiares, si la pensión es al menos la mitad de tus ingresos y tus otros ingresos no pasan del límite (límite de mínimos + la pensión mínima de tu edad: ${E(burdensCeiling(59))}, ${E(burdensCeiling(62))} o ${E(burdensCeiling(65))} al año).`, "Decreto 3158/1966, art. 31.2 y 31.3"],
    ],
    ca: [
      [h.general, "Amb caràcter general.", "Decret 3158/1966, art. 31.1 (Reial decret 1795/2003)"],
      [h.senior, `Des dels ${h.seniorAge} anys, sense dret a cap altra pensió pública (espanyola o estrangera), sense ingressos de feina i amb rendes de capital, activitats o guanys de fins a ${E(INCOME_LIMIT)} l'any.`, "Reial decret 900/2018, arts. 2 i 3"],
      [h.burdens, `Amb càrregues familiars, si la pensió és com a mínim la meitat dels teus ingressos i els teus altres ingressos no passen del límit (límit de mínims + la pensió mínima de la teva edat: ${E(burdensCeiling(59))}, ${E(burdensCeiling(62))} o ${E(burdensCeiling(65))} l'any).`, "Decret 3158/1966, art. 31.2 i 31.3"],
    ],
    en: [
      [h.general, "The general rate.", "Decreto 3158/1966, art. 31.1 (Royal Decree 1795/2003)"],
      [h.senior, `From ${h.seniorAge}, with no right to another public pension (Spanish or foreign), no work income and no more than ${E(INCOME_LIMIT)} a year of capital, business or gains income.`, "Royal Decree 900/2018, arts. 2 and 3"],
      [h.burdens, `With family dependants, if the pension is at least half your income and your other income is within the ceiling (the minimums' income limit + the minimum pension for your age: ${E(burdensCeiling(59))}, ${E(burdensCeiling(62))} or ${E(burdensCeiling(65))} a year).`, "Decreto 3158/1966, art. 31.2 and 31.3"],
    ],
  });
  const pctText = L(locale, {
    es: [
      `**Cargas familiares** quiere decir convivir con hijos menores de 26 años, hijos con discapacidad (33 % o más, según la Seguridad Social) o menores acogidos, y que los ingresos de toda la familia, divididos entre sus miembros, no pasen del 75 % del salario mínimo sin pagas extra: ${E(h.burdenThreshold)} por persona y año en 2026.`,
      `**El 60 % y el 70 % no se suman**: se aplica el que dé más. El 70 % se reduce si pensión más ingresos pasan del límite, y se pierde (vuelve el 52 %) el mes siguiente a dejar de cumplir un requisito; hay que declarar los ingresos antes del 1 de marzo de cada año.`,
      `**Dos redacciones del límite del 70 %.** El BOE suma la pensión mínima «en función de la edad del pensionista»; la página de la Seguridad Social, la mínima «con cargas familiares», que es más alta (${E(BURDENS_CEILING_SS)} al año en 2026). Usamos la del BOE y, si tus ingresos quedan entre las dos, te decimos que lo pidas.`,
    ],
    ca: [
      `**Càrregues familiars** vol dir conviure amb fills menors de 26 anys, fills amb discapacitat (33 % o més, segons la Seguretat Social) o menors acollits, i que els ingressos de tota la família, dividits entre els seus membres, no passin del 75 % del salari mínim sense pagues extra: ${E(h.burdenThreshold)} per persona i any el 2026.`,
      `**El 60 % i el 70 % no se sumen**: s'aplica el que doni més. El 70 % es redueix si pensió més ingressos passen del límit, i es perd (torna el 52 %) el mes següent a deixar de complir un requisit; cal declarar els ingressos abans de l'1 de març de cada any.`,
      `**Dues redaccions del límit del 70 %.** El BOE hi suma la pensió mínima «en función de la edad del pensionista»; la pàgina de la Seguretat Social, la mínima «con cargas familiares», que és més alta (${E(BURDENS_CEILING_SS)} l'any el 2026). Fem servir la del BOE i, si els teus ingressos queden entre totes dues, et diem que ho demanis.`,
    ],
    en: [
      `**Family dependants** means living with children under 26, children with a disability (33% or more, says Social Security) or fostered minors, with the whole family's income divided by its members no more than 75% of the minimum wage without extra payments: ${E(h.burdenThreshold)} per person a year in 2026.`,
      `**The 60% and the 70% never add up**: whichever gives more applies. The 70% is cut if pension plus income exceeds the ceiling, and lost (back to 52%) the month after a condition stops being met; income must be declared before 1 March each year.`,
      `**Two wordings of the 70% ceiling.** The BOE adds the minimum pension «en función de la edad del pensionista»; Social Security's page adds the minimum «con cargas familiares», which is higher (${E(BURDENS_CEILING_SS)} a year in 2026). We use the BOE's and, if your income falls between the two, tell you to apply.`,
    ],
  });

  /* Minimums ----------------------------------------------------------------- */
  const minCols = L(locale, {
    es: ["Pensión de viudedad", "Al mes (14 pagas)", "Al año"],
    ca: ["Pensió de viduïtat", "Al mes (14 pagues)", "L'any"],
    en: ["Widow's pension", "A month (14 payments)", "A year"],
  });
  const minCaption = L(locale, {
    es: "Real Decreto 241/2026, anexo I (cuantías mínimas de 2026), las mismas cifras que la página de la subida de las pensiones.",
    ca: "Reial decret 241/2026, annex I (quanties mínimes del 2026), les mateixes xifres que la pàgina de la pujada de les pensions.",
    en: "Royal Decree 241/2026, annex I (2026 minimum amounts), the same figures as the pension-increase page.",
  });
  const minText = L(locale, {
    es: [
      `**Solo si tus otros ingresos no pasan de ${E(INCOME_LIMIT)} al año** (trabajo, capital, actividades y ganancias; la propia pensión no cuenta). Si pasan, el complemento es la diferencia entre ${E(INCOME_LIMIT)} + el mínimo y tus ingresos + la pensión, si sale positiva.`,
      `**El complemento nunca pasa de ${E(h.complementCap)} al año** (la pensión no contributiva) y exige **residir en España**. Con otra pensión pública se aplican las reglas de concurrencia, que esta calculadora no hace.`,
      "**En enero de 2027 cambian**: las cuantías mínimas se revalorizan con la norma de cada año; las de 2027 aún no están en el BOE.",
    ],
    ca: [
      `**Només si els teus altres ingressos no passen de ${E(INCOME_LIMIT)} l'any** (feina, capital, activitats i guanys; la pensió mateixa no hi compta). Si en passen, el complement és la diferència entre ${E(INCOME_LIMIT)} + el mínim i els teus ingressos + la pensió, si surt positiva.`,
      `**El complement mai no passa de ${E(h.complementCap)} l'any** (la pensió no contributiva) i exigeix **residir a Espanya**. Amb una altra pensió pública s'apliquen les regles de concurrència, que aquesta calculadora no fa.`,
      "**El gener del 2027 canvien**: les quanties mínimes es revaloritzen amb la norma de cada any; les del 2027 encara no són al BOE.",
    ],
    en: [
      `**Only if your other income is no more than ${E(INCOME_LIMIT)} a year** (work, capital, business and gains; the pension itself does not count). Above that, the top-up is the difference between ${E(INCOME_LIMIT)} + the minimum and your income + the pension, if positive.`,
      `**The top-up is never more than ${E(h.complementCap)} a year** (the non-contributory pension) and requires **living in Spain**. With another public pension the concurrence rules apply, which this calculator does not compute.`,
      "**They change in January 2027**: the minimums are revalued by each year's norm; the 2027 ones are not in the BOE yet.",
    ],
  });

  /* Deceased ------------------------------------------------------------------ */
  const deceasedItems = L(locale, {
    es: [
      `**De alta o en situación asimilada** (trabajando, cobrando el paro, de baja, con convenio especial…): ${h.altaDays} días cotizados en los 5 años anteriores a la muerte.`,
      `**Sin alta**: ${h.noAltaYears} años cotizados en total. Esa pensión es incompatible con otra de viudedad salvo 15 años de cotizaciones superpuestas.`,
      "**Accidente (laboral o no) o enfermedad profesional**: ningún periodo previo, si estaba de alta.",
      "**Pensionista de jubilación o de incapacidad permanente contributiva**: ningún periodo más; ya cumplió para su pensión.",
    ],
    ca: [
      `**D'alta o en situació assimilada** (treballant, cobrant l'atur, de baixa, amb conveni especial…): ${h.altaDays} dies cotitzats en els 5 anys anteriors a la mort.`,
      `**Sense alta**: ${h.noAltaYears} anys cotitzats en total. Aquesta pensió és incompatible amb una altra de viduïtat llevat de 15 anys de cotitzacions superposades.`,
      "**Accident (laboral o no) o malaltia professional**: cap període previ, si estava d'alta.",
      "**Pensionista de jubilació o d'incapacitat permanent contributiva**: cap període més; ja va complir per a la seva pensió.",
    ],
    en: [
      `**Registered (alta) or in an equivalent situation** (working, on unemployment benefit, on sick leave, with a special agreement…): ${h.altaDays} days contributed in the 5 years before the death.`,
      `**Not registered**: ${h.noAltaYears} years contributed in all. That pension is incompatible with another widow's pension unless 15 years of contributions overlap.`,
      "**Accident (at work or not) or occupational illness**: no prior period, if they were registered.",
      "**A contributory retirement or permanent disability pensioner**: no further period; they already met it for their own pension.",
    ],
  });

  /* Spouse ----------------------------------------------------------------- */
  const spouseText = L(locale, {
    es: "Si la muerte fue por una **enfermedad común que ya existía antes de la boda**, hace falta además un año de matrimonio, o hijos comunes, o que la convivencia anterior como pareja más el matrimonio superen los dos años. Si no, hay prestación temporal de 2 años. En los demás casos (enfermedad posterior a la boda, accidente) no se pide duración del matrimonio.",
    ca: "Si la mort va ser per una **malaltia comuna que ja existia abans del casament**, cal a més un any de matrimoni, o fills comuns, o que la convivència anterior com a parella més el matrimoni superin els dos anys. Si no, hi ha prestació temporal de 2 anys. En els altres casos (malaltia posterior al casament, accident) no es demana durada del matrimoni.",
    en: "If death came from a **common illness that existed before the wedding**, you also need a year of marriage, or children together, or prior cohabitation as a couple plus the marriage over two years. Otherwise there is a 2-year temporary benefit. In other cases (illness after the wedding, an accident) no length of marriage is required.",
  });

  /* Partners ----------------------------------------------------------------- */
  const partnerCols = L(locale, {
    es: ["", "Sin hijos en común", "Con hijos en común"],
    ca: ["", "Sense fills en comú", "Amb fills en comú"],
    en: ["", "No children together", "Children together"],
  });
  const partnerRows: [string, string, string][] = L(locale, {
    es: [
      ["Hasta el 20/10/2026 (Ley 21/2021)", `${h.cohabitation} años de convivencia empadronados + inscripción ${h.registration} años antes`, `Solo la inscripción ${h.registration} años antes`],
      ["Desde el 21/10/2026 (Real Decreto-ley 31/2026)", `${h.cohabitation} años de convivencia empadronados + inscripción ${h.registration} años antes`, `Solo ${h.childrenCohabitation} años de convivencia empadronados`],
    ],
    ca: [
      ["Fins al 20/10/2026 (Llei 21/2021)", `${h.cohabitation} anys de convivència empadronats + inscripció ${h.registration} anys abans`, `Només la inscripció ${h.registration} anys abans`],
      ["Des del 21/10/2026 (Reial decret llei 31/2026)", `${h.cohabitation} anys de convivència empadronats + inscripció ${h.registration} anys abans`, `Només ${h.childrenCohabitation} anys de convivència empadronats`],
    ],
    en: [
      ["Until 20/10/2026 (Law 21/2021)", `${h.cohabitation} years on the same padrón + registration ${h.registration} years before`, `Only the registration, ${h.registration} years before`],
      ["From 21/10/2026 (Royal Decree-law 31/2026)", `${h.cohabitation} years on the same padrón + registration ${h.registration} years before`, `Only ${h.childrenCohabitation} years on the same padrón`],
    ],
  });
  const partnerText = L(locale, {
    es: [
      "La inscripción es en un registro de parejas de hecho de la comunidad autónoma o del ayuntamiento, o una escritura pública. Ninguno de los dos podía estar casado con otra persona ni tener otra pareja de hecho.",
      `**Convalidado.** El Real Decreto-ley 31/2026 está en vigor desde ${on(RDL31_IN_FORCE)} y la Diputación Permanente del Congreso lo convalidó ${on(RDL31_CONVALIDATED)} (BOE del ${D(RDL31_CONVALIDATION_BOE)}).`,
      "**Fallecimientos anteriores al 21/10/2026**: si entonces no se pudo causar la pensión y hoy cumplís la nueva regla, se puede pedir en los 12 meses siguientes a esa fecha, con efectos desde el mes siguiente a la solicitud (disposición transitoria 48ª).",
      "Si la pareja de hecho se había roto antes de la muerte, se aplica lo mismo que a los divorciados: hace falta pensión compensatoria (art. 221.3).",
    ],
    ca: [
      "La inscripció és en un registre de parelles de fet de la comunitat autònoma o de l'ajuntament, o una escriptura pública. Cap dels dos no podia estar casat amb una altra persona ni tenir una altra parella de fet.",
      `**Convalidat.** El Reial decret llei 31/2026 és vigent des del ${D(RDL31_IN_FORCE)} i la Diputació Permanent del Congrés el va convalidar ${on(RDL31_CONVALIDATED)} (BOE del ${D(RDL31_CONVALIDATION_BOE)}).`,
      "**Morts anteriors al 21/10/2026**: si aleshores no es va poder causar la pensió i avui compliu la nova regla, es pot demanar en els 12 mesos següents a aquella data, amb efectes des del mes següent a la sol·licitud (disposició transitòria 48a).",
      "Si la parella de fet s'havia trencat abans de la mort, s'aplica el mateix que als divorciats: cal pensió compensatòria (art. 221.3).",
    ],
    en: [
      "Registration means a regional or municipal register of unmarried couples, or a public deed. Neither could be married to someone else or have another registered partner.",
      `**Ratified.** Royal Decree-law 31/2026 has been in force since ${D(RDL31_IN_FORCE)}, and Congress's Standing Committee (Diputación Permanente) ratified it ${on(RDL31_CONVALIDATED)} (BOE of ${D(RDL31_CONVALIDATION_BOE)}).`,
      "**Deaths before 21/10/2026**: if no pension could be caused then and you meet the new rule now, you can apply within 12 months of that date, with effect from the month after applying (forty-eighth transitional provision).",
      "If the partnership had ended before the death, the divorce rule applies: a compensatory pension is needed (art. 221.3).",
    ],
  });

  /* Divorce ------------------------------------------------------------------ */
  const divorceItems = L(locale, {
    es: [
      "**No haberse vuelto a casar** ni haber formado otra pareja de hecho.",
      "**Cobrar una pensión compensatoria** (art. 97 del Código Civil) que se extinga con la muerte. **La viudedad no puede pasar de esa compensatoria**: si sale más alta, se rebaja.",
      "**Sin compensatoria**, tienen derecho las mujeres que acrediten que eran víctimas de violencia de género al separarse o divorciarse (sentencia, orden de protección, informe del fiscal u otra prueba).",
      `**Con varios beneficiarios** tras un divorcio, la pensión se reparte según el tiempo vivido con el fallecido, con un mínimo del ${CONCURRENCE_MIN_SHARE} % para el cónyuge o la pareja de hecho del momento.`,
      "**Separaciones y divorcios anteriores al 1 de enero de 2008**: no hace falta compensatoria si entre el divorcio y la muerte no pasaron más de 10 años, el matrimonio duró al menos 10 y hay hijos comunes o el beneficiario tiene más de 50 años; o, sin eso, si tiene 65 años o más y el matrimonio duró 15 o más (disposición transitoria 13ª).",
      "**Nulidad**: tiene derecho quien recibió la indemnización del art. 98 del Código Civil, en proporción al tiempo vivido.",
    ],
    ca: [
      "**No haver-se tornat a casar** ni haver format una altra parella de fet.",
      "**Cobrar una pensió compensatòria** (art. 97 del Codi civil espanyol) que s'extingeixi amb la mort. **La viduïtat no pot passar d'aquesta compensatòria**: si surt més alta, es rebaixa.",
      "**Sense compensatòria**, hi tenen dret les dones que acreditin que eren víctimes de violència de gènere en separar-se o divorciar-se (sentència, ordre de protecció, informe del fiscal o una altra prova).",
      `**Amb diversos beneficiaris** després d'un divorci, la pensió es reparteix segons el temps viscut amb la persona morta, amb un mínim del ${CONCURRENCE_MIN_SHARE} % per al cònjuge o la parella de fet del moment.`,
      "**Separacions i divorcis anteriors a l'1 de gener de 2008**: no cal compensatòria si entre el divorci i la mort no van passar més de 10 anys, el matrimoni va durar com a mínim 10 i hi ha fills comuns o el beneficiari té més de 50 anys; o, sense això, si té 65 anys o més i el matrimoni va durar 15 o més (disposició transitòria 13a).",
      "**Nul·litat**: hi té dret qui va rebre la indemnització de l'art. 98 del Codi civil, en proporció al temps viscut.",
    ],
    en: [
      "**Not remarried** and no new registered partnership.",
      "**Receiving a compensatory pension** (Civil Code art. 97) that ends with the death. **The widow's pension cannot exceed it**: if higher, it is cut down to it.",
      "**Without one**, women who show they were victims of gender violence at the separation or divorce are entitled (a judgment, a protection order, a prosecutor's report or other evidence).",
      `**With several beneficiaries** after a divorce, the pension is shared by the time each lived with the deceased, with at least ${CONCURRENCE_MIN_SHARE}% for the spouse or partner at the time.`,
      "**Separations and divorces before 1 January 2008**: no compensatory pension is needed if no more than 10 years passed between divorce and death, the marriage lasted at least 10 and there are children together or the beneficiary is over 50; or, failing that, if they are 65 or over and the marriage lasted 15 or more (thirteenth transitional provision).",
      "**Annulment**: whoever received the Civil Code art. 98 compensation is entitled, in proportion to the time lived together.",
    ],
  });

  /* Temporal ------------------------------------------------------------------ */
  const temporalText = L(locale, {
    es: `Para quien cumple todo lo demás pero no llega a la pensión vitalicia por la duración del matrimonio (con enfermedad anterior y sin hijos comunes) o por una inscripción como pareja de hecho de menos de ${h.registration} años: el mismo importe que la pensión, durante **${h.temporalYears} años**. Se extingue antes por las mismas causas que la pensión.`,
    ca: `Per a qui compleix tota la resta però no arriba a la pensió vitalícia per la durada del matrimoni (amb malaltia anterior i sense fills comuns) o per una inscripció com a parella de fet de menys de ${h.registration} anys: el mateix import que la pensió, durant **${h.temporalYears} anys**. S'extingeix abans per les mateixes causes que la pensió.`,
    en: `For those who meet everything else but miss the lifelong pension because of the length of the marriage (illness beforehand, no children together) or a partnership registered under ${h.registration} years before: the same amount as the pension, for **${h.temporalYears} years**. It ends earlier for the same reasons as the pension.`,
  });

  /* Base ------------------------------------------------------------------------ */
  const baseItems = L(locale, {
    es: [
      "**Si el fallecido era pensionista** de jubilación o incapacidad permanente: la misma base reguladora de su pensión, con las revalorizaciones de las pensiones de viudedad desde entonces.",
      "**Si trabajaba y murió por enfermedad común**: la suma de sus bases de cotización de 24 meses seguidos, dividida entre 28. Los 24 meses los elige el beneficiario dentro de los 15 años anteriores.",
      "**Accidente no laboral** sin esos 24 meses: la mejor entre esa y las bases mínimas de los 24 meses anteriores divididas entre 28.",
      "**Accidente de trabajo o enfermedad profesional**: el salario real del último año dividido entre 12, y se cobra en 12 pagas.",
      `**Topes**: la pensión no puede pasar de la máxima de 2026 (${M(MAX_PENSION.monthly)} en 14 pagas), y la viudedad y las orfandades juntas no pasan del 100 % de la base, salvo que la viudedad sea de más del 52 % (las orfandades, hasta el ${ORPHANS_MAX_SHARE} %).`,
      "La base reguladora sale en la resolución de la Seguridad Social; si aún no la tienes, la calculadora te da el porcentaje y el mínimo.",
    ],
    ca: [
      "**Si la persona morta era pensionista** de jubilació o incapacitat permanent: la mateixa base reguladora de la seva pensió, amb les revaloritzacions de les pensions de viduïtat des d'aleshores.",
      "**Si treballava i va morir per malaltia comuna**: la suma de les seves bases de cotització de 24 mesos seguits, dividida entre 28. Els 24 mesos els tria el beneficiari dins dels 15 anys anteriors.",
      "**Accident no laboral** sense aquests 24 mesos: la millor entre aquesta i les bases mínimes dels 24 mesos anteriors dividides entre 28.",
      "**Accident de treball o malaltia professional**: el salari real de l'últim any dividit entre 12, i es cobra en 12 pagues.",
      `**Límits**: la pensió no pot passar de la màxima del 2026 (${M(MAX_PENSION.monthly)} en 14 pagues), i la viduïtat i les orfandats juntes no passen del 100 % de la base, llevat que la viduïtat sigui de més del 52 % (les orfandats, fins al ${ORPHANS_MAX_SHARE} %).`,
      "La base reguladora surt a la resolució de la Seguretat Social; si encara no la tens, la calculadora et dona el percentatge i el mínim.",
    ],
    en: [
      "**If the deceased was a pensioner** (retirement or permanent disability): the same base reguladora as their pension, plus the widow's pension revaluations since.",
      "**If they worked and died of a common illness**: their contribution bases for 24 consecutive months divided by 28. The beneficiary picks the 24 months within the previous 15 years.",
      "**A non-work accident** without those 24 months: the better of that and the minimum bases of the previous 24 months divided by 28.",
      "**A work accident or occupational illness**: the actual salary of the last year divided by 12, paid in 12 payments.",
      `**Caps**: the pension cannot exceed the 2026 maximum (${M(MAX_PENSION.monthly)} in 14 payments), and widow's and orphan's pensions together stay within 100% of the base, unless the widow's is above 52% (orphans' then up to ${ORPHANS_MAX_SHARE}%).`,
      "The base reguladora is in Social Security's decision; if you do not have it yet, the calculator gives the rate and the minimum.",
    ],
  });

  /* Compatibility ---------------------------------------------------------------- */
  const compatItems = L(locale, {
    es: [
      "**Es compatible con cualquier sueldo** y con tu propia pensión de jubilación o incapacidad permanente. Lo que cambia es el porcentaje (el 60 % exige no trabajar), el complemento a mínimos y, con dos pensiones, el tope de la pensión máxima.",
      `**Se pierde al volver a casarte o formar una pareja de hecho**, salvo que tengas más de ${h.remarriageAge} años (o menos con incapacidad permanente absoluta, gran invalidez o discapacidad del 65 %), la viudedad sea al menos el 75 % de tus ingresos y la pareja no ingrese más de ${E(h.remarriageIncome)} al año (dos veces el salario mínimo de 2026).`,
      "**También se pierde** por condena firme por la muerte del causante, por fallecimiento, o si aparece el trabajador desaparecido en un accidente.",
      `**Complemento por brecha de género**: las mujeres con hijos que cobran viudedad (y los hombres en algunos casos) suman ${M(GENDER_GAP)} por hijo en 2026, hasta ${GENDER_GAP_MAX_CHILDREN} hijos, en 14 pagas (art. 60).`,
    ],
    ca: [
      "**És compatible amb qualsevol sou** i amb la teva pròpia pensió de jubilació o incapacitat permanent. El que canvia és el percentatge (el 60 % exigeix no treballar), el complement a mínims i, amb dues pensions, el límit de la pensió màxima.",
      `**Es perd en tornar-te a casar o formar una parella de fet**, llevat que tinguis més de ${h.remarriageAge} anys (o menys amb incapacitat permanent absoluta, gran invalidesa o discapacitat del 65 %), la viduïtat sigui com a mínim el 75 % dels teus ingressos i la parella no ingressi més de ${E(h.remarriageIncome)} l'any (dues vegades el salari mínim del 2026).`,
      "**També es perd** per condemna ferma per la mort del causant, per defunció, o si apareix el treballador desaparegut en un accident.",
      `**Complement per bretxa de gènere**: les dones amb fills que cobren viduïtat (i els homes en alguns casos) sumen ${M(GENDER_GAP)} per fill el 2026, fins a ${GENDER_GAP_MAX_CHILDREN} fills, en 14 pagues (art. 60).`,
    ],
    en: [
      "**It is compatible with any salary** and with your own retirement or permanent disability pension. What changes is the rate (60% requires no work income), the minimum top-up and, with two pensions, the maximum-pension cap.",
      `**It ends if you remarry or form a registered partnership**, unless you are over ${h.remarriageAge} (or younger with an absolute permanent disability, gran invalidez or a 65% disability), the widow's pension is at least 75% of your income and the couple's income is no more than ${E(h.remarriageIncome)} a year (twice the 2026 minimum wage).`,
      "**It also ends** with a final conviction for causing the death, on death, or if a worker missing after an accident turns up.",
      `**Gender-gap complement**: women with children who draw a widow's pension (and men in some cases) add ${M(GENDER_GAP)} per child in 2026, up to ${GENDER_GAP_MAX_CHILDREN} children, in 14 payments (art. 60).`,
    ],
  });

  /* Apply ---------------------------------------------------------------------- */
  const applyItems = L(locale, {
    es: [
      "**Por internet**: en el Portal de Prestaciones de la Seguridad Social.",
      `**En papel**: con el formulario «Solicitud de viudedad, orfandad y favor de familiares» (versión del ${D(FORM_DATE)}), en un CAISS con cita previa, por correo a la dirección provincial o en cualquier registro oficial.`,
      "**Documentos**: DNI o NIE, certificado de defunción y, según el caso, libro de familia o acta de matrimonio, sentencia de separación o divorcio y la pensión compensatoria, certificado de inscripción de la pareja de hecho y de empadronamiento.",
      `**Desde cuándo**: si la pides en los ${h.retroMonths} meses siguientes, desde el día siguiente al fallecimiento (desde el día 1 del mes siguiente si el fallecido era pensionista); si no, con ${h.retroMonths} meses de atrasos. El derecho no prescribe.`,
    ],
    ca: [
      "**Per internet**: al Portal de Prestaciones de la Seguretat Social.",
      `**En paper**: amb el formulari «Solicitud de viudedad, orfandad y favor de familiares» (versió del ${D(FORM_DATE)}), en un CAISS amb cita prèvia, per correu a la direcció provincial o en qualsevol registre oficial.`,
      "**Documents**: DNI o NIE, certificat de defunció i, segons el cas, llibre de família o acta de matrimoni, sentència de separació o divorci i la pensió compensatòria, certificat d'inscripció de la parella de fet i d'empadronament.",
      `**Des de quan**: si la demanes en els ${h.retroMonths} mesos següents, des de l'endemà de la mort (des del dia 1 del mes següent si la persona morta era pensionista); si no, amb ${h.retroMonths} mesos d'endarreriments. El dret no prescriu.`,
    ],
    en: [
      "**Online**: on the Seguridad Social's Portal de Prestaciones.",
      `**On paper**: with the form «Solicitud de viudedad, orfandad y favor de familiares» (version of ${D(FORM_DATE)}), at a CAISS office by appointment, by post to the provincial office or at any official registry.`,
      "**Documents**: ID (DNI or NIE), the death certificate and, as the case may be, the family book or marriage record, the separation or divorce judgment with the compensatory pension, the partnership registration and padrón certificates.",
      `**From when**: apply within ${h.retroMonths} months and it is paid from the day after the death (from the 1st of the next month if the deceased was a pensioner); later, with ${h.retroMonths} months of arrears. The right never lapses.`,
    ],
  });
  const procedureLinks = L(locale, {
    es: { portal: "Portal de Prestaciones (solicitud por internet)", form: "Formulario de solicitud de viudedad (PDF)", appointment: "Cita previa en un CAISS", howTo: "Presentación de solicitudes" },
    ca: { portal: "Portal de Prestaciones (sol·licitud per internet, en castellà)", form: "Formulari de sol·licitud de viduïtat (PDF, en castellà)", appointment: "Cita prèvia en un CAISS (en castellà)", howTo: "Presentació de sol·licituds (en castellà)" },
    en: { portal: "Portal de Prestaciones (online application, in Spanish)", form: "Widow's pension application form (PDF, in Spanish)", appointment: "CAISS appointment (in Spanish)", howTo: "How applications are filed (in Spanish)" },
  });

  /* Examples ------------------------------------------------------------------- */
  const exCols = L(locale, {
    es: ["Caso", "¿Derecho?", "Porcentaje", "Al mes"],
    ca: ["Cas", "Dret?", "Percentatge", "Al mes"],
    en: ["Case", "Entitled?", "Rate", "A month"],
  });
  const exNote = L(locale, {
    es: `Calculado con las normas de ${on(RULES_AS_OF)} y las cuantías de ${AMOUNTS_YEAR}; los casos son supuestos, las reglas son las del BOE. La divorciada no suma complemento a mínimos: ver «Qué no calcula».`,
    ca: `Calculat amb les normes ${on(RULES_AS_OF)} i les quanties del ${AMOUNTS_YEAR}; els casos són suposats, les regles són les del BOE. La divorciada no suma complement a mínims: vegeu «Què no calcula».`,
    en: `Worked out with the rules of ${D(RULES_AS_OF)} and the ${AMOUNTS_YEAR} amounts; the cases are hypothetical, the rules are the BOE's. The divorced case gets no minimum top-up: see "What it does not cover".`,
  });
  const links = L(locale, {
    es: { pension: "Subida de las pensiones 2027 y todas las pensiones mínimas de 2026", retire: "Edad de jubilación: a qué edad te puedes jubilar", pay: "Cuándo se cobra la pensión: calendario de pagos" },
    ca: { pension: "Pujada de les pensions 2027 i totes les pensions mínimes del 2026", retire: "Edat de jubilació: a quina edat et pots jubilar", pay: "Quan es cobra la pensió: calendari de pagaments" },
    en: { pension: "Spain's 2027 pension increase and every 2026 minimum pension", retire: "Spain retirement age: when you can retire", pay: "When pensions are paid: payment calendar" },
  });

  /* Sources and limits --------------------------------------------------------- */
  const sourcesLead = L(locale, {
    es: `Todo leído ${on(RULES_AS_OF)}; las citas son literales. El Real Decreto-ley 31/2026, revisado de nuevo ${on(RDL31_CHECKED)}.`,
    ca: `Tot llegit ${on(RULES_AS_OF)}; les cites són literals, en castellà. El Reial decret llei 31/2026, revisat de nou ${on(RDL31_CHECKED)}.`,
    en: `All read ${on(RULES_AS_OF)}; quotes are verbatim, in Spanish. Royal Decree-law 31/2026 checked again ${on(RDL31_CHECKED)}.`,
  });
  const limits = L(locale, {
    es: [
      "La base reguladora: no la calcula (necesita las bases de cotización del fallecido); la pones tú o te damos el porcentaje.",
      "El reparto entre varios beneficiarios tras un divorcio, la orfandad, el auxilio por defunción y la indemnización por accidente de trabajo.",
      "Pensiones concurrentes (otra pensión pública): el tope de la máxima y el mínimo con concurrencia.",
      "Regímenes especiales, mutualidades, Clases Pasivas y pensiones por normas internacionales.",
      "Lectura: el límite de ingresos del 70 % se mira con tus otros ingresos, sin la propia viudedad; luego la pensión se reduce para que pensión e ingresos no pasen de él (art. 31.3). Si el 70 % reducido queda por debajo del 60 % o del 52 %, aplicamos el que dé más.",
      "Lectura: si después de la reducción del art. 31.3 corresponde complemento a mínimos, lo sumamos.",
      "Lectura: una pareja de hecho sin hijos y sin ninguna inscripción no tiene prestación temporal (el art. 222 habla de una inscripción de menos de dos años).",
      "Lectura: la pensión compensatoria se compara por años. Si la viudedad queda rebajada a ella, no sumamos complemento a mínimos: el Real Decreto 241/2026 lo excluye en el apartado de Clases Pasivas y no está claro para el régimen general.",
      "La prestación temporal se calcula como la pensión, sin complemento a mínimos: ningún texto oficial dice que lo tenga.",
    ],
    ca: [
      "La base reguladora: no la calcula (necessita les bases de cotització de la persona morta); la poses tu o et donem el percentatge.",
      "El repartiment entre diversos beneficiaris després d'un divorci, l'orfandat, l'auxili per defunció i la indemnització per accident de treball.",
      "Pensions concurrents (una altra pensió pública): el límit de la màxima i el mínim amb concurrència.",
      "Règims especials, mutualitats, Classes Passives i pensions per normes internacionals.",
      "Lectura: el límit d'ingressos del 70 % es mira amb els teus altres ingressos, sense la viduïtat mateixa; després la pensió es redueix perquè pensió i ingressos no en passin (art. 31.3). Si el 70 % reduït queda per sota del 60 % o del 52 %, apliquem el que doni més.",
      "Lectura: si després de la reducció de l'art. 31.3 correspon complement a mínims, el sumem.",
      "Lectura: una parella de fet sense fills i sense cap inscripció no té prestació temporal (l'art. 222 parla d'una inscripció de menys de dos anys).",
      "Lectura: la pensió compensatòria es compara per anys. Si la viduïtat queda rebaixada a aquesta, no sumem complement a mínims: el Reial decret 241/2026 l'exclou a l'apartat de Classes Passives i no és clar per al règim general.",
      "La prestació temporal es calcula com la pensió, sense complement a mínims: cap text oficial no diu que en tingui.",
    ],
    en: [
      "The base reguladora: not computed (it needs the deceased's contribution bases); you enter it or get the rate.",
      "Sharing between several beneficiaries after a divorce, orphan's pensions, the death grant and the work-accident lump sum.",
      "Concurrent pensions (another public pension): the maximum cap and the minimum with concurrence.",
      "Special schemes, mutual societies, Clases Pasivas and pensions under international agreements.",
      "Reading: the 70% income ceiling is checked against your other income, without the widow's pension itself; the pension is then cut so that pension plus income stays within it (art. 31.3). If the cut 70% falls below the 60% or 52%, we apply whichever gives more.",
      "Reading: if a minimum top-up is due after the art. 31.3 cut, we add it.",
      "Reading: an unmarried partner with no children and no registration at all gets no temporary benefit (art. 222 speaks of a registration made under two years before).",
      "Reading: the compensatory pension is compared per year. If the widow's pension is cut to it, we add no minimum top-up: Royal Decree 241/2026 excludes it in its Clases Pasivas paragraph and it is unclear for employees.",
      "The temporary benefit is worked out like the pension, without a minimum top-up: no official text says it has one.",
    ],
  });

  const appSchema = {
    "@type": "WebApplication",
    name: meta.appName,
    url: absoluteUrl(widowPath(locale)),
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

  const table = (cols: readonly string[], rows: readonly (readonly ReactNode[])[], caption?: string) => (
    <div className="ci-table-scroll mt-4">
      <table className="ci-local-table ci-stack-table">
        {caption ? <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">{caption}</caption> : null}
        <thead>
          <tr>
            {cols.map((c, i) => (
              <th key={i} scope="col">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r}>
              <th scope="row" className="font-normal">
                {row[0]}
              </th>
              {row.slice(1).map((c, i) => (
                <td key={i} data-label={cols[i + 1]}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      <SiteHeader locale={locale} translations={widowEditions()} />
      <main id="main">
        <article>
          <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
            <div className="ci-shell py-5 md:py-8 lg:py-12">
              <Breadcrumbs items={crumbs} locale={locale} />
              <h1 className="ci-measure">{meta.h1}</h1>
              <p className="ci-measure mt-4 text-lg text-[var(--color-ink-soft)]">{lead}</p>
              <p className="ci-measure mt-2 text-sm text-[var(--color-muted)]">{fresh}</p>
            </div>
          </header>

          <div className="ci-shell py-10">
            <div className="ci-prose">
              <WidowPensionCalculator locale={locale} initial={DEFAULT_INPUT} asOf={RULES_AS_OF} />
              <p className="text-sm text-[var(--color-muted)]">
                {disclaimer} <A href={SOURCES.ssWidow.url}>{procedureLink}</A>.
              </p>
              <CalculatorNextStep current="widow-pension" locale={locale} />

              <h2 id="porcentajes">{hd.pct}</h2>
              {table(
                pctCols,
                pctRows.map(([p, when, rule]) => [<strong key="p">{P(p)}</strong>, when, rule]),
              )}
              {pctText.map((p) => (
                <p key={p}>{md(p)}</p>
              ))}
              <Quote text={QUOTE.d31_1} href={SOURCES.d3158.url} label={`${d3158}.1`} />
              <Quote text={`${QUOTE.rd900a} ${QUOTE.rd900b} ${QUOTE.rd900c} ${QUOTE.rd900d}`} href={SOURCES.rd900.url} label={rd900("art. 2")} />
              <Quote text={QUOTE.rd900_7} href={SOURCES.rd900.url} label={rd900("art. 7")} />
              <Quote text={QUOTE.d31_2} href={SOURCES.d3158.url} label={`${d3158}.2`} />
              <Quote text={QUOTE.d31_2limit} href={SOURCES.d3158.url} label={`${d3158}.2`} />
              <Quote text={QUOTE.d31_2burdens} href={SOURCES.d3158.url} label={`${d3158}.2`} />
              <Quote text={QUOTE.d31_3} href={SOURCES.d3158.url} label={`${d3158}.3`} />
              <Quote text={QUOTE.ssCeiling} href={SOURCES.ssAmount.url} label={`${ss}, ${L(locale, { es: "cuantía de la pensión de viudedad", ca: "quantia de la pensió de viduïtat", en: "widow's pension amount" })}`} />

              <h2 id="minimas">{hd.min}</h2>
              {table(
                minCols,
                WIDOW_MINIMUM_IDS.map((id) => [MIN_LABEL[locale][id], <strong key="m">{M(round2(WIDOW_MINIMUMS[id] / PAYMENTS_ORDINARY))}</strong>, Y(WIDOW_MINIMUMS[id])]),
                minCaption,
              )}
              {minText.map((p) => (
                <p key={p}>{md(p)}</p>
              ))}
              <Quote text={QUOTE.rd241partial} href={SOURCES.rd241.url} label={rd241("art. 9.2")} />
              <Quote text={QUOTE.art59income} href={LGSS_ANCHOR.art59} label={lgss("art. 59.1")} />
              <Quote text={QUOTE.art59cap} href={LGSS_ANCHOR.art59} label={lgss("art. 59.4")} />
              <p>
                <Link href={pensionPath(locale)}>{links.pension}</Link>
              </p>

              <h2 id="requisitos">{hd.deceased}</h2>
              <ul>
                {deceasedItems.map((i) => (
                  <li key={i}>{md(i)}</li>
                ))}
              </ul>
              <Quote text={QUOTE.art219alta} href={LGSS_ANCHOR.art219} label={lgss("art. 219.1")} />
              <Quote text={QUOTE.art219accident} href={LGSS_ANCHOR.art219} label={lgss("art. 219.1")} />
              <Quote text={QUOTE.art219noAlta} href={LGSS_ANCHOR.art219} label={lgss("art. 219.1")} />
              <Quote text={QUOTE.art217c} href={LGSS_ANCHOR.art217} label={lgss("art. 217.1.c")} />

              <h2 id="conyuge">{hd.spouse}</h2>
              <p>{md(spouseText)}</p>
              <Quote text={QUOTE.art219_2} href={LGSS_ANCHOR.art219} label={lgss("art. 219.2")} />

              <h2 id="pareja-de-hecho">{hd.partner}</h2>
              {table(partnerCols, partnerRows)}
              {partnerText.map((p) => (
                <p key={p}>{md(p)}</p>
              ))}
              <Quote text={QUOTE.art221cohabitation} href={LGSS_ANCHOR.art221} label={lgss(L(locale, { es: "art. 221.2 (Real Decreto-ley 31/2026)", ca: "art. 221.2 (Reial decret llei 31/2026)", en: "art. 221.2 (Royal Decree-law 31/2026)" }))} />
              <Quote text={QUOTE.art221registration} href={LGSS_ANCHOR.art221} label={lgss("art. 221.2")} />
              <Quote text={QUOTE.art221children} href={LGSS_ANCHOR.art221} label={lgss(L(locale, { es: "art. 221.2, desde el 21/10/2026", ca: "art. 221.2, des del 21/10/2026", en: "art. 221.2, from 21/10/2026" }))} />
              <Quote text={QUOTE.art221children2021} href={SOURCES.ley21.url} label={lgss(L(locale, { es: "art. 221.2 en la redacción de la Ley 21/2021 (hasta el 20/10/2026)", ca: "art. 221.2 en la redacció de la Llei 21/2021 (fins al 20/10/2026)", en: "art. 221.2 as worded by Law 21/2021 (until 20/10/2026)" }))} />
              <Quote text={QUOTE.rdl31why} href={SOURCES.rdl31.url} label={rdl31(L(locale, { es: "preámbulo", ca: "preàmbul", en: "preamble" }))} />
              <Quote
                text={QUOTE.rdl31convalidation}
                href={SOURCES.rdl31Convalidation.url}
                label={L(locale, {
                  es: "Resolución de 18 de noviembre de 2026, del Congreso de los Diputados (BOE-A-2026-24292)",
                  ca: "Resolució de 18 de novembre de 2026, del Congrés dels Diputats (BOE-A-2026-24292)",
                  en: "Resolution of 18 November 2026, Congress of Deputies (BOE-A-2026-24292)",
                })}
              />
              <Quote text={QUOTE.dt48} href={SOURCES.rdl31.url} label={lgss(L(locale, { es: "disposición transitoria 48ª.1.c", ca: "disposició transitòria 48a.1.c", en: "forty-eighth transitional provision, 1.c" }))} />

              <h2 id="divorcio">{hd.divorce}</h2>
              <ul>
                {divorceItems.map((i) => (
                  <li key={i}>{md(i)}</li>
                ))}
              </ul>
              <Quote text={QUOTE.art220comp} href={LGSS_ANCHOR.art220} label={lgss("art. 220.1")} />
              <Quote text={QUOTE.art220violence} href={LGSS_ANCHOR.art220} label={lgss("art. 220.1")} />
              <Quote text={QUOTE.art220_2} href={LGSS_ANCHOR.art220} label={lgss("art. 220.2")} />
              <Quote text={QUOTE.dt13} href={LGSS_ANCHOR.dt13} label={lgss(L(locale, { es: "disposición transitoria 13ª.1", ca: "disposició transitòria 13a.1", en: "thirteenth transitional provision, 1" }))} />
              <Quote text={QUOTE.dt13_2} href={LGSS_ANCHOR.dt13} label={lgss(L(locale, { es: "disposición transitoria 13ª.2 (Real Decreto-ley 31/2026)", ca: "disposició transitòria 13a.2 (Reial decret llei 31/2026)", en: "thirteenth transitional provision, 2 (Royal Decree-law 31/2026)" }))} />

              <h2 id="prestacion-temporal">{hd.temporal}</h2>
              <p>{md(temporalText)}</p>
              <Quote text={QUOTE.art222} href={LGSS_ANCHOR.art222} label={lgss("art. 222")} />
              <p className="text-sm">
                <A href={SOURCES.ssTemporal.url}>{`${ss}: ${L(locale, { es: "prestación temporal de viudedad", ca: "prestació temporal de viduïtat", en: "temporary widow's benefit" })}`}</A>
              </p>

              <h2 id="base-reguladora">{hd.base}</h2>
              <ul>
                {baseItems.map((i) => (
                  <li key={i}>{md(i)}</li>
                ))}
              </ul>
              <Quote text={`${QUOTE.ssBaseCommon}. ${QUOTE.ssBaseWindow}`} href={SOURCES.ssAmount.url} label={`${ss}, ${L(locale, { es: "base reguladora", ca: "base reguladora", en: "base reguladora" })}`} />
              <Quote text={QUOTE.ssBasePensioner} href={SOURCES.ssAmount.url} label={`${ss}, ${L(locale, { es: "base reguladora", ca: "base reguladora", en: "base reguladora" })}`} />
              <Quote text={QUOTE.ssPayments} href={SOURCES.ssAmount.url} label={`${ss}, ${L(locale, { es: "abono", ca: "pagament", en: "payment" })}`} />
              <Quote text={QUOTE.art229_3} href={LGSS_ANCHOR.art229} label={lgss("art. 229.3")} />

              <h2 id="compatibilidad">{hd.compat}</h2>
              <ul>
                {compatItems.map((i) => (
                  <li key={i}>{md(i)}</li>
                ))}
              </ul>
              <Quote text={QUOTE.art223work} href={LGSS_ANCHOR.art223} label={lgss("art. 223.1")} />
              <Quote text={QUOTE.ssCompatible} href={SOURCES.ssCompatibility.url} label={`${ss}, ${L(locale, { es: "compatibilidades", ca: "compatibilitats", en: "compatibility" })}`} />
              <Quote text={QUOTE.art223other} href={LGSS_ANCHOR.art223} label={lgss("art. 223.1")} />
              <Quote text={QUOTE.art223end} href={LGSS_ANCHOR.art223} label={lgss("art. 223.2")} />
              <Quote text={`${QUOTE.o11a} ${QUOTE.o11b} ${QUOTE.o11c}`} href={SOURCES.orden1967.url} label={orden} />
              <Quote text={QUOTE.art60} href={LGSS_ANCHOR.art60} label={lgss("art. 60.1")} />

              <h2 id="solicitud">{hd.apply}</h2>
              <ul>
                {applyItems.map((i) => (
                  <li key={i}>{md(i)}</li>
                ))}
              </ul>
              <ul>
                <li>
                  <A href={OFFICIAL_PROCEDURE.portal}>{procedureLinks.portal}</A>
                </li>
                <li>
                  <A href={OFFICIAL_PROCEDURE.form}>{procedureLinks.form}</A>
                </li>
                <li>
                  <A href={OFFICIAL_PROCEDURE.appointment}>{procedureLinks.appointment}</A>
                </li>
                <li>
                  <A href={OFFICIAL_PROCEDURE.howTo}>{procedureLinks.howTo}</A>
                </li>
              </ul>
              <Quote text={QUOTE.ssHowTo} href={OFFICIAL_PROCEDURE.howTo} label={`${ss}, ${L(locale, { es: "presentación de solicitudes", ca: "presentació de sol·licituds", en: "filing applications" })}`} />
              <Quote text={QUOTE.ssEffects} href={SOURCES.ssEffects.url} label={`${ss}, ${L(locale, { es: "efectos económicos", ca: "efectes econòmics", en: "when payment starts" })}`} />
              <Quote text={QUOTE.art230} href={LGSS_ANCHOR.art230} label={lgss("art. 230")} />
              <p>
                <Link href={PAY_DATES_PATH[locale]}>{links.pay}</Link>
              </p>
              <p>
                {L(locale, { es: "Los certificados, la herencia y los demás plazos:", ca: "Els certificats, l'herència i els altres terminis:", en: "The certificates, the estate and the other deadlines:" })}{" "}
                <Link href={b2href("deathSteps", locale)}>{B2_TITLES.deathSteps[locale]}</Link>
              </p>

              <h2 id="ejemplos">{hd.examples}</h2>
              {table(
                exCols,
                examples().map(({ id, result }) => [exampleLabel(id, locale), accessCell(result, locale), result.access.kind === "none" ? "—" : <strong key="p">{P(result.percent)}</strong>, amountCell(result, locale)]),
              )}
              <p className="text-sm">{exNote}</p>

              <h2 id="preguntas">{hd.faq}</h2>
              {faq.map((f) => (
                <section key={f.q}>
                  <h3>{f.q}</h3>
                  <p>{f.a}</p>
                </section>
              ))}

              <h2 id="fuentes">{hd.sources}</h2>
              <p>{sourcesLead}</p>
              <ul>
                {Object.values(SOURCES).map((src) => (
                  <li key={src.url}>
                    <A href={src.url}>{src.name}</A> ({src.publisher}, {src.ref}; {L(locale, { es: "leído", ca: "llegit", en: "read" })} {on(src.read)})
                  </li>
                ))}
              </ul>

              <h2 id="limites">{hd.limits}</h2>
              <ul>
                {limits.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
              <Quote text={QUOTE.rd241compensatory} href={SOURCES.rd241.url} label={rd241("art. 9.9")} />
              <ul>
                <li>
                  <Link href={calcPath("retirement-age", locale)}>{links.retire}</Link>
                </li>
                <li>
                  <Link href={pensionPath(locale)}>{links.pension}</Link>
                </li>
                <li>
                  <Link href={calcPath("non-contributory-pension", locale)}>{L(locale, { es: "Pensión no contributiva: requisitos y cuánto se cobra", ca: "Pensió no contributiva: requisits i quant es cobra", en: "Spain non-contributory pension: rules and amount" })}</Link>
                </li>
              </ul>
              <p className="text-sm text-[var(--color-muted)]">
                {disclaimer} <A href={SOURCES.ssWidow.url}>{procedureLink}</A>.
              </p>

              <MoreCalculators current="widow-pension" locale={locale} />
            </div>
            <ShareBar locale={locale} path={widowPath(locale)} title={meta.h1} contentType="widow_pension_calculator" variant="full" />
          </div>
        </article>
      </main>
      <JsonLd json={graph([breadcrumbSchema(crumbs), appSchema, faqSchema])} />
      <SiteFooter locale={locale} />
    </>
  );
}
