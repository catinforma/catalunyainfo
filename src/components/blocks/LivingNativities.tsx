import { longDate, shortDate } from "@/lib/content/holidays/calendar";
import {
  NATIVITY_SOURCE,
  groupByComarca,
  loadNativities,
  type NativityEvent,
} from "@/lib/content/pessebres/agenda";
import { slugify } from "@/lib/content/weekend/agenda";
import type { Locale } from "@/lib/i18n/config";

/**
 * Upcoming living nativity scenes, from the Generalitat's open-data agenda.
 *
 * An async server component, like the weekend agenda: the list has to be in
 * the HTML to rank for "pessebres vivents 2026", and it has to be this
 * season's. Grouped by comarca, because the question people ask is "which
 * ones are near me"; each comarca is in date order.
 *
 * Before the organisers have posted anything (most do between late November
 * and mid-December) the block says so plainly, with what last season looked
 * like and a link to the agenda, instead of showing an empty frame or last
 * year's list.
 *
 * Its wording lives here rather than in the message catalogues so this block
 * can be merged without touching files other work is changing.
 */

interface Copy {
  title: string;
  read: string;
  updated: string;
  /** "between 20 December and 6 January", or the one day when both are equal. */
  span: (first: string, last: string) => string;
  summary: (count: number, comarques: number, span: string) => string;
  rangeNote: string;
  none: string;
  when: string;
  agendaLink: string;
  othersTitle: string;
  othersNote: string;
  more: string;
  organiser: string;
  unavailable: string;
  sourceLine: string;
}

const COPY: Record<Locale, Copy> = {
  ca: {
    title: "Calendari de pessebres vivents",
    read: "Llista llegida el {date} de l'Agenda Cultural de la Generalitat.",
    updated: "Darrera actualització de les dades per part de la Generalitat: {date}.",
    // "l'1", "l'11": the article elides before un and onze.
    span: (first, last) => {
      const el = (date: string) => `${/^1{1,2} /.test(date) ? "l'" : "el "}${date}`;
      return first === last ? el(first) : `entre ${el(first)} i ${el(last)}`;
    },
    summary: (count, comarques, span) =>
      count === 1
        ? `1 pessebre vivent a l'agenda, ${span}.`
        : `${count} pessebres vivents en ${comarques} ${comarques === 1 ? "comarca" : "comarques"}, ${span}.`,
    rangeNote:
      "Les dates són el primer i l'últim dia de cada pessebre: molts només es representen alguns dies d'aquest interval. Els dies concrets, l'horari i si cal entrada són a la fitxa de cada un (enllaç al nom).",
    none: "Encara no hi ha cap pessebre vivent de la temporada a l'Agenda Cultural de la Generalitat.",
    when:
      "És normal: els organitzadors els hi publiquen ells mateixos, i la temporada 2025-26 el primer hi va aparèixer el 19 de novembre, la meitat hi eren a finals de novembre i gairebé tots abans del 15 de desembre. Aquesta llista es torna a llegir cada dia; també pots mirar",
    agendaLink: "la secció de Nadal de l'Agenda Cultural",
    othersTitle: "Altres pessebres a l'agenda: mostres i exposicions",
    othersNote:
      "L'agenda no els presenta com a pessebres vivents: són mostres, exposicions, pessebres monumentals i altres activitats amb «pessebre» al nom.",
    more: "I {n} més a l'agenda oficial.",
    organiser: "web de l'organitzador",
    unavailable:
      "Ara mateix no podem llegir l'Agenda Cultural de la Generalitat. No et mostrarem una llista antiga: consulta-la directament a",
    sourceLine:
      "Hi surten les activitats que el seu organitzador ha publicat a l'agenda oficial amb «pessebre vivent» al nom, amb el nom tal com l'ha escrit. Font:",
  },
  es: {
    title: "Calendario de belenes vivientes",
    read: "Lista leída el {date} de la Agenda Cultural de la Generalitat.",
    updated: "Última actualización de los datos por parte de la Generalitat: {date}.",
    span: (first, last) => (first === last ? `el ${first}` : `entre el ${first} y el ${last}`),
    summary: (count, comarques, span) =>
      count === 1
        ? `1 belén viviente en la agenda, ${span}.`
        : `${count} belenes vivientes en ${comarques} ${comarques === 1 ? "comarca" : "comarcas"}, ${span}.`,
    rangeNote:
      "Las fechas son el primer y el último día de cada belén: muchos solo se representan algunos días dentro de ese intervalo. Los días concretos, el horario y si hace falta entrada están en la ficha de cada uno (enlace en el nombre, en catalán).",
    none: "Todavía no hay ningún belén viviente («pessebre vivent») de la temporada en la Agenda Cultural de la Generalitat.",
    when:
      "Es lo normal: los organizadores los publican ellos mismos, y en la temporada 2025-26 el primero apareció el 19 de noviembre, la mitad estaban a finales de noviembre y casi todos antes del 15 de diciembre. Esta lista se vuelve a leer cada día; también puedes consultar",
    agendaLink: "la sección de Navidad de la Agenda Cultural",
    othersTitle: "Otros belenes en la agenda: muestras y exposiciones",
    othersNote:
      "La agenda no los presenta como belenes vivientes: son muestras, exposiciones, belenes monumentales y otras actividades con «pessebre» en el nombre.",
    more: "Y {n} más en la agenda oficial.",
    organiser: "web del organizador",
    unavailable:
      "Ahora mismo no podemos leer la Agenda Cultural de la Generalitat. No te mostraremos una lista antigua: consúltala directamente en",
    sourceLine:
      "Aparecen las actividades que su organizador ha publicado en la agenda oficial con «pessebre vivent» en el nombre, con el nombre tal como lo ha escrito. Fuente:",
  },
  en: {
    title: "Living nativity scene calendar",
    read: "List read on {date} from the Generalitat's cultural agenda.",
    updated: "The Generalitat last updated this data on {date}.",
    span: (first, last) => (first === last ? `on ${first}` : `between ${first} and ${last}`),
    summary: (count, comarques, span) =>
      count === 1
        ? `1 living nativity scene listed, ${span}.`
        : `${count} living nativity scenes in ${comarques} ${comarques === 1 ? "county (comarca)" : "counties (comarques)"}, ${span}.`,
    rangeNote:
      "The dates are each nativity's first and last day: many are performed only on some days in between. The exact days, times and whether you need a ticket are on each one's listing (linked from its name, in Catalan).",
    none: "No living nativity scene (\"pessebre vivent\") for this season is in the Generalitat's cultural agenda yet.",
    when:
      "That is normal: organisers post their own, and in the 2025-26 season the first appeared on 19 November, half were listed by the end of November and nearly all before 15 December. This list is re-read every day; you can also check",
    agendaLink: "the Christmas section of the cultural agenda",
    othersTitle: "Other nativity scenes listed: exhibitions and displays",
    othersNote:
      "The agenda does not describe these as living nativities: they are exhibitions, displays, large static nativity scenes and other events with \"pessebre\" in the name.",
    more: "And {n} more in the official agenda.",
    organiser: "organiser's website",
    unavailable:
      "We cannot read the Generalitat's cultural agenda right now. We will not show you an old list: check it directly at",
    sourceLine:
      "Listed: events whose organiser has posted them in the official agenda with \"pessebre vivent\" in the name, named as the organiser wrote it. Source:",
  },
};

/** Enough to be useful under the living ones without burying them. */
const OTHERS_LIMIT = 20;

function withYear(iso: string, locale: Locale): string {
  return `${shortDate(iso, locale)}${locale === "en" ? " " : " de "}${iso.slice(0, 4)}`;
}

function dateRange(event: NativityEvent, locale: Locale): string {
  if (event.start === event.end) return shortDate(event.start, locale);
  // "6–7 de desembre" rather than "6 de desembre – 7 de desembre".
  if (event.start.slice(0, 7) === event.end.slice(0, 7)) {
    return `${Number(event.start.slice(8, 10))}–${shortDate(event.end, locale)}`;
  }
  return `${shortDate(event.start, locale)} – ${shortDate(event.end, locale)}`;
}

/** Many rows give the town, or the nativity's own name, as the venue. */
function venueWorthShowing(event: NativityEvent): boolean {
  const venue = slugify(event.venue);
  if (!venue) return false;
  return venue !== slugify(event.municipality) && !slugify(event.title).includes(venue);
}

function Item({ event, locale, showComarca }: { event: NativityEvent; locale: Locale; showComarca: boolean }) {
  const t = COPY[locale];
  const town = showComarca && event.comarca ? `${event.municipality} (${event.comarca})` : event.municipality;
  const place = [venueWorthShowing(event) ? event.venue : "", town].filter(Boolean).join(", ");
  return (
    <li className="ci-agenda-item">
      <p className="ci-agenda-title">
        {event.agendaUrl ? (
          <a href={event.agendaUrl} rel="noopener nofollow" target="_blank" lang="ca">
            {event.title}
          </a>
        ) : (
          <span lang="ca">{event.title}</span>
        )}
      </p>
      <p className="ci-agenda-meta">
        {place}
        {place ? " · " : ""}
        {dateRange(event, locale)}
        {event.organiserUrl ? (
          <>
            {" · "}
            <a href={event.organiserUrl} rel="noopener nofollow" target="_blank">
              {t.organiser}
            </a>
          </>
        ) : null}
      </p>
    </li>
  );
}

function AgendaLink({ locale }: { locale: Locale }) {
  return (
    <a href={NATIVITY_SOURCE.url} rel="noopener" target="_blank">
      {COPY[locale].agendaLink}
    </a>
  );
}

export async function LivingNativities({ locale }: { locale: Locale }) {
  const t = COPY[locale];
  const { today, events, updatedAt, error } = await loadNativities();

  if (error) {
    return (
      <section className="ci-agenda" aria-label={t.title}>
        <h3 className="ci-agenda-heading">{t.title}</h3>
        <p className="ci-agenda-note">
          {t.unavailable}{" "}
          <a href={NATIVITY_SOURCE.url} rel="noopener" target="_blank">
            {NATIVITY_SOURCE.name}
          </a>
          .
        </p>
      </section>
    );
  }

  const living = events.filter((event) => event.kind === "living");
  const others = events.filter((event) => event.kind === "other");
  const groups = groupByComarca(living);
  const first = living.reduce((min, event) => (event.start < min ? event.start : min), living[0]?.start ?? today);
  const last = living.reduce((max, event) => (event.end > max ? event.end : max), living[0]?.end ?? today);

  return (
    <section className="ci-agenda" aria-label={t.title}>
      <h3 className="ci-agenda-heading">{t.title}</h3>
      <p className="ci-agenda-range">
        {t.read.replace("{date}", longDate(today, locale))}
        {updatedAt ? ` ${t.updated.replace("{date}", withYear(updatedAt, locale))}` : null}
      </p>

      {living.length === 0 ? (
        <>
          <p className="ci-agenda-summary">{t.none}</p>
          <p className="ci-agenda-note">
            {t.when} <AgendaLink locale={locale} />.
          </p>
        </>
      ) : (
        <>
          <p className="ci-agenda-summary">
            {t.summary(living.length, groups.length, t.span(withYear(first, locale), withYear(last, locale)))}
          </p>
          <p className="ci-agenda-note">{t.rangeNote}</p>
          {groups.map((group) => (
            <div key={group.comarca}>
              <h4 className="ci-agenda-group">
                {group.comarca}
                <span className="ci-agenda-count">{group.items.length}</span>
              </h4>
              <ul className="ci-agenda-list">
                {group.items.map((event) => (
                  <Item key={event.id} event={event} locale={locale} showComarca={false} />
                ))}
              </ul>
            </div>
          ))}
        </>
      )}

      {others.length > 0 ? (
        <>
          <h4 className="ci-agenda-group">
            {t.othersTitle}
            <span className="ci-agenda-count">{others.length}</span>
          </h4>
          <p className="ci-agenda-note">{t.othersNote}</p>
          <ul className="ci-agenda-list">
            {others.slice(0, OTHERS_LIMIT).map((event) => (
              <Item key={event.id} event={event} locale={locale} showComarca />
            ))}
          </ul>
          {others.length > OTHERS_LIMIT ? (
            <p className="ci-agenda-more">{t.more.replace("{n}", String(others.length - OTHERS_LIMIT))}</p>
          ) : null}
        </>
      ) : null}

      <p className="ci-agenda-note">
        {t.sourceLine}{" "}
        <a href={NATIVITY_SOURCE.home} rel="noopener" target="_blank">
          {NATIVITY_SOURCE.name}
        </a>{" "}
        ({NATIVITY_SOURCE.publisher}).
      </p>
    </section>
  );
}
