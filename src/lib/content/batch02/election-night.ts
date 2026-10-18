import type { Locale } from "@/lib/i18n/config";

import {
  b2Related,
  callout,
  faq,
  h2,
  lead,
  list,
  table,
  verifiedLine,
  type B2Article,
  type B2Source,
} from "./shared";

/**
 * Election night: how the provisional count works and when results are
 * official. Rules from the LOREG (BOE consolidated text), Interior's
 * Infoelectoral FAQ and the JEC 29N calendar, read 18 Oct 2026
 * (research_notes/blog-batch-03/election_night_29n.md).
 *
 * Deliberately no numbers: Interior has not announced its 29N results site,
 * and the only documented, licensed Interior data is the final count. On the
 * night this page gets one outbound link to the official site, copied from
 * Interior's own press note; no figures are ingested unless Interior
 * publishes a documented download with reuse terms. No polls, projections or
 * seat forecasts, ever (and LOREG art. 69.7 bans polls from 24 to 28 Nov).
 *
 * Not printed because no primary source states it: the 29N results-site
 * domain, turnout update times, the hour Interior starts publishing this
 * time, and the BOE publication date.
 */

const VERIFIED = "2026-10-18";

const SOURCES: B2Source[] = [
  { name: "Ley Orgánica 5/1985, del Régimen Electoral General (arts. 69, 88, 97, 98, 103 y 108)", url: "https://www.boe.es/buscar/act.php?id=BOE-A-1985-11672", publisher: "Boletín Oficial del Estado" },
  { name: "Preguntas frecuentes: resultados electorales", url: "https://infoelectoral.interior.gob.es/es/proceso-electoral/preguntas-frecuentes/resultados-electorales/", publisher: "Ministerio del Interior" },
  { name: "Preguntas frecuentes: escrutinio y final de la jornada electoral", url: "https://infoelectoral.interior.gob.es/es/proceso-electoral/preguntas-frecuentes/escrutinio-y-final-de-la-jornada-electoral/", publisher: "Ministerio del Interior" },
  { name: "Calendario electoral, elecciones generales 2026", url: "https://www.juntaelectoralcentral.es/cs/jec/documentos/eg2026_calendario.pdf", publisher: "Junta Electoral Central" },
  { name: "Guía básica para resolver dudas sobre las elecciones generales del 29 de noviembre", url: "https://www.lamoncloa.gob.es/serviciosdeprensa/notasprensa/interior/Paginas/guia-dudas-elecciones-generales-29n.aspx", publisher: "Ministerio del Interior" },
  { name: "Seguimiento de los resultados de las elecciones generales del 23J (nota de 20.7.2023)", url: "https://www.lamoncloa.gob.es/serviciosdeprensa/notasprensa/interior/Paginas/2023/200723-seguimiento-resultados-elecciones-generales-23j.aspx", publisher: "Ministerio del Interior" },
  { name: "Elecciones Generales 29-N", url: "https://infoelectoral.interior.gob.es/es/proceso-electoral/Elecciones-Generales-29-N/", publisher: "Ministerio del Interior" },
  { name: "Datos abiertos de resultados electorales", url: "https://infoelectoral.interior.gob.es/es/elecciones-celebradas/datos-abiertos/", publisher: "Ministerio del Interior" },
  { name: "Real Decreto 806/2026, de convocatoria de elecciones", url: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20742", publisher: "Boletín Oficial del Estado" },
];

const META: Record<Locale, { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    path: "guies/nit-electoral-resultats-escrutini",
    title: "Nit electoral: a quina hora surten els resultats i què vol dir l'escrutini provisional",
    seoTitle: "Resultats de la nit electoral: hora i escrutini",
    seoDescription:
      "A quina hora es comencen a saber els resultats de les eleccions generals del 29N, on seguir-los, què és l'escrutini provisional i quan són oficials.",
    excerpt:
      "Com funciona la nit electoral: quan tanquen els col·legis, d'on surten les xifres, per què no inclouen el vot de l'estranger i quan són oficials.",
  },
  es: {
    path: "guias/noche-electoral-resultados-escrutinio",
    title: "Noche electoral: a qué hora salen los resultados y qué significa el escrutinio provisional",
    seoTitle: "Resultados de la noche electoral: hora y escrutinio",
    seoDescription:
      "A qué hora se empiezan a conocer los resultados de las elecciones generales del 29N, dónde seguirlos, qué es el escrutinio provisional y cuándo son oficiales.",
    excerpt:
      "Cómo funciona la noche electoral: cuándo cierran los colegios, de dónde salen las cifras, por qué no incluyen el voto exterior y cuándo son oficiales.",
  },
  en: {
    path: "guides/spain-election-night-results",
    title: "Spain election night: when results come out and what the provisional count means",
    seoTitle: "Spain election results night: times and the count",
    seoDescription:
      "When results of Spain's 29 November general election start coming in, where to follow them, what the provisional count is and when results become official.",
    excerpt:
      "How election night works in Spain: when polls close, where the figures come from, why they leave out votes from abroad and when they become official.",
  },
};

type T = {
  lead: string;
  note: string;
  clockTitle: string;
  clockCaption: string;
  clockHeaders: string[];
  clockRows: string[][];
  clockNote: string;
  whereTitle: string;
  where: string[];
  countTitle: string;
  count: string[];
  readTitle: string;
  read: string[];
  finalTitle: string;
  final: string[];
  catTitle: string;
  cat: string[];
  pollsTitle: string;
  polls: string[];
  warnTitle: string;
  warn: string;
  faq: { question: string; answer: string }[];
};

const COPY: Record<Locale, T> = {
  ca: {
    lead: "Les eleccions generals són el **diumenge 29 de novembre de 2026**. Els col·legis tanquen a les **20.00** i les primeres xifres arriben quan s'han comptat les primeres meses. Aquestes xifres són l'**escrutini provisional** del Ministeri de l'Interior: serveixen per informar, però el resultat oficial arriba setmanes després, al BOE.",
    note: "Aquesta pàgina no publica sondejos, projeccions ni previsions d'escons. Quan Interior anunciï el seu web de resultats del 29N, hi afegirem l'enllaç oficial.",
    clockTitle: "El calendari de la nit i dels dies següents",
    clockCaption: "Què passa després de votar, eleccions generals del 29 de novembre de 2026",
    clockHeaders: ["Quan", "Què passa"],
    clockRows: [
      ["29 de novembre, 20.00", "Acaba la votació a la península, les Balears, Ceuta i Melilla. Cada mesa compta els vots i el president llegeix el resultat en veu alta."],
      ["29 de novembre, 21.00 (hora peninsular)", "Tanquen els col·legis de les Canàries. Al 2023, Interior va començar a publicar resultats a aquesta hora."],
      ["Nit del 29 al 30", "Interior suma les actes de les meses i publica l'escrutini provisional a mesura que arriben."],
      ["Del 4 al 7 de desembre", "Les juntes electorals provincials fan l'escrutini general, amb el vot de l'estranger (CERA)."],
      ["Dins de 40 dies", "La Junta Electoral Central publica els resultats oficials al BOE."],
    ],
    clockNote: "Fonts: LOREG, calendari de la Junta Electoral Central i Ministeri de l'Interior. Interior encara no ha anunciat l'hora d'inici per al 29N.",
    whereTitle: "On seguir els resultats oficials",
    where: [
      "Els dona el **Ministeri de l'Interior**, que en cada elecció obre un web de resultats propi i una aplicació. Per al 23J del 2023 ho va anunciar tres dies abans. Per al 29N encara no ho ha fet (consultat el 18 d'octubre del 2026).",
      "Fins aleshores, la referència és la pàgina del 29N a **Infoelectoral**, el portal electoral d'Interior. La Generalitat no publica un recompte propi de les eleccions generals: les seves dades obertes arriben més tard.",
    ],
    countTitle: "D'on surten les xifres",
    count: [
      "Quan tanca el col·legi, cada mesa compta les paperetes i n'aixeca una acta. Una còpia va a un representant de l'Administració, que la transmet al centre de totalització d'Interior. Interior va sumant les actes i aplicant-hi les fórmules de repartiment a mesura que arriben.",
      "La llei diu per què existeix aquest recompte: el Govern ha de donar **informació provisional** sobre els resultats. No és el resultat oficial.",
    ],
    readTitle: "Com llegir l'escrutini provisional",
    read: [
      "**Mira sempre el percentatge de meses escrutades.** Amb un 30 % comptat, les xifres encara poden canviar molt, perquè no totes les zones envien les actes al mateix ritme.",
      "**No inclou el vot dels residents a l'estranger (CERA).** Aquests vots es compten a l'escrutini general, uns dies després. Per això la participació de la nit i la final no coincideixen.",
      "**Els escons de la nit són provisionals.** Els pot canviar el vot CERA, i les juntes electorals poden corregir actes i resoldre reclamacions.",
    ],
    finalTitle: "Quan són oficials",
    final: [
      "Del 4 al 7 de desembre, les juntes electorals provincials fan l'escrutini general: revisen les actes, hi afegeixen el vot CERA i proclamen els electes. Després, la Junta Electoral Central publica el resum al BOE. Interior ho resumeix així: els resultats oficials són els que es publiquen al BOE.",
      "Les dades definitives, en format obert, les publica Interior a Infoelectoral (llicència CC BY 4.0). Quan hi siguin, les afegirem a la pàgina de resultats històrics de les eleccions generals a Catalunya.",
    ],
    catTitle: "Què s'elegeix a Catalunya",
    cat: [
      "Catalunya tria **48 diputats**: 32 per Barcelona, 6 per Girona, 4 per Lleida i 6 per Tarragona. També elegeix **16 senadors**, quatre per província.",
    ],
    pollsTitle: "Enquestes i jornada de reflexió",
    polls: [
      "Del **24 al 28 de novembre** és prohibit publicar, difondre o reproduir enquestes electorals per qualsevol mitjà. La campanya va del 13 al 27 de novembre, i el 28 és la jornada de reflexió.",
    ],
    warnTitle: "Compte amb els webs no oficials",
    warn: "Ja hi ha webs que anuncien «resultats en directe del 29N», i n'hi ha algun que mostra xifres del 2023 amb títols del 2026. Abans de creure't una xifra, comprova que surti d'Interior i que digui quin percentatge de meses s'ha escrutat.",
    faq: [
      { question: "A quina hora se saben els resultats de les eleccions del 29N?", answer: "La votació acaba a les 20.00 i a les Canàries a les 21.00 (hora peninsular). Al 2023, Interior va començar a publicar resultats a les 21.00. Per al 29N encara no ha anunciat l'hora." },
      { question: "L'escrutini de la nit és el resultat oficial?", answer: "No. És l'escrutini provisional que publica Interior. El resultat oficial surt de l'escrutini general de les juntes electorals (del 4 al 7 de desembre) i es publica al BOE." },
      { question: "S'inclou el vot dels catalans que viuen a l'estranger?", answer: "No a la nit electoral. El vot CERA es compta a l'escrutini general, uns dies després." },
      { question: "Es poden publicar enquestes la setmana de les eleccions?", answer: "No del 24 al 28 de novembre: la llei electoral prohibeix publicar-ne durant els cinc dies anteriors a la votació." },
    ],
  },
  es: {
    lead: "Las elecciones generales son el **domingo 29 de noviembre de 2026**. Los colegios cierran a las **20:00** y las primeras cifras llegan cuando se han contado las primeras mesas. Esas cifras son el **escrutinio provisional** del Ministerio del Interior: sirven para informar, pero el resultado oficial llega semanas después, en el BOE.",
    note: "Esta página no publica sondeos, proyecciones ni previsiones de escaños. Cuando Interior anuncie su web de resultados del 29N, añadiremos el enlace oficial.",
    clockTitle: "El calendario de la noche y de los días siguientes",
    clockCaption: "Qué pasa después de votar, elecciones generales del 29 de noviembre de 2026",
    clockHeaders: ["Cuándo", "Qué pasa"],
    clockRows: [
      ["29 de noviembre, 20:00", "Termina la votación en la península, Baleares, Ceuta y Melilla. Cada mesa cuenta los votos y el presidente lee el resultado en voz alta."],
      ["29 de noviembre, 21:00 (hora peninsular)", "Cierran los colegios de Canarias. En 2023, Interior empezó a publicar resultados a esa hora."],
      ["Noche del 29 al 30", "Interior suma las actas de las mesas y publica el escrutinio provisional a medida que llegan."],
      ["Del 4 al 7 de diciembre", "Las juntas electorales provinciales hacen el escrutinio general, con el voto exterior (CERA)."],
      ["En 40 días", "La Junta Electoral Central publica los resultados oficiales en el BOE."],
    ],
    clockNote: "Fuentes: LOREG, calendario de la Junta Electoral Central y Ministerio del Interior. Interior aún no ha anunciado la hora de inicio para el 29N.",
    whereTitle: "Dónde seguir los resultados oficiales",
    where: [
      "Los da el **Ministerio del Interior**, que en cada elección abre una web de resultados propia y una aplicación. Para el 23J de 2023 lo anunció tres días antes. Para el 29N todavía no lo ha hecho (consultado el 18 de octubre de 2026).",
      "Hasta entonces, la referencia es la página del 29N en **Infoelectoral**, el portal electoral de Interior. La Generalitat no publica un recuento propio de las elecciones generales: sus datos abiertos llegan más tarde.",
    ],
    countTitle: "De dónde salen las cifras",
    count: [
      "Al cerrar el colegio, cada mesa cuenta las papeletas y levanta un acta. Una copia va a un representante de la Administración, que la transmite al centro de totalización de Interior. Interior va sumando las actas y aplicando las fórmulas de reparto a medida que llegan.",
      "La ley dice por qué existe este recuento: el Gobierno debe dar **información provisional** sobre los resultados. No es el resultado oficial.",
    ],
    readTitle: "Cómo leer el escrutinio provisional",
    read: [
      "**Mira siempre el porcentaje de mesas escrutadas.** Con un 30 % contado, las cifras todavía pueden cambiar mucho, porque no todas las zonas envían las actas al mismo ritmo.",
      "**No incluye el voto de los residentes en el extranjero (CERA).** Esos votos se cuentan en el escrutinio general, unos días después. Por eso la participación de la noche y la final no coinciden.",
      "**Los escaños de la noche son provisionales.** Los puede cambiar el voto CERA, y las juntas electorales pueden corregir actas y resolver reclamaciones.",
    ],
    finalTitle: "Cuándo son oficiales",
    final: [
      "Del 4 al 7 de diciembre, las juntas electorales provinciales hacen el escrutinio general: revisan las actas, añaden el voto CERA y proclaman a los electos. Después, la Junta Electoral Central publica el resumen en el BOE. Interior lo resume así: los resultados oficiales son los que se publican en el BOE.",
      "Los datos definitivos, en formato abierto, los publica Interior en Infoelectoral (licencia CC BY 4.0). Cuando estén, los añadiremos a la página de resultados históricos de las elecciones generales en Cataluña.",
    ],
    catTitle: "Qué se elige en Cataluña",
    cat: [
      "Cataluña elige **48 diputados**: 32 por Barcelona, 6 por Girona, 4 por Lleida y 6 por Tarragona. También elige **16 senadores**, cuatro por provincia.",
    ],
    pollsTitle: "Encuestas y jornada de reflexión",
    polls: [
      "Del **24 al 28 de noviembre** está prohibido publicar, difundir o reproducir sondeos electorales por cualquier medio. La campaña va del 13 al 27 de noviembre, y el 28 es la jornada de reflexión.",
    ],
    warnTitle: "Cuidado con las webs no oficiales",
    warn: "Ya hay webs que anuncian «resultados en directo del 29N», y alguna muestra cifras de 2023 con títulos de 2026. Antes de creerte una cifra, comprueba que salga de Interior y que diga qué porcentaje de mesas se ha escrutado.",
    faq: [
      { question: "¿A qué hora se saben los resultados de las elecciones del 29N?", answer: "La votación termina a las 20:00 y en Canarias a las 21:00 (hora peninsular). En 2023, Interior empezó a publicar resultados a las 21:00. Para el 29N aún no ha anunciado la hora." },
      { question: "¿El escrutinio de la noche es el resultado oficial?", answer: "No. Es el escrutinio provisional que publica Interior. El resultado oficial sale del escrutinio general de las juntas electorales (del 4 al 7 de diciembre) y se publica en el BOE." },
      { question: "¿Se incluye el voto de los españoles que viven en el extranjero?", answer: "No en la noche electoral. El voto CERA se cuenta en el escrutinio general, unos días después." },
      { question: "¿Se pueden publicar encuestas la semana de las elecciones?", answer: "No del 24 al 28 de noviembre: la ley electoral prohíbe publicarlas durante los cinco días anteriores a la votación." },
    ],
  },
  en: {
    lead: "Spain's general election is on **Sunday 29 November 2026**. Polling stations close at **20:00** and the first figures arrive once the first polling tables have been counted. Those figures are the Ministry of the Interior's **provisional count**: they are for information, and the official result comes weeks later, in the official gazette (BOE).",
    note: "This page publishes no polls, projections or seat forecasts. When the Interior Ministry announces its 29 November results site, we will add the official link here.",
    clockTitle: "The timeline on the night and after",
    clockCaption: "What happens after the vote, general election of 29 November 2026",
    clockHeaders: ["When", "What happens"],
    clockRows: [
      ["29 November, 20:00", "Voting ends on the mainland, the Balearic Islands, Ceuta and Melilla. Each polling table counts its votes and the presiding officer reads the result aloud."],
      ["29 November, 21:00 (mainland time)", "Polls close in the Canary Islands. In 2023 the Interior Ministry started publishing results at this time."],
      ["Night of 29 to 30 November", "The ministry adds up the polling-table returns and publishes the provisional count as they arrive."],
      ["4 to 7 December", "The provincial electoral boards carry out the general count, including votes from abroad (CERA)."],
      ["Within 40 days", "The Central Electoral Board publishes the official results in the BOE."],
    ],
    clockNote: "Sources: the electoral law (LOREG), the Central Electoral Board calendar and the Interior Ministry. The ministry has not yet announced a start time for 29 November.",
    whereTitle: "Where to follow the official results",
    where: [
      "They come from the **Spanish Ministry of the Interior**, which opens its own results website and app for each election. For the July 2023 election it announced them three days before. For 29 November it has not done so yet (checked on 18 October 2026).",
      "Until then, the reference is the 29-N page on **Infoelectoral**, the ministry's election portal. The Catalan government does not publish its own count for general elections; its open data comes later.",
    ],
    countTitle: "Where the figures come from",
    count: [
      "When the polling station closes, each polling table counts the ballots and draws up a return. A copy goes to a government representative, who sends it to the ministry's tallying centre. The ministry adds up the returns and applies the seat formulas as they arrive.",
      "The law says why this count exists: the government must give **provisional information** on the results. It is not the official result.",
    ],
    readTitle: "How to read the provisional count",
    read: [
      "**Always check the share of polling tables counted.** With 30 % counted, the figures can still change a lot, because not every area sends its returns at the same pace.",
      "**It leaves out votes from Spaniards living abroad (CERA).** Those are counted in the general count a few days later, which is why turnout on the night and final turnout differ.",
      "**Seats on the night are provisional.** CERA votes can change them, and the electoral boards can correct returns and settle complaints.",
    ],
    finalTitle: "When results become official",
    final: [
      "From 4 to 7 December the provincial electoral boards carry out the general count: they check the returns, add the CERA votes and declare who is elected. The Central Electoral Board then publishes the summary in the BOE. As the ministry puts it, the official results are the ones published in the BOE.",
      "The final data, as open data, is published by the ministry on Infoelectoral (CC BY 4.0 licence). Once it is there, we will add it to our page of past general election results in Catalonia.",
    ],
    catTitle: "What Catalonia elects",
    cat: [
      "Catalonia elects **48 members of Congress**: 32 for Barcelona, 6 for Girona, 4 for Lleida and 6 for Tarragona. It also elects **16 senators**, four per province.",
    ],
    pollsTitle: "Polls and the day of reflection",
    polls: [
      "From **24 to 28 November** it is illegal to publish, broadcast or reproduce election polls in any medium. The campaign runs from 13 to 27 November, and 28 November is the day of reflection.",
    ],
    warnTitle: "Beware of unofficial sites",
    warn: "Some sites already advertise “29N live results”, and at least one shows 2023 figures under 2026 headings. Before trusting a figure, check that it comes from the Interior Ministry and that it states the share of polling tables counted.",
    faq: [
      { question: "What time are Spain's election results known on 29 November?", answer: "Voting ends at 20:00, and at 21:00 mainland time in the Canary Islands. In 2023 the Interior Ministry started publishing results at 21:00. It has not announced the time for 29 November yet." },
      { question: "Is the election-night count the official result?", answer: "No. It is the ministry's provisional count. The official result comes from the electoral boards' general count (4 to 7 December) and is published in the BOE." },
      { question: "Does it include votes from Spaniards living abroad?", answer: "Not on election night. CERA votes are counted in the general count a few days later." },
      { question: "Can polls be published in the week of the election?", answer: "Not from 24 to 28 November: the electoral law bans publishing them in the five days before the vote." },
    ],
  },
};

function body(locale: Locale) {
  const t = COPY[locale];
  return [
    lead(t.lead),
    callout("official", verifiedLine(locale, VERIFIED), t.note),
    ...h2(t.clockTitle),
    table(t.clockCaption, t.clockHeaders, t.clockRows, t.clockNote),
    ...h2(t.whereTitle, ...t.where),
    ...h2(t.countTitle, ...t.count),
    ...h2(t.readTitle),
    list(...t.read),
    ...h2(t.finalTitle, ...t.final),
    ...h2(t.catTitle, ...t.cat),
    ...h2(t.pollsTitle, ...t.polls),
    callout("warning", t.warnTitle, t.warn),
    faq(t.faq),
    ...b2Related(["voting", "congressResults", "mesa", "parliamentResults"], locale),
  ];
}

export const ELECTION_NIGHT: B2Article = {
  key: "electionNight",
  entryKey: "guide-election-night-results-spain",
  categoryKey: "public-services",
  sources: SOURCES,
  heroKey: "nit-electoral-recompte-riudoms",
  heroAlt: {
    ca: "Un grup de persones comptant vots al voltant d'una taula, amb el cartell de la mesa electoral",
    es: "Un grupo de personas contando votos alrededor de una mesa, con el cartel de la mesa electoral",
    en: "People counting votes around a table under a polling-table sign",
  },
  heroCaption: {
    ca: "Recompte en una mesa de Riudoms a les municipals del 2023.",
    es: "Recuento en una mesa de Riudoms en las municipales de 2023.",
    en: "Counting votes at a polling table in Riudoms, 2023 local elections.",
  },
  secondaryKey: "nit-electoral-recompte-2021",
  secondaryAlt: {
    ca: "Tres persones amb equips de protecció ordenant paperetes sobre unes taules",
    es: "Tres personas con equipos de protección ordenando papeletas sobre unas mesas",
    en: "Three people in protective suits sorting ballot papers on tables",
  },
  secondaryCaption: {
    ca: "Recompte a les eleccions al Parlament del 2021, amb mesures contra la covid.",
    es: "Recuento en las elecciones al Parlament de 2021, con medidas contra la covid.",
    en: "Counting at the 2021 Catalan election, under covid precautions.",
  },
  verifiedAt: VERIFIED,
  publishedAt: "2026-10-19T13:00:00+02:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...META[locale], blocks: body(locale) }]),
  ) as B2Article["editions"],
};

export { META as ELECTION_NIGHT_META };
