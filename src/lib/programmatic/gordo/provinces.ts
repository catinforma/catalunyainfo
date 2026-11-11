/**
 * Spain's 50 provinces and the two autonomous cities, by INE code, with the
 * official name as INE lists it ("Relación de provincias", article first) and
 * a fixed URL slug. The same official name is printed in all three editions.
 * Source: https://www.ine.es/daco/daco42/codmun/cod_ccaa_provincia.htm (read 11 Nov 2026).
 */

export interface GordoProvince {
  code: string;
  name: string;
  slug: string;
}

const ROWS: [string, string, string][] = [
  ["01", "Araba/Álava", "araba-alava"],
  ["02", "Albacete", "albacete"],
  ["03", "Alicante/Alacant", "alicante"],
  ["04", "Almería", "almeria"],
  ["05", "Ávila", "avila"],
  ["06", "Badajoz", "badajoz"],
  ["07", "Illes Balears", "illes-balears"],
  ["08", "Barcelona", "barcelona"],
  ["09", "Burgos", "burgos"],
  ["10", "Cáceres", "caceres"],
  ["11", "Cádiz", "cadiz"],
  ["12", "Castellón/Castelló", "castellon"],
  ["13", "Ciudad Real", "ciudad-real"],
  ["14", "Córdoba", "cordoba"],
  ["15", "A Coruña", "a-coruna"],
  ["16", "Cuenca", "cuenca"],
  ["17", "Girona", "girona"],
  ["18", "Granada", "granada"],
  ["19", "Guadalajara", "guadalajara"],
  ["20", "Gipuzkoa", "gipuzkoa"],
  ["21", "Huelva", "huelva"],
  ["22", "Huesca", "huesca"],
  ["23", "Jaén", "jaen"],
  ["24", "León", "leon"],
  ["25", "Lleida", "lleida"],
  ["26", "La Rioja", "la-rioja"],
  ["27", "Lugo", "lugo"],
  ["28", "Madrid", "madrid"],
  ["29", "Málaga", "malaga"],
  ["30", "Murcia", "murcia"],
  ["31", "Navarra", "navarra"],
  ["32", "Ourense", "ourense"],
  ["33", "Asturias", "asturias"],
  ["34", "Palencia", "palencia"],
  ["35", "Las Palmas", "las-palmas"],
  ["36", "Pontevedra", "pontevedra"],
  ["37", "Salamanca", "salamanca"],
  ["38", "Santa Cruz de Tenerife", "santa-cruz-de-tenerife"],
  ["39", "Cantabria", "cantabria"],
  ["40", "Segovia", "segovia"],
  ["41", "Sevilla", "sevilla"],
  ["42", "Soria", "soria"],
  ["43", "Tarragona", "tarragona"],
  ["44", "Teruel", "teruel"],
  ["45", "Toledo", "toledo"],
  ["46", "Valencia/València", "valencia"],
  ["47", "Valladolid", "valladolid"],
  ["48", "Bizkaia", "bizkaia"],
  ["49", "Zamora", "zamora"],
  ["50", "Zaragoza", "zaragoza"],
  ["51", "Ceuta", "ceuta"],
  ["52", "Melilla", "melilla"],
];

export const PROVINCES: readonly GordoProvince[] = ROWS.map(([code, name, slug]) => ({ code, name, slug }));

const BY_CODE = new Map(PROVINCES.map((p) => [p.code, p]));
const BY_SLUG = new Map(PROVINCES.map((p) => [p.slug, p]));

export function provinceByCode(code: string): GordoProvince | undefined {
  return BY_CODE.get(code);
}

export function provinceBySlug(slug: string): GordoProvince | undefined {
  return BY_SLUG.get(slug);
}
