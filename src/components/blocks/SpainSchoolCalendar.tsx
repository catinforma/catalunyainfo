import Link from "next/link";

import { addDays, daysBetween, todayInCatalonia } from "@/lib/content/holidays/calendar";
import {
  SPAIN_SCHOOL_YEAR,
  fullDate,
  holidaysInTerm,
  joinList,
  longSpan,
  mainLevels,
  nextBreak,
  nextSchoolDay,
  schoolDayIn,
  variesByProvince,
  weekdayDay,
} from "@/lib/content/school-spain/logic";
import { orderWhere } from "@/lib/content/school-spain/body";
import { hubRegions, pendingRegions, regionBySlug, regionPath } from "@/lib/content/school-spain/regions";
import type { Period, RegionCalendar } from "@/lib/content/school-spain/types";

/**
 * The school calendar of one Spanish community, or (`region="espana"`) all of
 * them side by side: what the order says about today and tomorrow, the next
 * break, then the year's dates.
 *
 * Server-rendered, computed in Europe/Madrid; the nightly cron rebuilds the
 * page just after midnight (`spainSchoolCalendar` is in DAY_DEPENDENT_BLOCKS).
 * Spanish only, like the pages that carry it.
 */
export function SpainSchoolCalendar({ region }: { region: string }) {
  const today = todayInCatalonia();
  if (region === "espana") return <Hub today={today} />;
  const r = regionBySlug(region);
  if (!r) return null;
  return <Region region={r} today={today} />;
}

const SHORT_MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sept", "oct", "nov", "dic"];

/** "23 dic" */
function short(iso: string): string {
  return `${Number(iso.slice(8, 10))} ${SHORT_MONTHS[Number(iso.slice(5, 7)) - 1]}`;
}

/** "23 dic – 7 ene" */
function shortSpan(period: Period): string {
  return period.from === period.to ? short(period.from) : `${short(period.from)} – ${short(period.to)}`;
}

function dayLine(region: RegionCalendar, iso: string, which: "Hoy" | "Mañana"): string {
  const when = `${which}, ${weekdayDay(iso)}`;
  if (variesByProvince(region, iso)) return `${when}: depende de la provincia; mira la tabla por provincias.`;
  const day = schoolDayIn(region, iso);
  switch (day.kind) {
    case "before":
      return `${when}: el curso aún no ha empezado; empieza el ${weekdayDay(day.start)}.`;
    case "weekend":
      return `${when}: no hay clase (fin de semana).`;
    case "holiday":
      return `${when}: no hay clase, es festivo (${day.name}).`;
    case "nonTeaching":
      return `${when}: no hay clase, es día no lectivo (${day.reason}).`;
    case "christmas":
    case "easter":
      return `${when}: vacaciones de ${day.kind === "christmas" ? "Navidad" : "Semana Santa"}. Se vuelve a clase el ${weekdayDay(nextSchoolDay(region, day.until))}.`;
    case "break":
      return `${when}: no hay clase (${day.name}). Se vuelve el ${weekdayDay(nextSchoolDay(region, day.until))}.`;
    case "summer":
      return `${when}: el curso ${SPAIN_SCHOOL_YEAR} ya ha terminado.`;
    default:
      return `${when}: día lectivo ${region.inName}.`;
  }
}

function Region({ region, today }: { region: RegionCalendar; today: string }) {
  const { start, end } = mainLevels(region);
  const main = region.levels[0]!;
  const next = nextBreak(region, today);
  let nextLine: string | null = null;
  if (next && next.kind !== "summer") {
    const name = next.kind === "break" ? next.period.name : next.kind === "christmas" ? "Navidad" : "Semana Santa";
    const minimum = next.kind !== "break" && next.period.minimum ? ", como mínimo" : "";
    nextLine = `Próximas vacaciones: ${name}, ${longSpan(next.period)}${minimum} (dentro de ${daysBetween(today, next.period.from)} días).`;
  } else if (next?.kind === "summer" && today >= start) {
    nextLine = main.endText
      ? `Último día de clase: ${main.endText}.`
      : `Último día de clase: ${fullDate(end)} (dentro de ${daysBetween(today, end)} días).`;
  }
  // The next weekday off for everyone in the community before that break.
  const limit = next ? (next.kind === "summer" ? next.from : next.period.from) : today;
  const offDays = [
    ...holidaysInTerm(region).map((h) => ({ date: h.date, why: h.name })),
    ...region.nonTeaching.filter((d) => !d.partial).map((d) => ({ date: d.date, why: d.reason })),
  ]
    .filter((d) => d.date > addDays(today, 1) && d.date < limit)
    .sort((a, b) => a.date.localeCompare(b.date));
  const nextOff = offDays[0];

  const rows: [string, string][] = [
    [`Inicio de curso (${main.levels})`, main.startText ?? fullDate(start)],
    [`Vacaciones de Navidad${region.christmas.minimum ? " (mínimo)" : ""}`, region.christmas.label ?? longSpan(region.christmas)],
    ...region.otherBreaks
      .filter((b) => b.from < region.easter.from)
      .map((b) => [b.name, longSpan(b)] as [string, string]),
    [`Vacaciones de Semana Santa${region.easter.minimum ? " (mínimo)" : ""}`, region.easter.label ?? longSpan(region.easter)],
    ...region.otherBreaks
      .filter((b) => b.from > region.easter.from)
      .map((b) => [b.name, longSpan(b)] as [string, string]),
    [`Fin de curso (${main.levels})`, main.endText ?? fullDate(end)],
  ];

  return (
    <section className="ci-school" aria-label={`Calendario escolar ${SPAIN_SCHOOL_YEAR} ${region.inName}`}>
      <div className="ci-reservoirs-head">
        <p className="ci-reservoirs-figure">{dayLine(region, today, "Hoy")}</p>
        <p>{dayLine(region, addDays(today, 1), "Mañana")}</p>
        {nextOff ? (
          <p>
            Próximo día laborable sin clase en toda la comunidad: {weekdayDay(nextOff.date)} ({nextOff.why}).
          </p>
        ) : null}
        {nextLine ? <p>{nextLine}</p> : null}
        <p className="ci-calc-note">
          {region.flexible
            ? "Límites y mínimos que fija la comunidad: cada centro aprueba su propio calendario dentro de ellos, con sus fiestas locales y sus días no lectivos."
            : "Calendario general de la comunidad. No cuenta las fiestas locales de cada municipio ni los días que puedan fijar el ayuntamiento o el propio centro."}
        </p>
      </div>

      <div className="ci-table-scroll">
        <table className="ci-local-table ci-school-table">
          <caption>Calendario escolar {SPAIN_SCHOOL_YEAR} {region.inName}</caption>
          <thead>
            <tr>
              <th scope="col">Qué</th>
              <th scope="col">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, value]) => (
              <tr key={label}>
                <th scope="row">{label}</th>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="ci-calc-note">
        Fuente:{" "}
        <a href={region.order.url} rel="noopener" target="_blank">
          {region.order.short}
        </a>{" "}
        ({orderWhere(region.order)}).
      </p>
    </section>
  );
}

function Hub({ today }: { today: string }) {
  const regions = hubRegions();
  const pending = pendingRegions();
  // The next Christmas or Easter break to start, and where it starts first.
  const upcoming = regions
    .flatMap((r) => [
      { r, kind: "Navidad", period: r.christmas },
      { r, kind: "Semana Santa", period: r.easter },
    ])
    .filter((x) => x.period.from > today)
    .sort((a, b) => a.period.from.localeCompare(b.period.from));
  const first = upcoming[0];
  const firstNames = first
    ? upcoming.filter((x) => x.kind === first.kind && x.period.from === first.period.from).map((x) => x.r.short)
    : [];
  const sameKind = first ? upcoming.filter((x) => x.kind === first.kind) : [];
  const last = sameKind.at(-1);

  return (
    <section className="ci-school" aria-label={`Calendario escolar ${SPAIN_SCHOOL_YEAR} por comunidades`}>
      {first ? (
        <div className="ci-reservoirs-head">
          <p className="ci-reservoirs-figure">
            Vacaciones de {first.kind}: las primeras empiezan el {weekdayDay(first.period.from)} en {joinList(firstNames)} (dentro de{" "}
            {daysBetween(today, first.period.from)} días)
            {last && last.period.from !== first.period.from
              ? `, y las últimas el ${weekdayDay(last.period.from)} en ${joinList(sameKind.filter((x) => x.period.from === last.period.from).map((x) => x.r.short))}`
              : ""}
            .
          </p>
          <p className="ci-calc-note">
            Primer y último día sin clase, ambos incluidos, en Infantil y Primaria. Sin contar fines de semana previos, fiestas
            locales ni días que fije cada municipio o centro.
          </p>
        </div>
      ) : null}

      <div className="ci-table-scroll">
        <table className="ci-local-table ci-school-table">
          <caption>Calendario escolar {SPAIN_SCHOOL_YEAR} por comunidades</caption>
          <thead>
            <tr>
              <th scope="col">Comunidad</th>
              <th scope="col">Inicio</th>
              <th scope="col">Navidad</th>
              <th scope="col">Otras vacaciones</th>
              <th scope="col">Semana Santa</th>
              <th scope="col">Fin de curso</th>
            </tr>
          </thead>
          <tbody>
            {regions.map((r) => {
              const { start, end } = mainLevels(r);
              const main = r.levels[0]!;
              return (
                <tr key={r.slug}>
                  <th scope="row">
                    <Link href={`/es/${regionPath(r.slug)}/`}>{r.short}</Link>
                    {r.provinces?.length ? " (por provincias)" : ""}
                  </th>
                  <td>{main.startLatest ? `${short(start)} – ${short(main.startLatest)}*` : main.startText ? `desde ${short(start)}*` : short(start)}</td>
                  <td>{r.christmas.labelShort ?? shortSpan(r.christmas)}{r.christmas.minimum ? "*" : ""}</td>
                  <td>{r.otherBreaks.length ? r.otherBreaks.map((b) => `${b.name}: ${shortSpan(b)}`).join("; ") : (r.hubOther ?? "—")}</td>
                  <td>{r.easter.labelShort ?? shortSpan(r.easter)}{r.easter.minimum ? "*" : ""}</td>
                  <td>{main.endEarliest ? `${short(main.endEarliest)} – ${short(end)}*` : main.endText ? `hasta ${short(end)}*` : short(end)}</td>
                </tr>
              );
            })}
            {pending.map((p) => (
              <tr key={p.slug}>
                <th scope="row">{p.short}</th>
                <td colSpan={5}>por confirmar</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="ci-calc-note">
        Fechas de Infantil y Primaria, del primer al último día sin clase en cada periodo de vacaciones, según la orden o
        resolución de cada comunidad para el curso {SPAIN_SCHOOL_YEAR}; ESO, Bachillerato y FP pueden empezar o terminar otro
        día: está en la página de cada comunidad. * Navarra y País Vasco: márgenes y mínimos; cada centro fija sus días.
      </p>
    </section>
  );
}
