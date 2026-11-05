import type { Block } from "@/lib/content/blocks";
import type { Locale } from "@/lib/i18n/config";

import {
  b2link,
  b2Related,
  callout,
  faq,
  h2,
  languageLinks,
  lead,
  list,
  paras,
  steps,
  table,
  verifiedLine,
  type B2Article,
  type B2Source,
} from "./shared";
import { VOTING } from "./voting";

/**
 * Postal vote for the 29 November 2026 general election (vot per correu /
 * voto por correo), on year-free URLs (guies/vot-per-correu,
 * guias/voto-por-correo, guides/postal-vote-spain): the next election reuses
 * them.
 *
 * Why a page of its own (5 Nov 2026, logged in docs/SEO_EXPERIMENTS.md): the
 * "Voto por correo" section of the how-to-vote guide showed in Google as a
 * sitelink, 636 impressions and no click in 14 days, and the request window
 * closes on 19 November. The guide's section now says the essentials in one
 * paragraph and links here; its heading (the #voto-por-correo anchor) and its
 * titles are untouched.
 *
 * POSTAL_AS_OF 2026-11-05. Every fact was read that day, and nowhere else:
 *
 *  - LOREG arts. 72 and 73, BOE consolidated text through the BOE open-data
 *    API (art. 72 as amended by LO 6/1992, art. 73 by LO 6/1992 and as read
 *    with JEC Instrucción 5/2023): request "a partir de la fecha de la
 *    convocatoria y hasta el décimo día anterior a la votación" (19 Nov), in
 *    person, DNI shown, "En ningún caso se admitirá ... fotocopia"; illness:
 *    notarial or consular authorisation, one voter per representative, "por
 *    medio de certificación médica oficial y gratuita"; census annotated "a
 *    fin de que el día de las elecciones no se realice el voto personalmente";
 *    papers sent "a partir del trigésimo cuarto día posterior a la
 *    convocatoria y antes del sexto día anterior al de la votación" (9-22
 *    Nov), signed for in person, and if the voter is out "deberá personarse
 *    por sí o a través de la representación ... en la oficina de Correos";
 *    vote posted "por correo certificado en todo caso antes del tercer día
 *    previo" (by 25 Nov), "Este sobre no necesita franqueo"; Correos takes the
 *    mail to the tables "a las nueve de la mañana" and until 20:00.
 *  - JEC Instrucción 5/2023 (BOE-A-2023-13667): the voter hands the vote in at
 *    Correos in person with ID, or authorises someone else in writing, with a
 *    photocopy of the voter's DNI, passport or other official ID.
 *  - The Junta Electoral Central's 29N calendar (eg2026_calendario.pdf):
 *    "Solicitud del voto por correo 6 de octubre a 19 de noviembre"; "Envío
 *    por la Oficina del Censo Electoral de la documentación ... 9 a 22 de
 *    noviembre"; "Remisión por los electores del voto por correo 10 a 25 de
 *    noviembre ... Desde la recepción de la documentación"; CERA "Depósito
 *    del voto en urna (Consulado) 21 a 26 de noviembre" and by post to the
 *    consulate "6 de octubre a 24 de noviembre"; temporarily abroad (ERTA)
 *    "6 a 31 de octubre".
 *  - Correos' postal-vote page: "hasta el día 19 de noviembre de 2026";
 *    online with "un certificado DNI Electrónico o un certificado digital
 *    válido"; "si es aceptada por la Oficina del Censo Electoral, no podrá
 *    votar en la mesa electoral"; deposit "hasta el 25 de noviembre de 2026,
 *    en los horarios habituales de apertura de las oficinas postales"; a
 *    model authorisation for someone else to hand it in.
 *  - Interior's 29N page "Voto por correo desde España": online needs a
 *    digital certificate or electronic DNI "y Autofirma"; in person with "DNI,
 *    pasaporte o carnet de conducir ... en ningún caso fotocopia"; "una vez ha
 *    sido admitida su solicitud, ya no puede votar de forma presencial"; the
 *    envelope's contents; "Si no estuviese en su domicilio, tendrá que ir
 *    personalmente a recogerla a la Oficina de Correos"; white envelope for
 *    Congress, sepia for the Senate; "Tiene hasta el día 25 de noviembre, para
 *    entregar, previa identificación"; free; the e-mail confirmation of
 *    delivery to the table ("Como novedad"); postal votes go into the urns at
 *    20:00.
 *  - The INE's 29N page (cid=1700): request "desde el 6 de octubre hasta el
 *    19 de noviembre, ambos inclusive"; in person "mediante el Documento
 *    Nacional de Identidad, pasaporte u otro documento oficial
 *    identificativo"; the form can be filled in on the INE's site "sin
 *    necesidad de acceso a Cl@ve", printed twice and taken to Correos; papers
 *    9-22 Nov, after candidacy challenges are settled ("cuya última fecha de
 *    resolución es el 12 de noviembre"); "Los electores que soliciten el voto
 *    por correo no podrán votar personalmente en la mesa electoral"; tracking
 *    with "el identificador (DNI o pasaporte) y la fecha de nacimiento"; ERTA
 *    papers 3-9 Nov (to 17 Nov with challenges), vote back by 25 Nov; CERA by
 *    post to the consulate to 24 Nov or ballot box 21-26 Nov, and votes sent
 *    straight to the provincial board "serán considerados votos nulos";
 *    the free census-office line 900 343 232.
 *  - The official 29N manual for polling-station members (approved by the
 *    Council of Ministers on 27 Oct): requesters are marked with a "C" in the
 *    census list, "Si acuden a votar presencialmente, la Mesa no les permitirá
 *    hacerlo"; an envelope without the census certificate "debe destruirse".
 *  - Real Decreto 806/2026 (BOE 6 Oct 2026), art. 2: polling day "el domingo
 *    29 de noviembre de 2026".
 *
 * Left out because no official source says it: Cl@ve for the online request
 * (Correos, Interior and the INE list only a certificate or electronic DNI),
 * Correos' opening hours, any exception that lets a requester vote in person,
 * and any reason the voter must give. Fact pack:
 * research_notes/x10/vot-correu-mesa-29n-2026-11-05.md (gitignored).
 *
 * The page changes on its own dates. POSTAL_AS_OF picks the copy:
 *  - "open" up to 19 Nov: apply by 19 November;
 *  - "closed" from 20 Nov to 29 Nov: requests closed, hand it in by 25 Nov;
 *  - "over" from 30 Nov: the 29N postal vote is over; the law's rule for the
 *    next election.
 * tests/postal-vote.test.ts fails from 20 Nov until POSTAL_AS_OF is moved past
 * 19 Nov (re-read the sources, move it, test, publish `vot-correu`), and again
 * from 30 Nov until it is moved past polling day.
 *
 * No new photograph: the hero is the how-to-vote guide's (its exact key, alt
 * and caption, read from VOTING, because media rows are keyed by file).
 */

export const POSTAL_AS_OF = "2026-11-05";

export const POSTAL_29N = {
  election: "2026-11-29",
  requestFrom: "2026-10-06",
  requestBy: "2026-11-19",
  sendFrom: "2026-11-09",
  sendTo: "2026-11-22",
  deliverBy: "2026-11-25",
  ceraPostBy: "2026-11-24",
  ceraBoxFrom: "2026-11-21",
  ceraBoxTo: "2026-11-26",
} as const;

export type PostalPhase = "open" | "closed" | "over";

export function postalPhase(asOf: string): PostalPhase {
  if (asOf <= POSTAL_29N.requestBy) return "open";
  if (asOf <= POSTAL_29N.election) return "closed";
  return "over";
}

export const POSTAL_URL = {
  correos: "https://www.correos.es/es/es/particulares/para-el-ciudadano/voto-por-correo",
  interior: "https://29neleccionesgenerales.es/informacion-general/como-votar/voto-por-correo-desde-espana/",
  ine: "https://www.ine.es/dyngs/CEL/index.htm?cid=1700",
  ineForm: "https://sede.ine.gob.es/censoElectoralTramitesVxCWeb?cierre=0000517",
  tracking: "https://sede.ine.gob.es/ce-votoxcorreo/?lang=es_ES",
  loreg: "https://www.boe.es/buscar/act.php?id=BOE-A-1985-11672",
  jec: "https://www.juntaelectoralcentral.es/cs/jec/documentos/eg2026_calendario.pdf",
} as const;

const SOURCES: B2Source[] = [
  { name: "Voto por correo: solicitud hasta el 19 de noviembre de 2026 y depósito hasta el 25 de noviembre", url: POSTAL_URL.correos, publisher: "Correos" },
  { name: "Voto por correo desde España, elecciones del 29 de noviembre de 2026", url: POSTAL_URL.interior, publisher: "Ministerio del Interior" },
  { name: "Elecciones Generales 29 de noviembre de 2026: voto por correo, voto de los residentes temporalmente en el extranjero y CERA, consulta del envío", url: POSTAL_URL.ine, publisher: "INE — Oficina del Censo Electoral" },
  { name: "Consulta del estado del voto por correo", url: POSTAL_URL.tracking, publisher: "INE — Oficina del Censo Electoral" },
  { name: "Calendario electoral, elecciones generales 2026", url: POSTAL_URL.jec, publisher: "Junta Electoral Central" },
  { name: "Ley Orgánica 5/1985, del Régimen Electoral General, artículos 72 a 75 (texto consolidado)", url: POSTAL_URL.loreg, publisher: "Boletín Oficial del Estado" },
  { name: "Instrucción 5/2023 de la Junta Electoral Central, sobre la identificación personal al entregar el voto por correo en las oficinas de Correos", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2023-13667", publisher: "Boletín Oficial del Estado" },
  { name: "Real Decreto 806/2026, de 5 de octubre, de disolución del Congreso de los Diputados y del Senado y de convocatoria de elecciones", url: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20742", publisher: "Boletín Oficial del Estado" },
  { name: "Manual de instrucciones para las personas que integran las Mesas electorales, elecciones a Cortes Generales 2026 (voto por correo en la Mesa)", url: "https://29neleccionesgenerales.es/pdf/miembros_mesas/MMM_G2026_castellano_para_web.pdf", publisher: "Ministerio del Interior" },
];

const a = (label: string, url: string) => `[${label}](${url})`;

type PhaseCopy = {
  seoTitle: string;
  seoDescription: string;
  lead: string;
  stepsTitle: string;
  firstStep: { title: string; text: string };
  deadlineAnswer: string;
};

type Copy = {
  path: string;
  title: string;
  excerpt: string;
  phases: Record<PostalPhase, PhaseCopy>;
  steps: { title: string; text: string }[];
  note: string;
  whoTitle: string;
  who: string[];
  officeTitle: string;
  office: string[];
  onlineTitle: string;
  online: string[];
  arriveTitle: string;
  arrive: string[];
  sendTitle: string;
  send: string[];
  inPersonTitle: string;
  inPerson: string[];
  calTitle: string;
  calCaption: string;
  calHeaders: string[];
  calRows: string[][];
  calNote: string;
  abroadTitle: string;
  abroad: string[];
  faq: { question: string; answer: string }[];
  relatedLine: string;
};

const COPY: Record<Locale, Copy> = {
  ca: {
    path: "guies/vot-per-correu",
    title: "Vot per correu a les eleccions del 29 de novembre: terminis, com demanar-lo i com enviar-lo",
    excerpt:
      "Vot per correu el 29N: fins quan es demana, com fer-ho a Correus o per internet, quan arriben les paperetes, fins quan es pot enviar el vot i si després pots votar en persona.",
    phases: {
      open: {
        seoTitle: "Vot per correu 29N: demana'l fins al 19 de novembre",
        seoDescription:
          "Demana'l a Correus fins al dijous 19 de novembre: en persona amb el DNI original o per internet amb certificat digital. Lliura el vot fins al 25.",
        lead: `**Demana el vot per correu fins al dijous 19 de novembre del 2026** a qualsevol oficina de Correus, en persona i amb el DNI, el passaport o el carnet de conduir originals, o per internet al ${a("web de Correus", POSTAL_URL.correos)} amb certificat digital o DNI electrònic. Les paperetes t'arriben per correu certificat entre el 9 i el 22 de novembre, i has de **lliurar el vot a Correus fins al dimecres 25 de novembre**, sense pagar res. Un cop acceptada la sol·licitud, **ja no pots votar en persona** el diumenge 29.`,
        stepsTitle: "Vot per correu el 29N, pas a pas",
        firstStep: {
          title: "Demana'l fins al dijous 19 de novembre",
          text: "A qualsevol oficina de Correus, amb el DNI, el passaport o el carnet de conduir originals (mai una fotocòpia), o per internet al web de Correus amb certificat digital o DNI electrònic.",
        },
        deadlineAnswer:
          "Fins al dijous 19 de novembre del 2026, el desè dia abans de la votació (LOREG, article 72): a qualsevol oficina de Correus, en persona amb el document d'identitat original, o per internet al web de Correus amb certificat digital o DNI electrònic.",
      },
      closed: {
        seoTitle: "Vot per correu 29N: lliura'l fins al 25 de novembre",
        seoDescription:
          "El termini per demanar-lo es va tancar el 19 de novembre. Si el vas demanar, les paperetes arriben fins al 22 i el vot es lliura a Correus fins al 25.",
        lead: `**El termini per demanar el vot per correu es va tancar el dijous 19 de novembre.** Si el vas demanar, les paperetes arriben per correu certificat fins al 22 de novembre i has de **lliurar el vot a Correus fins al dimecres 25 de novembre**, amb identificació i sense pagar res; si no ets a casa quan arriben, les has de recollir a l'oficina de Correus. Qui l'ha demanat **ja no pot votar en persona** el diumenge 29. Si no el vas demanar, vota a la teva mesa de 9 a 20 h.`,
        stepsTitle: "Si el vas demanar: què has de fer ara",
        firstStep: {
          title: "Termini tancat el 19 de novembre",
          text: "Ja no es pot demanar. Si el vas demanar a temps, segueix els passos següents.",
        },
        deadlineAnswer:
          "Fins al dijous 19 de novembre del 2026, el desè dia abans de la votació (LOREG, article 72). El termini ja s'ha tancat: qui el va demanar ha de lliurar el vot a Correus fins al 25 de novembre.",
      },
      over: {
        seoTitle: "Vot per correu: com funciona i quan es demana",
        seoDescription:
          "El vot per correu del 29N ja s'ha acabat. Com es demana a Correus, què cal portar i quins terminis fixa la llei per a les properes eleccions.",
        lead: `**El vot per correu de les eleccions generals del 29 de novembre del 2026 ja s'ha acabat:** es podia demanar fins al 19 de novembre i lliurar fins al 25. A les properes eleccions funcionarà igual, perquè ho fixa la llei: es demana a Correus des de la convocatòria fins al desè dia abans de la votació i el vot s'envia abans del tercer dia previ (${a("LOREG, articles 72 i 73", POSTAL_URL.loreg)}). Les municipals estan previstes per al 23 de maig de 2027, però encara no s'han convocat.`,
        stepsTitle: "Com va funcionar el 29N, pas a pas",
        firstStep: {
          title: "Es demanava fins al 19 de novembre",
          text: "A qualsevol oficina de Correus, amb el DNI, el passaport o el carnet de conduir originals, o per internet al web de Correus amb certificat digital o DNI electrònic.",
        },
        deadlineAnswer:
          "Per al 29N, fins al 19 de novembre del 2026. A cada elecció el termini acaba el desè dia abans de la votació (LOREG, article 72), i comença el dia de la convocatòria.",
      },
    },
    steps: [
      {
        title: "Rep les paperetes entre el 9 i el 22 de novembre",
        text: "Arriben per correu certificat a l'adreça que vas donar i les has de signar tu, identificant-te. Si no ets a casa, t'han d'avisar perquè les recullis a l'oficina de Correus.",
      },
      {
        title: "Vota a casa",
        text: "Papereta del Congrés al sobre blanc; papereta del Senat, marcada seguint les instruccions de la mateixa papereta, al sobre sepia. Posa tots dos sobres i el certificat d'inscripció al cens dins del sobre adreçat a la mesa.",
      },
      {
        title: "Lliura'l a Correus fins al dimecres 25 de novembre",
        text: "A qualsevol oficina, en l'horari habitual, identificant-te. No costa res. Si no hi pots anar, ho pot fer una altra persona amb la teva autorització signada i una fotocòpia del teu document.",
      },
      {
        title: "El 29, Correus el porta a la teva mesa",
        text: "A les 9 del matí. Si en lliurar-lo dones una adreça electrònica, Correus t'avisa quan el vot arriba a la mesa. A les 20 h, la mesa el posa a l'urna.",
      },
    ],
    note: "Els terminis del vot per correu els fixen la LOREG i el calendari de la Junta Electoral Central; aquesta pàgina els repeteix tal com els publiquen Correus, el Ministeri de l'Interior i l'INE.",
    whoTitle: "Qui pot votar per correu",
    who: [
      "Qualsevol elector que el dia de la votació no serà a la localitat on li toca votar, o que no s'hi pot presentar, per exemple per malaltia o discapacitat (LOREG, article 72). També els espanyols inscrits com a residents a l'estranger (CERA) que són temporalment a Espanya: el poden demanar a Correus en el mateix termini.",
    ],
    officeTitle: "Com demanar-lo a Correus, en persona",
    office: [
      "**On i fins quan:** a qualsevol oficina de Correus, des de la convocatòria (6 d'octubre) fins al **19 de novembre**, tots dos inclosos.",
      "**Què cal portar:** el DNI, el passaport o el carnet de conduir originals, amb foto. El personal de Correus comprova la identitat i la signatura; **no s'accepta cap fotocòpia**.",
      `**El formulari:** l'omples a l'oficina, o abans a la ${a("seu de l'INE", POSTAL_URL.ineForm)}, sense certificat ni Cl@ve. En aquest cas l'has d'imprimir dues vegades, signar-lo i portar-lo a Correus: si no el presentes en una oficina, la sol·licitud no es tramita.`,
      "**Si estàs malalt:** si una malaltia o una incapacitat t'impedeix anar-hi, el pot demanar per tu una altra persona amb una autorització notarial (o consular) i un certificat mèdic oficial, que és gratuït. Cada autorització és per a un sol elector, i una persona no en pot representar més d'un.",
    ],
    onlineTitle: "Com demanar-lo per internet",
    online: [
      `Al ${a("web de Correus", POSTAL_URL.correos)}, amb un **certificat digital** o el **DNI electrònic**; el Ministeri de l'Interior indica que també cal tenir instal·lada l'aplicació AutoFirma. Omples les dades, signes electrònicament la petició i, en acabar, descarregues la sol·licitud.`,
      "**I amb Cl@ve?** Ni Correus, ni el Ministeri de l'Interior, ni l'INE no citen Cl@ve per demanar el vot per correu per internet (consultat el 5 de novembre de 2026): només el certificat digital o el DNI electrònic. Sense certificat, omple el formulari al web de l'INE i porta'l imprès a Correus.",
    ],
    arriveTitle: "Quan arriben les paperetes i què fer si no ets a casa",
    arrive: [
      "**Quan:** l'Oficina del Cens Electoral les envia per correu certificat **entre el 9 i el 22 de novembre**, a l'adreça que vas indicar. Segons l'INE, espera que es resolguin els recursos contra les candidatures, que acaben el 12 de novembre.",
      "**Què hi ha al sobre:** les paperetes i els sobres de votació, el certificat d'inscripció al cens, un sobre amb l'adreça de la teva mesa i un full d'instruccions.",
      "**Les has de signar tu:** el carter te les lliura a tu, identificant-te. **Si no ets a casa,** et deixa un avís i les has d'anar a recollir personalment a l'oficina de Correus que s'hi indica. Si estàs malalt, ho pot fer la persona amb autorització notarial.",
      `**Si no t'arriben:** consulta l'estat de l'enviament al ${a("servei de l'INE", POSTAL_URL.tracking)}, amb el número del DNI o del passaport i la data de naixement, o truca a l'Oficina del Cens Electoral al 900 343 232 (gratuït).`,
    ],
    sendTitle: "Com votar i lliurar el vot a Correus",
    send: [
      "**Vota:** posa la papereta de la candidatura que triïs al **Congrés** dins del sobre de votació **blanc**. A la papereta del **Senat**, marca els candidats que triïs seguint les instruccions de la papereta i posa-la al sobre **sepia**.",
      "**Prepara l'enviament:** dins del sobre adreçat a la mesa hi van els sobres de votació i **el certificat d'inscripció al cens**. No te'l deixis: segons el manual oficial de les meses, un sobre sense el certificat es destrueix i no compta ni com a vot nul.",
      "**Lliura'l fins al dimecres 25 de novembre** en una oficina de Correus, en l'horari habitual, identificant-te. Va per correu certificat i **no cal pagar res**.",
      "**Si no hi pots anar,** el pot portar una altra persona amb una autorització signada per tu i una fotocòpia del teu DNI, passaport o un altre document oficial. Correus té un model d'autorització.",
      "**Avís per correu electrònic:** com a novetat, si dones una adreça electrònica en lliurar el vot, Correus t'avisa quan arriba a la mesa el dia de la votació.",
      "**El dia 29,** Correus porta els vots a les meses a les 9 del matí. A les 20 h, quan ha votat l'última persona, la mesa els obre d'un en un, comprova el certificat i posa els sobres a l'urna.",
    ],
    inPersonTitle: "Ja l'he demanat: puc votar en persona?",
    inPerson: [
      "**No.** Quan l'Oficina del Cens Electoral accepta la sol·licitud, ho anota al cens perquè no votis personalment (LOREG, article 73). Segons el manual oficial de les meses del 29N, al costat del teu nom hi surt una «C» i, si vas al col·legi, la mesa no et deixarà votar.",
      "Per això, si l'has demanat, l'única manera de votar és per correu: si el 22 de novembre encara no t'han arribat les paperetes, consulta l'enviament i truca a l'Oficina del Cens Electoral.",
    ],
    calTitle: "Calendari del vot per correu del 29N",
    calCaption: "Vot per correu, eleccions generals del 29 de novembre de 2026",
    calHeaders: ["Què", "Quan (2026)"],
    calRows: [
      ["Demanar el vot per correu a Correus", "6 d'octubre – dijous 19 de novembre"],
      ["Enviament de les paperetes per correu certificat", "Dilluns 9 – diumenge 22 de novembre"],
      ["Lliurar el vot a Correus", "Des que reps les paperetes fins al dimecres 25 de novembre"],
      ["Correus porta els vots a les meses", "Diumenge 29 de novembre, a les 9 h (i fins a les 20 h)"],
      ["La mesa posa els vots per correu a l'urna", "Diumenge 29 de novembre, a les 20 h"],
      ["Residents a l'estranger (CERA): vot per correu al consolat", "Fins al dimarts 24 de novembre"],
      ["Residents a l'estranger (CERA): vot a l'urna del consolat", "Dissabte 21 – dijous 26 de novembre"],
    ],
    calNote: "Fonts: calendari de la Junta Electoral Central, INE i LOREG (articles 72 a 75), consultats el 5 de novembre de 2026.",
    abroadTitle: "Si vius o ets a l'estranger",
    abroad: [
      "**Temporalment a l'estranger (ERTA):** el termini per demanar el vot al consolat va acabar el 31 d'octubre. L'INE envia la documentació entre el 3 i el 9 de novembre (fins al 17 si hi ha recursos) i el vot s'ha de tornar per correu certificat fins al 25 de novembre.",
      "**Residents a l'estranger (CERA):** no cal demanar res, la documentació arriba d'ofici. Pots enviar el vot per correu al consolat fins al **24 de novembre** o dipositar-lo a l'urna del consolat del **21 al 26 de novembre**. No l'enviïs directament a la Junta Electoral Provincial: segons l'INE, els vots que no arriben a través del consolat són nuls.",
      "**CERA que ets a Espanya:** pots demanar el vot per correu a Correus fins al 19 de novembre, com qualsevol elector resident.",
    ],
    faq: [
      { question: "Es pot demanar el vot per correu amb Cl@ve?", answer: "Correus, el Ministeri de l'Interior i l'INE només citen el certificat digital o el DNI electrònic per demanar-lo per internet, no Cl@ve. Sense certificat, pots omplir el formulari al web de l'INE, imprimir-lo dues vegades i presentar-lo signat a una oficina de Correus, o fer-ho tot a l'oficina amb el DNI." },
      { question: "Si he demanat el vot per correu, puc votar en persona?", answer: "No. Quan la sol·licitud s'accepta, l'Oficina del Cens Electoral ho anota al cens: al costat del teu nom hi surt una «C» i la mesa no et deixarà votar presencialment. Només pots votar per correu." },
      { question: "Quan arriben les paperetes del vot per correu?", answer: "Entre el 9 i el 22 de novembre de 2026, per correu certificat a l'adreça que vas indicar. Les has de signar tu, identificant-te." },
      { question: "Què passa si no soc a casa quan arriba el carter?", answer: "Et deixa un avís i has d'anar a recollir les paperetes personalment a l'oficina de Correus que s'hi indica, amb el document d'identitat. Si estàs malalt, ho pot fer la persona que tingui la teva autorització notarial." },
      { question: "Fins quan puc enviar el vot per correu?", answer: "Fins al dimecres 25 de novembre de 2026, en una oficina de Correus i en l'horari habitual, identificant-te. Va per correu certificat i és gratuït." },
      { question: "Pot portar el vot a Correus una altra persona?", answer: "Sí, amb una autorització signada per tu i una fotocòpia del teu DNI, passaport o un altre document oficial. Correus té un model d'autorització. Demanar el vot, en canvi, només ho pot fer una altra persona en cas de malaltia, amb autorització notarial i certificat mèdic oficial." },
      { question: "Costa diners votar per correu?", answer: "No. El sobre adreçat a la mesa no necessita segell (LOREG, article 73): el Ministeri de l'Interior paga l'enviament." },
      { question: "Com sé si el meu vot per correu ha arribat a la mesa?", answer: "Com a novetat, si dones una adreça electrònica quan lliures el vot a Correus, et confirmen per correu electrònic que ha arribat a la mesa el dia de la votació. L'estat de l'enviament de les paperetes es consulta al web de l'INE." },
    ],
    relatedLine: "Tota la resta del 29N (on votes, horari, document, calendari complet): ",
  },
  es: {
    path: "guias/voto-por-correo",
    title: "Voto por correo en las elecciones del 29 de noviembre: plazos, cómo pedirlo y cómo enviarlo",
    excerpt:
      "Voto por correo el 29N: hasta cuándo se pide, cómo hacerlo en Correos o por internet, cuándo llega la documentación, hasta cuándo se envía el voto y si después puedes votar en persona.",
    phases: {
      open: {
        seoTitle: "Voto por correo 29N: hasta el 19 de noviembre, cómo pedirlo",
        seoDescription:
          "Pídelo en Correos hasta el jueves 19 de noviembre: en persona con el DNI original o por internet con certificado digital. Entrega el voto hasta el 25.",
        lead: `**Pide el voto por correo hasta el jueves 19 de noviembre de 2026** en cualquier oficina de Correos, en persona y con el DNI, el pasaporte o el carné de conducir originales, o por internet en la ${a("web de Correos", POSTAL_URL.correos)} con certificado digital o DNI electrónico. La documentación te llega por correo certificado entre el 9 y el 22 de noviembre, y tienes que **entregar el voto en Correos hasta el miércoles 25 de noviembre**, sin pagar nada. Una vez aceptada la solicitud, **ya no puedes votar en persona** el domingo 29.`,
        stepsTitle: "Voto por correo el 29N, paso a paso",
        firstStep: {
          title: "Pídelo hasta el jueves 19 de noviembre",
          text: "En cualquier oficina de Correos, con el DNI, el pasaporte o el carné de conducir originales (nunca una fotocopia), o por internet en la web de Correos con certificado digital o DNI electrónico.",
        },
        deadlineAnswer:
          "Hasta el jueves 19 de noviembre de 2026, el décimo día antes de la votación (LOREG, artículo 72): en cualquier oficina de Correos, en persona con el documento de identidad original, o por internet en la web de Correos con certificado digital o DNI electrónico.",
      },
      closed: {
        seoTitle: "Voto por correo 29N: entrégalo hasta el 25 de noviembre",
        seoDescription:
          "El plazo para pedirlo cerró el 19 de noviembre. Si lo pediste, la documentación llega hasta el 22 y el voto se entrega en Correos hasta el 25.",
        lead: `**El plazo para pedir el voto por correo cerró el jueves 19 de noviembre.** Si lo pediste, la documentación llega por correo certificado hasta el 22 de noviembre y tienes que **entregar el voto en Correos hasta el miércoles 25 de noviembre**, identificándote y sin pagar nada; si no estás en casa cuando llega, tienes que recogerla en la oficina de Correos. Quien lo ha pedido **ya no puede votar en persona** el domingo 29. Si no lo pediste, vota en tu mesa de 9 a 20 h.`,
        stepsTitle: "Si lo pediste: qué tienes que hacer ahora",
        firstStep: {
          title: "Plazo cerrado el 19 de noviembre",
          text: "Ya no se puede pedir. Si lo pediste a tiempo, sigue los pasos siguientes.",
        },
        deadlineAnswer:
          "Hasta el jueves 19 de noviembre de 2026, el décimo día antes de la votación (LOREG, artículo 72). El plazo ya se ha cerrado: quien lo pidió tiene que entregar el voto en Correos hasta el 25 de noviembre.",
      },
      over: {
        seoTitle: "Voto por correo: cómo funciona y cuándo se pide",
        seoDescription:
          "El voto por correo del 29N ya terminó. Cómo se pide en Correos, qué hay que llevar y qué plazos fija la ley para las próximas elecciones.",
        lead: `**El voto por correo de las elecciones generales del 29 de noviembre de 2026 ya ha terminado:** se podía pedir hasta el 19 de noviembre y entregar hasta el 25. En las próximas elecciones funcionará igual, porque lo fija la ley: se pide en Correos desde la convocatoria hasta el décimo día antes de la votación y el voto se envía antes del tercer día previo (${a("LOREG, artículos 72 y 73", POSTAL_URL.loreg)}). Las municipales están previstas para el 23 de mayo de 2027, pero aún no se han convocado.`,
        stepsTitle: "Cómo funcionó el 29N, paso a paso",
        firstStep: {
          title: "Se pedía hasta el 19 de noviembre",
          text: "En cualquier oficina de Correos, con el DNI, el pasaporte o el carné de conducir originales, o por internet en la web de Correos con certificado digital o DNI electrónico.",
        },
        deadlineAnswer:
          "Para el 29N, hasta el 19 de noviembre de 2026. En cada elección el plazo termina el décimo día antes de la votación (LOREG, artículo 72) y empieza el día de la convocatoria.",
      },
    },
    steps: [
      {
        title: "Recibe la documentación entre el 9 y el 22 de noviembre",
        text: "Llega por correo certificado a la dirección que diste y la tienes que firmar tú, identificándote. Si no estás en casa, te tienen que avisar para que la recojas en la oficina de Correos.",
      },
      {
        title: "Vota en casa",
        text: "Papeleta del Congreso en el sobre blanco; papeleta del Senado, marcada según las instrucciones de la propia papeleta, en el sobre sepia. Mete los dos sobres y el certificado de inscripción en el censo en el sobre dirigido a la mesa.",
      },
      {
        title: "Entrégalo en Correos hasta el miércoles 25 de noviembre",
        text: "En cualquier oficina, en el horario habitual, identificándote. No cuesta nada. Si no puedes ir, puede hacerlo otra persona con tu autorización firmada y una fotocopia de tu documento.",
      },
      {
        title: "El 29, Correos lo lleva a tu mesa",
        text: "A las 9 de la mañana. Si al entregarlo das una dirección de correo electrónico, Correos te avisa cuando el voto llega a la mesa. A las 20 h, la mesa lo mete en la urna.",
      },
    ],
    note: "Los plazos del voto por correo los fijan la LOREG y el calendario de la Junta Electoral Central; esta página los repite tal como los publican Correos, el Ministerio del Interior y el INE.",
    whoTitle: "Quién puede votar por correo",
    who: [
      "Cualquier elector que el día de la votación no vaya a estar en la localidad donde le toca votar, o que no pueda presentarse, por ejemplo por enfermedad o discapacidad (LOREG, artículo 72). También los españoles inscritos como residentes en el extranjero (CERA) que estén temporalmente en España: pueden pedirlo en Correos en el mismo plazo.",
    ],
    officeTitle: "Cómo pedirlo en Correos, en persona",
    office: [
      "**Dónde y hasta cuándo:** en cualquier oficina de Correos, desde la convocatoria (6 de octubre) hasta el **19 de noviembre**, ambos incluidos.",
      "**Qué hay que llevar:** el DNI, el pasaporte o el carné de conducir originales, con foto. El personal de Correos comprueba la identidad y la firma; **no se acepta ninguna fotocopia**.",
      `**El formulario:** lo rellenas en la oficina, o antes en la ${a("sede del INE", POSTAL_URL.ineForm)}, sin certificado ni Cl@ve. En ese caso tienes que imprimirlo dos veces, firmarlo y llevarlo a Correos: si no lo presentas en una oficina, la solicitud no se tramita.`,
      "**Si estás enfermo:** si una enfermedad o una incapacidad te impide ir, puede pedirlo por ti otra persona con una autorización notarial (o consular) y un certificado médico oficial, que es gratuito. Cada autorización es para un solo elector, y una persona no puede representar a más de uno.",
    ],
    onlineTitle: "Cómo pedirlo por internet",
    online: [
      `En la ${a("web de Correos", POSTAL_URL.correos)}, con un **certificado digital** o el **DNI electrónico**; el Ministerio del Interior indica que además hay que tener instalada la aplicación AutoFirma. Rellenas los datos, firmas electrónicamente la petición y, al terminar, descargas la solicitud.`,
      "**¿Y con Cl@ve?** Ni Correos, ni el Ministerio del Interior, ni el INE citan Cl@ve para pedir el voto por correo por internet (consultado el 5 de noviembre de 2026): solo el certificado digital o el DNI electrónico. Sin certificado, rellena el formulario en la web del INE y llévalo impreso a Correos.",
    ],
    arriveTitle: "Cuándo llega la documentación y qué hacer si no estás en casa",
    arrive: [
      "**Cuándo:** la Oficina del Censo Electoral la envía por correo certificado **entre el 9 y el 22 de noviembre**, a la dirección que indicaste. Según el INE, espera a que se resuelvan los recursos contra las candidaturas, que terminan el 12 de noviembre.",
      "**Qué hay en el sobre:** las papeletas y los sobres de votación, el certificado de inscripción en el censo, un sobre con la dirección de tu mesa y una hoja de instrucciones.",
      "**La tienes que firmar tú:** el cartero te la entrega a ti, identificándote. **Si no estás en casa,** te deja un aviso y tienes que ir a recogerla personalmente a la oficina de Correos que indica. Si estás enfermo, puede hacerlo la persona con autorización notarial.",
      `**Si no te llega:** consulta el estado del envío en el ${a("servicio del INE", POSTAL_URL.tracking)}, con el número del DNI o del pasaporte y la fecha de nacimiento, o llama a la Oficina del Censo Electoral al 900 343 232 (gratuito).`,
    ],
    sendTitle: "Cómo votar y entregar el voto en Correos",
    send: [
      "**Vota:** mete la papeleta de la candidatura que elijas al **Congreso** en el sobre de votación **blanco**. En la papeleta del **Senado**, marca los candidatos que elijas siguiendo las instrucciones de la papeleta y métela en el sobre **sepia**.",
      "**Prepara el envío:** dentro del sobre dirigido a la mesa van los sobres de votación y **el certificado de inscripción en el censo**. No lo olvides: según el manual oficial de las mesas, un sobre sin el certificado se destruye y no cuenta ni como voto nulo.",
      "**Entrégalo hasta el miércoles 25 de noviembre** en una oficina de Correos, en el horario habitual, identificándote. Va por correo certificado y **no hay que pagar nada**.",
      "**Si no puedes ir,** puede llevarlo otra persona con una autorización firmada por ti y una fotocopia de tu DNI, pasaporte u otro documento oficial. Correos tiene un modelo de autorización.",
      "**Aviso por correo electrónico:** como novedad, si das una dirección de correo electrónico al entregar el voto, Correos te avisa cuando llega a la mesa el día de la votación.",
      "**El día 29,** Correos lleva los votos a las mesas a las 9 de la mañana. A las 20 h, cuando ha votado la última persona, la mesa los abre de uno en uno, comprueba el certificado y mete los sobres en la urna.",
    ],
    inPersonTitle: "Ya lo he pedido: ¿puedo votar en persona?",
    inPerson: [
      "**No.** Cuando la Oficina del Censo Electoral acepta la solicitud, lo anota en el censo para que no votes personalmente (LOREG, artículo 73). Según el manual oficial de las mesas del 29N, junto a tu nombre aparece una «C» y, si vas al colegio, la mesa no te dejará votar.",
      "Por eso, si lo has pedido, la única forma de votar es por correo: si el 22 de noviembre aún no te ha llegado la documentación, consulta el envío y llama a la Oficina del Censo Electoral.",
    ],
    calTitle: "Calendario del voto por correo del 29N",
    calCaption: "Voto por correo, elecciones generales del 29 de noviembre de 2026",
    calHeaders: ["Qué", "Cuándo (2026)"],
    calRows: [
      ["Pedir el voto por correo en Correos", "6 de octubre – jueves 19 de noviembre"],
      ["Envío de la documentación por correo certificado", "Lunes 9 – domingo 22 de noviembre"],
      ["Entregar el voto en Correos", "Desde que recibes la documentación hasta el miércoles 25 de noviembre"],
      ["Correos lleva los votos a las mesas", "Domingo 29 de noviembre, a las 9 h (y hasta las 20 h)"],
      ["La mesa mete los votos por correo en la urna", "Domingo 29 de noviembre, a las 20 h"],
      ["Residentes en el extranjero (CERA): voto por correo al consulado", "Hasta el martes 24 de noviembre"],
      ["Residentes en el extranjero (CERA): voto en la urna del consulado", "Sábado 21 – jueves 26 de noviembre"],
    ],
    calNote: "Fuentes: calendario de la Junta Electoral Central, INE y LOREG (artículos 72 a 75), consultados el 5 de noviembre de 2026.",
    abroadTitle: "Si vives o estás en el extranjero",
    abroad: [
      "**Temporalmente en el extranjero (ERTA):** el plazo para pedir el voto en el consulado terminó el 31 de octubre. El INE envía la documentación entre el 3 y el 9 de noviembre (hasta el 17 si hay recursos) y el voto se devuelve por correo certificado hasta el 25 de noviembre.",
      "**Residentes en el extranjero (CERA):** no hay que pedir nada, la documentación llega de oficio. Puedes enviar el voto por correo al consulado hasta el **24 de noviembre** o depositarlo en la urna del consulado del **21 al 26 de noviembre**. No lo envíes directamente a la Junta Electoral Provincial: según el INE, los votos que no llegan a través del consulado son nulos.",
      "**CERA que estás en España:** puedes pedir el voto por correo en Correos hasta el 19 de noviembre, como cualquier elector residente.",
    ],
    faq: [
      { question: "¿Se puede pedir el voto por correo con Cl@ve?", answer: "Correos, el Ministerio del Interior y el INE solo citan el certificado digital o el DNI electrónico para pedirlo por internet, no Cl@ve. Sin certificado, puedes rellenar el formulario en la web del INE, imprimirlo dos veces y presentarlo firmado en una oficina de Correos, o hacerlo todo en la oficina con el DNI." },
      { question: "Si he pedido el voto por correo, ¿puedo votar en persona?", answer: "No. Cuando la solicitud se acepta, la Oficina del Censo Electoral lo anota en el censo: junto a tu nombre aparece una «C» y la mesa no te dejará votar presencialmente. Solo puedes votar por correo." },
      { question: "¿Cuándo llega la documentación del voto por correo?", answer: "Entre el 9 y el 22 de noviembre de 2026, por correo certificado a la dirección que indicaste. La tienes que firmar tú, identificándote." },
      { question: "¿Qué pasa si no estoy en casa cuando llega el cartero?", answer: "Te deja un aviso y tienes que ir a recoger la documentación personalmente a la oficina de Correos que indica, con el documento de identidad. Si estás enfermo, puede hacerlo la persona que tenga tu autorización notarial." },
      { question: "¿Hasta cuándo puedo enviar el voto por correo?", answer: "Hasta el miércoles 25 de noviembre de 2026, en una oficina de Correos y en el horario habitual, identificándote. Va por correo certificado y es gratuito." },
      { question: "¿Puede llevar el voto a Correos otra persona?", answer: "Sí, con una autorización firmada por ti y una fotocopia de tu DNI, pasaporte u otro documento oficial. Correos tiene un modelo de autorización. Pedir el voto, en cambio, solo lo puede hacer otra persona en caso de enfermedad, con autorización notarial y certificado médico oficial." },
      { question: "¿Cuesta dinero votar por correo?", answer: "No. El sobre dirigido a la mesa no necesita franqueo (LOREG, artículo 73): el Ministerio del Interior paga el envío." },
      { question: "¿Cómo sé si mi voto por correo ha llegado a la mesa?", answer: "Como novedad, si das una dirección de correo electrónico al entregar el voto en Correos, te confirman por correo electrónico que ha llegado a la mesa el día de la votación. El estado del envío de la documentación se consulta en la web del INE." },
    ],
    relatedLine: "Todo lo demás del 29N (dónde votas, horario, documento, calendario completo): ",
  },
  en: {
    path: "guides/postal-vote-spain",
    title: "Postal vote in Spain's 29 November election: deadlines, how to apply and how to send it",
    excerpt:
      "Voting by post in Spain's 29 November election: the deadline to apply, how to do it at Correos or online, when the papers arrive, the last day to send your vote and voting in person.",
    phases: {
      open: {
        seoTitle: "Postal vote, Spain 29 Nov election: apply by 19 November",
        seoDescription:
          "Apply at any Correos post office by Thursday 19 November, in person with original ID or online with a digital certificate. Hand in your vote by 25 Nov.",
        lead: `**Apply for a postal vote by Thursday 19 November 2026** at any Correos post office, in person with your original DNI, passport or driving licence, or online on the ${a("Correos website", POSTAL_URL.correos)} with a digital certificate or electronic DNI. The papers reach you by registered post between 9 and 22 November, and you must **hand your vote in at Correos by Wednesday 25 November**, free of charge. Once your application is accepted, **you can no longer vote in person** on Sunday 29 November. Only Spanish citizens on the electoral roll can vote in this election.`,
        stepsTitle: "Postal vote for 29 November, step by step",
        firstStep: {
          title: "Apply by Thursday 19 November",
          text: "At any Correos post office, with your original DNI, passport or driving licence (never a photocopy), or online on the Correos website with a digital certificate or electronic DNI.",
        },
        deadlineAnswer:
          "Until Thursday 19 November 2026, the tenth day before polling day (electoral law, article 72): at any Correos post office, in person with your original ID, or online on the Correos website with a digital certificate or electronic DNI.",
      },
      closed: {
        seoTitle: "Postal vote, Spain 29 Nov election: hand it in by 25 Nov",
        seoDescription:
          "Applications closed on 19 November. If you applied, the papers arrive by 22 November and you hand in your vote at Correos by 25 November.",
        lead: `**Applications for a postal vote closed on Thursday 19 November.** If you applied, the papers arrive by registered post by 22 November and you must **hand your vote in at Correos by Wednesday 25 November**, showing ID, free of charge; if you are out when they come, you collect them at the post office. Anyone who applied **can no longer vote in person** on Sunday 29 November. If you did not apply, vote at your polling station from 9:00 to 20:00.`,
        stepsTitle: "If you applied: what to do now",
        firstStep: {
          title: "Applications closed on 19 November",
          text: "You can no longer apply. If you applied in time, follow the steps below.",
        },
        deadlineAnswer:
          "Until Thursday 19 November 2026, the tenth day before polling day (electoral law, article 72). Applications are now closed: anyone who applied must hand the vote in at Correos by 25 November.",
      },
      over: {
        seoTitle: "Postal vote in Spain: how it works and when to apply",
        seoDescription:
          "The 29 November postal vote is over. How a postal vote is requested at Correos, what to bring and the deadlines the law sets for the next election.",
        lead: `**The postal vote for Spain's general election of 29 November 2026 is over:** applications closed on 19 November and votes had to be handed in by 25 November. The next election works the same way, because the law sets it: you apply at Correos from the day the election is called until the tenth day before polling day, and post your vote before the third day before it (${a("electoral law, articles 72 and 73", POSTAL_URL.loreg)}). The municipal elections are expected on 23 May 2027 but have not been called yet.`,
        stepsTitle: "How it worked on 29 November, step by step",
        firstStep: {
          title: "Applications ran until 19 November",
          text: "At any Correos post office, with an original DNI, passport or driving licence, or online on the Correos website with a digital certificate or electronic DNI.",
        },
        deadlineAnswer:
          "For 29 November, until 19 November 2026. In every election the deadline is the tenth day before polling day (electoral law, article 72), and applications open on the day the election is called.",
      },
    },
    steps: [
      {
        title: "Receive the papers between 9 and 22 November",
        text: "They come by registered post to the address you gave, and you must sign for them yourself, showing ID. If you are out, you are left a notice to collect them at the post office.",
      },
      {
        title: "Vote at home",
        text: "Congress ballot in the white envelope; Senate ballot, marked following the instructions printed on it, in the sepia envelope. Put both envelopes and the census certificate in the envelope addressed to your polling table.",
      },
      {
        title: "Hand it in at Correos by Wednesday 25 November",
        text: "At any post office, during normal opening hours, showing ID. It costs nothing. If you cannot go, someone else can, with your signed authorisation and a photocopy of your ID.",
      },
      {
        title: "On the 29th, Correos takes it to your table",
        text: "At 9:00. If you give an e-mail address when you hand it in, Correos tells you when your vote reaches the table. At 20:00 the table puts it in the ballot box.",
      },
    ],
    note: "Postal-vote deadlines are set by the electoral law (LOREG) and the Central Electoral Board's calendar; this page repeats them as Correos, the Interior Ministry and the INE publish them.",
    whoTitle: "Who can vote by post",
    who: [
      "Any voter who will not be in the town where they vote on polling day, or who cannot go in person, for example because of illness or disability (electoral law, article 72). Spaniards registered as living abroad (CERA) who are temporarily in Spain can also apply at Correos within the same deadline. Foreign residents, EU citizens included, cannot vote in a general election, by post or otherwise.",
    ],
    officeTitle: "How to apply in person at Correos",
    office: [
      "**Where and until when:** at any Correos post office, from the day the election was called (6 October) until **19 November**, both included.",
      "**What to bring:** your original DNI, passport or driving licence, with a photo. Correos staff check your identity and signature; **photocopies are never accepted**.",
      `**The form:** fill it in at the office, or beforehand on the ${a("INE's website", POSTAL_URL.ineForm)}, with no certificate or Cl@ve. In that case print it twice, sign it and take it to Correos: an application that is not handed in at a post office is not processed.`,
      "**If you are ill:** if illness or incapacity stops you from going, someone else can apply for you with a notarised (or consular) authorisation and an official medical certificate, which is free. Each authorisation covers one voter, and no one can represent more than one.",
    ],
    onlineTitle: "How to apply online",
    online: [
      `On the ${a("Correos website", POSTAL_URL.correos)}, with a **digital certificate** or an **electronic DNI**; the Interior Ministry adds that you need the AutoFirma app installed. You fill in your details, sign the request electronically and, at the end, download the application.`,
      "**What about Cl@ve?** Neither Correos, the Interior Ministry nor the INE mentions Cl@ve for the online postal-vote application (checked on 5 November 2026): only a digital certificate or electronic DNI. Without a certificate, fill in the form on the INE's website and take the printout to Correos.",
    ],
    arriveTitle: "When the papers arrive, and what if you are out",
    arrive: [
      "**When:** the census office sends them by registered post **between 9 and 22 November**, to the address you gave. According to the INE, it waits until challenges to the candidate lists are settled, by 12 November.",
      "**What is inside:** the ballot papers and voting envelopes, your census certificate, an envelope addressed to your polling table and an instruction sheet.",
      "**You sign for them yourself:** the postman hands them to you, after checking your ID. **If you are out,** you get a notice and must collect them in person at the post office it names. If you are ill, the person holding your notarised authorisation can do it.",
      `**If they do not arrive:** check the status of the mailing on the ${a("INE's tracking service", POSTAL_URL.tracking)}, with your DNI or passport number and date of birth, or call the census office's free line, 900 343 232.`,
    ],
    sendTitle: "How to vote and hand in your vote at Correos",
    send: [
      "**Vote:** put the ballot of the list you choose for **Congress** in the **white** voting envelope. On the **Senate** ballot, mark the candidates you choose, following the instructions printed on it, and put it in the **sepia** envelope.",
      "**Pack it:** the envelope addressed to the table holds the voting envelopes and **your census certificate**. Do not forget it: according to the official manual for polling tables, an envelope without the certificate is destroyed and does not even count as a spoilt vote.",
      "**Hand it in by Wednesday 25 November** at a Correos post office, during normal opening hours, showing ID. It goes by registered post and **costs nothing**.",
      "**If you cannot go,** someone else can take it with an authorisation signed by you and a photocopy of your DNI, passport or other official ID. Correos has a model authorisation.",
      "**E-mail confirmation:** new this time, if you give an e-mail address when you hand in your vote, Correos tells you when it reaches the table on polling day.",
      "**On the 29th,** Correos takes the votes to the tables at 9:00. At 20:00, after the last voter, the table opens them one by one, checks the certificate and puts the envelopes in the ballot boxes.",
    ],
    inPersonTitle: "I have applied: can I still vote in person?",
    inPerson: [
      "**No.** Once the census office accepts your application, it marks the electoral roll so that you do not vote in person (electoral law, article 73). According to the official manual for the 29 November polling tables, a \"C\" appears next to your name and, if you turn up, the table will not let you vote.",
      "So once you have applied, voting by post is the only way left: if the papers have not arrived by 22 November, check the mailing and call the census office.",
    ],
    calTitle: "Postal vote calendar for 29 November",
    calCaption: "Postal vote, general election of 29 November 2026",
    calHeaders: ["What", "When (2026)"],
    calRows: [
      ["Apply for a postal vote at Correos", "6 October – Thursday 19 November"],
      ["Papers sent by registered post", "Monday 9 – Sunday 22 November"],
      ["Hand in your vote at Correos", "From receiving the papers until Wednesday 25 November"],
      ["Correos takes the votes to the tables", "Sunday 29 November, at 9:00 (and until 20:00)"],
      ["The table puts postal votes in the ballot box", "Sunday 29 November, at 20:00"],
      ["Living abroad (CERA): postal vote to the consulate", "Until Tuesday 24 November"],
      ["Living abroad (CERA): ballot box at the consulate", "Saturday 21 – Thursday 26 November"],
    ],
    calNote: "Sources: Central Electoral Board calendar, INE and electoral law (articles 72 to 75), checked on 5 November 2026.",
    abroadTitle: "If you live or are abroad",
    abroad: [
      "**Temporarily abroad (ERTA):** the deadline to request your vote at the consulate was 31 October. The INE sends the papers between 3 and 9 November (until 17 November if lists are challenged) and the vote goes back by registered post by 25 November.",
      "**Living abroad (CERA):** no application is needed; the papers are sent automatically. Post your vote to the consulate by **24 November**, or put it in the consulate's ballot box **from 21 to 26 November**. Do not send it straight to the provincial electoral board: according to the INE, votes that do not come through the consulate are void.",
      "**CERA voters who are in Spain:** you can apply for a postal vote at Correos until 19 November, like any resident voter.",
    ],
    faq: [
      { question: "Can I apply for a postal vote with Cl@ve?", answer: "Correos, the Interior Ministry and the INE only mention a digital certificate or an electronic DNI for the online application, not Cl@ve. Without a certificate, you can fill in the form on the INE's website, print it twice and hand it in signed at a Correos post office, or do it all at the office with your DNI." },
      { question: "I applied for a postal vote: can I still vote in person?", answer: "No. Once your application is accepted, the census office marks the electoral roll: a \"C\" appears next to your name and the polling table will not let you vote in person. You can only vote by post." },
      { question: "When do the postal-vote papers arrive?", answer: "Between 9 and 22 November 2026, by registered post to the address you gave. You must sign for them yourself, showing ID." },
      { question: "What if I am out when the postman comes?", answer: "You are left a notice and must collect the papers in person at the post office it names, with your ID. If you are ill, the person holding your notarised authorisation can collect them." },
      { question: "What is the last day to send my postal vote?", answer: "Wednesday 25 November 2026, at a Correos post office during normal opening hours, showing ID. It goes by registered post, free of charge." },
      { question: "Can someone else hand in my postal vote?", answer: "Yes, with an authorisation signed by you and a photocopy of your DNI, passport or other official ID; Correos has a model form. Applying for the postal vote on someone else's behalf, by contrast, is only allowed in case of illness, with a notarised authorisation and an official medical certificate." },
      { question: "Does voting by post cost anything?", answer: "No. The envelope addressed to the polling table needs no stamp (electoral law, article 73): the Interior Ministry pays for the mailing." },
      { question: "Can foreigners vote by post in Spain's general election?", answer: "No. Only Spanish citizens aged 18 or over on the electoral roll vote in a general election (electoral law, article 2), by post or in person. EU citizens can vote in municipal elections if they have registered their wish to vote." },
    ],
    relatedLine: "Everything else about 29 November (where you vote, hours, ID, the full calendar): ",
  },
};

const DEADLINE_QUESTION: Record<Locale, string> = {
  ca: "Fins quan es pot demanar el vot per correu per al 29N?",
  es: "¿Hasta cuándo se puede pedir el voto por correo para el 29N?",
  en: "What is the deadline to apply for a postal vote for 29 November?",
};

const VOTING_LABEL: Record<Locale, string> = {
  ca: "com votar a les eleccions del 29 de novembre",
  es: "cómo votar en las elecciones del 29 de noviembre",
  en: "how to vote in the 29 November election",
};

const ABROAD_LINK: Record<Locale, string> = {
  ca: `Tots els terminis per als electors a l'estranger són a la ${a("pàgina de l'INE per al 29N", POSTAL_URL.ine)}.`,
  es: `Todos los plazos para los electores en el extranjero están en la ${a("página del INE para el 29N", POSTAL_URL.ine)}.`,
  en: `Every deadline for voters abroad is on the ${a("INE's page for 29 November", POSTAL_URL.ine)} (in Spanish).`,
};

function body(locale: Locale, phase: PostalPhase): Block[] {
  const t = COPY[locale];
  const p = t.phases[phase];
  return [
    lead(p.lead),
    steps(p.stepsTitle, [p.firstStep, ...t.steps]),
    languageLinks(),
    callout("official", verifiedLine(locale, POSTAL_AS_OF), t.note),
    ...h2(t.inPersonTitle, ...t.inPerson),
    ...h2(t.officeTitle),
    list(...t.office),
    ...h2(t.onlineTitle, ...t.online),
    ...h2(t.arriveTitle),
    list(...t.arrive),
    ...h2(t.sendTitle),
    list(...t.send),
    ...h2(t.calTitle),
    table(t.calCaption, t.calHeaders, t.calRows, t.calNote),
    ...h2(t.whoTitle, ...t.who),
    ...h2(t.abroadTitle),
    list(...t.abroad),
    ...paras(ABROAD_LINK[locale], t.relatedLine + b2link("voting", locale, VOTING_LABEL[locale]) + "."),
    faq([{ question: DEADLINE_QUESTION[locale], answer: p.deadlineAnswer }, ...t.faq]),
    ...b2Related(["voting", "mesa", "candidates", "electionNight", "congressResults"], locale),
  ];
}

/** The article as it reads on `asOf` (tests render every phase). */
export function buildPostalVote(asOf: string = POSTAL_AS_OF): B2Article {
  const phase = postalPhase(asOf);
  return {
    key: "postalVote",
    entryKey: "guide-postal-vote",
    categoryKey: "public-services",
    sources: SOURCES,
    heroKey: VOTING.heroKey,
    heroAlt: VOTING.heroAlt,
    heroCaption: VOTING.heroCaption,
    verifiedAt: POSTAL_AS_OF,
    publishedAt: "2026-11-05T12:00:00+01:00",
    editions: Object.fromEntries(
      (["ca", "es", "en"] as Locale[]).map((locale) => {
        const t = COPY[locale];
        const p = t.phases[phase];
        return [
          locale,
          {
            path: t.path,
            title: t.title,
            seoTitle: p.seoTitle,
            seoDescription: p.seoDescription,
            excerpt: t.excerpt,
            blocks: body(locale, phase),
          },
        ];
      }),
    ) as B2Article["editions"],
  };
}

export const POSTAL_VOTE = buildPostalVote();

/** Paths for the registry test (shared.ts B2_PATHS.postalVote must match). */
export const POSTAL_VOTE_PATHS: Record<Locale, string> = {
  ca: COPY.ca.path,
  es: COPY.es.path,
  en: COPY.en.path,
};
