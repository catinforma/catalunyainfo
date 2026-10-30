/**
 * The comarca page model (`/ca/eleccions/comarca/<slug>/`,
 * `/es/elecciones/comarca/<slug>/`): every municipality of the comarca with
 * its 2023 local result in one row, straight from the snapshot. Pure and
 * deterministic, like `model.ts`, so the tests read what the reader reads.
 *
 * One column per fact the source gives for every council, whatever its size:
 * the list with most councillors (all of them on a tie; in a concejo abierto,
 * the list that won the mayoralty), how many it won of the council's seats,
 * and turnout. No column depends on per-list vote shares, which do not exist
 * for open-list councils (LOREG art. 184: votes go to candidates).
 */

import { B2_TITLES, b2href, type B2Key } from "@/lib/content/batch02/shared";
import { joinList } from "@/lib/programmatic/holidays/names";
import { INTL_LOCALE } from "@/lib/i18n/config";

import { longDate, LOREG_URL, NEXT_MUNICIPAL, type Link } from "./model";
import { caInComarca, caOfComarca, comarcaH1, comarques, electionPath, hubPath, latestDataDate, PAGES_PER_LOCALE, placeName, type ComarcaGroup } from "./pages";
import { comarcaPath, type ComarcaLocale } from "./paths";
import { councilSystem, electedCount, leadingLists, pooledTurnout, turnout, type CouncilSystem } from "./results";
import { SNAPSHOT } from "./snapshot";
import type { ElectionsSnapshot } from "./types";

export interface ComarcaRow {
  href: string;
  town: string;
  population: string;
  /** Abbreviations of the list(s) with most councillors, as the source writes them. */
  leading: string;
  /** "14 de 27"; "8 de 27 cadascuna" on a tie; "alcaldia" in a concejo abierto. */
  seats: string;
  turnout: string;
  system: CouncilSystem;
}

export interface ComarcaPageModel {
  locale: ComarcaLocale;
  h1: string;
  lead: string;
  dataDate: string;
  readLine: string;
  facts: { label: string; value: string }[];
  tableTitle: string;
  table: { caption: string; headers: string[]; rows: ComarcaRow[]; note: string };
  /** How the small councils in the comarca were elected; null when every council is elected by D'Hondt. Inline markdown. */
  systems: string | null;
  general: string;
  next: { title: string; md: string[] };
  others: { title: string; links: Link[] };
  hub: Link;
  guides: { title: string; links: Link[] };
  sources: { title: string; note: string; items: { name: string; publisher: string; url: string; updated: string }[] };
}

const GUIDES: B2Key[] = ["municipalResults", "voting", "electionNight", "candidates"];

export function buildComarcaPage(g: ComarcaGroup, locale: ComarcaLocale, snapshot: ElectionsSnapshot = SNAPSHOT): ComarcaPageModel {
  const intl = INTL_LOCALE[locale];
  const whole = new Intl.NumberFormat(intl, { maximumFractionDigits: 0 });
  const one = new Intl.NumberFormat(intl, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const n = (value: number) => whole.format(value);
  const p = (value: number) => `${one.format(value)} %`;
  const towns = g.municipalities;
  const people = towns.reduce((sum, m) => sum + m.population, 0);
  const comarcaTurnout = pooledTurnout(towns.map((m) => m.municipal));
  const cataloniaTurnout = turnout(snapshot.catalonia.municipal);
  const open = towns.filter((m) => councilSystem(m.municipal) === "open");
  const council = towns.filter((m) => councilSystem(m.municipal) === "council");
  const dataDate = latestDataDate(snapshot);
  const year = snapshot.sources.population.period.slice(0, 4);
  const municipalDate = longDate(snapshot.elections.municipal.date, locale);
  const and = locale === "ca" ? " i " : " y ";

  const rows: ComarcaRow[] = towns.map((m) => {
    const system = councilSystem(m.municipal);
    const leading = leadingLists(m.municipal);
    const most = leading[0]?.seats ?? 0;
    const seats =
      system === "council"
        ? locale === "ca"
          ? "alcaldia"
          : "alcaldía"
        : `${most} de ${m.municipal.seats}${leading.length > 1 ? (locale === "ca" ? " cadascuna" : " cada una") : ""}`;
    return {
      href: electionPath(locale, m.slug),
      town: placeName(m, locale),
      population: n(m.population),
      leading: leading.map((list) => list.short).join(and),
      seats,
      turnout: p(turnout(m.municipal)),
      system,
    };
  });
  const vacant = towns.filter((m) => councilSystem(m.municipal) !== "council" && electedCount(m.municipal) < m.municipal.seats);

  const sources = [snapshot.sources.votes, snapshot.sources.turnout, snapshot.sources.elections, snapshot.sources.population, snapshot.sources.entities].map((s) => ({
    name: s.name,
    publisher: s.publisher,
    url: s.url,
    updated: longDate(s.updated, locale),
  }));
  const others = comarques()
    .filter((o) => o.slug !== g.slug)
    .map((o) => ({ href: comarcaPath(locale, o.slug), label: o.comarca }));
  const guides = GUIDES.map((key) => ({ href: b2href(key, locale), label: B2_TITLES[key][locale] }));
  const general = snapshot.general2026;
  const nextDay = longDate(NEXT_MUNICIPAL.day, locale);

  if (locale === "ca") {
    const de = caOfComarca(g.comarca);
    const a = caInComarca(g.comarca);
    const openNames = joinList(
      open.map((m) => m.name),
      "ca",
    );
    const councilNames = joinList(
      council.map((m) => m.name),
      "ca",
    );
    return {
      locale,
      h1: comarcaH1(locale, g),
      lead: `Els resultats de les eleccions municipals del ${municipalDate} ${towns.length === 1 ? "al municipi" : `als ${towns.length} municipis`} ${de}: per a cadascun, la llista que va obtenir més regidors, quants en va obtenir i la participació. Cada municipi té la seva pàgina amb els vots de totes les llistes, les generals del 2023 i el Parlament del 2024.`,
      dataDate,
      readLine: `Dades llegides el ${longDate(dataDate, "ca")}`,
      facts: [
        { label: "Municipis", value: n(towns.length) },
        { label: "Habitants", value: `${n(people)} (1 de gener de ${year}, Idescat)` },
        { label: "Participació a les municipals del 2023", value: `${p(comarcaTurnout)} ${a}; ${p(cataloniaTurnout)} a Catalunya` },
        { label: "Pròximes municipals", value: "diumenge 23 de maig de 2027 (previstes)" },
      ],
      tableTitle: `Resultats per municipi ${de}`,
      table: {
        caption: `Eleccions municipals del 2023 ${a}: llista amb més regidors i participació de cada municipi`,
        headers: ["Municipi", "Habitants", "Llista amb més regidors", "Regidors", "Participació"],
        rows,
        note: `Llista amb més regidors: la que en va obtenir més, amb les sigles que publica la Generalitat; en cas d'empat, totes les empatades. Participació: votants sobre cens. Habitants a l'1 de gener de ${year}, segons l'Idescat.${
          vacant.length ? ` ${joinList(vacant.map((m) => m.name), "ca")}: les dades oficials hi registren menys regidors elegits que places al ple.` : ""
        }`,
      },
      systems:
        open.length || council.length
          ? [
              open.length
                ? `${capital(openNames)} ${open.length === 1 ? "va elegir" : "van elegir"} els regidors el 2023 amb **llistes obertes**, el sistema dels municipis de fins a 250 habitants ([LOREG, article 184](${LOREG_URL})): surten elegits els candidats més votats, siguin de la llista que siguin, sense llindar ni D'Hondt.`
                : "",
              council.length
                ? `${capital(councilNames)} ${council.length === 1 ? "funciona" : "funcionen"} en règim de **consell obert** ([LOREG, article 179.2](${LOREG_URL})): els electors hi elegeixen directament l'alcaldia, per majoria.`
                : "",
            ]
              .filter(Boolean)
              .join(" ")
          : null,
      general: general
        ? "Els resultats de les eleccions generals del 29 de novembre de 2026 de cada municipi, del fitxer oficial del Ministeri de l'Interior, són a la pàgina de cada municipi."
        : "Els resultats de les eleccions generals del 29 de novembre de 2026 de cada municipi s'afegiran a la seva pàgina quan el Ministeri de l'Interior publiqui el fitxer oficial de resultats per municipis.",
      next: {
        title: "Quan són les pròximes eleccions municipals",
        md: [
          `Les pròximes municipals són previstes per al **diumenge ${nextDay}**. La llei les fixa el quart diumenge de maig, cada quatre anys, i el decret de convocatòria s'expedeix 55 dies abans i es publica l'endemà al BOE ([LOREG, article 42.3](${LOREG_URL})). El decret encara no s'ha publicat.`,
          `Els resultats de qualsevol municipi des del 1979: [${B2_TITLES.municipalResults.ca}](${b2href("municipalResults", "ca")}).`,
        ],
      },
      others: { title: "Resultats a les altres comarques", links: others },
      hub: { href: hubPath("ca"), label: `Els ${PAGES_PER_LOCALE.ca} municipis de Catalunya, per comarques` },
      guides: { title: "Guies sobre les eleccions", links: guides },
      sources: {
        title: "Fonts",
        note: `Dades oficials llegides el ${longDate(dataDate, "ca")}; entre parèntesis, l'última actualització de cada conjunt de dades.`,
        items: sources,
      },
    };
  }

  const openNames = joinList(
    open.map((m) => placeName(m, "es")),
    "es",
  );
  const councilNames = joinList(
    council.map((m) => placeName(m, "es")),
    "es",
  );
  return {
    locale,
    h1: comarcaH1(locale, g),
    lead: `Los resultados de las elecciones municipales del ${municipalDate} en ${towns.length === 1 ? "el municipio" : `los ${towns.length} municipios`} de la comarca ${g.comarca}: para cada uno, la lista que obtuvo más concejales, cuántos obtuvo y la participación. Cada municipio tiene su página con los votos de todas las listas, las generales de 2023 y el Parlament de 2024.`,
    dataDate,
    readLine: `Datos leídos el ${longDate(dataDate, "es")}`,
    facts: [
      { label: "Municipios", value: n(towns.length) },
      { label: "Habitantes", value: `${n(people)} (1 de enero de ${year}, Idescat)` },
      { label: "Participación en las municipales de 2023", value: `${p(comarcaTurnout)} en la comarca; ${p(cataloniaTurnout)} en Cataluña` },
      { label: "Próximas municipales", value: "domingo 23 de mayo de 2027 (previstas)" },
    ],
    tableTitle: `Resultados por municipio: ${g.comarca}`,
    table: {
      caption: `Elecciones municipales de 2023 en la comarca ${g.comarca}: lista con más concejales y participación de cada municipio`,
      headers: ["Municipio", "Habitantes", "Lista con más concejales", "Concejales", "Participación"],
      rows,
      note: `Lista con más concejales: la que obtuvo más, con las siglas que publica la Generalitat; en caso de empate, todas las empatadas. Participación: votantes sobre censo. Habitantes a 1 de enero de ${year}, según el Idescat.${
        vacant.length ? ` ${joinList(vacant.map((m) => placeName(m, "es")), "es")}: los datos oficiales registran menos concejales electos que plazas en el pleno.` : ""
      }`,
    },
    systems:
      open.length || council.length
        ? [
            open.length
              ? `${openNames} ${open.length === 1 ? "eligió" : "eligieron"} a sus concejales en 2023 con **listas abiertas**, el sistema de los municipios de hasta 250 habitantes ([LOREG, artículo 184](${LOREG_URL})): salen elegidos los candidatos más votados, sean de la lista que sean, sin umbral ni D'Hondt.`
              : "",
            council.length
              ? `${councilNames} ${council.length === 1 ? "funciona" : "funcionan"} en régimen de **concejo abierto** ([LOREG, artículo 179.2](${LOREG_URL})): los electores eligen directamente la alcaldía, por mayoría.`
              : "",
          ]
            .filter(Boolean)
            .join(" ")
        : null,
    general: general
      ? "Los resultados de las elecciones generales del 29 de noviembre de 2026 de cada municipio, del fichero oficial del Ministerio del Interior, están en la página de cada municipio."
      : "Los resultados de las elecciones generales del 29 de noviembre de 2026 de cada municipio se añadirán a su página cuando el Ministerio del Interior publique el fichero oficial de resultados por municipios.",
    next: {
      title: "Cuándo son las próximas elecciones municipales",
      md: [
        `Las próximas municipales están previstas para el **domingo ${nextDay}**. La ley las fija el cuarto domingo de mayo, cada cuatro años, y el decreto de convocatoria se expide 55 días antes y se publica al día siguiente en el BOE ([LOREG, artículo 42.3](${LOREG_URL})). El decreto todavía no se ha publicado.`,
        `Los resultados de cualquier municipio desde 1979: [${B2_TITLES.municipalResults.es}](${b2href("municipalResults", "es")}).`,
      ],
    },
    others: { title: "Resultados en las otras comarcas", links: others },
    hub: { href: hubPath("es"), label: `Los ${PAGES_PER_LOCALE.es} municipios de Cataluña, por comarcas` },
    guides: { title: "Guías sobre las elecciones", links: guides },
    sources: {
      title: "Fuentes",
      note: `Datos oficiales leídos el ${longDate(dataDate, "es")}; entre paréntesis, la última actualización de cada conjunto de datos.`,
      items: sources,
    },
  };
}

/** "l'Ametlla de Mar i Sant Jaume" -> "L'Ametlla de Mar i Sant Jaume", for the start of a sentence. */
const capital = (text: string) => text.charAt(0).toLocaleUpperCase("ca") + text.slice(1);
