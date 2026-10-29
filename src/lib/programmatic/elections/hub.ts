/** Copy for the family's index page in each language. Pure. */

import { b2href } from "@/lib/content/batch02/shared";
import type { Locale } from "@/lib/i18n/config";

import { longDate, LOREG_URL } from "./model";
import { EN_LARGEST, EN_RESORTS, hubPath, PAGES_PER_LOCALE } from "./pages";
import { SNAPSHOT } from "./snapshot";

/** Where the English set's resorts come from (see `EN_RESORTS`). */
export const TOURISM_REGISTER = {
  name: "Establiments d'allotjament turístic inscrits al Registre de Turisme de Catalunya",
  publisher: "Generalitat de Catalunya, Departament d'Empresa i Treball",
  url: "https://analisi.transparenciacatalunya.cat/d/t2h3-cgys",
};

export interface HubCopy {
  lead: string;
  readLine: string;
  intro: string[];
  listTitle: string;
  /** Label of the row of links to each comarca's list. */
  jumpLabel: string;
  listNote: string;
  guideTitle: string;
  guide: string[];
  sourcesTitle: string;
  sources: { name: string; publisher: string; url: string }[];
}

export function hubCopy(locale: Locale): HubCopy {
  const read = longDate(SNAPSHOT.readAt, locale);
  const year = SNAPSHOT.sources.population.period.slice(0, 4);
  const sources = [SNAPSHOT.sources.votes, SNAPSHOT.sources.turnout, SNAPSHOT.sources.population].map(({ name, publisher, url }) => ({ name, publisher, url }));
  const n = PAGES_PER_LOCALE[locale];

  if (locale === "ca") {
    return {
      lead: `Els resultats de les municipals del 2023, les generals del 2023 i les eleccions al Parlament del 2024 als ${n} municipis més poblats de Catalunya, amb un espai per als del 29 de novembre de 2026.`,
      readLine: `Dades llegides el ${read}`,
      intro: [
        `Cada pàgina té els vots, els percentatges i els regidors de cada llista a les municipals del 2023, com es van repartir els regidors, i el vot del municipi a les generals i al Parlament al costat del de Catalunya. Els municipis són els ${n} amb més habitants a l'1 de gener de ${year}, segons l'Idescat.`,
        `Per a qualsevol altre municipi, i per a totes les municipals des del 1979, fes servir el [cercador de resultats municipals](${b2href("municipalResults", "ca")}).`,
      ],
      listTitle: "Municipis per comarques",
      jumpLabel: "Ves a la comarca",
      listNote: `Al costat de cada municipi, els habitants a l'1 de gener de ${year}.`,
      guideTitle: "Com llegir aquests resultats",
      guide: [
        `Els regidors es reparteixen amb el sistema D'Hondt entre les llistes que tenen almenys el 5 % dels vots vàlids del municipi ([LOREG, article 180](${LOREG_URL})). A les generals i al Parlament, els escons es reparteixen per províncies: les pàgines donen els vots del municipi, no escons.`,
        `Els resultats del 29N per municipi s'hi afegiran quan el Ministeri de l'Interior en publiqui el fitxer oficial. La nit electoral: [com funciona l'escrutini](${b2href("electionNight", "ca")}).`,
      ],
      sourcesTitle: "Fonts",
      sources,
    };
  }
  if (locale === "es") {
    return {
      lead: `Los resultados de las municipales de 2023, las generales de 2023 y las elecciones al Parlament de 2024 en los ${n} municipios más poblados de Cataluña, con un espacio para los del 29 de noviembre de 2026.`,
      readLine: `Datos leídos el ${read}`,
      intro: [
        `Cada página tiene los votos, los porcentajes y los concejales de cada lista en las municipales de 2023, cómo se repartieron los concejales, y el voto del municipio en las generales y en el Parlament junto al de Cataluña. Los municipios son los ${n} con más habitantes a 1 de enero de ${year}, según el Idescat.`,
        `Para cualquier otro municipio, y para todas las municipales desde 1979, usa el [buscador de resultados municipales](${b2href("municipalResults", "es")}).`,
      ],
      listTitle: "Municipios por comarcas",
      jumpLabel: "Ir a la comarca",
      listNote: `Junto a cada municipio, los habitantes a 1 de enero de ${year}.`,
      guideTitle: "Cómo leer estos resultados",
      guide: [
        `Los concejales se reparten con el sistema D'Hondt entre las listas que tienen al menos el 5 % de los votos válidos del municipio ([LOREG, artículo 180](${LOREG_URL})). En las generales y en el Parlament, los escaños se reparten por provincias: las páginas dan los votos del municipio, no escaños.`,
        `Los resultados del 29N por municipio se añadirán cuando el Ministerio del Interior publique el fichero oficial. La noche electoral: [cómo funciona el escrutinio](${b2href("electionNight", "es")}).`,
      ],
      sourcesTitle: "Fuentes",
      sources,
    };
  }
  return {
    lead: `Results of the 2023 local election, the 2023 general election and the 2024 Catalan election in ${n} Catalan towns, the largest and the main resorts, with space for the results of 29 November 2026.`,
    readLine: `Data read on ${read}`,
    intro: [
      `Each page has every list's votes, percentage and councillors in the 2023 local election, how the seats were allocated, and the town's vote in the general and Catalan elections beside Catalonia's. The towns are the ${EN_LARGEST} largest by population on 1 January ${year} (Idescat), the four provincial capitals among them, and the ${EN_RESORTS.length} with the most places in the Generalitat's register of tourist accommodation (hotels, campsites, rural tourism, tourist flats and homes).`,
      `The Catalan and Spanish editions cover the ${PAGES_PER_LOCALE.ca} most populous municipalities: [in Catalan](${hubPath("ca")}), [in Spanish](${hubPath("es")}). For any municipality and every local election since 1979, use the [local results lookup](${b2href("municipalResults", "en")}).`,
    ],
    listTitle: "Towns by comarca",
    jumpLabel: "Go to a comarca",
    listNote: `Beside each town, its population on 1 January ${year}.`,
    guideTitle: "How to read these results",
    guide: [
      `Councillors are allocated by the D'Hondt method among lists with at least 5% of the municipality's valid votes ([LOREG, article 180](${LOREG_URL})). In general and Catalan elections seats are allocated by province, so the pages give the town's votes, not seats.`,
      `Results of 29 November by municipality will be added when the Spanish Ministry of the Interior publishes its official file. On the night itself: [how the count works](${b2href("electionNight", "en")}).`,
    ],
    sourcesTitle: "Sources",
    sources: [...sources, TOURISM_REGISTER],
  };
}
