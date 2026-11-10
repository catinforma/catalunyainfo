import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { b2href } from "@/lib/content/batch02/shared";
import { SATURDAY_SOURCES } from "@/lib/content/holidays/saturday";
import { getMessages } from "@/lib/i18n";
import { BOE_2026 } from "@/lib/programmatic/holidays/boe-2026";
import { REGIONS, type Region } from "@/lib/programmatic/holidays/boe-2027";
import { dayMonthYear, longDate } from "@/lib/programmatic/holidays/format";
import { datePath, isDatePage } from "@/lib/programmatic/holidays/paths";
import { dateQuestion } from "@/lib/programmatic/holidays/question";
import { names } from "@/lib/programmatic/spain-2027/communities";
import { BRIDGES, HUB, compactDates, runLine, weekdayDate } from "@/lib/programmatic/spain-2027/copy";
import {
  COMPUTED_NOTE,
  dayDescription,
  dayFaq,
  dayH1,
  dayLead,
  dayNotes,
  dayQuestion,
  daySections,
  dayShape,
  dayTitle,
  dayVerdict,
  hubDayWords,
  whereWords,
  workingIn,
} from "@/lib/programmatic/spain-2027/day-copy";
import { DAY_PAGES, SPAIN_DAYS, change2026, dayRuns, hasDayPage, isCity, isWeekend, neighbours, spainDay, type SpainDay } from "@/lib/programmatic/spain-2027/days";
import { communityPath, spainBridgesPath, spainDayPath, spainHubPath } from "@/lib/programmatic/spain-2027/paths";
import { BOE_REF, SOURCES, SOURCES_READ_ON } from "@/lib/programmatic/spain-2027/sources";
import { breadcrumbSchema, datasetSchema, faqSchema, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

/**
 * "¿Es festivo el 19 de marzo de 2027?" for all Spain (/es/festivos/2027/dia/…),
 * the hub's list of those days and the link the community tables put on each
 * date. Spanish only: each page lists itself as its only edition. Every word
 * comes from `day-copy.ts`, every fact from `days.ts`.
 */

const NOT_FOUND: Metadata = { robots: { index: false, follow: false } };

/** The BOE's terms of reuse, as the community pages cite them. */
const BOE_REUSE = "https://www.boe.es/informacion/aviso_legal/index.php#reutilizacion";
const CREATOR = "Ministerio de Trabajo y Economía Social. Dirección General de Trabajo";

/** The December 2026 bridge, Christmas and Reyes by community: these pages start in 2027 and send readers there for the rest. */
const DECEMBER_2026 = b2href("decemberBridgeSpain", "es");

function only(path: string) {
  return { es: path };
}

export function dayCrumbs(iso: string): Crumb[] {
  return [
    { label: getMessages("es").common.home, href: "/es/" },
    { label: HUB.breadcrumb, href: spainHubPath() },
    { label: dayH1(iso), href: spainDayPath(iso) },
  ];
}

interface Source {
  title: string;
  ref: string;
  url: string;
}

/** The texts behind one day: the BOE always; the local days' own texts; a decree's move; 2026's table; a Saturday's case law. */
function daySources(day: SpainDay): Source[] {
  const out: Source[] = [BOE_REF];
  for (const h of day.holders) if (h.source) out.push(h.source);
  for (const h of day.holders) {
    const d = SOURCES[h.region].decree;
    if (h.movedFrom && d.status === "published") out.push(d.text);
  }
  if (change2026(day)) out.push({ title: BOE_2026.name, ref: BOE_2026.ref, url: BOE_2026.url });
  if (isWeekend(day.date) && day.regions.length > 0) out.push(...SATURDAY_SOURCES.map((s) => ({ title: s.name, ref: s.ref, url: s.url })));
  return out.filter((s, i) => out.findIndex((x) => x.url === s.url) === i);
}

/** Inline links to each territory's 2027 page: "Galicia, Madrid y Murcia". */
function RegionLinks({ regions }: { regions: readonly Region[] }) {
  return (
    <>
      {regions.map((r, i) => (
        <span key={r}>
          {i === 0 ? "" : i === regions.length - 1 ? " y " : ", "}
          <Link href={communityPath(names(r))}>{names(r).short}</Link>
        </span>
      ))}
    </>
  );
}

/** A date in a table or list, linked to its day page when it has one. */
export function DayDateLink({ iso, children }: { iso: string; children: ReactNode }) {
  return hasDayPage(iso) ? <Link href={spainDayPath(iso)}>{children}</Link> : <>{children}</>;
}

/* ------------------------------------------------------------- Day page --- */

function WhereLists({ day }: { day: SpainDay }) {
  if (day.moved) {
    const moved = new Set(day.moved.to.flatMap((t) => t.regions));
    return (
      <ul>
        {day.moved.to.map((t) => (
          <li key={t.date}>
            Al <DayDateLink iso={t.date}>{weekdayDate(t.date)}</DayDateLink>: <RegionLinks regions={t.regions} />
          </li>
        ))}
        <li>
          No se traslada: <RegionLinks regions={REGIONS.filter((r) => !moved.has(r))} />
        </li>
      </ul>
    );
  }
  if (day.national) {
    return (
      <p>
        <RegionLinks regions={REGIONS} />.
      </p>
    );
  }
  const working = workingIn(day);
  const several = new Set(day.holders.map((h) => h.name)).size > 1;
  return (
    <>
      <h3>Festivo ({day.regions.length})</h3>
      <ul>
        {day.holders.map((h) => (
          <li key={h.region}>
            <Link href={communityPath(names(h.region))}>{names(h.region).short}</Link>
            {h.basis === "local" ? (
              <span className="text-[var(--color-muted)]">
                {" "}
                ({isCity(h.region) ? "fiesta local de la ciudad" : "fiesta local en todos los municipios"}: {h.name})
              </span>
            ) : several ? (
              <span className="text-[var(--color-muted)]"> ({h.name})</span>
            ) : null}
          </li>
        ))}
      </ul>
      <h3>Laborable ({working.length})</h3>
      <ul className="columns-1 sm:columns-2 lg:columns-3">
        {working.map((r) => (
          <li key={r}>
            <Link href={communityPath(names(r))}>{names(r).short}</Link>
          </li>
        ))}
      </ul>
    </>
  );
}

function BridgeList({ day }: { day: SpainDay }) {
  const runs = dayRuns(day);
  if (runs.length === 0) return null;
  return (
    <>
      <ul>
        {runs.map((g) => (
          <li key={`${g.run.from}-${g.run.to}-${g.run.take.join()}`}>
            {runLine(g.run)} — en {g.regions.length >= 10 ? whereWords(g.regions) : <RegionLinks regions={g.regions} />}.
          </li>
        ))}
      </ul>
      <p className="text-sm text-[var(--color-muted)]">{COMPUTED_NOTE}</p>
    </>
  );
}

export function SpainDayPage({ iso }: { iso: string }) {
  const day = spainDay(iso)!;
  const sections = daySections(day);
  const { prev, next } = neighbours(iso);
  const sources = daySources(day);
  const shape = dayShape(day);

  return (
    <article>
      <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
        <div className="ci-shell py-5 md:py-8 lg:py-12">
          <Breadcrumbs items={dayCrumbs(iso)} locale="es" />
          <h1 className="ci-measure">{dayH1(iso)}</h1>
        </div>
      </header>

      <div className="ci-shell py-10">
        <div className="ci-prose">
          <div className="ci-today">
            <p className={`ci-today-answer ${shape === "national" || shape === "most" ? "is-holiday" : "is-not"}`}>{dayVerdict(day)}</p>
            <p className="ci-today-date">
              <time dateTime={iso}>{longDate(iso, "es")}</time>
            </p>
          </div>
          <p className="ci-lead">{dayLead(day)}</p>
          {dayNotes(day).map((n) => (
            <p key={n}>{n}</p>
          ))}
          {iso === "2027-01-06" ? (
            <p>
              La Navidad, el Año Nuevo y Reyes, comunidad por comunidad, con los días que hay que pedir:{" "}
              <Link href={DECEMBER_2026}>puente de diciembre 2026 y Reyes en España</Link>.
            </p>
          ) : null}

          {sections.map((s) => (
            <section key={s.id} aria-labelledby={`ci-dia-${s.id}`}>
              <h2 id={`ci-dia-${s.id}`}>{s.question}</h2>
              <p>{s.printed}</p>
              {s.id === "puente" ? <BridgeList day={day} /> : null}
              {s.id === "donde" ? (
                <>
                  <WhereLists day={day} />
                  {isDatePage(iso) ? (
                    <p>
                      En Cataluña, con las fiestas locales de cada municipio: <Link href={datePath("es", iso)}>{dateQuestion(iso, "es")}</Link>
                    </p>
                  ) : null}
                </>
              ) : null}
            </section>
          ))}
        </div>

        <nav className="mt-12 flex flex-wrap justify-between gap-4" aria-label="Festivos anterior y siguiente">
          {prev ? <Link href={spainDayPath(prev)}>← {dayQuestion(prev)}</Link> : <Link href={DECEMBER_2026}>← Puente de diciembre 2026 en España</Link>}
          {next ? <Link href={spainDayPath(next)}>{dayQuestion(next)} →</Link> : <Link href={spainHubPath()}>{HUB.breadcrumb} →</Link>}
        </nav>

        <section className="mt-12" aria-labelledby="ci-dia-otros">
          <h2 id="ci-dia-otros">Otros festivos de {iso.slice(0, 4)}, día a día</h2>
          <p>
            {DAY_PAGES.filter((d) => d !== iso).map((d, i) => (
              <span key={d}>
                {i > 0 ? " · " : ""}
                <Link href={spainDayPath(d)}>{compactDates([d])}</Link>
              </span>
            ))}
          </p>
          <p className="mt-4 text-sm">
            <Link href={spainHubPath()}>{HUB.breadcrumb}: festivos por comunidad</Link>
            {" · "}
            <Link href={spainBridgesPath()}>{BRIDGES.breadcrumb} en España</Link>
          </p>
        </section>

        <section className="ci-measure mt-12" aria-labelledby="ci-dia-fuentes">
          <h2 id="ci-dia-fuentes" className="font-sans text-base font-semibold">
            Fuentes oficiales
          </h2>
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            <time dateTime={SOURCES_READ_ON}>Leídas el {dayMonthYear(SOURCES_READ_ON, "es")} en los boletines oficiales.</time>
          </p>
          <ol className="ci-sources mt-3">
            {sources.map((s) => (
              <li key={s.url}>
                <span>
                  <a href={s.url} rel="noopener nofollow" target="_blank">
                    {s.title}
                  </a>
                  <span className="text-[var(--color-muted)]"> — {s.ref}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </article>
  );
}

export function spainDayMetadata(iso: string): Metadata {
  const day = spainDay(iso);
  if (!day?.page) return NOT_FOUND;
  const path = spainDayPath(iso);
  return buildMetadata({ locale: "es", path, title: dayTitle(iso, day), description: dayDescription(day), translations: only(path) });
}

export function SpainDayRoute({ iso }: { iso: string }) {
  const day = spainDay(iso)!;
  const path = spainDayPath(iso);
  return (
    <>
      <SiteHeader locale="es" translations={only(path)} />
      <main id="main">
        <SpainDayPage iso={iso} />
      </main>
      <JsonLd
        json={graph([
          breadcrumbSchema(dayCrumbs(iso)),
          faqSchema([{ type: "faq", items: dayFaq(day) }]),
          datasetSchema({
            path,
            name: dayH1(iso),
            description: dayDescription(day),
            locale: "es",
            creator: CREATOR,
            license: BOE_REUSE,
            isBasedOn: daySources(day).map((s) => s.url),
            spatialCoverage: "España",
            temporalCoverage: iso,
            dateModified: SOURCES_READ_ON,
          }),
        ])}
      />
      <SiteFooter locale="es" />
    </>
  );
}

/* ------------------------------------------------------------------ Hub --- */

/** The hub's list: every date that is a day off somewhere in 2027, linked where it has a page. */
export function SpainDayIndex() {
  return (
    <section aria-labelledby="ci-es27-dias">
      <h2 id="ci-es27-dias">¿Es festivo…? Los festivos de 2027, día a día</h2>
      <p>Cada fecha con su respuesta para toda España: dónde es festivo, dónde no y qué puente hace.</p>
      <ul>
        {SPAIN_DAYS.map((d) => (
          <li key={d.date}>
            <strong>
              <DayDateLink iso={d.date}>{weekdayDate(d.date)}</DayDateLink>
            </strong>
            : {hubDayWords(d)}.
          </li>
        ))}
      </ul>
    </section>
  );
}
