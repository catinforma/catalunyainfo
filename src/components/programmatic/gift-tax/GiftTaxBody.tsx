import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { ShareBar } from "@/components/share/ShareBar";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { GIFT_AGENCY, GIFT_REGION_IN, giftCite, giftEditions, giftLawName, giftPath, type GiftLocale } from "@/lib/programmatic/gift-tax/copy";
import { GIFT_RULES, giftDeadline, giftDefaultInput, giftExample, giftExampleResults, giftFaq, giftMeta } from "@/lib/programmatic/gift-tax/page";
import { GIFT_PROFILES, type GiftQuoteRef } from "@/lib/programmatic/gift-tax/profiles";
import { RULES_AS_OF, RULES_UNTIL, type GiftSource } from "@/lib/programmatic/gift-tax/regions/state";
import type { GiftRegionId } from "@/lib/programmatic/gift-tax/regions/types";
import { GROUP_LABEL, GROUP_WHO, elDay, fromDay, money, num, percent, sinceDay } from "@/lib/programmatic/inheritance-tax/copy";
import { STATE_GROUP_WHO } from "@/lib/programmatic/inheritance-tax/regional-copy";
import type { Group } from "@/lib/programmatic/inheritance-tax/rules";
import { absoluteUrl } from "@/lib/site";
import { ORGANIZATION_ID, breadcrumbSchema, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

import { GiftByRegion } from "./GiftByRegion";
import { GiftTaxCalculator } from "./GiftTaxCalculator";

/**
 * The page of the four gift tax calculators (Catalonia, Madrid, Andalucía,
 * Comunitat Valenciana): the calculator (server-rendered on the first
 * example), how it is worked out, the formal requirements, the reductions,
 * the scale, the coefficients, the rebate, earlier gifts, the examples
 * (each agency's own, to the cent), the deadline and form 651, the other
 * communities and the same community's inheritance tax, what changed,
 * questions, sources and limits. Every figure comes from the community's
 * rules (lib/programmatic/gift-tax/regions/) through the engine. Each
 * community has its own small page component (CataloniaGiftTaxPage.tsx …)
 * that passes the breadcrumb, the next step and "More calculators".
 */

const L = <T,>(locale: GiftLocale, v: Record<GiftLocale, T>): T => v[locale];

export function giftMetadata(region: GiftRegionId, locale: GiftLocale): Metadata {
  const m = giftMeta(region, locale);
  return buildMetadata({ locale, path: giftPath(region, locale), title: m.title, description: m.description, translations: giftEditions(region) });
}

function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} rel="noopener" target="_blank">
      {children}
    </a>
  );
}

function Quote({ q, locale }: { q: GiftQuoteRef; locale: GiftLocale }) {
  return (
    <blockquote lang={q.lang}>
      <p>«{q.text}»</p>
      <footer className="text-sm">
        <A href={q.href}>{q.cite ? giftCite(q.cite, locale) : q.label![locale]}</A>
      </footer>
    </blockquote>
  );
}

/** The publisher's edition in the reader's language when there is one. */
const srcUrl = (src: GiftSource, locale: GiftLocale) => (locale === "ca" ? (src.urlCa ?? src.url) : (src.urlEs ?? src.url));

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

export function GiftTaxBody({ region, locale, crumbs, nextStep, more }: { region: GiftRegionId; locale: GiftLocale; crumbs: Crumb[]; nextStep: ReactNode; more: ReactNode }) {
  const rules = GIFT_RULES[region];
  const profile = GIFT_PROFILES[region];
  const meta = giftMeta(region, locale);
  const faq = giftFaq(region, locale);
  const examples = giftExampleResults(region);
  const M = (n: number) => money(n, locale);
  const P = (n: number) => percent(n, locale);
  const on = (iso: string) => elDay(iso, locale);
  const since = (iso: string) => sinceDay(iso, locale);
  const from = (iso: string) => fromDay(iso, locale);
  const c = (k: keyof typeof rules.cite) => giftCite(rules.cite[k]!, locale);
  const where = GIFT_REGION_IN[region][locale];
  const agency = GIFT_AGENCY[region][locale];
  const law = giftLawName(region, locale);
  const first = rules.coefficients[0]!;
  const flat = rules.coefficients.length === 1;
  const scaleMin = rules.scale[0]!.rate;
  const scaleMax = rules.scale[rules.scale.length - 1]!.rate;
  const b = rules.bonus;
  const h = rules.home;
  const textOf = { ca: "el Portal Jurídic de Catalunya", es: "el Portal Jurídic de Catalunya", en: "the Portal Jurídic de Catalunya" };
  const boe = { ca: "el text consolidat del BOE", es: "el texto consolidado del BOE", en: "the BOE's consolidated text" };

  const lead = {
    catalonia: () => {
      const deed = giftExample("catalonia", "atc-1");
      const noDeed = giftExample("catalonia", "atc-2");
      return L(locale, {
        ca: `A Catalunya les donacions no tenen bonificació, però fills, néts, cònjuge i pares paguen una tarifa reduïda (5 %, 7 % i 9 %) si la donació es fa en escriptura pública: un fill que rep 275.000 € paga ${M(deed.toPay)}, i sense escriptura, ${M(noDeed.toPay)}. Per al primer habitatge d'un descendent de 36 anys o menys hi ha una reducció del 95 %, fins a 60.000 €. La calculadora reprodueix al cèntim els casos pràctics de l'ATC.`,
        es: `En Cataluña las donaciones no tienen bonificación, pero hijos, nietos, cónyuge y padres pagan una tarifa reducida (5 %, 7 % y 9 %) si la donación se hace en escritura pública: un hijo que recibe 275.000 € paga ${M(deed.toPay)}, y sin escritura, ${M(noDeed.toPay)}. Para la primera vivienda de un descendiente de 36 años o menos hay una reducción del 95 %, hasta 60.000 €. La calculadora reproduce al céntimo los casos prácticos de la ATC.`,
        en: `In Catalonia gifts get no rebate, but children, grandchildren, spouses and parents pay a reduced scale (5%, 7% and 9%) when the gift is made in a public deed: a son given €275,000 pays ${M(deed.toPay)}, and without a deed ${M(noDeed.toPay)}. For the first home of a descendant aged 36 or under there is a 95% reduction, up to €60,000. The calculator reproduces the Catalan Tax Agency's worked cases to the cent.`,
      });
    },
    madrid: () => {
      const son = giftExample("madrid", "son-100k");
      const brother = giftExample("madrid", "brother");
      return L(locale, {
        ca: `A la Comunitat de Madrid fills, néts, cònjuge, pares i avis es bonifiquen el 99 % de la quota: un fill que rep 100.000 € en escriptura, amb l'origen dels diners justificat, paga ${M(son.toPay)}. Germans, nebots i parents per afinitat tenen un 50 % des de l'1 de juliol de 2025 (un germà amb 50.000 €, ${M(brother.toPay)}), i les donacions de fins a 1.000 € en tres anys no paguen. La calculadora ho fa pas a pas i reprodueix els exemples de la Comunitat de Madrid.`,
        es: `En la Comunidad de Madrid hijos, nietos, cónyuge, padres y abuelos se bonifican el 99 % de la cuota: un hijo que recibe 100.000 € en escritura, con el origen del dinero justificado, paga ${M(son.toPay)}. Hermanos, sobrinos y parientes por afinidad tienen un 50 % desde el 1 de julio de 2025 (un hermano con 50.000 €, ${M(brother.toPay)}), y las donaciones de hasta 1.000 € en tres años no pagan. La calculadora lo hace paso a paso y reproduce los ejemplos de la Comunidad de Madrid.`,
        en: `In the Madrid region children, grandchildren, spouses, parents and grandparents get 99% off the tax: a son given €100,000 in a public deed, with the origin of the money shown, pays ${M(son.toPay)}. Siblings, nephews, nieces and in-laws get 50% off since 1 July 2025 (a brother given €50,000 pays ${M(brother.toPay)}), and gifts up to €1,000 in three years pay nothing. The calculator works it out step by step and reproduces the Madrid region's own examples.`,
      });
    },
    andalucia: () => {
      const son = giftExample("andalucia", "official-100k");
      const home = giftExample("andalucia", "daughter-home");
      return L(locale, {
        ca: `A Andalusia fills, néts, cònjuge, pares i avis es bonifiquen el 99 % de la quota: un fill que rep 100.000 € paga ${M(son.toPay)}, la xifra de la guia de l'Agència Tributària d'Andalusia. Des del 2026 l'escriptura només cal per sobre de 5.000 € en tres anys. Per a l'habitatge habitual de menors de 35 anys hi ha una reducció del 99 % (una filla de 30 anys amb 120.000 € paga ${M(home.toPay)}).`,
        es: `En Andalucía hijos, nietos, cónyuge, padres y abuelos se bonifican el 99 % de la cuota: un hijo que recibe 100.000 € paga ${M(son.toPay)}, la cifra de la guía de la Agencia Tributaria de Andalucía. Desde 2026 la escritura solo hace falta por encima de 5.000 € en tres años. Para la vivienda habitual de menores de 35 años hay una reducción del 99 % (una hija de 30 años con 120.000 € paga ${M(home.toPay)}).`,
        en: `In Andalusia children, grandchildren, spouses, parents and grandparents get 99% off the tax: a son given €100,000 pays ${M(son.toPay)}, the Andalusian Tax Agency's own figure. Since 2026 a deed is only needed above €5,000 in three years. For the habitual home of donees under 35 there is a 99% reduction (a 30-year-old daughter given €120,000 pays ${M(home.toPay)}).`,
      });
    },
    valencia: () => {
      const son = giftExample("valencia", "son-300k");
      const priv = giftExample("valencia", "son-private");
      return L(locale, {
        ca: `A la Comunitat Valenciana fills, néts, cònjuge, pares i avis redueixen 100.000 € (fins a 156.000 € amb menys de 21 anys) i es bonifiquen el 99 % de la resta: un fill que rep 300.000 € en document públic paga ${M(son.toPay)}. Sense document públic no hi ha ni reducció ni bonificació: 50.000 € en document privat paguen ${M(priv.toPay)}. Germans i nebots de sang tenen un 25 % des de l'1 de juny de 2026.`,
        es: `En la Comunidad Valenciana hijos, nietos, cónyuge, padres y abuelos reducen 100.000 € (hasta 156.000 € con menos de 21 años) y se bonifican el 99 % del resto: un hijo que recibe 300.000 € en documento público paga ${M(son.toPay)}. Sin documento público no hay ni reducción ni bonificación: 50.000 € en documento privado pagan ${M(priv.toPay)}. Hermanos y sobrinos de sangre tienen un 25 % desde el 1 de junio de 2026.`,
        en: `In the Valencia region children, grandchildren, spouses, parents and grandparents deduct €100,000 (up to €156,000 under 21) and get 99% off the rest: a son given €300,000 in a public document pays ${M(son.toPay)}. Without a public document there is neither reduction nor rebate: €50,000 in a private document pays ${M(priv.toPay)}. Blood siblings and nephews get 25% off since 1 June 2026.`,
      });
    },
  }[region]();

  const text = region === "catalonia" ? textOf[locale] : boe[locale];
  const fresh = L(locale, {
    ca: `Normes revisades ${on(RULES_AS_OF)} a ${text} (${law}, vigent ${since(profile.dates.consolidatedFrom)}) i a les pàgines de ${agency}. Per a donacions ${since(rules.giftsFrom)}. Es tornen a revisar ${from(RULES_UNTIL)}.`,
    es: `Normas revisadas ${on(RULES_AS_OF)} en ${text} (${law}, vigente ${since(profile.dates.consolidatedFrom)}) y en las páginas de ${agency}. Para donaciones ${since(rules.giftsFrom)}. Se revisan de nuevo ${from(RULES_UNTIL)}.`,
    en: `Rules checked ${on(RULES_AS_OF)} in ${text} (${law}, in force ${since(profile.dates.consolidatedFrom)}) and on the pages of ${agency}. For gifts ${since(rules.giftsFrom)}. Due for a fresh check ${from(RULES_UNTIL)}.`,
  });

  const disclaimer = L(locale, {
    ca: `Estimació orientativa per a una donació. El càlcul oficial és la teva autoliquidació (model 651) davant ${agency}, que valora els béns, comprova els requisits i hi suma, si escau, les donacions anteriors, els recàrrecs i els interessos. Si la donació és d'una empresa, d'usdefruit o nua propietat, o de béns a l'estranger, consulta-ho a ${agency} o a un assessor.`,
    es: `Estimación orientativa para una donación. El cálculo oficial es tu autoliquidación (modelo 651) ante ${agency}, que valora los bienes, comprueba los requisitos y suma, si procede, las donaciones anteriores, los recargos y los intereses. Si la donación es de una empresa, de usufructo o nuda propiedad, o de bienes en el extranjero, consúltalo con ${agency} o con un asesor.`,
    en: `An estimate for one gift. The official calculation is your self-assessment (form 651) with ${agency}, which values the assets, checks the requirements and adds, where due, earlier gifts, surcharges and interest. If the gift is a business, a usufruct or bare ownership, or assets abroad, ask ${agency} or an adviser.`,
  });

  const officialLinks = (
    <>
      <A href={srcUrl(profile.info, locale)}>
        {profile.info.publisher}: {profile.info.name}
      </A>{" "}
      · <A href={srcUrl(profile.file, locale)}>{profile.file.name}</A>
    </>
  );

  const hd = L(locale, {
    ca: { how: "Com es calcula, pas a pas", req: "Requisits: escriptura, diners i termini", groups: "Grups de parentiu i reduccions", scale: "Tarifa", coef: "Coeficients multiplicadors", bonus: "Bonificació", acc: "Donacions anteriors: l'acumulació", examples: "Exemples, amb la calculadora", file: "Termini i com es presenta", changes: "Què ha canviat i quan es revisa", faq: "Preguntes freqüents", sources: "Fonts oficials", limits: "Què no calcula" },
    es: { how: "Cómo se calcula, paso a paso", req: "Requisitos: escritura, dinero y plazo", groups: "Grupos de parentesco y reducciones", scale: "Tarifa", coef: "Coeficientes multiplicadores", bonus: "Bonificación", acc: "Donaciones anteriores: la acumulación", examples: "Ejemplos, con la calculadora", file: "Plazo y cómo se presenta", changes: "Qué ha cambiado y cuándo se revisa", faq: "Preguntas frecuentes", sources: "Fuentes oficiales", limits: "Qué no calcula" },
    en: { how: "How it is worked out, step by step", req: "Requirements: deed, money and deadline", groups: "Kinship groups and reductions", scale: "Tax scale", coef: "Multiplying coefficients", bonus: "Rebate (bonificación)", acc: "Earlier gifts: accumulation", examples: "Examples, through the calculator", file: "Deadline and how to file", changes: "What changed and when it is re-checked", faq: "Questions", sources: "Official sources", limits: "What it does not cover" },
  });

  /** A coefficient with its own decimals: 1, 1,05, 1,5882. */
  const cx = (n: number) => num(n, (String(n).split(".")[1] ?? "").length, locale);
  const coefSummary = L(locale, {
    ca: `${cx(first.groupsIandII)} per als grups I i II${flat ? "" : " al primer tram de patrimoni"}; ${cx(first.groupIII)} per al grup III; ${cx(first.groupIV)} per al grup IV`,
    es: `${cx(first.groupsIandII)} para los grupos I y II${flat ? "" : " en el primer tramo de patrimonio"}; ${cx(first.groupIII)} para el grupo III; ${cx(first.groupIV)} para el grupo IV`,
    en: `${cx(first.groupsIandII)} for groups I and II${flat ? "" : " in the first wealth bracket"}; ${cx(first.groupIII)} for group III; ${cx(first.groupIV)} for group IV`,
  });

  const reductionsStep = rules.kinship
    ? L(locale, {
        ca: `**Reduccions** (${c("kinship")} i ${c("disability")}): per parentiu i per discapacitat, amb document públic i, si són diners, l'origen justificat. El que queda és la base liquidable, mai per sota de zero.`,
        es: `**Reducciones** (${c("kinship")} y ${c("disability")}): por parentesco y por discapacidad, con documento público y, si es dinero, el origen justificado. Lo que queda es la base liquidable, nunca por debajo de cero.`,
        en: `**Reductions** (${c("kinship")} and ${c("disability")}): kinship and disability, with a public document and, for money, the origin shown. What is left is the net taxable base (base liquidable), never below zero.`,
      })
    : L(locale, {
        ca: `**Reduccions:** no n'hi ha per parentiu, i la base liquidable és la imposable (Llei 29/1987, art. 20.5), llevat de les reduccions de la comunitat: la més habitual, la de l'habitatge (${c("home")}).`,
        es: `**Reducciones:** no hay por parentesco, y la base liquidable es la imponible (Ley 29/1987, art. 20.5), salvo las reducciones de la comunidad: la más habitual, la de la vivienda (${c("home")}).`,
        en: `**Reductions:** there is no kinship reduction, so the net taxable base is the taxable base (Law 29/1987, art. 20.5), save for the community's own reductions: the usual one is for the home (${c("home")}).`,
      });
  const scaleStep = rules.reducedScale
    ? L(locale, {
        ca: `**Quota íntegra:** la tarifa reduïda (${c("reducedScale")}: 5 %, 7 % i 9 %) per als grups I i II amb escriptura pública; si no, la general (${c("scale")}: del ${P(scaleMin)} al ${P(scaleMax)}).`,
        es: `**Cuota íntegra:** la tarifa reducida (${c("reducedScale")}: 5 %, 7 % y 9 %) para los grupos I y II con escritura pública; si no, la general (${c("scale")}: del ${P(scaleMin)} al ${P(scaleMax)}).`,
        en: `**Gross tax (cuota íntegra):** the reduced scale (${c("reducedScale")}: 5%, 7% and 9%) for groups I and II with a public deed; otherwise the general one (${c("scale")}: ${P(scaleMin)} to ${P(scaleMax)}).`,
      })
    : L(locale, {
        ca: `**Quota íntegra** (${c("scale")}): la tarifa, del ${P(scaleMin)} al ${P(scaleMax)}, sobre la base liquidable.`,
        es: `**Cuota íntegra** (${c("scale")}): la tarifa, del ${P(scaleMin)} al ${P(scaleMax)}, sobre la base liquidable.`,
        en: `**Gross tax (cuota íntegra)** (${c("scale")}): the scale, ${P(scaleMin)} to ${P(scaleMax)}, on the net taxable base.`,
      });
  const bonusStep = !b
    ? L(locale, { ca: "**Bonificació:** cap. Catalunya no en té per a les donacions.", es: "**Bonificación:** ninguna. Cataluña no tiene para las donaciones.", en: "**Rebate:** none. Catalonia has none for gifts." })
    : L(locale, {
        ca: `**Bonificació** (${c("bonus")}): el ${b.groupsIandII} % per als grups I i II${b.groupIII ? `; el ${b.groupIII} % per ${b.groupIIIScope === "group" ? "al grup III" : "als germans, nebots i oncles de sang"}` : ""}${b.disability ? `; el ${b.disability} % amb una discapacitat del 65 %` : ""}${b.smallGiftMax ? `; el 100 % fins a ${M(b.smallGiftMax)} en tres anys` : ""}, si es compleixen els requisits de document i de diners.`,
        es: `**Bonificación** (${c("bonus")}): el ${b.groupsIandII} % para los grupos I y II${b.groupIII ? `; el ${b.groupIII} % para ${b.groupIIIScope === "group" ? "el grupo III" : "hermanos, sobrinos y tíos de sangre"}` : ""}${b.disability ? `; el ${b.disability} % con una discapacidad del 65 %` : ""}${b.smallGiftMax ? `; el 100 % hasta ${M(b.smallGiftMax)} en tres años` : ""}, si se cumplen los requisitos de documento y de dinero.`,
        en: `**Rebate (bonificación)** (${c("bonus")}): ${b.groupsIandII}% for groups I and II${b.groupIII ? `; ${b.groupIII}% for ${b.groupIIIScope === "group" ? "group III" : "blood siblings, nephews, nieces, uncles and aunts"}` : ""}${b.disability ? `; ${b.disability}% with a 65% disability` : ""}${b.smallGiftMax ? `; 100% up to ${M(b.smallGiftMax)} in three years` : ""}, when the document and money requirements are met.`,
      });

  const steps = L(locale, {
    ca: [
      "**Base imposable.** El valor net del que reps: els diners, o el valor del bé menys els deutes que assumeixes (Llei 29/1987, art. 9.b). Paga qui rep la donació (art. 5.b).",
      reductionsStep,
      scaleStep,
      "**Donacions anteriors.** Si la mateixa persona t'ha fet altres donacions en els tres anys anteriors, la tarifa s'aplica a la suma i el seu tipus mitjà, a aquesta donació (art. 30).",
      `**Quota tributària** (${c("coefficient")}): la quota íntegra pel coeficient del teu grup${flat ? "" : " i del teu patrimoni anterior"} (${coefSummary}).`,
      bonusStep,
      "**A pagar** = quota tributària − bonificació.",
    ],
    es: [
      "**Base imponible.** El valor neto de lo que recibes: el dinero, o el valor del bien menos las deudas que asumes (Ley 29/1987, art. 9.b). Paga quien recibe la donación (art. 5.b).",
      reductionsStep,
      scaleStep,
      "**Donaciones anteriores.** Si la misma persona te ha hecho otras donaciones en los tres años anteriores, la tarifa se aplica a la suma y su tipo medio, a esta donación (art. 30).",
      `**Cuota tributaria** (${c("coefficient")}): la cuota íntegra por el coeficiente de tu grupo${flat ? "" : " y de tu patrimonio previo"} (${coefSummary}).`,
      bonusStep,
      "**A pagar** = cuota tributaria − bonificación.",
    ],
    en: [
      "**Taxable base (base imponible).** The net value of what you receive: the money, or the asset's value less the debts you take on (Law 29/1987, art. 9.b). The person receiving the gift pays (art. 5.b).",
      reductionsStep,
      scaleStep,
      "**Earlier gifts.** If the same person gave you other gifts in the three years before, the scale runs on the sum and its average rate applies to this gift (art. 30).",
      `**Tax after the coefficient (cuota tributaria)** (${c("coefficient")}): the gross tax times the coefficient for your group${flat ? "" : " and prior wealth"} (${coefSummary}).`,
      bonusStep,
      "**To pay** = tax after the coefficient − rebate.",
    ],
  });

  /** The group table: who is in it, its kinship reduction, and its rebate (Catalonia: its scale). */
  const none = L(locale, { ca: "Cap", es: "Ninguna", en: "None" });
  const k = rules.kinship;
  const reductionOf = (g: Group): string => {
    if (!k || g === "III" || g === "IV") return none;
    if (g === "I") return L(locale, { ca: `${M(k.under21.base)} + ${M(k.under21.perYear)} per any per sota dels 21, fins a ${M(k.under21.max)} (fills i néts)`, es: `${M(k.under21.base)} + ${M(k.under21.perYear)} por año por debajo de los 21, hasta ${M(k.under21.max)} (hijos y nietos)`, en: `${M(k.under21.base)} + ${M(k.under21.perYear)} per year under 21, up to ${M(k.under21.max)} (children and grandchildren)` });
    return L(locale, { ca: `${M(k.adult)} (fills, néts, cònjuge, pares i avis)`, es: `${M(k.adult)} (hijos, nietos, cónyuge, padres y abuelos)`, en: `${M(k.adult)} (children, grandchildren, spouse, parents and grandparents)` });
  };
  const lastCol = (g: Group): string => {
    if (!b) return g === "I" || g === "II" ? L(locale, { ca: "Reduïda, amb escriptura", es: "Reducida, con escritura", en: "Reduced, with a deed" }) : L(locale, { ca: "General", es: "General", en: "General" });
    if (g === "I" || g === "II") return P(b.groupsIandII);
    if (g === "III" && b.groupIII) return b.groupIIIScope === "group" ? P(b.groupIII) : L(locale, { ca: `${P(b.groupIII)} (només de sang)`, es: `${P(b.groupIII)} (solo de sangre)`, en: `${P(b.groupIII)} (blood relatives only)` });
    return "—";
  };
  const who = (g: Group) => (region === "catalonia" ? GROUP_WHO[g][locale] : STATE_GROUP_WHO[g][locale]);
  const groupCols = L(locale, {
    ca: ["Grup", "Qui", "Reducció per parentiu", b ? "Bonificació" : "Tarifa"],
    es: ["Grupo", "Quién", "Reducción por parentesco", b ? "Bonificación" : "Tarifa"],
    en: ["Group", "Who", "Kinship reduction", b ? "Rebate" : "Scale"],
  });
  const groups: Group[] = ["I", "II", "III", "IV"];

  const homeLine = h
    ? L(locale, {
        ca: `**Habitatge habitual** (${c("home")}): el ${h.percent} % ${h.capOn === "base" ? `d'una base de fins a ${M(h.cap)} (${M(h.capDisability)} amb discapacitat)` : `del que reps, fins a ${M(h.cap)} de reducció${h.capDisability !== h.cap ? ` (${M(h.capDisability)} amb discapacitat del ${h.capDisabilityFrom} %)` : ""}`}${h.maxAge !== null ? `, per a donataris de ${h.maxAge} anys o menys` : ""}.`,
        es: `**Vivienda habitual** (${c("home")}): el ${h.percent} % ${h.capOn === "base" ? `de una base de hasta ${M(h.cap)} (${M(h.capDisability)} con discapacidad)` : `de lo que recibes, hasta ${M(h.cap)} de reducción${h.capDisability !== h.cap ? ` (${M(h.capDisability)} con discapacidad del ${h.capDisabilityFrom} %)` : ""}`}${h.maxAge !== null ? `, para donatarios de ${h.maxAge} años o menos` : ""}.`,
        en: `**Habitual home** (${c("home")}): ${h.percent}% ${h.capOn === "base" ? `of a base of up to ${M(h.cap)} (${M(h.capDisability)} with a disability)` : `of what you receive, up to a ${M(h.cap)} reduction${h.capDisability !== h.cap ? ` (${M(h.capDisability)} with a ${h.capDisabilityFrom}% disability)` : ""}`}${h.maxAge !== null ? `, for donees aged ${h.maxAge} or under` : ""}.`,
      })
    : null;
  const d = rules.disability;
  const disabilityLine = d
    ? L(locale, {
        ca: `**Discapacitat** (${c("disability")}): ${M(d.from65)} amb el 65 % o més, o una discapacitat intel·lectual o mental del 33 % reconeguda de manera permanent, sigui qui sigui el donant; ${M(d.from33)} amb el 33 % per al cònjuge, pares, fills, néts i avis. Se suma a la de parentiu.`,
        es: `**Discapacidad** (${c("disability")}): ${M(d.from65)} con el 65 % o más, o una discapacidad intelectual o mental del 33 % reconocida de forma permanente, sea quien sea el donante; ${M(d.from33)} con el 33 % para el cónyuge, padres, hijos, nietos y abuelos. Se suma a la de parentesco.`,
        en: `**Disability** (${c("disability")}): ${M(d.from65)} with 65% or more, or an intellectual or mental disability of 33% permanently recognised, whoever the donor; ${M(d.from33)} with 33% for the spouse, parents, children, grandchildren and grandparents. It adds to the kinship one.`,
      })
    : null;

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
  const officialName = L(locale, {
    ca: { catalonia: "L'ATC", madrid: "La Comunitat de Madrid", andalucia: "L'Agència Tributària d'Andalusia", valencia: "L'ATV" },
    es: { catalonia: "La ATC", madrid: "La Comunidad de Madrid", andalucia: "La Agencia Tributaria de Andalucía", valencia: "La ATV" },
    en: { catalonia: "The ATC", madrid: "The Madrid region", andalucia: "The Andalusian Tax Agency", valencia: "The ATV" },
  })[region];

  const appSchema = {
    "@type": "WebApplication",
    name: meta.appName,
    url: absoluteUrl(giftPath(region, locale)),
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
      <SiteHeader locale={locale} translations={giftEditions(region)} />
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
              <GiftTaxCalculator locale={locale} rules={rules} initial={giftDefaultInput(region)} />
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

              <h2 id="requisitos">{hd.req}</h2>
              <ul>
                {profile.requirements[locale].map((r) => (
                  <li key={r}>{md(r)}</li>
                ))}
              </ul>

              <h2 id="grupos">{hd.groups}</h2>
              <Table cols={groupCols} rows={groups.map((g) => [GROUP_LABEL[g][locale], who(g), reductionOf(g), lastCol(g)])} />
              <p>{profile.reductionsNote[locale]}</p>
              {homeLine || disabilityLine ? (
                <ul>
                  {disabilityLine ? <li>{md(disabilityLine)}</li> : null}
                  {homeLine ? <li>{md(homeLine)}</li> : null}
                </ul>
              ) : null}
              {profile.quotes.reductions.map((q) => (
                <Quote key={q.text} q={q} locale={locale} />
              ))}

              <h2 id="tarifa">{hd.scale}</h2>
              {rules.reducedScale ? (
                <Table
                  cols={scaleCols}
                  caption={`${c("reducedScale")} · ${L(locale, { ca: "grups I i II amb escriptura pública", es: "grupos I y II con escritura pública", en: "groups I and II with a public deed" })}`}
                  rows={rules.reducedScale.map((r) => [M(r.from), M(r.quota), P(r.rate)])}
                />
              ) : null}
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

              <h2 id="acumulacion">{hd.acc}</h2>
              <p>
                {L(locale, {
                  ca: "Les donacions de la mateixa persona en els tres anys anteriors es tracten com una sola: la tarifa i el coeficient s'apliquen a la suma de les bases liquidables, d'aquí en surt un tipus mitjà amb dos decimals, i aquest tipus s'aplica a la base liquidable de la donació d'ara. Escriu-les al camp «Donacions anteriors» de la calculadora.",
                  es: "Las donaciones de la misma persona en los tres años anteriores se tratan como una sola: la tarifa y el coeficiente se aplican a la suma de las bases liquidables, de ahí sale un tipo medio con dos decimales, y ese tipo se aplica a la base liquidable de la donación de ahora. Escríbelas en el campo «Donaciones anteriores» de la calculadora.",
                  en: "Gifts from the same person in the three years before count as one: the scale and the coefficient run on the sum of the net bases, which gives an average rate to two decimals, and that rate applies to the net base of the gift now. Enter them in the calculator's “earlier gifts” field.",
                })}
              </p>
              {profile.quotes.accumulation.map((q) => (
                <Quote key={q.text} q={q} locale={locale} />
              ))}

              <h2 id="ejemplos">{hd.examples}</h2>
              <p>
                {official.length > 0
                  ? L(locale, {
                      ca: `Casos calculats amb les normes vigents ${where}. Els marcats com a exemple oficial són els de ${agency}, i la calculadora en dona les mateixes xifres al cèntim; els altres, els tests del web els comproven amb un càlcul independent fet a mà amb la tarifa citada.`,
                      es: `Casos calculados con las normas vigentes ${where}. Los marcados como ejemplo oficial son los de ${agency}, y la calculadora da las mismas cifras al céntimo; los demás, los tests de la web los comprueban con un cálculo independiente hecho a mano con la tarifa citada.`,
                      en: `Cases worked out under the rules in force ${where}. Those marked as official examples come from ${agency}, and the calculator gives the same figures to the cent; the site's tests check the rest against an independent hand calculation from the quoted scale.`,
                    })
                  : L(locale, {
                      ca: `Casos calculats amb les normes vigents ${where}; ${agency} no publica casos resolts de donacions, i els tests del web comproven cada xifra amb un càlcul independent fet a mà amb la tarifa citada.`,
                      es: `Casos calculados con las normas vigentes ${where}; ${agency} no publica casos resueltos de donaciones, y los tests de la web comprueban cada cifra con un cálculo independiente hecho a mano con la tarifa citada.`,
                      en: `Cases worked out under the rules in force ${where}; ${agency} publishes no worked gift cases, and the site's tests check every figure against an independent hand calculation from the quoted scale.`,
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
                    ca: `${e.label.ca}. ${officialName}: quota ${M(e.official!.quota)}, a pagar ${M(e.official!.toPay)}. La calculadora: ${M(e.result.quotaTributaria)} i ${M(e.result.toPay)}.`,
                    es: `${e.label.es}. ${officialName}: cuota ${M(e.official!.quota)}, a pagar ${M(e.official!.toPay)}. La calculadora: ${M(e.result.quotaTributaria)} y ${M(e.result.toPay)}.`,
                    en: `${e.label.en}. ${officialName}: tax ${M(e.official!.quota)}, to pay ${M(e.official!.toPay)}. The calculator: ${M(e.result.quotaTributaria)} and ${M(e.result.toPay)}.`,
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
                      ca: `**Termini** (${c("deadline")}): ${giftDeadline(rules, locale)}. Les donacions no tenen pròrroga.`,
                      es: `**Plazo** (${c("deadline")}): ${giftDeadline(rules, locale)}. Las donaciones no tienen prórroga.`,
                      en: `**Deadline** (${c("deadline")}): ${giftDeadline(rules, locale)}. Gifts get no extension.`,
                    }),
                  )}
                </li>
                <li>
                  {md(
                    L(locale, {
                      ca: `**Com:** un model 651 per a cada donatari, a ${agency}, per internet o amb cita a les seves oficines.`,
                      es: `**Cómo:** un modelo 651 por cada donatario, ante ${agency}, por internet o con cita en sus oficinas.`,
                      en: `**How:** one form 651 per donee, with ${agency}, online or by appointment at its offices.`,
                    }),
                  )}
                </li>
                <li>
                  {md(
                    L(locale, {
                      ca: "**On:** un immoble, a la comunitat on és; diners i altres béns, a la comunitat on viu qui rep la donació (on ha viscut més dies dels cinc anys anteriors). Si qui rep no viu a Espanya, a l'Agència Tributària de l'Estat (AEAT).",
                      es: "**Dónde:** un inmueble, en la comunidad donde está; dinero y otros bienes, en la comunidad donde vive quien recibe la donación (donde ha vivido más días de los cinco años anteriores). Si quien recibe no vive en España, en la Agencia Tributaria del Estado (AEAT).",
                      en: "**Where:** a property, in the region where it is; money and other assets, in the region where the person receiving the gift lives (where they lived the most days of the five years before). If the donee does not live in Spain, with the State Tax Agency (AEAT).",
                    }),
                  )}
                </li>
              </ul>
              {profile.quotes.filing.map((q) => (
                <Quote key={q.text} q={q} locale={locale} />
              ))}
              <p>{officialLinks}.</p>

              <GiftByRegion current={region} locale={locale} />

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
                  ca: `Llegides ${on(RULES_AS_OF)}. Les cites són literals, en la llengua en què les publica el butlletí o l'organisme. Els textos consolidats no tenen valor oficial: el té la publicació al butlletí.`,
                  es: `Leídas ${on(RULES_AS_OF)}. Las citas son literales, en la lengua en que las publica el boletín o el organismo. Los textos consolidados no tienen valor oficial: lo tiene la publicación en el boletín.`,
                  en: `Read ${on(RULES_AS_OF)}. Quotes are verbatim, in the language the bulletin or the agency publishes them in. Consolidated texts are not official: the bulletin publication is.`,
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
            <ShareBar locale={locale} path={giftPath(region, locale)} title={meta.h1} contentType="gift_tax_calculator" variant="full" />
          </div>
        </article>
      </main>
      <JsonLd json={graph([breadcrumbSchema(crumbs), appSchema, faqSchema])} />
      <SiteFooter locale={locale} />
    </>
  );
}
