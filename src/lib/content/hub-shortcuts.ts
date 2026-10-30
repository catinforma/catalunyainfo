import type { Locale } from "@/lib/i18n/config";
import { b2href } from "@/lib/content/batch02/shared";
import { PATHS } from "@/lib/content/home-tools";
import { hubTranslations as electionsHubs } from "@/lib/programmatic/elections/pages";
import { fuelHubTranslations } from "@/lib/programmatic/fuel/paths";
import { hubTranslations as holidayHubs } from "@/lib/programmatic/holidays/paths";
import { reservoirHubTranslations } from "@/lib/programmatic/reservoirs/paths";
import { hubTranslations as rodaliesHubs } from "@/lib/programmatic/rodalies/paths";
import { TODAY_NAME, todayTranslations } from "@/lib/programmatic/today/paths";
import { hubTranslations as weekendHubs } from "@/lib/programmatic/weekend/paths";

/**
 * The "right now" strip at the top of each section hub.
 *
 * On a phone a hub used to open on its heading and one full-screen article
 * card, with the live tools (holidays per town, Rodalies, fuel...) nowhere in
 * sight: the menu led to a date-ordered pile instead of to the answers. Each
 * hub now leads with the tools for its section. Paths come from the modules
 * that own them, so a renamed route cannot leave a dead shortcut here; an
 * entry without a page in a language is simply not shown in that language.
 */

export type HubSection = "destinations" | "guides" | "events";

interface Shortcut {
  label: Record<Locale, string>;
  href: Partial<Record<Locale, string>>;
}

const page = (paths: Record<Locale, string>): Record<Locale, string> => ({
  ca: `/ca/${paths.ca}/`,
  es: `/es/${paths.es}/`,
  en: `/en/${paths.en}/`,
});

const TODAY: Shortcut = {
  label: TODAY_NAME,
  href: todayTranslations(),
};
const HOLIDAY_TODAY: Shortcut = {
  label: { ca: "És festiu avui?", es: "¿Hoy es festivo?", en: "Is today a holiday?" },
  href: page(PATHS.holiday),
};
const HOLIDAYS_BY_TOWN: Shortcut = {
  label: { ca: "Festius per municipi", es: "Festivos por municipio", en: "Local holidays" },
  href: holidayHubs(),
};
const STRIKES: Shortcut = {
  label: { ca: "Vaga avui", es: "Huelga hoy", en: "Strike today" },
  href: { ca: b2href("strikes", "ca"), es: b2href("strikes", "es"), en: b2href("strikes", "en") },
};
const RODALIES: Shortcut = {
  label: { ca: "Rodalies en directe", es: "Rodalies en directo", en: "Rodalies trains today" },
  href: rodaliesHubs(),
};
const METRO: Shortcut = {
  label: { ca: "Horari del metro", es: "Horario del metro", en: "Metro hours" },
  href: { ca: b2href("hours", "ca"), es: b2href("hours", "es"), en: b2href("hours", "en") },
};
const FUEL: Shortcut = {
  label: { ca: "Benzineres barates", es: "Gasolineras baratas", en: "Fuel prices" },
  href: fuelHubTranslations(),
};
const RESERVOIRS: Shortcut = {
  label: { ca: "Embassaments avui", es: "Embalses hoy", en: "Reservoirs today" },
  href: reservoirHubTranslations(),
};
const ELECTIONS: Shortcut = {
  label: { ca: "Resultats per municipi", es: "Resultados por municipio", en: "Election results" },
  href: electionsHubs(),
};
const WEEKEND: Shortcut = {
  label: { ca: "Aquest cap de setmana", es: "Este fin de semana", en: "This weekend" },
  href: page(PATHS.weekend),
};
const WEEKEND_BY_ZONE: Shortcut = {
  label: { ca: "Cap de setmana per zones", es: "Fin de semana por zonas", en: "Weekend by area" },
  href: weekendHubs(),
};
const MUSHROOMS: Shortcut = {
  label: { ca: "On hi ha bolets", es: "Dónde hay setas", en: "Mushroom conditions" },
  href: page(PATHS.mushrooms),
};
const SNOW: Shortcut = {
  label: { ca: "Neu avui al Pirineu", es: "Nieve hoy en el Pirineo", en: "Snow in the Pyrenees" },
  href: page(PATHS.snowNow),
};

const BY_SECTION: Record<HubSection, Shortcut[]> = {
  guides: [TODAY, HOLIDAY_TODAY, HOLIDAYS_BY_TOWN, STRIKES, RODALIES, METRO, FUEL, RESERVOIRS, ELECTIONS],
  events: [TODAY, WEEKEND, WEEKEND_BY_ZONE, HOLIDAY_TODAY, STRIKES, MUSHROOMS, SNOW],
  destinations: [TODAY, WEEKEND_BY_ZONE, RODALIES, SNOW, RESERVOIRS, FUEL, MUSHROOMS],
};

export const SHORTCUTS_HEADING: Record<Locale, string> = {
  ca: "Ara mateix",
  es: "Ahora mismo",
  en: "Right now",
};

/** The shortcuts a hub shows in one language, in order, without missing pages. */
export function hubShortcuts(section: string, locale: Locale): { label: string; href: string }[] {
  const list = BY_SECTION[section as HubSection];
  if (!list) return [];
  return list.flatMap((item) => {
    const href = item.href[locale];
    return href ? [{ label: item.label[locale], href }] : [];
  });
}
