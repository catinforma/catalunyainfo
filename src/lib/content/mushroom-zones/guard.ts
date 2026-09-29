import type { MushroomZone, ZoneEdition } from "./types";

/**
 * What a zone page is not allowed to say, enforced before it can be published.
 *
 * This is a guard rather than a checklist because the thing it protects
 * against is not carelessness. A page about where mushrooms are is under
 * constant pull towards being useful in exactly the way it must not be: one
 * more sentence about which track to take, one more "you'll find them under
 * the beeches past the bridge". Every one of those sentences would help a
 * reader and would be irresponsible to publish — it sends strangers to a
 * specific patch of someone's woodland, and it turns a conditions report into
 * a treasure map.
 *
 * So the rule is held in code, it runs on every publish, and it throws. An
 * editorial package that trips it does not get softened; it gets rewritten.
 *
 * The presence rule deserves its own note. Rainfall and temperature are
 * measured and may be published. Fruiting is inferred from them, unreliably,
 * and may not. "Conditions are favourable" is a statement about weather;
 * "there are mushrooms" is a statement about a place that nobody has checked.
 */

export class ZoneGuardError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ZoneGuardError";
  }
}

/** Decimal pairs, degrees-minutes, and UTM-looking strings. */
const COORDINATE_PATTERNS: { pattern: RegExp; what: string }[] = [
  { pattern: /-?\d{1,3}[.,]\d{4,}\s*[,;]\s*-?\d{1,3}[.,]\d{4,}/, what: "a decimal coordinate pair" },
  { pattern: /\d{1,3}\s*[°º]\s*\d{1,2}\s*['′]/, what: "a degrees-minutes coordinate" },
  { pattern: /\b\d{6,7}\s*[mM]?\s*[EN]\b/, what: "a UTM-looking grid reference" },
  { pattern: /\bgoo\.gl\/maps|maps\.app\.goo\.gl|google\.[a-z.]+\/maps/i, what: "a map pin link" },
];

/**
 * Phrases that assert presence, promise a result, or point at a spot.
 *
 * Matched on a normalised copy of the text, so accents and casing do not let
 * one through.
 */
const BANNED_PHRASES: { phrase: RegExp; what: string }[] = [
  { phrase: /\bhi ha bolets\b/, what: "a claim that mushrooms are present" },
  { phrase: /\bhay setas\b/, what: "a claim that mushrooms are present" },
  { phrase: /\bhay rovellones\b/, what: "a claim that mushrooms are present" },
  { phrase: /\bthere are mushrooms\b/, what: "a claim that mushrooms are present" },
  { phrase: /\btrobaras\b|\btrobareu\b/, what: "a promise that the reader will find something" },
  { phrase: /\bencontraras\b|\bencontrareis\b/, what: "a promise that the reader will find something" },
  { phrase: /\byou will find\b|\byou'll find\b/, what: "a promise that the reader will find something" },
  { phrase: /\bgarantit\b|\bgarantizado\b|\bguaranteed\b/, what: "a guarantee" },
  { phrase: /\bpunt secret\b|\bpunto secreto\b|\bsecret spot\b/, what: "a secret spot" },
  { phrase: /\bllocs exactes\b|\blugares exactos\b|\bexact spots\b/, what: "exact locations" },
  { phrase: /\bon collir\b|\bdonde recoger\b|\bwhere to pick\b/, what: "picking directions" },
  { phrase: /\bmillor lloc per collir\b|\bmejor sitio para recoger\b/, what: "picking directions" },
];

function normalise(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ");
}

function textOf(edition: ZoneEdition): string {
  return [
    edition.title,
    edition.seoTitle,
    edition.seoDescription,
    edition.excerpt,
    ...edition.lead,
    edition.situationHeading,
    ...edition.situation,
    edition.weatherHeading,
    ...edition.weather,
    edition.habitatHeading,
    ...edition.habitat,
    edition.rulesHeading,
    ...edition.rules,
    edition.safetyHeading,
    ...edition.safety,
    edition.territoryHeading,
    ...edition.territory,
    edition.masterLinkLine,
    ...(edition.faq ?? []).flatMap((item) => [item.question, item.answer]),
  ].join("\n");
}

/**
 * Throws unless the zone is safe to publish.
 *
 * @param masterPaths the published paths of the Catalonia-wide report, by
 * locale, so the master link can be checked against a URL that really exists
 * rather than merely looking like one.
 */
export function assertZoneSafe(
  zone: MushroomZone,
  masterPaths: Partial<Record<string, string>>,
): void {
  const where = `zone "${zone.key}"`;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(zone.verifiedAt)) {
    throw new ZoneGuardError(`${where}: verifiedAt must be an ISO date`);
  }
  if (zone.sources.length === 0) {
    throw new ZoneGuardError(
      `${where}: a local conditions page with no sources is an opinion, not a report`,
    );
  }
  for (const source of zone.sources) {
    if (!source.url.startsWith("https://")) {
      throw new ZoneGuardError(`${where}: source "${source.name}" must be an https URL`);
    }
  }

  const locales = Object.keys(zone.editions);
  if (locales.length === 0) {
    throw new ZoneGuardError(`${where}: no editions`);
  }

  for (const [locale, edition] of Object.entries(zone.editions)) {
    if (!edition) continue;
    const label = `${where} [${locale}]`;
    const raw = textOf(edition);
    const text = normalise(raw);

    for (const { pattern, what } of COORDINATE_PATTERNS) {
      if (pattern.test(raw)) {
        throw new ZoneGuardError(`${label}: contains ${what}. Zone pages carry no locations.`);
      }
    }

    for (const { phrase, what } of BANNED_PHRASES) {
      if (phrase.test(text)) {
        throw new ZoneGuardError(`${label}: contains ${what}.`);
      }
    }

    const master = masterPaths[locale];
    if (!master) {
      throw new ZoneGuardError(
        `${label}: there is no master report in this locale, so the zone page would be orphaned`,
      );
    }
    if (!edition.masterLinkLine.includes(master)) {
      throw new ZoneGuardError(
        `${label}: masterLinkLine must link to /${locale}/${master}/, the Catalonia-wide report`,
      );
    }

    if (edition.path.includes("//") || edition.path.startsWith("/") || edition.path.endsWith("/")) {
      throw new ZoneGuardError(`${label}: path must have no leading or trailing slash`);
    }
    if (/\d{4}/.test(edition.path)) {
      throw new ZoneGuardError(`${label}: the URL must be evergreen, with no year in the slug`);
    }
  }
}
