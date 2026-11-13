import type { Block } from "@/lib/content/blocks";
import { LOCALES, type Locale } from "@/lib/i18n/config";

import { B2_PATHS, b2Related, b2link, callout, faq, h2, h3, keyFacts, lead, paras, steps, table, verifiedLine, type B2Article, type B2Source } from "./shared";

/**
 * Empadronar-se: how to register on the padró in Barcelona and Catalonia
 * (13 Nov 2026). The first evergreen procedure guide.
 *
 * Why this page: "empadronamiento" + "padron" ≈ 8,000 searches a week in
 * Catalonia, flat all year (Google Trends, 5 years to Nov 2026, converted with
 * the "festivos" anchor of research_notes/x10/demand-calendar-2027.md); the
 * site had no page and ~0 impressions for it. The results page is expat blogs
 * and gestorías that contradict each other (90 days or 6 months, which
 * contract is accepted); none quotes the law or the council.
 * research_notes/evergreen-demand-nov2026.md has the evidence.
 *
 * PADRO_AS_OF 2026-11-13. Every fact was read that day on the page given
 * (curl with a browser User-Agent, grep of the quoted words), nothing else is
 * printed:
 *
 *  - Ley 7/1985 (BOE-A-1985-5392), art. 15: «Toda persona que viva en España
 *    está obligada a inscribirse en el Padrón del municipio en el que resida
 *    habitualmente»; whoever lives in several towns registers in the one where
 *    they live «durante más tiempo al año». Art. 16.1: renewal «cada dos años»
 *    for non-EU foreign nationals «sin autorización de residencia de larga
 *    duración». Art. 16.2.f: a foreign national may register with the NIE or,
 *    failing that, the passport «en vigor».
 *  - Resolution of 29 Apr 2020 (BOE-A-2020-4784, technical instructions to
 *    councils, consolidated to 8 Feb 2023): the council may ask for the title
 *    to the home only «para acreditar que, efectivamente, el vecino habita en
 *    el domicilio», with no competence over «cuestiones de propiedad, de
 *    arrendamientos urbanos»; it may accept «otros documentos» (light, water
 *    bills) or check by «informe de Policía local, inspección»; in a home where
 *    others are registered, «la autorización por escrito de una persona mayor
 *    de edad que figure empadronada»; infraviviendas «e incluso ausencia total
 *    de techo» are valid addresses; «Al Ayuntamiento no le corresponde realizar
 *    ningún control sobre la legalidad o ilegalidad de la residencia»; three
 *    months to resolve, then «silencio positivo»; certificate = «documento que
 *    acredita fehacientemente», volante = «puramente informativo»; minors need
 *    both parents' consent.
 *  - Ajuntament de Barcelona, procedure sheet "Alta al Padró municipal
 *    d'habitants" (T135, ca and es): online with electronic signature, email
 *    confirmation «al cap de 7 dies naturals aproximadament»; 18 or over;
 *    documents in Catalan or Spanish or translated; authorisation valid 3
 *    months; owner documents no older than 1 year, none if you pay the IBI;
 *    rental contract in your name lasting «més de 3 mesos»; extended,
 *    indefinite, scanned or e-signed contracts also need the last rent receipt
 *    or a light, water or gas bill of the last 3 months («No s'accepten rebuts
 *    de contractes de telefonia mòbil o accés a internet»); collective homes:
 *    the entity's stamped authorisation; IDs by nationality; «El termini màxim
 *    per rebre una resposta és de 3 mesos»; «Aquest tràmit és gratuït».
 *  - Info Barcelona, "Has d'empadronar-te a Barcelona?" (22 Jul 2024, ca and
 *    es): «No cal tenir un títol de propietat o un contracte de lloguer»; a
 *    room, premises, warehouse or plot is a valid address; without documents
 *    «es fa una trucada i una visita de comprovació»; no fixed address → the
 *    ICR from Social Services, an OAC or the OPSE; «no cal tenir residència
 *    regular al país»; renewal every two years for non-EU without long-term
 *    residence, confirmation every five for EU citizens and long-term
 *    residents (every two if not in the Registre Central d'Estrangers);
 *    expired ID accepted with the renewal application.
 *  - Ajuntament de Barcelona, Nova Ciutadania "Empadronament" (ca, es):
 *    public healthcare, schooling of minors and «la majoria dels tràmits
 *    relacionats amb la Llei d'estrangeria»; information at 010, any OAC or
 *    the Oficina Virtual; UK withdrawal-agreement residence document valid.
 *  - CatSalut, "Obtenció de la primera TSI": «requisit bàsic d'estar
 *    empadronades en un municipi de Catalunya»; certificate «amb la data
 *    d'emissió inferior a tres mesos» unless the council offers online lookup.
 *  - INE, foreign residents' electoral roll for 23 May 2027: «las
 *    inscripciones en los padrones municipales y las declaraciones formales
 *    deberán realizarse no más tarde del día 30 de diciembre de 2026».
 *  - Other councils (each read on its own site): Girona (seu-e.cat: live in
 *    Girona «la major part de l'any»; online with idCAT Mòbil, certificate or
 *    Cl@ve; free; cita prèvia recommended; «baixa automàtica» elsewhere);
 *    Lleida (tramits.paeria.cat: free, online or «Presencialment, amb cita»
 *    at the OMAC, three months); Tarragona (seu.tarragona.cat: free,
 *    «La inscripció es realitza a l'instant a les oficines del OMAC»);
 *    L'Hospitalet (seuelectronica.l-h.cat: OAC appointments for «Padró: altes
 *    i canvis de domicili»).
 *
 * Not printed: Barcelona's volant/certificate procedure details (its Oficina
 * Virtual pages render in JavaScript and could not be read by curl), opening
 * hours of offices, appointment lead times, any fee for certificates in other
 * towns (they differ and change), and anything from the press or gestorías.
 *
 * Re-read by PADRO_REREAD_BY (a test fails after it): the Barcelona sheet is
 * the one most likely to change.
 */
export const PADRO_AS_OF = "2026-11-13";
export const PADRO_REREAD_BY = "2027-02-13";
/** The INE's last day for EU citizens to be on the padró and vote on 23 May 2027 (foreign-vote.ts has the same date). */
export const EU_VOTE_PADRO_DEADLINE = "2026-12-30";

export const PADRO_URLS = {
  lbrl: "https://www.boe.es/buscar/act.php?id=BOE-A-1985-5392",
  instructions: "https://www.boe.es/buscar/act.php?id=BOE-A-2020-4784",
  bcnSheetCa: "https://seuelectronica.ajuntament.barcelona.cat/APPS/portaltramits/ca/ciudadano/descripcio/T135i/default.html",
  bcnSheetEs: "https://seuelectronica.ajuntament.barcelona.cat/APPS/portaltramits/es/ciudadano/descripcio/T135i/default.html",
  bcnNewsCa: "https://www.barcelona.cat/infobarcelona/ca/has-dempadronar-te-a-barcelona-texpliquem-com-fer-ho_1421197.html",
  bcnNewsEs: "https://www.barcelona.cat/infobarcelona/es/tienes-que-empadronarte-en-barcelona-te-explicamos-como-hacerlo_1421271.html",
  bcnNovaCa: "https://ajuntament.barcelona.cat/novaciutadania/ca/empadronament",
  bcnNovaEs: "https://ajuntament.barcelona.cat/novaciutadania/es/empadronamiento",
  tsi: "https://catsalut.gencat.cat/ca/coneix-catsalut/acces-sistema-salut/la-tsi/obtencio-tsi/",
  ine: "https://www.ine.es/dyngs/CEL/index.htm?cid=383",
  girona: "https://seu-e.cat/ca/web/girona/tramits-i-gestions/-/tramits/tramit/20867494",
  lleida: "https://tramits.paeria.cat/Ciutadania/DetallTramit.aspx?IdTramit=2089",
  tarragona: "https://seu.tarragona.cat/sta/CarpetaPublic/doEvent?APP_CODE=STA&PAGE_CODE=CATALOGO&DETALLE=6269000003494351199500",
  hospitalet: "https://seuelectronica.l-h.cat/tramits/detallTramit.aspx?1ngWPs28HsEgTIvTMGQACY5a7DvLnSB0XtpVHw9udkagqazB",
} as const;

const SOURCES: B2Source[] = [
  { name: "Ley 7/1985, de 2 de abril, Reguladora de las Bases del Régimen Local (arts. 15 y 16)", url: PADRO_URLS.lbrl, publisher: "BOE" },
  { name: "Resolución de 29 de abril de 2020: instrucciones técnicas a los Ayuntamientos sobre la gestión del Padrón municipal", url: PADRO_URLS.instructions, publisher: "BOE" },
  { name: "Alta al Padró municipal d'habitants (fitxa del tràmit)", url: PADRO_URLS.bcnSheetCa, publisher: "Ajuntament de Barcelona" },
  { name: "Has d'empadronar-te a Barcelona? T'expliquem com fer-ho", url: PADRO_URLS.bcnNewsCa, publisher: "Ajuntament de Barcelona" },
  { name: "Empadronament (Nova Ciutadania)", url: PADRO_URLS.bcnNovaCa, publisher: "Ajuntament de Barcelona" },
  { name: "Obtenció de la primera Targeta Sanitària Individual (TSI)", url: PADRO_URLS.tsi, publisher: "CatSalut" },
  { name: "Formación del censo electoral de extranjeros residentes en España para las elecciones municipales 2027", url: PADRO_URLS.ine, publisher: "INE" },
  { name: "Alta al Padró municipal d'habitants", url: PADRO_URLS.girona, publisher: "Ajuntament de Girona" },
  { name: "Alta al Padró Municipal d'Habitants", url: PADRO_URLS.lleida, publisher: "Ajuntament de Lleida" },
  { name: "Alta al padró d'habitants", url: PADRO_URLS.tarragona, publisher: "Ajuntament de Tarragona" },
  { name: "Cita prèvia a les Oficines d'Atenció Ciutadana", url: PADRO_URLS.hospitalet, publisher: "Ajuntament de L'Hospitalet" },
];

/** A Markdown link; parentheses in the URL (council PDFs named "…(1).pdf") are percent-encoded so they cannot close it. */
const a = (href: string, label: string) => `[${label}](${href.replace(/\(/g, "%28").replace(/\)/g, "%29")})`;

/** The Barcelona pages in the reader's language where the council publishes one; Catalan otherwise. */
function bcn(locale: Locale) {
  const es = locale === "es";
  return {
    sheet: es ? PADRO_URLS.bcnSheetEs : PADRO_URLS.bcnSheetCa,
    news: es ? PADRO_URLS.bcnNewsEs : PADRO_URLS.bcnNewsCa,
    nova: es ? PADRO_URLS.bcnNovaEs : PADRO_URLS.bcnNovaCa,
  };
}

export const PADRO_META: Record<Locale, { title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    title: "Com empadronar-se a Barcelona i Catalunya: documents, cita i què fer si no tens contracte",
    seoTitle: "Empadronar-se a Barcelona: documents, cita i sense contracte",
    seoDescription: "És gratuït, es fa a l'ajuntament on vius i no cal contracte de lloguer ni residència legal. Documents per a cada cas, terminis i renovació, amb la llei.",
    excerpt: "L'empadronament pas a pas: on es fa, quins documents demana Barcelona per a cada situació, què passa si no tens contracte, volant o certificat, i quan s'ha de renovar.",
  },
  es: {
    title: "Cómo empadronarse en Barcelona y Cataluña: documentos, cita y qué hacer si no tienes contrato",
    seoTitle: "Empadronarse en Barcelona: documentos, cita y sin contrato",
    seoDescription: "Es gratis, se hace en el ayuntamiento donde vives y no hace falta contrato de alquiler ni residencia legal. Documentos para cada caso, plazos y renovación.",
    excerpt: "El empadronamiento paso a paso: dónde se hace, qué documentos pide Barcelona en cada situación, qué pasa si no tienes contrato, volante o certificado y cuándo renovarlo.",
  },
  en: {
    title: "How to register on the padrón in Barcelona and Catalonia (empadronamiento)",
    seoTitle: "Padrón in Barcelona: how to register (empadronamiento)",
    seoDescription: "Free, done at the town hall where you live, and possible without a rental contract or legal residence. Documents for each case, timings and renewal.",
    excerpt: "Registering on the padrón step by step: where to do it, the documents Barcelona asks for in each situation, what happens without a contract, volante or certificate, and renewal.",
  },
};

/** One body for the three editions: the same sections, tables and links in each. */
export function buildPadroBody(locale: Locale): Block[] {
  const L = locale;
  const B = bcn(L);
  const vote = b2link("foreignVote", L, { ca: "guia del vot dels estrangers", es: "guía del voto de los extranjeros", en: "foreign residents' vote guide" }[L]);
  const tsi = b2link("tsi", L, { ca: "com demanar la targeta sanitària", es: "cómo pedir la tarjeta sanitaria", en: "how to get the health card" }[L]);

  const t = {
    ca: {
      lead: `**T'empadrones a l'ajuntament del municipi on vius, és gratuït i no cal contracte de lloguer ni tenir la residència en regla.** Necessites un document d'identitat (DNI, NIE, targeta de residència o passaport) i alguna prova que hi vius: el contracte, l'escriptura o l'autorització de qui té el pis. Si no en tens, l'ajuntament ho comprova amb una trucada i una visita. A Barcelona es pot fer per internet amb signatura digital (la confirmació arriba per correu en uns 7 dies) o a una Oficina d'Atenció Ciutadana (OAC). L'ajuntament té com a màxim tres mesos per respondre.`,
      factsTitle: "L'empadronament en sis respostes",
      facts: [
        { label: "Qui", value: "Tothom qui viu a Espanya, al municipi on viu més temps durant l'any (Llei 7/1985, art. 15)" },
        { label: "Preu", value: "Gratuït (Barcelona, Girona, Lleida, Tarragona)" },
        { label: "On", value: "L'ajuntament del teu municipi: per internet o a l'oficina d'atenció ciutadana" },
        { label: "Contracte de lloguer", value: "No és obligatori: també val l'autorització del titular o una visita de comprovació" },
        { label: "Residència legal", value: "No cal: l'ajuntament no controla la situació administrativa" },
        { label: "Termini de resposta", value: "Màxim 3 mesos; si no responen, quedes empadronat (silenci positiu)" },
      ],
      whyH: "Per a què serveix i per què convé fer-ho de seguida",
      why: [
        `El padró és el registre de veïns del municipi i prova on vius. És una obligació legal i, a la pràctica, la clau d'altres tràmits. Segons l'Ajuntament de Barcelona, dona accés a l'assistència sanitària pública i a l'escolarització dels menors, i el demanen la majoria dels tràmits d'estrangeria (reagrupament familiar, arrelament).`,
        `**Targeta sanitària (TSI).** El CatSalut posa com a requisit bàsic estar empadronat en un municipi de Catalunya, i demana un certificat d'empadronament de menys de tres mesos si el teu ajuntament no ofereix la consulta en línia (${a(PADRO_URLS.tsi, "CatSalut")}). Qui hi té dret i com es demana, pas a pas: ${tsi}.`,
        `**Votar a les municipals del 23 de maig de 2027.** Si ets ciutadà d'un altre país de la UE, l'INE només compta els empadronaments fets fins al **30 de desembre de 2026**. Tot el procés, a la ${vote}.`,
      ],
      bcnH: "A Barcelona, pas a pas",
      stepsTitle: "Com es fa l'alta al padró a Barcelona",
      steps: [
        { title: "Tria el canal", text: `Per internet, identificant-te al portal i signant electrònicament la sol·licitud, des de la fitxa del tràmit de l'${a(B.sheet, "Ajuntament de Barcelona")} (poden fer-ho les persones de 18 anys o més); o presencialment a una Oficina d'Atenció Ciutadana (OAC). Quins documents et calen t'ho diuen al 010, a les OAC i a l'Oficina Virtual.` },
        { title: "Prepara la identitat", text: "El document d'identitat en vigor de cada persona que s'empadrona (taula de sota). Si està caducat, porta també la sol·licitud de renovació." },
        { title: "Prepara la prova del domicili", text: "Depèn de la teva situació: propietari, llogater, persona autoritzada pel titular o residència col·lectiva (segona taula). Els documents han d'estar en català o castellà, o traduïts per un traductor jurat, el consolat o una administració." },
        { title: "Espera la confirmació", text: "Si ho fas per internet i els documents són correctes, l'Ajuntament t'envia un correu de confirmació al cap d'uns 7 dies naturals. Si en falta algun, te'l demana. El termini màxim per respondre és de 3 mesos." },
      ],
      idCaption: "Quin document d'identitat val per empadronar-se a Barcelona",
      idHead: ["Nacionalitat", "Document (en vigor)"],
      idRows: [
        ["Espanyola", "DNI o passaport"],
        ["Unió Europea, Suïssa, Noruega, Islàndia o Liechtenstein", "Passaport, targeta de residència o document d'identitat del país; si tens el certificat de NIE, porta'l també"],
        ["Regne Unit", "Com la resta de països, o el document de residència de l'acord de retirada"],
        ["Altres països", "Passaport o targeta de residència"],
        ["Menors de 14 anys espanyols", "Llibre de família o certificat de naixement (i DNI o passaport, si en tenen)"],
      ],
      idNote: "Font: fitxa del tràmit i pàgina d'empadronament de l'Ajuntament de Barcelona, consultades el 13 de novembre de 2026.",
      homeCaption: "Quina prova del domicili demana Barcelona, segons la teva situació",
      homeHead: ["La teva situació", "Què has de portar"],
      homeRows: [
        ["Ets el propietari i pagues l'IBI", "Res: l'Ajuntament ho comprova. Si no pot, escriptura, nota simple del Registre o contracte de compravenda (d'1 any d'antiguitat com a màxim)"],
        ["Lloges el pis a nom teu", "Contracte vigent a nom teu, de més de 3 mesos o amb pròrroga explícita, on surti el propietari o l'administrador"],
        ["El contracte està prorrogat, és indefinit, escanejat o signat electrònicament", "A més, l'últim rebut del lloguer o l'última factura de llum, aigua o gas pagada a nom teu (dels últims 3 mesos). No valen les de mòbil ni internet"],
        ["Vius en un pis o habitació que és d'una altra persona", "Autorització per inscriure't al domicili, el document d'identitat del titular i el seu contracte o escriptura. L'autorització val 3 mesos"],
        ["Residència d'estudiants o de gent gran", "Autorització d'empadronament en domicili col·lectiu, signada i segellada per l'entitat (nom, adreça i NIF)"],
        ["No tens cap document", "Pots demanar-lo igualment: l'Ajuntament et truca i fa una visita de comprovació"],
        ["Vius al carrer, en un allotjament d'urgència o amb risc de perdre l'habitatge", "Empadronament sense domicili fix, amb l'informe de coneixement de residència (ICR) de Serveis Socials, d'una OAC o de l'Oficina de Prestacions Socials i Econòmiques"],
      ],
      homeNote: `Fonts: ${a(B.sheet, "fitxa del tràmit")} i ${a(B.news, "guia de l'Ajuntament")} (Barcelona), consultades el 13 de novembre de 2026.`,
      noContractH: "Sense contracte de lloguer també et pots empadronar",
      noContract: [
        "És la pregunta que més es repeteix, i la llei la respon. Les instruccions estatals als ajuntaments (BOE, 2020) diuen que el padró ha de reflectir on viu realment cada persona i que l'ajuntament no té cap competència per jutjar qüestions de propietat o de lloguer: el títol de l'habitatge només serveix per provar que hi vius. Pot acceptar altres documents, com factures de subministraments, o comprovar-ho amb la policia local o una inspecció.",
        `L'Ajuntament de Barcelona ho diu igual de clar: «No cal tenir un títol de propietat o un contracte de lloguer per empadronar-se». Segons les instruccions estatals, si vius en un pis on ja hi ha gent empadronada, en lloc del contracte n'hi ha prou amb l'autorització per escrit d'un adult empadronat que tingui títol del pis. I fins i tot una infrahabitatge o no tenir sostre són situacions que s'han de poder registrar, amb la modalitat sense domicili fix.`,
        "Tampoc no cal tenir la residència en regla: les instruccions estatals diuen que a l'ajuntament no li correspon controlar la legalitat de la residència dels seus veïns, i Barcelona ho repeteix a la seva guia.",
      ],
      kidsH: "Empadronar menors",
      kids: [
        "Un menor ha d'estar empadronat amb qui en té la guarda, i el canvi de domicili el decideixen els dos progenitors. Si t'empadrones amb els teus fills i l'altre progenitor no hi és, Barcelona demana una declaració conjunta signada pels dos o, si no, la resolució judicial de guarda i custòdia o una declaració responsable (els models són a la fitxa del tràmit).",
      ],
      docH: "Volant o certificat: quin has de demanar",
      doc: [
        "Un cop empadronat pots demanar dos papers. El **volant** és informatiu, sense signatura de cap funcionari, i serveix per a la majoria de gestions. El **certificat** és un document públic que acredita l'empadronament amb plena validesa, i és el que demanen alguns organismes, com el CatSalut per a la primera targeta sanitària. Quant de temps val cada un ho decideix l'organisme que te'l demana; el CatSalut, per exemple, el vol de menys de tres mesos.",
      ],
      renewH: "Renovació, canvis de domicili i baixes",
      renewCaption: "Cada quant s'ha de renovar o confirmar l'empadronament",
      renewHead: ["Qui", "Què has de fer"],
      renewRows: [
        ["Persones espanyoles", "Res: la inscripció no caduca"],
        ["Estrangers de fora de la UE sense residència de llarga durada", "Renovar-la cada 2 anys (Llei 7/1985, art. 16.1); si no, l'ajuntament la pot donar de baixa per caducitat"],
        ["Ciutadans de la UE i residents de llarga durada", "Confirmar-la cada 5 anys, o cada 2 si no consten al Registre Central d'Estrangers (Barcelona)"],
      ],
      renew: [
        "Si et canvies de pis dins del mateix municipi, és un canvi de domicili, no una alta nova. Si te'n vas a un altre municipi, t'empadrones al nou: l'alta allà dona de baixa l'antic (l'Ajuntament de Girona ho diu així a la seva fitxa).",
      ],
      citiesH: "A Girona, Lleida, Tarragona i L'Hospitalet",
      citiesCaption: "Com es fa l'alta al padró en altres ciutats grans",
      citiesHead: ["Ciutat", "Com es fa", "Fitxa oficial"],
      citiesRows: [
        ["L'Hospitalet de Llobregat", "A les Oficines d'Atenció Ciutadana, amb cita prèvia per a «Padró: altes i canvis de domicili»", a(PADRO_URLS.hospitalet, "Cita prèvia OAC")],
        ["Girona", "Per internet (idCAT Mòbil, certificat digital o Cl@ve) o presencialment; es recomana cita prèvia. Gratuït. Cal viure a Girona la major part de l'any", a(PADRO_URLS.girona, "Alta al padró")],
        ["Lleida", "Per internet o presencialment amb cita a l'Oficina Municipal d'Atenció Ciutadana (OMAC). Gratuït", a(PADRO_URLS.lleida, "Alta al padró")],
        ["Tarragona", "Presencialment a les oficines municipals d'atenció ciutadana (OMAC), on la inscripció es fa a l'instant. Gratuït", a(PADRO_URLS.tarragona, "Alta al padró")],
      ],
      cities: ["A la resta de municipis la llei és la mateixa: l'ajuntament on vius t'ha d'empadronar i té tres mesos per respondre. El que canvia és el canal (internet, cita, oficina) i alguns models d'autorització, que trobaràs a la seu electrònica del teu ajuntament."],
      warnTitle: "És un tràmit municipal i gratuït",
      warn: "L'alta al padró es fa directament a l'ajuntament i no costa res als municipis d'aquesta guia. Si algú et cobra per «empadronar-te», el que et cobra és la gestió, no el tràmit.",
      faqH: "Preguntes freqüents",
      faq: [
        { question: "Em puc empadronar sense contracte de lloguer?", answer: "Sí. Pots aportar l'autorització de qui té el pis (amb el seu document i el seu títol) i, si no tens cap document, a Barcelona l'Ajuntament fa una trucada i una visita de comprovació. La llei no permet a l'ajuntament jutjar si el lloguer és legal: només comprova que hi vius." },
        { question: "Em puc empadronar si no tinc papers o estic en situació irregular?", answer: "Sí. Les instruccions estatals diuen que l'ajuntament no ha de controlar la legalitat de la residència, i l'Ajuntament de Barcelona escriu que no cal tenir residència regular. Pots fer-ho amb el passaport en vigor." },
        { question: "Em puc empadronar en una habitació llogada?", answer: "Sí. Barcelona empadrona a l'adreça on vius, sigui un pis, una casa o una habitació llogada. Si el contracte del pis és d'una altra persona, necessites la seva autorització i el seu document d'identitat." },
        { question: "Quant es triga a estar empadronat?", answer: "A Barcelona, per internet, l'Ajuntament envia la confirmació al cap d'uns 7 dies si els documents són correctes; a Tarragona, a l'oficina, la inscripció es fa a l'instant. El màxim legal és de tres mesos i, si l'ajuntament no respon, quedes empadronat des del dia de la sol·licitud." },
        { question: "Quant costa empadronar-se?", answer: "Res. L'alta és gratuïta a Barcelona, Girona, Lleida i Tarragona." },
        { question: "Hi ha un termini per empadronar-se després d'arribar?", answer: "La llei no fixa un nombre de dies: obliga a inscriure's al municipi on resideixes habitualment. Convé fer-ho de seguida, perquè la targeta sanitària i molts altres tràmits ho demanen." },
        { question: "Puc empadronar-me amb el passaport?", answer: "Sí. Per a les persones estrangeres, el passaport en vigor és vàlid; els ciutadans de la UE també poden usar el document d'identitat del seu país, i si tenen el certificat de NIE l'han de portar." },
        { question: "Cada quant s'ha de renovar el padró?", answer: "Les persones espanyoles, mai. Els estrangers de fora de la UE sense residència de llarga durada, cada dos anys. Els ciutadans de la UE i els residents de llarga durada confirmen la inscripció cada cinc anys (cada dos si no consten al Registre Central d'Estrangers)." },
        { question: "Quina diferència hi ha entre volant i certificat d'empadronament?", answer: "El volant és informatiu i serveix per a la majoria de gestions; el certificat és un document públic amb plena validesa. El CatSalut, per a la primera TSI, demana un certificat de menys de tres mesos." },
      ],
    },
    es: {
      lead: `**Te empadronas en el ayuntamiento del municipio donde vives, es gratis y no hace falta contrato de alquiler ni tener la residencia en regla.** Necesitas un documento de identidad (DNI, NIE, tarjeta de residencia o pasaporte) y alguna prueba de que vives allí: el contrato, la escritura o la autorización de quien tiene el piso. Si no la tienes, el ayuntamiento lo comprueba con una llamada y una visita. En Barcelona se puede hacer por internet con firma digital (la confirmación llega por correo en unos 7 días) o en una Oficina de Atención Ciudadana (OAC). El ayuntamiento tiene como máximo tres meses para responder.`,
      factsTitle: "El empadronamiento en seis respuestas",
      facts: [
        { label: "Quién", value: "Toda persona que vive en España, en el municipio donde pasa más tiempo al año (Ley 7/1985, art. 15)" },
        { label: "Precio", value: "Gratis (Barcelona, Girona, Lleida, Tarragona)" },
        { label: "Dónde", value: "El ayuntamiento de tu municipio: por internet o en la oficina de atención ciudadana" },
        { label: "Contrato de alquiler", value: "No es obligatorio: también vale la autorización del titular o una visita de comprobación" },
        { label: "Residencia legal", value: "No hace falta: el ayuntamiento no controla la situación administrativa" },
        { label: "Plazo de respuesta", value: "Máximo 3 meses; si no responden, quedas empadronado (silencio positivo)" },
      ],
      whyH: "Para qué sirve y por qué conviene hacerlo enseguida",
      why: [
        `El padrón es el registro de vecinos del municipio y prueba dónde vives. Es una obligación legal y, en la práctica, la llave de otros trámites. Según el Ayuntamiento de Barcelona, da acceso a la asistencia sanitaria pública y a la escolarización de los menores, y lo piden la mayoría de trámites de extranjería (reagrupación familiar, arraigo).`,
        `**Tarjeta sanitaria (TSI).** El CatSalut pone como requisito básico estar empadronado en un municipio de Cataluña, y pide un certificado de empadronamiento de menos de tres meses si tu ayuntamiento no ofrece la consulta en línea (${a(PADRO_URLS.tsi, "CatSalut, en catalán")}). Quién tiene derecho y cómo se pide, paso a paso: ${tsi}.`,
        `**Votar en las municipales del 23 de mayo de 2027.** Si eres ciudadano de otro país de la UE, el INE solo cuenta los empadronamientos hechos hasta el **30 de diciembre de 2026**. Todo el proceso, en la ${vote}.`,
      ],
      bcnH: "En Barcelona, paso a paso",
      stepsTitle: "Cómo se hace el alta en el padrón en Barcelona",
      steps: [
        { title: "Elige el canal", text: `Por internet, identificándote en el portal y firmando electrónicamente la solicitud, desde la ficha del trámite del ${a(B.sheet, "Ayuntamiento de Barcelona")} (pueden hacerlo las personas de 18 años o más); o en persona en una Oficina de Atención Ciudadana (OAC). Qué documentos necesitas te lo dicen en el 010, en las OAC y en la Oficina Virtual.` },
        { title: "Prepara la identidad", text: "El documento de identidad en vigor de cada persona que se empadrona (tabla de abajo). Si está caducado, lleva también la solicitud de renovación." },
        { title: "Prepara la prueba del domicilio", text: "Depende de tu situación: propietario, inquilino, persona autorizada por el titular o residencia colectiva (segunda tabla). Los documentos deben estar en catalán o castellano, o traducidos por un traductor jurado, el consulado o una administración." },
        { title: "Espera la confirmación", text: "Si lo haces por internet y los documentos son correctos, el Ayuntamiento te envía un correo de confirmación al cabo de unos 7 días naturales. Si falta alguno, te lo pide. El plazo máximo para responder es de 3 meses." },
      ],
      idCaption: "Qué documento de identidad vale para empadronarse en Barcelona",
      idHead: ["Nacionalidad", "Documento (en vigor)"],
      idRows: [
        ["Española", "DNI o pasaporte"],
        ["Unión Europea, Suiza, Noruega, Islandia o Liechtenstein", "Pasaporte, tarjeta de residencia o documento de identidad del país; si tienes el certificado de NIE, llévalo también"],
        ["Reino Unido", "Como el resto de países, o el documento de residencia del acuerdo de retirada"],
        ["Otros países", "Pasaporte o tarjeta de residencia"],
        ["Menores de 14 años españoles", "Libro de familia o certificado de nacimiento (y DNI o pasaporte, si lo tienen)"],
      ],
      idNote: "Fuente: ficha del trámite y página de empadronamiento del Ayuntamiento de Barcelona, consultadas el 13 de noviembre de 2026.",
      homeCaption: "Qué prueba del domicilio pide Barcelona, según tu situación",
      homeHead: ["Tu situación", "Qué tienes que llevar"],
      homeRows: [
        ["Eres el propietario y pagas el IBI", "Nada: el Ayuntamiento lo comprueba. Si no puede, escritura, nota simple del Registro o contrato de compraventa (de 1 año de antigüedad como máximo)"],
        ["Alquilas el piso a tu nombre", "Contrato vigente a tu nombre, de más de 3 meses o con prórroga explícita, en el que aparezca el propietario o el administrador"],
        ["El contrato está prorrogado, es indefinido, escaneado o firmado electrónicamente", "Además, el último recibo del alquiler o la última factura de luz, agua o gas pagada a tu nombre (de los últimos 3 meses). No valen las de móvil ni internet"],
        ["Vives en un piso o habitación que es de otra persona", "Autorización para inscribirte en el domicilio, el documento de identidad del titular y su contrato o escritura. La autorización vale 3 meses"],
        ["Residencia de estudiantes o de mayores", "Autorización de empadronamiento en domicilio colectivo, firmada y sellada por la entidad (nombre, dirección y NIF)"],
        ["No tienes ningún documento", "Puedes pedirlo igualmente: el Ayuntamiento te llama y hace una visita de comprobación"],
        ["Vives en la calle, en un alojamiento de urgencia o con riesgo de perder la vivienda", "Empadronamiento sin domicilio fijo, con el informe de conocimiento de residencia (ICR) de Servicios Sociales, de una OAC o de la Oficina de Prestaciones Sociales y Económicas"],
      ],
      homeNote: `Fuentes: ${a(B.sheet, "ficha del trámite")} y ${a(B.news, "guía del Ayuntamiento")} (Barcelona), consultadas el 13 de noviembre de 2026.`,
      noContractH: "Sin contrato de alquiler también puedes empadronarte",
      noContract: [
        "Es la pregunta que más se repite, y la ley la responde. Las instrucciones estatales a los ayuntamientos (BOE, 2020) dicen que el padrón debe reflejar dónde vive realmente cada persona y que el ayuntamiento no tiene ninguna competencia para juzgar cuestiones de propiedad o de alquiler: el título de la vivienda solo sirve para probar que vives allí. Puede aceptar otros documentos, como facturas de suministros, o comprobarlo con la policía local o una inspección.",
        "El Ayuntamiento de Barcelona lo dice igual de claro: «No es necesario contar con un título de propiedad o un contrato de alquiler para empadronarse». Según las instrucciones estatales, si vives en un piso donde ya hay gente empadronada, en lugar del contrato basta con la autorización por escrito de un adulto empadronado que tenga título del piso. E incluso una infravivienda o no tener techo son situaciones que deben poder registrarse, con la modalidad sin domicilio fijo.",
        "Tampoco hace falta tener la residencia en regla: las instrucciones estatales dicen que al ayuntamiento no le corresponde controlar la legalidad de la residencia de sus vecinos, y Barcelona lo repite en su guía.",
      ],
      kidsH: "Empadronar a menores",
      kids: [
        "Un menor debe estar empadronado con quien tiene su guarda, y el cambio de domicilio lo deciden los dos progenitores. Si te empadronas con tus hijos y el otro progenitor no está, Barcelona pide una declaración conjunta firmada por los dos o, si no, la resolución judicial de guarda y custodia o una declaración responsable (los modelos están en la ficha del trámite).",
      ],
      docH: "Volante o certificado: cuál tienes que pedir",
      doc: [
        "Una vez empadronado puedes pedir dos papeles. El **volante** es informativo, sin firma de ningún funcionario, y sirve para la mayoría de gestiones. El **certificado** es un documento público que acredita el empadronamiento con plena validez, y es el que piden algunos organismos, como el CatSalut para la primera tarjeta sanitaria. Cuánto tiempo vale cada uno lo decide el organismo que te lo pide; el CatSalut, por ejemplo, lo quiere de menos de tres meses.",
      ],
      renewH: "Renovación, cambios de domicilio y bajas",
      renewCaption: "Cada cuánto hay que renovar o confirmar el empadronamiento",
      renewHead: ["Quién", "Qué tienes que hacer"],
      renewRows: [
        ["Personas españolas", "Nada: la inscripción no caduca"],
        ["Extranjeros de fuera de la UE sin residencia de larga duración", "Renovarla cada 2 años (Ley 7/1985, art. 16.1); si no, el ayuntamiento puede darla de baja por caducidad"],
        ["Ciudadanos de la UE y residentes de larga duración", "Confirmarla cada 5 años, o cada 2 si no constan en el Registro Central de Extranjeros (Barcelona)"],
      ],
      renew: [
        "Si te cambias de piso dentro del mismo municipio, es un cambio de domicilio, no un alta nueva. Si te vas a otro municipio, te empadronas en el nuevo: el alta allí da de baja la anterior (el Ayuntamiento de Girona lo dice así en su ficha).",
      ],
      citiesH: "En Girona, Lleida, Tarragona y L'Hospitalet",
      citiesCaption: "Cómo se hace el alta en el padrón en otras ciudades grandes",
      citiesHead: ["Ciudad", "Cómo se hace", "Ficha oficial"],
      citiesRows: [
        ["L'Hospitalet de Llobregat", "En las Oficinas de Atención Ciudadana, con cita previa para «Padró: altes i canvis de domicili»", a(PADRO_URLS.hospitalet, "Cita previa OAC")],
        ["Girona", "Por internet (idCAT Mòbil, certificado digital o Cl@ve) o en persona; se recomienda cita previa. Gratis. Hay que vivir en Girona la mayor parte del año", a(PADRO_URLS.girona, "Alta en el padrón")],
        ["Lleida", "Por internet o en persona con cita en la Oficina Municipal de Atención Ciudadana (OMAC). Gratis", a(PADRO_URLS.lleida, "Alta en el padrón")],
        ["Tarragona", "En persona en las oficinas municipales de atención ciudadana (OMAC), donde la inscripción se hace al instante. Gratis", a(PADRO_URLS.tarragona, "Alta en el padrón")],
      ],
      cities: ["En el resto de municipios la ley es la misma: el ayuntamiento donde vives tiene que empadronarte y tiene tres meses para responder. Lo que cambia es el canal (internet, cita, oficina) y algunos modelos de autorización, que encontrarás en la sede electrónica de tu ayuntamiento."],
      warnTitle: "Es un trámite municipal y gratuito",
      warn: "El alta en el padrón se hace directamente en el ayuntamiento y no cuesta nada en los municipios de esta guía. Si alguien te cobra por «empadronarte», lo que te cobra es la gestión, no el trámite.",
      faqH: "Preguntas frecuentes",
      faq: [
        { question: "¿Me puedo empadronar sin contrato de alquiler?", answer: "Sí. Puedes aportar la autorización de quien tiene el piso (con su documento y su título) y, si no tienes ningún documento, en Barcelona el Ayuntamiento hace una llamada y una visita de comprobación. La ley no permite al ayuntamiento juzgar si el alquiler es legal: solo comprueba que vives allí." },
        { question: "¿Me puedo empadronar sin papeles o en situación irregular?", answer: "Sí. Las instrucciones estatales dicen que el ayuntamiento no debe controlar la legalidad de la residencia, y el Ayuntamiento de Barcelona escribe que no es necesario disponer de residencia regular. Puedes hacerlo con el pasaporte en vigor." },
        { question: "¿Me puedo empadronar en una habitación alquilada?", answer: "Sí. Barcelona empadrona en la dirección donde vives, sea un piso, una casa o una habitación alquilada. Si el contrato del piso es de otra persona, necesitas su autorización y su documento de identidad." },
        { question: "¿Cuánto se tarda en estar empadronado?", answer: "En Barcelona, por internet, el Ayuntamiento envía la confirmación al cabo de unos 7 días si los documentos son correctos; en Tarragona, en la oficina, la inscripción se hace al instante. El máximo legal es de tres meses y, si el ayuntamiento no responde, quedas empadronado desde el día de la solicitud." },
        { question: "¿Cuánto cuesta empadronarse?", answer: "Nada. El alta es gratuita en Barcelona, Girona, Lleida y Tarragona." },
        { question: "¿Hay un plazo para empadronarse después de llegar?", answer: "La ley no fija un número de días: obliga a inscribirse en el municipio donde resides habitualmente. Conviene hacerlo enseguida, porque la tarjeta sanitaria y muchos otros trámites lo piden." },
        { question: "¿Puedo empadronarme con el pasaporte?", answer: "Sí. Para las personas extranjeras, el pasaporte en vigor es válido; los ciudadanos de la UE también pueden usar el documento de identidad de su país, y si tienen el certificado de NIE deben llevarlo." },
        { question: "¿Cada cuánto hay que renovar el padrón?", answer: "Las personas españolas, nunca. Los extranjeros de fuera de la UE sin residencia de larga duración, cada dos años. Los ciudadanos de la UE y los residentes de larga duración confirman la inscripción cada cinco años (cada dos si no constan en el Registro Central de Extranjeros)." },
        { question: "¿Qué diferencia hay entre volante y certificado de empadronamiento?", answer: "El volante es informativo y sirve para la mayoría de gestiones; el certificado es un documento público con plena validez. El CatSalut, para la primera TSI, pide un certificado de menos de tres meses." },
      ],
    },
    en: {
      lead: `**You register at the town hall of the municipality where you live. It is free, and you need neither a rental contract nor legal residence.** You need an ID document (DNI, NIE, residence card or passport) and some proof that you live there: the contract, the title deed, or the permission of whoever holds the flat. If you have none, the council checks with a phone call and a visit. In Barcelona you can apply online with a digital ID (confirmation arrives by email in about 7 days) or at a Citizen Service Office (OAC). The council has three months at most to answer.`,
      factsTitle: "The padrón in six answers",
      facts: [
        { label: "Who", value: "Everyone who lives in Spain, in the town where they spend most of the year (Law 7/1985, art. 15)" },
        { label: "Cost", value: "Free (Barcelona, Girona, Lleida, Tarragona)" },
        { label: "Where", value: "Your town hall: online or at its citizen service office" },
        { label: "Rental contract", value: "Not required: the holder's permission or a council check visit also works" },
        { label: "Legal residence", value: "Not required: the council does not check immigration status" },
        { label: "Time to answer", value: "3 months at most; if the council does not answer, you are registered" },
      ],
      whyH: "What it is for, and why to do it straight away",
      why: [
        "The padrón (padró in Catalan) is the town's register of residents and the proof of where you live. Registering is a legal duty and, in practice, the key to other paperwork. Barcelona City Council says it gives access to public healthcare and to schooling for children, and most immigration procedures (family reunification, arraigo) ask for it.",
        `**Health card (TSI).** CatSalut makes being registered in a Catalan municipality the basic requirement, and asks for a padrón certificate issued within the last three months unless your council offers online checks (${a(PADRO_URLS.tsi, "CatSalut, in Catalan")}). Who is entitled and how to apply, step by step: ${tsi}.`,
        `**Voting in the local elections of 23 May 2027.** If you are a citizen of another EU country, the INE only counts padrón registrations made by **30 December 2026**. The whole process is in the ${vote}.`,
      ],
      bcnH: "In Barcelona, step by step",
      stepsTitle: "How to register on the padrón in Barcelona",
      steps: [
        { title: "Choose how", text: `Online, by identifying yourself on the portal and signing the application electronically, from the ${a(B.sheet, "Barcelona City Council procedure page")} (in Catalan; ${a(PADRO_URLS.bcnSheetEs, "Spanish version")}), if you are 18 or over; or in person at a Citizen Service Office (OAC). The council's 010 line, the OACs and the Oficina Virtual tell you which documents you need.` },
        { title: "Bring your ID", text: "A valid ID document for each person registering (table below). If it has expired, bring the renewal application as well." },
        { title: "Bring proof of address", text: "It depends on your situation: owner, tenant, person authorised by the holder, or a shared residence (second table). Documents must be in Catalan or Spanish, or translated by a sworn translator, your consulate or a public administration." },
        { title: "Wait for the confirmation", text: "Online, if the documents are in order, the council emails a confirmation after about 7 calendar days. If something is missing, it asks for it. The legal maximum to answer is 3 months." },
      ],
      idCaption: "Which ID document Barcelona accepts for the padrón",
      idHead: ["Nationality", "Document (valid)"],
      idRows: [
        ["Spanish", "DNI or passport"],
        ["EU, Switzerland, Norway, Iceland or Liechtenstein", "Passport, residence card or national ID card; if you have the NIE certificate, bring it too"],
        ["United Kingdom", "As other countries, or the Withdrawal Agreement residence document"],
        ["Other countries", "Passport or residence card"],
        ["Spanish children under 14", "Family book or birth certificate (and DNI or passport, if they have one)"],
      ],
      idNote: "Source: Barcelona City Council's procedure sheet and padrón page, read on 13 November 2026.",
      homeCaption: "What proof of address Barcelona asks for, by situation",
      homeHead: ["Your situation", "What to bring"],
      homeRows: [
        ["You own the home and pay the IBI property tax", "Nothing: the council checks. If it cannot, the deed, a Land Registry nota simple or the purchase contract (no more than 1 year old)"],
        ["You rent the flat in your name", "A current contract in your name, for more than 3 months or with an explicit extension, naming the owner or the letting agent"],
        ["The contract has been extended, is open-ended, scanned or e-signed", "Also the last rent receipt or the last electricity, water or gas bill paid in your name (within 3 months). Mobile and internet bills are not accepted"],
        ["You live in a flat or room someone else holds", "Permission to register at the address, the holder's ID and their contract or deed. The permission is valid for 3 months"],
        ["Student or care residence", "A collective-address authorisation signed and stamped by the institution (name, address and tax number)"],
        ["You have no documents at all", "You can still apply: the council phones you and makes a check visit"],
        ["You sleep rough, are in emergency housing or at risk of losing your home", "Registration without a fixed address, with a residence report (ICR) from Social Services, an OAC or the Social Benefits Office"],
      ],
      homeNote: `Sources: ${a(B.sheet, "procedure sheet")} and ${a(B.news, "council guide")} (Barcelona, in Catalan), read on 13 November 2026.`,
      noContractH: "No rental contract? You can still register",
      noContract: [
        "It is the most common question, and the law answers it. The national instructions to councils (BOE, 2020) say the padrón must show where each person really lives, and that councils have no power to rule on ownership or tenancy: the title to the home only serves to prove that you live there. Councils may accept other documents, such as utility bills, or check through the local police or an inspection.",
        "Barcelona City Council puts it just as plainly: you do not need a title deed or a rental contract to register. Under the national instructions, if you live in a flat where others are already registered, instead of the contract you need written permission from a registered adult who holds the flat. Even substandard housing or having no roof at all are situations councils must be able to register, through the no-fixed-address route.",
        "Nor do you need legal residence: the national instructions say it is not for the council to check whether its residents are lawfully in Spain, and Barcelona repeats this in its own guide.",
      ],
      kidsH: "Registering children",
      kids: [
        "A child is registered with whoever has custody, and moving a child's address is a decision for both parents. If you register with your children and the other parent is not with you, Barcelona asks for a joint declaration signed by both or, failing that, the custody court order or a sworn statement (the forms are on the procedure sheet).",
      ],
      docH: "Volante or certificado: which one to ask for",
      doc: [
        "Once you are registered you can ask for two documents. The **volante** is informative, with no official's signature, and is enough for most errands. The **certificado** is a public document with full legal value, and some bodies require it: CatSalut, for instance, for your first health card. How long each one stays valid is up to whoever asks for it; CatSalut wants it issued within the last three months.",
      ],
      renewH: "Renewal, moving house and leaving",
      renewCaption: "How often the registration must be renewed or confirmed",
      renewHead: ["Who", "What to do"],
      renewRows: [
        ["Spanish nationals", "Nothing: it does not expire"],
        ["Non-EU nationals without long-term residence", "Renew every 2 years (Law 7/1985, art. 16.1); otherwise the council can cancel the entry as expired"],
        ["EU citizens and long-term residents", "Confirm every 5 years, or every 2 if you are not on the Central Register of Foreign Nationals (Barcelona)"],
      ],
      renew: [
        "Moving flat within the same town is a change of address, not a new registration. If you move to another town, register there: the new registration cancels the old one (Girona City Council's procedure page says so).",
      ],
      citiesH: "In Girona, Lleida, Tarragona and L'Hospitalet",
      citiesCaption: "How to register on the padrón in other large cities",
      citiesHead: ["City", "How", "Official page"],
      citiesRows: [
        ["L'Hospitalet de Llobregat", "At the Citizen Service Offices, by appointment for \"Padró: altes i canvis de domicili\"", a(PADRO_URLS.hospitalet, "OAC appointments")],
        ["Girona", "Online (idCAT Mòbil, digital certificate or Cl@ve) or in person; an appointment is recommended. Free. You must live in Girona most of the year", a(PADRO_URLS.girona, "Padró registration")],
        ["Lleida", "Online, or in person by appointment at the Municipal Citizen Service Office (OMAC). Free", a(PADRO_URLS.lleida, "Padró registration")],
        ["Tarragona", "In person at the municipal citizen service offices (OMAC), where you are registered on the spot. Free", a(PADRO_URLS.tarragona, "Padró registration")],
      ],
      cities: ["Everywhere else the law is the same: the town where you live must register you and has three months to answer. What changes is the channel (online, appointment, walk-in) and some authorisation forms, which you will find on your council's e-office."],
      warnTitle: "A free council procedure",
      warn: "Registering on the padrón is done directly with the town hall and costs nothing in the towns in this guide. If someone charges you to \"get you empadronado\", you are paying for their service, not for the procedure.",
      faqH: "Frequently asked questions",
      faq: [
        { question: "Can I register on the padrón without a rental contract?", answer: "Yes. You can bring the permission of whoever holds the flat (with their ID and their title) and, if you have no documents at all, Barcelona City Council phones you and makes a check visit. The law does not let the council judge whether a tenancy is legal: it only checks that you live there." },
        { question: "Can I register if I am undocumented or my immigration status is irregular?", answer: "Yes. The national instructions say councils must not check whether residence is lawful, and Barcelona City Council states that legal residence is not required. A valid passport is enough as ID." },
        { question: "Can I register at a rented room?", answer: "Yes. Barcelona registers you at the address where you live, whether a flat, a house or a rented room. If the flat's contract is in someone else's name, you need their permission and their ID." },
        { question: "How long does it take to be registered?", answer: "In Barcelona, online, the council emails a confirmation after about 7 days if the documents are in order; in Tarragona, at the office, you are registered on the spot. The legal maximum is three months and, if the council does not answer, you are registered from the day you applied." },
        { question: "How much does it cost?", answer: "Nothing. Registration is free in Barcelona, Girona, Lleida and Tarragona." },
        { question: "Is there a deadline to register after I arrive?", answer: "The law sets no number of days: it requires you to register in the town where you usually live. Do it straight away, because the health card and many other procedures ask for it." },
        { question: "Can I register with my passport?", answer: "Yes. For foreign nationals a valid passport is accepted; EU citizens may also use their national ID card, and should bring the NIE certificate if they have one." },
        { question: "How often do I have to renew the padrón?", answer: "Spanish nationals never. Non-EU nationals without long-term residence, every two years. EU citizens and long-term residents confirm every five years (every two if they are not on the Central Register of Foreign Nationals)." },
        { question: "What is the difference between a volante and a certificado de empadronamiento?", answer: "The volante is informative and enough for most errands; the certificado is a public document with full legal value. CatSalut asks for a certificado issued within three months for your first health card." },
      ],
    },
  }[L];

  return [
    lead(t.lead),
    keyFacts(t.factsTitle, t.facts),
    ...h2(t.whyH, ...t.why),
    { type: "heading", level: 2, text: t.bcnH } as Block,
    steps(t.stepsTitle, t.steps),
    table(t.idCaption, t.idHead, t.idRows, t.idNote),
    table(t.homeCaption, t.homeHead, t.homeRows, t.homeNote),
    ...h2(t.noContractH, ...t.noContract),
    ...h3(t.kidsH, ...t.kids),
    ...h2(t.docH, ...t.doc),
    ...h2(t.renewH),
    table(t.renewCaption, t.renewHead, t.renewRows),
    ...paras(...t.renew),
    ...h2(t.citiesH),
    table(t.citiesCaption, t.citiesHead, t.citiesRows),
    ...paras(...t.cities),
    callout("tip", t.warnTitle, t.warn),
    { type: "heading", level: 2, text: t.faqH } as Block,
    faq(t.faq),
    callout("official", verifiedLine(L, PADRO_AS_OF), {
      ca: `Llei 7/1985 i ${a(PADRO_URLS.instructions, "instruccions tècniques del padró")} (BOE), fitxa i guia de l'Ajuntament de Barcelona, CatSalut, INE i les seus electròniques de Girona, Lleida, Tarragona i L'Hospitalet.`,
      es: `Ley 7/1985 e ${a(PADRO_URLS.instructions, "instrucciones técnicas del padrón")} (BOE), ficha y guía del Ayuntamiento de Barcelona, CatSalut, INE y las sedes electrónicas de Girona, Lleida, Tarragona y L'Hospitalet.`,
      en: `Law 7/1985 and the ${a(PADRO_URLS.instructions, "padrón technical instructions")} (BOE, in Spanish), Barcelona City Council's procedure sheet and guide, CatSalut, the INE and the e-offices of Girona, Lleida, Tarragona and L'Hospitalet.`,
    }[L]),
    ...b2Related(["tsi", "foreignVote", "barcelonaHub", "transport", "payDates"], L),
  ];
}

export const PADRO: B2Article = {
  key: "padro",
  entryKey: "guide-padron-registration-catalonia",
  categoryKey: "public-services",
  sources: SOURCES,
  heroKey: "municipals-ajuntament-barcelona-nit",
  heroAlt: {
    ca: "Façana de l'Ajuntament de Barcelona il·luminada de nit, a la plaça de Sant Jaume",
    es: "Fachada del Ayuntamiento de Barcelona iluminada de noche, en la plaza de Sant Jaume",
    en: "Barcelona City Hall lit up at night on Plaça de Sant Jaume",
  },
  heroCaption: {
    ca: "L'Ajuntament de Barcelona, on es gestiona el padró de la ciutat.",
    es: "El Ayuntamiento de Barcelona, que gestiona el padrón de la ciudad.",
    en: "Barcelona City Hall, which keeps the city's padrón.",
  },
  verifiedAt: PADRO_AS_OF,
  publishedAt: "2026-11-13T12:00:00+01:00",
  editions: Object.fromEntries(
    LOCALES.map((locale) => [locale, { path: B2_PATHS.padro[locale], ...PADRO_META[locale], blocks: buildPadroBody(locale) }]),
  ) as B2Article["editions"],
};
