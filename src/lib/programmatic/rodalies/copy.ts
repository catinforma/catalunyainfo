/**
 * Words of the Rodalies pages. Pure: every fact comes from the snapshot
 * (lines and stations, read from Rodalies de Catalunya) or from `official.ts`
 * (pages and rules read on rodalies.gencat.cat on 28 Oct 2026). Nothing here
 * says whether a line is running now: that is the browser's job, from the
 * live notices, so the server HTML can never claim "no incidents".
 */

import { b2href } from "@/lib/content/batch02/shared";
import type { Locale } from "@/lib/i18n/config";
import { caDayArticle, dayMonthYear } from "@/lib/programmatic/holidays/format";

import { LINES, SNAPSHOT, accessibleCount, linesInGroup, siblings } from "./data";
import { LINE_OFFICIAL, OFFICIAL_VERIFIED, PHONE, linePageUrl, officialUrl, xUrl, type ServiceGroup } from "./official";
import { caLine, hubMeta } from "./pages";
import { hubPath, linePath, type LineLocale } from "./paths";
import type { LineId, SnapshotLine, SnapshotStation, SnapshotTransfer } from "./types";

const link = (label: string, url: string) => `[${label}](${url})`;

/** "el 28 d'octubre de 2026", "el 28 de octubre de 2026", "28 October 2026". */
export function onDate(iso: string, locale: Locale): string {
  if (locale === "ca") return `${caDayArticle(iso)}${dayMonthYear(iso, "ca")}`;
  if (locale === "es") return `el ${dayMonthYear(iso, "es")}`;
  return dayMonthYear(iso, "en");
}

/* -------------------------------------------------------------------------- */
/* Shared pieces                                                              */
/* -------------------------------------------------------------------------- */

const GROUP_LABEL: Record<ServiceGroup, Record<Locale, string>> = {
  barcelona: { ca: "Rodalia de Barcelona", es: "Rodalies de Barcelona", en: "Barcelona commuter lines" },
  regional: {
    ca: "Regionals i rodalia de Girona, Camp de Tarragona i Lleida",
    es: "Regionales y Rodalies de Girona, Camp de Tarragona y Lleida",
    en: "Regional lines, and the Girona, Camp de Tarragona and Lleida commuter lines",
  },
};

export const groupLabel = (group: ServiceGroup, locale: Locale) => GROUP_LABEL[group][locale];

const TRANSFER_PREFIX: Record<string, Record<Locale, string>> = {
  METRO: { ca: "Metro", es: "Metro", en: "Metro" },
  TRAM: { ca: "Tramvia", es: "Tranvía", en: "Tram" },
  RAILWAY: { ca: "FGC", es: "FGC", en: "FGC" },
};

/** "Metro L5", "Tramvia T1", "FGC S1", or the official description for anything else. */
export function transferLabel(t: SnapshotTransfer, locale: Locale): string {
  const prefix = TRANSFER_PREFIX[t.type]?.[locale];
  return prefix ? `${prefix} ${t.id}` : t.label[locale] || t.label.ca || t.id;
}

export function stationConnections(station: SnapshotStation, locale: Locale): string {
  const names = station.lines.map((id) => LINES.find((l) => l.id === id)?.name ?? id);
  return [...names, ...station.transfers.map((t) => transferLabel(t, locale))].join(" · ");
}

/** "entre Sant Vicenç de Calders i Barcelona-Estació de França, per Vilanova i la Geltrú". */
function between(line: SnapshotLine, locale: LineLocale): string {
  const via = line.via[locale];
  const base = locale === "ca" ? `entre ${line.origin} i ${line.destination}` : `entre ${line.origin} y ${line.destination}`;
  return via ? `${base}, ${via}` : base;
}

/* -------------------------------------------------------------------------- */
/* Compensation (Condicions generals, condició 13; Devolució Xpress page)      */
/* -------------------------------------------------------------------------- */

export interface CompensationCopy {
  title: string;
  intro: string;
  headers: [string, string];
  rows: [string, string][];
  notes: string[];
  where: string[];
}

function compensation(line: SnapshotLine | null, locale: Locale): CompensationCopy {
  const dx = line ? LINE_OFFICIAL[line.id].dx : null;
  const stations = dx?.stations?.join(", ");
  const form = officialUrl.dxForm(locale);
  const conditions = officialUrl.conditions(locale);
  const complaints = officialUrl.complaints(locale);

  if (locale === "ca") {
    const name = line ? caLine(line) : "";
    const where: string[] = [];
    if (!line) {
      where.push(
        `**On es demana la Devolució Xpress.** A les línies de rodalia de Barcelona, a l'estació on acabes el viatge, en arribar (si l'estació no té personal, amb el ${link("formulari en línia", form)} en 24 hores). A les regionals i a les de Girona, Camp de Tarragona i Lleida, a les estacions principals que llista Rodalies, fins a 15 dies després. Cada pàgina de línia diu on.`,
      );
    } else {
      if (dx?.barcelona) {
        where.push(
          `**On es demana a ${name}${line.id === "R3" ? " (servei de rodalia, fins a Sant Quirze de Besora)" : ""}.** A l'estació on acabes el viatge, just en arribar: l'estació comprova que es compleixen les condicions. Si l'estació no té personal, tens 24 hores per demanar-la amb el ${link("formulari en línia", form)}, amb una còpia del bitllet per les dues cares.`,
        );
      }
      if (stations) {
        where.push(
          `**On es demana a ${name}${line.id === "R3" ? " (servei regional, de La Farga de Bebié a Puigcerdà)" : ""}.** A qualsevol d'aquestes estacions, en arribar i fins a 15 dies naturals després del retard: ${stations}. Des d'una altra estació, amb el ${link("formulari en línia", form)}.`,
        );
      }
      if (!dx?.barcelona && !stations) {
        where.push(`**On es demana a ${name}.** La pàgina oficial de la Devolució Xpress no inclou ${name} a cap de les seves llistes d'estacions: pregunta-ho al ${PHONE} (gratuït, cada dia de 7 a 23 h).`);
      }
    }
    return {
      title: line ? `Com reclamar si ${name} arriba tard` : "Com reclamar un retard a Rodalies",
      intro: `Ho fixen les ${link("Condicions generals d'utilització de Rodalies i Regionals de Catalunya", conditions)} (condició 13). Depèn del retard en arribar a l'estació de destinació:`,
      headers: ["Retard en arribar", "Què pots demanar"],
      rows: [
        ["Més de 15 minuts", "La Devolució Xpress: un bitllet per fer el mateix recorregut (o el viatge restituït al teu títol multiviatge), vàlid 30 dies naturals. Només si el retard és imputable al ferrocarril."],
        ["Més de 30 minuts", "O bé una indemnització en diners: el 50% del preu del viatge, segons el títol que has fet servir."],
        ["Més d'1 hora", "La indemnització en diners puja al 100% del preu del títol."],
      ],
      notes: [
        "La Devolució Xpress i la indemnització en diners no se sumen: tries una de les dues. La Devolució Xpress mai no és un retorn de diners, i s'ha de validar abans de pujar al tren; als regionals, va acompanyada del bitllet original.",
        "No hi ha Devolució Xpress per retards d'obres anunciades amb prou antelació ni per força major: catàstrofes naturals, temps molt advers o incendis de fora del ferrocarril, vagues (excepte els trens de serveis mínims), persones, animals o objectes a la via, atenció a persones malaltes, ordres judicials, governatives o policials, alarmes accionades sense motiu, sabotatges o problemes d'ordre públic.",
        `Si el tren se suprimeix i no pots començar el viatge en una hora, és una cancel·lació: pots demanar la devolució del bitllet, un altre títol per fer el viatge quan sigui possible o fer-lo amb el mitjà alternatiu que habiliti l'operador. Si el viatge s'interromp un cop començat, t'han de portar amb un altre tren o un altre mitjà en condicions equivalents, o pots renunciar-hi i demanar la devolució.`,
        `La indemnització en diners es demana pels canals de l'operador: ${link("consultes i reclamacions", complaints)} o el ${PHONE}.`,
      ],
      where,
    };
  }

  if (locale === "es") {
    const name = line ? `la ${line.name}` : "";
    const where: string[] = [];
    if (!line) {
      where.push(
        `**Dónde se pide la Devolució Xpress.** En las líneas de Rodalies de Barcelona, en la estación donde acabas el viaje, al llegar (si la estación no tiene personal, con el ${link("formulario en línea", form)} en 24 horas). En las regionales y en las de Girona, Camp de Tarragona y Lleida, en las estaciones principales que lista Rodalies, hasta 15 días después. Cada página de línea dice dónde.`,
      );
    } else {
      if (dx?.barcelona) {
        where.push(
          `**Dónde se pide en ${name}${line.id === "R3" ? " (servicio de cercanías, hasta Sant Quirze de Besora)" : ""}.** En la estación donde acabas el viaje, al llegar: la estación comprueba que se cumplen las condiciones. Si la estación no tiene personal, tienes 24 horas para pedirla con el ${link("formulario en línea", form)}, con una copia del billete por las dos caras.`,
        );
      }
      if (stations) {
        where.push(
          `**Dónde se pide en ${name}${line.id === "R3" ? " (servicio regional, de La Farga de Bebié a Puigcerdà)" : ""}.** En cualquiera de estas estaciones, al llegar y hasta 15 días naturales después del retraso: ${stations}. Desde otra estación, con el ${link("formulario en línea", form)}.`,
        );
      }
      if (!dx?.barcelona && !stations) {
        where.push(`**Dónde se pide en ${name}.** La página oficial de la Devolució Xpress no incluye ${name} en ninguna de sus listas de estaciones: pregúntalo en el ${PHONE} (gratuito, todos los días de 7 a 23 h).`);
      }
    }
    return {
      title: line ? `Cómo reclamar si ${name} llega tarde` : "Cómo reclamar un retraso en Rodalies",
      intro: `Lo fijan las ${link("Condiciones generales de utilización de Rodalies y Regionales de Cataluña", conditions)} (condición 13). Depende del retraso al llegar a la estación de destino:`,
      headers: ["Retraso al llegar", "Qué puedes pedir"],
      rows: [
        ["Más de 15 minutos", "La Devolució Xpress: un billete para hacer el mismo recorrido (o el viaje restituido a tu título multiviaje), válido 30 días naturales. Solo si el retraso es imputable al ferrocarril."],
        ["Más de 30 minutos", "O bien una indemnización en dinero: el 50% del precio del viaje, según el título que has usado."],
        ["Más de 1 hora", "La indemnización en dinero sube al 100% del precio del título."],
      ],
      notes: [
        "La Devolució Xpress y la indemnización en dinero no se suman: eliges una de las dos. La Devolució Xpress nunca es una devolución de dinero, y hay que validarla antes de subir al tren; en los regionales, va acompañada del billete original.",
        "No hay Devolució Xpress por retrasos de obras anunciadas con suficiente antelación ni por fuerza mayor: catástrofes naturales, tiempo muy adverso o incendios de fuera del ferrocarril, huelgas (salvo los trenes de servicios mínimos), personas, animales u objetos en la vía, atención a personas enfermas, órdenes judiciales, gubernativas o policiales, alarmas accionadas sin motivo, sabotajes o problemas de orden público.",
        "Si el tren se suprime y no puedes empezar el viaje en una hora, es una cancelación: puedes pedir la devolución del billete, otro título para hacer el viaje cuando sea posible o hacerlo con el medio alternativo que habilite el operador. Si el viaje se interrumpe una vez empezado, te tienen que llevar en otro tren u otro medio en condiciones equivalentes, o puedes renunciar y pedir la devolución.",
        `La indemnización en dinero se pide por los canales del operador: ${link("consultas y reclamaciones", complaints)} o el ${PHONE}.`,
      ],
      where,
    };
  }

  return {
    title: "Delayed Rodalies train: what you can claim",
    intro: `The rules are in the ${link("general conditions of use of Rodalies and Regional trains in Catalonia", conditions)} (condition 13), and depend on how late you reach your destination station:`,
    headers: ["Delay on arrival", "What you can ask for"],
    rows: [
      ["More than 15 minutes", "A \"Devolució Xpress\": a ticket for the same journey (or the trip given back on a multi-trip card), valid 30 days. Only if the railway caused the delay."],
      ["More than 30 minutes", "Or a cash refund of 50% of the fare, depending on the ticket you used."],
      ["More than 1 hour", "The cash refund rises to 100% of the ticket price."],
    ],
    notes: [
      "You choose one: the Devolució Xpress and the cash refund do not add up. The Devolució Xpress is never money back, and it must be validated before you board.",
      "There is no Devolució Xpress for delays caused by works announced well in advance, or by force majeure: natural disasters, extreme weather or fires from outside the railway, strikes (except minimum-service trains), people, animals or objects on the track, ill passengers, court, government or police orders, alarms set off without reason, sabotage or public-order problems.",
      "If your train is cancelled and you cannot start your journey within an hour, you can ask for a refund, a ticket for a later train, or travel by any alternative the operator lays on. If your journey is interrupted, you must be taken on by another train or vehicle in equivalent conditions, or you can give up and ask for a refund.",
      `On Barcelona commuter lines, ask at the station where your trip ends, on arrival; on regional lines, at the main stations Rodalies lists, up to 15 days later. Cash refunds go through ${link("Rodalies customer service", complaints)} or ${PHONE}.`,
    ],
    where: [],
  };
}

/* -------------------------------------------------------------------------- */
/* Line page                                                                  */
/* -------------------------------------------------------------------------- */

export interface LinkItem {
  label: string;
  href: string;
}

export interface LinePageCopy {
  h1: string;
  kicker: string;
  lead: string;
  readLine: string;
  facts: { label: string; value: string }[];
  liveTitle: string;
  stationsTitle: string;
  stationsNote: string;
  stationHeaders: [string, string, string];
  yes: string;
  no: string;
  officialTitle: string;
  official: string[];
  disruptionTitle: string;
  disruption: string[];
  compensation: CompensationCopy;
  faqTitle: string;
  faq: { question: string; answer: string }[];
  siblingsTitle: string;
  sharedLabel: string;
  groupLabel: string;
  hubLink: LinkItem;
  relatedTitle: string;
  related: LinkItem[];
  sourcesTitle: string;
  sourcesNote: string;
  sources: { name: string; publisher: string; url: string; note: string }[];
}

function sources(locale: Locale): LinePageCopy["sources"] {
  const read = onDate(SNAPSHOT.readOn, locale);
  const checked = onDate(OFFICIAL_VERIFIED, locale);
  const ca = locale === "ca";
  const es = locale === "es";
  return [
    {
      name: ca ? "Línies i estacions" : es ? "Líneas y estaciones" : "Lines and stations",
      publisher: "Rodalies de Catalunya",
      url: officialUrl.timetables(locale),
      note: ca ? `dades del cercador d'horaris, llegides ${read}` : es ? `datos del buscador de horarios, leídos ${read}` : `timetable-search data, read ${read}`,
    },
    {
      name: ca ? "Estat del servei (avisos en directe)" : es ? "Estado del servicio (avisos en directo)" : "Service status (live notices)",
      publisher: "Rodalies de Catalunya",
      url: officialUrl.status(locale),
      note: ca ? "reutilització segons l'avís legal de la Generalitat" : es ? "reutilización según el aviso legal de la Generalitat" : "reused under the Generalitat's legal notice",
    },
    {
      name: ca ? "Condicions generals d'utilització (condició 13)" : es ? "Condiciones generales de utilización (condición 13)" : "General conditions of use (condition 13)",
      publisher: "Rodalies de Catalunya",
      url: officialUrl.conditions(locale),
      note: ca ? `consultades ${checked}` : es ? `consultadas ${checked}` : `checked ${checked}`,
    },
    {
      name: "Devolució Xpress",
      publisher: "Rodalies de Catalunya",
      url: officialUrl.dx(locale),
      note: ca ? `consultada ${checked}` : es ? `consultada ${checked}` : `checked ${checked}`,
    },
    {
      name: ca ? "Incidències i avisos (GTFS-RT), font de reserva" : es ? "Incidencias y avisos (GTFS-RT), fuente de reserva" : "Incidents and notices (GTFS-RT), backup source",
      publisher: "Renfe Operadora",
      url: officialUrl.renfeAlertsDataset,
      note: ca ? "CC BY 4.0; origen de les dades: Renfe Operadora" : es ? "CC BY 4.0; origen de los datos: Renfe Operadora" : "CC BY 4.0; data origin: Renfe Operadora",
    },
  ];
}

export function lineCopy(line: SnapshotLine, locale: LineLocale): LinePageCopy {
  const official = LINE_OFFICIAL[line.id];
  const n = line.stations.length;
  const acc = accessibleCount(line);
  const { shared } = siblings(line.id);
  const read = onDate(SNAPSHOT.readOn, locale);
  const x = `@${official.x}`;
  const sharedNames = shared.slice(0, 3).map((s) => s.line.name);
  const strikes = b2href("strikes", locale);
  const transport = b2href("transport", locale);
  const hours = b2href("hours", locale);
  const airport = b2href("airport", locale);
  const compensationCopy = compensation(line, locale);

  if (locale === "ca") {
    const name = caLine(line);
    const Name = `L'${line.name}`;
    return {
      h1: `Rodalies ${line.name} avui: incidències i avisos`,
      kicker: groupLabel(official.group, locale),
      lead: `${Name} circula ${between(line, locale)}, amb ${n} estacions. A continuació tens els avisos que Rodalies de Catalunya hi té publicats ara mateix i, després, les estacions, l'horari oficial, què fer si el servei falla i com reclamar un retard.`,
      readLine: `Recorregut i estacions llegits a Rodalies de Catalunya ${read}`,
      facts: [
        { label: "Recorregut", value: `${line.origin} – ${line.destination}` },
        ...(line.via.ca ? [{ label: "Passa", value: line.via.ca }] : []),
        { label: "Estacions", value: `${n}, ${acc} accessibles segons Rodalies` },
        { label: "Servei", value: groupLabel(official.group, locale) },
        { label: "Avisos a X", value: x },
        { label: "Telèfon de Rodalies", value: `${PHONE} (gratuït, de 7 a 23 h)` },
      ],
      liveTitle: `Avisos de ${name} ara mateix`,
      stationsTitle: `Estacions de ${name}`,
      stationsNote: `En ordre de recorregut, de ${line.origin} a ${line.destination}, tal com les llista Rodalies de Catalunya. «Accessible» és com Rodalies marca l'estació.`,
      stationHeaders: ["Estació", "Accessible", "Correspondències"],
      yes: "Sí",
      no: "No",
      officialTitle: `Horaris i avisos oficials de ${name}`,
      official: [
        `**Horaris:** al ${link("cercador d'horaris de Rodalies", officialUrl.timetables(locale))}${official.pdf ? ` i al ${link(`PDF de l'horari de l'${line.id === "R2N" || line.id === "R2S" ? "R2" : line.name}`, official.pdf)}` : ""}. Rodalies demana consultar també les «Afectacions programades», que els poden canviar.`,
        `**Avisos:** a l'${link("estat del servei", officialUrl.status(locale))} de rodalies.gencat.cat, al compte ${link(x, xUrl(line.id))} (Rodalies hi informa de l'estat de la línia) i al ${link("canal de WhatsApp de Rodalies", officialUrl.whatsapp)}.`,
        `**La fitxa de la línia:** ${link(`${line.name} a rodalies.gencat.cat`, linePageUrl(line.id, locale))}.`,
        `**Per telèfon:** ${link(PHONE, officialUrl.phone(locale))}, gratuït, cada dia de 7 a 23 h.`,
      ],
      disruptionTitle: `Què fer si ${name} té incidències`,
      disruption: [
        `**Llegeix l'avís de la línia**, a dalt o a l'estat oficial del servei. Quan Rodalies organitza un servei alternatiu per carretera, l'avís diu entre quines estacions.`,
        `**Si hi ha correspondència**, a la taula d'estacions hi ha les altres línies de Rodalies, metro, tramvia i FGC de cada estació${sharedNames.length ? `; ${name} comparteix més estacions amb ${sharedNames.join(", ")}` : ""}. Abans de canviar de línia, mira també els avisos d'aquella línia.`,
        `**Si el tren no surt o s'atura pel camí**, tens dret a la devolució del bitllet o a fer el viatge amb un altre tren o un altre mitjà que posi l'operador (ho expliquem a sota).`,
        `**Si necessites un justificant**, Rodalies publica ${link("justificants de retard", officialUrl.delayCertificates(locale))} de les incidències que han afectat diverses línies o diversos trens.`,
        `**Els dies de vaga**, Rodalies funciona amb serveis mínims: mira ${link("què funciona els dies de vaga", strikes)}.`,
      ],
      compensation: compensationCopy,
      faqTitle: "Preguntes freqüents",
      faq: [
        {
          question: `Com sé si ${name} funciona avui?`,
          answer: `Rodalies de Catalunya publica els avisos de cada línia a l'estat del servei de rodalies.gencat.cat i al compte ${x}. En aquesta pàgina els veus a dalt, llegits en directe de les dades oficials, amb l'hora de la consulta.`,
        },
        {
          question: `Què puc demanar si el tren de ${name} arriba tard?`,
          answer: "Amb més de 15 minuts de retard per causes del ferrocarril, la Devolució Xpress: un viatge per al mateix recorregut, vàlid 30 dies. Amb més de 30 minuts pots optar, en canvi, per una indemnització del 50% del preu del viatge, i del 100% amb més d'una hora.",
        },
        {
          question: `On és l'horari de ${name}?`,
          answer: official.pdf
            ? `Al cercador d'horaris de rodalies.gencat.cat i al PDF de l'horari que Rodalies publica per a la línia.`
            : `Al cercador d'horaris de rodalies.gencat.cat, triant l'estació d'origen i la de destinació.`,
        },
      ],
      siblingsTitle: "Altres línies de Rodalies",
      sharedLabel: `Comparteixen estacions amb ${name}`,
      groupLabel: groupLabel(official.group, locale),
      hubLink: { label: "Totes les línies de Rodalies, amb els avisos d'avui", href: hubPath(locale) },
      relatedTitle: "Guies relacionades",
      related: [
        { label: "Vaga avui a Catalunya: què funciona", href: strikes },
        { label: "Targetes de transport de Barcelona (T-casual i altres)", href: transport },
        { label: "Horari del metro de Barcelona", href: hours },
        ...(line.id === "R2N" ? [{ label: "De l'aeroport al centre de Barcelona", href: airport }] : []),
      ],
      sourcesTitle: "Fonts",
      sourcesNote: `Dades oficials. Els avisos en directe es llegeixen en obrir la pàgina; la resta, ${read}.`,
      sources: sources(locale),
    };
  }

  const name = `la ${line.name}`;
  const Name = `La ${line.name}`;
  return {
    h1: `Rodalies ${line.name} hoy: incidencias y avisos`,
    kicker: groupLabel(official.group, locale),
    lead: `${Name} circula ${between(line, locale)}, con ${n} estaciones. A continuación tienes los avisos que Rodalies de Catalunya tiene publicados ahora mismo y, después, las estaciones, el horario oficial, qué hacer si el servicio falla y cómo reclamar un retraso.`,
    readLine: `Recorrido y estaciones leídos en Rodalies de Catalunya ${read}`,
    facts: [
      { label: "Recorrido", value: `${line.origin} – ${line.destination}` },
      ...(line.via.es ? [{ label: "Pasa", value: line.via.es }] : []),
      { label: "Estaciones", value: `${n}, ${acc} accesibles según Rodalies` },
      { label: "Servicio", value: groupLabel(official.group, locale) },
      { label: "Avisos en X", value: x },
      { label: "Teléfono de Rodalies", value: `${PHONE} (gratuito, de 7 a 23 h)` },
    ],
    liveTitle: `Avisos de ${name} ahora mismo`,
    stationsTitle: `Estaciones de ${name}`,
    stationsNote: `En orden de recorrido, de ${line.origin} a ${line.destination}, tal como las lista Rodalies de Catalunya. «Accesible» es como Rodalies marca la estación.`,
    stationHeaders: ["Estación", "Accesible", "Correspondencias"],
    yes: "Sí",
    no: "No",
    officialTitle: `Horarios y avisos oficiales de ${name}`,
    official: [
      `**Horarios:** en el ${link("buscador de horarios de Rodalies", officialUrl.timetables(locale))}${official.pdf ? ` y en el ${link(`PDF del horario de la ${line.id === "R2N" || line.id === "R2S" ? "R2" : line.name}`, official.pdf)}` : ""}. Rodalies pide consultar también las «Afectacions programades», que pueden cambiarlos.`,
      `**Avisos:** en el ${link("estado del servicio", officialUrl.status(locale))} de rodalies.gencat.cat, en la cuenta ${link(x, xUrl(line.id))} (Rodalies informa allí del estado de la línea) y en el ${link("canal de WhatsApp de Rodalies", officialUrl.whatsapp)}.`,
      `**La ficha de la línea:** ${link(`${line.name} en rodalies.gencat.cat`, linePageUrl(line.id, locale))}.`,
      `**Por teléfono:** ${link(PHONE, officialUrl.phone(locale))}, gratuito, todos los días de 7 a 23 h.`,
    ],
    disruptionTitle: `Qué hacer si ${name} tiene incidencias`,
    disruption: [
      `**Lee el aviso de la línea**, arriba o en el estado oficial del servicio. Cuando Rodalies organiza un servicio alternativo por carretera, el aviso dice entre qué estaciones.`,
      `**Si hay correspondencia**, en la tabla de estaciones están las otras líneas de Rodalies, metro, tranvía y FGC de cada estación${sharedNames.length ? `; ${name} comparte más estaciones con ${sharedNames.join(", ")}` : ""}. Antes de cambiar de línea, mira también los avisos de esa línea.`,
      `**Si el tren no sale o se para por el camino**, tienes derecho a la devolución del billete o a hacer el viaje en otro tren u otro medio que ponga el operador (lo explicamos abajo).`,
      `**Si necesitas un justificante**, Rodalies publica ${link("justificantes de retraso", officialUrl.delayCertificates(locale))} de las incidencias que han afectado a varias líneas o a varios trenes.`,
      `**Los días de huelga**, Rodalies funciona con servicios mínimos: mira ${link("qué funciona los días de huelga", strikes)}.`,
    ],
    compensation: compensationCopy,
    faqTitle: "Preguntas frecuentes",
    faq: [
      {
        question: `¿Cómo sé si ${name} funciona hoy?`,
        answer: `Rodalies de Catalunya publica los avisos de cada línea en el estado del servicio de rodalies.gencat.cat y en la cuenta ${x}. En esta página los ves arriba, leídos en directo de los datos oficiales, con la hora de la consulta.`,
      },
      {
        question: `¿Qué puedo pedir si el tren de ${name} llega tarde?`,
        answer: "Con más de 15 minutos de retraso por causas del ferrocarril, la Devolució Xpress: un viaje para el mismo recorrido, válido 30 días. Con más de 30 minutos puedes optar, en cambio, por una indemnización del 50% del precio del viaje, y del 100% con más de una hora.",
      },
      {
        question: `¿Dónde está el horario de ${name}?`,
        answer: official.pdf
          ? "En el buscador de horarios de rodalies.gencat.cat y en el PDF del horario que Rodalies publica para la línea."
          : "En el buscador de horarios de rodalies.gencat.cat, eligiendo la estación de origen y la de destino.",
      },
    ],
    siblingsTitle: "Otras líneas de Rodalies",
    sharedLabel: `Comparten estaciones con ${name}`,
    groupLabel: groupLabel(official.group, locale),
    hubLink: { label: "Todas las líneas de Rodalies, con los avisos de hoy", href: hubPath(locale) },
    relatedTitle: "Guías relacionadas",
    related: [
      { label: "Huelga hoy en Cataluña: qué funciona", href: strikes },
      { label: "Tarjetas de transporte de Barcelona (T-casual y otras)", href: transport },
      { label: "Horario del metro de Barcelona", href: hours },
      ...(line.id === "R2N" ? [{ label: "Del aeropuerto al centro de Barcelona", href: airport }] : []),
    ],
    sourcesTitle: "Fuentes",
    sourcesNote: `Datos oficiales. Los avisos en directo se leen al abrir la página; el resto, ${read}.`,
    sources: sources(locale),
  };
}

/** Siblings as links, for the page's "other lines" block. */
export function siblingLinks(id: LineId, locale: LineLocale): { shared: LinkItem[]; group: LinkItem[] } {
  const { shared, group } = siblings(id);
  const label = (l: SnapshotLine) => `${l.name}: ${l.origin} – ${l.destination}`;
  return {
    shared: shared.map((s) => ({ label: label(s.line), href: linePath(locale, s.line.id) })),
    group: group.map((l) => ({ label: label(l), href: linePath(locale, l.id) })),
  };
}

/* -------------------------------------------------------------------------- */
/* Hub                                                                        */
/* -------------------------------------------------------------------------- */

/** Stations visitors ask about, by their official names. Lines are read from the snapshot. */
export const KEY_STATIONS = [
  "Aeroport",
  "Barcelona-Sants",
  "Barcelona-Passeig de Gràcia",
  "Barcelona-Plaça de Catalunya",
  "Barcelona-Estació de França",
  "Sitges",
  "Castelldefels",
  "Mataró",
  "Blanes",
  "Girona",
  "Figueres",
  "Portbou",
  "Vic",
  "Puigcerdà",
  "Manresa",
  "Tarragona",
  "Salou - Port Aventura",
  "Reus",
  "Tortosa",
  "Lleida-Pirineus",
] as const;

export function linesAt(station: string): SnapshotLine[] {
  return LINES.filter((l) => l.stations.some((s) => s.name === station));
}

export interface HubCopy {
  h1: string;
  lead: string;
  readLine: string;
  liveTitle: string;
  linesTitle: string;
  linesNote: string;
  groups: { label: string; lines: { id: LineId; name: string; journey: string; href: string | null }[] }[];
  stationsTitle: string;
  stationsNote: string;
  stationHeaders: [string, string];
  stations: { name: string; lines: string }[];
  visitorTitle: string | null;
  visitor: string[];
  disruptionTitle: string;
  disruption: string[];
  compensation: CompensationCopy;
  relatedTitle: string;
  related: LinkItem[];
  sourcesTitle: string;
  sourcesNote: string;
  sources: LinePageCopy["sources"];
}

const STATION_GLOSS: Partial<Record<(typeof KEY_STATIONS)[number], string>> = {
  Aeroport: "the airport, Terminal 2",
  "Salou - Port Aventura": "Salou and PortAventura",
};

export function hubCopy(locale: Locale): HubCopy {
  const meta = hubMeta(locale);
  const read = onDate(SNAPSHOT.readOn, locale);
  const status = officialUrl.status(locale);
  const strikes = b2href("strikes", locale);
  const transport = b2href("transport", locale);
  const hours = b2href("hours", locale);
  const airport = b2href("airport", locale);
  const groups = (["barcelona", "regional"] as const).map((group) => ({
    label: groupLabel(group, locale),
    lines: linesInGroup(group).map((l) => ({
      id: l.id,
      name: l.name,
      journey: `${l.origin} – ${l.destination}${l.via[locale] ? ` (${l.via[locale]})` : ""}`,
      href: locale === "en" ? null : linePath(locale, l.id),
    })),
  }));
  const stations = KEY_STATIONS.map((name) => ({
    name: locale === "en" && STATION_GLOSS[name] ? `${name} (${STATION_GLOSS[name]})` : name,
    lines: linesAt(name)
      .map((l) => l.name)
      .join(", "),
  })).filter((s) => s.lines);

  if (locale === "ca") {
    return {
      h1: meta.h1,
      lead: `Els avisos que Rodalies de Catalunya té publicats ara mateix a les seves ${LINES.length} línies, i una pàgina per línia amb les estacions, l'horari oficial, què fer si hi ha incidències i com reclamar un retard.`,
      readLine: `Línies i estacions llegides a Rodalies de Catalunya ${read}`,
      liveTitle: "Avisos de Rodalies ara mateix",
      linesTitle: "Les línies de Rodalies",
      linesNote: "Cada línia té la seva pàgina amb els avisos d'aquella línia, les estacions i on reclamar.",
      groups,
      stationsTitle: "Quines línies passen per cada estació",
      stationsNote: "Les estacions més buscades, amb les línies que s'hi aturen segons Rodalies de Catalunya.",
      stationHeaders: ["Estació", "Línies"],
      stations,
      visitorTitle: null,
      visitor: [],
      disruptionTitle: "Què fer si la teva línia té incidències",
      disruption: [
        `**Llegeix l'avís de la línia**, a dalt o a l'${link("estat oficial del servei", status)}. Quan Rodalies organitza un servei alternatiu per carretera, l'avís diu entre quines estacions.`,
        `**Si el tren no surt o s'atura pel camí**, tens dret a la devolució del bitllet o a fer el viatge amb un altre tren o un altre mitjà que posi l'operador.`,
        `**Els dies de vaga**, Rodalies funciona amb serveis mínims: mira ${link("què funciona els dies de vaga", strikes)}.`,
        `**Per telèfon**, Rodalies atén al ${PHONE}, gratuït, cada dia de 7 a 23 h.`,
      ],
      compensation: compensation(null, locale),
      relatedTitle: "Guies relacionades",
      related: [
        { label: "Vaga avui a Catalunya: què funciona", href: strikes },
        { label: "Targetes de transport de Barcelona (T-casual i altres)", href: transport },
        { label: "Horari del metro de Barcelona", href: hours },
        { label: "De l'aeroport al centre de Barcelona", href: airport },
      ],
      sourcesTitle: "Fonts",
      sourcesNote: `Dades oficials. Els avisos en directe es llegeixen en obrir la pàgina; la resta, ${read}.`,
      sources: sources(locale),
    };
  }
  if (locale === "es") {
    return {
      h1: meta.h1,
      lead: `Los avisos que Rodalies de Catalunya tiene publicados ahora mismo en sus ${LINES.length} líneas, y una página por línea con las estaciones, el horario oficial, qué hacer si hay incidencias y cómo reclamar un retraso.`,
      readLine: `Líneas y estaciones leídas en Rodalies de Catalunya ${read}`,
      liveTitle: "Avisos de Rodalies ahora mismo",
      linesTitle: "Las líneas de Rodalies",
      linesNote: "Cada línea tiene su página con los avisos de esa línea, las estaciones y dónde reclamar.",
      groups,
      stationsTitle: "Qué líneas pasan por cada estación",
      stationsNote: "Las estaciones más buscadas, con las líneas que paran en ellas según Rodalies de Catalunya.",
      stationHeaders: ["Estación", "Líneas"],
      stations,
      visitorTitle: null,
      visitor: [],
      disruptionTitle: "Qué hacer si tu línea tiene incidencias",
      disruption: [
        `**Lee el aviso de la línea**, arriba o en el ${link("estado oficial del servicio", status)}. Cuando Rodalies organiza un servicio alternativo por carretera, el aviso dice entre qué estaciones.`,
        "**Si el tren no sale o se para por el camino**, tienes derecho a la devolución del billete o a hacer el viaje en otro tren u otro medio que ponga el operador.",
        `**Los días de huelga**, Rodalies funciona con servicios mínimos: mira ${link("qué funciona los días de huelga", strikes)}.`,
        `**Por teléfono**, Rodalies atiende en el ${PHONE}, gratuito, todos los días de 7 a 23 h.`,
      ],
      compensation: compensation(null, locale),
      relatedTitle: "Guías relacionadas",
      related: [
        { label: "Huelga hoy en Cataluña: qué funciona", href: strikes },
        { label: "Tarjetas de transporte de Barcelona (T-casual y otras)", href: transport },
        { label: "Horario del metro de Barcelona", href: hours },
        { label: "Del aeropuerto al centro de Barcelona", href: airport },
      ],
      sourcesTitle: "Fuentes",
      sourcesNote: `Datos oficiales. Los avisos en directo se leen al abrir la página; el resto, ${read}.`,
      sources: sources(locale),
    };
  }
  return {
    h1: meta.h1,
    lead: `Rodalies de Catalunya covers the Barcelona commuter lines and the regional lines towards Girona, Tarragona and Lleida. Below are the notices it has published right now on its ${LINES.length} lines, which line goes where, and what to do if your train is late or cancelled.`,
    readLine: `Lines and stations read from Rodalies de Catalunya on ${read}`,
    liveTitle: "Rodalies notices right now",
    linesTitle: "The Rodalies lines",
    linesNote: "Every line with its two ends, as Rodalies de Catalunya lists them.",
    groups,
    stationsTitle: "Which line goes where",
    stationsNote: "The stations visitors ask about most, with the lines that stop there according to Rodalies de Catalunya.",
    stationHeaders: ["Station", "Lines"],
    stations,
    visitorTitle: "Before you travel",
    visitor: [
      `**From the airport**, the train is the R2 Nord from Terminal 2: times, fares and the other options are in ${link("our airport to city centre guide", airport)}.`,
      `**Tickets:** which pass covers Rodalies in Barcelona, and for how many zones, is in ${link("Barcelona transport passes", transport)}.`,
      `**Strike days:** Rodalies runs minimum services; see ${link("what runs on strike days", strikes)}.`,
      `**Help:** Rodalies answers on ${PHONE}, free, 7:00 to 23:00 every day. Notices are also posted on the line accounts on X and on the ${link("Rodalies WhatsApp channel", officialUrl.whatsapp)}.`,
    ],
    disruptionTitle: "If your line is disrupted",
    disruption: [
      `**Read the line's notice**, above or on the ${link("official service status", status)}. When Rodalies lays on replacement buses, the notice says between which stations.`,
      "**If your train does not leave or stops on the way**, you are entitled to a refund or to be taken on by another train or vehicle the operator provides.",
    ],
    compensation: compensation(null, locale),
    relatedTitle: "Related guides",
    related: [
      { label: "Barcelona airport to the city centre", href: airport },
      { label: "Barcelona transport passes", href: transport },
      { label: "Barcelona metro hours", href: hours },
      { label: "Strikes in Barcelona and Catalonia today", href: strikes },
    ],
    sourcesTitle: "Sources",
    sourcesNote: `Official data. Live notices are read when you open the page; everything else on ${read}.`,
    sources: sources(locale),
  };
}
