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
 * How to vote in Catalonia: the 29 November 2026 general election first, the
 * 23 May 2027 municipal elections next.
 *
 * Election date and campaign from Real Decreto 806/2026 (BOE 6 Oct 2026,
 * checked against the BOE text on 12 Oct 2026); voter calendar from the INE's
 * Oficina del Censo Electoral; rules from the LOREG; seats from the decree's
 * annex (research_notes/blog-batch-03/elections.md).
 *
 * The URL is evergreen on purpose: after 29 November the same page switches
 * its worked example to the municipal elections, whose date is fixed by law
 * (LOREG art. 42.3, fourth Sunday of May). Strictly procedural and
 * non-partisan: no parties, candidates, polls or predictions.
 */

const VERIFIED = "2026-10-12";

const SOURCES: B2Source[] = [
  { name: "Real Decreto 806/2026, de disolución del Congreso y del Senado y de convocatoria de elecciones", url: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20742", publisher: "Boletín Oficial del Estado" },
  { name: "Calendario Elecciones a Cortes Generales de 2026", url: "https://www.ine.es/dyngs/CEL/index.htm?cid=1702", publisher: "INE — Oficina del Censo Electoral" },
  { name: "Consulta de mesa y local electoral", url: "https://sede.ine.gob.es/ce-mesas/?lang=es_ES", publisher: "INE — Oficina del Censo Electoral" },
  { name: "Voto por correo", url: "https://www.correos.es/es/es/particulares/para-el-ciudadano/voto-por-correo", publisher: "Correos" },
  { name: "Ley Orgánica 5/1985, del Régimen Electoral General", url: "https://www.boe.es/buscar/act.php?id=BOE-A-1985-11672", publisher: "Boletín Oficial del Estado" },
  { name: "Ciudadanos de la UE: elecciones municipales de 23 de mayo de 2027", url: "https://www.ine.es/dyngs/CEL/index.htm?cid=383", publisher: "INE — Oficina del Censo Electoral" },
];

const URL = {
  mesas: "https://sede.ine.gob.es/ce-mesas/?lang=es_ES",
  correos: "https://www.correos.es/es/es/particulares/para-el-ciudadano/voto-por-correo",
  tracking: "https://sede.ine.gob.es/ce-votoxcorreo/?lang=es_ES",
  eu: "https://sede.ine.gob.es/tramite/manifestacion_voluntad_voto/",
};
const a = (label: string, url: string) => `[${label}](${url})`;

const META: Record<Locale, { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    path: "guies/com-votar-eleccions-catalunya",
    title: "Com votar a Catalunya: eleccions generals del 29 de novembre de 2026",
    seoTitle: "Eleccions 29N a Catalunya: com votar i terminis",
    seoDescription:
      "Eleccions generals el 29 de novembre de 2026: on votes, vot per correu fins al 19 de novembre i consulta del cens fins al 19 d'octubre. Terminis oficials.",
    excerpt:
      "Tot el que cal per votar a les eleccions generals del 29 de novembre a Catalunya: on et toca votar, el vot per correu i els terminis oficials.",
  },
  es: {
    path: "guias/como-votar-elecciones-cataluna",
    title: "Cómo votar en Cataluña: elecciones generales del 29 de noviembre de 2026",
    seoTitle: "Elecciones 29N en Cataluña: cómo votar y plazos",
    seoDescription:
      "Elecciones generales el 29 de noviembre de 2026: dónde votas, voto por correo hasta el 19 de noviembre y consulta del censo hasta el 19 de octubre. Plazos oficiales.",
    excerpt:
      "Todo lo necesario para votar en las elecciones generales del 29 de noviembre en Cataluña: dónde te toca votar, el voto por correo y los plazos oficiales.",
  },
  en: {
    path: "guides/how-to-vote-catalonia",
    title: "How to vote in Catalonia: the 29 November 2026 general election",
    seoTitle: "Spain election 29 November 2026: how to vote in Catalonia",
    seoDescription:
      "Spain's general election is on 29 November 2026: where you vote, postal vote requests until 19 November and the roll check until 19 October. Official deadlines.",
    excerpt:
      "What you need to vote in the 29 November general election in Catalonia: finding your polling station, the postal vote and the official deadlines.",
  },
};

type T = {
  lead: string;
  calCaption: string; calHeaders: string[]; calRows: string[][]; calNote: string;
  seatsTitle: string; seats: string[];
  whereTitle: string; where: string[];
  postTitle: string; post: string[];
  abroadTitle: string; abroad: string[];
  muniTitle: string; muni: string[];
  faq: { question: string; answer: string }[];
  note: string;
  warnTitle: string; warn: string;
};

const COPY: Record<Locale, T> = {
  en: {
    lead: "Spain holds a **general election on Sunday 29 November 2026**, called by Royal Decree 806/2026 (BOE, 6 October 2026), to elect the Congress of Deputies and the Senate. The campaign runs from 13 to 27 November. Several deadlines fall long before polling day, and the first one, checking the electoral roll, closes on **19 October**.",
    calCaption: "Voter calendar for 29 November 2026",
    calHeaders: ["What", "When (2026)"],
    calRows: [
      ["Check the electoral roll and file claims", "12–19 October"],
      ["Request a postal vote (at Correos)", "6 October – 19 November"],
      ["Voter card with your polling station sent by post", "2–10 November"],
      ["Postal-vote documents sent to you", "9–22 November"],
      ["Hand in your postal vote at Correos", "by 25 November"],
      ["Election campaign", "13–27 November"],
      ["Polling day", "Sunday 29 November"],
    ],
    calNote: "From the INE's Oficina del Censo Electoral calendar and Correos, checked on 12 October 2026.",
    seatsTitle: "What is elected in Catalonia",
    seats: [
      "Catalonia's four provinces elect **48 of the 350 deputies**: Barcelona 32, Girona 6, Tarragona 6 and Lleida 4. Each province also elects four senators. The roll used is the one closed on 1 August 2026.",
    ],
    whereTitle: "Where do I vote?",
    where: [
      `The INE's ${a("polling-station finder", URL.mesas)} tells you your table and venue without any login. To see your full entry on the roll you need Cl@ve, or you can ask at your town hall, or call the free line 900 343 232 (Monday to Friday, 9:00–14:00). You will also receive a voter card by post between 2 and 10 November with your table and venue.`,
      "If something is wrong with your entry, the window to claim inclusion or correction is **12 to 19 October**.",
    ],
    postTitle: "Postal vote",
    post: [
      `Anyone who will be away on polling day, or cannot go in person, can vote by post. Request it **by 19 November** at any Correos post office, **in person and with your original ID** (a photocopy is not accepted), or online with a digital certificate on ${a("Correos", URL.correos)}. People who are ill or disabled can request it through a notarised representative.`,
      `Correos sends the ballot papers between 9 and 22 November; hand your vote back at Correos **by 25 November** (no postage needed). You can ${a("track the documents", URL.tracking)} online. Once you have requested a postal vote, you can no longer vote in person at the polling station.`,
    ],
    abroadTitle: "If you are abroad",
    abroad: [
      "**Temporarily abroad (ERTA)** but living in Spain: register at the consulate as a non-resident and request the vote there **by 31 October**.",
      "**Living abroad (CERA):** the documents arrive automatically, with no request. You can post your vote to the consulate between 4 and 24 November or vote in the ballot box at the consulate from 21 to 26 November. Do not post it to the electoral board in Spain: those votes are void.",
    ],
    muniTitle: "Next: municipal elections on 23 May 2027",
    muni: [
      "Local elections are held by law on the fourth Sunday of May, so the next ones are on **23 May 2027**. Only Spanish citizens vote in the general election, but **EU citizens** living in Spain can vote in the municipal ones if they are registered on the padró and have declared their wish to vote, **by 30 December 2026** for 2027.",
      `EU citizens can make that declaration online on the ${a("INE's site", URL.eu)}, by post or at the town hall, and it stays valid for future elections. Some non-EU nationals with a reciprocity agreement can also vote, but they must apply each time; the 2027 list and window have not been published yet.`,
    ],
    faq: [
      { question: "When is the next general election in Spain?", answer: "Sunday 29 November 2026, called by Royal Decree 806/2026, published in the BOE on 6 October 2026." },
      { question: "Until when can I request a postal vote?", answer: "Until 19 November 2026, in person at Correos with your original ID or online with a digital certificate; the vote must be handed in by 25 November." },
      { question: "How do I find out where I vote?", answer: "On the INE's polling-station finder, without a login, or on the voter card that arrives by post between 2 and 10 November." },
      { question: "Can foreigners vote in Catalonia?", answer: "Not in the general election. EU citizens can vote in the municipal elections of 23 May 2027 if they register their wish to vote by 30 December 2026." },
    ],
    note: "Electoral deadlines are fixed by law and by the INE; check the official calendar if a date seems to have changed.",
    warnTitle: "Check the roll before 19 October",
    warn: "If you have moved recently, check your entry now: claims to the electoral roll can only be made from 12 to 19 October.",
  },
  es: {
    lead: "España celebra **elecciones generales el domingo 29 de noviembre de 2026**, convocadas por el Real Decreto 806/2026 (BOE del 6 de octubre de 2026), para elegir el Congreso de los Diputados y el Senado. La campaña va del 13 al 27 de noviembre. Varios plazos vencen mucho antes, y el primero, la consulta del censo, termina el **19 de octubre**.",
    calCaption: "Calendario del votante para el 29 de noviembre de 2026",
    calHeaders: ["Qué", "Cuándo (2026)"],
    calRows: [
      ["Consulta del censo y reclamaciones", "12–19 de octubre"],
      ["Solicitud del voto por correo (en Correos)", "6 de octubre – 19 de noviembre"],
      ["Envío de la tarjeta censal con tu mesa", "2–10 de noviembre"],
      ["Envío de la documentación del voto por correo", "9–22 de noviembre"],
      ["Entrega del voto por correo en Correos", "hasta el 25 de noviembre"],
      ["Campaña electoral", "13–27 de noviembre"],
      ["Jornada electoral", "Domingo 29 de noviembre"],
    ],
    calNote: "Del calendario de la Oficina del Censo Electoral (INE) y de Correos, comprobado el 12 de octubre de 2026.",
    seatsTitle: "Qué se elige en Cataluña",
    seats: [
      "Las cuatro provincias catalanas eligen **48 de los 350 diputados**: Barcelona 32, Girona 6, Tarragona 6 y Lleida 4. Cada provincia elige además cuatro senadores. El censo que se usa es el cerrado a 1 de agosto de 2026.",
    ],
    whereTitle: "¿Dónde voto?",
    where: [
      `El ${a("buscador de mesas del INE", URL.mesas)} te dice tu mesa y local sin identificarte. Para ver tu inscripción completa en el censo necesitas Cl@ve, o puedes preguntar en tu ayuntamiento o llamar al teléfono gratuito 900 343 232 (de lunes a viernes, de 9:00 a 14:00). Además, entre el 2 y el 10 de noviembre te llegará por correo la tarjeta censal con tu mesa y local.`,
      "Si tu inscripción tiene algún error, el plazo para reclamar es del **12 al 19 de octubre**.",
    ],
    postTitle: "Voto por correo",
    post: [
      `Quien no vaya a estar en su localidad el día de la votación, o no pueda ir en persona, puede votar por correo. Hay que pedirlo **hasta el 19 de noviembre** en cualquier oficina de Correos, **en persona y con el DNI original** (no se acepta fotocopia), o por internet con certificado digital en ${a("Correos", URL.correos)}. Las personas enfermas o con discapacidad pueden pedirlo mediante un representante con poder notarial.`,
      `Correos envía las papeletas entre el 9 y el 22 de noviembre; hay que entregar el voto en Correos **hasta el 25 de noviembre** (no necesita franqueo). Puedes ${a("seguir el envío", URL.tracking)} por internet. Quien pide el voto por correo ya no puede votar en persona en la mesa.`,
    ],
    abroadTitle: "Si estás en el extranjero",
    abroad: [
      "**Temporalmente en el extranjero (ERTA)** pero residente en España: inscríbete en el consulado como no residente y pide allí el voto **hasta el 31 de octubre**.",
      "**Residentes en el extranjero (CERA):** la documentación llega de oficio, sin solicitud. Puedes enviar el voto al consulado entre el 4 y el 24 de noviembre o depositarlo en la urna del consulado del 21 al 26 de noviembre. No lo envíes a la junta electoral en España: esos votos son nulos.",
    ],
    muniTitle: "Después: municipales del 23 de mayo de 2027",
    muni: [
      "Por ley, las elecciones locales se celebran el cuarto domingo de mayo, así que las próximas son el **23 de mayo de 2027**. En las generales solo votan los ciudadanos españoles, pero los **ciudadanos de la UE** residentes en España pueden votar en las municipales si están empadronados y han manifestado su voluntad de votar, **antes del 30 de diciembre de 2026** para 2027.",
      `Los ciudadanos de la UE pueden hacer esa declaración en línea en la ${a("sede del INE", URL.eu)}, por correo o en el ayuntamiento, y sirve para las elecciones siguientes. Algunos nacionales de fuera de la UE con convenio de reciprocidad también pueden votar, pero lo deben solicitar cada vez; la lista y el plazo de 2027 aún no se han publicado.`,
    ],
    faq: [
      { question: "¿Cuándo son las próximas elecciones generales?", answer: "El domingo 29 de noviembre de 2026, convocadas por el Real Decreto 806/2026, publicado en el BOE el 6 de octubre de 2026." },
      { question: "¿Hasta cuándo se puede pedir el voto por correo?", answer: "Hasta el 19 de noviembre de 2026, en persona en Correos con el DNI original o por internet con certificado digital; el voto se entrega hasta el 25 de noviembre." },
      { question: "¿Cómo sé dónde me toca votar?", answer: "En el buscador de mesas del INE, sin identificarte, o en la tarjeta censal que llega por correo entre el 2 y el 10 de noviembre." },
      { question: "¿Pueden votar los extranjeros en Cataluña?", answer: "En las generales, no. Los ciudadanos de la UE pueden votar en las municipales del 23 de mayo de 2027 si manifiestan su voluntad de votar antes del 30 de diciembre de 2026." },
    ],
    note: "Los plazos electorales los fija la ley y el INE: consulta el calendario oficial si una fecha parece haber cambiado.",
    warnTitle: "Consulta el censo antes del 19 de octubre",
    warn: "Si te has mudado hace poco, comprueba tu inscripción ahora: las reclamaciones al censo solo se pueden hacer del 12 al 19 de octubre.",
  },
  ca: {
    lead: "Espanya celebra **eleccions generals el diumenge 29 de novembre de 2026**, convocades pel Reial decret 806/2026 (BOE del 6 d'octubre de 2026), per escollir el Congrés dels Diputats i el Senat. La campanya va del 13 al 27 de novembre. Diversos terminis vencen molt abans, i el primer, la consulta del cens, acaba el **19 d'octubre**.",
    calCaption: "Calendari del votant per al 29 de novembre de 2026",
    calHeaders: ["Què", "Quan (2026)"],
    calRows: [
      ["Consulta del cens i reclamacions", "12–19 d'octubre"],
      ["Sol·licitud del vot per correu (a Correus)", "6 d'octubre – 19 de novembre"],
      ["Enviament de la targeta censal amb la teva mesa", "2–10 de novembre"],
      ["Enviament de la documentació del vot per correu", "9–22 de novembre"],
      ["Lliurament del vot per correu a Correus", "fins al 25 de novembre"],
      ["Campanya electoral", "13–27 de novembre"],
      ["Jornada electoral", "Diumenge 29 de novembre"],
    ],
    calNote: "Del calendari de l'Oficina del Cens Electoral (INE) i de Correus, comprovat el 12 d'octubre de 2026.",
    seatsTitle: "Què s'escull a Catalunya",
    seats: [
      "Les quatre províncies catalanes escullen **48 dels 350 diputats**: Barcelona 32, Girona 6, Tarragona 6 i Lleida 4. Cada província escull a més quatre senadors. El cens que s'utilitza és el tancat a 1 d'agost de 2026.",
    ],
    whereTitle: "On voto?",
    where: [
      `El ${a("cercador de meses de l'INE", URL.mesas)} et diu la mesa i el local sense identificar-te. Per veure la inscripció completa al cens necessites Cl@ve, o pots preguntar a l'ajuntament o trucar al telèfon gratuït 900 343 232 (de dilluns a divendres, de 9:00 a 14:00). A més, entre el 2 i el 10 de novembre et arribarà per correu la targeta censal amb la mesa i el local.`,
      "Si la teva inscripció té algun error, el termini per reclamar és del **12 al 19 d'octubre**.",
    ],
    postTitle: "Vot per correu",
    post: [
      `Qui no serà a la seva localitat el dia de la votació, o no hi pot anar en persona, pot votar per correu. Cal demanar-lo **fins al 19 de novembre** a qualsevol oficina de Correus, **en persona i amb el DNI original** (no s'accepta fotocòpia), o per internet amb certificat digital a ${a("Correus", URL.correos)}. Les persones malaltes o amb discapacitat el poden demanar mitjançant un representant amb poder notarial.`,
      `Correus envia les paperetes entre el 9 i el 22 de novembre; cal lliurar el vot a Correus **fins al 25 de novembre** (no necessita franqueig). Pots ${a("seguir l'enviament", URL.tracking)} per internet. Qui demana el vot per correu ja no pot votar en persona a la mesa.`,
    ],
    abroadTitle: "Si ets a l'estranger",
    abroad: [
      "**Temporalment a l'estranger (ERTA)** però resident a Espanya: inscriu-te al consolat com a no resident i demana-hi el vot **fins al 31 d'octubre**.",
      "**Residents a l'estranger (CERA):** la documentació arriba d'ofici, sense sol·licitud. Pots enviar el vot al consolat entre el 4 i el 24 de novembre o dipositar-lo a l'urna del consolat del 21 al 26 de novembre. No l'enviïs a la junta electoral a Espanya: aquests vots són nuls.",
    ],
    muniTitle: "Després: municipals del 23 de maig de 2027",
    muni: [
      "Per llei, les eleccions locals se celebren el quart diumenge de maig, així que les properes són el **23 de maig de 2027**. A les generals només hi voten els ciutadans espanyols, però els **ciutadans de la UE** residents a Espanya poden votar a les municipals si estan empadronats i han manifestat la voluntat de votar, **abans del 30 de desembre de 2026** per al 2027.",
      `Els ciutadans de la UE poden fer aquesta declaració en línia a la ${a("seu de l'INE", URL.eu)}, per correu o a l'ajuntament, i serveix per a les eleccions següents. Alguns nacionals de fora de la UE amb conveni de reciprocitat també poden votar, però ho han de sol·licitar cada vegada; la llista i el termini del 2027 encara no s'han publicat.`,
    ],
    faq: [
      { question: "Quan són les properes eleccions generals?", answer: "El diumenge 29 de novembre de 2026, convocades pel Reial decret 806/2026, publicat al BOE el 6 d'octubre de 2026." },
      { question: "Fins quan es pot demanar el vot per correu?", answer: "Fins al 19 de novembre de 2026, en persona a Correus amb el DNI original o per internet amb certificat digital; el vot es lliura fins al 25 de novembre." },
      { question: "Com sé on em toca votar?", answer: "Al cercador de meses de l'INE, sense identificar-te, o a la targeta censal que arriba per correu entre el 2 i el 10 de novembre." },
      { question: "Poden votar els estrangers a Catalunya?", answer: "A les generals, no. Els ciutadans de la UE poden votar a les municipals del 23 de maig de 2027 si manifesten la voluntat de votar abans del 30 de desembre de 2026." },
    ],
    note: "Els terminis electorals els fixa la llei i l'INE: consulta el calendari oficial si una data sembla haver canviat.",
    warnTitle: "Consulta el cens abans del 19 d'octubre",
    warn: "Si t'has mudat fa poc, comprova la teva inscripció ara: les reclamacions al cens només es poden fer del 12 al 19 d'octubre.",
  },
};

function body(locale: Locale) {
  const t = COPY[locale];
  return [
    lead(t.lead),
    callout("warning", t.warnTitle, t.warn),
    table(t.calCaption, t.calHeaders, t.calRows, t.calNote),
    callout("official", verifiedLine(locale, VERIFIED), t.note),
    ...h2(t.seatsTitle, ...t.seats),
    ...h2(t.whereTitle, ...t.where),
    ...h2(t.postTitle, ...t.post),
    ...h2(t.abroadTitle),
    list(...t.abroad),
    ...h2(t.muniTitle, ...t.muni),
    faq(t.faq),
    ...b2Related(["congressResults", "parliamentResults", "hours"], locale),
  ];
}

export const VOTING: B2Article = {
  key: "voting",
  entryKey: "guide-how-to-vote-catalonia",
  categoryKey: "public-services",
  sources: SOURCES,
  heroKey: "eleccions-urnes-congres-senat",
  heroAlt: {
    ca: "Dues urnes en una mesa electoral, la transparent del Congrés i la sèpia del Senat",
    es: "Dos urnas en una mesa electoral, la transparente del Congreso y la sepia del Senado",
    en: "Two ballot boxes at a polling table: the clear one for Congress and the sepia one for the Senate",
  },
  heroCaption: {
    ca: "A les generals es vota amb dues urnes: Congrés i Senat.",
    es: "En las generales se vota en dos urnas: Congreso y Senado.",
    en: "In a general election you vote in two boxes: Congress and Senate.",
  },
  secondaryKey: "eleccions-congres-diputats-facana",
  secondaryAlt: {
    ca: "La façana del Congrés dels Diputats a Madrid",
    es: "La fachada del Congreso de los Diputados en Madrid",
    en: "The front of the Congress of Deputies in Madrid",
  },
  secondaryCaption: {
    ca: "El Congrés dels Diputats; Catalunya n'escull 48 dels 350 escons.",
    es: "El Congreso de los Diputados; Cataluña elige 48 de los 350 escaños.",
    en: "The Congress of Deputies; Catalonia elects 48 of its 350 seats.",
  },
  verifiedAt: VERIFIED,
  publishedAt: "2026-10-12T22:30:00+02:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...META[locale], blocks: body(locale) }]),
  ) as B2Article["editions"],
};

export { META as VOTING_META };
