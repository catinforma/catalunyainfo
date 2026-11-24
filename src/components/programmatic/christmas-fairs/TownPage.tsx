import { AdSlot } from "@/components/AdSlot";
import Link from "next/link";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { NextStep } from "@/components/NextStep";
import { PlacePhoto } from "@/components/PlacePhoto";
import { TownHub } from "@/components/TownHub";
import { ShareBar, crumbPath } from "@/components/share/ShareBar";
import { LinkList } from "@/components/programmatic/weekend/parts";
import { B2_TITLES, b2href } from "@/lib/content/batch02/shared";
import { renderInline } from "@/lib/content/inline";
import { fairPagePhoto } from "@/lib/content/place-photos";
import { christmasNextStep } from "@/lib/engagement/next-step";
import { townHub } from "@/lib/engagement/town-hub";
import { getMessages } from "@/lib/i18n";
import { confirmationNote, hubMeta, labels, statusLabels, townH1, townLead, townName } from "@/lib/programmatic/christmas-fairs/copy";
import {
  FAIRS,
  comarcaOf,
  hasEnglish,
  holidayDatesIn,
  holidayTown,
  lastChecked,
  linesFor,
  nearbyTowns,
  outingDays,
  pendingFor,
  sameWeekendFairs,
  towns,
  weekendZoneFor,
  type Town,
} from "@/lib/programmatic/christmas-fairs/data";
import { BODY_HOLDS } from "@/lib/programmatic/christmas-fairs/organisers";
import { shortRange } from "@/lib/programmatic/christmas-fairs/format";
import { holidaySentences, regionalHolidaysIn, trainLines, weekendSentence } from "@/lib/programmatic/christmas-fairs/guide";
import { fairsHubPath, townPath, type FairsLocale } from "@/lib/programmatic/christmas-fairs/paths";

import { FairAccess, FairCard, FairProgramme, GuidanceShort, PendingList, Sources, datedFairs } from "./parts";
import { FairStatus } from "./FairStatus";

export function townCrumbs(town: Town, locale: FairsLocale): Crumb[] {
  const meta = hubMeta(locale, { fairs: FAIRS.length, towns: towns().length }, lastChecked(town));
  return [
    { label: getMessages(locale).common.home, href: `/${locale}/` },
    { label: meta.crumb, href: fairsHubPath(locale) },
    { label: townName(town.name, locale), href: townPath(locale, town.slug) },
  ];
}

const GUIDES = ["christmas", "christmasBarcelona", "decemberBridge", "pessebres", "reis", "christmasTraditions", "shops"] as const;
/** Barcelona's page also links the month's dated hub. */
const BARCELONA_INE = "08019";

/** One town's Christmas fairs, with how to get there, holidays and shops on those days, and what is nearby. */
export function TownPage({ town, locale }: { town: Town; locale: FairsLocale }) {
  const t = labels(locale);
  const checked = lastChecked(town);
  const pending = pendingFor(town.ine);
  const trains = trainLines(town.name, linesFor(town), locale);
  const holiday = holidayTown(town.ine);
  const fairDays = (d: string) => town.fairs.some((f) => d >= f.start && d <= f.end);
  const regional = regionalHolidaysIn(town.fairs, locale);
  const local = (holiday?.local ?? []).filter(fairDays);
  // The "is it a holiday?" pages for the fair days that are holidays here.
  const holidayDays = new Set([...regional.map((h) => h.date), ...local]);
  const holidays = holidaySentences(
    town.name,
    {
      regional,
      local,
      shops: holiday?.shops ?? [],
      holidaySlug: holiday?.slug ?? null,
      datePages: [...new Set(town.fairs.flatMap((f) => holidayDatesIn(f.start, f.end)))].filter((d) => holidayDays.has(d)).sort(),
    },
    locale,
  );
  const zone = locale === "en" ? null : weekendZoneFor(town);
  // Other towns' fairs on the same days out (20 Nov 2026), except on a town whose body is held for a title test.
  const held = Boolean(BODY_HOLDS[town.ine]);
  const sameWeekend = held
    ? []
    : sameWeekendFairs(town, locale === "en" ? 99 : 16)
        .filter((s) => locale !== "en" || hasEnglish(s.town))
        .slice(0, 8);
  const sameWeekendLinks = sameWeekend.map((s) => ({
    label: townName(s.town.name, locale),
    href: townPath(locale, s.town.slug),
    note: `${s.fair.name} · ${shortRange(s.fair.start, s.fair.end, locale)}`,
  }));
  const sameWeekendIne = new Set(sameWeekend.map((s) => s.town.ine));
  // English: only 5 towns have a page, so they are picked from every town, not from the 12 nearest (Vic's English
  // page was linked from the hub and Barcelona only: its nearest 12 towns have no English page).
  const nearby = nearbyTowns(town, 12, locale === "en" ? hasEnglish : undefined)
    .filter((n) => !sameWeekendIne.has(n.ine))
    .slice(0, 6)
    .map((n) => ({
      label: townName(n.name, locale),
      href: townPath(locale, n.slug),
      note: `${n.fairs[0]!.name} · ${shortRange(n.fairs[0]!.start, n.fairs[0]!.end, locale)}`,
    }));
  const guideKeys = town.ine === BARCELONA_INE ? (["barcelonaDecember", ...GUIDES] as const) : GUIDES;
  const guides = guideKeys.map((key) => ({ label: B2_TITLES[key][locale], href: b2href(key, locale) }));
  const withDetails = town.fairs.filter((f) => f.details);
  const accessTitle = withDetails.length === 1 ? (withDetails[0]!.details!.accessTitle?.[locale] ?? null) : null;

  return (
    <article>
      <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
        <div className="ci-shell py-5 md:py-8 lg:py-12">
          <Breadcrumbs items={townCrumbs(town, locale)} locale={locale} />
          <h1 className="ci-measure">{townH1(town, locale)}</h1>
          <p className="ci-measure mt-3 text-lg text-[var(--color-ink-soft)]">
            {[townLead({ ...town, comarcaName: comarcaOf(town) }, locale, checked), confirmationNote(town.fairs, locale)].filter(Boolean).join(" ")}
          </p>
          <ShareBar locale={locale} path={crumbPath(townCrumbs(town, locale))} title={townH1(town, locale)} contentType="christmas_fairs_town" />
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

          {/* The organiser's programme, when its pages were read for this edition (organisers.ts `details`). */}
          {withDetails.map((f) => (
            <FairProgramme key={f.id} fair={f} locale={locale} heading={withDetails.length === 1} />
          ))}

          {/* The next useful step (lib/engagement/next-step.ts): the lights switch-on and the December holidays (Barcelona: December's agenda).
              Dated by the day the fairs were last read, like the rest of the page: the server render stays clock-free. */}
          <NextStep
            step={christmasNextStep(locale, crumbPath(townCrumbs(town, locale)), checked, { barcelona: town.ine === BARCELONA_INE })}
            locale={locale}
          />

          {/* The fair's (else the town's) licensed photograph (lib/content/place-photos.ts): after the fair cards and
              the next step, so the dates keep their place; lazy-loaded. */}
          <PlacePhoto photo={fairPagePhoto(town.slug, locale)} locale={locale} />

          <AdSlot kind="top" locale={locale} path={crumbPath(townCrumbs(town, locale))} />
          <h2 id="com-arribar">{accessTitle ?? t.getThere}</h2>
          <FairAccess fairs={withDetails} locale={locale} />
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

          <GuidanceShort locale={locale} />

          {/* The town's other pages (lib/engagement/town-hub.ts), led by its holiday page; dated by the last read, like the page. */}
          <TownHub hub={townHub(town.slug, locale, "fair", checked)} />
        </div>

        {sameWeekendLinks.length > 0 ? (
          <LinkList title={town.fairs.some((f) => outingDays(f.start, f.end).length > 3) ? t.sameDays : t.sameWeekend} id="ci-xmas-same-weekend" links={sameWeekendLinks} />
        ) : null}
        <LinkList title={t.nearby} id="ci-xmas-nearby" links={nearby} />
        <p className="mt-4 text-sm">
          <Link href={fairsHubPath(locale)}>{t.allFairs}</Link>
        </p>
        <LinkList title={t.guides} id="ci-xmas-guides" links={guides} />
        <Sources locale={locale} fairs={town.fairs} />
        <ShareBar locale={locale} path={crumbPath(townCrumbs(town, locale))} title={townH1(town, locale)} contentType="christmas_fairs_town" variant="full" />
      </div>
    </article>
  );
}
