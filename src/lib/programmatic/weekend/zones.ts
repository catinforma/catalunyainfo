import type { B2Key } from "@/lib/content/batch02/shared";

import type { ProvinceCode } from "./types";

/**
 * The zones of the weekend family. Definitions only: no snapshot, no network,
 * so the snapshot script, the route handler and the browser can all import it.
 *
 * Every zone is a set of official units, never a hand-drawn area:
 *   - a province (its INE province code);
 *   - a tourism brand, as Idescat's "Marques turístiques" classification lists
 *     its comarques (read 28 Oct 2026, https://www.idescat.cat/codis/?id=50&n=37):
 *       MT02 Costa Brava   = Alt Empordà, Baix Empordà, Gironès, Pla de l'Estany, Selva
 *       MT05 Costa Daurada = Alt Camp, Baix Camp, Baix Penedès, Conca de Barberà, Priorat, Tarragonès
 *       MT01 Pirineus      = Alt Urgell, Alta Ribagorça, Berguedà, Cerdanya, Garrotxa,
 *                            Pallars Jussà, Pallars Sobirà, Ripollès, Solsonès
 *       MT10 Val d'Aran    = Aran (the Pirineu page is MT01 + MT10)
 *     The tests check these lists against the snapshot's copy of Idescat's file;
 *   - a comarca (Idescat code);
 *   - a municipality (INE code).
 *
 * Which zones exist (doorway guardrail): a zone ships only if, over the year
 * before the snapshot, at least three weekends in four had MIN_EVENTS or more
 * agenda activities in it (`volume.p25 >= MIN_EVENTS`, measured by the
 * snapshot script and checked by the tests). On 28 Oct 2026 that held for the
 * four provinces, the four coast and mountain zones, Barcelona city and three
 * comarques with their own searches (Alt Empordà, Baix Empordà, Vallès
 * Occidental). No other city came close: Girona, Lleida and Tarragona had a
 * median of 5 and a p25 of 2-3, so their searches land on the province page,
 * which lists the capital first.
 */

export type WeekendLocale = "ca" | "es";
export const WEEKEND_LOCALES: readonly WeekendLocale[] = ["ca", "es"];

/** Fewer zone activities than this on a weekend, and the page also shows the wider area. */
export const MIN_EVENTS = 5;

export type ZoneKind = "city" | "province" | "brand" | "comarca";

export type ZoneId =
  | "barcelona"
  | "provincia-barcelona"
  | "girona"
  | "lleida"
  | "tarragona"
  | "costa-brava"
  | "costa-daurada"
  | "maresme"
  | "pirineu"
  | "alt-emporda"
  | "baix-emporda"
  | "valles-occidental";

type PerLocale = Record<WeekendLocale, string>;

export interface ZoneDef {
  id: ZoneId;
  kind: ZoneKind;
  slug: PerLocale;
  /** As a heading or a link shows it. */
  name: PerLocale;
  /** "a la Costa Brava" / "en la Costa Brava": titles and sentences. */
  in: PerLocale;
  /** The H1's form; differs from `in` on the province pages ("a Girona i comarques"). */
  h1In: PerLocale;
  /** "de la Costa Brava" / "del Maresme". */
  of: PerLocale;
  /** Membership: exactly one of these lists. */
  provinces?: readonly ProvinceCode[];
  comarques?: readonly string[];
  ines?: readonly string[];
  /** Idescat brand codes the comarques come from (checked by the tests). */
  brands?: readonly string[];
  /** INE code of the town listed first on a province page. */
  capital?: string;
  /** Shown as well when the zone has fewer than MIN_EVENTS; null = link the Catalonia page. */
  wider: ZoneId | null;
  /** Towns whose Meteocat forecast the page links (INE codes, all inside the zone). */
  weather: readonly string[];
  /** Existing guides worth reading next. */
  guides: readonly B2Key[];
}

const same = (text: string): PerLocale => ({ ca: text, es: text });

export const ZONES: readonly ZoneDef[] = [
  {
    id: "barcelona",
    kind: "city",
    slug: same("barcelona"),
    name: same("Barcelona"),
    in: { ca: "a Barcelona", es: "en Barcelona" },
    h1In: { ca: "a Barcelona", es: "en Barcelona" },
    of: same("de Barcelona"),
    ines: ["08019"],
    wider: "provincia-barcelona",
    weather: ["08019"],
    guides: ["museums", "christmasBarcelona", "climate", "transport", "markets"],
  },
  {
    id: "provincia-barcelona",
    kind: "province",
    slug: same("provincia-de-barcelona"),
    name: { ca: "Província de Barcelona", es: "Provincia de Barcelona" },
    in: { ca: "a la província de Barcelona", es: "en la provincia de Barcelona" },
    h1In: { ca: "a la província de Barcelona", es: "en la provincia de Barcelona" },
    of: { ca: "de la província de Barcelona", es: "de la provincia de Barcelona" },
    provinces: ["08"],
    capital: "08019",
    wider: null,
    weather: ["08019", "08113", "08298"],
    guides: ["montserratFree", "sitges", "christmas", "pessebres"],
  },
  {
    id: "girona",
    kind: "province",
    slug: same("girona"),
    name: same("Girona"),
    in: { ca: "a Girona", es: "en Girona" },
    h1In: { ca: "a Girona i comarques", es: "en Girona y provincia" },
    of: same("de Girona"),
    provinces: ["17"],
    capital: "17079",
    wider: null,
    weather: ["17079", "17066", "17114"],
    guides: ["girona", "figueres", "ripolles", "christmas"],
  },
  {
    id: "lleida",
    kind: "province",
    slug: same("lleida"),
    name: same("Lleida"),
    in: { ca: "a Lleida", es: "en Lleida" },
    h1In: { ca: "a Lleida i comarques", es: "en Lleida y provincia" },
    of: same("de Lleida"),
    provinces: ["25"],
    capital: "25120",
    wider: null,
    weather: ["25120", "25203", "25234"],
    guides: ["snowNow", "ski", "christmas"],
  },
  {
    id: "tarragona",
    kind: "province",
    slug: same("tarragona"),
    name: same("Tarragona"),
    in: { ca: "a Tarragona", es: "en Tarragona" },
    h1In: { ca: "a Tarragona i comarques", es: "en Tarragona y provincia" },
    of: same("de Tarragona"),
    provinces: ["43"],
    capital: "43148",
    wider: null,
    weather: ["43148", "43123", "43155"],
    guides: ["tarragona", "portaventura", "calcots", "christmas"],
  },
  {
    id: "costa-brava",
    kind: "brand",
    slug: same("costa-brava"),
    name: same("Costa Brava"),
    in: { ca: "a la Costa Brava", es: "en la Costa Brava" },
    h1In: { ca: "a la Costa Brava", es: "en la Costa Brava" },
    of: same("de la Costa Brava"),
    comarques: ["02", "10", "20", "28", "34"],
    brands: ["MT02"],
    wider: "girona",
    weather: ["17066", "17079", "17117", "17095"],
    guides: ["girona", "figueres", "christmas"],
  },
  {
    id: "costa-daurada",
    kind: "brand",
    slug: { ca: "costa-daurada", es: "costa-dorada" },
    name: { ca: "Costa Daurada", es: "Costa Dorada" },
    in: { ca: "a la Costa Daurada", es: "en la Costa Dorada" },
    h1In: { ca: "a la Costa Daurada", es: "en la Costa Dorada" },
    of: { ca: "de la Costa Daurada", es: "de la Costa Dorada" },
    comarques: ["01", "08", "12", "16", "29", "36"],
    brands: ["MT05"],
    wider: "tarragona",
    weather: ["43148", "43123", "43905", "43038"],
    guides: ["tarragona", "portaventura", "calcots"],
  },
  {
    id: "maresme",
    kind: "comarca",
    slug: same("maresme"),
    name: same("Maresme"),
    in: { ca: "al Maresme", es: "en el Maresme" },
    h1In: { ca: "al Maresme", es: "en el Maresme" },
    of: same("del Maresme"),
    comarques: ["21"],
    wider: "provincia-barcelona",
    weather: ["08121", "08035"],
    guides: ["christmas", "pessebres"],
  },
  {
    id: "pirineu",
    kind: "brand",
    slug: { ca: "pirineu", es: "pirineo" },
    name: { ca: "Pirineu", es: "Pirineo" },
    in: { ca: "al Pirineu", es: "en el Pirineo" },
    h1In: { ca: "al Pirineu català", es: "en el Pirineo catalán" },
    of: { ca: "del Pirineu", es: "del Pirineo" },
    comarques: ["04", "05", "14", "15", "19", "25", "26", "31", "35", "39"],
    brands: ["MT01", "MT10"],
    wider: null,
    weather: ["17141", "25243", "25203", "25209", "17147"],
    guides: ["snowNow", "ski", "snow", "cerdanya", "ripolles", "nuria"],
  },
  {
    id: "alt-emporda",
    kind: "comarca",
    slug: same("alt-emporda"),
    name: same("Alt Empordà"),
    in: { ca: "a l'Alt Empordà", es: "en el Alt Empordà" },
    h1In: { ca: "a l'Alt Empordà", es: "en el Alt Empordà" },
    of: { ca: "de l'Alt Empordà", es: "del Alt Empordà" },
    comarques: ["02"],
    wider: "girona",
    weather: ["17066", "17152", "17032"],
    guides: ["figueres", "girona", "christmas"],
  },
  {
    id: "baix-emporda",
    kind: "comarca",
    slug: same("baix-emporda"),
    name: same("Baix Empordà"),
    in: { ca: "al Baix Empordà", es: "en el Baix Empordà" },
    h1In: { ca: "al Baix Empordà", es: "en el Baix Empordà" },
    of: same("del Baix Empordà"),
    comarques: ["10"],
    wider: "girona",
    weather: ["17022", "17117", "17118", "17160"],
    guides: ["girona", "christmas"],
  },
  {
    id: "valles-occidental",
    kind: "comarca",
    slug: same("valles-occidental"),
    name: same("Vallès Occidental"),
    in: { ca: "al Vallès Occidental", es: "en el Vallès Occidental" },
    h1In: { ca: "al Vallès Occidental", es: "en el Vallès Occidental" },
    of: same("del Vallès Occidental"),
    comarques: ["40"],
    wider: "provincia-barcelona",
    weather: ["08279", "08187", "08205"],
    guides: ["montserratFree", "christmas", "pessebres"],
  },
];

export function zoneById(id: ZoneId): ZoneDef {
  const zone = ZONES.find((z) => z.id === id);
  if (!zone) throw new Error(`No weekend zone ${id}`);
  return zone;
}

export function zoneBySlug(locale: WeekendLocale, slug: string): ZoneDef | null {
  return ZONES.find((z) => z.slug[locale] === slug) ?? null;
}

/** What the browser needs to pick a zone's activities out of the Catalonia-wide list. */
export interface ZoneFilter {
  provinces?: readonly string[];
  comarques?: readonly string[];
  ines?: readonly string[];
}

export function zoneFilter(zone: ZoneDef): ZoneFilter {
  if (zone.provinces) return { provinces: zone.provinces };
  if (zone.comarques) return { comarques: zone.comarques };
  return { ines: zone.ines ?? [] };
}
