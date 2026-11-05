/**
 * Words of the 29N official-polls page, in three languages. No poll figure,
 * party name or study number here, ever: title, description, breadcrumb,
 * JSON-LD and the blackout view are built from this file, and they are served
 * inside the LOREG 69.7 window too. A test checks it.
 *
 * Neutral wording: no "who wins", no ranking words, no commentary on any
 * party. The only figures the page prints come from the sources, in the
 * source's order (figures.ts, through data.ts).
 */

import { b2href } from "@/lib/content/batch02/shared";
import { PROVINCE_NAMES, PROVINCES, SEATS, type ProvinceKey } from "@/lib/content/candidates/boe";
import type { Locale } from "@/lib/i18n/config";
import { hubPath } from "@/lib/programmatic/elections/paths";

import type { PollOrg } from "./types";

/** ISO date of the page's last editorial change (metadata, sitemap, JSON-LD). */
export const POLLS_PAGE_UPDATED = "2026-11-05";

export const LOREG_URL = "https://www.boe.es/buscar/act.php?id=BOE-A-1985-11672";
export const LOREG_ART69_URL = "https://www.boe.es/buscar/act.php?id=BOE-A-1985-11672#a69";
const INTERIOR_29N = "https://infoelectoral.interior.gob.es/es/proceso-electoral/Elecciones-Generales-29-N/";
const ELECTION_SITE = "https://29neleccionesgenerales.es/";
const JEC_CALENDAR = "https://www.juntaelectoralcentral.es/cs/jec/documentos/eg2026_calendario.pdf";
/** JEC Acuerdo 458/1999: no estimates of results in the Canaries before 21:00 peninsular time. */
const JEC_CANARIES = "https://www.juntaelectoralcentral.es/cs/jec/doctrina/acuerdos?anyosesion=1999&idacuerdoinstruccion=20597&idsesion=500&template=Doctrina%2FJEC_Detalle";
const GENCAT_29N = "https://eleccions.gencat.cat/ca/eleccions-generals-29n";

export const ORG_NAMES: Record<PollOrg, Record<Locale, string>> = {
  cis: {
    ca: "Centre d'Investigacions Sociològiques (CIS)",
    es: "Centro de Investigaciones Sociológicas (CIS)",
    en: "Centro de Investigaciones Sociológicas (CIS)",
  },
  ceo: {
    ca: "Centre d'Estudis d'Opinió (CEO)",
    es: "Centre d'Estudis d'Opinió (CEO)",
    en: "Centre d'Estudis d'Opinió (CEO)",
  },
};

export const ORG_SITES: Record<PollOrg, string> = {
  cis: "https://www.cis.es/",
  ceo: "https://ceo.gencat.cat/",
};

const MONTHS: Record<Locale, string[]> = {
  ca: ["gener", "febrer", "març", "abril", "maig", "juny", "juliol", "agost", "setembre", "octubre", "novembre", "desembre"],
  es: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};

/** "5 de novembre de 2026" / "5 d'octubre de 2026" / "5 November 2026". */
export function dateLabel(iso: string, locale: Locale): string {
  const [year, month, day] = iso.split("-");
  const name = MONTHS[locale][Number(month) - 1] ?? "";
  if (locale === "en") return `${Number(day)} ${name} ${year}`;
  const of = locale === "ca" && /^[aeiou]/.test(name) ? "d'" : "de ";
  return `${Number(day)} ${of}${name} de ${year}`;
}

/** "del 2 al 9 d'octubre de 2026" style span for fieldwork dates. */
export function spanLabel(from: string, to: string, locale: Locale): string {
  if (from === to) return dateLabel(from, locale);
  const sameMonth = from.slice(0, 7) === to.slice(0, 7);
  const fromDay = String(Number(from.slice(8, 10)));
  if (locale === "en") return sameMonth ? `${fromDay}–${dateLabel(to, locale)}` : `${dateLabel(from, locale).replace(/ \d{4}$/, "")} – ${dateLabel(to, locale)}`;
  const toLabel = dateLabel(to, locale);
  if (locale === "ca") {
    const start = sameMonth ? fromDay : dateLabel(from, locale).replace(/ de \d{4}$/, "");
    const toDay = Number(to.slice(8, 10));
    return `${/^(1|11)\b/.test(start) ? "de l'" : "del "}${start} ${toDay === 1 || toDay === 11 ? "a l'" : "al "}${toLabel}`;
  }
  const start = sameMonth ? fromDay : dateLabel(from, locale).replace(/ de \d{4}$/, "");
  return `del ${start} al ${toLabel}`;
}

export interface PollsCopy {
  title: string;
  seoTitle: string;
  description: string;
  crumb: string;
  lead: string;
  verified: (iso: string) => string;
  ruleTitle: string;
  rule: string;
  blackoutTitle: string;
  blackout: string[];
  pollsTitle: string;
  noPollYet: string;
  published: string;
  study: string;
  scope: string;
  tableParty: string;
  tableVote: string;
  tableVoteCi: string;
  tableSeats: string;
  province: (key: ProvinceKey) => string;
  sheetTitle: string;
  sheet: {
    organisation: string;
    client: string;
    universe: string;
    sample: string;
    margin: string;
    sampling: string;
    mode: string;
    fieldwork: string;
    questions: string;
  };
  linksTitle: string;
  links: { results: string; questionnaire: string; sheet: string; data: string; page: string; official: string };
  expectedTitle: string;
  expectedOn: (iso: string) => string;
  expectedUnknown: string;
  checkedOn: (iso: string) => string;
  readTitle: string;
  read: string[];
  lawTitle: string;
  law: string[];
  resultsTitle: string;
  results: string[];
  faqTitle: string;
  faq: { question: string; answer: string }[];
  sourcesTitle: string;
  sources: { name: string; publisher: string; url: string }[];
}

function seatsLine(locale: Locale): string {
  const parts = PROVINCES.map((key) => `${SEATS[key].deputies} ${locale === "en" ? "in" : locale === "ca" ? "a" : "en"} ${PROVINCE_NAMES[key]}`);
  const total = PROVINCES.reduce((sum, key) => sum + SEATS[key].deputies, 0);
  const and = locale === "en" ? "and" : locale === "ca" ? "i" : "y";
  const noun = locale === "en" ? "deputies" : locale === "ca" ? "diputats" : "diputados";
  return `${total} ${noun} (${parts.slice(0, -1).join(", ")} ${and} ${parts.at(-1)})`;
}

export function pollsCopy(locale: Locale): PollsCopy {
  const seats = seatsLine(locale);
  if (locale === "ca") {
    return {
      title: "Enquestes oficials de les eleccions generals del 29N a Catalunya: CIS i CEO",
      seoTitle: "Enquestes eleccions generals 2026 a Catalunya: CIS i CEO",
      description:
        "Estimació de vot i escons del CIS i del CEO per a les generals del 29N a Catalunya, per províncies quan la font les dona, amb la fitxa tècnica de cada enquesta.",
      crumb: "Enquestes oficials del 29N",
      lead: "Les enquestes de les dues institucions públiques que en fan: el Centre d'Investigacions Sociològiques (CIS), del Govern d'Espanya, i el Centre d'Estudis d'Opinió (CEO), de la Generalitat. Aquí hi ha les seves estimacions de vot i d'escons al Congrés per a Catalunya i, quan les donen, per províncies, amb la fitxa tècnica de cada enquesta. Cap enquesta privada ni de mitjans.",
      verified: (iso) => `Fonts consultades el ${dateLabel(iso, "ca")}`,
      ruleTitle: "Del 24 al 29 de novembre, sense xifres",
      rule: "La llei electoral prohibeix publicar, difondre o reproduir enquestes electorals els cinc dies anteriors a la votació. Del **dimarts 24 de novembre a les 00.00** al **diumenge 29 de novembre a les 21.00** (hora peninsular), quan tanquen els últims col·legis, els de les Canàries, aquesta pàgina no mostra cap xifra d'enquesta.",
      blackoutTitle: "Les enquestes tornen diumenge 29 de novembre a les 21.00",
      blackout: [
        `Del 24 al 28 de novembre la llei electoral prohibeix publicar, difondre o reproduir enquestes electorals per qualsevol mitjà ([LOREG, article 69.7](${LOREG_ART69_URL})). El dia de la votació, segons la Junta Electoral Central, no es poden difondre estimacions de resultats abans que tanquin els col·legis, a les 20.00, ni a les Canàries abans de les 21.00, hora peninsular ([acord 458/1999](${JEC_CANARIES})). Per això ara aquesta pàgina no mostra cap estimació de vot ni d'escons, ni enllaça els informes.`,
        "Les xifres tornen a aquesta pàgina el **diumenge 29 de novembre a les 21.00** (hora peninsular), quan tanquen els col·legis de les Canàries. Des d'aquell moment, el que compta són els resultats oficials del Ministeri de l'Interior (enllaços més avall).",
      ],
      pollsTitle: "Les enquestes del CIS i del CEO",
      noPollYet: "Ni el CIS ni el CEO no han publicat encara cap estimació de vot per a Catalunya per a aquestes eleccions. Quan ho facin, la xifra i la fitxa tècnica sortiran aquí.",
      published: "Publicada el",
      study: "Estudi",
      scope: "Què estima",
      tableParty: "Candidatura (ordre de la font)",
      tableVote: "Vot estimat (%)",
      tableVoteCi: "Interval del vot (%)",
      tableSeats: "Escons a Catalunya",
      province: (key) => `Escons ${PROVINCE_NAMES[key]}`,
      sheetTitle: "Fitxa tècnica",
      sheet: {
        organisation: "Qui l'ha feta",
        client: "Qui l'ha encarregada",
        universe: "Univers",
        sample: "Mostra",
        margin: "Marge d'error",
        sampling: "Mostreig i selecció",
        mode: "Entrevista",
        fieldwork: "Treball de camp",
        questions: "Preguntes",
      },
      linksTitle: "Documents oficials",
      links: { results: "Informe de resultats", questionnaire: "Qüestionari", sheet: "Fitxa tècnica oficial", data: "Microdades", page: "Pàgina de l'estudi", official: "Web oficial" },
      expectedTitle: "Pendents de publicar",
      expectedOn: (iso) => `Data anunciada: ${dateLabel(iso, "ca")}.`,
      expectedUnknown: "Sense data anunciada.",
      checkedOn: (iso) => `Consultat el ${dateLabel(iso, "ca")}.`,
      readTitle: "Com llegir una estimació",
      read: [
        "Una estimació no és un resultat. Cada institució parteix de les respostes d'una mostra i hi aplica el seu propi model per calcular el vot probable de cada candidatura; el mètode surt als seus informes. Per això el CIS i el CEO poden donar xifres diferents, i sovint les donen en forquilla.",
        `Els escons es reparteixen per províncies. Catalunya escull ${seats}, amb el sistema d'Hondt entre les candidatures que arriben al 3 % dels vots vàlids de cada província.`,
        "Aquesta pàgina reprodueix les xifres tal com les publica cada institució, amb les candidatures en el mateix ordre que la font, sense arrodonir-les ni combinar-les.",
      ],
      lawTitle: "Què diu la llei electoral",
      law: [
        `L'article 69 de la [LOREG](${LOREG_ART69_URL}) regula les enquestes electorals. Segons l'apartat 1, qui en publica una ha d'indicar-ne la fitxa tècnica: el nom i el domicili de qui l'ha feta i de qui l'ha encarregada, el sistema de mostreig, la mida de la mostra, el marge d'error, el nivell de representativitat, el procediment de selecció de les persones entrevistades, les dates del treball de camp, i el text íntegre de les preguntes amb el nombre de persones que no n'han contestat cadascuna. Per això cada enquesta d'aquesta pàgina porta la seva fitxa i l'enllaç al qüestionari oficial.`,
        "Durant els cinc dies anteriors a la votació, del 24 al 28 de novembre, la llei prohibeix publicar, difondre o reproduir enquestes electorals per qualsevol mitjà (apartat 7), i la Junta Electoral Central vetlla perquè es compleixi (apartat 2). Aquesta pàgina tampoc no en mostra cap el dia de la votació fins que tanquen els últims col·legis, els de les Canàries, a les 21.00 hora peninsular.",
      ],
      resultsTitle: "Els resultats oficials del 29N",
      results: [
        `La nit del 29 de novembre, el Ministeri de l'Interior publica l'escrutini provisional a mesura que es compten les meses. Encara no n'ha anunciat la web de resultats; fins aleshores, la referència és la [web oficial de les eleccions](${ELECTION_SITE}) i la pàgina del 29N a [Infoelectoral](${INTERIOR_29N}). La Generalitat té una [pàgina informativa del 29N](${GENCAT_29N}).`,
        `Com funciona la nit i quan són oficials els resultats: [nit electoral del 29N](${b2href("electionNight", "ca")}). Qui es presenta a cada província: [candidats al Congrés i al Senat](${b2href("candidates", "ca")}). Com i on votar: [com votar a Catalunya](${b2href("voting", "ca")}). Resultats anteriors de cada municipi: [resultats electorals per municipi](${hubPath("ca")}).`,
      ],
      faqTitle: "Preguntes freqüents",
      faq: [
        {
          question: "Quan no es poden publicar enquestes de les eleccions del 29N?",
          answer: "Del dimarts 24 al dissabte 28 de novembre, els cinc dies anteriors a la votació (article 69.7 de la LOREG). Aquesta pàgina retira les xifres des del 24 de novembre a les 00.00 fins al diumenge 29 a les 21.00 (hora peninsular), quan tanquen els col·legis de les Canàries.",
        },
        {
          question: "Quines enquestes són oficials?",
          answer: "Les de les institucions públiques que fan enquestes electorals: el CIS, organisme del Govern d'Espanya, i el CEO, de la Generalitat de Catalunya. Totes dues publiquen la fitxa tècnica, el qüestionari i les microdades de cada estudi.",
        },
        {
          question: "Per què l'enquesta del CIS i la del CEO no coincideixen?",
          answer: "Perquè tenen mostres, dates de treball de camp i models d'estimació diferents. Cadascuna explica el seu mètode a l'informe de resultats, enllaçat a la seva fitxa.",
        },
      ],
      sourcesTitle: "Fonts",
      sources: [
        { name: "Llei orgànica 5/1985, del règim electoral general, article 69 (text consolidat)", publisher: "BOE", url: LOREG_URL },
        { name: "Calendari electoral, eleccions generals del 29 de novembre de 2026", publisher: "Junta Electoral Central", url: JEC_CALENDAR },
        { name: "Eleccions generals 29-N", publisher: "Ministeri de l'Interior", url: INTERIOR_29N },
        { name: "Centre d'Investigacions Sociològiques", publisher: "CIS", url: ORG_SITES.cis },
        { name: "Centre d'Estudis d'Opinió", publisher: "Generalitat de Catalunya", url: ORG_SITES.ceo },
      ],
    };
  }
  if (locale === "es") {
    return {
      title: "Encuestas oficiales de las elecciones generales del 29N en Cataluña: CIS y CEO",
      seoTitle: "Encuestas elecciones generales 2026 en Cataluña: CIS y CEO",
      description:
        "CIS y CEO: estimación de voto y escaños para las generales del 29N en Cataluña, por provincias cuando la fuente las da, con la ficha técnica de cada encuesta.",
      crumb: "Encuestas oficiales del 29N",
      lead: "Las encuestas de las dos instituciones públicas que las hacen: el Centro de Investigaciones Sociológicas (CIS), del Gobierno de España, y el Centre d'Estudis d'Opinió (CEO), de la Generalitat. Aquí están sus estimaciones de voto y de escaños al Congreso para Cataluña y, cuando las dan, por provincias, con la ficha técnica de cada encuesta. Ninguna encuesta privada ni de medios.",
      verified: (iso) => `Fuentes consultadas el ${dateLabel(iso, "es")}`,
      ruleTitle: "Del 24 al 29 de noviembre, sin cifras",
      rule: "La ley electoral prohíbe publicar, difundir o reproducir encuestas electorales los cinco días anteriores a la votación. Del **martes 24 de noviembre a las 00:00** al **domingo 29 de noviembre a las 21:00** (hora peninsular), cuando cierran los últimos colegios, los de Canarias, esta página no muestra ninguna cifra de encuesta.",
      blackoutTitle: "Las encuestas vuelven el domingo 29 de noviembre a las 21:00",
      blackout: [
        `Del 24 al 28 de noviembre la ley electoral prohíbe publicar, difundir o reproducir sondeos electorales por cualquier medio ([LOREG, artículo 69.7](${LOREG_ART69_URL})). El día de la votación, según la Junta Electoral Central, no se pueden difundir estimaciones de resultados antes de que cierren los colegios, a las 20:00, ni en Canarias antes de las 21:00, hora peninsular ([acuerdo 458/1999](${JEC_CANARIES})). Por eso ahora esta página no muestra ninguna estimación de voto ni de escaños, ni enlaza los informes.`,
        "Las cifras vuelven a esta página el **domingo 29 de noviembre a las 21:00** (hora peninsular), cuando cierran los colegios de Canarias. Desde ese momento, lo que cuenta son los resultados oficiales del Ministerio del Interior (enlaces más abajo).",
      ],
      pollsTitle: "Las encuestas del CIS y del CEO",
      noPollYet: "Ni el CIS ni el CEO han publicado todavía ninguna estimación de voto para Cataluña para estas elecciones. Cuando lo hagan, la cifra y la ficha técnica saldrán aquí.",
      published: "Publicada el",
      study: "Estudio",
      scope: "Qué estima",
      tableParty: "Candidatura (orden de la fuente)",
      tableVote: "Voto estimado (%)",
      tableVoteCi: "Intervalo del voto (%)",
      tableSeats: "Escaños en Cataluña",
      province: (key) => `Escaños ${PROVINCE_NAMES[key]}`,
      sheetTitle: "Ficha técnica",
      sheet: {
        organisation: "Quién la ha hecho",
        client: "Quién la ha encargado",
        universe: "Universo",
        sample: "Muestra",
        margin: "Margen de error",
        sampling: "Muestreo y selección",
        mode: "Entrevista",
        fieldwork: "Trabajo de campo",
        questions: "Preguntas",
      },
      linksTitle: "Documentos oficiales",
      links: { results: "Informe de resultados", questionnaire: "Cuestionario", sheet: "Ficha técnica oficial", data: "Microdatos", page: "Página del estudio", official: "Web oficial" },
      expectedTitle: "Pendientes de publicar",
      expectedOn: (iso) => `Fecha anunciada: ${dateLabel(iso, "es")}.`,
      expectedUnknown: "Sin fecha anunciada.",
      checkedOn: (iso) => `Consultado el ${dateLabel(iso, "es")}.`,
      readTitle: "Cómo leer una estimación",
      read: [
        "Una estimación no es un resultado. Cada institución parte de las respuestas de una muestra y aplica su propio modelo para calcular el voto probable de cada candidatura; el método figura en sus informes. Por eso el CIS y el CEO pueden dar cifras distintas, y a menudo las dan en horquilla.",
        `Los escaños se reparten por provincias. Cataluña elige ${seats}, con el sistema D'Hondt entre las candidaturas que llegan al 3 % de los votos válidos de cada provincia.`,
        "Esta página reproduce las cifras tal como las publica cada institución, con las candidaturas en el mismo orden que la fuente, sin redondearlas ni combinarlas.",
      ],
      lawTitle: "Qué dice la ley electoral",
      law: [
        `El artículo 69 de la [LOREG](${LOREG_ART69_URL}) regula los sondeos electorales. Según su apartado 1, quien publica uno debe indicar su ficha técnica: el nombre y el domicilio de quien lo ha hecho y de quien lo ha encargado, el sistema de muestreo, el tamaño de la muestra, el margen de error, el nivel de representatividad, el procedimiento de selección de los encuestados, las fechas del trabajo de campo, y el texto íntegro de las preguntas con el número de personas que no han contestado a cada una. Por eso cada encuesta de esta página lleva su ficha y el enlace al cuestionario oficial.`,
        "Durante los cinco días anteriores a la votación, del 24 al 28 de noviembre, la ley prohíbe publicar, difundir o reproducir sondeos electorales por cualquier medio (apartado 7), y la Junta Electoral Central vela por que se cumpla (apartado 2). Esta página tampoco muestra ninguno el día de la votación hasta que cierran los últimos colegios, los de Canarias, a las 21:00 hora peninsular.",
      ],
      resultsTitle: "Los resultados oficiales del 29N",
      results: [
        `La noche del 29 de noviembre, el Ministerio del Interior publica el escrutinio provisional a medida que se cuentan las mesas. Todavía no ha anunciado su web de resultados; hasta entonces, la referencia es la [web oficial de las elecciones](${ELECTION_SITE}) y la página del 29N en [Infoelectoral](${INTERIOR_29N}). La Generalitat tiene una [página informativa del 29N](${GENCAT_29N}).`,
        `Cómo funciona la noche y cuándo son oficiales los resultados: [noche electoral del 29N](${b2href("electionNight", "es")}). Quién se presenta en cada provincia: [candidatos al Congreso y al Senado](${b2href("candidates", "es")}). Cómo y dónde votar: [cómo votar en Cataluña](${b2href("voting", "es")}). Resultados anteriores de cada municipio: [resultados electorales por municipio](${hubPath("es")}).`,
      ],
      faqTitle: "Preguntas frecuentes",
      faq: [
        {
          question: "¿Cuándo no se pueden publicar encuestas de las elecciones del 29N?",
          answer: "Del martes 24 al sábado 28 de noviembre, los cinco días anteriores a la votación (artículo 69.7 de la LOREG). Esta página retira las cifras desde el 24 de noviembre a las 00:00 hasta el domingo 29 a las 21:00 (hora peninsular), cuando cierran los colegios de Canarias.",
        },
        {
          question: "¿Qué encuestas son oficiales?",
          answer: "Las de las instituciones públicas que hacen encuestas electorales: el CIS, organismo del Gobierno de España, y el CEO, de la Generalitat de Cataluña. Ambas publican la ficha técnica, el cuestionario y los microdatos de cada estudio.",
        },
        {
          question: "¿Por qué la encuesta del CIS y la del CEO no coinciden?",
          answer: "Porque tienen muestras, fechas de trabajo de campo y modelos de estimación distintos. Cada una explica su método en el informe de resultados, enlazado en su ficha.",
        },
      ],
      sourcesTitle: "Fuentes",
      sources: [
        { name: "Ley Orgánica 5/1985, del Régimen Electoral General, artículo 69 (texto consolidado)", publisher: "BOE", url: LOREG_URL },
        { name: "Calendario electoral, elecciones generales del 29 de noviembre de 2026", publisher: "Junta Electoral Central", url: JEC_CALENDAR },
        { name: "Elecciones Generales 29-N", publisher: "Ministerio del Interior", url: INTERIOR_29N },
        { name: "Centro de Investigaciones Sociológicas", publisher: "CIS", url: ORG_SITES.cis },
        { name: "Centre d'Estudis d'Opinió", publisher: "Generalitat de Catalunya", url: ORG_SITES.ceo },
      ],
    };
  }
  return {
    title: "Official polls for Spain's 29 November general election in Catalonia: CIS and CEO",
    seoTitle: "Spain election polls 2026 in Catalonia: CIS and CEO",
    description:
      "CIS and CEO vote and seat estimates for Catalonia at Spain's 29 November general election, by province where given, with each poll's technical sheet.",
    crumb: "Official 29N polls",
    lead: "Polls from the two public bodies that run them: the Centro de Investigaciones Sociológicas (CIS), part of the Spanish government, and the Centre d'Estudis d'Opinió (CEO), part of the Catalan government. Their vote and Congress seat estimates for Catalonia and, where they give them, for each province, with each poll's technical sheet. No private or media polls.",
    verified: (iso) => `Sources checked on ${dateLabel(iso, "en")}`,
    ruleTitle: "No figures from 24 to 29 November",
    rule: "Spanish electoral law bans publishing, broadcasting or reproducing election polls in the five days before the vote. From **Tuesday 24 November at 00:00** to **Sunday 29 November at 21:00** (Madrid time), when the last polling stations close in the Canary Islands, this page shows no poll figures.",
    blackoutTitle: "The polls return on Sunday 29 November at 21:00 (Madrid time)",
    blackout: [
      `From 24 to 28 November Spanish electoral law bans publishing, broadcasting or reproducing election polls in any medium ([LOREG, article 69.7](${LOREG_ART69_URL})). On polling day, according to the Junta Electoral Central, estimates of results may not be released before the polls close at 20:00, nor in the Canary Islands before 21:00 Madrid time ([agreement 458/1999](${JEC_CANARIES})). That is why this page shows no vote or seat estimate right now, and does not link the reports.`,
      "The figures return to this page on **Sunday 29 November at 21:00** (Madrid time), when polling stations close in the Canary Islands. From then on, what counts are the official results from Spain's Ministry of the Interior (links below).",
    ],
    pollsTitle: "The CIS and CEO polls",
    noPollYet: "Neither the CIS nor the CEO has yet published a vote estimate for Catalonia for this election. When they do, the figures and the technical sheet will appear here.",
    published: "Published on",
    study: "Study",
    scope: "What it estimates",
    tableParty: "Party or coalition (source's order)",
    tableVote: "Estimated vote (%)",
    tableVoteCi: "Vote interval (%)",
    tableSeats: "Seats in Catalonia",
    province: (key) => `Seats ${PROVINCE_NAMES[key]}`,
    sheetTitle: "Technical sheet",
    sheet: {
      organisation: "Conducted by",
      client: "Commissioned by",
      universe: "Population",
      sample: "Sample",
      margin: "Margin of error",
      sampling: "Sampling and selection",
      mode: "Interviews",
      fieldwork: "Fieldwork",
      questions: "Questions",
    },
    linksTitle: "Official documents",
    links: { results: "Results report", questionnaire: "Questionnaire", sheet: "Official technical sheet", data: "Microdata", page: "Study page", official: "Official website" },
    expectedTitle: "Not yet published",
    expectedOn: (iso) => `Announced date: ${dateLabel(iso, "en")}.`,
    expectedUnknown: "No date announced.",
    checkedOn: (iso) => `Checked on ${dateLabel(iso, "en")}.`,
    readTitle: "How to read an estimate",
    read: [
      "An estimate is not a result. Each body starts from a sample's answers and applies its own model to work out each list's likely vote; the method is set out in its reports. That is why the CIS and the CEO can give different figures, often as ranges.",
      `Seats are allocated by province. Catalonia elects ${seats}, by the D'Hondt method among lists with at least 3% of the valid votes in each province.`,
      "This page reproduces the figures exactly as each body publishes them, with the lists in the source's order, neither rounded nor combined.",
    ],
    lawTitle: "What the electoral law says",
    law: [
      `Article 69 of the electoral law ([LOREG](${LOREG_ART69_URL})) governs election polls. Under its first paragraph, anyone publishing one must give its technical sheet: the name and address of who ran it and who commissioned it, the sampling system, sample size, margin of error, level of representativeness, how respondents were selected, the fieldwork dates, and the full text of the questions with the number of people who did not answer each one. That is why every poll on this page carries its sheet and a link to the official questionnaire.`,
      "In the five days before the vote, 24 to 28 November, the law bans publishing, broadcasting or reproducing election polls in any medium (paragraph 7), and the Junta Electoral Central enforces it (paragraph 2). This page also shows none on polling day until the last polling stations close, in the Canary Islands, at 21:00 Madrid time.",
    ],
    resultsTitle: "Official results on 29 November",
    results: [
      `On the night of 29 November, Spain's Ministry of the Interior publishes the provisional count as polling stations report. It has not yet announced its results website; until it does, the references are the [official election website](${ELECTION_SITE}) and the 29N page on [Infoelectoral](${INTERIOR_29N}). The Catalan government has a [29N information page](${GENCAT_29N}).`,
      `How the night works and when results become official: [election night on 29 November](${b2href("electionNight", "en")}). Who is standing in each province: [Congress and Senate candidates](${b2href("candidates", "en")}). How and where to vote: [how to vote in Catalonia](${b2href("voting", "en")}). Past results by town: [election results by town](${hubPath("en")}).`,
    ],
    faqTitle: "Frequently asked questions",
    faq: [
      {
        question: "When can polls not be published before the 29 November election?",
        answer: "From Tuesday 24 to Saturday 28 November, the five days before the vote (article 69.7 of the LOREG). This page removes the figures from 24 November at 00:00 until Sunday 29 November at 21:00 Madrid time, when polling stations close in the Canary Islands.",
      },
      {
        question: "Which polls are official?",
        answer: "Those of the public bodies that run election polls: the CIS, part of the Spanish government, and the CEO, part of the Generalitat de Catalunya. Both publish each study's technical sheet, questionnaire and microdata.",
      },
      {
        question: "Why do the CIS and CEO polls differ?",
        answer: "They use different samples, fieldwork dates and estimation models. Each explains its method in the results report linked from its sheet.",
      },
    ],
    sourcesTitle: "Sources",
    sources: [
      { name: "Organic Law 5/1985 on the general electoral system, article 69 (consolidated text)", publisher: "BOE", url: LOREG_URL },
      { name: "Election calendar, general election of 29 November 2026", publisher: "Junta Electoral Central", url: JEC_CALENDAR },
      { name: "Elecciones Generales 29-N", publisher: "Ministry of the Interior", url: INTERIOR_29N },
      { name: "Centro de Investigaciones Sociológicas", publisher: "CIS", url: ORG_SITES.cis },
      { name: "Centre d'Estudis d'Opinió", publisher: "Generalitat de Catalunya", url: ORG_SITES.ceo },
    ],
  };
}
