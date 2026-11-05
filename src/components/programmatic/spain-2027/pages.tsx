import Link from "next/link";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { getMessages } from "@/lib/i18n";
import { GUIDES } from "@/lib/programmatic/holidays/links";
import { hubPath } from "@/lib/programmatic/holidays/paths";
import { dayMonthYear } from "@/lib/programmatic/holidays/format";
import { REGIONS } from "@/lib/programmatic/holidays/boe-2027";
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
import { COMMUNITIES_AZ, names, type CommunityNames } from "@/lib/programmatic/spain-2027/communities";
import {
  BOE_LEGEND,
  BRIDGES,
  HUB,
  KIND_LABEL,
  communityFaq,
  communityH1,
  communityLead,
  compactDates,
  dayName,
  decreeLine,
  everywhereFree,
  hubLead,
  localStatusLine,
  notKeptLine,
  rangeWords,
  regionsWords,
  runLine,
  weekdayDate,
  weekendLine,
  whereElse,
} from "@/lib/programmatic/spain-2027/copy";
import { communityPath, spainBridgesPath, spainHubPath } from "@/lib/programmatic/spain-2027/paths";
import { BOE_REF, SOURCES, SOURCES_READ_ON, type OfficialText } from "@/lib/programmatic/spain-2027/sources";

/** The Spain-wide 2027 pages (Spanish only), all server-rendered from the BOE table and `sources.ts`. */

const COMPUTED_NOTE =
  "Calculado por CatalunyaInfo a partir de los festivos del BOE, para una semana de lunes a viernes. No incluye los festivos locales de cada municipio ni turnos o convenios propios.";

export function hubCrumbs(): Crumb[] {
  return [
    { label: getMessages("es").common.home, href: "/es/" },
    { label: HUB.breadcrumb, href: spainHubPath() },
  ];
}

export function communityCrumbs(c: CommunityNames): Crumb[] {
  return [...hubCrumbs(), { label: c.short, href: communityPath(c) }];
}

export function bridgesCrumbs(): Crumb[] {
  return [...hubCrumbs(), { label: BRIDGES.breadcrumb, href: spainBridgesPath() }];
}

function Header({ crumbs, h1, lead }: { crumbs: Crumb[]; h1: string; lead?: string }) {
  return (
    <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
      <div className="ci-shell py-5 md:py-8 lg:py-12">
        <Breadcrumbs items={crumbs} locale="es" />
        <h1 className="ci-measure">{h1}</h1>
        {lead ? <p className="ci-measure mt-4 text-lg text-[var(--color-ink-soft)]">{lead}</p> : null}
      </div>
    </header>
  );
}

function SourceList({ items, title = "Fuentes oficiales" }: { items: (OfficialText | null | undefined)[]; title?: string }) {
  const shown = items.filter((i): i is OfficialText => Boolean(i));
  return (
    <section className="ci-measure mt-12" aria-labelledby="ci-es27-sources">
      <h2 id="ci-es27-sources" className="font-sans text-base font-semibold">
        {title}
      </h2>
      <p className="mt-1 text-xs text-[var(--color-muted)]">
        <time dateTime={SOURCES_READ_ON}>Leídas el {dayMonthYear(SOURCES_READ_ON, "es")} en los boletines oficiales.</time>
      </p>
      <ol className="ci-sources mt-3">
        {shown.map((item) => (
          <li key={item.url}>
            <span>
              <a href={item.url} rel="noopener nofollow" target="_blank">
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

function CommunityLinks({ exclude }: { exclude?: string }) {
  return (
    <section className="mt-12" aria-labelledby="ci-es27-others">
      <h2 id="ci-es27-others">Calendario laboral {YEAR} de cada comunidad</h2>
      <ul className="mt-4 grid list-none gap-2 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {COMMUNITIES_AZ.filter((c) => c.slug !== exclude).map((c) => (
          <li key={c.slug}>
            <Link href={communityPath(c)}>Festivos {YEAR} en {c.short}</Link>{" "}
            <small className="text-[var(--color-muted)]">({dayCount(c.region)})</small>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm">
        <Link href={spainHubPath()}>{HUB.breadcrumb}: festivos comunes y por comunidad</Link>
        {" · "}
        <Link href={spainBridgesPath()}>Puentes {YEAR} en España</Link>
      </p>
    </section>
  );
}

/* ------------------------------------------------------------ Community --- */

export function CommunityPage({ c }: { c: CommunityNames }) {
  const days = communityDays(c.region);
  const runs = communityRuns(c.region);
  const summary = runSummary(runs);
  const s = SOURCES[c.region];
  const own = ownDays(c.region);
  const weekend = weekendLine(c);
  const notKept = notKeptLine(c);
  const faq = communityFaq(c);
  const decree = s.decree;
  const moved = new Map(decree.status === "published" ? decree.moves.map((m) => [m.date, m.replaces] as const) : []);

  return (
    <article>
      <Header crumbs={communityCrumbs(c)} h1={communityH1(c)} />

      <div className="ci-shell py-10">
        <div className="ci-prose">
          <p className="ci-lead">{communityLead(c)}</p>

          <dl className="ci-facts">
            <dt>Festivos {YEAR}</dt>
            <dd>
              {days.length}
              {s.subRegional ? ` en todo el territorio, más 1 ${s.subRegional.unit}` : ""} ({compactDates(days.map((d) => d.date))})
            </dd>
            <dt>Propios de {c.city ? "la ciudad" : "la comunidad"} o no comunes</dt>
            <dd>{own.length}</dd>
            <dt>Fines de semana largos sin vacaciones</dt>
            <dd>
              {summary.free} <small>(calculado)</small>
            </dd>
            <dt>Festivos locales {YEAR}</dt>
            <dd>{s.local.status === "published" ? "Publicados" : s.local.status === "partial" ? "Publicados en parte" : "Pendientes de publicar"}</dd>
          </dl>

          <h2 id="festivos">Los {days.length} festivos de {YEAR} {c.en}</h2>
          <div className="ci-table-scroll mt-4">
            <table className="ci-local-table">
              <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">
                Fiestas laborales de {YEAR} {c.en}, como las publica el BOE ({BOE_REF.id}).
              </caption>
              <thead>
                <tr>
                  <th scope="col">Fecha</th>
                  <th scope="col">Festividad</th>
                  <th scope="col">Tipo (BOE)</th>
                  <th scope="col">¿Dónde más?</th>
                </tr>
              </thead>
              <tbody>
                {days.map((d) => (
                  <tr key={`${d.date}-${d.name}`}>
                    <th scope="row" className="font-normal">
                      <time dateTime={d.date}>{weekdayDate(d.date)}</time>
                    </th>
                    <td>
                      {dayName(d)}
                      {moved.has(d.date) ? ` (traslado del ${weekdayDate(moved.get(d.date)!)}, según el decreto de ${c.city ? "la ciudad" : "la comunidad"})` : ""}
                    </td>
                    <td>{KIND_LABEL[d.code]}</td>
                    <td>{whereElse(d)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {weekend ? <p>{weekend}</p> : null}
          {s.boeNote ? (
            <div role="note" className="ci-callout ci-callout-official">
              <p>
                <strong>Nota del BOE:</strong> {s.boeNote}
              </p>
            </div>
          ) : null}
          {s.subRegional ? (
            <>
              <h3>{s.subRegional.title}</h3>
              <ul>
                {s.subRegional.items.map((i) => (
                  <li key={i.place}>
                    {i.place}: {weekdayDate(i.date)} ({i.name})
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          <h2 id="diferencias">Qué cambia respecto al resto de España</h2>
          <p>
            Son festivo en toda España en {YEAR}: {commonRows().map((r) => `${r.name} (${weekdayDate(r.date)})`).join(", ")}.
          </p>
          <p>
            {own.length > 0
              ? `${c.Full} ${c.plural ? "añaden" : "añade"} ${own.length === 1 ? "este" : `estos ${own.length}`}: ${own.map((d) => `${dayName(d)}, ${weekdayDate(d.date)} (${whereElse(d).charAt(0).toLowerCase()}${whereElse(d).slice(1)})`).join("; ")}.`
              : `${c.Full} no ${c.plural ? "tienen" : "tiene"} festivos distintos de los comunes.`}
          </p>
          {notKept ? <p>{notKept}</p> : null}

          <h2 id="puentes">Puentes y fines de semana largos de {YEAR} {c.en}</h2>
          <p>
            {summary.free} sin gastar vacaciones, {summary.oneDay} con 1 día de vacaciones y {summary.twoDays} con 2.
          </p>
          <ul>
            {runs.map((r) => (
              <li key={`${r.from}-${r.to}-${r.take.join()}`}>{runLine(r)}</li>
            ))}
          </ul>
          <p className="text-sm text-[var(--color-muted)]">{COMPUTED_NOTE}</p>

          <h2 id="locales">Festivos locales de {YEAR} {c.en}</h2>
          <p>
            Cada municipio tiene además hasta 2 festivos locales. {s.local.how}{" "}
            <a href={s.local.bulletinUrl} rel="noopener nofollow" target="_blank">
              {s.local.bulletinName}
            </a>
            .
          </p>
          <p>
            <strong>Estado:</strong> {localStatusLine(c, s.local)}{" "}
            {s.local.status === "published" && s.local.y2027 ? (
              <a href={s.local.y2027.url} rel="noopener nofollow" target="_blank">
                Ver la lista oficial de {YEAR}
              </a>
            ) : s.local.y2026 ? (
              <a href={s.local.y2026.url} rel="noopener nofollow" target="_blank">
                Ver la lista de 2026
              </a>
            ) : null}
          </p>
          {s.local.parts?.length ? (
            <ul>
              {s.local.parts.map((p) => (
                <li key={p.place}>
                  {p.place}:{" "}
                  <a href={p.text.url} rel="noopener nofollow" target="_blank">
                    {p.text.title}
                  </a>{" "}
                  <span className="text-[var(--color-muted)]">({p.text.ref})</span>
                </li>
              ))}
            </ul>
          ) : null}
          {s.local.note && s.local.status !== "partial" ? <p>{s.local.note}</p> : null}
          {s.local.days?.length && s.local.daysScope === "common" ? (
            <>
              <p>
                Uno de los 2 festivos locales es el mismo en toda la comunidad:{" "}
                {s.local.days.map((d) => (
                  <span key={d.date}>
                    <time dateTime={d.date}>{weekdayDate(d.date)}</time> ({d.name})
                  </span>
                ))}
                . Puentes contando también ese día (calculados):
              </p>
              <ul>
                {communityRunsWithLocal(
                  c.region,
                  s.local.days.map((d) => d.date),
                )
                  .filter((r) => s.local.days!.some((d) => d.date >= r.from && d.date <= r.to))
                  .map((r) => (
                    <li key={`${r.from}-${r.to}-${r.take.join()}`}>{runLine(r)}</li>
                  ))}
              </ul>
            </>
          ) : null}
          {s.local.days?.length && s.local.daysScope === "all" ? (
            <>
              <p>
                Las 2 fiestas locales de {c.short} en {YEAR}:{" "}
                {s.local.days.map((d, i) => (
                  <span key={d.date}>
                    {i > 0 ? " y " : ""}
                    <time dateTime={d.date}>{weekdayDate(d.date)}</time> ({d.name})
                  </span>
                ))}
                . Con ellas, {c.short} tiene {days.length + s.local.days.length} festivos en {YEAR}.
              </p>
              <p>Puentes contando también las fiestas locales (calculados):</p>
              <ul>
                {communityRunsWithLocal(
                  c.region,
                  s.local.days.map((d) => d.date),
                ).map((r) => (
                  <li key={`${r.from}-${r.to}-${r.take.join()}`}>{runLine(r)}</li>
                ))}
              </ul>
            </>
          ) : null}
          {s.local.dataset ? (
            <p>
              Datos abiertos:{" "}
              <a href={s.local.dataset.url} rel="noopener nofollow" target="_blank">
                {s.local.dataset.name}
              </a>
              .
            </p>
          ) : null}
          {c.region === "CT" ? (
            <p>
              Festivos de cada municipio catalán: <Link href={hubPath("es")}>festivos locales de los 947 municipios de Cataluña</Link>
              {" · "}
              <Link href={GUIDES.bridges2027.es}>Puentes 2027 en Cataluña, municipio a municipio</Link>.
            </p>
          ) : null}

          <h2 id="fuente">Fuente y comprobación</h2>
          <p>
            La lista es la del BOE: {BOE_REF.title} ({BOE_REF.ref}), que reúne los calendarios que las 17 comunidades y Ceuta y Melilla enviaron
            al Ministerio de Trabajo.{" "}
            {decreeLine(c)}
          </p>
          {s.decreeNote ? <p>{s.decreeNote}</p> : null}
          {decree.status === "published" && decree.quotes.length > 0 ? (
            <ul>
              {decree.quotes.map((q) => (
                <li key={q}>«{q}»</li>
              ))}
            </ul>
          ) : null}

          <h2 id="preguntas">Preguntas frecuentes</h2>
          {faq.map((item) => (
            <section key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </section>
          ))}
        </div>

        <CommunityLinks exclude={c.slug} />

        <SourceList
          items={[
            BOE_REF,
            decree.status === "published" ? decree.text : null,
            s.local.y2027 && s.local.y2027.url !== (decree.status === "published" ? decree.text.url : "") ? s.local.y2027 : null,
            ...(s.local.parts ?? []).map((p) => p.text),
            s.local.y2026,
            ...(s.extraSources ?? []),
          ]}
        />
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ Hub --- */

export function SpainHubPage() {
  const variable = variableDates();
  const free = everywhereFree();
  return (
    <article>
      <Header crumbs={hubCrumbs()} h1={HUB.h1} lead={hubLead()} />

      <div className="ci-shell py-10">
        <div className="ci-prose">
          <h2 id="comunidades">Festivos {YEAR} por comunidad autónoma</h2>
          <div className="ci-table-scroll mt-4">
            <table className="ci-local-table">
              <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">
                Días que cada comunidad y ciudad añade a los {COMMON_DATES.length} comunes, según el BOE.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Comunidad</th>
                  <th scope="col">Festivos</th>
                  <th scope="col">Además de los comunes</th>
                  <th scope="col">Festivos locales {YEAR}</th>
                </tr>
              </thead>
              <tbody>
                {COMMUNITIES_AZ.map((c) => {
                  const s = SOURCES[c.region];
                  return (
                    <tr key={c.slug}>
                      <th scope="row" className="font-normal">
                        <Link href={communityPath(c)}>{c.short}</Link>
                      </th>
                      <td>
                        {dayCount(c.region)}
                        {s.subRegional ? ` + 1 ${s.subRegional.unit}` : ""}
                      </td>
                      <td>{ownDays(c.region).map((d) => `${d.replaces ? "traslado de la Asunción" : d.name} (${compactDates([d.date])})`).join("; ")}</td>
                      <td>{s.local.status === "published" ? "Publicados" : s.local.status === "partial" ? "En parte" : "Pendientes"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <h2 id="comunes">Los {COMMON_DATES.length} festivos comunes a toda España en {YEAR}</h2>
          <ul>
            {commonRows().map((r) => (
              <li key={r.date}>
                {weekdayDate(r.date)}: {r.name}
              </li>
            ))}
          </ul>

          <h2 id="variables">Festivos que cambian según la comunidad</h2>
          <ul>
            {variable.map((v) => (
              <li key={v.date}>
                <strong>{weekdayDate(v.date)}</strong> ({v.rows.map((r) => r.name).join(" / ")}): {regionsWords(v.regions)}.
              </li>
            ))}
          </ul>
          <p>
            Tipos de fiesta según el BOE: {Object.entries(BOE_LEGEND).map(([code, label]) => `${code} ${label}`).join("; ")}.
          </p>

          <h2 id="puentes">Puentes de {YEAR} en toda España</h2>
          <p>
            Sin gastar vacaciones y en todas las comunidades: {free.map((r) => rangeWords(r.from, r.to)).join("; ")}. La Semana Santa da al menos
            4 días seguidos en todas partes; el resto de puentes depende de cada comunidad.{" "}
            <Link href={spainBridgesPath()}>Todos los puentes de {YEAR}, comunidad por comunidad</Link>.
          </p>
          <p className="text-sm text-[var(--color-muted)]">{COMPUTED_NOTE}</p>

          <h2 id="locales">Festivos locales de {YEAR}</h2>
          <p>
            Además de los días del BOE, cada municipio tiene hasta 2 festivos locales, que publica cada comunidad en su boletín (o, en Castilla y
            León y el País Vasco, los boletines de cada provincia). Estado a {dayMonthYear(SOURCES_READ_ON, "es")}:
          </p>
          <ul>
            {COMMUNITIES_AZ.map((c) => {
              const s = SOURCES[c.region];
              return (
                <li key={c.slug}>
                  <Link href={`${communityPath(c)}#locales`}>{c.short}</Link>: {localStatusLine(c, s.local)}
                </li>
              );
            })}
          </ul>
        </div>

        <CommunityLinks />

        <SourceList items={[BOE_REF]} />
      </div>
    </article>
  );
}

/* -------------------------------------------------------------- Bridges --- */

export function SpainBridgesPage() {
  const runs = spainRuns();
  const free = everywhereFree();
  return (
    <article>
      <Header
        crumbs={bridgesCrumbs()}
        h1={BRIDGES.h1}
        lead={`Sin gastar vacaciones, en ${YEAR} hay ${free.length} fines de semana largos en toda España: ${free.map((r) => rangeWords(r.from, r.to)).join("; ")}. El resto de puentes depende de la comunidad: aquí están todos, con los días de vacaciones que piden.`}
      />

      <div className="ci-shell py-10">
        <div className="ci-prose">
          <p className="text-sm text-[var(--color-muted)]">{COMPUTED_NOTE}</p>

          <h2 id="todos">Todos los puentes de {YEAR}, y dónde</h2>
          <div className="ci-table-scroll mt-4">
            <table className="ci-local-table">
              <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">
                Fines de semana largos y puentes de {YEAR} calculados con los festivos del BOE de cada comunidad.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Fechas</th>
                  <th scope="col">Días seguidos</th>
                  <th scope="col">Vacaciones</th>
                  <th scope="col">Festivo</th>
                  <th scope="col">Dónde</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((r) => (
                  <tr key={`${r.from}-${r.to}-${r.take.join()}`}>
                    <th scope="row" className="font-normal">
                      {rangeWords(r.from, r.to).replace(/^del /, "")}
                    </th>
                    <td>{r.days}</td>
                    <td>{r.take.length === 0 ? "Ninguna" : r.take.map((t) => weekdayDate(t)).join(", ")}</td>
                    <td>{r.holidays.map((h) => h.name).join(", ")}</td>
                    <td>
                      {r.regions.length === REGIONS.length ? (
                        "Toda España"
                      ) : r.regions.length >= 15 ? (
                        <>
                          Toda España salvo{" "}
                          {REGIONS.filter((x) => !r.regions.includes(x)).map((region, i) => (
                            <span key={region}>
                              {i > 0 ? ", " : ""}
                              <Link href={communityPath(names(region))}>{names(region).short}</Link>
                            </span>
                          ))}
                        </>
                      ) : (
                        r.regions.map((region, i) => (
                          <span key={region}>
                            {i > 0 ? ", " : ""}
                            <Link href={communityPath(names(region))}>{names(region).short}</Link>
                          </span>
                        ))
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 id="por-comunidad">Fines de semana largos sin vacaciones, por comunidad</h2>
          <ul>
            {COMMUNITIES_AZ.map((c) => {
              const mine = communityRuns(c.region).filter((r) => r.take.length === 0);
              return (
                <li key={c.slug}>
                  <Link href={`${communityPath(c)}#puentes`}>{c.short}</Link>: {mine.length} ({mine.map((r) => rangeWords(r.from, r.to).replace(/^del /, "")).join("; ")})
                </li>
              );
            })}
          </ul>
        </div>

        <CommunityLinks />

        <SourceList items={[BOE_REF]} />
      </div>
    </article>
  );
}
