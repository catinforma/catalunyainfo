import Link from "next/link";

import type { Crumb } from "@/components/Breadcrumbs";
import { dayMonthYear } from "@/lib/programmatic/holidays/format";
import { YEAR } from "@/lib/programmatic/spain-2027/calendar";
import { CITIES_AS_OF, INE_POPULATION, ineTableUrl, type LocalDay } from "@/lib/programmatic/spain-2027/cities-data";
import {
  citiesOf,
  cityCalendar,
  cityRuns,
  commonLocalDays,
  holidayCount,
  isZoned,
  islandDay,
  local2027,
  localDays,
  localRuns,
  sharedWith,
  weekendLocalDays,
  type City,
  type CityDayKind,
} from "@/lib/programmatic/spain-2027/cities";
import { areaNameIntl, caIn, caOf, cityFaqIntl, cityH1Intl, cityLeadIntl, cityListLineIntl, localNameIntl, localNoteIntl, planWordsIntl, populationIntl } from "@/lib/programmatic/spain-2027/city-copy-intl";
import { KIND_LABEL_INTL, compactDatesIntl, dayNameIntl, runLineIntl, tr, weekdayDateIntl } from "@/lib/programmatic/spain-2027/copy-intl";
import {
  editionBridgesPath,
  editionCityName,
  editionCityPath,
  editionCommunityPath,
  editionHubPath,
  editionNames,
  type Edition,
} from "@/lib/programmatic/spain-2027/editions";
import { BOE_REF, SOURCES } from "@/lib/programmatic/spain-2027/sources";
import { CITY_NOTE, SOURCE_PROSE, placeName } from "@/lib/programmatic/spain-2027/sources-intl";

import { Header, SourceList, communityCrumbsIntl } from "./pages-intl";

/** One city's 2027 page in Catalan or English: the Spanish edition's sections (city-page.tsx), the same facts and sources. */

export function cityCrumbsIntl(c: City, locale: Edition): Crumb[] {
  return [...communityCrumbsIntl(editionNames(c.region, locale), locale), { label: editionCityName(c, locale), href: editionCityPath(locale, c) }];
}

function kindLabel(kind: CityDayKind, locale: Edition): string {
  const k = KIND_LABEL_INTL[locale];
  switch (kind) {
    case "national":
      return k["*"];
    case "national-kept":
      return k["**"];
    case "regional":
      return k["***"];
    case "island":
      return tr(locale, "Festa insular", "Island holiday");
    case "local":
      return tr(locale, "Festa local", "Local holiday");
  }
}

function DaysTable({ days, caption, locale }: { days: LocalDay[]; caption: string; locale: Edition }) {
  return (
    <div className="ci-table-scroll mt-4">
      <table className="ci-local-table">
        <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">{tr(locale, "Data", "Date")}</th>
            <th scope="col">{tr(locale, "Festa", "Holiday")}</th>
          </tr>
        </thead>
        <tbody>
          {days.map((d) => (
            <tr key={d.date}>
              <th scope="row" className="font-normal">
                <time dateTime={d.date}>{weekdayDateIntl(d.date, locale)}</time>
              </th>
              <td>
                {localNameIntl(d, locale)}
                {d.note ? <small className="text-[var(--color-muted)]"> ({localNoteIntl(d.note, locale)})</small> : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CityPageIntl({ c, locale }: { c: City; locale: Edition }) {
  const ca = locale === "ca";
  const list = local2027(c);
  const days = localDays(c);
  const calendar = cityCalendar(c);
  const runs = cityRuns(c);
  const mine = new Set(localRuns(c).map((r) => `${r.from}|${r.to}|${r.take.join()}`));
  const island = islandDay(c);
  const faq = cityFaqIntl(c, locale);
  const s = SOURCES[c.region];
  const prose = SOURCE_PROSE[c.region][locale];
  const r = editionNames(c.region, locale);
  const name = editionCityName(c, locale);
  const Name = name.charAt(0).toUpperCase() + name.slice(1);
  const neighbours = citiesOf(c.region).filter((x) => x.slug !== c.slug);
  const weekend = weekendLocalDays(c);
  const common = commonLocalDays(c);
  const freeRuns = runs.filter((x) => x.take.length === 0).length;
  const leaveRuns = runs.filter((x) => x.take.length > 0).length;
  const islandPlace = island ? placeName(island.place, locale) : "";

  return (
    <article>
      <Header crumbs={cityCrumbsIntl(c, locale)} h1={cityH1Intl(c, locale)} lead={cityLeadIntl(c, locale)} locale={locale} />

      <div className="ci-shell py-10">
        <div className="ci-prose">
          <dl className="ci-facts">
            <dt>{tr(locale, `Festes locals ${YEAR}`, `Local holidays ${YEAR}`)}</dt>
            <dd>
              {list
                ? cityListLineIntl(c, locale)
                : common.length
                  ? tr(
                      locale,
                      `${compactDatesIntl(common.map((d) => d.date), "ca")} (comuna); l'altra, sense publicar`,
                      `${compactDatesIntl(common.map((d) => d.date), "en")} (shared); the other, not yet published`,
                    )
                  : tr(locale, "Encara sense publicar", "Not yet published")}
            </dd>
            <dt>{tr(locale, `Festius ${YEAR} en total`, `Public holidays ${YEAR} in all`)}</dt>
            <dd>
              {list
                ? holidayCount(c)
                : `${holidayCount(c)} + ${2 - common.length} ${
                    common.length === 1 ? tr(locale, "local pendent", "local still to come") : tr(locale, "locals pendents", "local still to come")
                  }`}
            </dd>
            <dt>{tr(locale, "Comunitat", "Community")}</dt>
            <dd>
              <Link href={editionCommunityPath(locale, c.region)}>{r.short}</Link>
            </dd>
            <dt>{tr(locale, "Població", "Population")}</dt>
            <dd>
              {populationIntl(c, locale)} <small>(INE, {dayMonthYear(INE_POPULATION.asOf, locale)})</small>
            </dd>
          </dl>

          {list ? (
            <>
              <h2 id="locales">
                {isZoned(c)
                  ? tr(locale, `Les festes locals ${caOf(name)} el ${YEAR}, per zones`, `${Name}'s local holidays in ${YEAR}, by area`)
                  : tr(locale, `Les 2 festes locals ${caOf(name)} el ${YEAR}`, `${Name}'s 2 local holidays in ${YEAR}`)}
              </h2>
              <DaysTable
                days={days}
                locale={locale}
                caption={
                  isZoned(c)
                    ? tr(locale, `${areaNameIntl(list.mainArea ?? c.name, "ca")}, segons el ${list.source.ref}.`, `${areaNameIntl(list.mainArea ?? c.name, "en")}, according to the ${list.source.ref}.`)
                    : tr(locale, `Festes locals ${caOf(name)}, segons el ${list.source.ref}.`, `${Name}'s local holidays, according to the ${list.source.ref}.`)
                }
              />
              {(list.zones ?? []).map((z) => (
                <DaysTable
                  key={z.place}
                  days={z.days}
                  locale={locale}
                  caption={tr(locale, `${areaNameIntl(z.place, "ca")}, segons el mateix text.`, `${areaNameIntl(z.place, "en")}, according to the same text.`)}
                />
              ))}
              <ul>
                {days.map((d) => {
                  const others = sharedWith(c, d.date);
                  return (
                    <li key={d.date}>
                      {ca ? `${weekdayDateIntl(d.date, locale)}: ${planWordsIntl(c, d, locale)}.` : `${weekdayDateIntl(d.date, locale)} ${planWordsIntl(c, d, locale)}.`}
                      {others.length ? (
                        <>
                          {" "}
                          {tr(locale, "També és festa local a", "Also a local holiday in")}{" "}
                          {others.map((x, i) => (
                            <span key={x.slug}>
                              {i > 0 ? (i === others.length - 1 ? tr(locale, " i ", " and ") : ", ") : ""}
                              <Link href={editionCityPath(locale, x)}>{editionCityName(x, locale)}</Link>
                            </span>
                          ))}
                          .
                        </>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
              {weekend.length ? (
                <p>
                  {ca
                    ? `${weekend.length === 1 ? "Una de les dues cau" : "Totes dues cauen"} en cap de setmana (${weekend.map((d) => weekdayDateIntl(d.date, "ca")).join(", ")}): qui treballa de dilluns a divendres no ${weekend.length === 1 ? "hi guanya cap dia lliure" : "hi guanya dies lliures"}.`
                    : `${weekend.length === 1 ? "One of the two falls" : "Both fall"} on a weekend (${weekend.map((d) => weekdayDateIntl(d.date, "en")).join(", ")}): if you work Monday to Friday, ${weekend.length === 1 ? "it adds no day off" : "they add no days off"}.`}
                </p>
              ) : null}
              <p>
                {tr(locale, "Font", "Source")}:{" "}
                <a href={list.source.url} rel="noopener nofollow" target="_blank">
                  {list.source.title}
                </a>{" "}
                ({list.source.ref}).{" "}
                {list.days.some((d) => d.name === null) ? tr(locale, "El butlletí dona les dates sense el nom de la festa.", "The bulletin gives the dates without the name of the holiday.") : ""}
              </p>
            </>
          ) : (
            <>
              <h2 id="locales">{tr(locale, `Festes locals del ${YEAR}: encara sense publicar`, `${YEAR} local holidays: not yet published`)}</h2>
              <p>
                {prose.how}{" "}
                <a href={s.local.bulletinUrl} rel="noopener nofollow" target="_blank">
                  {s.local.bulletinName}
                </a>
                .{" "}
                {c.status2027 === "missing"
                  ? tr(
                      locale,
                      `${localCityNote(c, "ca")} Si l'ajuntament les comunica més tard, es publicaran en aquest mateix butlletí.`,
                      `${localCityNote(c, "en")} If the council reports them later, they will be published in the same bulletin.`,
                    )
                  : s.local.y2026
                    ? tr(
                        locale,
                        `La llista del 2026 va sortir el ${dayMonthYear(s.local.y2026.date, "ca")} (${s.local.y2026.ref}).`,
                        `The 2026 list came out on ${dayMonthYear(s.local.y2026.date, "en")} (${s.local.y2026.ref}).`,
                      )
                    : ""}
              </p>
              {c.local2026 ? (
                <>
                  <h3>{tr(locale, "Les festes locals del 2026 (només com a referència)", "The 2026 local holidays (for reference only)")}</h3>
                  <DaysTable
                    days={c.local2026.days}
                    locale={locale}
                    caption={tr(locale, `Festes locals ${caOf(name)} el 2026, no el ${YEAR}.`, `${Name}'s local holidays in 2026, not ${YEAR}.`)}
                  />
                  <p>
                    {tr(locale, "Font del 2026", "2026 source")}:{" "}
                    <a href={c.local2026.source.url} rel="noopener nofollow" target="_blank">
                      {c.local2026.source.title}
                    </a>{" "}
                    ({c.local2026.source.ref}).
                  </p>
                </>
              ) : null}
            </>
          )}

          <h2 id="calendario">{tr(locale, `Calendari laboral ${YEAR} ${caOf(name)}`, `${Name} work calendar ${YEAR}`)}</h2>
          <div className="ci-table-scroll mt-4">
            <table className="ci-local-table">
              <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">
                {ca
                  ? `Festius del ${YEAR} ${caIn(name)}: els estatals i autonòmics del BOE (${BOE_REF.id})${island ? `, la festa insular ${caOf(islandPlace)}` : ""}${list ? " i les festes locals" : common.length ? " i la festa local comuna a tota la comunitat" : ""}.`
                  : `${Name}'s ${YEAR} holidays: the national and regional ones in the BOE (${BOE_REF.id})${island ? `, the island holiday of ${islandPlace}` : ""}${list ? " and the local holidays" : common.length ? " and the local holiday shared by the whole community" : ""}.`}
              </caption>
              <thead>
                <tr>
                  <th scope="col">{tr(locale, "Data", "Date")}</th>
                  <th scope="col">{tr(locale, "Festa", "Holiday")}</th>
                  <th scope="col">{tr(locale, "Tipus", "Type")}</th>
                </tr>
              </thead>
              <tbody>
                {calendar.map((d) => (
                  <tr key={`${d.date}-${d.kind}`}>
                    <th scope="row" className="font-normal">
                      <time dateTime={d.date}>{weekdayDateIntl(d.date, locale)}</time>
                    </th>
                    <td>
                      {d.kind === "local"
                        ? localNameIntl({ date: d.date, name: d.name }, locale)
                        : d.kind === "island"
                          ? (d.name ?? "")
                          : d.name
                            ? dayNameIntl({ name: d.name, replaces: d.replaces ?? null }, locale)
                            : ""}
                    </td>
                    <td>{kindLabel(d.kind, locale)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!list ? (
            <p>
              {ca
                ? common.length
                  ? `Falta la festa local pròpia ${caOf(name)} del ${YEAR}, que s'hi afegirà quan es publiqui.`
                  : `Falten les 2 festes locals ${caOf(name)} del ${YEAR}, que s'hi afegiran quan es publiquin.`
                : common.length
                  ? `${Name}'s own ${YEAR} local holiday is still missing; it will be added once it is published.`
                  : `${Name}'s 2 local holidays for ${YEAR} are still missing; they will be added once they are published.`}
            </p>
          ) : null}

          <h2 id="puentes">{tr(locale, `Ponts del ${YEAR} ${caIn(name)}`, `Long weekends in ${Name} in ${YEAR}`)}</h2>
          <p>
            {ca
              ? list
                ? `Comptant les festes locals, ${freeRuns} caps de setmana llargs sense vacances i ${leaveRuns} ponts que demanen dies de vacances. Els que depenen de les festes locals van marcats.`
                : `Amb els festius que ja són oficials (sense les festes locals pendents), ${freeRuns} caps de setmana llargs sense vacances i ${leaveRuns} ponts que demanen dies de vacances.`
              : list
                ? `Counting the local holidays, ${freeRuns} long weekends with no leave and ${leaveRuns} breaks that need days of leave. Those that depend on the local holidays are marked.`
                : `With the holidays already official (leaving out the local ones still to come), ${freeRuns} long weekends with no leave and ${leaveRuns} breaks that need days of leave.`}
          </p>
          <ul>
            {runs.map((x) => (
              <li key={`${x.from}-${x.to}-${x.take.join()}`}>
                {runLineIntl(x, locale)}
                {mine.has(`${x.from}|${x.to}|${x.take.join()}`) ? <strong> ({tr(locale, "festa local", "local holiday")})</strong> : null}
              </li>
            ))}
          </ul>
          <p className="text-sm text-[var(--color-muted)]">
            {tr(
              locale,
              "Calculat per CatalunyaInfo amb els festius del BOE i les festes locals del butlletí citat, per a una setmana de dilluns a divendres. No inclou torns ni convenis propis.",
              "Worked out by CatalunyaInfo from the BOE holidays and the local holidays in the bulletin cited, for a Monday-to-Friday week. It leaves out shift patterns and collective agreements.",
            )}
          </p>
          <p>
            <Link href={`${editionCommunityPath(locale, c.region)}#puentes`}>{tr(locale, `Ponts del ${YEAR} ${r.in}`, `Long weekends ${YEAR} ${r.in}`)}</Link>
            {" · "}
            <Link href={editionBridgesPath(locale)}>{tr(locale, `Ponts del ${YEAR} a tot Espanya`, `Long weekends ${YEAR} across Spain`)}</Link>
          </p>

          <h2 id="preguntas">{tr(locale, "Preguntes freqüents", "Frequently asked questions")}</h2>
          {faq.map((item) => (
            <section key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </section>
          ))}

          <h2 id="otras">{tr(locale, `Altres ciutats ${r.of}`, `Other cities ${r.in}`)}</h2>
          {neighbours.length ? (
            <ul>
              {neighbours.map((x) => (
                <li key={x.slug}>
                  <Link href={editionCityPath(locale, x)}>
                    {tr(locale, `Festius locals ${caOf(editionCityName(x, "ca"))}`, `${editionCityName(x, "en")} local holidays`)}
                  </Link>{" "}
                  <small className="text-[var(--color-muted)]">({cityListLineIntl(x, locale)})</small>
                </li>
              ))}
            </ul>
          ) : null}
          <p>
            <Link href={`${editionCommunityPath(locale, c.region)}#locales`}>
              {tr(locale, `On es publiquen les festes locals de la resta de municipis ${r.of}`, `Where the other municipalities ${r.in} publish their local holidays`)}
            </Link>
            {" · "}
            <Link href={editionCommunityPath(locale, c.region)}>{tr(locale, `Calendari laboral ${YEAR} ${r.of}`, `Public holidays ${YEAR} ${r.in}`)}</Link>
            {" · "}
            <Link href={editionHubPath(locale)}>{tr(locale, `Calendari laboral ${YEAR} a Espanya`, `Spain public holidays ${YEAR}`)}</Link>
          </p>
        </div>

        <SourceList
          locale={locale}
          items={[
            list?.source,
            c.local2026?.source,
            BOE_REF,
            s.decree.status === "published" ? s.decree.text : null,
            { title: `INE: cifras oficiales de población de los municipios de la provincia de ${c.province}, 1 de enero de 2025`, ref: INE_POPULATION.ref, date: INE_POPULATION.date, url: ineTableUrl(c.ineTable) },
          ]}
        />
        <p className="ci-measure mt-2 text-xs text-[var(--color-muted)]">
          <time dateTime={CITIES_AS_OF}>
            {tr(locale, `Festes locals consultades el ${dayMonthYear(CITIES_AS_OF, "ca")}.`, `Local holidays read on ${dayMonthYear(CITIES_AS_OF, "en")}.`)}
          </time>
        </p>
      </div>
    </article>
  );
}

/** The bulletin's remark on a city left out of the list, in the page's language. */
function localCityNote(c: City, locale: Edition): string {
  return CITY_NOTE[c.slug]?.[locale] ?? "";
}
