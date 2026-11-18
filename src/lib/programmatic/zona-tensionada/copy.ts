import { calcPath } from "@/lib/programmatic/calculators/paths";
import { capitalize, dayMonthYear, type DateLocale } from "@/lib/programmatic/holidays/format";
import { elDay } from "@/lib/programmatic/rent-update/copy";

import { EXTENSION_YEARS, EXTRA_PCT } from "./rules";

/**
 * Paths, words and the checker's answer for "¿Está mi municipio en zona
 * tensionada?". Client-safe: the checker imports this file and the rules,
 * never the data (the page hands it a compact list of towns).
 *
 *   /es/calculadoras/zona-tensionada/
 *   /ca/calculadores/zona-tensionada/
 *   /en/calculators/spain-rent-control-areas/
 */

export type ZtLocale = DateLocale;
export const ZT_LOCALES: readonly ZtLocale[] = ["es", "ca", "en"];

export function ztPath(locale: ZtLocale): string {
  return calcPath("zona-tensionada", locale);
}

export function ztEditions(): Record<ZtLocale, string> {
  return { ca: ztPath("ca"), es: ztPath("es"), en: ztPath("en") };
}

export type CommunityId = "catalonia" | "basque-country" | "navarre" | "galicia" | "asturias";
export const COMMUNITY_IDS: readonly CommunityId[] = ["catalonia", "basque-country", "navarre", "galicia", "asturias"];
export type GranRule = "five-or-more" | "more-than-five" | "general";
export type Extension = "extended" | "not-extended" | null;

export const COMMUNITY_LABEL: Record<CommunityId, Record<ZtLocale, string>> = {
  catalonia: { es: "Cataluña", ca: "Catalunya", en: "Catalonia" },
  "basque-country": { es: "País Vasco", ca: "País Basc", en: "Basque Country" },
  navarre: { es: "Navarra", ca: "Navarra", en: "Navarre" },
  galicia: { es: "Galicia", ca: "Galícia", en: "Galicia" },
  asturias: { es: "Asturias", ca: "Astúries", en: "Asturias" },
};

/** Who counts as a large landlord ("gran tenedor") under each declaration, in words; the BOE quote is printed next to it. */
export const GRAN_LABEL: Record<GranRule, Record<ZtLocale, string>> = {
  "five-or-more": {
    es: "5 o más viviendas allí, además de la regla general de más de 10 viviendas o más de 1.500 m²",
    ca: "5 o més habitatges allà, a més de la regla general de més de 10 habitatges o més de 1.500 m²",
    en: "5 or more homes there, on top of the general rule of more than 10 homes or more than 1,500 m²",
  },
  "more-than-five": {
    es: "más de 5 viviendas en el municipio o más de 1.500 m²",
    ca: "més de 5 habitatges al municipi o més de 1.500 m²",
    en: "more than 5 homes in the municipality, or more than 1,500 m²",
  },
  general: {
    es: "más de 10 viviendas o más de 1.500 m², la regla general",
    ca: "més de 10 habitatges o més de 1.500 m², la regla general",
    en: "more than 10 homes or more than 1,500 m², the general rule",
  },
};

/** One declaration, as the checker needs it. */
export interface ZoneDecl {
  id: string;
  community: CommunityId;
  /** The regional act, as the BOE list (or the DOGC) names it. */
  act: string;
  bulletin: string | null;
  url: string | null;
  /** The Ministry's list in the BOE; null while the BOE has not listed it. */
  boe: string | null;
  from: string | null;
  until: string | null;
  rule: GranRule;
  /** LAU 17.7, second paragraph: the index also caps homes with no lease in the last five years. */
  neverRented: boolean;
}

export interface TownZone {
  decl: string;
  /** Only part of the municipality, in the BOE's words ("Distrito 2"). */
  area: string | null;
  extension: Extension;
}

export interface CheckerTown {
  ine: string;
  name: string;
  community: CommunityId;
  zones: TownZone[];
}

/** The dated facts every answer needs. */
export interface Context {
  asOf: string;
  decls: Record<string, ZoneDecl>;
  extension: { number: string; date: string; published: string };
  pending: { date: string; published: string };
}

export type Verdict = "yes" | "partial" | "pending" | "no";

export interface Answer {
  verdict: Verdict;
  headline: string;
  lines: string[];
  /** What changes for a tenant, under the first zone that applies. */
  changes: string[];
  changesTitle: string | null;
  gran: { rule: GranRule; label: string } | null;
}

const L = <T,>(locale: ZtLocale, v: Record<ZtLocale, T>): T => v[locale];

/** "La Bisbal d'Empordà" for a heading; the lists keep the bulletin's "la". */
export function displayName(name: string): string {
  return capitalize(name);
}

/** Accent- and case-free, articles kept: what the search box compares. */
export function searchKey(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[’`´]/g, "'")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Towns whose name (or one of its "/" names, or the name without its article) starts with or contains the query, best first. */
export function matchTowns(towns: readonly CheckerTown[], query: string, limit = 8): CheckerTown[] {
  const q = searchKey(query);
  if (q.length < 2) return [];
  const keys = (t: CheckerTown) => {
    const k = searchKey(t.name);
    const parts = k.split("/").map((p) => p.trim());
    const noArticle = parts.map((p) => p.replace(/^(la |el |els |les |l'|a |o )/, ""));
    return [...new Set([k, ...parts, ...noArticle])];
  };
  const scored: [number, CheckerTown][] = [];
  for (const t of towns) {
    const ks = keys(t);
    const score = ks.some((k) => k === q) ? 0 : ks.some((k) => k.startsWith(q)) ? 1 : ks.some((k) => k.includes(q)) ? 2 : -1;
    if (score >= 0) scored.push([score, t]);
  }
  return scored.sort((a, b) => a[0] - b[0] || a[1].name.localeCompare(b[1].name, "es")).slice(0, limit).map(([, t]) => t);
}

/** The checker's answer for one town: declared or not, since and until when, the Generalitat's 2026 acts, and what changes. */
export function townAnswer(town: CheckerTown, ctx: Context, locale: ZtLocale): Answer {
  const on = (iso: string) => elDay(iso, locale);
  const dmy = (iso: string) => dayMonthYear(iso, locale);
  const name = displayName(town.name);
  const zones = town.zones.map((z) => ({ z, d: ctx.decls[z.decl]! }));
  const listed = zones.filter(({ d }) => d.boe);
  const verdict: Verdict = listed.some(({ z }) => !z.area) ? "yes" : listed.length ? "partial" : zones.length ? "pending" : "no";

  const headline = L(locale, {
    es: { yes: `Sí: ${name} es zona tensionada`, partial: `En parte: hay una zona tensionada en ${name}`, pending: `${name}: declarada, pendiente del BOE`, no: `No: ${name} no es zona tensionada` },
    ca: { yes: `Sí: ${name} és zona tensionada`, partial: `En part: hi ha una zona tensionada a ${name}`, pending: `${name}: declarada, pendent del BOE`, no: `No: ${name} no és zona tensionada` },
    en: { yes: `Yes: ${name} is a declared tight-market area`, partial: `Partly: part of ${name} is a declared tight-market area`, pending: `${name}: declared, awaiting the BOE`, no: `No: ${name} is not a declared tight-market area` },
  })[verdict];

  const lines: string[] = [];
  for (const { z, d } of zones) {
    if (d.boe && d.from && d.until) {
      const area = z.area ? L(locale, { es: ` Solo este ámbito: ${z.area}.`, ca: ` Només aquest àmbit (text del BOE): «${z.area}».`, en: ` Only this area (BOE wording): “${z.area}”.` }) : "";
      lines.push(
        L(locale, {
          es: `Zona tensionada desde ${on(d.from)} hasta ${on(d.until)}, según la lista del Ministerio de Vivienda en el BOE (${d.boe}).${area}`,
          ca: `Zona tensionada des ${on(d.from).replace(/^el /, "del ").replace(/^l'/, "de l'")} fins ${on(d.until).replace(/^el /, "al ").replace(/^l'/, "a l'")}, segons la llista del Ministeri d'Habitatge al BOE (${d.boe}).${area}`,
          en: `A tight-market area from ${dmy(d.from)} to ${dmy(d.until)}, according to the Ministry of Housing's list in the BOE (${d.boe}).${area}`,
        }),
      );
      if (z.extension === "extended")
        lines.push(
          L(locale, {
            es: `La Generalitat prorrogó la declaración ${on(ctx.extension.date)} (Resolució ${ctx.extension.number}, DOGC del ${dmy(ctx.extension.published)}). La nueva fecha final la dará la próxima lista del Ministerio en el BOE, que a ${dmy(ctx.asOf)} no se ha publicado; la ley permite prórrogas de un año.`,
            ca: `La Generalitat va prorrogar la declaració ${on(ctx.extension.date)} (Resolució ${ctx.extension.number}, DOGC del ${dmy(ctx.extension.published)}). La nova data final la donarà la propera llista del Ministeri al BOE, que el ${dmy(ctx.asOf)} encara no s'ha publicat; la llei permet pròrrogues d'un any.`,
            en: `The Generalitat extended the declaration on ${dmy(ctx.extension.date)} (Resolució ${ctx.extension.number}, DOGC of ${dmy(ctx.extension.published)}). The new end date will come in the Ministry's next list in the BOE, not yet published on ${dmy(ctx.asOf)}; the law allows one-year extensions.`,
          }),
        );
      if (z.extension === "not-extended" && d.until)
        lines.push(
          L(locale, {
            es: `La Generalitat no la ha prorrogado: según la Resolució ${ctx.extension.number} (${dmy(ctx.extension.date)}), el municipio ya no reúne las condiciones de la ley. Deja de ser zona tensionada cuando acaban sus tres años, ${on(d.until)}.`,
            ca: `La Generalitat no l'ha prorrogada: segons la Resolució ${ctx.extension.number} (${dmy(ctx.extension.date)}), el municipi ja no reuneix les condicions de la llei. Deixa de ser zona tensionada quan acaben els tres anys, ${on(d.until)}.`,
            en: `The Generalitat has not extended it: under Resolució ${ctx.extension.number} (${dmy(ctx.extension.date)}) the town no longer meets the law's conditions. It stops being a tight-market area when its three years end, on ${dmy(d.until)}.`,
          }),
        );
    } else {
      lines.push(
        L(locale, {
          es: `La Generalitat la declaró ${on(ctx.pending.date)} (${d.act.split(",")[0]}, DOGC del ${dmy(ctx.pending.published)}), pero aún no está en la lista del Ministerio de Vivienda en el BOE. Los límites del alquiler se aplicarán desde el día siguiente a esa publicación, como pasó con los 131 municipios de 2024. A ${dmy(ctx.asOf)}, no se ha publicado.`,
          ca: `La Generalitat la va declarar ${on(ctx.pending.date)} (${d.act.split(",")[0]}, DOGC del ${dmy(ctx.pending.published)}), però encara no és a la llista del Ministeri d'Habitatge al BOE. Els límits del lloguer s'aplicaran des de l'endemà d'aquesta publicació, com va passar amb els 131 municipis del 2024. El ${dmy(ctx.asOf)} encara no s'ha publicat.`,
          en: `The Generalitat declared it on ${dmy(ctx.pending.date)} (${d.act.split(",")[0]}, DOGC of ${dmy(ctx.pending.published)}), but it is not yet in the Ministry of Housing's list in the BOE. The rent limits apply from the day after that list is published, as happened with the 131 towns of 2024. On ${dmy(ctx.asOf)} it had not been published.`,
        }),
      );
    }
  }
  if (verdict === "no")
    lines.push(
      L(locale, {
        es: `A ${dmy(ctx.asOf)} no figura en ninguna lista del Ministerio de Vivienda en el BOE ni en las declaraciones de la Generalitat de octubre de 2026. Un contrato nuevo allí no tiene el tope de las zonas tensionadas; la subida anual sí tiene límite en toda España.`,
        ca: `El ${dmy(ctx.asOf)} no figura en cap llista del Ministeri d'Habitatge al BOE ni a les declaracions de la Generalitat d'octubre del 2026. Un contracte nou allà no té el límit de les zones tensionades; l'actualització anual sí que té límit a tot Espanya.`,
        en: `On ${dmy(ctx.asOf)} it is in none of the Ministry of Housing's lists in the BOE nor in the Generalitat's October 2026 declarations. A new lease there has no tight-market cap; the yearly increase is still capped everywhere in Spain.`,
      }),
    );

  const first = (listed[0] ?? zones[0])?.d;
  const changes: string[] = [];
  if (first) {
    const gran = GRAN_LABEL[first.rule][locale];
    changes.push(
      L(locale, {
        es: `Contrato nuevo: la renta no puede pasar de la del último contrato de los últimos 5 años en esa vivienda, actualizada. Solo puede subir un ${EXTRA_PCT} % más por obras de rehabilitación, de ahorro de energía o de accesibilidad acabadas en los 2 años anteriores, o con un contrato de 10 años o más (art. 17.6 LAU).`,
        ca: `Contracte nou: la renda no pot superar la de l'últim contracte dels últims 5 anys en aquell habitatge, actualitzada. Només pot pujar un ${EXTRA_PCT} % més per obres de rehabilitació, d'estalvi d'energia o d'accessibilitat acabades els 2 anys anteriors, o amb un contracte de 10 anys o més (art. 17.6 LAU).`,
        en: `New lease: the rent cannot exceed that of the last lease in the past 5 years on that home, updated. It may go ${EXTRA_PCT}% higher only for refurbishment, energy-saving or accessibility works finished in the previous 2 years, or for a lease of 10 years or more (LAU art. 17.6).`,
      }),
      L(locale, {
        es: `Si el casero es gran tenedor${first.neverRented ? " o la vivienda no se ha alquilado en los últimos 5 años" : ""}, el tope es el valor superior del índice de referencia del Ministerio (art. 17.7 LAU). Aquí es gran tenedor quien tiene ${gran}.`,
        ca: `Si el propietari és gran tenidor${first.neverRented ? " o l'habitatge no s'ha llogat els últims 5 anys" : ""}, el límit és el valor superior de l'índex de referència del Ministeri (art. 17.7 LAU). Aquí és gran tenidor qui té ${gran}.`,
        en: `If the landlord is a large landlord (gran tenedor)${first.neverRented ? ", or the home has not been let in the last 5 years" : ""}, the cap is the upper value of the Ministry's reference index (LAU art. 17.7). Here a large landlord is one with ${gran}.`,
      }),
      L(locale, {
        es: "No te pueden cargar gastos, impuestos o tasas que no estaban en el contrato anterior (art. 17.6 LAU).",
        ca: "No et poden carregar despeses, impostos o taxes que no eren al contracte anterior (art. 17.6 LAU).",
        en: "You cannot be charged costs, taxes or fees that were not in the previous lease (LAU art. 17.6).",
      }),
      L(locale, {
        es: `Cuando acaba la prórroga obligatoria o la tácita, puedes pedir una prórroga extraordinaria de hasta ${EXTENSION_YEARS} años, año a año, con las mismas condiciones; el casero tiene que aceptarla salvo excepciones, como necesitar la vivienda para él o su familia (art. 10.3 LAU).`,
        ca: `Quan acaba la pròrroga obligatòria o la tàcita, pots demanar una pròrroga extraordinària de fins a ${EXTENSION_YEARS} anys, any a any, amb les mateixes condicions; el propietari l'ha d'acceptar llevat d'excepcions, com necessitar l'habitatge per a ell o la seva família (art. 10.3 LAU).`,
        en: `When the mandatory or tacit extension ends, you may ask for an extraordinary extension of up to ${EXTENSION_YEARS} years, a year at a time, on the same terms; the landlord must accept except in some cases, such as needing the home for themselves or family (LAU art. 10.3).`,
      }),
      L(locale, {
        es: "Antes de firmar, y en el contrato, te tienen que decir que es zona tensionada, la última renta de los últimos 5 años y el valor del índice de referencia (art. 31.3 Ley 12/2023).",
        ca: "Abans de signar, i al contracte, t'han de dir que és zona tensionada, l'última renda dels últims 5 anys i el valor de l'índex de referència (art. 31.3 Llei 12/2023).",
        en: "Before you sign, and in the lease, you must be told it is a tight-market area, the last rent of the past 5 years and the reference index value (Ley 12/2023 art. 31.3).",
      }),
    );
  }
  const changesTitle = !first
    ? null
    : verdict === "pending"
      ? L(locale, { es: "Qué cambiará cuando lo publique el BOE", ca: "Què canviarà quan ho publiqui el BOE", en: "What will change once the BOE lists it" })
      : L(locale, { es: "Qué cambia para quien alquila", ca: "Què canvia per a qui lloga", en: "What changes for tenants" });
  return { verdict, headline, lines, changes, changesTitle, gran: first ? { rule: first.rule, label: GRAN_LABEL[first.rule][locale] } : null };
}

/** The checker's fixed words. */
export interface CheckerCopy {
  title: string;
  intro: string;
  label: string;
  hint: string;
  placeholder: string;
  noscript: string;
  noMatch: (q: string) => string;
  results: string;
  index: string;
  indexNote: string;
  community: string;
}

export const CHECKER_COPY: Record<ZtLocale, CheckerCopy> = {
  es: {
    title: "¿Está tu municipio en zona tensionada?",
    intro: "Escribe el nombre del municipio. Están todos los de Cataluña y los declarados en el resto de España.",
    label: "Municipio",
    hint: "Por ejemplo: Barcelona, Girona, Bilbao, Pamplona, A Coruña.",
    placeholder: "Escribe al menos dos letras",
    noscript: "Sin JavaScript, busca tu municipio en la lista completa por comunidad, más abajo. Aquí, el ejemplo de Barcelona.",
    noMatch: (q) =>
      `No encontramos «${q}». Si es un municipio de Cataluña, revisa cómo lo has escrito: están los 947. Si es de otra comunidad, no está declarado: fuera de Cataluña solo hay zonas tensionadas en el País Vasco, Navarra, Galicia y Asturias (lista completa abajo).`,
    results: "Coincidencias",
    index: "Consultar el índice de referencia del Ministerio (SERPAVI)",
    indexNote: "El índice da un rango para tu vivienda según su dirección y características; el tope es el valor superior. No lo copiamos: se consulta en la aplicación oficial.",
    community: "Comunidad",
  },
  ca: {
    title: "El teu municipi és zona tensionada?",
    intro: "Escriu el nom del municipi. Hi són tots els de Catalunya i els declarats a la resta d'Espanya.",
    label: "Municipi",
    hint: "Per exemple: Barcelona, Girona, Bilbao, Pamplona, A Coruña.",
    placeholder: "Escriu almenys dues lletres",
    noscript: "Sense JavaScript, busca el municipi a la llista completa per comunitat, més avall. Aquí, l'exemple de Barcelona.",
    noMatch: (q) =>
      `No trobem «${q}». Si és un municipi de Catalunya, revisa com l'has escrit: hi són els 947. Si és d'una altra comunitat, no està declarat: fora de Catalunya només hi ha zones tensionades al País Basc, Navarra, Galícia i Astúries (llista completa més avall).`,
    results: "Coincidències",
    index: "Consultar l'índex de referència del Ministeri (SERPAVI)",
    indexNote: "L'índex dona un interval per al teu habitatge segons l'adreça i les característiques; el límit és el valor superior. No el copiem: es consulta a l'aplicació oficial.",
    community: "Comunitat",
  },
  en: {
    title: "Is your town a tight-market area (zona tensionada)?",
    intro: "Type the town's name. Every town in Catalonia is here, and every declared one in the rest of Spain.",
    label: "Town",
    hint: "For example: Barcelona, Girona, Bilbao, Pamplona, A Coruña.",
    placeholder: "Type at least two letters",
    noscript: "Without JavaScript, find your town in the full list by region below. Here, the Barcelona example.",
    noMatch: (q) =>
      `We cannot find “${q}”. If it is in Catalonia, check the spelling: all 947 towns are here. If it is elsewhere, it is not declared: outside Catalonia only the Basque Country, Navarre, Galicia and Asturias have tight-market areas (full list below).`,
    results: "Matches",
    index: "Look up the Ministry's reference index (SERPAVI)",
    indexNote: "The index gives a range for your home from its address and features; the cap is the upper value. We do not copy it: look it up in the official app.",
    community: "Region",
  },
};
