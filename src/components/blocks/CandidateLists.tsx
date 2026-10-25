import { longDate, shortDate } from "@/lib/content/holidays/calendar";
import {
  BOE_SOURCE,
  ELECTORS,
  PROVINCE_NAMES,
  SEATS,
  SENATE_MARKS,
  boeLinks,
  listed,
  loadCandidates,
  unlisted,
  type BoeNotice,
  type Candidacy,
  type CandidatesResult,
  type CorrectionNotice,
  type ProvinceKey,
  type ProvinceResult,
} from "@/lib/content/candidates/boe";
import type { Locale } from "@/lib/i18n/config";

/**
 * Who is standing for Congress and the Senate in Barcelona, Girona, Lleida and
 * Tarragona, read from the BOE when the page is built.
 *
 * An async server component, like the weekend agenda: the names have to be in
 * the HTML, and they have to be this election's. Each candidacy is a
 * `<details>` element, so the four provinces fit on a phone without any
 * client JavaScript and every name is still in the page.
 *
 * Every name, candidacy name and note comes from the BOE and is printed as a
 * React text node: never through the inline-markdown renderer, never as HTML.
 *
 * Its wording lives here rather than in the message catalogues so this block
 * can be merged without touching files other work is changing.
 */

interface Copy {
  title: string;
  read: string;
  checked: string;
  beforeSummary: string;
  beforeNote: (presented: string, proclaimed: string) => string;
  waitingToday: string;
  waitingSummary: string;
  waitingNote: (presented: string, proclaimed: string) => string;
  failedDays: (days: string) => string;
  unreachable: string;
  unreadable: string;
  unreadableSome: string;
  presentedTitle: string;
  presentedNote: (proclamation: string, proclaimed: string) => string;
  proclaimedTitle: string;
  proclaimedNote: (appeals: string, by: string) => string;
  proclaimedAfter: (by: string) => string;
  mixedTitle: string;
  sourceLabel: string;
  issue: (issue: string | null, date: string) => string;
  pdf: string;
  jump: string;
  seats: (deputies: number, senators: number, marks: number) => string;
  electors: (total: string) => string;
  congress: string;
  senate: string;
  listCount: (candidates: number, substitutes: number) => string;
  senateCount: (candidates: number) => string;
  substitutesHeading: string;
  senateSubstitutes: string;
  unlisted: Record<"notProclaimed" | "withdrawn" | "note", string>;
  stageOf: Record<"presented" | "proclaimed", string>;
  missing: (names: string) => string;
  correctionsTitle: string;
  correctionsWarning: string;
  correctionTouches: (provinces: string) => string;
  correctionNoCatalan: string;
  correctionUnread: string;
  orderNote: string;
  sourceLine: string;
  boeHome: string;
  and: string;
  numberFormat: string;
}

const COPY: Record<Locale, Copy> = {
  ca: {
    title: "Candidatures a Barcelona, Girona, Lleida i Tarragona",
    read: "BOE consultat el {date}.",
    checked: "BOE consultat fins al {date}.",
    beforeSummary: "Les candidatures encara no s'han publicat.",
    beforeNote: (presented, proclaimed) =>
      `Les candidatures presentades surten al BOE ${presented} i les proclamades, ${proclaimed}. Aquesta llista es llegeix directament del BOE i hi apareixeran soles; mentrestant no hi posem llistes d'eleccions anteriors. Consulta el BOE a`,
    waitingToday: "Avui és el dia que el BOE ha de publicar les candidatures, però encara no les hi hem trobat.",
    waitingSummary: "Encara no hem trobat al BOE les candidatures d'aquestes eleccions.",
    waitingNote: (presented, proclaimed) =>
      `Segons el calendari electoral, les presentades surten al BOE ${presented} i les proclamades, ${proclaimed}. La pàgina es torna a llegir cada nit. Consulta el BOE a`,
    failedDays: (days) => `No hem pogut llegir el BOE d'aquests dies: ${days}. Si hi ha publicat alguna cosa, aquí no hi surt.`,
    unreachable: "Ara mateix no podem llegir el BOE. No et mostrarem cap llista antiga en el seu lloc.",
    unreadable: "El BOE ha publicat les candidatures, però ara mateix no les podem llegir. No et mostrarem una llista antiga: obre-les directament al BOE:",
    unreadableSome: "Aquest document del BOE no l'hem pogut llegir; obre'l directament:",
    presentedTitle: "Candidatures presentades (encara no proclamades)",
    presentedNote: (proclamation, proclaimed) =>
      `Són les llistes tal com es van presentar. Les juntes electorals les proclamen ${proclamation} i les proclamades surten al BOE ${proclaimed}: fins aleshores, alguna pot canviar o quedar fora.`,
    proclaimedTitle: "Candidatures proclamades",
    proclaimedNote: (appeals, by) =>
      `Es poden recórrer ${appeals}, i els recursos s'han de resoldre com a molt tard ${by}; on n'hi hagi, les paperetes s'esperen a la resolució.`,
    proclaimedAfter: (by) =>
      `El termini per resoldre els recursos contra la proclamació es va acabar ${by}. Si el BOE ha publicat correccions de les llistes, les trobaràs enllaçades aquí.`,
    mixedTitle: "Candidatures publicades al BOE",
    sourceLabel: "Font",
    issue: (issue, date) => (issue ? `BOE núm. ${issue}, ${date}` : `BOE, ${date}`),
    pdf: "PDF",
    jump: "Ves a",
    seats: (deputies, senators, marks) =>
      `Escull ${deputies} diputats (llistes tancades: es vota una candidatura sencera) i ${senators} senadors (cada elector pot marcar fins a ${marks} noms).`,
    electors: (total) => `Electors: ${total} (cens de consulta de l'INE, octubre de 2026).`,
    congress: "Congrés dels Diputats",
    senate: "Senat",
    listCount: (candidates, substitutes) =>
      `${candidates} ${candidates === 1 ? "candidat" : "candidats"}${substitutes ? ` i ${substitutes} ${substitutes === 1 ? "suplent" : "suplents"}` : ""}`,
    senateCount: (candidates) => `${candidates} ${candidates === 1 ? "candidat" : "candidats"}`,
    substitutesHeading: "Suplents",
    senateSubstitutes: "suplents",
    unlisted: {
      notProclaimed: "No proclamades",
      withdrawn: "Retirades",
      note: "Sense llista",
    },
    stageOf: { presented: "presentades", proclaimed: "proclamades" },
    missing: (names) => `En aquest document del BOE no hem trobat la llista de ${names}: consulta'l directament.`,
    correctionsTitle: "Correccions publicades al BOE",
    correctionsWarning:
      "Les llistes d'aquí sota són tal com es van publicar originalment: aquestes correccions no s'hi han aplicat. Si afecten la teva província, llegeix-les.",
    correctionTouches: (provinces) => `afecta ${provinces}`,
    correctionNoCatalan: "no afecta cap junta electoral catalana",
    correctionUnread: "no l'hem pogut llegir",
    orderNote:
      "L'ordre i els números són els de la junta electoral (ordre de presentació, art. 46.9 de la LOREG), no cap rànquing. A la papereta del Senat les candidatures surten en un altre ordre.",
    sourceLine:
      "Noms i candidatures tal com els publica el BOE, sense cap canvi. Font: Boletín Oficial del Estado, dades obertes.",
    boeHome: "boe.es",
    and: " i ",
    numberFormat: "ca-ES",
  },
  es: {
    title: "Candidaturas en Barcelona, Girona, Lleida y Tarragona",
    read: "BOE consultado el {date}.",
    checked: "BOE consultado hasta el {date}.",
    beforeSummary: "Las candidaturas aún no se han publicado.",
    beforeNote: (presented, proclaimed) =>
      `Las candidaturas presentadas salen en el BOE ${presented} y las proclamadas, ${proclaimed}. Esta lista se lee directamente del BOE y aparecerán solas; mientras tanto no ponemos listas de elecciones anteriores. Consulta el BOE en`,
    waitingToday: "Hoy es el día en que el BOE debe publicar las candidaturas, pero todavía no las hemos encontrado.",
    waitingSummary: "Todavía no hemos encontrado en el BOE las candidaturas de estas elecciones.",
    waitingNote: (presented, proclaimed) =>
      `Según el calendario electoral, las presentadas salen en el BOE ${presented} y las proclamadas, ${proclaimed}. La página se vuelve a leer cada noche. Consulta el BOE en`,
    failedDays: (days) => `No hemos podido leer el BOE de estos días: ${days}. Si se publicó algo, aquí no aparece.`,
    unreachable: "Ahora mismo no podemos leer el BOE. No te mostraremos ninguna lista antigua en su lugar.",
    unreadable: "El BOE ha publicado las candidaturas, pero ahora mismo no podemos leerlas. No te mostraremos una lista antigua: ábrelas directamente en el BOE:",
    unreadableSome: "Este documento del BOE no lo hemos podido leer; ábrelo directamente:",
    presentedTitle: "Candidaturas presentadas (aún no proclamadas)",
    presentedNote: (proclamation, proclaimed) =>
      `Son las listas tal como se presentaron. Las juntas electorales las proclaman ${proclamation} y las proclamadas salen en el BOE ${proclaimed}: hasta entonces, alguna puede cambiar o quedar fuera.`,
    proclaimedTitle: "Candidaturas proclamadas",
    proclaimedNote: (appeals, by) =>
      `Se pueden recurrir ${appeals}, y los recursos deben resolverse como muy tarde ${by}; donde los haya, las papeletas esperan a la resolución.`,
    proclaimedAfter: (by) =>
      `El plazo para resolver los recursos contra la proclamación terminó ${by}. Si el BOE ha publicado correcciones de las listas, las encontrarás enlazadas aquí.`,
    mixedTitle: "Candidaturas publicadas en el BOE",
    sourceLabel: "Fuente",
    issue: (issue, date) => (issue ? `BOE núm. ${issue}, ${date}` : `BOE, ${date}`),
    pdf: "PDF",
    jump: "Ir a",
    seats: (deputies, senators, marks) =>
      `Elige ${deputies} diputados (listas cerradas: se vota una candidatura entera) y ${senators} senadores (cada elector puede marcar hasta ${marks} nombres).`,
    electors: (total) => `Electores: ${total} (censo de consulta del INE, octubre de 2026).`,
    congress: "Congreso de los Diputados",
    senate: "Senado",
    listCount: (candidates, substitutes) =>
      `${candidates} ${candidates === 1 ? "candidato" : "candidatos"}${substitutes ? ` y ${substitutes} ${substitutes === 1 ? "suplente" : "suplentes"}` : ""}`,
    senateCount: (candidates) => `${candidates} ${candidates === 1 ? "candidato" : "candidatos"}`,
    substitutesHeading: "Suplentes",
    senateSubstitutes: "suplentes",
    unlisted: {
      notProclaimed: "No proclamadas",
      withdrawn: "Retiradas",
      note: "Sin lista",
    },
    stageOf: { presented: "presentadas", proclaimed: "proclamadas" },
    missing: (names) => `En este documento del BOE no hemos encontrado la lista de ${names}: consúltalo directamente.`,
    correctionsTitle: "Correcciones publicadas en el BOE",
    correctionsWarning:
      "Las listas de abajo son tal como se publicaron originalmente: estas correcciones no se han aplicado. Si afectan a tu provincia, léelas.",
    correctionTouches: (provinces) => `afecta a ${provinces}`,
    correctionNoCatalan: "no afecta a ninguna junta electoral catalana",
    correctionUnread: "no la hemos podido leer",
    orderNote:
      "El orden y los números son los de la junta electoral (orden de presentación, art. 46.9 de la LOREG), no un ranking. En la papeleta del Senado las candidaturas aparecen en otro orden.",
    sourceLine:
      "Nombres y candidaturas tal como los publica el BOE, sin ningún cambio. Fuente: Boletín Oficial del Estado, datos abiertos.",
    boeHome: "boe.es",
    and: " y ",
    numberFormat: "es-ES",
  },
  en: {
    title: "Candidates in Barcelona, Girona, Lleida and Tarragona",
    read: "BOE checked on {date}.",
    checked: "BOE checked up to {date}.",
    beforeSummary: "The candidate lists have not been published yet.",
    beforeNote: (presented, proclaimed) =>
      `The lists as submitted appear in the BOE (Spain's official gazette) ${presented}, and the proclaimed lists ${proclaimed}. This list is read straight from the BOE and they will appear here by themselves; until then we show no lists from earlier elections. Check the BOE at`,
    waitingToday: "Today is the day the BOE is due to publish the candidate lists, but we have not found them there yet.",
    waitingSummary: "We have not found this election's candidate lists in the BOE yet.",
    waitingNote: (presented, proclaimed) =>
      `Under the electoral calendar, the lists as submitted appear in the BOE ${presented} and the proclaimed lists ${proclaimed}. This page is re-read every night. Check the BOE at`,
    failedDays: (days) => `We could not read the BOE for these days: ${days}. Anything published then is missing here.`,
    unreachable: "We cannot read the BOE right now. We will not show you an old list in its place.",
    unreadable: "The BOE has published the lists, but we cannot read them right now. We will not show you an old list: open them directly in the BOE:",
    unreadableSome: "We could not read this BOE document; open it directly:",
    presentedTitle: "Lists as submitted (not yet proclaimed)",
    presentedNote: (proclamation, proclaimed) =>
      `These are the lists as they were filed. The electoral boards proclaim them ${proclamation} and the proclaimed lists appear in the BOE ${proclaimed}: until then, a list may still change or be left out.`,
    proclaimedTitle: "Proclaimed candidate lists",
    proclaimedNote: (appeals, by) =>
      `They can be appealed ${appeals}, and appeals must be settled ${by} at the latest; where there is one, that province's ballot papers wait for the ruling.`,
    proclaimedAfter: (by) =>
      `The deadline for settling appeals against the proclamation passed ${by}. If the BOE has published corrections to the lists, they are linked here.`,
    mixedTitle: "Candidate lists published in the BOE",
    sourceLabel: "Source",
    issue: (issue, date) => (issue ? `BOE no. ${issue}, ${date}` : `BOE, ${date}`),
    pdf: "PDF",
    jump: "Go to",
    seats: (deputies, senators, marks) =>
      `Elects ${deputies} members of Congress (closed lists: you vote for one whole list) and ${senators} senators (each voter can mark up to ${marks} names).`,
    electors: (total) => `Voters: ${total} (INE consultation census, October 2026).`,
    congress: "Congress of Deputies",
    senate: "Senate",
    listCount: (candidates, substitutes) =>
      `${candidates} ${candidates === 1 ? "candidate" : "candidates"}${substitutes ? ` and ${substitutes} ${substitutes === 1 ? "substitute" : "substitutes"}` : ""}`,
    senateCount: (candidates) => `${candidates} ${candidates === 1 ? "candidate" : "candidates"}`,
    substitutesHeading: "Substitutes",
    senateSubstitutes: "substitutes",
    unlisted: {
      notProclaimed: "Not proclaimed",
      withdrawn: "Withdrawn",
      note: "No list",
    },
    stageOf: { presented: "as submitted", proclaimed: "proclaimed" },
    missing: (names) => `We did not find the list for ${names} in this BOE document: check it directly.`,
    correctionsTitle: "Corrections published in the BOE",
    correctionsWarning:
      "The lists below are as originally published: these corrections have not been applied to them. If one concerns your province, read it.",
    correctionTouches: (provinces) => `concerns ${provinces}`,
    correctionNoCatalan: "concerns no Catalan electoral board",
    correctionUnread: "we could not read it",
    orderNote:
      "Order and numbers are the electoral board's (order of filing, electoral law art. 46.9), not a ranking. The Senate ballot paper lists the candidacies in a different order.",
    sourceLine:
      "Names and lists exactly as the BOE publishes them, unchanged. Source: Boletín Oficial del Estado, open data.",
    boeHome: "boe.es",
    and: " and ",
    numberFormat: "en-GB",
  },
};

/** "28 d'octubre de 2026" / "28 de octubre de 2026" / "28 October 2026". */
function dayYear(iso: string, locale: Locale): string {
  return `${shortDate(iso, locale)}${locale === "en" ? " " : " de "}${iso.slice(0, 4)}`;
}

/** The date with its article: "el 3 de novembre", "l'11 de novembre", "on 3 November". */
function onDay(iso: string, locale: Locale, withYear = false): string {
  const date = withYear ? dayYear(iso, locale) : shortDate(iso, locale);
  if (locale === "en") return `on ${date}`;
  if (locale === "ca") return `${/^1{1,2} /.test(date) ? "l'" : "el "}${date}`;
  return `el ${date}`;
}

/** Two days of one month: "el 4 i el 5 de novembre", "el 4 y el 5 de noviembre", "on 4 and 5 November". */
function dayPair(first: string, second: string, locale: Locale): string {
  const day = Number(first.slice(8, 10));
  if (locale === "en") return `on ${day} and ${shortDate(second, locale)}`;
  const article = locale === "ca" && (day === 1 || day === 11) ? "l'" : "el ";
  return `${article}${day}${COPY[locale].and}${onDay(second, locale)}`;
}

function joinNames(names: string[], locale: Locale): string {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")}${COPY[locale].and}${names.at(-1)}`;
}

function BoeHome({ locale }: { locale: Locale }) {
  return (
    <a href={BOE_SOURCE.home} rel="noopener" target="_blank">
      {COPY[locale].boeHome}
    </a>
  );
}

function NoticeLinks({ notice, locale }: { notice: BoeNotice; locale: Locale }) {
  const t = COPY[locale];
  const links = boeLinks(notice.id, notice.date);
  return (
    <>
      {notice.date ? `${t.issue(notice.issue, dayYear(notice.date, locale))}: ` : null}
      <a href={links.html} rel="noopener" target="_blank">
        {notice.id}
      </a>
      {links.pdf ? (
        <>
          {" ("}
          <a href={links.pdf} rel="noopener" target="_blank">
            {t.pdf}
          </a>
          {")"}
        </>
      ) : null}
    </>
  );
}

function CandidacyView({ candidacy, chamber, locale }: { candidacy: Candidacy; chamber: "congress" | "senate"; locale: Locale }) {
  const t = COPY[locale];
  const count =
    chamber === "congress"
      ? t.listCount(candidacy.candidates.length, candidacy.substitutes.length)
      : t.senateCount(candidacy.candidates.length);
  return (
    <details className="border-t border-[var(--color-rule)] py-2">
      <summary className="cursor-pointer text-[0.95rem] font-semibold">
        {candidacy.number !== null ? `${candidacy.number}. ` : null}
        {candidacy.name}
        <span className="ci-agenda-count"> · {count}</span>
      </summary>
      <ul className="m-0 mt-2 list-none p-0 text-sm sm:columns-2">
        {candidacy.candidates.map((candidate, index) => (
          <li key={index} className="break-inside-avoid py-0.5">
            {candidate.number !== null ? `${candidate.number}. ` : null}
            {candidate.name}
            {chamber === "senate" && candidate.substitutes.length > 0 ? (
              <span className="block text-xs text-[var(--color-muted)]">
                {t.senateSubstitutes}: {candidate.substitutes.join(" · ")}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
      {chamber === "congress" && candidacy.substitutes.length > 0 ? (
        <>
          <p className="m-0 mt-2 text-xs font-semibold text-[var(--color-ink-soft)]">{t.substitutesHeading}</p>
          <ul className="m-0 list-none p-0 text-sm sm:columns-2">
            {candidacy.substitutes.map((candidate, index) => (
              <li key={index} className="break-inside-avoid py-0.5">
                {candidate.number !== null ? `${candidate.number}. ` : null}
                {candidate.name}
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </details>
  );
}

function Unlisted({ candidacies, locale }: { candidacies: Candidacy[]; locale: Locale }) {
  const t = COPY[locale];
  const groups = (["notProclaimed", "withdrawn", "note"] as const)
    .map((status) => ({ status, items: candidacies.filter((candidacy) => candidacy.status === status) }))
    .filter((group) => group.items.length > 0);
  if (groups.length === 0) return null;
  return (
    <>
      {groups.map((group) => (
        <p key={group.status} className="ci-agenda-note">
          {t.unlisted[group.status]}:{" "}
          {group.items
            .map((candidacy) =>
              `${candidacy.number !== null ? `${candidacy.number}. ` : ""}${candidacy.name}${
                group.status === "note" && candidacy.note ? ` («${candidacy.note}»)` : ""
              }`,
            )
            .join("; ")}
          .
        </p>
      ))}
    </>
  );
}

function ProvinceView({ lists, locale, showStage }: { lists: ProvinceResult; locale: Locale; showStage: boolean }) {
  const t = COPY[locale];
  const seats = SEATS[lists.province];
  const numbers = new Intl.NumberFormat(t.numberFormat);
  const congress = listed(lists.congress);
  const senate = listed(lists.senate);
  return (
    <div id={`candidates-${lists.province}`}>
      <h4 className="ci-agenda-group">
        {PROVINCE_NAMES[lists.province]}
        <span className="ci-agenda-count">
          {t.congress}: {congress.length} · {t.senate}: {senate.length}
          {showStage ? ` · ${t.stageOf[lists.stage]}` : ""}
        </span>
      </h4>
      <p className="ci-agenda-note">
        {t.seats(seats.deputies, seats.senators, SENATE_MARKS)} {t.electors(numbers.format(ELECTORS[lists.province].total))}
      </p>
      {congress.length > 0 || lists.congress.length > 0 ? (
        <>
          <h5 className="mb-1 mt-4 text-sm font-semibold">{t.congress}</h5>
          {congress.map((candidacy, index) => (
            <CandidacyView key={index} candidacy={candidacy} chamber="congress" locale={locale} />
          ))}
          <Unlisted candidacies={unlisted(lists.congress)} locale={locale} />
        </>
      ) : null}
      {senate.length > 0 || lists.senate.length > 0 ? (
        <>
          <h5 className="mb-1 mt-4 text-sm font-semibold">{t.senate}</h5>
          {senate.map((candidacy, index) => (
            <CandidacyView key={index} candidacy={candidacy} chamber="senate" locale={locale} />
          ))}
          <Unlisted candidacies={unlisted(lists.senate)} locale={locale} />
        </>
      ) : null}
    </div>
  );
}

function Corrections({ corrections, locale }: { corrections: CorrectionNotice[]; locale: Locale }) {
  const t = COPY[locale];
  if (corrections.length === 0) return null;
  return (
    <div role="note" className="ci-callout ci-callout-warning mt-6">
      <p className="mb-1 font-semibold text-[var(--color-ink)]">{t.correctionsTitle}</p>
      <p>{t.correctionsWarning}</p>
      <ul className="mt-2">
        {corrections.map((notice) => (
          <li key={notice.id}>
            <NoticeLinks notice={notice} locale={locale} />
            {" — "}
            {notice.juntas === null
              ? t.correctionUnread
              : notice.catalan.length > 0
                ? t.correctionTouches(joinNames(notice.catalan.map((key) => PROVINCE_NAMES[key]), locale))
                : t.correctionNoCatalan}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Header({ result, locale }: { result: CandidatesResult; locale: Locale }) {
  const t = COPY[locale];
  return (
    <>
      <h3 className="ci-agenda-heading">{t.title}</h3>
      {/* Before the first publication day nothing is read, so nothing claims to be. */}
      {result.phase === "before" ? null : (
        <p className="ci-agenda-range">
          {t.read.replace("{date}", longDate(result.today, locale))}
          {result.checkedThrough && result.checkedThrough !== result.today
            ? ` ${t.checked.replace("{date}", dayYear(result.checkedThrough, locale))}`
            : null}
        </p>
      )}
    </>
  );
}

function FailedDays({ result, locale }: { result: CandidatesResult; locale: Locale }) {
  if (result.failedDays.length === 0) return null;
  const t = COPY[locale];
  return (
    <p className="ci-agenda-note">{t.failedDays(result.failedDays.map((day) => shortDate(day, locale)).join(", "))}</p>
  );
}

export async function CandidateLists({ locale }: { locale: Locale }) {
  const t = COPY[locale];
  const result = await loadCandidates();
  const { config } = result;
  const presentedOn = onDay(config.presentedDay, locale);
  const proclaimedOn = onDay(config.proclaimedDay, locale);

  if (result.phase === "before" || result.phase === "waiting" || result.phase === "unreachable") {
    const summary =
      result.phase === "before"
        ? t.beforeSummary
        : result.phase === "unreachable"
          ? t.unreachable
          : result.today === config.presentedDay || result.today === config.proclaimedDay
            ? t.waitingToday
            : t.waitingSummary;
    const note =
      result.phase === "before" ? t.beforeNote(presentedOn, proclaimedOn) : t.waitingNote(presentedOn, proclaimedOn);
    return (
      <section className="ci-agenda" aria-label={t.title}>
        <Header result={result} locale={locale} />
        {summary ? <p className="ci-agenda-summary">{summary}</p> : null}
        <p className="ci-agenda-note">
          {note} <BoeHome locale={locale} />.
        </p>
        {result.phase === "waiting" ? <FailedDays result={result} locale={locale} /> : null}
      </section>
    );
  }

  if (result.phase === "unreadable") {
    return (
      <section className="ci-agenda" aria-label={t.title}>
        <Header result={result} locale={locale} />
        <p className="ci-agenda-summary">{t.unreadable}</p>
        <ul className="ci-agenda-note">
          {[...result.proclaimed, ...result.presented].map((notice) => (
            <li key={notice.id}>
              <NoticeLinks notice={notice} locale={locale} />
            </li>
          ))}
        </ul>
        <p className="ci-agenda-note">
          {t.waitingNote(presentedOn, proclaimedOn)} <BoeHome locale={locale} />.
        </p>
        <Corrections corrections={result.corrections} locale={locale} />
      </section>
    );
  }

  const stages = new Set(result.provinces.map((province) => province.stage));
  const allProclaimed = stages.size === 1 && stages.has("proclaimed");
  const allPresented = stages.size === 1 && stages.has("presented");
  const sources = [...new Map(result.provinces.map((province) => [province.source.id, province.source])).values()];
  // An item found in the summary but not read: say so, with its link.
  const unread = result.unreadable.filter((notice) => !sources.some((source) => source.id === notice.id));

  return (
    <section className="ci-agenda" aria-label={t.title}>
      <Header result={result} locale={locale} />
      <p className="ci-agenda-summary">
        {allProclaimed ? t.proclaimedTitle : allPresented ? t.presentedTitle : t.mixedTitle}
      </p>
      <p className="ci-agenda-note">
        {allPresented || !allProclaimed
          ? t.presentedNote(onDay(config.proclamationDay, locale), proclaimedOn)
          : result.today > config.appealsResolvedBy
            ? t.proclaimedAfter(onDay(config.appealsResolvedBy, locale))
            : t.proclaimedNote(dayPair(config.appealsFrom, config.appealsTo, locale), onDay(config.appealsResolvedBy, locale))}
      </p>
      <p className="ci-agenda-note">
        {t.sourceLabel}:{" "}
        {sources.map((source, index) => (
          <span key={source.id}>
            {index > 0 ? "; " : null}
            <NoticeLinks notice={source} locale={locale} />
          </span>
        ))}
        .
      </p>
      {unread.length > 0 ? (
        <p className="ci-agenda-note">
          {t.unreadableSome}{" "}
          {unread.map((notice, index) => (
            <span key={notice.id}>
              {index > 0 ? "; " : null}
              <NoticeLinks notice={notice} locale={locale} />
            </span>
          ))}
          .
        </p>
      ) : null}
      <FailedDays result={result} locale={locale} />
      <Corrections corrections={result.corrections} locale={locale} />

      {result.provinces.length > 1 ? (
        <p className="ci-agenda-note">
          {t.jump}:{" "}
          {result.provinces.map((province, index) => (
            <span key={province.province}>
              {index > 0 ? " · " : null}
              <a href={`#candidates-${province.province}`}>{PROVINCE_NAMES[province.province]}</a>
            </span>
          ))}
        </p>
      ) : null}

      {result.provinces.map((province) => (
        <ProvinceView key={province.province} lists={province} locale={locale} showStage={!allProclaimed && !allPresented} />
      ))}

      {result.missing.length > 0 ? (
        <p className="ci-agenda-note">
          {t.missing(joinNames(result.missing.map((key: ProvinceKey) => PROVINCE_NAMES[key]), locale))}
        </p>
      ) : null}

      <p className="ci-agenda-note">{t.orderNote}</p>
      <p className="ci-agenda-note">
        {t.sourceLine}{" "}
        <a href={BOE_SOURCE.api} rel="noopener" target="_blank">
          {BOE_SOURCE.api.replace(/^https:\/\/www\./, "").replace(/\/$/, "")}
        </a>
      </p>
    </section>
  );
}
