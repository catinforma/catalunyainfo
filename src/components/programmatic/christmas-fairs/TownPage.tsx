import Link from "next/link";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { LinkList } from "@/components/programmatic/weekend/parts";
import { B2_TITLES, b2href } from "@/lib/content/batch02/shared";
import { renderInline } from "@/lib/content/inline";
import { getMessages } from "@/lib/i18n";
import { hubMeta, labels, statusLabels, townH1, townLead, townName } from "@/lib/programmatic/christmas-fairs/copy";
import {
  FAIRS,
  comarcaOf,
  hasEnglish,
  holidayDatesIn,
  holidayTown,
  lastChecked,
  linesFor,
  nearbyTowns,
  pendingFor,
  towns,
  weekendZoneFor,
  type Town,
} from "@/lib/programmatic/christmas-fairs/data";
import { shortRange } from "@/lib/programmatic/christmas-fairs/format";
import { holidaySentences, regionalHolidaysIn, trainLines, weekendSentence } from "@/lib/programmatic/christmas-fairs/guide";
import { fairsHubPath, townPath, type FairsLocale } from "@/lib/programmatic/christmas-fairs/paths";

import { FairCard, Guidance, PendingList, Sources, datedFairs } from "./parts";
import { FairStatus } from "./FairStatus";

export function townCrumbs(town: Town, locale: FairsLocale): Crumb[] {
  const meta = hubMeta(locale, { fairs: FAIRS.length, towns: towns().length }, lastChecked(town));
  return [
    { label: getMessages(locale).common.home, href: `/${locale}/` },
    { label: meta.crumb, href: fairsHubPath(locale) },
    { label: townName(town.name, locale), href: townPath(locale, town.slug) },
  ];
}

const GUIDES = ["christmas", "christmasBarcelona", "pessebres", "christmasTraditions", "shops"] as const;

/** One town's Christmas fairs, with how to get there, holidays and shops on those days, and what is nearby. */
export function TownPage({ town, locale }: { town: Town; locale: FairsLocale }) {
  const t = labels(locale);
  const checked = lastChecked(town);
  const pending = pendingFor(town.ine);
  const trains = trainLines(town.name, linesFor(town), locale);
  const holiday = holidayTown(town.ine);
  const fairDays = (d: string) => town.fairs.some((f) => d >= f.start && d <= f.end);
  const holidays = holidaySentences(
    town.name,
    {
      regional: regionalHolidaysIn(town.fairs, locale),
      local: (holiday?.local ?? []).filter(fairDays),
      shops: holiday?.shops ?? [],
      holidaySlug: holiday?.slug ?? null,
      datePages: [...new Set(town.fairs.flatMap((f) => holidayDatesIn(f.start, f.end)))].sort(),
    },
    locale,
  );
  const zone = locale === "en" ? null : weekendZoneFor(town);
  const nearby = nearbyTowns(town, 12)
    .filter((n) => locale !== "en" || hasEnglish(n))
    .slice(0, 6)
    .map((n) => ({
      label: townName(n.name, locale),
      href: townPath(locale, n.slug),
      note: `${n.fairs[0]!.name} · ${shortRange(n.fairs[0]!.start, n.fairs[0]!.end, locale)}`,
    }));
  const guides = GUIDES.map((key) => ({ label: B2_TITLES[key][locale], href: b2href(key, locale) }));

  return (
    <article>
      <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
        <div className="ci-shell py-5 md:py-8 lg:py-12">
          <Breadcrumbs items={townCrumbs(town, locale)} locale={locale} />
          <h1 className="ci-measure">{townH1(town, locale)}</h1>
          <p className="ci-measure mt-3 text-lg text-[var(--color-ink-soft)]">{townLead({ ...town, comarcaName: comarcaOf(town) }, locale, checked)}</p>
        </div>
      </header>

      <div className="ci-shell py-10">
        <div className="ci-prose">
          <FairStatus fairs={datedFairs(town.fairs, locale)} locale={locale} labels={statusLabels(locale, "town", town.name)} showTown={false} />

          <h2 id="fira">{town.fairs.length > 1 ? t.fairsMany : t.fairs}</h2>
          {town.fairs.map((f) => (
            <FairCard key={f.id} fair={f} locale={locale} />
          ))}

          {pending.length > 0 ? (
            <>
              <h3>{t.stillPending}</h3>
              <PendingList markets={pending} locale={locale} />
            </>
          ) : null}

          <h2 id="com-arribar">{t.getThere}</h2>
          <p>{renderInline(trains.intro)}</p>
          {trains.items.length > 0 ? (
            <ul>
              {trains.items.map((item) => (
                <li key={item}>{renderInline(item)}</li>
              ))}
            </ul>
          ) : null}
          {trains.outro ? <p>{renderInline(trains.outro)}</p> : null}

          <h2 id="festius">{t.holidays}</h2>
          {holidays.map((text) => (
            <p key={text}>{renderInline(text)}</p>
          ))}

          {locale !== "en" ? (
            <>
              <h2 id="cap-de-setmana">{t.weekend}</h2>
              <p>{renderInline(weekendSentence(zone, locale))}</p>
            </>
          ) : null}

          <Guidance locale={locale} />
        </div>

        <LinkList title={t.nearby} id="ci-xmas-nearby" links={nearby} />
        <p className="mt-4 text-sm">
          <Link href={fairsHubPath(locale)}>{t.allFairs}</Link>
        </p>
        <LinkList title={t.guides} id="ci-xmas-guides" links={guides} />
        <Sources locale={locale} fairs={town.fairs} />
      </div>
    </article>
  );
}
