import type { Block } from "@/lib/content/blocks";
import { LOCALES, type Locale } from "@/lib/i18n/config";

import { B2_PATHS, b2Related, b2link, netSalaryRelatedItem, callout, faq, h2, keyFacts, lead, list, paras, steps, table, verifiedLine, type B2Article, type B2Source } from "./shared";

/**
 * NIE and TIE in Barcelona and Catalonia: the number (NIE), the card (TIE) and
 * the EU registration certificate, who needs which, forms, the 790-012 fee,
 * appointments, offices in the four provinces, timings (13 Nov 2026). Pairs
 * with the padró and TSI guides.
 *
 * Why this page: "cita nie" ≈ 3,200 searches a week in Catalonia, "tie" ≈ 3,000
 * (Google Trends ES-CT, 5 years; research_notes/evergreen-demand-nov2026.md,
 * item 7). GSC (120 days to 13 Nov): no NIE/TIE query reaches the site, so the
 * URLs are new and year-free. The results are law firms, gestorías and expat
 * blogs. Read 13 Nov 2026: one sends readers to other provinces (the law says
 * the province where you live), one says fingerprints within "30 working days"
 * (the regulation says one month), blogs still print the old €10.30 for the EU
 * certificate or pay the TIE with another fee code. None prints the 2025 fee
 * order or the official office list per province.
 *
 * NIE_TIE_AS_OF 2026-11-13. Every fact was read that day. Sources and quotes:
 *
 *  - BOE, Real Decreto 1155/2024 (BOE-A-2024-24099; «BOE» 280 of 20/11/2024;
 *    «Entrada en vigor: 20/05/2025»; consolidated text updated 22/09/2026):
 *    art. 205 NIE «número personal, único y exclusivo, de carácter
 *    secuencial», «deberá figurar en todos los documentos que se le expidan»;
 *    given «de oficio» when a residence procedure starts; people with
 *    «intereses económicos, profesionales, sociales» ask for it if they are not
 *    «en España en situación irregular» and give «los motivos»; in person at
 *    «las Oficinas de Extranjería o Comisarías de policía», from abroad through
 *    «las Oficinas Consulares de España»; «plazo máximo de cinco días», silence
 *    = «desestimada». Art. 209 TIE: visa or authorisation «por un periodo
 *    superior a seis meses», «solicitar personalmente en el plazo de un mes
 *    desde su entrada en España o desde que la autorización sea concedida o
 *    cobre vigencia»; same validity as the authorisation; lost card = new card,
 *    «no se considerará renovación», validity what remained; changes = new card;
 *    issued at the police station where the file was handled, after proving
 *    identity and «haber realizado el pago de las tasas».
 *  - BOE, Real Decreto 240/2007 (BOE-A-2007-4184): art. 7.5 EU/EEA citizens
 *    staying over three months apply «personalmente ante la oficina de
 *    extranjeros de la provincia donde pretendan permanecer o fijar su
 *    residencia o, en su defecto, ante la Comisaría», «en el plazo de tres
 *    meses», certificate «de forma inmediata» with name, nationality, address,
 *    «número de identidad de extranjero» and date; art. 7.1 conditions; 7.7
 *    «no podrá establecerse un importe fijo»; art. 8 family card (three months
 *    to apply, «resguardo» at once, card within three months, valid five
 *    years); art. 10 permanent residence after five years.
 *  - BOE, Orden PJC/617/2025 (BOE-A-2025-12056, «BOE» 144 of 16/06/2025, in
 *    force that day), annex 4 and 5: TIE family of Spaniards 12; TIE first
 *    grant 16,08; renewal 19,30; long-term 21,87; EU certificate / EU family
 *    card / Brexit TIE 12; NIE 9,84; certificates 7,31. Art. 1.2: amounts rise
 *    «al comienzo de cada ejercicio» with the budget law.
 *  - Policía Nacional, "Tasas de Extranjería" (sede.policia.gob.es, 13 Nov
 *    2026): the same amounts (NIE 9,84 €, EU certificate 12,00 €, TIE 16,08 /
 *    19,30 / 21,87 €). Procedure pages: EU certificate (EX18, 790-012, passport
 *    or national ID, the art. 7 documents, «de forma inmediata»), NIE (EX15,
 *    790-012, pay at banks «en las que no es preciso tener cuenta abierta»),
 *    TIE (EX17, 790-012, validity of the authorisation). None asks for a padró
 *    certificate or photographs. Office locator (two reads agree): Barcelona
 *    Brigada Provincial de Extranjería y Fronteras at C/ Mallorca 213, Rambla
 *    Guipúscoa 74, Passeig Sant Joan 189, C/ Guadalajara 1-3; Girona C/
 *    Cristòfol Grober 12 and C/ Rajolers 7 (EU regime) plus Puigcerdà, La
 *    Jonquera, Portbou and Camprodon units; Lleida C/ Jaume II and Av. Prat de
 *    la Riba 36 (EU regime), Les (Val d'Aran) Av. Sant Jaume 58.
 *    sede.policia.gob.es times out from the VPS (TLS), so these pages were read
 *    through WebFetch, not curl.
 *  - Delegación del Gobierno en Cataluña, "Extranjería" (mptmd.gob.es):
 *    Oficina de Extranjería Barcelona «Paseo Sant Joan, 189-193 08037» and
 *    «Calle Murcia, 42 08027», tel. 935201410; Girona «Avenida Jaume I, 17»;
 *    Lleida «Plaça de la Pau, 1»; Tarragona «Avenida Estanislau Figueras, 59»;
 *    Barcelona police procedures «Exclusivamente con cita previa»: EU
 *    certificate, TIE, «Asignación de NIE (nacionales comunitarios)»; Tarragona
 *    police by comarca (Plaça Orleans; Reus C/ Gral. Moragues 54; Tortosa
 *    Passeig Ribera 21, invitations and extensions Passeig Moreira 3).
 *  - Same office, "Nota informativa" (updated 20/05/2025): police with cita
 *    previa for «Asignación de NIE», the EU certificate, «Expedición de TIE /
 *    toma de huellas / recogida de TIE», «Duplicado de TIE»; «La Oficina de
 *    Extranjería no interviene en la gestión de la cita» for those; EU family
 *    card (EX19), family of Spaniards (EX24), arraigo (EX10) and Brexit
 *    residence: appointment by email to citabarcelona@correo.gob.es, subject
 *    «PETICIÓN CITA PREVIA», no attachments; «Las citas solamente pueden ser
 *    solicitadas y asignadas a las personas titulares»; «Reserve la cita
 *    solamente si [...] tiene la documentación completa».
 *  - sede.administracionespublicas.gob.es/icpplus (redirects to the MPTMD
 *    e-office page "Cita previa de extranjería"): police appointments belong to
 *    the «Ministerio del Interior (Dirección General de la Policía)».
 *
 * Conflict: Tortosa police (Delegación: Passeig Ribera 21; Policía locator:
 * Passeig Joan Moreira 3). Both are printed; the appointment receipt decides.
 *
 * Not printed: services per Barcelona police office (the locator and lawyers'
 * reports disagree), names of the options inside the appointment app (it sits
 * behind bot protection and was not opened), waiting times, how long the TIE
 * takes to be ready, photo sizes and "bring copies" rules (the Ministry's
 * information sheets on inclusion.gob.es and interior.gob.es return 403 to
 * both our server and WebFetch: not bypassed), the automatic fingerprint
 * appointment pilot and TIE "lotes" (only blogs).
 *
 * Re-read by NIE_TIE_REREAD_BY (fees can change at the start of each year:
 * Orden PJC/617/2025 art. 1.2). A test fails after it.
 */
export const NIE_TIE_AS_OF = "2026-11-13";
export const NIE_TIE_REREAD_BY = "2027-01-15";

const POL = "https://sede.policia.gob.es/portalCiudadano/_es";
export const NIE_TIE_URLS = {
  rd1155: "https://www.boe.es/buscar/act.php?id=BOE-A-2024-24099",
  rd240: "https://www.boe.es/buscar/act.php?id=BOE-A-2007-4184",
  fees2025: "https://www.boe.es/buscar/act.php?id=BOE-A-2025-12056",
  appointment: "https://sede.administracionespublicas.gob.es/icpplus/index.html",
  eOffice: "https://sede.administracionespublicas.gob.es/procedimientos/index/categoria/34",
  delegation: "https://mptmd.gob.es/portal/delegaciones_gobierno/delegaciones/catalunya/servicios/extranjeria",
  delegationNote: "https://mptmd.gob.es/content/dam/mpt/delegaciones_gobierno/delegaciones/catalunya/servicios/extranjeria/Nota_informativa_20_05_2025.pdf",
  officeQuestions: "https://ssweb.seap.minhap.es/ayuda/consulta/ExtranjeriaCG",
  fee790: "https://sede.policia.gob.es/Tasa790_012/",
  policeFees: `${POL}/tramites_extranjeria_tasas.php`,
  policeNie: `${POL}/tramites_extranjeria_tramite_asignacion_nie.php`,
  policeEu: `${POL}/tramites_extranjeria_tramite_certificadoregistro_ciudadanoue.php`,
  policeTie: `${POL}/tramites_extranjeria_tramite_tarjeta_residencia_residenciaytrabajo.php`,
  policeOffices: "https://sede.policia.gob.es/portalciudadano/_es/dependencias_localizador_accesible.php",
} as const;

const SOURCES: B2Source[] = [
  { name: "Real Decreto 1155/2024, Reglamento de Extranjería (arts. 205 y 209)", url: NIE_TIE_URLS.rd1155, publisher: "BOE" },
  { name: "Real Decreto 240/2007, ciudadanos de la UE y del EEE (arts. 7, 8 y 10)", url: NIE_TIE_URLS.rd240, publisher: "BOE" },
  { name: "Orden PJC/617/2025, tasas de extranjería", url: NIE_TIE_URLS.fees2025, publisher: "BOE" },
  { name: "Cita previa de extranjería", url: NIE_TIE_URLS.appointment, publisher: "Ministerio de Política Territorial y Memoria Democrática" },
  { name: "Procedimientos de extranjería (sede electrónica)", url: NIE_TIE_URLS.eOffice, publisher: "Ministerio de Política Territorial y Memoria Democrática" },
  { name: "Extranjería en Cataluña: oficinas y trámites", url: NIE_TIE_URLS.delegation, publisher: "Delegación del Gobierno en Cataluña" },
  { name: "Nota informativa: formas de presentación de solicitudes (Barcelona)", url: NIE_TIE_URLS.delegationNote, publisher: "Subdelegación del Gobierno en Barcelona" },
  { name: "Consultas a la Oficina de Extranjería", url: NIE_TIE_URLS.officeQuestions, publisher: "Ministerio de Política Territorial y Memoria Democrática" },
  { name: "Tasa modelo 790 código 012", url: NIE_TIE_URLS.fee790, publisher: "Policía Nacional" },
  { name: "Tasas de extranjería", url: NIE_TIE_URLS.policeFees, publisher: "Policía Nacional" },
  { name: "Asignación de NIE", url: NIE_TIE_URLS.policeNie, publisher: "Policía Nacional" },
  { name: "Certificado de registro de ciudadano de la Unión", url: NIE_TIE_URLS.policeEu, publisher: "Policía Nacional" },
  { name: "Tarjeta de identidad de extranjero (residencia o residencia y trabajo)", url: NIE_TIE_URLS.policeTie, publisher: "Policía Nacional" },
  { name: "Dependencias policiales", url: NIE_TIE_URLS.policeOffices, publisher: "Policía Nacional" },
];

/** A Markdown link. */
const a = (href: string, label: string) => `[${label}](${href})`;

export const NIE_TIE_META: Record<Locale, { title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    title: "NIE i TIE a Barcelona i Catalunya: quin et cal, cita prèvia, taxa 790-012 i oficines",
    seoTitle: "NIE i TIE a Barcelona i Catalunya: cita, taxes i passos",
    seoDescription: "El NIE és un número; la TIE, la targeta dels no comunitaris; els ciutadans de la UE tenen un certificat de registre. Formularis, taxa 790-012, cita i oficines.",
    excerpt: "NIE, TIE o certificat de la UE: quin et cal, els formularis EX-15, EX-17 i EX-18, la taxa 790-012, la cita prèvia, les empremtes i les oficines de les quatre províncies.",
  },
  es: {
    title: "NIE y TIE en Barcelona y Cataluña: cuál necesitas, cita previa, tasa 790-012 y oficinas",
    seoTitle: "NIE y TIE en Barcelona y Cataluña: cita, tasas y pasos",
    seoDescription: "El NIE es un número; la TIE, la tarjeta de los no comunitarios; los ciudadanos de la UE tienen un certificado de registro. Formularios, tasa 790-012, cita y oficinas.",
    excerpt: "NIE, TIE o certificado de la UE: cuál necesitas, los formularios EX-15, EX-17 y EX-18, la tasa 790-012, la cita previa, las huellas y las oficinas de las cuatro provincias.",
  },
  en: {
    title: "NIE and TIE in Barcelona and Catalonia: which one you need, appointments, the 790-012 fee and offices",
    seoTitle: "NIE and TIE in Barcelona: appointments, fees and steps",
    seoDescription: "The NIE is a number; the TIE is the card for non-EU residents; EU citizens get a registration certificate. Forms, the 790-012 fee, appointments and offices.",
    excerpt: "NIE, TIE or EU certificate: which one you need, forms EX-15, EX-17 and EX-18, the 790-012 fee, appointments, fingerprints and the offices in all four provinces.",
  },
};

/** One body for the three editions: the same sections, tables and links in each. */
export function buildNieTieBody(locale: Locale): Block[] {
  const L = locale;
  const U = NIE_TIE_URLS;
  const padro = b2link("padro", L, { ca: "guia de l'empadronament", es: "guía del empadronamiento", en: "padró registration guide" }[L]);
  const tsi = b2link("tsi", L, { ca: "guia de la targeta sanitària (TSI)", es: "guía de la tarjeta sanitaria (TSI)", en: "health card (TSI) guide" }[L]);
  const rd1155 = a(U.rd1155, { ca: "Reial decret 1155/2024", es: "Real Decreto 1155/2024", en: "Royal Decree 1155/2024" }[L]);
  const rd240 = a(U.rd240, { ca: "Reial decret 240/2007", es: "Real Decreto 240/2007", en: "Royal Decree 240/2007" }[L]);
  const order = a(U.fees2025, { ca: "Ordre PJC/617/2025", es: "Orden PJC/617/2025", en: "Order PJC/617/2025" }[L]);
  const cita = a(U.appointment, { ca: "cita prèvia d'estrangeria", es: "cita previa de extranjería", en: "immigration appointment system" }[L]);
  const fee = a(U.fee790, { ca: "formulari de la taxa 790-012 de la Policia", es: "formulario de la tasa 790-012 de la Policía", en: "Police 790-012 fee form" }[L]);
  const polNie = a(U.policeNie, { ca: "fitxa del NIE", es: "ficha del NIE", en: "NIE page" }[L]);
  const polEu = a(U.policeEu, { ca: "fitxa del certificat de la UE", es: "ficha del certificado de la UE", en: "EU certificate page" }[L]);
  const polTie = a(U.policeTie, { ca: "fitxa de la TIE", es: "ficha de la TIE", en: "TIE page" }[L]);
  const polFees = a(U.policeFees, { ca: "taula de taxes de la Policia", es: "tabla de tasas de la Policía", en: "Police fee table" }[L]);
  const offices = a(U.delegation, { ca: "Delegació del Govern a Catalunya", es: "Delegación del Gobierno en Cataluña", en: "Government Delegation in Catalonia" }[L]);
  const note = a(U.delegationNote, { ca: "nota informativa de l'Oficina d'Estrangeria de Barcelona", es: "nota informativa de la Oficina de Extranjería de Barcelona", en: "Barcelona Immigration Office's information note" }[L]);
  const locator = a(U.policeOffices, { ca: "localitzador de dependències de la Policia", es: "localizador de dependencias de la Policía", en: "Police office locator" }[L]);
  const questions = a(U.officeQuestions, { ca: "formulari de consultes", es: "formulario de consultas", en: "enquiry form" }[L]);
  const eOffice = a(U.eOffice, { ca: "seu electrònica d'estrangeria", es: "sede electrónica de extranjería", en: "immigration e-office" }[L]);

  const t = {
    ca: {
      lead: `**El NIE és un número; la TIE és una targeta; i els ciutadans de la UE que viuen aquí no tenen TIE, sinó un certificat de registre que ja porta el NIE.** Si ets de fora de la UE i tens un visat o una autorització de residència de més de sis mesos, has de demanar la **TIE** (formulari EX-17) en el termini d'un mes. Si ets de la UE i et quedes més de tres mesos, demanes el **certificat de registre** (EX-18) en els tres primers mesos. Si només necessites el número per comprar un pis o tramitar una herència, demanes el **NIE** (EX-15). Tot es fa a la Policia Nacional, amb **cita prèvia** a la seu electrònica de les administracions públiques, i es paga amb la **taxa 790 codi 012**: 9,84 € el NIE, 12 € el certificat de la UE, 16,08 € la primera TIE.`,
      factsTitle: "NIE, TIE i certificat de la UE en sis respostes",
      facts: [
        { label: "NIE", value: "Número personal i únic d'estranger; surt a tots els teus documents. Formulari EX-15, 9,84 €" },
        { label: "TIE", value: "Targeta per a no comunitaris amb autorització de més de sis mesos. EX-17, 16,08 € la primera" },
        { label: "Ciutadans de la UE", value: "Certificat de registre amb el NIE, si et quedes més de tres mesos. EX-18, 12 €" },
        { label: "On", value: "Comissaries de la Policia Nacional, sempre amb cita prèvia" },
        { label: "Termini", value: "TIE: un mes des de l'entrada o la concessió. Certificat UE: tres mesos des de l'entrada" },
        { label: "Taxa", value: "Model 790 codi 012, que es genera al web de la Policia i es paga al banc" },
      ],
      whichH: "NIE, TIE o certificat de la UE: quin et cal",
      whichIntro: [
        `El **NIE** (número d'identitat d'estranger) és només un número. La llei el defineix com a «personal, únic i exclusiu» i diu que ha de figurar en tots els documents que se t'expedeixin: és el mateix número que després surt a la TIE o al certificat. La **TIE** (targeta d'identitat d'estranger) és el document físic que acredita la residència legal dels ciutadans de fora de la UE. Els ciutadans de la UE, l'Espai Econòmic Europeu i Suïssa no en tenen: s'inscriuen al Registre Central d'Estrangers i reben un **certificat de registre** amb el NIE.`,
      ],
      whichCaption: "Quin tràmit et toca segons la teva situació",
      whichHead: ["Situació", "Què demanes", "Formulari", "Taxa 790-012", "On"],
      whichRows: [
        ["Ciutadà de la UE, l'EEE o Suïssa que viurà a Catalunya més de tres mesos (feina, estudis, recursos propis)", "Certificat de registre de ciutadà de la UE, amb el NIE", "EX-18", "12 €", "Policia, amb cita"],
        ["Ciutadà de la UE que no hi viurà però necessita el número (compra, herència, impostos)", "NIE", "EX-15", "9,84 €", "Policia, amb cita, o el consolat si ets a l'estranger"],
        ["De fora de la UE, amb un visat o una autorització de residència o d'estada de més de sis mesos (estudis, feina, residència no lucrativa)", "TIE, amb presa d'empremtes", "EX-17", "16,08 € la primera", "Policia, amb cita"],
        ["De fora de la UE que renova l'autorització o canvia de situació", "TIE nova", "EX-17", "19,30 €; residència de llarga durada, 21,87 €", "Policia, amb cita"],
        ["De fora de la UE sense residència aquí, amb interessos econòmics o professionals a Espanya", "NIE (no pots estar en situació irregular)", "EX-15", "9,84 €", "Policia, amb cita, o el consolat"],
        ["Familiar no comunitari d'un ciutadà de la UE que hi resideix", "Targeta de residència de familiar de ciutadà de la Unió", "EX-19", "12 €", "Oficina d'Estrangeria, amb cita"],
        ["Familiar no comunitari d'una persona amb nacionalitat espanyola", "Autorització de residència de familiars d'espanyols i després la TIE", "EX-24", "12 € la TIE", "Oficina d'Estrangeria, amb cita"],
        ["Ciutadà britànic resident abans del Brexit (Acord de Retirada)", "TIE de l'Acord de Retirada; les renovacions, a la Policia", "Segons el cas", "12 €", "Oficina d'Estrangeria o Policia"],
      ],
      whichNote: "Fonts: Reial decret 1155/2024 (arts. 205 i 209), Reial decret 240/2007 (arts. 7 i 8), Ordre PJC/617/2025 i fitxes de la Policia Nacional, consultats el 13 de novembre de 2026.",
      lawH: "Què diu el Reglament d'Estrangeria del 2025",
      law: [
        `El ${rd1155}, en vigor des del **20 de maig de 2025**, és el reglament que regula el NIE i la TIE. L'article 205 diu que la Policia assigna el NIE d'ofici quan comença un tràmit de residència, i que qui el necessita per interessos econòmics, professionals o socials l'ha de demanar en persona, explicant-ne el motiu i sense estar en situació irregular. La Policia té **cinc dies** per resoldre; si no respon, la sol·licitud s'entén **denegada**. Des de l'estranger, el NIE es demana als consolats d'Espanya.`,
        `L'article 209 obliga a tenir la TIE tothom que té un visat o una autorització per quedar-se **més de sis mesos**, i a demanar-la **en persona en el termini d'un mes** des de l'entrada a Espanya o des que l'autorització es concedeix o entra en vigor. La targeta té la mateixa vigència que l'autorització. Si la perds o es fa malbé, se'n fa una de nova que no compta com a renovació i dura el que quedava a l'anterior. La lliura la comissaria on s'ha tramitat l'expedient, quan acredites que ets el titular i que has pagat la taxa.`,
        `Per als ciutadans de la UE, el ${rd240} (article 7) demana inscriure's **en el termini de tres mesos** des de l'entrada, en persona, a la província on vius. El certificat s'expedeix **de manera immediata** i inclou el nom, la nacionalitat, el domicili, el NIE i la data. Has d'acreditar que hi treballes, que hi estudies o que tens recursos suficients i una assegurança de malaltia; la norma diu que no es pot fixar un import fix de recursos, sinó que depèn de cada cas. Després de cinc anys seguits de residència legal pots demanar el certificat de residència permanent.`,
      ],
      howH: "Pas a pas, del formulari a la targeta",
      stepsTitle: "Com es fa a Catalunya",
      steps: [
        { title: "1. Tria el tràmit", text: "Mira la taula de dalt: NIE (EX-15), certificat de la UE (EX-18) o TIE (EX-17). Si tens una resolució favorable de residència, llegeix-la: hi diu què has de fer després." },
        { title: "2. Omple el formulari", text: `El trobaràs enllaçat a la ${polNie}, la ${polEu} o la ${polTie} de la Policia. Porta'l signat.` },
        { title: "3. Genera i paga la taxa 790-012", text: `Omple el ${fee}, imprimeix-lo i paga'l en un banc o caixa: segons la Policia, no cal tenir-hi compte. Guarda el justificant.` },
        { title: "4. Demana cita prèvia", text: `A la ${cita}: tria la província on vius i el tràmit de Policia. Les comissaries de Barcelona fan aquests tràmits només amb cita.` },
        { title: "5. Ves a la cita amb tota la documentació", text: "El formulari, el justificant de la taxa, el passaport o el document d'identitat en vigor i el que demani el teu cas (per al certificat de la UE, el contracte, la matrícula o la prova de recursos i assegurança)." },
        { title: "6. Certificat o empremtes", text: "El certificat de la UE s'expedeix a la mateixa cita; el NIE s'ha de resoldre en cinc dies com a màxim. Per a la TIE, a la cita et prenen les empremtes i després tornes a recollir la targeta, també amb cita." },
      ],
      citaH: "Com funciona la cita prèvia",
      cita: [
        `La cita per a la Policia es demana a la ${cita} del Ministeri de Política Territorial: el sistema és el mateix per a tot Espanya, però els tràmits de la Policia depenen del Ministeri de l'Interior. La ${note} és clara: l'Oficina d'Estrangeria «no intervé» en les cites de la Policia. Per al NIE, el certificat de la UE, les empremtes de la TIE, la recollida de la TIE i els duplicats, la cita és a la comissaria.`,
        `Les cites són escasses i no et podem prometre cap hora. El que sí diu l'Oficina de Barcelona és que reservis «només si tens la documentació completa», i que les cites per als tràmits de la mateixa oficina només s'assignen a la persona titular de la sol·licitud.`,
        `**Si el teu tràmit és a l'Oficina d'Estrangeria de Barcelona** (targeta de familiar de ciutadà de la UE EX-19, residència de familiars d'espanyols EX-24, arrelament EX-10 o residència de l'Acord de Retirada), la cita no es demana a la seu: s'envia un correu a **citabarcelona@correo.gob.es** amb l'assumpte «PETICIÓ CITA PRÈVIA» (en castellà, «PETICIÓN CITA PREVIA») i, al cos, el passaport o NIE, el nom i cognoms, el mòbil, el correu, el tipus de sol·licitud i quantes en presentaràs. Sense fitxers adjunts: els correus amb adjunts no es processen.`,
      ],
      feesH: "Quant costa: la taxa 790 codi 012",
      feesCaption: "Imports de la taxa 790-012 per als tràmits de la Policia",
      feesHead: ["Tràmit", "Import"],
      feesRows: [
        ["Assignació de NIE a petició de l'interessat", "9,84 €"],
        ["Certificat de registre de ciutadà de la UE, targeta de familiar de ciutadà de la Unió o TIE de l'Acord de Retirada (Brexit)", "12,00 €"],
        ["TIE de familiars de persones amb nacionalitat espanyola", "12,00 €"],
        ["TIE de la primera concessió de residència temporal, estada o treballador transfronterer", "16,08 €"],
        ["TIE de renovació de la residència temporal o pròrroga de l'estada", "19,30 €"],
        ["TIE de residència de llarga durada o de llarga durada-UE", "21,87 €"],
        ["Certificats o informes a petició de l'interessat", "7,31 €"],
      ],
      feesNote: "Ordre PJC/617/2025 (BOE del 16 de juny de 2025) i taula de taxes de la Policia Nacional, consultades el 13 de novembre de 2026. Els imports poden pujar a l'inici de cada any.",
      fees: [
        `Aquests imports són els de l'${order}, i la ${polFees} mostrava els mateixos el 13 de novembre de 2026. L'ordre preveu que pugin a l'inici de cada any amb la llei de pressupostos. El formulari de la Policia calcula l'import quan tries el tràmit: paga el que hi surti.`,
      ],
      officesH: "Oficines a les quatre províncies",
      officesCaption: "On es fan el NIE, la TIE i el certificat de la UE a Catalunya",
      officesHead: ["Província", "Oficina", "Adreça", "Per a què"],
      officesRows: [
        ["Barcelona", "Policia Nacional: Brigada Provincial d'Estrangeria i Fronteres", "C/ Mallorca, 213 (cantonada Enric Granados); Rambla Guipúscoa, 74; Passeig de Sant Joan, 189; C/ Guadalajara, 1-3", "NIE, certificat de la UE, empremtes i recollida de la TIE, amb cita"],
        ["Barcelona", "Oficina d'Estrangeria (Subdelegació del Govern)", "Passeig de Sant Joan, 189-193 (08037) i C/ Múrcia, 42 (08027). Tel. 935 201 410", "Autoritzacions de residència i targeta de familiar de la UE; no fa el NIE ni la TIE"],
        ["Girona", "Policia Nacional: Brigada Provincial d'Estrangeria i Fronteres", "C/ Cristòfol Grober, 12; règim comunitari, C/ Rajolers, 7. Unitats a Puigcerdà, la Jonquera, Portbou i Camprodon", "NIE, TIE i certificat de la UE, amb cita"],
        ["Girona", "Oficina d'Estrangeria", "Avinguda de Jaume I, 17 (17001). Tel. 972 069 140", "Autoritzacions de residència"],
        ["Lleida", "Policia Nacional: Brigada Provincial d'Estrangeria i Fronteres", "C/ Jaume II; règim comunitari, Av. Prat de la Riba, 36. Unitat de Les (Aran): Av. Sant Jaume, 58", "NIE, TIE i certificat de la UE, amb cita"],
        ["Lleida", "Oficina d'Estrangeria (Subdelegació del Govern)", "Plaça de la Pau, 1 (25007). Tel. 973 959 213", "Autoritzacions de residència i targeta de familiar de la UE"],
        ["Tarragona", "Comissaria Provincial (Tarragonès, Alt Camp, Baix Penedès, Conca de Barberà)", "Plaça d'Orleans, s/n (43005)", "NIE, TIE i certificat de la UE"],
        ["Tarragona", "Comissaria de Reus (Baix Camp, Priorat, Ribera d'Ebre)", "C/ General Moragues, 54 (43203)", "NIE, TIE i certificat de la UE"],
        ["Tarragona", "Comissaria de Tortosa (Baix Ebre, Montsià, Terra Alta)", "Passeig de Ribera, 21 (43500), segons la Delegació del Govern; el localitzador de la Policia indica el Passeig Joan Moreira, 3", "NIE, TIE i certificat de la UE"],
        ["Tarragona", "Oficina d'Estrangeria", "Avinguda d'Estanislau Figueras, 59 (43002). Tel. 977 999 149", "Autoritzacions de residència i targetes inicials de familiar de la UE"],
      ],
      officesNote: "Fonts: Delegació del Govern a Catalunya (oficines d'estrangeria i comissaries de Tarragona) i localitzador de dependències de la Policia Nacional, consultats el 13 de novembre de 2026. L'adreça que val és la del teu justificant de cita.",
      officesAfter: [
        `L'**Oficina d'Estrangeria** i la **Policia** no fan el mateix. L'Oficina (Subdelegació del Govern) tramita les autoritzacions de residència i la targeta de familiar de ciutadà de la UE; el NIE, el certificat de la UE i l'expedició i la recollida de la TIE es fan a la Policia, segons la ${offices}. Les adreces de la Policia surten del ${locator}; quan demanis cita, el sistema t'assigna una oficina concreta, i és la que consta al justificant.`,
      ],
      timeH: "Terminis",
      timeCaption: "Quant de temps tens i quant triguen",
      timeHead: ["Tràmit", "Termini", "Font"],
      timeRows: [
        ["Demanar la TIE", "Un mes des de l'entrada a Espanya o des que l'autorització es concedeix o entra en vigor", "Reglament d'Estrangeria, art. 209"],
        ["Inscriure's com a ciutadà de la UE", "Tres mesos des de l'entrada; el certificat s'expedeix de manera immediata", "Reial decret 240/2007, art. 7"],
        ["Resposta al NIE", "Cinc dies com a màxim; sense resposta, s'entén denegat", "Reglament d'Estrangeria, art. 205"],
        ["Targeta de familiar de ciutadà de la UE", "Demanar-la en tres mesos; resguard immediat i targeta en tres mesos; val cinc anys", "Reial decret 240/2007, art. 8"],
        ["Residència permanent (UE)", "Després de cinc anys seguits de residència legal", "Reial decret 240/2007, art. 10"],
      ],
      timeNote: "Les normes no fixen quant triga la TIE a estar llesta ni quant s'espera per a una cita.",
      mistakesH: "Errors freqüents",
      mistakes: [
        "**Demanar una TIE sent ciutadà de la UE.** Els ciutadans de la UE, l'EEE i Suïssa reben el certificat de registre (EX-18); la TIE és per als no comunitaris, inclosos els familiars no comunitaris d'un ciutadà de la UE.",
        "**Pensar que el NIE canvia o caduca en renovar.** El número és personal i únic, i surt a tots els teus documents; el que caduca és la targeta o el document que el porta.",
        "**Deixar passar el mes de la TIE.** El reglament dona un mes des de l'entrada o des que l'autorització entra en vigor. Complir-lo és obligació teva encara que les cites vagin justes: demana-la de seguida.",
        "**Anar a una altra província perquè hi ha cites.** La norma diu que el certificat de la UE es demana a la província on vols viure, i la TIE es lliura a la comissaria que ha tramitat l'expedient.",
        "**Reservar cita sense tenir els papers.** L'Oficina de Barcelona demana reservar només amb la documentació completa: sense el justificant de la taxa o el formulari signat, et faran tornar.",
        "**Pagar una altra taxa.** Els tràmits de la Policia es paguen amb el model 790 codi 012; genera'l al web de la Policia triant el teu tràmit.",
      ],
      linksH: "Com encaixa amb el padró i la targeta sanitària",
      links: [
        `**Padró.** Per empadronar-te no et cal el NIE: n'hi ha prou amb el passaport o, si ets de la UE, el document d'identitat del teu país. Tot el procés és a la ${padro}. Les fitxes de la Policia per al NIE, la TIE i el certificat de la UE no inclouen el padró entre els documents (13 de novembre de 2026), però el necessitaràs igualment per a la targeta sanitària i altres tràmits.`,
        `**Targeta sanitària.** El CatSalut accepta el DNI, el NIE o el passaport com a document d'identitat, i demana estar empadronat. Si ets de la UE i no treballes aquí, primer passes per l'INSS. Tot plegat, a la ${tsi}.`,
      ],
      askTitle: "Quan has de preguntar a l'oficina",
      ask: `Aquesta guia explica el procediment general; no substitueix la resolució del teu expedient ni l'atenció de l'administració. Si el teu cas no encaixa (canvi de situació, menors, protecció internacional, document caducat), pregunta abans de pagar o reservar: a l'Oficina d'Estrangeria pel ${questions} o el telèfon 935 201 410, i a la Policia, a la mateixa cita o a la comissaria. L'estat dels expedients es consulta a la ${eOffice}.`,
      faqH: "Preguntes freqüents",
      faq: [
        { question: "El NIE i la TIE són el mateix?", answer: "No. El NIE és el número d'identitat d'estranger; la TIE és la targeta que acredita la residència dels no comunitaris i porta imprès el NIE. Pots tenir NIE sense TIE (per exemple, si ets de la UE o no hi resideixes)." },
        { question: "Soc ciutadà de la UE: necessito la TIE?", answer: "No. Si et quedes més de tres mesos, demanes el certificat de registre de ciutadà de la UE (EX-18), que porta el NIE i costa 12 €. Si estàs menys de tres mesos, n'hi ha prou amb el passaport o el document d'identitat." },
        { question: "Quant costa el NIE?", answer: "9,84 € de taxa 790-012. El certificat de la UE costa 12 € i la primera TIE, 16,08 € (Ordre PJC/617/2025, imports vigents el 13 de novembre de 2026)." },
        { question: "Puc demanar el NIE des de fora d'Espanya?", answer: "Sí. El reglament diu que, si no ets a Espanya, el NIE es demana a través dels consolats d'Espanya." },
        { question: "Quant triga?", answer: "El NIE s'ha de resoldre en cinc dies com a màxim i el certificat de la UE s'expedeix de manera immediata. Per a la TIE hi ha dues cites (empremtes i recollida); la norma no fixa quant triga la targeta." },
        { question: "Necessito estar empadronat per demanar el NIE o la TIE?", answer: "Les fitxes de la Policia no inclouen el padró entre els documents. Empadronar-te és igualment obligatori si vius aquí i et caldrà per a la targeta sanitària." },
        { question: "He perdut la TIE. Què faig?", answer: "Demanes una targeta nova a la Policia, amb cita. No compta com a renovació i dura el que li quedava a l'anterior (Reglament d'Estrangeria, art. 209)." },
        { question: "La meva parella no és de la UE. Quin document necessita?", answer: "La targeta de residència de familiar de ciutadà de la Unió (EX-19, 12 €), que es demana a l'Oficina d'Estrangeria en els tres primers mesos. A Barcelona, la cita es demana per correu electrònic a citabarcelona@correo.gob.es." },
        { question: "Puc anar a una comissaria d'una altra província?", answer: "La norma diu que el certificat de la UE es demana a la província on vols viure, i que la TIE la lliura la comissaria on s'ha tramitat l'expedient. Demana cita a la teva província." },
      ],
      official: `${rd1155} (arts. 205 i 209), ${rd240} (arts. 7, 8 i 10), ${order}, fitxes i taxes de la Policia Nacional, la ${offices}, la ${note} i la ${cita}. Les fitxes informatives del Ministeri d'Inclusió no s'han pogut consultar el 13 de novembre de 2026.`,
    },
    es: {
      lead: `**El NIE es un número; la TIE es una tarjeta; y los ciudadanos de la UE que viven aquí no tienen TIE, sino un certificado de registro que ya lleva el NIE.** Si eres de fuera de la UE y tienes un visado o una autorización de residencia de más de seis meses, debes pedir la **TIE** (formulario EX-17) en el plazo de un mes. Si eres de la UE y te quedas más de tres meses, pides el **certificado de registro** (EX-18) en los tres primeros meses. Si solo necesitas el número para comprar un piso o tramitar una herencia, pides el **NIE** (EX-15). Todo se hace en la Policía Nacional, con **cita previa** en la sede electrónica de las administraciones públicas, y se paga con la **tasa 790 código 012**: 9,84 € el NIE, 12 € el certificado de la UE, 16,08 € la primera TIE.`,
      factsTitle: "NIE, TIE y certificado de la UE en seis respuestas",
      facts: [
        { label: "NIE", value: "Número personal y único de extranjero; aparece en todos tus documentos. Formulario EX-15, 9,84 €" },
        { label: "TIE", value: "Tarjeta para no comunitarios con autorización de más de seis meses. EX-17, 16,08 € la primera" },
        { label: "Ciudadanos de la UE", value: "Certificado de registro con el NIE, si te quedas más de tres meses. EX-18, 12 €" },
        { label: "Dónde", value: "Comisarías de la Policía Nacional, siempre con cita previa" },
        { label: "Plazo", value: "TIE: un mes desde la entrada o la concesión. Certificado UE: tres meses desde la entrada" },
        { label: "Tasa", value: "Modelo 790 código 012, que se genera en la web de la Policía y se paga en el banco" },
      ],
      whichH: "NIE, TIE o certificado de la UE: cuál necesitas",
      whichIntro: [
        `El **NIE** (número de identidad de extranjero) es solo un número. La ley lo define como «personal, único y exclusivo» y dice que debe figurar en todos los documentos que se te expidan: es el mismo número que luego aparece en la TIE o en el certificado. La **TIE** (tarjeta de identidad de extranjero) es el documento físico que acredita la residencia legal de los ciudadanos de fuera de la UE. Los ciudadanos de la UE, el Espacio Económico Europeo y Suiza no la tienen: se inscriben en el Registro Central de Extranjeros y reciben un **certificado de registro** con el NIE.`,
      ],
      whichCaption: "Qué trámite te toca según tu situación",
      whichHead: ["Situación", "Qué pides", "Formulario", "Tasa 790-012", "Dónde"],
      whichRows: [
        ["Ciudadano de la UE, el EEE o Suiza que vivirá en Cataluña más de tres meses (trabajo, estudios, recursos propios)", "Certificado de registro de ciudadano de la UE, con el NIE", "EX-18", "12 €", "Policía, con cita"],
        ["Ciudadano de la UE que no vivirá aquí pero necesita el número (compra, herencia, impuestos)", "NIE", "EX-15", "9,84 €", "Policía, con cita, o el consulado si estás en el extranjero"],
        ["De fuera de la UE, con un visado o una autorización de residencia o de estancia de más de seis meses (estudios, trabajo, residencia no lucrativa)", "TIE, con toma de huellas", "EX-17", "16,08 € la primera", "Policía, con cita"],
        ["De fuera de la UE que renueva la autorización o cambia de situación", "TIE nueva", "EX-17", "19,30 €; residencia de larga duración, 21,87 €", "Policía, con cita"],
        ["De fuera de la UE sin residencia aquí, con intereses económicos o profesionales en España", "NIE (no puedes estar en situación irregular)", "EX-15", "9,84 €", "Policía, con cita, o el consulado"],
        ["Familiar no comunitario de un ciudadano de la UE que reside aquí", "Tarjeta de residencia de familiar de ciudadano de la Unión", "EX-19", "12 €", "Oficina de Extranjería, con cita"],
        ["Familiar no comunitario de una persona con nacionalidad española", "Autorización de residencia de familiares de españoles y después la TIE", "EX-24", "12 € la TIE", "Oficina de Extranjería, con cita"],
        ["Ciudadano británico residente antes del Brexit (Acuerdo de Retirada)", "TIE del Acuerdo de Retirada; las renovaciones, en la Policía", "Según el caso", "12 €", "Oficina de Extranjería o Policía"],
      ],
      whichNote: "Fuentes: Real Decreto 1155/2024 (arts. 205 y 209), Real Decreto 240/2007 (arts. 7 y 8), Orden PJC/617/2025 y fichas de la Policía Nacional, consultados el 13 de noviembre de 2026.",
      lawH: "Qué dice el Reglamento de Extranjería de 2025",
      law: [
        `El ${rd1155}, en vigor desde el **20 de mayo de 2025**, es el reglamento que regula el NIE y la TIE. El artículo 205 dice que la Policía asigna el NIE de oficio cuando empieza un trámite de residencia, y que quien lo necesita por intereses económicos, profesionales o sociales debe pedirlo en persona, explicando el motivo y sin estar en situación irregular. La Policía tiene **cinco días** para resolver; si no responde, la solicitud se entiende **denegada**. Desde el extranjero, el NIE se pide en los consulados de España.`,
        `El artículo 209 obliga a tener la TIE a todo el que tiene un visado o una autorización para quedarse **más de seis meses**, y a pedirla **en persona en el plazo de un mes** desde la entrada en España o desde que la autorización se concede o entra en vigor. La tarjeta tiene la misma vigencia que la autorización. Si la pierdes o se estropea, se hace una nueva que no cuenta como renovación y dura lo que le quedaba a la anterior. La entrega la comisaría donde se ha tramitado el expediente, cuando acreditas que eres el titular y que has pagado la tasa.`,
        `Para los ciudadanos de la UE, el ${rd240} (artículo 7) exige inscribirse **en el plazo de tres meses** desde la entrada, en persona, en la provincia donde vives. El certificado se expide **de forma inmediata** e incluye el nombre, la nacionalidad, el domicilio, el NIE y la fecha. Debes acreditar que trabajas, que estudias o que tienes recursos suficientes y un seguro de enfermedad; la norma dice que no puede fijarse un importe fijo de recursos, sino que depende de cada caso. Tras cinco años seguidos de residencia legal puedes pedir el certificado de residencia permanente.`,
      ],
      howH: "Paso a paso, del formulario a la tarjeta",
      stepsTitle: "Cómo se hace en Cataluña",
      steps: [
        { title: "1. Elige el trámite", text: "Mira la tabla de arriba: NIE (EX-15), certificado de la UE (EX-18) o TIE (EX-17). Si tienes una resolución favorable de residencia, léela: dice qué tienes que hacer después." },
        { title: "2. Rellena el formulario", text: `Lo encontrarás enlazado en la ${polNie}, la ${polEu} o la ${polTie} de la Policía. Llévalo firmado.` },
        { title: "3. Genera y paga la tasa 790-012", text: `Rellena el ${fee}, imprímelo y págalo en un banco o caja: según la Policía, no hace falta tener cuenta. Guarda el justificante.` },
        { title: "4. Pide cita previa", text: `En la ${cita}: elige la provincia donde vives y el trámite de Policía. Las comisarías de Barcelona hacen estos trámites solo con cita.` },
        { title: "5. Ve a la cita con toda la documentación", text: "El formulario, el justificante de la tasa, el pasaporte o el documento de identidad en vigor y lo que pida tu caso (para el certificado de la UE, el contrato, la matrícula o la prueba de recursos y seguro)." },
        { title: "6. Certificado o huellas", text: "El certificado de la UE se expide en la misma cita; el NIE debe resolverse en cinco días como máximo. Para la TIE, en la cita te toman las huellas y después vuelves a recoger la tarjeta, también con cita." },
      ],
      citaH: "Cómo funciona la cita previa",
      cita: [
        `La cita para la Policía se pide en la ${cita} del Ministerio de Política Territorial: el sistema es el mismo para toda España, pero los trámites de la Policía dependen del Ministerio del Interior. La ${note} es clara: la Oficina de Extranjería «no interviene» en las citas de la Policía. Para el NIE, el certificado de la UE, las huellas de la TIE, la recogida de la TIE y los duplicados, la cita es en la comisaría.`,
        `Las citas escasean y no podemos prometerte ninguna hora. Lo que sí dice la Oficina de Barcelona es que reserves «solamente si tienes la documentación completa», y que las citas para los trámites de la propia oficina solo se asignan a la persona titular de la solicitud.`,
        `**Si tu trámite es en la Oficina de Extranjería de Barcelona** (tarjeta de familiar de ciudadano de la UE EX-19, residencia de familiares de españoles EX-24, arraigo EX-10 o residencia del Acuerdo de Retirada), la cita no se pide en la sede: se envía un correo a **citabarcelona@correo.gob.es** con el asunto «PETICIÓN CITA PREVIA» y, en el cuerpo, el pasaporte o NIE, el nombre y apellidos, el móvil, el correo, el tipo de solicitud y cuántas vas a presentar. Sin archivos adjuntos: los correos con adjuntos no se procesan.`,
      ],
      feesH: "Cuánto cuesta: la tasa 790 código 012",
      feesCaption: "Importes de la tasa 790-012 para los trámites de la Policía",
      feesHead: ["Trámite", "Importe"],
      feesRows: [
        ["Asignación de NIE a instancia del interesado", "9,84 €"],
        ["Certificado de registro de ciudadano de la UE, tarjeta de familiar de ciudadano de la Unión o TIE del Acuerdo de Retirada (Brexit)", "12,00 €"],
        ["TIE de familiares de personas con nacionalidad española", "12,00 €"],
        ["TIE de la primera concesión de residencia temporal, estancia o trabajador transfronterizo", "16,08 €"],
        ["TIE de renovación de la residencia temporal o prórroga de la estancia", "19,30 €"],
        ["TIE de residencia de larga duración o de larga duración-UE", "21,87 €"],
        ["Certificados o informes a instancia del interesado", "7,31 €"],
      ],
      feesNote: "Orden PJC/617/2025 (BOE del 16 de junio de 2025) y tabla de tasas de la Policía Nacional, consultadas el 13 de noviembre de 2026. Los importes pueden subir al inicio de cada año.",
      fees: [
        `Estos importes son los de la ${order}, y la ${polFees} mostraba los mismos el 13 de noviembre de 2026. La orden prevé que suban al inicio de cada año con la ley de presupuestos. El formulario de la Policía calcula el importe cuando eliges el trámite: paga lo que salga.`,
      ],
      officesH: "Oficinas en las cuatro provincias",
      officesCaption: "Dónde se hacen el NIE, la TIE y el certificado de la UE en Cataluña",
      officesHead: ["Provincia", "Oficina", "Dirección", "Para qué"],
      officesRows: [
        ["Barcelona", "Policía Nacional: Brigada Provincial de Extranjería y Fronteras", "C/ Mallorca, 213 (esquina Enric Granados); Rambla Guipúscoa, 74; Passeig de Sant Joan, 189; C/ Guadalajara, 1-3", "NIE, certificado de la UE, huellas y recogida de la TIE, con cita"],
        ["Barcelona", "Oficina de Extranjería (Subdelegación del Gobierno)", "Passeig de Sant Joan, 189-193 (08037) y C/ Murcia, 42 (08027). Tel. 935 201 410", "Autorizaciones de residencia y tarjeta de familiar de la UE; no hace el NIE ni la TIE"],
        ["Girona", "Policía Nacional: Brigada Provincial de Extranjería y Fronteras", "C/ Cristòfol Grober, 12; régimen comunitario, C/ Rajolers, 7. Unidades en Puigcerdà, La Jonquera, Portbou y Camprodon", "NIE, TIE y certificado de la UE, con cita"],
        ["Girona", "Oficina de Extranjería", "Avinguda de Jaume I, 17 (17001). Tel. 972 069 140", "Autorizaciones de residencia"],
        ["Lleida", "Policía Nacional: Brigada Provincial de Extranjería y Fronteras", "C/ Jaume II; régimen comunitario, Av. Prat de la Riba, 36. Unidad de Les (Arán): Av. Sant Jaume, 58", "NIE, TIE y certificado de la UE, con cita"],
        ["Lleida", "Oficina de Extranjería (Subdelegación del Gobierno)", "Plaça de la Pau, 1 (25007). Tel. 973 959 213", "Autorizaciones de residencia y tarjeta de familiar de la UE"],
        ["Tarragona", "Comisaría Provincial (Tarragonès, Alt Camp, Baix Penedès, Conca de Barberà)", "Plaça d'Orleans, s/n (43005)", "NIE, TIE y certificado de la UE"],
        ["Tarragona", "Comisaría de Reus (Baix Camp, Priorat, Ribera d'Ebre)", "C/ General Moragues, 54 (43203)", "NIE, TIE y certificado de la UE"],
        ["Tarragona", "Comisaría de Tortosa (Baix Ebre, Montsià, Terra Alta)", "Passeig de Ribera, 21 (43500), según la Delegación del Gobierno; el localizador de la Policía indica el Passeig Joan Moreira, 3", "NIE, TIE y certificado de la UE"],
        ["Tarragona", "Oficina de Extranjería", "Avinguda d'Estanislau Figueras, 59 (43002). Tel. 977 999 149", "Autorizaciones de residencia y tarjetas iniciales de familiar de la UE"],
      ],
      officesNote: "Fuentes: Delegación del Gobierno en Cataluña (oficinas de extranjería y comisarías de Tarragona) y localizador de dependencias de la Policía Nacional, consultados el 13 de noviembre de 2026. La dirección que vale es la de tu justificante de cita.",
      officesAfter: [
        `La **Oficina de Extranjería** y la **Policía** no hacen lo mismo. La Oficina (Subdelegación del Gobierno) tramita las autorizaciones de residencia y la tarjeta de familiar de ciudadano de la UE; el NIE, el certificado de la UE y la expedición y la recogida de la TIE se hacen en la Policía, según la ${offices}. Las direcciones de la Policía salen del ${locator}; cuando pides cita, el sistema te asigna una oficina concreta, y es la que consta en el justificante.`,
      ],
      timeH: "Plazos",
      timeCaption: "Cuánto tiempo tienes y cuánto tardan",
      timeHead: ["Trámite", "Plazo", "Fuente"],
      timeRows: [
        ["Pedir la TIE", "Un mes desde la entrada en España o desde que la autorización se concede o entra en vigor", "Reglamento de Extranjería, art. 209"],
        ["Inscribirse como ciudadano de la UE", "Tres meses desde la entrada; el certificado se expide de forma inmediata", "Real Decreto 240/2007, art. 7"],
        ["Respuesta al NIE", "Cinco días como máximo; sin respuesta, se entiende denegado", "Reglamento de Extranjería, art. 205"],
        ["Tarjeta de familiar de ciudadano de la UE", "Pedirla en tres meses; resguardo inmediato y tarjeta en tres meses; vale cinco años", "Real Decreto 240/2007, art. 8"],
        ["Residencia permanente (UE)", "Tras cinco años seguidos de residencia legal", "Real Decreto 240/2007, art. 10"],
      ],
      timeNote: "Las normas no fijan cuánto tarda la TIE en estar lista ni cuánto se espera para una cita.",
      mistakesH: "Errores frecuentes",
      mistakes: [
        "**Pedir una TIE siendo ciudadano de la UE.** Los ciudadanos de la UE, el EEE y Suiza reciben el certificado de registro (EX-18); la TIE es para los no comunitarios, incluidos los familiares no comunitarios de un ciudadano de la UE.",
        "**Pensar que el NIE cambia o caduca al renovar.** El número es personal y único, y aparece en todos tus documentos; lo que caduca es la tarjeta o el documento que lo lleva.",
        "**Dejar pasar el mes de la TIE.** El reglamento da un mes desde la entrada o desde que la autorización entra en vigor. Cumplirlo es tu obligación aunque las citas vayan justas: pídela enseguida.",
        "**Ir a otra provincia porque hay citas.** La norma dice que el certificado de la UE se pide en la provincia donde quieres vivir, y la TIE se entrega en la comisaría que ha tramitado el expediente.",
        "**Reservar cita sin tener los papeles.** La Oficina de Barcelona pide reservar solo con la documentación completa: sin el justificante de la tasa o el formulario firmado, te harán volver.",
        "**Pagar otra tasa.** Los trámites de la Policía se pagan con el modelo 790 código 012; genéralo en la web de la Policía eligiendo tu trámite.",
      ],
      linksH: "Cómo encaja con el padrón y la tarjeta sanitaria",
      links: [
        `**Padrón.** Para empadronarte no te hace falta el NIE: basta el pasaporte o, si eres de la UE, el documento de identidad de tu país. Todo el proceso está en la ${padro}. Las fichas de la Policía para el NIE, la TIE y el certificado de la UE no incluyen el padrón entre los documentos (13 de noviembre de 2026), pero lo necesitarás igualmente para la tarjeta sanitaria y otros trámites.`,
        `**Tarjeta sanitaria.** El CatSalut acepta el DNI, el NIE o el pasaporte como documento de identidad, y pide estar empadronado. Si eres de la UE y no trabajas aquí, primero pasas por el INSS. Todo, en la ${tsi}.`,
      ],
      askTitle: "Cuándo preguntar a la oficina",
      ask: `Esta guía explica el procedimiento general; no sustituye la resolución de tu expediente ni la atención de la administración. Si tu caso no encaja (cambio de situación, menores, protección internacional, documento caducado), pregunta antes de pagar o reservar: a la Oficina de Extranjería por el ${questions} o el teléfono 935 201 410, y a la Policía, en la propia cita o en la comisaría. El estado de los expedientes se consulta en la ${eOffice}.`,
      faqH: "Preguntas frecuentes",
      faq: [
        { question: "¿El NIE y la TIE son lo mismo?", answer: "No. El NIE es el número de identidad de extranjero; la TIE es la tarjeta que acredita la residencia de los no comunitarios y lleva impreso el NIE. Puedes tener NIE sin TIE (por ejemplo, si eres de la UE o no resides aquí)." },
        { question: "Soy ciudadano de la UE: ¿necesito la TIE?", answer: "No. Si te quedas más de tres meses, pides el certificado de registro de ciudadano de la UE (EX-18), que lleva el NIE y cuesta 12 €. Si estás menos de tres meses, basta el pasaporte o el documento de identidad." },
        { question: "¿Cuánto cuesta el NIE?", answer: "9,84 € de tasa 790-012. El certificado de la UE cuesta 12 € y la primera TIE, 16,08 € (Orden PJC/617/2025, importes vigentes el 13 de noviembre de 2026)." },
        { question: "¿Puedo pedir el NIE desde fuera de España?", answer: "Sí. El reglamento dice que, si no estás en España, el NIE se pide a través de los consulados de España." },
        { question: "¿Cuánto tarda?", answer: "El NIE debe resolverse en cinco días como máximo y el certificado de la UE se expide de forma inmediata. Para la TIE hay dos citas (huellas y recogida); la norma no fija cuánto tarda la tarjeta." },
        { question: "¿Necesito estar empadronado para pedir el NIE o la TIE?", answer: "Las fichas de la Policía no incluyen el padrón entre los documentos. Empadronarte es igualmente obligatorio si vives aquí y te hará falta para la tarjeta sanitaria." },
        { question: "He perdido la TIE. ¿Qué hago?", answer: "Pides una tarjeta nueva en la Policía, con cita. No cuenta como renovación y dura lo que le quedaba a la anterior (Reglamento de Extranjería, art. 209)." },
        { question: "Mi pareja no es de la UE. ¿Qué documento necesita?", answer: "La tarjeta de residencia de familiar de ciudadano de la Unión (EX-19, 12 €), que se pide en la Oficina de Extranjería en los tres primeros meses. En Barcelona, la cita se pide por correo electrónico a citabarcelona@correo.gob.es." },
        { question: "¿Puedo ir a una comisaría de otra provincia?", answer: "La norma dice que el certificado de la UE se pide en la provincia donde quieres vivir, y que la TIE la entrega la comisaría donde se ha tramitado el expediente. Pide cita en tu provincia." },
      ],
      official: `${rd1155} (arts. 205 y 209), ${rd240} (arts. 7, 8 y 10), ${order}, fichas y tasas de la Policía Nacional, la ${offices}, la ${note} y la ${cita}. Las hojas informativas del Ministerio de Inclusión no se pudieron consultar el 13 de noviembre de 2026.`,
    },
    en: {
      lead: `**The NIE is a number; the TIE is a card; and EU citizens who live here do not get a TIE but a registration certificate that already carries the NIE.** If you are from outside the EU and hold a visa or residence permit for more than six months, you must apply for the **TIE** (form EX-17) within one month. If you are an EU citizen staying longer than three months, you apply for the **registration certificate** (EX-18) within your first three months. If you only need the number to buy a flat or deal with an inheritance, you apply for the **NIE** (EX-15). All of this is done at the National Police, with a **cita previa** (appointment) booked on the government e-office, and paid with the **fee form 790, code 012**: €9.84 for the NIE, €12 for the EU certificate, €16.08 for a first TIE.`,
      factsTitle: "NIE, TIE and the EU certificate in six answers",
      facts: [
        { label: "NIE", value: "Your personal, unique foreigner's number; it appears on all your documents. Form EX-15, €9.84" },
        { label: "TIE", value: "Card for non-EU nationals with a permit of more than six months. EX-17, €16.08 for the first one" },
        { label: "EU citizens", value: "Registration certificate with your NIE if you stay more than three months. EX-18, €12" },
        { label: "Where", value: "National Police stations, always by appointment" },
        { label: "Deadline", value: "TIE: one month from arrival or the grant. EU certificate: three months from arrival" },
        { label: "Fee", value: "Form 790 code 012, generated on the Police website and paid at a bank" },
      ],
      whichH: "NIE, TIE or EU certificate: which one you need",
      whichIntro: [
        `The **NIE** (número de identidad de extranjero, foreigner's identity number) is only a number. The law calls it "personal, unique and exclusive" and says it must appear on every document issued to you: it is the same number that later shows on your TIE or certificate. The **TIE** (tarjeta de identidad de extranjero, foreigner's identity card) is the physical document proving legal residence for people from outside the EU. EU, European Economic Area and Swiss citizens do not get one: they register in the Central Register of Foreigners and receive a **registration certificate** with their NIE.`,
      ],
      whichCaption: "Which procedure applies to you",
      whichHead: ["Your situation", "What you apply for", "Form", "790-012 fee", "Where"],
      whichRows: [
        ["EU, EEA or Swiss citizen who will live in Catalonia for more than three months (work, study, own means)", "EU citizen registration certificate, with your NIE", "EX-18", "€12", "Police, by appointment"],
        ["EU citizen who will not live here but needs the number (property, inheritance, taxes)", "NIE", "EX-15", "€9.84", "Police, by appointment, or the consulate if you are abroad"],
        ["Non-EU national with a visa, residence or stay permit for more than six months (study, work, non-lucrative residence)", "TIE, with fingerprints", "EX-17", "€16.08 for the first card", "Police, by appointment"],
        ["Non-EU national renewing a permit or changing status", "New TIE", "EX-17", "€19.30; long-term residence €21.87", "Police, by appointment"],
        ["Non-EU national not resident here, with economic or professional interests in Spain", "NIE (you must not be in Spain irregularly)", "EX-15", "€9.84", "Police, by appointment, or the consulate"],
        ["Non-EU family member of an EU citizen who lives here", "Residence card for a family member of an EU citizen", "EX-19", "€12", "Immigration Office, by appointment"],
        ["Non-EU family member of a Spanish national", "Residence permit for relatives of Spaniards, then the TIE", "EX-24", "€12 for the TIE", "Immigration Office, by appointment"],
        ["British citizen resident before Brexit (Withdrawal Agreement)", "Withdrawal Agreement TIE; renewals at the Police", "Depends on the case", "€12", "Immigration Office or Police"],
      ],
      whichNote: "Sources: Royal Decree 1155/2024 (arts. 205 and 209), Royal Decree 240/2007 (arts. 7 and 8), Order PJC/617/2025 and National Police procedure pages, read on 13 November 2026.",
      lawH: "What the 2025 immigration regulation says",
      law: [
        `${rd1155}, in force since **20 May 2025**, is the regulation that governs the NIE and the TIE (in Spanish). Article 205 says the Police assign the NIE automatically when a residence procedure starts, and that anyone who needs it for economic, professional or social reasons must apply in person, give the reason and not be in Spain irregularly. The Police have **five days** to decide; if they do not answer, the application counts as **refused**. From abroad, you apply for the NIE through a Spanish consulate.`,
        `Article 209 requires everyone with a visa or permit to stay **more than six months** to hold a TIE, and to apply **in person within one month** of entering Spain or of the permit being granted or taking effect. The card is valid for as long as the permit. If you lose it or it is damaged, you get a new card that does not count as a renewal and lasts for whatever time the old one had left. It is handed over at the police station that handled your file, once you prove you are the holder and have paid the fee.`,
        `For EU citizens, ${rd240} (article 7, in Spanish) requires you to register **within three months** of arrival, in person, in the province where you live. The certificate is issued **on the spot** and shows your name, nationality, address, NIE and the date. You must show that you work, study, or have sufficient resources and health insurance; the decree says no fixed amount of resources can be set, as it depends on each case. After five continuous years of legal residence you can ask for the permanent residence certificate.`,
      ],
      howH: "Step by step, from the form to the card",
      stepsTitle: "How it works in Catalonia",
      steps: [
        { title: "1. Pick the procedure", text: "Check the table above: NIE (EX-15), EU certificate (EX-18) or TIE (EX-17). If you have a favourable residence decision, read it: it says what to do next." },
        { title: "2. Fill in the form", text: `You will find it linked from the Police ${polNie}, ${polEu} or ${polTie} (in Spanish). Bring it signed.` },
        { title: "3. Generate and pay the 790-012 fee", text: `Fill in the ${fee}, print it and pay at a bank: the Police say you do not need an account there. Keep the receipt.` },
        { title: "4. Book the appointment", text: `On the ${cita} (cita previa): choose the province where you live and the Police procedure. Barcelona police stations handle these procedures by appointment only.` },
        { title: "5. Go with all your documents", text: "The form, the fee receipt, your valid passport or national ID card and whatever your case needs (for the EU certificate, your employment contract, enrolment, or proof of means and health insurance)." },
        { title: "6. Certificate or fingerprints", text: "The EU certificate is issued at the appointment; a NIE must be decided within five days. For the TIE, your fingerprints are taken at the appointment and you come back to collect the card, again by appointment." },
      ],
      citaH: "How the appointment system works",
      cita: [
        `Police appointments are booked on the ${cita} run by the Ministry of Territorial Policy: one system for all of Spain, but the Police procedures belong to the Ministry of the Interior. The ${note} (in Spanish) is explicit: the Immigration Office "does not intervene" in Police appointments. For the NIE, the EU certificate, TIE fingerprints, TIE collection and duplicates, the appointment is at the police station.`,
        `Appointments are scarce and we cannot promise you a slot. What the Barcelona office does say is to book "only if you already have complete documents", and that appointments for the office's own procedures are given only to the person named on the application.`,
        `**If your procedure is at the Barcelona Immigration Office** (EU family member card EX-19, residence for relatives of Spaniards EX-24, arraigo EX-10, or Withdrawal Agreement residence), you do not book on the e-office: you email **citabarcelona@correo.gob.es** with the subject "PETICIÓN CITA PREVIA" and, in the body, your passport or NIE number, full name, mobile, email, the type of application and how many you will file. No attachments: emails with files are not processed.`,
      ],
      feesH: "What it costs: fee 790 code 012",
      feesCaption: "790-012 fees for Police procedures",
      feesHead: ["Procedure", "Fee"],
      feesRows: [
        ["NIE assigned at your request", "€9.84"],
        ["EU citizen registration certificate, EU family member residence card or Withdrawal Agreement (Brexit) TIE", "€12.00"],
        ["TIE for relatives of Spanish nationals", "€12.00"],
        ["TIE for a first temporary residence, stay or cross-border worker permit", "€16.08"],
        ["TIE for a renewed temporary residence or extended stay", "€19.30"],
        ["TIE for long-term or EU long-term residence", "€21.87"],
        ["Certificates or reports at your request", "€7.31"],
      ],
      feesNote: "Order PJC/617/2025 (BOE, 16 June 2025) and the National Police fee table, read on 13 November 2026. Amounts can rise at the start of each year.",
      fees: [
        `These are the amounts in ${order} (in Spanish), and the ${polFees} showed the same figures on 13 November 2026. The order says they rise at the start of each year with the budget law. The Police form fills in the amount when you pick the procedure: pay what it shows.`,
      ],
      officesH: "Offices in the four provinces",
      officesCaption: "Where to get the NIE, TIE and EU certificate in Catalonia",
      officesHead: ["Province", "Office", "Address", "For"],
      officesRows: [
        ["Barcelona", "National Police: Provincial Immigration and Borders Brigade", "C/ Mallorca, 213 (corner of Enric Granados); Rambla Guipúscoa, 74; Passeig de Sant Joan, 189; C/ Guadalajara, 1-3", "NIE, EU certificate, TIE fingerprints and collection, by appointment"],
        ["Barcelona", "Immigration Office (Government Sub-delegation)", "Passeig de Sant Joan, 189-193 (08037) and C/ Murcia, 42 (08027). Tel. 935 201 410", "Residence permits and EU family member cards; it does not issue NIEs or TIEs"],
        ["Girona", "National Police: Provincial Immigration and Borders Brigade", "C/ Cristòfol Grober, 12; EU regime, C/ Rajolers, 7. Units in Puigcerdà, La Jonquera, Portbou and Camprodon", "NIE, TIE and EU certificate, by appointment"],
        ["Girona", "Immigration Office", "Avinguda de Jaume I, 17 (17001). Tel. 972 069 140", "Residence permits"],
        ["Lleida", "National Police: Provincial Immigration and Borders Brigade", "C/ Jaume II; EU regime, Av. Prat de la Riba, 36. Les (Val d'Aran) unit: Av. Sant Jaume, 58", "NIE, TIE and EU certificate, by appointment"],
        ["Lleida", "Immigration Office (Government Sub-delegation)", "Plaça de la Pau, 1 (25007). Tel. 973 959 213", "Residence permits and EU family member cards"],
        ["Tarragona", "Provincial police station (Tarragonès, Alt Camp, Baix Penedès, Conca de Barberà)", "Plaça d'Orleans, s/n (43005)", "NIE, TIE and EU certificate"],
        ["Tarragona", "Reus police station (Baix Camp, Priorat, Ribera d'Ebre)", "C/ General Moragues, 54 (43203)", "NIE, TIE and EU certificate"],
        ["Tarragona", "Tortosa police station (Baix Ebre, Montsià, Terra Alta)", "Passeig de Ribera, 21 (43500) according to the Government Delegation; the Police locator gives Passeig Joan Moreira, 3", "NIE, TIE and EU certificate"],
        ["Tarragona", "Immigration Office", "Avinguda d'Estanislau Figueras, 59 (43002). Tel. 977 999 149", "Residence permits and first EU family member cards"],
      ],
      officesNote: "Sources: Government Delegation in Catalonia (immigration offices and Tarragona police stations) and the National Police office locator, read on 13 November 2026. The address that counts is the one on your appointment receipt.",
      officesAfter: [
        `The **Immigration Office** (Oficina de Extranjería) and the **Police** do different things. The Office (Government Sub-delegation) handles residence permits and the EU family member card; the NIE, the EU certificate and issuing and collecting the TIE are done at the Police, according to the ${offices} (in Spanish). The Police addresses come from the ${locator}; when you book, the system gives you a specific office, and that is the one on your receipt.`,
      ],
      timeH: "Deadlines and timings",
      timeCaption: "How long you have and how long it takes",
      timeHead: ["Procedure", "Time", "Source"],
      timeRows: [
        ["Applying for the TIE", "One month from entering Spain or from the permit being granted or taking effect", "Immigration regulation, art. 209"],
        ["Registering as an EU citizen", "Three months from arrival; the certificate is issued on the spot", "Royal Decree 240/2007, art. 7"],
        ["Answer on a NIE", "Five days at most; no answer means refused", "Immigration regulation, art. 205"],
        ["EU family member card", "Apply within three months; receipt at once, card within three months; valid five years", "Royal Decree 240/2007, art. 8"],
        ["Permanent residence (EU)", "After five continuous years of legal residence", "Royal Decree 240/2007, art. 10"],
      ],
      timeNote: "The rules set no time for the TIE to be ready and no waiting time for appointments.",
      mistakesH: "Common mistakes",
      mistakes: [
        "**Applying for a TIE as an EU citizen.** EU, EEA and Swiss citizens get the registration certificate (EX-18); the TIE is for non-EU nationals, including non-EU family members of an EU citizen.",
        "**Thinking the NIE changes or expires when you renew.** The number is personal and unique and appears on all your documents; what expires is the card or document that carries it.",
        "**Missing the one-month TIE deadline.** The regulation gives one month from arrival or from the permit taking effect. Meeting it is your duty even when appointments are tight: book straight away.",
        "**Going to another province because it has slots.** The rules say the EU certificate is requested in the province where you want to live, and the TIE is issued by the police station that handled your file.",
        "**Booking without your papers ready.** The Barcelona office asks you to book only with complete documents: without the fee receipt or the signed form, you will be sent back.",
        "**Paying the wrong fee.** Police procedures are paid with form 790 code 012; generate it on the Police website by choosing your procedure.",
      ],
      linksH: "How it fits with the padró and the health card",
      links: [
        `**Padró.** You do not need a NIE to register on the padró: a passport is enough or, for EU citizens, the national ID card. The whole process is in our ${padro}. The Police pages for the NIE, the TIE and the EU certificate do not list the padró among the documents (13 November 2026), but you will need it anyway for the health card and other paperwork.`,
        `**Health card.** CatSalut accepts a DNI, NIE or passport as ID and requires you to be on the padró. If you are an EU citizen who does not work here, you go through the INSS first. It is all in our ${tsi}.`,
      ],
      askTitle: "When to ask the office",
      ask: `This guide explains the general procedure; it does not replace the decision on your own file or advice from the administration. If your case does not fit (change of status, minors, international protection, expired passport), ask before paying or booking: the Immigration Office through its ${questions} or on 935 201 410, and the Police at your appointment or at the station. You can check the status of a file on the ${eOffice}.`,
      faqH: "Frequently asked questions",
      faq: [
        { question: "Are the NIE and the TIE the same thing?", answer: "No. The NIE is your foreigner's identity number; the TIE is the card that proves residence for non-EU nationals, and it has the NIE printed on it. You can have a NIE without a TIE (for example as an EU citizen, or if you do not live here)." },
        { question: "I am an EU citizen. Do I need a TIE?", answer: "No. If you stay more than three months you apply for the EU citizen registration certificate (EX-18), which carries your NIE and costs €12. For less than three months your passport or ID card is enough." },
        { question: "How much does the NIE cost?", answer: "€9.84 with fee form 790-012. The EU certificate costs €12 and a first TIE €16.08 (Order PJC/617/2025, amounts in force on 13 November 2026)." },
        { question: "Can I apply for a NIE from outside Spain?", answer: "Yes. The regulation says that if you are not in Spain you apply for the NIE through a Spanish consulate." },
        { question: "How long does it take?", answer: "A NIE must be decided within five days and the EU certificate is issued on the spot. The TIE takes two appointments (fingerprints and collection); the rules set no time for the card to be ready." },
        { question: "Do I need to be on the padró to apply for a NIE or TIE?", answer: "The Police pages do not list the padró among the documents. Registering is still compulsory if you live here, and you will need it for the health card." },
        { question: "I lost my TIE. What now?", answer: "Apply for a new card at the Police, by appointment. It does not count as a renewal and lasts for the time the old one had left (immigration regulation, art. 209)." },
        { question: "My partner is not an EU citizen. Which document do they need?", answer: "The residence card for a family member of an EU citizen (EX-19, €12), requested at the Immigration Office within the first three months. In Barcelona, the appointment is requested by email to citabarcelona@correo.gob.es." },
        { question: "Can I go to a police station in another province?", answer: "The rules say the EU certificate is requested in the province where you want to live, and the TIE is issued by the police station that handled your file. Book in your own province." },
      ],
      official: `${rd1155} (arts. 205 and 209), ${rd240} (arts. 7, 8 and 10), ${order}, National Police procedure and fee pages, the ${offices}, the ${note} and the ${cita}. The Ministry of Inclusion's information sheets could not be read on 13 November 2026.`,
    },
  }[L];

  return [
    lead(t.lead),
    keyFacts(t.factsTitle, t.facts),
    ...h2(t.whichH, ...t.whichIntro),
    table(t.whichCaption, t.whichHead, t.whichRows, t.whichNote),
    ...h2(t.lawH, ...t.law),
    { type: "heading", level: 2, text: t.howH } as Block,
    steps(t.stepsTitle, t.steps),
    ...h2(t.citaH, ...t.cita),
    ...h2(t.feesH),
    table(t.feesCaption, t.feesHead, t.feesRows, t.feesNote),
    ...paras(...t.fees),
    ...h2(t.officesH),
    table(t.officesCaption, t.officesHead, t.officesRows, t.officesNote),
    ...paras(...t.officesAfter),
    ...h2(t.timeH),
    table(t.timeCaption, t.timeHead, t.timeRows, t.timeNote),
    ...h2(t.mistakesH),
    list(...t.mistakes),
    ...h2(t.linksH, ...t.links),
    callout("tip", t.askTitle, t.ask),
    { type: "heading", level: 2, text: t.faqH } as Block,
    faq(t.faq),
    callout("official", verifiedLine(L, NIE_TIE_AS_OF), t.official),
    ...b2Related(["padro", "tsi", "barcelonaHub", "foreignVote"], L, [netSalaryRelatedItem(L)]),
  ];
}

export const NIE_TIE_GUIDE: B2Article = {
  key: "nieTie",
  entryKey: "guide-nie-tie-barcelona-catalonia",
  categoryKey: "public-services",
  sources: SOURCES,
  heroKey: "barcelona-hub-passeig-gracia",
  heroAlt: {
    ca: "Passeig de Gràcia, a l'Eixample de Barcelona, amb la Casa Milà al fons",
    es: "Paseo de Gràcia, en el Eixample de Barcelona, con la Casa Milà al fondo",
    en: "Passeig de Gràcia in Barcelona's Eixample, with Casa Milà in the distance",
  },
  heroCaption: {
    ca: "El passeig de Gràcia, a l'Eixample de Barcelona.",
    es: "El paseo de Gràcia, en el Eixample de Barcelona.",
    en: "Passeig de Gràcia, in Barcelona's Eixample district.",
  },
  verifiedAt: NIE_TIE_AS_OF,
  publishedAt: "2026-11-13T20:00:00+01:00",
  editions: Object.fromEntries(
    LOCALES.map((locale) => [locale, { path: B2_PATHS.nieTie[locale], ...NIE_TIE_META[locale], blocks: buildNieTieBody(locale) }]),
  ) as B2Article["editions"],
};
