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
import { calcPath } from "@/lib/programmatic/calculators/paths";
import { capitalize, dayMonthYear } from "@/lib/programmatic/holidays/format";
import { GROUP_LABEL, GROUP_WHO, codeArticle, elDay, fromDay, isdEditions, isdPath, money, num, percent, sinceDay, type IsdLocale } from "@/lib/programmatic/inheritance-tax/copy";
import { calculateOk, type IsdOk } from "@/lib/programmatic/inheritance-tax/engine";
import { ATC_EXAMPLES, ATC_HOME_EXAMPLES, DEFAULT_INPUT, examples, isdFaq, isdMeta, type AtcExampleId, type OwnExampleId } from "@/lib/programmatic/inheritance-tax/page";
import {
  ARTICLE,
  BONUS_FROM,
  BONUS_GROUP_I,
  BONUS_GROUP_II,
  CODE_CONSOLIDATED_FROM,
  COEFFICIENTS,
  COEFFICIENTS_FROM,
  DEADLINE,
  DISABILITY,
  ELDERLY,
  GENDER_VIOLENCE_BONUS_FROM,
  HELP_PROGRAM_PUBLISHED,
  HOME,
  INSURANCE,
  KINSHIP,
  KINSHIP_GROUP_I,
  QUOTE,
  RULES_AS_OF,
  RULES_UNTIL,
  SCALE,
  SCALE_FROM,
  SOURCES,
  SPOUSE_BONUS,
  type BonusSlice,
  type Group,
  type Source,
} from "@/lib/programmatic/inheritance-tax/rules";
import { absoluteUrl } from "@/lib/site";
import { ORGANIZATION_ID, breadcrumbSchema, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

import { InheritanceByRegion } from "./InheritanceByRegion";
import { InheritanceTaxCalculator } from "./InheritanceTaxCalculator";

/**
 * "Impost de successions a Catalunya" / "Impuesto de sucesiones en Cataluña" /
 * "Catalonia inheritance tax": the tax of one heir under the llibre sisè of
 * the Codi tributari de Catalunya (arts. 631-2 to 633-4), as a calculator
 * (server-rendered on the ATC's worked example 1), then how it is worked out,
 * the kinship groups and reductions, the scale, the coefficients and the
 * rebate tables, the ATC's worked examples beside the engine's, the home
 * reduction, the deadline and the forms, what changed, questions, sources and
 * limits. Every figure comes from rules.ts through the engine.
 */

const L = <T,>(locale: IsdLocale, v: Record<IsdLocale, T>): T => v[locale];

export function isdCrumbs(locale: IsdLocale): Crumb[] {
  return [{ label: getMessages(locale).common.home, href: `/${locale}/` }, hubCrumb(locale), { label: isdMeta(locale).breadcrumb, href: isdPath(locale) }];
}

export function isdMetadata(locale: IsdLocale): Metadata {
  const m = isdMeta(locale);
  return buildMetadata({ locale, path: isdPath(locale), title: m.title, description: m.description, translations: isdEditions() });
}

function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} rel="noopener" target="_blank">
      {children}
    </a>
  );
}

function Quote({ text, href, label, lang = "ca" }: { text: string; href: string; label: string; lang?: "ca" | "es" }) {
  return (
    <blockquote lang={lang}>
      <p>«{text}»</p>
      <footer className="text-sm">
        <A href={href}>{label}</A>
      </footer>
    </blockquote>
  );
}

/** The ATC page in the reader's language (Spanish for the English edition: the ATC has none). */
const srcUrl = (src: Source, locale: IsdLocale) => (locale === "ca" ? src.url : (src.urlEs ?? src.url));

const ATC_LABEL: Record<AtcExampleId, Record<IsdLocale, string>> = {
  son: { ca: "1. Fill de 30 anys, 120.000 € en un compte", es: "1. Hijo de 30 años, 120.000 € en una cuenta", en: "1. Son aged 30, €120,000 in an account" },
  mother: { ca: "2. Mare de 75 anys, 100.000 € i 50.000 € d'assegurança", es: "2. Madre de 75 años, 100.000 € y 50.000 € de seguro", en: "2. Mother aged 75, €100,000 and €50,000 life insurance" },
  brother: { ca: "3. Germà de 60 anys, 100.000 €", es: "3. Hermano de 60 años, 100.000 €", en: "3. Brother aged 60, €100,000" },
  spouse: { ca: "4. Vídua de 70 anys, base de 107.600 €", es: "4. Viuda de 70 años, base de 107.600 €", en: "4. Widow aged 70, €107,600 base" },
  "spouse-home": { ca: "5. Vídua de 70 anys, habitatge habitual de 100.000 €", es: "5. Viuda de 70 años, vivienda habitual de 100.000 €", en: "5. Widow aged 70, €100,000 habitual home" },
  "spouse-usufruct": { ca: "6. Vídua de 62 anys, usdefruit de 351.000 €, patrimoni de 600.000 €", es: "6. Viuda de 62 años, usufructo de 351.000 €, patrimonio de 600.000 €", en: "6. Widow aged 62, €351,000 usufruct, €600,000 prior wealth" },
};

const OWN_LABEL: Record<OwnExampleId, Record<IsdLocale, string>> = {
  "child-15": { ca: "Fill de 15 anys, 300.000 €", es: "Hijo de 15 años, 300.000 €", en: "Son aged 15, €300,000" },
  "daughter-home": { ca: "Filla de 50 anys, 400.000 € amb la meitat d'un habitatge de 300.000 €", es: "Hija de 50 años, 400.000 € con la mitad de una vivienda de 300.000 €", en: "Daughter aged 50, €400,000 including half of a €300,000 home" },
  niece: { ca: "Neboda de 45 anys, 200.000 €", es: "Sobrina de 45 años, 200.000 €", en: "Niece aged 45, €200,000" },
  friend: { ca: "Amic sense parentiu, 100.000 €", es: "Amigo sin parentesco, 100.000 €", en: "Unrelated friend, €100,000" },
};

function BonusTable({ table, locale, caption }: { table: readonly BonusSlice[]; locale: IsdLocale; caption: string }) {
  const M = (n: number) => money(n, locale);
  const P = (n: number) => percent(n, locale);
  const cols = L(locale, {
    ca: ["Base imposable des de", "Bonificació mitjana fins aquí", "Tram següent", "Bonificació del tram"],
    es: ["Base imponible desde", "Bonificación media hasta aquí", "Tramo siguiente", "Bonificación del tramo"],
    en: ["Taxable base from", "Average rebate up to here", "Next slice", "Rebate on the slice"],
  });
  return (
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
          {table.map((s) => (
            <tr key={s.from}>
              <th scope="row" className="font-normal" data-label={cols[0]}>
                {M(s.from)}
              </th>
              <td data-label={cols[1]}>{P(s.avg)}</td>
              <td data-label={cols[2]}>{s.width === null ? L(locale, { ca: "la resta", es: "el resto", en: "the rest" }) : M(s.width)}</td>
              <td data-label={cols[3]}>{P(s.marginal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ResultCells({ r, locale, cols }: { r: IsdOk; locale: IsdLocale; cols: string[] }) {
  const M = (n: number) => money(n, locale);
  return (
    <>
      <td data-label={cols[1]}>{M(r.baseImposable)}</td>
      <td data-label={cols[2]}>{M(r.baseLiquidable)}</td>
      <td data-label={cols[3]}>{M(r.quotaTributaria)}</td>
      <td data-label={cols[4]}>{r.bonusRule === "none" || r.quotaTributaria === 0 ? "—" : percent(r.bonusPct, locale)}</td>
      <td data-label={cols[5]}>
        <strong>{M(r.toPay)}</strong>
      </td>
    </>
  );
}

export function InheritanceTaxRoute({ locale }: { locale: IsdLocale }) {
  const meta = isdMeta(locale);
  const crumbs = isdCrumbs(locale);
  const M = (n: number) => money(n, locale);
  const P = (n: number) => percent(n, locale);
  const on = (iso: string) => elDay(iso, locale);
  const since = (iso: string) => sinceDay(iso, locale);
  const from = (iso: string) => fromDay(iso, locale);
  const art = (a: string) => codeArticle(a, locale);
  const faq = isdFaq(locale);
  const ex = examples();
  const son = ex.atc.find((e) => e.id === "son")!.result;
  const spouse = ex.atc.find((e) => e.id === "spouse")!.result;
  const brother = ex.atc.find((e) => e.id === "brother")!.result;
  const code = SOURCES.code.url;

  const lead = L(locale, {
    ca: `A Catalunya cada hereu paga segons el parentiu, l'edat i el que rep. Un fill de 30 anys que hereta 120.000 € paga ${M(son.toPay)}; el cònjuge té una bonificació del 99 % (una vídua amb 107.600 € de base en paga ${M(spouse.toPay)}); un germà que hereta 100.000 € en paga ${M(brother.toPay)}, sense bonificació. Són els exemples de l'Agència Tributària de Catalunya, i la calculadora els reprodueix pas a pas.`,
    es: `En Cataluña cada heredero paga según el parentesco, la edad y lo que recibe. Un hijo de 30 años que hereda 120.000 € paga ${M(son.toPay)}; el cónyuge tiene una bonificación del 99 % (una viuda con 107.600 € de base paga ${M(spouse.toPay)}); un hermano que hereda 100.000 € paga ${M(brother.toPay)}, sin bonificación. Son los ejemplos de la Agència Tributària de Catalunya, y la calculadora los reproduce paso a paso.`,
    en: `In Catalonia each heir pays according to their relationship to the deceased, their age and what they receive. A 30-year-old son inheriting €120,000 pays ${M(son.toPay)}; a spouse gets a 99% rebate (a widow with a €107,600 base pays ${M(spouse.toPay)}); a brother inheriting €100,000 pays ${M(brother.toPay)}, with no rebate. These are the Catalan Tax Agency's own examples, and the calculator reproduces them step by step.`,
  });
  const fresh = L(locale, {
    ca: `Normes revisades ${on(RULES_AS_OF)} al Codi tributari de Catalunya (llibre sisè, text consolidat vigent ${since(CODE_CONSOLIDATED_FROM)}) i a l'Agència Tributària de Catalunya. Es tornen a revisar ${from(RULES_UNTIL)}: les lleis de pressupostos solen canviar aquest impost.`,
    es: `Normas revisadas ${on(RULES_AS_OF)} en el Código tributario de Cataluña (libro sexto, texto consolidado vigente ${since(CODE_CONSOLIDATED_FROM)}) y en la Agència Tributària de Catalunya. Se revisan de nuevo ${from(RULES_UNTIL)}: las leyes de presupuestos suelen cambiar este impuesto.`,
    en: `Rules checked ${on(RULES_AS_OF)} in the Catalan Tax Code (book six, consolidated text in force ${since(CODE_CONSOLIDATED_FROM)}) and with the Agència Tributària de Catalunya. Due for a fresh check ${from(RULES_UNTIL)}: Catalan budget laws often change this tax.`,
  });
  const disclaimer = L(locale, {
    ca: "Estimació orientativa per a un hereu. El càlcul oficial és la teva autoliquidació a l'Agència Tributària de Catalunya (model 650, amb el model 660 de tota l'herència), que valora els béns, comprova les reduccions i hi suma, si escau, l'aixovar, les donacions anteriors i els interessos. Si l'herència té usdefruits, empreses, finques rústiques o béns a l'estranger, consulta-ho a l'ATC o a un assessor.",
    es: "Estimación orientativa para un heredero. El cálculo oficial es tu autoliquidación ante la Agència Tributària de Catalunya (modelo 650, con el modelo 660 de toda la herencia), que valora los bienes, comprueba las reducciones y suma, si procede, el ajuar, las donaciones anteriores y los intereses. Si la herencia tiene usufructos, empresas, fincas rústicas o bienes en el extranjero, consúltalo a la ATC o a un asesor.",
    en: "An estimate for one heir. The official calculation is your self-assessment with the Agència Tributària de Catalunya (form 650, with form 660 for the whole estate), which values the assets, checks the reductions and adds, where due, household goods, earlier gifts and interest. If the estate includes usufructs, businesses, rural land or assets abroad, ask the ATC or an adviser.",
  });

  const hd = L(locale, {
    ca: { how: "Com es calcula, pas a pas", groups: "Grups de parentiu i reduccions", scale: "Tarifa", coef: "Coeficients multiplicadors", bonus: "Bonificació", examples: "Els exemples de l'ATC, amb la calculadora", own: "Altres casos", home: "L'habitatge habitual: el 95 % i el límit de 500.000 €", file: "Termini, pròrroga i com es presenta", changes: "Què ha canviat i quan es revisa", faq: "Preguntes freqüents", sources: "Fonts oficials", limits: "Què no calcula" },
    es: { how: "Cómo se calcula, paso a paso", groups: "Grupos de parentesco y reducciones", scale: "Tarifa", coef: "Coeficientes multiplicadores", bonus: "Bonificación", examples: "Los ejemplos de la ATC, con la calculadora", own: "Otros casos", home: "La vivienda habitual: el 95 % y el límite de 500.000 €", file: "Plazo, prórroga y cómo se presenta", changes: "Qué ha cambiado y cuándo se revisa", faq: "Preguntas frecuentes", sources: "Fuentes oficiales", limits: "Qué no calcula" },
    en: { how: "How it is worked out, step by step", groups: "Kinship groups and reductions", scale: "Tax scale", coef: "Multiplying coefficients", bonus: "Rebate (bonificació)", examples: "The ATC's worked examples, through the calculator", own: "Other cases", home: "The habitual home: 95% off and the €500,000 cap", file: "Deadline, extension and how to file", changes: "What changed and when it is re-checked", faq: "Questions", sources: "Official sources", limits: "What it does not cover" },
  });

  const steps = L(locale, {
    ca: [
      `**Base imposable.** El que reps en net (béns menys deutes i despeses deduïbles) més l'assegurança de vida que cobres per la mort, quan la pòlissa la va contractar la persona morta.`,
      `**Reduccions** (${art("631-1")} i següents): per parentiu, per discapacitat o per tenir 75 anys o més (mai les dues), per assegurança de vida i per l'habitatge habitual de la persona morta. El que queda és la base liquidable, mai per sota de zero.`,
      `**Quota íntegra** (${art(ARTICLE.scale)}): la tarifa, del 7 % al 32 %, sobre la base liquidable.`,
      `**Quota tributària** (${art(ARTICLE.coefficient)}): la quota íntegra pel coeficient del teu grup i del teu patrimoni anterior (1 per als grups I i II fins a 500.000 €; 1,5882 per al grup III; 2 per al grup IV).`,
      `**Bonificació** (${art(ARTICLE.bonus)}): el 99 % per al cònjuge o la parella estable; per a la resta dels grups I i II, un percentatge mitjà segons la base imposable (del 99 % al 20 % al grup I, del 60 % al 0 % al grup II). Els grups III i IV no en tenen.`,
      `**A pagar** = quota tributària − bonificació.`,
    ],
    es: [
      `**Base imponible.** Lo que recibes en neto (bienes menos deudas y gastos deducibles) más el seguro de vida que cobras por el fallecimiento, cuando la póliza la contrató la persona fallecida.`,
      `**Reducciones** (${art("631-1")} y siguientes): por parentesco, por discapacidad o por tener 75 años o más (nunca las dos), por seguro de vida y por la vivienda habitual de la persona fallecida. Lo que queda es la base liquidable, nunca por debajo de cero.`,
      `**Cuota íntegra** (${art(ARTICLE.scale)}): la tarifa, del 7 % al 32 %, sobre la base liquidable.`,
      `**Cuota tributaria** (${art(ARTICLE.coefficient)}): la cuota íntegra por el coeficiente de tu grupo y de tu patrimonio previo (1 para los grupos I y II hasta 500.000 €; 1,5882 para el grupo III; 2 para el grupo IV).`,
      `**Bonificación** (${art(ARTICLE.bonus)}): el 99 % para el cónyuge o la pareja estable; para el resto de los grupos I y II, un porcentaje medio según la base imponible (del 99 % al 20 % en el grupo I, del 60 % al 0 % en el grupo II). Los grupos III y IV no tienen.`,
      `**A pagar** = cuota tributaria − bonificación.`,
    ],
    en: [
      `**Taxable base (base imposable).** What you receive, net (assets less debts and deductible costs), plus any life insurance paid because of the death on a policy the deceased took out.`,
      `**Reductions** (${art("631-1")} onwards): kinship, disability or being 75 or over (never both), life insurance and the deceased's habitual home. What is left is the net taxable base (base liquidable), never below zero.`,
      `**Gross tax (quota íntegra)** (${art(ARTICLE.scale)}): the scale, 7% to 32%, on the net taxable base.`,
      `**Tax after the coefficient (quota tributària)** (${art(ARTICLE.coefficient)}): the gross tax times the coefficient for your group and prior wealth (1 for groups I and II up to €500,000; 1.5882 for group III; 2 for group IV).`,
      `**Rebate (bonificació)** (${art(ARTICLE.bonus)}): 99% for a spouse or stable partner; for the rest of groups I and II, an average percentage set by the taxable base (99% down to 20% in group I, 60% down to 0% in group II). Groups III and IV get none.`,
      `**To pay** = tax after the coefficient − rebate.`,
    ],
  });
  const md = (text: string) => text.split(/\*\*/).map((p, i) => (i % 2 ? <strong key={i}>{p}</strong> : p));

  const groupRows: { group: Group; reduction: string }[] = [
    { group: "I", reduction: L(locale, { ca: `${M(KINSHIP_GROUP_I.base)} + ${M(KINSHIP_GROUP_I.perYear)} per cada any per sota dels 21, fins a ${M(KINSHIP_GROUP_I.max)}`, es: `${M(KINSHIP_GROUP_I.base)} + ${M(KINSHIP_GROUP_I.perYear)} por cada año por debajo de los 21, hasta ${M(KINSHIP_GROUP_I.max)}`, en: `${M(KINSHIP_GROUP_I.base)} + ${M(KINSHIP_GROUP_I.perYear)} for each year under 21, up to ${M(KINSHIP_GROUP_I.max)}` }) },
    { group: "II", reduction: L(locale, { ca: `Cònjuge ${M(KINSHIP.spouse)}; fill ${M(KINSHIP.child)}; altres descendents ${M(KINSHIP.descendant)}; ascendents ${M(KINSHIP.ascendant)}`, es: `Cónyuge ${M(KINSHIP.spouse)}; hijo ${M(KINSHIP.child)}; otros descendientes ${M(KINSHIP.descendant)}; ascendientes ${M(KINSHIP.ascendant)}`, en: `Spouse ${M(KINSHIP.spouse)}; child ${M(KINSHIP.child)}; other descendants ${M(KINSHIP.descendant)}; ascendants ${M(KINSHIP.ascendant)}` }) },
    { group: "III", reduction: M(KINSHIP.groupIII) },
    { group: "IV", reduction: L(locale, { ca: "Cap", es: "Ninguna", en: "None" }) },
  ];
  const groupCols = L(locale, { ca: ["Grup", "Qui", "Reducció per parentiu"], es: ["Grupo", "Quién", "Reducción por parentesco"], en: ["Group", "Who", "Kinship reduction"] });

  const otherReductions = L(locale, {
    ca: [
      `**Discapacitat** (${art(ARTICLE.disability)}): ${M(DISABILITY.from33)} amb un grau del 33 % o més; ${M(DISABILITY.from65)} amb el 65 % o més. Se suma a la de parentiu.`,
      `**75 anys o més** (${art(ARTICLE.elderly)}): ${M(ELDERLY.amount)} per a qui és del grup II; no se suma a la de discapacitat.`,
      `**Assegurança de vida** (${art(ARTICLE.insurance)}): el 100 % fins a ${M(INSURANCE.max)}, si ets cònjuge, descendent o ascendent de qui la va contractar; una sola vegada per hereu.`,
      `**Habitatge habitual de la persona morta** (${art(ARTICLE.home)}): el ${HOME.percent} % del seu valor, amb el límit que s'explica més avall.`,
    ],
    es: [
      `**Discapacidad** (${art(ARTICLE.disability)}): ${M(DISABILITY.from33)} con un grado del 33 % o más; ${M(DISABILITY.from65)} con el 65 % o más. Se suma a la de parentesco.`,
      `**75 años o más** (${art(ARTICLE.elderly)}): ${M(ELDERLY.amount)} para quien es del grupo II; no se suma a la de discapacidad.`,
      `**Seguro de vida** (${art(ARTICLE.insurance)}): el 100 % hasta ${M(INSURANCE.max)}, si eres cónyuge, descendiente o ascendiente de quien lo contrató; una sola vez por heredero.`,
      `**Vivienda habitual de la persona fallecida** (${art(ARTICLE.home)}): el ${HOME.percent} % de su valor, con el límite que se explica más abajo.`,
    ],
    en: [
      `**Disability** (${art(ARTICLE.disability)}): ${M(DISABILITY.from33)} with a recognised degree of 33% or more; ${M(DISABILITY.from65)} with 65% or more. It adds to the kinship reduction.`,
      `**Aged 75 or over** (${art(ARTICLE.elderly)}): ${M(ELDERLY.amount)} for group II heirs; it does not add to the disability one.`,
      `**Life insurance** (${art(ARTICLE.insurance)}): 100% up to ${M(INSURANCE.max)} if you are the policyholder's spouse, descendant or ascendant; once per heir.`,
      `**The deceased's habitual home** (${art(ARTICLE.home)}): ${HOME.percent}% of its value, with the cap explained below.`,
    ],
  });

  const scaleCols = L(locale, { ca: ["Base liquidable des de", "Quota fins aquí", "Tipus sobre la resta"], es: ["Base liquidable desde", "Cuota hasta aquí", "Tipo sobre el resto"], en: ["Net taxable base from", "Tax up to here", "Rate on the rest"] });
  const coefCols = L(locale, { ca: ["Patrimoni preexistent", "Grups I i II", "Grup III", "Grup IV"], es: ["Patrimonio preexistente", "Grupos I y II", "Grupo III", "Grupo IV"], en: ["Prior wealth", "Groups I and II", "Group III", "Group IV"] });
  const exCols = L(locale, {
    ca: ["Cas", "Base imposable", "Base liquidable", "Quota tributària", "Bonificació", "A pagar"],
    es: ["Caso", "Base imponible", "Base liquidable", "Cuota tributaria", "Bonificación", "A pagar"],
    en: ["Case", "Taxable base", "Net taxable base", "Tax after coefficient", "Rebate", "To pay"],
  });
  const coefRange = (i: number) => {
    const row = COEFFICIENTS[i]!;
    const prev = i > 0 ? COEFFICIENTS[i - 1]!.upTo! : null;
    if (prev === null) return L(locale, { ca: `Fins a ${M(row.upTo!)}`, es: `Hasta ${M(row.upTo!)}`, en: `Up to ${M(row.upTo!)}` });
    if (row.upTo === null) return L(locale, { ca: `Més de ${M(prev)}`, es: `Más de ${M(prev)}`, en: `Over ${M(prev)}` });
    return L(locale, { ca: `Més de ${M(prev)} fins a ${M(row.upTo)}`, es: `Más de ${M(prev)} hasta ${M(row.upTo)}`, en: `Over ${M(prev)} up to ${M(row.upTo)}` });
  };
  const c4 = (n: number) => num(n, 4, locale);

  const homeResults = ATC_HOME_EXAMPLES.map((e) => ({ id: e.id, input: e.input, result: calculateOk(e.input) }));
  const homeLabel = (id: (typeof ATC_HOME_EXAMPLES)[number]["id"]) =>
    ({
      "home-460k": L(locale, { ca: "Habitatge de 460.000 €, dues filles a parts iguals", es: "Vivienda de 460.000 €, dos hijas a partes iguales", en: "€460,000 home, two daughters in equal shares" }),
      "home-1m": L(locale, { ca: "Habitatge d'1.000.000 €, dos fills a parts iguals", es: "Vivienda de 1.000.000 €, dos hijos a partes iguales", en: "€1,000,000 home, two sons in equal shares" }),
      "home-half-1m": L(locale, { ca: "El 50 % d'un habitatge d'1.000.000 €, dos fills a parts iguals", es: "El 50 % de una vivienda de 1.000.000 €, dos hijos a partes iguales", en: "50% of a €1,000,000 home, two sons in equal shares" }),
    })[id];
  const homeCols = L(locale, {
    ca: ["Cas de l'ATC", "Habitatge en la part de cada fill", "95 %", "Límit de cada fill", "Reducció"],
    es: ["Caso de la ATC", "Vivienda en la parte de cada hijo", "95 %", "Límite de cada hijo", "Reducción"],
    en: ["ATC case", "Home in each child's share", "95%", "Each child's cap", "Reduction"],
  });

  const appSchema = {
    "@type": "WebApplication",
    name: meta.appName,
    url: absoluteUrl(isdPath(locale)),
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    inLanguage: locale,
    isAccessibleForFree: true,
    publisher: { "@id": ORGANIZATION_ID },
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description: meta.description,
  };
  const faqSchema = { "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };

  const officialLinks = (
    <>
      <A href={srcUrl(SOURCES.atcFile, locale)}>{L(locale, { ca: "ATC: declarar una herència (models 660 i 650)", es: "ATC: declarar una herencia (modelos 660 y 650)", en: "ATC: filing an inheritance (forms 660 and 650, in Spanish)" })}</A> ·{" "}
      <A href={srcUrl(SOURCES.atcHelpProgram, locale)}>{L(locale, { ca: "programa d'ajuda del model 650", es: "programa de ayuda del modelo 650", en: "form 650 help program" })}</A>
    </>
  );

  return (
    <>
      <SiteHeader locale={locale} translations={isdEditions()} />
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
              <InheritanceTaxCalculator locale={locale} initial={DEFAULT_INPUT} />
              <p className="text-sm text-[var(--color-muted)]">
                {disclaimer} {officialLinks}.
              </p>
              <CalculatorNextStep current="inheritance-tax" locale={locale} />

              <h2 id="com-es-calcula">{hd.how}</h2>
              <ol>
                {steps.map((s) => (
                  <li key={s}>{md(s)}</li>
                ))}
              </ol>

              <h2 id="grups">{hd.groups}</h2>
              <div className="ci-table-scroll mt-4">
                <table className="ci-local-table ci-stack-table">
                  <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">{art(ARTICLE.kinship)}</caption>
                  <thead>
                    <tr>
                      {groupCols.map((c) => (
                        <th key={c} scope="col">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {groupRows.map((g) => (
                      <tr key={g.group}>
                        <th scope="row" className="font-normal" data-label={groupCols[0]}>
                          {GROUP_LABEL[g.group][locale]}
                        </th>
                        <td data-label={groupCols[1]}>{GROUP_WHO[g.group][locale]}</td>
                        <td data-label={groupCols[2]}>{g.reduction}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>
                {L(locale, {
                  ca: "La parella estable compta com a cònjuge (art. 634-1) i els fills del cònjuge o de la parella, com a fills (art. 634-2); també les persones acollides (art. 634-3).",
                  es: "La pareja estable cuenta como cónyuge (art. 634-1) y los hijos del cónyuge o de la pareja, como hijos (art. 634-2); también las personas acogidas (art. 634-3).",
                  en: "A stable partner counts as a spouse (art. 634-1) and the spouse's or partner's children as children (art. 634-2); so do foster children (art. 634-3).",
                })}
              </p>
              <Quote text={`${QUOTE.groupI} ${QUOTE.groupII} ${QUOTE.groupIII} ${QUOTE.groupIV}`} href={code} label={art(ARTICLE.kinship)} />
              <Quote text={QUOTE.partners} href={code} label={art(ARTICLE.partners)} />
              <ul>
                {otherReductions.map((r) => (
                  <li key={r}>{md(r)}</li>
                ))}
              </ul>
              <Quote text={QUOTE.disability} href={code} label={art(ARTICLE.disability)} />
              <Quote text={QUOTE.elderly} href={code} label={art(ARTICLE.elderly)} />
              <Quote text={`${QUOTE.insurance} ${QUOTE.insuranceOnce}`} href={code} label={art(ARTICLE.insurance)} />
              <Quote text={QUOTE.insuranceAccumulates} href={srcUrl(SOURCES.atcInsuranceBase, "ca")} label={L(locale, { ca: "Agència Tributària de Catalunya, assegurances de vida: base imposable", es: "Agència Tributària de Catalunya, seguros de vida: base imponible (en catalán)", en: "Agència Tributària de Catalunya, life insurance: taxable base (in Catalan)" })} />

              <h2 id="tarifa">{hd.scale}</h2>
              <div className="ci-table-scroll mt-4">
                <table className="ci-local-table ci-stack-table">
                  <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">
                    {art(ARTICLE.scale)} · {L(locale, { ca: `aplicable ${since(SCALE_FROM)} (ATC)`, es: `aplicable ${since(SCALE_FROM)} (ATC)`, en: `in force ${since(SCALE_FROM)} (ATC)` })}
                  </caption>
                  <thead>
                    <tr>
                      {scaleCols.map((c) => (
                        <th key={c} scope="col">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SCALE.map((row) => (
                      <tr key={row.from}>
                        <th scope="row" className="font-normal" data-label={scaleCols[0]}>
                          {M(row.from)}
                        </th>
                        <td data-label={scaleCols[1]}>{M(row.quota)}</td>
                        <td data-label={scaleCols[2]}>{P(row.rate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Quote text={QUOTE.scale} href={code} label={art(ARTICLE.scale)} />

              <h2 id="coeficients">{hd.coef}</h2>
              <div className="ci-table-scroll mt-4">
                <table className="ci-local-table ci-stack-table">
                  <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">
                    {art(ARTICLE.coefficient)} · {L(locale, { ca: `aplicables ${since(COEFFICIENTS_FROM)} (ATC)`, es: `aplicables ${since(COEFFICIENTS_FROM)} (ATC)`, en: `in force ${since(COEFFICIENTS_FROM)} (ATC)` })}
                  </caption>
                  <thead>
                    <tr>
                      {coefCols.map((c) => (
                        <th key={c} scope="col">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COEFFICIENTS.map((row, i) => (
                      <tr key={i}>
                        <th scope="row" className="font-normal" data-label={coefCols[0]}>
                          {coefRange(i)}
                        </th>
                        <td data-label={coefCols[1]}>{c4(row.groupsIandII)}</td>
                        <td data-label={coefCols[2]}>{c4(row.groupIII)}</td>
                        <td data-label={coefCols[3]}>{c4(row.groupIV)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Quote text={QUOTE.coefficient} href={code} label={art(ARTICLE.coefficient)} />
              <p>
                {L(locale, {
                  ca: "Just per sobre d'un tram de patrimoni, la quota no pot créixer més que el que el teu patrimoni passa del tram anterior (regla de l'excés de quota, que l'ATC aplica d'acord amb la llei estatal). La calculadora també l'aplica:",
                  es: "Justo por encima de un tramo de patrimonio, la cuota no puede crecer más de lo que tu patrimonio pasa del tramo anterior (regla del exceso de cuota, que la ATC aplica de acuerdo con la ley estatal). La calculadora también la aplica:",
                  en: "Just above a prior-wealth bracket, the tax cannot grow by more than your wealth exceeds the bracket below (the excess rule, which the ATC applies under the state law). The calculator applies it too:",
                })}
              </p>
              <Quote text={QUOTE.excess} href={srcUrl(SOURCES.atcScale, "ca")} label={L(locale, { ca: "Agència Tributària de Catalunya, tarifa i coeficients (Llei 29/1987, art. 22.2)", es: "Agència Tributària de Catalunya, tarifa y coeficientes (Ley 29/1987, art. 22.2; en catalán)", en: "Agència Tributària de Catalunya, scale and coefficients (Law 29/1987, art. 22.2; in Catalan)" })} />

              <h2 id="bonificacio">{hd.bonus}</h2>
              <p>
                {L(locale, {
                  ca: `El cònjuge i la parella estable es bonifiquen el ${P(SPOUSE_BONUS)} de la quota. ${capitalize(since(GENDER_VIOLENCE_BONUS_FROM))}, també els descendents i ascendents per consanguinitat d'una dona morta com a conseqüència de violència masclista (apartat 1 bis, afegit pel Decret llei 5/2025). La resta dels grups I i II apliquen el percentatge mitjà de les taules següents sobre la base imposable (no sobre la base liquidable), arrodonit a dos decimals. Aquest règim s'aplica a les morts ${since(BONUS_FROM)}.`,
                  es: `El cónyuge y la pareja estable se bonifican el ${P(SPOUSE_BONUS)} de la cuota. ${capitalize(since(GENDER_VIOLENCE_BONUS_FROM))}, también los descendientes y ascendientes por consanguinidad de una mujer fallecida a consecuencia de violencia machista (apartado 1 bis, añadido por el Decreto ley 5/2025). El resto de los grupos I y II aplican el porcentaje medio de las tablas siguientes sobre la base imponible (no sobre la base liquidable), redondeado a dos decimales. Este régimen se aplica a los fallecimientos ${since(BONUS_FROM)}.`,
                  en: `A spouse or stable partner gets ${P(SPOUSE_BONUS)} off the tax. ${capitalize(since(GENDER_VIOLENCE_BONUS_FROM))}, so do the blood descendants and ascendants of a woman killed by gender violence (section 1 bis, added by Decree-law 5/2025). The rest of groups I and II apply the average percentage of the tables below to the taxable base (not the net taxable base), rounded to two decimals. This regime applies to deaths ${since(BONUS_FROM)}.`,
                })}
              </p>
              <Quote text={QUOTE.spouseBonus} href={code} label={`${art(ARTICLE.bonus)}.1`} />
              <Quote text={QUOTE.genderViolenceBonus} href={code} label={`${art(ARTICLE.bonus)}.1 bis`} />
              <Quote text={QUOTE.groupBonus} href={code} label={`${art(ARTICLE.bonus)}.2`} />
              <BonusTable table={BONUS_GROUP_I} locale={locale} caption={L(locale, { ca: "a) Grup I (menors de 21 anys)", es: "a) Grupo I (menores de 21 años)", en: "a) Group I (under 21)" })} />
              <BonusTable table={BONUS_GROUP_II} locale={locale} caption={L(locale, { ca: "b) Resta del grup II (fills i descendents de 21 anys o més, ascendents)", es: "b) Resto del grupo II (hijos y descendientes de 21 años o más, ascendientes)", en: "b) Rest of group II (children and descendants aged 21 or over, ascendants)" })} />
              <Quote text={QUOTE.bonusRounding} href={code} label={`${art(ARTICLE.bonus)}.5`} />
              <p>
                {L(locale, {
                  ca: "Qui opta per les reduccions per empresa familiar, explotacions agràries o finques i béns protegits perd la bonificació (no el cònjuge); la de l'habitatge habitual sí que s'hi pot sumar:",
                  es: "Quien opta por las reducciones por empresa familiar, explotaciones agrarias o fincas y bienes protegidos pierde la bonificación (no el cónyuge); la de la vivienda habitual sí puede sumarse:",
                  en: "Heirs who choose the family-business, farm or protected-property reductions lose the rebate (spouses do not); the habitual home reduction can still be added:",
                })}
              </p>
              <Quote text={QUOTE.bonusExclusion} href={code} label={`${art(ARTICLE.bonus)}.4`} />

              <h2 id="exemples">{hd.examples}</h2>
              <p>
                {L(locale, {
                  ca: "Els sis casos pràctics de l'ATC (morts del 2023, amb les mateixes normes d'avui). La calculadora dona les mateixes xifres que l'ATC; els tests del web ho comproven a cada canvi. Del cas 6 només hi ha la vídua usufructuària: la nua propietat del fill necessita la base imposable teòrica, que aquesta calculadora no fa.",
                  es: "Los seis casos prácticos de la ATC (fallecimientos de 2023, con las mismas normas de hoy). La calculadora da las mismas cifras que la ATC; los tests de la web lo comprueban en cada cambio. Del caso 6 solo está la viuda usufructuaria: la nuda propiedad del hijo necesita la base imponible teórica, que esta calculadora no hace.",
                  en: "The ATC's six worked examples (deaths in 2023, under the same rules as today). The calculator gives the ATC's own figures; the site's tests check it on every change. Of case 6 only the widow's usufruct is shown: the son's bare ownership needs the theoretical taxable base, which this calculator does not do.",
                })}{" "}
                <A href={srcUrl(SOURCES.atcExamples, locale)}>{L(locale, { ca: "ATC: exemples pràctics d'herències", es: "ATC: ejemplos prácticos de herencias", en: "ATC: worked inheritance examples (in Spanish)" })}</A>.
              </p>
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
                    {ex.atc.map(({ id, result }) => (
                      <tr key={id}>
                        <th scope="row" className="font-normal">
                          {ATC_LABEL[id][locale]}
                        </th>
                        <ResultCells r={result} locale={locale} cols={exCols} />
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm">
                {L(locale, {
                  ca: `ATC, a pagar: ${ATC_EXAMPLES.map((e) => M(e.official.toPay)).join(" · ")}.`,
                  es: `ATC, a pagar: ${ATC_EXAMPLES.map((e) => M(e.official.toPay)).join(" · ")}.`,
                  en: `ATC, to pay: ${ATC_EXAMPLES.map((e) => M(e.official.toPay)).join(" · ")}.`,
                })}
              </p>

              <h3 id="altres-casos">{hd.own}</h3>
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
                    {ex.own.map(({ id, result }) => (
                      <tr key={id}>
                        <th scope="row" className="font-normal">
                          {OWN_LABEL[id][locale]}
                        </th>
                        <ResultCells r={result} locale={locale} cols={exCols} />
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h2 id="habitatge">{hd.home}</h2>
              <p>
                {L(locale, {
                  ca: `Si a l'herència hi ha l'habitatge habitual de la persona morta, el cònjuge, els descendents i els ascendents redueixen el ${HOME.percent} % del seu valor. El límit és de ${M(HOME.sharedCap)} per a tot l'habitatge, repartit entre els hereus segons la seva part; però cap hereu no té un límit de menys de ${M(HOME.individualFloor)}. Els germans, nebots i altres col·laterals només hi tenen dret amb més de ${HOME.collateralAgeOver} anys i si hi van conviure els ${HOME.cohabitationYears} anys anteriors a la mort. Cal conservar l'habitatge (o el que el substitueixi) ${HOME.keepYears} anys.`,
                  es: `Si en la herencia está la vivienda habitual de la persona fallecida, el cónyuge, los descendientes y los ascendientes reducen el ${HOME.percent} % de su valor. El límite es de ${M(HOME.sharedCap)} para toda la vivienda, repartido entre los herederos según su parte; pero ningún heredero tiene un límite de menos de ${M(HOME.individualFloor)}. Los hermanos, sobrinos y otros colaterales solo tienen derecho con más de ${HOME.collateralAgeOver} años y si convivieron los ${HOME.cohabitationYears} años anteriores a la muerte. Hay que conservar la vivienda (o la que la sustituya) ${HOME.keepYears} años.`,
                  en: `If the deceased's habitual home is in the estate, the spouse, descendants and ascendants take ${HOME.percent}% of its value off. The cap is ${M(HOME.sharedCap)} for the whole home, split between the heirs by their share, but no heir's cap is below ${M(HOME.individualFloor)}. Siblings, nephews, nieces and other collaterals qualify only when over ${HOME.collateralAgeOver} and after living with the deceased for the ${HOME.cohabitationYears} years before the death. The home (or the one that replaces it) must be kept for ${HOME.keepYears} years.`,
                })}
              </p>
              <div className="ci-table-scroll mt-4">
                <table className="ci-local-table ci-stack-table">
                  <thead>
                    <tr>
                      {homeCols.map((c) => (
                        <th key={c} scope="col">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {homeResults.map(({ id, result }) => (
                      <tr key={id}>
                        <th scope="row" className="font-normal">
                          {homeLabel(id)}
                        </th>
                        <td data-label={homeCols[1]}>{M(result.home.value)}</td>
                        <td data-label={homeCols[2]}>{M(result.home.theoretical)}</td>
                        <td data-label={homeCols[3]}>{M(result.home.cap)}</td>
                        <td data-label={homeCols[4]}>
                          <strong>{M(result.reductions.find((r) => r.id === "home")?.amount ?? 0)}</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Quote text={QUOTE.home} href={code} label={art(ARTICLE.home)} />
              <Quote text={QUOTE.homeAtcExample3} href={srcUrl(SOURCES.atcReductions, "ca")} label={L(locale, { ca: "Agència Tributària de Catalunya, reduccions: exemple 3", es: "Agència Tributària de Catalunya, reducciones: ejemplo 3 (en catalán)", en: "Agència Tributària de Catalunya, reductions: example 3 (in Catalan)" })} />
              <Quote text={QUOTE.homeCollaterals} href={code} label={art(ARTICLE.homeCollaterals)} />
              <Quote text={QUOTE.homeKeep} href={code} label={art(ARTICLE.homeKeep)} />
              <p>
                {L(locale, {
                  ca: "Si després vens l'habitatge heretat o en compres un altre, mira també",
                  es: "Si después vendes la vivienda heredada o compras otra, mira también",
                  en: "If you then sell the inherited home or buy another one, see also",
                })}{" "}
                <Link href={calcPath("home-purchase-tax", locale)}>{L(locale, { ca: "els impostos en comprar habitatge", es: "los impuestos al comprar vivienda", en: "the taxes on buying a home" })}</Link>.
              </p>

              <h2 id="termini">{hd.file}</h2>
              <ul>
                <li>
                  {L(locale, {
                    ca: `**Termini:** ${DEADLINE.months} mesos des del dia de la mort. Dins els ${DEADLINE.askWithinMonths} primers mesos es pot demanar una pròrroga de ${DEADLINE.extensionMonths} mesos més, amb interessos de demora pels dies prorrogats.`,
                    es: `**Plazo:** ${DEADLINE.months} meses desde el día del fallecimiento. Dentro de los ${DEADLINE.askWithinMonths} primeros meses se puede pedir una prórroga de ${DEADLINE.extensionMonths} meses más, con intereses de demora por los días prorrogados.`,
                    en: `**Deadline:** ${DEADLINE.months} months from the day of the death. Within the first ${DEADLINE.askWithinMonths} months you can ask for ${DEADLINE.extensionMonths} more months, with late-payment interest for the extra days.`,
                  })
                    .split(/\*\*/)
                    .map((p, i) => (i % 2 ? <strong key={i}>{p}</strong> : p))}
                </li>
                <li>
                  {L(locale, {
                    ca: "**Com:** a l'Agència Tributària de Catalunya, amb el model 660 (la relació de béns de tota l'herència) i un model 650 per a cada hereu. Es fan amb el programa d'ajuda de l'ATC i es presenten per internet, o a les oficines amb el seu servei d'assistència.",
                    es: "**Cómo:** en la Agència Tributària de Catalunya, con el modelo 660 (la relación de bienes de toda la herencia) y un modelo 650 por cada heredero. Se hacen con el programa de ayuda de la ATC y se presentan por internet, o en sus oficinas con el servicio de asistencia.",
                    en: "**How:** with the Agència Tributària de Catalunya, on form 660 (the list of the whole estate's assets) and one form 650 per heir. They are prepared with the ATC's help program and filed online, or at its offices with its assistance service.",
                  })
                    .split(/\*\*/)
                    .map((p, i) => (i % 2 ? <strong key={i}>{p}</strong> : p))}
                </li>
                <li>
                  {L(locale, {
                    ca: "**On:** si la persona morta vivia a Espanya i tu també, a la comunitat on va viure més dies dels últims cinc anys. Si l'hereu no viu a Espanya, a l'Agència Tributària de l'Estat (AEAT).",
                    es: "**Dónde:** si la persona fallecida vivía en España y tú también, en la comunidad donde vivió más días de los últimos cinco años. Si el heredero no vive en España, en la Agencia Tributaria del Estado (AEAT).",
                    en: "**Where:** if the deceased lived in Spain and so do you, in the region where the deceased lived the most days of the last five years. If the heir does not live in Spain, with the State Tax Agency (AEAT).",
                  })
                    .split(/\*\*/)
                    .map((p, i) => (i % 2 ? <strong key={i}>{p}</strong> : p))}
                </li>
              </ul>
              <Quote text={QUOTE.deadlineAtc} href={srcUrl(SOURCES.atcDeadline, "ca")} label={L(locale, { ca: "Agència Tributària de Catalunya, termini i pròrroga", es: "Agència Tributària de Catalunya, plazo y prórroga (en catalán)", en: "Agència Tributària de Catalunya, deadline and extension (in Catalan)" })} />
              <Quote text={QUOTE.deadlineBoe} href={SOURCES.risd.url} label={L(locale, { ca: "Reial decret 1629/1991, art. 67.1", es: "Real Decreto 1629/1991, art. 67.1", en: "Royal Decree 1629/1991, art. 67.1" })} lang="es" />
              <Quote text={QUOTE.extensionBoe} href={SOURCES.risd.url} label={L(locale, { ca: "Reial decret 1629/1991, art. 68.2", es: "Real Decreto 1629/1991, art. 68.2", en: "Royal Decree 1629/1991, art. 68.2" })} lang="es" />
              <Quote text={QUOTE.model650} href={srcUrl(SOURCES.atcFile, "ca")} label={L(locale, { ca: "Agència Tributària de Catalunya, declarar una herència", es: "Agència Tributària de Catalunya, declarar una herencia (en catalán)", en: "Agència Tributària de Catalunya, filing an inheritance (in Catalan)" })} />
              <Quote text={QUOTE.competence} href={srcUrl(SOURCES.atcCompetence, "ca")} label={L(locale, { ca: "Agència Tributària de Catalunya, administració competent", es: "Agència Tributària de Catalunya, administración competente (en catalán)", en: "Agència Tributària de Catalunya, which tax office (in Catalan)" })} />
              <p>
                {L(locale, {
                  ca: `L'ATC no publica cap simulador d'aquest impost a la seva pàgina de simuladors: el càlcul oficial el fa el programa d'ajuda del model 650 (versió 2026 per a Windows publicada ${on(HELP_PROGRAM_PUBLISHED)}).`,
                  es: `La ATC no publica ningún simulador de este impuesto en su página de simuladores: el cálculo oficial lo hace el programa de ayuda del modelo 650 (versión 2026 para Windows publicada ${on(HELP_PROGRAM_PUBLISHED)}).`,
                  en: `The ATC lists no simulator for this tax on its simulators page: the official calculation is the form 650 help program (2026 version for Windows, published ${on(HELP_PROGRAM_PUBLISHED)}).`,
                })}{" "}
                {officialLinks}.
              </p>

              <InheritanceByRegion current="inheritance-tax" locale={locale} />

              <h2 id="canvis">{hd.changes}</h2>
              <ul>
                <li>
                  {L(locale, {
                    ca: "Des del 15 de març de 2024 les normes catalanes de l'impost ja no són a la Llei 19/2010: el Decret legislatiu 1/2024 les va refondre al llibre sisè del Codi tributari de Catalunya i va derogar la llei. Els imports no van canviar.",
                    es: "Desde el 15 de marzo de 2024 las normas catalanas del impuesto ya no están en la Ley 19/2010: el Decreto legislativo 1/2024 las refundió en el libro sexto del Código tributario de Cataluña y derogó la ley. Los importes no cambiaron.",
                    en: "Since 15 March 2024 the Catalan rules of the tax are no longer in Law 19/2010: Legislative Decree 1/2024 recast them into book six of the Catalan Tax Code and repealed the law. The amounts did not change.",
                  })}
                </li>
                <li>
                  {L(locale, {
                    ca: `${capitalize(since(GENDER_VIOLENCE_BONUS_FROM))}: bonificació del 99 % per als descendents i ascendents d'una víctima mortal de violència masclista (Decret llei 5/2025).`,
                    es: `${capitalize(since(GENDER_VIOLENCE_BONUS_FROM))}: bonificación del 99 % para los descendientes y ascendientes de una víctima mortal de violencia machista (Decreto ley 5/2025).`,
                    en: `${capitalize(since(GENDER_VIOLENCE_BONUS_FROM))}: a 99% rebate for the descendants and ascendants of a woman killed by gender violence (Decree-law 5/2025).`,
                  })}
                </li>
                <li>
                  {L(locale, {
                    ca: "La Llei 11/2026, de mesures fiscals del pressupost del 2026 (9 de juliol), no va tocar la tarifa, les reduccions ni la bonificació de les herències.",
                    es: "La Ley 11/2026, de medidas fiscales del presupuesto de 2026 (9 de julio), no tocó la tarifa, las reducciones ni la bonificación de las herencias.",
                    en: "Law 11/2026, the fiscal measures of the 2026 budget (9 July), did not change the scale, the reductions or the rebate for inheritances.",
                  })}
                </li>
                <li>
                  {L(locale, {
                    ca: `${capitalize(on(RULES_AS_OF))} encara no s'havia publicat cap canvi per al 2027. Ho tornarem a mirar ${from(RULES_UNTIL)}.`,
                    es: `${capitalize(on(RULES_AS_OF))} aún no se había publicado ningún cambio para 2027. Lo volveremos a mirar ${from(RULES_UNTIL)}.`,
                    en: `As of ${dayMonthYear(RULES_AS_OF, locale)} no change for 2027 had been published. We will check again ${from(RULES_UNTIL)}.`,
                  })}
                </li>
              </ul>

              <h2 id="preguntes">{hd.faq}</h2>
              {faq.map((f) => (
                <section key={f.q}>
                  <h3>{f.q}</h3>
                  <p>{f.a}</p>
                </section>
              ))}

              <h2 id="fonts">{hd.sources}</h2>
              <p>
                {L(locale, {
                  ca: `Llegides ${on(RULES_AS_OF)}. Les cites són literals, en català (les del BOE, en castellà). Els textos consolidats del Portal Jurídic no tenen caràcter oficial: la versió oficial és la del DOGC.`,
                  es: `Leídas ${on(RULES_AS_OF)}. Las citas son literales, en catalán (las del BOE, en castellano). Los textos consolidados del Portal Jurídic no tienen carácter oficial: la versión oficial es la del DOGC.`,
                  en: `Read ${on(RULES_AS_OF)}. Quotes are verbatim, in Catalan (the BOE's in Spanish). The Portal Jurídic's consolidated texts are not official: the DOGC's version is.`,
                })}
              </p>
              <ul>
                {Object.values(SOURCES).map((src: Source) => (
                  <li key={src.url}>
                    <A href={srcUrl(src, locale)}>{src.name}</A> ({src.publisher}, {src.ref})
                  </li>
                ))}
              </ul>

              <h2 id="limits">{hd.limits}</h2>
              <ul>
                {L(locale, {
                  ca: [
                    "Usdefruits i nua propietat (base imposable teòrica), consolidació del domini.",
                    "Reduccions per empresa familiar, participacions, explotacions agràries, finques forestals, patrimoni cultural o natural i sobreimposició decennal.",
                    "Pòlisses d'assegurança contractades abans del 19 de gener de 1987, donacions dels quatre anys anteriors que s'acumulen i deducció per doble imposició internacional.",
                    "La valoració dels béns, l'aixovar domèstic i els deutes deduïbles: escriu el net que et toca.",
                    "Herències que no gestiona l'ATC (persona morta resident en una altra comunitat o a l'estranger, hereu no resident).",
                  ],
                  es: [
                    "Usufructos y nuda propiedad (base imponible teórica), consolidación del dominio.",
                    "Reducciones por empresa familiar, participaciones, explotaciones agrarias, fincas forestales, patrimonio cultural o natural y sobreimposición decenal.",
                    "Pólizas de seguro contratadas antes del 19 de enero de 1987, donaciones de los cuatro años anteriores que se acumulan y deducción por doble imposición internacional.",
                    "La valoración de los bienes, el ajuar doméstico y las deudas deducibles: escribe el neto que te toca.",
                    "Herencias que no gestiona la ATC (persona fallecida residente en otra comunidad o en el extranjero, heredero no residente).",
                  ],
                  en: [
                    "Usufruct and bare ownership (theoretical taxable base), consolidation of ownership.",
                    "Reductions for family businesses, shareholdings, farms, forest estates, cultural or natural heritage and the ten-year repeated-transfer reduction.",
                    "Insurance policies taken out before 19 January 1987, gifts of the previous four years that are added in, and the international double-taxation deduction.",
                    "Valuing the assets, household goods and deductible debts: enter the net amount that is yours.",
                    "Estates the ATC does not handle (the deceased lived in another region or abroad, or the heir lives outside Spain).",
                  ],
                }).map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
              <p className="text-sm text-[var(--color-muted)]">{disclaimer}</p>

              <MoreCalculators current="inheritance-tax" locale={locale} />
            </div>
            <ShareBar locale={locale} path={isdPath(locale)} title={meta.h1} contentType="inheritance_tax_calculator" variant="full" />
          </div>
        </article>
      </main>
      <JsonLd json={graph([breadcrumbSchema(crumbs), appSchema, faqSchema])} />
      <SiteFooter locale={locale} />
    </>
  );
}
