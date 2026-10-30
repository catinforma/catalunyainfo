import { NEXT, SNAPSHOT, YEAR, isAran, regionalDays, sharedDates, type ComarcaGroup } from "./data";
import { LOCAL_DATE_PAGES } from "./dates";
import { caDayArticle, dayMonth, dayMonthYear, weekdayDayMonth, type DateLocale } from "./format";
import { caA, caComarca, caDe, caStart, esName, joinList } from "./names";
import { datePath, type MuniLocale } from "./paths";
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

/**
 * Two query families land on these pages (Search Console, 30 Oct 2026):
 * "festivos tarragona 2027" / "calendario laboral reus 2027" and "hoy es
 * festivo en girona" / "mañana es festivo en girona". The title carries both:
 * the town and the years first, then the question the status block answers.
 * The old tail ("qué días son festivo") promised nothing.
 */
export function municipalityTitle(m: SnapshotMunicipality, locale: MuniLocale): string {
  const name = displayName(m, locale);
  // The last form is for the one name too long for both years (Cruïlles,
  // Monells i Sant Sadurní de l'Heura, 43 characters).
  return locale === "ca"
    ? fit(
        [
          `Festius locals ${name} ${YEAR} i ${NEXT}: avui és festiu?`,
          `Festius ${name} ${YEAR} i ${NEXT}: avui és festiu?`,
          `Festius locals ${name} ${YEAR} i ${NEXT}`,
          `Festius ${name} ${YEAR} i ${NEXT}`,
          `Festius ${name} ${YEAR}`,
        ],
        TITLE_MAX,
      )
    : fit(
        [
          `Festivos locales ${name} ${YEAR} y ${NEXT}: ¿hoy es festivo?`,
          `Festivos ${name} ${YEAR} y ${NEXT}: ¿hoy es festivo?`,
          `Festivos locales ${name} ${YEAR} y ${NEXT}`,
          `Festivos ${name} ${YEAR} y ${NEXT}`,
          `Festivos ${name} ${YEAR}`,
        ],
        TITLE_MAX,
      );
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
  // The answer (the two dates) first, then the 2027 calendar and today/tomorrow.
  if (locale === "ca") {
    const candidates = (days: string) => [
      `Festius locals ${caDe(m.name)} el ${YEAR}: ${days}. Calendari laboral ${NEXT}, si avui o demà és festiu i botigues obertes.`,
      `Festius locals ${caDe(m.name)} el ${YEAR}: ${days}. Calendari laboral ${NEXT} i si avui o demà és festiu.`,
      `Festius locals ${caDe(m.name)} el ${YEAR}: ${days}. Si avui o demà és festiu.`,
      `Festius locals ${caDe(m.name)} el ${YEAR}: ${days}.`,
    ];
    const nuclei = own ? null : byNucleus("ca");
    const days = own ? localList(m.local, "ca") : nuclei && candidates(nuclei).at(-1)!.length <= DESCRIPTION_MAX ? nuclei : "segons el nucli";
    return fit(candidates(days), DESCRIPTION_MAX);
  }
  const candidates = (days: string) => [
    `Festivos locales de ${name} en ${YEAR}: ${days}. Calendario laboral ${NEXT}, si hoy o mañana es festivo y tiendas abiertas.`,
    `Festivos locales de ${name} en ${YEAR}: ${days}. Calendario laboral ${NEXT} y si hoy o mañana es festivo.`,
    `Festivos locales de ${name} en ${YEAR}: ${days}. Si hoy o mañana es festivo.`,
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

/** "el 25 de maig i el 7 de setembre", "l'11 de novembre", "el 25 de mayo y el 7 de septiembre". */
function artList(dates: string[], locale: MuniLocale): string {
  return joinList(dates.map((d) => `${locale === "ca" ? caDayArticle(d) : "el "}${dayMonth(d, locale)}`), locale);
}

/**
 * Where the open data disagrees with the DOGC. Three shapes: other days, no
 * days at all, or days for the whole municipality where the order sets them
 * nucleus by nucleus (Avinyonet del Penedès).
 */
function correctionText(m: SnapshotMunicipality, locale: MuniLocale): string | null {
  const c = m.correction;
  if (!c) return null;
  if (locale === "ca") {
    const open = c.openData.length ? `Les dades obertes de la Generalitat encara diuen ${localList(c.openData, "ca")}` : "Les dades obertes de la Generalitat encara no en recullen cap dia";
    const dogc = m.local.length ? `el text oficial del DOGC diu ${localList(m.local, "ca")}` : "el text oficial del DOGC no fixa dies per a tot el municipi, sinó per a cada nucli";
    return `${open}; ${dogc}, i és el que fem servir.`;
  }
  const open = c.openData.length ? `Los datos abiertos de la Generalitat todavía dicen ${localList(c.openData, "es")}` : "Los datos abiertos de la Generalitat todavía no recogen ningún día";
  const dogc = m.local.length ? `el texto oficial del DOGC dice ${localList(m.local, "es")}` : "el texto oficial del DOGC no fija días para todo el municipio, sino para cada núcleo";
  return `${open}; ${dogc}, y es el que usamos.`;
}

/** Nuclei the open data gives days the order does not (Butsènit in Montgai): what each source says. */
function unlistedText(m: SnapshotMunicipality, locale: MuniLocale): string | null {
  const unlisted = m.unlisted ?? [];
  if (unlisted.length === 0) return null;
  const [first] = unlisted;
  if (locale === "ca") {
    const who =
      unlisted.length === 1
        ? `al nucli de ${first!.name} ${artList(first!.dates, "ca")}`
        : `als nuclis de ${joinList(unlisted.map((n) => `${n.name} (${artList(n.dates, "ca")})`), "ca")}`;
    return `Les dades obertes de la Generalitat donen ${who}, però l'ordre del DOGC no ${unlisted.length === 1 ? "l'esmenta" : "els esmenta"}: només fixa els dies del municipi, que són els d'aquesta pàgina.`;
  }
  const who =
    unlisted.length === 1
      ? `al núcleo de ${esName(first!.name)} ${artList(first!.dates, "es")}`
      : `a los núcleos de ${joinList(unlisted.map((n) => `${esName(n.name)} (${artList(n.dates, "es")})`), "es")}`;
  return `Los datos abiertos de la Generalitat dan ${who}, pero la orden del DOGC no ${unlisted.length === 1 ? "lo menciona" : "los menciona"}: solo fija los días del municipio, que son los de esta página.`;
}

/** The link from a town page to its comarca's table. */
export function comarcaLinkLabel(comarca: string, towns: number, locale: MuniLocale): string {
  return locale === "ca"
    ? `Festius locals ${caDe(caComarca(comarca))}: els ${towns} municipis, en una taula`
    : `Festivos locales ${comarca}: los ${towns} municipios, en una tabla`;
}

export interface MunicipalityCopy {
  breadcrumbHub: string;
  lead: string;
  source: string;
  correction: string | null;
  /** Nuclei with days in the open data that the order does not name. */
  unlisted: string | null;
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
      correction: correctionText(m, "ca"),
      unlisted: unlistedText(m, "ca"),
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
    correction: correctionText(m, "es"),
    unlisted: unlistedText(m, "es"),
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

/* -------------------------------------------------------------------------- */
/* Municipality page: questions in the searchers' words                       */
/* -------------------------------------------------------------------------- */

export interface MunicipalityFaqItem {
  question: string;
  answer: string;
  /** One link after the answer: the date page that lists every place off that day. */
  link?: { href: string; label: string };
}

/**
 * "hoy es festivo en girona", "mañana es festivo en girona", "calendario
 * laboral tarragona 2027", "el lunes 2 de noviembre es festivo en barcelona":
 * the four shapes Search Console shows on these pages, answered from the
 * snapshot (DOGC orders). The two date questions are the next working days
 * with a date page, from `today` (the build date: the pages are static, and
 * each question names its date, so a past one stays true).
 */
export function municipalityFaq(m: SnapshotMunicipality, locale: MuniLocale, next: { local: string[] } | null, today: string): MunicipalityFaqItem[] {
  const name = displayName(m, locale);
  const own = m.local.length > 0;
  const aran = isAran(m);
  const regionalNext = joinList(regionalDays(NEXT, aran).map((d) => dayMonth(d.date, locale)), locale);
  const asked = Object.keys(LOCAL_DATE_PAGES)
    .filter((iso) => iso >= today)
    .sort()
    .slice(0, 2);

  const dateItem = (iso: string): MunicipalityFaqItem => {
    const wd = weekdayDayMonth(iso, locale);
    const places = SNAPSHOT.localByDate[iso] ?? [];
    const nucleiHere = m.nuclei.filter((n) => n.dates.includes(iso)).map((n) => n.name);
    const page = LOCAL_DATE_PAGES[iso]!;
    const link = { href: datePath(locale, page), label: dateQuestion(page, locale) };
    if (locale === "ca") {
      const answer = m.local.includes(iso)
        ? `Sí: és festa local ${caA(m.name)}, un dels seus dos festius del ${YEAR}.`
        : nucleiHere.length
          ? `Només en part del municipi: és festa local a ${joinList(nucleiHere, "ca")}. A la resta ${caDe(m.name)} és feiner.`
          : `No: ${caA(m.name)} és feiner. És festa local a ${places.length} ${places.length === 1 ? "lloc" : "llocs"} de Catalunya, i no a tot Catalunya.`;
      return { question: `El ${wd} és festiu ${caA(m.name)}?`, answer, link };
    }
    const answer = m.local.includes(iso)
      ? `Sí: es fiesta local en ${name}, uno de sus dos festivos de ${YEAR}.`
      : nucleiHere.length
        ? `Solo en parte del municipio: es fiesta local en ${joinList(nucleiHere.map(esName), "es")}. En el resto de ${name} es laborable.`
        : `No: en ${name} es laborable. Es fiesta local en ${places.length} ${places.length === 1 ? "lugar" : "lugares"} de Cataluña, no en toda Cataluña.`;
    return { question: `¿El ${wd} es festivo en ${name}?`, answer, link };
  };

  if (locale === "ca") {
    const locals = own ? `els seus dos festius locals, ${wdList(m.local, "ca")}` : "els festius locals del seu nucli, que són a la taula";
    return [
      {
        question: `Avui és festiu ${caA(m.name)}?`,
        answer: `El requadre «${`És festiu avui ${caA(m.name)}?`}» de dalt ho calcula amb la data d'avui i l'hora de Catalunya. El ${YEAR}, ${caA(m.name)} són festius ${aran ? "els dotze dies generals, amb la Festa d'Aran," : "els dotze dies de tot Catalunya"} i ${locals}.`,
      },
      {
        question: `Demà és festiu ${caA(m.name)}?`,
        answer: `Ho diu la línia «Demà» del mateix requadre, que també indica el pròxim festiu i quants dies falten. Demà només és festiu ${caA(m.name)} si és un dels festius de la taula: els dotze de tot Catalunya o les festes locals del municipi.`,
      },
      {
        question: `Quin és el calendari laboral ${NEXT} ${caDe(m.name)}?`,
        answer: next
          ? `Els festius locals ${caDe(m.name)} el ${NEXT} són ${wdList(next.local, "ca")}, i se sumen als dotze de tot Catalunya: ${regionalNext}.`
          : `Els dotze festius ${aran ? "de l'Aran" : "de tot Catalunya"} del ${NEXT} ja són oficials (Ordre EMT/52/2026): ${regionalNext}. Els dos festius locals ${caDe(m.name)} del ${NEXT} encara no s'han publicat: els fixa una ordre del DOGC a proposta de l'ajuntament, i la del ${YEAR} va sortir el 17 de desembre de 2025.`,
      },
      ...asked.map(dateItem),
    ];
  }
  const locals = own ? `sus dos fiestas locales, ${wdList(m.local, "es")}` : "las fiestas locales de su núcleo, que están en la tabla";
  return [
    {
      question: `¿Hoy es festivo en ${name}?`,
      answer: `El recuadro «¿Es festivo hoy en ${name}?» de arriba lo calcula con la fecha de hoy y la hora de Cataluña. En ${YEAR}, en ${name} son festivos ${aran ? "los doce días generales, con la Fiesta de Arán," : "los doce días de toda Cataluña"} y ${locals}.`,
    },
    {
      question: `¿Mañana es festivo en ${name}?`,
      answer: `Lo dice la línea «Mañana» del mismo recuadro, que también indica el próximo festivo y cuántos días faltan. Mañana solo es festivo en ${name} si es uno de los festivos de la tabla: los doce de toda Cataluña o las fiestas locales del municipio.`,
    },
    {
      question: `¿Cuál es el calendario laboral ${NEXT} de ${name}?`,
      answer: next
        ? `Los festivos locales de ${name} en ${NEXT} son ${wdList(next.local, "es")}, y se suman a los doce de toda Cataluña: ${regionalNext}.`
        : `Los doce festivos ${aran ? "de Arán" : "de toda Cataluña"} de ${NEXT} ya son oficiales (Orden EMT/52/2026): ${regionalNext}. Los dos festivos locales de ${name} para ${NEXT} todavía no se han publicado: los fija una orden del DOGC a propuesta del ayuntamiento, y la de ${YEAR} salió el 17 de diciembre de 2025.`,
    },
    ...asked.map(dateItem),
  ];
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

/** How many towns each comarca section of the hub shows with their days; the rest fold away by name. */
export const HUB_VISIBLE = 6;

export function hubCopy(locale: MuniLocale) {
  const count = SNAPSHOT.municipalities.length;
  const excluded = SNAPSHOT.excluded.length;
  if (locale === "ca") {
    return {
      title: fit([`Festius locals ${YEAR} i ${NEXT} per municipis de Catalunya`, `Festius locals ${YEAR} per municipi`], TITLE_MAX),
      description: `Festius locals del ${YEAR} de tots els municipis de Catalunya, per comarques: els dos dies de cada ajuntament, si avui és festiu i el ${NEXT}.`,
      h1: `Festius locals ${YEAR} per municipi`,
      breadcrumb: "Festius locals",
      lead: `Cada municipi de Catalunya fixa dos festius locals, que se sumen als dotze de tot Catalunya. Aquí hi ha els del ${YEAR} de tots els que en tenen al calendari oficial, ${count} municipis, per comarques. Cadascun té la seva pàgina, amb tots els festius de l'any, si avui és festiu, les botigues obertes i el ${NEXT}, i cada comarca, una taula amb els dies de tots els seus municipis.`,
      excludedTitle: `Municipis sense festius locals el ${YEAR}`,
      excludedLead: `L'ordre de festes locals del ${YEAR} no fixa cap dia per a aquests ${excluded} municipis: hi diu «proposta no formulada» (l'ajuntament no va enviar la proposta a temps), i la modificació de gener no ho va canviar.`,
      datesTitle: "És festiu…?",
      jump: "Per comarques:",
      population: `Dins de cada comarca, els municipis van per població a 1 de gener de ${SNAPSHOT.sources.population.year} (Idescat).`,
      next: `Els festius locals del ${NEXT} encara no s'han publicat; l'ordre del ${YEAR} va sortir al DOGC el 17 de desembre de 2025.`,
      towns: (n: number) => (n === 1 ? "1 municipi" : `${n} municipis`),
      table: (comarca: string, n: number) => comarcaLinkLabel(comarca, n, "ca"),
      more: (n: number) => (n === 1 ? "1 municipi més" : `${n} municipis més`),
      byNucleus: "Dies diferents per nucli",
      guidesTitle: "Més sobre festius",
      sourcesTitle: "Fonts",
    };
  }
  return {
    title: fit([`Festivos locales ${YEAR} y ${NEXT} por municipios de Cataluña`, `Festivos locales ${YEAR} por municipio`], TITLE_MAX),
    description: `Festivos locales de ${YEAR} de todos los municipios de Cataluña, por comarcas: los dos días de cada ayuntamiento, si hoy es festivo y ${NEXT}.`,
    h1: `Festivos locales ${YEAR} por municipio`,
    breadcrumb: "Festivos locales",
    lead: `Cada municipio de Cataluña fija dos festivos locales, que se suman a los doce de toda Cataluña. Aquí están los de ${YEAR} de todos los que los tienen en el calendario oficial, ${count} municipios, por comarcas. Cada uno tiene su página, con todos los festivos del año, si hoy es festivo, las tiendas abiertas y ${NEXT}, y cada comarca, una tabla con los días de todos sus municipios.`,
    excludedTitle: `Municipios sin festivos locales en ${YEAR}`,
    excludedLead: `La orden de fiestas locales de ${YEAR} no fija ningún día para estos ${excluded} municipios: dice «proposta no formulada» (el ayuntamiento no envió la propuesta a tiempo), y la modificación de enero no lo cambió.`,
    datesTitle: "¿Es festivo el…?",
    jump: "Por comarcas:",
    population: `Dentro de cada comarca, los municipios van por población a 1 de enero de ${SNAPSHOT.sources.population.year} (Idescat).`,
    next: `Los festivos locales de ${NEXT} todavía no se han publicado; la orden de ${YEAR} salió en el DOGC el 17 de diciembre de 2025.`,
    towns: (n: number) => (n === 1 ? "1 municipio" : `${n} municipios`),
    table: (comarca: string, n: number) => comarcaLinkLabel(comarca, n, "es"),
    more: (n: number) => (n === 1 ? "1 municipio más" : `${n} municipios más`),
    byNucleus: "Días distintos por núcleo",
    guidesTitle: "Más sobre festivos",
    sourcesTitle: "Fuentes",
  };
}

/* -------------------------------------------------------------------------- */
/* Comarca pages                                                              */
/* -------------------------------------------------------------------------- */

/** "les Garrigues" in Catalan prose; the official name as it is in Spanish, where the article would need a gender we do not guess. */
function comarcaLabel(comarca: string, locale: MuniLocale): string {
  return locale === "ca" ? caComarca(comarca) : comarca;
}

export function comarcaTitle(g: ComarcaGroup, locale: MuniLocale): string {
  const n = g.municipalities.length;
  if (locale === "ca") {
    const de = caDe(caComarca(g.comarca));
    return fit([`Festius locals ${de} ${YEAR}: els ${n} municipis`, `Festius locals ${de} ${YEAR} per municipi`, `Festius locals ${g.comarca} ${YEAR}`], TITLE_MAX);
  }
  return fit([`Festivos locales ${g.comarca} ${YEAR}: los ${n} municipios`, `Festivos locales ${g.comarca} ${YEAR} por municipio`, `Festivos locales ${g.comarca} ${YEAR}`], TITLE_MAX);
}

export function comarcaH1(g: ComarcaGroup, locale: MuniLocale): string {
  return locale === "ca" ? `Festius locals ${YEAR} ${caDe(caComarca(g.comarca))}` : `${g.comarca}: festivos locales ${YEAR} por municipio`;
}

/** The largest town's days, as the example in the description: "Figueres, 3 de maig i 29 de juny". */
function exampleDays(g: ComarcaGroup, locale: MuniLocale): string | null {
  const town = g.municipalities.find((m) => m.local.length > 0);
  return town ? `${displayName(town, locale)}, ${localList(town.local, locale)}` : null;
}

export function comarcaDescription(g: ComarcaGroup, locale: MuniLocale): string {
  const n = g.municipalities.length;
  const example = exampleDays(g, locale);
  if (locale === "ca") {
    const head = `Festius locals del ${YEAR} ${n === 1 ? "del municipi" : `dels ${n} municipis`} ${caDe(caComarca(g.comarca))} en una taula, segons el DOGC.`;
    return fit([...(example ? [`${head} ${example}. També els nuclis i les botigues.`, `${head} ${example}.`] : []), `${head} També els nuclis i les botigues.`, head], DESCRIPTION_MAX);
  }
  const head = `${g.comarca}: festivos locales de ${YEAR} de ${n === 1 ? "su municipio" : `sus ${n} municipios`} en una tabla, según el DOGC.`;
  return fit([...(example ? [`${head} ${example}. También los núcleos y las tiendas.`, `${head} ${example}.`] : []), `${head} También los núcleos y las tiendas.`, head], DESCRIPTION_MAX);
}

export interface ComarcaCopy {
  breadcrumb: string;
  lead: string;
  nucleiOnly: string | null;
  excluded: string | null;
  tableTitle: string;
  tableCaption: string;
  cols: { town: string; days: string; nuclei: string };
  byNucleus: string;
  moreNuclei: (n: number) => string;
  sharedTitle: string;
  sharedLead: string | null;
  sharedItem: (date: string, towns: number) => string;
  shopsTitle: string;
  shops: string;
  nextTitle: string;
  next: string;
  othersTitle: string;
  hubLink: string;
  datesTitle: string;
  guidesTitle: string;
  sourcesTitle: string;
}

export function comarcaCopy(g: ComarcaGroup, locale: MuniLocale): ComarcaCopy {
  const n = g.municipalities.length;
  const label = comarcaLabel(g.comarca, locale);
  const nucleiOnly = g.municipalities.filter((m) => m.local.length === 0);
  const withNuclei = g.municipalities.filter((m) => m.local.length > 0 && m.nuclei.length > 0).length;
  const amended = g.municipalities.some((m) => m.correction?.by === "Ordre EMT/3/2026");
  const shared = sharedDates(g);
  const own = g.municipalities.filter((m) => m.shopsOwnList);
  const excluded = g.excluded.map((e) => (locale === "es" ? esName(e.name) : e.name));
  const names = (list: SnapshotMunicipality[]) => joinList(list.map((m) => displayName(m, locale)), locale);

  if (locale === "ca") {
    return {
      breadcrumb: g.comarca,
      lead:
        `${caStart(caA(label))} ${n === 1 ? "hi ha 1 municipi" : `hi ha ${n} municipis`} amb festius locals al calendari oficial del ${YEAR}, que fixa ${LOCAL_ORDER.ca}${amended ? `, ${AMENDMENT.ca}` : ""}. ` +
        `Cada ajuntament en proposa dos, que se sumen als dotze festius de tot Catalunya${withNuclei ? `; a ${withNuclei === 1 ? "un municipi" : `${withNuclei} municipis`}, alguns nuclis en tenen de propis` : ""}.`,
      nucleiOnly: nucleiOnly.length
        ? `${names(nucleiOnly)} no ${nucleiOnly.length === 1 ? "té" : "tenen"} dies per a tot el municipi: l'ordre els fixa nucli per nucli.`
        : null,
      excluded: excluded.length
        ? `${joinList(excluded, "ca")} no ${excluded.length === 1 ? "té" : "tenen"} festius locals al calendari oficial del ${YEAR}: l'ordre hi diu «proposta no formulada».`
        : null,
      tableTitle: `Els festius locals de cada municipi`,
      tableCaption: `Festius locals del ${YEAR} ${caDe(label)}, per població (Ordre EMT/208/2025)`,
      cols: { town: "Municipi", days: `Festius locals ${YEAR}`, nuclei: "Nuclis amb dies propis" },
      byNucleus: "Per nuclis:",
      moreNuclei: (k) => `i ${k} ${k === 1 ? "nucli" : "nuclis"} més, a la pàgina del municipi`,
      sharedTitle: "Els dies que més es repeteixen",
      sharedLead: shared.length ? `Dies de festa local que comparteixen diversos municipis ${caDe(label)} (un nucli compta per al seu municipi):` : null,
      sharedItem: (date, towns) => `${weekdayDayMonth(date, "ca")}: ${towns} municipis`,
      shopsTitle: "Botigues obertes en festius",
      shops: own.length
        ? `${own.length === 1 ? "Un ajuntament" : `${own.length} ajuntaments`} ${caDe(label)} ${own.length === 1 ? "ha triat" : "han triat"} els seus dies d'obertura comercial del ${YEAR} (Resolució EMT/4342/2025): ${names(own)}. ${own.length === n ? "" : "A la resta s'hi apliquen els deu dies per defecte: els vuit del calendari general, l'11 de gener i el 8 de desembre (Ordre EMT/77/2025, articles 1 i 6)."} La pàgina de cada municipi té la seva llista.`.replace(/\s+/g, " ").trim()
        : `Cap ajuntament ${caDe(label)} no consta a la Resolució EMT/4342/2025: a tots s'hi apliquen els deu dies d'obertura comercial per defecte, els vuit del calendari general, l'11 de gener i el 8 de desembre (Ordre EMT/77/2025, articles 1 i 6). La pàgina de cada municipi té la llista.`,
      nextTitle: `I el ${NEXT}?`,
      next: `Els festius locals del ${NEXT} encara no s'han publicat: els fixa una ordre del DOGC a proposta de cada ajuntament, i la del ${YEAR} va sortir el 17 de desembre de 2025. Els dotze de tot Catalunya del ${NEXT} ja són oficials (Ordre EMT/52/2026).`,
      othersTitle: "Altres comarques",
      hubLink: "Tots els municipis, per comarques",
      datesTitle: "És festiu…?",
      guidesTitle: "Més sobre festius",
      sourcesTitle: "Fonts",
    };
  }
  return {
    breadcrumb: g.comarca,
    lead:
      `En esta comarca ${n === 1 ? "hay 1 municipio" : `hay ${n} municipios`} con festivos locales en el calendario oficial de ${YEAR}, que fija ${LOCAL_ORDER.es}${amended ? `, ${AMENDMENT.es}` : ""}. ` +
      `Cada ayuntamiento propone dos, que se suman a los doce festivos de toda Cataluña${withNuclei ? `; en ${withNuclei === 1 ? "un municipio" : `${withNuclei} municipios`}, algunos núcleos tienen los suyos propios` : ""}.`,
    nucleiOnly: nucleiOnly.length
      ? `${names(nucleiOnly)} no ${nucleiOnly.length === 1 ? "tiene" : "tienen"} días para todo el municipio: la orden los fija núcleo por núcleo.`
      : null,
    excluded: excluded.length
      ? `${joinList(excluded, "es")} no ${excluded.length === 1 ? "tiene" : "tienen"} festivos locales en el calendario oficial de ${YEAR}: la orden dice «proposta no formulada».`
      : null,
    tableTitle: "Los festivos locales de cada municipio",
    tableCaption: `Festivos locales de ${YEAR}, ${label}, por población (Orden EMT/208/2025)`,
    cols: { town: "Municipio", days: `Festivos locales ${YEAR}`, nuclei: "Núcleos con días propios" },
    byNucleus: "Por núcleos:",
    moreNuclei: (k) => `y ${k} ${k === 1 ? "núcleo" : "núcleos"} más, en la página del municipio`,
    sharedTitle: "Los días que más se repiten",
    sharedLead: shared.length ? "Días de fiesta local que comparten varios municipios de la comarca (un núcleo cuenta para su municipio):" : null,
    sharedItem: (date, towns) => `${weekdayDayMonth(date, "es")}: ${towns} municipios`,
    shopsTitle: "Tiendas abiertas en festivos",
    shops: own.length
      ? `${own.length === 1 ? "Un ayuntamiento" : `${own.length} ayuntamientos`} de la comarca ${own.length === 1 ? "ha elegido" : "han elegido"} sus días de apertura comercial de ${YEAR} (Resolución EMT/4342/2025): ${names(own)}. ${own.length === n ? "" : "En el resto se aplican los diez días por defecto: los ocho del calendario general, el 11 de enero y el 8 de diciembre (Orden EMT/77/2025, artículos 1 y 6)."} La página de cada municipio tiene su lista.`.replace(/\s+/g, " ").trim()
      : `Ningún ayuntamiento de la comarca figura en la Resolución EMT/4342/2025: en todos se aplican los diez días de apertura comercial por defecto, los ocho del calendario general, el 11 de enero y el 8 de diciembre (Orden EMT/77/2025, artículos 1 y 6). La página de cada municipio tiene la lista.`,
    nextTitle: `¿Y en ${NEXT}?`,
    next: `Los festivos locales de ${NEXT} todavía no se han publicado: los fija una orden del DOGC a propuesta de cada ayuntamiento, y la de ${YEAR} salió el 17 de diciembre de 2025. Los doce de toda Cataluña de ${NEXT} ya son oficiales (Orden EMT/52/2026).`,
    othersTitle: "Otras comarcas",
    hubLink: "Todos los municipios, por comarcas",
    datesTitle: "¿Es festivo el…?",
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
