import Link from "next/link";

import { ShareBar, crumbPath } from "@/components/share/ShareBar";
import type { Crumb } from "@/components/Breadcrumbs";
import { WidgetPlaceLink } from "@/components/programmatic/embed-2027/WidgetLink";
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
import { cityFaq, cityH1, cityLead, cityListLine, localName, planWords, population } from "@/lib/programmatic/spain-2027/city-copy";
import { KIND_LABEL, compactDates, dayName, runLine, weekdayDate } from "@/lib/programmatic/spain-2027/copy";
import { cityPath, communityPath, spainBridgesPath, spainHubPath } from "@/lib/programmatic/spain-2027/paths";
import { BOE_REF, SOURCES } from "@/lib/programmatic/spain-2027/sources";

import { Header, SourceList, communityCrumbs } from "./pages";

/** One city's 2027 page (Spanish only): its local days with their source, the full calendar, the bridges, the FAQ. */

const CITY_COMPUTED_NOTE =
  "Calculado por CatalunyaInfo con los festivos del BOE y las fiestas locales del boletín citado, para una semana de lunes a viernes. No incluye turnos ni convenios propios.";

export function cityCrumbs(c: City): Crumb[] {
  return [...communityCrumbs(c.community), { label: c.name, href: cityPath(c) }];
}

const KIND: Record<CityDayKind, string> = {
  national: KIND_LABEL["*"],
  "national-kept": KIND_LABEL["**"],
  regional: KIND_LABEL["***"],
  island: "Fiesta insular",
  local: "Fiesta local",
};

function DaysTable({ days, caption }: { days: LocalDay[]; caption: string }) {
  return (
    <div className="ci-table-scroll mt-4">
      <table className="ci-local-table">
        <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Fecha</th>
            <th scope="col">Fiesta</th>
          </tr>
        </thead>
        <tbody>
          {days.map((d) => (
            <tr key={d.date}>
              <th scope="row" className="font-normal">
                <time dateTime={d.date}>{weekdayDate(d.date)}</time>
              </th>
              <td>
                {localName(d)}
                {d.note ? <small className="text-[var(--color-muted)]"> ({d.note})</small> : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CityPage({ c }: { c: City }) {
  const list = local2027(c);
  const days = localDays(c);
  const calendar = cityCalendar(c);
  const runs = cityRuns(c);
  const mine = new Set(localRuns(c).map((r) => `${r.from}|${r.to}|${r.take.join()}`));
  const island = islandDay(c);
  const faq = cityFaq(c);
  const s = SOURCES[c.region];
  const neighbours = citiesOf(c.region).filter((x) => x.slug !== c.slug);
  const weekend = weekendLocalDays(c);
  const common = commonLocalDays(c);

  return (
    <article>
      <Header crumbs={cityCrumbs(c)} h1={cityH1(c)} lead={cityLead(c)} />

      <div className="ci-shell py-10">
        <div className="ci-prose">
          <dl className="ci-facts">
            <dt>Fiestas locales {YEAR}</dt>
            <dd>{list ? cityListLine(c) : common.length ? `${compactDates(common.map((d) => d.date))} (común); la otra, sin publicar` : "Aún sin publicar"}</dd>
            <dt>Festivos {YEAR} en total</dt>
            <dd>{list ? holidayCount(c) : `${holidayCount(c)} + ${2 - common.length} ${common.length === 1 ? "local pendiente" : "locales pendientes"}`}</dd>
            <dt>Comunidad</dt>
            <dd>
              <Link href={communityPath(c.community)}>{c.community.short}</Link>
            </dd>
            <dt>Población</dt>
            <dd>
              {population(c)} <small>(INE, {dayMonthYear(INE_POPULATION.asOf, "es")})</small>
            </dd>
          </dl>

          {list ? (
            <>
              <h2 id="locales">
                {isZoned(c) ? `Las fiestas locales de ${c.name} en ${YEAR}, por zonas` : `Las 2 fiestas locales de ${c.name} en ${YEAR}`}
              </h2>
              <DaysTable
                days={days}
                caption={isZoned(c) ? `${list.mainArea ?? c.name}, según el ${list.source.ref}.` : `Fiestas locales de ${c.name}, según el ${list.source.ref}.`}
              />
              {(list.zones ?? []).map((z) => (
                <DaysTable key={z.place} days={z.days} caption={`${z.place}, según el mismo texto.`} />
              ))}
              <ul>
                {days.map((d) => {
                  const others = sharedWith(c, d.date);
                  return (
                    <li key={d.date}>
                      {weekdayDate(d.date)}: {planWords(c, d)}.
                      {others.length ? (
                        <>
                          {" "}
                          También es fiesta local en{" "}
                          {others.map((x, i) => (
                            <span key={x.slug}>
                              {i > 0 ? (i === others.length - 1 ? " y " : ", ") : ""}
                              <Link href={cityPath(x)}>{x.name}</Link>
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
                  {weekend.length === 1 ? "Una de las dos cae" : "Las dos caen"} en fin de semana ({weekend.map((d) => weekdayDate(d.date)).join(", ")}): para quien
                  trabaja de lunes a viernes, {weekend.length === 1 ? "no añade un día libre" : "no añaden días libres"}.
                </p>
              ) : null}
              <p>
                Fuente:{" "}
                <a href={list.source.url} rel="noopener nofollow" target="_blank">
                  {list.source.title}
                </a>{" "}
                ({list.source.ref}).{" "}
                {list.days.some((d) => d.name === null) ? "El boletín da las fechas sin el nombre de la fiesta." : ""}
              </p>
            </>
          ) : (
            <>
              <h2 id="locales">Fiestas locales de {YEAR}: aún no publicadas</h2>
              <p>
                {s.local.how}{" "}
                <a href={s.local.bulletinUrl} rel="noopener nofollow" target="_blank">
                  {s.local.bulletinName}
                </a>
                .{" "}
                {c.status2027 === "missing"
                  ? `${c.note ?? ""} Si el ayuntamiento las comunica más tarde, se publicarán en ese mismo boletín.`
                  : s.local.y2026
                    ? `La lista de 2026 salió el ${dayMonthYear(s.local.y2026.date, "es")} (${s.local.y2026.ref}).`
                    : ""}
              </p>
              {c.local2026 ? (
                <>
                  <h3>Las fiestas locales de 2026 (solo como referencia)</h3>
                  <DaysTable days={c.local2026.days} caption={`Fiestas locales de ${c.name} en 2026, no en ${YEAR}.`} />
                  <p>
                    Fuente de 2026:{" "}
                    <a href={c.local2026.source.url} rel="noopener nofollow" target="_blank">
                      {c.local2026.source.title}
                    </a>{" "}
                    ({c.local2026.source.ref}).
                  </p>
                </>
              ) : null}
            </>
          )}

          <h2 id="calendario">Calendario laboral {YEAR} de {c.name}</h2>
          <div className="ci-table-scroll mt-4">
            <table className="ci-local-table">
              <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">
                Festivos de {YEAR} en {c.name}: los nacionales y autonómicos del BOE ({BOE_REF.id})
                {island ? `, la fiesta insular de ${island.place}` : ""}
                {list ? " y las fiestas locales" : common.length ? " y la fiesta local común a toda la comunidad" : ""}.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Fecha</th>
                  <th scope="col">Festividad</th>
                  <th scope="col">Tipo</th>
                </tr>
              </thead>
              <tbody>
                {calendar.map((d) => (
                  <tr key={`${d.date}-${d.kind}`}>
                    <th scope="row" className="font-normal">
                      <time dateTime={d.date}>{weekdayDate(d.date)}</time>
                    </th>
                    <td>{d.kind === "local" ? localName(d) : d.name ? dayName({ name: d.name, replaces: d.replaces ?? null }) : ""}</td>
                    <td>{KIND[d.kind]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!list ? (
            <p>
              {common.length ? `Falta la fiesta local propia de ${c.name} en ${YEAR}` : `Faltan las 2 fiestas locales de ${c.name} en ${YEAR}`}, que se añadirá{common.length ? "" : "n"} cuando se publique{common.length ? "" : "n"}.
            </p>
          ) : null}
          <WidgetPlaceLink locale="es" place={{ kind: "city", c }} />

          <h2 id="puentes">Puentes de {YEAR} en {c.name}</h2>
          <p>
            {list
              ? `Contando las fiestas locales, ${runs.filter((r) => r.take.length === 0).length} fines de semana largos sin vacaciones y ${runs.filter((r) => r.take.length > 0).length} puentes que piden días de vacaciones. Los que dependen de las fiestas locales van marcados.`
              : `Con los festivos ya oficiales (sin las fiestas locales pendientes), ${runs.filter((r) => r.take.length === 0).length} fines de semana largos sin vacaciones y ${runs.filter((r) => r.take.length > 0).length} puentes que piden días de vacaciones.`}
          </p>
          <ul>
            {runs.map((r) => (
              <li key={`${r.from}-${r.to}-${r.take.join()}`}>
                {runLine(r)}
                {mine.has(`${r.from}|${r.to}|${r.take.join()}`) ? <strong> (fiesta local)</strong> : null}
              </li>
            ))}
          </ul>
          <p className="text-sm text-[var(--color-muted)]">{CITY_COMPUTED_NOTE}</p>
          <p>
            <Link href={`${communityPath(c.community)}#puentes`}>Puentes de {YEAR} {c.community.en}</Link>
            {" · "}
            <Link href={spainBridgesPath()}>Puentes de {YEAR} en toda España</Link>
          </p>

          <h2 id="preguntas">Preguntas frecuentes</h2>
          {faq.map((item) => (
            <section key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </section>
          ))}

          <h2 id="otras">Otras ciudades {c.community.de}</h2>
          {neighbours.length ? (
            <ul>
              {neighbours.map((x) => (
                <li key={x.slug}>
                  <Link href={cityPath(x)}>Festivos locales de {x.name}</Link> <small className="text-[var(--color-muted)]">({cityListLine(x)})</small>
                </li>
              ))}
            </ul>
          ) : null}
          <p>
            <Link href={`${communityPath(c.community)}#locales`}>Dónde se publican las fiestas locales del resto de municipios {c.community.de}</Link>
            {" · "}
            <Link href={communityPath(c.community)}>Calendario laboral {YEAR} {c.community.de}</Link>
            {" · "}
            <Link href={spainHubPath()}>Calendario laboral {YEAR} en España</Link>
          </p>
        </div>

        <SourceList
          items={[
            list?.source,
            c.local2026?.source,
            BOE_REF,
            s.decree.status === "published" ? s.decree.text : null,
            { title: `INE: cifras oficiales de población de los municipios de la provincia de ${c.province}, 1 de enero de 2025`, ref: INE_POPULATION.ref, date: INE_POPULATION.date, url: ineTableUrl(c.ineTable) },
          ]}
        />
        <p className="ci-measure mt-2 text-xs text-[var(--color-muted)]">
          <time dateTime={CITIES_AS_OF}>Fiestas locales leídas el {dayMonthYear(CITIES_AS_OF, "es")}.</time>
        </p>
        <ShareBar locale="es" path={crumbPath(cityCrumbs(c))} title={cityH1(c)} contentType="holidays_2027" variant="full" />
      </div>
    </article>
  );
}
