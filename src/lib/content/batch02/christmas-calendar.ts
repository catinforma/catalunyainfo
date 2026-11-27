import type { Block } from "@/lib/content/blocks";
import { addDays, aranSubstitutionFor, holidayOn, isAranOnly, shortDate, weekdayIndex } from "@/lib/content/holidays/calendar";
import { SCHOOL_SOURCE, SCHOOL_YEARS } from "@/lib/content/school/calendar";
import type { Locale } from "@/lib/i18n/config";
import { fairsHubPath } from "@/lib/programmatic/christmas-fairs/paths";
import { municipalityBySlug } from "@/lib/programmatic/holidays/data";

import { LIGHTS_TOWNS } from "./christmas-lights-towns";
import { seasonAnchors } from "./christmas-season-links";
import { BRIDGE_DAYS, LOCAL_MONDAY_7, SIBLING_PATHS, runWords } from "./december-bridge";
import { ANNOUNCED_2026, DAYS, dayDate, dayList } from "./festive";
import { GROSSA_DRAW_DATE } from "./grossa";
import { NADAL_DRAW_DATE } from "./loteria-nadal";
import { MARATO } from "./marato";
import { PARADE_DAY, REIS_DAY } from "./reis";
import { b2link, h2, table } from "./shared";
import { DEFAULT_DECEMBER_2026, LAW_CLOSING, WORKING_ASKED } from "./shops-christmas";
import { WINTER_SALES } from "./winter-sales";

/**
 * "Christmas 2026 in Catalonia, day by day" (27 Nov 2026, batch 8M): the
 * dated calendar from 1 December to the end of the school holidays that the
 * Christmas markets guide (`christmas`, for Catalonia) and the Christmas in
 * Barcelona guide (`christmasBarcelona`, for the city) open their hub section
 * with. Each row says what happens or changes that day and links the page that
 * answers it in full.
 *
 * Nothing is typed here twice. Every date is read from the module that owns
 * it and was verified there:
 *  - public holidays and their names: the holiday engine (Ordre EMT/66/2025 for
 *    2026, Ordre EMT/52/2026 for 2027; Aran's swap of 26 December);
 *  - the bridge and Monday 7 December as a local holiday: december-bridge.ts
 *    (BRIDGE_DAYS, LOCAL_MONDAY_7);
 *  - shop-opening days: shops-christmas.ts (DEFAULT_DECEMBER_2026, Ordre
 *    EMT/77/2025 and Resolució EMT/4342/2025; LAW_CLOSING, Llei 18/2017 art.
 *    36.2.d) and Barcelona's own list in the holiday snapshot; the first
 *    opening Sunday of 2027 from winter-sales.ts (Ordre EMT/89/2026, art. 1);
 *  - school holidays: school/calendar.ts (Ordre EDF/66/2026);
 *  - La Marató: marato.ts; Lotería de Navidad: loteria-nadal.ts; La Grossa:
 *    grossa.ts; the parade and Reis: reis.ts; Barcelona's lights and the
 *    towns' switch-ons: festive.ts and christmas-lights-towns.ts;
 *  - the fairs: the caller passes Santa Llúcia (and, for Barcelona, the
 *    Sagrada Família fair) and the fairs family's count, so this module does
 *    not import christmas.ts (which imports it).
 *
 * Re-read on 27 Nov 2026, 02:19 CET (curl + grep / pdftotext), every quote
 * still on the page: Ordre EDF/66/2026 PDF «Nadal: del 22 de desembre de 2026
 * al 7 de gener de 2027, ambdós inclosos»; Ordre EMT/66/2025 PDF «8 de
 * desembre, dimarts», «25 de desembre, divendres», «26 de desembre,
 * dissabte», «Al territori d'Aran, la festa del dia 26 de desembre (Sant
 * Esteve) queda substituïda per la de 17 de juny»; Ordre EMT/52/2026 PDF «1 de
 * gener, divendres», «6 de gener, dimecres»; Ordre EMT/77/2025 PDF «6, 13, 20
 * i 27 de desembre.»; 3Cat's La Marató 2026 page «13 de desembre»; the City
 * Council's note of 9 Nov 2026 «des del 26 de novembre fins al 6 de gener».
 * Not re-read tonight (SELAE answers curl with 403, Loteries de Catalunya's
 * game page is a script shell): the two draw dates, which stay as their own
 * guides verified them.
 *
 * Date guard: tests/christmas-calendar.test.ts fails from CALENDAR_ROLL_BY,
 * when the section has to be rewritten for the next season or taken out.
 */

export type CalendarScope = "catalonia" | "barcelona";

/** The 2026-2027 school year, whose Christmas holidays close the calendar. */
const SCHOOL = SCHOOL_YEARS.find((year) => year.christmas[0] === BRIDGE_DAYS.schoolChristmasFrom);
if (!SCHOOL) throw new Error("christmas-calendar: no school year in Ordre EDF/66/2026 starts its Christmas holidays on BRIDGE_DAYS.schoolChristmasFrom");

/** First and last day the calendar covers: 1 December to the last day of the school holidays. */
export const CALENDAR_SPAN = { from: "2026-12-01", to: SCHOOL.christmas[1] } as const;
/** From this day the section talks about a season that is over: a test fails until it is rewritten or removed. */
export const CALENDAR_ROLL_BY = addDays(CALENDAR_SPAN.to, 2);
/** Back to school after Christmas. */
export const BACK_TO_SCHOOL = addDays(SCHOOL.christmas[1], 1);

const BCN = municipalityBySlug("barcelona");
if (!BCN) throw new Error("christmas-calendar: Barcelona is missing from the holiday snapshot");

/** The days the calendar covers, ISO. */
function windowDays(): string[] {
  const out: string[] = [];
  for (let iso: string = CALENDAR_SPAN.from; iso <= CALENDAR_SPAN.to; iso = addDays(iso, 1)) out.push(iso);
  return out;
}

/** Catalonia-wide public holidays inside the calendar (Aran-only swaps left out). */
export const CALENDAR_HOLIDAYS: readonly string[] = windowDays().filter((iso) => holidayOn(iso) !== null && !isAranOnly(iso));

/** December shop-opening days: the default calendar for Catalonia, Barcelona's own list for the city. */
export function shopDays(scope: CalendarScope): string[] {
  const days = scope === "barcelona" ? BCN!.shops : [...DEFAULT_DECEMBER_2026];
  return days.filter((iso) => iso >= CALENDAR_SPAN.from && iso.startsWith("2026-12"));
}

/** The last Sunday before Christmas Day on which shops may open (20 December 2026). */
export function lastShopSunday(scope: CalendarScope): string {
  const sundays = shopDays(scope).filter((iso) => iso < DAYS.christmas && weekdayIndex(iso) === 0);
  const last = sundays[sundays.length - 1];
  if (!last) throw new Error(`christmas-calendar: no shop Sunday before Christmas (${scope})`);
  return last;
}

/** Barcelona's lights, as the City Council announced them. */
type Lights = typeof ANNOUNCED_2026.lightsSwitchOn;
/** Towns in the lights table with a published 2026 switch-on, and those whose switch-on falls inside the calendar. */
const LIGHTS_DATED = LIGHTS_TOWNS.filter((t) => t.y2026);
const LIGHTS_IN_WINDOW = LIGHTS_DATED.filter((t) => t.y2026!.date >= CALENDAR_SPAN.from && t.y2026!.date <= CALENDAR_SPAN.to);

/** What the caller knows about the fairs (christmas.ts owns these). */
export interface CalendarFairs {
  santaLlucia: { from: string; to: string };
  /** Barcelona only: the Sagrada Família fair. */
  sagrada?: { start: string; end: string };
  /** Fairs with an official 2026 date, and their towns (the fairs family's count). */
  count: number;
  towns: number;
}

interface Entry {
  from: string;
  to?: string;
  text: string;
}

const cap = (text: string) => `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
const T = <V,>(locale: Locale, value: Record<Locale, V>): V => value[locale];
/** "dimarts 22 de desembre" / "martes 22 de diciembre" / "Tuesday 22 December". */
const day = (iso: string, locale: Locale) => dayDate(iso, locale, false);
const path = (locale: Locale, p: string) => `/${locale}/${p}/`;
const one = (locale: Locale, key: Parameters<typeof seasonAnchors>[1][number]) => seasonAnchors(locale, [key])[0]!;

/** "Dimarts 22 de desembre", or "Del dissabte 5 al dimarts 8 de desembre" (with the second year when it crosses New Year). */
export function calendarDayLabel(from: string, to: string | undefined, locale: Locale): string {
  if (!to || to === from) return cap(day(from, locale));
  const words = runWords({ from, to, days: 0 }, locale);
  const year = to.slice(0, 4) !== from.slice(0, 4) ? (locale === "en" ? ` ${to.slice(0, 4)}` : ` de ${to.slice(0, 4)}`) : "";
  return `${cap(words)}${year}`;
}

function ordinal(n: number, locale: Locale): string {
  if (locale === "ca") return `${n}a`;
  if (locale === "es") return `${n}.ª`;
  const rem = n % 100;
  const suffix = rem >= 11 && rem <= 13 ? "th" : ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th";
  return `${n}${suffix}`;
}

function holidayName(iso: string, locale: Locale): string {
  const holiday = holidayOn(iso);
  if (!holiday) throw new Error(`christmas-calendar: ${iso} is not a public holiday`);
  return holiday.name[locale];
}

const EXEMPT: Record<Locale, string> = {
  ca: "les botigues amb horari general tanquen per llei, llevat de les exemptes (forns, botigues de conveniència, botigues petites...)",
  es: "las tiendas con horario general cierran por ley, salvo las exentas (panaderías, tiendas de conveniencia, tiendas pequeñas...)",
  en: "shops on general hours must close by law, except exempt ones (bakeries, convenience stores, small shops...)",
};

function entries(locale: Locale, scope: CalendarScope, fairs: CalendarFairs, lights: Lights): Entry[] {
  const out: Entry[] = [];
  const bcn = scope === "barcelona";

  // Lights: Barcelona's run, then any town that switches on inside the calendar.
  if (lights && lights.until) {
    const towns = bcn
      ? T(locale, { ca: " Carrers i horaris de cada nit:", es: " Calles y horario de cada noche:", en: " Streets and nightly hours:" })
      : T(locale, {
          ca: ` ${LIGHTS_DATED.length} municipis més tenen data del 2026:`,
          es: ` Otros ${LIGHTS_DATED.length} municipios tienen fecha de 2026:`,
          en: ` ${LIGHTS_DATED.length} other towns have a 2026 date:`,
        });
    out.push({
      from: lights.date,
      to: lights.until,
      text: T(locale, {
        ca: `**Llums de Nadal.** Barcelona els va encendre el ${day(lights.date, "ca")} i estaran encesos fins al ${day(lights.until!, "ca")}, segons l'Ajuntament.${towns} ${one("ca", "christmasLights")}.`,
        es: `**Luces de Navidad.** Barcelona las encendió el ${day(lights.date, "es")} y estarán encendidas hasta el ${day(lights.until!, "es")}, según el Ayuntamiento.${towns} ${one("es", "christmasLights")}.`,
        en: `**Christmas lights.** Barcelona's have been on since ${day(lights.date, "en")} and stay on until ${day(lights.until!, "en")}, according to the City Council.${towns} ${one("en", "christmasLights")}.`,
      }),
    });
  }
  if (!bcn) {
    for (const town of LIGHTS_IN_WINDOW) {
      const s = town.y2026!;
      const at = s.time ? T(locale, { ca: ` a les ${s.time}`, es: ` a las ${s.time}`, en: ` at ${s.time}` }) : "";
      const place = s.place ? T(locale, { ca: ` (${s.place})`, es: ` (${s.place})`, en: ` (${s.place})` }) : "";
      out.push({
        from: s.date,
        text: T(locale, {
          ca: `**Encesa de llums a ${town.name}**${at}${place}, segons l'ajuntament. Les altres enceses: ${b2link("christmasLights", "ca", "llums de Nadal a Catalunya")}.`,
          es: `**Encendido de luces en ${town.name}**${at}${place}, según el ayuntamiento. Los demás encendidos: ${b2link("christmasLights", "es", "luces de Navidad en Cataluña")}.`,
          en: `**${town.name} switches on its Christmas lights**${at}${place}, according to the council. The other switch-ons: ${b2link("christmasLights", "en", "Christmas lights in Catalonia")}.`,
        }),
      });
    }
  }

  // The fairs.
  const sl = fairs.santaLlucia;
  if (bcn) {
    const sf = fairs.sagrada;
    const sfText = sf
      ? T(locale, {
          ca: `, i la de la **Sagrada Família**, ${runWords({ from: sf.start, to: sf.end, days: 0 }, "ca")}`,
          es: `, y la de la **Sagrada Família**, ${runWords({ from: sf.start, to: sf.end, days: 0 }, "es")}`,
          en: `, and the **Sagrada Família** fair, ${runWords({ from: sf.start, to: sf.end, days: 0 }, "en")}`,
        })
      : "";
    out.push({
      from: sl.from,
      to: sl.to,
      text: T(locale, {
        ca: `**Fira de Santa Llúcia**, davant de la Catedral${sfText}. Totes dues amb horaris: ${one("ca", "christmas")}.`,
        es: `**Fira de Santa Llúcia**, frente a la Catedral${sfText}. Las dos con horarios: ${one("es", "christmas")}.`,
        en: `**Fira de Santa Llúcia**, in front of the Cathedral${sfText}. Both with opening hours: ${one("en", "christmas")}.`,
      }),
    });
  } else {
    out.push({
      from: sl.from,
      to: sl.to,
      text: T(locale, {
        ca: `**Fira de Santa Llúcia**, davant de la Catedral de Barcelona. Amb data oficial del 2026 hi ha ${fairs.count} fires de Nadal a ${fairs.towns} municipis: [fires de Nadal 2026 per data i municipi](${fairsHubPath("ca")}).`,
        es: `**Fira de Santa Llúcia**, frente a la Catedral de Barcelona. Con fecha oficial de 2026 hay ${fairs.count} ferias de Navidad en ${fairs.towns} municipios: [ferias de Navidad 2026 por fecha y municipio](${fairsHubPath("es")}).`,
        en: `**Fira de Santa Llúcia**, in front of Barcelona Cathedral. ${fairs.count} Christmas fairs in ${fairs.towns} towns have an official 2026 date: [Christmas markets 2026 by date and town](${fairsHubPath("en")}).`,
      }),
    });
  }

  // The December bridge.
  const imm = BRIDGE_DAYS.immaculada;
  const sunday6IsHoliday = holidayOn(BRIDGE_DAYS.constitution) !== null;
  if (sunday6IsHoliday) throw new Error("christmas-calendar: 6 December 2026 is a holiday after all; rewrite the bridge row");
  const mondayInBcn = BCN!.local.includes(BRIDGE_DAYS.monday);
  const monday = bcn
    ? T(locale, {
        ca: mondayInBcn ? "a Barcelona el dilluns 7 és festiu local" : "a Barcelona el dilluns 7 és feiner",
        es: mondayInBcn ? "en Barcelona el lunes 7 es festivo local" : "en Barcelona el lunes 7 es laborable",
        en: mondayInBcn ? "in Barcelona Monday 7th is a local holiday" : "in Barcelona Monday 7th is a working day",
      })
    : T(locale, {
        ca: `el dilluns 7 només és festiu local a ${LOCAL_MONDAY_7.municipalities} municipis`,
        es: `el lunes 7 solo es festivo local en ${LOCAL_MONDAY_7.municipalities} municipios`,
        en: `Monday 7th is a local holiday in only ${LOCAL_MONDAY_7.municipalities} towns`,
      });
  out.push({
    from: BRIDGE_DAYS.saturday,
    to: imm,
    text: T(locale, {
      ca: `**Pont de desembre.** L'únic festiu a tot Catalunya és el ${day(imm, "ca")} (${holidayName(imm, "ca")}); el diumenge 6 no és festiu a Catalunya i ${monday}: ${b2link("decemberBridge", "ca", "pont de desembre 2026")}. Si hi ha escola el dilluns 7 ho decideix cada centre: ${b2link("schoolFreeDays", "ca", "dies de lliure disposició de les escoles")}.`,
      es: `**Puente de diciembre.** El único festivo en toda Cataluña es el ${day(imm, "es")} (${holidayName(imm, "es")}); el domingo 6 no es festivo en Cataluña y ${monday}: ${b2link("decemberBridge", "es", "puente de diciembre 2026")}. Si hay colegio el lunes 7 lo decide cada centro: ${b2link("schoolFreeDays", "es", "días de libre disposición de los colegios")}.`,
      en: `**December long weekend.** The only Catalonia-wide holiday is ${day(imm, "en")} (${holidayName(imm, "en")}); Sunday 6th is not a holiday in Catalonia and ${monday}: ${b2link("decemberBridge", "en", "December 2026 long weekend")}. Whether there is school on Monday 7th is up to each school: ${b2link("schoolFreeDays", "en", "Catalonia school free days")}.`,
    }),
  });

  // La Marató.
  out.push({
    from: MARATO.date,
    text: T(locale, {
      ca: `**La Marató de 3Cat**, la ${ordinal(MARATO.edition, "ca")} edició, a TV3 i Catalunya Ràdio, per les malalties neurodegeneratives i neuromusculars: ${b2link("marato", "ca", "La Marató 2026")}.`,
      es: `**La Marató de 3Cat**, la ${ordinal(MARATO.edition, "es")} edición, en TV3 y Catalunya Ràdio, para las enfermedades neurodegenerativas y neuromusculares: ${b2link("marato", "es", "La Marató 2026")}.`,
      en: `**La Marató de 3Cat**, the ${ordinal(MARATO.edition, "en")} edition of the TV3 and Catalunya Ràdio telethon, for neurodegenerative and neuromuscular diseases: ${b2link("marato", "en", "La Marató 2026")}.`,
    }),
  });

  // The last shop Sunday before Christmas, with the month's other opening days.
  const last = lastShopSunday(scope);
  const others = dayList(shopDays(scope).filter((iso) => iso !== last), locale);
  const where = bcn
    ? T(locale, { ca: "a Barcelona", es: "en Barcelona", en: "in Barcelona" })
    : T(locale, { ca: "als municipis que no n'han triat d'altres", es: "en los municipios que no han elegido otros", en: "in towns that kept the default days" });
  out.push({
    from: last,
    text: T(locale, {
      ca: `**Últim diumenge abans de Nadal amb botigues obertes** ${where}; els altres dies d'obertura del desembre són ${others}. Els de cada municipi: ${one("ca", "shops")}.`,
      es: `**Último domingo antes de Navidad con tiendas abiertas** ${where}; los otros días de apertura de diciembre son ${others}. Los de cada municipio: ${one("es", "shops")}.`,
      en: `**Last Sunday before Christmas with shops open** ${where}; the other December opening days are ${others}. Every town's days: ${one("en", "shops")}.`,
    }),
  });

  // 22 December: the Christmas lottery, and the school holidays as one run.
  out.push({
    from: NADAL_DRAW_DATE,
    text: T(locale, {
      ca: `**Sorteig de la Loteria de Nadal**, el Gordo: ${b2link("loteriaNadal", "ca", "Loteria de Nadal 2026")}.`,
      es: `**Sorteo de la Lotería de Navidad**, el Gordo: ${b2link("loteriaNadal", "es", "Lotería de Navidad 2026")}.`,
      en: `**Spanish Christmas lottery draw**, El Gordo: ${b2link("loteriaNadal", "en", "Spanish Christmas lottery 2026")}.`,
    }),
  });
  out.push({
    from: SCHOOL!.christmas[0],
    to: SCHOOL!.christmas[1],
    text: T(locale, {
      ca: `**Vacances escolars de Nadal**, tots dos dies inclosos, segons l'[Ordre EDF/66/2026](${SCHOOL_SOURCE.url}); es torna a classe el ${day(BACK_TO_SCHOOL, "ca")}: [calendari escolar 2026-2027](${path("ca", SIBLING_PATHS.school.ca)}).`,
      es: `**Vacaciones escolares de Navidad**, ambos días incluidos, según la [Orden EDF/66/2026](${SCHOOL_SOURCE.url}); se vuelve a clase el ${day(BACK_TO_SCHOOL, "es")}: [calendario escolar 2026-2027](${path("es", SIBLING_PATHS.school.es)}).`,
      en: `**School Christmas holidays**, both days included, under [Ordre EDF/66/2026](${SCHOOL_SOURCE.url}); classes resume on ${day(BACK_TO_SCHOOL, "en")}: [Catalonia school calendar 2026-2027](${path("en", SIBLING_PATHS.school.en)}).`,
    }),
  });

  // 24 December.
  out.push({
    from: DAYS.christmasEve,
    text: T(locale, {
      ca: `**Nit de Nadal**: dia feiner, no és festiu. Metro, bus i trens: ${b2link("christmasTransport", "ca", "horaris de transport per Nadal i Cap d'Any")}.`,
      es: `**Nochebuena**: día laborable, no es festivo. Metro, bus y trenes: ${b2link("christmasTransport", "es", "horarios de transporte en Navidad y Nochevieja")}.`,
      en: `**Christmas Eve**: a working day, not a holiday. Metro, buses and trains: ${b2link("christmasTransport", "en", "public transport hours at Christmas and New Year")}.`,
    }),
  });

  // 25 December.
  out.push({
    from: DAYS.christmas,
    text: T(locale, {
      ca: `**${holidayName(DAYS.christmas, "ca")}**, festiu a tot Catalunya: ${EXEMPT.ca}. Dia a dia: ${one("ca", "holidayToday")}`,
      es: `**${holidayName(DAYS.christmas, "es")}**, festivo en toda Cataluña: ${EXEMPT.es}. Día a día: ${one("es", "holidayToday")}`,
      en: `**${holidayName(DAYS.christmas, "en")}**, a holiday across Catalonia: ${EXEMPT.en}. Day by day: ${one("en", "holidayToday")}`,
    }),
  });

  // 26 December: Sant Esteve, a holiday in Catalonia except Aran.
  const aran = aranSubstitutionFor(DAYS.santEsteve);
  const aranText = aran
    ? T(locale, {
        ca: ` (a l'Aran és feiner: el substitueix la ${aran.name.ca}, el ${shortDate(aran.date, "ca")})`,
        es: ` (en Arán es laborable: lo sustituye la ${aran.name.es}, el ${shortDate(aran.date, "es")})`,
        en: ` (a working day in Aran, which has the ${aran.name.en} on ${shortDate(aran.date, "en")} instead)`,
      })
    : "";
  const santEsteveLink = bcn
    ? T(locale, {
        ca: b2link("workCalendar", "ca", "festius de Catalunya 2026"),
        es: b2link("workCalendar", "es", "festivos de Cataluña 2026"),
        en: b2link("workCalendar", "en", "Catalonia public holidays 2026"),
      })
    : T(locale, {
        ca: b2link("christmasTraditions", "ca", "què es menja per Sant Esteve"),
        es: b2link("christmasTraditions", "es", "qué se come en Sant Esteve"),
        en: b2link("christmasTraditions", "en", "what Catalans eat on Sant Esteve"),
      });
  out.push({
    from: DAYS.santEsteve,
    text: T(locale, {
      ca: `**Sant Esteve**, festiu a Catalunya${aranText}; les botigues també tanquen. ${bcn ? "Tots els festius" : "La tradició"}: ${santEsteveLink}.`,
      es: `**Sant Esteve (San Esteban)**, festivo en Cataluña${aranText}; las tiendas también cierran. ${bcn ? "Todos los festivos" : "La tradición"}: ${santEsteveLink}.`,
      en: `**Sant Esteve (St Stephen's Day)**, a holiday in Catalonia${aranText}; shops close again. ${bcn ? "All the holidays" : "The tradition"}: ${santEsteveLink}.`,
    }),
  });

  // 31 December.
  out.push({
    from: GROSSA_DRAW_DATE,
    text: T(locale, {
      ca: `**Nit de Cap d'Any**: dia feiner. Sorteig de ${b2link("grossa", "ca", "La Grossa de Cap d'Any 2026")}. La festa i el metro: ${one("ca", "newYear")}.`,
      es: `**Nochevieja**: día laborable. Sorteo de ${b2link("grossa", "es", "La Grossa de Fin de Año 2026")}. La fiesta y el metro: ${one("es", "newYear")}.`,
      en: `**New Year's Eve**: a working day. Draw of ${b2link("grossa", "en", "La Grossa New Year's Eve lottery 2026")}. The celebration and the metro: ${one("en", "newYear")}.`,
    }),
  });

  // 1 January: on a Friday in 2027, so a three-day weekend (the 2027 long-weekends page).
  const friday = weekdayIndex(DAYS.newYear) === 5;
  const longWeekend = friday
    ? T(locale, {
        ca: ` Cau en divendres: cap de setmana de tres dies. ${b2link("bridges2027", "ca", "Ponts del 2027 a Catalunya")}.`,
        es: ` Cae en viernes: fin de semana de tres días. ${b2link("bridges2027", "es", "Puentes de 2027 en Cataluña")}.`,
        en: ` It falls on a Friday: a three-day weekend. ${b2link("bridges2027", "en", "Long weekends in 2027 in Catalonia")}.`,
      })
    : "";
  out.push({
    from: DAYS.newYear,
    text: T(locale, {
      ca: `**${holidayName(DAYS.newYear, "ca")}**, festiu: ${EXEMPT.ca}.${longWeekend}`,
      es: `**${holidayName(DAYS.newYear, "es")}**, festivo: ${EXEMPT.es}.${longWeekend}`,
      en: `**${holidayName(DAYS.newYear, "en")}**, a holiday: ${EXEMPT.en}.${longWeekend}`,
    }),
  });

  // 3 January: the first opening Sunday of 2027, which the Generalitat labels winter sales.
  const sales = WINTER_SALES.firstSunday;
  out.push({
    from: sales,
    text: T(locale, {
      ca: `**Primer diumenge del 2027 amb botigues obertes** (calendari general, Ordre EMT/89/2026), que la Generalitat marca com a «Rebaixes d'hivern». La llei no fixa quan comencen les rebaixes, que tria cada botiga: ${b2link("winterSales", "ca", "rebaixes d'hivern 2027")}.`,
      es: `**Primer domingo de 2027 con tiendas abiertas** (calendario general, Orden EMT/89/2026), que la Generalitat marca como «Rebaixes d'hivern». La ley no fija cuándo empiezan las rebajas, que elige cada tienda: ${b2link("winterSales", "es", "rebajas de enero 2027")}.`,
      en: `**First Sunday of 2027 with shops open** (general calendar, Ordre EMT/89/2026), which the Generalitat labels "winter sales". The law does not set when the sales start; each shop decides. More in ${b2link("winterSales", "en", "winter sales 2027")}.`,
    }),
  });

  // 5-6 January: the parade and Reis.
  const lightsEnd = lights && lights.until === REIS_DAY
    ? T(locale, { ca: " Últim dia dels llums de Barcelona.", es: " Último día de las luces de Barcelona.", en: " Last night of Barcelona's lights." })
    : "";
  out.push({
    from: PARADE_DAY,
    to: REIS_DAY,
    text: T(locale, {
      ca: `**Cavalcada de Reis** el vespre del ${day(PARADE_DAY, "ca")}: ${one("ca", "reis")}. El ${day(REIS_DAY, "ca")}, **${holidayName(REIS_DAY, "ca")}**, és festiu: ${EXEMPT.ca}.${lightsEnd}`,
      es: `**Cabalgata de Reyes** la tarde del ${day(PARADE_DAY, "es")}: ${one("es", "reis")}. El ${day(REIS_DAY, "es")}, **${holidayName(REIS_DAY, "es")}**, es festivo: ${EXEMPT.es}.${lightsEnd}`,
      en: `**Three Kings parade** on the evening of ${day(PARADE_DAY, "en")}: ${one("en", "reis")}. ${day(REIS_DAY, "en")}, **${holidayName(REIS_DAY, "en")}**, is a holiday: ${EXEMPT.en}.${lightsEnd}`,
    }),
  });

  return out;
}

/** The table rows, in date order; on the same first day a run of days comes before a single day. */
export function calendarRows(locale: Locale, scope: CalendarScope, fairs: CalendarFairs, lights: Lights = ANNOUNCED_2026.lightsSwitchOn): string[][] {
  const list = entries(locale, scope, fairs, lights);
  list.sort((a, b) => a.from.localeCompare(b.from) || (b.to ?? b.from).localeCompare(a.to ?? a.from));
  return list.map((e) => [calendarDayLabel(e.from, e.to, locale), e.text]);
}

const HEADING: Record<CalendarScope, Record<Locale, string>> = {
  catalonia: {
    ca: "Nadal 2026 a Catalunya: què passa i què canvia, de l'1 de desembre al 7 de gener",
    es: "Navidad 2026 en Cataluña: qué pasa y qué cambia, del 1 de diciembre al 7 de enero",
    en: "Christmas 2026 in Catalonia: what's on and what changes, 1 December to 7 January",
  },
  barcelona: {
    ca: "Nadal 2026 a Barcelona, dia a dia: de l'1 de desembre al 7 de gener",
    es: "Navidad 2026 en Barcelona, día a día: del 1 de diciembre al 7 de enero",
    en: "Christmas 2026 in Barcelona, day by day: 1 December to 7 January",
  },
};

/** The calendar section: an H2, one line on what it is, and the table. */
export function christmasCalendar(locale: Locale, scope: CalendarScope, fairs: CalendarFairs, lights: Lights = ANNOUNCED_2026.lightsSwitchOn): Block[] {
  const intro = scope === "barcelona"
    ? T(locale, {
        ca: `Els dies que canvien alguna cosa a la ciutat per les festes (festius, botigues, escola, loteries i Reis), cada un amb la pàgina on ho expliquem. Els concerts i les activitats de tot el mes són més avall.`,
        es: `Los días que cambian algo en la ciudad durante las fiestas (festivos, tiendas, colegio, loterías y Reyes), cada uno con la página donde lo explicamos. Los conciertos y las actividades de todo el mes están más abajo.`,
        en: `The days when something changes in the city over the holidays (public holidays, shops, school, lotteries and the Three Kings), each with the page that explains it. Concerts and events for the whole month are further down.`,
      })
    : T(locale, {
        ca: "Els dies que canvien alguna cosa per les festes a Catalunya (festius, botigues, escola, loteries i Reis), cada un amb la pàgina on ho expliquem.",
        es: "Los días que cambian algo durante las fiestas en Cataluña (festivos, tiendas, colegio, loterías y Reyes), cada uno con la página donde lo explicamos.",
        en: "The days when something changes over the holidays in Catalonia (public holidays, shops, school, lotteries and the Three Kings), each with the page that explains it.",
      });
  const caption = T(locale, {
    ca: scope === "barcelona" ? "Calendari de Nadal 2026-2027 a Barcelona" : "Calendari de Nadal 2026-2027 a Catalunya",
    es: scope === "barcelona" ? "Calendario de Navidad 2026-2027 en Barcelona" : "Calendario de Navidad 2026-2027 en Cataluña",
    en: scope === "barcelona" ? "Barcelona Christmas calendar 2026-2027" : "Catalonia Christmas calendar 2026-2027",
  });
  const headers = T(locale, { ca: ["Dia", "Què passa"], es: ["Día", "Qué pasa"], en: ["Day", "What happens"] });
  const note = T(locale, {
    ca: "Festius: Ordre EMT/66/2025 i Ordre EMT/52/2026. Botigues: Ordre EMT/77/2025, Resolució EMT/4342/2025, Ordre EMT/89/2026 i Llei 18/2017 (art. 36). Escola: Ordre EDF/66/2026. La resta, de cada organitzador; cada enllaç porta a la pàgina amb la font.",
    es: "Festivos: Orden EMT/66/2025 y Orden EMT/52/2026. Tiendas: Orden EMT/77/2025, Resolución EMT/4342/2025, Orden EMT/89/2026 y Ley 18/2017 (art. 36). Colegio: Orden EDF/66/2026. El resto, de cada organizador; cada enlace lleva a la página con la fuente.",
    en: "Holidays: Ordre EMT/66/2025 and Ordre EMT/52/2026. Shops: Ordre EMT/77/2025, Resolució EMT/4342/2025, Ordre EMT/89/2026 and Llei 18/2017 (art. 36). School: Ordre EDF/66/2026. Everything else from each organiser; each link goes to the page with the source.",
  });
  return [...h2(HEADING[scope][locale], intro), table(caption, headers, calendarRows(locale, scope, fairs, lights), note)];
}

/** "a, b i c" / "a, b y c" / "a, b and c". */
function joinAnd(items: readonly string[], locale: Locale): string {
  const and = T(locale, { ca: " i ", es: " y ", en: " and " });
  return items.length < 2 ? (items[0] ?? "") : `${items.slice(0, -1).join(", ")}${and}${items[items.length - 1]}`;
}

/** "el dimarts 8 de desembre (la Immaculada), el divendres 25 de desembre (Nadal)..." from CALENDAR_HOLIDAYS. */
function holidayWords(locale: Locale): string {
  return joinAnd(CALENDAR_HOLIDAYS.map((iso) => `${locale === "en" ? "" : "el "}${day(iso, locale)} (${holidayName(iso, locale)})`), locale);
}

/** "el 25 de desembre" / "l'1 de gener" (Catalan elides before 1 and 11) / "el 1 de enero" / "1 January". */
function theDate(iso: string, locale: Locale): string {
  if (locale === "en") return shortDate(iso, "en");
  const vowel = locale === "ca" && ["01", "11"].includes(iso.slice(8, 10));
  return `${vowel ? "l'" : "el "}${shortDate(iso, locale)}`;
}

/**
 * The calendar's questions for the page's FAQ, in the words people search.
 * Plain text: the FAQ answers carry no links.
 */
export function calendarFaq(locale: Locale, scope: CalendarScope): { question: string; answer: string }[] {
  const bcn = scope === "barcelona";
  const last = lastShopSunday(scope);
  const after = shopDays(scope).filter((iso) => iso > last && iso < CALENDAR_SPAN.to);
  const afterText = after.length
    ? T(locale, {
        ca: ` Després de Nadal també poden obrir el ${after.map((iso) => day(iso, "ca")).join(" i el ")}.`,
        es: ` Después de Navidad también pueden abrir el ${after.map((iso) => day(iso, "es")).join(" y el ")}.`,
        en: ` After Christmas they may also open on ${after.map((iso) => day(iso, "en")).join(" and ")}.`,
      })
    : "";
  const [from, to] = SCHOOL!.christmas;
  const working = joinAnd(WORKING_ASKED.map((iso) => `${locale === "en" ? "" : "el "}${day(iso, locale)}`), locale);
  const closed = joinAnd(LAW_CLOSING.map((iso) => theDate(iso, locale)), locale);
  const aran = aranSubstitutionFor(DAYS.santEsteve)
    ? T(locale, { ca: " A l'Aran, el 26 de desembre és feiner.", es: " En Arán, el 26 de diciembre es laborable.", en: " In Aran, 26 December is a working day." })
    : "";
  const localInWindow = BCN!.local.filter((iso) => iso >= CALENDAR_SPAN.from && iso <= CALENDAR_SPAN.to);
  const bcnLocal = localInWindow.length === 0
    ? T(locale, { ca: " Barcelona no té cap festa local en aquestes dates.", es: " Barcelona no tiene ninguna fiesta local en estas fechas.", en: " Barcelona has no local holiday in this period." })
    : T(locale, { ca: ` A Barcelona, a més, és festa local el ${dayList(localInWindow, "ca")}.`, es: ` En Barcelona, además, es fiesta local el ${dayList(localInWindow, "es")}.`, en: ` Barcelona also has a local holiday on ${dayList(localInWindow, "en")}.` });
  const sameDay = NADAL_DRAW_DATE === from
    ? T(locale, { ca: ", el mateix dia que comencen les vacances escolars", es: ", el mismo día que empiezan las vacaciones escolares", en: ", the day the school holidays start" })
    : "";
  const holidaysQ = bcn
    ? T(locale, { ca: "Quins dies són festius per Nadal a Barcelona?", es: "¿Qué días son festivos en Navidad en Barcelona?", en: "Which days are public holidays at Christmas in Barcelona?" })
    : T(locale, { ca: "Quins dies són festius per Nadal 2026 a Catalunya?", es: "¿Qué días son festivos en Navidad 2026 en Cataluña?", en: "Which days are public holidays at Christmas 2026 in Catalonia?" });
  const shopsQ = bcn
    ? T(locale, { ca: "Quin és l'últim diumenge que obren les botigues a Barcelona abans de Nadal?", es: "¿Cuál es el último domingo que abren las tiendas en Barcelona antes de Navidad?", en: "What is the last Sunday before Christmas that shops open in Barcelona?" })
    : T(locale, { ca: "Quin és l'últim diumenge que obren les botigues abans de Nadal?", es: "¿Cuál es el último domingo que abren las tiendas antes de Navidad?", en: "What is the last Sunday before Christmas that shops open?" });
  const where = bcn
    ? T(locale, { ca: "a Barcelona", es: "en Barcelona", en: "in Barcelona" })
    : T(locale, { ca: "als municipis que no n'han triat d'altres; cada ajuntament en pot haver canviat algun", es: "en los municipios que no han elegido otros; cada ayuntamiento puede haber cambiado alguno", en: "in towns that kept the default days; each council may have swapped some" });
  return [
    {
      question: holidaysQ,
      answer: T(locale, {
        ca: `Entre l'1 de desembre i el 7 de gener són festius a tot Catalunya ${holidayWords("ca")}. ${cap(working)} són dies feiners.${bcn ? bcnLocal : aran}`,
        es: `Entre el 1 de diciembre y el 7 de enero son festivos en toda Cataluña ${holidayWords("es")}. ${cap(working)} son días laborables.${bcn ? bcnLocal : aran}`,
        en: `Between 1 December and 7 January the Catalonia-wide public holidays are ${holidayWords("en")}. ${working} are working days.${bcn ? bcnLocal : aran}`,
      }),
    },
    {
      question: T(locale, { ca: "Quan comencen les vacances de Nadal 2026 a l'escola?", es: "¿Cuándo empiezan las vacaciones de Navidad 2026 en el colegio?", en: "When do the 2026 Christmas school holidays start in Catalonia?" }),
      answer: T(locale, {
        ca: `El ${day(from, "ca")}. Duren fins al ${day(to, "ca")}, inclòs, i es torna a classe el ${day(BACK_TO_SCHOOL, "ca")}, segons l'Ordre EDF/66/2026.`,
        es: `El ${day(from, "es")}. Duran hasta el ${day(to, "es")}, incluido, y se vuelve a clase el ${day(BACK_TO_SCHOOL, "es")}, según la Orden EDF/66/2026.`,
        en: `On ${day(from, "en")}. They last until ${day(to, "en")}, inclusive, and classes resume on ${day(BACK_TO_SCHOOL, "en")}, under Ordre EDF/66/2026.`,
      }),
    },
    {
      question: shopsQ,
      answer: T(locale, {
        ca: `El ${day(last, "ca")}, ${where}.${afterText} ${cap(closed)} les botigues amb horari general tanquen per llei.`,
        es: `El ${day(last, "es")}, ${where}.${afterText} ${cap(closed)} las tiendas con horario general cierran por ley.`,
        en: `${cap(day(last, "en"))}, ${where}.${afterText} Shops on general hours must close by law on ${closed}.`,
      }),
    },
    {
      question: T(locale, { ca: "Quan és la Loteria de Nadal 2026?", es: "¿Cuándo es la Lotería de Navidad 2026?", en: "When is the Spanish Christmas lottery draw in 2026?" }),
      answer: T(locale, {
        ca: `El ${day(NADAL_DRAW_DATE, "ca")}${sameDay}. La Grossa de Cap d'Any, la loteria de la Generalitat, se sorteja el ${day(GROSSA_DRAW_DATE, "ca")}.`,
        es: `El ${day(NADAL_DRAW_DATE, "es")}${sameDay}. La Grossa de Cap d'Any, la lotería de la Generalitat, se sortea el ${day(GROSSA_DRAW_DATE, "es")}.`,
        en: `On ${day(NADAL_DRAW_DATE, "en")}${sameDay}. La Grossa de Cap d'Any, the Catalan government's lottery, is drawn on ${day(GROSSA_DRAW_DATE, "en")}.`,
      }),
    },
  ];
}
