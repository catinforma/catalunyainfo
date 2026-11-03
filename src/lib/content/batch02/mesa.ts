import type { Locale } from "@/lib/i18n/config";

import {
  b2Related,
  callout,
  faq,
  h2,
  keyFacts,
  lead,
  list,
  table,
  verifiedLine,
  type B2Article,
  type B2Source,
} from "./shared";

/**
 * Polling-station duty: if you have been drawn, what to do, the pay, the
 * excuses, the penalty and time off work — for voters too.
 *
 * Every statement is from the LOREG, RD 806/2026, RD 605/1999, Orden
 * INT/650/2026, JEC Instrucción 6/2011 (as amended to 2025), the IRPF
 * regulation, Interior and the INE, checked on 12 Oct 2026
 * (research_notes/blog-batch-03/mesa_electoral.md). Re-checked on 24 Oct
 * 2026: Orden INT/650/2026 (75 EUR, paid in full per polling day, silent on
 * when or how), Instrucción 6/2011 causes, Interior's "Permisos y dietas"
 * page (substitutes paid only if they sit; full day off and five hours the
 * next day) and the JEC calendar (draw 31 Oct to 4 Nov, 72-hour notice).
 *
 * ca/es titles are frozen until 14 Nov (docs/SEO_EXPERIMENTS.md, 17 Oct):
 * only the body changes there.
 *
 * 28 Oct 2026 (body only, logged in docs/SEO_EXPERIMENTS.md): the lead and a
 * section of their own now answer "how much" and "when is it paid" in the
 * words people search. Re-read that day: Orden INT/650/2026 (75 EUR; its
 * first additional provision applies it to every election held after 27 Jun
 * 2026, so to 29N); the official 29N manual for mesa members ("Dieta de
 * 75 €"), approved by the Council of Ministers on 27 Oct after the JEC's
 * favourable opinion of 22 Oct (Acuerdo 295/2026); Interior's "Permisos y
 * dietas" page and mesa FAQ; RD 605/1999; LOREG arts. 26, 27, 28 and 143.
 * None of them says when or how the dieta is paid, so the page says exactly
 * that. JEC Acuerdos 243, 272, 273, 299 and 300/2026: a Junta Electoral de
 * Zona can authorise a town hall to hold the draw earlier.
 *
 * The 29N dates are the latest possible ones from Interior's calendar; each
 * person's own deadline runs from their own notification, and the copy says
 * so. Not printed: a euro figure for the day-fine, when or how the dieta is
 * paid, the Catalan voter-leave tiers for 29N (the order is not out; the 2023
 * one is cited as such) and any "check if you were drawn" service, because
 * none exists. After 29N the dated section must move to the May 2027
 * municipal elections once their decree is in the BOE.
 *
 * 30 Oct 2026 (CTR sweep; owner lifted the 14 Nov freeze): ca/es titles add
 * "sorteig/sorteo" and all three descriptions lead with the draw window, the
 * 3-day notification and the 7 days to object, re-read that day in the JEC
 * 29N calendar ("Sorteo ... 31 de octubre a 4 de noviembre"; "Notificación
 * ... Plazo de 3 días a partir del sorteo"; "Plazo para alegar de 7 días
 * desde la notificación"). The draw starts tomorrow.
 *
 * 3 Nov 2026 (owner's "right now" push, titles changed, logged in
 * docs/SEO_EXPERIMENTS.md): the draw ends tomorrow and notifications run to
 * 7 Nov, so a key-facts block under the lead answers today's questions (have
 * I been drawn, what now, excuse deadline and where, pay, time off, penalty)
 * before the pay sections. Re-read that day: LOREG arts. 26, 27, 28 and 143
 * (BOE consolidated text, open-data API); the JEC 29N calendar PDF (draw
 * 31 Oct-4 Nov, notice "Plazo de 3 días a partir del sorteo", "Plazo para
 * alegar de 7 días desde la notificación", 5 days to decide, 72 hours, "Hasta
 * antes de las 8:00 horas del día de votación"); Interior's 29N pages
 * "Información general sobre las Mesas" ("entre el 31 de octubre y el 7 de
 * noviembre, aunque si se produce más tarde, el retraso no será causa
 * invalidante"), "Impedimentos y excusas" (over-65 renunciation in 7 days;
 * "Si dispone del sistema cl@ve, puede presentar aquí su excusa", linking
 * mesaselectorales.es/web-excusas-form), "Permisos y dietas" ("cobrarán una
 * dieta de 75 €"; night shift) and "Seguridad Social"; Interior's guide note
 * updated 3 Nov (the JEC "ha habilitado una plataforma para la presentación
 * de excusas", same link); JEC Instrucción 2/2023 (BOE-A-2023-9416: excuses
 * on paper or through Interior's application); Orden INT/650/2026 (75,00 EUR,
 * preamble "aun mayoritarios ... en efectivo"); Instrucción 6/2011
 * consolidated; the 29N manual ("Dieta de 75 €"). Still nothing official on
 * when or how the dieta is paid, and the DOGC voter-leave order for 29N is
 * not out (DOGC search API, issue 9786 of 3 Nov).
 */

const VERIFIED = "2026-11-03";

const EXCUSE_APP = "https://www.mesaselectorales.es/web-excusas-form/#/login";

const SOURCES: B2Source[] = [
  { name: "Ley Orgánica 5/1985, del Régimen Electoral General (texto consolidado)", url: "https://www.boe.es/buscar/act.php?id=BOE-A-1985-11672", publisher: "BOE" },
  { name: "Real Decreto 806/2026, de convocatoria de elecciones generales", url: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20742", publisher: "BOE" },
  { name: "Orden INT/650/2026, dieta de los miembros de las mesas electorales", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2026-13948", publisher: "BOE" },
  { name: "Manual de instrucciones para las personas que integran las Mesas electorales, elecciones a Cortes Generales 2026", url: "https://29neleccionesgenerales.es/pdf/miembros_mesas/MMM_G2026_castellano_para_web.pdf", publisher: "Ministerio del Interior" },
  { name: "Referencia del Consejo de Ministros de 27 de octubre de 2026 (aprobación del manual de las mesas del 29N)", url: "https://www.lamoncloa.gob.es/consejodeministros/referencias/Paginas/2026/20261027-referencia-rueda-de-prensa-ministros.aspx", publisher: "La Moncloa" },
  { name: "Acuerdo 300/2026 de la Junta Electoral Central (adelanto del sorteo de las mesas)", url: "https://www.juntaelectoralcentral.es/cs/jec/doctrina/acuerdos?anyosesion=2026&idacuerdoinstruccion=154736&idsesion=1117&template=Doctrina%2FJEC_Detalle", publisher: "Junta Electoral Central" },
  { name: "Instrucción 6/2011 de la Junta Electoral Central, sobre excusas de miembros de mesa (consolidada)", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2011-7705", publisher: "BOE" },
  { name: "Real Decreto 605/1999, de regulación complementaria de los procesos electorales", url: "https://www.boe.es/buscar/act.php?id=BOE-A-1999-8583", publisher: "BOE" },
  { name: "Calendario electoral, elecciones generales 2026", url: "https://www.juntaelectoralcentral.es/cs/jec/documentos/eg2026_calendario.pdf", publisher: "Junta Electoral Central" },
  { name: "Miembros de mesa: permisos y dietas", url: "https://infoelectoral.interior.gob.es/es/proceso-electoral/miembros-de-mesa/informacion-general/permisos-y-dietas/", publisher: "Ministerio del Interior" },
  { name: "Calendario electoral, elecciones a Cortes Generales 29-N", url: "https://infoelectoral.interior.gob.es/export/sites/default/pdf/procesos_electorales/Elecciones-Generales-29-N/Calendario-mural-elecciones-Cortes-Generales-2026.pdf", publisher: "Ministerio del Interior" },
  { name: "Preguntas frecuentes: las mesas electorales", url: "https://infoelectoral.interior.gob.es/es/proceso-electoral/preguntas-frecuentes/las-mesas-electorales/", publisher: "Ministerio del Interior" },
  { name: "Consulta de mesas y locales electorales", url: "https://sede.ine.gob.es/tramite/consulta_mesas_locales/", publisher: "INE" },
  { name: "Reglamento del IRPF, artículo 9", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2007-6820", publisher: "BOE" },
  { name: "Información general sobre las Mesas electorales, elecciones del 29 de noviembre (notificación entre el 31 de octubre y el 7 de noviembre)", url: "https://29neleccionesgenerales.es/informacion-mesas/informacion-general/informacion-general-sobre-las-mesas-electorales/", publisher: "Ministerio del Interior" },
  { name: "Recurso contra la designación: impedimentos y excusas (siete días, renuncia desde los 65 años, presentación con Cl@ve)", url: "https://29neleccionesgenerales.es/informacion-mesas/informacion-general/recurso-contra-la-designacion-impedimentos-y-excusas/", publisher: "Ministerio del Interior" },
  { name: "Permisos y dietas, elecciones del 29 de noviembre (dieta de 75 €, turno de noche)", url: "https://29neleccionesgenerales.es/informacion-mesas/informacion-general/permisos-y-dietas/", publisher: "Ministerio del Interior" },
  { name: "Instrucción 2/2023 de la Junta Electoral Central, sobre la presentación y gestión electrónica de las excusas de los miembros de las Mesas", url: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2023-9416", publisher: "BOE" },
  { name: "29N: guía básica sobre las elecciones generales y el proceso electoral (nota actualizada el 3 de noviembre de 2026; plataforma de excusas)", url: "https://www.lamoncloa.gob.es/serviciosdeprensa/notasprensa/interior/Paginas/guia-dudas-elecciones-generales-29n.aspx", publisher: "Ministerio del Interior" },
];

const META: Record<Locale, { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    path: "guies/membre-mesa-electoral",
    title: "Membre de mesa electoral: com saber si t'ha tocat, què fer, quant es cobra i com excusar-te",
    seoTitle: "Membre de mesa electoral 2026: si t'ha tocat, excusa i 75 €",
    seoDescription:
      "T'ho notifiquen fins al 7 de novembre; tens 7 dies per excusar-te a la Junta Electoral de Zona, també en línia. Dieta de 75 € i 5 h menys el dilluns 30.",
    excerpt:
      "Si t'ha tocat ser a la mesa el 29N: com ho saps, el termini per excusar-te i on, la dieta de 75 €, el permís a la feina i què passa si no hi vas, segons la LOREG.",
  },
  es: {
    path: "guias/miembro-mesa-electoral",
    title: "Mesa electoral: cómo saber si te ha tocado, qué hacer, cuánto se cobra y cómo excusarte",
    seoTitle: "Mesa electoral 2026: si te ha tocado, plazo de excusa y 75 €",
    seoDescription:
      "Notificación hasta el 7 de noviembre; luego, 7 días para excusarte ante la Junta Electoral de Zona, también en línea. Dieta de 75 € y 5 h menos el lunes.",
    excerpt:
      "Si te ha tocado mesa el 29N: cómo lo sabes, el plazo para excusarte y dónde, la dieta de 75 €, el permiso en el trabajo y qué pasa si no vas, según la LOREG.",
  },
  en: {
    path: "guides/polling-station-duty-spain",
    title: "Drawn for polling-station duty (mesa electoral) in Spain on 29 November: what to do, excuses and the €75 pay",
    seoTitle: "Polling-station duty in Spain (mesa electoral): €75, excuses",
    seoDescription:
      "Notified by 7 Nov? You have 7 days to ask the Junta Electoral de Zona to excuse you, online with Cl@ve too. €75 tax-free, 5 hours off on Monday 30 Nov.",
    excerpt:
      "Drawn to staff a polling table on 29 November: how you find out, the deadline and where to ask to be excused, the €75 allowance, time off work and the penalty for not turning up.",
  },
};

type T = {
  lead: string;
  /** Today's questions, answered under the lead (draw to 4 Nov, notices to 7 Nov). */
  nowTitle: string;
  now: { label: string; value: string }[];
  note: string;
  whoTitle: string;
  who: string[];
  datesTitle: string;
  datesCaption: string;
  datesHeaders: string[];
  datesRows: string[][];
  datesNote: string;
  excuseTitle: string;
  excuse: string[];
  excuseAuto: string[];
  excuseCase: string;
  lateTitle: string;
  late: string;
  penaltyTitle: string;
  penalty: string;
  payTitle: string;
  payCaption: string;
  payHeaders: string[];
  payRows: string[][];
  payNote: string;
  pay: string[];
  whenTitle: string;
  when: string[];
  workTitle: string;
  work: string[];
  dayTitle: string;
  dayCaption: string;
  dayHeaders: string[];
  dayRows: string[][];
  dayNote: string;
  checkTitle: string;
  check: string[];
  faq: { question: string; answer: string }[];
};

const COPY: Record<Locale, T> = {
  ca: {
    lead: "Si t'ha tocat ser a una mesa electoral el **29 de novembre del 2026**, només ho sabràs per la **notificació** de l'ajuntament: el sorteig acaba el **4 de novembre** i te l'han de lliurar en els tres dies següents, fins al **7 de novembre**. Des que la reps tens **7 dies** per presentar una excusa documentada a la **Junta Electoral de Zona**, en paper o en línia amb Cl@ve. Si hi vas, cobres **75 €** sense IRPF, la mateixa dieta per a qui presideix i per als vocals (Orden INT/650/2026). **Quan es cobra:** cap norma oficial no fixa el dia ni la forma de pagament; l'ordre només diu que aquests pagaments encara es fan majoritàriament en efectiu. Tens permís retribuït si aquell dia treballes i **cinc hores menys** de feina el dilluns 30, i no presentar-te sense causa és un delicte.",
    nowTitle: "Si t'ha tocat: el que has de saber avui",
    now: [
      { label: "Com sé si m'ha tocat?", value: "Només per la **notificació** personal de l'ajuntament, que porta el manual d'instruccions. Ha d'arribar en els tres dies següents al sorteig (del 31 d'octubre al 4 de novembre), és a dir, fins al **7 de novembre**; si arriba més tard, el nomenament continua sent vàlid. No hi ha cap llista pública ni consulta en línia." },
      { label: "Què he de fer quan la rebo?", value: "Si hi pots anar, res més: llegeix el manual i presenta't a les **8.00 del diumenge 29 de novembre** al local que diu la notificació. Si no hi pots anar, presenta l'excusa dins del termini." },
      { label: "Excusa: termini i on", value: `**7 dies des de la notificació** (com a molt tard el 14 de novembre si te la van lliurar el 7) a la **Junta Electoral de Zona** que surt a la notificació: en paper o en línia amb Cl@ve a la [plataforma d'excuses](${EXCUSE_APP}) que enllaça el Ministeri de l'Interior. A partir dels 65 anys pots renunciar en el mateix termini. La Junta respon en 5 dies.` },
      { label: "Quant es cobra i quan", value: "**75 €** per la jornada, sense IRPF (Orden INT/650/2026). Cap norma no fixa la data ni la forma de pagament: pregunta-ho a la Junta Electoral de Zona." },
      { label: "Permís a la feina", value: "Jornada sencera retribuïda si el 29 és laborable per a tu, i **cinc hores menys** de feina el **dilluns 30 de novembre** en tots els casos." },
      { label: "Si no hi vas", value: "És un **delicte** (article 143 de la LOREG): presó de tres mesos a un any o multa de sis a vint-i-quatre mesos. Si et surt un impediment, avisa la Junta almenys 72 hores abans de les 8.00 del dia de la votació o, si és més tard, immediatament." },
    ],
    note: "Els terminis de cada persona compten des del dia que li notifiquen el nomenament. Les dates d'aquesta pàgina són les últimes possibles segons el calendari oficial.",
    whoTitle: "Qui pot ser membre de mesa",
    who: [
      "L'Ajuntament fa un **sorteig públic** entre totes les persones del cens de cada mesa que siguin **menors de 70 anys i sàpiguen llegir i escriure**. Qui presideix ha de tenir el batxillerat o l'FP de segon grau, o si no el graduat escolar o equivalent. Per a cada lloc se sortegen **dos suplents**, així que surten nou persones per mesa.",
      "Els resultats del sorteig no es publiquen: només es notifiquen a les persones escollides, juntament amb un manual d'instruccions.",
    ],
    datesTitle: "Terminis per al 29 de novembre",
    datesCaption: "Formació de les meses, eleccions generals del 29N",
    datesHeaders: ["Pas", "Termini legal", "Data límit 29N"],
    datesRows: [
      ["Sorteig a l'Ajuntament", "Entre els dies 25 i 29 després de la convocatòria", "Del 31 d'octubre al 4 de novembre"],
      ["Notificació", "3 dies després del sorteig", "7 de novembre"],
      ["Presentar excusa a la Junta Electoral de Zona", "7 dies des de la teva notificació", "14 de novembre"],
      ["Resolució de la Junta", "5 dies", "19 de novembre"],
      ["Avisar d'un impediment sobrevingut", "72 hores abans de les 8.00 del dia de la votació", "Dijous 26 de novembre a les 8.00"],
    ],
    datesNote: "Calendari del Ministeri de l'Interior (convocatòria publicada el 6 d'octubre del 2026). Cada Ajuntament fa el sorteig un dia dins el període; la Junta Electoral de Zona li pot autoritzar avançar-lo.",
    excuseTitle: "Com excusar-te",
    excuse: [
      "Tens **7 dies des de la notificació** per presentar a la **Junta Electoral de Zona** una causa «justificada i documentada». La Junta respon en 5 dies, i si la denega ho ha de motivar. Contra la decisió no hi ha recurs electoral, només el contenciós administratiu. Les dades de contacte de la Junta surten a la notificació.",
      `**Com presentar-la:** en paper, a la Junta Electoral de Zona, o en línia si tens Cl@ve, a la [plataforma d'excuses](${EXCUSE_APP}) del Ministeri de l'Interior, que la Junta Electoral Central va habilitar amb la seva Instrucció 2/2023 i que enllaça el web oficial del 29N. En tots dos casos cal aportar el document que justifica la causa. Si tens 65 anys o més, pots renunciar al càrrec en aquests mateixos set dies. Només la Junta pot rellevar-te: fins que no accepta l'excusa, continues designat.`,
      "Segons la instrucció de la Junta Electoral Central, aquestes causes **s'accepten sempre** si les documentes:",
    ],
    excuseAuto: [
      "Tenir entre 65 i 69 anys.",
      "Tenir una discapacitat declarada, de qualsevol grau, o una pensió d'incapacitat permanent absoluta o de gran invalidesa.",
      "Estar de baixa mèdica.",
      "Estar embarassada de sis mesos o més, o estar en el permís per naixement o cura del menor.",
      "Tenir cura d'un nadó lactant, de menors de 12 anys o de persones amb discapacitat sota guarda legal, de manera directa i continuada.",
      "Tenir cura d'un familiar fins al segon grau que no es pot valer per si mateix.",
      "Haver estat membre de mesa almenys tres vegades en els últims deu anys, sempre que la mesa es pugui formar amb electors d'aquella mesa.",
      "Ser víctima amb una ordre d'allunyament d'algú que vota al mateix col·legi electoral.",
    ],
    excuseCase:
      "Altres causes es valoren cas per cas: una malaltia que ho faci especialment difícil, una operació inajornable, un esdeveniment familiar molt rellevant aquell dia, ser família monoparental amb fills menors de 14 anys, o feines de servei essencial aquell dia (sanitaris, bombers, protecció civil) amb informe del cap. **Treballar o estar de vacances no és una excusa automàtica.**",
    lateTitle: "Si et surt un impediment més tard",
    late: "Si després del termini de set dies passa alguna cosa que t'impedeix anar-hi, l'has de comunicar a la Junta Electoral de Zona **almenys 72 hores abans** de les 8.00 del dia de la votació, amb justificants. Si passa encara més tard, avisa **immediatament**, i sempre abans que es constitueixi la mesa.",
    penaltyTitle: "Què passa si no hi vas",
    penalty: "No presentar-te, abandonar el lloc sense causa legítima o no fer l'excusa o l'avís que demana la llei és un **delicte** (article 143 de la LOREG): presó de **tres mesos a un any o multa de sis a vint-i-quatre mesos**. També s'aplica als suplents.",
    payTitle: "Quant es cobra per ser a una mesa electoral el 2026",
    payCaption: "Dieta per ser a la mesa electoral el 29 de novembre",
    payHeaders: ["Lloc a la mesa", "Dieta"],
    payRows: [
      ["President o presidenta", "75 €"],
      ["Vocal (dos per mesa)", "75 €"],
      ["Suplent que acaba formant part de la mesa", "75 €"],
      ["Suplent que no ocupa cap lloc", "No cobra"],
    ],
    payNote: "Orden INT/650/2026 (BOE del 27 de juny del 2026), vigent des del 28 de juny i aplicable a les eleccions que se celebrin després, també el 29N. Es cobra sencera, duri el que duri la jornada.",
    pay: [
      "Cada membre titular cobra una dieta de **75 €** per jornada electoral, sigui quina sigui la durada, segons l'Orden INT/650/2026 (abans eren 70 €). El manual oficial de les meses del 29N, aprovat pel Consell de Ministres el 27 d'octubre, hi posa la mateixa xifra. Els suplents només la cobren si acaben formant part de la mesa. La dieta **no tributa a l'IRPF**.",
      "Si has de portar la documentació al jutjat en acabar, pots reclamar les despeses del desplaçament a la Delegació o Subdelegació del Govern.",
    ],
    whenTitle: "Quan es cobra per ser a una mesa electoral",
    when: [
      "**Què diuen les fonts oficials:** la dieta es guanya amb la jornada electoral. Els titulars que són a la mesa aquell dia la cobren sencera, duri el que duri, i els suplents només si acaben ocupant un lloc (Orden INT/650/2026, articles 2 i 3, i manual oficial del 29N).",
      "**Què no diuen:** ni l'ordre, ni el manual del 29N, ni la pàgina de permisos i dietes del Ministeri de l'Interior no fixen el dia ni la forma de pagament. L'única pista oficial és el preàmbul de l'ordre: aquests pagaments encara es fan, majoritàriament, en efectiu (consultat el 28 d'octubre del 2026).",
      "**Què has de fer:** si et toca, pregunta a la Junta Electoral de Zona (les dades de contacte surten a la notificació) o a l'Ajuntament com i quan es paga al teu municipi.",
    ],
    workTitle: "Permisos a la feina",
    work: [
      "**Membres de mesa:** si el dia de la votació és laborable per a tu, tens permís retribuït de jornada completa, i **en tots els casos** una reducció de **cinc hores** de la jornada l'endemà. Per al 29N, que és diumenge, això vol dir el **dilluns 30 de novembre**. Els suplents que acaben a la mesa tenen els mateixos drets. El justificant te'l dona la Junta Electoral de Zona.",
      "**Torn de nit:** segons el Ministeri de l'Interior, el torn de nit que comença el 29 de novembre compta com a jornada del dia electoral, i la reducció de cinc hores es pot fer al torn de nit següent si comença el dia 30. Has de complir a la mesa encara que hagis treballat la jornada anterior.",
      "**Votants que treballen aquell dia:** tenen dret a **fins a quatre hores retribuïdes** per anar a votar, proporcionals si fan jornada reduïda. A Catalunya la Generalitat fixa el detall per a cada elecció: el 2023 eren dues hores si l'horari coincidia més de dues i menys de quatre amb el de votació, i quatre si coincidia quatre o més, i l'empresa decidia en quin moment. L'ordre per al 29N encara no és al DOGC (consultat el 3 de novembre); la del 2023 (Ordre EMT/178/2023) va sortir el 7 de juliol, 16 dies abans de votar.",
      "**Seguretat Social:** titulars i suplents estan coberts aquell dia; qualsevol lesió, també anant-hi o tornant, es considera accident de treball.",
    ],
    dayTitle: "Com és el dia",
    dayCaption: "La jornada d'una mesa electoral, segons la LOREG",
    dayHeaders: ["Hora", "Què passa"],
    dayRows: [
      ["8.00", "Presidència, vocals i suplents es reuneixen al local. Si falta algú, el substitueix el seu suplent."],
      ["8.00-8.30", "Es constitueix la mesa i es reben les credencials dels interventors. Els suplents que no calen poden marxar."],
      ["9.00-20.00", "Votació sense interrupció. Si algú ha de sortir un moment, a la mesa n'hi han de quedar almenys dos."],
      ["20.00", "Es tanca la votació. Voten els qui ja eren dins, després els vots per correu, i finalment els membres de la mesa i els interventors."],
      ["Després", "Escrutini públic, acta penjada a la porta i documentació en tres sobres: dos al jutjat i un a Correus."],
    ],
    dayNote: "La llei no fixa hora d'acabar: la jornada acaba quan s'ha lliurat la documentació.",
    checkTitle: "On consultar-ho",
    check: [
      "**El teu col·legi i la teva mesa:** al servei de consulta de l'INE, sense identificar-te. Les targetes censals s'envien a partir del 2 de novembre.",
      "**Si t'ha tocat ser membre de mesa:** no hi ha cap consulta oficial en línia. Només ho saps per la notificació, que s'ha de fer entre el 31 d'octubre i el 7 de novembre; segons el Ministeri de l'Interior, si arriba més tard el nomenament no deixa de ser vàlid. Si tens dubtes, pregunta a l'Ajuntament o a la Junta Electoral de Zona.",
    ],
    faq: [
      { question: "Què he de fer si m'ha tocat ser membre de mesa?", answer: "Llegeix el manual que arriba amb la notificació i presenta't a les 8.00 del diumenge 29 de novembre al local que s'hi indica. Si no hi pots anar, tens set dies des de la notificació per presentar una excusa documentada a la Junta Electoral de Zona; a partir dels 65 anys, hi pots renunciar en el mateix termini." },
      { question: "Puc presentar l'excusa per internet?", answer: "Sí, si tens Cl@ve: a la plataforma d'excuses del Ministeri de l'Interior, que enllaça el web oficial del 29N i que la Junta Electoral Central va habilitar amb la Instrucció 2/2023. També la pots presentar en paper a la Junta Electoral de Zona. En tots dos casos, dins dels set dies des de la notificació i amb el document que justifica la causa." },
      { question: "Quant es cobra per ser a una mesa electoral el 2026?", answer: "75 € per la jornada del 29 de novembre, segons l'Orden INT/650/2026, que s'aplica a aquestes eleccions. Els suplents només la cobren si acaben a la mesa, i la dieta no tributa a l'IRPF." },
      { question: "Quan es cobra per ser a una mesa electoral el 2026?", answer: "La dieta es guanya el dia de la votació, però cap norma oficial no fixa quan ni com es paga: no ho diuen ni l'Orden INT/650/2026 ni el manual oficial del 29N. L'ordre només indica que aquests pagaments encara es fan majoritàriament en efectiu. Pregunta-ho a la Junta Electoral de Zona o a l'Ajuntament." },
      { question: "Quant et donen per anar a la mesa electoral?", answer: "Una dieta de 75 € per la jornada, permís retribuït si aquell dia treballes i cinc hores menys de feina l'endemà. Els suplents que no arriben a seure a la mesa no cobren." },
      { question: "Quant cobra el president d'una mesa electoral?", answer: "75 €, la mateixa dieta que cada vocal: l'Orden INT/650/2026 fixa una sola quantitat per a presidents i vocals." },
      { question: "Quan es fa el sorteig de les meses del 29N?", answer: "Entre el 31 d'octubre i el 4 de novembre del 2026. Cada Ajuntament tria el dia, i t'han de notificar el resultat en tres dies." },
      { question: "Fins quan em puc excusar?", answer: "Set dies des que et notifiquen el nomenament. Per al 29N, com a molt tard el 14 de novembre si el sorteig es fa el darrer dia." },
      { question: "Què passa si no em presento a la mesa?", answer: "És un delicte de l'article 143 de la LOREG: presó de tres mesos a un any o multa de sis a vint-i-quatre mesos." },
      { question: "Tinc festa l'endemà de fer de membre de mesa?", answer: "Tens dret a cinc hores menys de feina l'endemà, en tots els casos. Per al 29N, el dilluns 30 de novembre." },
      { question: "Com sé si m'ha tocat ser membre de mesa?", answer: "No hi ha cap consulta en línia: només ho saps per la notificació, que t'han de fer en els tres dies següents al sorteig (del 31 d'octubre al 4 de novembre). Si tens dubtes, pregunta a l'Ajuntament o a la Junta Electoral de Zona." },
      { question: "Quines excuses s'accepten per no anar a la mesa?", answer: "S'accepten sempre, si les documentes: tenir de 65 a 69 anys, una discapacitat declarada, estar de baixa, estar embarassada de sis mesos o més, cuidar un lactant, menors de 12 anys o un familiar dependent, o haver estat a la mesa tres vegades en deu anys. Treballar o ser de vacances no n'és cap d'automàtica." },
    ],
  },
  es: {
    lead: "Si te ha tocado mesa electoral para el **29 de noviembre de 2026**, solo lo sabrás por la **notificación** del ayuntamiento: el sorteo acaba el **4 de noviembre** y te la deben entregar en los tres días siguientes, hasta el **7 de noviembre**. Desde que la recibes tienes **7 días** para presentar una excusa documentada ante la **Junta Electoral de Zona**, en papel o en línea con Cl@ve. Si vas, cobras **75 €** sin IRPF, la misma dieta para el presidente y los vocales (Orden INT/650/2026). **Cuándo se cobra:** ninguna norma oficial fija el día ni la forma de pago; la orden solo dice que estos pagos aún se hacen mayoritariamente en efectivo. Tienes permiso retribuido si ese día trabajas y **cinco horas menos** de jornada el lunes 30, y no presentarte sin causa es un delito.",
    nowTitle: "Si te ha tocado: lo que tienes que saber hoy",
    now: [
      { label: "¿Cómo sé si me ha tocado?", value: "Solo por la **notificación** personal del ayuntamiento, que llega con el manual de instrucciones. Debe entregarse en los tres días siguientes al sorteo (del 31 de octubre al 4 de noviembre), es decir, hasta el **7 de noviembre**; si llega más tarde, el nombramiento sigue siendo válido. No hay ninguna lista pública ni consulta en línea." },
      { label: "¿Qué hago cuando la recibo?", value: "Si puedes ir, nada más: lee el manual y preséntate a las **8:00 del domingo 29 de noviembre** en el local que indica la notificación. Si no puedes, presenta la excusa dentro del plazo." },
      { label: "Excusa: plazo y dónde", value: `**7 días desde la notificación** (como muy tarde el 14 de noviembre si te la entregaron el 7) ante la **Junta Electoral de Zona** que figura en la notificación: en papel o en línea con Cl@ve en la [plataforma de excusas](${EXCUSE_APP}) que enlaza el Ministerio del Interior. A partir de los 65 años puedes renunciar en el mismo plazo. La Junta responde en 5 días.` },
      { label: "Cuánto se cobra y cuándo", value: "**75 €** por la jornada, sin IRPF (Orden INT/650/2026). Ninguna norma fija la fecha ni la forma de pago: pregúntalo a la Junta Electoral de Zona." },
      { label: "Permiso en el trabajo", value: "Jornada completa retribuida si el 29 es laborable para ti, y **cinco horas menos** de trabajo el **lunes 30 de noviembre** en todos los casos." },
      { label: "Si no vas", value: "Es un **delito** (artículo 143 de la LOREG): prisión de tres meses a un año o multa de seis a veinticuatro meses. Si te surge un impedimento, avisa a la Junta al menos 72 horas antes de las 8:00 del día de la votación o, si es más tarde, de inmediato." },
    ],
    note: "Los plazos de cada persona cuentan desde el día en que le notifican el nombramiento. Las fechas de esta página son las últimas posibles según el calendario oficial.",
    whoTitle: "Quién puede ser miembro de mesa",
    who: [
      "El Ayuntamiento hace un **sorteo público** entre todas las personas del censo de cada mesa que sean **menores de 70 años y sepan leer y escribir**. Quien preside debe tener el bachillerato o la FP de segundo grado, o si no el graduado escolar o equivalente. Para cada puesto se sortean **dos suplentes**, así que salen nueve personas por mesa.",
      "Los resultados del sorteo no se publican: solo se notifican a las personas elegidas, junto con un manual de instrucciones.",
    ],
    datesTitle: "Plazos para el 29 de noviembre",
    datesCaption: "Formación de las mesas, elecciones generales del 29N",
    datesHeaders: ["Paso", "Plazo legal", "Fecha límite 29N"],
    datesRows: [
      ["Sorteo en el Ayuntamiento", "Entre los días 25 y 29 tras la convocatoria", "Del 31 de octubre al 4 de noviembre"],
      ["Notificación", "3 días tras el sorteo", "7 de noviembre"],
      ["Presentar excusa a la Junta Electoral de Zona", "7 días desde tu notificación", "14 de noviembre"],
      ["Resolución de la Junta", "5 días", "19 de noviembre"],
      ["Avisar de un impedimento sobrevenido", "72 horas antes de las 8.00 del día de la votación", "Jueves 26 de noviembre a las 8.00"],
    ],
    datesNote: "Calendario del Ministerio del Interior (convocatoria publicada el 6 de octubre de 2026). Cada Ayuntamiento hace el sorteo un día dentro del periodo; la Junta Electoral de Zona puede autorizarle a adelantarlo.",
    excuseTitle: "Cómo excusarte",
    excuse: [
      "Tienes **7 días desde la notificación** para presentar a la **Junta Electoral de Zona** una causa «justificada y documentada». La Junta responde en 5 días, y si la deniega debe motivarlo. Contra la decisión no cabe recurso electoral, solo el contencioso-administrativo. Los datos de contacto de la Junta salen en la notificación.",
      `**Cómo presentarla:** en papel, ante la Junta Electoral de Zona, o en línea si tienes Cl@ve, en la [plataforma de excusas](${EXCUSE_APP}) del Ministerio del Interior, que la Junta Electoral Central habilitó con su Instrucción 2/2023 y que enlaza la web oficial del 29N. En los dos casos hay que aportar el documento que justifica la causa. Si tienes 65 años o más, puedes renunciar al cargo en esos mismos siete días. Solo la Junta puede relevarte: hasta que acepta la excusa, sigues designado.`,
      "Según la instrucción de la Junta Electoral Central, estas causas **se aceptan siempre** si las documentas:",
    ],
    excuseAuto: [
      "Tener entre 65 y 69 años.",
      "Tener una discapacidad declarada, de cualquier grado, o una pensión de incapacidad permanente absoluta o de gran invalidez.",
      "Estar de baja médica.",
      "Estar embarazada de seis meses o más, o estar en el permiso por nacimiento o cuidado del menor.",
      "Cuidar de un bebé lactante, de menores de 12 años o de personas con discapacidad bajo guarda legal, de forma directa y continua.",
      "Cuidar de un familiar hasta el segundo grado que no puede valerse por sí mismo.",
      "Haber sido miembro de mesa al menos tres veces en los últimos diez años, siempre que la mesa se pueda formar con electores de esa mesa.",
      "Ser víctima con una orden de alejamiento de alguien que vota en el mismo colegio electoral.",
    ],
    excuseCase:
      "Otras causas se valoran caso por caso: una enfermedad que lo haga especialmente difícil, una operación inaplazable, un acontecimiento familiar muy relevante ese día, ser familia monoparental con hijos menores de 14 años, o trabajos de servicio esencial ese día (sanitarios, bomberos, protección civil) con informe del jefe. **Trabajar o estar de vacaciones no es una excusa automática.**",
    lateTitle: "Si te surge un impedimento más tarde",
    late: "Si después del plazo de siete días ocurre algo que te impide ir, debes comunicarlo a la Junta Electoral de Zona **al menos 72 horas antes** de las 8.00 del día de la votación, con justificantes. Si ocurre aún más tarde, avisa **de inmediato**, y siempre antes de que se constituya la mesa.",
    penaltyTitle: "Qué pasa si no vas",
    penalty: "No presentarte, abandonar el puesto sin causa legítima o no hacer la excusa o el aviso que exige la ley es un **delito** (artículo 143 de la LOREG): prisión de **tres meses a un año o multa de seis a veinticuatro meses**. También se aplica a los suplentes.",
    payTitle: "Cuánto pagan por estar en una mesa electoral en 2026",
    payCaption: "Dieta por estar en la mesa electoral el 29 de noviembre",
    payHeaders: ["Puesto en la mesa", "Dieta"],
    payRows: [
      ["Presidente o presidenta", "75 €"],
      ["Vocal (dos por mesa)", "75 €"],
      ["Suplente que acaba formando parte de la mesa", "75 €"],
      ["Suplente que no ocupa ningún puesto", "No cobra"],
    ],
    payNote: "Orden INT/650/2026 (BOE del 27 de junio de 2026), en vigor desde el 28 de junio y aplicable a las elecciones que se celebren después, también el 29N. Se cobra entera, dure lo que dure la jornada.",
    pay: [
      "Cada miembro titular cobra una dieta de **75 €** por jornada electoral, sea cual sea la duración, según la Orden INT/650/2026 (antes eran 70 €). El manual oficial de las mesas del 29N, aprobado por el Consejo de Ministros el 27 de octubre, da la misma cifra. Los suplentes solo la cobran si acaban formando parte de la mesa. La dieta **no tributa en el IRPF**.",
      "Si tienes que llevar la documentación al juzgado al terminar, puedes reclamar los gastos del desplazamiento a la Delegación o Subdelegación del Gobierno.",
    ],
    whenTitle: "Cuándo se cobra por estar en una mesa electoral",
    when: [
      "**Lo que dicen las fuentes oficiales:** la dieta se gana con la jornada electoral. Los titulares que están en la mesa ese día la cobran entera, dure lo que dure, y los suplentes solo si acaban ocupando un puesto (Orden INT/650/2026, artículos 2 y 3, y manual oficial del 29N).",
      "**Lo que no dicen:** ni la orden, ni el manual del 29N, ni la página de permisos y dietas del Ministerio del Interior fijan el día ni la forma de pago. La única pista oficial es el preámbulo de la orden: estos pagos todavía se hacen, mayoritariamente, en efectivo (consultado el 28 de octubre de 2026).",
      "**Qué hacer:** si te toca, pregunta a la Junta Electoral de Zona (sus datos de contacto salen en la notificación) o al Ayuntamiento cómo y cuándo se paga en tu municipio.",
    ],
    workTitle: "Permisos en el trabajo",
    work: [
      "**Miembros de mesa:** si el día de la votación es laborable para ti, tienes permiso retribuido de jornada completa, y **en todos los casos** una reducción de **cinco horas** de la jornada al día siguiente. Para el 29N, que es domingo, eso significa el **lunes 30 de noviembre**. Los suplentes que acaban en la mesa tienen los mismos derechos. El justificante te lo da la Junta Electoral de Zona.",
      "**Turno de noche:** según el Ministerio del Interior, el turno de noche que empieza el 29 de noviembre cuenta como jornada del día electoral, y la reducción de cinco horas se puede aplicar al turno de noche siguiente si empieza el día 30. Debes cumplir en la mesa aunque hayas trabajado la jornada anterior.",
      "**Votantes que trabajan ese día:** tienen derecho a **hasta cuatro horas retribuidas** para ir a votar, proporcionales si hacen jornada reducida. En Cataluña la Generalitat fija el detalle para cada elección: en 2023 eran dos horas si el horario coincidía más de dos y menos de cuatro con el de votación, y cuatro si coincidía cuatro o más, y la empresa decidía en qué momento. La orden para el 29N aún no está en el DOGC (consultado el 3 de noviembre); la de 2023 (Ordre EMT/178/2023) salió el 7 de julio, 16 días antes de votar.",
      "**Seguridad Social:** titulares y suplentes están cubiertos ese día; cualquier lesión, también yendo o volviendo, se considera accidente de trabajo.",
    ],
    dayTitle: "Cómo es el día",
    dayCaption: "La jornada de una mesa electoral, según la LOREG",
    dayHeaders: ["Hora", "Qué pasa"],
    dayRows: [
      ["8.00", "Presidencia, vocales y suplentes se reúnen en el local. Si falta alguien, lo sustituye su suplente."],
      ["8.00-8.30", "Se constituye la mesa y se reciben las credenciales de los interventores. Los suplentes que no hacen falta pueden irse."],
      ["9.00-20.00", "Votación sin interrupción. Si alguien tiene que salir un momento, en la mesa deben quedar al menos dos."],
      ["20.00", "Se cierra la votación. Votan quienes ya estaban dentro, después los votos por correo, y finalmente los miembros de la mesa y los interventores."],
      ["Después", "Escrutinio público, acta colgada en la puerta y documentación en tres sobres: dos al juzgado y uno a Correos."],
    ],
    dayNote: "La ley no fija hora de terminar: la jornada acaba cuando se ha entregado la documentación.",
    checkTitle: "Dónde consultarlo",
    check: [
      "**Tu colegio y tu mesa:** en el servicio de consulta del INE, sin identificarte. Las tarjetas censales se envían a partir del 2 de noviembre.",
      "**Si te ha tocado ser miembro de mesa:** no hay ninguna consulta oficial en línea. Solo lo sabes por la notificación, que debe hacerse entre el 31 de octubre y el 7 de noviembre; según el Ministerio del Interior, si llega más tarde el nombramiento no deja de ser válido. Si tienes dudas, pregunta al Ayuntamiento o a la Junta Electoral de Zona.",
    ],
    faq: [
      { question: "¿Qué tengo que hacer si me ha tocado mesa electoral?", answer: "Lee el manual que llega con la notificación y preséntate a las 8:00 del domingo 29 de noviembre en el local que indica. Si no puedes ir, tienes siete días desde la notificación para presentar una excusa documentada ante la Junta Electoral de Zona; a partir de los 65 años, puedes renunciar en el mismo plazo." },
      { question: "¿Puedo presentar la excusa por internet?", answer: "Sí, si tienes Cl@ve: en la plataforma de excusas del Ministerio del Interior, que enlaza la web oficial del 29N y que la Junta Electoral Central habilitó con la Instrucción 2/2023. También puedes presentarla en papel ante la Junta Electoral de Zona. En los dos casos, dentro de los siete días desde la notificación y con el documento que justifica la causa." },
      { question: "¿Cuánto pagan por estar en una mesa electoral en 2026?", answer: "75 € por la jornada del 29 de noviembre, según la Orden INT/650/2026, que se aplica a estas elecciones. Los suplentes solo la cobran si acaban en la mesa, y la dieta no tributa en el IRPF." },
      { question: "¿Cuándo se cobra por estar en una mesa electoral en 2026?", answer: "La dieta se gana el día de la votación, pero ninguna norma oficial fija cuándo ni cómo se paga: no lo dicen ni la Orden INT/650/2026 ni el manual oficial del 29N. La orden solo indica que estos pagos aún se hacen mayoritariamente en efectivo. Pregúntalo a la Junta Electoral de Zona o al Ayuntamiento." },
      { question: "¿Cuánto te dan por ir a la mesa electoral?", answer: "Una dieta de 75 € por la jornada, permiso retribuido si ese día trabajas y cinco horas menos de trabajo al día siguiente. Los suplentes que no llegan a sentarse en la mesa no cobran." },
      { question: "¿Cuánto cobra un presidente de mesa electoral?", answer: "75 €, la misma dieta que cada vocal: la Orden INT/650/2026 fija una sola cantidad para presidentes y vocales." },
      { question: "¿Cuándo es el sorteo de las mesas del 29N?", answer: "Entre el 31 de octubre y el 4 de noviembre de 2026. Cada Ayuntamiento elige el día, y te deben notificar el resultado en tres días." },
      { question: "¿Hasta cuándo me puedo excusar?", answer: "Siete días desde que te notifican el nombramiento. Para el 29N, como muy tarde el 14 de noviembre si el sorteo se hace el último día." },
      { question: "¿Qué pasa si no me presento a la mesa?", answer: "Es un delito del artículo 143 de la LOREG: prisión de tres meses a un año o multa de seis a veinticuatro meses." },
      { question: "¿Tengo fiesta al día siguiente de ser miembro de mesa?", answer: "Tienes derecho a cinco horas menos de trabajo al día siguiente, en todos los casos. Para el 29N, el lunes 30 de noviembre." },
      { question: "¿Cómo sé si me ha tocado mesa electoral?", answer: "No hay ninguna consulta en línea: solo lo sabes por la notificación, que te deben hacer en los tres días siguientes al sorteo (del 31 de octubre al 4 de noviembre). Si tienes dudas, pregunta al Ayuntamiento o a la Junta Electoral de Zona." },
      { question: "¿Qué excusas se aceptan para no ir a la mesa electoral?", answer: "Se aceptan siempre, si las documentas: tener de 65 a 69 años, una discapacidad declarada, estar de baja, estar embarazada de seis meses o más, cuidar de un lactante, de menores de 12 años o de un familiar dependiente, o haber estado en la mesa tres veces en diez años. Trabajar o estar de vacaciones no es ninguna automática." },
    ],
  },
  en: {
    lead: "If you have been drawn to staff a Spanish polling-station table (**mesa electoral**) on **29 November 2026**, you only find out from the town hall's **notification**: the draw ends on **4 November** and the notice must reach you within three days, by **7 November**. From the day you receive it you have **7 days** to give the **Junta Electoral de Zona** (the local electoral board) a documented excuse, on paper or online with Cl@ve. If you sit, you are paid **€75** tax-free, the same allowance for the chair and the members (Orden INT/650/2026). **When it is paid:** no official rule sets the day or the method; the order only says these payments are still mostly made in cash. You get paid leave if that day is a working day for you and **five fewer hours** of work on Monday 30 November, and failing to turn up without a reason is a criminal offence.",
    nowTitle: "Drawn? What to know today",
    now: [
      { label: "How do I know if I have been drawn?", value: "Only from the town hall's personal **notification**, which comes with the instruction manual. It must be delivered within three days of the draw (31 October to 4 November), so by **7 November**; if it arrives later, the appointment is still valid. There is no public list and no online lookup." },
      { label: "What do I do once notified?", value: "If you can serve, nothing else: read the manual and be at the polling station named on the notice at **08:00 on Sunday 29 November**. If you cannot, file an excuse in time." },
      { label: "Excuse: deadline and where", value: `**7 days from the notification** (14 November at the latest if it reached you on the 7th), to the **Junta Electoral de Zona** named on the notice: on paper, or online with Cl@ve through the [excuse platform](${EXCUSE_APP}) the Interior Ministry links to. From age 65 you can simply decline within the same seven days. The board decides within 5 days.` },
      { label: "Pay, and when", value: "**€75** for the day, tax-free (Orden INT/650/2026). No rule sets the payment date or method: ask the Junta Electoral de Zona." },
      { label: "Time off work", value: "A full paid day if the 29th is a working day for you, and **five fewer hours** of work on **Monday 30 November** in every case." },
      { label: "If you don't turn up", value: "It is a **criminal offence** (article 143 of the electoral law): three months to a year in prison, or a fine of six to twenty-four months. If something comes up, tell the board at least 72 hours before 08:00 on polling day or, if later, immediately." },
    ],
    note: "Each person's deadlines run from the day they are notified. The dates on this page are the latest possible ones in the official calendar.",
    whoTitle: "Who can be drawn",
    who: [
      "The town hall holds a **public draw** among everyone on that station's electoral roll who is **under 70 and can read and write**. The chair must hold the Bachillerato or an upper vocational qualification, or failing that the Graduado Escolar or equivalent. **Two substitutes** are drawn for each post, so nine people are drawn per station.",
      "The results of the draw are not published: only the people chosen are notified, together with an instruction manual.",
    ],
    datesTitle: "Deadlines for 29 November",
    datesCaption: "Forming the polling-station tables, general election of 29 November 2026",
    datesHeaders: ["Step", "Legal deadline", "Latest date"],
    datesRows: [
      ["Draw at the town hall", "Days 25 to 29 after the election is called", "31 October to 4 November"],
      ["Notification", "3 days after the draw", "7 November"],
      ["Submit an excuse to the Junta Electoral de Zona", "7 days from your notification", "14 November"],
      ["Junta's decision", "5 days", "19 November"],
      ["Report a later impediment", "72 hours before 08:00 on polling day", "Thursday 26 November, 08:00"],
    ],
    datesNote: "Spanish Interior Ministry calendar (election called on 6 October 2026). Each town hall holds its draw on one day within the window; the Junta Electoral de Zona can authorise an earlier draw.",
    excuseTitle: "How to be excused",
    excuse: [
      "You have **7 days from notification** to give the **Junta Electoral de Zona** (the local electoral board) a \"justified and documented\" reason. The board decides within 5 days and must give reasons for a refusal. There is no electoral appeal, only the administrative courts. The board's contact details are on your notification.",
      `**How to file it:** on paper with the Junta Electoral de Zona, or online if you have Cl@ve, through the Interior Ministry's [excuse platform](${EXCUSE_APP}), which the Central Electoral Board enabled in its Instruction 2/2023 and the official 29 November website links to. Either way you must provide the document that proves your reason. If you are 65 or over, you can decline the post within the same seven days. Only the board can relieve you: until it accepts your excuse, you are still appointed.`,
      "Under the Central Electoral Board's instruction, these reasons are **always accepted** once documented:",
    ],
    excuseAuto: [
      "Being aged 65 to 69.",
      "Having a recognised disability of any degree, or a permanent absolute incapacity or severe disability pension.",
      "Being on sick leave.",
      "Being six or more months pregnant, or on birth or childcare leave.",
      "Directly and continuously caring for a breastfed baby, children under 12, or disabled people in your legal care.",
      "Caring for a relative up to the second degree who cannot look after themselves.",
      "Having served on a mesa at least three times in the last ten years, provided the table can still be filled from that station's voters.",
      "Being a victim protected by a restraining order against someone who votes at the same polling venue.",
    ],
    excuseCase:
      "Other reasons are judged case by case: an illness that makes the task especially hard, surgery that cannot be postponed, a major family event that day, being a single parent of children under 14, or essential-service work that day (health, fire, civil protection) with a report from your manager. **Having to work, or being on holiday, is not an automatic excuse.**",
    lateTitle: "If something comes up later",
    late: "If, after the seven days, something prevents you from going, tell the Junta Electoral de Zona **at least 72 hours before** 08:00 on polling day, with proof. If it happens even later, tell them **immediately**, and always before the table is formed.",
    penaltyTitle: "What happens if you don't turn up",
    penalty: "Failing to turn up, leaving without a legitimate reason, or not giving the excuse or notice the law requires is a **criminal offence** (article 143 of the electoral law): **three months to a year in prison, or a fine of six to twenty-four months** (a day-fine). It applies to substitutes too.",
    payTitle: "How much polling-station duty pays in 2026",
    payCaption: "Allowance for sitting on a polling-station table on 29 November",
    payHeaders: ["Role", "Allowance"],
    payRows: [
      ["Chair (presidente)", "€75"],
      ["Member (vocal, two per table)", "€75"],
      ["Substitute who ends up sitting", "€75"],
      ["Substitute who does not sit", "Not paid"],
    ],
    payNote: "Orden INT/650/2026 (BOE, 27 June 2026), in force since 28 June and applying to every election held after it, 29 November included. Paid in full however long the day lasts.",
    pay: [
      "Each sitting member is paid an allowance of **€75** per polling day, however long it lasts, under Orden INT/650/2026 (it used to be €70). The official manual for the 29 November tables, approved by the Council of Ministers on 27 October, gives the same figure. Substitutes are paid only if they end up sitting. The allowance is **not taxed**.",
      "If you have to take the documents to the court at the end, you can claim the travel costs from the Government Delegation or Sub-delegation.",
    ],
    whenTitle: "When polling-station duty is paid",
    when: [
      "**What the official sources say:** the allowance is earned on polling day. Members who sit at the table that day are paid in full, however long it lasts, and substitutes only if they end up taking a seat (Orden INT/650/2026, articles 2 and 3, and the official 29 November manual).",
      "**What they do not say:** neither the order, nor the 29 November manual, nor the Interior Ministry's page on time off and allowances sets the day or the method of payment. The only official hint is the order's preamble: these payments are still mostly made in cash (checked on 28 October 2026).",
      "**What to do:** if you are drawn, ask the Junta Electoral de Zona (its contact details are on your notification) or your town hall how and when it is paid where you live.",
    ],
    workTitle: "Time off work",
    work: [
      "**Mesa members:** if polling day is a working day for you, you get the whole day off with pay, and **in every case** five fewer hours of work the next day. For 29 November, a Sunday, that is **Monday 30 November**. Substitutes who end up sitting get the same. The electoral board issues the certificate.",
      "**Night shifts:** according to the Interior Ministry, a night shift that starts on 29 November counts as polling-day work, and the five-hour reduction can be taken on your next night shift if it starts on the 30th. You must serve at the table even if you worked the day before.",
      "**Voters working that day:** you are entitled to **up to four paid hours** to vote, pro rata for part-time work. In Catalonia the Generalitat sets the detail for each election: in 2023 it was two hours if your shift overlapped voting hours by more than two and less than four, and four if it overlapped by four or more, with the employer choosing when. The order for 29 November was not in the DOGC on 3 November; the 2023 one (Ordre EMT/178/2023) came out on 7 July, 16 days before the vote.",
      "**Social Security:** chairs, members and substitutes are covered that day; any injury, including on the way there or back, counts as a work accident.",
    ],
    dayTitle: "How the day goes",
    dayCaption: "A polling-station table's day, under Spanish electoral law",
    dayHeaders: ["Time", "What happens"],
    dayRows: [
      ["08:00", "Chair, members and substitutes meet at the polling station. Anyone missing is replaced by their substitute."],
      ["08:00–08:30", "The table is formed and party scrutineers' credentials are received. Substitutes who are not needed can leave."],
      ["09:00–20:00", "Voting without a break. If someone steps out, at least two must stay at the table."],
      ["20:00", "Voting closes. Those already inside vote, then the postal votes go in, then the table members and scrutineers vote."],
      ["After", "Public count, results posted on the door, and the documents in three envelopes: two to the court, one to the post office."],
    ],
    dayNote: "The law sets no finishing time: the day ends when the documents have been handed over.",
    checkTitle: "Where to check",
    check: [
      "**Your polling station and table:** on the INE's lookup service, with no login. Polling cards are posted from 2 November.",
      "**Whether you have been drawn:** there is no official online lookup. You find out from the notification, due between 31 October and 7 November; according to the Interior Ministry, a later notice does not make the appointment invalid. If in doubt, ask your town hall or the Junta Electoral de Zona.",
    ],
    faq: [
      { question: "What do I have to do if I have been drawn?", answer: "Read the manual that comes with the notification and be at the polling station it names at 08:00 on Sunday 29 November. If you cannot go, you have seven days from the notification to give the Junta Electoral de Zona a documented excuse; from age 65 you can decline within the same seven days." },
      { question: "Can I file my excuse online?", answer: "Yes, with Cl@ve: through the Interior Ministry's excuse platform, which the official 29 November website links to and the Central Electoral Board enabled in Instruction 2/2023. You can also file it on paper with the Junta Electoral de Zona. Either way, within seven days of the notification and with the document that proves your reason." },
      { question: "How much does polling-station duty pay in Spain in 2026?", answer: "€75 for polling day, 29 November, under Orden INT/650/2026, which applies to this election. Substitutes are paid only if they sit, and the allowance is not taxed." },
      { question: "When do you get paid for polling-station duty in 2026?", answer: "The allowance is earned on polling day, but no official rule sets when or how it is paid: neither Orden INT/650/2026 nor the official 29 November manual says. The order only notes that these payments are still mostly made in cash. Ask the Junta Electoral de Zona or your town hall." },
      { question: "What do you get for sitting on a polling-station table?", answer: "A €75 allowance for the day, paid leave if that day is a working day for you, and five fewer hours of work the next day. Substitutes who never take a seat are not paid." },
      { question: "When is the draw for the 29 November election?", answer: "Between 31 October and 4 November 2026. Each town hall picks the day, and you must be notified within three days." },
      { question: "How long do I have to ask to be excused?", answer: "Seven days from your notification. For 29 November, 14 November at the latest if your draw was on the last day." },
      { question: "What happens if I don't turn up?", answer: "It is an offence under article 143 of the electoral law: three months to a year in prison, or a day-fine of six to twenty-four months." },
      { question: "How do I know if I have been drawn?", answer: "There is no online lookup: you find out from the notification, which must reach you within three days of the draw (31 October to 4 November). If in doubt, ask your town hall or the Junta Electoral de Zona." },
      { question: "Which excuses are accepted?", answer: "Always accepted once documented: being 65 to 69, a recognised disability, sick leave, being six or more months pregnant, caring for a breastfed baby, children under 12 or a dependent relative, or having sat three times in ten years. Work or holidays are not automatic excuses." },
    ],
  },
};

function body(locale: Locale) {
  const t = COPY[locale];
  return [
    lead(t.lead),
    keyFacts(t.nowTitle, t.now),
    callout("official", verifiedLine(locale, VERIFIED), t.note),
    ...h2(t.payTitle),
    table(t.payCaption, t.payHeaders, t.payRows, t.payNote),
    ...t.pay.map((text) => ({ type: "paragraph", text }) as const),
    ...h2(t.whenTitle),
    list(...t.when),
    ...h2(t.whoTitle, ...t.who),
    ...h2(t.datesTitle),
    table(t.datesCaption, t.datesHeaders, t.datesRows, t.datesNote),
    ...h2(t.excuseTitle, ...t.excuse),
    list(...t.excuseAuto),
    { type: "paragraph", text: t.excuseCase } as const,
    ...h2(t.lateTitle, t.late),
    callout("warning", t.penaltyTitle, t.penalty),
    ...h2(t.workTitle),
    list(...t.work),
    ...h2(t.dayTitle),
    table(t.dayCaption, t.dayHeaders, t.dayRows, t.dayNote),
    ...h2(t.checkTitle),
    list(...t.check),
    faq(t.faq),
    ...b2Related(["voting", "candidates", "electionNight", "congressResults", "parliamentResults"], locale),
  ];
}

export const MESA: B2Article = {
  key: "mesa",
  entryKey: "guide-polling-station-duty",
  categoryKey: "public-services",
  sources: SOURCES,
  heroKey: "mesa-electoral-begur-urna",
  heroAlt: {
    ca: "Una urna transparent amb paperetes sobre la taula d'una mesa electoral, amb els membres de la mesa asseguts al costat",
    es: "Una urna transparente con papeletas sobre la mesa electoral, con los miembros de la mesa sentados al lado",
    en: "A transparent ballot box with ballots on a polling-station table, with the table members seated beside it",
  },
  heroCaption: {
    ca: "Una mesa electoral al Casal de la Gent Gran de Begur.",
    es: "Una mesa electoral en el Casal de la Gent Gran de Begur.",
    en: "A polling-station table at the senior citizens' centre in Begur.",
  },
  secondaryKey: "mesa-electoral-begur-membres",
  secondaryAlt: {
    ca: "Membres d'una mesa electoral asseguts darrere de l'urna durant la votació",
    es: "Miembros de una mesa electoral sentados detrás de la urna durante la votación",
    en: "Members of a polling-station table seated behind the ballot box during voting",
  },
  secondaryCaption: {
    ca: "La mesa, durant la votació.",
    es: "La mesa, durante la votación.",
    en: "The table during voting.",
  },
  verifiedAt: VERIFIED,
  publishedAt: "2026-10-13T00:30:00+02:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...META[locale], blocks: body(locale) }]),
  ) as B2Article["editions"],
};

export { META as MESA_META };
