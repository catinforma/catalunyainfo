/** Copy for the family's index page in each language. Pure. */

import { b2href } from "@/lib/content/batch02/shared";
import type { Locale } from "@/lib/i18n/config";

import { INTERIOR_DOWNLOADS, longDate, LOREG_URL } from "./model";
import { caOfComarca, EN_LARGEST, EN_RESORTS, hubPath, latestDataDate, PAGES_PER_LOCALE } from "./pages";
import { councilSystem } from "./results";
import { SNAPSHOT } from "./snapshot";

/** Where the English set's resorts come from (see `EN_RESORTS`). */
export const TOURISM_REGISTER = {
  name: "Establiments d'allotjament turístic inscrits al Registre de Turisme de Catalunya",
  publisher: "Generalitat de Catalunya, Departament d'Empresa i Treball",
  url: "https://analisi.transparenciacatalunya.cat/d/t2h3-cgys",
};

/**
 * Towns shown with their population in each comarca's section of the hub;
 * the rest sit in a collapsed list, and the comarca page has them all in a
 * table. Keeps the hub light with 947 towns (Alt Empordà alone has 68).
 */
export const HUB_VISIBLE = 6;

export interface HubCopy {
  lead: string;
  readLine: string;
  intro: string[];
  listTitle: string;
  /** Label of the row of links to each comarca's list. */
  jumpLabel: string;
  listNote: string;
  /** "68 municipis" */
  towns: (n: number) => string;
  /** Link to the comarca page; null in English, which has none. */
  table: ((comarca: string) => string) | null;
  /** Summary of the collapsed rest of a comarca's towns. */
  more: (n: number) => string;
  guideTitle: string;
  guide: string[];
  sourcesTitle: string;
  sources: { name: string; publisher: string; url: string }[];
}

export function hubCopy(locale: Locale): HubCopy {
  const read = longDate(latestDataDate(), locale);
  const g = SNAPSHOT.general2026;
  const year = SNAPSHOT.sources.population.period.slice(0, 4);
  const sources = [
    ...(g ? [{ name: g.source.name, publisher: g.source.publisher, url: INTERIOR_DOWNLOADS[locale] }] : []),
    ...[SNAPSHOT.sources.votes, SNAPSHOT.sources.turnout, SNAPSHOT.sources.population].map(({ name, publisher, url }) => ({ name, publisher, url })),
  ];
  const n = PAGES_PER_LOCALE[locale];
  const open = SNAPSHOT.municipalities.filter((m) => councilSystem(m.municipal) === "open").length;
  const council = SNAPSHOT.municipalities.filter((m) => councilSystem(m.municipal) === "council").length;

  if (locale === "ca") {
    return {
      lead: g
        ? `Els resultats de les eleccions generals del 29 de novembre de 2026, de les municipals del 2023, les generals del 2023 i les eleccions al Parlament del 2024 als ${n} municipis de Catalunya.`
        : `Els resultats de les municipals del 2023, les generals del 2023 i les eleccions al Parlament del 2024 als ${n} municipis de Catalunya, amb un espai per als del 29 de novembre de 2026.`,
      readLine: `Dades llegides el ${read}`,
      intro: [
        `Cada pàgina té els vots i els regidors de cada llista a les municipals del 2023, com es van elegir els regidors, i el vot del municipi a les generals i al Parlament al costat del de Catalunya. Cada comarca té també la seva pàgina, amb el resultat de les municipals de tots els seus municipis en una taula.`,
        `Per a totes les municipals des del 1979, fes servir el [cercador de resultats municipals](${b2href("municipalResults", "ca")}).`,
      ],
      listTitle: "Municipis per comarques",
      jumpLabel: "Ves a la comarca",
      listNote: `Al costat dels municipis més poblats de cada comarca, els habitants a l'1 de gener de ${year} (Idescat).`,
      towns: (count) => `${count} ${count === 1 ? "municipi" : "municipis"}`,
      table: (comarca) => `Taula de resultats ${caOfComarca(comarca)}`,
      more: (count) => `${count === 1 ? "1 municipi més" : `${count} municipis més`}`,
      guideTitle: "Com llegir aquests resultats",
      guide: [
        `Als municipis de més de 250 habitants, els regidors es reparteixen amb el sistema D'Hondt entre les llistes que tenen almenys el 5 % dels vots vàlids ([LOREG, article 180](${LOREG_URL})). Als ${open} municipis de fins a 250 habitants es vota amb llistes obertes i surten elegits els candidats més votats (article 184), i ${council} municipis funcionen en consell obert, on els electors elegeixen directament l'alcaldia (article 179.2). A les generals i al Parlament, els escons es reparteixen per províncies: les pàgines donen els vots del municipi, no escons.`,
        g
          ? `Els resultats del 29N de cada municipi són els del fitxer oficial de resultats per municipis del Ministeri de l'Interior ([àrea de descàrregues](${INTERIOR_DOWNLOADS.ca})).`
          : `Els resultats del 29N per municipi s'hi afegiran quan el Ministeri de l'Interior en publiqui el fitxer oficial. La nit electoral: [com funciona l'escrutini](${b2href("electionNight", "ca")}).`,
      ],
      sourcesTitle: "Fonts",
      sources,
    };
  }
  if (locale === "es") {
    return {
      lead: g
        ? `Los resultados de las elecciones generales del 29 de noviembre de 2026, de las municipales de 2023, las generales de 2023 y las elecciones al Parlament de 2024 en los ${n} municipios de Cataluña.`
        : `Los resultados de las municipales de 2023, las generales de 2023 y las elecciones al Parlament de 2024 en los ${n} municipios de Cataluña, con un espacio para los del 29 de noviembre de 2026.`,
      readLine: `Datos leídos el ${read}`,
      intro: [
        `Cada página tiene los votos y los concejales de cada lista en las municipales de 2023, cómo se eligieron los concejales, y el voto del municipio en las generales y en el Parlament junto al de Cataluña. Cada comarca tiene también su página, con el resultado de las municipales de todos sus municipios en una tabla.`,
        `Para todas las municipales desde 1979, usa el [buscador de resultados municipales](${b2href("municipalResults", "es")}).`,
      ],
      listTitle: "Municipios por comarcas",
      jumpLabel: "Ir a la comarca",
      listNote: `Junto a los municipios más poblados de cada comarca, los habitantes a 1 de enero de ${year} (Idescat).`,
      towns: (count) => `${count} ${count === 1 ? "municipio" : "municipios"}`,
      table: (comarca) => `Tabla de resultados: ${comarca}`,
      more: (count) => `${count === 1 ? "1 municipio más" : `${count} municipios más`}`,
      guideTitle: "Cómo leer estos resultados",
      guide: [
        `En los municipios de más de 250 habitantes, los concejales se reparten con el sistema D'Hondt entre las listas que tienen al menos el 5 % de los votos válidos ([LOREG, artículo 180](${LOREG_URL})). En los ${open} municipios de hasta 250 habitantes se vota con listas abiertas y salen elegidos los candidatos más votados (artículo 184), y ${council} municipios funcionan en concejo abierto, donde los electores eligen directamente la alcaldía (artículo 179.2). En las generales y en el Parlament, los escaños se reparten por provincias: las páginas dan los votos del municipio, no escaños.`,
        g
          ? `Los resultados del 29N de cada municipio son los del fichero oficial de resultados por municipios del Ministerio del Interior ([área de descargas](${INTERIOR_DOWNLOADS.es})).`
          : `Los resultados del 29N por municipio se añadirán cuando el Ministerio del Interior publique el fichero oficial. La noche electoral: [cómo funciona el escrutinio](${b2href("electionNight", "es")}).`,
      ],
      sourcesTitle: "Fuentes",
      sources,
    };
  }
  return {
    lead: g
      ? `Results of the general election of 29 November 2026, the 2023 local election, the 2023 general election and the 2024 Catalan election in ${n} Catalan towns, the largest and the main resorts.`
      : `Results of the 2023 local election, the 2023 general election and the 2024 Catalan election in ${n} Catalan towns, the largest and the main resorts, with space for the results of 29 November 2026.`,
    readLine: `Data read on ${read}`,
    intro: [
      `Each page has every list's votes, percentage and councillors in the 2023 local election, how the seats were allocated, and the town's vote in the general and Catalan elections beside Catalonia's. The towns are the ${EN_LARGEST} largest by population on 1 January ${year} (Idescat), the four provincial capitals among them, and the ${EN_RESORTS.length} with the most places in the Generalitat's register of tourist accommodation (hotels, campsites, rural tourism, tourist flats and homes).`,
      `The Catalan and Spanish editions cover all ${PAGES_PER_LOCALE.ca} municipalities in Catalonia: [in Catalan](${hubPath("ca")}), [in Spanish](${hubPath("es")}). For every local election since 1979, use the [local results lookup](${b2href("municipalResults", "en")}).`,
    ],
    listTitle: "Towns by comarca",
    jumpLabel: "Go to a comarca",
    listNote: `Beside each town, its population on 1 January ${year}.`,
    towns: (count) => `${count} ${count === 1 ? "town" : "towns"}`,
    table: null,
    more: (count) => `${count} more`,
    guideTitle: "How to read these results",
    guide: [
      `Councillors are allocated by the D'Hondt method among lists with at least 5% of the municipality's valid votes ([LOREG, article 180](${LOREG_URL})). In general and Catalan elections seats are allocated by province, so the pages give the town's votes, not seats.`,
      g
        ? `Results of 29 November for each town come from the Spanish Ministry of the Interior's official results file by municipality ([download area](${INTERIOR_DOWNLOADS.en})).`
        : `Results of 29 November by municipality will be added when the Spanish Ministry of the Interior publishes its official file. On the night itself: [how the count works](${b2href("electionNight", "en")}).`,
    ],
    sourcesTitle: "Sources",
    sources: [...sources, TOURISM_REGISTER],
  };
}
