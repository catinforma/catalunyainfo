import { connection } from "next/server";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { renderInline } from "@/lib/content/inline";
import { INTL_LOCALE, type Locale } from "@/lib/i18n/config";
import { ORG_NAMES, POLLS_PAGE_UPDATED, dateLabel, pollsCopy, spanLabel, type PollsCopy } from "@/lib/programmatic/polls/copy";
import { pollsPageData } from "@/lib/programmatic/polls/data";
import { pollsCrumbs, pollsSchemas } from "@/lib/programmatic/polls/page";
import { pollsTranslations } from "@/lib/programmatic/polls/paths";
import type { EstimateColumn, EstimateRow, EstimateTable, ExpectedPoll, Figure, PollLinks, PublishedPoll } from "@/lib/programmatic/polls/types";
import { graph } from "@/lib/seo/jsonld";

import { PollsReload } from "./PollsReload";

/**
 * The 29N official-polls page (CIS, CEO).
 *
 * Request-time only: `connection()` makes rendering wait for a real request
 * before the clock is read (the route is also `force-dynamic`), and
 * `pollsPageData(now)` is the only way a figure reaches this tree. Inside the
 * LOREG 69.7 window it returns no poll at all, so the HTML and the RSC payload
 * cannot carry one; the rest of the page (the law, when figures return, the
 * official results) is the same in both states. A Server Component: the
 * figures are rendered here and never passed to the client as props.
 */
export async function PollsPage({ locale }: { locale: Locale }) {
  await connection();
  const data = pollsPageData(new Date());
  const copy = pollsCopy(locale);
  const crumbs = pollsCrumbs(locale);

  return (
    <>
      <SiteHeader locale={locale} translations={pollsTranslations()} activeSection="guides" />
      <main id="main">
        <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
          <div className="ci-shell py-5 md:py-8 lg:py-12">
            <Breadcrumbs items={crumbs} locale={locale} />
            <h1 className="ci-measure">{copy.title}</h1>
            <p className="ci-measure mt-4 text-lg text-[var(--color-ink-soft)]">{renderInline(copy.lead)}</p>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--color-muted)]">
              <span className="ci-verified">
                <span className="ci-verified-dot" aria-hidden="true" />
                <time dateTime={POLLS_PAGE_UPDATED}>{copy.verified(POLLS_PAGE_UPDATED)}</time>
              </span>
            </div>
          </div>
        </header>

        <div className="ci-shell py-10">
          <div className="ci-prose">
            {data.state === "open" ? (
              <>
                <section aria-labelledby="polls-rule" className="ci-callout ci-callout-warning">
                  <h2 id="polls-rule" className="!mt-0 font-sans text-base font-semibold">
                    {copy.ruleTitle}
                  </h2>
                  <p className="mt-1">{renderInline(copy.rule)}</p>
                </section>
                <PollsList polls={data.polls} copy={copy} locale={locale} />
                <PollsReload at={Date.parse(data.blackoutStartsAt)} />
              </>
            ) : (
              <section aria-labelledby="polls-blackout" className="ci-callout ci-callout-official">
                <h2 id="polls-blackout" className="!mt-0 font-sans text-base font-semibold">
                  {copy.blackoutTitle}
                </h2>
                {copy.blackout.map((text) => (
                  <p key={text} className="mt-2">
                    {renderInline(text)}
                  </p>
                ))}
              </section>
            )}

            <h2 id="read">{copy.readTitle}</h2>
            {copy.read.map((text) => (
              <p key={text}>{renderInline(text)}</p>
            ))}

            <h2 id="law">{copy.lawTitle}</h2>
            {copy.law.map((text) => (
              <p key={text}>{renderInline(text)}</p>
            ))}

            <h2 id="results">{copy.resultsTitle}</h2>
            {copy.results.map((text) => (
              <p key={text}>{renderInline(text)}</p>
            ))}

            <h2 id="faq">{copy.faqTitle}</h2>
            {copy.faq.map((item) => (
              <div key={item.question}>
                <h3>{item.question}</h3>
                <p>{renderInline(item.answer)}</p>
              </div>
            ))}

            <h2 id="sources">{copy.sourcesTitle}</h2>
            <ul>
              {copy.sources.map((source) => (
                <li key={source.url}>
                  <a href={source.url} rel="noopener nofollow" target="_blank">
                    {source.name}
                  </a>{" "}
                  <span className="text-[var(--color-muted)]">— {source.publisher}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
      <JsonLd json={graph(pollsSchemas(locale))} />
      <SiteFooter locale={locale} />
    </>
  );
}

function PollsList({ polls, copy, locale }: { polls: readonly (PublishedPoll | ExpectedPoll)[]; copy: PollsCopy; locale: Locale }) {
  const published = polls.filter((poll): poll is PublishedPoll => poll.status === "published");
  const expected = polls.filter((poll): poll is ExpectedPoll => poll.status === "expected");
  return (
    <>
      <h2 id="polls">{copy.pollsTitle}</h2>
      {published.length === 0 ? <p>{copy.noPollYet}</p> : null}
      {published.map((poll) => (
        <PublishedSection key={poll.id} poll={poll} copy={copy} locale={locale} />
      ))}
      {expected.length > 0 ? (
        <>
          <h3 id="pending">{copy.expectedTitle}</h3>
          <ul>
            {expected.map((poll) => (
              <li key={poll.id}>
                <strong>
                  {ORG_NAMES[poll.org][locale]}: {poll.name[locale]}.
                </strong>{" "}
                {poll.expectedOn ? copy.expectedOn(poll.expectedOn) : copy.expectedUnknown} {renderInline(poll.note[locale])}{" "}
                <a href={poll.page} rel="noopener nofollow" target="_blank">
                  {copy.links.official}
                </a>
                . <span className="text-[var(--color-muted)]">{copy.checkedOn(poll.checkedOn)}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </>
  );
}

function PublishedSection({ poll, copy, locale }: { poll: PublishedPoll; copy: PollsCopy; locale: Locale }) {
  const headingId = `poll-${poll.id}`;
  const sheet = poll.sheet;
  const rows: [string, string][] = [
    [copy.sheet.organisation, sheet.organisation[locale]],
    [copy.sheet.client, sheet.client[locale]],
    [copy.sheet.universe, sheet.universe[locale]],
    [copy.sheet.sample, sheet.sample[locale]],
    [copy.sheet.margin, sheet.margin[locale]],
    [copy.sheet.sampling, sheet.sampling[locale]],
    [copy.sheet.mode, sheet.mode[locale]],
    [copy.sheet.fieldwork, spanLabel(sheet.fieldwork.from, sheet.fieldwork.to, locale)],
    [copy.sheet.questions, sheet.questions[locale]],
  ];
  const links = (
    [
      ["results", poll.links.results],
      ["questionnaire", poll.links.questionnaire],
      ["sheet", poll.links.sheet],
      ["data", poll.links.data],
      ["page", poll.links.page],
    ] as const
  ).filter((entry): entry is readonly [keyof PollLinks, string] => typeof entry[1] === "string");

  return (
    <section aria-labelledby={headingId}>
      <h3 id={headingId}>
        {ORG_NAMES[poll.org][locale]}: {poll.name[locale]}
      </h3>
      <p className="text-sm text-[var(--color-muted)]">
        {copy.published} {dateLabel(poll.publishedOn, locale)} · {copy.study} {poll.study}
      </p>
      <p>
        <strong>{copy.scope}:</strong> {renderInline(poll.scope[locale])}
      </p>
      {poll.tables.map((table) => (
        <EstimateTableView key={table.caption.en} table={table} copy={copy} locale={locale} />
      ))}
      <h4>{copy.sheetTitle}</h4>
      <dl className="grid grid-cols-1 gap-x-4 gap-y-1 text-sm sm:grid-cols-[12rem_1fr] [&>dd]:!mt-0 [&>dd]:mb-2 sm:[&>dd]:mb-0 [&>dt]:font-semibold">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt>{label}</dt>
            <dd>{renderInline(value)}</dd>
          </div>
        ))}
      </dl>
      <h4>{copy.linksTitle}</h4>
      <ul>
        {links.map(([key, url]) => (
          <li key={key}>
            <a href={url} rel="noopener nofollow" target="_blank">
              {copy.links[key]}
            </a>
          </li>
        ))}
      </ul>
      <p className="text-sm text-[var(--color-muted)]">{copy.checkedOn(poll.checkedOn)}</p>
    </section>
  );
}

function EstimateTableView({ table, copy, locale }: { table: EstimateTable; copy: PollsCopy; locale: Locale }) {
  // Vote estimates as printed (one decimal, "6,0" kept); intervals as given (whole numbers in the CEO's table).
  const vote = new Intl.NumberFormat(INTL_LOCALE[locale], { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const interval = new Intl.NumberFormat(INTL_LOCALE[locale], { maximumFractionDigits: 1 });
  const whole = new Intl.NumberFormat(INTL_LOCALE[locale], { maximumFractionDigits: 0 });
  const show = (value: Figure | null | undefined, format: Intl.NumberFormat) => {
    if (value === null || value === undefined) return "—";
    return typeof value === "number" ? format.format(value) : `${format.format(value[0])}–${format.format(value[1])}`;
  };
  const header = (column: EstimateColumn) =>
    column === "vote" ? copy.tableVote : column === "voteCi" ? copy.tableVoteCi : column === "seats" ? copy.tableSeats : copy.province(column);
  const cell = (row: EstimateRow, column: EstimateColumn) =>
    column === "vote"
      ? show(row.vote, vote)
      : column === "voteCi"
        ? show(row.voteCi, interval)
        : column === "seats"
          ? show(row.seats, whole)
          : show(row.provinces?.[column], whole);

  return (
    <div className="ci-table-wrap">
      <table className="ci-table ci-elections-table" role="table">
        <caption>{table.caption[locale]}</caption>
        <thead>
          <tr role="row">
            <th scope="col" role="columnheader">
              {copy.tableParty}
            </th>
            {table.columns.map((column) => (
              <th key={column} scope="col" role="columnheader">
                {header(column)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row) => (
            <tr key={row.party} role="row">
              <th scope="row" role="rowheader" className="font-normal" data-label={copy.tableParty}>
                {row.party}
              </th>
              {table.columns.map((column) => (
                <td key={column} role="cell" data-label={header(column)} className="ci-numeric whitespace-nowrap">
                  {cell(row, column)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t border-[var(--color-rule)] px-3 py-2 text-xs text-[var(--color-muted)]">{renderInline(table.note[locale])}</p>
    </div>
  );
}
