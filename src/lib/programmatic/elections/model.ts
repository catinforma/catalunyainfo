/**
 * The page model: every string and table cell a municipality page shows,
 * built from the snapshot. Pure and deterministic (no clock), so the tests
 * read exactly what the reader reads.
 *
 * Copy rules: neutral; no polls, projections or commentary on parties; the
 * only judgement is arithmetic printed with its rule (the 5 % threshold, the
 * D'Hondt quotients). Text fields marked `md` go through the site's inline
 * formatter (bold and links in our own copy); everything else, including every
 * name taken from the source, is plain text.
 */

import { B2_TITLES, b2href, type B2Key } from "@/lib/content/batch02/shared";
import { shortDate } from "@/lib/content/holidays/calendar";
import { INTL_LOCALE, type Locale } from "@/lib/i18n/config";

import { electionPath, hubPath, inCa, ofCa, placeName, siblings } from "./pages";
import { councilSize, municipalView, regionalView, turnout, type RegionalView } from "./results";
import { SNAPSHOT } from "./snapshot";
import type { DayLines } from "./today";
import type { ElectionsSnapshot, Municipality } from "./types";

/** Interior's results download area, where the per-municipality files appear. */
export const INTERIOR_DOWNLOADS: Record<Locale, string> = {
  ca: "https://infoelectoral.interior.gob.es/ca/elecciones-celebradas/area-de-descargas/",
  es: "https://infoelectoral.interior.gob.es/es/elecciones-celebradas/area-de-descargas/",
  en: "https://infoelectoral.interior.gob.es/en/elecciones-celebradas/area-de-descargas/",
};

/**
 * The official election-night results site. Null until the Interior Ministry
 * announces it: never guessed, never scraped. Checked 27 Oct 2026 on
 * infoelectoral.interior.gob.es and 29neleccionesgenerales.es (no results
 * section, no announcement).
 */
export const ELECTION_NIGHT_RESULTS_URL: string | null = null;

/** The date the Interior pages above were last checked. */
export const INTERIOR_CHECKED = "2026-10-27";

export const LOREG_URL = "https://www.boe.es/buscar/act.php?id=BOE-A-1985-11672";
export const RD_806_2026_URL = "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20742";

/** Fourth Sunday of May 2027 (LOREG art. 42.3); the call decree is due 55 days before. */
export const NEXT_MUNICIPAL = { day: "2027-05-23", decree: "2027-03-29", published: "2027-03-30" };

export interface Table {
  caption: string;
  headers: string[];
  rows: string[][];
  /** Rows styled as totals (blank votes, other lists). */
  footRows: string[][];
  note: string;
}

export interface Link {
  href: string;
  label: string;
}

export interface ElectionPageModel {
  locale: Locale;
  h1: string;
  standfirst: string;
  readLine: string;
  facts: { label: string; value: string }[];
  slot: {
    title: string;
    lines: DayLines;
    md: string[];
  };
  municipal: { title: string; summary: string; table: Table; mayor: string | null; mayorRule: string };
  seats: { title: string; md: string[] };
  congress: { title: string; summary: string; table: Table };
  parliament: { title: string; summary: string; table: Table };
  turnout: { title: string; table: Table };
  census: { title: string; md: string[] };
  next: { title: string; md: string[] };
  faqTitle: string;
  faq: { question: string; answer: string }[];
  siblings: { title: string; groups: { label: string; links: Link[] }[]; hub: Link };
  related: { title: string; links: Link[] };
  sources: { title: string; note: string; items: { name: string; publisher: string; url: string; updated: string }[] };
}

/* -------------------------------------------------------------------------- */
/* Formatting                                                                 */
/* -------------------------------------------------------------------------- */

function formats(locale: Locale) {
  const intl = INTL_LOCALE[locale];
  const whole = new Intl.NumberFormat(intl, { maximumFractionDigits: 0 });
  const one = new Intl.NumberFormat(intl, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const upToOne = new Intl.NumberFormat(intl, { maximumFractionDigits: 1 });
  return {
    n: (value: number) => whole.format(value),
    p: (value: number) => (locale === "en" ? `${one.format(value)}%` : `${one.format(value)} %`),
    q: (value: number) => upToOne.format(value),
    date: (iso: string) => longDate(iso, locale),
  };
}

export function longDate(iso: string, locale: Locale): string {
  const year = iso.slice(0, 4);
  return locale === "en" ? `${shortDate(iso, locale)} ${year}` : `${shortDate(iso, locale)} de ${year}`;
}

/** Catalan apostrophises the article before "1" and "11" (u, onze): "l'1 d'octubre", "el 17 de juny". */
const caApostrophe = (iso: string) => ["01", "11"].includes(iso.slice(8, 10));
export const caEl = (iso: string) => `${caApostrophe(iso) ? "l'" : "el "}${longDate(iso, "ca")}`;
export const caDel = (iso: string) => `${caApostrophe(iso) ? "de l'" : "del "}${longDate(iso, "ca")}`;

const ORDINAL_CA = (n: number) => (n === 1 ? "1r" : n === 2 ? "2n" : n === 3 ? "3r" : n === 4 ? "4t" : `${n}è`);
const ORDINAL_ES = (n: number) => `${n}.º`;
const ORDINAL_EN = (n: number) => {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  return `${n}${["th", "st", "nd", "rd"][n % 10] ?? "th"}`;
};

/* -------------------------------------------------------------------------- */
/* Builder                                                                    */
/* -------------------------------------------------------------------------- */

const RELATED: B2Key[] = ["electionNight", "voting", "candidates", "municipalResults", "congressResults", "parliamentResults"];

export function buildElectionPage(m: Municipality, locale: Locale, snapshot: ElectionsSnapshot = SNAPSHOT): ElectionPageModel {
  const f = formats(locale);
  const place = placeName(m, locale);
  const Place = place.charAt(0).toLocaleUpperCase(locale) + place.slice(1);
  const mv = municipalView(m.municipal);
  const congress = regionalView(m.congress, snapshot.catalonia.congress, snapshot.elections.congress.lists ?? {});
  const parliament = regionalView(m.parliament, snapshot.catalonia.parliament, snapshot.elections.parliament.lists ?? {});
  const cataloniaMunicipalTurnout = turnout(snapshot.catalonia.municipal);
  const top = mv.rows[0]!;
  const dates = {
    municipal: f.date(snapshot.elections.municipal.date),
    congress: f.date(snapshot.elections.congress.date),
    parliament: f.date(snapshot.elections.parliament.date),
    read: f.date(snapshot.readAt),
  };
  const { sameComarca, sameProvince } = siblings(m, locale);
  const link = (x: Municipality): Link => ({ href: electionPath(locale, x.slug), label: placeName(x, locale) });
  const last = mv.dhondt.last;
  const nextOut = mv.dhondt.nextOut;
  const shortOf = (code: string | undefined) => m.municipal.lists.find((list) => list.code === code)?.short ?? "";
  const mayor = m.mayor;
  const mayorParty = mayor?.party ? ` (${mayor.party})` : "";
  const census = m.municipal.censusPopulation;
  const sizeOk = councilSize(census) === m.municipal.seats;

  const municipalRows = mv.rows.map((row) => [`${row.short}\n${row.name}`, f.n(row.votes), f.p(row.share), String(row.seats)]);
  const regionalTable = (view: RegionalView, caption: string, headers: string[], othersLabel: (n: number) => string, blankLabel: string, note: string): Table => ({
    caption,
    headers,
    rows: view.rows.map((row) => [`${row.short}\n${row.name}`, f.n(row.votes), f.p(row.share), f.p(row.cataloniaShare), String(row.cataloniaSeats)]),
    footRows: [
      [othersLabel(view.others.lists), f.n(view.others.votes), f.p(view.others.share), f.p(view.others.cataloniaShare), "0"],
      [blankLabel, f.n(view.blank.votes), f.p(view.blank.share), f.p(view.blank.cataloniaShare), ""],
    ],
    note,
  });
  const sources = [
    snapshot.sources.votes,
    snapshot.sources.turnout,
    snapshot.sources.elections,
    snapshot.sources.population,
    snapshot.sources.entities,
    snapshot.sources.mayors,
  ].map((s) => ({ name: s.name, publisher: s.publisher, url: s.url, updated: f.date(s.updated) }));
  const related = RELATED.map((key) => ({ href: b2href(key, locale), label: B2_TITLES[key][locale] }));
  const hub = { href: hubPath(locale), label: "" };

  if (locale === "ca") {
    const a = inCa(place);
    const de = ofCa(place);
    return {
      locale,
      h1: `Resultats de les eleccions ${a}`,
      standfirst: `Les municipals del 2023 amb els vots i els regidors de cada llista, i com es va votar ${a} a les generals del 2023 i a les eleccions al Parlament del 2024, al costat del conjunt de Catalunya. Amb dades oficials i un espai per als resultats del 29 de novembre.`,
      readLine: `Dades llegides el ${dates.read}`,
      facts: [
        { label: "Població", value: `${f.n(m.population)} habitants (1 de gener de ${snapshot.sources.population.period.slice(0, 4)}, Idescat)` },
        { label: "Comarca i província", value: `${m.comarca} · ${m.province}` },
        { label: "Regidors al ple", value: String(m.municipal.seats) },
        ...(mayor ? [{ label: "Alcaldia", value: `${mayor.name}${mayorParty}, des ${caDel(mayor.since)}` }] : []),
        { label: "Pròximes municipals", value: "diumenge 23 de maig de 2027 (previstes)" },
      ],
      slot: {
        title: "Eleccions generals del 29 de novembre de 2026",
        lines: {
          fallback: "Votació: diumenge 29 de novembre de 2026.",
          before: "Falten {days} dies per a la votació, el diumenge 29 de novembre de 2026.",
          beforeOne: "Demà, diumenge 29 de novembre de 2026, és el dia de la votació.",
          today: "Avui, diumenge 29 de novembre de 2026, és el dia de la votació.",
          after: "La votació va ser el diumenge 29 de novembre de 2026.",
        },
        md: [
          `**Els resultats ${de} apareixeran aquí quan el Ministeri de l'Interior publiqui el fitxer oficial de resultats per municipis** a la seva [àrea de descàrregues](${INTERIOR_DOWNLOADS.ca}).`,
          ELECTION_NIGHT_RESULTS_URL
            ? `Resultats provisionals de la nit electoral: [web oficial del Ministeri de l'Interior](${ELECTION_NIGHT_RESULTS_URL}).`
            : `Resultats provisionals de la nit electoral: Interior encara no ha anunciat el web on els publicarà (comprovat el ${f.date(INTERIOR_CHECKED)}). Quan ho faci, n'hi posarem l'enllaç oficial. Com funciona l'escrutini: [${B2_TITLES.electionNight.ca}](${b2href("electionNight", "ca")}).`,
          `Si has de votar: [com votar a Catalunya](${b2href("voting", "ca")}) i [les llistes de candidats del 29N](${b2href("candidates", "ca")}).`,
        ],
      },
      municipal: {
        title: `Eleccions municipals del ${dates.municipal}`,
        summary: `${Place} escull ${m.municipal.seats} regidors. Van votar ${f.n(m.municipal.voters)} persones d'un cens de ${f.n(m.municipal.electorate)}: una participació del ${f.p(mv.turnout)}, davant del ${f.p(cataloniaMunicipalTurnout)} del conjunt de Catalunya. La llista més votada va ser ${top.short}, amb ${f.n(top.votes)} vots (el ${f.p(top.share)} dels vots vàlids) i ${top.seats} ${top.seats === 1 ? "regidor" : "regidors"}.`,
        table: {
          caption: `Resultats de les eleccions municipals del 2023 ${a}`,
          headers: ["Candidatura", "Vots", "% vots vàlids", "Regidors"],
          rows: municipalRows,
          footRows: [["Vots en blanc", f.n(m.municipal.blankVotes), f.p(mv.blankShare), ""]],
          note: `Vots vàlids: ${f.n(m.municipal.validVotes)}, amb els vots en blanc. Vots nuls: ${f.n(m.municipal.nullVotes)}, que no compten en els percentatges. Percentatges calculats a partir dels recomptes oficials.`,
        },
        mayorRule: "L'alcaldia no la decideix directament el vot: els regidors elegeixen l'alcalde en el ple de constitució. Si cap dels caps de llista no obté la majoria absoluta dels regidors, és alcalde qui encapçala la llista més votada (llei electoral, article 196).",
        mayor: mayor ? `Segons el registre d'ens locals de la Generalitat, l'alcaldia ${de} l'ocupa ${mayor.name}${mayorParty}, que en va prendre possessió ${caEl(mayor.since)}.` : null,
      },
      seats: {
        title: `Com es van repartir els ${m.municipal.seats} regidors`,
        md: [
          `La llei electoral aplica el **sistema D'Hondt** ([LOREG, articles 163 i 180](${LOREG_URL})). Només hi entren les llistes amb almenys el **5 % dels vots vàlids**, que ${a} volia dir ${f.n(mv.threshold)} vots; ${mv.belowThreshold === 0 ? "totes les llistes el van superar" : mv.belowThreshold === 1 ? "una llista es va quedar per sota" : `${mv.belowThreshold} llistes es van quedar per sota`}. Els vots de cada llista que el supera es divideixen per 1, 2, 3… i els regidors van als quocients més alts.`,
          ...(last && nextOut
            ? [`El ${ORDINAL_CA(m.municipal.seats)} i últim regidor el va obtenir ${shortOf(last.code)}, amb un quocient de ${f.q(last.value)} (${f.n(last.votes)} vots ÷ ${last.divisor}). El quocient més alt que es va quedar sense regidor: ${f.q(nextOut.value)} (${shortOf(nextOut.code)}, ${f.n(nextOut.votes)} ÷ ${nextOut.divisor}).`]
            : []),
          ...(sizeOk
            ? [`El nombre de regidors depèn de la població: amb ${f.n(census)} habitants al padró de referència d'aquestes eleccions, ${a} li'n corresponen ${m.municipal.seats} (LOREG, article 179).`]
            : []),
        ],
      },
      congress: {
        title: `Eleccions generals del ${dates.congress} (Congrés)`,
        summary: `${a.charAt(0).toUpperCase()}${a.slice(1)} van votar ${f.n(m.congress.voters)} persones d'un cens de ${f.n(m.congress.electorate)}: una participació del ${f.p(congress.turnout)}, davant del ${f.p(congress.cataloniaTurnout)} de Catalunya. La llista més votada va ser ${congress.rows[0]?.short}, amb el ${f.p(congress.rows[0]?.share ?? 0)} dels vots vàlids (${f.p(congress.rows[0]?.cataloniaShare ?? 0)} a Catalunya).`,
        table: regionalTable(
          congress,
          `Vots al Congrés el 2023 ${a} i a Catalunya`,
          ["Candidatura", "Vots", `% ${Place}`, "% Catalunya", "Diputats"],
          (n) => `Altres candidatures (${n})`,
          "Vots en blanc",
          `Els escons es reparteixen per províncies, no per municipis: l'última columna és el total de Catalunya (48 diputats). Les xifres de Catalunya no inclouen el vot dels residents a l'estranger (CERA), que es compta per províncies i no s'assigna a cap municipi; amb aquest vot, la participació oficial a Catalunya va ser del ${f.p(congress.cataloniaTurnoutWithAbroad)}.`,
        ),
      },
      parliament: {
        title: `Eleccions al Parlament de Catalunya del ${dates.parliament}`,
        summary: `${a.charAt(0).toUpperCase()}${a.slice(1)} van votar ${f.n(m.parliament.voters)} persones d'un cens de ${f.n(m.parliament.electorate)}: una participació del ${f.p(parliament.turnout)}, davant del ${f.p(parliament.cataloniaTurnout)} de Catalunya. La llista més votada va ser ${parliament.rows[0]?.short}, amb el ${f.p(parliament.rows[0]?.share ?? 0)} dels vots vàlids (${f.p(parliament.rows[0]?.cataloniaShare ?? 0)} a Catalunya).`,
        table: regionalTable(
          parliament,
          `Vots al Parlament el 2024 ${a} i a Catalunya`,
          ["Candidatura", "Vots", `% ${Place}`, "% Catalunya", "Diputats"],
          (n) => `Altres candidatures (${n})`,
          "Vots en blanc",
          `Els 135 diputats es reparteixen per províncies; l'última columna és el total. Les xifres de Catalunya no inclouen el vot dels residents a l'estranger (CERA); amb aquest vot, la participació oficial va ser del ${f.p(parliament.cataloniaTurnoutWithAbroad)}.`,
        ),
      },
      turnout: {
        title: `Participació ${a} i a Catalunya`,
        table: {
          caption: `Participació a les tres últimes eleccions ${a}`,
          headers: ["Eleccions", Place, "Catalunya"],
          rows: [
            [`Municipals, ${dates.municipal}`, f.p(mv.turnout), f.p(cataloniaMunicipalTurnout)],
            [`Generals, ${dates.congress}`, f.p(congress.turnout), f.p(congress.cataloniaTurnout)],
            [`Parlament, ${dates.parliament}`, f.p(parliament.turnout), f.p(parliament.cataloniaTurnout)],
          ],
          footRows: [],
          note: "Votants sobre cens. Generals i Parlament: Catalunya sense el vot de l'estranger, per comparar les mateixes dades.",
        },
      },
      census: {
        title: "Què és el cens electoral",
        md: [
          `El cens electoral és la llista de les persones amb dret a vot ([LOREG, article 31](${LOREG_URL})). No és la població: no hi ha els menors de 18 anys ni els estrangers sense dret a vot. Per això ${place} té ${f.n(m.population)} habitants i a les municipals del 2023 tenia un cens de ${f.n(m.municipal.electorate)} persones.`,
          "A les municipals, el cens també inclou els ciutadans de la Unió Europea i dels països amb tractat de reciprocitat que hi resideixen i s'hi han inscrit (article 176). A les generals i a les del Parlament, el vot de les persones inscrites a l'estranger (CERA) es compta per províncies i no apareix a les xifres del municipi.",
          "La **participació** és el nombre de votants dividit pel cens. Els percentatges de cada llista es calculen sobre els **vots vàlids**: els vots a candidatures més els vots en blanc. Els vots nuls no compten.",
        ],
      },
      next: {
        title: "Quan són les pròximes eleccions municipals",
        md: [
          `Les pròximes municipals són previstes per al **diumenge 23 de maig de 2027**. La llei les fixa el quart diumenge de maig, cada quatre anys, i el decret de convocatòria s'expedeix 55 dies abans i es publica l'endemà al BOE ([LOREG, article 42.3](${LOREG_URL})): el 29 i el 30 de març de 2027. El decret encara no s'ha publicat.`,
          `Els resultats de qualsevol municipi de Catalunya des del 1979: [${B2_TITLES.municipalResults.ca}](${b2href("municipalResults", "ca")}).`,
        ],
      },
      faqTitle: "Preguntes freqüents",
      faq: [
        {
          question: `Quina llista va ser la més votada a les municipals del 2023 ${a}?`,
          answer: `${top.short} (${top.name}), amb ${f.n(top.votes)} vots, el ${f.p(top.share)} dels vàlids, i ${top.seats} dels ${m.municipal.seats} regidors.`,
        },
        {
          question: `Quants regidors té l'Ajuntament ${de}?`,
          answer: `${m.municipal.seats}, segons l'escala de l'article 179 de la llei electoral aplicada a la població del municipi.`,
        },
        {
          question: `Quan es podran consultar els resultats del 29N ${a}?`,
          answer: "Quan el Ministeri de l'Interior publiqui el fitxer oficial de resultats per municipis, que apareixerà en aquesta pàgina. La nit electoral, l'escrutini provisional el publica Interior.",
        },
      ],
      siblings: {
        title: "Resultats en altres municipis",
        groups: [
          ...(sameComarca.length ? [{ label: `${m.comarca}`, links: sameComarca.map(link) }] : []),
          ...(sameProvince.length ? [{ label: `Altres municipis de la província de ${m.province}`, links: sameProvince.map(link) }] : []),
        ],
        hub: { ...hub, label: "Els 100 municipis més poblats, per comarques" },
      },
      related: { title: "Guies sobre les eleccions", links: related },
      sources: {
        title: "Fonts",
        note: `Dades oficials llegides el ${dates.read}; entre parèntesis, l'última actualització de cada conjunt de dades.`,
        items: sources,
      },
    };
  }

  if (locale === "es") {
    return {
      locale,
      h1: `Resultados de las elecciones en ${place}`,
      standfirst: `Las municipales de 2023 con los votos y los concejales de cada lista, y cómo se votó en ${place} en las generales de 2023 y en las elecciones al Parlament de 2024, junto al conjunto de Cataluña. Con datos oficiales y un espacio para los resultados del 29 de noviembre.`,
      readLine: `Datos leídos el ${dates.read}`,
      facts: [
        { label: "Población", value: `${f.n(m.population)} habitantes (1 de enero de ${snapshot.sources.population.period.slice(0, 4)}, Idescat)` },
        { label: "Comarca y provincia", value: `${m.comarca} · ${m.province}` },
        { label: "Concejales en el pleno", value: String(m.municipal.seats) },
        ...(mayor ? [{ label: "Alcaldía", value: `${mayor.name}${mayorParty}, desde el ${f.date(mayor.since)}` }] : []),
        { label: "Próximas municipales", value: "domingo 23 de mayo de 2027 (previstas)" },
      ],
      slot: {
        title: "Elecciones generales del 29 de noviembre de 2026",
        lines: {
          fallback: "Votación: domingo 29 de noviembre de 2026.",
          before: "Faltan {days} días para la votación, el domingo 29 de noviembre de 2026.",
          beforeOne: "Mañana, domingo 29 de noviembre de 2026, es el día de la votación.",
          today: "Hoy, domingo 29 de noviembre de 2026, es el día de la votación.",
          after: "La votación fue el domingo 29 de noviembre de 2026.",
        },
        md: [
          `**Los resultados de ${place} aparecerán aquí cuando el Ministerio del Interior publique el fichero oficial de resultados por municipios** en su [área de descargas](${INTERIOR_DOWNLOADS.es}).`,
          ELECTION_NIGHT_RESULTS_URL
            ? `Resultados provisionales de la noche electoral: [web oficial del Ministerio del Interior](${ELECTION_NIGHT_RESULTS_URL}).`
            : `Resultados provisionales de la noche electoral: Interior aún no ha anunciado la web donde los publicará (comprobado el ${f.date(INTERIOR_CHECKED)}). Cuando lo haga, pondremos aquí el enlace oficial. Cómo funciona el escrutinio: [${B2_TITLES.electionNight.es}](${b2href("electionNight", "es")}).`,
          `Si tienes que votar: [cómo votar en Cataluña](${b2href("voting", "es")}) y [las listas de candidatos del 29N](${b2href("candidates", "es")}).`,
        ],
      },
      municipal: {
        title: `Elecciones municipales del ${dates.municipal}`,
        summary: `${place} elige ${m.municipal.seats} concejales. Votaron ${f.n(m.municipal.voters)} personas de un censo de ${f.n(m.municipal.electorate)}: una participación del ${f.p(mv.turnout)}, frente al ${f.p(cataloniaMunicipalTurnout)} del conjunto de Cataluña. La lista más votada fue ${top.short}, con ${f.n(top.votes)} votos (el ${f.p(top.share)} de los votos válidos) y ${top.seats} ${top.seats === 1 ? "concejal" : "concejales"}.`,
        table: {
          caption: `Resultados de las elecciones municipales de 2023 en ${place}`,
          headers: ["Candidatura", "Votos", "% votos válidos", "Concejales"],
          rows: municipalRows,
          footRows: [["Votos en blanco", f.n(m.municipal.blankVotes), f.p(mv.blankShare), ""]],
          note: `Votos válidos: ${f.n(m.municipal.validVotes)}, con los votos en blanco. Votos nulos: ${f.n(m.municipal.nullVotes)}, que no cuentan en los porcentajes. Porcentajes calculados a partir de los recuentos oficiales.`,
        },
        mayorRule: "La alcaldía no la decide directamente el voto: los concejales eligen al alcalde en el pleno de constitución. Si ningún cabeza de lista obtiene la mayoría absoluta de los concejales, es alcalde el cabeza de la lista más votada (ley electoral, artículo 196).",
        mayor: mayor ? `Según el registro de entes locales de la Generalitat, la alcaldía de ${place} la ocupa ${mayor.name}${mayorParty}, que tomó posesión el ${f.date(mayor.since)}.` : null,
      },
      seats: {
        title: `Cómo se repartieron los ${m.municipal.seats} concejales`,
        md: [
          `La ley electoral aplica el **sistema D'Hondt** ([LOREG, artículos 163 y 180](${LOREG_URL})). Solo entran las listas con al menos el **5 % de los votos válidos**, que en ${place} significaba ${f.n(mv.threshold)} votos; ${mv.belowThreshold === 0 ? "todas las listas lo superaron" : mv.belowThreshold === 1 ? "una lista se quedó por debajo" : `${mv.belowThreshold} listas se quedaron por debajo`}. Los votos de cada lista que lo supera se dividen por 1, 2, 3… y los concejales van a los cocientes más altos.`,
          ...(last && nextOut
            ? [`El ${ORDINAL_ES(m.municipal.seats)} y último concejal lo obtuvo ${shortOf(last.code)}, con un cociente de ${f.q(last.value)} (${f.n(last.votes)} votos ÷ ${last.divisor}). El cociente más alto que se quedó sin concejal: ${f.q(nextOut.value)} (${shortOf(nextOut.code)}, ${f.n(nextOut.votes)} ÷ ${nextOut.divisor}).`]
            : []),
          ...(sizeOk
            ? [`El número de concejales depende de la población: con ${f.n(census)} habitantes en el padrón de referencia de estas elecciones, a ${place} le corresponden ${m.municipal.seats} (LOREG, artículo 179).`]
            : []),
        ],
      },
      congress: {
        title: `Elecciones generales del ${dates.congress} (Congreso)`,
        summary: `En ${place} votaron ${f.n(m.congress.voters)} personas de un censo de ${f.n(m.congress.electorate)}: una participación del ${f.p(congress.turnout)}, frente al ${f.p(congress.cataloniaTurnout)} de Cataluña. La lista más votada fue ${congress.rows[0]?.short}, con el ${f.p(congress.rows[0]?.share ?? 0)} de los votos válidos (${f.p(congress.rows[0]?.cataloniaShare ?? 0)} en Cataluña).`,
        table: regionalTable(
          congress,
          `Votos al Congreso en 2023 en ${place} y en Cataluña`,
          ["Candidatura", "Votos", `% ${place}`, "% Cataluña", "Diputados"],
          (n) => `Otras candidaturas (${n})`,
          "Votos en blanco",
          `Los escaños se reparten por provincias, no por municipios: la última columna es el total de Cataluña (48 diputados). Las cifras de Cataluña no incluyen el voto de los residentes en el extranjero (CERA), que se cuenta por provincias y no se asigna a ningún municipio; con ese voto, la participación oficial en Cataluña fue del ${f.p(congress.cataloniaTurnoutWithAbroad)}.`,
        ),
      },
      parliament: {
        title: `Elecciones al Parlament de Catalunya del ${dates.parliament}`,
        summary: `En ${place} votaron ${f.n(m.parliament.voters)} personas de un censo de ${f.n(m.parliament.electorate)}: una participación del ${f.p(parliament.turnout)}, frente al ${f.p(parliament.cataloniaTurnout)} de Cataluña. La lista más votada fue ${parliament.rows[0]?.short}, con el ${f.p(parliament.rows[0]?.share ?? 0)} de los votos válidos (${f.p(parliament.rows[0]?.cataloniaShare ?? 0)} en Cataluña).`,
        table: regionalTable(
          parliament,
          `Votos al Parlament en 2024 en ${place} y en Cataluña`,
          ["Candidatura", "Votos", `% ${place}`, "% Cataluña", "Diputados"],
          (n) => `Otras candidaturas (${n})`,
          "Votos en blanco",
          `Los 135 diputados se reparten por provincias; la última columna es el total. Las cifras de Cataluña no incluyen el voto de los residentes en el extranjero (CERA); con ese voto, la participación oficial fue del ${f.p(parliament.cataloniaTurnoutWithAbroad)}.`,
        ),
      },
      turnout: {
        title: `Participación en ${place} y en Cataluña`,
        table: {
          caption: `Participación en las tres últimas elecciones en ${place}`,
          headers: ["Elecciones", place, "Cataluña"],
          rows: [
            [`Municipales, ${dates.municipal}`, f.p(mv.turnout), f.p(cataloniaMunicipalTurnout)],
            [`Generales, ${dates.congress}`, f.p(congress.turnout), f.p(congress.cataloniaTurnout)],
            [`Parlament, ${dates.parliament}`, f.p(parliament.turnout), f.p(parliament.cataloniaTurnout)],
          ],
          footRows: [],
          note: "Votantes sobre censo. Generales y Parlament: Cataluña sin el voto exterior, para comparar los mismos datos.",
        },
      },
      census: {
        title: "Qué es el censo electoral",
        md: [
          `El censo electoral es la lista de las personas con derecho a voto ([LOREG, artículo 31](${LOREG_URL})). No es la población: no están los menores de 18 años ni los extranjeros sin derecho a voto. Por eso ${place} tiene ${f.n(m.population)} habitantes y en las municipales de 2023 tenía un censo de ${f.n(m.municipal.electorate)} personas.`,
          "En las municipales, el censo también incluye a los ciudadanos de la Unión Europea y de los países con tratado de reciprocidad que residen allí y se han inscrito (artículo 176). En las generales y en las del Parlament, el voto de las personas inscritas en el extranjero (CERA) se cuenta por provincias y no aparece en las cifras del municipio.",
          "La **participación** es el número de votantes dividido por el censo. Los porcentajes de cada lista se calculan sobre los **votos válidos**: los votos a candidaturas más los votos en blanco. Los votos nulos no cuentan.",
        ],
      },
      next: {
        title: "Cuándo son las próximas elecciones municipales",
        md: [
          `Las próximas municipales están previstas para el **domingo 23 de mayo de 2027**. La ley las fija el cuarto domingo de mayo, cada cuatro años, y el decreto de convocatoria se expide 55 días antes y se publica al día siguiente en el BOE ([LOREG, artículo 42.3](${LOREG_URL})): el 29 y el 30 de marzo de 2027. El decreto todavía no se ha publicado.`,
          `Los resultados de cualquier municipio de Cataluña desde 1979: [${B2_TITLES.municipalResults.es}](${b2href("municipalResults", "es")}).`,
        ],
      },
      faqTitle: "Preguntas frecuentes",
      faq: [
        {
          question: `¿Qué lista fue la más votada en las municipales de 2023 en ${place}?`,
          answer: `${top.short} (${top.name}), con ${f.n(top.votes)} votos, el ${f.p(top.share)} de los válidos, y ${top.seats} de los ${m.municipal.seats} concejales.`,
        },
        {
          question: `¿Cuántos concejales tiene el Ayuntamiento de ${place}?`,
          answer: `${m.municipal.seats}, según la escala del artículo 179 de la ley electoral aplicada a la población del municipio.`,
        },
        {
          question: `¿Cuándo se podrán consultar los resultados del 29N en ${place}?`,
          answer: "Cuando el Ministerio del Interior publique el fichero oficial de resultados por municipios, que aparecerá en esta página. En la noche electoral, el escrutinio provisional lo publica Interior.",
        },
      ],
      siblings: {
        title: "Resultados en otros municipios",
        groups: [
          ...(sameComarca.length ? [{ label: `${m.comarca}`, links: sameComarca.map(link) }] : []),
          ...(sameProvince.length ? [{ label: `Otros municipios de la provincia de ${m.province}`, links: sameProvince.map(link) }] : []),
        ],
        hub: { ...hub, label: "Los 100 municipios más poblados, por comarcas" },
      },
      related: { title: "Guías sobre las elecciones", links: related },
      sources: {
        title: "Fuentes",
        note: `Datos oficiales leídos el ${dates.read}; entre paréntesis, la última actualización de cada conjunto de datos.`,
        items: sources,
      },
    };
  }

  return {
    locale,
    h1: `Election results in ${place}`,
    standfirst: `The 2023 local election with every list's votes and councillors, and how ${place} voted in the 2023 general election and the 2024 Catalan election, beside Catalonia as a whole. From official data, with space for the results of 29 November.`,
    readLine: `Data read on ${dates.read}`,
    facts: [
      { label: "Population", value: `${f.n(m.population)} (1 January ${snapshot.sources.population.period.slice(0, 4)}, Idescat)` },
      { label: "Comarca and province", value: `${m.comarca} · ${m.province}` },
      { label: "Councillors", value: String(m.municipal.seats) },
      ...(mayor ? [{ label: "Mayor", value: `${mayor.name}${mayorParty}, since ${f.date(mayor.since)}` }] : []),
      { label: "Next local elections", value: "Sunday 23 May 2027 (expected)" },
    ],
    slot: {
      title: "General election of 29 November 2026",
      lines: {
        fallback: "Polling day: Sunday 29 November 2026.",
        before: "{days} days to go to polling day, Sunday 29 November 2026.",
        beforeOne: "Tomorrow, Sunday 29 November 2026, is polling day.",
        today: "Today, Sunday 29 November 2026, is polling day.",
        after: "Polling day was Sunday 29 November 2026.",
      },
      md: [
        `**Results for ${place} will appear here when the Spanish Ministry of the Interior publishes the official results file by municipality** in its [download area](${INTERIOR_DOWNLOADS.en}).`,
        ELECTION_NIGHT_RESULTS_URL
          ? `Provisional results on election night: [the Interior Ministry's official site](${ELECTION_NIGHT_RESULTS_URL}).`
          : `Provisional results on election night: the ministry has not yet announced the website where it will publish them (checked on ${f.date(INTERIOR_CHECKED)}). When it does, we will add the official link here. How the count works: [${B2_TITLES.electionNight.en}](${b2href("electionNight", "en")}).`,
        `If you are voting: [how to vote in Catalonia](${b2href("voting", "en")}) and [the 29 November candidate lists](${b2href("candidates", "en")}).`,
      ],
    },
    municipal: {
      title: `Local election of ${dates.municipal}`,
      summary: `${place} elects ${m.municipal.seats} councillors. Turnout was ${f.p(mv.turnout)} (${f.n(m.municipal.voters)} voters out of an electorate of ${f.n(m.municipal.electorate)}), against ${f.p(cataloniaMunicipalTurnout)} across Catalonia. The list with most votes was ${top.short}, with ${f.n(top.votes)} votes (${f.p(top.share)} of valid votes) and ${top.seats} ${top.seats === 1 ? "councillor" : "councillors"}.`,
      table: {
        caption: `Results of the 2023 local election in ${place}`,
        headers: ["List", "Votes", "% of valid votes", "Councillors"],
        rows: municipalRows,
        footRows: [["Blank votes", f.n(m.municipal.blankVotes), f.p(mv.blankShare), ""]],
        note: `Valid votes: ${f.n(m.municipal.validVotes)}, including blank votes. Spoilt (null) votes: ${f.n(m.municipal.nullVotes)}, not counted in the percentages. Percentages computed from the official counts.`,
      },
      mayorRule: "Voters do not elect the mayor directly: the councillors do, at the council's first meeting. If no list leader wins an absolute majority of the councillors, the leader of the list with most votes becomes mayor (electoral law, article 196).",
      mayor: mayor ? `According to the Catalan government's register of local authorities, the mayor of ${place} is ${mayor.name}${mayorParty}, in office since ${f.date(mayor.since)}.` : null,
    },
    seats: {
      title: `How the ${m.municipal.seats} councillors were allocated`,
      md: [
        `Spanish electoral law uses the **D'Hondt method** ([LOREG, articles 163 and 180](${LOREG_URL})). Only lists with at least **5% of the valid votes** take part, which in ${place} meant ${f.n(mv.threshold)} votes; ${mv.belowThreshold === 0 ? "every list passed it" : mv.belowThreshold === 1 ? "one list fell short" : `${mv.belowThreshold} lists fell short`}. Each remaining list's votes are divided by 1, 2, 3… and the seats go to the largest quotients.`,
        ...(last && nextOut
          ? [`The ${ORDINAL_EN(m.municipal.seats)} and last seat went to ${shortOf(last.code)}, with a quotient of ${f.q(last.value)} (${f.n(last.votes)} votes ÷ ${last.divisor}). The highest quotient left without a seat: ${f.q(nextOut.value)} (${shortOf(nextOut.code)}, ${f.n(nextOut.votes)} ÷ ${nextOut.divisor}).`]
          : []),
        ...(sizeOk
          ? [`The size of the council depends on population: with ${f.n(census)} residents on the register used for this election, ${place} elects ${m.municipal.seats} (LOREG, article 179).`]
          : []),
      ],
    },
    congress: {
      title: `General election of ${dates.congress} (Congress)`,
      summary: `In ${place}, ${f.n(m.congress.voters)} people voted out of an electorate of ${f.n(m.congress.electorate)}: turnout of ${f.p(congress.turnout)}, against ${f.p(congress.cataloniaTurnout)} in Catalonia. The list with most votes was ${congress.rows[0]?.short}, with ${f.p(congress.rows[0]?.share ?? 0)} of valid votes (${f.p(congress.rows[0]?.cataloniaShare ?? 0)} in Catalonia).`,
      table: regionalTable(
        congress,
        `Votes for Congress in 2023 in ${place} and in Catalonia`,
        ["List", "Votes", `% ${place}`, "% Catalonia", "Seats"],
        (n) => `Other lists (${n})`,
        "Blank votes",
        `Seats are allocated by province, not by municipality: the last column is Catalonia's total (48 members of Congress). Catalonia's figures leave out votes from residents abroad (CERA), which are counted by province and belong to no municipality; with them, official turnout in Catalonia was ${f.p(congress.cataloniaTurnoutWithAbroad)}.`,
      ),
    },
    parliament: {
      title: `Catalan Parliament election of ${dates.parliament}`,
      summary: `In ${place}, ${f.n(m.parliament.voters)} people voted out of an electorate of ${f.n(m.parliament.electorate)}: turnout of ${f.p(parliament.turnout)}, against ${f.p(parliament.cataloniaTurnout)} in Catalonia. The list with most votes was ${parliament.rows[0]?.short}, with ${f.p(parliament.rows[0]?.share ?? 0)} of valid votes (${f.p(parliament.rows[0]?.cataloniaShare ?? 0)} in Catalonia).`,
      table: regionalTable(
        parliament,
        `Votes for the Catalan Parliament in 2024 in ${place} and in Catalonia`,
        ["List", "Votes", `% ${place}`, "% Catalonia", "Seats"],
        (n) => `Other lists (${n})`,
        "Blank votes",
        `The 135 seats are allocated by province; the last column is the total. Catalonia's figures leave out votes from residents abroad (CERA); with them, official turnout was ${f.p(parliament.cataloniaTurnoutWithAbroad)}.`,
      ),
    },
    turnout: {
      title: `Turnout in ${place} and in Catalonia`,
      table: {
        caption: `Turnout in the last three elections in ${place}`,
        headers: ["Election", place, "Catalonia"],
        rows: [
          [`Local, ${dates.municipal}`, f.p(mv.turnout), f.p(cataloniaMunicipalTurnout)],
          [`General, ${dates.congress}`, f.p(congress.turnout), f.p(congress.cataloniaTurnout)],
          [`Catalan Parliament, ${dates.parliament}`, f.p(parliament.turnout), f.p(parliament.cataloniaTurnout)],
        ],
        footRows: [],
        note: "Voters over electorate. General and Parliament: Catalonia without the vote from abroad, so like is compared with like.",
      },
    },
    census: {
      title: "What the electoral roll (census) is",
      md: [
        `The electoral roll (_censo electoral_) lists everyone entitled to vote ([LOREG, article 31](${LOREG_URL})). It is not the population: under-18s and foreign residents without voting rights are not on it. That is why ${place} has ${f.n(m.population)} residents and had an electorate of ${f.n(m.municipal.electorate)} at the 2023 local election.`,
        "For local elections the roll also includes citizens of other EU countries, and of countries with a reciprocity treaty, who live there and have registered (article 176). In general and Catalan elections, votes from people registered abroad (CERA) are counted by province and do not appear in the municipality's figures.",
        "**Turnout** is voters divided by the electorate. Each list's percentage is of **valid votes**: votes for lists plus blank votes. Spoilt votes do not count.",
      ],
    },
    next: {
      title: "When the next local elections are",
      md: [
        `The next local elections are expected on **Sunday 23 May 2027**. The law sets them on the fourth Sunday of May every four years, and the decree calling them is issued 55 days before and published in the BOE the next day ([LOREG, article 42.3](${LOREG_URL})): 29 and 30 March 2027. It has not been published yet.`,
        `Local election results for any municipality in Catalonia since 1979: [${B2_TITLES.municipalResults.en}](${b2href("municipalResults", "en")}).`,
      ],
    },
    faqTitle: "Common questions",
    faq: [
      {
        question: `Which list won most votes in the 2023 local election in ${place}?`,
        answer: `${top.short} (${top.name}), with ${f.n(top.votes)} votes, ${f.p(top.share)} of valid votes, and ${top.seats} of the ${m.municipal.seats} councillors.`,
      },
      {
        question: `How many councillors does ${place} have?`,
        answer: `${m.municipal.seats}, under the scale in article 179 of the electoral law applied to the municipality's population.`,
      },
      {
        question: `When will the 29 November results for ${place} be available?`,
        answer: "When the Interior Ministry publishes the official results file by municipality; they will appear on this page. On election night, the provisional count is published by the ministry.",
      },
    ],
    siblings: {
      title: "Results in other towns",
      groups: [
        ...(sameComarca.length ? [{ label: `${m.comarca}`, links: sameComarca.map(link) }] : []),
        ...(sameProvince.length ? [{ label: `Elsewhere in the province of ${m.province}`, links: sameProvince.map(link) }] : []),
      ],
      hub: { ...hub, label: "Catalonia's largest towns" },
    },
    related: { title: "Election guides", links: related },
    sources: {
      title: "Sources",
      note: `Official data read on ${dates.read}; in brackets, each dataset's last update.`,
      items: sources,
    },
  };
}
