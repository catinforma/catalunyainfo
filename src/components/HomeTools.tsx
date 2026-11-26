import Link from "next/link";
import { Fragment } from "react";

import { IntentLink } from "@/components/nav/IntentLink";
import { calculatorsHubPath } from "@/lib/programmatic/calculators/paths";
import { daysBetween, holidayOn, isCovered, nextHolidayAfter, shortDate, todayInCatalonia } from "@/lib/content/holidays/calendar";
import { READ_AT } from "@/lib/content/mushrooms/conditions";
import { holidayLiveHref } from "@/lib/content/home-holiday-link";
import { HOME_CALCULATORS_COPY, TOP_TOOLS, homeCalculatorLinks, type ToolKey } from "@/lib/content/home-tools";
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
 * One line under the homepage search: the edition's five most-searched
 * calculators, then the hub (lib/content/home-tools.ts HOME_CALCULATORS, 26
 * Nov 2026). Text links, server-rendered, so the hero keeps its height on a
 * phone; prefetch on intent (IntentLink). `data-ci-placement="home_calculators"`:
 * clicks are `related_content_click` with that `link_context`.
 */
export function HomeCalculators({ locale }: { locale: Locale }) {
  const t = HOME_CALCULATORS_COPY[locale];
  return (
    <nav aria-label={t.lead.replace(/:$/, "")} className="ci-measure mt-6 text-sm" data-ci-placement="home_calculators">
      <p className="m-0">
        <strong>{t.lead}</strong>{" "}
        {homeCalculatorLinks(locale).map((link) => (
          <Fragment key={link.href}>
            <IntentLink href={link.href}>{link.label}</IntentLink>
            {/* No-break space: the dot ends a line, never starts one (27 Nov 2026). */}
            {"\u00a0· "}
          </Fragment>
        ))}
        <IntentLink href={calculatorsHubPath(locale)}>{t.all}</IntentLink>
      </p>
    </nav>
  );
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
          // 23 Nov 2026: the next-holiday line links that day's own page; the
          // title keeps the hub link and still covers the rest of the tile.
          const liveHref = live ? holidayLiveHref(locale, todayInCatalonia()) : null;
          if (live && liveHref) {
            return (
              <li key={key}>
                <div className="ci-home-top-tile is-split">
                  <Link href={MENU_PATHS[key][locale]} className="ci-home-top-title ci-home-top-cover">
                    {MENU_LABELS[key][locale]}
                  </Link>
                  <Link href={liveHref} className="ci-home-top-live">
                    {live}
                  </Link>
                </div>
              </li>
            );
          }
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
