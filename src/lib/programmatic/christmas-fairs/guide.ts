/**
 * The original guidance on a town page, as sentences (inline Markdown): how to
 * get there by train or bus, which fair days are holidays and when the town's
 * shops may open, and where the rest of the weekend's plans are. Pure: every
 * fact comes in through the arguments, from the committed snapshots of the
 * Rodalies, holiday and weekend families.
 */

import { b2href, B2_TITLES } from "@/lib/content/batch02/shared";
import { addDays, holidayOn } from "@/lib/content/holidays/calendar";
import { dateQuestion } from "@/lib/programmatic/holidays/copy";
import { datePath, hubPath as holidayHub, municipalityPath, type DatePage } from "@/lib/programmatic/holidays/paths";
import { caA, caDe, caStart, joinList } from "@/lib/programmatic/holidays/names";
import { hubPath as rodaliesHub, linePath } from "@/lib/programmatic/rodalies/paths";
import { weekendHubPath, zonePath } from "@/lib/programmatic/weekend/paths";
import type { ZoneDef } from "@/lib/programmatic/weekend/zones";

import { MOUTE_URL, townName } from "./copy";
import { dayMonth, weekday } from "./format";
import type { FairsLocale } from "./paths";

interface Line {
  id: Parameters<typeof linePath>[1];
  name: string;
  journey: string;
  stations: string[];
}

/** "How to get there": the town's Rodalies / regional stations, each linked to its line's live status; or the bus. */
export function trainLines(townNameRaw: string, lines: readonly Line[], locale: FairsLocale): { intro: string; items: string[]; outro: string } {
  const town = townName(townNameRaw, locale);
  const live = rodaliesHub(locale);
  if (lines.length === 0) {
    const intro =
      locale === "ca"
        ? `${caStart(townNameRaw)} no té estació de Rodalies ni de trens regionals. En transport públic, l'opció és l'autobús interurbà: busca el trajecte a [Mou-te](${MOUTE_URL}), el cercador de transport públic de la Generalitat, i comprova a quina hora surt l'últim autobús de tornada.`
        : locale === "es"
          ? `${town} no tiene estación de Rodalies ni de trenes regionales. En transporte público, la opción es el autobús interurbano: busca el trayecto en [Mou-te](${MOUTE_URL}), el buscador de transporte público de la Generalitat, y comprueba a qué hora sale el último autobús de vuelta.`
          : `${town} has no Rodalies or regional train station. By public transport, the option is the intercity bus: plan the journey on [Mou-te](${MOUTE_URL}), the Catalan government's public transport planner, and check when the last bus back leaves.`;
    return { intro, items: [], outro: "" };
  }
  const intro =
    locale === "ca"
      ? `En tren, ${townNameRaw} té estació de:`
      : locale === "es"
        ? `En tren, ${town} tiene estación de:`
        : `By train, ${town} is on:`;
  const items = lines.map((l) => {
    const href = locale === "en" ? live : linePath(locale, l.id);
    const at = joinList(l.stations, locale);
    return locale === "ca"
      ? `[${l.name}](${href}) (${l.journey}): estació de ${at}.`
      : locale === "es"
        ? `[${l.name}](${href}) (${l.journey}): estación de ${at}.`
        : `[${l.name}](${href}) (${l.journey}): ${at} station.`;
  });
  const outro =
    locale === "ca"
      ? `Abans de sortir, mira [l'estat de Rodalies en directe](${live}): avisos, obres i trens afectats. Per arribar-hi en autobús, [Mou-te](${MOUTE_URL}).`
      : locale === "es"
        ? `Antes de salir, mira [el estado de Rodalies en directo](${live}): avisos, obras y trenes afectados. Para llegar en autobús, [Mou-te](${MOUTE_URL}).`
        : `Before you set off, check [Rodalies live status](${live}) for notices, works and affected trains. By bus, use [Mou-te](${MOUTE_URL}).`;
  return { intro, items, outro };
}

export interface HolidayFacts {
  /** Days of the fairs that are Catalonia-wide holidays, with their names. */
  regional: { date: string; name: string }[];
  /** Days of the fairs that are the town's own local holidays. */
  local: string[];
  /** Sundays and holidays of the season when the town's shops may open (holiday snapshot). */
  shops: string[];
  /** The town's holiday page slug, when it has one (ca/es). */
  holidaySlug: string | null;
  /** "Is it a holiday?" date pages that fall on a fair day. */
  datePages: DatePage[];
}

/** Every day from start to end (inclusive), at most 60. */
export function days(start: string, end: string): string[] {
  const out: string[] = [];
  for (let d = start; d <= end && out.length < 60; d = addDays(d, 1)) out.push(d);
  return out;
}

/** Catalonia-wide holidays on the fairs' days, from the official calendar (Ordres EMT/66/2025, EMT/52/2026). */
export function regionalHolidaysIn(fairs: readonly { start: string; end: string }[], locale: FairsLocale): { date: string; name: string }[] {
  const seen = new Map<string, string>();
  for (const f of fairs) {
    for (const d of days(f.start, f.end)) {
      const h = holidayOn(d);
      if (h && h.scope === "catalonia") seen.set(d, h.name[locale]);
    }
  }
  return [...seen.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, name]) => ({ date, name }));
}

/** "Holidays and shops on those days". */
export function holidaySentences(townNameRaw: string, facts: HolidayFacts, locale: FairsLocale): string[] {
  const town = townName(townNameRaw, locale);
  const out: string[] = [];
  const when = (d: string) => `${weekday(d, locale)} ${dayMonth(d, locale)}`;
  if (facts.regional.length > 0) {
    const list = joinList(
      facts.regional.map((h) => `${when(h.date)} (${h.name})`),
      locale,
    );
    out.push(
      locale === "ca"
        ? `${facts.regional.length === 1 ? "Un dels dies de fira és festiu" : "Alguns dels dies de fira són festius"} a tot Catalunya: ${list}.`
        : locale === "es"
          ? `${facts.regional.length === 1 ? "Uno de los días de feria es festivo" : "Algunos de los días de feria son festivos"} en toda Cataluña: ${list}.`
          : `${facts.regional.length === 1 ? "One of the market days is a public holiday" : "Some of the market days are public holidays"} across Catalonia: ${list}.`,
    );
  }
  if (facts.local.length > 0) {
    const list = joinList(facts.local.map(when), locale);
    out.push(
      locale === "ca"
        ? `També és festa local ${caA(townNameRaw)}: ${list}.`
        : locale === "es"
          ? `También es fiesta local en ${town}: ${list}.`
          : `It is also a local holiday in ${town}: ${list}.`,
    );
  }
  if (facts.shops.length > 0) {
    const list = joinList(facts.shops.map((d) => dayMonth(d, locale)), locale);
    out.push(
      locale === "ca"
        ? `Diumenges i festius d'aquesta temporada en què les botigues ${caDe(townNameRaw)} poden obrir, segons el calendari comercial de la Generalitat: ${list}.`
        : locale === "es"
          ? `Domingos y festivos de esta temporada en que las tiendas de ${town} pueden abrir, según el calendario comercial de la Generalitat: ${list}.`
          : `Sundays and holidays this season when shops in ${town} may open, under the Catalan government's trading calendar: ${list}.`,
    );
  }
  const links: string[] = [];
  if (locale !== "en") {
    links.push(
      facts.holidaySlug
        ? locale === "ca"
          ? `[tots els festius ${caDe(townNameRaw)}](${municipalityPath("ca", facts.holidaySlug)})`
          : `[todos los festivos de ${town}](${municipalityPath("es", facts.holidaySlug)})`
        : locale === "ca"
          ? `[els festius locals de cada municipi](${holidayHub("ca")})`
          : `[los festivos locales de cada municipio](${holidayHub("es")})`,
    );
  }
  for (const d of facts.datePages) links.push(`[${dateQuestion(d, locale)}](${datePath(locale, d)})`);
  links.push(`[${B2_TITLES.shops[locale]}](${b2href("shops", locale)})`);
  out.push(locale === "ca" ? `Mira també: ${joinList(links, "ca")}.` : locale === "es" ? `Mira también: ${joinList(links, "es")}.` : `See also: ${joinList(links, "en")}.`);
  return out;
}

/** "The rest of the weekend": the weekend zone page (ca/es only). */
export function weekendSentence(zone: ZoneDef | null, locale: "ca" | "es"): string {
  if (!zone) {
    return locale === "ca"
      ? `Per a la resta de plans, mira [les fires i mercats de cada cap de setmana](${weekendHubPath("ca")}).`
      : `Para el resto de planes, mira [las ferias y mercados de cada fin de semana](${weekendHubPath("es")}).`;
  }
  return locale === "ca"
    ? `Per a la resta de plans del cap de setmana ${zone.in.ca} (l'agenda cultural, les altres fires, el tren i el temps), mira [què fer aquest cap de setmana ${zone.in.ca}](${zonePath("ca", zone)}).`
    : `Para el resto de planes del fin de semana ${zone.in.es} (la agenda cultural, las otras ferias, el tren y el tiempo), mira [qué hacer este fin de semana ${zone.in.es}](${zonePath("es", zone)}).`;
}

