import Link from "next/link";

import { daysBetween, holidayOn, isCovered, nextHolidayAfter, shortDate, todayInCatalonia } from "@/lib/content/holidays/calendar";
import { READ_AT } from "@/lib/content/mushrooms/conditions";
import { ORDER, PATHS, type ToolKey } from "@/lib/content/home-tools";
import { hrefFor } from "@/lib/content/repository";
import { getMessages } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";

/**
 * The site's live utilities, straight under the hero.
 *
 * GA4 measured about 1.4 seconds of engagement per visit on the English
 * homepage: people arrived, saw a tagline and a grid of recent articles, and
 * left. The pages that hold readers (transport passes, tourist tax, the
 * weekend agenda, holidays, mushroom conditions) were all one search away and
 * none of them was on the page. These are the answers, so they come first.
 *
 * Each card carries one live line where we have a fact computed from verified
 * data at render time (the homepage revalidates every ten minutes), never a
 * placeholder.
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

export function HomeTools({ locale }: { locale: Locale }) {
  const t = getMessages(locale).home.tools;

  return (
    <section className="ci-shell py-10" aria-labelledby="home-tools">
      <div className="ci-section-head">
        <h2 id="home-tools">{t.title}</h2>
      </div>
      <ul className="ci-tools">
        {ORDER[locale].map((key) => {
          const live = liveLine(key, locale);
          return (
            <li key={key}>
              <Link href={hrefFor(locale, PATHS[key][locale])} className="ci-tool">
                <span className="ci-tool-title">{t[key].title}</span>
                <span className="ci-tool-desc">{t[key].desc}</span>
                {live ? <span className="ci-tool-live">{live}</span> : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
