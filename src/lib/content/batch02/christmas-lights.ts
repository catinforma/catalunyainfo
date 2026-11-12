import type { Block } from "@/lib/content/blocks";
import { shortDate } from "@/lib/content/holidays/calendar";
import type { Locale } from "@/lib/i18n/config";
import { fairsHubPath } from "@/lib/programmatic/christmas-fairs/paths";

import { SANTA_LLUCIA_2026, hoursText } from "./christmas";
import { LIGHTS_TOWNS, LIGHTS_TOWNS_AS_OF, LIGHTS_TOWNS_NOT_REREAD, announcedTowns, type LightsTown, type TownSwitchOn } from "./christmas-lights-towns";
import {
  ANNOUNCED_2026,
  LIGHTS_PLAN_2026,
  LIGHTS_SWITCH_ON_CHECKED,
  MOBILITY_2025,
  PAST,
  SWITCH_ON_HISTORY,
  SWITCH_ON_HISTORY_CHECKED,
  WATCH,
  dateYear,
  dayDate,
  lightingHours2025,
  placePhrase,
  range,
  type Announcement,
  type Announcements,
} from "./festive";
import {
  b2Related,
  b2link,
  callout,
  faq,
  h2,
  keyFacts,
  languageLinks,
  lead,
  list,
  paras,
  table,
  verifiedLine,
  type B2Article,
  type B2Key,
  type B2Source,
} from "./shared";
import { SHOPS } from "./shops";

/**
 * Encesa de llums de Nadal 2026: Barcelona first, then 25 towns of Catalonia,
 * on year-free URLs (guies/encesa-llums-nadal-barcelona,
 * guias/encendido-luces-navidad-barcelona, guides/barcelona-christmas-lights)
 * with the year in the titles.
 *
 * Why a page of its own (4 Nov 2026): about 3,000 impressions a week of
 * lights queries ("encesa llums nadal barcelona 2026" 311 at pos 8.3,
 * "encesa de llums barcelona 2026" 206 at 8.7, "luces navidad barcelona 2026"
 * 69 at 9.1) land on the Christmas in Barcelona pages at about 0.5% CTR. Those
 * pages are about the whole season and their titles are inside a measurement
 * window (docs/SEO_EXPERIMENTS.md, 3 Nov). The town-level searches ("encesa
 * llums nadal <town> 2026", "encendido luces navidad <town>") peak mid-late
 * November and no page of ours answers them.
 *
 * Barcelona's facts are never typed here: they come from festive.ts
 * (ANNOUNCED_2026.lightsSwitchOn, PAST.lights2024/2025, SWITCH_ON_HISTORY,
 * LIGHTS_PLAN_2026, MOBILITY_2025, LIGHTS_SWITCH_ON_CHECKED). On 4 Nov 2026
 * (morning) the City Council had published no 2026 switch-on: press room home,
 * its searches for "llums nadal" and "encesa" (newest 2026 items 8-9 Jul, the
 * lighting plan), the "nadal-2026" tag, and barcelona.cat/nadal/ca, still the
 * 2025 edition ("Aquest web es tornarà a actualitzar al voltant del mes de
 * novembre del 2026"). The 2025 nightly hours were re-read that day on the
 * note of 16 Oct 2025 (festive.ts PAST.lights2025.hours); the 2026 streets on
 * the lighting plan of 9 Jul 2026
 * (https://ajuntament.barcelona.cat/premsa/2026/07/09/barcelona-consolida-el-festival-de-llums-de-nadal/):
 * 130 km, designer lights back at Via Laietana, plaça de Catalunya, Aragó,
 * Gran Via and passeig de Sant Joan plus Rambla de Prim and passeig de
 * Maragall; Ronda de Sant Pere, Balmes, plaça d'Urquinaona, the Rambla and
 * the whole Paral·lel; more than fifty fountains; the Galet in every district
 * and plaça de Sant Miquel.
 *
 * The towns come from christmas-lights-towns.ts (one row per town, the
 * council's own URL and read date on each, LIGHTS_TOWNS_AS_OF for the table).
 * Santa Llúcia's dates come from christmas.ts SANTA_LLUCIA_2026.
 *
 * When Barcelona publishes: fill festive.ts ANNOUNCED_2026.lightsSwitchOn
 * (its HOW TO UPDATE), move LIGHTS_SWITCH_ON_CHECKED, test, deploy, publish
 * `llums-nadal` (and `christmas-bcn`, `nye`, `barcelona-december`). Title,
 * description, lead, key facts, the Barcelona row and the FAQ switch by
 * themselves.
 *
 * No new photograph: the hero is the shops guide's lead picture (Christmas
 * lights on a Barcelona shopping street, CC BY-SA 4.0), also the Christmas in
 * Barcelona hero, with its exact alt text and caption, because media rows are
 * keyed by file.
 */

/** The day the page was last brought up to date: the later of the Barcelona check and the town table's. */
export const CHRISTMAS_LIGHTS_AS_OF = LIGHTS_SWITCH_ON_CHECKED > LIGHTS_TOWNS_AS_OF ? LIGHTS_SWITCH_ON_CHECKED : LIGHTS_TOWNS_AS_OF;

const TITLE_LIMIT = 60;
const DESCRIPTION_LIMIT = 155;
/** The first option that fits, or the last one. */
const fit = (options: string[], limit: number): string => options.find((o) => o.length <= limit) ?? options[options.length - 1]!;
const cap = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
const AND: Record<Locale, string> = { ca: " i ", es: " y ", en: " and " };
/** "Girona, Reus i Sabadell". */
const joinNames = (names: string[], locale: Locale) =>
  names.length < 2 ? (names[0] ?? "") : `${names.slice(0, -1).join(", ")}${AND[locale]}${names[names.length - 1]}`;

/** The newest Barcelona switch-on on record (2025), from the City Council's notes. */
const LAST = SWITCH_ON_HISTORY[0]!;
const PREVIOUS = SWITCH_ON_HISTORY[1]!;
const HOURS_2025 = PAST.lights2025.hours;

export const CHRISTMAS_LIGHTS_META: Record<Locale, { path: string; title: string; excerpt: string }> = {
  ca: {
    path: "guies/encesa-llums-nadal-barcelona",
    title: "Encesa de llums de Nadal 2026 a Barcelona i Catalunya: dates, hores i llocs",
    excerpt: "Quan s'encenen els llums de Nadal a Barcelona el 2026, a quina hora i on, i les dates de l'encesa a 25 municipis de Catalunya, de la web de cada ajuntament.",
  },
  es: {
    path: "guias/encendido-luces-navidad-barcelona",
    title: "Encendido de luces de Navidad 2026 en Barcelona y Cataluña: fechas, horas y lugares",
    excerpt: "Cuándo se encienden las luces de Navidad en Barcelona en 2026, a qué hora y dónde, y las fechas del encendido en 25 municipios de Cataluña, de la web de cada ayuntamiento.",
  },
  en: {
    path: "guides/barcelona-christmas-lights",
    title: "Christmas lights switch-on 2026 in Barcelona and Catalonia: dates, times and places",
    excerpt: "When Barcelona switches on its Christmas lights in 2026, at what time and where, plus the switch-on dates in 25 Catalan towns, from each town council's website.",
  },
};

/* -------------------------------------------------------------------------- */
/* Title and description                                                      */
/* -------------------------------------------------------------------------- */

/**
 * The search title, in the searchers' words, Barcelona first. Until the City
 * Council has a date, the year and the towns ("dates" only when some town has
 * one); once ANNOUNCED_2026 has it, the date itself.
 */
export function lightsTitle(locale: Locale, facts: Announcements = ANNOUNCED_2026, towns: readonly LightsTown[] = LIGHTS_TOWNS): string {
  const a = facts.lightsSwitchOn;
  if (a) {
    const short = shortDate(a.date, locale);
    const options: Record<Locale, string[]> = {
      ca: [`Encesa de llums de Nadal 2026 a Barcelona: ${short}`, `Encesa de llums 2026 a Barcelona: ${short}`],
      es: [`Encendido de luces de Navidad 2026 en Barcelona: ${short}`, `Encendido luces Navidad 2026 Barcelona: ${short}`],
      en: [`Barcelona Christmas lights switch-on 2026: ${short}`, `Barcelona Christmas lights 2026: ${short}`],
    };
    return fit(options[locale], TITLE_LIMIT);
  }
  const dated = announcedTowns(towns).length > 0;
  const options: Record<Locale, string[]> = {
    ca: dated ? ["Encesa de llums de Nadal 2026 a Barcelona i Catalunya: dates"] : ["Encesa de llums de Nadal 2026 a Barcelona i Catalunya"],
    es: dated ? ["Encendido luces Navidad 2026 Barcelona y Cataluña: fechas"] : ["Encendido de luces de Navidad 2026 en Barcelona y Cataluña"],
    en: dated ? ["Barcelona Christmas lights switch-on 2026 and Catalan towns"] : ["Barcelona Christmas lights switch-on 2026 and other towns"],
  };
  return fit(options[locale], TITLE_LIMIT);
}

/**
 * The snippet answers first: Barcelona's date, or that it has none yet with
 * last year's day, time and place; then the towns that already have one.
 */
export function lightsDescription(locale: Locale, facts: Announcements = ANNOUNCED_2026, towns: readonly LightsTown[] = LIGHTS_TOWNS): string {
  const a = facts.lightsSwitchOn;
  const dated = announcedTowns(towns);
  const n = towns.length;
  // "Badalona, Igualada i més", not "Badalona i Igualada i més", when the list is cut.
  const names = (k: number) => (dated.length > k ? dated.slice(0, k).map((t) => t.name).join(", ") : joinNames(dated.slice(0, k).map((t) => t.name), locale));
  // Without a dated town, the biggest ones by name: town searches ("encesa llums <town>") read them.
  const big = ["girona", "tarragona", "lleida", "reus"].map((key) => towns.find((t) => t.key === key)?.name).filter((name): name is string => Boolean(name));
  const others = (k: number) => joinNames([...big.slice(0, k), { ca: `${n - Math.min(k, big.length)} municipis més`, es: `${n - Math.min(k, big.length)} municipios más`, en: `${n - Math.min(k, big.length)} more towns` }[locale]], locale);
  const withDates = (k: number): Record<Locale, string> => ({
    ca: dated.length ? ` Ja tenen data ${names(k)}${dated.length > k ? " i més" : ""}.` : ` També ${others(k)}.`,
    es: dated.length ? ` Ya tienen fecha ${names(k)}${dated.length > k ? " y más" : ""}.` : ` También ${others(k)}.`,
    en: dated.length ? ` Already dated: ${names(k)}${dated.length > k ? " and more" : ""}.` : ` Plus ${others(k)}.`,
  });
  let head: Record<Locale, string>;
  if (a) {
    const day = dayDate(a.date, locale);
    // The moment the lights come on when the note gives it, with the start of the show after it.
    const on = a.lightsOn ?? a.time;
    const at = on ? { ca: ` a les ${on}`, es: ` a las ${on}`, en: ` at ${on}` }[locale] : "";
    const show = a.lightsOn && a.time && a.time !== a.lightsOn ? { ca: ` (acte des de les ${a.time})`, es: ` (acto desde las ${a.time})`, en: ` (show from ${a.time})` }[locale] : "";
    head = {
      ca: `Barcelona encén els llums de Nadal el ${day}${at}${show}.`,
      es: `Barcelona enciende las luces de Navidad el ${day}${at}${show}.`,
      en: `Barcelona switches on its Christmas lights on ${day}${at}${show}.`,
    };
  } else {
    const last = shortDate(LAST.date, locale);
    head = {
      ca: `L'encesa de llums de Barcelona 2026 encara no té data (2025: ${last}, ${LAST.time}, passeig de Gràcia).`,
      es: `El encendido de luces de Barcelona 2026 aún no tiene fecha (2025: ${last}, ${LAST.time}, paseo de Gràcia).`,
      en: `Barcelona's 2026 lights switch-on has no date yet (2025: ${last}, ${LAST.time}, Passeig de Gràcia).`,
    };
  }
  const options = [4, 3, 2, 1].map((k) => `${head[locale]}${withDates(k)[locale]}`);
  return fit(options, DESCRIPTION_LIMIT);
}

/* -------------------------------------------------------------------------- */
/* Barcelona                                                                  */
/* -------------------------------------------------------------------------- */

const CHECKED: Record<Locale, string> = {
  ca: `comprovat el ${dateYear(LIGHTS_SWITCH_ON_CHECKED, "ca")}`,
  es: `comprobado el ${dateYear(LIGHTS_SWITCH_ON_CHECKED, "es")}`,
  en: `checked on ${dateYear(LIGHTS_SWITCH_ON_CHECKED, "en")}`,
};

const PASSEIG: Record<Locale, string> = { ca: "passeig de Gràcia", es: "paseo de Gràcia", en: "Passeig de Gràcia" };

/** "el dissabte 22 de novembre de 2025 a les 18:00" (no leading article in English). */
function at(date: string, time: string | undefined, locale: Locale): string {
  const t = time ? { ca: ` a les ${time}`, es: ` a las ${time}`, en: ` at ${time}` }[locale] : "";
  return `${locale === "en" ? "" : "el "}${dayDate(date, locale)}${t}`;
}

/** "de 17:30 a 1:00 de diumenge a dijous ...", the 2025 hours (or 2026's once announced). */
export function barcelonaLead(locale: Locale, facts: Announcements = ANNOUNCED_2026): string {
  const a = facts.lightsSwitchOn;
  if (a) {
    const where = placePhrase(a, locale);
    const place = where ? `, ${where}` : "";
    const on =
      a.lightsOn && a.time && a.lightsOn !== a.time
        ? { ca: ` L'acte comença a les ${a.time} i els llums s'encenen a les ${a.lightsOn}.`, es: ` El acto empieza a las ${a.time} y las luces se encienden a las ${a.lightsOn}.`, en: ` The show starts at ${a.time} and the lights come on at ${a.lightsOn}.` }[locale]
        : "";
    const who = a.who ? { ca: ` Els encendrà ${a.who.ca}.`, es: ` Las encenderá ${a.who.es}.`, en: ` They will be switched on by ${a.who.en}.` }[locale] : "";
    return {
      ca: `**Barcelona encén els llums de Nadal ${at(a.date, a.lightsOn ? undefined : a.time, "ca")}${place}**, segons l'[anunci de l'Ajuntament](${a.url}).${on}${who} Els tres últims anys l'encesa va ser al passeig de Gràcia a les 18:00.`,
      es: `**Barcelona enciende las luces de Navidad ${at(a.date, a.lightsOn ? undefined : a.time, "es")}${place}**, según el [anuncio del Ayuntamiento](${a.url}).${on}${who} Los tres últimos años el encendido fue en el paseo de Gràcia a las 18:00.`,
      en: `**Barcelona switches on its Christmas lights on ${at(a.date, a.lightsOn ? undefined : a.time, "en")}${place}**, according to the [City Council's announcement](${a.url}).${on}${who} For the last three years the switch-on was on Passeig de Gràcia at 18:00.`,
    }[locale];
  }
  return {
    ca: `**L'Ajuntament de Barcelona encara no ha anunciat la data de l'encesa de llums de Nadal del 2026** (${CHECKED.ca}). El 2025 va ser ${at(LAST.date, LAST.time, "ca")} al passeig de Gràcia, i el 2024, ${at(PREVIOUS.date, PREVIOUS.time, "ca")}, també al passeig de Gràcia. Per a enguany l'Ajuntament preveu ${LIGHTS_PLAN_2026.km} km de carrers il·luminats.`,
    es: `**El Ayuntamiento de Barcelona aún no ha anunciado la fecha del encendido de luces de Navidad de 2026** (${CHECKED.es}). En 2025 fue ${at(LAST.date, LAST.time, "es")} en el paseo de Gràcia, y en 2024, ${at(PREVIOUS.date, PREVIOUS.time, "es")}, también en el paseo de Gràcia. Para este año el Ayuntamiento prevé ${LIGHTS_PLAN_2026.km} km de calles iluminadas.`,
    en: `**Barcelona City Council has not announced the date of its 2026 Christmas lights switch-on yet** (${CHECKED.en}). In 2025 it was on ${at(LAST.date, LAST.time, "en")} on Passeig de Gràcia, and in 2024 on ${at(PREVIOUS.date, PREVIOUS.time, "en")}, also on Passeig de Gràcia. This year the City Council plans ${LIGHTS_PLAN_2026.km} km of lit streets.`,
  }[locale];
}

/** The towns sentence that closes the lead. */
function townsLead(locale: Locale, towns: readonly LightsTown[]): string {
  const dated = announcedTowns(towns);
  const n = towns.length;
  if (!dated.length) {
    return {
      ca: `A la resta de Catalunya, cap dels ${n} municipis d'aquesta guia no ha publicat encara la data del 2026 a la seva web: et donem la del 2025, sempre que la trobem a la web de l'ajuntament.`,
      es: `En el resto de Cataluña, ninguno de los ${n} municipios de esta guía ha publicado aún la fecha de 2026 en su web: te damos la de 2025, siempre que esté en la web del ayuntamiento.`,
      en: `Elsewhere in Catalonia, none of the ${n} towns in this guide has published its 2026 date yet: we give the 2025 date wherever the council's website has it.`,
    }[locale];
  }
  const items = dated.map((t) => `${t.name} (${shortDate(t.y2026!.date, locale)})`);
  return {
    ca: `A la resta de Catalunya, ${dated.length} dels ${n} municipis d'aquesta guia ja han publicat la data del 2026: ${joinNames(items, "ca")}. Per als altres, et donem la del 2025 quan és a la web de l'ajuntament.`,
    es: `En el resto de Cataluña, ${dated.length} de los ${n} municipios de esta guía ya han publicado la fecha de 2026: ${joinNames(items, "es")}. Para los demás, te damos la de 2025 cuando está en la web del ayuntamiento.`,
    en: `Elsewhere in Catalonia, ${dated.length} of the ${n} towns in this guide have already published their 2026 date: ${joinNames(items, "en")}. For the rest, we give the 2025 date where the council's website has it.`,
  }[locale];
}

function keyFactsBlock(locale: Locale, facts: Announcements): Block {
  const a = facts.lightsSwitchOn;
  const pending = { ca: "Per confirmar", es: "Por confirmar", en: "To be confirmed" }[locale];
  const date = a
    ? cap(at(a.date, undefined, locale).replace(/^el /, ""))
    : { ca: `${pending} (2025: ${dayDate(LAST.date, "ca")})`, es: `${pending} (2025: ${dayDate(LAST.date, "es")})`, en: `${pending} (2025: ${dayDate(LAST.date, "en")})` }[locale];
  const time =
    a?.time && a.lightsOn && a.lightsOn !== a.time
      ? { ca: `${a.time} (acte); els llums, a les ${a.lightsOn}`, es: `${a.time} (acto); las luces, a las ${a.lightsOn}`, en: `${a.time} (show); lights on at ${a.lightsOn}` }[locale]
      : a?.time ?? { ca: `${pending} (2023, 2024 i 2025: ${LAST.time})`, es: `${pending} (2023, 2024 y 2025: ${LAST.time})`, en: `${pending} (2023, 2024 and 2025: ${LAST.time})` }[locale];
  const place = a?.place ? cap(a.place[locale]) : { ca: `${pending} (2023, 2024 i 2025: ${PASSEIG.ca})`, es: `${pending} (2023, 2024 y 2025: ${PASSEIG.es})`, en: `${pending} (2023, 2024 and 2025: ${PASSEIG.en})` }[locale];
  const lastWho = LAST.who[locale].replace(/,? (van prémer el polsador|pulsaron el botón|pressed the button)$/, "");
  const who = a?.who?.[locale] ?? `${pending} (2025: ${lastWho.charAt(0).toLowerCase()}${lastWho.slice(1)})`;
  const hours = a?.hours?.[locale] ?? { ca: `2025: ${lightingHours2025("ca")}`, es: `2025: ${lightingHours2025("es")}`, en: `2025: ${lightingHours2025("en")}` }[locale];
  const until = a?.until
    ? cap(dayDate(a.until, locale))
    : { ca: `2025: fins al ${dateYear(PAST.lights2025.until, "ca")}`, es: `2025: hasta el ${dateYear(PAST.lights2025.until, "es")}`, en: `2025: until ${dateYear(PAST.lights2025.until, "en")}` }[locale];
  const streets = a?.km
    ? {
        ca: `Prop de ${a.km} km el 2026 (${PAST.lights2025.km} km el 2025)`,
        es: `Cerca de ${a.km} km en 2026 (${PAST.lights2025.km} km en 2025)`,
        en: `About ${a.km} km in 2026 (${PAST.lights2025.km} km in 2025)`,
      }[locale]
    : {
        ca: `${LIGHTS_PLAN_2026.km} km previstos el 2026 (${PAST.lights2025.km} km el 2025)`,
        es: `${LIGHTS_PLAN_2026.km} km previstos en 2026 (${PAST.lights2025.km} km en 2025)`,
        en: `${LIGHTS_PLAN_2026.km} km planned for 2026 (${PAST.lights2025.km} km in 2025)`,
      }[locale];
  const labels = {
    ca: { title: "Encesa de llums de Barcelona 2026", date: "Dia", time: "Hora", place: "Lloc", who: "Qui els encén", hours: "Horari dels llums", until: "Fins quan", streets: "Carrers il·luminats" },
    es: { title: "Encendido de luces de Barcelona 2026", date: "Día", time: "Hora", place: "Lugar", who: "Quién las enciende", hours: "Horario de las luces", until: "Hasta cuándo", streets: "Calles iluminadas" },
    en: { title: "Barcelona's 2026 Christmas lights switch-on", date: "Day", time: "Time", place: "Place", who: "Who switches them on", hours: "Lighting hours", until: "Until", streets: "Lit streets" },
  }[locale];
  return keyFacts(labels.title, [
    { label: labels.date, value: date },
    { label: labels.time, value: time },
    { label: labels.place, value: place },
    { label: labels.who, value: who },
    { label: labels.streets, value: streets },
    { label: labels.hours, value: hours },
    { label: labels.until, value: until },
  ]);
}

/** The last three switch-ons, one row each, from the City Council's notes. */
function historyTable(locale: Locale): Block {
  const caption = { ca: "Les tres últimes enceses de llums de Barcelona", es: "Los tres últimos encendidos de luces de Barcelona", en: "Barcelona's last three Christmas lights switch-ons" }[locale];
  const headers = {
    ca: ["Any", "Dia i hora", "Lloc", "Qui va encendre els llums"],
    es: ["Año", "Día y hora", "Lugar", "Quién encendió las luces"],
    en: ["Year", "Day and time", "Place", "Who switched them on"],
  }[locale];
  const place = (stretch: boolean) =>
    stretch
      ? { ca: "Passeig de Gràcia, entre la ronda de Sant Pere i la Gran Via", es: "Paseo de Gràcia, entre la ronda de Sant Pere y la Gran Via", en: "Passeig de Gràcia, between Ronda de Sant Pere and Gran Via" }[locale]
      : cap(PASSEIG[locale]);
  const rows = SWITCH_ON_HISTORY.map((s) => [s.date.slice(0, 4), `${cap(dayDate(s.date, locale))}, ${s.time}`, place(s.stretch), s.who[locale]]);
  const checked = dateYear(SWITCH_ON_HISTORY_CHECKED, locale);
  const note = {
    ca: `Hora i lloc, de la convocatòria de l'Ajuntament de la setmana de cada encesa; qui va encendre els llums, de la nota del mateix vespre. El primer anunci, a l'octubre, deia 18:30 el 2023 i el 2025. Comprovat el ${checked}.`,
    es: `Hora y lugar, de la convocatoria del Ayuntamiento de la semana de cada encendido; quién encendió las luces, de la nota de esa misma tarde. El primer anuncio, en octubre, decía 18:30 en 2023 y en 2025. Comprobado el ${checked}.`,
    en: `Time and place from the City Council's press call in the week of each switch-on; who switched them on from its note that evening. The first announcement, in October, said 18:30 in 2023 and 2025. Checked on ${checked}.`,
  }[locale];
  return table(caption, headers, rows, note);
}

function switchOnSection(locale: Locale, facts: Announcements): string[] {
  const a = facts.lightsSwitchOn;
  const p24 = PAST.lights2024;
  const p25 = PAST.lights2025;
  if (a) {
    return [
      {
        ca: `L'encesa és ${at(a.date, a.time, "ca")}${placePhrase(a, "ca") ? `, ${placePhrase(a, "ca")}` : ""}, segons l'[anunci de l'Ajuntament](${a.url}). Les tres anteriors van ser aquestes:`,
        es: `El encendido es ${at(a.date, a.time, "es")}${placePhrase(a, "es") ? `, ${placePhrase(a, "es")}` : ""}, según el [anuncio del Ayuntamiento](${a.url}). Los tres anteriores fueron estos:`,
        en: `The switch-on is on ${at(a.date, a.time, "en")}${placePhrase(a, "en") ? `, ${placePhrase(a, "en")}` : ""}, according to the [City Council's announcement](${a.url}). The three before were these:`,
      }[locale],
    ];
  }
  return [
    {
      ca: `Encara no. L'Ajuntament fixa la data i l'anuncia a la seva sala de premsa: el ${dateYear(p24.announced, "ca")} va anunciar l'encesa del ${dateYear(p24.switchOn, "ca")}, i el ${dateYear(p25.announced, "ca")}, la del ${dateYear(p25.switchOn, "ca")}. A ${dateYear(LIGHTS_SWITCH_ON_CHECKED, "ca")} no ha publicat cap data per a enguany ni a la [sala de premsa](${WATCH.pressTag}) ni al [web de Nadal](${WATCH.christmasSite}), que diu que s'actualitzarà «al voltant del mes de novembre».`,
      es: `Todavía no. El Ayuntamiento fija la fecha y la anuncia en su sala de prensa: el ${dateYear(p24.announced, "es")} anunció el encendido del ${dateYear(p24.switchOn, "es")}, y el ${dateYear(p25.announced, "es")}, el del ${dateYear(p25.switchOn, "es")}. A ${dateYear(LIGHTS_SWITCH_ON_CHECKED, "es")} no ha publicado ninguna fecha para este año ni en la [sala de prensa](${WATCH.pressTag}) ni en la [web de Navidad](${WATCH.christmasSite}), que dice que se actualizará «hacia el mes de noviembre».`,
      en: `Not yet. The City Council sets the date and announces it in its press room: on ${dateYear(p24.announced, "en")} it announced a switch-on on ${dateYear(p24.switchOn, "en")}, and on ${dateYear(p25.announced, "en")} one on ${dateYear(p25.switchOn, "en")}. As of ${dateYear(LIGHTS_SWITCH_ON_CHECKED, "en")} it has published no date for this year, either in its [press room](${WATCH.pressTag}) or on its [Christmas website](${WATCH.christmasSite}), which says it will be updated "around November".`,
    }[locale],
    {
      ca: "Aquestes van ser les tres últimes enceses, totes al passeig de Gràcia a les 18:00:",
      es: "Estos fueron los tres últimos encendidos, todos en el paseo de Gràcia a las 18:00:",
      en: "These were the last three switch-ons, all on Passeig de Gràcia at 18:00:",
    }[locale],
  ];
}

function showParagraphs(locale: Locale): string[] {
  return [
    {
      ca: `El 2025 l'acte va durar uns vint minuts i va acabar amb un compte enrere que va encendre alhora els llums de tots els barris. El passeig de Gràcia es va tancar al trànsit entre la Gran Via i el carrer d'Aragó des de les 17:30, segons l'[avís de mobilitat de l'Ajuntament](${MOBILITY_2025.url}).`,
      es: `En 2025 el acto duró unos veinte minutos y acabó con una cuenta atrás que encendió a la vez las luces de todos los barrios. El paseo de Gràcia se cerró al tráfico entre la Gran Via y la calle Aragó desde las 17:30, según el [aviso de movilidad del Ayuntamiento](${MOBILITY_2025.url}).`,
      en: `In 2025 the ceremony lasted about twenty minutes and ended with a countdown that switched on the lights in every neighbourhood at once. Passeig de Gràcia was closed to traffic between Gran Via and Carrer d'Aragó from 17:30, according to the [City Council's traffic notice](${MOBILITY_2025.url}).`,
    }[locale],
  ];
}

function hoursParagraph(locale: Locale, facts: Announcements): string {
  const a = facts.lightsSwitchOn;
  if (a?.hours) {
    const until = a.until ? { ca: ` fins al ${dateYear(a.until, "ca")}`, es: ` hasta el ${dateYear(a.until, "es")}`, en: ` until ${dateYear(a.until, "en")}` }[locale] : "";
    return {
      ca: `El 2026 els llums estaran encesos${until}, ${a.hours.ca}, segons l'Ajuntament.`,
      es: `En 2026 las luces estarán encendidas${until}, ${a.hours.es}, según el Ayuntamiento.`,
      en: `In 2026 the lights are on${until}, ${a.hours.en}, according to the City Council.`,
    }[locale];
  }
  return {
    ca: `L'horari del 2026 encara no s'ha publicat. El 2025, segons la [nota de l'Ajuntament](${PAST.lights2025.url}), els llums van estar encesos des de l'encesa fins al ${dateYear(PAST.lights2025.until, "ca")}, ${lightingHours2025("ca")}, amb bombetes LED.`,
    es: `El horario de 2026 aún no se ha publicado. En 2025, según la [nota del Ayuntamiento](${PAST.lights2025.url}), las luces estuvieron encendidas desde el encendido hasta el ${dateYear(PAST.lights2025.until, "es")}, ${lightingHours2025("es")}, con bombillas LED.`,
    en: `The 2026 hours have not been published. In 2025, according to the [City Council's note](${PAST.lights2025.url}), the lights were on from the switch-on until ${dateYear(PAST.lights2025.until, "en")}, ${lightingHours2025("en")}, all with LED bulbs.`,
  }[locale];
}

function streetsSection(locale: Locale, facts: Announcements = ANNOUNCED_2026): Block[] {
  const a = facts.lightsSwitchOn;
  // The switch-on note gives the final figure ("prop de 140 km"); the July plan said 130.
  const update = a?.km
    ? {
        ca: ` A la [nota de l'encesa](${a.url}) l'Ajuntament parla de prop de ${a.km} km de carrers il·luminats.`,
        es: ` En la [nota del encendido](${a.url}) el Ayuntamiento habla de cerca de ${a.km} km de calles iluminadas.`,
        en: ` The City Council's [switch-on note](${a.url}) puts it at about ${a.km} km of lit streets.`,
      }[locale]
    : "";
  const plan = `[${{ ca: "pla de llums del 2026", es: "plan de luces de 2026", en: "2026 lighting plan" }[locale]}](${LIGHTS_PLAN_2026.url})`;
  const copy = {
    ca: {
      heading: "Quins carrers s'il·luminen a Barcelona el 2026",
      intro: `Segons el ${plan}, presentat el ${dateYear(LIGHTS_PLAN_2026.presented, "ca")}, enguany hi haurà **${LIGHTS_PLAN_2026.km} quilòmetres de carrers i places amb llums** a tots els districtes, amb els eixos i les associacions de comerciants (${PAST.lights2025.km} km el 2025).${update}`,
      items: [
        "**Llums d'autor:** repeteixen a la Via Laietana, la plaça de Catalunya, el carrer d'Aragó, la Gran Via de les Corts Catalanes i el passeig de Sant Joan, i s'estrenen a la Rambla de Prim (Sant Martí) i el passeig de Maragall.",
        "**Carrers que il·lumina l'Ajuntament:** la ronda de Sant Pere, el carrer de Balmes, la plaça d'Urquinaona, la Rambla i l'avinguda del Paral·lel, que per primer cop tindrà llums en tota la seva llargada.",
        "**Fonts:** més d'una cinquantena de fonts ornamentals de tots els districtes tindran il·luminació de Nadal.",
        "**El Galet**, el llum de Nadal dissenyat per Ramon Bigas, torna a tots els districtes i a la plaça de Sant Miquel.",
      ],
    },
    es: {
      heading: "Qué calles se iluminan en Barcelona en 2026",
      intro: `Según el ${plan}, presentado el ${dateYear(LIGHTS_PLAN_2026.presented, "es")}, este año habrá **${LIGHTS_PLAN_2026.km} kilómetros de calles y plazas con luces** en todos los distritos, con los ejes y las asociaciones de comerciantes (${PAST.lights2025.km} km en 2025).${update}`,
      items: [
        "**Luces de autor:** repiten en la Via Laietana, la plaza de Catalunya, la calle Aragó, la Gran Via de les Corts Catalanes y el paseo de Sant Joan, y se estrenan en la Rambla de Prim (Sant Martí) y el paseo de Maragall.",
        "**Calles que ilumina el Ayuntamiento:** la ronda de Sant Pere, la calle Balmes, la plaza de Urquinaona, la Rambla y la avenida del Paral·lel, que por primera vez tendrá luces en toda su longitud.",
        "**Fuentes:** más de una cincuentena de fuentes ornamentales de todos los distritos tendrán iluminación navideña.",
        "**El Galet**, la luz de Navidad diseñada por Ramon Bigas, vuelve a todos los distritos y a la plaza de Sant Miquel.",
      ],
    },
    en: {
      heading: "Which Barcelona streets are lit in 2026",
      intro: `According to the ${plan}, presented on ${dateYear(LIGHTS_PLAN_2026.presented, "en")}, this year there will be **${LIGHTS_PLAN_2026.km} km of streets and squares with lights** in every district, with the local shopping associations (${PAST.lights2025.km} km in 2025).${update}`,
      items: [
        "**Designer lights:** back on Via Laietana, Plaça de Catalunya, Carrer d'Aragó, Gran Via de les Corts Catalanes and Passeig de Sant Joan, and new on Rambla de Prim (Sant Martí) and Passeig de Maragall.",
        "**Streets lit by the City Council:** Ronda de Sant Pere, Carrer de Balmes, Plaça d'Urquinaona, La Rambla and Avinguda del Paral·lel, lit along its whole length for the first time.",
        "**Fountains:** more than fifty ornamental fountains across every district get Christmas lighting.",
        "**El Galet**, the Christmas light designed by Ramon Bigas, returns to every district and to Plaça de Sant Miquel.",
      ],
    },
  }[locale];
  return [...h2(copy.heading, copy.intro), list(...copy.items)];
}

/* -------------------------------------------------------------------------- */
/* Towns                                                                      */
/* -------------------------------------------------------------------------- */

const COUNCIL: Record<Locale, string> = { ca: "Ajuntament", es: "Ayuntamiento", en: "Council" };

/** "Divendres 27 de novembre de 2026, 18:00, plaça Major" (place names capitalised in English). */
function slotText(slot: TownSwitchOn, locale: Locale): string {
  const place = slot.place && locale === "en" ? cap(slot.place) : slot.place;
  return [cap(dayDate(slot.date, locale)), slot.time, place].filter(Boolean).join(", ");
}

export function townRows(locale: Locale, towns: readonly LightsTown[] = LIGHTS_TOWNS, facts: Announcements = ANNOUNCED_2026): string[][] {
  const pending = { ca: "Per confirmar", es: "Por confirmar", en: "To be confirmed" }[locale];
  const none = { ca: "No la trobem a la web municipal", es: "No la encontramos en la web municipal", en: "Not on the council's website" }[locale];
  const a = facts.lightsSwitchOn;
  const bcn26 = a ? `**${[cap(dayDate(a.date, locale)), a.time, a.place?.[locale]].filter(Boolean).join(", ")}**` : pending;
  const bcnSource = a
    ? `[${COUNCIL[locale]}, 2026](${a.url}) · [2025](${LAST.callUrl})`
    : `[${COUNCIL[locale]}, 2025](${LAST.callUrl})`;
  const barcelona = ["Barcelona", bcn26, `${cap(dayDate(LAST.date, locale))}, ${LAST.time}, ${PASSEIG[locale]}`, bcnSource];
  const rows = [...towns]
    .sort((x, y) => x.name.localeCompare(y.name, "ca"))
    .map((t) => {
      const before = t.y2025 ?? t.y2024 ?? null;
      const beforeYear = t.y2025 ? "2025" : "2024";
      const links = [t.y2026 ? `[${COUNCIL[locale]}, 2026](${t.y2026.url})` : null, before ? `[${t.y2026 ? "" : `${COUNCIL[locale]}, `}${beforeYear}](${before.url})` : null].filter(Boolean);
      // No 2025 page: say so, and give 2024's when a council page has it (always with its year).
      const lastYear = t.y2025 ? slotText(t.y2025, locale) : t.y2024 ? `${none}. 2024: ${slotText(t.y2024, locale)}` : none;
      return [t.name, t.y2026 ? `**${slotText(t.y2026, locale)}**` : pending, lastYear, links.join(" · ") || "—"];
    });
  return [barcelona, ...rows];
}

function townTable(locale: Locale, towns: readonly LightsTown[], facts: Announcements): Block {
  const caption = { ca: "Encesa de llums de Nadal 2026 per municipis", es: "Encendido de luces de Navidad 2026 por municipios", en: "Christmas lights switch-on 2026 by town" }[locale];
  const headers = {
    ca: ["Municipi", "Encesa 2026", "Encesa 2025", "Font"],
    es: ["Municipio", "Encendido 2026", "Encendido 2025", "Fuente"],
    en: ["Town", "2026 switch-on", "2025 switch-on", "Source"],
  }[locale];
  const checked = dateYear(LIGHTS_TOWNS_AS_OF, locale);
  // Councils whose site did not answer on the last re-read keep their own (earlier) check date.
  const unread = LIGHTS_TOWNS_NOT_REREAD.flatMap((u) => {
    const town = towns.find((t) => t.key === u.key);
    return town ? [{ name: town.name, read: u.read }] : [];
  });
  const byDate = [...new Set(unread.map((u) => u.read))].map((read) => ({ read, names: joinNames(unread.filter((u) => u.read === read).map((u) => u.name), locale) }));
  const exceptions = byDate.length
    ? {
        ca: ` ${byDate.map((g) => `${g.names}: comprovat el ${dateYear(g.read, "ca")} (la web no ha respost després)`).join("; ")}.`,
        es: ` ${byDate.map((g) => `${g.names}: comprobado el ${dateYear(g.read, "es")} (la web no ha respondido después)`).join("; ")}.`,
        en: ` ${byDate.map((g) => `${g.names}: checked on ${dateYear(g.read, "en")} (the website has not answered since)`).join("; ")}.`,
      }[locale]
    : "";
  const note = {
    ca: `De la web de cada ajuntament (notícies, sala de premsa o agenda municipal), comprovades el ${checked}.${exceptions} «Per confirmar»: l'ajuntament encara no ha publicat l'encesa del 2026. L'hora és la que dona l'ajuntament per a l'acte d'encesa.`,
    es: `De la web de cada ayuntamiento (noticias, sala de prensa o agenda municipal), comprobadas el ${checked}.${exceptions} «Por confirmar»: el ayuntamiento aún no ha publicado el encendido de 2026. La hora es la que da el ayuntamiento para el acto de encendido.`,
    en: `From each town council's website (news, press room or municipal events listing), checked on ${checked}.${exceptions} "To be confirmed": the council has not published its 2026 switch-on yet. Times are the ones the council gives for the switch-on event.`,
  }[locale];
  return table(caption, headers, townRows(locale, towns, facts), note);
}

/** Day trips from Barcelona to the towns that have one of our guides. */
function tripsSentence(locale: Locale, towns: readonly LightsTown[]): string {
  const guided = towns.filter((t) => t.guide).sort((x, y) => x.name.localeCompare(y.name, "ca"));
  if (!guided.length) return "";
  const links = guided.map((t) => b2link(t.guide as B2Key, locale, t.name));
  return {
    ca: `Si vas a veure els llums d'una altra ciutat des de Barcelona, tenim guies per arribar-hi en transport públic: ${joinNames(links, "ca")}.`,
    es: `Si vas a ver las luces de otra ciudad desde Barcelona, tenemos guías para llegar en transporte público: ${joinNames(links, "es")}.`,
    en: `If you are going from Barcelona to see another town's lights, our guides cover getting there by public transport: ${joinNames(links, "en")}.`,
  }[locale];
}

/* -------------------------------------------------------------------------- */
/* FAQ                                                                        */
/* -------------------------------------------------------------------------- */

const plain = (value: string) => value.replace(/\*\*/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

function faqItems(locale: Locale, facts: Announcements, towns: readonly LightsTown[]): { question: string; answer: string }[] {
  const a = facts.lightsSwitchOn;
  const [y25, y24, y23] = SWITCH_ON_HISTORY;
  const lower = (value: string) => value.charAt(0).toLowerCase() + value.slice(1);
  const dated = announcedTowns(towns);
  const q = {
    ca: {
      when: "Quan és l'encesa de llums de Nadal de Barcelona 2026?",
      time: "A quina hora s'encenen els llums de Nadal a Barcelona?",
      place: "On es fa l'encesa de llums de Barcelona?",
      who: "Qui encén els llums de Nadal de Barcelona?",
      until: "Fins quan estan encesos els llums de Nadal a Barcelona?",
      towns: "Quins municipis ja han anunciat l'encesa de llums 2026?",
      town: (name: string) => `Quan és l'encesa de llums de Nadal de ${name} 2026?`,
    },
    es: {
      when: "¿Cuándo es el encendido de luces de Navidad de Barcelona 2026?",
      time: "¿A qué hora se encienden las luces de Navidad en Barcelona?",
      place: "¿Dónde es el encendido de luces de Barcelona?",
      who: "¿Quién enciende las luces de Navidad de Barcelona?",
      until: "¿Hasta cuándo están encendidas las luces de Navidad en Barcelona?",
      towns: "¿Qué municipios han anunciado ya el encendido de luces 2026?",
      town: (name: string) => `¿Cuándo es el encendido de luces de Navidad de ${name} 2026?`,
    },
    en: {
      when: "When are Barcelona's Christmas lights switched on in 2026?",
      time: "What time is the Barcelona Christmas lights switch-on?",
      place: "Where is the Barcelona Christmas lights switch-on?",
      who: "Who switches on Barcelona's Christmas lights?",
      until: "Until when are Barcelona's Christmas lights on?",
      towns: "Which Catalan towns have announced their 2026 lights switch-on?",
      town: (name: string) => `When is the Christmas lights switch-on in ${name} in 2026?`,
    },
  }[locale];

  const when = a
    ? plain(barcelonaLead(locale, facts))
    : {
        ca: `Encara no s'ha anunciat (${CHECKED.ca}). El 2025 l'Ajuntament va anunciar la data el ${dateYear(PAST.lights2025.announced, "ca")} i va encendre els llums ${at(LAST.date, LAST.time, "ca")} al passeig de Gràcia; el 2024, ${at(y24!.date, undefined, "ca")}, i el 2023, ${at(y23!.date, undefined, "ca")}, també a les 18:00.`,
        es: `Aún no se ha anunciado (${CHECKED.es}). En 2025 el Ayuntamiento anunció la fecha el ${dateYear(PAST.lights2025.announced, "es")} y encendió las luces ${at(LAST.date, LAST.time, "es")} en el paseo de Gràcia; en 2024, ${at(y24!.date, undefined, "es")}, y en 2023, ${at(y23!.date, undefined, "es")}, también a las 18:00.`,
        en: `It has not been announced yet (${CHECKED.en}). In 2025 the City Council announced the date on ${dateYear(PAST.lights2025.announced, "en")} and switched the lights on on ${at(LAST.date, LAST.time, "en")} on Passeig de Gràcia; in 2024 on ${at(y24!.date, undefined, "en")} and in 2023 on ${at(y23!.date, undefined, "en")}, also at 18:00.`,
      }[locale];

  const time = a?.time && a.lightsOn && a.lightsOn !== a.time
    ? {
        ca: `El 2026 l'acte comença a les ${a.time} i els llums s'encenen a les ${a.lightsOn}, segons l'Ajuntament. Els tres últims anys l'acte va començar a les 18:00.`,
        es: `En 2026 el acto empieza a las ${a.time} y las luces se encienden a las ${a.lightsOn}, según el Ayuntamiento. Los tres últimos años el acto empezó a las 18:00.`,
        en: `In 2026 the show starts at ${a.time} and the lights come on at ${a.lightsOn}, according to the City Council. For the last three years the ceremony started at 18:00.`,
      }[locale]
    : a?.time
    ? { ca: `El 2026, a les ${a.time}, segons l'Ajuntament. Els tres últims anys va començar a les 18:00.`, es: `En 2026, a las ${a.time}, según el Ayuntamiento. Los tres últimos años empezó a las 18:00.`, en: `In 2026 at ${a.time}, according to the City Council. For the last three years it started at 18:00.` }[locale]
    : {
        ca: `L'hora del 2026 encara no s'ha anunciat. El 2023, el 2024 i el 2025 l'acte va començar a les 18:00 (el primer anunci del 2023 i el del 2025 deien 18:30). Després de l'encesa, el 2025 els llums es van encendre cada dia a les ${HOURS_2025.on}.`,
        es: `La hora de 2026 aún no se ha anunciado. En 2023, 2024 y 2025 el acto empezó a las 18:00 (el primer anuncio de 2023 y el de 2025 decían 18:30). Después del encendido, en 2025 las luces se encendieron cada día a las ${HOURS_2025.on}.`,
        en: `The 2026 time has not been announced. In 2023, 2024 and 2025 the ceremony started at 18:00 (the first announcements in 2023 and 2025 said 18:30). After the switch-on, in 2025 the lights came on every day at ${HOURS_2025.on}.`,
      }[locale];

  const place = a?.place
    ? { ca: `El 2026, ${placePhrase(a, "ca")}, segons l'Ajuntament. Els tres últims anys va ser al passeig de Gràcia.`, es: `En 2026, ${placePhrase(a, "es")}, según el Ayuntamiento. Los tres últimos años fue en el paseo de Gràcia.`, en: `In 2026 ${placePhrase(a, "en")}, according to the City Council. For the last three years it was on Passeig de Gràcia.` }[locale]
    : {
        ca: "Els tres últims anys, al passeig de Gràcia: el 2024 i el 2025, al tram entre la ronda de Sant Pere i la Gran Via, amb un espectacle que acaba amb l'encesa de tota la ciutat alhora. Per al 2026 l'Ajuntament encara no ho ha confirmat.",
        es: "Los tres últimos años, en el paseo de Gràcia: en 2024 y 2025, en el tramo entre la ronda de Sant Pere y la Gran Via, con un espectáculo que acaba con el encendido de toda la ciudad a la vez. Para 2026 el Ayuntamiento aún no lo ha confirmado.",
        en: "For the last three years, Passeig de Gràcia: in 2024 and 2025 on the stretch between Ronda de Sant Pere and Gran Via, with a show that ends with the whole city's lights coming on at once. The City Council has not confirmed the place for 2026.",
      }[locale];

  const past = {
    ca: `El 2025, ${lower(y25!.who.ca)}; el 2024 els van encendre ${lower(y24!.who.ca)}; i el 2023, ${lower(y23!.who.ca)}.`,
    es: `En 2025, ${lower(y25!.who.es)}; en 2024 las encendieron ${lower(y24!.who.es)}; y en 2023, ${lower(y23!.who.es)}.`,
    en: `In 2025, ${lower(y25!.who.en)}; in 2024 they were switched on by ${lower(y24!.who.en)}; and in 2023, ${lower(y23!.who.en)}.`,
  }[locale];
  const who = a?.who
    ? { ca: `Segons l'Ajuntament, el 2026 l'encesa anirà a càrrec de ${a.who.ca}. ${past}`, es: `Según el Ayuntamiento, en 2026 el encendido correrá a cargo de ${a.who.es}. ${past}`, en: `According to the City Council, in 2026 the lights will be switched on by ${a.who.en}. ${past}` }[locale]
    : { ca: `Per al 2026 no s'ha anunciat. ${past}`, es: `Para 2026 no se ha anunciado. ${past}`, en: `It has not been announced for 2026. ${past}` }[locale];

  const until = plain(hoursParagraph(locale, facts));

  const townsAnswer = dated.length
    ? {
        ca: `A ${dateYear(LIGHTS_TOWNS_AS_OF, "ca")}, ${dated.length} dels ${towns.length} municipis d'aquesta guia ja tenen la data del 2026: ${joinNames(dated.map((t) => `${t.name} (${shortDate(t.y2026!.date, "ca")})`), "ca")}. Els altres encara no l'han publicada a la seva web.`,
        es: `A ${dateYear(LIGHTS_TOWNS_AS_OF, "es")}, ${dated.length} de los ${towns.length} municipios de esta guía ya tienen la fecha de 2026: ${joinNames(dated.map((t) => `${t.name} (${shortDate(t.y2026!.date, "es")})`), "es")}. Los demás aún no lo han publicado en su web.`,
        en: `As of ${dateYear(LIGHTS_TOWNS_AS_OF, "en")}, ${dated.length} of the ${towns.length} towns in this guide have published a date for 2026: ${joinNames(dated.map((t) => `${t.name} (${shortDate(t.y2026!.date, "en")})`), "en")}. The others have not published it on their websites yet.`,
      }[locale]
    : {
        ca: `A ${dateYear(LIGHTS_TOWNS_AS_OF, "ca")}, cap dels ${towns.length} municipis d'aquesta guia no l'ha publicada a la seva web.`,
        es: `A ${dateYear(LIGHTS_TOWNS_AS_OF, "es")}, ninguno de los ${towns.length} municipios de esta guía lo ha publicado en su web.`,
        en: `As of ${dateYear(LIGHTS_TOWNS_AS_OF, "en")}, none of the ${towns.length} towns in this guide has published it on its website.`,
      }[locale];

  /** "divendres 28 de novembre de 2025 a les 18:00 (plaça de Catalunya)": the place in brackets, so no article is guessed. */
  const slotPhrase = (s: TownSwitchOn): string => {
    const time = s.time ? { ca: ` a les ${s.time}`, es: ` a las ${s.time}`, en: ` at ${s.time}` }[locale] : "";
    const place = s.place ? ` (${locale === "en" ? cap(s.place) : s.place})` : "";
    return `${dayDate(s.date, locale)}${time}${place}`;
  };
  const townAnswer = (t: LightsTown): string => {
    if (t.y2026) {
      const s = slotPhrase(t.y2026);
      return {
        ca: `L'Ajuntament de ${t.name} l'ha anunciada per al ${s}.`,
        es: `El Ayuntamiento de ${t.name} lo ha anunciado para el ${s}.`,
        en: `${t.name} council has announced it for ${s}.`,
      }[locale];
    }
    const before = t.y2025 ?? t.y2024;
    const last = before
      ? { ca: ` L'any anterior va ser el ${slotPhrase(before)}.`, es: ` El año anterior fue el ${slotPhrase(before)}.`, en: ` The year before, it was on ${slotPhrase(before)}.` }[locale]
      : "";
    return {
      ca: `L'Ajuntament de ${t.name} encara no l'ha publicada (comprovat el ${dateYear(LIGHTS_TOWNS_AS_OF, "ca")}).${last}`,
      es: `El Ayuntamiento de ${t.name} aún no lo ha publicado (comprobado el ${dateYear(LIGHTS_TOWNS_AS_OF, "es")}).${last}`,
      en: `${t.name} council has not published it yet (checked on ${dateYear(LIGHTS_TOWNS_AS_OF, "en")}).${last}`,
    }[locale];
  };
  const capitals = ["girona", "tarragona", "lleida"].map((key) => towns.find((t) => t.key === key)).filter((t): t is LightsTown => Boolean(t));

  return [
    { question: q.when, answer: when },
    { question: q.time, answer: time },
    { question: q.place, answer: place },
    { question: q.who, answer: who },
    { question: q.until, answer: until },
    { question: q.towns, answer: townsAnswer },
    ...capitals.map((t) => ({ question: q.town(t.name), answer: townAnswer(t) })),
  ];
}

/* -------------------------------------------------------------------------- */
/* Body                                                                       */
/* -------------------------------------------------------------------------- */

const RELATED: B2Key[] = ["christmasBarcelona", "christmas", "pessebres", "barcelonaDecember", "reis", "christmasTraditions"];

function afterSection(locale: Locale): Block[] {
  const sl = range(SANTA_LLUCIA_2026.from, SANTA_LLUCIA_2026.to, locale);
  const slHours = SANTA_LLUCIA_2026.hours ? hoursText(SANTA_LLUCIA_2026.hours, locale) : "";
  const copy = {
    ca: {
      heading: "Després de l'encesa: mercats de Nadal, Santa Llúcia i pessebres",
      texts: [
        `La Fira de Santa Llúcia, davant de la Catedral, és ${sl}, ${slHours}, segons l'[Agenda Cultural de la Generalitat](${SANTA_LLUCIA_2026.url}). Aquesta i la resta de fires de Barcelona i de Catalunya són a ${b2link("christmas", "ca", "la guia de mercats de Nadal")}, i totes les fires amb data oficial, poble a poble, a [fires de Nadal per municipi](${fairsHubPath("ca")}).`,
        `El pessebre de la plaça de Sant Jaume, què obre els festius i el metro per Nadal són a ${b2link("christmasBarcelona", "ca", "Nadal a Barcelona")}; els pessebres vivents de Catalunya, amb dates i horaris, són al ${b2link("pessebres", "ca", "calendari de pessebres vivents")}.`,
        `Tot el que passa a la ciutat al desembre, dia a dia, és a ${b2link("barcelonaDecember", "ca", "què fer a Barcelona al desembre")}, i la Cavalcada del 5 de gener, a ${b2link("reis", "ca", "la Cavalcada de Reis 2027")}.`,
      ],
    },
    es: {
      heading: "Después del encendido: mercados de Navidad, Santa Llúcia y belenes",
      texts: [
        `La Feria de Santa Llúcia, delante de la Catedral, es ${sl}, ${slHours}, según la [Agenda Cultural de la Generalitat](${SANTA_LLUCIA_2026.url}). Esta y el resto de ferias de Barcelona y de Cataluña están en ${b2link("christmas", "es", "la guía de mercados de Navidad")}, y todas las ferias con fecha oficial, pueblo a pueblo, en [ferias de Navidad por municipio](${fairsHubPath("es")}).`,
        `El belén de la plaza de Sant Jaume, qué abre los festivos y el metro en Navidad están en ${b2link("christmasBarcelona", "es", "Navidad en Barcelona")}; los belenes vivientes de Cataluña, con fechas y horarios, en ${b2link("pessebres", "es", "el calendario de belenes vivientes")}.`,
        `Todo lo que pasa en la ciudad en diciembre, día a día, está en ${b2link("barcelonaDecember", "es", "qué hacer en Barcelona en diciembre")}, y la Cabalgata del 5 de enero, en ${b2link("reis", "es", "la Cabalgata de Reyes 2027")}.`,
      ],
    },
    en: {
      heading: "After the switch-on: Christmas markets, Santa Llúcia and nativity scenes",
      texts: [
        `The Fira de Santa Llúcia, in front of the Cathedral, runs from ${sl}, ${slHours}, according to the [Catalan government's cultural agenda](${SANTA_LLUCIA_2026.url}). This and the other markets in Barcelona and Catalonia are in ${b2link("christmas", "en", "our Christmas markets guide")}, and every market with an official date, town by town, in [Christmas markets by town](${fairsHubPath("en")}).`,
        `The Plaça de Sant Jaume nativity scene, what is open on the holidays and the metro at Christmas are in ${b2link("christmasBarcelona", "en", "Christmas in Barcelona")}; Catalonia's living nativity scenes, with dates and times, in ${b2link("pessebres", "en", "our living nativity calendar")}.`,
        `Everything on in the city in December, day by day, is in ${b2link("barcelonaDecember", "en", "Barcelona in December")}, and the parade on 5 January in ${b2link("reis", "en", "our 2027 Three Kings parade guide")}.`,
      ],
    },
  }[locale];
  return h2(copy.heading, ...copy.texts);
}

export function buildChristmasLightsBody(locale: Locale, facts: Announcements = ANNOUNCED_2026, towns: readonly LightsTown[] = LIGHTS_TOWNS): Block[] {
  const t = {
    ca: {
      method: ["Com tractem les dates", `Només hi posem una data del 2026 quan l'ajuntament l'ha publicada a la seva web o a la seva sala de premsa. Si encara no hi és, hi diem «per confirmar» i hi donem la del 2025, sempre amb l'any al costat. Revisem les webs municipals i hi afegim cada data el dia que és oficial; última revisió: ${dateYear(CHRISTMAS_LIGHTS_AS_OF, "ca")}.`],
      bcnHeading: "Encesa de llums de Barcelona 2026: dia, hora i lloc",
      hoursHeading: "Horari dels llums de Nadal a Barcelona i fins quan",
      townsHeading: "Encesa de llums de Nadal 2026 a Catalunya, municipi per municipi",
      townsIntro: "La data de cada ciutat, de la web del seu ajuntament. Els actes solen ser a la plaça principal, sovint amb música, i alguns ajuntaments els anuncien només una o dues setmanes abans.",
    },
    es: {
      method: ["Cómo tratamos las fechas", `Solo ponemos una fecha de 2026 cuando el ayuntamiento la ha publicado en su web o en su sala de prensa. Si aún no está, decimos «por confirmar» y damos la de 2025, siempre con el año al lado. Revisamos las webs municipales y añadimos cada fecha el día que es oficial; última revisión: ${dateYear(CHRISTMAS_LIGHTS_AS_OF, "es")}.`],
      bcnHeading: "Encendido de luces de Barcelona 2026: día, hora y lugar",
      hoursHeading: "Horario de las luces de Navidad en Barcelona y hasta cuándo",
      townsHeading: "Encendido de luces de Navidad 2026 en Cataluña, municipio por municipio",
      townsIntro: "La fecha de cada ciudad, de la web de su ayuntamiento. Los actos suelen ser en la plaza principal, a menudo con música, y algunos ayuntamientos los anuncian solo una o dos semanas antes.",
    },
    en: {
      method: ["How we handle dates", `We only print a 2026 date once the town council has published it on its website or in its press room. Until then we say "to be confirmed" and give the 2025 date, always with its year. We re-read the councils' websites and add each date the day it is official; last checked on ${dateYear(CHRISTMAS_LIGHTS_AS_OF, "en")}.`],
      bcnHeading: "Barcelona's 2026 lights switch-on: day, time and place",
      hoursHeading: "Barcelona's Christmas lighting hours, and until when",
      townsHeading: "Christmas lights switch-on 2026 across Catalonia, town by town",
      townsIntro: "Each town's date, from its council's website. The ceremonies are usually held in the main square, often with music, and some councils announce them only a week or two ahead.",
    },
  }[locale];
  const trips = tripsSentence(locale, towns);
  return [
    lead(`${barcelonaLead(locale, facts)} ${townsLead(locale, towns)}`),
    keyFactsBlock(locale, facts),
    languageLinks(),
    callout("info", t.method[0]!, t.method[1]!),
    ...h2(t.bcnHeading, ...switchOnSection(locale, facts)),
    historyTable(locale),
    ...paras(...showParagraphs(locale)),
    ...streetsSection(locale, facts),
    ...h2(t.hoursHeading, hoursParagraph(locale, facts)),
    ...h2(t.townsHeading, t.townsIntro),
    townTable(locale, towns, facts),
    ...(trips ? paras(trips) : []),
    ...afterSection(locale),
    faq(faqItems(locale, facts, towns)),
    ...paras(verifiedLine(locale, CHRISTMAS_LIGHTS_AS_OF)),
    ...b2Related(RELATED, locale),
  ];
}

/* -------------------------------------------------------------------------- */
/* Sources and article                                                        */
/* -------------------------------------------------------------------------- */

export function lightsSources(facts: Announcements = ANNOUNCED_2026, towns: readonly LightsTown[] = LIGHTS_TOWNS): B2Source[] {
  const list: B2Source[] = [];
  const add = (name: string, url: string, publisher: string) => {
    if (!list.some((s) => s.url === url)) list.push({ name, url, publisher });
  };
  const a: Announcement | null = facts.lightsSwitchOn;
  if (a) add("Encesa de llums de Nadal 2026", a.url, "Ajuntament de Barcelona");
  add("Barcelona consolida el festival de Llums de Nadal (pla del 2026)", LIGHTS_PLAN_2026.url, "Ajuntament de Barcelona");
  add("Servei de Premsa: Nadal 2026", WATCH.pressTag, "Ajuntament de Barcelona");
  add("Nadal a Barcelona", WATCH.christmasSite, "Ajuntament de Barcelona");
  add("Barcelona encendrà els llums de Nadal el dissabte 22 de novembre (2025)", PAST.lights2025.url, "Ajuntament de Barcelona");
  for (const s of SWITCH_ON_HISTORY) {
    const year = s.date.slice(0, 4);
    add(`Encesa de llums de Nadal ${year}: convocatòria`, s.callUrl, "Ajuntament de Barcelona");
    add(`Encesa de llums de Nadal ${year}: crònica`, s.reportUrl, "Ajuntament de Barcelona");
  }
  add("Afectacions de la mobilitat per l'encesa de llums de Nadal 2025", MOBILITY_2025.url, "Ajuntament de Barcelona");
  add("Barcelona prepara un Nadal amb més llums (2024)", PAST.lights2024.url, "Ajuntament de Barcelona");
  add("Fira de Santa Llúcia 2026", SANTA_LLUCIA_2026.url, "Generalitat de Catalunya");
  for (const t of [...towns].sort((x, y) => x.name.localeCompare(y.name, "ca"))) {
    for (const [year, slot] of [["2026", t.y2026], ["2025", t.y2025], ["2024", t.y2024 ?? null]] as const) {
      if (!slot) continue;
      add(`Encesa de llums de Nadal ${year} a ${t.name}`, slot.url, `Ajuntament de ${t.name}`);
      if (slot.alsoUrl) add(`Encesa de llums de Nadal ${year} a ${t.name} (lloc)`, slot.alsoUrl, `Ajuntament de ${t.name}`);
    }
  }
  return list;
}

export const CHRISTMAS_LIGHTS: B2Article = {
  key: "christmasLights",
  entryKey: "guide-christmas-lights-switch-on",
  categoryKey: "festivals",
  sources: lightsSources(),
  // Reused from the manifest, not a new photograph (see the header comment).
  heroKey: SHOPS.heroKey,
  heroAlt: SHOPS.heroAlt,
  heroCaption: SHOPS.heroCaption,
  verifiedAt: CHRISTMAS_LIGHTS_AS_OF,
  publishedAt: "2026-11-04T12:00:00+01:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [
      locale,
      {
        ...CHRISTMAS_LIGHTS_META[locale],
        seoTitle: lightsTitle(locale),
        seoDescription: lightsDescription(locale),
        blocks: buildChristmasLightsBody(locale),
      },
    ]),
  ) as B2Article["editions"],
};
