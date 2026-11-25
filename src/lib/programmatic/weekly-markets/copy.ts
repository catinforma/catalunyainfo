import type { AnswerOption, AnswerZone } from "./answer";
import { NO_SESSION, composeAnswer, currentOption } from "./answer";
import { CCAM_COUNT, TOWNS, holidayNameFor, holidayNameIn } from "./data";
import { capitalize, dayMonth, daysText, hoursText, inTown, numericDate, weekdayDayMonth } from "./format";
import { activeExceptions, needsConfirmation, upcomingSessions, validUntil, type Clock } from "./logic";
import type { Market, MarketException, MarketTown, MkLocale, RelatedEvent, Session } from "./types";

/**
 * The words of the family's pages, as pure functions of a town, a locale and
 * a clock (the Madrid moment the page is rendered at). Titles and
 * descriptions carry no date: the page is cached and revalidated, the
 * description must stay true all day.
 */

export const TITLE_LIMIT = 62;
export const DESCRIPTION_LIMIT = 165;
/** Sessions kept per zone for the browser to pick from (about two weeks of a daily market, months of a weekly one). */
const OPTIONS_PER_ZONE = 14;
/** The Mercat Medieval-style notice shows from this many days before the event until its last day. */
const RELATED_LEAD_DAYS = 30;
/** How far ahead a holiday session is looked for in the FAQ. */
const HOLIDAY_LOOKAHEAD_DAYS = 45;

/* -------------------------------------------------------------------------- */
/* Answers                                                                    */
/* -------------------------------------------------------------------------- */

function groupByDate(sessions: readonly Session[]): Session[][] {
  const out: Session[][] = [];
  for (const s of sessions) {
    const last = out[out.length - 1];
    if (last && last[0]!.date === s.date) last.push(s);
    else out.push([s]);
  }
  return out;
}

function tail(group: readonly Session[], locale: MkLocale): { text: string; notice: boolean } {
  const first = group[0]!;
  const moved = group.find((s) => s.movedFrom);
  if (moved?.movedFrom) {
    const from = weekdayDayMonth(moved.movedFrom, locale);
    return { text: { ca: ` (trasllat del ${from})`, es: ` (traslado del ${from})`, en: ` (moved from ${from})` }[locale], notice: true };
  }
  const holiday = group.find((s) => s.status === "holiday-unconfirmed");
  if (holiday) {
    const name = holidayNameIn(holiday.date, locale) ?? { ca: "festa local", es: "fiesta local", en: "local holiday" }[locale];
    return {
      text: {
        ca: ` Dia festiu (${name}): és l'horari habitual, l'Ajuntament no n'ha publicat cap canvi.`,
        es: ` Día festivo (${name}): es el horario habitual, el Ayuntamiento no ha publicado ningún cambio.`,
        en: ` Public holiday (${name}): these are the usual hours, the council has published no change.`,
      }[locale],
      notice: true,
    };
  }
  if (group.some((s) => s.status === "calendar-pending")) {
    return {
      text: {
        ca: ` Horari habitual: l'Ajuntament encara no ha publicat el calendari de festius de ${first.date.slice(0, 4)}.`,
        es: ` Horario habitual: el Ayuntamiento aún no ha publicado el calendario de festivos de ${first.date.slice(0, 4)}.`,
        en: ` Usual hours: the council has not published its ${first.date.slice(0, 4)} holiday calendar yet.`,
      }[locale],
      notice: true,
    };
  }
  return { text: "", notice: false };
}

/** One day's sessions of a zone as an answer option. */
export function optionFor(town: MarketTown, group: readonly Session[], label: string, locale: MkLocale): AnswerOption {
  const first = group[0]!;
  const hoursOf = (s: Session) => hoursText(s.from && s.to ? [s.from, s.to] : null, locale);
  const marketOf = (s: Session) => town.markets.find((m) => m.id === s.marketId)!;
  // Up to two markets a day: the place of each. More (Mataró on a Saturday): the squares, grouped by hours.
  let parts: string[];
  if (group.length <= 2) {
    parts = group.map((s) => `${marketOf(s).place[locale]}, ${hoursOf(s)}`);
  } else {
    const byHours = new Map<string, string[]>();
    for (const s of group) byHours.set(hoursOf(s), [...(byHours.get(hoursOf(s)) ?? []), marketOf(s).area.name[locale]]);
    const and = { ca: "i", es: "y", en: "and" }[locale];
    parts = [...byHours].map(([hours, names]) => `${names.length > 1 ? `${names.slice(0, -1).join(", ")} ${and} ${names.at(-1)}` : names[0]}, ${hours}`);
  }
  const { text, notice } = tail(group, locale);
  const unknownEnd = group.some((s) => s.to === null);
  const ends = unknownEnd ? null : group.map((s) => s.to!).sort().at(-1)!;
  return {
    date: first.date,
    endsAt: ends,
    before: `${label}: `,
    datePhrase: weekdayDayMonth(first.date, locale),
    after: `, ${parts.join("; ")}.${text}`,
    notice,
  };
}

/** The options of a set of markets from the clock on: today's included even if over, so a tab left open can skip it. */
export function zoneOptions(town: MarketTown, marketIds: readonly string[], label: string, clock: Clock, locale: MkLocale): AnswerOption[] {
  const startOfDay: Clock = { iso: clock.iso, hhmm: "00:00" };
  const sessions = upcomingSessions(town, startOfDay, holidayNameFor(town.slug), { marketIds, limit: 60 });
  return groupByDate(sessions)
    .slice(0, OPTIONS_PER_ZONE)
    .map((group) => optionFor(town, group, label, locale));
}

const NEXT_LABEL = (name: string, locale: MkLocale) => ({ ca: `Pròxim mercat a ${name}`, es: `Próximo mercado en ${name}`, en: `Next market in ${name}` })[locale];
const ZONE_LABEL = (name: string, locale: MkLocale) => ({ ca: `Pròxim mercat · ${name}`, es: `Próximo mercado · ${name}`, en: `Next market · ${name}` })[locale];
const ALL_ZONES: Record<MkLocale, string> = { ca: "Tots els mercats", es: "Todos los mercados", en: "All markets" };

/** The zones the reader can pick: "all", then each square or neighbourhood. */
export function answerZones(town: MarketTown, clock: Clock, locale: MkLocale): AnswerZone[] {
  const zones: AnswerZone[] = [
    { id: "all", label: ALL_ZONES[locale], options: zoneOptions(town, town.markets.map((m) => m.id), NEXT_LABEL(town.name[locale], locale), clock, locale) },
  ];
  const seen = new Set<string>();
  for (const market of town.markets) {
    if (seen.has(market.area.id)) continue;
    seen.add(market.area.id);
    const ids = town.markets.filter((m) => m.area.id === market.area.id).map((m) => m.id);
    zones.push({ id: market.area.id, label: market.area.name[locale], options: zoneOptions(town, ids, ZONE_LABEL(market.area.name[locale], locale), clock, locale) });
  }
  return zones;
}

/** The sentence a page prints first (server render) for a zone, at `clock`. */
export function answerSentence(zone: AnswerZone, clock: Clock, locale: MkLocale): string {
  const option = currentOption(zone.options, clock.iso, clock.hhmm);
  return option ? composeAnswer(option, clock.iso, locale) : NO_SESSION[locale];
}

/** One market's next session for the table's last column: the day, and the caveat when there is one. */
export function marketNext(town: MarketTown, market: Market, clock: Clock, locale: MkLocale): string {
  const session = upcomingSessions(town, clock, holidayNameFor(town.slug), { marketIds: [market.id], limit: 1 })[0];
  if (!session) return NO_SESSION[locale];
  const { text } = tail([session], locale);
  const relative = composeAnswer({ date: session.date, endsAt: null, before: "", datePhrase: weekdayDayMonth(session.date, locale), after: "", notice: false }, clock.iso, locale);
  return `${capitalize(relative)}${text}`;
}

/* -------------------------------------------------------------------------- */
/* Page views                                                                 */
/* -------------------------------------------------------------------------- */

export interface Faq {
  q: string;
  a: string;
}

export interface TableRow {
  id: string;
  market: string;
  where: string;
  days: string;
  hours: string;
  goods: string;
  next: string;
  census: string;
  hoursNote: string | null;
}

export interface ExceptionView {
  id: string;
  text: string;
  needsConfirmation: boolean;
  /** "valid until" word for the date the note stops applying. */
  until: string;
}

export interface RelatedView {
  id: string;
  name: string;
  dates: string;
  hours: string;
  note: string;
  url: string;
  /** What to search: the sentence that tells the two apart, for the lead of the block. */
  difference: string;
}

export interface TownView {
  title: string;
  description: string;
  h1: string;
  lead: string;
  headings: {
    answer: string;
    markets: string;
    exceptions: string;
    related: string;
    census: string;
    faq: string;
    sources: string;
    more: string;
  };
  cols: { market: string; where: string; days: string; hours: string; next: string };
  zonePicker: string;
  exceptions: ExceptionView[];
  noExceptions: string;
  confirmNote: string;
  related: RelatedView[];
  census: string[];
  faq: Faq[];
  checked: string;
  noticeLink: string;
  unconfirmedHint: string;
  rows: TableRow[];
}

function relatedVisible(event: RelatedEvent, today: string): boolean {
  const lead = new Date(Date.parse(`${event.from}T12:00:00Z`) - RELATED_LEAD_DAYS * 86_400_000).toISOString().slice(0, 10);
  return today >= lead && today <= event.to;
}

function dateRange(from: string, to: string, locale: MkLocale): string {
  const sameMonth = from.slice(0, 7) === to.slice(0, 7);
  if (locale === "en") return sameMonth ? `${Number(from.slice(8))}–${dayMonth(to, "en")}` : `${dayMonth(from, "en")} – ${dayMonth(to, "en")}`;
  const word = locale === "ca" ? "al" : "al";
  return sameMonth ? `del ${Number(from.slice(8))} ${word} ${dayMonth(to, locale)}` : `del ${dayMonth(from, locale)} ${word} ${dayMonth(to, locale)}`;
}

function relatedViews(town: MarketTown, clock: Clock, locale: MkLocale): RelatedView[] {
  return town.related
    .filter((e) => relatedVisible(e, clock.iso))
    .map((e) => ({
      id: e.id,
      name: e.name[locale],
      dates: dateRange(e.from, e.to, locale),
      hours: e.hours[locale],
      note: e.note[locale],
      url: e.url,
      difference: {
        ca: `El ${e.name.ca} (${dateRange(e.from, e.to, "ca")}) és una fira amb programa propi. El mercat setmanal segueix el seu calendari de sempre i no s'hi fusiona.`,
        es: `El ${e.name.es} (${dateRange(e.from, e.to, "es")}) es una feria con programa propio. El mercado semanal sigue su calendario de siempre y no se funde con ella.`,
        en: `The ${e.name.en} (${dateRange(e.from, e.to, "en")}) is a fair with its own programme. The weekly market follows its usual calendar and is not part of it.`,
      }[locale],
    }));
}

function exceptionViews(town: MarketTown, clock: Clock, locale: MkLocale): ExceptionView[] {
  return activeExceptions(town, clock.iso).map((ex) => ({
    id: ex.id,
    text: ex.note[locale],
    needsConfirmation: needsConfirmation(town, ex, clock.iso),
    until: numericDate(validUntil(ex), locale),
  }));
}

/** First active exception (for the FAQ and the lead) in a language. */
function firstMoved(town: MarketTown, clock: Clock): MarketException | null {
  return activeExceptions(town, clock.iso).find((e) => e.kind === "moved") ?? null;
}

function marketRows(town: MarketTown, clock: Clock, locale: MkLocale): TableRow[] {
  return town.markets.map((m) => ({
    id: m.id,
    market: m.name[locale],
    where: m.detail ? m.detail[locale] : m.place[locale],
    days: daysText(m.days, locale),
    hours: hoursText(m.hours, locale),
    goods: m.goods[locale],
    next: marketNext(town, m, clock, locale),
    census: `${m.census.id} · ${m.census.day}`,
    hoursNote: m.hoursNote ? m.hoursNote[locale] : null,
  }));
}

const NAME_FOR_TITLE: Record<string, Record<MkLocale, { title: string; description: string; h1: string }>> = {
  vic: {
    ca: {
      title: "Mercat setmanal de Vic: quan és el pròxim i on",
      description: "Mercat de dimarts i dissabte a la plaça Major i de diumenge al passeig de la Generalitat: pròxima sessió, festius i diferència amb el Mercat Medieval.",
      h1: "Mercat setmanal de Vic: pròxima sessió, lloc i horari",
    },
    es: {
      title: "Mercado semanal de Vic: cuándo es el próximo y dónde",
      description: "Mercado de martes y sábado en la plaza Mayor y de domingo en el paseo de la Generalitat: próxima sesión, festivos y diferencia con el Mercat Medieval.",
      h1: "Mercado semanal de Vic: próxima sesión, lugar y horario",
    },
    en: {
      title: "Vic weekly market: next date, place and hours",
      description: "Tuesday and Saturday market in Plaça Major, Sunday market on Passeig de la Generalitat: next session, holiday changes and how it differs from the Medieval Market.",
      h1: "Vic weekly market: next session, place and hours",
    },
  },
  mataro: {
    ca: {
      title: "Mercats setmanals de Mataró: dies, hores i places",
      description: "Tria el barri o la plaça: sis mercats de dissabte, el de la plaça Gran de dilluns a dissabte i el de dijous a la plaça de Cuba, amb horari per plaça.",
      h1: "Mercats setmanals de Mataró: pròxima sessió per plaça",
    },
    es: {
      title: "Mercados semanales de Mataró: días, horas y plazas",
      description: "Elige el barrio o la plaza: seis mercados de sábado, el de la plaza Gran de lunes a sábado y el de jueves en la plaza de Cuba, con horario por plaza.",
      h1: "Mercados semanales de Mataró: próxima sesión por plaza",
    },
    en: {
      title: "Mataró weekly markets: days, hours and squares",
      description: "Pick your district or square: six Saturday markets, Plaça Gran from Monday to Saturday and the Thursday market at Plaça de Cuba, with hours for each.",
      h1: "Mataró weekly markets: next session by square",
    },
  },
};

const CENSUS_NOTES: Record<string, Record<MkLocale, string[]>> = {
  vic: {
    ca: [
      "El cens de la Generalitat (dades obertes, 553 files, actualitzat el 29/10/2026) té dos mercats a Vic: el 518, dimarts i dissabte a la plaça Major (via adjacent: rambla del Passeig), i el 519, diumenge al passeig de la Generalitat. Coincideix amb l'Ajuntament en dies i llocs.",
      "El cens no té horaris: no resol l'hora d'inici del mercat de dimarts i dissabte, que l'Ajuntament només descriu com a «horari de matí».",
      "El cercador de la Diputació de Barcelona és un mapa que es carrega amb script i no n'hem pogut llegir els resultats: no l'hem fet servir com a font.",
    ],
    es: [
      "El censo de la Generalitat (datos abiertos, 553 filas, actualizado el 29/10/2026) tiene dos mercados en Vic: el 518, martes y sábado en la plaza Mayor (vía adyacente: rambla del Passeig), y el 519, domingo en el paseo de la Generalitat. Coincide con el Ayuntamiento en días y lugares.",
      "El censo no tiene horarios: no resuelve la hora de inicio del mercado de martes y sábado, que el Ayuntamiento solo describe como «horario de mañana».",
      "El buscador de la Diputación de Barcelona es un mapa que se carga con script y no hemos podido leer sus resultados: no lo hemos usado como fuente.",
    ],
    en: [
      "The Generalitat's census (open data, 553 rows, updated 29 Oct 2026) lists two markets in Vic: no. 518, Tuesday and Saturday in Plaça Major (adjacent street: rambla del Passeig), and no. 519, Sunday on Passeig de la Generalitat. It agrees with the council on days and places.",
      "The census has no hours, so it does not settle the start time of the Tuesday and Saturday market, which the council only calls \"morning hours\".",
      "The Barcelona Provincial Council's finder is a map loaded by script and we could not read its results, so we did not use it as a source.",
    ],
  },
  mataro: {
    ca: [
      "El cens de la Generalitat (dades obertes, 553 files, actualitzat el 29/10/2026) té set files per a Mataró: sis mercats de dissabte o de dijous (Cuba dissabte, Escorxador, Cirera Molins, Cerdanyola, Pla d'en Boet i Cuba dijous) i la plaça Gran de dilluns a dissabte. Els dies coincideixen amb l'Ajuntament.",
      "L'Ajuntament parla de «sis mercats setmanals» de dissabte, però el de la plaça Gran és diari (menys diumenge): per això el compte de «sis de dissabte» inclou la plaça Gran només el dissabte.",
      "Les adreces no coincideixen paraula per paraula: el cens dona el carrer de Ramon Berenguer III, 130 per a Cerdanyola i el carrer de Puig i Pidemunt, 12 per a Pla d'en Boet; l'Ajuntament els situa al passeig de Ramon Berenguer III (entre l'avinguda de la Gatassa i el passatge de Baldomer Vila) i al polígon industrial de Pla d'en Boet. Usem la descripció de l'Ajuntament.",
      "El cens no té horaris. El cercador de la Diputació és un mapa que es carrega amb script i no n'hem pogut llegir els resultats.",
    ],
    es: [
      "El censo de la Generalitat (datos abiertos, 553 filas, actualizado el 29/10/2026) tiene siete filas para Mataró: seis mercados de sábado o de jueves (Cuba sábado, Escorxador, Cirera Molins, Cerdanyola, Pla d'en Boet y Cuba jueves) y la plaza Gran de lunes a sábado. Los días coinciden con el Ayuntamiento.",
      "El Ayuntamiento habla de «seis mercados semanales» de sábado, pero el de la plaza Gran es diario (menos domingo): por eso la cuenta de «seis de sábado» incluye la plaza Gran solo el sábado.",
      "Las direcciones no coinciden palabra por palabra: el censo da la calle Ramon Berenguer III, 130 para Cerdanyola y la calle Puig i Pidemunt, 12 para Pla d'en Boet; el Ayuntamiento los sitúa en el paseo de Ramon Berenguer III (entre la avenida de la Gatassa y el pasaje de Baldomer Vila) y en el polígono industrial de Pla d'en Boet. Usamos la descripción del Ayuntamiento.",
      "El censo no tiene horarios. El buscador de la Diputación es un mapa que se carga con script y no hemos podido leer sus resultados.",
    ],
    en: [
      "The Generalitat's census (open data, 553 rows, updated 29 Oct 2026) has seven rows for Mataró: six Saturday or Thursday markets (Cuba Saturday, Escorxador, Cirera Molins, Cerdanyola, Pla d'en Boet and Cuba Thursday) and Plaça Gran from Monday to Saturday. The days agree with the council.",
      "The council speaks of \"six weekly markets\" on Saturday, but the Plaça Gran market runs every day except Sunday, so the \"six on Saturday\" count includes Plaça Gran on Saturdays only.",
      "The addresses do not match word for word: the census gives Carrer de Ramon Berenguer III, 130 for Cerdanyola and Carrer de Puig i Pidemunt, 12 for Pla d'en Boet; the council places them on Passeig de Ramon Berenguer III (between avinguda de la Gatassa and passatge de Baldomer Vila) and in the Pla d'en Boet industrial estate. We use the council's description.",
      "The census has no hours. The Barcelona Provincial Council's finder is a map loaded by script and we could not read its results.",
    ],
  },
};

function faqFor(town: MarketTown, clock: Clock, locale: MkLocale): Faq[] {
  const name = town.name[locale];
  const out: Faq[] = [];
  const where = inTown(name, locale);
  const all = town.markets.map((m) => `${m.name[locale]}: ${m.place[locale]}, ${daysText(m.days, locale)}, ${hoursText(m.hours, locale)}`).join("; ");
  out.push({
    q: { ca: `Quins dies hi ha mercat setmanal ${where}?`, es: `¿Qué días hay mercado semanal ${where}?`, en: `Which days is there a weekly market ${where}?` }[locale],
    a: { ca: `Segons l'Ajuntament: ${all}.`, es: `Según el Ayuntamiento: ${all}.`, en: `According to the council: ${all}.` }[locale],
  });
  if (town.slug === "vic") {
    out.push({
      q: { ca: "A quina hora comença el mercat de Vic?", es: "¿A qué hora empieza el mercado de Vic?", en: "What time does the Vic market start?" }[locale],
      a: {
        ca: "El de diumenge, al passeig de la Generalitat, és «de 9 a 2h» segons Vic Turisme. Per al de dimarts i dissabte l'Ajuntament només diu «horari de matí» i no n'ha publicat l'hora d'inici ni de fi: no n'inventem cap.",
        es: "El de domingo, en el paseo de la Generalitat, es «de 9 a 2h» según Vic Turisme. Para el de martes y sábado el Ayuntamiento solo dice «horario de mañana» y no ha publicado la hora de inicio ni de fin: no nos inventamos ninguna.",
        en: "The Sunday market on Passeig de la Generalitat runs \"de 9 a 2h\" (9 to 2) according to Vic Turisme. For the Tuesday and Saturday market the council only says \"morning hours\" and has published no start or end time, so we give none.",
      }[locale],
    });
    const moved = firstMoved(town, clock);
    if (moved?.movedTo) {
      const from = weekdayDayMonth(moved.date, locale);
      const to = weekdayDayMonth(moved.movedTo, locale);
      out.push({
        q: { ca: `Hi ha mercat a Vic el ${from}?`, es: `¿Hay mercado en Vic el ${from}?`, en: `Is there a market in Vic on ${from}?` }[locale],
        a: {
          ca: `No a la plaça Major: l'Ajuntament el trasllada al ${to}. El mercat del diumenge segueix el seu calendari. Cal confirmar el canvi amb l'Ajuntament (mercats@vic.cat): ho publica Vic Turisme, i no hem pogut llegir l'acord municipal.`,
          es: `No en la plaza Mayor: el Ayuntamiento lo traslada al ${to}. El mercado del domingo sigue su calendario. Conviene confirmar el cambio con el Ayuntamiento (mercats@vic.cat): lo publica Vic Turisme y no hemos podido leer el acuerdo municipal.`,
          en: `Not in Plaça Major: the council moves it to ${to}. The Sunday market follows its usual calendar. Please confirm the change with the council (mercats@vic.cat): Vic Turisme publishes it and we could not read the council agreement.`,
        }[locale],
      });
    }
    const event = town.related.find((e) => relatedVisible(e, clock.iso));
    if (event) {
      out.push({
        q: { ca: "El Mercat Medieval de Vic és el mercat setmanal?", es: "¿El Mercat Medieval de Vic es el mercado semanal?", en: "Is the Vic Medieval Market the weekly market?" }[locale],
        a: {
          ca: `No. El Mercat Medieval (${dateRange(event.from, event.to, "ca")}, ${event.hours.ca}) és una fira de Vicfires amb programa propi. El calendari municipal de mercats setmanals marca el dimarts 8 de desembre com a mercat normal i no fa cap altra excepció per a aquells dies.`,
          es: `No. El Mercat Medieval (${dateRange(event.from, event.to, "es")}, ${event.hours.es}) es una feria de Vicfires con programa propio. El calendario municipal de mercados semanales marca el martes 8 de diciembre como mercado normal y no hace ninguna otra excepción para esos días.`,
          en: `No. The Medieval Market (${dateRange(event.from, event.to, "en")}, ${event.hours.en}) is a Vicfires event with its own programme. The council's weekly-market calendar lists Tuesday 8 December as a normal market and makes no other exception for those days.`,
        }[locale],
      });
    }
  } else {
    out.push({
      q: { ca: "Hi ha mercat a Mataró el dijous?", es: "¿Hay mercado en Mataró el jueves?", en: "Is there a market in Mataró on Thursday?" }[locale],
      a: {
        ca: "Sí, a l'entorn de la plaça de Cuba, de 9 a 14 h: roba, complements i equipament de la llar. A la plaça Gran també hi ha mercat de fruita i verdura de dilluns a dissabte, de 7 a 14 h.",
        es: "Sí, en los alrededores de la plaza de Cuba, de 9 a 14 h: ropa, complementos y equipamiento del hogar. En la plaza Gran también hay mercado de fruta y verdura de lunes a sábado, de 7 a 14 h.",
        en: "Yes, around Plaça de Cuba, 9:00 to 14:00: clothing, accessories and household goods. Plaça Gran also has a fruit and vegetable market from Monday to Saturday, 7:00 to 14:00.",
      }[locale],
    });
    const holidays = upcomingSessions(town, clock, holidayNameFor(town.slug), { horizonDays: HOLIDAY_LOOKAHEAD_DAYS }).filter((s) => s.status === "holiday-unconfirmed");
    const byDate = new Map<string, Session[]>();
    for (const s of holidays) byDate.set(s.date, [...(byDate.get(s.date) ?? []), s]);
    // The holiday with the most markets (Saint Stephen's Day, a Saturday) is the one readers ask about.
    const busiest = [...byDate.values()].sort((a, b) => b.length - a.length || a[0]!.date.localeCompare(b[0]!.date))[0];
    if (busiest) {
      const date = busiest[0]!.date;
      const label = weekdayDayMonth(date, locale);
      const holidayName = holidayNameIn(date, locale) ?? { ca: "festa local", es: "fiesta local", en: "local holiday" }[locale];
      const usual = busiest.map((s) => `${town.markets.find((m) => m.id === s.marketId)!.area.name[locale]}, ${hoursText([s.from!, s.to!], locale)}`).join("; ");
      out.push({
        q: { ca: `Hi ha mercat a Mataró el ${label}?`, es: `¿Hay mercado en Mataró el ${label}?`, en: `Is there a market in Mataró on ${label}?` }[locale],
        a: {
          ca: `És festiu (${holidayName}) i l'Ajuntament no ha publicat cap canvi a la seva pàgina de mercats. L'horari habitual d'aquell dia és: ${usual}. No podem confirmar que se celebrin: consulta els avisos de l'Ajuntament.`,
          es: `Es festivo (${holidayName}) y el Ayuntamiento no ha publicado ningún cambio en su página de mercados. El horario habitual de ese día es: ${usual}. No podemos confirmar que se celebren: consulta los avisos del Ayuntamiento.`,
          en: `It is a public holiday (${holidayName}) and the council has published no change on its markets page. The usual hours that day are: ${usual}. We cannot confirm that they will be held: check the council's notices.`,
        }[locale],
      });
    }
  }
  return out;
}

const HEADINGS: Record<MkLocale, TownView["headings"]> = {
  ca: { answer: "Pròxim mercat", markets: "Els mercats, un per un", exceptions: "Festius i canvis de data", related: "No és el mercat setmanal", census: "Què diu el cens de la Generalitat", faq: "Preguntes freqüents", sources: "Fonts", more: "Més per a aquesta ciutat" },
  es: { answer: "Próximo mercado", markets: "Los mercados, uno a uno", exceptions: "Festivos y cambios de fecha", related: "No es el mercado semanal", census: "Qué dice el censo de la Generalitat", faq: "Preguntas frecuentes", sources: "Fuentes", more: "Más para esta ciudad" },
  en: { answer: "Next market", markets: "The markets, one by one", exceptions: "Holidays and date changes", related: "Not the weekly market", census: "What the Generalitat's census says", faq: "Frequently asked questions", sources: "Sources", more: "More for this town" },
};

const COLS: Record<MkLocale, TownView["cols"]> = {
  ca: { market: "Mercat", where: "On", days: "Dies", hours: "Horari", next: "Pròxima sessió" },
  es: { market: "Mercado", where: "Dónde", days: "Días", hours: "Horario", next: "Próxima sesión" },
  en: { market: "Market", where: "Where", days: "Days", hours: "Hours", next: "Next session" },
};

/** The H1 of a town's page (static: no clock), for the links that name it. */
export function marketsTownH1(slug: string, locale: MkLocale): string {
  return NAME_FOR_TITLE[slug]![locale].h1;
}

export function townView(town: MarketTown, clock: Clock, locale: MkLocale): TownView {
  const meta = NAME_FOR_TITLE[town.slug]![locale];
  const zones = answerZones(town, clock, locale);
  const rows = marketRows(town, clock, locale);
  const exceptions = exceptionViews(town, clock, locale);
  const checked = numericDate(town.checked, locale);
  return {
    title: meta.title,
    description: meta.description,
    h1: meta.h1,
    lead: answerSentence(zones[0]!, clock, locale),
    headings: HEADINGS[locale],
    cols: COLS[locale],
    zonePicker: { ca: "Tria barri o plaça", es: "Elige barrio o plaza", en: "Pick a district or square" }[locale],
    exceptions,
    noExceptions: {
      ca: "L'Ajuntament no ha publicat cap canvi de data per als propers festius. Quan un dia festiu cau en dia de mercat, el que veus és l'horari habitual.",
      es: "El Ayuntamiento no ha publicado ningún cambio de fecha para los próximos festivos. Cuando un festivo cae en día de mercado, lo que ves es el horario habitual.",
      en: "The council has published no date change for the coming holidays. When a holiday falls on a market day, what you see is the usual timetable.",
    }[locale],
    confirmNote: {
      ca: "Pendent de confirmar amb l'Ajuntament (mercats@vic.cat): només hem pogut llegir el calendari de Vic Turisme, no l'acord municipal.",
      es: "Pendiente de confirmar con el Ayuntamiento (mercats@vic.cat): solo hemos podido leer el calendario de Vic Turisme, no el acuerdo municipal.",
      en: "To be confirmed with the council (mercats@vic.cat): we could read Vic Turisme's calendar, not the council agreement.",
    }[locale],
    related: relatedViews(town, clock, locale),
    census: CENSUS_NOTES[town.slug]![locale],
    faq: faqFor(town, clock, locale),
    checked: {
      ca: `Última comprovació de les fonts: ${checked}. Dades llegides a la pàgina de l'Ajuntament; si una font falla, mantenim l'última dada validada amb aquesta data.`,
      es: `Última comprobación de las fuentes: ${checked}. Datos leídos en la página del Ayuntamiento; si una fuente falla, mantenemos el último dato validado con esta fecha.`,
      en: `Sources last checked: ${checked}. Data read on the council's page; if a source fails we keep the last validated data with this date.`,
    }[locale],
    noticeLink: { ca: "Avisos i calendari de l'Ajuntament", es: "Avisos y calendario del Ayuntamiento", en: "Council notices and calendar" }[locale],
    unconfirmedHint: { ca: "Horari habitual, sense confirmació de l'Ajuntament.", es: "Horario habitual, sin confirmación del Ayuntamiento.", en: "Usual hours, not confirmed by the council." }[locale],
    rows,
  };
}

/* -------------------------------------------------------------------------- */
/* Hub                                                                        */
/* -------------------------------------------------------------------------- */

export interface HubView {
  title: string;
  description: string;
  h1: string;
  lead: string;
  towns: { slug: string; name: string; answer: string }[];
  headingTowns: string;
  headingOthers: string;
  others: string;
  headingMethod: string;
  method: string[];
}

export function hubView(clock: Clock, locale: MkLocale): HubView {
  const towns = TOWNS.map((town) => ({ slug: town.slug, name: town.name[locale], answer: answerSentence(answerZones(town, clock, locale)[0]!, clock, locale) }));
  return {
    title: {
      ca: "Mercats setmanals a Catalunya: Vic i Mataró, dia i lloc",
      es: "Mercados semanales en Cataluña: Vic y Mataró, día y lugar",
      en: "Weekly markets in Catalonia: Vic and Mataró, day and place",
    }[locale],
    description: {
      ca: "Quan i on és el pròxim mercat setmanal a Vic i a Mataró, amb horari per plaça i canvis de festiu. Per a altres municipis, el cens oficial de la Generalitat.",
      es: "Cuándo y dónde es el próximo mercado semanal en Vic y en Mataró, con horario por plaza y cambios por festivo. Otros municipios: censo oficial de la Generalitat.",
      en: "When and where the next weekly market is in Vic and Mataró, with hours for each square and holiday changes. For other towns, the Generalitat's official census.",
    }[locale],
    h1: { ca: "Mercats setmanals a Catalunya: Vic i Mataró", es: "Mercados semanales en Cataluña: Vic y Mataró", en: "Weekly markets in Catalonia: Vic and Mataró" }[locale],
    lead: {
      ca: `La Generalitat compta ${CCAM_COUNT.markets} mercats setmanals en ${CCAM_COUNT.municipalities} municipis. Aquí en llegim, un a un, els de dues ciutats a les pàgines dels seus ajuntaments: quan és la pròxima sessió, on és i si el festiu hi canvia res.`,
      es: `La Generalitat cuenta ${CCAM_COUNT.markets} mercados semanales en ${CCAM_COUNT.municipalities} municipios. Aquí leemos, uno a uno, los de dos ciudades en las páginas de sus ayuntamientos: cuándo es la próxima sesión, dónde y si el festivo cambia algo.`,
      en: `The Generalitat counts ${CCAM_COUNT.markets} weekly markets in ${CCAM_COUNT.municipalities} municipalities. Here we read those of two towns one by one on their councils' own pages: when the next session is, where, and whether a holiday changes anything.`,
    }[locale],
    towns,
    headingTowns: { ca: "Pròxim mercat", es: "Próximo mercado", en: "Next market" }[locale],
    headingOthers: { ca: "I els altres municipis?", es: "¿Y los demás municipios?", en: "What about other towns?" }[locale],
    others: {
      ca: "Per a la resta de municipis, el cens oficial dona el dia i el lloc de cada mercat (no l'horari): el trobaràs al cens del Consorci de Comerç, Artesania i Moda, a les dades obertes i al cercador de la Diputació de Barcelona. Ampliarem la llista quan puguem mantenir-ne les fonts.",
      es: "Para el resto de municipios, el censo oficial da el día y el lugar de cada mercado (no el horario): lo encontrarás en el censo del Consorci de Comerç, Artesania i Moda, en los datos abiertos y en el buscador de la Diputación de Barcelona. Ampliaremos la lista cuando podamos mantener sus fuentes.",
      en: "For other towns, the official census gives the day and place of each market (not the hours): see the Consorci de Comerç, Artesania i Moda census, the open data and the Barcelona Provincial Council's finder. We will extend the list when we can keep its sources up to date.",
    }[locale],
    headingMethod: { ca: "Com ho comprovem", es: "Cómo lo comprobamos", en: "How we check" }[locale],
    method: {
      ca: [
        "Cada dia, hora i lloc surt de la pàgina de l'ajuntament, amb la data de lectura. Si una font falla, deixem l'última dada validada amb la seva data.",
        "Quan un festiu cau en dia de mercat i l'ajuntament no n'ha dit res, la sessió s'etiqueta «horari habitual» i enllaça l'avís municipal.",
        "Les hores són les de Catalunya (Europe/Madrid) i la pròxima sessió es recalcula cada dia.",
      ],
      es: [
        "Cada día, hora y lugar sale de la página del ayuntamiento, con la fecha de lectura. Si una fuente falla, dejamos el último dato validado con su fecha.",
        "Cuando un festivo cae en día de mercado y el ayuntamiento no ha dicho nada, la sesión se etiqueta «horario habitual» y enlaza el aviso municipal.",
        "Las horas son las de Cataluña (Europe/Madrid) y la próxima sesión se recalcula cada día.",
      ],
      en: [
        "Every day, hour and place comes from the town council's page, with the date we read it. If a source fails, we keep the last validated data with its date.",
        "When a holiday falls on a market day and the council has said nothing, the session is labelled \"usual hours\" and links the council's notice.",
        "Times are Catalonia's (Europe/Madrid) and the next session is recalculated every day.",
      ],
    }[locale],
  };
}

