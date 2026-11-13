import { caDayArticle, dayMonth, dayMonthYear, dayPair, weekdayName } from "@/lib/programmatic/holidays/format";
import { joinList } from "@/lib/programmatic/holidays/names";

import { YEAR, dayCount } from "./calendar";
import { CITIES_AS_OF, INE_POPULATION, type LocalDay, type LocalList } from "./cities-data";
import {
  commonLocalDays,
  expectedMonth,
  holidayCount,
  isZoned,
  islandDay,
  local2027,
  localDays,
  localRuns,
  planForLocal,
  sharedWith,
  weekendLocalDays,
  type City,
} from "./cities";
import {
  EDITION_DESCRIPTION_LIMIT,
  EDITION_TITLE_LIMIT,
  bulletinIn,
  compactDatesIntl,
  runLineIntl,
  tr,
  weekdayDateIntl,
  type FaqIntl,
} from "./copy-intl";
import { editionCityName, editionCityShort, editionNames, type Edition, type EditionNames } from "./editions";
import { SOURCES } from "./sources";
import { CITY_NOTE, LOCAL_DAY_NOTE, placeName } from "./sources-intl";

/**
 * Catalan and English words for the city pages: the same facts as the
 * Spanish edition (city-copy.ts), from the same data (`cities-data.ts`, the
 * bulletins; `calendar.ts`, the BOE; `cities.ts`, computed from both). Local
 * festival names stay as the bulletin prints them; official titles and refs
 * stay in Spanish.
 */

const POP: Record<Edition, Intl.NumberFormat> = { ca: new Intl.NumberFormat("ca-ES"), en: new Intl.NumberFormat("en-GB") };

function cap(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function region(c: City, locale: Edition): EditionNames {
  return editionNames(c.region, locale);
}

function nameOf(c: City, locale: Edition): string {
  return editionCityName(c, locale);
}

/** Catalan contraction before a city name that may carry an article: "de la Corunya", "d'Alacant". */
export function caOf(name: string): string {
  if (/^(la|les) /.test(name)) return `de ${name}`;
  if (name.startsWith("el ")) return `del ${name.slice(3)}`;
  return /^[aeiouàèéíïòóúüh]/i.test(name) ? `d'${name}` : `de ${name}`;
}

export function caIn(name: string): string {
  if (name.startsWith("el ")) return `al ${name.slice(3)}`;
  return `a ${name}`;
}

/** The bulletin's names for parts of a municipality, where they need translating (Siero, BOPA). */
const AREA_NAME: Record<string, Record<Edition, string>> = {
  "Todo el concejo salvo la parroquia de Lugones/Llugones": {
    ca: "Tot el municipi excepte la parròquia de Lugones/Llugones",
    en: "The whole municipality except the parish of Lugones/Llugones",
  },
  // The 20,000+ wave (cities-more.ts): Mieres (BOPA), Ibiza's parishes (BOIB).
  "Todo el municipio salvo el Valle de Turón": { ca: "Tot el municipi excepte la vall de Turón", en: "The whole municipality except the Turón valley" },
  "Valle de Turón": { ca: "Vall de Turón", en: "Turón valley" },
  "Parroquias de Santa Eulària i Puig d'en Valls": { ca: "Parròquies de Santa Eulària i Puig d'en Valls", en: "Parishes of Santa Eulària and Puig d'en Valls" },
  "Parroquia de Jesús": { ca: "Parròquia de Jesús", en: "Parish of Jesús" },
  "Parroquia de Sant Carles de Peralta": { ca: "Parròquia de Sant Carles de Peralta", en: "Parish of Sant Carles de Peralta" },
  "Parroquia de Santa Gertrudis de Fruitera": { ca: "Parròquia de Santa Gertrudis de Fruitera", en: "Parish of Santa Gertrudis de Fruitera" },
  "Parroquias de Sant Josep de sa Talaia, Es Cubells i Sant Agustí des Vedrà": {
    ca: "Parròquies de Sant Josep de sa Talaia, es Cubells i Sant Agustí des Vedrà",
    en: "Parishes of Sant Josep de sa Talaia, Es Cubells and Sant Agustí des Vedrà",
  },
  "Parroquias de Sant Jordi de ses Salines i Sant Francesc de s'Estany": {
    ca: "Parròquies de Sant Jordi de ses Salines i Sant Francesc de s'Estany",
    en: "Parishes of Sant Jordi de ses Salines and Sant Francesc de s'Estany",
  },
  "Parroquia de Sant Antoni": { ca: "Parròquia de Sant Antoni", en: "Parish of Sant Antoni" },
  "Parroquia de Sant Mateu": { ca: "Parròquia de Sant Mateu", en: "Parish of Sant Mateu" },
  "Parroquia de Sant Rafel": { ca: "Parròquia de Sant Rafel", en: "Parish of Sant Rafel" },
  "Parroquia de Santa Agnès": { ca: "Parròquia de Santa Agnès", en: "Parish of Santa Agnès" },
};

/** A zone or area of a municipality in the page's language. */
export function areaNameIntl(place: string, locale: Edition): string {
  return AREA_NAME[place]?.[locale] ?? placeName(place, locale);
}

/** The province in the page's language: "Sevilla" → "Seville", "Alicante" → "Alacant". */
function provinceName(c: City, locale: Edition): string {
  return editionCityName({ name: placeName(c.province, locale) }, locale);
}

/** "689.423" / "689,423". */
export function populationIntl(c: City, locale: Edition): string {
  return POP[locale].format(c.population);
}

/** The bulletin's note on where a day applies, in the page's language (the Spanish if a new one lacks it; a test forbids that). */
export function localNoteIntl(note: string | undefined, locale: Edition): string | undefined {
  if (!note) return undefined;
  const known = LOCAL_DAY_NOTE[note]?.[locale];
  if (known) return known;
  const common = note.match(/^común a toda (.+)$/);
  if (common) return tr(locale, `comú a tota ${common[1]}`, `shared by all of ${common[1]}`);
  return note;
}

/** Communities with a single province, where "capital of the province" would read oddly. */
const ONE_PROVINCE = new Set(["AS", "IB", "MC", "RI", "CB", "MD", "NC"]);

/** "capital de la província de Cadis", "capital of the province of Cádiz", "a la província de Màlaga", "in Asturias". */
export function placeWordsIntl(c: City, locale: Edition): string {
  const one = ONE_PROVINCE.has(c.region);
  const r = region(c, locale);
  const province = provinceName(c, locale);
  const islandName = c.island ? placeName(c.island === "Lanzarote y La Graciosa" ? "Lanzarote" : c.island, locale) : null;
  if (locale === "ca") {
    if (c.capital) return one ? `capital ${r.of}` : `capital de la província ${caOf(province)}`;
    const island = islandName ? `, a ${islandName}` : "";
    return one ? `${r.in}${island}` : `a la província ${caOf(province)}${island}`;
  }
  if (c.capital) return one ? `the capital ${r.of}` : `capital of the province of ${province}`;
  const island = islandName ? `, on ${islandName}` : "";
  return one ? `${r.in}${island}` : `in the province of ${province}${island}`;
}

/** The bulletin's name for the day, or "festa local" / "local holiday" where it gives none. */
export function localNameIntl(d: LocalDay, locale: Edition): string {
  return d.name ?? tr(locale, "Festa local", "Local holiday");
}

function withName(d: LocalDay, locale: Edition): string {
  const date = weekdayDateIntl(d.date, locale);
  if (locale === "ca") return d.name ? `el ${date} (${d.name})` : `el ${date}`;
  return d.name ? `${date} (${d.name})` : date;
}

/** "9 febr. i 24 juny" / "9 Feb and 24 Jun". */
function abbrPair(a: string, b: string, locale: Edition): string {
  if (a.slice(0, 7) === b.slice(0, 7)) return compactDatesIntl([a, b], locale);
  return `${compactDatesIntl([a], locale)} ${tr(locale, "i", "and")} ${compactDatesIntl([b], locale)}`;
}

/** "novembre de 2026" / "November 2026": the month the 2027 list is expected, from the 2026 one. */
export function expectedWordsIntl(c: City, locale: Edition): string | null {
  const month = expectedMonth(c.region);
  if (!month) return null;
  const words = dayMonthYear(`${month}-01`, locale);
  return locale === "ca" ? words.replace(/^1 (de |d')/, "") : words.replace(/^1 /, "");
}

/* ------------------------------------------------------------- Metadata --- */

export function cityTitleIntl(c: City, locale: Edition): string {
  const days = localDays(c);
  const name = nameOf(c, locale);
  const brief = editionCityShort(c, locale);
  const Name = cap(name);
  const Brief = cap(brief);
  if (local2027(c) && !isZoned(c) && days.length === 2) {
    const [a, b] = [days[0]!.date, days[1]!.date];
    const candidates =
      locale === "ca"
        ? [
            `Festius locals ${Name} ${YEAR}: ${dayPair(a, b, "ca")}`,
            `Festius locals ${Brief} ${YEAR}: ${dayPair(a, b, "ca")}`,
            `Festius locals ${Brief} ${YEAR}: ${abbrPair(a, b, "ca")}`,
            `Festius ${Brief} ${YEAR}: ${abbrPair(a, b, "ca")}`,
          ]
        : [
            `${Name} local holidays ${YEAR}: ${dayPair(a, b, "en")}`,
            `${Brief} local holidays ${YEAR}: ${dayPair(a, b, "en")}`,
            `${Brief} local holidays ${YEAR}: ${abbrPair(a, b, "en")}`,
            `${Brief} holidays ${YEAR}: ${abbrPair(a, b, "en")}`,
          ];
    const fit = candidates.find((t) => t.length <= EDITION_TITLE_LIMIT);
    if (fit) return fit;
  }
  const generic =
    locale === "ca"
      ? [`Calendari laboral ${Name} ${YEAR}: festius`, `Calendari laboral ${Brief} ${YEAR}: festius`, `Festius ${Brief} ${YEAR}`]
      : [`${Name} public holidays ${YEAR}: work calendar`, `${Brief} public holidays ${YEAR}: work calendar`, `${Brief} public holidays ${YEAR}`];
  return generic.find((t) => t.length <= EDITION_TITLE_LIMIT) ?? generic.at(-1)!;
}

export function cityH1Intl(c: City, locale: Edition): string {
  const name = nameOf(c, locale);
  return tr(locale, `Calendari laboral ${YEAR} ${caOf(name)}: festius locals i ponts`, `${cap(name)} public holidays ${YEAR}: local holidays and long weekends`);
}

/** "BOJA núm. 210, de 29.10.2026" → "BOJA". */
function bulletinAbbr(list: LocalList): string {
  return list.source.ref.split(/\s/)[0] ?? list.source.ref;
}

export function cityDescriptionIntl(c: City, locale: Edition): string {
  const list = local2027(c);
  const total = holidayCount(c);
  const name = nameOf(c, locale);
  const Name = cap(name);
  const r = region(c, locale);
  const fit = (candidates: string[]) => candidates.find((t) => t.length <= EDITION_DESCRIPTION_LIMIT) ?? candidates.at(-1)!;
  if (list) {
    const days = localDays(c);
    const abbr = bulletinAbbr(list);
    if (locale === "ca") {
      const head = isZoned(c)
        ? `Festes locals ${caOf(name)} el ${YEAR}, per zones, segons el ${abbr}: ${compactDatesIntl(days.map((d) => d.date), "ca")} i més.`
        : `Festes locals ${caOf(name)} el ${YEAR}: ${joinList(days.map((d) => weekdayDateIntl(d.date, "ca")), "ca")} (${abbr}).`;
      return fit([`${head} En total, ${total} festius el ${YEAR}; ponts i calendari laboral.`, `${head} En total, ${total} festius el ${YEAR}.`, head]);
    }
    const head = isZoned(c)
      ? `${Name}'s ${YEAR} local holidays vary by area, according to the ${abbr}: ${compactDatesIntl(days.map((d) => d.date), "en")} and more.`
      : `${Name}'s ${YEAR} local holidays: ${joinList(days.map((d) => weekdayDateIntl(d.date, "en")), "en")} (${abbr}).`;
    return fit([`${head} ${total} public holidays in all in ${YEAR}, with long weekends.`, `${head} ${total} public holidays in all in ${YEAR}.`, head]);
  }
  const regional = dayCount(c.region) + (islandDay(c) ? 1 : 0);
  const d26 = c.local2026?.days;
  if (locale === "ca") {
    const last = d26 ? ` El 2026 van ser ${caDayArticle(d26[0]!.date)}${dayPair(d26[0]!.date, d26[1]!.date, "ca")}.` : "";
    return fit([
      `Calendari laboral ${YEAR} ${caOf(name)}: els ${regional} festius ${r.of} i les 2 festes locals, encara sense publicar.${last}`,
      `Calendari laboral ${YEAR} ${caOf(name)}: els ${regional} festius ${r.of} i les festes locals, encara pendents.${last}`,
      `Calendari laboral ${YEAR} ${caOf(name)}: els ${regional} festius ${r.of}; les festes locals, encara pendents.`,
    ]);
  }
  const last = d26 ? ` In 2026 they were ${dayPair(d26[0]!.date, d26[1]!.date, "en")}.` : "";
  return fit([
    `${Name} work calendar ${YEAR}: the ${regional} holidays ${r.of} and its 2 local holidays, not yet published.${last}`,
    `${Name} work calendar ${YEAR}: the ${regional} holidays ${r.of}; local holidays not yet published.${last}`,
    `${Name} work calendar ${YEAR}: the ${regional} holidays ${r.of}; local holidays not yet published.`,
  ]);
}

/** How many of the 2 local days of 2027 are still unknown. */
function missingLocal(c: City): number {
  return local2027(c) ? 0 : 2 - commonLocalDays(c).length;
}

/* ---------------------------------------------------------------- Intro --- */

/** What a local day does to the week: a long weekend, a bridge, nothing on a weekend. */
export function planWordsIntl(c: City, d: LocalDay, locale: Edition): string {
  const wd = new Date(`${d.date}T12:00:00Z`).getUTCDay();
  const w = weekdayName(d.date, locale);
  if (wd === 0 || wd === 6)
    return tr(locale, "cau en cap de setmana i no dona cap dia lliure més de dilluns a divendres", "falls on a weekend, so it adds no day off in a Monday-to-Friday week");
  const plan = planForLocal(c, d.date);
  const plain = tr(locale, `cau en ${w}`, `falls on a ${w}`);
  if (!plan) return plain;
  if (plan.take.length === 0) return plan.days >= 3 ? tr(locale, `dona un cap de setmana llarg de ${plan.days} dies`, `makes a ${plan.days}-day long weekend`) : plain;
  const dates = joinList(
    plan.take.map((x) => weekdayDateIntl(x, locale)),
    locale,
  );
  return locale === "ca"
    ? `deixa un pont de ${plan.days} dies amb ${plan.take.length === 1 ? "1 dia" : `${plan.take.length} dies`} de vacances (${dates})`
    : `makes a ${plan.days}-day break with ${plan.take.length === 1 ? "1 day" : `${plan.take.length} days`} of leave (${dates})`;
}

/** " El 8 de setembre també és festa local a Huelva, Mijas i Utrera.": cities of the community sharing a day (up to 4 named). */
export function sharedLineIntl(c: City, locale: Edition): string {
  return localDays(c)
    .map((d) => {
      const others = sharedWith(c, d.date);
      if (others.length === 0) return "";
      const shown = others.slice(0, 4).map((x) => editionCityName(x, locale));
      const rest = others.length - shown.length;
      const date = dayMonth(d.date, locale);
      if (locale === "ca") {
        const who = rest > 0 ? `${shown.join(", ")} i ${rest} ${rest === 1 ? "ciutat" : "ciutats"} més` : joinList(shown, "ca");
        return ` ${cap(caDayArticle(d.date))}${date} també és festa local ${caIn(who)}.`;
      }
      const who = rest > 0 ? `${shown.join(", ")} and ${rest} more ${rest === 1 ? "city" : "cities"}` : joinList(shown, "en");
      return ` ${date} is also a local holiday in ${who}.`;
    })
    .join("");
}

/** For a city without its 2027 days: not out yet, when and where expected (from 2026), what the list says, what 2026 had. */
export function pendingLineIntl(c: City, locale: Edition): string {
  const name = nameOf(c, locale);
  const Name = cap(name);
  const where = bulletinIn(region(c, locale), locale);
  const when = expectedWordsIntl(c, locale);
  const note = CITY_NOTE[c.slug]?.[locale] ?? "";
  const common = commonLocalDays(c);
  if (locale === "ca") {
    const status =
      c.status2027 === "missing"
        ? `Les festes locals del ${YEAR} ${caOf(name)} encara no s'han publicat. ${note}`.trim()
        : `Les festes locals del ${YEAR} ${caOf(name)} encara no s'han publicat; s'esperen ${when ? `el mes ${caOf(when.replace(/ de \d{4}$/, ""))}` : "les pròximes setmanes"} ${where}.`;
    const known = common.length
      ? ` Una de les dues ja se sap: el ${weekdayDateIntl(common[0]!.date, "ca")} (${common[0]!.name}), ${localNoteIntl(common[0]!.note, "ca") ?? ""}${decreeRef(c)}.`
      : "";
    const last = c.local2026 ? ` El 2026 van ser ${joinList(c.local2026.days.map((d) => `${caDayArticle(d.date)}${dayMonth(d.date, "ca")}${d.name ? ` (${d.name})` : ""}`), "ca")}.` : "";
    return `${status}${known}${last}`;
  }
  const status =
    c.status2027 === "missing"
      ? `${Name}'s ${YEAR} local holidays have not been published yet. ${note}`.trim()
      : `${Name}'s ${YEAR} local holidays have not been published yet; they are expected ${when ? `in ${when.replace(/ \d{4}$/, "")}` : "in the coming weeks"} ${where}.`;
  const known = common.length
    ? ` One of the two is already known: ${weekdayDateIntl(common[0]!.date, "en")} (${common[0]!.name}), ${localNoteIntl(common[0]!.note, "en") ?? ""}${decreeRef(c)}.`
    : "";
  const last = c.local2026 ? ` In 2026 they were ${joinList(c.local2026.days.map((d) => `${dayMonth(d.date, "en")}${d.name ? ` (${d.name})` : ""}`), "en")}.` : "";
  return `${status}${known}${last}`;
}

/** The first line under the H1, as `cityAnswer` in the Spanish edition (13 Nov 2026). */
export function cityAnswerIntl(c: City, locale: Edition): { strong: string; rest: string } {
  const name = nameOf(c, locale);
  const Name = cap(name);
  const r = region(c, locale);
  const list = local2027(c);
  const days = localDays(c);
  const ca = locale === "ca";
  if (list && !isZoned(c)) {
    const island = islandDay(c) ? tr(locale, " i la festa insular", " and the island holiday") : "";
    return {
      strong: tr(locale, `Festes locals ${caOf(name)} el ${YEAR}: ${joinList(days.map((d) => withName(d, "ca")), "ca")}.`, `${Name} local holidays ${YEAR}: ${joinList(days.map((d) => withName(d, "en")), "en")}.`),
      rest: tr(
        locale,
        ` Les publica el ${list.source.ref}. Amb els ${dayCount(c.region)} festius ${r.of}${island}, són ${holidayCount(c)} festius el ${YEAR}.`,
        ` Published in the ${list.source.ref}. With the ${dayCount(c.region)} holidays ${r.of}${island}, that makes ${holidayCount(c)} public holidays in ${YEAR}.`,
      ),
    };
  }
  if (list) {
    const main = areaNameIntl(list.mainArea ?? c.name, locale).replace(/^(Tot|The) /, (w) => w.toLowerCase());
    return {
      strong: tr(
        locale,
        `Festes locals ${caOf(name)} el ${YEAR}, per zones: ${main}, ${joinList(days.map((d) => withName(d, "ca")), "ca")}.`,
        `${Name} local holidays ${YEAR}, by area: ${main}, ${joinList(days.map((d) => withName(d, "en")), "en")}.`,
      ),
      rest: tr(locale, ` Les altres zones, a la taula de festes locals. Font: ${list.source.ref}.`, ` The other areas are in the local holidays table. Source: ${list.source.ref}.`),
    };
  }
  const where = bulletinIn(r, locale);
  const when = expectedWordsIntl(c, locale);
  const common = commonLocalDays(c);
  const note = CITY_NOTE[c.slug]?.[locale];
  const status =
    c.status2027 === "missing"
      ? ` ${note ?? tr(locale, `La llista del ${YEAR} ja ha sortit, però no les dona.`, `The ${YEAR} list is out but does not give them.`)}`
      : ca
        ? ` S'esperen ${when ? `el mes ${caOf(when.replace(/ de \d{4}$/, ""))}` : "les pròximes setmanes"} ${where}.`
        : ` They are expected ${when ? `in ${when.replace(/ \d{4}$/, "")}` : "in the coming weeks"} ${where}.`;
  const known = common.length
    ? tr(locale, ` Una ja se sap: el ${weekdayDateIntl(common[0]!.date, "ca")} (${common[0]!.name}).`, ` One is already known: ${weekdayDateIntl(common[0]!.date, "en")} (${common[0]!.name}).`)
    : "";
  const last = c.local2026
    ? ca
      ? ` El 2026 van ser ${joinList(c.local2026.days.map((d) => `${caDayArticle(d.date)}${dayMonth(d.date, "ca")}`), "ca")}.`
      : ` In 2026 they were ${joinList(c.local2026.days.map((d) => dayMonth(d.date, "en")), "en")}.`
    : "";
  return {
    strong: tr(locale, `Festes locals ${caOf(name)} el ${YEAR}: encara sense publicar.`, `${Name} local holidays ${YEAR}: not published yet.`),
    rest: `${status}${known}${last}${tr(locale, ` Butlletins consultats el ${dayMonthYear(CITIES_AS_OF, "ca")}.`, ` Bulletins read on ${dayMonthYear(CITIES_AS_OF, "en")}.`)}`,
  };
}

/** " (BOE ref of the community's decree)" when it is published, as the Spanish edition cites it. */
function decreeRef(c: City): string {
  const decree = SOURCES[c.region].decree;
  return decree.status === "published" ? ` (${decree.text.ref})` : "";
}

/**
 * The first paragraph, made of the city's own facts only: size and place,
 * the two days and their names, the bulletin, the total, what each day does
 * to the week.
 */
export function cityLeadIntl(c: City, locale: Edition): string {
  const name = nameOf(c, locale);
  const Name = cap(name);
  const r = region(c, locale);
  const pop = populationIntl(c, locale);
  const place = placeWordsIntl(c, locale);
  const list = local2027(c);
  const regional = dayCount(c.region);
  const island = islandDay(c);
  const total = holidayCount(c);
  if (locale === "ca") {
    const who = `${Name} (${pop} habitants, ${place})`;
    const base = island
      ? `els ${regional} festius ${r.of} i la festa insular ${caOf(placeName(island.place, "ca"))} (${weekdayDateIntl(island.date, "ca")})`
      : `els ${regional} festius ${r.of}`;
    if (list && !isZoned(c)) {
      const days = localDays(c);
      const effects = days.map((d) => `el ${weekdayDateIntl(d.date, "ca")} ${planWordsIntl(c, d, "ca")}`);
      return (
        `${who} té aquestes 2 festes locals el ${YEAR}: ${joinList(days.map((d) => withName(d, "ca")), "ca")}. ` +
        `Les publica el ${list.source.ref}. Amb ${base}, fan ${total} dies festius el ${YEAR}. ` +
        `${cap(joinList(effects, "ca"))}.${sharedLineIntl(c, "ca")}`
      );
    }
    if (list) {
      const parts = [
        `${areaNameIntl(list.mainArea ?? c.name, "ca")}: ${joinList(localDays(c).map((d) => withName(d, "ca")), "ca")}`,
        ...(list.zones ?? []).map((z) => `${areaNameIntl(z.place, "ca")}: ${joinList(z.days.map((d) => withName(d, "ca")), "ca")}`),
      ];
      return (
        `${who} no té les mateixes festes locals a tot el terme el ${YEAR}: el ${list.source.ref} les dona per zones. ` +
        `${parts.join(". ")}. Amb ${base}, fan ${total} dies festius a cada zona.`
      );
    }
    return `${pendingLineIntl(c, "ca")} ${cap(base)} ja són oficials (BOE del 13 d'octubre de 2026); ${name} té ${pop} habitants i és ${place}.`;
  }
  const who = `${Name} (population ${pop}, ${place})`;
  const base = island
    ? `the ${regional} holidays ${r.of} and the island holiday of ${placeName(island.place, "en")} (${weekdayDateIntl(island.date, "en")})`
    : `the ${regional} holidays ${r.of}`;
  if (list && !isZoned(c)) {
    const days = localDays(c);
    const effects = days.map((d) => `${weekdayDateIntl(d.date, "en")} ${planWordsIntl(c, d, "en")}`);
    return (
      `${who} has these 2 local holidays in ${YEAR}: ${joinList(days.map((d) => withName(d, "en")), "en")}. ` +
      `They are published in the ${list.source.ref}. Together with ${base}, that makes ${total} public holidays in ${YEAR}. ` +
      `${cap(joinList(effects, "en"))}.${sharedLineIntl(c, "en")}`
    );
  }
  if (list) {
    const parts = [
      `${areaNameIntl(list.mainArea ?? c.name, "en")}: ${joinList(localDays(c).map((d) => withName(d, "en")), "en")}`,
      ...(list.zones ?? []).map((z) => `${areaNameIntl(z.place, "en")}: ${joinList(z.days.map((d) => withName(d, "en")), "en")}`),
    ];
    return (
      `${who} does not have the same local holidays across the whole municipality in ${YEAR}: the ${list.source.ref} lists them by area. ` +
      `${parts.join(". ")}. Together with ${base}, that makes ${total} public holidays in each area.`
    );
  }
  return `${pendingLineIntl(c, "en")} ${cap(base)} are already official (BOE of 13 October 2026); ${Name} has a population of ${pop} and is ${c.capital && !place.startsWith("the ") ? `the ${place}` : place}.`;
}

/* ------------------------------------------------------------------ FAQ --- */

export function cityFaqIntl(c: City, locale: Edition): FaqIntl[] {
  const list = local2027(c);
  const total = holidayCount(c);
  const regional = dayCount(c.region);
  const island = islandDay(c);
  const name = nameOf(c, locale);
  const Name = cap(name);
  const r = region(c, locale);
  const wn = (d: LocalDay) => withName(d, locale);
  if (locale === "ca") {
    const islandWords = island ? `, la festa insular ${caOf(placeName(island.place, "ca"))}` : "";
    if (list) {
      const days = localDays(c);
      const answer = isZoned(c)
        ? `Van per zones. ${areaNameIntl(list.mainArea ?? c.name, "ca")}: ${joinList(days.map(wn), "ca")}. ${(list.zones ?? []).map((z) => `${areaNameIntl(z.place, "ca")}: ${joinList(z.days.map(wn), "ca")}.`).join(" ")}`
        : `${cap(joinList(days.map(wn), "ca"))}.`;
      const weekend = weekendLocalDays(c).length;
      return [
        { question: `Quins són els festius locals ${caOf(name)} el ${YEAR}?`, answer: `${answer} Font: ${list.source.ref}.` },
        ...days.map((d) => {
          const note = localNoteIntl(d.note, "ca");
          return {
            question: `És festiu el ${weekdayDateIntl(d.date, "ca")} del ${YEAR} ${caIn(name)}?`,
            answer: `Sí. És festa local ${caIn(name)}${d.name ? ` (${d.name})` : ""}${note ? `, ${note}` : ""}, no un festiu de tota la comunitat. ${cap(planWordsIntl(c, d, "ca"))}.`,
          };
        }),
        {
          question: `Quants festius té ${name} el ${YEAR}?`,
          answer: `${total}: els ${regional} festius ${r.of} que publica el BOE${islandWords} i les 2 festes locals.${weekend ? ` ${weekend === 1 ? "Una cau" : "Totes dues cauen"} en cap de setmana.` : ""}`,
        },
        {
          question: `Quins ponts donen les festes locals ${caOf(name)} el ${YEAR}?`,
          answer: localRuns(c).length
            ? `${localRuns(c)
                .map((x) => runLineIntl(x, "ca"))
                .join(". ")}. Càlcul de CatalunyaInfo per a una setmana de dilluns a divendres.`
            : `Cap: ${joinList(days.map((d) => `el ${weekdayDateIntl(d.date, "ca")} ${planWordsIntl(c, d, "ca")}`), "ca")}.`,
        },
      ];
    }
    return [
      { question: `Ja se saben els festius locals del ${YEAR} ${caOf(name)}?`, answer: `No. ${pendingLineIntl(c, "ca")}` },
      {
        question: `Quants festius té ${name} el ${YEAR}?`,
        answer:
          commonLocalDays(c).length > 0
            ? `${total} ja són oficials: els ${regional} festius ${r.of} que publica el BOE${islandWords} i la festa local comuna a tota la comunitat (${joinList(commonLocalDays(c).map((d) => dayMonth(d.date, "ca")), "ca")}). Falta la festa local pròpia del municipi.`
            : `${total} ja són oficials: els ${regional} festius ${r.of} que publica el BOE${islandWords}. S'hi afegiran les ${missingLocal(c)} festes locals quan es publiquin.`,
      },
      ...(c.local2026
        ? [
            {
              question: `Quins dies van ser festa local ${caIn(name)} el 2026?`,
              answer: `${cap(joinList(c.local2026.days.map(wn), "ca"))}, segons: ${c.local2026.source.title} (${c.local2026.source.ref}). Serveixen de referència, però no valen per al ${YEAR}.`,
            },
          ]
        : []),
    ];
  }
  const islandWords = island ? `, the island holiday of ${placeName(island.place, "en")}` : "";
  if (list) {
    const days = localDays(c);
    const answer = isZoned(c)
      ? `They vary by area. ${areaNameIntl(list.mainArea ?? c.name, "en")}: ${joinList(days.map(wn), "en")}. ${(list.zones ?? []).map((z) => `${areaNameIntl(z.place, "en")}: ${joinList(z.days.map(wn), "en")}.`).join(" ")}`
      : `${cap(joinList(days.map(wn), "en"))}.`;
    const weekend = weekendLocalDays(c).length;
    return [
      { question: `What are ${Name}'s local holidays in ${YEAR}?`, answer: `${answer} Source: ${list.source.ref}.` },
      ...days.map((d) => {
        const note = localNoteIntl(d.note, "en");
        return {
          question: `Is ${weekdayDateIntl(d.date, "en")} ${YEAR} a holiday in ${Name}?`,
          answer: `Yes. It is a local holiday in ${Name}${d.name ? ` (${d.name})` : ""}${note ? `, ${note}` : ""}, not a holiday across the community. It ${planWordsIntl(c, d, "en")}.`,
        };
      }),
      {
        question: `How many public holidays does ${Name} have in ${YEAR}?`,
        answer: `${total}: the ${regional} holidays ${r.of} published in the BOE${islandWords} and the 2 local holidays.${weekend ? ` ${weekend === 1 ? "One of them falls" : "Both fall"} on a weekend.` : ""}`,
      },
      {
        question: `What long weekends do ${Name}'s local holidays make in ${YEAR}?`,
        answer: localRuns(c).length
          ? `${localRuns(c)
              .map((x) => runLineIntl(x, "en"))
              .join(". ")}. CatalunyaInfo's calculation for a Monday-to-Friday week.`
          : `None: ${joinList(days.map((d) => `${weekdayDateIntl(d.date, "en")} ${planWordsIntl(c, d, "en")}`), "en")}.`,
      },
    ];
  }
  return [
    { question: `Are ${Name}'s ${YEAR} local holidays known yet?`, answer: `No. ${pendingLineIntl(c, "en")}` },
    {
      question: `How many public holidays does ${Name} have in ${YEAR}?`,
      answer:
        commonLocalDays(c).length > 0
          ? `${total} are already official: the ${regional} holidays ${r.of} published in the BOE${islandWords} and the local holiday shared by the whole community (${joinList(commonLocalDays(c).map((d) => dayMonth(d.date, "en")), "en")}). The municipality's own local holiday is still to come.`
          : `${total} are already official: the ${regional} holidays ${r.of} published in the BOE${islandWords}. The ${missingLocal(c)} local holidays will be added once they are published.`,
    },
    ...(c.local2026
      ? [
          {
            question: `Which days were local holidays in ${Name} in 2026?`,
            answer: `${cap(joinList(c.local2026.days.map(wn), "en"))}, according to ${c.local2026.source.title} (${c.local2026.source.ref}). They are a guide only and do not apply in ${YEAR}.`,
          },
        ]
      : []),
  ];
}

/* ---------------------------------------------------------- List lines --- */

/** For the community page and the hub: "14 abr. i 27 maig", or the 2026 days, labelled. */
export function cityListLineIntl(c: City, locale: Edition): string {
  if (local2027(c)) return `${compactDatesIntl(localDays(c).map((d) => d.date), locale)}${isZoned(c) ? tr(locale, "; per zones", "; by area") : ""}`;
  const pending = tr(locale, "Pendent", "Pending");
  return c.local2026 ? `${pending} (2026: ${compactDatesIntl(c.local2026.days.map((d) => d.date), locale)})` : pending;
}

export function populationSourceLineIntl(c: City, locale: Edition): string {
  return tr(
    locale,
    `Població: ${populationIntl(c, "ca")} habitants a ${dayMonthYear(INE_POPULATION.asOf, "ca")} (INE; ${INE_POPULATION.title.split(",")[0]}).`,
    `Population: ${populationIntl(c, "en")} at ${dayMonthYear(INE_POPULATION.asOf, "en")} (INE; ${INE_POPULATION.title.split(",")[0]}).`,
  );
}

export function asOfLineIntl(locale: Edition): string {
  return tr(locale, `Festes locals consultades el ${dayMonthYear(CITIES_AS_OF, "ca")} als butlletins oficials.`, `Local holidays read on ${dayMonthYear(CITIES_AS_OF, "en")} in the official bulletins.`);
}
