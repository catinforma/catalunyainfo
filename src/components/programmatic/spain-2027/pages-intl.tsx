import Link from "next/link";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { ShareBar, crumbPath } from "@/components/share/ShareBar";
import { WidgetHubLink } from "@/components/programmatic/embed-2027/WidgetLink";
import { getMessages } from "@/lib/i18n";
import { REGIONS } from "@/lib/programmatic/holidays/boe-2027";
import { municipalities } from "@/lib/programmatic/holidays/data";
import { englishTownBySlug } from "@/lib/programmatic/holidays/english";
import { enName } from "@/lib/programmatic/holidays/english-copy";
import { dayMonthYear } from "@/lib/programmatic/holidays/format";
import { GUIDES } from "@/lib/programmatic/holidays/links";
import { caStart } from "@/lib/programmatic/holidays/names";
import { hubPath, municipalityPath } from "@/lib/programmatic/holidays/paths";
import {
  COMMON_DATES,
  YEAR,
  commonRows,
  communityDays,
  communityRuns,
  communityRunsWithLocal,
  dayCount,
  ownDays,
  runSummary,
  spainRuns,
  variableDates,
} from "@/lib/programmatic/spain-2027/calendar";
import { citiesOf } from "@/lib/programmatic/spain-2027/cities";
import { CATALAN_CITIES } from "@/lib/programmatic/spain-2027/cities-data";
import { cityListLineIntl } from "@/lib/programmatic/spain-2027/city-copy-intl";
import {
  BOE_LEGEND_INTL,
  BRIDGES_INTL,
  HUB_INTL,
  KIND_LABEL_INTL,
  communityFaqIntl,
  communityH1Intl,
  communityLeadIntl,
  compactDatesIntl,
  computedNote,
  dayNameIntl,
  decreeLineIntl,
  everywhereFreeIntl,
  holidayLabel,
  hubLeadIntl,
  localStatusLineIntl,
  notKeptLineIntl,
  rangeCellIntl,
  rangeWordsIntl,
  regionsWordsIntl,
  runLineIntl,
  tr,
  weekdayDateIntl,
  weekendLineIntl,
  whereElseIntl,
} from "@/lib/programmatic/spain-2027/copy-intl";
import {
  editionBridgesPath,
  editionCityName,
  editionCityPath,
  editionCommunitiesAZ,
  editionCommunityPath,
  editionHubPath,
  editionNames,
  type Edition,
  type EditionNames,
} from "@/lib/programmatic/spain-2027/editions";
import { BOE_REF, SOURCES, SOURCES_READ_ON, type OfficialText } from "@/lib/programmatic/spain-2027/sources";
import { SOURCE_PROSE, placeName } from "@/lib/programmatic/spain-2027/sources-intl";

/**
 * The Catalan and English editions of the Spain-wide 2027 pages (pages.tsx
 * is the Spanish one): the same sections and facts, every link to a page of
 * the same language.
 */

export function hubCrumbsIntl(locale: Edition): Crumb[] {
  return [
    { label: getMessages(locale).common.home, href: `/${locale}/` },
    { label: HUB_INTL[locale].breadcrumb, href: editionHubPath(locale) },
  ];
}

export function communityCrumbsIntl(c: EditionNames, locale: Edition): Crumb[] {
  return [...hubCrumbsIntl(locale), { label: c.short, href: editionCommunityPath(locale, c.region) }];
}

export function bridgesCrumbsIntl(locale: Edition): Crumb[] {
  return [...hubCrumbsIntl(locale), { label: BRIDGES_INTL[locale].breadcrumb, href: editionBridgesPath(locale) }];
}

export function Header({ crumbs, h1, lead, locale }: { crumbs: Crumb[]; h1: string; lead?: string; locale: Edition }) {
  return (
    <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
      <div className="ci-shell py-5 md:py-8 lg:py-12">
        <Breadcrumbs items={crumbs} locale={locale} />
        <h1 className="ci-measure">{h1}</h1>
        {lead ? <p className="ci-measure mt-4 text-lg text-[var(--color-ink-soft)]">{lead}</p> : null}
        <ShareBar locale={locale} path={crumbPath(crumbs)} title={h1} contentType="holidays_2027" />
      </div>
    </header>
  );
}

export function SourceList({ items, locale, title }: { items: (OfficialText | null | undefined)[]; locale: Edition; title?: string }) {
  const shown = items.filter((i): i is OfficialText => Boolean(i)).filter((item, i, all) => all.findIndex((x) => x.url === item.url) === i);
  return (
    <section className="ci-measure mt-12" aria-labelledby="ci-es27-sources">
      <h2 id="ci-es27-sources" className="font-sans text-base font-semibold">
        {title ?? tr(locale, "Fonts oficials", "Official sources")}
      </h2>
      <p className="mt-1 text-xs text-[var(--color-muted)]">
        <time dateTime={SOURCES_READ_ON}>
          {tr(locale, `Consultades el ${dayMonthYear(SOURCES_READ_ON, "ca")} als butlletins oficials.`, `Read in the official bulletins on ${dayMonthYear(SOURCES_READ_ON, "en")}.`)}
        </time>
      </p>
      <ol className="ci-sources mt-3">
        {shown.map((item) => (
          <li key={item.url}>
            <span>
              <a href={item.url} rel="noopener nofollow" target="_blank" hrefLang="es">
                {item.title}
              </a>
              <span className="text-[var(--color-muted)]"> — {item.ref}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** The Catalan cities in scope with a town page in the page's language (English has town pages only for its selection). */
function catalanTowns(locale: Edition) {
  return CATALAN_CITIES.map((row) => ({ row, town: municipalities().find((m) => m.ine === row.ine) ?? null }))
    .filter((x) => x.town !== null && (locale === "ca" || englishTownBySlug(x.town.slug) !== null))
    .map((x) => ({ row: x.row, town: x.town! }))
    .sort((a, b) => b.row.population - a.row.population);
}

function CityList({ c, locale }: { c: EditionNames; locale: Edition }) {
  if (c.region === "CT") {
    const towns = catalanTowns(locale);
    return (
      <>
        <h2 id="ciutats">{tr(locale, "Festius locals de les ciutats de Catalunya", "Local holidays in Catalonia's cities")}</h2>
        <p>
          {tr(
            locale,
            `Cada municipi català té la seva pàgina amb les 2 festes locals, les del ${YEAR} tan bon punt les aprova l'ajuntament o les publica el DOGC. Les capitals i les ciutats de més de 50.000 habitants:`,
            `Catalan towns have pages of their own with their 2 local holidays, the ${YEAR} ones as soon as the council approves them or the DOGC publishes them. The larger cities:`,
          )}
        </p>
        <ul className="grid list-none gap-1 p-0 sm:grid-cols-2">
          {towns.map(({ town }) => (
            <li key={town.ine}>
              <Link href={municipalityPath(locale, town.slug)}>
                {locale === "ca" ? `Festius ${caDeName(town.name)}` : `${enName(town)} public holidays`}
              </Link>
            </li>
          ))}
        </ul>
        {locale === "en" ? (
          <p>
            <Link href={hubPath("en")}>Public holidays in Catalonia, town by town</Link>
          </p>
        ) : null}
      </>
    );
  }
  const cities = citiesOf(c.region);
  if (cities.length === 0) return null;
  return (
    <>
      <h2 id="ciutats">{tr(locale, `Festius locals del ${YEAR} per ciutat`, `${YEAR} local holidays by city`)}</h2>
      <p>
        {locale === "ca"
          ? `Les festes locals ${cities.length === 1 ? "de la capital" : `de les ${cities.length} ciutats principals`} ${c.of}: les del ${YEAR} on ja s'han publicat i, si no, les del 2026 com a referència. Cada pàgina cita el butlletí oficial d'on surten.`
          : `The local holidays of ${cities.length === 1 ? "the capital" : `the ${cities.length} main cities`} ${c.of}: the ${YEAR} ones where they are out and, where not, the 2026 ones for reference. Each page cites the official bulletin they come from.`}
      </p>
      <div className="ci-table-scroll mt-4">
        <table className="ci-local-table">
          <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">
            {tr(
              locale,
              "Capitals de província i municipis de més de 50.000 habitants (INE, 1 de gener de 2025).",
              "Provincial capitals and municipalities with over 50,000 inhabitants (INE, 1 January 2025).",
            )}
          </caption>
          <thead>
            <tr>
              <th scope="col">{tr(locale, "Ciutat", "City")}</th>
              <th scope="col">{tr(locale, `Festes locals ${YEAR}`, `${YEAR} local holidays`)}</th>
            </tr>
          </thead>
          <tbody>
            {cities.map((city) => (
              <tr key={city.slug}>
                <th scope="row" className="font-normal">
                  <Link href={editionCityPath(locale, city)}>{caStart(editionCityName(city, locale))}</Link>
                </th>
                <td>{cityListLineIntl(city, locale)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/** "de Girona", "de l'Hospitalet", "del Vendrell". */
function caDeName(name: string): string {
  if (name.startsWith("el ")) return `del ${name.slice(3)}`;
  if (name.startsWith("els ")) return `dels ${name.slice(4)}`;
  if (/^(la|les) /.test(name) || name.startsWith("l'")) return `de ${name}`;
  return /^[aeiouàèéíïòóúüh]/i.test(name) ? `d'${name}` : `de ${name}`;
}

function HubCityList({ locale }: { locale: Edition }) {
  const groups = editionCommunitiesAZ(locale)
    .map((c) => ({ c, cities: citiesOf(c.region) }))
    .filter((g) => g.cities.length > 0);
  return (
    <>
      <h2 id="ciutats">{tr(locale, `Festius locals del ${YEAR} de les ciutats principals`, `${YEAR} local holidays in the main cities`)}</h2>
      <p>
        {tr(
          locale,
          `Les 2 festes locals del ${YEAR} de les capitals de província i les ciutats de més de 50.000 habitants (padró del 2025), cadascuna amb el seu butlletí oficial; on la llista del ${YEAR} encara no ha sortit, «pendent» i les del 2026 com a referència. Les ciutats de Catalunya són a les seves `,
          `The 2 local holidays for ${YEAR} in every provincial capital and every city of over 50,000 people (2025 register), each with its official bulletin; where the ${YEAR} list is not out yet, "pending" and the 2026 days for reference. Catalonia's cities are on their `,
        )}
        <Link href={`${editionCommunityPath(locale, "CT")}#ciutats`}>{tr(locale, "pàgines de municipi", "town pages")}</Link>
        {tr(locale, "; Ceuta i Melilla, a la seva.", "; Ceuta and Melilla on their own.")}
      </p>
      {groups.map(({ c, cities }) => (
        <p key={c.slug}>
          <strong>
            <Link href={editionCommunityPath(locale, c.region)}>{c.short}</Link>:
          </strong>{" "}
          {cities.map((city, i) => (
            <span key={city.slug}>
              {i > 0 ? " · " : ""}
              <Link href={editionCityPath(locale, city)}>{caStart(editionCityName(city, locale))}</Link>{" "}
              <small className="text-[var(--color-muted)]">({cityListLineIntl(city, locale)})</small>
            </span>
          ))}
        </p>
      ))}
    </>
  );
}

function CommunityLinks({ exclude, locale }: { exclude?: string; locale: Edition }) {
  return (
    <section className="mt-12" aria-labelledby="ci-es27-others">
      <h2 id="ci-es27-others">{tr(locale, `Calendari laboral ${YEAR} de cada comunitat`, `${YEAR} work calendar for every region`)}</h2>
      <ul className="mt-4 grid list-none gap-2 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {editionCommunitiesAZ(locale)
          .filter((c) => c.slug !== exclude)
          .map((c) => (
            <li key={c.slug}>
              <Link href={editionCommunityPath(locale, c.region)}>{tr(locale, `Festius ${YEAR} ${c.in}`, `${c.short} holidays ${YEAR}`)}</Link>{" "}
              <small className="text-[var(--color-muted)]">({dayCount(c.region)})</small>
            </li>
          ))}
      </ul>
      <p className="mt-4 text-sm">
        <Link href={editionHubPath(locale)}>{tr(locale, `${HUB_INTL.ca.breadcrumb}: festius comuns i per comunitat`, `${HUB_INTL.en.breadcrumb}: shared and regional days`)}</Link>
        {" · "}
        <Link href={editionBridgesPath(locale)}>{tr(locale, `Ponts ${YEAR} a Espanya`, `Long weekends in Spain ${YEAR}`)}</Link>
      </p>
    </section>
  );
}

/* ------------------------------------------------------------ Community --- */

export function CommunityPageIntl({ c, locale }: { c: EditionNames; locale: Edition }) {
  const days = communityDays(c.region);
  const runs = communityRuns(c.region);
  const summary = runSummary(runs);
  const s = SOURCES[c.region];
  const prose = SOURCE_PROSE[c.region][locale];
  const own = ownDays(c.region);
  const weekend = weekendLineIntl(c, locale);
  const notKept = notKeptLineIntl(c, locale);
  const faq = communityFaqIntl(c, locale);
  const decree = s.decree;
  const moved = new Map(decree.status === "published" ? decree.moves.map((m) => [m.date, m.replaces] as const) : []);
  const wd = (iso: string) => weekdayDateIntl(iso, locale);
  const ca = locale === "ca";
  const whose = ca ? (c.city ? "de la ciutat" : "de la comunitat") : c.city ? "the city's" : "the community's";
  const localWord = (st: typeof s.local.status) =>
    st === "published" ? tr(locale, "Publicats", "Published") : st === "partial" ? tr(locale, "Publicats en part", "Partly published") : tr(locale, "Pendents de publicar", "Not yet published");

  return (
    <article>
      <Header crumbs={communityCrumbsIntl(c, locale)} h1={communityH1Intl(c, locale)} locale={locale} />

      <div className="ci-shell py-10">
        <div className="ci-prose">
          <p className="ci-lead">{communityLeadIntl(c, locale)}</p>

          <dl className="ci-facts">
            <dt>{tr(locale, `Festius ${YEAR}`, `Holidays ${YEAR}`)}</dt>
            <dd>
              {days.length}
              {prose.subRegional ? tr(locale, ` a tot el territori, més 1 ${prose.subRegional.unit}`, ` across the territory, plus 1 ${prose.subRegional.unit}`) : ""} (
              {compactDatesIntl(
                days.map((d) => d.date),
                locale,
              )}
              )
            </dd>
            <dt>{tr(locale, `Propis ${whose} o no comuns`, `Not shared by all of Spain`)}</dt>
            <dd>{own.length}</dd>
            <dt>{tr(locale, "Caps de setmana llargs sense vacances", "Long weekends with no leave")}</dt>
            <dd>
              {summary.free} <small>({tr(locale, "calculat", "worked out")})</small>
            </dd>
            <dt>{tr(locale, `Festius locals ${YEAR}`, `Local holidays ${YEAR}`)}</dt>
            <dd>{localWord(s.local.status)}</dd>
          </dl>

          <h2 id="festius">{tr(locale, `Els ${days.length} festius del ${YEAR} ${c.in}`, `The ${days.length} public holidays of ${YEAR} ${c.in}`)}</h2>
          <div className="ci-table-scroll mt-4">
            <table className="ci-local-table ci-stack-table">
              <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">
                {tr(locale, `Festes laborals del ${YEAR} ${c.in}, tal com les publica el BOE (${BOE_REF.id}).`, `Public holidays ${c.in} in ${YEAR}, as published in the BOE (${BOE_REF.id}).`)}
              </caption>
              <thead>
                <tr>
                  <th scope="col">{tr(locale, "Data", "Date")}</th>
                  <th scope="col">{tr(locale, "Festivitat", "Holiday")}</th>
                  <th scope="col">{tr(locale, "Tipus (BOE)", "Type (BOE)")}</th>
                  <th scope="col">{tr(locale, "On més?", "Where else?")}</th>
                </tr>
              </thead>
              <tbody>
                {days.map((d) => (
                  <tr key={`${d.date}-${d.name}`}>
                    <th scope="row" className="font-normal">
                      <time dateTime={d.date}>{wd(d.date)}</time>
                    </th>
                    <td data-label={tr(locale, "Festivitat", "Holiday")}>
                      {dayNameIntl(d, locale)}
                      {moved.has(d.date)
                        ? tr(locale, ` (trasllat del ${wd(moved.get(d.date)!)}, segons el decret ${whose})`, ` (moved from ${wd(moved.get(d.date)!)}, under ${whose} decree)`)
                        : ""}
                    </td>
                    <td data-label={tr(locale, "Tipus (BOE)", "Type (BOE)")}>{KIND_LABEL_INTL[locale][d.code]}</td>
                    <td data-label={tr(locale, "On més?", "Where else?")}>{whereElseIntl(d, locale)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {weekend ? <p>{weekend}</p> : null}
          {s.boeNote ? (
            <div role="note" className="ci-callout ci-callout-official">
              <p>
                <strong>{tr(locale, "Nota del BOE (en castellà, tal com la publica):", "BOE footnote (in Spanish, as published):")}</strong> <span lang="es">{s.boeNote}</span>
              </p>
            </div>
          ) : null}
          {s.subRegional && prose.subRegional ? (
            <>
              <h3>{prose.subRegional.title}</h3>
              <ul>
                {s.subRegional.items.map((i) => (
                  <li key={i.place}>
                    {placeName(i.place, locale)}: {wd(i.date)} ({i.name})
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          <h2 id="diferencies">{tr(locale, "Què canvia respecte a la resta d'Espanya", "How it differs from the rest of Spain")}</h2>
          <p>
            {tr(locale, `Són festius a tot Espanya el ${YEAR}: `, `Holidays across Spain in ${YEAR}: `)}
            {commonRows()
              .map((r) => `${holidayLabel(r.name, locale)} (${wd(r.date)})`)
              .join(", ")}
            .
          </p>
          <p>
            {own.length > 0
              ? ca
                ? `${c.Full} hi ${c.plural ? "afegeixen" : "afegeix"} ${own.length === 1 ? "aquest" : `aquests ${own.length}`}: ${own.map((d) => `${dayNameIntl(d, locale)}, ${wd(d.date)} (${lower(whereElseIntl(d, locale))})`).join("; ")}.`
                : `${c.Full} ${c.plural ? "add" : "adds"} ${own.length === 1 ? "this one" : `these ${own.length}`}: ${own.map((d) => `${dayNameIntl(d, locale)}, ${wd(d.date)} (${lower(whereElseIntl(d, locale))})`).join("; ")}.`
              : tr(locale, `${c.Full} no ${c.plural ? "tenen" : "té"} festius diferents dels comuns.`, `${c.Full} ${c.plural ? "have" : "has"} no holidays beyond the shared ones.`)}
          </p>
          {notKept ? <p>{notKept}</p> : null}

          <h2 id="ponts">{tr(locale, `Ponts i caps de setmana llargs del ${YEAR} ${c.in}`, `Long weekends and bridges ${c.in} in ${YEAR}`)}</h2>
          <p>
            {tr(
              locale,
              `${summary.free} sense gastar vacances, ${summary.oneDay} amb 1 dia de vacances i ${summary.twoDays} amb 2.`,
              `${summary.free} with no leave, ${summary.oneDay} with 1 day of leave and ${summary.twoDays} with 2.`,
            )}
          </p>
          <ul>
            {runs.map((r) => (
              <li key={`${r.from}-${r.to}-${r.take.join()}`}>{runLineIntl(r, locale)}</li>
            ))}
          </ul>
          <p className="text-sm text-[var(--color-muted)]">{computedNote(locale)}</p>

          <h2 id="locals">{tr(locale, `Festius locals del ${YEAR} ${c.in}`, `Local holidays ${c.in} in ${YEAR}`)}</h2>
          <p>
            {tr(locale, "Cada municipi té, a més, fins a 2 festius locals. ", "Each municipality also has up to 2 local holidays. ")}
            {prose.how}{" "}
            <a href={s.local.bulletinUrl} rel="noopener nofollow" target="_blank" hrefLang="es">
              {s.local.bulletinName}
            </a>
            .
          </p>
          <p>
            <strong>{tr(locale, "Estat:", "Status:")}</strong> {localStatusLineIntl(c, s.local, locale)}{" "}
            {s.local.status === "published" && s.local.y2027 ? (
              <a href={s.local.y2027.url} rel="noopener nofollow" target="_blank" hrefLang="es">
                {tr(locale, `Llista oficial del ${YEAR}`, `Official ${YEAR} list`)}
              </a>
            ) : s.local.y2026 ? (
              <a href={s.local.y2026.url} rel="noopener nofollow" target="_blank" hrefLang="es">
                {tr(locale, "Llista del 2026", "The 2026 list")}
              </a>
            ) : null}
          </p>
          {s.local.parts?.length ? (
            <ul>
              {s.local.parts.map((p) => (
                <li key={p.place}>
                  {placeName(p.place, locale)}:{" "}
                  <a href={p.text.url} rel="noopener nofollow" target="_blank" hrefLang="es">
                    {p.text.title}
                  </a>{" "}
                  <span className="text-[var(--color-muted)]">({p.text.ref})</span>
                </li>
              ))}
            </ul>
          ) : null}
          {prose.note && s.local.status !== "partial" ? <p>{prose.note}</p> : null}
          {s.local.days?.length && s.local.daysScope === "common" ? (
            <>
              <p>
                {tr(locale, "Un dels 2 festius locals és el mateix a tota la comunitat: ", "One of the 2 local holidays is the same across the community: ")}
                {s.local.days.map((d) => (
                  <span key={d.date}>
                    <time dateTime={d.date}>{wd(d.date)}</time> ({d.name})
                  </span>
                ))}
                {tr(locale, ". Ponts comptant també aquest dia (calculats):", ". Long weekends counting that day too (worked out):")}
              </p>
              <ul>
                {communityRunsWithLocal(
                  c.region,
                  s.local.days.map((d) => d.date),
                )
                  .filter((r) => s.local.days!.some((d) => d.date >= r.from && d.date <= r.to))
                  .map((r) => (
                    <li key={`${r.from}-${r.to}-${r.take.join()}`}>{runLineIntl(r, locale)}</li>
                  ))}
              </ul>
            </>
          ) : null}
          {s.local.days?.length && s.local.daysScope === "all" ? (
            <>
              <p>
                {tr(locale, `Les 2 festes locals de ${c.short} el ${YEAR}: `, `${c.short}'s 2 local holidays in ${YEAR}: `)}
                {s.local.days.map((d, i) => (
                  <span key={d.date}>
                    {i > 0 ? tr(locale, " i ", " and ") : ""}
                    <time dateTime={d.date}>{wd(d.date)}</time> ({d.name})
                  </span>
                ))}
                {tr(
                  locale,
                  `. Amb aquestes, ${c.short} té ${days.length + s.local.days.length} festius el ${YEAR}.`,
                  `. With them, ${c.short} has ${days.length + s.local.days.length} holidays in ${YEAR}.`,
                )}
              </p>
              <p>{tr(locale, "Ponts comptant també les festes locals (calculats):", "Long weekends counting the local holidays too (worked out):")}</p>
              <ul>
                {communityRunsWithLocal(
                  c.region,
                  s.local.days.map((d) => d.date),
                ).map((r) => (
                  <li key={`${r.from}-${r.to}-${r.take.join()}`}>{runLineIntl(r, locale)}</li>
                ))}
              </ul>
            </>
          ) : null}
          {s.local.dataset ? (
            <p>
              {tr(locale, "Dades obertes: ", "Open data: ")}
              <a href={s.local.dataset.url} rel="noopener nofollow" target="_blank">
                {s.local.dataset.name}
              </a>
              .
            </p>
          ) : null}
          {c.region === "CT" ? (
            <p>
              {ca ? (
                <>
                  Festius de cada municipi català: <Link href={hubPath("ca")}>festius locals dels 947 municipis de Catalunya</Link>
                  {" · "}
                  <Link href={GUIDES.bridges2027.ca}>Ponts 2027 a Catalunya, municipi a municipi</Link>.
                </>
              ) : (
                <>
                  Holidays in each Catalan town: <Link href={hubPath("en")}>public holidays in Catalonia, town by town</Link>
                  {" · "}
                  <Link href={GUIDES.bridges2027.en}>Long weekends in Catalonia in 2027</Link>.
                </>
              )}
            </p>
          ) : null}

          <CityList c={c} locale={locale} />

          <h2 id="font">{tr(locale, "Font i comprovació", "Source and cross-check")}</h2>
          <p>
            {tr(
              locale,
              `La llista és la del BOE: ${BOE_REF.title} (${BOE_REF.ref}), que reuneix els calendaris que les 17 comunitats i Ceuta i Melilla van enviar al Ministeri de Treball. `,
              `The list is the BOE's: ${BOE_REF.title} (${BOE_REF.ref}), which brings together the calendars the 17 communities, Ceuta and Melilla sent to the Ministry of Labour. `,
            )}
            {decreeLineIntl(c, locale)}
          </p>
          {prose.decreeNote ? <p>{prose.decreeNote}</p> : null}
          {decree.status === "published" && decree.quotes.length > 0 ? (
            <>
              <p>{tr(locale, "En paraules del text (en castellà):", "In the text's own words (in Spanish):")}</p>
              <ul>
                {decree.quotes.map((q) => (
                  <li key={q} lang="es">
                    «{q}»
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          <h2 id="preguntes">{tr(locale, "Preguntes freqüents", "Frequently asked questions")}</h2>
          {faq.map((item) => (
            <section key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </section>
          ))}
        </div>

        <CommunityLinks exclude={c.slug} locale={locale} />

        <SourceList
          locale={locale}
          items={[
            BOE_REF,
            decree.status === "published" ? decree.text : null,
            s.local.y2027 && s.local.y2027.url !== (decree.status === "published" ? decree.text.url : "") ? s.local.y2027 : null,
            ...(s.local.parts ?? []).map((p) => p.text),
            s.local.y2026,
            ...(s.extraSources ?? []),
          ]}
        />
        <ShareBar locale={locale} path={crumbPath(communityCrumbsIntl(c, locale))} title={communityH1Intl(c, locale)} contentType="holidays_2027" variant="full" />
      </div>
    </article>
  );
}

function lower(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

/* ------------------------------------------------------------------ Hub --- */

export function SpainHubPageIntl({ locale }: { locale: Edition }) {
  const variable = variableDates();
  const free = everywhereFreeIntl();
  const wd = (iso: string) => weekdayDateIntl(iso, locale);
  const statusWord = (st: string) =>
    st === "published" ? tr(locale, "Publicats", "Published") : st === "partial" ? tr(locale, "En part", "Partly") : tr(locale, "Pendents", "Pending");
  return (
    <article>
      <Header crumbs={hubCrumbsIntl(locale)} h1={HUB_INTL[locale].h1} lead={hubLeadIntl(locale)} locale={locale} />

      <div className="ci-shell py-10">
        <div className="ci-prose">
          <h2 id="comunitats">{tr(locale, `Festius ${YEAR} per comunitat autònoma`, `${YEAR} holidays by autonomous community`)}</h2>
          <div className="ci-table-scroll mt-4">
            <table className="ci-local-table ci-stack-table">
              <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">
                {tr(
                  locale,
                  `Dies que cada comunitat i ciutat afegeix als ${COMMON_DATES.length} comuns, segons el BOE.`,
                  `The days each community and city adds to the ${COMMON_DATES.length} shared ones, according to the BOE.`,
                )}
              </caption>
              <thead>
                <tr>
                  <th scope="col">{tr(locale, "Comunitat", "Community")}</th>
                  <th scope="col">{tr(locale, "Festius", "Holidays")}</th>
                  <th scope="col">{tr(locale, "A més dels comuns", "On top of the shared ones")}</th>
                  <th scope="col">{tr(locale, `Festius locals ${YEAR}`, `Local holidays ${YEAR}`)}</th>
                </tr>
              </thead>
              <tbody>
                {editionCommunitiesAZ(locale).map((c) => {
                  const s = SOURCES[c.region];
                  const island = SOURCE_PROSE[c.region][locale].subRegional;
                  return (
                    <tr key={c.slug}>
                      <th scope="row" className="font-normal">
                        <Link href={editionCommunityPath(locale, c.region)}>{c.short}</Link>
                      </th>
                      <td data-label={tr(locale, "Festius", "Holidays")}>
                        {dayCount(c.region)}
                        {island ? ` + 1 ${island.unit}` : ""}
                      </td>
                      <td data-label={tr(locale, "Propis", "Own")}>
                        {ownDays(c.region)
                          .map((d) => `${d.replaces ? tr(locale, "trasllat de l'Assumpció", "Assumption, moved") : holidayLabel(d.name, locale)} (${compactDatesIntl([d.date], locale)})`)
                          .join("; ")}
                      </td>
                      <td data-label={tr(locale, `Locals ${YEAR}`, `Local ${YEAR}`)}>{statusWord(s.local.status)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <h2 id="comuns">{tr(locale, `Els ${COMMON_DATES.length} festius comuns a tot Espanya el ${YEAR}`, `The ${COMMON_DATES.length} holidays shared by all of Spain in ${YEAR}`)}</h2>
          <ul>
            {commonRows().map((r) => (
              <li key={r.date}>
                {wd(r.date)}: {holidayLabel(r.name, locale)}
              </li>
            ))}
          </ul>

          <h2 id="variables">{tr(locale, "Festius que canvien segons la comunitat", "Holidays that vary by region")}</h2>
          <ul>
            {variable.map((v) => (
              <li key={v.date}>
                <strong>{wd(v.date)}</strong> ({v.rows.map((r) => holidayLabel(r.name, locale)).join(" / ")}): {regionsWordsIntl(v.regions, locale)}.
              </li>
            ))}
          </ul>
          <p>
            {tr(locale, "Tipus de festa segons el BOE: ", "Holiday types in the BOE: ")}
            {Object.entries(BOE_LEGEND_INTL[locale])
              .map(([code, label]) => `${code} ${label}`)
              .join("; ")}
            .
          </p>

          <h2 id="ponts">{tr(locale, `Ponts del ${YEAR} a tot Espanya`, `Long weekends across Spain in ${YEAR}`)}</h2>
          <p>
            {tr(
              locale,
              `Sense gastar vacances i a totes les comunitats: ${free.map((r) => rangeWordsIntl(r.from, r.to, locale)).join("; ")}. La Setmana Santa dona com a mínim 4 dies seguits a tot arreu; la resta de ponts depèn de cada comunitat. `,
              `With no leave and in every region: ${free.map((r) => rangeWordsIntl(r.from, r.to, locale)).join("; ")}. Easter gives at least 4 days in a row everywhere; the other long weekends depend on the region. `,
            )}
            <Link href={editionBridgesPath(locale)}>{tr(locale, `Tots els ponts del ${YEAR}, comunitat per comunitat`, `Every long weekend of ${YEAR}, region by region`)}</Link>.
          </p>
          <p className="text-sm text-[var(--color-muted)]">{computedNote(locale)}</p>

          <h2 id="locals">{tr(locale, `Festius locals del ${YEAR}`, `Local holidays in ${YEAR}`)}</h2>
          <p>
            {tr(
              locale,
              `A més dels dies del BOE, cada municipi té fins a 2 festius locals, que cada comunitat publica al seu butlletí (o, a Castella i Lleó i al País Basc, els butlletins de cada província). Estat a ${dayMonthYear(SOURCES_READ_ON, "ca")}:`,
              `Besides the BOE days, every municipality has up to 2 local holidays, which each community publishes in its own bulletin (in Castile and León and the Basque Country, the bulletins of each province). Status as of ${dayMonthYear(SOURCES_READ_ON, "en")}:`,
            )}
          </p>
          <ul>
            {editionCommunitiesAZ(locale).map((c) => (
              <li key={c.slug}>
                <Link href={`${editionCommunityPath(locale, c.region)}#locals`}>{c.short}</Link>: {localStatusLineIntl(c, SOURCES[c.region].local, locale)}
              </li>
            ))}
          </ul>

          <HubCityList locale={locale} />
          <WidgetHubLink locale={locale} />
        </div>

        <CommunityLinks locale={locale} />

        <SourceList items={[BOE_REF]} locale={locale} />
        <ShareBar locale={locale} path={crumbPath(hubCrumbsIntl(locale))} title={HUB_INTL[locale].h1} contentType="holidays_2027" variant="full" />
      </div>
    </article>
  );
}

/* -------------------------------------------------------------- Bridges --- */

export function SpainBridgesPageIntl({ locale }: { locale: Edition }) {
  const runs = spainRuns();
  const free = everywhereFreeIntl();
  const regionLink = (region: (typeof REGIONS)[number]) => (
    <Link href={editionCommunityPath(locale, region)}>{editionNames(region, locale).short}</Link>
  );
  const lead = tr(
    locale,
    `Sense gastar vacances, el ${YEAR} hi ha ${free.length} caps de setmana llargs a tot Espanya: ${free.map((r) => rangeWordsIntl(r.from, r.to, locale)).join("; ")}. La resta de ponts depèn de la comunitat: aquí hi són tots, amb els dies de vacances que demanen.`,
    `With no leave, ${YEAR} has ${free.length} long weekends across Spain: ${free.map((r) => rangeWordsIntl(r.from, r.to, locale)).join("; ")}. The rest depend on the region: here they all are, with the days of leave each one takes.`,
  );
  return (
    <article>
      <Header crumbs={bridgesCrumbsIntl(locale)} h1={BRIDGES_INTL[locale].h1} lead={lead} locale={locale} />

      <div className="ci-shell py-10">
        <div className="ci-prose">
          <p className="text-sm text-[var(--color-muted)]">{computedNote(locale)}</p>

          <h2 id="tots">{tr(locale, `Tots els ponts del ${YEAR}, i on`, `Every long weekend of ${YEAR}, and where`)}</h2>
          <div className="ci-table-scroll mt-4">
            <table className="ci-local-table ci-stack-table">
              <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">
                {tr(
                  locale,
                  `Caps de setmana llargs i ponts del ${YEAR} calculats amb els festius del BOE de cada comunitat.`,
                  `Long weekends and bridges of ${YEAR}, worked out from each community's BOE holidays.`,
                )}
              </caption>
              <thead>
                <tr>
                  <th scope="col">{tr(locale, "Dates", "Dates")}</th>
                  <th scope="col">{tr(locale, "Dies seguits", "Days in a row")}</th>
                  <th scope="col">{tr(locale, "Vacances", "Leave")}</th>
                  <th scope="col">{tr(locale, "Festiu", "Holiday")}</th>
                  <th scope="col">{tr(locale, "On", "Where")}</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((r) => (
                  <tr key={`${r.from}-${r.to}-${r.take.join()}`}>
                    <th scope="row" className="font-normal">
                      {rangeCellIntl(r.from, r.to, locale)}
                    </th>
                    <td data-label={tr(locale, "Dies seguits", "Days in a row")}>{r.days}</td>
                    <td data-label={tr(locale, "Vacances", "Leave")}>
                      {r.take.length === 0 ? tr(locale, "Cap", "None") : r.take.map((t) => weekdayDateIntl(t, locale)).join(", ")}
                    </td>
                    <td data-label={tr(locale, "Festiu", "Holiday")}>{r.holidays.map((h) => holidayLabel(h.name, locale)).join(", ")}</td>
                    <td data-label={tr(locale, "On", "Where")}>
                      {r.regions.length === REGIONS.length ? (
                        tr(locale, "Tot Espanya", "All of Spain")
                      ) : r.regions.length >= 15 ? (
                        <>
                          {tr(locale, "Tot Espanya excepte ", "All of Spain except ")}
                          {REGIONS.filter((x) => !r.regions.includes(x)).map((region, i) => (
                            <span key={region}>
                              {i > 0 ? ", " : ""}
                              {regionLink(region)}
                            </span>
                          ))}
                        </>
                      ) : (
                        r.regions.map((region, i) => (
                          <span key={region}>
                            {i > 0 ? ", " : ""}
                            {regionLink(region)}
                          </span>
                        ))
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 id="per-comunitat">{tr(locale, "Caps de setmana llargs sense vacances, per comunitat", "Long weekends with no leave, by region")}</h2>
          <ul>
            {editionCommunitiesAZ(locale).map((c) => {
              const mine = communityRuns(c.region).filter((r) => r.take.length === 0);
              return (
                <li key={c.slug}>
                  <Link href={`${editionCommunityPath(locale, c.region)}#ponts`}>{c.short}</Link>: {mine.length} (
                  {mine.map((r) => rangeCellIntl(r.from, r.to, locale)).join("; ")})
                </li>
              );
            })}
          </ul>
        </div>

        <CommunityLinks locale={locale} />

        <SourceList items={[BOE_REF]} locale={locale} />
        <ShareBar locale={locale} path={crumbPath(bridgesCrumbsIntl(locale))} title={BRIDGES_INTL[locale].h1} contentType="holidays_2027" variant="full" />
      </div>
    </article>
  );
}
