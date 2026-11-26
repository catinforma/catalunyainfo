import { calculatorCard, hubCards, type HubCard } from "./hub";
import { CALCULATOR_IDS, type CalcLocale, type CalculatorId } from "./paths";

/**
 * "Calculadoras relacionadas" / "Calculadores relacionades" / "Related
 * calculators" (26 Nov 2026, batch 6C): 3 or 4 tools on the same topic at the
 * foot of every calculator page, above the full "More calculators" list
 * (components/programmatic/calculators/MoreCalculators.tsx), and the
 * popularity order the hub and the homepage line read.
 *
 * Why (GSC 30 Oct-26 Nov 2026, `snapshot.py pages 28 6000`): the ~40 tools in
 * three languages took 237 clicks in 28 days; the "More calculators" list gave
 * every page the same 39 links in registry order, so a reader of the widow's
 * pension saw the net salary first and the non-contributory pension 29th.
 *
 * Selection (relatedKeys), the same for every tool:
 *  1. PINNED, for the few pairs a topic order would miss (a pin may be one
 *     of the hub's other tools: fuel prices for the ITV);
 *  2. tools that share the page's primary topic, the same region first (a
 *     Madrid inheritance page gets the Madrid gift tax), then tools whose own
 *     primary topic it is, then by POPULARITY;
 *  3. tools that share its secondary topic, by the same order;
 *  4. links the "next useful step" box of the page already shows (`avoid`)
 *     only when 1-3 leave fewer than RELATED_MIN; then POPULARITY.
 * Never the page itself; every link is the tool's own hub card (title and
 * one-line question) in the page's language (every calculator has all three
 * editions, paths.ts; a card that sends an edition to another language is
 * skipped). tests/related-calculators.test.ts holds the rules.
 */

export type CalcTopic = "pay" | "jobloss" | "leave" | "pensions" | "housing" | "taxes" | "family" | "money" | "lottery" | "vehicle";

/** What a related link can point to: a calculator, or one of the hub's other tools (hub.ts). */
export type RelatedKey = HubCard["key"];

export const RELATED_MIN = 3;
export const RELATED_MAX = 4;

/**
 * Primary topic, then an optional secondary one. Typed by CalculatorId: a new
 * tool fails to compile until it has a topic. Work is split three ways (the
 * payslip, losing a job, time off), so a reader of the dole gets the
 * dismissal and not the average salary.
 */
export const CALCULATOR_TOPICS: Record<CalculatorId, readonly [CalcTopic, CalcTopic?]> = {
  "net-salary": ["pay"],
  "extra-pay": ["pay"],
  "self-employed": ["pay"],
  "smi-2027": ["pay"],
  "average-salary": ["pay"],
  dismissal: ["jobloss", "pay"],
  settlement: ["jobloss", "pay"],
  unemployment: ["jobloss"],
  "unemployment-subsidy": ["jobloss", "family"],
  "sick-leave": ["leave", "pay"],
  "paid-leave": ["leave", "pay"],
  "working-days": ["leave"],
  "pensions-2027": ["pensions", "money"],
  // Early retirement after the unemployment subsidy (the page lists it).
  "retirement-age": ["pensions", "jobloss"],
  "widow-pension": ["pensions", "family"],
  "non-contributory-pension": ["pensions", "family"],
  "rent-update": ["housing", "money"],
  "zona-tensionada": ["housing"],
  euribor: ["housing", "money"],
  mortgage: ["housing"],
  "home-purchase-tax": ["housing", "taxes"],
  "home-purchase-costs": ["housing"],
  plusvalia: ["housing", "taxes"],
  "inheritance-tax": ["taxes"],
  "inheritance-tax-madrid": ["taxes"],
  "inheritance-tax-andalucia": ["taxes"],
  "inheritance-tax-valencia": ["taxes"],
  "inheritance-tax-by-region": ["taxes"],
  "gift-tax-catalonia": ["taxes"],
  "gift-tax-madrid": ["taxes"],
  "gift-tax-andalucia": ["taxes"],
  "gift-tax-valencia": ["taxes"],
  ipc: ["money"],
  "treasury-bills": ["money"],
  iprem: ["money", "family"],
  // Its own topic: as a secondary "taxes" it never outranks the inheritance and gift pages on theirs.
  "lottery-tax": ["lottery", "taxes"],
  itv: ["vehicle"],
  "traffic-fines": ["vehicle"],
  "bono-social": ["family"],
};

/**
 * First picks a topic order would not reach: the comparison of every
 * community for an heir or a donee (it covers both taxes); the Christmas
 * extra pay and the Letras for a lottery winner (the same December money,
 * then where to put it); for a widow's pension, the inheritance tax by
 * community (the same death); for the bono social and the dole, the
 * IPREM-based help their readers also ask about; for the working-days
 * calculator, the two other tools whose deadlines run in working days (a
 * fine, a dismissal); for paid leave, the net salary it keeps paying; for the
 * two vehicle tools, today's fuel prices and the working-days calculator.
 */
export const PINNED: Partial<Record<CalculatorId, readonly RelatedKey[]>> = {
  "inheritance-tax": ["inheritance-tax-by-region"],
  "inheritance-tax-madrid": ["inheritance-tax-by-region"],
  "inheritance-tax-andalucia": ["inheritance-tax-by-region"],
  "inheritance-tax-valencia": ["inheritance-tax-by-region"],
  "gift-tax-catalonia": ["inheritance-tax-by-region"],
  "gift-tax-madrid": ["inheritance-tax-by-region"],
  "gift-tax-andalucia": ["inheritance-tax-by-region"],
  "gift-tax-valencia": ["inheritance-tax-by-region"],
  "lottery-tax": ["extra-pay", "treasury-bills"],
  "working-days": ["traffic-fines", "dismissal"],
  "paid-leave": ["net-salary"],
  unemployment: ["iprem", "bono-social"],
  iprem: ["non-contributory-pension"],
  "widow-pension": ["inheritance-tax-by-region"],
  "bono-social": ["non-contributory-pension", "unemployment-subsidy", "iprem"],
  itv: ["fuel", "working-days"],
  "traffic-fines": ["fuel", "working-days"],
};

/**
 * Every calculator by Search Console impressions, all three editions summed,
 * 30 Oct-26 Nov 2026 (`snapshot.py pages 28 6000`): lottery-tax 3,954 (46
 * clicks), treasury-bills 2,604, smi-2027 1,463, working-days 1,454,
 * pensions-2027 1,159, paid-leave 986, non-contributory-pension 876, ipc 780,
 * sick-leave 733, unemployment-subsidy 673, unemployment 667 ... mortgage 8,
 * home-purchase-tax 8. Ties keep registry order. Re-read it with the same
 * command when RANKING_REREAD_BY comes (tests/related-calculators.test.ts).
 */
export const POPULARITY: readonly CalculatorId[] = [
  "lottery-tax",
  "treasury-bills",
  "smi-2027",
  "working-days",
  "pensions-2027",
  "paid-leave",
  "non-contributory-pension",
  "ipc",
  "sick-leave",
  "unemployment-subsidy",
  "unemployment",
  "retirement-age",
  "average-salary",
  "rent-update",
  "self-employed",
  "extra-pay",
  "widow-pension",
  "net-salary",
  "gift-tax-valencia",
  "traffic-fines",
  "dismissal",
  "itv",
  "home-purchase-costs",
  "bono-social",
  "iprem",
  "inheritance-tax",
  "gift-tax-madrid",
  "zona-tensionada",
  "gift-tax-catalonia",
  "settlement",
  "gift-tax-andalucia",
  "euribor",
  "inheritance-tax-by-region",
  "inheritance-tax-valencia",
  "inheritance-tax-andalucia",
  "inheritance-tax-madrid",
  "plusvalia",
  "mortgage",
  "home-purchase-tax",
];

/** The next re-read of POPULARITY (four weeks after the data it holds). */
export const RANKING_REREAD_BY = "2026-12-24";

const rank = (id: CalculatorId): number => {
  const i = POPULARITY.indexOf(id);
  return i < 0 ? POPULARITY.length + CALCULATOR_IDS.indexOf(id) : i;
};

/** Calculator ids, most-searched first. */
export function byPopularity<T extends string>(ids: readonly T[]): T[] {
  const r = (id: T) => (CALCULATOR_IDS.includes(id as unknown as CalculatorId) ? rank(id as unknown as CalculatorId) : Number.MAX_SAFE_INTEGER);
  return [...ids].sort((a, b) => r(a) - r(b));
}

function topicPeers(id: CalculatorId, topic: CalcTopic | undefined): CalculatorId[] {
  if (!topic) return [];
  const scope = calculatorCard(id).scope;
  const regional = (other: CalculatorId) => (scope !== "spain" && calculatorCard(other).scope === scope ? 0 : 1);
  const primaryHere = (other: CalculatorId) => (CALCULATOR_TOPICS[other][0] === topic ? 0 : 1);
  return CALCULATOR_IDS.filter((other) => other !== id && CALCULATOR_TOPICS[other].includes(topic)).sort(
    (a, b) => regional(a) - regional(b) || primaryHere(a) - primaryHere(b) || rank(a) - rank(b),
  );
}

/** A hub card that this edition links in another language (hub.ts `hrefLang`): never a related link. */
function sameLanguage(card: HubCard, locale: CalcLocale): boolean {
  return !card.hrefLang?.[locale] || card.hrefLang[locale] === locale;
}

const cardFor = (key: RelatedKey): HubCard | undefined => hubCards().find((card) => card.key === key);

/**
 * The 3 or 4 related tools of a calculator in one language. `avoid`: the
 * keys the page's "next useful step" box already links, used only to reach
 * RELATED_MIN.
 */
export function relatedKeys(id: CalculatorId, locale: CalcLocale, avoid: readonly string[] = []): RelatedKey[] {
  const [primary, secondary] = CALCULATOR_TOPICS[id];
  const topical: RelatedKey[] = [...(PINNED[id] ?? []), ...topicPeers(id, primary), ...topicPeers(id, secondary)];
  const usable = (key: RelatedKey) => {
    const card = cardFor(key);
    return key !== id && card !== undefined && sameLanguage(card, locale);
  };
  const unique = topical.filter((key, i) => usable(key) && topical.indexOf(key) === i);
  const picked = unique.filter((key) => !avoid.includes(key)).slice(0, RELATED_MAX);
  for (const key of [...unique, ...POPULARITY]) {
    if (picked.length >= RELATED_MIN) break;
    if (usable(key) && !picked.includes(key)) picked.push(key);
  }
  return picked;
}

export interface RelatedLink {
  key: RelatedKey;
  href: string;
  label: string;
  note: string;
}

/** The related tools as links in one language: each hub card's title and question. */
export function relatedCalculators(id: CalculatorId, locale: CalcLocale, avoid: readonly string[] = []): RelatedLink[] {
  return relatedKeys(id, locale, avoid).map((key) => {
    const card = cardFor(key)!;
    return { key, href: card.href[locale], label: card.title[locale], note: card.answers[locale] };
  });
}

/* -------------------------------------------------------------------------- */
/* The hub's "most searched" questions                                        */
/* -------------------------------------------------------------------------- */

/**
 * The question each of the most-used tools answers, in the words people
 * search with ("cuánto cobro de paro"): the hub opens with them, most-searched
 * first (POPULARITY), each question a link to its tool. Questions only, no
 * figure: the answer is on the tool's own page, which keeps it up to date.
 */
export const HUB_QUESTIONS: Partial<Record<CalculatorId, Record<CalcLocale, string>>> = {
  "lottery-tax": { es: "¿Cuánto se queda Hacienda de un premio de lotería?", ca: "Quant es queda Hisenda d'un premi de loteria?", en: "How much tax do you pay on a Spanish lottery prize?" },
  "treasury-bills": { es: "¿Cuánto rentan las Letras del Tesoro?", ca: "Quant rendeixen les Lletres del Tresor?", en: "What do Spanish Treasury bills pay?" },
  "smi-2027": { es: "¿Cuánto es el salario mínimo en 2027?", ca: "Quant és el salari mínim el 2027?", en: "What is Spain's minimum wage in 2027?" },
  "working-days": { es: "¿Cuándo vence un plazo en días hábiles?", ca: "Quan venç un termini en dies hàbils?", en: "When does a deadline in working days end?" },
  "pensions-2027": { es: "¿Cuánto suben las pensiones en 2027?", ca: "Quant pugen les pensions el 2027?", en: "How much do pensions rise in 2027?" },
  "paid-leave": { es: "¿Cuántos días de permiso me corresponden?", ca: "Quants dies de permís em corresponen?", en: "How many days of paid leave do I get?" },
  "non-contributory-pension": { es: "¿Cuánto se cobra de pensión no contributiva?", ca: "Quant es cobra de pensió no contributiva?", en: "How much is a non-contributory pension?" },
  ipc: { es: "¿Cuánto ha subido el IPC?", ca: "Quant ha pujat l'IPC?", en: "How much has inflation (CPI) risen in Spain?" },
  "sick-leave": { es: "¿Cuánto cobro de baja laboral?", ca: "Quant cobro de baixa laboral?", en: "How much sick pay do I get?" },
  "unemployment-subsidy": { es: "¿Me corresponde el subsidio por desempleo?", ca: "Em correspon el subsidi d'atur?", en: "Do I qualify for the unemployment subsidy?" },
  unemployment: { es: "¿Cuánto cobro de paro?", ca: "Quant cobro d'atur?", en: "How much unemployment benefit do I get?" },
  "retirement-age": { es: "¿A qué edad me puedo jubilar?", ca: "A quina edat em puc jubilar?", en: "At what age can I retire in Spain?" },
  "rent-update": { es: "¿Cuánto me pueden subir el alquiler?", ca: "Quant em poden apujar el lloguer?", en: "How much can my rent go up?" },
  "extra-pay": { es: "¿Cuánto cobro de paga extra?", ca: "Quant cobro de paga extra?", en: "How much is my Christmas extra pay?" },
  "net-salary": { es: "¿Cuánto cobro neto al mes?", ca: "Quant cobro net al mes?", en: "What is my net pay each month?" },
  dismissal: { es: "¿Cuánta indemnización me corresponde por despido?", ca: "Quina indemnització per acomiadament em correspon?", en: "How much severance pay am I owed?" },
};

/** How many questions the hub opens with. */
export const HUB_QUESTION_COUNT = 10;

export const HUB_QUESTIONS_TITLE: Record<CalcLocale, string> = {
  es: "Las preguntas más buscadas",
  ca: "Les preguntes més buscades",
  en: "The most searched questions",
};

/** The hub's opening questions in one language, most-searched first, each a link to its tool. */
export function hubQuestions(locale: CalcLocale, count = HUB_QUESTION_COUNT): { id: CalculatorId; href: string; question: string }[] {
  const ids = byPopularity(CALCULATOR_IDS.filter((id) => HUB_QUESTIONS[id]));
  return ids.slice(0, count).map((id) => ({ id, href: calculatorCard(id).href[locale], question: HUB_QUESTIONS[id]![locale] }));
}

export const RELATED_TITLE: Record<CalcLocale, string> = {
  es: "Calculadoras relacionadas",
  ca: "Calculadores relacionades",
  en: "Related calculators",
};
