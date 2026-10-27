import type { Locale } from "@/lib/i18n/config";

import {
  b2link,
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
 * Re-checked on 24 Oct 2026 against: Real Decreto 806/2026 (BOE 6 Oct 2026:
 * campaign 13 Nov 0:00 to 27 Nov 24:00, Cortes meet 23 Dec 10:00, seats per
 * province); the Junta Electoral Central calendar (mesa draw, braille kit,
 * polls ban, general count); the INE's Oficina del Censo Electoral calendar
 * and press note of 9 Oct (electorate per province, 900 343 232, Cl@ve); the
 * OCE request sheets for the postal vote and for voters temporarily abroad;
 * Interior's three notes of 20 Oct 2026 (guide, postal vote, voting from
 * abroad; they name 29neleccionesgenerales.es as the official site); Interior's
 * accessibility FAQ (expired DNI/passport accepted, originals only); JEC
 * Acuerdo 94/2026 (MiDNI/MiDGT suspended); LOREG arts. 29, 32, 35, 39, 42.3.
 *
 * Removed on 24 Oct because no official source states it: the hours of the
 * 900 343 232 line, the braille phone number, the claim that MiDNI is valid
 * (the JEC suspended it on 26 Mar 2026) and the claim that CERA votes posted
 * to a Spanish board are void.
 *
 * The URL is evergreen on purpose: after 29 November the same page switches
 * its worked example to the municipal elections, whose date is fixed by law
 * (LOREG art. 42.3, fourth Sunday of May). Strictly procedural and
 * non-partisan: no parties, candidates, polls or predictions.
 */

const VERIFIED = "2026-10-24";

const SOURCES: B2Source[] = [
  { name: "Real Decreto 806/2026, de 5 de octubre, de disolución del Congreso de los Diputados y del Senado y de convocatoria de elecciones", url: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20742", publisher: "Boletín Oficial del Estado" },
  { name: "Calendario electoral, elecciones generales 2026", url: "https://www.juntaelectoralcentral.es/cs/jec/documentos/eg2026_calendario.pdf", publisher: "Junta Electoral Central" },
  { name: "Calendario Elecciones a Cortes Generales de 2026", url: "https://www.ine.es/dyngs/CEL/index.htm?cid=1702", publisher: "INE — Oficina del Censo Electoral" },
  { name: "Elecciones generales de 29 de noviembre de 2026: electores (nota de prensa de 9 de octubre)", url: "https://www.ine.es/dyngs/Prensa/es/EG2026.htm", publisher: "INE" },
  { name: "Consulta de mesa y local electoral", url: "https://sede.ine.gob.es/ce-mesas/?lang=es_ES", publisher: "INE — Oficina del Censo Electoral" },
  { name: "29N: guía básica sobre las elecciones generales y el proceso electoral (20.10.2026)", url: "https://www.lamoncloa.gob.es/serviciosdeprensa/notasprensa/interior/Paginas/guia-dudas-elecciones-generales-29n.aspx", publisher: "Ministerio del Interior" },
  { name: "¿Cómo solicitar el voto por correo en las elecciones generales del 29 de noviembre? (20.10.2026)", url: "https://www.lamoncloa.gob.es/serviciosdeprensa/notasprensa/interior/Paginas/voto-por-correo-elecciones-generales-29n.aspx", publisher: "Ministerio del Interior" },
  { name: "Voto si resides en el extranjero en las elecciones generales del 29 de noviembre (20.10.2026)", url: "https://www.lamoncloa.gob.es/serviciosdeprensa/notasprensa/interior/Paginas/voto-extranjero-elecciones-generales-29n.aspx", publisher: "Ministerio del Interior" },
  { name: "Accesibilidad y procesos electorales", url: "https://infoelectoral.interior.gob.es/es/proceso-electoral/accesibilidad-y-procesos-electorales/", publisher: "Ministerio del Interior" },
  { name: "Acuerdo 94/2026, de 26 de marzo (suspensión de MiDNI y MiDGT para identificarse al votar)", url: "https://www.juntaelectoralcentral.es/cs/jec/doctrina/acuerdos?anyosesion=2026&idacuerdoinstruccion=148656&idsesion=1107&template=Doctrina%2FJEC_Detalle", publisher: "Junta Electoral Central" },
  { name: "Voto por correo", url: "https://www.correos.es/es/es/particulares/para-el-ciudadano/voto-por-correo", publisher: "Correos" },
  { name: "Ley Orgánica 5/1985, del Régimen Electoral General", url: "https://www.boe.es/buscar/act.php?id=BOE-A-1985-11672", publisher: "Boletín Oficial del Estado" },
  { name: "Descarga de papeletas por los electores residentes en el extranjero (CERA): disponible hasta el 26 de noviembre", url: "https://www.ine.es/dyngs/CEL/index.htm?cid=1030", publisher: "INE — Oficina del Censo Electoral" },
  { name: "Ciudadanos de la UE: elecciones municipales de 23 de mayo de 2027", url: "https://www.ine.es/dyngs/CEL/index.htm?cid=383", publisher: "INE — Oficina del Censo Electoral" },
];

const URL = {
  mesas: "https://sede.ine.gob.es/ce-mesas/?lang=es_ES",
  correos: "https://www.correos.es/es/es/particulares/para-el-ciudadano/voto-por-correo",
  tracking: "https://sede.ine.gob.es/ce-votoxcorreo/?lang=es_ES",
  eu: "https://sede.ine.gob.es/tramite/manifestacion_voluntad_voto/",
  site29n: "https://29neleccionesgenerales.es/",
};
const a = (label: string, url: string) => `[${label}](${url})`;

const META: Record<Locale, { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    path: "guies/com-votar-eleccions-catalunya",
    title: "Com votar el 29 de novembre a Catalunya: on, horari, vot per correu i terminis",
    seoTitle: "Properes eleccions a Catalunya: 29N, on i com votar",
    seoDescription:
      "Eleccions generals el diumenge 29 de novembre de 2026: on voto (cercador de l'INE), horari de 9 a 20 h, vot per correu fins al 19 de novembre i calendari.",
    excerpt:
      "Les properes eleccions a Catalunya són les generals del 29 de novembre: on et toca votar, l'horari, el document, el vot per correu i el calendari oficial complet.",
  },
  es: {
    path: "guias/como-votar-elecciones-cataluna",
    title: "Cómo votar el 29 de noviembre en Cataluña: dónde, horario, voto por correo y plazos",
    seoTitle: "Próximas elecciones en Cataluña: 29N, dónde y cómo votar",
    seoDescription:
      "Elecciones generales el domingo 29 de noviembre de 2026: dónde voto (buscador del INE), horario de 9 a 20 h y voto por correo hasta el 19 de noviembre.",
    excerpt:
      "Las próximas elecciones en Cataluña son las generales del 29 de noviembre: dónde te toca votar, el horario, el documento, el voto por correo y el calendario oficial completo.",
  },
  en: {
    path: "guides/how-to-vote-catalonia",
    title: "How to vote in Spain's 29 November 2026 general election in Catalonia",
    seoTitle: "How to vote in Spain's 2026 general election (29 November)",
    seoDescription:
      "Spain votes on Sunday 29 November 2026 (Royal Decree 806/2026): no registration step, the polling-station finder, 9:00-20:00, postal vote by 19 November.",
    excerpt:
      "Everything you need to vote in Spain's 29 November general election in Catalonia: registration, where you vote, hours, ID, the postal vote and the full official calendar.",
  },
};

type T = {
  lead: string;
  nextCaption: string; nextHeaders: string[]; nextRows: string[][]; nextNote: string;
  calTitle: string; calCaption: string; calHeaders: string[]; calRows: string[][]; calNote: string;
  seatsTitle: string; seats: string[];
  registerTitle: string; register: string[];
  whereTitle: string; where: string[];
  postTitle: string; post: string[];
  abroadTitle: string; abroad: string[];
  dayTitle: string; day: string[];
  muniTitle: string; muni: string[];
  faq: { question: string; answer: string }[];
  note: string;
  warnTitle: string; warn: string;
};

const COPY: Record<Locale, T> = {
  en: {
    lead: "Spain holds a **general election on Sunday 29 November 2026** to elect the Congress of Deputies and the Senate, called by Royal Decree 806/2026 (BOE, 6 October 2026). Polling stations are open from **9:00 to 20:00**, and the INE's official finder tells you where you vote. Key dates: request a postal vote at Correos **by 19 November** and hand it in by 25 November; the voter card with your polling station arrives by post between 2 and 10 November.",
    nextCaption: "Upcoming elections in Catalonia",
    nextHeaders: ["Election", "Date", "Status"],
    nextRows: [
      ["General election (Congress and Senate)", "Sunday 29 November 2026", "Called (Royal Decree 806/2026)"],
      ["Municipal elections", "Sunday 23 May 2027", "Date fixed by law (fourth Sunday of May); decree not yet published"],
      ["Parliament of Catalonia", "No date", "Not called; the last one was on 12 May 2024"],
    ],
    nextNote: "On 29 November only the Congress and the Senate are elected: there is no Catalan or local election that day.",
    calTitle: "Calendar for the 29 November 2026 election",
    calCaption: "The 29 November 2026 general election, step by step",
    calHeaders: ["What", "When (2026)"],
    calRows: [
      ["Election called: Royal Decree 806/2026 in the BOE", "6 October"],
      ["Check the electoral roll and file claims (closed)", "12–19 October"],
      ["Temporarily abroad: request your vote at the consulate", "6–31 October"],
      ["Living abroad (CERA): first mailing of documents", "24–30 October"],
      ["Draw for polling-station members at each town hall", "31 October – 4 November"],
      ["Braille voting kit: request from the Interior Ministry", "by 2 November"],
      ["Voter card with your polling station and table, by post", "2–10 November"],
      ["Postal-vote documents sent out", "9–22 November"],
      ["Election campaign", "13 November (00:00) – 27 November (24:00)"],
      ["Last day to request a postal vote at Correos", "19 November"],
      ["CERA: vote in the ballot box at the consulate", "21–26 November"],
      ["CERA: last day to post your vote to the consulate", "24 November"],
      ["Ban on publishing polls", "24–28 November"],
      ["Last day to hand in your postal vote at Correos", "25 November"],
      ["Day of reflection", "28 November"],
      ["Polling day", "Sunday 29 November, 9:00–20:00"],
      ["General count by the provincial electoral boards", "4–7 December"],
      ["New Congress and Senate meet", "23 December, 10:00"],
    ],
    calNote: "Sources: Royal Decree 806/2026 (BOE), the Central Electoral Board calendar and the INE's Oficina del Censo Electoral calendar, checked on 24 October 2026.",
    seatsTitle: "What is elected in Catalonia",
    seats: [
      "Catalonia's four provinces elect **48 of the 350 deputies**: Barcelona 32, Girona 6, Tarragona 6 and Lleida 4. Each province also elects four senators.",
      "According to the INE (9 October 2026), **5,926,487 people** can vote in the four Catalan provinces: 5,582,131 living in Spain and 344,356 registered as living abroad.",
    ],
    registerTitle: "Do I need to register to vote?",
    register: [
      "**No, if you are a Spanish citizen living in Spain.** Being on the electoral roll is compulsory and you do not apply for it: the INE's Oficina del Censo Electoral builds the roll from the municipal register (padró), whose changes town halls send it every month (electoral law, arts. 29, 32 and 35). The roll used on 29 November is the one closed on 1 August 2026, and the window to check it and claim (12 to 19 October) has closed.",
      "**Spaniards living abroad** must be on their consulate's register (Matrícula Consular) to appear on the overseas roll (CERA). **Foreign residents, EU citizens included, cannot vote** in a general election.",
    ],
    whereTitle: "Where do I vote on 29 November?",
    where: [
      `Use the INE's ${a("official polling-station finder", URL.mesas)}: choose your province and municipality and type the first letter of your first surname and your street, and it shows your table and polling venue, with no login. With Cl@ve you can also see your full entry on the roll on the INE's website; otherwise ask at your town hall or call the census office's free line, 900 343 232.`,
      "Between **2 and 10 November** a voter card arrives by post with your table and venue; if either changes afterwards, you are notified between 10 and 23 November.",
      `The Interior Ministry names ${a("29neleccionesgenerales.es", URL.site29n)} as the official website of this election.`,
    ],
    postTitle: "Postal vote",
    post: [
      `Anyone who will be away on polling day, or who cannot go in person because of illness or disability, can vote by post. Request it **by 19 November** at any Correos post office, in person, showing your ID (a photocopy is not accepted), or online on the ${a("Correos website", URL.correos)} with an electronic DNI or a digital certificate. If you are ill, a person with a notarised authorisation can request it for you, with an official medical certificate.`,
      `The documents are sent from 9 November and you sign for them in person. Hand your vote in at Correos **by 25 November**, by free registered post; if you cannot go, someone else can take it with an authorisation signed by you and a photocopy of your DNI. Do not put any ID inside the envelope. You can ${a("track the documents", URL.tracking)} online. Once your request is accepted, you can no longer vote in person.`,
    ],
    dayTitle: "Voting hours and what ID to bring",
    day: [
      "**Voting hours:** 9:00 to 20:00 on Sunday 29 November. If you are inside or at the door at 20:00, you can still vote. You can only vote at your own polling table.",
      "**ID:** your original DNI, passport or driving licence, with a photo. The DNI and passport are valid even if expired; photocopies and the DNI renewal receipt are not.",
      "**Digital DNI:** the MiDNI app is not valid to identify yourself. The Central Electoral Board suspended it on 26 March 2026 (Acuerdo 94/2026), and the Interior Ministry's guide of 20 October lists only the physical documents.",
      "**Polls and campaign:** no polls may be published from Tuesday 24 to Saturday 28 November. The campaign ends at midnight on Friday 27, and Saturday 28 is the day of reflection.",
      "**Braille voting kit:** for voters who read braille and have a recognised disability of 33% or more or belong to ONCE; request it from the Interior Ministry by Monday 2 November.",
      "**Working that day:** you are entitled to up to four paid hours to vote, pro rata if you work part-time. In Catalonia a Generalitat order published in the DOGC sets the detail; for 29 November it had not been published on 24 October.",
    ],
    abroadTitle: "If you are abroad",
    abroad: [
      "**Temporarily abroad** but living in Spain: register at the consulate as a non-resident and request your vote there **by 31 October** (both can be done at once). The documents are sent from 3 November and the vote must be posted back by registered mail by 25 November.",
      "**Living abroad (CERA):** no request is needed. The first mailing goes out from 24 to 30 October and the ballot papers from 4 to 8 November (up to 14 November where candidacies are challenged); ballots can also be downloaded from the INE's website until 26 November. Post your vote to the consulate by registered mail **by 24 November**, or vote in person at the consulate or polling centre **from 21 to 26 November**.",
      "**CERA voters who are in Spain:** you can request a postal vote at any Correos office until 19 November.",
    ],
    muniTitle: "Next: municipal elections on 23 May 2027",
    muni: [
      "Local elections are held by law on the fourth Sunday of May, so the next ones are on **23 May 2027**. Only Spanish citizens vote in the general election, but **EU citizens** living in Spain can vote in the municipal ones if they are registered on the padró and have declared their wish to vote, **by 30 December 2026** for 2027.",
      `EU citizens can make that declaration online on the ${a("INE's site", URL.eu)}, by post or at the town hall, and it stays valid for future elections. Some non-EU nationals with a reciprocity agreement can also vote, but they must apply each time; the 2027 list and window have not been published yet.`,
    ],
    faq: [
      { question: "What are the next elections in Catalonia?", answer: "The general election on Sunday 29 November 2026 (Congress and Senate). Then the municipal elections on 23 May 2027. No election to the Parliament of Catalonia has been called." },
      { question: "Do I need to register to vote in the 2026 Spanish general election?", answer: "Not if you are a Spanish citizen living in Spain: the INE builds the electoral roll from the municipal register. The roll for 29 November closed on 1 August 2026. Spaniards abroad must be on their consulate's register; foreign residents cannot vote in a general election." },
      { question: "Where do I vote on 29 November?", answer: "The INE's polling-station finder shows your table and venue from your province, municipality, the first letter of your first surname and your street, with no login. The voter card that arrives by post between 2 and 10 November says the same." },
      { question: "What are the voting hours?", answer: "From 9:00 to 20:00 on Sunday 29 November 2026. Anyone inside or at the door at 20:00 can still vote." },
      { question: "Until when can I request a postal vote?", answer: "Until 19 November 2026, in person at Correos with your original ID or online with an electronic DNI or digital certificate; the vote must be handed in by 25 November." },
      { question: "What ID do I need? Is the digital DNI on my phone valid?", answer: "Your original DNI, passport or driving licence with a photo; the DNI and passport are valid even if expired. The MiDNI app is not valid: the Central Electoral Board suspended it in March 2026." },
      { question: "What is Royal Decree 806/2026?", answer: "The decree of 5 October 2026, published in the BOE on 6 October, that dissolved the Congress and the Senate and called the election for 29 November. It sets the campaign from 13 to 27 November and the first sitting of the new chambers on 23 December." },
      { question: "Can foreigners vote in Catalonia?", answer: "Not in the general election. EU citizens can vote in the municipal elections of 23 May 2027 if they register their wish to vote by 30 December 2026." },
    ],
    note: "Electoral deadlines are fixed by law, the Central Electoral Board and the INE; check the official calendar if a date seems to have changed.",
    warnTitle: "Postal vote: request it by 19 November",
    warn: "If you will be away on 29 November, request the postal vote at Correos by 19 November, in person with your original ID, and hand it in by 25 November.",
  },
  es: {
    lead: "Las próximas elecciones en Cataluña son las **generales del domingo 29 de noviembre de 2026**, para elegir el Congreso y el Senado, convocadas por el Real Decreto 806/2026 (BOE del 6 de octubre). Se vota de **9:00 a 20:00** en la mesa que te indica el buscador oficial del INE. Plazos clave: el voto por correo se pide en Correos **hasta el 19 de noviembre** y se entrega hasta el 25, y la tarjeta censal con tu mesa llega por correo entre el 2 y el 10 de noviembre.",
    nextCaption: "Próximas elecciones en Cataluña",
    nextHeaders: ["Elección", "Fecha", "Situación"],
    nextRows: [
      ["Generales (Congreso y Senado)", "Domingo 29 de noviembre de 2026", "Convocadas (Real Decreto 806/2026)"],
      ["Municipales", "Domingo 23 de mayo de 2027", "Fecha fijada por ley (cuarto domingo de mayo); falta el decreto"],
      ["Parlament de Catalunya", "Sin fecha", "No convocadas; las últimas fueron el 12 de mayo de 2024"],
    ],
    nextNote: "El 29 de noviembre solo se eligen el Congreso y el Senado: ese día no hay elecciones autonómicas ni municipales.",
    calTitle: "Calendario de las elecciones del 29 de noviembre",
    calCaption: "Las elecciones generales del 29 de noviembre de 2026, paso a paso",
    calHeaders: ["Qué", "Cuándo (2026)"],
    calRows: [
      ["Convocatoria: Real Decreto 806/2026 en el BOE", "6 de octubre"],
      ["Consulta del censo y reclamaciones (cerrado)", "12–19 de octubre"],
      ["Temporalmente en el extranjero: solicitud del voto en el consulado", "6–31 de octubre"],
      ["Residentes en el extranjero (CERA): primer envío de documentación", "24–30 de octubre"],
      ["Sorteo de los miembros de mesa en cada ayuntamiento", "31 de octubre – 4 de noviembre"],
      ["Kit de voto accesible en braille: solicitud al Ministerio del Interior", "hasta el 2 de noviembre"],
      ["Tarjeta censal con tu mesa y local, por correo", "2–10 de noviembre"],
      ["Envío de la documentación del voto por correo", "9–22 de noviembre"],
      ["Campaña electoral", "13 de noviembre (0:00) – 27 de noviembre (24:00)"],
      ["Último día para pedir el voto por correo en Correos", "19 de noviembre"],
      ["CERA: voto en urna en el consulado", "21–26 de noviembre"],
      ["CERA: último día para enviar el voto por correo al consulado", "24 de noviembre"],
      ["Prohibición de publicar encuestas", "24–28 de noviembre"],
      ["Último día para entregar el voto por correo en Correos", "25 de noviembre"],
      ["Jornada de reflexión", "28 de noviembre"],
      ["Jornada electoral", "Domingo 29 de noviembre, 9:00–20:00"],
      ["Escrutinio general en las juntas electorales provinciales", "4–7 de diciembre"],
      ["Constitución del nuevo Congreso y Senado", "23 de diciembre, 10:00"],
    ],
    calNote: "Fuentes: Real Decreto 806/2026 (BOE), calendario electoral de la Junta Electoral Central y calendario de la Oficina del Censo Electoral (INE), consultados el 24 de octubre de 2026.",
    seatsTitle: "Qué se elige en Cataluña",
    seats: [
      "Las cuatro provincias catalanas eligen **48 de los 350 diputados**: Barcelona 32, Girona 6, Tarragona 6 y Lleida 4. Cada provincia elige además cuatro senadores.",
      "Según el INE (9 de octubre de 2026), en las cuatro provincias catalanas pueden votar **5.926.487 personas**: 5.582.131 residentes en España y 344.356 inscritas como residentes en el extranjero.",
    ],
    registerTitle: "¿Tengo que inscribirme para votar?",
    register: [
      "**No, si eres español y vives en España.** La inscripción en el censo electoral es obligatoria y no se solicita: la forma la Oficina del Censo Electoral del INE a partir del padrón, cuyos cambios le envían los ayuntamientos cada mes (LOREG, arts. 29, 32 y 35). El censo del 29 de noviembre es el cerrado a 1 de agosto de 2026, y el plazo para consultarlo y reclamar (del 12 al 19 de octubre) ya ha terminado.",
      "**Los españoles residentes en el extranjero** deben estar inscritos en el Registro de Matrícula Consular para figurar en el censo de residentes ausentes (CERA). **Los extranjeros residentes, también los de la UE, no votan** en las elecciones generales.",
    ],
    whereTitle: "¿Dónde voto el 29 de noviembre?",
    where: [
      `Usa el ${a("buscador oficial de mesas del INE", URL.mesas)}: eliges provincia y municipio, escribes la inicial de tu primer apellido y tu calle, y te muestra tu mesa y tu local electoral, sin identificarte. Con Cl@ve puedes ver además tu inscripción completa en el censo en la sede del INE; si no, pregunta en tu ayuntamiento o llama al teléfono gratuito de la Oficina del Censo Electoral, 900 343 232.`,
      "Entre el **2 y el 10 de noviembre** llega por correo la tarjeta censal con tu mesa y local; si alguno cambia después, te lo notifican entre el 10 y el 23 de noviembre.",
      `El Ministerio del Interior señala ${a("29neleccionesgenerales.es", URL.site29n)} como la web oficial de estas elecciones.`,
    ],
    postTitle: "Voto por correo",
    post: [
      `Puede votar por correo quien no vaya a estar en su localidad el día de la votación, o no pueda ir en persona por enfermedad o discapacidad. Hay que pedirlo **hasta el 19 de noviembre** en cualquier oficina de Correos, en persona y enseñando el documento de identidad (no se acepta fotocopia), o por internet en la ${a("web de Correos", URL.correos)} con DNI electrónico o certificado digital. Si estás enfermo, puede pedirlo por ti una persona con autorización notarial, con certificado médico oficial.`,
      `La documentación se envía a partir del 9 de noviembre y la recibes firmando en persona. El voto se entrega en Correos **hasta el 25 de noviembre**, por correo certificado gratuito; si no puedes ir, puede llevarlo otra persona con una autorización firmada por ti y una fotocopia de tu DNI. No metas ningún documento de identidad en el sobre. Puedes ${a("seguir el envío", URL.tracking)} por internet. Si tu solicitud se acepta, ya no puedes votar en persona.`,
    ],
    dayTitle: "Horario para votar y qué documento llevar",
    day: [
      "**Horario:** de 9:00 a 20:00 el domingo 29 de noviembre. Si a las 20:00 estás dentro o en la puerta, aún puedes votar. Solo puedes votar en tu mesa.",
      "**Documento:** DNI, pasaporte o carné de conducir originales, con foto. El DNI y el pasaporte valen aunque estén caducados; no valen fotocopias ni el resguardo de renovación del DNI.",
      "**DNI del móvil:** la app MiDNI no sirve para identificarte. La Junta Electoral Central suspendió su uso el 26 de marzo de 2026 (Acuerdo 94/2026), y la guía del Ministerio del Interior del 20 de octubre solo cita los documentos físicos.",
      "**Encuestas y campaña:** no se pueden publicar encuestas del martes 24 al sábado 28 de noviembre. La campaña termina a medianoche del viernes 27, y el sábado 28 es la jornada de reflexión.",
      "**Kit de voto en braille:** para quien lee braille y tiene reconocida una discapacidad igual o superior al 33 % o está afiliado a la ONCE; se pide al Ministerio del Interior hasta el lunes 2 de noviembre.",
      "**Si trabajas ese día:** tienes derecho a hasta cuatro horas retribuidas para votar, proporcionales si haces jornada parcial. En Cataluña el detalle lo fija una orden de la Generalitat publicada en el DOGC; la del 29 de noviembre no se había publicado a 24 de octubre.",
    ],
    abroadTitle: "Si estás en el extranjero",
    abroad: [
      "**Temporalmente en el extranjero** pero residente en España: inscríbete en el consulado como no residente y pide allí el voto **hasta el 31 de octubre** (se puede hacer todo en el mismo acto). La documentación se envía a partir del 3 de noviembre y el voto se remite por correo certificado hasta el 25 de noviembre.",
      "**Residentes en el extranjero (CERA):** no hay que pedir nada. El primer envío sale del 24 al 30 de octubre y las papeletas, del 4 al 8 de noviembre (hasta el 14 si se recurren candidaturas); también se pueden descargar en la web del INE hasta el 26 de noviembre. Envía el voto al consulado por correo certificado **hasta el 24 de noviembre** o vota en persona en el consulado o centro habilitado **del 21 al 26 de noviembre**.",
      "**Residentes en el extranjero que están en España:** pueden pedir el voto por correo en cualquier oficina de Correos hasta el 19 de noviembre.",
    ],
    muniTitle: "Después: municipales del 23 de mayo de 2027",
    muni: [
      "Por ley, las elecciones locales se celebran el cuarto domingo de mayo, así que las próximas son el **23 de mayo de 2027**. En las generales solo votan los ciudadanos españoles, pero los **ciudadanos de la UE** residentes en España pueden votar en las municipales si están empadronados y han manifestado su voluntad de votar, **hasta el 30 de diciembre de 2026** para 2027.",
      `Los ciudadanos de la UE pueden hacer esa declaración en línea en la ${a("sede del INE", URL.eu)}, por correo o en el ayuntamiento, y sirve para las elecciones siguientes. Algunos nacionales de fuera de la UE con convenio de reciprocidad también pueden votar, pero lo deben solicitar cada vez; la lista y el plazo de 2027 aún no se han publicado.`,
    ],
    faq: [
      { question: "¿Cuáles son las próximas elecciones en Cataluña?", answer: "Las generales del domingo 29 de noviembre de 2026 (Congreso y Senado). Después, las municipales del 23 de mayo de 2027. Elecciones al Parlament no hay convocadas." },
      { question: "¿Dónde voto el 29 de noviembre?", answer: "El buscador de mesas del INE te dice tu mesa y local con tu provincia, municipio, la inicial de tu primer apellido y tu calle, sin identificarte. Lo mismo dice la tarjeta censal que llega por correo entre el 2 y el 10 de noviembre." },
      { question: "¿Qué horario hay para votar el domingo 29 de noviembre?", answer: "De 9:00 a 20:00. Quien está dentro o en la puerta a las 20:00 todavía puede votar." },
      { question: "¿Hasta cuándo se puede pedir el voto por correo?", answer: "Hasta el 19 de noviembre de 2026, en persona en Correos con el documento original o por internet con DNI electrónico o certificado digital; el voto se entrega hasta el 25 de noviembre." },
      { question: "¿Qué documento necesito para votar? ¿Vale el DNI del móvil?", answer: "DNI, pasaporte o carné de conducir originales con foto; el DNI y el pasaporte valen caducados. La app MiDNI no vale: la Junta Electoral Central la suspendió en marzo de 2026." },
      { question: "¿Tengo que inscribirme para votar?", answer: "No, si eres español y vives en España: el INE forma el censo a partir del padrón. El censo del 29 de noviembre se cerró el 1 de agosto de 2026." },
      { question: "¿Qué es el Real Decreto 806/2026?", answer: "El decreto de 5 de octubre de 2026, publicado en el BOE el 6 de octubre, que disuelve el Congreso y el Senado y convoca elecciones para el 29 de noviembre. Fija la campaña del 13 al 27 de noviembre y la constitución de las nuevas Cortes el 23 de diciembre." },
      { question: "¿Pueden votar los extranjeros en Cataluña?", answer: "En las generales, no. Los ciudadanos de la UE pueden votar en las municipales del 23 de mayo de 2027 si manifiestan su voluntad de votar hasta el 30 de diciembre de 2026." },
    ],
    note: "Los plazos electorales los fijan la ley, la Junta Electoral Central y el INE: consulta el calendario oficial si una fecha parece haber cambiado.",
    warnTitle: "Voto por correo: pídelo hasta el 19 de noviembre",
    warn: "Si no estarás el 29 de noviembre, pide el voto por correo en Correos hasta el 19 de noviembre, en persona y con tu documento original, y entrégalo hasta el 25 de noviembre.",
  },
  ca: {
    lead: "Les properes eleccions a Catalunya són les **generals del diumenge 29 de novembre de 2026**, per escollir el Congrés i el Senat, convocades pel Reial decret 806/2026 (BOE del 6 d'octubre). Es vota de **9:00 a 20:00** a la mesa que t'indica el cercador oficial de l'INE. Terminis clau: el vot per correu es demana a Correus **fins al 19 de novembre** i es lliura fins al 25, i la targeta censal amb la teva mesa arriba per correu entre el 2 i el 10 de novembre.",
    nextCaption: "Properes eleccions a Catalunya",
    nextHeaders: ["Elecció", "Data", "Situació"],
    nextRows: [
      ["Generals (Congrés i Senat)", "Diumenge 29 de novembre de 2026", "Convocades (Reial decret 806/2026)"],
      ["Municipals", "Diumenge 23 de maig de 2027", "Data fixada per llei (quart diumenge de maig); falta el decret"],
      ["Parlament de Catalunya", "Sense data", "No convocades; les últimes van ser el 12 de maig de 2024"],
    ],
    nextNote: "El 29 de novembre només s'escullen el Congrés i el Senat: aquell dia no hi ha eleccions al Parlament ni municipals.",
    calTitle: "Calendari de les eleccions del 29 de novembre",
    calCaption: "Les eleccions generals del 29 de novembre de 2026, pas a pas",
    calHeaders: ["Què", "Quan (2026)"],
    calRows: [
      ["Convocatòria: Reial decret 806/2026 al BOE", "6 d'octubre"],
      ["Consulta del cens i reclamacions (tancat)", "12–19 d'octubre"],
      ["Temporalment a l'estranger: sol·licitud del vot al consolat", "6–31 d'octubre"],
      ["Residents a l'estranger (CERA): primer enviament de documentació", "24–30 d'octubre"],
      ["Sorteig dels membres de mesa a cada ajuntament", "31 d'octubre – 4 de novembre"],
      ["Kit de vot accessible en braille: sol·licitud al Ministeri de l'Interior", "fins al 2 de novembre"],
      ["Targeta censal amb la teva mesa i local, per correu", "2–10 de novembre"],
      ["Enviament de la documentació del vot per correu", "9–22 de novembre"],
      ["Campanya electoral", "13 de novembre (0:00) – 27 de novembre (24:00)"],
      ["Últim dia per demanar el vot per correu a Correus", "19 de novembre"],
      ["CERA: vot a l'urna al consolat", "21–26 de novembre"],
      ["CERA: últim dia per enviar el vot per correu al consolat", "24 de novembre"],
      ["Prohibició de publicar enquestes", "24–28 de novembre"],
      ["Últim dia per lliurar el vot per correu a Correus", "25 de novembre"],
      ["Jornada de reflexió", "28 de novembre"],
      ["Jornada electoral", "Diumenge 29 de novembre, 9:00–20:00"],
      ["Escrutini general a les juntes electorals provincials", "4–7 de desembre"],
      ["Constitució del nou Congrés i Senat", "23 de desembre, 10:00"],
    ],
    calNote: "Fonts: Reial decret 806/2026 (BOE), calendari electoral de la Junta Electoral Central i calendari de l'Oficina del Cens Electoral (INE), consultats el 24 d'octubre de 2026.",
    seatsTitle: "Què s'escull a Catalunya",
    seats: [
      "Les quatre províncies catalanes escullen **48 dels 350 diputats**: Barcelona 32, Girona 6, Tarragona 6 i Lleida 4. Cada província escull a més quatre senadors.",
      "Segons l'INE (9 d'octubre de 2026), a les quatre províncies catalanes poden votar **5.926.487 persones**: 5.582.131 residents a Espanya i 344.356 inscrites com a residents a l'estranger.",
    ],
    registerTitle: "M'he d'inscriure per votar?",
    register: [
      "**No, si ets espanyol i vius a Espanya.** La inscripció al cens electoral és obligatòria i no es demana: la fa l'Oficina del Cens Electoral de l'INE a partir del padró, els canvis del qual li envien els ajuntaments cada mes (LOREG, arts. 29, 32 i 35). El cens del 29 de novembre és el tancat a 1 d'agost de 2026, i el termini per consultar-lo i reclamar (del 12 al 19 d'octubre) ja s'ha acabat.",
      "**Els espanyols residents a l'estranger** han d'estar inscrits al Registre de Matrícula Consular per figurar al cens de residents absents (CERA). **Els estrangers residents, també els de la UE, no voten** a les eleccions generals.",
    ],
    whereTitle: "On voto el 29 de novembre?",
    where: [
      `Fes servir el ${a("cercador oficial de meses de l'INE", URL.mesas)}: tries província i municipi, escrius la inicial del primer cognom i el carrer, i et mostra la mesa i el local electoral, sense identificar-te. Amb Cl@ve pots veure també la inscripció completa al cens a la seu de l'INE; si no, pregunta a l'ajuntament o truca al telèfon gratuït de l'Oficina del Cens Electoral, 900 343 232.`,
      "Entre el **2 i el 10 de novembre** arriba per correu la targeta censal amb la mesa i el local; si algun canvia després, t'ho notifiquen entre el 10 i el 23 de novembre.",
      `El Ministeri de l'Interior assenyala ${a("29neleccionesgenerales.es", URL.site29n)} com el web oficial d'aquestes eleccions.`,
    ],
    postTitle: "Vot per correu",
    post: [
      `Pot votar per correu qui no serà a la seva localitat el dia de la votació, o no hi pot anar en persona per malaltia o discapacitat. Cal demanar-lo **fins al 19 de novembre** a qualsevol oficina de Correus, en persona i ensenyant el document d'identitat (no s'accepta fotocòpia), o per internet al ${a("web de Correus", URL.correos)} amb DNI electrònic o certificat digital. Si estàs malalt, el pot demanar per tu una persona amb autorització notarial, amb certificat mèdic oficial.`,
      `La documentació s'envia a partir del 9 de novembre i la reps signant en persona. El vot es lliura a Correus **fins al 25 de novembre**, per correu certificat gratuït; si no hi pots anar, el pot portar una altra persona amb una autorització signada per tu i una fotocòpia del teu DNI. No posis cap document d'identitat dins del sobre. Pots ${a("seguir l'enviament", URL.tracking)} per internet. Si la sol·licitud s'accepta, ja no pots votar en persona.`,
    ],
    dayTitle: "Horari per votar i quin document portar",
    day: [
      "**Horari:** de 9:00 a 20:00 el diumenge 29 de novembre. Si a les 20:00 ets a dins o a la porta, encara pots votar. Només pots votar a la teva mesa.",
      "**Document:** DNI, passaport o carnet de conduir originals, amb foto. El DNI i el passaport valen encara que estiguin caducats; no valen fotocòpies ni el resguard de renovació del DNI.",
      "**DNI del mòbil:** l'app MiDNI no serveix per identificar-te. La Junta Electoral Central en va suspendre l'ús el 26 de març de 2026 (Acord 94/2026), i la guia del Ministeri de l'Interior del 20 d'octubre només cita els documents físics.",
      "**Enquestes i campanya:** no se'n poden publicar del dimarts 24 al dissabte 28 de novembre. La campanya acaba a mitjanit del divendres 27, i el dissabte 28 és la jornada de reflexió.",
      "**Kit de vot en braille:** per a qui llegeix braille i té reconeguda una discapacitat igual o superior al 33 % o està afiliat a l'ONCE; es demana al Ministeri de l'Interior fins al dilluns 2 de novembre.",
      "**Si treballes aquell dia:** tens dret a fins a quatre hores retribuïdes per votar, proporcionals si fas jornada parcial. A Catalunya el detall el fixa una ordre de la Generalitat publicada al DOGC; la del 29 de novembre no s'havia publicat a 24 d'octubre.",
    ],
    abroadTitle: "Si ets a l'estranger",
    abroad: [
      "**Temporalment a l'estranger** però resident a Espanya: inscriu-te al consolat com a no resident i demana-hi el vot **fins al 31 d'octubre** (es pot fer tot alhora). La documentació s'envia a partir del 3 de novembre i el vot s'ha de remetre per correu certificat fins al 25 de novembre.",
      "**Residents a l'estranger (CERA):** no cal demanar res. El primer enviament surt del 24 al 30 d'octubre i les paperetes, del 4 al 8 de novembre (fins al 14 si es recorren candidatures); també es poden descarregar al web de l'INE fins al 26 de novembre. Envia el vot al consolat per correu certificat **fins al 24 de novembre** o vota en persona al consolat o centre habilitat **del 21 al 26 de novembre**.",
      "**Residents a l'estranger que són a Espanya:** poden demanar el vot per correu a qualsevol oficina de Correus fins al 19 de novembre.",
    ],
    muniTitle: "Després: municipals del 23 de maig de 2027",
    muni: [
      "Per llei, les eleccions locals se celebren el quart diumenge de maig, així que les properes són el **23 de maig de 2027**. A les generals només hi voten els ciutadans espanyols, però els **ciutadans de la UE** residents a Espanya poden votar a les municipals si estan empadronats i han manifestat la voluntat de votar, **fins al 30 de desembre de 2026** per al 2027.",
      `Els ciutadans de la UE poden fer aquesta declaració en línia a la ${a("seu de l'INE", URL.eu)}, per correu o a l'ajuntament, i serveix per a les eleccions següents. Alguns nacionals de fora de la UE amb conveni de reciprocitat també poden votar, però ho han de sol·licitar cada vegada; la llista i el termini del 2027 encara no s'han publicat.`,
    ],
    faq: [
      { question: "Quan són les properes eleccions a Catalunya?", answer: "Les generals del diumenge 29 de novembre de 2026 (Congrés i Senat). Després, les municipals del 23 de maig de 2027. Eleccions al Parlament no n'hi ha de convocades." },
      { question: "On voto el 29 de novembre?", answer: "El cercador de meses de l'INE et diu la mesa i el local amb la província, el municipi, la inicial del primer cognom i el carrer, sense identificar-te. El mateix diu la targeta censal que arriba per correu entre el 2 i el 10 de novembre." },
      { question: "Quin horari hi ha per votar el diumenge 29 de novembre?", answer: "De 9:00 a 20:00. Qui és a dins o a la porta a les 20:00 encara pot votar." },
      { question: "Fins quan es pot demanar el vot per correu?", answer: "Fins al 19 de novembre de 2026, en persona a Correus amb el document original o per internet amb DNI electrònic o certificat digital; el vot es lliura fins al 25 de novembre." },
      { question: "Quin document necessito per votar? Val el DNI del mòbil?", answer: "DNI, passaport o carnet de conduir originals amb foto; el DNI i el passaport valen caducats. L'app MiDNI no val: la Junta Electoral Central la va suspendre el març de 2026." },
      { question: "M'he d'inscriure per votar?", answer: "No, si ets espanyol i vius a Espanya: l'INE forma el cens a partir del padró. El cens del 29 de novembre es va tancar l'1 d'agost de 2026." },
      { question: "Què és el Reial decret 806/2026?", answer: "El decret de 5 d'octubre de 2026, publicat al BOE el 6 d'octubre, que dissol el Congrés i el Senat i convoca eleccions per al 29 de novembre. Fixa la campanya del 13 al 27 de novembre i la constitució de les noves Corts el 23 de desembre." },
      { question: "Poden votar els estrangers a Catalunya?", answer: "A les generals, no. Els ciutadans de la UE poden votar a les municipals del 23 de maig de 2027 si manifesten la voluntat de votar fins al 30 de desembre de 2026." },
    ],
    note: "Els terminis electorals els fixen la llei, la Junta Electoral Central i l'INE: consulta el calendari oficial si una data sembla haver canviat.",
    warnTitle: "Vot per correu: demana'l fins al 19 de novembre",
    warn: "Si no hi seràs el 29 de novembre, demana el vot per correu a Correus fins al 19 de novembre, en persona i amb el document original, i entrega'l fins al 25 de novembre.",
  },
};

const MESA_LINK: Record<Locale, string> = {
  ca: "Si t'ha tocat ser membre de mesa: ",
  es: "Si te ha tocado ser miembro de mesa: ",
  en: "If you have been drawn for polling-station duty: ",
};
const MESA_LABEL: Record<Locale, string> = {
  ca: "terminis, excuses i els 75 € de dieta",
  es: "plazos, excusas y los 75 € de dieta",
  en: "deadlines, excuses and the €75 allowance",
};
const NIGHT_LINK: Record<Locale, string> = {
  ca: "La nit del 29: ",
  es: "La noche del 29: ",
  en: "On the night of the 29th: ",
};
const NIGHT_LABEL: Record<Locale, string> = {
  ca: "a quina hora surten els resultats i com és l'escrutini",
  es: "a qué hora salen los resultados y cómo es el escrutinio",
  en: "when results come out and how the count works",
};
const CANDIDATES_LINK: Record<Locale, string> = {
  ca: "Qui es presenta a cada província: ",
  es: "Quién se presenta en cada provincia: ",
  en: "Who is standing in each province: ",
};
const CANDIDATES_LABEL: Record<Locale, string> = {
  ca: "les llistes de candidats de Barcelona, Girona, Lleida i Tarragona",
  es: "las listas de candidatos de Barcelona, Girona, Lleida y Tarragona",
  en: "the candidate lists for Barcelona, Girona, Lleida and Tarragona",
};

function body(locale: Locale) {
  const t = COPY[locale];
  return [
    lead(t.lead),
    table(t.nextCaption, t.nextHeaders, t.nextRows, t.nextNote),
    callout("warning", t.warnTitle, t.warn),
    ...h2(t.calTitle),
    table(t.calCaption, t.calHeaders, t.calRows, t.calNote),
    callout("official", verifiedLine(locale, VERIFIED), t.note),
    ...h2(t.whereTitle, ...t.where),
    ...h2(t.dayTitle),
    list(...t.day),
    ...h2(t.postTitle, ...t.post),
    ...h2(t.registerTitle, ...t.register),
    ...h2(t.abroadTitle),
    list(...t.abroad),
    ...h2(t.seatsTitle, ...t.seats),
    list(
      MESA_LINK[locale] + b2link("mesa", locale, MESA_LABEL[locale]) + ".",
      NIGHT_LINK[locale] + b2link("electionNight", locale, NIGHT_LABEL[locale]) + ".",
      CANDIDATES_LINK[locale] + b2link("candidates", locale, CANDIDATES_LABEL[locale]) + ".",
    ),
    ...h2(t.muniTitle, ...t.muni),
    faq(t.faq),
    ...b2Related(["mesa", "electionNight", "congressResults", "parliamentResults", "municipalResults"], locale),
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
