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
import { CAP_ROW_LABEL, CATEGORY_LABEL, SPECIAL_LABEL, bonoSocialEditions, bonoSocialPath, elDay, kwh, money, rate, type BsLocale } from "@/lib/programmatic/bono-social/copy";
import { SPECIAL_IDS, type BonoResult } from "@/lib/programmatic/bono-social/engine";
import { DEFAULT_INPUT, HOUSEHOLD_LABEL, bonoSocialFaq, bonoSocialMeta, examples, headline, incomeTable, type ExampleId } from "@/lib/programmatic/bono-social/page";
import {
  CAP_ROWS,
  DISCOUNT_2026,
  IPREM_14,
  IPREM_MONTHLY,
  KWH_CAP,
  KWH_CAP_MONTHLY,
  MAX_POWER_KW,
  NO_CUTOFF_UNTIL,
  PENSION_OTHER_INCOME_MAX,
  QUOTE,
  REFERENCE_SUPPLIERS,
  RULES_AS_OF,
  SEVERE_LARGE_FAMILY_MULTIPLIER,
  SEVERE_PENSION_MULTIPLIER,
  SOURCES,
} from "@/lib/programmatic/bono-social/rules";
import { butanePath } from "@/lib/programmatic/butane/paths";
import { hubCrumb } from "@/lib/programmatic/calculators/hub";
import { dayMonthYear } from "@/lib/programmatic/holidays/format";
import { pvpcPath } from "@/lib/programmatic/pvpc/paths";
import { absoluteUrl } from "@/lib/site";
import { ORGANIZATION_ID, breadcrumbSchema, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

import { BonoSocialCalculator } from "./BonoSocialCalculator";

/**
 * "Bono social eléctrico: ¿tienes derecho?" / "Bo social elèctric: tens
 * dret?" / "Spain's bono social for electricity": the eligibility checker of
 * RD 897/2017 arts. 3 and 4 (server-rendered on two adults, two minors and
 * 20,000 € a year), then the 2026 and permanent discounts with why other
 * pages disagree, the income limit of each household, who qualifies, which
 * income counts, severe and at-risk consumers, the kWh with the discount, the
 * PVPC and the reference suppliers, how to apply, cut-offs, worked examples,
 * the thermal bono, questions, sources and limits. Every figure comes from
 * rules.ts through the engine.
 */

const L = <T,>(locale: BsLocale, v: Record<BsLocale, T>): T => v[locale];

export function bonoSocialCrumbs(locale: BsLocale): Crumb[] {
  return [{ label: getMessages(locale).common.home, href: `/${locale}/` }, hubCrumb(locale), { label: bonoSocialMeta(locale).breadcrumb, href: bonoSocialPath(locale) }];
}

export function bonoSocialMetadata(locale: BsLocale): Metadata {
  const m = bonoSocialMeta(locale);
  return buildMetadata({ locale, path: bonoSocialPath(locale), title: m.title, description: m.description, translations: bonoSocialEditions() });
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

type OkResult = Extract<BonoResult, { status: "ok" }>;

function exampleLabel(id: ExampleId, income: string, locale: BsLocale): string {
  const labels: Record<ExampleId, Record<BsLocale, string>> = {
    alone: { es: `Una persona sola, ${income} al año`, ca: `Una persona sola, ${income} l'any`, en: `One person alone, ${income} a year` },
    family: { es: `Dos adultos y dos menores, ${income} al año`, ca: `Dos adults i dos menors, ${income} l'any`, en: `Two adults and two minors, ${income} a year` },
    "family-low": { es: `Dos adultos y dos menores, ${income} al año`, ca: `Dos adults i dos menors, ${income} l'any`, en: `Two adults and two minors, ${income} a year` },
    "single-parent": { es: `Madre o padre solo con un hijo menor, ${income} al año`, ca: `Mare o pare sol amb un fill menor, ${income} l'any`, en: `Single parent with one child, ${income} a year` },
    "large-family": { es: `Familia numerosa (dos adultos, tres menores), ${income} al año`, ca: `Família nombrosa (dos adults, tres menors), ${income} l'any`, en: `Large family (two adults, three minors), ${income} a year` },
    pensioner: { es: `Pensionista solo con la pensión mínima, ${income} al año`, ca: `Pensionista sol amb la pensió mínima, ${income} l'any`, en: `Pensioner alone on the minimum pension, ${income} a year` },
    "couple-over": { es: `Dos adultos, ${income} al año`, ca: `Dos adults, ${income} l'any`, en: `Two adults, ${income} a year` },
    "free-market": { es: `Una persona sola, ${income} al año, con una oferta del mercado libre`, ca: `Una persona sola, ${income} l'any, amb una oferta del mercat lliure`, en: `One person alone, ${income} a year, on a free-market offer` },
  };
  return labels[id][locale];
}

function exampleOutcome(r: OkResult, locale: BsLocale): string {
  const label = CATEGORY_LABEL[r.category][locale];
  if (!r.needsPvpc) return label;
  return `${label} ${L(locale, { es: "(al pasar al PVPC)", ca: "(en passar al PVPC)", en: "(once on the PVPC)" })}`;
}

export function BonoSocialRoute({ locale }: { locale: BsLocale }) {
  const meta = bonoSocialMeta(locale);
  const crumbs = bonoSocialCrumbs(locale);
  const h = headline();
  const M = (n: number) => money(n, locale);
  const R = (r: number) => rate(r, locale);
  const on = (iso: string) => elDay(iso, locale);
  const dmy = (iso: string) => dayMonthYear(iso, locale);
  const faq = bonoSocialFaq(locale);
  const end = dmy(DISCOUNT_2026.until);

  const lead = L(locale, {
    es: `El bono social eléctrico descuenta en 2026 el ${R(h.v2026)} de la factura de la luz a los consumidores vulnerables y el ${R(h.s2026)} a los vulnerables severos, hasta el ${end}; desde el 1 de enero de 2027, si no se prorroga, vuelve al ${R(h.vPerm)} y al ${R(h.sPerm)}. Solo se aplica con la tarifa regulada (PVPC) contratada con una comercializadora de referencia. Una persona sola tiene derecho con ingresos de hasta ${M(h.alone.vulnerable)} al año; cada adulto más suma ${M(h.perAdult)} y cada menor ${M(h.perMinor)}. La familia numerosa, la pensión mínima y el ingreso mínimo vital también dan derecho.`,
    ca: `El bo social elèctric descompta el 2026 el ${R(h.v2026)} de la factura de la llum als consumidors vulnerables i el ${R(h.s2026)} als vulnerables severs, fins al ${end}; des de l'1 de gener de 2027, si no es prorroga, torna al ${R(h.vPerm)} i al ${R(h.sPerm)}. Només s'aplica amb la tarifa regulada (PVPC) contractada amb una comercialitzadora de referència. Una persona sola hi té dret amb ingressos de fins a ${M(h.alone.vulnerable)} l'any; cada adult més hi suma ${M(h.perAdult)} i cada menor ${M(h.perMinor)}. La família nombrosa, la pensió mínima i l'ingrés mínim vital també hi donen dret.`,
    en: `In 2026 Spain's bono social takes ${R(h.v2026)} off the electricity bill of vulnerable consumers and ${R(h.s2026)} off that of severely vulnerable ones, until ${end}; from 1 January 2027, unless extended, it goes back to ${R(h.vPerm)} and ${R(h.sPerm)}. It only applies on the regulated tariff (PVPC) with a reference supplier. One person alone qualifies with an income of up to ${M(h.alone.vulnerable)} a year; each further adult adds ${M(h.perAdult)} and each minor ${M(h.perMinor)}. A large-family title, the minimum pension and the minimum living income (IMV) also qualify.`,
  });
  const fresh = L(locale, {
    es: `Normas revisadas ${on(RULES_AS_OF)} en el BOE (Real Decreto 897/2017, Real Decreto-ley 7/2026, Orden ETU/943/2017 e IPREM de la Ley 31/2022) y en el Ministerio para la Transición Ecológica (bonosocial.gob.es).`,
    ca: `Normes revisades ${on(RULES_AS_OF)} al BOE (Reial decret 897/2017, Reial decret llei 7/2026, Ordre ETU/943/2017 i IPREM de la Llei 31/2022) i al Ministeri per a la Transició Ecològica (bonosocial.gob.es).`,
    en: `Rules checked ${on(RULES_AS_OF)} in the BOE (Royal Decree 897/2017, Royal Decree-law 7/2026, Orden ETU/943/2017 and the IPREM of Law 31/2022) and with the Ministry for the Ecological Transition (bonosocial.gob.es).`,
  });
  const disclaimer = L(locale, {
    es: "Cálculo orientativo con las normas estatales. Quien decide es la comercializadora de referencia, que comprueba tus datos en la aplicación del Ministerio para la Transición Ecológica, con la información de Hacienda y de otras administraciones. Si te lo deniega, tiene que decirte por qué, y puedes reclamar ante los servicios de consumo de tu comunidad.",
    ca: "Càlcul orientatiu amb les normes estatals. Qui decideix és la comercialitzadora de referència, que comprova les teves dades a l'aplicació del Ministeri per a la Transició Ecològica, amb la informació d'Hisenda i d'altres administracions. Si te'l denega, t'ha de dir per què, i pots reclamar davant els serveis de consum de la teva comunitat.",
    en: "An estimate under the national rules. The decision is the reference supplier's: it checks your data in the Ministry for the Ecological Transition's system, with information from the tax office and other public bodies. If it refuses, it must tell you why, and you can complain to your region's consumer services.",
  });
  const mitecoLink = L(locale, { es: "Requisitos del bono social (Ministerio para la Transición Ecológica)", ca: "Requisits del bo social (Ministeri per a la Transició Ecològica, en castellà)", en: "Bono social requirements (Ministry for the Ecological Transition, in Spanish)" });

  const hd = L(locale, {
    es: { discount: "Descuento del bono social en 2026 y desde 2027", why: "Por qué ves porcentajes distintos", table: "Límite de ingresos de cada hogar", who: "Quién tiene derecho", income: "Qué ingresos cuentan", severe: "Vulnerable severo y riesgo de exclusión social", cap: "Cuántos kWh tienen descuento", pvpc: "PVPC y comercializadora de referencia", apply: "Cómo pedirlo: documentos y plazos", cutoff: "¿Te pueden cortar la luz?", examples: "Ejemplos", thermal: "Bono social térmico", faq: "Preguntas frecuentes", sources: "Fuentes oficiales", limits: "Qué no calcula" },
    ca: { discount: "Descompte del bo social el 2026 i des del 2027", why: "Per què veus percentatges diferents", table: "Límit d'ingressos de cada llar", who: "Qui hi té dret", income: "Quins ingressos compten", severe: "Vulnerable sever i risc d'exclusió social", cap: "Quants kWh tenen descompte", pvpc: "PVPC i comercialitzadora de referència", apply: "Com demanar-lo: documents i terminis", cutoff: "Et poden tallar la llum?", examples: "Exemples", thermal: "Bo social tèrmic", faq: "Preguntes freqüents", sources: "Fonts oficials", limits: "Què no calcula" },
    en: { discount: "The bono social discount in 2026 and from 2027", why: "Why you see different percentages", table: "Income limit for each household", who: "Who qualifies", income: "Which income counts", severe: "Severely vulnerable and at risk of social exclusion", cap: "How many kWh get the discount", pvpc: "The PVPC and reference suppliers", apply: "How to apply: documents and deadlines", cutoff: "Can your electricity be cut off?", examples: "Worked examples", thermal: "Bono social térmico (heating)", faq: "Questions", sources: "Official sources", limits: "What it does not cover" },
  });

  /* Discounts ------------------------------------------------------------- */
  const discountCols = L(locale, {
    es: ["Consumidor", `Hasta el ${end}`, "Desde el 1 de enero de 2027, si no se prorroga"],
    ca: ["Consumidor", `Fins al ${end}`, "Des de l'1 de gener de 2027, si no es prorroga"],
    en: ["Consumer", `Until ${end}`, "From 1 January 2027, unless extended"],
  });
  const noBill = L(locale, { es: "No paga la factura", ca: "No paga la factura", en: "Pays nothing" });
  const discountRows: [string, string, string][] = [
    [CATEGORY_LABEL.vulnerable[locale], R(h.v2026), R(h.vPerm)],
    [CATEGORY_LABEL.severe[locale], R(h.s2026), R(h.sPerm)],
    [CATEGORY_LABEL.exclusion[locale], noBill, noBill],
  ];
  const discountNote = L(locale, {
    es: `**El descuento de 2026 acaba el ${end}.** Es excepcional (Real Decreto-ley 7/2026). Si antes de esa fecha el BOE publica una prórroga, actualizaremos esta página; si no, desde el 1 de enero de 2027 vuelve la regla fija del Real Decreto 897/2017: ${R(h.vPerm)} y ${R(h.sPerm)}. Ese mismo día acaba la prohibición de cortar la luz a los consumidores vulnerables. El descuento se aplica al término de potencia entero y al de energía hasta el límite de kWh de tu hogar. Para quien está en riesgo de exclusión social, los servicios sociales pagan al menos la mitad de la factura y las eléctricas el resto.`,
    ca: `**El descompte del 2026 acaba el ${end}.** És excepcional (Reial decret llei 7/2026). Si abans d'aquesta data el BOE publica una pròrroga, actualitzarem aquesta pàgina; si no, des de l'1 de gener de 2027 torna la regla fixa del Reial decret 897/2017: ${R(h.vPerm)} i ${R(h.sPerm)}. Aquell mateix dia acaba la prohibició de tallar la llum als consumidors vulnerables. El descompte s'aplica al terme de potència sencer i al d'energia fins al límit de kWh de la teva llar. Per a qui és en risc d'exclusió social, els serveis socials paguen almenys la meitat de la factura i les elèctriques la resta.`,
    en: `**The 2026 discount ends on ${end}.** It is exceptional (Royal Decree-law 7/2026). If the BOE publishes an extension before then, we will update this page; if not, from 1 January 2027 the permanent rule of Royal Decree 897/2017 returns: ${R(h.vPerm)} and ${R(h.sPerm)}. The ban on cutting off vulnerable consumers ends the same day. The discount covers the whole power term and the energy term up to your household's kWh limit. For consumers at risk of social exclusion, social services pay at least half of the bill and the electricity companies the rest.`,
  });
  const whyText = L(locale, {
    es: `El ${R(h.vPerm)} y el ${R(h.sPerm)} son la regla fija del Real Decreto 897/2017, y es lo que todavía muestra su texto consolidado en el BOE. El ${R(h.v2026)} y el ${R(h.s2026)} para 2026 los fijó primero el Real Decreto-ley 16/2025, que el Congreso derogó el 27 de enero de 2026; después el Real Decreto-ley 2/2026, derogado el 26 de febrero; y por último el Real Decreto-ley 7/2026, convalidado el 26 de marzo, que es el que está en vigor: obliga a las comercializadoras de referencia a aplicar en la siguiente factura la diferencia de los días desde el 26 de febrero.`,
    ca: `El ${R(h.vPerm)} i el ${R(h.sPerm)} són la regla fixa del Reial decret 897/2017, i és el que encara mostra el seu text consolidat al BOE. El ${R(h.v2026)} i el ${R(h.s2026)} per al 2026 els va fixar primer el Reial decret llei 16/2025, que el Congrés va derogar el 27 de gener de 2026; després el Reial decret llei 2/2026, derogat el 26 de febrer; i finalment el Reial decret llei 7/2026, convalidat el 26 de març, que és el que és vigent: obliga les comercialitzadores de referència a aplicar a la factura següent la diferència dels dies des del 26 de febrer.`,
    en: `${R(h.vPerm)} and ${R(h.sPerm)} are the permanent rule of Royal Decree 897/2017, and that is what its consolidated text in the BOE still shows. The ${R(h.v2026)} and ${R(h.s2026)} for 2026 were set first by Royal Decree-law 16/2025, which Congress repealed on 27 January 2026; then by Royal Decree-law 2/2026, repealed on 26 February; and finally by Royal Decree-law 7/2026, validated on 26 March, which is the one in force: it makes the reference suppliers apply the difference for the days since 26 February on the next bill.`,
  });

  /* Income table ---------------------------------------------------------- */
  const tableCols = L(locale, {
    es: ["Hogar", "Vulnerable hasta", "Severo hasta", "Con circunstancia especial: vulnerable hasta", "Con circunstancia especial: severo hasta", "kWh al año con descuento"],
    ca: ["Llar", "Vulnerable fins a", "Sever fins a", "Amb circumstància especial: vulnerable fins a", "Amb circumstància especial: sever fins a", "kWh l'any amb descompte"],
    en: ["Household", "Vulnerable up to", "Severe up to", "With a special circumstance: vulnerable up to", "With a special circumstance: severe up to", "kWh a year with the discount"],
  });
  const tableCaption = L(locale, {
    es: `Ingresos anuales de todo el hogar, en euros. IPREM de 14 pagas: ${M(IPREM_14)} (${M(IPREM_MONTHLY)} al mes, Ley 31/2022, prorrogada en 2026). Leído ${on(RULES_AS_OF)}.`,
    ca: `Ingressos anuals de tota la llar, en euros. IPREM de 14 pagues: ${M(IPREM_14)} (${M(IPREM_MONTHLY)} al mes, Llei 31/2022, prorrogada el 2026). Llegit ${on(RULES_AS_OF)}.`,
    en: `Yearly income of the whole household, in euros. 14-payment IPREM: ${M(IPREM_14)} (${M(IPREM_MONTHLY)} a month, Law 31/2022, still applied in 2026). Read ${on(RULES_AS_OF)}.`,
  });
  const tableNotes = L(locale, {
    es: [
      `Si eres **madre o padre solo con hijos menores**, la familia monoparental es una circunstancia especial: mira las columnas de la derecha.`,
      `Con **título de familia numerosa** tienes derecho cobres lo que cobres, y eres vulnerable severo con ingresos de hasta ${M(SEVERE_LARGE_FAMILY_MULTIPLIER * IPREM_14)} (o la mitad del límite de tu hogar, si es más).`,
      `Si **todos los que tienen ingresos cobran la pensión mínima** de jubilación o de incapacidad permanente y no tienen más de ${M(PENSION_OTHER_INCOME_MAX)} al año de otros ingresos, tienes derecho, y eres vulnerable severo con ingresos de hasta ${M(SEVERE_PENSION_MULTIPLIER * IPREM_14)}.`,
      "Si alguien del hogar cobra el **ingreso mínimo vital**, tienes derecho; para ser vulnerable severo cuenta el límite general de la tabla.",
    ],
    ca: [
      `Si ets **mare o pare sol amb fills menors**, la família monoparental és una circumstància especial: mira les columnes de la dreta.`,
      `Amb **títol de família nombrosa** hi tens dret cobris el que cobris, i ets vulnerable sever amb ingressos de fins a ${M(SEVERE_LARGE_FAMILY_MULTIPLIER * IPREM_14)} (o la meitat del límit de la teva llar, si és més).`,
      `Si **tots els qui tenen ingressos cobren la pensió mínima** de jubilació o d'incapacitat permanent i no tenen més de ${M(PENSION_OTHER_INCOME_MAX)} l'any d'altres ingressos, hi tens dret, i ets vulnerable sever amb ingressos de fins a ${M(SEVERE_PENSION_MULTIPLIER * IPREM_14)}.`,
      "Si algú de la llar cobra l'**ingrés mínim vital**, hi tens dret; per ser vulnerable sever compta el límit general de la taula.",
    ],
    en: [
      `If you are a **single parent with children under 18**, that is a special circumstance: use the columns on the right.`,
      `With a **large-family title** you qualify whatever your income, and you are severely vulnerable with an income of up to ${M(SEVERE_LARGE_FAMILY_MULTIPLIER * IPREM_14)} (or half your household's limit, if higher).`,
      `If **everyone with income gets the minimum** retirement or permanent incapacity pension and has no more than ${M(PENSION_OTHER_INCOME_MAX)} a year of other income, you qualify, and you are severely vulnerable with an income of up to ${M(SEVERE_PENSION_MULTIPLIER * IPREM_14)}.`,
      "If someone in the household gets the **minimum living income (IMV)**, you qualify; for severely vulnerable, the table's general limit applies.",
    ],
  });

  /* Who qualifies --------------------------------------------------------- */
  const whoItems = L(locale, {
    es: [
      `**Tener el PVPC** (la tarifa regulada de la luz), que solo vende una comercializadora de referencia.`,
      `Ser **persona física y titular del contrato** de la luz de tu **vivienda habitual**, con una potencia contratada de **${MAX_POWER_KW} kW o menos**.`,
      "Cumplir **uno** de estos requisitos: ingresos del hogar por debajo del límite de la tabla; título de familia numerosa; que todos los que tienen ingresos sean pensionistas de la Seguridad Social con la pensión mínima de jubilación o incapacidad permanente; o que alguien del hogar cobre el ingreso mínimo vital.",
    ],
    ca: [
      `**Tenir el PVPC** (la tarifa regulada de la llum), que només ven una comercialitzadora de referència.`,
      `Ser **persona física i titular del contracte** de la llum del teu **habitatge habitual**, amb una potència contractada de **${MAX_POWER_KW} kW o menys**.`,
      "Complir **un** d'aquests requisits: ingressos de la llar per sota del límit de la taula; títol de família nombrosa; que tots els qui tenen ingressos siguin pensionistes de la Seguretat Social amb la pensió mínima de jubilació o d'incapacitat permanent; o que algú de la llar cobri l'ingrés mínim vital.",
    ],
    en: [
      `**Be on the PVPC** (the regulated electricity tariff), which only a reference supplier sells.`,
      `Be a **private individual holding the electricity contract** for your **main home**, with contracted power of **${MAX_POWER_KW} kW or less**.`,
      "Meet **one** of these: household income under the table's limit; a large-family title; everyone with income being a Social Security pensioner on the minimum retirement or permanent incapacity pension; or someone in the household getting the minimum living income (IMV).",
    ],
  });
  const householdText = L(locale, {
    es: "Tu hogar, para el bono social, es la «unidad de convivencia»: quienes viven contigo y son tu cónyuge o pareja de hecho, familiares hasta el segundo grado (por sangre, matrimonio o adopción) o menores en guarda o acogimiento. Las demás personas empadronadas en tu casa no cuentan. Las circunstancias especiales suman 8.400 € a tu límite, una sola vez aunque se den varias:",
    ca: "La teva llar, per al bo social, és la «unitat de convivència»: els qui viuen amb tu i són el teu cònjuge o parella de fet, familiars fins al segon grau (per sang, matrimoni o adopció) o menors en guarda o acolliment. La resta de persones empadronades a casa teva no compten. Les circumstàncies especials sumen 8.400 € al teu límit, una sola vegada encara que se'n donin diverses:",
    en: "For the bono social your household is the «unidad de convivencia»: those living with you who are your spouse or registered partner, relatives up to the second degree (by blood, marriage or adoption), or minors in your care or foster care. Other people registered at your address do not count. Special circumstances add €8,400 to your limit, once even if several apply:",
  });
  const electroNote = L(locale, {
    es: "La electrodependencia se acredita con el certificado que establezca la normativa sanitaria. Las cuatro primeras circunstancias las certifican los servicios sociales de tu comunidad; la familia monoparental, el libro de familia y el padrón.",
    ca: "L'electrodependència s'acredita amb el certificat que estableixi la normativa sanitària. Les quatre primeres circumstàncies les certifiquen els serveis socials de la teva comunitat; la família monoparental, el llibre de família i el padró.",
    en: "Electrodependency is proven with the certificate the health rules set. Social services in your region certify the first four circumstances; a single-parent household is shown with the family book (libro de familia) and the municipal register (padrón).",
  });

  /* Income counted -------------------------------------------------------- */
  const incomeText = L(locale, {
    es: "No es el sueldo bruto: cuenta la **base imponible general más la del ahorro** de la última declaración de la renta que tenga Hacienda cuando lo pides, sumadas las de todo el hogar. Quien no tenía que declarar entra con los datos que tiene Hacienda (rendimientos del trabajo, del capital y de actividades, y ganancias patrimoniales). Si alguien tenía que declarar y no lo hizo, la comercializadora rechaza la solicitud. En el País Vasco y Navarra los datos los dan sus haciendas forales.",
    ca: "No és el sou brut: compta la **base imposable general més la de l'estalvi** de l'última declaració de la renda que tingui Hisenda quan el demanes, sumades les de tota la llar. Qui no havia de declarar hi entra amb les dades que té Hisenda (rendiments del treball, del capital i d'activitats, i guanys patrimonials). Si algú havia de declarar i no ho va fer, la comercialitzadora rebutja la sol·licitud. Al País Basc i a Navarra les dades les donen les seves hisendes forals.",
    en: "It is not gross pay: what counts is the **general taxable base plus the savings taxable base** of the last income tax return the tax office has when you apply, added up for the whole household. Anyone who did not have to file counts with the tax office's own data (earnings from work, capital and business, and capital gains). If someone had to file and did not, the supplier refuses the application. In the Basque Country and Navarre the data come from their own (foral) tax offices.",
  });

  /* Severe and exclusion -------------------------------------------------- */
  const severeText = L(locale, {
    es: `Eres **vulnerable severo** (${R(h.s2026)} en 2026) si los ingresos del hogar no pasan de la mitad de tu límite: ${M(h.alone.severe)} para una persona sola, ${M(h.family.severe)} para dos adultos y dos menores. Estás **en riesgo de exclusión social** si, además, los servicios sociales de tu comunidad o ayuntamiento te pagan al menos la mitad de la factura: entonces no pagas nada y tu suministro es esencial.`,
    ca: `Ets **vulnerable sever** (${R(h.s2026)} el 2026) si els ingressos de la llar no passen de la meitat del teu límit: ${M(h.alone.severe)} per a una persona sola, ${M(h.family.severe)} per a dos adults i dos menors. Ets **en risc d'exclusió social** si, a més, els serveis socials de la teva comunitat o ajuntament et paguen almenys la meitat de la factura: llavors no pagues res i el teu subministrament és essencial.`,
    en: `You are **severely vulnerable** (${R(h.s2026)} in 2026) if household income is no more than half your limit: ${M(h.alone.severe)} for one person alone, ${M(h.family.severe)} for two adults and two minors. You are **at risk of social exclusion** if, on top of that, your region's or town council's social services pay at least half of the bill: then you pay nothing and your supply is essential.`,
  });

  /* kWh cap --------------------------------------------------------------- */
  const capCols = L(locale, {
    es: ["Hogar", "kWh al año", "kWh al mes (MITECO)"],
    ca: ["Llar", "kWh l'any", "kWh al mes (MITECO)"],
    en: ["Household", "kWh a year", "kWh a month (MITECO)"],
  });
  const capText = L(locale, {
    es: "El descuento sobre la energía tiene un tope anual según el hogar; la comercializadora lo reparte por los días de cada factura y suma la energía con descuento que no gastaste en los doce meses anteriores. Lo que pase del tope se paga a PVPC sin descuento. Si encajas en más de una fila, vale la más favorable.",
    ca: "El descompte sobre l'energia té un límit anual segons la llar; la comercialitzadora el reparteix pels dies de cada factura i hi suma l'energia amb descompte que no vas gastar els dotze mesos anteriors. El que passi del límit es paga a PVPC sense descompte. Si encaixes en més d'una fila, val la més favorable.",
    en: "The discount on energy has a yearly cap by household; the supplier spreads it over the days of each bill and adds the discounted energy you did not use in the previous twelve months. Anything above the cap is billed at the PVPC with no discount. If you fit more than one row, the most favourable applies.",
  });

  /* PVPC and reference suppliers ------------------------------------------ */
  const pvpcText = L(locale, {
    es: "El bono social es un descuento sobre el PVPC y solo lo aplica una **comercializadora de referencia**: con una oferta del mercado libre no hay bono social. Si estás en el mercado libre, pídelo a una comercializadora de referencia: la solicitud incluye el cambio al PVPC, que es gratis si mantienes la potencia. El PVPC es solo de luz: un contrato que junte luz y gas no vale. Las comercializadoras de referencia, con el teléfono que publica el Ministerio:",
    ca: "El bo social és un descompte sobre el PVPC i només l'aplica una **comercialitzadora de referència**: amb una oferta del mercat lliure no hi ha bo social. Si ets al mercat lliure, demana'l a una comercialitzadora de referència: la sol·licitud inclou el canvi al PVPC, que és gratuït si mantens la potència. El PVPC és només de llum: un contracte que ajunti llum i gas no val. Les comercialitzadores de referència, amb el telèfon que publica el Ministeri:",
    en: "The bono social is a discount on the PVPC, and only a **reference supplier** (comercializadora de referencia) applies it: a free-market offer has no bono social. If you are on the free market, apply to a reference supplier: the application includes the switch to the PVPC, free of charge if you keep the same power. The PVPC is electricity only: a contract bundling electricity and gas does not qualify. The reference suppliers, with the phone numbers the Ministry publishes:",
  });
  const onlyIn = (t: "Ceuta" | "Melilla") => L(locale, { es: `solo en ${t}`, ca: `només a ${t}`, en: `${t} only` });

  /* How to apply ---------------------------------------------------------- */
  const applySteps = L(locale, {
    es: [
      "Elige una comercializadora de referencia y descarga su **formulario de solicitud** del bono social (está en su web y en sus oficinas). Puedes enviarlo por teléfono, en su web, por correo electrónico o postal, o en una oficina.",
      "Junta los **documentos**: NIF o NIE del titular y de todo el hogar; certificado de empadronamiento en vigor en la dirección del contrato; libro de familia o certificados del Registro Civil (y, si toca, el de pareja de hecho o el de acogimiento); el título de familia numerosa en vigor, si lo tienes.",
      "Para una **circunstancia especial** (discapacidad, violencia de género, terrorismo, dependencia), pide el certificado a los servicios sociales de tu comunidad: no lleves esos documentos a la comercializadora. Todos los mayores de 14 años del hogar firman el consentimiento para que se comprueben los datos.",
      "La comercializadora tiene **10 días hábiles** para responder desde que tiene la solicitud completa. El descuento cuenta **desde el primer día del ciclo de facturación** en que la entregaste.",
      "Dura **dos años** y se renueva sola si sigues cumpliendo; con familia numerosa, lo que dure el título, y al renovarlo hay que volver a pedirlo. Si cambia tu situación, avisa en el plazo de un mes.",
    ],
    ca: [
      "Tria una comercialitzadora de referència i descarrega el seu **formulari de sol·licitud** del bo social (és al web i a les oficines). El pots enviar per telèfon, al web, per correu electrònic o postal, o en una oficina.",
      "Reuneix els **documents**: NIF o NIE del titular i de tota la llar; certificat d'empadronament vigent a l'adreça del contracte; llibre de família o certificats del Registre Civil (i, si cal, el de parella de fet o el d'acolliment); el títol de família nombrosa vigent, si en tens.",
      "Per a una **circumstància especial** (discapacitat, violència de gènere, terrorisme, dependència), demana el certificat als serveis socials de la teva comunitat: no portis aquests documents a la comercialitzadora. Tots els majors de 14 anys de la llar signen el consentiment perquè es comprovin les dades.",
      "La comercialitzadora té **10 dies hàbils** per respondre des que té la sol·licitud completa. El descompte compta **des del primer dia del cicle de facturació** en què la vas lliurar.",
      "Dura **dos anys** i es renova sol si continues complint; amb família nombrosa, el que duri el títol, i quan el renoves s'ha de tornar a demanar. Si canvia la teva situació, avisa en el termini d'un mes.",
    ],
    en: [
      "Pick a reference supplier and get its bono social **application form** (on its website and at its offices). You can send it by phone, online, by email or post, or at an office.",
      "Gather the **documents**: NIF or NIE of the holder and of the whole household; a current municipal registration certificate (empadronamiento) at the contract's address; the family book or Civil Registry certificates (and, where relevant, the registered-partnership or foster-care one); the valid large-family title, if you have one.",
      "For a **special circumstance** (disability, gender violence, terrorism, dependency), ask your region's social services for the certificate: do not take those documents to the supplier. Everyone in the household over 14 signs the consent for the data to be checked.",
      "The supplier has **10 working days** to answer once it has the complete application. The discount counts **from the first day of the billing cycle** in which you handed it in.",
      "It lasts **two years** and renews itself while you still qualify; for large families, as long as the title, and you apply again when you renew the title. If your situation changes, tell the supplier within a month.",
    ],
  });

  /* Cut-offs ---------------------------------------------------------------- */
  const cutoffText = L(locale, {
    es: `Hasta el ${dmy(NO_CUTOFF_UNTIL)} no se puede cortar la luz, el gas natural ni el agua a los consumidores vulnerables, vulnerables severos o en riesgo de exclusión social: el Real Decreto-ley 7/2026 prorroga para todo 2026 la garantía del Real Decreto-ley 8/2021. Para el gas y el agua basta enseñar la última factura de la luz con el bono social.`,
    ca: `Fins al ${dmy(NO_CUTOFF_UNTIL)} no es pot tallar la llum, el gas natural ni l'aigua als consumidors vulnerables, vulnerables severs o en risc d'exclusió social: el Reial decret llei 7/2026 prorroga per a tot el 2026 la garantia del Reial decret llei 8/2021. Per al gas i l'aigua n'hi ha prou d'ensenyar l'última factura de la llum amb el bo social.`,
    en: `Until ${dmy(NO_CUTOFF_UNTIL)} electricity, natural gas and water cannot be cut off for vulnerable, severely vulnerable or at-risk consumers: Royal Decree-law 7/2026 extends the guarantee of Royal Decree-law 8/2021 for the whole of 2026. For gas and water, the last electricity bill showing the bono social is enough proof.`,
  });

  /* Examples -------------------------------------------------------------- */
  const exCols = L(locale, {
    es: ["Caso", "Resultado", `Descuento hasta el ${end}`, "Límite de ingresos del hogar", "kWh al año con descuento"],
    ca: ["Cas", "Resultat", `Descompte fins al ${end}`, "Límit d'ingressos de la llar", "kWh l'any amb descompte"],
    en: ["Case", "Result", `Discount until ${end}`, "Household income limit", "kWh a year with the discount"],
  });

  /* Thermal bono and links ------------------------------------------------ */
  const thermalText = L(locale, {
    es: "Si tienes el bono social eléctrico a 31 de diciembre, al año siguiente recibes también el **bono social térmico**, una ayuda para la calefacción, el agua caliente o la cocina (también con butano) que pagan las comunidades autónomas: no hay que pedirlo.",
    ca: "Si tens el bo social elèctric a 31 de desembre, l'any següent reps també el **bo social tèrmic**, una ajuda per a la calefacció, l'aigua calenta o la cuina (també amb butà) que paguen les comunitats autònomes: no cal demanar-lo.",
    en: "If you have the electricity bono social on 31 December, the next year you also get the **bono social térmico**, help with heating, hot water or cooking (butane included) paid by the regions: you do not have to apply.",
  });
  const links = L(locale, {
    es: { pvpc: "Precio de la luz hoy por horas (PVPC)", butane: "Precio de la bombona de butano hoy y bono social térmico" },
    ca: { pvpc: "Preu de la llum avui per hores (PVPC)", butane: "Preu de la bombona de butà avui i bo social tèrmic" },
    en: { pvpc: "Electricity price today, hour by hour (PVPC)", butane: "Butane bottle price today and the bono social térmico" },
  });

  /* Sources and limits ---------------------------------------------------- */
  const sourcesLead = L(locale, {
    es: `Todo leído ${on(RULES_AS_OF)}; las citas son literales, en castellano. El texto consolidado del Real Decreto 897/2017 en el BOE no recoge aún el Real Decreto-ley 7/2026: el descuento de 2026 sale de este último. Las páginas del Ministerio en catalán e inglés están en castellano.`,
    ca: `Tot llegit ${on(RULES_AS_OF)}; les cites són literals, en castellà. El text consolidat del Reial decret 897/2017 al BOE encara no recull el Reial decret llei 7/2026: el descompte del 2026 surt d'aquest últim. Les pàgines del Ministeri en català i anglès són en castellà.`,
    en: `All read ${on(RULES_AS_OF)}; quotes are verbatim, in Spanish. The BOE's consolidated text of Royal Decree 897/2017 does not yet carry Royal Decree-law 7/2026: the 2026 discount comes from the latter. The Ministry's Catalan and English pages are in Spanish.`,
  });
  const limits = L(locale, {
    es: [
      "Cuántos euros ahorras: depende del precio del PVPC de cada hora y de lo que gastes.",
      "El tope exacto de kWh de cada factura: la comercializadora lo reparte por días y suma lo no gastado de los doce meses anteriores.",
      "Los impuestos de la factura (impuesto especial sobre la electricidad e IVA).",
      "La cuantía del bono social térmico, que depende de la zona climática y del presupuesto de cada año y paga cada comunidad autónoma.",
      "La comprobación de tus datos y documentos: la hace la comercializadora de referencia con la aplicación del Ministerio.",
    ],
    ca: [
      "Quants euros estalvies: depèn del preu del PVPC de cada hora i del que gastis.",
      "El límit exacte de kWh de cada factura: la comercialitzadora el reparteix per dies i hi suma el que no es va gastar els dotze mesos anteriors.",
      "Els impostos de la factura (impost especial sobre l'electricitat i IVA).",
      "L'import del bo social tèrmic, que depèn de la zona climàtica i del pressupost de cada any i paga cada comunitat autònoma.",
      "La comprovació de les teves dades i documents: la fa la comercialitzadora de referència amb l'aplicació del Ministeri.",
    ],
    en: [
      "How many euros you save: that depends on each hour's PVPC price and on what you use.",
      "The exact kWh cap of each bill: the supplier spreads it by days and adds what was not used in the previous twelve months.",
      "The taxes on the bill (electricity tax and VAT).",
      "The amount of the bono social térmico, which depends on the climate zone and each year's budget and is paid by each region.",
      "Checking your data and documents: the reference supplier does that through the Ministry's system.",
    ],
  });

  const rd = (art: string) => L(locale, { es: `Real Decreto 897/2017, ${art}`, ca: `Reial decret 897/2017, ${art}`, en: `Royal Decree 897/2017, ${art}` });
  const rdl7 = (art: string) => L(locale, { es: `Real Decreto-ley 7/2026, ${art}`, ca: `Reial decret llei 7/2026, ${art}`, en: `Royal Decree-law 7/2026, ${art}` });
  const miteco = L(locale, { es: "Ministerio para la Transición Ecológica, preguntas frecuentes", ca: "Ministeri per a la Transició Ecològica, preguntes freqüents", en: "Ministry for the Ecological Transition, FAQ" });

  const appSchema = {
    "@type": "WebApplication",
    name: meta.appName,
    url: absoluteUrl(bonoSocialPath(locale)),
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
      <SiteHeader locale={locale} translations={bonoSocialEditions()} />
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
              <BonoSocialCalculator locale={locale} initial={DEFAULT_INPUT} />
              <p className="text-sm text-[var(--color-muted)]">
                {disclaimer} <A href={SOURCES.mitecoRequisitos.url}>{mitecoLink}</A>.
              </p>
              <CalculatorNextStep current="bono-social" locale={locale} />

              <h2 id="descuento">{hd.discount}</h2>
              <div className="ci-table-scroll mt-4">
                <table className="ci-local-table ci-stack-table">
                  <thead>
                    <tr>
                      {discountCols.map((c) => (
                        <th key={c} scope="col">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {discountRows.map(([label, now, later]) => (
                      <tr key={label}>
                        <th scope="row" className="font-normal">
                          {label}
                        </th>
                        <td data-label={discountCols[1]}>
                          <strong>{now}</strong>
                        </td>
                        <td data-label={discountCols[2]}>{later}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>{md(discountNote)}</p>
              <Quote text={`${QUOTE.window2026} ${QUOTE.rates2026}`} href={SOURCES.rdl7.url} label={rdl7(L(locale, { es: "art. 1.1", ca: "art. 1.1", en: "art. 1.1" }))} />
              <Quote text={`${QUOTE.permanent} ${QUOTE.permanentSevere}`} href={SOURCES.rd897.url} label={rd(L(locale, { es: "art. 6.3", ca: "art. 6.3", en: "art. 6.3" }))} />

              <h3 id="por-que">{hd.why}</h3>
              <p>{whyText}</p>

              <h2 id="limite-ingresos">{hd.table}</h2>
              <div className="ci-table-scroll mt-4">
                <table className="ci-local-table ci-stack-table">
                  <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">{tableCaption}</caption>
                  <thead>
                    <tr>
                      {tableCols.map((c) => (
                        <th key={c} scope="col">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {incomeTable().map((row) => (
                      <tr key={row.id}>
                        <th scope="row" className="font-normal">
                          {HOUSEHOLD_LABEL[row.id][locale]}
                        </th>
                        <td data-label={tableCols[1]}>
                          <strong>{M(row.plain.vulnerable)}</strong>
                        </td>
                        <td data-label={tableCols[2]}>{M(row.plain.severe)}</td>
                        <td data-label={tableCols[3]}>{M(row.special.vulnerable)}</td>
                        <td data-label={tableCols[4]}>{M(row.special.severe)}</td>
                        <td data-label={tableCols[5]}>{kwh(row.kwh, locale)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <ul>
                {tableNotes.map((n) => (
                  <li key={n}>{md(n)}</li>
                ))}
              </ul>
              <Quote text={QUOTE.income} href={SOURCES.rd897.url} label={rd("art. 3.2.a")} />
              <Quote text={QUOTE.increments} href={SOURCES.rd897.url} label={rd("art. 3.2.a")} />

              <h2 id="requisitos">{hd.who}</h2>
              <ul>
                {whoItems.map((item) => (
                  <li key={item}>{md(item)}</li>
                ))}
              </ul>
              <Quote text={QUOTE.who} href={SOURCES.rd897.url} label={rd("art. 3.1")} />
              <p>{householdText}</p>
              <ul>
                {SPECIAL_IDS.map((s) => (
                  <li key={s}>{SPECIAL_LABEL[s][locale]}</li>
                ))}
              </ul>
              <p className="text-sm">{electroNote}</p>
              <Quote text={QUOTE.special} href={SOURCES.rd897.url} label={rd("art. 3.3")} />

              <h2 id="ingresos">{hd.income}</h2>
              <p>{md(incomeText)}</p>
              <Quote text={QUOTE.incomeCounted} href={SOURCES.etu943.url} label={L(locale, { es: "Orden ETU/943/2017, art. 4.1", ca: "Ordre ETU/943/2017, art. 4.1", en: "Orden ETU/943/2017, art. 4.1" })} />

              <h2 id="severo">{hd.severe}</h2>
              <p>{md(severeText)}</p>
              <Quote text={QUOTE.severe} href={SOURCES.rd897.url} label={rd("art. 3.4")} />
              <Quote text={QUOTE.severeOther} href={SOURCES.rd897.url} label={rd("art. 3.4")} />
              <Quote text={QUOTE.exclusion} href={SOURCES.rd897.url} label={rd("art. 4.1")} />

              <h2 id="limite-kwh">{hd.cap}</h2>
              <div className="ci-table-scroll mt-4">
                <table className="ci-local-table ci-stack-table">
                  <thead>
                    <tr>
                      {capCols.map((c) => (
                        <th key={c} scope="col">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {CAP_ROWS.map((row) => (
                      <tr key={row}>
                        <th scope="row" className="font-normal">
                          {CAP_ROW_LABEL[row][locale]}
                        </th>
                        <td data-label={capCols[1]}>
                          <strong>{kwh(KWH_CAP[row], locale)}</strong>
                        </td>
                        <td data-label={capCols[2]}>{kwh(KWH_CAP_MONTHLY[row], locale)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>{capText}</p>
              <Quote text={QUOTE.powerTerm} href={SOURCES.mitecoFaq.url} label={miteco} />
              <Quote text={QUOTE.carryOver} href={SOURCES.rd897.url} label={rd(L(locale, { es: "anexo I.1.b", ca: "annex I.1.b", en: "Annex I.1.b" }))} />
              <Quote text={QUOTE.favourable} href={SOURCES.mitecoFaq.url} label={miteco} />

              <h2 id="pvpc">{hd.pvpc}</h2>
              <p>{md(pvpcText)}</p>
              <ul>
                {REFERENCE_SUPPLIERS.map((s) => (
                  <li key={s.name}>
                    {s.name}: <a href={`tel:${s.phone.replace(/\s/g, "")}`}>{s.phone}</a>
                    {s.only ? ` (${onlyIn(s.only)})` : null}
                  </li>
                ))}
              </ul>
              <p className="text-sm">
                {L(locale, { es: "Webs, correos y direcciones de cada una:", ca: "Webs, correus i adreces de cadascuna:", en: "Each one's website, email and postal address:" })}{" "}
                <A href={SOURCES.mitecoSolicitud.url}>{L(locale, { es: "«¿Cómo solicitar el Bono Social?», Ministerio para la Transición Ecológica", ca: "«¿Cómo solicitar el Bono Social?», Ministeri per a la Transició Ecològica (en castellà)", en: "«¿Cómo solicitar el Bono Social?», Ministry for the Ecological Transition (in Spanish)" })}</A>{" "}
                ({L(locale, { es: "leído", ca: "llegit", en: "read" })} {on(RULES_AS_OF)}).
              </p>
              <Quote text={QUOTE.onlyCor} href={SOURCES.rd897.url} label={rd("art. 5.1")} />
              <Quote text={`${QUOTE.implicitSwitch} ${QUOTE.freeSwitch}`} href={SOURCES.mitecoFaq.url} label={miteco} />
              <p>
                <Link href={pvpcPath(locale, "today")}>{links.pvpc}</Link>
              </p>

              <h2 id="como-pedirlo">{hd.apply}</h2>
              <ol>
                {applySteps.map((s) => (
                  <li key={s}>{md(s)}</li>
                ))}
              </ol>
              <Quote text={QUOTE.twoYears} href={SOURCES.rd897.url} label={rd("art. 9.2")} />

              <h2 id="cortes">{hd.cutoff}</h2>
              <p>{cutoffText}</p>
              <Quote text={QUOTE.noCutoff} href={SOURCES.rdl8_2021.url} label={L(locale, { es: "Real Decreto-ley 8/2021, art. 4.1", ca: "Reial decret llei 8/2021, art. 4.1", en: "Royal Decree-law 8/2021, art. 4.1" })} />
              <Quote text={QUOTE.noCutoff2026} href={SOURCES.rdl7.url} label={rdl7(L(locale, { es: "art. 4 (nuevo art. 83 del Real Decreto-ley 1/2025)", ca: "art. 4 (nou art. 83 del Reial decret llei 1/2025)", en: "art. 4 (new art. 83 of Royal Decree-law 1/2025)" }))} />

              <h2 id="ejemplos">{hd.examples}</h2>
              <div className="ci-table-scroll mt-4">
                <table className="ci-local-table ci-stack-table">
                  <thead>
                    <tr>
                      {exCols.map((c) => (
                        <th key={c} scope="col">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {examples().map(({ id, input, result }) => (
                      <tr key={id}>
                        <th scope="row" className="font-normal">
                          {exampleLabel(id, M(input.income ?? 0), locale)}
                        </th>
                        <td data-label={exCols[1]}>{exampleOutcome(result, locale)}</td>
                        <td data-label={exCols[2]}>
                          <strong>{result.discount2026 === null ? "—" : R(result.discount2026)}</strong>
                        </td>
                        <td data-label={exCols[3]}>{M(result.thresholds.vulnerable)}</td>
                        <td data-label={exCols[4]}>{result.discount2026 === null ? "—" : kwh(result.cap.yearly, locale)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm">
                {L(locale, {
                  es: "Los ingresos de los ejemplos son supuestos para ilustrar la regla; los límites y los descuentos son los de la norma.",
                  ca: "Els ingressos dels exemples són suposats per il·lustrar la regla; els límits i els descomptes són els de la norma.",
                  en: "The examples' incomes are hypothetical, to show the rule; the limits and discounts are the law's.",
                })}
              </p>

              <h2 id="bono-termico">{hd.thermal}</h2>
              <p>{md(thermalText)}</p>
              <ul>
                <li>
                  <Link href={butanePath(locale)}>{links.butane}</Link>
                </li>
                <li>
                  <Link href={pvpcPath(locale, "today")}>{links.pvpc}</Link>
                </li>
              </ul>

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
              <p className="text-sm text-[var(--color-muted)]">{disclaimer}</p>

              <MoreCalculators current="bono-social" locale={locale} />
            </div>
            <ShareBar locale={locale} path={bonoSocialPath(locale)} title={meta.h1} contentType="bono_social_calculator" variant="full" />
          </div>
        </article>
      </main>
      <JsonLd json={graph([breadcrumbSchema(crumbs), appSchema, faqSchema])} />
      <SiteFooter locale={locale} />
    </>
  );
}
