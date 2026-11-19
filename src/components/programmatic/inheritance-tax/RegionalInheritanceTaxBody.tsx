import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { ShareBar } from "@/components/share/ShareBar";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { calcPath } from "@/lib/programmatic/calculators/paths";
import { GROUP_LABEL, elDay, fromDay, money, num, percent, sinceDay, type IsdLocale } from "@/lib/programmatic/inheritance-tax/copy";
import { REGION_AGENCY, REGION_IN, STATE_GROUP_WHO, cite, lawName, regionEditions, regionPath } from "@/lib/programmatic/inheritance-tax/regional-copy";
import { REGION_RULES, regionDefaultInput, regionExample, regionExampleResults, regionFaq, regionMeta } from "@/lib/programmatic/inheritance-tax/regional-page";
import { REGION_PROFILES, type QuoteRef } from "@/lib/programmatic/inheritance-tax/regions/profiles";
import { DEADLINE, RULES_AS_OF, RULES_UNTIL, type Source } from "@/lib/programmatic/inheritance-tax/regions/state";
import type { RegionId } from "@/lib/programmatic/inheritance-tax/regions/types";
import type { Group } from "@/lib/programmatic/inheritance-tax/rules";
import { absoluteUrl } from "@/lib/site";
import { ORGANIZATION_ID, breadcrumbSchema, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

import { InheritanceByRegion } from "./InheritanceByRegion";
import { RegionalInheritanceTaxCalculator } from "./RegionalInheritanceTaxCalculator";

/**
 * The page of the Madrid, Andalucía and Comunitat Valenciana inheritance tax
 * calculators: the calculator (server-rendered on the first example), how it
 * is worked out, the groups and reductions, the scale, the coefficients, the
 * rebate, the examples, the deadline and the forms, the other communities,
 * what changed, questions, sources and limits. Every figure comes from the
 * community's rules (lib/programmatic/inheritance-tax/regions/) through the
 * engine. Each community has its own small page component (MadridInheritance
 * TaxPage.tsx …) that passes the breadcrumb, the next step and "More
 * calculators" for its registry id.
 */

const L = <T,>(locale: IsdLocale, v: Record<IsdLocale, T>): T => v[locale];

export function regionMetadata(region: RegionId, locale: IsdLocale): Metadata {
  const m = regionMeta(region, locale);
  return buildMetadata({ locale, path: regionPath(region, locale), title: m.title, description: m.description, translations: regionEditions(region) });
}

function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} rel="noopener" target="_blank">
      {children}
    </a>
  );
}

function Quote({ q, locale }: { q: QuoteRef; locale: IsdLocale }) {
  return (
    <blockquote lang="es">
      <p>«{q.text}»</p>
      <footer className="text-sm">
        <A href={q.href}>{q.cite ? cite(q.cite, locale) : q.label![locale]}</A>
      </footer>
    </blockquote>
  );
}

/** A Catalan/Valencian edition for the ca page when the publisher has one. */
const srcUrl = (src: Source, locale: IsdLocale) => (locale === "ca" && src.urlCa ? src.urlCa : src.url);

const md = (text: string) => text.split(/\*\*/).map((p, i) => (i % 2 ? <strong key={i}>{p}</strong> : p));

function Table({ cols, rows, caption }: { cols: string[]; rows: ReactNode[][]; caption?: string }) {
  return (
    <div className="ci-table-scroll mt-4">
      <table className="ci-local-table ci-stack-table">
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
          {rows.map((cells, i) => (
            <tr key={i}>
              {cells.map((cell, j) =>
                j === 0 ? (
                  <th key={j} scope="row" className="font-normal" data-label={cols[0]}>
                    {cell}
                  </th>
                ) : (
                  <td key={j} data-label={cols[j]}>
                    {cell}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function RegionalInheritanceTaxBody({ region, locale, crumbs, nextStep, more }: { region: RegionId; locale: IsdLocale; crumbs: Crumb[]; nextStep: ReactNode; more: ReactNode }) {
  const rules = REGION_RULES[region];
  const profile = REGION_PROFILES[region];
  const meta = regionMeta(region, locale);
  const faq = regionFaq(region, locale);
  const examples = regionExampleResults(region);
  const M = (n: number) => money(n, locale);
  const P = (n: number) => percent(n, locale);
  const on = (iso: string) => elDay(iso, locale);
  const since = (iso: string) => sinceDay(iso, locale);
  const from = (iso: string) => fromDay(iso, locale);
  const c = (k: keyof typeof rules.cite) => cite(rules.cite[k], locale);
  const where = REGION_IN[region][locale];
  const agency = REGION_AGENCY[region][locale];
  const law = lawName(region, locale);
  const k = rules.kinship;
  const first = rules.coefficients[0]!;
  const flat = rules.coefficients.length === 1;
  const scaleMin = rules.scale[0]!.rate;
  const scaleMax = rules.scale[rules.scale.length - 1]!.rate;
  const state = L(locale, { ca: " (estatal)", es: " (estatal)", en: " (state rule)" });

  const lead = {
    madrid: () => {
      const son = regionExample("madrid", "son-300k");
      const brother = regionExample("madrid", "brother");
      const friend = regionExample("madrid", "friend");
      return L(locale, {
        ca: `A la Comunitat de Madrid els fills, el cònjuge i els pares es bonifiquen el 99 % de la quota: un fill de 30 anys que hereta 300.000 € paga ${M(son.toPay)}. Els germans, nebots, oncles i parents per afinitat tenen un 50 % des de l'1 de juliol de 2025 (un germà que hereta 150.000 € paga ${M(brother.toPay)}), i qui no és parent paga la tarifa sencera: ${M(friend.toPay)} per 100.000 €. La calculadora ho fa pas a pas, amb cada article del text refós madrileny.`,
        es: `En la Comunidad de Madrid los hijos, el cónyuge y los padres se bonifican el 99 % de la cuota: un hijo de 30 años que hereda 300.000 € paga ${M(son.toPay)}. Los hermanos, sobrinos, tíos y parientes por afinidad tienen un 50 % desde el 1 de julio de 2025 (un hermano que hereda 150.000 € paga ${M(brother.toPay)}), y quien no es pariente paga la tarifa entera: ${M(friend.toPay)} por 100.000 €. La calculadora lo hace paso a paso, con cada artículo del texto refundido madrileño.`,
        en: `In the Madrid region children, spouses and parents get 99% off the tax: a 30-year-old son inheriting €300,000 pays ${M(son.toPay)}. Siblings, nephews, nieces, uncles, aunts and in-laws get 50% off since 1 July 2025 (a brother inheriting €150,000 pays ${M(brother.toPay)}), and someone unrelated pays the full scale: ${M(friend.toPay)} on €100,000. The calculator works it out step by step, with each article of Madrid's tax law.`,
      });
    },
    andalucia: () => {
      const son = regionExample("andalucia", "son-1200k");
      const nephew = regionExample("andalucia", "nephew");
      const friend = regionExample("andalucia", "friend");
      return L(locale, {
        ca: `A Andalusia els fills, el cònjuge i els pares resten 1.000.000 € de la base i es bonifiquen el 99 % del que en quedi: qui hereta 600.000 € no paga res i qui hereta 1.200.000 € paga ${M(son.toPay)}. Un nebot que hereta 100.000 € paga ${M(nephew.toPay)}, sense bonificació, i algú sense parentiu, ${M(friend.toPay)}. La calculadora ho fa pas a pas, amb cada article de la Llei 5/2021.`,
        es: `En Andalucía los hijos, el cónyuge y los padres restan 1.000.000 € de la base y se bonifican el 99 % de lo que quede: quien hereda 600.000 € no paga nada y quien hereda 1.200.000 € paga ${M(son.toPay)}. Un sobrino que hereda 100.000 € paga ${M(nephew.toPay)}, sin bonificación, y alguien sin parentesco, ${M(friend.toPay)}. La calculadora lo hace paso a paso, con cada artículo de la Ley 5/2021.`,
        en: `In Andalusia children, spouses and parents deduct €1,000,000 from the base and get 99% off whatever tax is left: an heir to €600,000 pays nothing and an heir to €1,200,000 pays ${M(son.toPay)}. A nephew inheriting €100,000 pays ${M(nephew.toPay)}, with no rebate, and someone unrelated ${M(friend.toPay)}. The calculator works it out step by step, with each article of Law 5/2021.`,
      });
    },
    valencia: () => {
      const son = regionExample("valencia", "son-300k");
      const brother = regionExample("valencia", "brother");
      const inLaw = regionExample("valencia", "brother-in-law");
      return L(locale, {
        ca: `A la Comunitat Valenciana els fills, el cònjuge i els pares es bonifiquen el 99 % de la quota: un fill de 30 anys que hereta 300.000 € paga ${M(son.toPay)}. Des de l'1 de juny de 2026 els germans, nebots i oncles de sang tenen un 25 % (un germà que hereta 100.000 € paga ${M(brother.toPay)}); un cunyat no en té i paga ${M(inLaw.toPay)}. La calculadora ho fa pas a pas, amb cada article de la Llei 13/1997.`,
        es: `En la Comunidad Valenciana los hijos, el cónyuge y los padres se bonifican el 99 % de la cuota: un hijo de 30 años que hereda 300.000 € paga ${M(son.toPay)}. Desde el 1 de junio de 2026 los hermanos, sobrinos y tíos de sangre tienen un 25 % (un hermano que hereda 100.000 € paga ${M(brother.toPay)}); un cuñado no lo tiene y paga ${M(inLaw.toPay)}. La calculadora lo hace paso a paso, con cada artículo de la Ley 13/1997.`,
        en: `In the Valencia region children, spouses and parents get 99% off the tax: a 30-year-old son inheriting €300,000 pays ${M(son.toPay)}. Since 1 June 2026 blood siblings, nephews, nieces, uncles and aunts get 25% off (a brother inheriting €100,000 pays ${M(brother.toPay)}); a brother-in-law gets nothing and pays ${M(inLaw.toPay)}. The calculator works it out step by step, with each article of Valencian Law 13/1997.`,
      });
    },
  }[region]();

  const fresh = L(locale, {
    ca: `Normes revisades ${on(RULES_AS_OF)} al text consolidat del BOE (${law}, vigent ${since(profile.dates.consolidatedFrom)}) i a les pàgines de ${agency}. Per a morts ${since(rules.deathsFrom)}. Es tornen a revisar ${from(RULES_UNTIL)}.`,
    es: `Normas revisadas ${on(RULES_AS_OF)} en el texto consolidado del BOE (${law}, vigente ${since(profile.dates.consolidatedFrom)}) y en las páginas de ${agency}. Para fallecimientos ${since(rules.deathsFrom)}. Se revisan de nuevo ${from(RULES_UNTIL)}.`,
    en: `Rules checked ${on(RULES_AS_OF)} in the BOE's consolidated text (${law}, in force ${since(profile.dates.consolidatedFrom)}) and on the pages of ${agency}. For deaths ${since(rules.deathsFrom)}. Due for a fresh check ${from(RULES_UNTIL)}.`,
  });

  const disclaimer = L(locale, {
    ca: `Estimació orientativa per a un hereu. El càlcul oficial és la teva autoliquidació (model 650) davant ${agency}, que valora els béns, comprova les reduccions i hi suma, si escau, l'aixovar, les donacions anteriors i els interessos. Si l'herència té usdefruits, empreses, finques rústiques o béns a l'estranger, consulta-ho a ${agency} o a un assessor.`,
    es: `Estimación orientativa para un heredero. El cálculo oficial es tu autoliquidación (modelo 650) ante ${agency}, que valora los bienes, comprueba las reducciones y suma, si procede, el ajuar, las donaciones anteriores y los intereses. Si la herencia tiene usufructos, empresas, fincas rústicas o bienes en el extranjero, consúltalo con ${agency} o con un asesor.`,
    en: `An estimate for one heir. The official calculation is your self-assessment (form 650) with ${agency}, which values the assets, checks the reductions and adds, where due, household goods, earlier gifts and interest. If the estate includes usufructs, businesses, rural land or assets abroad, ask ${agency} or an adviser.`,
  });

  const officialLinks = (
    <>
      <A href={srcUrl(profile.info, locale)}>{profile.info.publisher}: {profile.info.name}</A> · <A href={srcUrl(profile.file, locale)}>{profile.file.name}</A>
    </>
  );

  const hd = L(locale, {
    ca: { how: "Com es calcula, pas a pas", groups: "Grups de parentiu i reduccions", scale: "Tarifa", coef: "Coeficients multiplicadors", bonus: "Bonificació", examples: "Exemples, amb la calculadora", file: "Termini, pròrroga i com es presenta", changes: "Què ha canviat i quan es revisa", faq: "Preguntes freqüents", sources: "Fonts oficials", limits: "Què no calcula" },
    es: { how: "Cómo se calcula, paso a paso", groups: "Grupos de parentesco y reducciones", scale: "Tarifa", coef: "Coeficientes multiplicadores", bonus: "Bonificación", examples: "Ejemplos, con la calculadora", file: "Plazo, prórroga y cómo se presenta", changes: "Qué ha cambiado y cuándo se revisa", faq: "Preguntas frecuentes", sources: "Fuentes oficiales", limits: "Qué no calcula" },
    en: { how: "How it is worked out, step by step", groups: "Kinship groups and reductions", scale: "Tax scale", coef: "Multiplying coefficients", bonus: "Rebate (bonificación)", examples: "Examples, through the calculator", file: "Deadline, extension and how to file", changes: "What changed and when it is re-checked", faq: "Questions", sources: "Official sources", limits: "What it does not cover" },
  });

  /** A coefficient with its own decimals: 1, 1,05, 1,5882. */
  const cx = (n: number) => num(n, (String(n).split(".")[1] ?? "").length, locale);
  const coefSummary = L(locale, {
    ca: `${cx(first.groupsIandII)} per als grups I i II${flat ? "" : " al primer tram de patrimoni"}; ${cx(first.groupIII)} per al grup III; ${cx(first.groupIV)} per al grup IV${flat ? ", sigui quin sigui el patrimoni" : ""}`,
    es: `${cx(first.groupsIandII)} para los grupos I y II${flat ? "" : " en el primer tramo de patrimonio"}; ${cx(first.groupIII)} para el grupo III; ${cx(first.groupIV)} para el grupo IV${flat ? ", sea cual sea el patrimonio" : ""}`,
    en: `${cx(first.groupsIandII)} for groups I and II${flat ? "" : " in the first wealth bracket"}; ${cx(first.groupIII)} for group III; ${cx(first.groupIV)} for group IV${flat ? ", whatever the wealth" : ""}`,
  });
  const b = rules.bonus;
  const bonusSummary = L(locale, {
    ca: `el ${b.groupsIandII} % per als grups I i II${b.disability ? ` i per a qui té una discapacitat del 65 % (o intel·lectual o mental del 33 %)` : ""}${b.groupIII ? `; el ${b.groupIII} % per ${b.groupIIIScope === "group" ? "al grup III" : "als germans, nebots i oncles de sang"}` : "; res per als grups III i IV"}`,
    es: `el ${b.groupsIandII} % para los grupos I y II${b.disability ? ` y para quien tiene una discapacidad del 65 % (o intelectual o mental del 33 %)` : ""}${b.groupIII ? `; el ${b.groupIII} % para ${b.groupIIIScope === "group" ? "el grupo III" : "hermanos, sobrinos y tíos de sangre"}` : "; nada para los grupos III y IV"}`,
    en: `${b.groupsIandII}% for groups I and II${b.disability ? ` and for heirs with a 65% disability (or an intellectual or mental one of 33%)` : ""}${b.groupIII ? `; ${b.groupIII}% for ${b.groupIIIScope === "group" ? "group III" : "blood siblings, nephews, nieces, uncles and aunts"}` : "; nothing for groups III and IV"}`,
  });

  const steps = L(locale, {
    ca: [
      "**Base imposable.** El que reps en net (béns menys deutes i despeses deduïbles) més l'assegurança de vida que cobres per la mort, si la pòlissa la va contractar la persona morta (Reial decret 1629/1991, art. 39.1).",
      `**Reduccions** (${c("kinship")} i següents): per parentiu, per discapacitat, per assegurança de vida i per l'habitatge habitual de la persona morta. El que queda és la base liquidable, mai per sota de zero.`,
      `**Quota íntegra** (${c("scale")}): la tarifa, del ${P(scaleMin)} al ${P(scaleMax)}, sobre la base liquidable.`,
      `**Quota tributària** (${c("coefficient")}): la quota íntegra pel coeficient del teu grup${flat ? "" : " i del teu patrimoni anterior"} (${coefSummary}).`,
      `**Bonificació** (${c("bonus")}): ${bonusSummary}.`,
      "**A pagar** = quota tributària − bonificació.",
    ],
    es: [
      "**Base imponible.** Lo que recibes en neto (bienes menos deudas y gastos deducibles) más el seguro de vida que cobras por el fallecimiento, si la póliza la contrató la persona fallecida (Real Decreto 1629/1991, art. 39.1).",
      `**Reducciones** (${c("kinship")} y siguientes): por parentesco, por discapacidad, por seguro de vida y por la vivienda habitual de la persona fallecida. Lo que queda es la base liquidable, nunca por debajo de cero.`,
      `**Cuota íntegra** (${c("scale")}): la tarifa, del ${P(scaleMin)} al ${P(scaleMax)}, sobre la base liquidable.`,
      `**Cuota tributaria** (${c("coefficient")}): la cuota íntegra por el coeficiente de tu grupo${flat ? "" : " y de tu patrimonio previo"} (${coefSummary}).`,
      `**Bonificación** (${c("bonus")}): ${bonusSummary}.`,
      "**A pagar** = cuota tributaria − bonificación.",
    ],
    en: [
      "**Taxable base (base imponible).** What you receive, net (assets less debts and deductible costs), plus any life insurance paid because of the death on a policy the deceased took out (Royal Decree 1629/1991, art. 39.1).",
      `**Reductions** (${c("kinship")} onwards): kinship, disability, life insurance and the deceased's habitual home. What is left is the net taxable base (base liquidable), never below zero.`,
      `**Gross tax (cuota íntegra)** (${c("scale")}): the scale, ${P(scaleMin)} to ${P(scaleMax)}, on the net taxable base.`,
      `**Tax after the coefficient (cuota tributaria)** (${c("coefficient")}): the gross tax times the coefficient for your group${flat ? "" : " and prior wealth"} (${coefSummary}).`,
      `**Rebate (bonificación)** (${c("bonus")}): ${bonusSummary}.`,
      "**To pay** = tax after the coefficient − rebate.",
    ],
  });

  const groupI = k.groupI.perYear > 0
    ? L(locale, {
        ca: `${M(k.groupI.base)} + ${M(k.groupI.perYear)} per cada any per sota dels 21, fins a ${M(k.groupI.max)}`,
        es: `${M(k.groupI.base)} + ${M(k.groupI.perYear)} por cada año por debajo de los 21, hasta ${M(k.groupI.max)}`,
        en: `${M(k.groupI.base)} + ${M(k.groupI.perYear)} for each year under 21, up to ${M(k.groupI.max)}`,
      })
    : M(k.groupI.base);
  const groupRows: { group: Group; reduction: string }[] = [
    { group: "I", reduction: groupI },
    { group: "II", reduction: M(k.groupII) },
    { group: "III", reduction: `${M(k.groupIII)}${k.groupIIIOrigin === "state" ? state : ""}` },
    { group: "IV", reduction: L(locale, { ca: "Cap", es: "Ninguna", en: "None" }) },
  ];

  const d = rules.disability;
  const otherReductions = L(locale, {
    ca: [
      `**Discapacitat** (${c("disability")}): ${M(d.from33)} amb un grau del 33 % al 64 %; ${M(d.from65)} amb el 65 % o més${d.mentalFrom33As65 ? ", o amb una discapacitat intel·lectual o mental del 33 % o més reconeguda de manera permanent" : ""}. Se suma a la de parentiu.`,
      `**Assegurança de vida** (${c("insurance")}): el 100 % fins a ${M(rules.insurance.max)}${rules.insurance.origin === "state" ? state : ""}, si ets cònjuge, descendent o ascendent de qui la va contractar; una sola vegada per hereu.`,
      `**Habitatge habitual de la persona morta** (${c("home")}): el ${rules.home.percent} % del valor de la part que et toca, fins a ${M(rules.home.capPerHeir)} per hereu${rules.home.capOrigin === "state" ? " (límit estatal)" : ""}, per al cònjuge, els descendents, els ascendents i els col·laterals de més de 65 anys que hi van conviure els dos anys anteriors. Cal conservar-lo ${rules.home.keepYears} anys.`,
    ],
    es: [
      `**Discapacidad** (${c("disability")}): ${M(d.from33)} con un grado del 33 % al 64 %; ${M(d.from65)} con el 65 % o más${d.mentalFrom33As65 ? ", o con una discapacidad intelectual o mental del 33 % o más reconocida de forma permanente" : ""}. Se suma a la de parentesco.`,
      `**Seguro de vida** (${c("insurance")}): el 100 % hasta ${M(rules.insurance.max)}${rules.insurance.origin === "state" ? state : ""}, si eres cónyuge, descendiente o ascendiente de quien lo contrató; una sola vez por heredero.`,
      `**Vivienda habitual de la persona fallecida** (${c("home")}): el ${rules.home.percent} % del valor de la parte que te toca, hasta ${M(rules.home.capPerHeir)} por heredero${rules.home.capOrigin === "state" ? " (límite estatal)" : ""}, para el cónyuge, los descendientes, los ascendientes y los colaterales mayores de 65 años que convivieron con ella los dos años anteriores. Hay que conservarla ${rules.home.keepYears} años.`,
    ],
    en: [
      `**Disability** (${c("disability")}): ${M(d.from33)} with a recognised degree of 33% to 64%; ${M(d.from65)} with 65% or more${d.mentalFrom33As65 ? ", or with an intellectual or mental disability of 33% or more, permanently recognised" : ""}. It adds to the kinship reduction.`,
      `**Life insurance** (${c("insurance")}): 100% up to ${M(rules.insurance.max)}${rules.insurance.origin === "state" ? state : ""} if you are the policyholder's spouse, descendant or ascendant; once per heir.`,
      `**The deceased's habitual home** (${c("home")}): ${rules.home.percent}% of the value of your part, up to ${M(rules.home.capPerHeir)} per heir${rules.home.capOrigin === "state" ? " (state limit)" : ""}, for the spouse, descendants, ascendants and collaterals over 65 who lived with the deceased for the two years before. The home must be kept for ${rules.home.keepYears} years.`,
    ],
  });

  const groupCols = L(locale, { ca: ["Grup", "Qui", "Reducció per parentiu"], es: ["Grupo", "Quién", "Reducción por parentesco"], en: ["Group", "Who", "Kinship reduction"] });
  const scaleCols = L(locale, { ca: ["Base liquidable des de", "Quota fins aquí", "Tipus sobre la resta"], es: ["Base liquidable desde", "Cuota hasta aquí", "Tipo sobre el resto"], en: ["Net taxable base from", "Tax up to here", "Rate on the rest"] });
  const coefCols = L(locale, { ca: ["Patrimoni preexistent", "Grups I i II", "Grup III", "Grup IV"], es: ["Patrimonio preexistente", "Grupos I y II", "Grupo III", "Grupo IV"], en: ["Prior wealth", "Groups I and II", "Group III", "Group IV"] });
  const exCols = L(locale, {
    ca: ["Cas", "Base imposable", "Base liquidable", "Quota tributària", "Bonificació", "A pagar"],
    es: ["Caso", "Base imponible", "Base liquidable", "Cuota tributaria", "Bonificación", "A pagar"],
    en: ["Case", "Taxable base", "Net taxable base", "Tax after coefficient", "Rebate", "To pay"],
  });
  const coefRange = (i: number) => {
    const row = rules.coefficients[i]!;
    const prev = i > 0 ? rules.coefficients[i - 1]!.upTo! : null;
    if (prev === null && row.upTo === null) return L(locale, { ca: "Qualsevol patrimoni", es: "Cualquier patrimonio", en: "Any wealth" });
    if (prev === null) return L(locale, { ca: `Fins a ${M(row.upTo!)}`, es: `Hasta ${M(row.upTo!)}`, en: `Up to ${M(row.upTo!)}` });
    if (row.upTo === null) return L(locale, { ca: `Més de ${M(prev)}`, es: `Más de ${M(prev)}`, en: `Over ${M(prev)}` });
    return L(locale, { ca: `Més de ${M(prev)} fins a ${M(row.upTo)}`, es: `Más de ${M(prev)} hasta ${M(row.upTo)}`, en: `Over ${M(prev)} up to ${M(row.upTo)}` });
  };
  const official = examples.filter((e) => e.official);

  const appSchema = {
    "@type": "WebApplication",
    name: meta.appName,
    url: absoluteUrl(regionPath(region, locale)),
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    inLanguage: locale,
    isAccessibleForFree: true,
    publisher: { "@id": ORGANIZATION_ID },
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description: meta.description,
  };
  const faqSchema = { "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };

  return (
    <>
      <SiteHeader locale={locale} translations={regionEditions(region)} />
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
              <RegionalInheritanceTaxCalculator locale={locale} rules={rules} initial={regionDefaultInput(region)} />
              <p className="text-sm text-[var(--color-muted)]">
                {disclaimer} {officialLinks}.
              </p>
              {nextStep}

              <h2 id="como-se-calcula">{hd.how}</h2>
              <ol>
                {steps.map((s) => (
                  <li key={s}>{md(s)}</li>
                ))}
              </ol>

              <h2 id="grupos">{hd.groups}</h2>
              <Table cols={groupCols} caption={c("kinship")} rows={groupRows.map((g) => [GROUP_LABEL[g.group][locale], STATE_GROUP_WHO[g.group][locale], g.reduction])} />
              <p>{profile.reductionsNote[locale]}</p>
              <ul>
                {otherReductions.map((r) => (
                  <li key={r}>{md(r)}</li>
                ))}
              </ul>
              {profile.quotes.reductions.map((q) => (
                <Quote key={q.text} q={q} locale={locale} />
              ))}

              <h2 id="tarifa">{hd.scale}</h2>
              <Table
                cols={scaleCols}
                caption={`${c("scale")} · ${L(locale, { ca: `aplicable ${since(profile.dates.scaleFrom)}`, es: `aplicable ${since(profile.dates.scaleFrom)}`, en: `in force ${since(profile.dates.scaleFrom)}` })}`}
                rows={rules.scale.map((r) => [M(r.from), M(r.quota), P(r.rate)])}
              />
              {profile.quotes.scale.map((q) => (
                <Quote key={q.text} q={q} locale={locale} />
              ))}

              <h2 id="coeficientes">{hd.coef}</h2>
              <Table cols={coefCols} caption={c("coefficient")} rows={rules.coefficients.map((row, i) => [coefRange(i), cx(row.groupsIandII), cx(row.groupIII), cx(row.groupIV)])} />
              <p>
                {flat
                  ? L(locale, {
                      ca: "El coeficient només depèn del parentiu: el patrimoni que ja tenies no canvia res.",
                      es: "El coeficiente solo depende del parentesco: el patrimonio que ya tenías no cambia nada.",
                      en: "The coefficient depends only on the relationship: the wealth you already had changes nothing.",
                    })
                  : L(locale, {
                      ca: "Just per sobre d'un tram de patrimoni, la quota no pot créixer més del que el teu patrimoni passa del tram anterior (regla de l'excés de quota). La calculadora també l'aplica:",
                      es: "Justo por encima de un tramo de patrimonio, la cuota no puede crecer más de lo que tu patrimonio pasa del tramo anterior (regla del exceso de cuota). La calculadora también la aplica:",
                      en: "Just above a prior-wealth bracket, the tax cannot grow by more than your wealth exceeds the bracket below (the excess-tax rule). The calculator applies it too:",
                    })}
              </p>
              {profile.quotes.coefficient.map((q) => (
                <Quote key={q.text} q={q} locale={locale} />
              ))}

              <h2 id="bonificacion">{hd.bonus}</h2>
              <p>{profile.bonusNote[locale]}</p>
              {profile.quotes.bonus.map((q) => (
                <Quote key={q.text} q={q} locale={locale} />
              ))}

              <h2 id="ejemplos">{hd.examples}</h2>
              <p>
                {L(locale, {
                  ca: `Casos calculats amb les normes vigents ${where}; els tests del web en comproven cada xifra amb un càlcul independent fet a mà amb la tarifa citada.`,
                  es: `Casos calculados con las normas vigentes ${where}; los tests de la web comprueban cada cifra con un cálculo independiente hecho a mano con la tarifa citada.`,
                  en: `Cases worked out under the rules in force ${where}; the site's tests check every figure against an independent hand calculation from the quoted scale.`,
                })}
              </p>
              <Table
                cols={exCols}
                rows={examples.map(({ label, result: r }) => [
                  label[locale],
                  M(r.baseImposable),
                  M(r.baseLiquidable),
                  M(r.quotaTributaria),
                  r.bonusRule === "none" || r.quotaTributaria === 0 ? "—" : P(r.bonusPct),
                  <strong key="pay">{M(r.toPay)}</strong>,
                ])}
              />
              {official.map((e) => (
                <p key={e.id} className="text-sm">
                  {L(locale, {
                    ca: `La Comunitat de Madrid: quota íntegra ${M(e.official!.quotaIntegra)}, a pagar ${M(e.official!.toPay)}. La calculadora: ${M(e.result.quotaIntegra)} i ${M(e.result.toPay)}.`,
                    es: `La Comunidad de Madrid: cuota íntegra ${M(e.official!.quotaIntegra)}, a ingresar ${M(e.official!.toPay)}. La calculadora: ${M(e.result.quotaIntegra)} y ${M(e.result.toPay)}.`,
                    en: `The Madrid region: gross tax ${M(e.official!.quotaIntegra)}, to pay ${M(e.official!.toPay)}. The calculator: ${M(e.result.quotaIntegra)} and ${M(e.result.toPay)}.`,
                  })}
                </p>
              ))}
              {profile.quotes.examples.map((q) => (
                <Quote key={q.text} q={q} locale={locale} />
              ))}

              <h2 id="plazo">{hd.file}</h2>
              <ul>
                <li>
                  {md(
                    L(locale, {
                      ca: `**Termini:** ${DEADLINE.months} mesos des del dia de la mort. Dins els ${DEADLINE.askWithinMonths} primers mesos es pot demanar una pròrroga de ${DEADLINE.extensionMonths} mesos més, amb interessos de demora pels dies prorrogats.`,
                      es: `**Plazo:** ${DEADLINE.months} meses desde el día del fallecimiento. Dentro de los ${DEADLINE.askWithinMonths} primeros meses se puede pedir una prórroga de ${DEADLINE.extensionMonths} meses más, con intereses de demora por los días prorrogados.`,
                      en: `**Deadline:** ${DEADLINE.months} months from the day of the death. Within the first ${DEADLINE.askWithinMonths} months you can ask for ${DEADLINE.extensionMonths} more months, with late-payment interest for the extra days.`,
                    }),
                  )}
                </li>
                <li>
                  {md(
                    L(locale, {
                      ca: `**Com:** un model 650 per a cada hereu, a ${agency}, per internet o amb cita a les seves oficines.`,
                      es: `**Cómo:** un modelo 650 por cada heredero, ante ${agency}, por internet o con cita en sus oficinas.`,
                      en: `**How:** one form 650 per heir, with ${agency}, online or by appointment at its offices.`,
                    }),
                  )}
                </li>
                <li>
                  {md(
                    L(locale, {
                      ca: "**On:** si la persona morta vivia a Espanya i tu també, a la comunitat on va viure més dies dels cinc anys anteriors a la mort. Si l'hereu no viu a Espanya, a l'Agència Tributària de l'Estat (AEAT).",
                      es: "**Dónde:** si la persona fallecida vivía en España y tú también, en la comunidad donde vivió más días de los cinco años anteriores al fallecimiento. Si el heredero no vive en España, en la Agencia Tributaria del Estado (AEAT).",
                      en: "**Where:** if the deceased lived in Spain and so do you, in the region where the deceased lived the most days of the five years before the death. If the heir does not live in Spain, with the State Tax Agency (AEAT).",
                    }),
                  )}
                </li>
              </ul>
              {profile.quotes.filing.map((q) => (
                <Quote key={q.text} q={q} locale={locale} />
              ))}
              <p>{officialLinks}.</p>

              <p>
                {L(locale, {
                  ca: "Si l'herència inclou un habitatge o un altre immoble urbà, l'hereu paga també la plusvàlua municipal a l'ajuntament, amb un termini propi de sis mesos des de la mort, prorrogables fins a un any (text refós de la Llei reguladora de les hisendes locals, arts. 106.1.a i 110.2.b):",
                  es: "Si la herencia incluye una vivienda u otro inmueble urbano, el heredero paga también la plusvalía municipal al ayuntamiento, con un plazo propio de seis meses desde el fallecimiento, prorrogables hasta un año (texto refundido de la Ley Reguladora de las Haciendas Locales, arts. 106.1.a y 110.2.b):",
                  en: "If the estate includes a home or other urban property, the heir also pays the plusvalía municipal to the council, with its own deadline of six months from the death, extendable to one year (consolidated Local Finance Act, arts. 106.1.a and 110.2.b):",
                })}{" "}
                <Link href={calcPath("plusvalia", locale)}>{L(locale, { ca: "calculadora de la plusvàlua municipal", es: "calculadora de la plusvalía municipal", en: "plusvalía municipal tax calculator" })}</Link>.
              </p>

              <InheritanceByRegion current={rules.calculatorId} locale={locale} />

              <h2 id="cambios">{hd.changes}</h2>
              <ul>
                {profile.changes[locale].map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>

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
                  ca: `Llegides ${on(RULES_AS_OF)}. Les cites són literals, en castellà, tal com les publica el BOE o l'organisme. Els textos consolidats del BOE no tenen valor oficial: el té la publicació al butlletí.`,
                  es: `Leídas ${on(RULES_AS_OF)}. Las citas son literales, tal como las publica el BOE o el organismo. Los textos consolidados del BOE no tienen valor oficial: lo tiene la publicación en el boletín.`,
                  en: `Read ${on(RULES_AS_OF)}. Quotes are verbatim, in Spanish, as the BOE or the agency publishes them. The BOE's consolidated texts are not official: the bulletin publication is.`,
                })}
              </p>
              <ul>
                {profile.sources.map((src) => (
                  <li key={src.url}>
                    <A href={srcUrl(src, locale)}>{src.name}</A> ({src.publisher}, {src.ref})
                  </li>
                ))}
              </ul>

              <h2 id="limites">{hd.limits}</h2>
              <ul>
                {profile.limits[locale].map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
              <p className="text-sm text-[var(--color-muted)]">{disclaimer}</p>

              {more}
            </div>
            <ShareBar locale={locale} path={regionPath(region, locale)} title={meta.h1} contentType="inheritance_tax_calculator" variant="full" />
          </div>
        </article>
      </main>
      <JsonLd json={graph([breadcrumbSchema(crumbs), appSchema, faqSchema])} />
      <SiteFooter locale={locale} />
    </>
  );
}
