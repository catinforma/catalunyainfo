import type { Block } from "@/lib/content/blocks";
import { ELECTORS, PROVINCES, PROVINCE_NAMES, SEATS } from "@/lib/content/candidates/boe";
import type { Locale } from "@/lib/i18n/config";

import {
  b2link,
  b2Related,
  callout,
  faq,
  h2,
  lead,
  paras,
  table,
  verifiedLine,
  type B2Article,
  type B2Source,
} from "./shared";
import { VOTING } from "./voting";

/**
 * Who is standing in Catalonia at the 29 November 2026 general election.
 *
 * This page answers "who": the lists themselves are the `candidateLists`
 * block, read from the BOE when the page is built (presented candidacies,
 * BOE of 28 Oct 2026; proclaimed, BOE of 3 Nov 2026; any corrections after).
 * Nothing is typed in when they appear. How to vote, the postal vote and the
 * polling-station finder stay on the how-to-vote guide, which this page links
 * to and does not repeat.
 *
 * Every fact checked on 25 Oct 2026 against: RD 806/2026 (BOE 6 Oct 2026:
 * seats per province, four senators each, campaign dates); the LOREG
 * consolidated text from the BOE open-data API (arts. 46.3, 46.9, 47, 49,
 * 71, 96, 163, 166, 169, 171, 172); the JEC 29N calendar; Interior's 29N page
 * on candidacies ("Las candidaturas presentadas se publican en el Boletín
 * Oficial del Estado el día 28 de octubre y las candidaturas proclamadas se
 * publican el 3 de noviembre"); the INE consultation census of 9 Oct 2026
 * (Elecgral_2026_cc_tab2.xlsx); the INE's CERA ballot-download page ("solo
 * son válidas para el voto de los electores residentes permanentemente en el
 * extranjero", available "hasta el día 26 de noviembre de 2026"); and the
 * 2023 precedent read live from the BOE API (corrections BOE-A-2023-15548,
 * 4 Jul, and BOE-A-2023-15828, 7 Jul, 7 and 10 days after the proclaimed
 * lists of 27 Jun).
 *
 * Strictly procedural: no party is named in the text, no polls, no
 * commentary, no ranking. The lists keep the electoral board's numbering.
 */

const VERIFIED = "2026-10-25";

const URL = {
  rd: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20742",
  loreg: "https://www.boe.es/buscar/act.php?id=BOE-A-1985-11672",
  jec: "https://www.juntaelectoralcentral.es/cs/jec/documentos/eg2026_calendario.pdf",
  interior:
    "https://29neleccionesgenerales.es/formaciones-politicas/informacion-general/la-presentacion-de-las-candidaturas-en-las-elecciones-generales-de-2026/",
  ineCensus: "https://www.ine.es/dyngs/Prensa/es/EG2026.htm",
  ineGuide: "https://www.ine.es/dyngs/CEL/index.htm?cid=1700",
  ineBallots: "https://www.ine.es/dyngs/CEL/index.htm?cid=1030",
  boeData: "https://www.boe.es/datosabiertos/",
  correction2023a: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2023-15548",
  correction2023b: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2023-15828",
};

const SOURCES: B2Source[] = [
  { name: "Real Decreto 806/2026, de 5 de octubre, de disolución del Congreso de los Diputados y del Senado y de convocatoria de elecciones", url: URL.rd, publisher: "Boletín Oficial del Estado" },
  { name: "Ley Orgánica 5/1985, del Régimen Electoral General (texto consolidado)", url: URL.loreg, publisher: "Boletín Oficial del Estado" },
  { name: "Calendario electoral, elecciones generales 29 de noviembre de 2026", url: URL.jec, publisher: "Junta Electoral Central" },
  { name: "La presentación de las candidaturas en las elecciones generales de 2026", url: URL.interior, publisher: "Ministerio del Interior" },
  { name: "Elecciones generales de 29 de noviembre de 2026: electores (nota de prensa de 9 de octubre)", url: URL.ineCensus, publisher: "INE" },
  { name: "Elecciones a Cortes Generales de 29 de noviembre de 2026: guía", url: URL.ineGuide, publisher: "INE — Oficina del Censo Electoral" },
  { name: "Descarga por los electores residentes en el extranjero de las papeletas de las Elecciones Generales de 29 de noviembre 2026", url: URL.ineBallots, publisher: "INE — Oficina del Censo Electoral" },
  { name: "Datos abiertos del BOE (API de sumarios)", url: URL.boeData, publisher: "Agencia Estatal Boletín Oficial del Estado" },
  { name: "Corrección de errores de las candidaturas proclamadas, elecciones generales de 2023 (BOE de 4 de julio de 2023)", url: URL.correction2023a, publisher: "Boletín Oficial del Estado" },
  { name: "Corrección de errores de las candidaturas proclamadas, elecciones generales de 2023 (BOE de 7 de julio de 2023)", url: URL.correction2023b, publisher: "Boletín Oficial del Estado" },
];

const a = (label: string, url: string) => `[${label}](${url})`;

const META: Record<Locale, { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    path: "guies/candidats-eleccions-generals-catalunya",
    title: "Candidats a les eleccions generals del 29N a Barcelona, Girona, Lleida i Tarragona",
    seoTitle: "Candidats eleccions generals 2026 a Barcelona i Catalunya",
    seoDescription:
      "Llistes 29N de candidats al Congrés i al Senat per Barcelona, Girona, Lleida i Tarragona, llegides del BOE: presentades el 28/10 i proclamades el 3/11.",
    excerpt:
      "Qui es presenta el 29 de novembre a cada província catalana: les llistes oficials del BOE, com es vota al Congrés i al Senat i el calendari de les candidatures.",
  },
  es: {
    path: "guias/candidatos-elecciones-generales-cataluna",
    title: "Candidatos a las elecciones generales del 29N en Barcelona, Girona, Lleida y Tarragona",
    seoTitle: "Candidatos elecciones generales 2026: Barcelona y Cataluña",
    seoDescription:
      "Listas del 29N: candidatos al Congreso y al Senado por Barcelona, Girona, Lleida y Tarragona, leídos del BOE. Presentadas el 28/10, proclamadas el 3/11.",
    excerpt:
      "Quién se presenta el 29 de noviembre en cada provincia catalana: las listas oficiales del BOE, cómo se vota al Congreso y al Senado y el calendario de las candidaturas.",
  },
  en: {
    path: "guides/spain-general-election-candidates-catalonia",
    title: "Candidates in Catalonia for Spain's 29 November 2026 general election",
    seoTitle: "Spain general election 2026: candidates in Barcelona",
    seoDescription:
      "Who is standing for Congress and the Senate in Barcelona, Girona, Lleida and Tarragona on 29 November 2026: the official lists, read from the BOE.",
    excerpt:
      "Who is standing on 29 November in each Catalan province: the official lists from the BOE, how the Congress and Senate votes work, and when the lists come out.",
  },
};

const LIVE: Block = { type: "candidateLists" } as Block;

function seatsTable(locale: Locale): Block {
  const format = new Intl.NumberFormat(locale === "en" ? "en-GB" : locale === "ca" ? "ca-ES" : "es-ES");
  const caption: Record<Locale, string> = {
    ca: "Què s'escull el 29 de novembre a cada província catalana",
    es: "Qué se elige el 29 de noviembre en cada provincia catalana",
    en: "What each Catalan province elects on 29 November",
  };
  const headers: Record<Locale, string[]> = {
    ca: ["Província", "Diputats", "Senadors", "Electors (cens de consulta)"],
    es: ["Provincia", "Diputados", "Senadores", "Electores (censo de consulta)"],
    en: ["Province", "Deputies", "Senators", "Voters (consultation census)"],
  };
  const total: Record<Locale, string> = { ca: "Total Catalunya", es: "Total Cataluña", en: "Catalonia" };
  const note: Record<Locale, string> = {
    ca: "Escons: annex del Reial decret 806/2026. Electors: cens de consulta de l'INE (nota del 9 d'octubre de 2026), amb els residents a l'estranger inclosos; no és la xifra definitiva, que l'INE publica més endavant.",
    es: "Escaños: anexo del Real Decreto 806/2026. Electores: censo de consulta del INE (nota del 9 de octubre de 2026), incluidos los residentes en el extranjero; no es la cifra definitiva, que el INE publica más adelante.",
    en: "Seats: annex to Royal Decree 806/2026. Voters: the INE's consultation census (note of 9 October 2026), including those registered abroad; not the final figure, which the INE publishes later.",
  };
  const rows = PROVINCES.map((key) => [
    PROVINCE_NAMES[key],
    String(SEATS[key].deputies),
    String(SEATS[key].senators),
    format.format(ELECTORS[key].total),
  ]);
  const sum = (pick: (key: (typeof PROVINCES)[number]) => number) => PROVINCES.reduce((acc, key) => acc + pick(key), 0);
  rows.push([
    total[locale],
    String(sum((key) => SEATS[key].deputies)),
    String(sum((key) => SEATS[key].senators)),
    format.format(sum((key) => ELECTORS[key].total)),
  ]);
  return table(caption[locale], headers[locale], rows, note[locale]);
}

function timetable(locale: Locale): Block {
  const caption: Record<Locale, string> = {
    ca: "Calendari de les candidatures, eleccions generals del 29 de novembre de 2026",
    es: "Calendario de las candidaturas, elecciones generales del 29 de noviembre de 2026",
    en: "Candidate-list timetable, general election of 29 November 2026",
  };
  const headers: Record<Locale, string[]> = {
    ca: ["Què", "Quan (2026)"],
    es: ["Qué", "Cuándo (2026)"],
    en: ["What", "When (2026)"],
  };
  const rows: Record<Locale, string[][]> = {
    ca: [
      ["Presentació de candidatures a cada junta electoral provincial", "21–26 d'octubre"],
      ["Publicació al BOE de les candidatures presentades", "Dimecres 28 d'octubre"],
      ["Proclamació de candidatures per les juntes electorals provincials", "Dilluns 2 de novembre"],
      ["Publicació al BOE de les candidatures proclamades", "Dimarts 3 de novembre"],
      ["Recursos contra la proclamació", "4–5 de novembre"],
      ["Últim dia per resoldre els recursos", "12 de novembre"],
      ["Campanya electoral", "13 de novembre (0:00) – 27 de novembre (24:00)"],
      ["Jornada de reflexió", "Dissabte 28 de novembre"],
      ["Votació", "Diumenge 29 de novembre, de 9:00 a 20:00"],
    ],
    es: [
      ["Presentación de candidaturas ante cada junta electoral provincial", "21–26 de octubre"],
      ["Publicación en el BOE de las candidaturas presentadas", "Miércoles 28 de octubre"],
      ["Proclamación de candidaturas por las juntas electorales provinciales", "Lunes 2 de noviembre"],
      ["Publicación en el BOE de las candidaturas proclamadas", "Martes 3 de noviembre"],
      ["Recursos contra la proclamación", "4–5 de noviembre"],
      ["Último día para resolver los recursos", "12 de noviembre"],
      ["Campaña electoral", "13 de noviembre (0:00) – 27 de noviembre (24:00)"],
      ["Jornada de reflexión", "Sábado 28 de noviembre"],
      ["Votación", "Domingo 29 de noviembre, de 9:00 a 20:00"],
    ],
    en: [
      ["Candidate lists filed with each provincial electoral board", "21–26 October"],
      ["Lists as filed published in the BOE", "Wednesday 28 October"],
      ["Provincial electoral boards proclaim the candidates", "Monday 2 November"],
      ["Proclaimed lists published in the BOE", "Tuesday 3 November"],
      ["Appeals against the proclamation", "4–5 November"],
      ["Last day for appeals to be settled", "12 November"],
      ["Election campaign", "13 November (00:00) – 27 November (24:00)"],
      ["Day of reflection", "Saturday 28 November"],
      ["Polling day", "Sunday 29 November, 9:00–20:00"],
    ],
  };
  const note: Record<Locale, string> = {
    ca: "Fonts: calendari electoral de la Junta Electoral Central, Ministeri de l'Interior, INE, Reial decret 806/2026 i LOREG (arts. 45, 47, 49 i 169), consultats el 25 d'octubre de 2026.",
    es: "Fuentes: calendario electoral de la Junta Electoral Central, Ministerio del Interior, INE, Real Decreto 806/2026 y LOREG (arts. 45, 47, 49 y 169), consultados el 25 de octubre de 2026.",
    en: "Sources: Central Electoral Board calendar, Ministry of the Interior, INE, Royal Decree 806/2026 and the electoral law (LOREG arts. 45, 47, 49 and 169), checked on 25 October 2026.",
  };
  return table(caption[locale], headers[locale], rows[locale], note[locale]);
}

function body(locale: Locale): Block[] {
  if (locale === "ca") {
    return [
      lead(
        "Els candidats de les **eleccions generals del 29 de novembre de 2026** a Barcelona, Girona, Lleida i Tarragona són els de les llistes que les juntes electorals provincials publiquen al BOE: les **presentades, el 28 d'octubre**, i les **proclamades, el 3 de novembre**. Les candidatures apareixen aquí sota, província per província, llegides directament del BOE a mesura que s'hi publiquen. Al Congrés es vota una llista tancada i al Senat es poden marcar fins a tres noms.",
      ),
      LIVE,
      callout(
        "info",
        "Com es fa aquesta llista",
        "Es llegeix cada dia del BOE, que és on la llei mana publicar les candidatures de les generals (art. 169.4 de la LOREG), no als butlletins oficials de les províncies. Els noms, les candidatures i la numeració surten tal com els publica cada junta electoral, sense cap canvi. Si el BOE hi publica correccions, l'enllaç surt a sobre de les llistes.",
      ),
      ...h2(
        "Què s'escull el 29N a Barcelona, Girona, Lleida i Tarragona",
        "Segons el Reial decret 806/2026, que convoca les eleccions, Catalunya escull **48 dels 350 diputats** del Congrés i **16 senadors**, quatre per província. Cada província és una circumscripció amb les seves pròpies llistes: qui vota a Girona només pot triar entre les candidatures de Girona.",
      ),
      seatsTable("ca"),
      ...paras(
        "Els altres senadors que representen Catalunya els designa el Parlament, i no es voten el 29 de novembre.",
      ),
      ...h2(
        "Quan surten les llistes de candidats",
        "Els partits, federacions, coalicions i agrupacions d'electors presenten les candidatures a cada junta electoral provincial del 21 al 26 d'octubre. Segons el Ministeri de l'Interior, «les candidatures presentades es publiquen al Butlletí Oficial de l'Estat el dia 28 d'octubre i les candidatures proclamades es publiquen el 3 de novembre».",
      ),
      timetable("ca"),
      ...paras(
        "Entre una data i l'altra, les juntes comuniquen als representants de cada candidatura les irregularitats que hi han trobat, i hi ha 48 hores per esmenar-les. Una candidatura que no compleix els requisits no es proclama (art. 47 de la LOREG). Entre aquests requisits hi ha les signatures: una agrupació d'electors necessita les de l'1 % del cens de la circumscripció, i un partit que no va obtenir representació a cap de les dues cambres a les eleccions anteriors, les del 0,1 % (art. 169.3).",
      ),
      ...h2(
        "Com es vota al Congrés: llistes tancades",
        "Cada candidatura al Congrés porta tants candidats com escons té la província (32 a Barcelona, 6 a Girona i a Tarragona, 4 a Lleida) i, si vol, fins a 10 suplents. La papereta duu el nom, la sigla i el símbol de la candidatura i tots els noms en ordre.",
        "Es vota la llista sencera: si a la papereta del Congrés hi ratlles, hi afegeixes o hi marques noms, o en canvies l'ordre, el vot és nul (art. 96.2). Els escons es reparteixen entre les candidatures que arriben al 3 % dels vots vàlids de la província, amb el sistema d'Hondt, i dins de cada llista s'adjudiquen per l'ordre en què surten els candidats (art. 163).",
      ),
      ...h2(
        "Com es vota al Senat a Barcelona: fins a tres candidats",
        "Al Senat cada candidat va per separat, encara que es presentin agrupats per partits. Hi ha una sola papereta amb tots els candidats de la província, cadascun amb una casella: pots marcar **fins a tres** noms, de la mateixa candidatura o de candidatures diferents (art. 166.1). Surten elegits els quatre candidats més votats.",
        "Si en marques més de tres, el vot és nul; si no en marques cap, compta com a vot en blanc, que és vàlid (art. 96). Cada candidat al Senat té dos suplents: surten al BOE, i a les llistes d'aquí dalt, però no a la papereta (art. 171.2). A la papereta, l'ordre de les candidatures no és el del BOE: van primer les que van tenir més vots a les últimes eleccions al Senat a la província, i les noves, per sorteig (art. 172.3).",
      ),
      ...h2(
        "Per què una llista pot canviar després del 3 de novembre",
        "Les proclamacions es poden recórrer davant del jutjat contenciós administratiu els dos dies següents a la publicació, el 4 i el 5 de novembre, i segons l'INE l'últim dia per resoldre els recursos és el 12 de novembre (art. 49 de la LOREG). Mentre hi ha un recurs en una circumscripció, les seves paperetes no s'imprimeixen fins que es resol (art. 71.2).",
        "El BOE també pot publicar correccions d'errors: a les generals del 2023, en va publicar dues de les candidatures proclamades, set i deu dies després. Si n'hi ha, aquesta pàgina les enllaça a sobre de les llistes i diu quines províncies afecten.",
      ),
      ...h2(
        "Paperetes: on són i qui les pot descarregar",
        "El dia de la votació, cada mesa electoral rep les paperetes i els sobres almenys una hora abans d'obrir (art. 71.4 de la LOREG).",
        `L'INE ofereix ${a("la descàrrega de paperetes del 29N", URL.ineBallots)} només per als electors residents a l'estranger (CERA), fins al 26 de novembre de 2026, i adverteix: «Si usted reside en España no las utilice ya que su voto sería nulo».`,
      ),
      ...paras(
        `On has de votar, el vot per correu i quin document cal portar són a ${b2link("voting", "ca", "com votar el 29 de novembre a Catalunya")}. Si t'ha tocat ser-hi, a ${b2link("mesa", "ca", "membre de mesa electoral")}; per a la nit del 29, ${b2link("electionNight", "ca", "a quina hora surten els resultats")}, i per als d'altres anys, ${b2link("congressResults", "ca", "els resultats de les eleccions generals a Catalunya")}.`,
      ),
      faq([
        {
          question: "On puc veure les llistes de candidats de les eleccions generals 2026 a Barcelona?",
          answer:
            "Al BOE: les candidatures presentades surten el 28 d'octubre i les proclamades, el 3 de novembre. Aquesta pàgina les llegeix del BOE i les mostra per províncies: Barcelona, Girona, Lleida i Tarragona, Congrés i Senat.",
        },
        {
          question: "Quan es publiquen les llistes definitives del 29N?",
          answer:
            "Les juntes electorals proclamen les candidatures el 2 de novembre i el BOE les publica el 3 de novembre. Es poden recórrer el 4 i el 5 de novembre, i els recursos s'han de resoldre com a molt tard el 12 de novembre.",
        },
        {
          question: "Quants candidats al Senat puc votar a Barcelona?",
          answer:
            "Fins a tres, de la mateixa candidatura o de diferents. Se n'escullen quatre per província. Si en marques més de tres el vot és nul, i si no en marques cap és un vot en blanc.",
        },
        {
          question: "Puc ratllar noms o canviar l'ordre a la papereta del Congrés?",
          answer:
            "No. Les llistes del Congrés són tancades: si hi modifiques, afegeixes, marques o ratlles noms, o n'alteres l'ordre, el vot és nul.",
        },
        {
          question: "Què vol dir «No proclamada»?",
          answer:
            "Que la junta electoral provincial no ha proclamat aquella candidatura perquè no compleix algun requisit legal. La decisió es pot recórrer el 4 i el 5 de novembre.",
        },
        {
          question: "Les candidatures surten al butlletí oficial de la província?",
          answer:
            "No. A les eleccions generals, les candidatures presentades i les proclamades es publiquen al BOE (art. 169.4 de la LOREG). Els butlletins provincials les publiquen a les eleccions municipals.",
        },
        {
          question: "Es poden descarregar les paperetes?",
          answer:
            "L'INE les ofereix només als electors residents a l'estranger (CERA), fins al 26 de novembre. Si vius a Espanya, no les facis servir: el vot seria nul. A la mesa electoral hi haurà paperetes.",
        },
      ]),
      ...paras(verifiedLine("ca", VERIFIED)),
      ...b2Related(["voting", "mesa", "electionNight", "congressResults", "parliamentResults"], "ca"),
    ];
  }

  if (locale === "es") {
    return [
      lead(
        "Los candidatos de las **elecciones generales del 29 de noviembre de 2026** en Barcelona, Girona, Lleida y Tarragona son los de las listas que las juntas electorales provinciales publican en el BOE: las **presentadas, el 28 de octubre**, y las **proclamadas, el 3 de noviembre**. Las candidaturas aparecen aquí abajo, provincia por provincia, leídas directamente del BOE a medida que se publican. Al Congreso se vota una lista cerrada y en el Senado se puede marcar hasta a tres candidatos.",
      ),
      LIVE,
      callout(
        "info",
        "Cómo se hace esta lista",
        "Se lee cada día del BOE, que es donde la ley manda publicar las candidaturas de las generales (art. 169.4 de la LOREG), no en los boletines oficiales de las provincias. Los nombres, las candidaturas y su numeración salen tal como los publica cada junta electoral, sin ningún cambio. Si el BOE publica correcciones, el enlace aparece encima de las listas.",
      ),
      ...h2(
        "Qué se elige el 29N en Barcelona, Girona, Lleida y Tarragona",
        "Según el Real Decreto 806/2026, que convoca las elecciones, Cataluña elige **48 de los 350 diputados** del Congreso y **16 senadores**, cuatro por provincia. Cada provincia es una circunscripción con sus propias listas: quien vota en Girona solo puede elegir entre las candidaturas de Girona.",
      ),
      seatsTable("es"),
      ...paras(
        "Los demás senadores que representan a Cataluña los designa el Parlament y no se votan el 29 de noviembre.",
      ),
      ...h2(
        "Cuándo salen las listas de candidatos",
        "Los partidos, federaciones, coaliciones y agrupaciones de electores presentan sus candidaturas ante cada junta electoral provincial del 21 al 26 de octubre. Según el Ministerio del Interior, «las candidaturas presentadas se publican en el Boletín Oficial del Estado el día 28 de octubre y las candidaturas proclamadas se publican el 3 de noviembre».",
      ),
      timetable("es"),
      ...paras(
        "Entre una fecha y otra, las juntas comunican a los representantes de cada candidatura las irregularidades que han encontrado, y hay 48 horas para subsanarlas. Una candidatura que no cumple los requisitos no se proclama (art. 47 de la LOREG). Entre esos requisitos están las firmas: una agrupación de electores necesita las del 1 % del censo de la circunscripción, y un partido que no obtuvo representación en ninguna de las dos cámaras en las elecciones anteriores, las del 0,1 % (art. 169.3).",
      ),
      ...h2(
        "Cómo se vota al Congreso: listas cerradas",
        "Cada candidatura al Congreso lleva tantos candidatos como escaños tiene la provincia (32 en Barcelona, 6 en Girona y en Tarragona, 4 en Lleida) y, si quiere, hasta 10 suplentes. La papeleta lleva el nombre, la sigla y el símbolo de la candidatura y todos los nombres por orden.",
        "Se vota la lista entera: si en la papeleta del Congreso tachas, añades o marcas nombres, o cambias su orden, el voto es nulo (art. 96.2). Los escaños se reparten entre las candidaturas que llegan al 3 % de los votos válidos de la provincia, con el sistema D'Hondt, y dentro de cada lista se adjudican por el orden en que aparecen los candidatos (art. 163).",
      ),
      ...h2(
        "Cómo se vota al Senado en Barcelona: hasta tres candidatos",
        "En el Senado cada candidato va por separado, aunque se presenten agrupados por partidos. Hay una sola papeleta con todos los candidatos de la provincia, cada uno con una casilla: puedes marcar **hasta tres** nombres, de la misma candidatura o de candidaturas distintas (art. 166.1). Salen elegidos los cuatro candidatos más votados.",
        "Si marcas más de tres, el voto es nulo; si no marcas ninguno, cuenta como voto en blanco, que es válido (art. 96). Cada candidato al Senado tiene dos suplentes: aparecen en el BOE, y en las listas de arriba, pero no en la papeleta (art. 171.2). En la papeleta, el orden de las candidaturas no es el del BOE: van primero las que más votos tuvieron en las últimas elecciones al Senado en la provincia, y las nuevas, por sorteo (art. 172.3).",
      ),
      ...h2(
        "Por qué una lista puede cambiar después del 3 de noviembre",
        "Las proclamaciones se pueden recurrir ante el juzgado de lo contencioso-administrativo en los dos días siguientes a su publicación, el 4 y el 5 de noviembre, y según el INE el último día para resolver los recursos es el 12 de noviembre (art. 49 de la LOREG). Mientras hay un recurso en una circunscripción, sus papeletas no se imprimen hasta que se resuelve (art. 71.2).",
        "El BOE también puede publicar correcciones de errores: en las generales de 2023 publicó dos de las candidaturas proclamadas, siete y diez días después. Si las hay, esta página las enlaza encima de las listas y dice a qué provincias afectan.",
      ),
      ...h2(
        "Papeletas: dónde están y quién puede descargarlas",
        "El día de la votación, cada mesa electoral recibe las papeletas y los sobres al menos una hora antes de abrir (art. 71.4 de la LOREG).",
        `El INE ofrece ${a("la descarga de papeletas del 29N", URL.ineBallots)} solo para los electores residentes en el extranjero (CERA), hasta el 26 de noviembre de 2026, y advierte: «Si usted reside en España no las utilice ya que su voto sería nulo».`,
      ),
      ...paras(
        `Dónde te toca votar, el voto por correo y qué documento llevar están en ${b2link("voting", "es", "cómo votar el 29 de noviembre en Cataluña")}. Si te ha tocado estar en una mesa, mira ${b2link("mesa", "es", "miembro de mesa electoral")}; para la noche del 29, ${b2link("electionNight", "es", "a qué hora salen los resultados")}, y para los de otros años, ${b2link("congressResults", "es", "los resultados de las elecciones generales en Cataluña")}.`,
      ),
      faq([
        {
          question: "¿Dónde puedo ver las listas de candidatos de las elecciones generales 2026 en Barcelona?",
          answer:
            "En el BOE: las candidaturas presentadas salen el 28 de octubre y las proclamadas, el 3 de noviembre. Esta página las lee del BOE y las muestra por provincias: Barcelona, Girona, Lleida y Tarragona, Congreso y Senado.",
        },
        {
          question: "¿Cuándo se publican las listas definitivas del 29N?",
          answer:
            "Las juntas electorales proclaman las candidaturas el 2 de noviembre y el BOE las publica el 3 de noviembre. Se pueden recurrir el 4 y el 5 de noviembre, y los recursos deben resolverse como muy tarde el 12 de noviembre.",
        },
        {
          question: "¿Cuántos candidatos al Senado puedo votar en Barcelona?",
          answer:
            "Hasta tres, de la misma candidatura o de distintas. Se eligen cuatro por provincia. Si marcas más de tres el voto es nulo, y si no marcas ninguno es un voto en blanco.",
        },
        {
          question: "¿Puedo tachar nombres o cambiar el orden en la papeleta del Congreso?",
          answer:
            "No. Las listas del Congreso son cerradas: si modificas, añades, marcas o tachas nombres, o alteras su orden, el voto es nulo.",
        },
        {
          question: "¿Qué significa «No proclamada»?",
          answer:
            "Que la junta electoral provincial no ha proclamado esa candidatura porque no cumple algún requisito legal. La decisión se puede recurrir el 4 y el 5 de noviembre.",
        },
        {
          question: "¿Salen los candidatos en el Boletín Oficial de la Provincia?",
          answer:
            "No. En las elecciones generales, las candidaturas presentadas y las proclamadas se publican en el BOE (art. 169.4 de la LOREG). Los boletines provinciales las publican en las elecciones municipales.",
        },
        {
          question: "¿Se pueden descargar las papeletas?",
          answer:
            "El INE las ofrece solo a los electores residentes en el extranjero (CERA), hasta el 26 de noviembre. Si vives en España, no las uses: el voto sería nulo. En la mesa electoral habrá papeletas.",
        },
      ]),
      ...paras(verifiedLine("es", VERIFIED)),
      ...b2Related(["voting", "mesa", "electionNight", "congressResults", "parliamentResults"], "es"),
    ];
  }

  return [
    lead(
      "The candidates in **Spain's general election of 29 November 2026** in Barcelona, Girona, Lleida and Tarragona are those on the lists that the provincial electoral boards publish in the BOE, Spain's official gazette: the lists **as filed on 28 October** and the **proclaimed lists on 3 November**. The lists appear below, province by province, read straight from the BOE as they are published. For Congress you vote for one closed list; for the Senate you can mark up to three names.",
    ),
    LIVE,
    callout(
      "info",
      "How this list is made",
      "It is read every day from the BOE, which is where the law requires general-election candidacies to be published (electoral law, LOREG art. 169.4), not the provincial gazettes. Names, lists and their numbering appear exactly as each electoral board publishes them, unchanged. If the BOE publishes corrections, the link appears above the lists.",
    ),
    ...h2(
      "What Barcelona, Girona, Lleida and Tarragona elect on 29 November",
      "Under Royal Decree 806/2026, which called the election, Catalonia elects **48 of the 350 members** of the Congress of Deputies and **16 senators**, four per province. Each province is a constituency with its own lists: someone voting in Girona can only choose among the Girona lists.",
    ),
    seatsTable("en"),
    ...paras(
      "The other senators who represent Catalonia are appointed by the Parliament of Catalonia and are not voted for on 29 November.",
    ),
    ...h2(
      "When the candidate lists come out",
      "Parties, federations, coalitions and groups of voters file their lists with each provincial electoral board from 21 to 26 October. According to the Ministry of the Interior, the lists as filed are published in the BOE on 28 October and the proclaimed lists on 3 November.",
    ),
    timetable("en"),
    ...paras(
      "In between, the boards tell each list's representatives about any irregularities they have found, and there are 48 hours to put them right. A list that does not meet the requirements is not proclaimed (LOREG art. 47). One requirement is signatures: a group of voters needs those of 1% of the constituency's electoral roll, and a party that won no seat in either chamber at the previous election needs 0.1% (art. 169.3).",
    ),
    ...h2(
      "How the Congress vote works: closed lists",
      "Each Congress list carries as many candidates as the province has seats (32 in Barcelona, 6 in Girona and Tarragona, 4 in Lleida) and, if it wishes, up to 10 substitutes. The ballot paper shows the list's name, acronym and symbol and every name in order.",
      "You vote for the whole list: if you cross out, add or mark names on the Congress ballot, or change their order, the vote is void (art. 96.2). Seats are shared among the lists that reach 3% of the valid votes in the province, using the D'Hondt method, and within each list they go to the candidates in the order they appear (art. 163).",
    ),
    ...h2(
      "How the Senate vote works in Barcelona: up to three candidates",
      "In the Senate each candidate stands individually, even when they run grouped by party. There is a single ballot paper with every candidate in the province, each with a box: you can mark **up to three** names, from the same list or from different ones (art. 166.1). The four candidates with the most votes are elected.",
      "Mark more than three and the vote is void; mark none and it counts as a blank vote, which is valid (art. 96). Each Senate candidate has two substitutes: they appear in the BOE, and in the lists above, but not on the ballot paper (art. 171.2). On the ballot the lists are not in BOE order: those with the most votes at the last Senate election in the province come first, and new ones follow in an order drawn by lot (art. 172.3).",
    ),
    ...h2(
      "Why a list can still change after 3 November",
      "A proclamation can be appealed to the administrative court within two days of its publication, on 4 and 5 November, and according to the INE the last day for appeals to be settled is 12 November (LOREG art. 49). While an appeal is pending in a constituency, its ballot papers are not printed until it is resolved (art. 71.2).",
      "The BOE can also publish corrections: at the 2023 general election it published two for the proclaimed lists, seven and ten days later. If any appear, this page links to them above the lists and says which provinces they concern.",
    ),
    ...h2(
      "Ballot papers: where they are and who can download them",
      "On polling day every polling table receives the ballot papers and envelopes at least an hour before opening (LOREG art. 71.4).",
      `The INE offers ${a("downloadable 29 November ballot papers", URL.ineBallots)} only to voters registered as living abroad (CERA), until 26 November 2026, and warns that anyone living in Spain must not use them, because the vote would be void.`,
    ),
    ...paras(
      `Where you vote, the postal vote and what ID to bring are in ${b2link("voting", "en", "how to vote in Catalonia on 29 November")}. If you have been drawn to staff a polling table, see ${b2link("mesa", "en", "polling-station duty in Spain")}; for the night of the 29th, ${b2link("electionNight", "en", "when the results come out")}; and for earlier years, ${b2link("congressResults", "en", "general election results in Catalonia")}.`,
    ),
    faq([
      {
        question: "Where can I see the candidates for Spain's 2026 general election in Barcelona?",
        answer:
          "In the BOE: the lists as filed come out on 28 October and the proclaimed lists on 3 November. This page reads them from the BOE and shows them by province: Barcelona, Girona, Lleida and Tarragona, Congress and Senate.",
      },
      {
        question: "When are the final candidate lists for 29 November published?",
        answer:
          "The electoral boards proclaim the candidates on 2 November and the BOE publishes them on 3 November. They can be appealed on 4 and 5 November, and appeals must be settled by 12 November at the latest.",
      },
      {
        question: "How many Senate candidates can I vote for in Barcelona?",
        answer:
          "Up to three, from the same list or different ones. Four are elected per province. Mark more than three and the vote is void; mark none and it is a blank vote.",
      },
      {
        question: "Can I cross out names or change the order on the Congress ballot?",
        answer:
          "No. Congress lists are closed: if you change, add, mark or cross out names, or alter their order, the vote is void.",
      },
      {
        question: "What does \"No proclamada\" (not proclaimed) mean?",
        answer:
          "That the provincial electoral board did not proclaim that list because it fails a legal requirement. The decision can be appealed on 4 and 5 November.",
      },
      {
        question: "Are the candidates published in the provincial gazette?",
        answer:
          "No. In a general election, the lists as filed and the proclaimed lists are published in the BOE (LOREG art. 169.4). Provincial gazettes publish them in municipal elections.",
      },
      {
        question: "Can I download the ballot papers?",
        answer:
          "The INE offers them only to voters registered as living abroad (CERA), until 26 November. If you live in Spain, do not use them: the vote would be void. Ballot papers are provided at the polling station.",
      },
    ]),
    ...paras(verifiedLine("en", VERIFIED)),
    ...b2Related(["voting", "mesa", "electionNight", "congressResults", "parliamentResults"], "en"),
  ];
}

export const CANDIDATES: B2Article = {
  key: "candidates",
  entryKey: "guide-general-election-candidates-catalonia",
  categoryKey: "public-services",
  sources: SOURCES,
  // The publisher requires a lead photo. This reuses the how-to-vote guide's
  // second photograph with that file's own alt text and caption, because
  // media rows are keyed by file and different wording would rewrite it there.
  heroKey: VOTING.secondaryKey,
  heroAlt: VOTING.secondaryAlt,
  heroCaption: VOTING.secondaryCaption,
  verifiedAt: VERIFIED,
  publishedAt: "2026-10-25T13:00:00+01:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...META[locale], blocks: body(locale) }]),
  ) as B2Article["editions"],
};
