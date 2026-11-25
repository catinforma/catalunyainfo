import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ShareBar, crumbPath } from "@/components/share/ShareBar";
import { MarketsContextLine, marketTownsInZone } from "@/components/programmatic/weekly-markets/ContextLinks";
import { B2_TITLES, b2href } from "@/lib/content/batch02/shared";
import { weekendWindow, type WeekendWindow } from "@/lib/content/weekend/agenda";
import { todayInCatalonia } from "@/lib/content/holidays/calendar";
import { getMessages } from "@/lib/i18n";
import { fairsHubPath } from "@/lib/programmatic/christmas-fairs/paths";
import { dayHeading, englishBarcelonaMeta, englishHubMeta, itemRange } from "@/lib/programmatic/weekend/agenda-copy";
import { inPlace, mergeBarcelona, type AgendaItem } from "@/lib/programmatic/weekend/agenda-list";
import { loadWeekendAgendas, type WeekendAgendas } from "@/lib/programmatic/weekend/agenda-server";
import { christmasFairsThisWeekend } from "@/lib/programmatic/weekend/christmas-weekend";
import { SNAPSHOT, listedFairs, shippedZones } from "@/lib/programmatic/weekend/data";
import { hubFacts, zoneFacts } from "@/lib/programmatic/weekend/facts";
import { englishHubPath, englishZonePath, hubTranslations, zonePath, zoneTranslations } from "@/lib/programmatic/weekend/paths";
import { weekendFaqNode } from "@/lib/programmatic/weekend/structured";
import type { SnapshotFair } from "@/lib/programmatic/weekend/types";
import { zoneById, zoneFilter } from "@/lib/programmatic/weekend/zones";
import { breadcrumbSchema, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

import { AgendaList, AgendaSources, ChristmasThisWeekend } from "./AgendaList";
import { WeekendFactsTable, WeekendFaq } from "./WeekendFacts";

/**
 * The English weekend pages: /en/weekend/ (Catalonia) and
 * /en/weekend/barcelona/. Server-rendered every hour with the same lists as
 * the Catalan and Spanish editions (`AgendaList`); the zone pages beyond
 * Barcelona have no English edition (no English demand), and the hub links
 * their Spanish pages.
 */

const BARCELONA = zoneById("barcelona");
const CRUMB = "This weekend";

function currentWindow(): WeekendWindow {
  return weekendWindow(todayInCatalonia());
}

function dateLine(window: { from: string; to: string }): string {
  return `${dayHeading(window.from, "en")} – ${dayHeading(window.to, "en")} ${window.to.slice(0, 4)}`;
}

const LONG_NOTE = "A public holiday makes this a long weekend: the lists cover every day of it.";

function hubCrumbs(): Crumb[] {
  return [
    { label: getMessages("en").common.home, href: "/en/" },
    { label: CRUMB, href: englishHubPath() },
  ];
}

function barcelonaCrumbs(): Crumb[] {
  return [...hubCrumbs(), { label: "Barcelona", href: englishZonePath(BARCELONA)! }];
}

function FairsNow({ fairs }: { fairs: readonly SnapshotFair[] }) {
  return (
    <ul className="ci-agenda-list mt-3">
      {fairs.map((f) => (
        <li key={f.id} className="ci-agenda-item">
          <p className="ci-agenda-title">
            {f.web ? (
              <a href={f.web} rel="noopener nofollow" target="_blank">
                {f.name}
              </a>
            ) : (
              f.name
            )}
          </p>
          <p className="ci-agenda-meta">
            {f.town} · {itemRange(f.start, f.end, "en")}
          </p>
        </li>
      ))}
    </ul>
  );
}

function FairsSource() {
  const fairs = SNAPSHOT.sources.fairs;
  return (
    <p className="mt-3 text-xs text-[var(--color-muted)]">
      Fairs: Generalitat de Catalunya. Departament d&apos;Empresa i Treball,{" "}
      <a href={fairs.url} rel="noopener nofollow" target="_blank">
        {fairs.name}
      </a>
      {fairs.updated ? `, updated ${fairs.updated}` : ""} (read {SNAPSHOT.readOn}; fair names as registered, in Catalan). Where an organiser&apos;s own page gives other dates, we show the organiser&apos;s.
    </p>
  );
}

/* -------------------------------------------------------------------------- */
/* /en/weekend/                                                               */
/* -------------------------------------------------------------------------- */

export function englishHubMetadata(window: WeekendWindow = currentWindow()): Metadata {
  const meta = englishHubMeta(window);
  return buildMetadata({ locale: "en", path: englishHubPath(), title: meta.title, description: meta.description, translations: hubTranslations() });
}

export async function EnglishHubRoute({ agendas }: { agendas?: WeekendAgendas } = {}) {
  const data = agendas ?? (await loadWeekendAgendas());
  const { window, today } = data;
  const meta = englishHubMeta(window);
  const { now: fairsNow } = listedFairs(null, window);
  const christmas = christmasFairsThisWeekend(window, today, "en");
  const items: AgendaItem[] = data.gencat.read?.items ?? [];
  const bcnCount = data.bcn.read ? mergeBarcelona(data.bcn.read.items, items).length : null;
  const zones = shippedZones().map((z) => ({ label: z.name.es, href: englishZonePath(z) ?? zonePath("es", z), en: Boolean(englishZonePath(z)) }));
  const sources = [{ source: "gencat" as const, view: data.gencat }];
  const facts = hubFacts("en", data, "in Catalonia");

  return (
    <>
      <SiteHeader locale="en" translations={hubTranslations()} activeSection={null} />
      <main id="main">
        <article>
          <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
            <div className="ci-shell py-5 md:py-8 lg:py-12">
              <Breadcrumbs items={hubCrumbs()} locale="en" />
              <h1 className="ci-measure">{meta.h1}</h1>
              <p className="ci-measure mt-3 text-lg font-semibold">
                <time dateTime={window.from}>{dateLine(window)}</time>
              </p>
              <p className="ci-measure mt-3 text-lg text-[var(--color-ink-soft)]">{meta.lead}</p>
              {window.long ? <p className="ci-measure mt-3">{LONG_NOTE}</p> : null}
              <ShareBar locale="en" path={crumbPath(hubCrumbs())} title={meta.h1} contentType="weekend_hub" />
            </div>
          </header>

          <div className="ci-shell py-10">
            <div className="ci-prose">
              <WeekendFactsTable facts={facts} />

              <p>
                <Link href={englishZonePath(BARCELONA)!}>Things to do in Barcelona this weekend</Link>
                {bcnCount ? ` — ${bcnCount} activities from the City Council's agenda and the Generalitat's, by day.` : " — from the City Council's agenda, by day."}
              </p>

              <h2 id="fairs">Fairs this weekend</h2>
              {fairsNow.length > 0 ? <FairsNow fairs={fairsNow} /> : <p>The Generalitat&apos;s fairs calendar lists no fair this weekend.</p>}

              <ChristmasThisWeekend locale="en" towns={christmas} id="christmas-markets" />

              <AgendaList locale="en" id="agenda" window={window} today={today} items={items} sources={sources} more="gencat" showTown />
              <MarketsContextLine locale="en" />
              <WeekendFaq facts={facts} />
            </div>

            <section className="mt-10" aria-labelledby="ci-weekend-zones">
              <h2 id="ci-weekend-zones">By area</h2>
              <p className="mt-2 text-sm text-[var(--color-muted)]">Each area has its own weekend page with fairs, trains and the weather; apart from Barcelona, they are in Spanish.</p>
              <ul className="mt-4 grid list-none gap-2 p-0 sm:grid-cols-2 lg:grid-cols-3">
                {zones.map((z) => (
                  <li key={z.href} className="!mt-0">
                    <Link href={z.href} hrefLang={z.en ? "en" : "es"}>
                      {z.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <p className="mt-6 text-sm">
              <Link href={fairsHubPath("en")}>Christmas markets in Catalonia, town by town</Link> ·{" "}
              <Link href={b2href("christmas", "en")}>{B2_TITLES.christmas.en}</Link>
            </p>

            <AgendaSources locale="en" sources={sources} />
            <FairsSource />
            <ShareBar locale="en" path={crumbPath(hubCrumbs())} title={meta.h1} contentType="weekend_hub" variant="full" />
          </div>
        </article>
      </main>
      <JsonLd json={graph([breadcrumbSchema(hubCrumbs()), weekendFaqNode(facts.faq)])} />
      <SiteFooter locale="en" />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* /en/weekend/barcelona/                                                     */
/* -------------------------------------------------------------------------- */

export function englishBarcelonaMetadata(window: WeekendWindow = currentWindow()): Metadata {
  const meta = englishBarcelonaMeta(window);
  return buildMetadata({ locale: "en", path: englishZonePath(BARCELONA)!, title: meta.title, description: meta.description, translations: zoneTranslations(BARCELONA) });
}

export async function EnglishBarcelonaRoute({ agendas }: { agendas?: WeekendAgendas } = {}) {
  const data = agendas ?? (await loadWeekendAgendas());
  const { window, today } = data;
  const meta = englishBarcelonaMeta(window);
  const filter = zoneFilter(BARCELONA);
  const { now: fairsNow } = listedFairs(BARCELONA, window);
  const christmas = christmasFairsThisWeekend(window, today, "en", filter);
  const gencat = (data.gencat.read?.items ?? []).filter((i) => inPlace(i, filter));
  const items = data.bcn.read ? mergeBarcelona(data.bcn.read.items, gencat) : gencat;
  const sources = [
    { source: "bcn" as const, view: data.bcn },
    { source: "gencat" as const, view: data.gencat },
  ];
  const guides = BARCELONA.guides.map((key) => ({ label: B2_TITLES[key].en, href: b2href(key, "en") }));
  const facts = zoneFacts(BARCELONA, "en", data, "in Barcelona");

  return (
    <>
      <SiteHeader locale="en" translations={zoneTranslations(BARCELONA)} activeSection={null} />
      <main id="main">
        <article>
          <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
            <div className="ci-shell py-5 md:py-8 lg:py-12">
              <Breadcrumbs items={barcelonaCrumbs()} locale="en" />
              <h1 className="ci-measure">{meta.h1}</h1>
              <p className="ci-measure mt-3 text-lg font-semibold">
                <time dateTime={window.from}>{dateLine(window)}</time>
              </p>
              <p className="ci-measure mt-3 text-lg text-[var(--color-ink-soft)]">{meta.lead}</p>
              {window.long ? <p className="ci-measure mt-3">{LONG_NOTE}</p> : null}
              <ShareBar locale="en" path={crumbPath(barcelonaCrumbs())} title={meta.h1} contentType="weekend_zone" />
            </div>
          </header>

          <div className="ci-shell py-10">
            <div className="ci-prose">
              <WeekendFactsTable facts={facts} />

              <ChristmasThisWeekend locale="en" towns={christmas} id="christmas-markets" />

              <AgendaList locale="en" id="agenda" window={window} today={today} items={items} sources={sources} more="bcn" showTown={false} />

              {fairsNow.length > 0 ? (
                <>
                  <h2 id="fairs">Fairs in the official calendar</h2>
                  <FairsNow fairs={fairsNow} />
                </>
              ) : null}
              <WeekendFaq facts={facts} />
            </div>

            <section className="mt-10" aria-labelledby="ci-weekend-guides">
              <h2 id="ci-weekend-guides">Barcelona guides</h2>
              <ul className="mt-4 grid list-none gap-2 p-0 sm:grid-cols-2 lg:grid-cols-3">
                {[...guides, { label: "Christmas markets in Catalonia, town by town", href: fairsHubPath("en") }].map((g) => (
                  <li key={g.href} className="!mt-0">
                    <Link href={g.href}>{g.label}</Link>
                  </li>
                ))}
              </ul>
            </section>
            <p className="mt-4 text-sm">
              <Link href={englishHubPath()}>Fairs and events in the rest of Catalonia this weekend</Link>
            </p>

            <AgendaSources locale="en" sources={sources} />
            {fairsNow.length > 0 ? <FairsSource /> : null}
            <ShareBar locale="en" path={crumbPath(barcelonaCrumbs())} title={meta.h1} contentType="weekend_zone" variant="full" />
          </div>
        </article>
      </main>
      <JsonLd json={graph([breadcrumbSchema(barcelonaCrumbs()), weekendFaqNode(facts.faq)])} />
      <SiteFooter locale="en" />
    </>
  );
}
