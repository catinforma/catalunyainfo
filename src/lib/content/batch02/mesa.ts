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
 * Polling-station duty: if you have been drawn, what to do, the pay, the
 * excuses, the penalty and time off work — for voters too.
 *
 * Every statement is from the LOREG, RD 806/2026, RD 605/1999, Orden
 * INT/650/2026, JEC Instrucción 6/2011 (as amended to 2025), the IRPF
 * regulation, Interior and the INE, checked on 12 Oct 2026
 * (research_notes/blog-batch-03/mesa_electoral.md).
 *
 * The 29N dates are the latest possible ones from Interior's calendar; each
 * person's own deadline runs from their own notification, and the copy says
 * so. Not printed: a euro figure for the day-fine, when or how the dieta is
 * paid, the Catalan voter-leave tiers for 29N (the order is not out; the 2023
 * one is cited as such) and any "check if you were drawn" service, because
 * none exists. After 29N the dated section must move to the May 2027
 * municipal elections once their decree is in the BOE.
 */

const VERIFIED = "2026-10-17";

const SOURCES: B2Source[] = [
  { name: "Ley Orgánica 5/1985, del Régimen Electoral General (texto consolidado)", url: "https://www.boe.es/buscar/act.php?id=BOE-A-1985-11672", publisher: "BOE" },
  { name: "Real Decreto 806/2026, de convocatoria de elecciones generales", url: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20742", publisher: "BOE" },
  { name: "Orden INT/650/2026, dieta de los miembros de las mesas electorales", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2026-13948", publisher: "BOE" },
  { name: "Instrucción 6/2011 de la Junta Electoral Central, sobre excusas de miembros de mesa (consolidada)", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2011-7705", publisher: "BOE" },
  { name: "Real Decreto 605/1999, de regulación complementaria de los procesos electorales", url: "https://www.boe.es/buscar/act.php?id=BOE-A-1999-8583", publisher: "BOE" },
  { name: "Calendario electoral, elecciones a Cortes Generales 29-N", url: "https://infoelectoral.interior.gob.es/export/sites/default/pdf/procesos_electorales/Elecciones-Generales-29-N/Calendario-mural-elecciones-Cortes-Generales-2026.pdf", publisher: "Ministerio del Interior" },
  { name: "Preguntas frecuentes: las mesas electorales", url: "https://infoelectoral.interior.gob.es/es/proceso-electoral/preguntas-frecuentes/las-mesas-electorales/", publisher: "Ministerio del Interior" },
  { name: "Consulta de mesas y locales electorales", url: "https://sede.ine.gob.es/tramite/consulta_mesas_locales/", publisher: "INE" },
  { name: "Reglamento del IRPF, artículo 9", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2007-6820", publisher: "BOE" },
];

const META: Record<Locale, { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    path: "guies/membre-mesa-electoral",
    title: "Membre de mesa electoral: què fer si t'ha tocat, quant es cobra i com excusar-te",
    seoTitle: "Membre de mesa electoral 2026: es cobren 75 €, excuses i què fer",
    seoDescription:
      "Si t'ha tocat ser membre de mesa: terminis per excusar-te, excuses acceptades, la dieta de 75 €, permís a la feina, què passa si no hi vas i horari del dia.",
    excerpt:
      "Com es tria la mesa electoral, els terminis del 29N, les excuses que s'accepten, la dieta, els permisos laborals i el que es fa durant el dia, segons la LOREG.",
  },
  es: {
    path: "guias/miembro-mesa-electoral",
    title: "Miembro de mesa electoral: qué hacer si te ha tocado, cuánto se cobra y cómo excusarte",
    seoTitle: "Mesa electoral 2026: se cobran 75 €, excusas y qué hacer",
    seoDescription:
      "Si te ha tocado ser miembro de mesa: plazos para excusarte, excusas aceptadas, la dieta de 75 €, permiso en el trabajo, qué pasa si no vas y horario del día.",
    excerpt:
      "Cómo se elige la mesa electoral, los plazos del 29N, las excusas que se aceptan, la dieta, los permisos laborales y lo que se hace durante el día, según la LOREG.",
  },
  en: {
    path: "guides/polling-station-duty-spain",
    title: "Drawn for polling-station duty in Spain: what to do, the pay and how to be excused",
    seoTitle: "Polling-station duty in Spain: €75 pay, excuses, time off",
    seoDescription:
      "Drawn to sit on a Spanish polling-station table (mesa electoral)? The deadlines to be excused, accepted reasons, the €75 allowance, time off work and the day.",
    excerpt:
      "How mesa members are drawn, the deadlines for the 29 November election, accepted excuses, the allowance, time off work and what happens on the day, from Spanish electoral law.",
  },
};

type T = {
  lead: string;
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
  pay: string[];
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
    lead: "Cada mesa electoral la formen **una presidenta o president i dos vocals**, triats per sorteig entre els electors d'aquella mesa. Si t'ha tocat, és obligatori, però tens set dies per presentar una excusa documentada, cobres una dieta de **75 €** i tens permís a la feina. Aquí tens els terminis de les eleccions generals del **29 de novembre del 2026** i tot el que diu la llei.",
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
    datesNote: "Calendari del Ministeri de l'Interior (convocatòria publicada el 6 d'octubre del 2026). Cada Ajuntament fa el sorteig un dia dins el període.",
    excuseTitle: "Com excusar-te",
    excuse: [
      "Tens **7 dies des de la notificació** per presentar a la **Junta Electoral de Zona** una causa «justificada i documentada». La Junta respon en 5 dies, i si la denega ho ha de motivar. Contra la decisió no hi ha recurs electoral, només el contenciós administratiu. Les dades de contacte de la Junta surten a la notificació.",
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
    payTitle: "Quant es cobra",
    pay: [
      "Cada membre titular cobra una dieta de **75 €** per jornada electoral, sigui quina sigui la durada, segons l'Orden INT/650/2026 (abans eren 70 €). Els suplents només la cobren si acaben formant part de la mesa. La dieta **no tributa a l'IRPF**.",
      "Si has de portar la documentació al jutjat en acabar, pots reclamar les despeses del desplaçament a la Delegació o Subdelegació del Govern.",
    ],
    workTitle: "Permisos a la feina",
    work: [
      "**Membres de mesa:** si el dia de la votació és laborable per a tu, tens permís retribuït de jornada completa, i **en tots els casos** una reducció de **cinc hores** de la jornada l'endemà. Per al 29N, que és diumenge, això vol dir el **dilluns 30 de novembre**. Els suplents que acaben a la mesa tenen els mateixos drets. El justificant te'l dona la Junta Electoral de Zona.",
      "**Votants que treballen aquell dia:** tenen dret a **fins a quatre hores retribuïdes** per anar a votar, proporcionals si fan jornada reduïda. A Catalunya la Generalitat fixa el detall per a cada elecció: el 2023 eren dues hores si l'horari coincidia més de dues i menys de quatre amb el de votació, i quatre si coincidia quatre o més, i l'empresa decidia en quin moment. L'ordre per al 29N es publica al DOGC uns dies abans de la votació.",
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
      "**Si t'ha tocat ser membre de mesa:** no hi ha cap consulta oficial en línia. Només ho saps per la notificació; si tens dubtes, pregunta a l'Ajuntament o a la Junta Electoral de Zona.",
    ],
    faq: [
      { question: "Quant cobra un membre de mesa?", answer: "75 € per jornada electoral, segons l'Orden INT/650/2026. Els suplents només la cobren si acaben a la mesa, i la dieta no tributa a l'IRPF." },
      { question: "Quan es cobra la dieta de la mesa electoral?", answer: "Cap norma oficial fixa el dia ni la forma de pagament. L'Orden INT/650/2026, que fixa els 75 €, només diu al preàmbul que els pagaments encara es fan majoritàriament en efectiu. Si et toca, pregunta-ho a la Junta Electoral de Zona o a l'Ajuntament." },
      { question: "Quan es fa el sorteig de les meses del 29N?", answer: "Entre el 31 d'octubre i el 4 de novembre del 2026. Cada Ajuntament tria el dia, i t'han de notificar el resultat en tres dies." },
      { question: "Fins quan em puc excusar?", answer: "Set dies des que et notifiquen el nomenament. Per al 29N, com a molt tard el 14 de novembre si el sorteig es fa el darrer dia." },
      { question: "Què passa si no em presento a la mesa?", answer: "És un delicte de l'article 143 de la LOREG: presó de tres mesos a un any o multa de sis a vint-i-quatre mesos." },
      { question: "Tinc festa l'endemà de fer de membre de mesa?", answer: "Tens dret a cinc hores menys de feina l'endemà, en tots els casos. Per al 29N, el dilluns 30 de novembre." },
    ],
  },
  es: {
    lead: "Cada mesa electoral la forman **un presidente o presidenta y dos vocales**, elegidos por sorteo entre los electores de esa mesa. Si te ha tocado, es obligatorio, pero tienes siete días para presentar una excusa documentada, cobras una dieta de **75 €** y tienes permiso en el trabajo. Aquí tienes los plazos de las elecciones generales del **29 de noviembre de 2026** y todo lo que dice la ley.",
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
    datesNote: "Calendario del Ministerio del Interior (convocatoria publicada el 6 de octubre de 2026). Cada Ayuntamiento hace el sorteo un día dentro del periodo.",
    excuseTitle: "Cómo excusarte",
    excuse: [
      "Tienes **7 días desde la notificación** para presentar a la **Junta Electoral de Zona** una causa «justificada y documentada». La Junta responde en 5 días, y si la deniega debe motivarlo. Contra la decisión no cabe recurso electoral, solo el contencioso-administrativo. Los datos de contacto de la Junta salen en la notificación.",
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
    payTitle: "Cuánto se cobra",
    pay: [
      "Cada miembro titular cobra una dieta de **75 €** por jornada electoral, sea cual sea la duración, según la Orden INT/650/2026 (antes eran 70 €). Los suplentes solo la cobran si acaban formando parte de la mesa. La dieta **no tributa en el IRPF**.",
      "Si tienes que llevar la documentación al juzgado al terminar, puedes reclamar los gastos del desplazamiento a la Delegación o Subdelegación del Gobierno.",
    ],
    workTitle: "Permisos en el trabajo",
    work: [
      "**Miembros de mesa:** si el día de la votación es laborable para ti, tienes permiso retribuido de jornada completa, y **en todos los casos** una reducción de **cinco horas** de la jornada al día siguiente. Para el 29N, que es domingo, eso significa el **lunes 30 de noviembre**. Los suplentes que acaban en la mesa tienen los mismos derechos. El justificante te lo da la Junta Electoral de Zona.",
      "**Votantes que trabajan ese día:** tienen derecho a **hasta cuatro horas retribuidas** para ir a votar, proporcionales si hacen jornada reducida. En Cataluña la Generalitat fija el detalle para cada elección: en 2023 eran dos horas si el horario coincidía más de dos y menos de cuatro con el de votación, y cuatro si coincidía cuatro o más, y la empresa decidía en qué momento. La orden para el 29N se publica en el DOGC unos días antes de la votación.",
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
      "**Si te ha tocado ser miembro de mesa:** no hay ninguna consulta oficial en línea. Solo lo sabes por la notificación; si tienes dudas, pregunta al Ayuntamiento o a la Junta Electoral de Zona.",
    ],
    faq: [
      { question: "¿Cuánto cobra un miembro de mesa?", answer: "75 € por jornada electoral, según la Orden INT/650/2026. Los suplentes solo la cobran si acaban en la mesa, y la dieta no tributa en el IRPF." },
      { question: "¿Cuándo se cobra la dieta de la mesa electoral?", answer: "Ninguna norma oficial fija el día ni la forma de pago. La Orden INT/650/2026, que fija los 75 €, solo dice en su preámbulo que los pagos aún se hacen mayoritariamente en efectivo. Si te toca, pregúntalo a la Junta Electoral de Zona o al Ayuntamiento." },
      { question: "¿Cuándo es el sorteo de las mesas del 29N?", answer: "Entre el 31 de octubre y el 4 de noviembre de 2026. Cada Ayuntamiento elige el día, y te deben notificar el resultado en tres días." },
      { question: "¿Hasta cuándo me puedo excusar?", answer: "Siete días desde que te notifican el nombramiento. Para el 29N, como muy tarde el 14 de noviembre si el sorteo se hace el último día." },
      { question: "¿Qué pasa si no me presento a la mesa?", answer: "Es un delito del artículo 143 de la LOREG: prisión de tres meses a un año o multa de seis a veinticuatro meses." },
      { question: "¿Tengo fiesta al día siguiente de ser miembro de mesa?", answer: "Tienes derecho a cinco horas menos de trabajo al día siguiente, en todos los casos. Para el 29N, el lunes 30 de noviembre." },
    ],
  },
  en: {
    lead: "Every Spanish polling station has a **mesa electoral**: **a chair and two members**, drawn by lot from the voters registered at that station. If you are drawn, it is compulsory, but you have seven days to submit a documented excuse, you are paid a **€75** allowance and you get time off work. Here are the deadlines for the general election of **29 November 2026** and everything the law says.",
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
    datesNote: "Spanish Interior Ministry calendar (election called on 6 October 2026). Each town hall holds its draw on one day within the window.",
    excuseTitle: "How to be excused",
    excuse: [
      "You have **7 days from notification** to give the **Junta Electoral de Zona** (the local electoral board) a \"justified and documented\" reason. The board decides within 5 days and must give reasons for a refusal. There is no electoral appeal, only the administrative courts. The board's contact details are on your notification.",
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
    payTitle: "The pay",
    pay: [
      "Each sitting member is paid an allowance of **€75** per polling day, however long it lasts, under Orden INT/650/2026 (it used to be €70). Substitutes are paid only if they end up sitting. The allowance is **not taxed**.",
      "If you have to take the documents to the court at the end, you can claim the travel costs from the Government Delegation or Sub-delegation.",
    ],
    workTitle: "Time off work",
    work: [
      "**Mesa members:** if polling day is a working day for you, you get the whole day off with pay, and **in every case** five fewer hours of work the next day. For 29 November, a Sunday, that is **Monday 30 November**. Substitutes who end up sitting get the same. The electoral board issues the certificate.",
      "**Voters working that day:** you are entitled to **up to four paid hours** to vote, pro rata for part-time work. In Catalonia the Generalitat sets the detail for each election: in 2023 it was two hours if your shift overlapped voting hours by more than two and less than four, and four if it overlapped by four or more, with the employer choosing when. The order for 29 November is published in the DOGC a few days before the vote.",
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
      "**Whether you have been drawn:** there is no official online lookup. You find out from the notification; if in doubt, ask your town hall or the Junta Electoral de Zona.",
    ],
    faq: [
      { question: "How much are polling-station members paid in Spain?", answer: "€75 per polling day under Orden INT/650/2026. Substitutes are paid only if they sit, and the allowance is not taxed." },
      { question: "When is the polling-station allowance paid?", answer: "No official rule sets the day or method of payment. Orden INT/650/2026, which sets the €75, only says in its preamble that payments are still mostly made in cash. If you are drawn, ask the Junta Electoral de Zona or your town hall." },
      { question: "When is the draw for the 29 November election?", answer: "Between 31 October and 4 November 2026. Each town hall picks the day, and you must be notified within three days." },
      { question: "How long do I have to ask to be excused?", answer: "Seven days from your notification. For 29 November, 14 November at the latest if your draw was on the last day." },
      { question: "What happens if I don't turn up?", answer: "It is an offence under article 143 of the electoral law: three months to a year in prison, or a day-fine of six to twenty-four months." },
    ],
  },
};

function body(locale: Locale) {
  const t = COPY[locale];
  return [
    lead(t.lead),
    callout("official", verifiedLine(locale, VERIFIED), t.note),
    ...h2(t.whoTitle, ...t.who),
    ...h2(t.datesTitle),
    table(t.datesCaption, t.datesHeaders, t.datesRows, t.datesNote),
    ...h2(t.excuseTitle, ...t.excuse),
    list(...t.excuseAuto),
    { type: "paragraph", text: t.excuseCase } as const,
    ...h2(t.lateTitle, t.late),
    callout("warning", t.penaltyTitle, t.penalty),
    ...h2(t.payTitle, ...t.pay),
    ...h2(t.workTitle),
    list(...t.work),
    ...h2(t.dayTitle),
    table(t.dayCaption, t.dayHeaders, t.dayRows, t.dayNote),
    ...h2(t.checkTitle),
    list(...t.check),
    faq(t.faq),
    ...b2Related(["voting", "congressResults", "parliamentResults"], locale),
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
