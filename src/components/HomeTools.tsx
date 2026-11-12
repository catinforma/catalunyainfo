import Link from "next/link";

import { daysBetween, holidayOn, isCovered, nextHolidayAfter, shortDate, todayInCatalonia } from "@/lib/content/holidays/calendar";
import { READ_AT } from "@/lib/content/mushrooms/conditions";
import { TOP_TOOLS, type ToolKey } from "@/lib/content/home-tools";
import { MENU_LABELS, MENU_PATHS } from "@/lib/nav/menu";
import { getMessages } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";

/**
 * Live lines for the homepage top tiles. The "Útil ara mateix" card grid
 * that sat between the hero and the articles was removed on 12 Nov 2026 at
 * the owner's request: on a phone it pushed the articles a screen down.
 */

function liveLine(key: ToolKey, locale: Locale): string | null {
  const t = getMessages(locale).home.tools;
  if (key === "holiday") {
    const today = todayInCatalonia();
    if (!isCovered(today)) return null;
    const holiday = holidayOn(today);
    if (holiday) return t.holidayYes.replace("{name}", holiday.name[locale]);
    const next = nextHolidayAfter(today);
    if (!next) return null;
    return t.holidayNext
      .replace("{name}", next.name[locale])
      .replace("{date}", shortDate(next.date, locale))
      .replace("{n}", String(daysBetween(today, next.date)));
  }
  if (key === "mushrooms") return t.mushroomsRead.replace("{date}", shortDate(READ_AT, locale));
  return null;
}

/**
 * The most-searched utilities, first thing under the homepage title
 * (lib/content/home-tools.ts TOP_TOOLS): one compact tile each, labelled as in
 * the site menu, with the next-holiday line on the holidays tile.
 */
export function HomeTopTools({ locale }: { locale: Locale }) {
  const t = getMessages(locale).home.tools;
  return (
    <nav aria-label={t.title} className="ci-home-top">
      <ul>
        {TOP_TOOLS[locale].map((key) => {
          const live = key === "holidays" ? liveLine("holiday", locale) : null;
          return (
            <li key={key}>
              <Link href={MENU_PATHS[key][locale]} className="ci-home-top-tile">
                <span className="ci-home-top-title">{MENU_LABELS[key][locale]}</span>
                {live ? <span className="ci-home-top-live">{live}</span> : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
