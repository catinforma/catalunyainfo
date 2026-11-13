import type { Block } from "@/lib/content/blocks";
import type { Locale } from "@/lib/i18n/config";
import type { Region } from "@/lib/programmatic/holidays/boe-2027";
import { leaveLinkFor, leavePath } from "@/lib/programmatic/leave-2027/copy";
import { cityBySlug, type City } from "@/lib/programmatic/spain-2027/cities";
import { names } from "@/lib/programmatic/spain-2027/communities";
import { cityEditions, hubEditions } from "@/lib/programmatic/spain-2027/editions";
import { localizeRegion } from "@/lib/content/school-spain/i18n";
import { HUB_PATHS, regionBySlug, regionPath } from "@/lib/content/school-spain/regions";

import { B2_TITLES, b2href } from "./shared";
import type { Strike11nCityKey } from "./strike-11n-city-paths";

/**
 * 13 Nov 2026: "Y ahora en <ciudad>" / "I ara a <ciutat>" / "Next for <city>",
 * on the 11N pages for the rest of Spain (the 13 city pages and the Spain
 * page), once the strike is past.
 *
 * Why (GSC 7–13 Nov 2026): the city pages still draw tens of thousands of
 * impressions a week (Sevilla 71.6k, Zaragoza 41k, Alicante 36k, Murcia
 * 28.6k…), from readers who live in those cities, but their only onward links
 * were the strike itself and the Catalan strikes hub. This block hands them
 * to evergreen pages of ours for their own community and city: the school
 * calendar, the 2027 holidays, the leave planner with the city picked, the
 * December bridge and shops in December for Spain, and the Spain strikes hub.
 *
 * Links only, no fact of its own: every anchor repeats what the target page
 * says in its own title. Every target is a path the site builds
 * (tests/strike-11n-cities.test.ts resolves each one). Logged in
 * docs/SEO_EXPERIMENTS.md (13 Nov 2026), review 27 Nov.
 */

/** Each 11N city's page in the 2027 calendar (spain-2027/cities-data.ts): its community and slug there. */
export const STRIKE_11N_CITY_PLACES: Record<Strike11nCityKey, { region: Region; slug: string }> = {
  madrid: { region: "MD", slug: "madrid" },
  valencia: { region: "VC", slug: "valencia" },
  sevilla: { region: "AN", slug: "sevilla" },
  zaragoza: { region: "AR", slug: "zaragoza" },
  malaga: { region: "AN", slug: "malaga" },
  palma: { region: "IB", slug: "palma" },
  lasPalmas: { region: "CN", slug: "las-palmas-de-gran-canaria" },
  bilbao: { region: "PV", slug: "bilbao" },
  murcia: { region: "MC", slug: "murcia" },
  alicante: { region: "VC", slug: "alicante" },
  valladolid: { region: "CL", slug: "valladolid" },
  vigo: { region: "GA", slug: "vigo" },
  coruna: { region: "GA", slug: "a-coruna" },
};

/** The section's anchor, per language (no other section of these pages uses it). */
export const AFTER_STRIKE_ID: Record<Locale, string> = { ca: "i-ara", es: "y-ahora", en: "next" };

/** The leave the planner opens with on these links: the planner's own default, written out so a shared link keeps it. */
export const AFTER_STRIKE_LEAVE_DAYS = 5;

function place(key: Strike11nCityKey): City {
  const { region, slug } = STRIKE_11N_CITY_PLACES[key];
  const city = cityBySlug(region, slug);
  if (!city) throw new Error(`11N next block: no 2027 city page for ${key} (${region}/${slug})`);
  return city;
}

function schoolHref(region: Region, locale: Locale): string {
  const slug = names(region).slug;
  if (!regionBySlug(slug)) throw new Error(`11N next block: no school calendar page for ${region}`);
  return `/${locale}/${regionPath(slug, locale)}/`;
}

/** "en Andalucía" / "a Andalusia" / "in Andalusia", as the school calendar pages write it. */
function schoolIn(region: Region, locale: Locale): string {
  return localizeRegion(regionBySlug(names(region).slug)!, locale).inName;
}

const link = (href: string, label: string) => `[${label}](${href})`;

/** The December pages and the strikes hub, shared by the city pages and the Spain page. */
function spainLinks(locale: Locale): string[] {
  return [
    link(
      b2href("decemberBridgeSpain", locale),
      {
        es: "Puente de diciembre 2026: dónde es festivo el lunes 7, comunidad por comunidad",
        ca: "Pont de desembre 2026: on és festiu el dilluns 7, comunitat per comunitat",
        en: "December 2026 long weekend: where Monday 7 December is a holiday, region by region",
      }[locale],
    ),
    link(
      b2href("shopsSpainDecember", locale),
      {
        es: "Tiendas abiertas el 6, 7 y 8 de diciembre y en Navidad, por comunidad",
        ca: "Botigues obertes el 6, 7 i 8 de desembre i per Nadal, per comunitat",
        en: "Shops open on 6, 7 and 8 December and at Christmas in Spain, by region",
      }[locale],
    ),
    link(b2href("strikesSpain", locale), B2_TITLES.strikesSpain[locale]),
  ];
}

/** The six links for one city, in the page's language; `name` is the city as the page writes it. */
export function cityNextLinks(key: Strike11nCityKey, name: string, locale: Locale): string[] {
  const city = place(key);
  const region = city.region;
  const school = schoolIn(region, locale);
  return [
    link(
      schoolHref(region, locale),
      {
        es: `Calendario escolar 2026-2027 ${school}: vacaciones de Navidad y Semana Santa`,
        ca: `Calendari escolar 2026-2027 ${school}: vacances de Nadal i Setmana Santa`,
        en: `School calendar 2026-2027 ${school}: Christmas and Easter holidays`,
      }[locale],
    ),
    link(
      cityEditions(city)[locale],
      { es: `Festivos 2027 en ${name}: calendario laboral`, ca: `Festius 2027 a ${name}: calendari laboral`, en: `Public holidays 2027 in ${name}: work calendar` }[locale],
    ),
    link(
      `${leaveLinkFor(locale, `${city.community.slug}/${city.slug}`)}&d=${AFTER_STRIKE_LEAVE_DAYS}`,
      {
        es: `Cómo aprovechar las vacaciones de 2027 en ${name}: qué días pedir`,
        ca: `Com aprofitar les vacances del 2027 a ${name}: quins dies demanar`,
        en: `Make the most of your 2027 leave in ${name}: which days to book`,
      }[locale],
    ),
    ...spainLinks(locale),
  ];
}

/** The six links of the Spain page: the Spain-wide editions of the same targets. */
export function spainNextLinks(locale: Locale): string[] {
  return [
    link(
      `/${locale}/${HUB_PATHS[locale]}/`,
      {
        es: "Vacaciones de Navidad 2026-27 por comunidades: calendario escolar",
        ca: "Vacances de Nadal 2026-27 per comunitats: calendari escolar",
        en: "Christmas school holidays 2026-27 by region: school calendar",
      }[locale],
    ),
    link(
      hubEditions()[locale],
      {
        es: "Festivos 2027 en España: calendario laboral por comunidad y ciudad",
        ca: "Festius 2027 a Espanya: calendari laboral per comunitat i ciutat",
        en: "Public holidays 2027 in Spain: work calendar by region and city",
      }[locale],
    ),
    link(
      leavePath(locale),
      {
        es: "Cómo aprovechar los festivos y las vacaciones en 2027",
        ca: "Com aprofitar les vacances el 2027",
        en: "How to make the most of your leave in 2027",
      }[locale],
    ),
    ...spainLinks(locale),
  ];
}

function heading(text: string, locale: Locale): Block {
  return { type: "heading", level: 2, text, id: AFTER_STRIKE_ID[locale] } as Block;
}

function list(items: string[]): Block {
  return { type: "list", ordered: false, items } as Block;
}

/** "Y ahora en Sevilla: colegio, festivos y diciembre", then its six links. */
export function cityNextBlocks(key: Strike11nCityKey, name: string, locale: Locale): Block[] {
  const title = {
    es: `Y ahora en ${name}: colegio, festivos y diciembre`,
    ca: `I ara a ${name}: escola, festius i desembre`,
    en: `Next for ${name}: school, holidays and December`,
  }[locale];
  return [heading(title, locale), list(cityNextLinks(key, name, locale))];
}

/** The Spain page's version. */
export function spainNextBlocks(locale: Locale): Block[] {
  const title = {
    es: "Y ahora: colegio, festivos y diciembre en España",
    ca: "I ara: escola, festius i desembre a Espanya",
    en: "Next: school, holidays and December in Spain",
  }[locale];
  return [heading(title, locale), list(spainNextLinks(locale))];
}
