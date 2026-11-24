import type { Locale } from "@/lib/i18n/config";
import { hubPath, PAGES_PER_LOCALE } from "@/lib/programmatic/elections/paths";
import { pollsPath } from "@/lib/programmatic/polls/paths";
import { ELECTION_NIGHT_RESULTS_SOURCE, ELECTION_NIGHT_RESULTS_URL, RESULTS_SITE_CHECKED, checkedDay } from "@/lib/programmatic/elections/results-night";

import {
  b2link,
  b2Related,
  callout,
  faq,
  h2,
  languageLinks,
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
 *
 * 30 Oct 2026: 29neleccionesgenerales.es (home and "voto presencial") and
 * Interior's 29-N page re-read: still no results site or start time; voting
 * 9:00 to 20:00 (anyone inside at 20:00 may still vote). JEC calendar
 * re-read (count 4-7 Dec, polls ban 24-28 Nov, BOE within 40 days).
 *
 * 3 Nov 2026 (titles/descriptions in the owner's "right now" push, logged
 * in docs/SEO_EXPERIMENTS.md): still no 29N results site. Re-read that day:
 * 29neleccionesgenerales.es (home: no results page or link), Interior's
 * guide note of 20 Oct as updated on 3 Nov (no results site, start time or
 * app), the JEC 29N calendar PDF (general count 4-7 Dec) and the JEC session
 * lists of 26 and 29 Oct (nothing on results). No link added.
 *
 * 11 Nov 2026 (titles and descriptions in all three editions, logged in
 * docs/SEO_EXPERIMENTS.md, "11 Nov 2026 — 29N election guides"): titles in
 * the words of "when do election results come out" / "a qué hora salen los
 * resultados" (GSC 29 Oct-11 Nov: "election results" 590 at 9.4, "2026 spain
 * general election results" 149 at 5.9, "cuando salen los resultados de las
 * elecciones" 40 at 7.0). Still no 29N results site: the official site's
 * home (29neleccionesgenerales.es) and its "voto presencial" page, re-read on
 * 11 Nov, have no results page or link (Infoelectoral answered 403 to
 * scripts that day); the JEC session list has nothing after 5 Nov. The
 * "checked on" dates move to 11 Nov; a link to the official polls page sits
 * in the polls section; the postal-vote guide joins the rail (the candidates
 * guide stays linked once, in the body, as its test wants).
 *
 * 13 Nov 2026 (body only; titles frozen to 30 Nov by the 11 Nov entry,
 * logged in docs/SEO_EXPERIMENTS.md, "13 Nov 2026 — 29N results night"):
 * the results site comes from ONE switch, ELECTION_NIGHT_RESULTS_URL in
 * src/lib/programmatic/elections/results-night.ts, shared with the town
 * pages, the hubs and the results guide. While it is null the copy reads as
 * before, re-dated: 29neleccionesgenerales.es re-read on 13 Nov (home page:
 * no results page or link; Infoelectoral answered 403 to scripts). Once it
 * is set, the status sentences, the EN lead and FAQ and the note carry the
 * official link, and the site and the note announcing it join the sources.
 *
 * 24 Oct 2026: JEC calendar re-read (general count 4-7 Dec; BOE publication
 * within 40 days of the proclamation of the elected). Interior's note of
 * 20 Oct names 29neleccionesgenerales.es as the official election website;
 * it says nothing about results, so the page says exactly that.
 *
 * 21 Nov 2026 (body only; titles, descriptions and leads inside the 11 Nov
 * window, logged in docs/SEO_EXPERIMENTS.md, "21 Nov 2026 — 29N election-week
 * questions"). Election-week questions no page answered: blank vs null vote,
 * the 3 % threshold, D'Hondt, how senators are elected, seats per province
 * from the decree. Read that day on the BOE (open-data API, consolidated
 * LOREG; research_notes/el-week-29n-2026-11-21.md):
 *  - art. 96.1-96.3 (null: "sobre o papeleta diferente del modelo oficial",
 *    "papeleta sin sobre", "más de una papeleta de distinta candidatura";
 *    Congress names "modificado, añadido, señalado o tachado"; Senate "más de
 *    tres nombres"), 96.5 ("Se considera voto en blanco, pero válido, el sobre
 *    que no contenga papeleta y, además, en las elecciones para el Senado, las
 *    papeletas que no contengan indicación a favor de ninguno de los
 *    candidatos"), 97.2 (null and blank counted apart), 103.1 ("el quinto día
 *    siguiente al de la votación"), 163.1 (the 3 % "de los votos válidos
 *    emitidos en la circunscripción", divisors 1, 2, 3..., ties to the most
 *    votes, list order) and its own worked example (480.000 votes, 8 seats,
 *    A 4, B 2, C 1, D 1), 166.1 (up to three Senate names; the most voted are
 *    elected);
 *  - RD 806/2026 art. 3.2 ("en cada circunscripción provincial se eligen
 *    cuatro Senadores") and annex (Barcelona "Treinta y dos", Girona "Seis",
 *    Lleida "Cuatro", Tarragona "Seis").
 * The only D'Hondt figures printed are the law's own example: no real result,
 * no poll, no projection. 29neleccionesgenerales.es home re-read 21 Nov: still
 * no results page or link (Infoelectoral 403 from here). VERIFIED stays 3 Nov:
 * the rest of the page was not re-read.
 */

const VERIFIED = "2026-11-03";

/** LOREG on the BOE (consolidated text) and the article anchors the 21 Nov sections cite. */
const LOREG_URL = "https://www.boe.es/buscar/act.php?id=BOE-A-1985-11672";
const LOREG_ART = {
  null: `${LOREG_URL}#anoventayseis`,
  general: `${LOREG_URL}#acientotres`,
  seats: `${LOREG_URL}#acientosesentaytres`,
  senate: `${LOREG_URL}#acientosesentayseis`,
} as const;
const RD_806 = "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20742";

/** The official results site, from the shared switch (null until Interior announces it). */
const SITE = ELECTION_NIGHT_RESULTS_URL;

const BASE_SOURCES: B2Source[] = [
  { name: "Ley Orgánica 5/1985, del Régimen Electoral General (arts. 69, 88, 96, 97, 98, 103, 108, 163 y 166: voto en blanco y nulo, mínimo del 3 %, D'Hondt y Senado; consultada el 21 de noviembre de 2026)", url: LOREG_URL, publisher: "Boletín Oficial del Estado" },
  { name: "Preguntas frecuentes: resultados electorales", url: "https://infoelectoral.interior.gob.es/es/proceso-electoral/preguntas-frecuentes/resultados-electorales/", publisher: "Ministerio del Interior" },
  { name: "Preguntas frecuentes: escrutinio y final de la jornada electoral", url: "https://infoelectoral.interior.gob.es/es/proceso-electoral/preguntas-frecuentes/escrutinio-y-final-de-la-jornada-electoral/", publisher: "Ministerio del Interior" },
  { name: "Calendario electoral, elecciones generales 2026", url: "https://www.juntaelectoralcentral.es/cs/jec/documentos/eg2026_calendario.pdf", publisher: "Junta Electoral Central" },
  { name: "29N: guía básica sobre las elecciones generales y el proceso electoral (20.10.2026)", url: "https://www.lamoncloa.gob.es/serviciosdeprensa/notasprensa/interior/Paginas/guia-dudas-elecciones-generales-29n.aspx", publisher: "Ministerio del Interior" },
  { name: "Seguimiento de los resultados de las elecciones generales del 23J (nota de 20.7.2023)", url: "https://www.lamoncloa.gob.es/serviciosdeprensa/notasprensa/interior/Paginas/2023/200723-seguimiento-resultados-elecciones-generales-23j.aspx", publisher: "Ministerio del Interior" },
  { name: "Elecciones Generales 29-N", url: "https://infoelectoral.interior.gob.es/es/proceso-electoral/Elecciones-Generales-29-N/", publisher: "Ministerio del Interior" },
  { name: "Datos abiertos de resultados electorales", url: "https://infoelectoral.interior.gob.es/es/elecciones-celebradas/datos-abiertos/", publisher: "Ministerio del Interior" },
  { name: "Voting in person: polling hours, 9:00 to 20:00 (29neleccionesgenerales.es)", url: "https://29neleccionesgenerales.es/en/informacion-general/como-votar/voto-presencial", publisher: "Ministerio del Interior" },
  { name: "Elecciones a las Cortes Generales 2026, web oficial (portada consultada el " + checkedDay("es", RESULTS_SITE_CHECKED) + ": todavía sin página ni enlace de resultados)", url: "https://29neleccionesgenerales.es/", publisher: "Ministerio del Interior" },
  { name: "Real Decreto 806/2026, de convocatoria de elecciones (artículo 3 y anexo: diputados y senadores de cada provincia)", url: RD_806, publisher: "Boletín Oficial del Estado" },
];

/** Once the switch is set: the results site and the official note that names it. */
const SOURCES: B2Source[] = [
  ...BASE_SOURCES,
  ...(SITE ? [{ name: "Resultados provisionales de las elecciones generales del 29 de noviembre de 2026 (web oficial)", url: SITE, publisher: "Ministerio del Interior" }] : []),
  ...(SITE && ELECTION_NIGHT_RESULTS_SOURCE ? [{ name: "Anuncio de la web de resultados del 29N", url: ELECTION_NIGHT_RESULTS_SOURCE, publisher: "Ministerio del Interior" }] : []),
];

const META: Record<Locale, { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    path: "guies/nit-electoral-resultats-escrutini",
    title: "Resultats de les eleccions del 29 de novembre: a quina hora surten i com és l'escrutini",
    seoTitle: "Resultats eleccions 29 de novembre: a quina hora surten",
    seoDescription:
      "Votació fins a les 20.00 (Canàries, 21.00 peninsular); l'escrutini provisional surt aquella nit, el 2023 des de les 21.00. Escrutini general: 4-7 de desembre.",
    excerpt:
      "Com funciona la nit electoral: quan tanquen els col·legis, d'on surten les xifres, per què no inclouen el vot de l'estranger i quan són oficials.",
  },
  es: {
    path: "guias/noche-electoral-resultados-escrutinio",
    title: "Resultados de las elecciones del 29 de noviembre: a qué hora salen y cómo es el escrutinio",
    seoTitle: "Resultados elecciones 29 de noviembre: a qué hora salen",
    seoDescription:
      "Votación hasta las 20:00 (Canarias, 21:00 peninsular); el escrutinio provisional sale esa noche, en 2023 desde las 21:00. Escrutinio general: 4-7 de diciembre.",
    excerpt:
      "Cómo funciona la noche electoral: cuándo cierran los colegios, de dónde salen las cifras, por qué no incluyen el voto exterior y cuándo son oficiales.",
  },
  en: {
    path: "guides/spain-election-night-results",
    title: "Spain election results, 29 November 2026: when they come out and how the count works",
    seoTitle: "Spain general election results 2026: when they come out",
    seoDescription:
      "Polls 9:00-20:00 on Sun 29 Nov (Canaries 21:00 mainland time); the provisional count follows that night, from 21:00 in 2023. Official count: 4-7 Dec.",
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
  /** 21 Nov 2026: seats per province from RD 806/2026, then blank/null, D'Hondt and the Senate (LOREG). */
  catCaption: string;
  catHeaders: string[];
  catRows: string[][];
  catNote: string;
  blankTitle: string;
  blank: string[];
  blankCaption: string;
  blankHeaders: string[];
  blankRows: string[][];
  blankNote: string;
  dhondtTitle: string;
  dhondt: string;
  dhondtSteps: string[];
  dhondtCaption: string;
  dhondtHeaders: string[];
  dhondtRows: string[][];
  dhondtNote: string;
  senateTitle: string;
  senate: string;
  pollsTitle: string;
  polls: string[];
  warnTitle: string;
  warn: string;
  faq: { question: string; answer: string }[];
};

const COPY: Record<Locale, T> = {
  ca: {
    lead: "Els resultats de les eleccions generals del **diumenge 29 de novembre de 2026** es comencen a conèixer quan tanquen els col·legis, a les **20.00**, i a mesura que es compten les meses. Aquestes primeres xifres són l'**escrutini provisional** del Ministeri de l'Interior: serveixen per informar, però el resultat oficial arriba setmanes després, al BOE.",
    note: `Aquesta pàgina no publica sondejos, projeccions ni previsions d'escons. ${SITE ? `Resultats de la nit: [web oficial del Ministeri de l'Interior](${SITE}).` : "Quan Interior anunciï el seu web de resultats del 29N, hi afegirem l'enllaç oficial."}`,
    clockTitle: "El calendari de la nit i dels dies següents",
    clockCaption: "Què passa després de votar, eleccions generals del 29 de novembre de 2026",
    clockHeaders: ["Quan", "Què passa"],
    clockRows: [
      ["29 de novembre, 9.00", "Comença la votació. Els col·legis obren abans perquè la mesa es constitueixi, però es vota a partir de les 9.00."],
      ["29 de novembre, 20.00", "Acaba la votació a la península, les Balears, Ceuta i Melilla. Cada mesa compta els vots i el president llegeix el resultat en veu alta."],
      ["29 de novembre, 21.00 (hora peninsular)", "Tanquen els col·legis de les Canàries. Al 2023, Interior va començar a publicar resultats a aquesta hora."],
      ["Nit del 29 al 30", "Interior suma les actes de les meses i publica l'escrutini provisional a mesura que arriben."],
      ["Del 4 al 7 de desembre", "Les juntes electorals provincials fan l'escrutini general, amb el vot de l'estranger (CERA)."],
      ["Del 8 al 16 de desembre", "Proclamació d'electes."],
      ["Dins dels 40 dies següents a la proclamació d'electes", "La Junta Electoral Central publica els resultats oficials al BOE."],
    ],
    clockNote: "Fonts: LOREG, calendari de la Junta Electoral Central i Ministeri de l'Interior. Interior encara no ha anunciat l'hora d'inici per al 29N.",
    whereTitle: "On veure els resultats de les eleccions generals del 29N",
    where: [
      `Els dona el **Ministeri de l'Interior**, que en cada elecció obre un web de resultats propi i una aplicació. Per al 23J del 2023 ho va anunciar tres dies abans. ${SITE ? `Per al 29N, el web oficial de resultats és [aquest](${SITE}).` : "Per al 29N encara no ho ha fet (consultat el " + checkedDay("ca", RESULTS_SITE_CHECKED) + ")."}`,
      "El 20 d'octubre, Interior va presentar **29neleccionesgenerales.es** com el web oficial d'aquestes eleccions, però no ha dit si hi publicarà els resultats. Fins que ho anunciï, la referència és aquest web i la pàgina del 29N a **Infoelectoral**, el portal electoral d'Interior. La Generalitat no publica un recompte propi de les eleccions generals: les seves dades obertes arriben més tard.",
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
      `La llei fixa l'escrutini general «el quinto día siguiente al de la votación» ([LOREG, article 103](${LOREG_ART.general})): el divendres 4 de desembre. Del 4 al 7 de desembre, les juntes electorals provincials fan l'escrutini general: revisen les actes i hi afegeixen el vot CERA. Després resolen les reclamacions i proclamen els electes, entre el 8 i el 16 de desembre segons el calendari oficial. La Junta Electoral Central publica els resultats al BOE en els 40 dies següents. Interior ho resumeix així: els resultats oficials són els que es publiquen al BOE.`,
      "Les dades definitives, en format obert, les publica Interior a Infoelectoral (llicència CC BY 4.0). Quan hi siguin, les afegirem a la pàgina de resultats històrics de les eleccions generals a Catalunya.",
      `Per als ${PAGES_PER_LOCALE.ca} municipis de Catalunya, els resultats del 29N també s'afegiran a les [pàgines de resultats electorals per municipi](${hubPath("ca")}), al costat de les municipals del 2023.`,
    ],
    catTitle: "Què s'elegeix a Catalunya",
    cat: [
      `Catalunya tria **48 diputats**: 32 per Barcelona, 6 per Girona, 4 per Lleida i 6 per Tarragona. També elegeix **16 senadors**, quatre per província. Ho fixa el decret de convocatòria: el nombre de diputats de cada circumscripció és al seu annex, i «en cada circunscripción provincial se eligen cuatro Senadores» ([Reial decret 806/2026, article 3](${RD_806})).`,
      `Qui es presenta a cada província: ${b2link("candidates", "ca", "les llistes de candidats del 29N a Catalunya")}.`,
    ],
    catCaption: "Escons que elegeix cada província catalana el 29 de novembre",
    catHeaders: ["Província", "Diputats (Congrés)", "Senadors"],
    catRows: [
      ["Barcelona", "32", "4"],
      ["Girona", "6", "4"],
      ["Lleida", "4", "4"],
      ["Tarragona", "6", "4"],
      ["**Catalunya**", "**48** de 350", "**16**"],
    ],
    catNote: "Font: Reial decret 806/2026, article 3 i annex (BOE del 6 d'octubre del 2026). Els altres senadors que representen Catalunya els designa el Parlament i no es voten el 29N.",
    blankTitle: "Vot en blanc i vot nul: diferències i com compta cadascun",
    blank: [
      `La llei ho diu així: «Se considera voto en blanco, pero válido, el sobre que no contenga papeleta y, además, en las elecciones para el Senado, las papeletas que no contengan indicación a favor de ninguno de los candidatos» ([LOREG, article 96](${LOREG_ART.null})). Com que és un vot vàlid, el vot en blanc entra al total de vots vàlids de la província, que és la base del mínim del 3 %: cada vot en blanc fa pujar una mica els vots que necessita una candidatura per entrar al repartiment. No dona cap escó.`,
      "El vot nul no és vàlid i no compta per al repartiment: només surt a l'acta com a papereta nul·la. És nul el vot en un sobre o una papereta que no són el model oficial, la papereta sense sobre i el sobre amb paperetes de candidatures diferents; al Congrés, també la papereta amb noms ratllats, afegits o marcats o amb l'ordre canviat, i al Senat, la que té més de tres creus. Dues paperetes de la mateixa candidatura en un sobre compten com un sol vot vàlid.",
    ],
    blankCaption: "Vot en blanc i vot nul, segons la llei electoral",
    blankHeaders: ["", "Vot en blanc", "Vot nul"],
    blankRows: [
      ["Què és", "El sobre sense papereta; al Senat, també la papereta sense cap creu", "Sobre o papereta que no són l'oficial, papereta sense sobre, paperetes de candidatures diferents, papereta del Congrés modificada o del Senat amb més de tres creus"],
      ["És un vot vàlid?", "**Sí**", "**No**"],
      ["Compta per al mínim del 3 %?", "**Sí**: entra al total de vots vàlids", "**No**"],
      ["Dona escons?", "No", "No"],
      ["Compta com a votant?", "Sí", "Sí: la mesa el compta a part"],
    ],
    blankNote: "Font: LOREG, articles 96, 97.2 i 163.1 (text consolidat al BOE, consultat el 21 de novembre del 2026).",
    dhondtTitle: "Com es reparteixen els escons: la llei d'Hondt i el mínim del 3 %",
    dhondt: `Al Congrés, cada província reparteix els seus escons per separat, amb les regles de l'[article 163 de la LOREG](${LOREG_ART.seats}). La nit electoral, Interior ja les aplica a l'escrutini provisional; els escons definitius surten de l'escrutini general.`,
    dhondtSteps: [
      "**1. Fora qui no arriba al 3 %:** «No se tienen en cuenta aquellas candidaturas que no hubieran obtenido, al menos, el 3 por 100 de los votos válidos emitidos en la circunscripción».",
      "**2. Divisions:** els vots de cada candidatura que queda es divideixen per 1, 2, 3… fins al nombre d'escons de la província (32 a Barcelona).",
      "**3. Els cocients més alts s'emporten els escons**, de més gran a més petit. Si dos cocients empaten, l'escó és de la candidatura amb més vots en total.",
      "**4. Dins de cada llista**, els escons van als candidats per l'ordre en què surten a la papereta.",
    ],
    dhondtCaption: "L'exemple de la mateixa llei: 480.000 vots vàlids i 8 escons",
    dhondtHeaders: ["Candidatura", "Vots (÷1)", "÷2", "÷3", "÷4", "Escons"],
    dhondtRows: [
      ["A", "**168.000**", "**84.000**", "**56.000**", "**42.000**", "4"],
      ["B", "**104.000**", "**52.000**", "34.666", "26.000", "2"],
      ["C", "**72.000**", "36.000", "24.000", "18.000", "1"],
      ["D", "**64.000**", "32.000", "21.333", "16.000", "1"],
      ["E", "40.000", "20.000", "13.333", "10.000", "0"],
      ["F", "32.000", "16.000", "10.666", "8.000", "0"],
    ],
    dhondtNote: "LOREG, article 163.1.c. En negreta, els vuit cocients més alts, que s'emporten els vuit escons. La llei divideix fins a ÷8, però a partir de ÷4 cap cocient no entra entre els vuit primers. E i F superen el 3 % i no treuen cap escó.",
    senateTitle: "Com s'elegeixen els senadors: els quatre més votats de cada província",
    senate: `Al Senat no hi ha llei d'Hondt ni mínim del 3 %: cada elector marca fins a tres candidats de la seva província, i «serán proclamados electos aquellos candidatos que obtengan mayor número de votos hasta complementar el de Senadores asignados a la circunscripción» ([LOREG, article 166](${LOREG_ART.senate})). A cada província catalana en surten quatre. Una papereta del Senat sense cap creu és vot en blanc; amb més de tres, és nul·la. Els noms de cada província són a les llistes de candidats enllaçades més amunt.`,
    pollsTitle: "Enquestes i jornada de reflexió",
    polls: [
      "Del **24 al 28 de novembre** és prohibit publicar, difondre o reproduir enquestes electorals per qualsevol mitjà. La campanya va del 13 al 27 de novembre, i el 28 és la jornada de reflexió.",
      `Les estimacions dels dos organismes públics que fan enquestes, el CIS i el CEO, publicades abans de la veda i amb la fitxa tècnica de cada estudi, són a [enquestes oficials del 29N a Catalunya](${pollsPath("ca")}).`,
    ],
    warnTitle: "Compte amb els webs no oficials",
    warn: "Ja hi ha webs que anuncien «resultats en directe del 29N», i n'hi ha algun que mostra xifres del 2023 amb títols del 2026. Abans de creure't una xifra, comprova que surti d'Interior i que digui quin percentatge de meses s'ha escrutat.",
    faq: [
      { question: "A quina hora se saben els resultats de les eleccions del 29N?", answer: "La votació acaba a les 20.00 i a les Canàries a les 21.00 (hora peninsular). Al 2023, Interior va començar a publicar resultats a les 21.00. Per al 29N encara no ha anunciat l'hora." },
      { question: "On es poden veure els resultats de les eleccions generals del 29N?", answer: `Al web i a l'aplicació de resultats del Ministeri de l'Interior, que en obre de nous a cada elecció (per al 23J del 2023 els va anunciar tres dies abans). ${SITE ? `Per al 29N, [aquest és el web oficial](${SITE}).` : "Quan anunciï els del 29N, posarem l'enllaç oficial a dalt de tot d'aquesta pàgina."} Desconfia de les xifres que no diuen quin percentatge de meses s'ha escrutat.` },
      { question: "Quan són les eleccions generals del 2026?", answer: `El diumenge 29 de novembre de 2026, de 9 a 20 h: s'escullen el Congrés i el Senat, i els resultats comencen a arribar després de les 20 h. La campanya va del 13 al 27 de novembre i el dissabte 28 és la jornada de reflexió. Totes les dates i què et cal per votar: ${b2link("voting", "ca", "quan són les eleccions i com votar el 29N")}.` },
      { question: "Què és l'escrutini provisional? És el resultat oficial?", answer: "No. És l'escrutini provisional que publica Interior. El resultat oficial surt de l'escrutini general de les juntes electorals (del 4 al 7 de desembre) i es publica al BOE." },
      { question: "S'inclou el vot dels catalans que viuen a l'estranger?", answer: "No a la nit electoral. El vot CERA es compta a l'escrutini general, uns dies després." },
      { question: "Quina diferència hi ha entre el vot en blanc i el vot nul?", answer: "El vot en blanc (el sobre sense papereta, o al Senat la papereta sense cap creu) és un vot vàlid: entra al total sobre el qual es calcula el mínim del 3 % de cada província, però no dona escons. El vot nul (papereta no oficial, papereta del Congrés ratllada o modificada, més de tres creus al Senat, paperetes de candidatures diferents al mateix sobre) no és vàlid i no compta per al repartiment (LOREG, articles 96 i 163)." },
      { question: "Com funciona la llei d'Hondt a les eleccions generals?", answer: "A cada província, les candidatures que no arriben al 3 % dels vots vàlids queden fora; els vots de les altres es divideixen per 1, 2, 3… fins al nombre d'escons, i els escons van als cocients més alts (LOREG, article 163). Al Senat no s'aplica: hi surten els quatre candidats més votats de cada província catalana." },
      { question: "Es poden publicar enquestes la setmana de les eleccions?", answer: "No del 24 al 28 de novembre:la llei electoral prohibeix publicar-ne durant els cinc dies anteriors a la votació." },
    ],
  },
  es: {
    lead: "Los resultados de las elecciones generales del **domingo 29 de noviembre de 2026** se empiezan a conocer cuando cierran los colegios, a las **20:00**, y a medida que se cuentan las mesas. Esas primeras cifras son el **escrutinio provisional** del Ministerio del Interior: sirven para informar, pero el resultado oficial llega semanas después, en el BOE.",
    note: `Esta página no publica sondeos, proyecciones ni previsiones de escaños. ${SITE ? `Resultados de la noche: [web oficial del Ministerio del Interior](${SITE}).` : "Cuando Interior anuncie su web de resultados del 29N, añadiremos el enlace oficial."}`,
    clockTitle: "El calendario de la noche y de los días siguientes",
    clockCaption: "Qué pasa después de votar, elecciones generales del 29 de noviembre de 2026",
    clockHeaders: ["Cuándo", "Qué pasa"],
    clockRows: [
      ["29 de noviembre, 9:00", "Empieza la votación. Los colegios abren antes para que se constituya la mesa, pero se vota a partir de las 9:00."],
      ["29 de noviembre, 20:00", "Termina la votación en la península, Baleares, Ceuta y Melilla. Cada mesa cuenta los votos y el presidente lee el resultado en voz alta."],
      ["29 de noviembre, 21:00 (hora peninsular)", "Cierran los colegios de Canarias. En 2023, Interior empezó a publicar resultados a esa hora."],
      ["Noche del 29 al 30", "Interior suma las actas de las mesas y publica el escrutinio provisional a medida que llegan."],
      ["Del 4 al 7 de diciembre", "Las juntas electorales provinciales hacen el escrutinio general, con el voto exterior (CERA)."],
      ["Del 8 al 16 de diciembre", "Proclamación de electos."],
      ["En los 40 días siguientes a la proclamación de electos", "La Junta Electoral Central publica los resultados oficiales en el BOE."],
    ],
    clockNote: "Fuentes: LOREG, calendario de la Junta Electoral Central y Ministerio del Interior. Interior aún no ha anunciado la hora de inicio para el 29N.",
    whereTitle: "Dónde ver los resultados de las elecciones generales del 29N",
    where: [
      `Los da el **Ministerio del Interior**, que en cada elección abre una web de resultados propia y una aplicación. Para el 23J de 2023 lo anunció tres días antes. ${SITE ? `Para el 29N, la web oficial de resultados es [esta](${SITE}).` : "Para el 29N todavía no lo ha hecho (consultado el " + checkedDay("es", RESULTS_SITE_CHECKED) + ")."}`,
      "El 20 de octubre, Interior presentó **29neleccionesgenerales.es** como la web oficial de estas elecciones, pero no ha dicho si publicará allí los resultados. Hasta que lo anuncie, la referencia es esa web y la página del 29N en **Infoelectoral**, el portal electoral de Interior. La Generalitat no publica un recuento propio de las elecciones generales: sus datos abiertos llegan más tarde.",
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
      `La ley fija el escrutinio general «el quinto día siguiente al de la votación» ([LOREG, artículo 103](${LOREG_ART.general})): el viernes 4 de diciembre. Del 4 al 7 de diciembre, las juntas electorales provinciales hacen el escrutinio general: revisan las actas y añaden el voto CERA. Después resuelven las reclamaciones y proclaman a los electos, entre el 8 y el 16 de diciembre según el calendario oficial. La Junta Electoral Central publica los resultados en el BOE en los 40 días siguientes. Interior lo resume así: los resultados oficiales son los que se publican en el BOE.`,
      "Los datos definitivos, en formato abierto, los publica Interior en Infoelectoral (licencia CC BY 4.0). Cuando estén, los añadiremos a la página de resultados históricos de las elecciones generales en Cataluña.",
      `Para los ${PAGES_PER_LOCALE.es} municipios de Cataluña, los resultados del 29N también se añadirán a las [páginas de resultados electorales por municipio](${hubPath("es")}), junto a las municipales de 2023.`,
    ],
    catTitle: "Qué se elige en Cataluña",
    cat: [
      `Cataluña elige **48 diputados**: 32 por Barcelona, 6 por Girona, 4 por Lleida y 6 por Tarragona. También elige **16 senadores**, cuatro por provincia. Lo fija el decreto de convocatoria: el número de diputados de cada circunscripción está en su anexo, y «en cada circunscripción provincial se eligen cuatro Senadores» ([Real Decreto 806/2026, artículo 3](${RD_806})).`,
      `Quién se presenta en cada provincia: ${b2link("candidates", "es", "las listas de candidatos del 29N en Cataluña")}.`,
    ],
    catCaption: "Escaños que elige cada provincia catalana el 29 de noviembre",
    catHeaders: ["Provincia", "Diputados (Congreso)", "Senadores"],
    catRows: [
      ["Barcelona", "32", "4"],
      ["Girona", "6", "4"],
      ["Lleida", "4", "4"],
      ["Tarragona", "6", "4"],
      ["**Cataluña**", "**48** de 350", "**16**"],
    ],
    catNote: "Fuente: Real Decreto 806/2026, artículo 3 y anexo (BOE del 6 de octubre de 2026). Los demás senadores que representan a Cataluña los designa el Parlament y no se votan el 29N.",
    blankTitle: "Voto en blanco y voto nulo: diferencias y cómo cuenta cada uno",
    blank: [
      `La ley lo dice así: «Se considera voto en blanco, pero válido, el sobre que no contenga papeleta y, además, en las elecciones para el Senado, las papeletas que no contengan indicación a favor de ninguno de los candidatos» ([LOREG, artículo 96](${LOREG_ART.null})). Como es un voto válido, el voto en blanco entra en el total de votos válidos de la provincia, que es la base del mínimo del 3 %: cada voto en blanco sube un poco los votos que necesita una candidatura para entrar en el reparto. No da ningún escaño.`,
      "El voto nulo no es válido y no cuenta para el reparto: solo figura en el acta como papeleta nula. Es nulo el voto en un sobre o una papeleta que no son el modelo oficial, la papeleta sin sobre y el sobre con papeletas de candidaturas distintas; en el Congreso, también la papeleta con nombres tachados, añadidos o marcados o con el orden cambiado, y en el Senado, la que tiene más de tres cruces. Dos papeletas de la misma candidatura en un sobre cuentan como un solo voto válido.",
    ],
    blankCaption: "Voto en blanco y voto nulo, según la ley electoral",
    blankHeaders: ["", "Voto en blanco", "Voto nulo"],
    blankRows: [
      ["Qué es", "El sobre sin papeleta; en el Senado, también la papeleta sin ninguna cruz", "Sobre o papeleta que no son los oficiales, papeleta sin sobre, papeletas de candidaturas distintas, papeleta del Congreso modificada o del Senado con más de tres cruces"],
      ["¿Es un voto válido?", "**Sí**", "**No**"],
      ["¿Cuenta para el mínimo del 3 %?", "**Sí**: entra en el total de votos válidos", "**No**"],
      ["¿Da escaños?", "No", "No"],
      ["¿Cuenta como votante?", "Sí", "Sí: la mesa lo cuenta aparte"],
    ],
    blankNote: "Fuente: LOREG, artículos 96, 97.2 y 163.1 (texto consolidado en el BOE, consultado el 21 de noviembre de 2026).",
    dhondtTitle: "Cómo se reparten los escaños: la ley D'Hondt y el mínimo del 3 %",
    dhondt: `En el Congreso, cada provincia reparte sus escaños por separado, con las reglas del [artículo 163 de la LOREG](${LOREG_ART.seats}). En la noche electoral, Interior ya las aplica al escrutinio provisional; los escaños definitivos salen del escrutinio general.`,
    dhondtSteps: [
      "**1. Fuera quien no llega al 3 %:** «No se tienen en cuenta aquellas candidaturas que no hubieran obtenido, al menos, el 3 por 100 de los votos válidos emitidos en la circunscripción».",
      "**2. Divisiones:** los votos de cada candidatura que queda se dividen por 1, 2, 3… hasta el número de escaños de la provincia (32 en Barcelona).",
      "**3. Los cocientes más altos se llevan los escaños**, de mayor a menor. Si dos cocientes empatan, el escaño es de la candidatura con más votos en total.",
      "**4. Dentro de cada lista**, los escaños van a los candidatos por el orden en que aparecen en la papeleta.",
    ],
    dhondtCaption: "El ejemplo de la propia ley: 480.000 votos válidos y 8 escaños",
    dhondtHeaders: ["Candidatura", "Votos (÷1)", "÷2", "÷3", "÷4", "Escaños"],
    dhondtRows: [
      ["A", "**168.000**", "**84.000**", "**56.000**", "**42.000**", "4"],
      ["B", "**104.000**", "**52.000**", "34.666", "26.000", "2"],
      ["C", "**72.000**", "36.000", "24.000", "18.000", "1"],
      ["D", "**64.000**", "32.000", "21.333", "16.000", "1"],
      ["E", "40.000", "20.000", "13.333", "10.000", "0"],
      ["F", "32.000", "16.000", "10.666", "8.000", "0"],
    ],
    dhondtNote: "LOREG, artículo 163.1.c. En negrita, los ocho cocientes más altos, que se llevan los ocho escaños. La ley divide hasta ÷8, pero a partir de ÷4 ningún cociente entra entre los ocho primeros. E y F superan el 3 % y no sacan ningún escaño.",
    senateTitle: "Cómo se eligen los senadores: los cuatro más votados de cada provincia",
    senate: `En el Senado no hay ley D'Hondt ni mínimo del 3 %: cada elector marca hasta tres candidatos de su provincia, y «serán proclamados electos aquellos candidatos que obtengan mayor número de votos hasta complementar el de Senadores asignados a la circunscripción» ([LOREG, artículo 166](${LOREG_ART.senate})). En cada provincia catalana salen cuatro. Una papeleta del Senado sin ninguna cruz es voto en blanco; con más de tres, es nula. Los nombres de cada provincia están en las listas de candidatos enlazadas más arriba.`,
    pollsTitle: "Encuestas y jornada de reflexión",
    polls: [
      "Del **24 al 28 de noviembre** está prohibido publicar, difundir o reproducir sondeos electorales por cualquier medio. La campaña va del 13 al 27 de noviembre, y el 28 es la jornada de reflexión.",
      `Las estimaciones de los dos organismos públicos que hacen encuestas, el CIS y el CEO, publicadas antes de la veda y con la ficha técnica de cada estudio, están en [encuestas oficiales del 29N en Cataluña](${pollsPath("es")}).`,
    ],
    warnTitle: "Cuidado con las webs no oficiales",
    warn: "Ya hay webs que anuncian «resultados en directo del 29N», y alguna muestra cifras de 2023 con títulos de 2026. Antes de creerte una cifra, comprueba que salga de Interior y que diga qué porcentaje de mesas se ha escrutado.",
    faq: [
      { question: "¿A qué hora se saben los resultados de las elecciones del 29N?", answer: "La votación termina a las 20:00 y en Canarias a las 21:00 (hora peninsular). En 2023, Interior empezó a publicar resultados a las 21:00. Para el 29N aún no ha anunciado la hora." },
      { question: "¿Dónde se pueden ver los resultados de las elecciones generales del 29N?", answer: `En la web y la aplicación de resultados del Ministerio del Interior, que abre de nuevo en cada elección (para el 23J de 2023 las anunció tres días antes). ${SITE ? `Para el 29N, [esta es la web oficial](${SITE}).` : "Cuando anuncie las del 29N, pondremos el enlace oficial arriba del todo de esta página."} Desconfía de las cifras que no dicen qué porcentaje de mesas se ha escrutado.` },
      { question: "¿Cuándo son las elecciones generales de 2026?", answer: `El domingo 29 de noviembre de 2026, de 9 a 20 h: se eligen el Congreso y el Senado, y los resultados empiezan a llegar después de las 20 h. La campaña va del 13 al 27 de noviembre y el sábado 28 es la jornada de reflexión. Todas las fechas y qué necesitas para votar: ${b2link("voting", "es", "cuándo son las elecciones y cómo votar el 29N")}.` },
      { question: "¿Qué es el escrutinio provisional? ¿Es el resultado oficial?", answer: "No. Es el escrutinio provisional que publica Interior. El resultado oficial sale del escrutinio general de las juntas electorales (del 4 al 7 de diciembre) y se publica en el BOE." },
      { question: "¿Se incluye el voto de los españoles que viven en el extranjero?", answer: "No en la noche electoral. El voto CERA se cuenta en el escrutinio general, unos días después." },
      { question: "¿Qué diferencia hay entre el voto en blanco y el voto nulo?", answer: "El voto en blanco (el sobre sin papeleta, o en el Senado la papeleta sin ninguna cruz) es un voto válido: entra en el total sobre el que se calcula el mínimo del 3 % de cada provincia, pero no da escaños. El voto nulo (papeleta no oficial, papeleta del Congreso tachada o modificada, más de tres cruces en el Senado, papeletas de candidaturas distintas en el mismo sobre) no es válido y no cuenta para el reparto (LOREG, artículos 96 y 163)." },
      { question: "¿Cómo funciona la ley D'Hondt en las elecciones generales?", answer: "En cada provincia, las candidaturas que no llegan al 3 % de los votos válidos quedan fuera; los votos de las demás se dividen por 1, 2, 3… hasta el número de escaños, y los escaños van a los cocientes más altos (LOREG, artículo 163). En el Senado no se aplica: salen los cuatro candidatos más votados de cada provincia catalana." },
      { question: "¿Se pueden publicar encuestas la semana de las elecciones?", answer: "No del 24 al 28 de noviembre: la ley electoral prohíbe publicarlas durante los cinco días anteriores a la votación." },
    ],
  },
  en: {
    lead: `Results of Spain's 2026 general election, held on **Sunday 29 November**, start to come in after polls close at **20:00** (they open at 9:00; the Canary Islands close at 21:00 mainland time). In 2023 the Interior Ministry began publishing results at 21:00; ${SITE ? `for 29 November its results are on its [official results site](${SITE}).` : "for 29 November it has not yet announced its results site or start time (checked on " + checkedDay("en", RESULTS_SITE_CHECKED) + ")."} Those first figures are the ministry's **provisional count**: they are for information, and the official result comes weeks later, in the official gazette (BOE).`,
    note: `This page publishes no polls, projections or seat forecasts. ${SITE ? `Results on the night: [the Interior Ministry's official site](${SITE}).` : "When the Interior Ministry announces its 29 November results site, we will add the official link here."}`,
    clockTitle: "The timeline on the night and after",
    clockCaption: "What happens after the vote, general election of 29 November 2026",
    clockHeaders: ["When", "What happens"],
    clockRows: [
      ["29 November, 9:00", "Polls open. Polling stations open earlier so the officers can set up the table, but voting starts at 9:00."],
      ["29 November, 20:00", "Voting ends on the mainland, the Balearic Islands, Ceuta and Melilla. Each polling table counts its votes and the presiding officer reads the result aloud."],
      ["29 November, 21:00 (mainland time)", "Polls close in the Canary Islands. In 2023 the Interior Ministry started publishing results at this time."],
      ["Night of 29 to 30 November", "The ministry adds up the polling-table returns and publishes the provisional count as they arrive."],
      ["4 to 7 December", "The provincial electoral boards carry out the general count, including votes from abroad (CERA)."],
      ["8 to 16 December", "Those elected are declared."],
      ["Within 40 days of declaring who is elected", "The Central Electoral Board publishes the official results in the BOE."],
    ],
    clockNote: "Sources: the electoral law (LOREG), the Central Electoral Board calendar and the Interior Ministry. The ministry has not yet announced a start time for 29 November.",
    whereTitle: "Where to see the 2026 Spain general election results",
    where: [
      `They come from the **Spanish Ministry of the Interior**, which opens its own results website and app for each election. For the July 2023 election it announced them three days before. ${SITE ? `For 29 November, its official results site is [here](${SITE}).` : "For 29 November it has not done so yet (checked on " + checkedDay("en", RESULTS_SITE_CHECKED) + ")."}`,
      "On 20 October the ministry presented **29neleccionesgenerales.es** as the official website of this election, but it has not said whether results will be published there. Until it does, the reference is that site and the 29-N page on **Infoelectoral**, the ministry's election portal. The Catalan government does not publish its own count for general elections; its open data comes later.",
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
      `The law sets the general count for "el quinto día siguiente al de la votación", the fifth day after polling day ([electoral law, article 103](${LOREG_ART.general})): Friday 4 December. From 4 to 7 December the provincial electoral boards carry out the general count: they check the returns and add the CERA votes. They then settle complaints and declare who is elected, between 8 and 16 December under the official calendar. The Central Electoral Board publishes the results in the BOE within the following 40 days. As the ministry puts it, the official results are the ones published in the BOE.`,
      "The final data, as open data, is published by the ministry on Infoelectoral (CC BY 4.0 licence). Once it is there, we will add it to our page of past general election results in Catalonia.",
      `For ${PAGES_PER_LOCALE.en} towns, the largest and the main resorts, the 29 November results will also be added to our [election results by town](${hubPath("en")}), beside the 2023 local election.`,
    ],
    catTitle: "What Catalonia elects",
    cat: [
      `Catalonia elects **48 members of Congress**: 32 for Barcelona, 6 for Girona, 4 for Lleida and 6 for Tarragona. It also elects **16 senators**, four per province. The decree calling the election sets them: the deputies per constituency are in its annex, and "en cada circunscripción provincial se eligen cuatro Senadores", four senators in each provincial constituency ([Royal Decree 806/2026, article 3](${RD_806})).`,
      `Who is standing in each province: ${b2link("candidates", "en", "the 29 November candidate lists in Catalonia")}.`,
    ],
    catCaption: "Seats each Catalan province elects on 29 November",
    catHeaders: ["Province", "Deputies (Congress)", "Senators"],
    catRows: [
      ["Barcelona", "32", "4"],
      ["Girona", "6", "4"],
      ["Lleida", "4", "4"],
      ["Tarragona", "6", "4"],
      ["**Catalonia**", "**48** of 350", "**16**"],
    ],
    catNote: "Source: Royal Decree 806/2026, article 3 and annex (BOE, 6 October 2026). The other senators who represent Catalonia are appointed by the Catalan Parliament and are not elected on 29 November.",
    blankTitle: "Blank vote and spoilt (null) vote in Spain: the difference and how each counts",
    blank: [
      `The law puts it this way: "Se considera voto en blanco, pero válido, el sobre que no contenga papeleta y, además, en las elecciones para el Senado, las papeletas que no contengan indicación a favor de ninguno de los candidatos": an empty envelope, and a Senate ballot with no name marked, is a blank but valid vote ([electoral law, article 96](${LOREG_ART.null})). Because it is valid, a blank vote is part of the province's total of valid votes, the base of the 3 % threshold: each blank vote slightly raises the number of votes a list needs to share in the seats. It wins no seat.`,
      "A null (spoilt) vote is not valid and plays no part in the seat count: it only appears in the return as a null ballot. A vote is null if the envelope or ballot is not the official one, if the ballot has no envelope or if the envelope holds ballots of different lists; on the Congress ballot, also if names are crossed out, added or marked or their order is changed, and on the Senate ballot, if more than three names are marked. Two ballots of the same list in one envelope count as one valid vote.",
    ],
    blankCaption: "Blank and null votes under Spanish electoral law",
    blankHeaders: ["", "Blank vote", "Null vote"],
    blankRows: [
      ["What it is", "An envelope with no ballot; for the Senate, also a ballot with no name marked", "A non-official envelope or ballot, a ballot with no envelope, ballots of different lists, an altered Congress ballot or a Senate ballot with more than three marks"],
      ["Is it a valid vote?", "**Yes**", "**No**"],
      ["Does it count towards the 3 % threshold?", "**Yes**: it is part of the valid votes", "**No**"],
      ["Does it win seats?", "No", "No"],
      ["Does the voter count as having voted?", "Yes", "Yes: the table counts it separately"],
    ],
    blankNote: "Source: electoral law (LOREG), articles 96, 97.2 and 163.1 (consolidated text in the BOE, checked on 21 November 2026).",
    dhondtTitle: "How seats are allocated: the D'Hondt method and the 3 % threshold",
    dhondt: `For Congress, each province shares out its own seats, under [article 163 of the electoral law](${LOREG_ART.seats}). On election night the Interior Ministry already applies these rules to the provisional count; the final seats come from the general count.`,
    dhondtSteps: [
      "**1. Lists under 3 % are left out:** \"No se tienen en cuenta aquellas candidaturas que no hubieran obtenido, al menos, el 3 por 100 de los votos válidos emitidos en la circunscripción\" (lists with less than 3 % of the constituency's valid votes are not counted).",
      "**2. Divide:** each remaining list's votes are divided by 1, 2, 3… up to the number of seats in the province (32 in Barcelona).",
      "**3. The highest quotients win the seats**, from the largest down. If two quotients tie, the seat goes to the list with more votes in total.",
      "**4. Within each list**, seats go to the candidates in the order they appear on the ballot.",
    ],
    dhondtCaption: "The law's own example: 480,000 valid votes and 8 seats",
    dhondtHeaders: ["List", "Votes (÷1)", "÷2", "÷3", "÷4", "Seats"],
    dhondtRows: [
      ["A", "**168,000**", "**84,000**", "**56,000**", "**42,000**", "4"],
      ["B", "**104,000**", "**52,000**", "34,666", "26,000", "2"],
      ["C", "**72,000**", "36,000", "24,000", "18,000", "1"],
      ["D", "**64,000**", "32,000", "21,333", "16,000", "1"],
      ["E", "40,000", "20,000", "13,333", "10,000", "0"],
      ["F", "32,000", "16,000", "10,666", "8,000", "0"],
    ],
    dhondtNote: "Electoral law, article 163.1.c. In bold, the eight highest quotients, which take the eight seats. The law divides up to ÷8, but from ÷4 on no quotient makes the top eight. E and F pass 3 % and win no seat.",
    senateTitle: "How senators are elected: the four most voted in each province",
    senate: `The Senate has no D'Hondt and no 3 % threshold: each voter marks up to three candidates in their province, and "serán proclamados electos aquellos candidatos que obtengan mayor número de votos hasta complementar el de Senadores asignados a la circunscripción", the candidates with most votes fill the province's seats ([electoral law, article 166](${LOREG_ART.senate})). Each Catalan province elects four. A Senate ballot with no name marked is a blank vote; with more than three, it is null. The names in each province are in the candidate lists linked above.`,
    pollsTitle: "Polls and the day of reflection",
    polls: [
      "From **24 to 28 November** it is illegal to publish, broadcast or reproduce election polls in any medium. The campaign runs from 13 to 27 November, and 28 November is the day of reflection.",
      `Estimates from the two public bodies that run polls, the CIS and the CEO, published before the blackout and with each study's technical sheet, are on [official 29 November polls in Catalonia](${pollsPath("en")}).`,
    ],
    warnTitle: "Beware of unofficial sites",
    warn: "Some sites already advertise “29N live results”, and at least one shows 2023 figures under 2026 headings. Before trusting a figure, check that it comes from the Interior Ministry and that it states the share of polling tables counted.",
    faq: [
      { question: "When are the 2026 Spain general election results?", answer: `On the night of Sunday 29 November, after polls close at 20:00 (21:00 mainland time in the Canary Islands). In 2023 the Interior Ministry started publishing results at 21:00. ${SITE ? `For 29 November they are on its [official results site](${SITE}).` : "It has not announced the time or the results site for 29 November yet (checked on " + checkedDay("en", RESULTS_SITE_CHECKED) + ")."}` },
      { question: "Where can I see the 2026 Spain general election results?", answer: `On the Interior Ministry's results website and app, which it opens anew for each election (for the July 2023 election it announced them three days before). ${SITE ? `For 29 November, [this is the official site](${SITE}).` : "When it announces the 29 November ones, we will put the official link at the top of this page."} Be wary of figures that do not say what share of polling tables has been counted.` },
      { question: "When is the Spanish general election?", answer: `On Sunday 29 November 2026, from 9:00 to 20:00: Spain elects the Congress and the Senate, and results start to come in after 20:00. The campaign runs from 13 to 27 November and Saturday 28 November is the day of reflection. Every date and what you need to vote: ${b2link("voting", "en", "2026 Spain general election dates and how to vote")}.` },
      { question: "What time do the polls open in the Spanish election on 29 November?", answer: "Voting runs from 9:00 to 20:00. Polling stations open earlier for the officers to set up, and anyone still inside at 20:00 may still vote. Where your polling station is, and what ID to bring, is in [how to vote in Spain's general election](/en/guides/how-to-vote-catalonia/)." },
      { question: "What is the provisional count (escrutinio)? Is it the official result?", answer: "No. It is the ministry's provisional count. The official result comes from the electoral boards' general count (4 to 7 December) and is published in the BOE." },
      { question: "Does it include votes from Spaniards living abroad?", answer: "Not on election night. CERA votes are counted in the general count a few days later." },
      { question: "What is the difference between a blank vote and a null vote in Spain?", answer: "A blank vote (an envelope with no ballot, or a Senate ballot with no name marked) is valid: it is part of the total on which each province's 3 % threshold is worked out, but it wins no seat. A null vote (a non-official ballot, a Congress ballot with names crossed out or changed, more than three marks on the Senate ballot, ballots of different lists in one envelope) is not valid and plays no part in the seat count (electoral law, articles 96 and 163)." },
      { question: "How does the D'Hondt method work in Spain's general election?", answer: "In each province, lists with less than 3 % of the valid votes are left out; the others' votes are divided by 1, 2, 3… up to the number of seats, and the seats go to the highest quotients (electoral law, article 163). It does not apply to the Senate, where the four candidates with most votes in each Catalan province are elected." },
      { question: "Can polls be published in the week of the election?", answer: "Not from 24 to 28 November: the electoral law bans publishing them in the five days before the vote." },
    ],
  },
};

function body(locale: Locale) {
  const t = COPY[locale];
  return [
    lead(t.lead),
    // 13 Nov 2026: "En català · En castellano · In English" under the answer (GSC: Spanish queries land on the English edition at position 3-6; docs/SEO_EXPERIMENTS.md, "13 Nov 2026 — 29N results night").
    languageLinks(),
    callout("official", verifiedLine(locale, VERIFIED), t.note),
    ...h2(t.clockTitle),
    table(t.clockCaption, t.clockHeaders, t.clockRows, t.clockNote),
    ...h2(t.whereTitle, ...t.where),
    ...h2(t.countTitle, ...t.count),
    ...h2(t.readTitle),
    list(...t.read),
    ...h2(t.finalTitle, ...t.final),
    ...h2(t.catTitle, ...t.cat),
    table(t.catCaption, t.catHeaders, t.catRows, t.catNote),
    // 21 Nov 2026 (body only, docs/SEO_EXPERIMENTS.md, "21 Nov 2026 — 29N election-week questions"): how each vote counts.
    ...h2(t.blankTitle, ...t.blank),
    table(t.blankCaption, t.blankHeaders, t.blankRows, t.blankNote),
    ...h2(t.dhondtTitle, t.dhondt),
    list(...t.dhondtSteps),
    table(t.dhondtCaption, t.dhondtHeaders, t.dhondtRows, t.dhondtNote),
    ...h2(t.senateTitle, t.senate),
    ...h2(t.pollsTitle, ...t.polls),
    callout("warning", t.warnTitle, t.warn),
    faq(t.faq),
    ...b2Related(["voting", "postalVote", "mesa", "congressResults", "parliamentResults"], locale),
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
