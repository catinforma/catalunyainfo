import { SNAPSHOT, regionalDays, aranSwap, municipalities } from "./data";
import { caDayArticle, capitalize, dayMonth, weekdayDayMonth, weekdayName, type DateLocale } from "./format";
import { GUIDES, type GuideKey } from "./links";
import { esName, joinList } from "./names";
import type { DatePage } from "./paths";
import type { DatePlace, SnapshotMunicipality } from "./types";

/**
 * Content of the "És festiu el …?" pages. Every statement is either computed
 * from the snapshot (who has a local holiday, which towns may open shops) or
 * quotes an official text read on the snapshot date:
 *
 *  - Ordre EMT/66/2025 (2026) and Ordre EMT/52/2026 (2027): the Catalonia-wide days;
 *  - BOE-A-2025-21667: the 2026 national table (7 Dec is a holiday in nine
 *    communities and Melilla, not Catalonia; 26 Dec only in Catalonia and the
 *    Balearic Islands);
 *  - Llei 18/2017, articles 36.2.d (1 and 6 Jan, 25 and 26 Dec are closing
 *    days for shops) and 37 (the shops outside those limits);
 *  - Ordre EMT/77/2025, Resolució EMT/4342/2025 and Ordre EMT/89/2026: the
 *    shop-opening Sundays and holidays of 2026 and 2027;
 *  - Ordre EDF/66/2026: Christmas school holidays, 22 Dec 2026 to 7 Jan 2027.
 *
 * Tranche 2 (29 Oct 2026) adds 1, 11 and 30 November and 24 and 31 December.
 * None of them is in Ordre EMT/66/2025: 1 November 2026 falls on a Sunday and
 * the order neither lists it nor moves it to Monday 2 November. Which places
 * have a local holiday on those days comes from Ordre EMT/208/2025 as amended
 * by Ordre EMT/3/2026 (`localByDate`); which councils may open shops, from
 * Resolució EMT/4342/2025 (`shopsByDate`).
 */

/** BOE-A-2025-21667, row "7 Lunes siguiente al Día de la Constitución Española" (read 27 Oct 2026). */
const MONDAY_7_REGIONS: Record<DateLocale, string[]> = {
  ca: ["Andalusia", "l'Aragó", "Astúries", "Cantàbria", "Castella i Lleó", "Extremadura", "la Comunitat de Madrid", "la Regió de Múrcia", "la Rioja", "Melilla"],
  es: ["Andalucía", "Aragón", "Asturias", "Cantabria", "Castilla y León", "Extremadura", "la Comunidad de Madrid", "la Región de Murcia", "La Rioja", "Melilla"],
  en: ["Andalusia", "Aragon", "Asturias", "Cantabria", "Castile and León", "Extremadura", "the Community of Madrid", "the Region of Murcia", "La Rioja", "Melilla"],
};

/**
 * BOE-A-2025-21667, row "2 Día siguiente a Todos los Santos" (read 29 Oct
 * 2026): marked in the columns of Andalucía, Aragón, Asturias, Canarias,
 * Castilla-La Mancha, Castilla y León, Extremadura, Com. Madrid and C. Foral
 * Navarra; the Cataluña column is empty.
 */
const MONDAY_NOV2_REGIONS: Record<DateLocale, string[]> = {
  ca: ["Andalusia", "l'Aragó", "Astúries", "Canàries", "Castella-la Manxa", "Castella i Lleó", "Extremadura", "la Comunitat de Madrid", "Navarra"],
  es: ["Andalucía", "Aragón", "Asturias", "Canarias", "Castilla-La Mancha", "Castilla y León", "Extremadura", "la Comunidad de Madrid", "Navarra"],
  en: ["Andalusia", "Aragon", "Asturias", "the Canary Islands", "Castile-La Mancha", "Castile and León", "Extremadura", "the Community of Madrid", "Navarre"],
};

export interface DateSection {
  title: string;
  paragraphs: string[];
}

export interface DateContent {
  /** True when it is a holiday across Catalonia. */
  holiday: boolean;
  answer: string;
  answerNote: string[];
  /** One sentence with one link, after the answer (11 November: the general strike). */
  notice?: { before: string; label: string; href: string; after: string };
  description: string;
  /** Places with a local holiday that day (or on the eve, when the day itself is Catalonia-wide). */
  local: { text: string; places: DatePlace[] };
  sections: DateSection[];
  guides: GuideKey[];
}

function count(places: DatePlace[]) {
  return { municipalities: places.filter((p) => !p.parent).length, nuclei: places.filter((p) => p.parent).length };
}

function placesPhrase(places: DatePlace[], locale: DateLocale): string {
  const { municipalities: m, nuclei: n } = count(places);
  if (locale === "ca") return `${m} ${m === 1 ? "municipi" : "municipis"}${n ? ` i ${n} ${n === 1 ? "nucli" : "nuclis"}` : ""}`;
  if (locale === "es") return `${m} ${m === 1 ? "municipio" : "municipios"}${n ? ` y ${n} ${n === 1 ? "núcleo" : "núcleos"}` : ""}`;
  return `${m} ${m === 1 ? "town" : "towns"}${n ? ` and ${n} ${n === 1 ? "village" : "villages"}` : ""}`;
}

function placeNames(places: DatePlace[], locale: DateLocale): string {
  const shown = (name: string) => (locale === "es" ? esName(name) : name);
  return joinList(places.map((p) => (p.parent ? `${shown(p.name)} (${shown(p.parent)})` : shown(p.name))), locale);
}

/** Listed municipalities (the ones with a page) whose shop days for 2026 leave this date out. */
function shopsClosedAmongListed(iso: string): string[] {
  return municipalities()
    .filter((m) => !m.shops.includes(iso))
    .sort((a, b) => a.rank - b.rank)
    .map((m) => m.name);
}

function regionalName(iso: string, locale: DateLocale): string | null {
  const year = Number(iso.slice(0, 4));
  return regionalDays(year).find((d) => d.date === iso)?.name[locale] ?? null;
}

const NOV1 = "2026-11-01";
const NOV2 = "2026-11-02";
const NOV11 = "2026-11-11";
const NOV30 = "2026-11-30";
const DEC7 = "2026-12-07";
const DEC24 = "2026-12-24";
const DEC31 = "2026-12-31";

/**
 * Local-holiday dates that have a date page: the page itself, or, for 2
 * November (the Monday after Tots Sants), the 1 November page that lists it.
 */
export const LOCAL_DATE_PAGES: Record<string, DatePage> = {
  [NOV2]: NOV1,
  [NOV11]: NOV11,
  [NOV30]: NOV30,
  [DEC7]: DEC7,
  [DEC24]: DEC24,
  [DEC31]: DEC31,
};

/** What the day is called; the date pages for working days name it in the answer. */
const DAY_NAME: Record<string, Record<DateLocale, string>> = {
  [NOV1]: { ca: "Tots Sants", es: "Todos los Santos", en: "All Saints' Day" },
  [NOV11]: { ca: "Sant Martí", es: "San Martín", en: "Saint Martin's Day" },
  [NOV30]: { ca: "Sant Andreu", es: "San Andrés", en: "Saint Andrew's Day" },
  [DEC24]: { ca: "la vigília de Nadal", es: "Nochebuena", en: "Christmas Eve" },
  [DEC31]: { ca: "l'últim dia de l'any", es: "Nochevieja", en: "New Year's Eve" },
};

/**
 * The date pages that list this municipality's local days (its own or its
 * nuclei's), with how many other places in Catalonia share each day.
 */
export function municipalityDatePages(
  m: Pick<SnapshotMunicipality, "slug" | "name" | "local" | "nuclei">,
): { date: string; page: DatePage; others: number; nuclei: string[] }[] {
  const days = new Set([...m.local, ...m.nuclei.flatMap((n) => n.dates)]);
  return Object.entries(LOCAL_DATE_PAGES)
    .filter(([date]) => days.has(date))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, page]) => {
      const places = SNAPSHOT.localByDate[date] ?? [];
      const own = places.filter((p) => p.slug === m.slug || p.parent === m.name).length;
      // When the day is not the town's own, the nuclei that have it.
      const nuclei = m.local.includes(date) ? [] : m.nuclei.filter((n) => n.dates.includes(date)).map((n) => n.name);
      return { date, page, others: places.length - own, nuclei };
    });
}

/** Councils whose own shop-opening list includes a date outside the default list. */
function shopsOpenOn(iso: string): DatePlace[] {
  return SNAPSHOT.shopsByDate[iso] ?? [];
}

export function dateContent(iso: DatePage, locale: DateLocale): DateContent {
  const name = regionalName(iso, locale);
  const local = SNAPSHOT.localByDate[iso] ?? [];
  // "dimarts 8 de desembre de 2026": the article in front belongs to the weekday.
  const long = locale === "en" ? `${weekdayDayMonth(iso, locale)} ${iso.slice(0, 4)}` : `${weekdayDayMonth(iso, locale)} de ${iso.slice(0, 4)}`;
  const L = (ca: string, es: string, en: string) => (locale === "ca" ? ca : locale === "es" ? es : en);
  const names = (list: string[]) => joinList(list.map((n) => (locale === "es" ? esName(n) : n)), locale);

  const shopsLaw = L(
    "Les botigues amb horari general tanquen. La llei de comerç fixa uns quants dies de tancament obligatori: l'1 i el 6 de gener, el diumenge i el dilluns de Pasqua, l'1 de maig, el 24 de juny, l'11 de setembre i el 25 i el 26 de desembre (Llei 18/2017, article 36.2.d). Poden obrir els establiments que la llei deixa fora d'aquest horari, com fleques, pastisseries, botigues de conveniència, floristeries o farmàcies (article 37).",
    "Las tiendas con horario general cierran. La ley catalana de comercio fija varios días de cierre obligatorio: el 1 y el 6 de enero, el domingo y el lunes de Pascua, el 1 de mayo, el 24 de junio, el 11 de septiembre y el 25 y el 26 de diciembre (Ley 18/2017, artículo 36.2.d). Pueden abrir los establecimientos que la ley deja fuera de ese horario, como panaderías, pastelerías, tiendas de conveniencia, floristerías o farmacias (artículo 37).",
    "Shops on the general timetable are closed. Catalonia's retail law sets a few compulsory closing days: 1 and 6 January, Easter Sunday and Monday, 1 May, 24 June, 11 September and 25 and 26 December (Llei 18/2017, article 36.2.d). Businesses the law leaves outside that timetable may open, such as bakeries, pastry shops, convenience stores, florists and pharmacies (article 37).",
  );
  const schoolChristmas = L(
    "Les vacances escolars de Nadal van del 22 de desembre de 2026 al 7 de gener de 2027, tots dos inclosos (Ordre EDF/66/2026).",
    "Las vacaciones escolares de Navidad van del 22 de diciembre de 2026 al 7 de enero de 2027, ambos incluidos (Orden EDF/66/2026).",
    "School Christmas holidays run from 22 December 2026 to 7 January 2027, both included (Order EDF/66/2026).",
  );
  const metroPointer = L(
    "Per saber com obre i tanca el metro de Barcelona els festius i les vigílies, mira la guia d'horaris del metro.",
    "Para saber cómo abre y cierra el metro de Barcelona los festivos y las vísperas, mira la guía de horarios del metro.",
    "For how the Barcelona metro opens and closes on public holidays and the nights before them, see the metro hours guide.",
  );

  const schoolWorkingDay = (weekday: string) =>
    L(
      `No és festiu escolar a tot Catalunya, però sí als municipis on és festa local. A més, cada escola tria quatre dies de lliure disposició i en pot fer servir un aquest ${weekday}: mira el calendari del teu centre (Ordre EDF/66/2026).`,
      `No es festivo escolar en toda Cataluña, pero sí en los municipios donde es fiesta local. Además, cada escuela elige cuatro días de libre disposición y puede usar uno este ${weekday}: mira el calendario de tu centro (Orden EDF/66/2026).`,
      `It is not a school holiday across Catalonia, but it is wherever it is a local holiday. Each school also picks four days of its own and may use one on this ${weekday}: check your school's calendar (Order EDF/66/2026).`,
    );
  /** Working day: shops keep their hours; where it is a local holiday, only the councils that chose it may open. */
  const shopsWorkingDay = (date: string, open: DatePlace[]) => {
    const dm = dayMonth(date, locale);
    const where = names(open.map((p) => p.name));
    return L(
      `És un dia feiner: les botigues obren amb el seu horari habitual. Als municipis on és festa local, les botigues amb horari general només hi poden obrir si ${caDayArticle(date)}${dm} és un dels seus deu dies d'obertura comercial${open.length ? `, com passa a ${where}` : `, i no ho és en cap d'ells`} (Ordre EMT/77/2025 i Resolució EMT/4342/2025).`,
      `Es laborable: las tiendas abren con su horario habitual. En los municipios donde es fiesta local, las tiendas con horario general solo pueden abrir si el ${dm} es uno de sus diez días de apertura comercial${open.length ? `, como ocurre en ${where}` : `, y no lo es en ninguno de ellos`} (Orden EMT/77/2025 y Resolución EMT/4342/2025).`,
      `It is a working day, so shops keep their usual hours. Where it is a local holiday, shops on the general timetable may open only if ${dm} is one of that town's ten opening days${open.length ? `, as it is in ${where}` : `, and it is not in any of them`} (Order EMT/77/2025 and Resolution EMT/4342/2025).`,
    );
  };

  if (iso === NOV1) {
    const nov2 = SNAPSHOT.localByDate[NOV2] ?? [];
    const n2 = placesPhrase(nov2, locale);
    const open = shopsOpenOn(NOV1);
    const where = names(open.map((p) => p.name));
    const nov2Shops = shopsOpenOn(NOV2);
    return {
      holiday: false,
      // Ordre EMT/66/2025, article 1.a, lists twelve days; neither 1 nor 2 November is one of them.
      answer: L(
        `No. El ${long}, Tots Sants, no és festiu oficial a Catalunya: l'Ordre EMT/66/2025 no l'inclou entre els dotze festius de l'any, i tampoc no hi inclou el dilluns 2 de novembre.`,
        `No. El ${long}, Todos los Santos, no es festivo oficial en Cataluña: la Orden EMT/66/2025 no lo incluye entre los doce festivos del año, y tampoco incluye el lunes 2 de noviembre.`,
        `No. ${long}, All Saints' Day, is not an official holiday in Catalonia: Order EMT/66/2025 leaves it out of the year's twelve holidays, and does not include Monday 2 November either.`,
      ),
      answerNote: [
        nov2.length
          ? L(
              `El dilluns 2 de novembre és feiner a Catalunya, tret dels ${n2} on és festa local: ${placeNames(nov2, "ca")}.`,
              `El lunes 2 de noviembre es laborable en Cataluña, salvo en los ${n2} donde es fiesta local: ${placeNames(nov2, "es")}.`,
              `Monday 2 November is a working day in Catalonia, except in the ${n2} where it is a local holiday: ${placeNames(nov2, "en")}.`,
            )
          : L("El dilluns 2 de novembre és feiner a tot Catalunya.", "El lunes 2 de noviembre es laborable en toda Cataluña.", "Monday 2 November is a working day across Catalonia."),
        L(
          `En altres comunitats sí que és festiu el dilluns 2: el BOE el marca com a dia següent a Tots Sants a ${joinList(MONDAY_NOV2_REGIONS.ca, "ca")}, però no a Catalunya.`,
          `En otras comunidades sí es festivo el lunes 2: el BOE lo marca como día siguiente a Todos los Santos en ${joinList(MONDAY_NOV2_REGIONS.es, "es")}, pero no en Cataluña.`,
          `Elsewhere in Spain Monday 2 November is a holiday: the BOE lists it as the day after All Saints in ${joinList(MONDAY_NOV2_REGIONS.en, "en")}, but not in Catalonia.`,
        ),
      ],
      description: L(
        "No: l'1 de novembre de 2026 cau en diumenge i no és festiu oficial a Catalunya, ni ho és el dilluns 2. Botigues, escoles i festes locals.",
        "No: el 1 de noviembre de 2026 cae en domingo y no es festivo oficial en Cataluña, ni lo es el lunes 2. Tiendas, escuelas y fiestas locales.",
        "No: 1 November 2026 falls on a Sunday and is not an official holiday in Catalonia, nor is Monday the 2nd. Shops, schools and local holidays.",
      ),
      local: {
        text: (local.length
          ? L(
              `L'1 de novembre és festa local a ${placesPhrase(local, "ca")}: ${placeNames(local, "ca")}.`,
              `El 1 de noviembre es fiesta local en ${placesPhrase(local, "es")}: ${placeNames(local, "es")}.`,
              `1 November is a local holiday in ${placesPhrase(local, "en")}: ${placeNames(local, "en")}.`,
            )
          : L(
              "L'1 de novembre no és festa local a cap municipi (Ordre EMT/208/2025 i Ordre EMT/3/2026).",
              "El 1 de noviembre no es fiesta local en ningún municipio (Orden EMT/208/2025 y Orden EMT/3/2026).",
              "1 November is not a local holiday anywhere (Order EMT/208/2025 and Order EMT/3/2026).",
            )) +
          (nov2.length
            ? L(
                ` L'endemà, dilluns 2 de novembre, ho és a ${n2}:`,
                ` Al día siguiente, lunes 2 de noviembre, lo es en ${n2}:`,
                ` The next day, Monday 2 November, is one in ${n2}:`,
              )
            : ""),
        places: nov2,
      },
      sections: [
        {
          title: L("Botigues", "Tiendas", "Shops"),
          paragraphs: [
            L(
              `És diumenge i l'1 de novembre no és cap dels vuit dies d'obertura del calendari general (Ordre EMT/77/2025): les botigues amb horari general no poden obrir${open.length ? `, tret de les de ${where}, ${open.length === 1 ? "que l'ha triat" : "municipis que l'han triat"} com un dels seus deu dies (Resolució EMT/4342/2025)` : ""}. Poden obrir els establiments que la llei deixa fora d'aquest horari, com fleques, pastisseries, botigues de conveniència, floristeries o farmàcies (Llei 18/2017, article 37).`,
              `Es domingo y el 1 de noviembre no es ninguno de los ocho días de apertura del calendario general (Orden EMT/77/2025): las tiendas con horario general no pueden abrir${open.length ? `, salvo en ${where}, que ${open.length === 1 ? "lo ha" : "lo han"} elegido como uno de sus diez días (Resolución EMT/4342/2025)` : ""}. Pueden abrir los establecimientos que la ley deja fuera de ese horario, como panaderías, pastelerías, tiendas de conveniencia, floristerías o farmacias (Ley 18/2017, artículo 37).`,
              `It is a Sunday and 1 November is not one of the eight opening days of the general calendar (Order EMT/77/2025), so shops on the general timetable may not open${open.length ? `, except in ${where}, which chose it as one of ${open.length === 1 ? "its" : "their"} ten days (Resolution EMT/4342/2025)` : ""}. Businesses the law leaves outside that timetable may open, such as bakeries, pastry shops, convenience stores, florists and pharmacies (Llei 18/2017, article 37).`,
            ),
            nov2.length
              ? L(
                  `El dilluns 2 de novembre és feiner i les botigues obren amb el seu horari habitual. ${nov2Shops.length ? "" : `A ${placeNames(nov2, "ca")}, on és festa local, no és dia d'obertura comercial.`}`.trim(),
                  `El lunes 2 de noviembre es laborable y las tiendas abren con su horario habitual. ${nov2Shops.length ? "" : `En ${placeNames(nov2, "es")}, donde es fiesta local, no es día de apertura comercial.`}`.trim(),
                  `Monday 2 November is a working day and shops keep their usual hours. ${nov2Shops.length ? "" : `In ${placeNames(nov2, "en")}, where it is a local holiday, it is not a shop opening day.`}`.trim(),
                )
              : L(
                  "El dilluns 2 de novembre és feiner i les botigues obren amb el seu horari habitual.",
                  "El lunes 2 de noviembre es laborable y las tiendas abren con su horario habitual.",
                  "Monday 2 November is a working day and shops keep their usual hours.",
                ),
          ],
        },
        {
          title: L("Escoles", "Escuelas", "Schools"),
          paragraphs: [
            L(
              "L'1 de novembre és diumenge. El dilluns 2 no és festiu escolar a tot Catalunya, però sí als municipis on és festa local; a més, cada escola tria quatre dies de lliure disposició i en pot fer servir un aquell dilluns: mira el calendari del teu centre (Ordre EDF/66/2026).",
              "El 1 de noviembre es domingo. El lunes 2 no es festivo escolar en toda Cataluña, pero sí en los municipios donde es fiesta local; además, cada escuela elige cuatro días de libre disposición y puede usar uno ese lunes: mira el calendario de tu centro (Orden EDF/66/2026).",
              "1 November is a Sunday. Monday the 2nd is not a school holiday across Catalonia, but it is wherever it is a local holiday; each school also picks four days of its own and may use one on that Monday: check your school's calendar (Order EDF/66/2026).",
            ),
          ],
        },
        {
          title: L("Transport", "Transporte", "Getting around"),
          paragraphs: [
            L(
              "Per saber l'horari del metro de Barcelona la nit del dissabte 31 d'octubre i el diumenge, mira la guia d'horaris del metro.",
              "Para saber el horario del metro de Barcelona la noche del sábado 31 de octubre y el domingo, mira la guía de horarios del metro.",
              "For the Barcelona metro's hours on the night of Saturday 31 October and on Sunday, see the metro hours guide.",
            ),
          ],
        },
      ],
      guides: ["castanyada", "shops", "holidayToday", "workCalendar", "school", "metroHours"],
    };
  }

  if (iso === NOV11 || iso === NOV30 || iso === DEC24 || iso === DEC31) {
    const n = placesPhrase(local, locale);
    const day = DAY_NAME[iso]![locale];
    const wd = weekdayName(iso, locale);
    const christmas = iso === DEC24 || iso === DEC31;
    // Few places: named in the answer. Christmas week: "only", as the
    // descriptions say; November: "it is a local holiday in…".
    const few = local.length <= 4;
    const only = few || christmas;
    const listed = (lang: DateLocale) => (few ? `: ${placeNames(local, lang)}` : "");
    const answerLocal = L(
      only ? `Només és festa local a ${n}${listed("ca")}.` : `Sí que és festa local a ${n}.`,
      only ? `Solo es fiesta local en ${n}${listed("es")}.` : `Sí es fiesta local en ${n}.`,
      only ? `It is a local holiday only in ${n}${listed("en")}.` : `It is a local holiday in ${n}.`,
    );
    const answerNote: string[] =
      iso === DEC24
        ? [
            L(
              "L'endemà, divendres 25, Nadal, és festiu a tot Catalunya, i el dissabte 26, Sant Esteve, també ho és, excepte a l'Aran (Ordre EMT/66/2025).",
              "Al día siguiente, viernes 25, Navidad, es festivo en toda Cataluña, y el sábado 26, San Esteban, también lo es, excepto en Arán (Orden EMT/66/2025).",
              "The next day, Friday 25 December, Christmas Day, is a holiday across Catalonia, and Saturday 26 December, Saint Stephen's Day, is too, except in Aran (Order EMT/66/2025).",
            ),
          ]
        : iso === DEC31
          ? [
              L(
                "L'endemà, divendres 1 de gener de 2027, Cap d'Any, és festiu a tot Catalunya (Ordre EMT/52/2026).",
                "Al día siguiente, viernes 1 de enero de 2027, Año Nuevo, es festivo en toda Cataluña (Orden EMT/52/2026).",
                "The next day, Friday 1 January 2027, New Year's Day, is a holiday across Catalonia (Order EMT/52/2026).",
              ),
            ]
          : [];
    const descriptions: Record<string, Record<DateLocale, string>> = {
      [NOV11]: {
        ca: `No: l'11 de novembre de 2026 és feiner a Catalunya, però és festa local a ${placesPhrase(local, "ca")}. La llista, botigues i escoles.`,
        es: `No: el 11 de noviembre de 2026 es laborable en Cataluña, pero es fiesta local en ${placesPhrase(local, "es")}. La lista, tiendas y escuelas.`,
        en: `No: 11 November 2026 is a working day in Catalonia, but a local holiday in ${placesPhrase(local, "en")}. The list, shops and schools.`,
      },
      [NOV30]: {
        ca: `No: el 30 de novembre de 2026, Sant Andreu, és feiner a Catalunya, però és festa local a ${placesPhrase(local, "ca")}. La llista i botigues.`,
        es: `No: el 30 de noviembre de 2026, San Andrés, es laborable en Cataluña, pero es fiesta local en ${placesPhrase(local, "es")}. La lista y tiendas.`,
        en: `No: 30 November 2026, Saint Andrew's Day, is a working day in Catalonia, but a local holiday in ${placesPhrase(local, "en")}. The list and shops.`,
      },
      [DEC24]: {
        ca: `No: el 24 de desembre de 2026 és feiner a Catalunya; només és festa local a ${placesPhrase(local, "ca")}. Botigues, escoles i el metro.`,
        es: `No: el 24 de diciembre de 2026 es laborable en Cataluña; solo es fiesta local en ${placesPhrase(local, "es")}. Tiendas, escuelas y el metro.`,
        en: `No: 24 December 2026 is a working day in Catalonia; it is a local holiday in only ${placesPhrase(local, "en")}. Shops, schools, the metro.`,
      },
      [DEC31]: {
        ca: `No: el 31 de desembre de 2026 és feiner a Catalunya; només és festa local a ${placesPhrase(local, "ca")}. Botigues, escoles i Cap d'Any.`,
        es: `No: el 31 de diciembre de 2026 es laborable en Cataluña; solo es fiesta local en ${placesPhrase(local, "es")}. Tiendas, escuelas y Nochevieja.`,
        en: `No: 31 December 2026 is a working day in Catalonia; it is a local holiday in only ${placesPhrase(local, "en")}. Shops, schools, New Year's Eve.`,
      },
    };
    const sections: DateSection[] = [
      { title: L("Botigues", "Tiendas", "Shops"), paragraphs: [shopsWorkingDay(iso, shopsOpenOn(iso))] },
      { title: L("Escoles", "Escuelas", "Schools"), paragraphs: [christmas ? schoolChristmas : schoolWorkingDay(wd)] },
    ];
    if (christmas) {
      sections.push({
        title: L("Transport", "Transporte", "Getting around"),
        paragraphs: [
          iso === DEC24
            ? L(
                "Per saber a quina hora tanca el metro de Barcelona la Nit de Nadal, mira la guia d'horaris del metro.",
                "Para saber a qué hora cierra el metro de Barcelona en Nochebuena, mira la guía de horarios del metro.",
                "For when the Barcelona metro closes on Christmas Eve, see the metro hours guide.",
              )
            : L(
                "Per saber com funciona el metro de Barcelona la nit de Cap d'Any, mira la guia d'horaris del metro; per a la nit a Barcelona, la guia de Cap d'Any.",
                "Para saber cómo funciona el metro de Barcelona en Nochevieja, mira la guía de horarios del metro; para la noche en Barcelona, la guía de Nochevieja.",
                "For how the Barcelona metro runs on New Year's Eve, see the metro hours guide; for the night itself, the New Year's Eve guide.",
              ),
        ],
      });
    }
    const guides: GuideKey[] =
      iso === DEC24
        ? ["christmasTraditions", "christmasBarcelona", "shops", "metroHours", "school", "workCalendar"]
        : iso === DEC31
          ? ["newYear", "shops", "metroHours", "school", "workCalendar", "holidayToday"]
          : ["holidayToday", "workCalendar", "localHolidays", "shops", "school"];
    return {
      holiday: false,
      answer: L(
        `No. El ${long}, ${day}, és un dia feiner a Catalunya: no és cap dels dotze festius de l'Ordre EMT/66/2025. ${answerLocal}`,
        `No. El ${long}, ${day}, es laborable en Cataluña: no es ninguno de los doce festivos de la Orden EMT/66/2025. ${answerLocal}`,
        `No. ${long}, ${day}, is a working day in Catalonia: it is not one of the twelve holidays in Order EMT/66/2025. ${answerLocal}`,
      ),
      answerNote,
      notice:
        iso === NOV11
          ? {
              before: L("Aquest dia també hi ha convocada una vaga general: què funciona i què no, a la ", "Ese día también hay convocada una huelga general: qué funciona y qué no, en la ", "A general strike has also been called for that day: what runs and what does not is on our "),
              label: L("pàgina de vagues", "página de huelgas", "strikes page"),
              href: GUIDES.strikes[locale],
              after: ".",
            }
          : undefined,
      description: descriptions[iso]![locale],
      local: {
        text: L(
          `El ${weekdayDayMonth(iso, "ca")} és festa local a ${n} (Ordre EMT/208/2025 i Ordre EMT/3/2026):`,
          `El ${weekdayDayMonth(iso, "es")} es fiesta local en ${n} (Orden EMT/208/2025 y Orden EMT/3/2026):`,
          `${capitalize(weekdayDayMonth(iso, "en"))} is a local holiday in ${n} (Order EMT/208/2025 and Order EMT/3/2026):`,
        ),
        places: local,
      },
      sections,
      guides,
    };
  }

  if (iso === DEC7) {
    const n = placesPhrase(local, locale);
    const sb = municipalities().filter((m) => m.local.includes(iso) && m.shops.includes(iso)).map((m) => m.name);
    return {
      holiday: false,
      answer: L(
        `No. El ${long} és un dia feiner a Catalunya: dels festius del desembre, només ho són el 8, el 25 i el 26 (Ordre EMT/66/2025). Sí que és festa local a ${n}.`,
        `No. El ${long} es laborable en Cataluña: de los festivos de diciembre, solo lo son el 8, el 25 y el 26 (Orden EMT/66/2025). Sí es fiesta local en ${n}.`,
        `No. ${long} is a working day in Catalonia: the only December holidays are the 8th, 25th and 26th (Order EMT/66/2025). It is a local holiday in ${n}.`,
      ),
      answerNote: [
        L(
          `En altres comunitats sí que és festiu: el BOE el marca com a dilluns següent al Dia de la Constitució a ${joinList(MONDAY_7_REGIONS.ca, "ca")}, però no a Catalunya.`,
          `En otras comunidades sí es festivo: el BOE lo marca como lunes siguiente al Día de la Constitución en ${joinList(MONDAY_7_REGIONS.es, "es")}, pero no en Cataluña.`,
          `It is a holiday elsewhere in Spain: the BOE lists it as the Monday after Constitution Day in ${joinList(MONDAY_7_REGIONS.en, "en")}, but not in Catalonia.`,
        ),
      ],
      description: L(
        `No: el 7 de desembre de 2026 és feiner a Catalunya. És festa local a ${n}: la llista, botigues, escoles i el pont del 8.`,
        `No: el 7 de diciembre de 2026 es laborable en Cataluña. Es fiesta local en ${n}: la lista, tiendas, escuelas y el puente del 8.`,
        `No: 7 December 2026 is a working day in Catalonia, but a local holiday in ${n}. The list, shops, schools and the 8 December holiday.`,
      ),
      local: {
        text: L(
          `El dilluns 7 de desembre és festa local a ${n} (Ordre EMT/208/2025 i Ordre EMT/3/2026):`,
          `El lunes 7 de diciembre es fiesta local en ${n} (Orden EMT/208/2025 y Orden EMT/3/2026):`,
          `Monday 7 December is a local holiday in ${n} (Order EMT/208/2025 and Order EMT/3/2026):`,
        ),
        places: local,
      },
      sections: [
        {
          title: L("Botigues", "Tiendas", "Shops"),
          paragraphs: [
            L(
              `És un dia feiner: les botigues obren amb el seu horari habitual. Als municipis on és festa local, només hi poden obrir si el 7 de desembre és un dels seus deu dies d'obertura comercial${sb.length ? `, com passa ${sb.length === 1 ? "a" : "a"} ${names(sb)}` : ""} (Resolució EMT/4342/2025).`,
              `Es laborable: las tiendas abren con su horario habitual. En los municipios donde es fiesta local, solo pueden abrir si el 7 de diciembre es uno de sus diez días de apertura comercial${sb.length ? `, como ocurre en ${names(sb)}` : ""} (Resolución EMT/4342/2025).`,
              `It is a working day, so shops keep their usual hours. Where it is a local holiday, shops may open only if 7 December is one of that town's ten opening days${sb.length ? `, as it is in ${names(sb)}` : ""} (Resolution EMT/4342/2025).`,
            ),
          ],
        },
        {
          title: L("Escoles", "Escuelas", "Schools"),
          paragraphs: [
            L(
              `No és festiu escolar a tot Catalunya, però sí als municipis on és festa local. A més, cada escola tria quatre dies de lliure disposició i en pot fer servir un aquest dilluns: mira el calendari del teu centre (Ordre EDF/66/2026).`,
              `No es festivo escolar en toda Cataluña, pero sí en los municipios donde es fiesta local. Además, cada escuela elige cuatro días de libre disposición y puede usar uno este lunes: mira el calendario de tu centro (Orden EDF/66/2026).`,
              `It is not a school holiday across Catalonia, but it is wherever it is a local holiday. Each school also picks four days of its own and may use one on this Monday: check your school's calendar (Order EDF/66/2026).`,
            ),
          ],
        },
        {
          title: L("Transport", "Transporte", "Getting around"),
          paragraphs: [
            L(
              `La nit del 7 al 8 és vigília de festiu. ${metroPointer}`,
              `La noche del 7 al 8 es víspera de festivo. ${metroPointer}`,
              `The night of the 7th is the eve of a public holiday. ${metroPointer}`,
            ),
          ],
        },
      ],
      guides: ["decemberBridge", "shops", "school", "metroHours", "localHolidays", "workCalendar"],
    };
  }

  if (iso === "2026-12-08") {
    const eve = SNAPSHOT.localByDate[DEC7] ?? [];
    const closed = shopsClosedAmongListed(iso);
    return {
      holiday: true,
      answer: L(
        `Sí. El ${long}, ${name}, és festiu a tot Catalunya (Ordre EMT/66/2025) i a la resta d'Espanya.`,
        `Sí. El ${long}, ${name}, es festivo en toda Cataluña (Orden EMT/66/2025) y en el resto de España.`,
        `Yes. ${long}, the ${name}, is a public holiday across Catalonia (Order EMT/66/2025) and the rest of Spain.`,
      ),
      answerNote: [
        L(
          `El dia abans, el dilluns 7, és feiner a Catalunya, tret dels ${placesPhrase(eve, "ca")} que hi tenen festa local.`,
          `El día antes, el lunes 7, es laborable en Cataluña, salvo en los ${placesPhrase(eve, "es")} que tienen fiesta local.`,
          `The day before, Monday 7 December, is a working day in Catalonia except in the ${placesPhrase(eve, "en")} with a local holiday.`,
        ),
      ],
      description: L(
        `Sí: el dimarts 8 de desembre de 2026, la Immaculada, és festiu a tot Catalunya. Quines botigues poden obrir, escoles i el dilluns 7.`,
        `Sí: el martes 8 de diciembre de 2026, la Inmaculada, es festivo en toda Cataluña. Qué tiendas pueden abrir, escuelas y el lunes 7.`,
        `Yes: Tuesday 8 December 2026 is a public holiday across Catalonia. Which shops may open, schools, and Monday the 7th.`,
      ),
      local: {
        text: L(
          "Cap municipi hi afegeix festa local: ja és festiu a tot arreu.",
          "Ningún municipio añade fiesta local: ya es festivo en todas partes.",
          "No town adds a local holiday: it is already a holiday everywhere.",
        ),
        places: [],
      },
      sections: [
        {
          title: L("Botigues", "Tiendas", "Shops"),
          paragraphs: [
            L(
              `Les botigues poden obrir a la majoria de municipis: el 8 de desembre és un dels dos dies municipals per defecte (Ordre EMT/77/2025, article 6), i Barcelona també l'ha triat (Resolució EMT/4342/2025). Entre els ${municipalities().length} municipis d'aquest recull, no és dia d'obertura a ${names(closed)}.`,
              `Las tiendas pueden abrir en la mayoría de municipios: el 8 de diciembre es uno de los dos días municipales por defecto (Orden EMT/77/2025, artículo 6), y Barcelona también lo ha elegido (Resolución EMT/4342/2025). Entre los ${municipalities().length} municipios de esta guía, no es día de apertura en ${names(closed)}.`,
              `Shops may open in most towns: 8 December is one of the two default municipal opening days (Order EMT/77/2025, article 6), and Barcelona has chosen it too (Resolution EMT/4342/2025). Among the ${municipalities().length} towns covered here, it is not an opening day in ${names(closed)}.`,
            ),
            L(
              "Poder obrir no vol dir que obrin: cada botiga decideix.",
              "Poder abrir no quiere decir que abran: cada tienda decide.",
              "Being allowed to open does not mean every shop will.",
            ),
          ],
        },
        {
          title: L("Escoles", "Escuelas", "Schools"),
          paragraphs: [
            L(
              "És festiu laboral i, per tant, no hi ha classe (Ordre EDF/66/2026).",
              "Es festivo laboral y, por tanto, no hay clase (Orden EDF/66/2026).",
              "It is a public holiday, so there is no school (Order EDF/66/2026).",
            ),
          ],
        },
        { title: L("Transport", "Transporte", "Getting around"), paragraphs: [metroPointer] },
      ],
      guides: ["decemberBridge", "shops", "metroHours", "holidayToday", "workCalendar"],
    };
  }

  if (iso === "2026-12-25" || iso === "2026-12-26") {
    const isXmas = iso === "2026-12-25";
    const eve = SNAPSHOT.localByDate[DEC24] ?? [];
    const swap = aranSwap(2026);
    const closed27 = shopsClosedAmongListed("2026-12-27");
    const next27 = L(
      `El pròxim dia en què les botigues poden obrir és el diumenge 27 de desembre, que és al calendari general del 2026 (Ordre EMT/77/2025)${closed27.length ? `; entre els ${municipalities().length} municipis d'aquest recull, no ho és a ${names(closed27)}` : ""}.`,
      `El próximo día en que las tiendas pueden abrir es el domingo 27 de diciembre, que está en el calendario general de 2026 (Orden EMT/77/2025)${closed27.length ? `; entre los ${municipalities().length} municipios de esta guía, no lo es en ${names(closed27)}` : ""}.`,
      `The next day shops may open is Sunday 27 December, which is in the general 2026 calendar (Order EMT/77/2025)${closed27.length ? `; among the ${municipalities().length} towns covered here it is not an opening day in ${names(closed27)}` : ""}.`,
    );
    return {
      holiday: true,
      answer: isXmas
        ? L(
            `Sí. El ${long}, ${name}, és festiu a tot Catalunya (Ordre EMT/66/2025) i a la resta d'Espanya.`,
            `Sí. El ${long}, ${name}, es festivo en toda Cataluña (Orden EMT/66/2025) y en el resto de España.`,
            `Yes. ${long}, ${name}, is a public holiday across Catalonia (Order EMT/66/2025) and the rest of Spain.`,
          )
        : L(
            `Sí. El ${long}, ${name}, és festiu a Catalunya (Ordre EMT/66/2025), excepte a l'Aran, on el substitueix la ${swap?.name.ca} del ${dayMonth(swap?.date ?? "", "ca")}.`,
            `Sí. El ${long}, ${name}, es festivo en Cataluña (Orden EMT/66/2025), excepto en Arán, donde lo sustituye la ${swap?.name.es} del ${dayMonth(swap?.date ?? "", "es")}.`,
            `Yes. ${long}, ${name}, is a public holiday in Catalonia (Order EMT/66/2025), except in Aran, where the ${swap?.name.en} on ${dayMonth(swap?.date ?? "", "en")} replaces it.`,
          ),
      answerNote: isXmas
        ? [
            L(
              `L'endemà, dissabte 26, Sant Esteve, també és festiu a Catalunya.`,
              `Al día siguiente, sábado 26, San Esteban, también es festivo en Cataluña.`,
              `The next day, Saturday 26 December, Saint Stephen's Day, is also a holiday in Catalonia.`,
            ),
          ]
        : [
            L(
              "No és festiu a tota Espanya: a la taula del BOE per al 2026, el 26 de desembre només és festiu a Catalunya i a les Illes Balears.",
              "No es festivo en toda España: en la tabla del BOE para 2026, el 26 de diciembre solo es festivo en Cataluña y en las Illes Balears.",
              "It is not a holiday across Spain: in the BOE's 2026 table, 26 December is a holiday only in Catalonia and the Balearic Islands.",
            ),
          ],
      description: isXmas
        ? L(
            "Sí: el divendres 25 de desembre de 2026, Nadal, és festiu a tot Catalunya. Botigues tancades, quan tornen a obrir, la Nit de Nadal i escoles.",
            "Sí: el viernes 25 de diciembre de 2026, Navidad, es festivo en toda Cataluña. Tiendas cerradas, cuándo vuelven a abrir, Nochebuena y escuelas.",
            "Yes: Friday 25 December 2026, Christmas Day, is a public holiday across Catalonia. Shops closed, when they reopen, Christmas Eve and schools.",
          )
        : L(
            "Sí: el dissabte 26 de desembre de 2026, Sant Esteve, és festiu a Catalunya (no a l'Aran). Botigues tancades, quan tornen a obrir i escoles.",
            "Sí: el sábado 26 de diciembre de 2026, San Esteban, es festivo en Cataluña (no en Arán). Tiendas cerradas, cuándo vuelven a abrir y escuelas.",
            "Yes: Saturday 26 December 2026, Saint Stephen's Day, is a public holiday in Catalonia (not in Aran). Shops closed, when they reopen, schools.",
          ),
      local: isXmas
        ? {
            text: L(
              `Cap municipi hi afegeix festa local. La vigília, la Nit de Nadal (dijous 24), no és festiu a Catalunya, tret de ${placesPhrase(eve, "ca")} que hi tenen festa local: ${placeNames(eve, "ca")}.`,
              `Ningún municipio añade fiesta local. La víspera, Nochebuena (jueves 24), no es festivo en Cataluña, salvo en ${placesPhrase(eve, "es")} que tienen fiesta local: ${placeNames(eve, "es")}.`,
              `No town adds a local holiday. Christmas Eve (Thursday 24 December) is not a holiday in Catalonia, except in ${placesPhrase(eve, "en")} with a local holiday: ${placeNames(eve, "en")}.`,
            ),
            places: [],
          }
        : {
            text: L(
              "Cap municipi hi afegeix festa local: ja és festiu a tot Catalunya fora de l'Aran.",
              "Ningún municipio añade fiesta local: ya es festivo en toda Cataluña fuera de Arán.",
              "No town adds a local holiday: it is already a holiday everywhere in Catalonia outside Aran.",
            ),
            places: [],
          },
      sections: [
        { title: L("Botigues", "Tiendas", "Shops"), paragraphs: [shopsLaw, next27] },
        { title: L("Escoles", "Escuelas", "Schools"), paragraphs: [schoolChristmas] },
        { title: L("Transport", "Transporte", "Getting around"), paragraphs: [metroPointer] },
      ],
      guides: ["christmasTraditions", "christmasBarcelona", "shops", "metroHours", "workCalendar", "holidayToday"],
    };
  }

  // 1 and 6 January 2027: local days for 2027 are not published yet.
  const isNewYear = iso === "2027-01-01";
  const eve31 = SNAPSHOT.localByDate[DEC31] ?? [];
  const pending = L(
    "Els festius locals del 2027 encara no s'han publicat: l'ordre del 2026 va sortir al DOGC el 17 de desembre de 2025. Quan surti la del 2027, aquí sabràs quins municipis hi afegeixen festa.",
    "Los festivos locales de 2027 todavía no se han publicado: la orden de 2026 salió en el DOGC el 17 de diciembre de 2025. Cuando salga la de 2027, aquí sabrás qué municipios añaden fiesta.",
    "Local holidays for 2027 have not been published yet: the 2026 order appeared in the DOGC (Catalonia's official gazette) on 17 December 2025. Once the 2027 one is out, this page will say which towns add a holiday.",
  );
  return {
    holiday: true,
    answer: L(
      `Sí. El ${long}, ${name}, és festiu a tot Catalunya (Ordre EMT/52/2026).`,
      `Sí. El ${long}, ${name}, es festivo en toda Cataluña (Orden EMT/52/2026).`,
      `Yes. ${long}, ${name}, is a public holiday across Catalonia (Order EMT/52/2026).`,
    ),
    answerNote: isNewYear
      ? [
          L(
            `La vigília, el dijous 31 de desembre de 2026, no és festiu a Catalunya, tret de ${placesPhrase(eve31, "ca")} que hi tenen festa local: ${placeNames(eve31, "ca")}.`,
            `La víspera, el jueves 31 de diciembre de 2026, no es festivo en Cataluña, salvo en ${placesPhrase(eve31, "es")} que tienen fiesta local: ${placeNames(eve31, "es")}.`,
            `New Year's Eve, Thursday 31 December 2026, is not a holiday in Catalonia, except in ${placesPhrase(eve31, "en")} with a local holiday: ${placeNames(eve31, "en")}.`,
          ),
        ]
      : [],
    description: isNewYear
      ? L(
          "Sí: el divendres 1 de gener de 2027, Cap d'Any, és festiu a tot Catalunya. Botigues, la vigília del 31, escoles i els festius locals del 2027.",
          "Sí: el viernes 1 de enero de 2027, Año Nuevo, es festivo en toda Cataluña. Tiendas, la víspera del 31, escuelas y los festivos locales de 2027.",
          "Yes: Friday 1 January 2027, New Year's Day, is a public holiday across Catalonia. Shops, New Year's Eve, schools and 2027 local holidays.",
        )
      : L(
          "Sí: el dimecres 6 de gener de 2027, Reis, és festiu a tot Catalunya. Botigues, quan tornen les classes i els festius locals del 2027.",
          "Sí: el miércoles 6 de enero de 2027, Reyes, es festivo en toda Cataluña. Tiendas, cuándo vuelven las clases y los festivos locales de 2027.",
          "Yes: Wednesday 6 January 2027, Epiphany (Three Kings), is a public holiday across Catalonia. Shops, back to school and 2027 local holidays.",
        ),
    local: { text: pending, places: [] },
    sections: [
      {
        title: L("Botigues", "Tiendas", "Shops"),
        paragraphs: [
          shopsLaw,
          L(
            `El primer diumenge del 2027 en què les botigues poden obrir és el 3 de gener, al calendari general (Ordre EMT/89/2026). Els dos dies de cada municipi per al 2027 encara no s'han publicat; on l'ajuntament no n'hagi triat cap, s'hi aplicaran el 10 de gener i el 5 de desembre (article 5).`,
            `El primer domingo de 2027 en que las tiendas pueden abrir es el 3 de enero, en el calendario general (Orden EMT/89/2026). Los dos días de cada municipio para 2027 todavía no se han publicado; donde el ayuntamiento no haya elegido ninguno, se aplicarán el 10 de enero y el 5 de diciembre (artículo 5).`,
            `The first Sunday of 2027 when shops may open is 3 January, in the general calendar (Order EMT/89/2026). Each town's two extra days for 2027 have not been published yet; where a council chose none, 10 January and 5 December apply (article 5).`,
          ),
        ],
      },
      {
        title: L("Escoles", "Escuelas", "Schools"),
        paragraphs: [
          isNewYear
            ? schoolChristmas
            : L(
                "Les vacances escolars de Nadal duren fins al dijous 7 de gener de 2027, inclòs (Ordre EDF/66/2026).",
                "Las vacaciones escolares de Navidad duran hasta el jueves 7 de enero de 2027, incluido (Orden EDF/66/2026).",
                "School Christmas holidays last until Thursday 7 January 2027, inclusive (Order EDF/66/2026).",
              ),
        ],
      },
      {
        title: L("Transport", "Transporte", "Getting around"),
        paragraphs: [
          isNewYear
            ? L(
                `La nit del 31 de desembre és vigília de festiu. ${metroPointer} Per a la nit de Cap d'Any a Barcelona, mira també la guia de Cap d'Any.`,
                `La noche del 31 de diciembre es víspera de festivo. ${metroPointer} Para la Nochevieja en Barcelona, mira también la guía de Nochevieja.`,
                `The night of 31 December is the eve of a public holiday. ${metroPointer} For New Year's Eve in Barcelona, see also the New Year's Eve guide.`,
              )
            : L(
                `La nit del 5 al 6 és vigília de festiu. ${metroPointer}`,
                `La noche del 5 al 6 es víspera de festivo. ${metroPointer}`,
                `The night of 5 January is the eve of a public holiday. ${metroPointer}`,
              ),
        ],
      },
    ],
    guides: isNewYear
      ? ["newYear", "shops", "metroHours", "workCalendar", "school", "holidayToday"]
      : ["christmasBarcelona", "christmasTraditions", "shops", "school", "workCalendar", "holidayToday"],
  };
}

