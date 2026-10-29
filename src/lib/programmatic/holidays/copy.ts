import { NEXT, SNAPSHOT, YEAR } from "./data";
import { dayMonth, dayMonthYear, weekdayDayMonth, type DateLocale } from "./format";
import { caA, caDe, caStart, esName, joinList } from "./names";
import type { MuniLocale } from "./paths";
import type { SnapshotMunicipality } from "./types";

/**
 * Words for the holiday pages. Every date and count is passed in from the
 * snapshot; nothing here knows what day it is.
 */

export const TITLE_MAX = 60;
export const DESCRIPTION_MAX = 155;

/** First candidate that fits. The last one is the shortest form and always used. */
function fit(candidates: string[], max: number): string {
  return candidates.find((c) => c.length <= max) ?? candidates.at(-1) ?? "";
}

/** The name as it reads mid-sentence in each language. */
export function displayName(m: Pick<SnapshotMunicipality, "name">, locale: MuniLocale): string {
  return locale === "es" ? esName(m.name) : m.name;
}

/* -------------------------------------------------------------------------- */
/* Municipality page: metadata                                                */
/* -------------------------------------------------------------------------- */

export function municipalityTitle(m: SnapshotMunicipality, locale: MuniLocale): string {
  const name = displayName(m, locale);
  return locale === "ca"
    ? fit([`Festius locals ${name} ${YEAR} i ${NEXT}: quins dies són festa`, `Festius locals ${name} ${YEAR} i ${NEXT}`, `Festius ${name} ${YEAR} i ${NEXT}`], TITLE_MAX)
    : fit([`Festivos locales ${name} ${YEAR} y ${NEXT}: qué días son festivo`, `Festivos locales ${name} ${YEAR} y ${NEXT}`, `Festivos ${name} ${YEAR} y ${NEXT}`], TITLE_MAX);
}

export function municipalityH1(m: SnapshotMunicipality, locale: MuniLocale): string {
  return locale === "ca" ? `Festius locals ${caDe(m.name)} ${YEAR} i ${NEXT}` : `Festivos locales de ${esName(m.name)} ${YEAR} y ${NEXT}`;
}

function localList(dates: string[], locale: DateLocale): string {
  return joinList(dates.map((d) => dayMonth(d, locale)), locale === "en" ? "en" : locale);
}

export function municipalityDescription(m: SnapshotMunicipality, locale: MuniLocale): string {
  const name = displayName(m, locale);
  const own = m.local.length > 0;
  // Nuclei only: with two nuclei their days fit ("Bigues, 20 de gener i 29 de
  // juny; Riells del Fai, …"); with more, or if that is too long, "by nucleus".
  const byNucleus = (lang: MuniLocale) =>
    m.nuclei.length <= 2 ? m.nuclei.map((n) => `${lang === "es" ? esName(n.name) : n.name}, ${localList(n.dates, lang)}`).join("; ") : null;
  if (locale === "ca") {
    const candidates = (days: string) => [
      `Festius locals ${caDe(m.name)} el ${YEAR}: ${days}. Tots els festius de l'any, si avui és festiu, botigues obertes i el ${NEXT}.`,
      `Festius locals ${caDe(m.name)} el ${YEAR}: ${days}. Tots els festius de l'any i si avui és festiu.`,
      `Festius locals ${caDe(m.name)} el ${YEAR}: ${days}.`,
    ];
    const nuclei = own ? null : byNucleus("ca");
    const days = own ? localList(m.local, "ca") : nuclei && candidates(nuclei).at(-1)!.length <= DESCRIPTION_MAX ? nuclei : "segons el nucli";
    return fit(candidates(days), DESCRIPTION_MAX);
  }
  const candidates = (days: string) => [
    `Festivos locales de ${name} en ${YEAR}: ${days}. Todos los festivos del año, si hoy es festivo, tiendas abiertas y ${NEXT}.`,
    `Festivos locales de ${name} en ${YEAR}: ${days}. Todos los festivos del año y si hoy es festivo.`,
    `Festivos locales de ${name} en ${YEAR}: ${days}.`,
  ];
  const nuclei = own ? null : byNucleus("es");
  const days = own ? localList(m.local, "es") : nuclei && candidates(nuclei).at(-1)!.length <= DESCRIPTION_MAX ? nuclei : "según el núcleo";
  return fit(candidates(days), DESCRIPTION_MAX);
}

/* -------------------------------------------------------------------------- */
/* Municipality page: body                                                    */
/* -------------------------------------------------------------------------- */

const LOCAL_ORDER = { ca: "l'Ordre EMT/208/2025 (DOGC del 17 de desembre de 2025)", es: "la Orden EMT/208/2025 (DOGC del 17 de diciembre de 2025)" };
const AMENDMENT = { ca: "modificada per l'Ordre EMT/3/2026 (DOGC del 20 de gener de 2026)", es: "modificada por la Orden EMT/3/2026 (DOGC del 20 de enero de 2026)" };

function wdList(dates: string[], locale: MuniLocale): string {
  const art = locale === "ca" ? "el" : "el";
  return joinList(dates.map((d) => `${art} ${weekdayDayMonth(d, locale)}`), locale);
}

export interface MunicipalityCopy {
  breadcrumbHub: string;
  lead: string;
  source: string;
  correction: string | null;
  nucleiLead: string | null;
  statusTitle: string;
  tableTitle: string;
  tableCaption: string;
  cols: { date: string; weekday: string; name: string; scope: string; place: string; days: string };
  scope: { catalonia: string; local: string; aran: string };
  nucleiTitle: string;
  nextTitle: string;
  nextPending: string[];
  nextPublished: string | null;
  nextRegionalLead: string;
  shopsTitle: string;
  shopsLead: string;
  shopsLocal: string[];
  shopsNote: string;
  meaningTitle: string;
  work: { title: string; text: string };
  school: { title: string; text: string };
  shopsMeaning: { title: string; text: string };
  siblingsTitle: string;
  othersTitle: string;
  guidesTitle: string;
  sourcesTitle: string;
}

export function municipalityCopy(m: SnapshotMunicipality, locale: MuniLocale, next: { local: string[] } | null, comarcaLabel: string): MunicipalityCopy {
  const name = displayName(m, locale);
  const corrected = m.correction?.by === "Ordre EMT/3/2026";
  const shopsOnLocal = (d: string) => m.shops.includes(d);

  if (locale === "ca") {
    const lead =
      m.local.length === 2
        ? `${caStart(caA(m.name))} els dos festius locals del ${YEAR} són ${wdList(m.local, "ca")}. S'hi sumen els dotze festius de tot Catalunya.`
        : m.local.length === 1
          ? `${caStart(caA(m.name))} el festiu local del ${YEAR} és ${wdList(m.local, "ca")}. S'hi sumen els dotze festius de tot Catalunya.`
          : `${caStart(caA(m.name))} l'ordre de festes locals no fixa dies per a tot el municipi: cada nucli té els seus dos festius locals, que són a la taula de sota. S'hi sumen els dotze festius de tot Catalunya.`;
    return {
      breadcrumbHub: "Festius locals",
      lead,
      source: `Ho fixa ${LOCAL_ORDER.ca}${corrected ? `, ${AMENDMENT.ca}` : ""}.`,
      correction: m.correction
        ? `${m.correction.openData.length ? `Les dades obertes de la Generalitat encara diuen ${localList(m.correction.openData, "ca")}` : "Les dades obertes de la Generalitat encara no en recullen cap dia"}; el text oficial del DOGC diu ${localList(m.local, "ca")}, i és el que fem servir.`
        : null,
      nucleiLead:
        m.nuclei.length > 0 && m.local.length > 0
          ? `${m.nuclei.length === 1 ? "Un nucli del municipi té" : "Alguns nuclis del municipi tenen"} festius locals propis: ${joinList(m.nuclei.map((n) => `${n.name} (${localList(n.dates, "ca")})`), "ca")}.`
          : null,
      statusTitle: `És festiu avui ${caA(m.name)}?`,
      tableTitle: `Tots els festius del ${YEAR} ${caA(m.name)}`,
      tableCaption: `Festius de Catalunya i festius locals ${caDe(m.name)}, ${YEAR}`,
      cols: { date: "Data", weekday: "Dia", name: "Festa", scope: "Àmbit", place: "Nucli", days: `Festius locals ${YEAR}` },
      scope: { catalonia: "Tot Catalunya", local: "Local", aran: "Aran" },
      nucleiTitle: m.local.length > 0 ? "Nuclis amb festius propis" : `Festius locals de cada nucli ${caDe(m.name)}`,
      nextTitle: `I el ${NEXT}?`,
      nextPending: [
        `Els festius locals ${caDe(m.name)} per al ${NEXT} encara no s'han publicat. Cada any els fixa una ordre del Departament d'Empresa i Treball, a proposta de cada ajuntament; la del ${YEAR} va sortir al DOGC el 17 de desembre de 2025.`,
        `Quan es publiqui l'ordre del ${NEXT}, n'afegirem els dos dies aquí. Mentrestant, no els dones per repetits: els ajuntaments canvien de dia més sovint del que sembla.`,
      ],
      nextPublished: next ? `Els festius locals ${caDe(m.name)} el ${NEXT} són ${wdList(next.local, "ca")}.` : null,
      nextRegionalLead: `Els dotze festius de tot Catalunya del ${NEXT} ja són oficials (Ordre EMT/52/2026):`,
      shopsTitle: `Botigues obertes en festius ${caA(m.name)} el ${YEAR}`,
      shopsLead: m.shopsOwnList
        ? `${caStart(name)} consta a la Resolució EMT/4342/2025, que publica el calendari dels ajuntaments que han triat els seus dies. Les botigues hi poden obrir aquests deu diumenges i festius del ${YEAR}:`
        : `${caStart(name)} no consta a la Resolució EMT/4342/2025, de manera que s'hi apliquen els deu dies per defecte: els vuit del calendari general i l'11 de gener i el 8 de desembre (Ordre EMT/77/2025, articles 1 i 6). Les botigues hi poden obrir aquests diumenges i festius:`,
      shopsLocal: m.local.map((d) =>
        shopsOnLocal(d)
          ? `El ${weekdayDayMonth(d, "ca")}, festa local, és també un dels dies en què les botigues poden obrir.`
          : `El ${weekdayDayMonth(d, "ca")}, festa local, no és dia d'obertura comercial: les botigues amb horari general no hi poden obrir.`,
      ),
      shopsNote:
        "Poder obrir no vol dir que obrin: cada botiga decideix. Fleques, pastisseries, botigues de conveniència, floristeries, farmàcies, les botigues de dins de les estacions i, als municipis declarats turístics, les botigues durant el període aprovat, entre d'altres, queden fora d'aquests límits (Llei 18/2017, article 37).",
      meaningTitle: `Què vol dir que sigui festa local ${caA(m.name)}`,
      work: {
        title: "A la feina",
        text: `És un dia festiu retribuït i no recuperable, igual que els de tot Catalunya. Compta el municipi on hi ha el centre de treball, no el d'on vius: si treballes ${caA(m.name)}, fas els seus festius locals encara que visquis en un altre municipi. Si et toca treballar-hi, com es compensa ho diu el teu conveni.`,
      },
      school: {
        title: "A l'escola",
        text: `Les escoles ${caDe(m.name)} no fan classe els dies de festa local: el calendari escolar compta com a festius els del calendari laboral i els dos de festa local del municipi. A més, cada centre tria quatre dies de lliure disposició, i el consell escolar municipal en proposa uns per a tots els centres; per això dues escoles del mateix municipi poden fer festa dies diferents. Si una festa local cau en un dia sense classe, el centre la pot afegir als de lliure disposició (Ordre EDF/66/2026).`,
      },
      shopsMeaning: {
        title: "A les botigues",
        text: "Un festiu local no obre ni tanca res per si sol: les botigues amb horari general només poden obrir els deu diumenges i festius de la llista de dalt, i cap ni un altre.",
      },
      siblingsTitle: `Festius locals d'altres municipis ${caDe(comarcaLabel)}`,
      othersTitle: "Festius locals d'altres municipis",
      guidesTitle: "Més sobre festius",
      sourcesTitle: "Fonts",
    };
  }

  const lead =
    m.local.length === 2
      ? `En ${name} los dos festivos locales de ${YEAR} son ${wdList(m.local, "es")}. Se suman a los doce festivos de toda Cataluña.`
      : m.local.length === 1
        ? `En ${name} el festivo local de ${YEAR} es ${wdList(m.local, "es")}. Se suma a los doce festivos de toda Cataluña.`
        : `En ${name} la orden de fiestas locales no fija días para todo el municipio: cada núcleo tiene sus dos festivos locales, que están en la tabla de abajo. Se suman a los doce festivos de toda Cataluña.`;
  return {
    breadcrumbHub: "Festivos locales",
    lead,
    source: `Lo fija ${LOCAL_ORDER.es}${corrected ? `, ${AMENDMENT.es}` : ""}.`,
    correction: m.correction
      ? `${m.correction.openData.length ? `Los datos abiertos de la Generalitat todavía dicen ${localList(m.correction.openData, "es")}` : "Los datos abiertos de la Generalitat todavía no recogen ningún día"}; el texto oficial del DOGC dice ${localList(m.local, "es")}, y es el que usamos.`
      : null,
    nucleiLead:
      m.nuclei.length > 0 && m.local.length > 0
        ? `${m.nuclei.length === 1 ? "Un núcleo del municipio tiene" : "Algunos núcleos del municipio tienen"} festivos locales propios: ${joinList(m.nuclei.map((n) => `${n.name} (${localList(n.dates, "es")})`), "es")}.`
        : null,
    statusTitle: `¿Es festivo hoy en ${name}?`,
    tableTitle: `Todos los festivos de ${YEAR} en ${name}`,
    tableCaption: `Festivos de Cataluña y festivos locales de ${name}, ${YEAR}`,
    cols: { date: "Fecha", weekday: "Día", name: "Fiesta", scope: "Ámbito", place: "Núcleo", days: `Festivos locales ${YEAR}` },
    scope: { catalonia: "Toda Cataluña", local: "Local", aran: "Arán" },
    nucleiTitle: m.local.length > 0 ? "Núcleos con festivos propios" : `Festivos locales de cada núcleo de ${name}`,
    nextTitle: `¿Y en ${NEXT}?`,
    nextPending: [
      `Los festivos locales de ${name} para ${NEXT} todavía no se han publicado. Cada año los fija una orden del Departament d'Empresa i Treball, a propuesta de cada ayuntamiento; la de ${YEAR} salió en el DOGC el 17 de diciembre de 2025.`,
      `Cuando se publique la orden de ${NEXT}, añadiremos aquí los dos días. Mientras tanto, no los des por repetidos: los ayuntamientos cambian de día más a menudo de lo que parece.`,
    ],
    nextPublished: next ? `Los festivos locales de ${name} en ${NEXT} son ${wdList(next.local, "es")}.` : null,
    nextRegionalLead: `Los doce festivos de toda Cataluña de ${NEXT} ya son oficiales (Orden EMT/52/2026):`,
    shopsTitle: `Tiendas abiertas en festivos en ${name} en ${YEAR}`,
    shopsLead: m.shopsOwnList
      ? `${name} figura en la Resolución EMT/4342/2025, que publica el calendario de los ayuntamientos que han elegido sus días. Las tiendas pueden abrir estos diez domingos y festivos de ${YEAR}:`
      : `${name} no figura en la Resolución EMT/4342/2025, así que se aplican los diez días por defecto: los ocho del calendario general más el 11 de enero y el 8 de diciembre (Orden EMT/77/2025, artículos 1 y 6). Las tiendas pueden abrir estos domingos y festivos:`,
    shopsLocal: m.local.map((d) =>
      shopsOnLocal(d)
        ? `El ${weekdayDayMonth(d, "es")}, fiesta local, es también uno de los días en que las tiendas pueden abrir.`
        : `El ${weekdayDayMonth(d, "es")}, fiesta local, no es día de apertura comercial: las tiendas con horario general no pueden abrir.`,
    ),
    shopsNote:
      "Poder abrir no quiere decir que abran: cada tienda decide. Panaderías, pastelerías, tiendas de conveniencia, floristerías, farmacias, las tiendas del interior de las estaciones y, en los municipios declarados turísticos, las tiendas durante el periodo aprobado, entre otras, quedan fuera de estos límites (Ley catalana 18/2017, artículo 37).",
    meaningTitle: `Qué significa que sea fiesta local en ${name}`,
    work: {
      title: "En el trabajo",
      text: `Es un día festivo retribuido y no recuperable, igual que los de toda Cataluña. Cuenta el municipio donde está el centro de trabajo, no el de residencia: si trabajas en ${name}, haces sus festivos locales aunque vivas en otro municipio. Si te toca trabajar, cómo se compensa lo dice tu convenio.`,
    },
    school: {
      title: "En la escuela",
      text: `Las escuelas de ${name} no tienen clase los días de fiesta local: el calendario escolar cuenta como festivos los del calendario laboral y los dos de fiesta local del municipio. Además, cada centro elige cuatro días de libre disposición, y el consejo escolar municipal propone unos para todos los centros; por eso dos escuelas del mismo municipio pueden hacer fiesta en días distintos. Si una fiesta local cae en un día sin clase, el centro puede añadirla a los de libre disposición (Orden EDF/66/2026).`,
    },
    shopsMeaning: {
      title: "En las tiendas",
      text: "Un festivo local no abre ni cierra nada por sí solo: las tiendas con horario general solo pueden abrir los diez domingos y festivos de la lista de arriba, y ningún otro.",
    },
    siblingsTitle: `Festivos locales en otros municipios de la comarca (${comarcaLabel})`,
    othersTitle: "Festivos locales en otros municipios",
    guidesTitle: "Más sobre festivos",
    sourcesTitle: "Fuentes",
  };
}

/**
 * Lead-in to the date page that lists everyone with the same local day:
 * "El dimecres 11 de novembre també és festa local a 49 llocs més de Catalunya:".
 * When only some nuclei have the day, they are named first: "El dilluns 30 de
 * novembre és festa local a Vilallobent i a 37 llocs més de Catalunya:".
 */
export function sharedDayLead(date: string, others: number, locale: MuniLocale, nuclei: string[] = []): string {
  const day = weekdayDayMonth(date, locale);
  const where = joinList(nuclei.map((n) => (locale === "es" ? esName(n) : n)), locale);
  if (locale === "ca") {
    const more = `${others} ${others === 1 ? "lloc" : "llocs"} més de Catalunya`;
    if (where) return others > 0 ? `El ${day} és festa local a ${where} i a ${more}:` : `El ${day} és festa local a ${where} i enlloc més de Catalunya:`;
    return others > 0 ? `El ${day} també és festa local a ${more}:` : `El ${day} no és festa local enlloc més de Catalunya:`;
  }
  const more = others === 1 ? "1 lugar más de Cataluña" : `otros ${others} lugares de Cataluña`;
  if (where) return others > 0 ? `El ${day} es fiesta local en ${where} y en ${more}:` : `El ${day} es fiesta local en ${where} y en ningún otro lugar de Cataluña:`;
  return others > 0 ? `El ${day} también es fiesta local en ${more}:` : `El ${day} no es fiesta local en ningún otro lugar de Cataluña:`;
}

/* -------------------------------------------------------------------------- */
/* Hub                                                                        */
/* -------------------------------------------------------------------------- */

export function hubCopy(locale: MuniLocale) {
  const count = SNAPSHOT.municipalities.length;
  const excluded = SNAPSHOT.excluded.map((e) => (locale === "es" ? esName(e.name) : e.name));
  if (locale === "ca") {
    return {
      title: fit([`Festius locals ${YEAR} i ${NEXT} per municipis de Catalunya`, `Festius locals ${YEAR} per municipi`], TITLE_MAX),
      description: `Festius locals del ${YEAR} dels municipis més poblats de Catalunya, per comarques: els dos dies de cada ajuntament, si avui és festiu i el ${NEXT}.`,
      h1: `Festius locals ${YEAR} per municipi`,
      breadcrumb: "Festius locals",
      lead: `Cada municipi de Catalunya fixa dos festius locals, que se sumen als dotze de tot Catalunya. Aquí hi ha els del ${YEAR} dels ${count} municipis més poblats que en tenen al calendari oficial, per comarques, cadascun amb la seva pàgina: tots els festius de l'any, si avui és festiu, les botigues obertes i el ${NEXT}.`,
      allMunicipalities: "Per a qualsevol altre municipi, la llista completa és a la pàgina de festius locals de tots els municipis.",
      excludedNote: excluded.length
        ? `${joinList(excluded, "ca")} ${excluded.length === 1 ? "no té" : "no tenen"} festius locals al calendari oficial del ${YEAR}: l'ordre hi diu «proposta no formulada» (l'ajuntament no va enviar la proposta a temps) i la modificació de gener no ho va canviar.`
        : null,
      datesTitle: "És festiu…?",
      jump: "Per comarques:",
      population: `Municipis per població a 1 de gener de ${SNAPSHOT.sources.population.year} (Idescat).`,
      next: `Els festius locals del ${NEXT} encara no s'han publicat; l'ordre del ${YEAR} va sortir al DOGC el 17 de desembre de 2025.`,
      guidesTitle: "Més sobre festius",
      sourcesTitle: "Fonts",
    };
  }
  return {
    title: fit([`Festivos locales ${YEAR} y ${NEXT} por municipios de Cataluña`, `Festivos locales ${YEAR} por municipio`], TITLE_MAX),
    description: `Festivos locales de ${YEAR} de los municipios más poblados de Cataluña, por comarcas: los dos días de cada ayuntamiento, si hoy es festivo y ${NEXT}.`,
    h1: `Festivos locales ${YEAR} por municipio`,
    breadcrumb: "Festivos locales",
    lead: `Cada municipio de Cataluña fija dos festivos locales, que se suman a los doce de toda Cataluña. Aquí están los de ${YEAR} de los ${count} municipios más poblados que los tienen en el calendario oficial, por comarcas, cada uno con su página: todos los festivos del año, si hoy es festivo, las tiendas abiertas y ${NEXT}.`,
    allMunicipalities: "Para cualquier otro municipio, la lista completa está en la página de festivos locales de todos los municipios.",
    excludedNote: excluded.length
      ? `${joinList(excluded, "es")} no ${excluded.length === 1 ? "tiene" : "tienen"} festivos locales en el calendario oficial de ${YEAR}: la orden dice «proposta no formulada» (el ayuntamiento no envió la propuesta a tiempo) y la modificación de enero no lo cambió.`
      : null,
    datesTitle: "¿Es festivo el…?",
    jump: "Por comarcas:",
    population: `Municipios por población a 1 de enero de ${SNAPSHOT.sources.population.year} (Idescat).`,
    next: `Los festivos locales de ${NEXT} todavía no se han publicado; la orden de ${YEAR} salió en el DOGC el 17 de diciembre de 2025.`,
    guidesTitle: "Más sobre festivos",
    sourcesTitle: "Fuentes",
  };
}

/* -------------------------------------------------------------------------- */
/* Date pages                                                                 */
/* -------------------------------------------------------------------------- */

/** "És festiu el 8 de desembre de 2026 a Catalunya?" */
export function dateQuestion(iso: string, locale: DateLocale): string {
  if (locale === "ca") {
    const day = Number(iso.slice(8, 10));
    const art = day === 1 || day === 11 ? "l'" : "el ";
    return `És festiu ${art}${dayMonthYear(iso, "ca")} a Catalunya?`;
  }
  if (locale === "es") return `¿Es festivo el ${dayMonthYear(iso, "es")} en Cataluña?`;
  return `Is ${dayMonthYear(iso, "en")} a public holiday in Catalonia?`;
}

export const DATE_UI: Record<DateLocale, {
  breadcrumbParent: string;
  yes: string;
  no: string;
  localTitle: string;
  shopsTitle: string;
  transportTitle: string;
  schoolTitle: string;
  otherDates: string;
  guidesTitle: string;
  sourcesTitle: string;
  municipalityLink: string;
}> = {
  ca: {
    breadcrumbParent: "Festius locals",
    yes: "Sí",
    no: "No",
    localTitle: "Festius locals d'aquest dia",
    shopsTitle: "Botigues",
    transportTitle: "Transport",
    schoolTitle: "Escoles",
    otherDates: "Altres dies",
    guidesTitle: "Més sobre festius",
    sourcesTitle: "Fonts",
    municipalityLink: "Festius locals per municipi",
  },
  es: {
    breadcrumbParent: "Festivos locales",
    yes: "Sí",
    no: "No",
    localTitle: "Festivos locales de ese día",
    shopsTitle: "Tiendas",
    transportTitle: "Transporte",
    schoolTitle: "Escuelas",
    otherDates: "Otros días",
    guidesTitle: "Más sobre festivos",
    sourcesTitle: "Fuentes",
    municipalityLink: "Festivos locales por municipio",
  },
  en: {
    breadcrumbParent: "Is today a holiday in Catalonia?",
    yes: "Yes",
    no: "No",
    localTitle: "Local holidays that day",
    shopsTitle: "Shops",
    transportTitle: "Getting around",
    schoolTitle: "Schools",
    otherDates: "Other dates",
    guidesTitle: "More on holidays",
    sourcesTitle: "Sources",
    municipalityLink: "Local holidays by town (Catalan and Spanish)",
  },
};
