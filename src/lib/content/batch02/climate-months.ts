import { link as featureLink } from "@/lib/content/features/shared";
import { changesInYear } from "@/lib/content/clock/rule";
import { shortDate } from "@/lib/content/holidays/calendar";
import { BARCELONA_LOCAL, CATALONIA_HOLIDAYS, type Holiday } from "@/lib/content/holidays/payload";
import type { Locale } from "@/lib/i18n/config";

import { CARNIVAL } from "./carnival";
import { FESTA_2027 } from "./calcots";
import { b2link, type B2Source } from "./shared";

/**
 * The per-month extras of the Barcelona weather guide (O4, 25 Nov 2026):
 * sunrise, sunset and daylight, what to pack, and what the month holds with
 * the guides that cover it. The temperature, rain and sunshine figures stay in
 * climate.ts (AEMET); this file holds only what the guide did not have.
 *
 * Sunrise and sunset: the Instituto Geográfico Nacional's Observatorio
 * Astronómico Nacional table for Barcelona, year 2027, official peninsular
 * time (summer time from the last Sunday of March to the last Sunday of
 * October, as the file's footnote says). Read on 25 Nov 2026 at 16:31 CET
 * from https://cdn.mitma.gob.es/portal-web-drupal/salidapuestasol/2027/Barcelona-2027.txt
 * (linked from astronomia.ign.es "Times of sunrise and sunset"). The header
 * reads "BARCELONA SALIDA Y PUESTA DE SOL PARA 2027", "Latitud y longitud: 41
 * 23 7, + 2 10 39", "Hora oficial en la península y Baleares", "Observatorio
 * Astronómico Nacional, Instituto Geográfico Nacional". The 15th of each month
 * is printed (the file has every day). Daylight is sunset minus sunrise, a
 * subtraction of the two official times, not another figure.
 *
 * Holidays come from the same 2027 calendar as the holidays guides
 * (CATALONIA_HOLIDAYS, Ordre EMT/52/2026; BARCELONA_LOCAL, the City Council's
 * calendar, both re-read 25 Nov 2026), the Carnival and calçotada dates from
 * their own guides' modules, and the clock changes from the clock rule.
 * No sea temperature: no official monthly series exists (see climate.ts).
 *
 * Not touched: the month H3s (query-words experiment of 19 Nov, review 26 Nov
 * and 3 Dec), the title, the description, the H1 and the lead.
 */

export const SUN_VERIFIED = "2026-11-25";
/** Re-read by this day: IGN publishes the next year's table in the same place. */
export const SUN_REREAD_BY = "2027-12-31";
export const SUN_YEAR = 2027;

export const SUN_SOURCES: B2Source[] = [
  {
    name: "Salida y puesta de sol, Barcelona, 2027 (Hora oficial en la península y Baleares)",
    url: "https://cdn.mitma.gob.es/portal-web-drupal/salidapuestasol/2027/Barcelona-2027.txt",
    publisher: "Instituto Geográfico Nacional — Observatorio Astronómico Nacional",
  },
  {
    name: "Times of sunrise and sunset",
    url: "https://astronomia.ign.es/en/web/guest/hora-salidas-y-puestas-de-sol",
    publisher: "Instituto Geográfico Nacional — Observatorio Astronómico Nacional",
  },
  {
    name: "Calendari de festes laborals 2027",
    url: "https://treball.gencat.cat/ca/ambits/relacions_laborals/ci/calendari_laboral/calendari-festes-2027/",
    publisher: "Departament d'Empresa i Treball, Generalitat de Catalunya",
  },
  {
    name: "Festes estatals i autonòmiques a Catalunya i locals a Barcelona al 2027",
    url: "https://ajuntament.barcelona.cat/calendarifestius/ca/",
    publisher: "Ajuntament de Barcelona",
  },
];

/** IGN, Barcelona 2027, the 15th of each month: [[sunrise h, min], [sunset h, min]], official time. */
export const SUN_15TH: readonly (readonly [readonly [number, number], readonly [number, number]])[] = [
  [[8, 15], [17, 46]],
  [[7, 47], [18, 25]],
  [[7, 4], [18, 58]],
  [[7, 12], [20, 31]],
  [[6, 33], [21, 3]],
  [[6, 17], [21, 26]],
  [[6, 31], [21, 23]],
  [[7, 0], [20, 51]],
  [[7, 31], [20, 1]],
  [[8, 3], [19, 11]],
  [[7, 39], [17, 32]],
  [[8, 10], [17, 22]],
];

const two = (n: number) => String(n).padStart(2, "0");

/** Sunrise, sunset and daylight on the 15th of month `i` (0 = January). */
export function sunMonth(i: number) {
  const [[rh, rm], [sh, sm]] = SUN_15TH[i]!;
  const minutes = sh * 60 + sm - (rh * 60 + rm);
  return {
    sunrise: `${two(rh)}:${two(rm)}`,
    sunset: `${two(sh)}:${two(sm)}`,
    daylightMinutes: minutes,
    daylightHours: Math.floor(minutes / 60),
    daylightMin: minutes % 60,
  };
}

/** "9 h 31 min" in every language. */
export function daylightText(i: number): string {
  const { daylightHours, daylightMin } = sunMonth(i);
  return `${daylightHours} h ${two(daylightMin)} min`;
}

export const SUN_COPY: Record<
  Locale,
  { title: string; intro: string; caption: string; headers: string[]; note: string }
> = {
  ca: {
    title: "A quina hora surt i es pon el sol a Barcelona cada mes",
    intro:
      "Hores de sortida i posta del sol el dia 15 de cada mes del 2027, amb les hores de llum que hi ha entre una i l'altra. El dia més curt de l'any (desembre) en té poc més de 9; el juny, més de 15.",
    caption: "Sortida i posta del sol a Barcelona el dia 15 de cada mes del 2027 (IGN, hora oficial)",
    headers: ["Mes", "Surt el sol", "Es pon el sol", "Hores de llum"],
    note: "Hora oficial a la península: l'horari d'estiu va de l'últim diumenge de març a l'últim d'octubre. Les hores de llum són la diferència entre les dues hores. Font: Observatorio Astronómico Nacional (Instituto Geográfico Nacional), taula de Barcelona del 2027.",
  },
  es: {
    title: "A qué hora sale y se pone el sol en Barcelona cada mes",
    intro:
      "Horas de salida y puesta del sol el día 15 de cada mes de 2027, con las horas de luz que hay entre una y otra. El día más corto del año (diciembre) tiene algo más de 9; junio, más de 15.",
    caption: "Salida y puesta del sol en Barcelona el día 15 de cada mes de 2027 (IGN, hora oficial)",
    headers: ["Mes", "Sale el sol", "Se pone el sol", "Horas de luz"],
    note: "Hora oficial en la península: el horario de verano va del último domingo de marzo al último de octubre. Las horas de luz son la diferencia entre las dos horas. Fuente: Observatorio Astronómico Nacional (Instituto Geográfico Nacional), tabla de Barcelona de 2027.",
  },
  en: {
    title: "Barcelona sunrise and sunset times by month",
    intro:
      "Sunrise and sunset on the 15th of each month of 2027, with the hours of daylight between them. December has a little over 9 hours of daylight; June has more than 15.",
    caption: "Barcelona sunrise and sunset on the 15th of each month of 2027 (IGN, official time)",
    headers: ["Month", "Sunrise", "Sunset", "Daylight"],
    note: "Official mainland time: summer time runs from the last Sunday of March to the last Sunday of October. Daylight is the gap between the two times. Source: Observatorio Astronómico Nacional (Instituto Geográfico Nacional), Barcelona table for 2027.",
  },
};

/** The sunrise table rows, locale-independent apart from the month name. */
export function sunRows(months: string[]): string[][] {
  return months.map((month, i) => {
    const { sunrise, sunset } = sunMonth(i);
    return [month, sunrise, sunset, daylightText(i)];
  });
}

type Figures = { high: number; low: number; cityLow: number; rain: number; rainDays: number };

/** What to pack: advice read off the month's own figures, no new numbers. */
export function packText(locale: Locale, i: number, f: Figures): string {
  const n = (v: number) => (locale === "en" ? v.toFixed(1) : v.toFixed(1).replace(".", ","));
  const high = n(f.high);
  const low = n(f.low);
  const rain = String(f.rain);
  const T: Record<Locale, string[]> = {
    ca: [
      `Abric de pes, bufanda i capes; mínimes de ${low} °C a l'aeroport. Un paraigua plegable per als dies de pluja (${rain} mm).`,
      `Abric, bufanda i capes: les mínimes no passen de ${low} °C a l'aeroport. Paraigua o impermeable lleuger.`,
      `Capes: una jaqueta per al matí i el vespre (màximes de ${high} °C) i un paraigua; ${rain} mm de pluja.`,
      `Jaqueta lleugera i samarreta de màniga llarga; un impermeable per als ${rain} mm de pluja.`,
      `Roba lleugera amb una jaqueta fina per al vespre (màximes de ${high} °C), ulleres de sol i protector solar.`,
      `Roba lleugera i de cotó, gorra, protector solar i banyador; les nits ja són càlides (mínimes de ${low} °C).`,
      `Roba molt lleugera, gorra, protector solar i una ampolla d'aigua; és el mes més sec i assolellat.`,
      `Roba lleugera, protector solar i banyador; porta un paraigua petit per a les tempestes (${rain} mm de pluja).`,
      `Roba d'estiu de dia (màximes de ${high} °C), una capa fina al vespre i un paraigua: ${rain} mm de pluja.`,
      `Capes i un impermeable: és el mes més plujós (${rain} mm). Màximes de ${high} °C.`,
      `Jaqueta, jersei fi i paraigua: ${rain} mm de pluja i mínimes de ${low} °C.`,
      `Abric, bufanda i capes (mínimes de ${low} °C a l'aeroport), i un paraigua petit.`,
    ],
    es: [
      `Abrigo, bufanda y capas; mínimas de ${low} °C en el aeropuerto. Un paraguas plegable para los días de lluvia (${rain} mm).`,
      `Abrigo, bufanda y capas: las mínimas no pasan de ${low} °C en el aeropuerto. Paraguas o impermeable ligero.`,
      `Capas: una chaqueta para la mañana y la tarde (máximas de ${high} °C) y un paraguas; ${rain} mm de lluvia.`,
      `Chaqueta ligera y camiseta de manga larga; un impermeable para los ${rain} mm de lluvia.`,
      `Ropa ligera con una chaqueta fina para la noche (máximas de ${high} °C), gafas de sol y protector solar.`,
      `Ropa ligera de algodón, gorra, protector solar y bañador; las noches ya son cálidas (mínimas de ${low} °C).`,
      `Ropa muy ligera, gorra, protector solar y una botella de agua; es el mes más seco y soleado.`,
      `Ropa ligera, protector solar y bañador; lleva un paraguas pequeño para las tormentas (${rain} mm de lluvia).`,
      `Ropa de verano de día (máximas de ${high} °C), una capa fina por la noche y un paraguas: ${rain} mm de lluvia.`,
      `Capas y un impermeable: es el mes más lluvioso (${rain} mm). Máximas de ${high} °C.`,
      `Chaqueta, jersey fino y paraguas: ${rain} mm de lluvia y mínimas de ${low} °C.`,
      `Abrigo, bufanda y capas (mínimas de ${low} °C en el aeropuerto), y un paraguas pequeño.`,
    ],
    en: [
      `A warm coat, a scarf and layers: lows of ${low} °C at the airport. A folding umbrella for the rainy days (${rain} mm).`,
      `A coat, a scarf and layers: lows stay around ${low} °C at the airport. An umbrella or light rain jacket.`,
      `Layers: a jacket for mornings and evenings (highs of ${high} °C) and an umbrella; ${rain} mm of rain.`,
      `A light jacket and a long-sleeved top; a rain jacket for the ${rain} mm of rain.`,
      `Light clothes with a thin jacket for the evening (highs of ${high} °C), sunglasses and sunscreen.`,
      `Light cotton clothes, a hat, sunscreen and swimwear; nights are already warm (lows of ${low} °C).`,
      `Very light clothes, a hat, sunscreen and a water bottle: it is the driest and sunniest month.`,
      `Light clothes, sunscreen and swimwear; a small umbrella for the storms (${rain} mm of rain).`,
      `Summer clothes by day (highs of ${high} °C), a thin layer for the evening and an umbrella: ${rain} mm of rain.`,
      `Layers and a rain jacket: it is the wettest month (${rain} mm). Highs of ${high} °C.`,
      `A jacket, a light jumper and an umbrella: ${rain} mm of rain and lows of ${low} °C.`,
      `A coat, a scarf and layers (lows of ${low} °C at the airport), and a small umbrella.`,
    ],
  };
  return T[locale][i] ?? "";
}

// 27 Nov 2026 (batch 8G): "what to wear" is the searchers' wording; the advice is unchanged.
const pack: Record<Locale, string> = { ca: "Què posar-te i què portar", es: "Qué ponerte y qué llevar", en: "What to wear and pack" };
const daylightLabel: Record<Locale, string> = { ca: "Llum", es: "Luz", en: "Daylight" };

function holidaysOfMonth(i: number): Holiday[] {
  return CATALONIA_HOLIDAYS.filter((h) => Number(h.date.slice(5, 7)) === i + 1);
}
function localOfMonth(i: number): Holiday[] {
  return BARCELONA_LOCAL.filter((h) => Number(h.date.slice(5, 7)) === i + 1);
}

function dayList(locale: Locale, holidays: Holiday[]): string {
  const parts = holidays.map((h) => `${shortDate(h.date, locale)} (${h.name[locale]})`);
  const and = { ca: " i ", es: " y ", en: " and " }[locale];
  if (parts.length <= 1) return parts.join("");
  return `${parts.slice(0, -1).join(", ")}${and}${parts[parts.length - 1]}`;
}

/** "Public holidays (2027): 1 January (New Year's Day) and 6 January (Epiphany)." */
export function holidaySentence(locale: Locale, i: number): string {
  const catalonia = holidaysOfMonth(i);
  const local = localOfMonth(i);
  const out: string[] = [];
  if (catalonia.length > 0) {
    const label = { ca: "Festius a Catalunya el 2027", es: "Festivos en Cataluña en 2027", en: "Public holidays in Catalonia in 2027" }[locale];
    out.push(`${label}: ${dayList(locale, catalonia)}.`);
  }
  if (local.length > 0) {
    const label = { ca: "Festa local de Barcelona", es: "Fiesta local de Barcelona", en: "Barcelona's local holiday" }[locale];
    out.push(`${label}: ${dayList(locale, local)}.`);
  }
  return out.join(" ");
}

const L = (locale: Locale, ca: string, es: string, en: string) => ({ ca, es, en })[locale];

/**
 * The month's dated events and the guides that cover them. Every date comes
 * from a shared module or calendar, never typed here.
 */
export function eventsText(locale: Locale, i: number): string {
  const holidays = holidaySentence(locale, i);
  const [forward, back] = changesInYear(SUN_YEAR) as [ReturnType<typeof changesInYear>[number], ReturnType<typeof changesInYear>[number]];
  const guide = (key: Parameters<typeof b2link>[0], ca: string, es: string, en: string) => b2link(key, locale, L(locale, ca, es, en));
  const feature = (key: Parameters<typeof featureLink>[0], ca: string, es: string, en: string) => featureLink(key, locale, L(locale, ca, es, en));
  const date = (iso: string) => shortDate(iso, locale);
  const tail: string[][] = [
    // January
    [
      L(
        locale,
        `La cavalcada i el dia de Reis són a la guia de ${guide("reis", "la Cavalcada de Reis a Barcelona", "la Cavalcada de Reyes en Barcelona", "the Three Kings parade in Barcelona")}; les rebaixes, a ${guide("shops", "botigues obertes en diumenges i festius", "tiendas abiertas en domingos y festivos", "shops open on Sundays and holidays")}. La Gran Festa de la Calçotada de Valls és el ${date(FESTA_2027.date)} del 2027 (${guide("calcots", "guia de calçots", "guía de calçots", "calçots guide")}). Per a la neu, mira ${guide("snow", "on veure neu a Catalunya sense esquiar", "dónde ver nieve en Cataluña sin esquiar", "where to see snow in Catalonia without skiing")}.`,
        `La cabalgata y el día de Reyes están en la guía de ${guide("reis", "la Cabalgata de Reyes en Barcelona", "la Cabalgata de Reyes en Barcelona", "the Three Kings parade in Barcelona")}; las rebajas, en ${guide("shops", "tiendas abiertas en domingos y festivos", "tiendas abiertas en domingos y festivos", "shops open on Sundays and holidays")}. La Gran Festa de la Calçotada de Valls es el ${date(FESTA_2027.date)} de 2027 (${guide("calcots", "guía de calçots", "guía de calçots", "calçots guide")}). Para la nieve, mira ${guide("snow", "dónde ver nieve en Cataluña sin esquiar", "dónde ver nieve en Cataluña sin esquiar", "where to see snow in Catalonia without skiing")}.`,
        `The Three Kings parade and Epiphany are in our guide to ${guide("reis", "the Three Kings parade in Barcelona", "the Three Kings parade in Barcelona", "the Three Kings parade in Barcelona")}; the January sales are in ${guide("shops", "shops open on Sundays and holidays", "shops open on Sundays and holidays", "shops open on Sundays and holidays")}. The Gran Festa de la Calçotada in Valls is on ${date(FESTA_2027.date)} 2027 (${guide("calcots", "calçots guide", "calçots guide", "calçots guide")}). For snow, see ${guide("snow", "where to see snow in Catalonia without skiing", "where to see snow in Catalonia without skiing", "where to see snow in Catalonia without skiing")}.`,
      ),
    ],
    // February
    [
      L(
        locale,
        `El Carnaval del 2027 va de Dijous Gras, ${date(CARNIVAL.dijousGras)}, a Dimecres de Cendra, ${date(CARNIVAL.ashWednesday)}: dies, festes locals i desfilades a ${guide("carnival", "la guia del Carnaval", "la guía del Carnaval", "the Carnival guide")}. La temporada de calçots continua (${guide("calcots", "guia de calçots", "guía de calçots", "calçots guide")}).`,
        `El Carnaval de 2027 va de Jueves Lardero, ${date(CARNIVAL.dijousGras)}, a Miércoles de Ceniza, ${date(CARNIVAL.ashWednesday)}: días, fiestas locales y desfiles en ${guide("carnival", "la guía del Carnaval", "la guía del Carnaval", "the Carnival guide")}. La temporada de calçots continúa (${guide("calcots", "guía de calçots", "guía de calçots", "calçots guide")}).`,
        `Carnival 2027 runs from Dijous Gras (Fat Thursday), ${date(CARNIVAL.dijousGras)}, to Ash Wednesday, ${date(CARNIVAL.ashWednesday)}: dates, local holidays and parades in ${guide("carnival", "the Carnival guide", "the Carnival guide", "the Carnival guide")}. The calçot season goes on (${guide("calcots", "calçots guide", "calçots guide", "calçots guide")}).`,
      ),
    ],
    // March
    [
      L(
        locale,
        `Els rellotges s'avancen el ${date(forward.date)} del 2027: mira ${guide("clockChange", "quan és el canvi d'hora", "cuándo es el cambio de hora", "when the clocks change in Spain")}. Setmana Santa i els festius, a ${guide("easter2027", "la guia de Pasqua 2027", "la guía de Semana Santa 2027", "the Easter 2027 guide")}.`,
        `Los relojes se adelantan el ${date(forward.date)} de 2027: mira ${guide("clockChange", "cuándo es el cambio de hora", "cuándo es el cambio de hora", "when the clocks change in Spain")}. Semana Santa y los festivos, en ${guide("easter2027", "la guía de Semana Santa 2027", "la guía de Semana Santa 2027", "the Easter 2027 guide")}.`,
        `The clocks go forward on ${date(forward.date)} 2027: see ${guide("clockChange", "when the clocks change in Spain", "when the clocks change in Spain", "when the clocks change in Spain")}. Holy Week and the holidays are in ${guide("easter2027", "the Easter 2027 guide", "the Easter 2027 guide", "the Easter 2027 guide")}.`,
      ),
    ],
    // April
    [
      L(
        locale,
        `Per a un dia de pluja, mira ${feature("rainy", "què fer a Barcelona i Catalunya quan plou", "qué hacer en Barcelona y Cataluña cuando llueve", "things to do in Barcelona on a rainy day")} i ${guide("museums", "els museus gratuïts", "los museos gratis", "the free museums")}.`,
        `Para un día de lluvia, mira ${feature("rainy", "qué hacer en Barcelona y Cataluña cuando llueve", "qué hacer en Barcelona y Cataluña cuando llueve", "things to do in Barcelona on a rainy day")} y ${guide("museums", "los museos gratis", "los museos gratis", "the free museums")}.`,
        `For a wet day, see ${feature("rainy", "things to do in Barcelona on a rainy day", "things to do in Barcelona on a rainy day", "things to do in Barcelona on a rainy day")} and ${guide("museums", "the free museums", "the free museums", "the free museums")}.`,
      ),
    ],
    // May
    [
      L(
        locale,
        `Els ponts i els caps de setmana llargs del 2027, a ${guide("bridges2027", "la guia de ponts del 2027", "la guía de puentes de 2027", "the 2027 bridges guide")}. Per a les platges, ${guide("beaches", "platges de Barcelona", "playas de Barcelona", "Barcelona beaches")}.`,
        `Los puentes y los fines de semana largos de 2027, en ${guide("bridges2027", "la guía de puentes de 2027", "la guía de puentes de 2027", "the 2027 bridges guide")}. Para las playas, ${guide("beaches", "playas de Barcelona", "playas de Barcelona", "Barcelona beaches")}.`,
        `Every 2027 bridge and long weekend is in ${guide("bridges2027", "the 2027 bridges guide", "the 2027 bridges guide", "the 2027 bridges guide")}. For the sand, see ${guide("beaches", "Barcelona beaches", "Barcelona beaches", "Barcelona beaches")}.`,
      ),
    ],
    // June
    [
      L(
        locale,
        `Per a les platges de la ciutat, ${guide("beaches", "platges de Barcelona", "playas de Barcelona", "Barcelona beaches")}; per a una escapada de nit fresca, ${guide("tibidabo", "Tibidabo", "Tibidabo", "Tibidabo")}.`,
        `Para las playas de la ciudad, ${guide("beaches", "playas de Barcelona", "playas de Barcelona", "Barcelona beaches")}; para una escapada de noche fresca, ${guide("tibidabo", "Tibidabo", "Tibidabo", "Tibidabo")}.`,
        `For the city's beaches, see ${guide("beaches", "Barcelona beaches", "Barcelona beaches", "Barcelona beaches")}; for a cooler evening out, ${guide("tibidabo", "Tibidabo", "Tibidabo", "Tibidabo")}.`,
      ),
    ],
    // July
    [
      L(
        locale,
        `Platges: ${guide("beaches", "platges de Barcelona", "playas de Barcelona", "Barcelona beaches")}. Per a les nits càlides, ${guide("montjuic", "Montjuïc: Font Màgica, telefèric i castell", "Montjuïc: Fuente Mágica, teleférico y castillo", "Montjuïc: Magic Fountain, cable car and castle")}.`,
        `Playas: ${guide("beaches", "playas de Barcelona", "playas de Barcelona", "Barcelona beaches")}. Para las noches cálidas, ${guide("montjuic", "Montjuïc: Fuente Mágica, teleférico y castillo", "Montjuïc: Fuente Mágica, teleférico y castillo", "Montjuïc: Magic Fountain, cable car and castle")}.`,
        `Beaches: ${guide("beaches", "Barcelona beaches", "Barcelona beaches", "Barcelona beaches")}. For warm evenings, ${guide("montjuic", "Montjuïc: Magic Fountain, cable car and castle", "Montjuïc: Magic Fountain, cable car and castle", "Montjuïc: Magic Fountain, cable car and castle")}.`,
      ),
    ],
    // August
    [
      L(
        locale,
        `Platges: ${guide("beaches", "platges de Barcelona", "playas de Barcelona", "Barcelona beaches")}. Per a les hores de més calor, ${guide("museums", "els museus gratuïts", "los museos gratis", "the free museums")} i ${guide("zooAquarium", "el Zoo i l'Aquàrium", "el Zoo y el Acuario", "the Zoo and Aquarium")}.`,
        `Playas: ${guide("beaches", "playas de Barcelona", "playas de Barcelona", "Barcelona beaches")}. Para las horas de más calor, ${guide("museums", "los museos gratis", "los museos gratis", "the free museums")} y ${guide("zooAquarium", "el Zoo y el Acuario", "el Zoo y el Acuario", "the Zoo and Aquarium")}.`,
        `Beaches: ${guide("beaches", "Barcelona beaches", "Barcelona beaches", "Barcelona beaches")}. For the hottest hours, ${guide("museums", "the free museums", "the free museums", "the free museums")} and ${guide("zooAquarium", "the Zoo and Aquarium", "the Zoo and Aquarium", "the Zoo and Aquarium")}.`,
      ),
    ],
    // September
    [
      L(
        locale,
        `Entrades i horaris dels grans monuments, a ${guide("monuments", "Sagrada Família, Park Güell i Casa Batlló", "Sagrada Família, Park Güell y Casa Batlló", "Sagrada Família, Park Güell and Casa Batlló")}. Les platges encara són a ${guide("beaches", "platges de Barcelona", "playas de Barcelona", "Barcelona beaches")}.`,
        `Entradas y horarios de los grandes monumentos, en ${guide("monuments", "Sagrada Família, Park Güell y Casa Batlló", "Sagrada Família, Park Güell y Casa Batlló", "Sagrada Família, Park Güell and Casa Batlló")}. Las playas siguen en ${guide("beaches", "playas de Barcelona", "playas de Barcelona", "Barcelona beaches")}.`,
        `Tickets and hours for the big monuments are in ${guide("monuments", "Sagrada Família, Park Güell and Casa Batlló", "Sagrada Família, Park Güell and Casa Batlló", "Sagrada Família, Park Güell and Casa Batlló")}. The beaches are still in ${guide("beaches", "Barcelona beaches", "Barcelona beaches", "Barcelona beaches")}.`,
      ),
    ],
    // October
    [
      L(
        locale,
        `Els rellotges es retarden el ${date(back.date)} del 2027 (${guide("clockChange", "canvi d'hora", "cambio de hora", "clock change")}). La tardor porta ${feature("sitges", "el Festival de Cinema de Sitges", "el Festival de Cine de Sitges", "the Sitges Film Festival")} i ${feature("castanyada", "la Castanyada", "la Castanyada", "the Castanyada")}; per a la pluja, ${feature("rainy", "què fer quan plou", "qué hacer cuando llueve", "things to do on a rainy day")}.`,
        `Los relojes se atrasan el ${date(back.date)} de 2027 (${guide("clockChange", "cambio de hora", "cambio de hora", "clock change")}). El otoño trae ${feature("sitges", "el Festival de Cine de Sitges", "el Festival de Cine de Sitges", "the Sitges Film Festival")} y ${feature("castanyada", "la Castanyada", "la Castanyada", "the Castanyada")}; para la lluvia, ${feature("rainy", "qué hacer cuando llueve", "qué hacer cuando llueve", "things to do on a rainy day")}.`,
        `The clocks go back on ${date(back.date)} 2027 (${guide("clockChange", "clock change", "clock change", "clock change")}). Autumn brings ${feature("sitges", "the Sitges Film Festival", "the Sitges Film Festival", "the Sitges Film Festival")} and ${feature("castanyada", "the Castanyada", "the Castanyada", "the Castanyada")}; for the rain, ${feature("rainy", "things to do on a rainy day", "things to do on a rainy day", "things to do on a rainy day")}.`,
      ),
    ],
    // November
    [
      L(
        locale,
        `La tradició d'aquestes dates és ${feature("castanyada", "la Castanyada", "la Castanyada", "the Castanyada")}. Si plou, ${feature("rainy", "què fer a Barcelona quan plou", "qué hacer en Barcelona cuando llueve", "things to do in Barcelona on a rainy day")}; el Nadal comença a ${guide("christmasLights", "l'encesa dels llums de Nadal", "el encendido de las luces de Navidad", "the Christmas lights switch-on")}.`,
        `La tradición de estas fechas es ${feature("castanyada", "la Castanyada", "la Castanyada", "the Castanyada")}. Si llueve, ${feature("rainy", "qué hacer en Barcelona cuando llueve", "qué hacer en Barcelona cuando llueve", "things to do in Barcelona on a rainy day")}; la Navidad empieza con ${guide("christmasLights", "el encendido de las luces de Navidad", "el encendido de las luces de Navidad", "the Christmas lights switch-on")}.`,
        `The tradition of these dates is ${feature("castanyada", "the Castanyada", "the Castanyada", "the Castanyada")}. If it rains, ${feature("rainy", "things to do in Barcelona on a rainy day", "things to do in Barcelona on a rainy day", "things to do in Barcelona on a rainy day")}; Christmas starts with ${guide("christmasLights", "the Christmas lights switch-on", "the Christmas lights switch-on", "the Christmas lights switch-on")}.`,
      ),
    ],
    // December
    [
      L(
        locale,
        `Nadal a la ciutat: ${guide("christmasBarcelona", "Nadal a Barcelona", "Navidad en Barcelona", "Christmas in Barcelona")}; ${guide("christmasLights", "els llums de Nadal", "las luces de Navidad", "the Christmas lights")}; el pont de la Constitució i la Immaculada, a ${guide("decemberBridge", "la guia del pont de desembre", "la guía del puente de diciembre", "the December bridge guide")}.`,
        `Navidad en la ciudad: ${guide("christmasBarcelona", "Navidad en Barcelona", "Navidad en Barcelona", "Christmas in Barcelona")}; ${guide("christmasLights", "las luces de Navidad", "las luces de Navidad", "the Christmas lights")}; el puente de la Constitución y la Inmaculada, en ${guide("decemberBridge", "la guía del puente de diciembre", "la guía del puente de diciembre", "the December bridge guide")}.`,
        `Christmas in the city: ${guide("christmasBarcelona", "Christmas in Barcelona", "Christmas in Barcelona", "Christmas in Barcelona")}; ${guide("christmasLights", "the Christmas lights", "the Christmas lights", "the Christmas lights")}; the Constitution Day and Immaculate Conception bridge is in ${guide("decemberBridge", "the December bridge guide", "the December bridge guide", "the December bridge guide")}.`,
      ),
    ],
  ];
  return [holidays, ...(tail[i] ?? [])].filter(Boolean).join(" ");
}

/** The two short paragraphs added under a month's weather text. */
export function monthExtras(locale: Locale, i: number, f: Figures): string[] {
  const { sunrise, sunset } = sunMonth(i);
  const dayLine = {
    ca: `**${daylightLabel[locale]}:** el dia 15 el sol surt a les ${sunrise} i es pon a les ${sunset} (${daylightText(i)} de llum, hora oficial, IGN, 2027). **${pack[locale]}:** ${packText(locale, i, f)}`,
    es: `**${daylightLabel[locale]}:** el día 15 el sol sale a las ${sunrise} y se pone a las ${sunset} (${daylightText(i)} de luz, hora oficial, IGN, 2027). **${pack[locale]}:** ${packText(locale, i, f)}`,
    en: `**${daylightLabel[locale]}:** on the 15th the sun rises at ${sunrise} and sets at ${sunset} (${daylightText(i)} of daylight, official time, IGN, 2027). **${pack[locale]}:** ${packText(locale, i, f)}`,
  }[locale];
  return [dayLine, eventsText(locale, i)];
}
