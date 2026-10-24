import type { Block } from "@/lib/content/blocks";
import type { Locale } from "@/lib/i18n/config";

import {
  b2Related,
  callout,
  faq,
  h2,
  lead,
  list,
  verifiedLine,
  type B2Article,
  type B2Source,
} from "./shared";

/**
 * Municipal election results for any municipality in Catalonia, live from the
 * Generalitat's open data, with what the next election (May 2027) involves.
 *
 * Facts from the LOREG and the Generalitat's datasets, checked on 12-14 Oct
 * 2026 (research_notes/blog-batch-03/municipal_data.md). The block reads
 * every municipal election since 1979 and the latest is picked by date, so
 * the May 2027 results appear when the Generalitat publishes them. Percentages
 * are computed from the counts: the source's own percentage fields are wrong.
 * Not printed: who will stand in 2027 (no candidacies yet) and the 2027
 * calendar beyond the polling day the law fixes.
 */

const VERIFIED = "2026-10-14";

const SOURCES: B2Source[] = [
  { name: "Processos electorals: vots per candidatura", url: "https://analisi.transparenciacatalunya.cat/d/ntc4-rnwr", publisher: "Generalitat de Catalunya — dades obertes" },
  { name: "Processos electorals: participació", url: "https://analisi.transparenciacatalunya.cat/d/irrv-2mfc", publisher: "Generalitat de Catalunya — dades obertes" },
  { name: "Historial d'alcaldes i alcaldesses", url: "https://analisi.transparenciacatalunya.cat/d/2v2p-vu4h", publisher: "Generalitat de Catalunya — dades obertes" },
  { name: "Ley Orgánica 5/1985, del Régimen Electoral General", url: "https://www.boe.es/buscar/act.php?id=BOE-A-1985-11672", publisher: "BOE" },
];

const META: Record<Locale, { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    path: "guies/resultats-eleccions-municipals-catalunya",
    title: "Resultats de les eleccions municipals a Catalunya, municipi a municipi",
    seoTitle: "Resultats eleccions municipals: el teu municipi des del 1979",
    seoDescription:
      "Tria qualsevol municipi de Catalunya i mira els regidors de cada llista a totes les municipals des del 1979. Barcelona 2023 i les pròximes, el 23 de maig del 2027.",
    excerpt:
      "Els resultats de les eleccions municipals de qualsevol municipi català des del 1979, amb dades obertes de la Generalitat, i què passa el 23 de maig del 2027.",
  },
  es: {
    path: "guias/resultados-elecciones-municipales-cataluna",
    title: "Resultados de las elecciones municipales en Cataluña, municipio a municipio",
    seoTitle: "Resultados elecciones municipales: tu municipio desde 1979",
    seoDescription:
      "Elige cualquier municipio de Cataluña y mira los concejales de cada lista en todas las municipales desde 1979. Barcelona 2023 y las próximas, el 23 de mayo de 2027.",
    excerpt:
      "Los resultados de las elecciones municipales de cualquier municipio catalán desde 1979, con datos abiertos de la Generalitat, y qué pasa el 23 de mayo de 2027.",
  },
  en: {
    path: "guides/local-election-results-catalonia",
    title: "Local election results in Catalonia, town by town",
    seoTitle: "Catalonia local election results: any town since 1979",
    seoDescription:
      "Pick any municipality in Catalonia and see councillors by list in every local election since 1979. Barcelona 2023, and the next vote on 23 May 2027.",
    excerpt:
      "Local election results for any Catalan municipality since 1979, from the Generalitat's open data, and what happens on 23 May 2027.",
  },
};

type T = {
  lead: string;
  note: string;
  bcnTitle: string;
  bcn: string[];
  nextTitle: string;
  next: string[];
  howTitle: string;
  how: string[];
  faq: { question: string; answer: string }[];
};

const COPY: Record<Locale, T> = {
  ca: {
    lead: "Aquí pots consultar els resultats de les **eleccions municipals de qualsevol municipi de Catalunya**, des del 1979 fins a les últimes, del 2023: regidors de cada llista, vots i participació. Les dades es llegeixen en directe de la Generalitat, i quan es publiquin les del **23 de maig del 2027** apareixeran aquí soles.",
    note: "Els percentatges es calculen a partir dels recomptes oficials. Comença amb Barcelona: escriu el nom d'un altre municipi per canviar-lo.",
    bcnTitle: "Barcelona, el 2023",
    bcn: [
      "Barcelona escull **41 regidors**. El 28 de maig del 2023, amb una participació del 60,59 %, la llista més votada va ser **Trias per Barcelona (11 regidors)**, per davant del PSC (10), Barcelona en Comú (9), ERC (5), el PP (4) i Vox (2).",
      "Tot i això, l'alcalde és **Jaume Collboni (PSC)**, que va prendre possessió el 17 de juny del 2023: l'alcaldia no la decideix qui guanya les eleccions, sinó la votació del ple municipal. A Girona va passar una cosa semblant: el PSC hi va treure més regidors, però l'alcalde és Lluc Salellas, de Guanyem Girona.",
    ],
    nextTitle: "Les pròximes municipals: 23 de maig del 2027",
    next: [
      "La llei electoral fixa les municipals el **quart diumenge de maig** cada quatre anys, així que les pròximes són el **diumenge 23 de maig del 2027**. El decret de convocatòria es publica al BOE unes setmanes abans. Les eleccions del 29 de novembre del 2026 són generals (Congrés i Senat), no municipals.",
      "Els ciutadans de la Unió Europea que viuen a Catalunya hi poden votar, però han de manifestar la voluntat de fer-ho a l'INE: per a aquestes eleccions, **fins al 30 de desembre del 2026**.",
    ],
    howTitle: "Com es reparteixen els regidors",
    how: [
      "Una llista necessita almenys el **5 % dels vots vàlids** del municipi per tenir regidors; els vots en blanc compten com a vàlids.",
      "Als municipis de **fins a 250 habitants** es vota amb **llistes obertes**: cada elector pot marcar fins a dos o quatre candidats, segons la mida del poble. Per això allà les dades sumen vots de candidats, i la taula només mostra els regidors.",
      "El nombre de regidors depèn de la població: Barcelona, amb més d'1,6 milions de residents, en té 41.",
    ],
    faq: [
      { question: "Qui va guanyar les eleccions municipals del 2023 a Barcelona?", answer: "La llista més votada va ser Trias per Barcelona, amb 11 dels 41 regidors. L'alcalde, però, és Jaume Collboni (PSC), escollit pel ple el 17 de juny del 2023." },
      { question: "Quan són les pròximes eleccions municipals?", answer: "El diumenge 23 de maig del 2027, el quart diumenge de maig, com fixa la llei electoral." },
      { question: "Quants regidors té Barcelona?", answer: "41, segons l'escala de la llei electoral aplicada a la seva població." },
      { question: "Poden votar els estrangers a les municipals?", answer: "Els ciutadans de la UE residents sí, si ho manifesten a l'INE; per al 2027, fins al 30 de desembre del 2026." },
    ],
  },
  es: {
    lead: "Aquí puedes consultar los resultados de las **elecciones municipales de cualquier municipio de Cataluña**, desde 1979 hasta las últimas, de 2023: concejales de cada lista, votos y participación. Los datos se leen en directo de la Generalitat, y cuando se publiquen los del **23 de mayo de 2027** aparecerán aquí solos.",
    note: "Los porcentajes se calculan a partir de los recuentos oficiales. Empieza con Barcelona: escribe el nombre de otro municipio para cambiarlo.",
    bcnTitle: "Barcelona, en 2023",
    bcn: [
      "Barcelona elige **41 concejales**. El 28 de mayo de 2023, con una participación del 60,59 %, la lista más votada fue **Trias per Barcelona (11 concejales)**, por delante del PSC (10), Barcelona en Comú (9), ERC (5), el PP (4) y Vox (2).",
      "Aun así, el alcalde es **Jaume Collboni (PSC)**, que tomó posesión el 17 de junio de 2023: la alcaldía no la decide quien gana las elecciones, sino la votación del pleno municipal. En Girona pasó algo parecido: el PSC sacó más concejales, pero el alcalde es Lluc Salellas, de Guanyem Girona.",
    ],
    nextTitle: "Las próximas municipales: 23 de mayo de 2027",
    next: [
      "La ley electoral fija las municipales el **cuarto domingo de mayo** cada cuatro años, así que las próximas son el **domingo 23 de mayo de 2027**. El decreto de convocatoria se publica en el BOE unas semanas antes. Las elecciones del 29 de noviembre de 2026 son generales (Congreso y Senado), no municipales.",
      "Los ciudadanos de la Unión Europea que viven en Cataluña pueden votar, pero deben manifestar su voluntad de hacerlo al INE: para estas elecciones, **hasta el 30 de diciembre de 2026**.",
    ],
    howTitle: "Cómo se reparten los concejales",
    how: [
      "Una lista necesita al menos el **5 % de los votos válidos** del municipio para tener concejales; los votos en blanco cuentan como válidos.",
      "En los municipios de **hasta 250 habitantes** se vota con **listas abiertas**: cada elector puede marcar hasta dos o cuatro candidatos, según el tamaño del pueblo. Por eso allí los datos suman votos de candidatos, y la tabla solo muestra los concejales.",
      "El número de concejales depende de la población: Barcelona, con más de 1,6 millones de residentes, tiene 41.",
    ],
    faq: [
      { question: "¿Quién ganó las elecciones municipales de 2023 en Barcelona?", answer: "La lista más votada fue Trias per Barcelona, con 11 de los 41 concejales. El alcalde, sin embargo, es Jaume Collboni (PSC), elegido por el pleno el 17 de junio de 2023." },
      { question: "¿Cuándo son las próximas elecciones municipales?", answer: "El domingo 23 de mayo de 2027, el cuarto domingo de mayo, como fija la ley electoral." },
      { question: "¿Cuántos concejales tiene Barcelona?", answer: "41, según la escala de la ley electoral aplicada a su población." },
      { question: "¿Pueden votar los extranjeros en las municipales?", answer: "Los ciudadanos de la UE residentes sí, si lo manifiestan al INE; para 2027, hasta el 30 de diciembre de 2026." },
    ],
  },
  en: {
    lead: "Look up the **local election results for any municipality in Catalonia**, from 1979 to the latest, in 2023: councillors by list, votes and turnout. The data are read live from the Generalitat, and when the results of **23 May 2027** are published they will appear here on their own.",
    note: "Percentages are computed from the official counts. It starts with Barcelona: type another municipality's name to switch.",
    bcnTitle: "Barcelona in 2023",
    bcn: [
      "Barcelona elects **41 councillors**. On 28 May 2023, with 60.59% turnout, the list with most votes was **Trias per Barcelona (11 councillors)**, ahead of the PSC (10), Barcelona en Comú (9), ERC (5), the PP (4) and Vox (2).",
      "Even so, the mayor is **Jaume Collboni (PSC)**, who took office on 17 June 2023: the mayor is not decided by who wins the election but by the vote in the city council. Girona saw something similar: the PSC won the most councillors there, but the mayor is Lluc Salellas, of Guanyem Girona.",
    ],
    nextTitle: "The next local elections: 23 May 2027",
    next: [
      "Spanish electoral law sets local elections on the **fourth Sunday of May** every four years, so the next ones are on **Sunday 23 May 2027**. The decree calling them is published in the BOE a few weeks before. The election of 29 November 2026 is a general election (Congress and Senate), not a local one.",
      "EU citizens living in Catalonia can vote, but they must tell the INE (the statistics office that keeps the electoral roll) that they want to: for these elections, **by 30 December 2026**.",
    ],
    howTitle: "How councillors are allocated",
    how: [
      "A list needs at least **5% of the valid votes** in the municipality to win councillors; blank votes count as valid.",
      "Municipalities of **up to 250 residents** use **open lists**: each voter can mark up to two or four candidates, depending on the size of the village. That is why the data there add up candidates' votes, and the table shows councillors only.",
      "The number of councillors depends on population: Barcelona, with over 1.6 million residents, has 41.",
    ],
    faq: [
      { question: "Who won the 2023 local election in Barcelona?", answer: "The list with most votes was Trias per Barcelona, with 11 of the 41 councillors. The mayor, however, is Jaume Collboni (PSC), elected by the council on 17 June 2023." },
      { question: "When are the next local elections in Catalonia?", answer: "Sunday 23 May 2027, the fourth Sunday of May, as Spanish electoral law sets." },
      { question: "How many councillors does Barcelona have?", answer: "41, under the electoral law's scale applied to its population." },
      { question: "Can foreigners vote in Spanish local elections?", answer: "Resident EU citizens can, if they register their wish with the INE; for 2027, by 30 December 2026." },
    ],
  },
};

function body(locale: Locale): Block[] {
  const t = COPY[locale];
  return [
    lead(t.lead),
    callout("official", verifiedLine(locale, VERIFIED), t.note),
    { type: "municipalElections" } as Block,
    ...h2(t.bcnTitle, ...t.bcn),
    ...h2(t.nextTitle, ...t.next),
    ...h2(t.howTitle),
    list(...t.how),
    faq(t.faq),
    ...b2Related(["voting", "mesa", "parliamentResults", "congressResults"], locale),
  ];
}

export const MUNICIPAL_RESULTS: B2Article = {
  key: "municipalResults",
  entryKey: "guide-municipal-election-results",
  categoryKey: "public-services",
  sources: SOURCES,
  heroKey: "municipals-ajuntament-barcelona-nit",
  heroAlt: {
    ca: "La façana de la Casa de la Ciutat de Barcelona il·luminada de nit, a la plaça de Sant Jaume",
    es: "La fachada de la Casa de la Ciutat de Barcelona iluminada de noche, en la plaza de Sant Jaume",
    en: "The façade of Barcelona City Hall lit up at night in Plaça de Sant Jaume",
  },
  heroCaption: {
    ca: "L'Ajuntament de Barcelona, a la plaça de Sant Jaume.",
    es: "El Ayuntamiento de Barcelona, en la plaza de Sant Jaume.",
    en: "Barcelona City Hall, in Plaça de Sant Jaume.",
  },
  secondaryKey: "municipals-salo-de-cent",
  secondaryAlt: {
    ca: "El Saló de Cent de l'Ajuntament de Barcelona, amb làmpades d'aranya i arcs de pedra",
    es: "El Saló de Cent del Ayuntamiento de Barcelona, con lámparas de araña y arcos de piedra",
    en: "The Saló de Cent in Barcelona City Hall, with chandeliers and stone arches",
  },
  secondaryCaption: {
    ca: "El Saló de Cent, a la Casa de la Ciutat.",
    es: "El Saló de Cent, en la Casa de la Ciutat.",
    en: "The Saló de Cent inside City Hall.",
  },
  verifiedAt: VERIFIED,
  publishedAt: "2026-10-14T12:00:00+02:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...META[locale], blocks: body(locale) }]),
  ) as B2Article["editions"],
};

export { META as MUNICIPAL_RESULTS_META };
