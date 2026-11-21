/**
 * Words of the Spain pages of the fuel family (21 Nov 2026), in Spanish,
 * Catalan and English. Pure. Every figure in a sentence comes from a
 * `SpainSummary` (spain.ts) built from the Ministry's list the route read:
 * the cheapest station's price, a median, a station count, the Ministry's own
 * time. Without a current list the text names no price at all.
 *
 * The questions are worded as people search them ("precio gasolina hoy
 * <provincia>", "gasolinera más barata <provincia>", "preu gasolina avui",
 * "fuel prices <place>"); each answer starts with the figure.
 */

import { DESCRIPTION_LIMIT, TITLE_LIMIT, longDate } from "./copy";
import { splitFecha } from "./live";
import type { FuelHubLocale } from "./paths";
import { SPAIN_SNAPSHOT, centsVsNational, extremes, type ProvinceStats, type SpainProvince, type SpainSummary } from "./spain";
import type { SpainFuel, SpainStation } from "./spain-upstream";

const first = (options: string[], limit: number): string => options.find((o) => o.length <= limit) ?? options[options.length - 1]!;

const INTL: Record<FuelHubLocale, string> = { es: "es-ES", ca: "ca-ES", en: "en-GB" };
const PRICE = Object.fromEntries(
  (Object.keys(INTL) as FuelHubLocale[]).map((l) => [l, new Intl.NumberFormat(INTL[l], { minimumFractionDigits: 3, maximumFractionDigits: 3 })]),
) as Record<FuelHubLocale, Intl.NumberFormat>;
const CENTS = Object.fromEntries(
  (Object.keys(INTL) as FuelHubLocale[]).map((l) => [l, new Intl.NumberFormat(INTL[l], { minimumFractionDigits: 1, maximumFractionDigits: 1 })]),
) as Record<FuelHubLocale, Intl.NumberFormat>;
const COUNT = Object.fromEntries((Object.keys(INTL) as FuelHubLocale[]).map((l) => [l, new Intl.NumberFormat(INTL[l])])) as Record<FuelHubLocale, Intl.NumberFormat>;

/** "1,599" (es, ca) / "1.599" (en): the Ministry's three decimals. */
export function priceText(value: number, locale: FuelHubLocale): string {
  return PRICE[locale].format(value);
}

/** "11.541" / "11.541" / "11,541". */
export function countText(value: number, locale: FuelHubLocale): string {
  return COUNT[locale].format(value);
}

/** A municipality as a heading or cell shows it: Spanish and English capitalise the article-first names. */
export function townText(name: string, locale: FuelHubLocale): string {
  return locale === "ca" ? name : name.charAt(0).toUpperCase() + name.slice(1);
}

/* -------------------------------------------------------------------------- */
/* Province names in a sentence                                               */
/* -------------------------------------------------------------------------- */

const CA_VOWEL = /^[aeiouàáèéíïòóúüh]/i;
/** Galician and Spanish articles that start an official name: no elision before them. */
const ARTICLE_START = /^(a|la|las|los|el) /i;

/** Catalan "de" before a province name: "d'Albacete", "d'Huelva", "de Madrid", "de les Illes Balears". */
function caDeName(name: string): string {
  if (name === "Illes Balears") return "de les Illes Balears";
  return CA_VOWEL.test(name) && !ARTICLE_START.test(name) ? `d'${name}` : `de ${name}`;
}

function caAName(name: string): string {
  return name === "Illes Balears" ? "a les Illes Balears" : `a ${name}`;
}

/** "en la provincia de Madrid" / "en Ceuta"; "a la província d'Albacete"; "in the province of Madrid". */
export function inProvince(p: SpainProvince, locale: FuelHubLocale): string {
  if (p.autonomousCity) return { es: `en ${p.name}`, ca: `a ${p.name}`, en: `in ${p.name}` }[locale];
  return { es: `en la provincia de ${p.name}`, ca: `a la província ${caDeName(p.name)}`, en: `in the province of ${p.name}` }[locale];
}

/** "de la provincia de Madrid" / "de Ceuta"; "de la província d'Albacete"; "in the province of Madrid". */
export function ofProvince(p: SpainProvince, locale: FuelHubLocale): string {
  if (p.autonomousCity) return { es: `de ${p.name}`, ca: caDeName(p.name), en: `in ${p.name}` }[locale];
  return { es: `de la provincia de ${p.name}`, ca: `de la província ${caDeName(p.name)}`, en: `in the province of ${p.name}` }[locale];
}

/** "Provincia de Madrid" / "Ceuta" (headings and crumbs). */
export function provinceLabel(p: SpainProvince, locale: FuelHubLocale): string {
  if (p.autonomousCity) return p.name;
  return { es: `Provincia de ${p.name}`, ca: `Província ${caDeName(p.name)}`, en: `Province of ${p.name}` }[locale];
}

/** "la provincia de Madrid" / "Ceuta", inside a sentence about Spain. */
function placeInSentence(p: SpainProvince, locale: FuelHubLocale): string {
  if (p.autonomousCity) return p.name;
  return { es: `la provincia de ${p.name}`, ca: `la província ${caDeName(p.name)}`, en: `the province of ${p.name}` }[locale];
}

/* -------------------------------------------------------------------------- */
/* Titles, descriptions, H1, crumbs                                           */
/* -------------------------------------------------------------------------- */

export function spainProvinceTitle(p: SpainProvince, locale: FuelHubLocale): string {
  const n = p.name;
  if (locale === "en") return first([`Fuel prices today in ${n}: cheapest petrol and diesel`, `Fuel prices today in ${n}: petrol and diesel`, `Fuel prices today in ${n}`], TITLE_LIMIT);
  if (locale === "ca") return first([`Preu gasolina i dièsel avui ${caAName(n)}: les més barates`, `Preu gasolina i dièsel avui ${caAName(n)}`, `Preu gasolina avui ${caAName(n)}`], TITLE_LIMIT);
  return first([`Precio gasolina y diésel hoy en ${n}: las más baratas`, `Precio gasolina y diésel hoy en ${n}`, `Precio gasolina hoy en ${n}`], TITLE_LIMIT);
}

export function spainProvinceH1(p: SpainProvince, locale: FuelHubLocale): string {
  const where = inProvince(p, locale);
  return { es: `Precio de la gasolina y el diésel hoy ${where}`, ca: `Preu de la gasolina i el dièsel avui ${where}`, en: `Petrol and diesel prices today ${where}` }[locale];
}

/** "21/11" from the Ministry's "21/11/2026". */
function dayMonth(date: string): string {
  return date.split("/").slice(0, 2).join("/");
}

interface Both {
  e95: NonNullable<ProvinceStats["fuels"]["e95"]>;
  goa: NonNullable<ProvinceStats["fuels"]["goa"]>;
}

function bothFuels(stats: ProvinceStats | undefined): Both | null {
  const e95 = stats?.fuels.e95;
  const goa = stats?.fuels.goa;
  return e95 && goa ? { e95, goa } : null;
}

/**
 * The search description. With a current list it leads with today's cheapest
 * 95 and diesel and the Ministry's day and time (the page regenerates every
 * half hour, so the HTML and its description always agree); without one, the
 * station count of the snapshot.
 */
export function spainProvinceDescription(p: SpainProvince, locale: FuelHubLocale, summary: SpainSummary | null): string {
  const both = summary ? bothFuels(summary.provinces[p.code]) : null;
  if (summary && both) {
    const { date, time } = splitFecha(summary.fecha);
    const a = priceText(both.e95.min, locale);
    const b = priceText(both.goa.min, locale);
    const when = `${dayMonth(date)}, ${time}`;
    const n = p.name;
    if (locale === "en") {
      return first(
        [
          `Petrol 95 from ${a} €/l and diesel from ${b} €/l today in ${n} (${when}): the 10 cheapest stations, their opening hours and prices by town.`,
          `Petrol 95 from ${a} €/l and diesel from ${b} €/l today in ${n} (${when}): the 10 cheapest stations and prices by town.`,
          `Petrol 95 from ${a} €/l and diesel from ${b} €/l today in ${n} (${when}), from the Ministry's data.`,
        ],
        DESCRIPTION_LIMIT,
      );
    }
    if (locale === "ca") {
      return first(
        [
          `Gasolina 95 des de ${a} €/l i dièsel des de ${b} €/l avui ${caAName(n)} (${when}): les 10 benzineres més barates, el seu horari i el preu per municipi.`,
          `Gasolina 95 des de ${a} €/l i dièsel des de ${b} €/l avui ${caAName(n)} (${when}): les 10 benzineres més barates i el preu per municipi.`,
          `Gasolina 95 des de ${a} €/l i dièsel des de ${b} €/l avui ${caAName(n)} (${when}), segons el Ministeri.`,
        ],
        DESCRIPTION_LIMIT,
      );
    }
    return first(
      [
        `Gasolina 95 desde ${a} €/l y diésel desde ${b} €/l hoy en ${n} (${when}): las 10 gasolineras más baratas, su horario y el precio por municipio.`,
        `Gasolina 95 desde ${a} €/l y diésel desde ${b} €/l hoy en ${n} (${when}): las 10 gasolineras más baratas y el precio por municipio.`,
        `Gasolina 95 desde ${a} €/l y diésel desde ${b} €/l hoy en ${n} (${when}), según el Ministerio.`,
      ],
      DESCRIPTION_LIMIT,
    );
  }
  const of = ofProvince(p, locale);
  const N = countText(p.stations, locale);
  if (locale === "en") {
    return first(
      [
        `The cheapest petrol stations ${of} today: petrol 95 and diesel at its ${N} stations, with the Ministry's official price, opening hours and prices by town.`,
        `The cheapest petrol stations ${of} today: petrol 95 and diesel, with the Ministry's official price and prices by town.`,
        `The cheapest petrol stations ${of} today: petrol 95 and diesel, with the Ministry's official price.`,
      ],
      DESCRIPTION_LIMIT,
    );
  }
  if (locale === "ca") {
    return first(
      [
        `Les benzineres més barates ${of} avui: gasolina 95 i dièsel a les seves ${N} estacions, amb el preu oficial del Ministeri, l'horari i el preu per municipi.`,
        `Les benzineres més barates ${of} avui: gasolina 95 i dièsel, amb el preu oficial del Ministeri i el preu per municipi.`,
        `Les benzineres més barates ${of} avui: gasolina 95 i dièsel, amb el preu oficial del Ministeri.`,
      ],
      DESCRIPTION_LIMIT,
    );
  }
  return first(
    [
      `Las gasolineras más baratas ${of} hoy: gasolina 95 y diésel en sus ${N} estaciones, con el precio oficial del Ministerio, su horario y el precio por municipio.`,
      `Las gasolineras más baratas ${of} hoy: gasolina 95 y diésel, con el precio oficial del Ministerio y el precio por municipio.`,
      `Las gasolineras más baratas ${of} hoy: gasolina 95 y diésel, con el precio oficial del Ministerio.`,
    ],
    DESCRIPTION_LIMIT,
  );
}

/** First paragraph: the answer with its time when there is a current list, else what the page holds. */
export function spainProvinceLead(p: SpainProvince, locale: FuelHubLocale, summary: SpainSummary | null): string {
  const where = inProvince(p, locale);
  const both = summary ? bothFuels(summary.provinces[p.code]) : null;
  const nat95 = summary?.national.fuels.e95;
  const natGoa = summary?.national.fuels.goa;
  if (summary && both && nat95 && natGoa) {
    const { date, time } = splitFecha(summary.fecha);
    const f = (v: number) => priceText(v, locale);
    if (locale === "en") {
      return `Cheapest petrol 95 today ${where}: ${f(both.e95.min)} €/l; diesel, ${f(both.goa.min)} €/l, at the Ministry's prices in force at ${time} on ${date}. The median is ${f(both.e95.median)} €/l for petrol 95 and ${f(both.goa.median)} €/l for diesel; across Spain, ${f(nat95.median)} and ${f(natGoa.median)} €/l.`;
    }
    if (locale === "ca") {
      return `Gasolina 95 més barata avui ${where}: ${f(both.e95.min)} €/l; dièsel, ${f(both.goa.min)} €/l, amb els preus del Ministeri vigents a les ${time} del ${date}. La mediana és ${f(both.e95.median)} €/l la gasolina 95 i ${f(both.goa.median)} €/l el dièsel; a tot Espanya, ${f(nat95.median)} i ${f(natGoa.median)} €/l.`;
    }
    return `Gasolina 95 más barata hoy ${where}: ${f(both.e95.min)} €/l; diésel, ${f(both.goa.min)} €/l, con los precios del Ministerio en vigor a las ${time} del ${date}. El precio mediano es ${f(both.e95.median)} €/l la gasolina 95 y ${f(both.goa.median)} €/l el diésel; en toda España, ${f(nat95.median)} y ${f(natGoa.median)} €/l.`;
  }
  const N = countText(p.stations, locale);
  const on = longDate(SPAIN_SNAPSHOT.readOn, locale);
  if (locale === "en") {
    const spread = p.towns > 1 ? `, in ${p.towns} municipalities,` : "";
    return `Spain's Ministry for the Ecological Transition listed ${N} filling stations ${where}${spread} on ${on}. This page shows the ten cheapest for petrol 95 and for diesel, the median price and the price in its main towns, with the time the Ministry published them.`;
  }
  if (locale === "ca") {
    const spread = p.towns > 1 ? `, en ${p.towns} municipis,` : "";
    return `El Ministeri per a la Transició Ecològica tenia registrades ${N} benzineres ${where}${spread} el ${on}. Aquesta pàgina mostra les deu més barates de gasolina 95 i de dièsel, la mediana i el preu dels municipis principals, amb l'hora a què el Ministeri va publicar els preus.`;
  }
  const spread = p.towns > 1 ? `, en ${p.towns} municipios,` : "";
  return `El Ministerio para la Transición Ecológica tenía registradas ${N} gasolineras ${where}${spread} el ${on}. Esta página muestra las diez más baratas de gasolina 95 y de diésel, el precio mediano y el de sus municipios principales, con la hora a la que el Ministerio publicó los precios.`;
}

/* -------------------------------------------------------------------------- */
/* The Spain table (hub)                                                      */
/* -------------------------------------------------------------------------- */

export interface SpainHubMeta {
  title: string;
  h1: string;
  crumb: string;
}

export function spainHubMeta(locale: FuelHubLocale): SpainHubMeta {
  if (locale === "en") return { title: first(["Fuel prices in Spain today by province: petrol and diesel", "Fuel prices in Spain today by province"], TITLE_LIMIT), h1: "Petrol and diesel prices today in Spain, by province", crumb: "Fuel prices in Spain" };
  if (locale === "ca") return { title: "Preu gasolina i dièsel avui a Espanya per províncies", h1: "Preu de la gasolina i el dièsel avui a Espanya, per províncies", crumb: "Benzineres per província" };
  return { title: "Precio gasolina y diésel hoy en España por provincias", h1: "Precio de la gasolina y el diésel hoy en España, por provincias", crumb: "Gasolineras por provincia" };
}

export function spainHubDescription(locale: FuelHubLocale, summary: SpainSummary | null): string {
  const e95 = summary?.national.fuels.e95;
  const goa = summary?.national.fuels.goa;
  if (summary && e95 && goa) {
    const { date, time } = splitFecha(summary.fecha);
    const when = `${dayMonth(date)}, ${time}`;
    const a = priceText(e95.median, locale);
    const b = priceText(goa.median, locale);
    if (locale === "en") return first([`Petrol 95 at ${a} €/l and diesel at ${b} €/l, Spain's median today (${when}): the cheapest and the median in all 52 provinces, from the Ministry.`, `Petrol 95 at ${a} €/l and diesel at ${b} €/l in Spain today (${when}): every province, from the Ministry.`], DESCRIPTION_LIMIT);
    if (locale === "ca") return first([`Gasolina 95 a ${a} €/l i dièsel a ${b} €/l de mediana a Espanya avui (${when}): la més barata i la mediana de les 52 províncies, amb la dada del Ministeri.`, `Gasolina 95 a ${a} €/l i dièsel a ${b} €/l a Espanya avui (${when}): totes les províncies, segons el Ministeri.`], DESCRIPTION_LIMIT);
    return first([`Gasolina 95 a ${a} €/l y diésel a ${b} €/l de mediana en España hoy (${when}): la más barata y la mediana de las 52 provincias, con el dato del Ministerio.`, `Gasolina 95 a ${a} €/l y diésel a ${b} €/l en España hoy (${when}): todas las provincias, según el Ministerio.`], DESCRIPTION_LIMIT);
  }
  const N = countText(SPAIN_SNAPSHOT.stations, locale);
  if (locale === "en") return `The cheapest petrol 95 and diesel and the median price in every province of Spain today, at its ${N} filling stations, from the Ministry.`;
  if (locale === "ca") return `La gasolina 95 i el dièsel més barats i la mediana de cada província d'Espanya avui, a les seves ${N} benzineres, segons el Ministeri.`;
  return `La gasolina 95 y el diésel más baratos y la mediana de cada provincia de España hoy, en sus ${N} gasolineras, según el Ministerio.`;
}

export function spainHubLead(locale: FuelHubLocale, summary: SpainSummary | null): string {
  const e95 = summary?.national.fuels.e95;
  const goa = summary?.national.fuels.goa;
  const ext = summary ? extremes(summary, "e95") : null;
  if (summary && e95 && goa && ext) {
    const { date, time } = splitFecha(summary.fecha);
    const f = (v: number) => priceText(v, locale);
    const lo = summary.provinces[ext.cheapest.code]!.fuels.e95!.median;
    const hi = summary.provinces[ext.dearest.code]!.fuels.e95!.median;
    const N = countText(summary.national.stations, locale);
    const cheap = placeInSentence(ext.cheapest, locale);
    const dear = placeInSentence(ext.dearest, locale);
    if (locale === "en") {
      return `Median price in Spain today, across its ${N} filling stations: petrol 95 at ${f(e95.median)} €/l and diesel at ${f(goa.median)} €/l (Ministry, ${time} on ${date}). By median, petrol 95 is cheapest in ${cheap} (${f(lo)} €/l) and dearest in ${dear} (${f(hi)} €/l). The table gives each province's cheapest station and median; each name leads to its ten cheapest stations and its prices by town.`;
    }
    if (locale === "ca") {
      return `Mediana a Espanya avui, a les seves ${N} benzineres: gasolina 95 a ${f(e95.median)} €/l i dièsel a ${f(goa.median)} €/l (Ministeri, ${time} del ${date}). De mediana, la gasolina 95 és més barata a ${cheap} (${f(lo)} €/l) i més cara a ${dear} (${f(hi)} €/l). A la taula, cada província amb la benzinera més barata i la mediana; cada nom porta a les seves deu benzineres més barates i al preu per municipi.`;
    }
    return `Precio mediano en España hoy, en sus ${N} gasolineras: gasolina 95 a ${f(e95.median)} €/l y diésel a ${f(goa.median)} €/l (Ministerio, ${time} del ${date}). De mediana, la gasolina 95 está más barata en ${cheap} (${f(lo)} €/l) y más cara en ${dear} (${f(hi)} €/l). En la tabla, cada provincia con su gasolinera más barata y su mediana; cada nombre lleva a sus diez gasolineras más baratas y al precio por municipio.`;
  }
  const N = countText(SPAIN_SNAPSHOT.stations, locale);
  const on = longDate(SPAIN_SNAPSHOT.readOn, locale);
  if (locale === "en") return `Spain's Ministry for the Ecological Transition listed ${N} filling stations in Spain on ${on}. This page gives, for every province, the cheapest petrol 95 and diesel and the median price, with the time the Ministry published them.`;
  if (locale === "ca") return `El Ministeri per a la Transició Ecològica tenia registrades ${N} benzineres a Espanya el ${on}. Aquesta pàgina dona, per a cada província, la gasolina 95 i el dièsel més barats i la mediana, amb l'hora a què el Ministeri va publicar els preus.`;
  return `El Ministerio para la Transición Ecológica tenía registradas ${N} gasolineras en España el ${on}. Esta página da, para cada provincia, la gasolina 95 y el diésel más baratos y el precio mediano, con la hora a la que el Ministerio publicó los precios.`;
}

/* -------------------------------------------------------------------------- */
/* FAQ                                                                        */
/* -------------------------------------------------------------------------- */

export interface Faq {
  q: string;
  a: string;
}

function updatesFaq(locale: FuelHubLocale): Faq {
  if (locale === "en") return { q: "How often do these prices change?", a: "Stations report their prices to the Ministry every Monday and whenever they change them; the Ministry publishes the list every half hour, and this page reads it again at most every half hour. Check the price on the pump before you fill up." };
  if (locale === "ca") return { q: "Cada quant canvien aquests preus?", a: "Les benzineres comuniquen els preus al Ministeri cada dilluns i sempre que els canvien; el Ministeri publica la llista cada mitja hora, i aquesta pàgina la torna a llegir com a màxim cada mitja hora. Comprova el preu al sortidor abans de posar-hi combustible." };
  return { q: "¿Cada cuánto cambian estos precios?", a: "Las gasolineras comunican sus precios al Ministerio cada lunes y siempre que los cambian; el Ministerio publica la lista cada media hora, y esta página la vuelve a leer como mucho cada media hora. Comprueba el precio en el surtidor antes de repostar." };
}

function stationText(s: SpainStation, locale: FuelHubLocale): string {
  return `${s.b}, ${s.a}, ${townText(s.t, locale)}`;
}

function centsPhrase(cents: number, locale: FuelHubLocale): string {
  const abs = CENTS[locale].format(Math.abs(cents));
  if (cents === 0) return { es: "la misma", ca: "la mateixa", en: "the same as" }[locale];
  if (locale === "en") return `${abs} cents ${cents > 0 ? "above" : "below"}`;
  if (locale === "ca") return `${abs} cèntims ${cents > 0 ? "més" : "menys"}`;
  return `${abs} céntimos ${cents > 0 ? "más" : "menos"}`;
}

/** The province page's questions, each answered with today's figures; only the update question without a list. */
export function spainProvinceFaq(p: SpainProvince, locale: FuelHubLocale, summary: SpainSummary | null): Faq[] {
  const stats = summary?.provinces[p.code];
  const both = bothFuels(stats);
  const nat95 = summary?.national.fuels.e95;
  const natGoa = summary?.national.fuels.goa;
  if (!summary || !both || !nat95 || !natGoa) return [updatesFaq(locale)];
  const { date, time } = splitFecha(summary.fecha);
  const f = (v: number) => priceText(v, locale);
  const c95 = both.e95.cheapest[0]!;
  const cGoa = both.goa.cheapest[0]!;
  const d95 = centsVsNational(summary, p.code, "e95")!;
  const of = ofProvince(p, locale);
  const where = inProvince(p, locale);
  const n = p.name;
  const vs = (cents: number, nat: number) =>
    locale === "en"
      ? cents === 0
        ? `the same as Spain's (${f(nat)} €/l)`
        : `${centsPhrase(cents, locale)} Spain's (${f(nat)} €/l)`
      : `${centsPhrase(cents, locale)} ${locale === "ca" ? "que la d'Espanya" : "que la de toda España"} (${f(nat)} €/l)`;
  if (locale === "en") {
    return [
      { q: `What is the price of petrol today in ${n}?`, a: `At ${time} on ${date}, petrol 95 costs ${f(both.e95.median)} €/l (median) at the ${both.e95.count} stations ${of} that publish a price, and the cheapest is ${f(both.e95.min)} €/l (${stationText(c95, locale)}). Diesel: ${f(both.goa.median)} €/l median, ${f(both.goa.min)} €/l at the cheapest.` },
      { q: `Which is the cheapest petrol station in ${n} today?`, a: `For petrol 95, ${stationText(c95, locale)}, at ${f(both.e95.min)} €/l (opening hours: ${c95.h || "not given"}). For diesel, ${stationText(cGoa, locale)}, at ${f(both.goa.min)} €/l. These are the Ministry's prices at ${time} on ${date}; the ten cheapest for each fuel are in the tables above.` },
      { q: `Is fuel dearer ${where} than in the rest of Spain?`, a: `Today the median price of petrol 95 ${where} is ${f(both.e95.median)} €/l, ${vs(d95, nat95.median)}. For diesel, ${f(both.goa.median)} €/l against ${f(natGoa.median)} €/l across Spain.` },
      updatesFaq(locale),
    ];
  }
  if (locale === "ca") {
    return [
      { q: `Quin és el preu de la gasolina avui ${caAName(n)}?`, a: `A les ${time} del ${date}, la gasolina 95 costa ${f(both.e95.median)} €/l de mediana a les ${both.e95.count} benzineres ${of} que en publiquen el preu, i la més barata és a ${f(both.e95.min)} €/l (${stationText(c95, locale)}). El dièsel: ${f(both.goa.median)} €/l de mediana i ${f(both.goa.min)} €/l el més barat.` },
      { q: `Quina és la benzinera més barata ${caDeName(n)} avui?`, a: `Per a la gasolina 95, ${stationText(c95, locale)}, a ${f(both.e95.min)} €/l (horari: ${c95.h || "no consta"}). Per al dièsel, ${stationText(cGoa, locale)}, a ${f(both.goa.min)} €/l. Són els preus del Ministeri a les ${time} del ${date}; les deu més barates de cada carburant són a les taules de dalt.` },
      { q: `És més cara la gasolina ${where} que a la resta d'Espanya?`, a: `Avui, la mediana de la gasolina 95 ${where} és ${f(both.e95.median)} €/l, ${vs(d95, nat95.median)}. En el dièsel, ${f(both.goa.median)} €/l davant de ${f(natGoa.median)} €/l a tot Espanya.` },
      updatesFaq(locale),
    ];
  }
  return [
    { q: `¿Cuál es el precio de la gasolina hoy en ${n}?`, a: `A las ${time} del ${date}, la gasolina 95 cuesta ${f(both.e95.median)} €/l de mediana en las ${both.e95.count} gasolineras ${of} que publican su precio, y la más barata está a ${f(both.e95.min)} €/l (${stationText(c95, locale)}). El diésel: ${f(both.goa.median)} €/l de mediana y ${f(both.goa.min)} €/l el más barato.` },
    { q: `¿Cuál es la gasolinera más barata de ${n} hoy?`, a: `Para la gasolina 95, ${stationText(c95, locale)}, a ${f(both.e95.min)} €/l (horario: ${c95.h || "no consta"}). Para el diésel, ${stationText(cGoa, locale)}, a ${f(both.goa.min)} €/l. Son los precios del Ministerio a las ${time} del ${date}; las diez más baratas de cada carburante están en las tablas de arriba.` },
    { q: `¿Es más cara la gasolina ${where} que en el resto de España?`, a: `Hoy, la mediana de la gasolina 95 ${where} es ${f(both.e95.median)} €/l, ${vs(d95, nat95.median)}. En el diésel, ${f(both.goa.median)} €/l frente a ${f(natGoa.median)} €/l en toda España.` },
    updatesFaq(locale),
  ];
}

export function spainHubFaq(locale: FuelHubLocale, summary: SpainSummary | null): Faq[] {
  const e95 = summary?.national.fuels.e95;
  const goa = summary?.national.fuels.goa;
  const x95 = summary ? extremes(summary, "e95") : null;
  const xGoa = summary ? extremes(summary, "goa") : null;
  if (!summary || !e95 || !goa || !x95 || !xGoa) return [updatesFaq(locale)];
  const { date, time } = splitFecha(summary.fecha);
  const f = (v: number) => priceText(v, locale);
  const m = (p: SpainProvince, fuel: SpainFuel) => f(summary.provinces[p.code]!.fuels[fuel]!.median);
  const at = (p: SpainProvince) => placeInSentence(p, locale);
  if (locale === "en") {
    return [
      { q: "What is the price of petrol today in Spain?", a: `At ${time} on ${date}, the median price of petrol 95 in Spain is ${f(e95.median)} €/l, across ${countText(e95.count, locale)} stations that publish one, and diesel's is ${f(goa.median)} €/l. Each province's cheapest station is in the table.` },
      { q: "Where is petrol cheapest in Spain?", a: `By median, in ${at(x95.cheapest)}: ${m(x95.cheapest, "e95")} €/l for petrol 95. The dearest is ${at(x95.dearest)}, at ${m(x95.dearest, "e95")} €/l. For diesel, the lowest median is ${at(xGoa.cheapest)} (${m(xGoa.cheapest, "goa")} €/l) and the highest ${at(xGoa.dearest)} (${m(xGoa.dearest, "goa")} €/l).` },
      updatesFaq(locale),
    ];
  }
  if (locale === "ca") {
    return [
      { q: "Quin és el preu de la gasolina avui a Espanya?", a: `A les ${time} del ${date}, la mediana de la gasolina 95 a Espanya és ${f(e95.median)} €/l, en ${countText(e95.count, locale)} benzineres que en publiquen el preu, i la del dièsel, ${f(goa.median)} €/l. La més barata de cada província és a la taula.` },
      { q: "On és més barata la gasolina a Espanya?", a: `De mediana, a ${at(x95.cheapest)}: ${m(x95.cheapest, "e95")} €/l la gasolina 95. La més cara, ${at(x95.dearest)}, amb ${m(x95.dearest, "e95")} €/l. En dièsel, la mediana més baixa és la ${caDeArticle(at(xGoa.cheapest))} (${m(xGoa.cheapest, "goa")} €/l) i la més alta, la ${caDeArticle(at(xGoa.dearest))} (${m(xGoa.dearest, "goa")} €/l).` },
      updatesFaq(locale),
    ];
  }
  return [
    { q: "¿Cuál es el precio de la gasolina hoy en España?", a: `A las ${time} del ${date}, la mediana de la gasolina 95 en España es ${f(e95.median)} €/l, en ${countText(e95.count, locale)} gasolineras que publican su precio, y la del diésel, ${f(goa.median)} €/l. La más barata de cada provincia está en la tabla.` },
    { q: "¿Dónde está la gasolina más barata de España?", a: `De mediana, en ${at(x95.cheapest)}: ${m(x95.cheapest, "e95")} €/l la gasolina 95. La más cara, ${at(x95.dearest)}, con ${m(x95.dearest, "e95")} €/l. En diésel, la mediana más baja es la ${esDeArticle(at(xGoa.cheapest))} (${m(xGoa.cheapest, "goa")} €/l) y la más alta, la ${esDeArticle(at(xGoa.dearest))} (${m(xGoa.dearest, "goa")} €/l).` },
    updatesFaq(locale),
  ];
}

/** "la provincia de Soria" -> "de la provincia de Soria"; "Ceuta" -> "de Ceuta". */
function esDeArticle(place: string): string {
  return `de ${place}`;
}

/** "la província de Sòria" -> "de la província de Sòria"; "Ceuta" -> "de Ceuta". */
function caDeArticle(place: string): string {
  return place.startsWith("la ") ? `de ${place}` : caDeName(place);
}

/* -------------------------------------------------------------------------- */
/* Labels                                                                     */
/* -------------------------------------------------------------------------- */

export interface SpainLabels {
  summaryTitle: string;
  /** Slots: {time}, {date}. */
  summaryCaption: string;
  summaryCols: { fuel: string; min: string; median: string; national: string; diff: string };
  cheapestTitle: (fuel: SpainFuel, n: number) => string;
  cheapestCols: { rank: string; station: string; town: string; hours: string; price: string; map: string };
  map: string;
  townsTitle: string;
  /** Slots: {n}, {time}, {date}. */
  townsIntro: string;
  townsCols: { town: string; stations: string; e95Min: string; e95Median: string; goaMin: string; goaMedian: string };
  hoursNote: string;
  faq: string;
  others: string;
  spainTable: string;
  cataloniaHub: string;
  /** The hub table. Slots: {time}, {date}. */
  tableTitle: string;
  tableIntro: string;
  tableCaption: string;
  tableCols: { province: string; stations: string; e95Min: string; e95Median: string; goaMin: string; goaMedian: string };
  catalonia: string;
  fuelNames: Record<SpainFuel, string>;
  /** Slot: {time} {date} of the Ministry's list. */
  read: string;
  cents: (cents: number) => string;
  /** On the Catalan hubs: the rest of Spain. */
  restTitle: string;
  restIntro: string;
  restLink: string;
}

export function spainLabels(locale: FuelHubLocale): SpainLabels {
  const c = (cents: number) => {
    const abs = CENTS[locale].format(Math.abs(cents));
    if (cents === 0) return { es: "igual", ca: "igual", en: "same" }[locale];
    const sign = cents > 0 ? "+" : "−";
    return { es: `${sign}${abs} cént.`, ca: `${sign}${abs} cènt.`, en: `${sign}${abs} c` }[locale];
  };
  if (locale === "en") {
    return {
      summaryTitle: "Today in figures",
      summaryCaption: "Petrol 95 E5 and diesel (gasóleo A), €/litre, Ministry prices in force at {time} on {date}",
      summaryCols: { fuel: "Fuel", min: "Cheapest", median: "Median here", national: "Spain's median", diff: "Difference" },
      cheapestTitle: (fuel, n) => `The ${n} cheapest stations: ${fuel === "e95" ? "petrol 95" : "diesel"}`,
      cheapestCols: { rank: "#", station: "Station", town: "Town", hours: "Opening hours", price: "€/litre", map: "Map" },
      map: "Show on the map",
      townsTitle: "Petrol and diesel prices by town",
      townsIntro: "The {n} municipalities with most stations: the cheapest price and the median in each, at {time} on {date}.",
      townsCols: { town: "Municipality", stations: "Stations", e95Min: "Petrol 95: cheapest", e95Median: "Petrol 95: median", goaMin: "Diesel: cheapest", goaMedian: "Diesel: median" },
      hoursNote: "Opening hours are as each station declares them to the Ministry, in Spanish abbreviations: \"L-D\" is Monday to Sunday (L, M, X, J, V, S and D are the days from lunes to domingo) and \"24H\" means open 24 hours.",
      faq: "Questions",
      others: "Fuel prices in other provinces",
      spainTable: "Every province in one table",
      cataloniaHub: "Catalonia by province, city and chain",
      tableTitle: "Petrol and diesel prices today in every province",
      tableIntro: "The cheapest price and the median in each province and in Ceuta and Melilla, at the Ministry's prices in force at {time} on {date}. Under the cheapest price, the station's brand and town. Catalonia's four provinces also have pages by comarca, city and chain (in Spanish), summed up on the English Catalonia page.",
      tableCaption: "Petrol 95 E5 and diesel by province, in €/litre",
      tableCols: { province: "Province", stations: "Stations", e95Min: "Petrol 95: cheapest", e95Median: "Petrol 95: median", goaMin: "Diesel: cheapest", goaMedian: "Diesel: median" },
      catalonia: "Catalonia",
      fuelNames: { e95: "Petrol 95 E5", goa: "Diesel (gasóleo A)" },
      read: "Ministry prices at {time} on {date}",
      cents: c,
      restTitle: "Fuel prices in the rest of Spain",
      restIntro: "The cheapest petrol 95 and diesel and the median in every province of Spain are in",
      restLink: "one table",
    };
  }
  if (locale === "ca") {
    return {
      summaryTitle: "Avui, en xifres",
      summaryCaption: "Gasolina 95 E5 i gasoli A (dièsel), en €/litre, preus del Ministeri vigents a les {time} del {date}",
      summaryCols: { fuel: "Carburant", min: "La més barata", median: "Mediana aquí", national: "Mediana d'Espanya", diff: "Diferència" },
      cheapestTitle: (fuel, n) => `Les ${n} benzineres més barates: ${fuel === "e95" ? "gasolina 95" : "dièsel"}`,
      cheapestCols: { rank: "#", station: "Benzinera", town: "Municipi", hours: "Horari", price: "€/litre", map: "Mapa" },
      map: "Veure al mapa",
      townsTitle: "Preu de la gasolina i el dièsel per municipi",
      townsIntro: "Els {n} municipis amb més benzineres: la més barata i la mediana de cadascun, a les {time} del {date}.",
      townsCols: { town: "Municipi", stations: "Benzineres", e95Min: "Gasolina 95: la més barata", e95Median: "Gasolina 95: mediana", goaMin: "Dièsel: el més barat", goaMedian: "Dièsel: mediana" },
      hoursNote: "L'horari és el que cada benzinera declara al Ministeri, tal com el publica: «L-D» és de dilluns a diumenge (L, M, X, J, V, S i D són les inicials castellanes dels dies, de lunes a domingo) i «24H», oberta les 24 hores.",
      faq: "Preguntes freqüents",
      others: "Preu de la gasolina a altres províncies",
      spainTable: "Totes les províncies en una taula",
      cataloniaHub: "Catalunya per província, comarca, ciutat i cadena",
      tableTitle: "Preu de la gasolina i el dièsel avui a cada província",
      tableIntro: "La més barata i la mediana de cada província i de Ceuta i Melilla, amb els preus del Ministeri vigents a les {time} del {date}. Sota el preu més baix, la marca i el municipi de la benzinera. Les quatre províncies de Catalunya tenen, a més, pàgina per comarca, ciutat i cadena.",
      tableCaption: "Gasolina 95 E5 i gasoli A per província, en €/litre",
      tableCols: { province: "Província", stations: "Benzineres", e95Min: "Gasolina 95: la més barata", e95Median: "Gasolina 95: mediana", goaMin: "Dièsel: el més barat", goaMedian: "Dièsel: mediana" },
      catalonia: "Catalunya",
      fuelNames: { e95: "Gasolina 95 E5", goa: "Gasoli A (dièsel)" },
      read: "Preus del Ministeri a les {time} del {date}",
      cents: c,
      restTitle: "Preu de la gasolina a la resta d'Espanya",
      restIntro: "La gasolina 95 i el dièsel més barats i la mediana de cada província d'Espanya són en",
      restLink: "una sola taula",
    };
  }
  return {
    summaryTitle: "Hoy, en cifras",
    summaryCaption: "Gasolina 95 E5 y gasóleo A (diésel), en €/litro, precios del Ministerio en vigor a las {time} del {date}",
    summaryCols: { fuel: "Carburante", min: "La más barata", median: "Mediana aquí", national: "Mediana de España", diff: "Diferencia" },
    cheapestTitle: (fuel, n) => `Las ${n} gasolineras más baratas: ${fuel === "e95" ? "gasolina 95" : "diésel"}`,
    cheapestCols: { rank: "#", station: "Gasolinera", town: "Municipio", hours: "Horario", price: "€/litro", map: "Mapa" },
    map: "Ver en el mapa",
    townsTitle: "Precio de la gasolina y el diésel por municipio",
    townsIntro: "Los {n} municipios con más gasolineras: la más barata y la mediana de cada uno, a las {time} del {date}.",
    townsCols: { town: "Municipio", stations: "Gasolineras", e95Min: "Gasolina 95: la más barata", e95Median: "Gasolina 95: mediana", goaMin: "Diésel: el más barato", goaMedian: "Diésel: mediana" },
    hoursNote: "El horario es el que cada gasolinera declara al Ministerio, tal como lo publica: «L-D» es de lunes a domingo; L, M, X, J, V, S y D, los días de la semana, y «24H», abierta las 24 horas.",
    faq: "Preguntas frecuentes",
    others: "Precio de la gasolina en otras provincias",
    spainTable: "Todas las provincias en una tabla",
    cataloniaHub: "Cataluña por provincia, comarca, ciudad y cadena",
    tableTitle: "Precio de la gasolina y el diésel hoy en cada provincia",
    tableIntro: "La más barata y la mediana de cada provincia y de Ceuta y Melilla, con los precios del Ministerio en vigor a las {time} del {date}. Debajo del precio más bajo, la marca y el municipio de esa gasolinera. Las cuatro provincias de Cataluña tienen además página por comarca, ciudad y cadena.",
    tableCaption: "Gasolina 95 E5 y gasóleo A por provincia, en €/litro",
    tableCols: { province: "Provincia", stations: "Gasolineras", e95Min: "Gasolina 95: la más barata", e95Median: "Gasolina 95: mediana", goaMin: "Diésel: el más barato", goaMedian: "Diésel: mediana" },
    catalonia: "Cataluña",
    fuelNames: { e95: "Gasolina 95 E5", goa: "Gasóleo A (diésel)" },
    read: "Precios del Ministerio a las {time} del {date}",
    cents: c,
    restTitle: "Precio de la gasolina en el resto de España",
    restIntro: "La gasolina 95 y el diésel más baratos y la mediana de cada provincia de España están en",
    restLink: "una sola tabla",
  };
}

/** Sources of the Spain pages: the national service instead of the Catalan filter. */
export function spainServiceName(locale: FuelHubLocale): string {
  return { es: "Servicio REST de precios de carburantes (toda España)", ca: "Servei REST de preus de carburants (tot Espanya)", en: "Fuel price REST service (all of Spain)" }[locale];
}

export const INE_PROVINCES_URL = "https://www.ine.es/daco/daco42/codmun/cod_ccaa_provincia.htm";

export function ineProvincesName(locale: FuelHubLocale): string {
  return { es: "Relación de comunidades autónomas y provincias", ca: "Relació de comunitats autònomes i províncies", en: "List of autonomous communities and provinces" }[locale];
}
