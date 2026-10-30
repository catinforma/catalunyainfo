import type { Block } from "@/lib/content/blocks";
import { addDays, daysBetween, holidayOn, weekdayIndex } from "@/lib/content/holidays/calendar";
import type { Locale } from "@/lib/i18n/config";

import { dayDate, span } from "./festive";
import { SHOPS } from "./shops";
import {
  b2Related,
  b2link,
  callout,
  faq,
  h2,
  keyFacts,
  lead,
  list,
  paras,
  table,
  verifiedLine,
  type B2Article,
  type B2Source,
} from "./shared";

/**
 * "Pont de desembre 2026": is there a long weekend in December in Catalonia,
 * and which days are holidays?
 *
 * Every fact was read on 26 Oct 2026 from the primary text:
 *
 *  - Ordre EMT/66/2025 (DOGC 9406, 6.5.2025), art. 1.a: the twelve 2026
 *    holidays; December has the 8th (Tuesday), 25th and 26th. The 6th (a
 *    Sunday) is not in it and no Monday is added. Art. 1.b: in Aran the 26th
 *    is replaced by 17 June.
 *  - BOE-A-2025-21667 (BOE 259, 28.10.2025), the national list for 2026: the
 *    row "7 Lunes siguiente al Día de la Constitución Española" is marked for
 *    Andalucía, Aragón, Asturias, Cantabria, Castilla y León, Extremadura,
 *    Madrid, Murcia, La Rioja and Melilla, and not for Cataluña. 8 December
 *    is marked for every territory.
 *  - Ordre EMT/208/2025 (DOGC 9565, 17.12.2025): Monday 7 December 2026 is a
 *    local holiday in 43 municipalities (e.g. "Castelldefels, 14 de setembre
 *    i 7 de desembre"). The open data set b4eh-r8up lists 42 and leaves out
 *    Gallifa, which the order includes; the order names only two nuclei
 *    (Escaladei, Escart), so no nucleus count is printed. Barcelona's are
 *    25 May and 24 September.
 *  - Ordre EDF/66/2026 (school calendar): holidays are Treball's calendar plus
 *    the two local days; each school "pot establir quatre dies festius de
 *    lliure disposició"; the municipal school councils propose the days for
 *    the whole town; Christmas holidays 22 Dec 2026 - 7 Jan 2027. Barcelona's
 *    CEMB proposal (approved 10 Jun 2026) lists "Dilluns, 7 de desembre de
 *    2026 (pont del 8 de desembre)".
 *  - Ordre EMT/77/2025 (shops, 2026): 6 December is a general opening day;
 *    art. 6 makes 8 December a default municipal day. Resolució EMT/4342/2025
 *    lists Barcelona with "6, 8, 13, 20 i 27 de desembre".
 *  - Baqueira Beret, news of 28/07/2026: opening planned for 28 November
 *    "siempre que las condiciones meteorológicas y de nieve lo permitan".
 *  - Ajuntament d'Espinelves (45a Fira de l'Avet, 28 Nov - 8 Dec 2026) and
 *    Ajuntament de Vic agenda (Mercat Medieval from 5 Dec 2026; the listing's
 *    end, "08/12/2026 a 00:00", leaves the 8th unclear).
 *
 * The Servei Català de Trànsit had published nothing about this bridge on
 * 26 Oct 2026, so the page says nothing about traffic operations.
 *
 * No new photograph: the hero is the shops guide's second picture, with the
 * same alt text and caption (media rows are keyed by file).
 */

/**
 * 30 Oct 2026 (top-3 push): ca/es descriptions now list December's holidays
 * (8, 25, 26) with the Purísima name and the 43 towns where Monday 7 is a
 * local holiday; a ca/es FAQ in the words of "puente de la purísima 2026".
 * No new fact: every one is already verified above. Titles kept (an answer
 * like "only the 8th" would be wrong in those 43 towns).
 */
export const BRIDGE_VERIFIED = "2026-10-26";

/** The days the page is about. Weekdays are computed, never typed. */
export const BRIDGE_DAYS = {
  saturday: "2026-12-05",
  constitution: "2026-12-06",
  monday: "2026-12-07",
  immaculada: "2026-12-08",
  marato: "2026-12-13",
  christmas: "2026-12-25",
  santEsteve: "2026-12-26",
  schoolChristmasFrom: "2026-12-22",
  schoolChristmasTo: "2027-01-07",
} as const;

/**
 * Where Monday 7 December 2026 IS a holiday, from the BOE's national list
 * (BOE-A-2025-21667). Nine autonomous communities and Melilla.
 */
export const MONDAY_7_REGIONS: Record<Locale, string[]> = {
  ca: ["Andalusia", "l'Aragó", "Astúries", "Cantàbria", "Castella i Lleó", "Extremadura", "la Comunitat de Madrid", "la Regió de Múrcia", "la Rioja", "Melilla"],
  es: ["Andalucía", "Aragón", "Asturias", "Cantabria", "Castilla y León", "Extremadura", "la Comunidad de Madrid", "la Región de Murcia", "La Rioja", "Melilla"],
  en: ["Andalusia", "Aragon", "Asturias", "Cantabria", "Castile and León", "Extremadura", "the Community of Madrid", "the Region of Murcia", "La Rioja", "Melilla"],
};

/** Monday 7 December 2026 as a local holiday (Ordre EMT/208/2025, read 27 Oct 2026). */
export const LOCAL_MONDAY_7 = {
  municipalities: 43,
  examples: ["Castelldefels", "Sant Boi de Llobregat", "Amposta", "Bellver de Cerdanya"],
} as const;

/* -------------------------------------------------------------------------- */
/* Date logic                                                                 */
/* -------------------------------------------------------------------------- */

/** Off for a Monday-to-Friday worker: weekend, Catalonia-wide holiday or booked leave. */
export function isDayOff(iso: string, leave: readonly string[] = []): boolean {
  const weekday = weekdayIndex(iso);
  return weekday === 0 || weekday === 6 || holidayOn(iso) !== null || leave.includes(iso);
}

export interface Run {
  from: string;
  to: string;
  days: number;
}

/** The unbroken run of days off that contains `anchor` (which must itself be off). */
export function runAround(anchor: string, leave: readonly string[] = []): Run {
  if (!isDayOff(anchor, leave)) throw new Error(`december bridge: ${anchor} is not a day off`);
  let from = anchor;
  while (isDayOff(addDays(from, -1), leave)) from = addDays(from, -1);
  let to = anchor;
  while (isDayOff(addDays(to, 1), leave)) to = addDays(to, 1);
  return { from, to, days: daysBetween(from, to) + 1 };
}

export interface BridgeOption {
  id: string;
  anchor: string;
  leave: string[];
  label: Record<Locale, string>;
}

export const BRIDGE_OPTIONS: BridgeOption[] = [
  {
    id: "bridge",
    anchor: BRIDGE_DAYS.immaculada,
    leave: [BRIDGE_DAYS.monday],
    label: { ca: "Dilluns 7", es: "Lunes 7", en: "Monday 7th" },
  },
  {
    id: "long",
    anchor: BRIDGE_DAYS.immaculada,
    leave: [BRIDGE_DAYS.monday, "2026-12-09", "2026-12-10", "2026-12-11"],
    label: { ca: "Dilluns 7 i del dimecres 9 al divendres 11", es: "Lunes 7 y del miércoles 9 al viernes 11", en: "Monday 7th and Wednesday 9th to Friday 11th" },
  },
  {
    id: "christmas",
    anchor: BRIDGE_DAYS.christmas,
    leave: [],
    label: { ca: "Cap (Nadal)", es: "Ninguno (Navidad)", en: "None (Christmas)" },
  },
];

const WEEKDAYS: Record<Locale, string[]> = {
  ca: ["diumenge", "dilluns", "dimarts", "dimecres", "dijous", "divendres", "dissabte"],
  es: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
};

/** "del dissabte 5 al dimarts 8 de desembre" / "Saturday 5 to Tuesday 8 December". */
export function runWords(run: Run, locale: Locale): string {
  const wd = (iso: string) => WEEKDAYS[locale][weekdayIndex(iso)] ?? "";
  const plain = span(run.from, run.to, locale);
  if (locale === "en") {
    const [a, b] = plain.split(" to ");
    return `${wd(run.from)} ${a} to ${wd(run.to)} ${b}`;
  }
  // "del 5 al 8 de desembre" -> "del dissabte 5 al dimarts 8 de desembre"
  // Catalan "de l'1" / "a l'11" become "del dimarts 1" / "al dimarts 11".
  return plain
    .replace(/^(?:del |de l')(\d+)/, (_match: string, day: string) => `del ${wd(run.from)} ${day}`)
    .replace(/ (?:al |a l')(\d+)/, (_match: string, day: string) => ` al ${wd(run.to)} ${day}`);
}

function cap(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** What each day of the bridge and of Christmas is in Catalonia. */
export function dayRows(locale: Locale): string[][] {
  const days = [BRIDGE_DAYS.saturday, BRIDGE_DAYS.constitution, BRIDGE_DAYS.monday, BRIDGE_DAYS.immaculada, BRIDGE_DAYS.christmas, BRIDGE_DAYS.santEsteve];
  const n = LOCAL_MONDAY_7.municipalities;
  return days.map((iso) => {
    const holiday = holidayOn(iso);
    const day = cap(dayDate(iso, locale, false));
    let status: string;
    if (holiday) {
      const name = cap(holiday.name[locale]);
      const aran = iso === BRIDGE_DAYS.santEsteve ? { ca: " (a l'Aran, no)", es: " (en Arán, no)", en: " (not in Aran)" }[locale] : "";
      status = { ca: `**Festiu a tot Catalunya:** ${name}${aran}`, es: `**Festivo en toda Cataluña:** ${name}${aran}`, en: `**Public holiday across Catalonia:** ${name}${aran}` }[locale];
    } else if (iso === BRIDGE_DAYS.constitution) {
      status = { ca: "Diumenge. Dia de la Constitució, però no és festiu a Catalunya el 2026", es: "Domingo. Día de la Constitución, pero no es festivo en Cataluña en 2026", en: "Sunday. Constitution Day, but not a public holiday in Catalonia in 2026" }[locale];
    } else if (iso === BRIDGE_DAYS.monday) {
      status = { ca: `Dia feiner a Catalunya (festa local en ${n} municipis)`, es: `Laborable en Cataluña (fiesta local en ${n} municipios)`, en: `Working day in Catalonia (a local holiday in ${n} towns)` }[locale];
    } else {
      status = { ca: "Cap de setmana", es: "Fin de semana", en: "Weekend" }[locale];
    }
    return [day, status];
  });
}

export function optionRows(locale: Locale): string[][] {
  return BRIDGE_OPTIONS.map((option) => {
    const run = runAround(option.anchor, option.leave);
    const days = { ca: `${run.days} dies`, es: `${run.days} días`, en: `${run.days} days` }[locale];
    return [option.label[locale], days, cap(runWords(run, locale))];
  });
}

function joinList(items: readonly string[], locale: Locale, or = false): string {
  const and = or ? { ca: " o ", es: " o ", en: " or " }[locale] : { ca: " i ", es: " y ", en: " and " }[locale];
  return items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")}${and}${items[items.length - 1]}`;
}

/* -------------------------------------------------------------------------- */
/* Paths that are not in the batch-02 registry                                */
/* -------------------------------------------------------------------------- */

/** The school calendar and local holidays guides (school/publish.ts, holidays/local-publish.ts). */
export const SIBLING_PATHS: Record<"school" | "local", Record<Locale, string>> = {
  school: { ca: "guies/calendari-escolar-catalunya", es: "guias/calendario-escolar-cataluna", en: "guides/catalonia-school-calendar" },
  local: { ca: "guies/festius-locals-catalunya", es: "guias/festivos-locales-cataluna", en: "guides/local-holidays-catalonia" },
};

function sibling(key: "school" | "local", locale: Locale, label: string): string {
  return `[${label}](/${locale}/${SIBLING_PATHS[key][locale]}/)`;
}

/* -------------------------------------------------------------------------- */
/* Sources                                                                    */
/* -------------------------------------------------------------------------- */

const SOURCES: B2Source[] = [
  { name: "Ordre EMT/66/2025, de 30 d'abril, calendari oficial de festes laborals a Catalunya per a l'any 2026", url: "https://portaldogc.gencat.cat/utilsEADOP/AppJava/PdfProviderServlet?documentId=1013204&type=01&language=ca_ES", publisher: "DOGC" },
  { name: "Calendari de festes laborals 2026", url: "https://treball.gencat.cat/ca/ambits/relacions_laborals/ci/calendari_laboral/calendari-festes-2026/", publisher: "Departament d'Empresa i Treball" },
  { name: "Resolución de 17 de octubre de 2025, de la Dirección General de Trabajo, relación de fiestas laborales para el año 2026", url: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2025-21667", publisher: "BOE" },
  { name: "Ordre EMT/208/2025, d'11 de desembre, calendari de festes locals a Catalunya per a l'any 2026", url: "https://portaldogc.gencat.cat/utilsEADOP/AppJava/PdfProviderServlet?documentId=1032232&type=01&language=ca_ES", publisher: "DOGC" },
  { name: "Calendari de festes locals a Catalunya (dades obertes)", url: "https://analisi.transparenciacatalunya.cat/d/b4eh-r8up", publisher: "Departament d'Empresa i Treball" },
  { name: "Ordre EDF/66/2026, de 22 d'abril, calendari escolar dels cursos 2026-2027, 2027-2028 i 2028-2029", url: "https://portaldogc.gencat.cat/utilsEADOP/AppJava/PdfProviderServlet?documentId=1042830&type=01&language=ca_ES", publisher: "DOGC" },
  { name: "Proposta de dies de lliure disposició del CEMB per al curs 2026-2027", url: "https://pro-gestornoticies-dtibcn-cat.s3.amazonaws.com/gestornoticies-pro/media/PROPOSTA_APROVADA_DE_DIES_DE_LLIURE_DISPOSICIO_DEL_CEMB_PER_AL_CURS_2026-2027.0d2f10d5.pdf", publisher: "Consell d'Educació Municipal de Barcelona" },
  { name: "Ordre EMT/77/2025, calendari d'obertura comercial en diumenges i festius per al 2026", url: "https://portaldogc.gencat.cat/utilsEADOP/AppJava/PdfProviderServlet?documentId=1015009&type=01&language=ca_ES", publisher: "DOGC" },
  { name: "Resolució EMT/4342/2025, dies festius d'obertura comercial dels municipis per al 2026", url: "https://portaldogc.gencat.cat/utilsEADOP/AppJava/PdfProviderServlet?documentId=1030324&type=01&language=ca_ES", publisher: "DOGC" },
  { name: "Llei 18/2017, de comerç, serveis i fires (text consolidat, article 37)", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2017-11320", publisher: "BOE" },
  { name: "Baqueira Beret activa el invierno en pleno verano", url: "https://www.baqueira.es/es/noticia/baqueira-beret-activa-el-invierno-en-pleno-verano", publisher: "Baqueira Beret" },
  { name: "Fira de l'Avet 2026", url: "https://espinelves.cat/%f0%9f%8c%b2fira-de-lavet-2025-sollicituds-i-reglament-de-participacio/", publisher: "Ajuntament d'Espinelves" },
  { name: "Mercat Medieval Vic 2026", url: "https://www.vic.cat/ciutat/agenda/mercat-medieval-vic-2026", publisher: "Ajuntament de Vic" },
];

/* -------------------------------------------------------------------------- */
/* Meta                                                                       */
/* -------------------------------------------------------------------------- */

export const DECEMBER_BRIDGE_META: Record<Locale, { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    path: "guies/pont-desembre-catalunya",
    title: "Pont de desembre 2026 a Catalunya: quins dies són festius, escoles i botigues",
    seoTitle: "Pont de desembre 2026 a Catalunya: quins dies són festius",
    seoDescription:
      "Festius de desembre 2026 a Catalunya: dimarts 8 (la Immaculada), 25 i 26. El 6 cau en diumenge i el dilluns 7 és feiner, llevat de 43 municipis.",
    excerpt:
      "Quins dies són festius al desembre del 2026 a Catalunya, per què el 6 i el 7 no ho són, com fer pont, si hi ha escola i si obren les botigues.",
  },
  es: {
    path: "guias/puente-diciembre-cataluna",
    title: "Puente de diciembre 2026 en Cataluña: qué días son festivos, colegios y tiendas",
    seoTitle: "Puente de diciembre 2026 en Cataluña: qué días son festivos",
    seoDescription:
      "Festivos de diciembre 2026 en Cataluña: martes 8 (la Purísima), 25 y 26. El 6 cae en domingo y el lunes 7 es laborable, salvo en 43 municipios.",
    excerpt:
      "Qué días son festivos en diciembre de 2026 en Cataluña, por qué el 6 y el 7 no lo son, cómo hacer puente, si hay colegio y si abren las tiendas.",
  },
  en: {
    path: "guides/december-long-weekend-catalonia",
    title: "December 2026 long weekend in Catalonia: which days are public holidays",
    seoTitle: "December 2026 public holidays in Catalonia: 6, 7 and 8 Dec",
    seoDescription:
      "In 2026 Catalonia's only holiday that week is Tuesday 8 December: the 6th is a Sunday and Monday the 7th is a working day. Long weekends, schools, shops.",
    excerpt:
      "Which days are public holidays in Catalonia in December 2026, why the 6th and 7th are not, how to make a long weekend, schools and shops.",
  },
};

/* -------------------------------------------------------------------------- */
/* Body                                                                       */
/* -------------------------------------------------------------------------- */

const RELATED = ["christmas", "shops", "workCalendar", "holidayToday", "christmasBarcelona", "pessebres", "snowNow", "ski", "marato"] as const;

function dayTable(locale: Locale): Block {
  const caption = { ca: "El pont i el Nadal del 2026 a Catalunya, dia a dia", es: "El puente y la Navidad de 2026 en Cataluña, día a día", en: "The bridge and Christmas 2026 in Catalonia, day by day" }[locale];
  const headers = { ca: ["Dia", "Què és a Catalunya"], es: ["Día", "Qué es en Cataluña"], en: ["Day", "What it is in Catalonia"] }[locale];
  const note = {
    ca: "Font: Ordre EMT/66/2025 (DOGC del 6 de maig de 2025). A cada municipi s'hi sumen les seves dues festes locals.",
    es: "Fuente: Orden EMT/66/2025 (DOGC del 6 de mayo de 2025). En cada municipio se suman sus dos fiestas locales.",
    en: "Source: Order EMT/66/2025 (DOGC, 6 May 2025). Each town adds its own two local holidays.",
  }[locale];
  return table(caption, headers, dayRows(locale), note);
}

function optionTable(locale: Locale): Block {
  const caption = { ca: "Quants dies seguits de festa surten", es: "Cuántos días seguidos de fiesta salen", en: "How many days off in a row" }[locale];
  const headers = { ca: ["Dies que demanes", "Festa seguida", "Dates"], es: ["Días que pides", "Fiesta seguida", "Fechas"], en: ["Leave you book", "Days off in a row", "Dates"] }[locale];
  const note = {
    ca: "Càlcul de CatalunyaInfo per a una setmana de dilluns a divendres, amb els festius de tot Catalunya. No inclou festes locals ni substitueix el calendari de la teva empresa.",
    es: "Cálculo de CatalunyaInfo para una semana de lunes a viernes, con los festivos de toda Cataluña. No incluye fiestas locales ni sustituye el calendario de tu empresa.",
    en: "CatalunyaInfo's calculation for a Monday-to-Friday week, using the Catalonia-wide holidays. It leaves out local holidays and does not replace your employer's calendar.",
  }[locale];
  return table(caption, headers, optionRows(locale), note);
}

export function buildDecemberBridgeBody(locale: Locale): Block[] {
  const regions = joinList(MONDAY_7_REGIONS[locale], locale);
  const n = LOCAL_MONDAY_7.municipalities;
  const examples = joinList(LOCAL_MONDAY_7.examples, locale, true);
  const bridge = runAround(BRIDGE_DAYS.immaculada, [BRIDGE_DAYS.monday]);

  if (locale === "ca") {
    return [
      lead(
        `**El 2026, a Catalunya, l'únic festiu del pont de desembre és el dimarts 8 (la Immaculada).** El 6 de desembre, Dia de la Constitució, cau en diumenge i no és al calendari de festes laborals de Catalunya, i el dilluns 7 és un dia feiner: per tenir ${bridge.days} dies seguits, ${runWords(bridge, "ca")}, cal demanar el dilluns 7.`,
      ),
      keyFacts("El pont de desembre del 2026, d'un cop d'ull", [
        { label: "Festiu a tot Catalunya", value: "Dimarts 8 de desembre (la Immaculada)" },
        { label: "Diumenge 6 de desembre", value: "No és festiu a Catalunya: el Dia de la Constitució cau en diumenge i no es passa al dilluns" },
        { label: "Dilluns 7 de desembre", value: `Feiner, excepte als ${n} municipis que hi tenen festa local` },
        { label: "Per fer pont", value: `Demanar el dilluns 7: ${bridge.days} dies, ${runWords(bridge, "ca")}` },
        { label: "Escoles", value: "El dia 8 no hi ha classe; el 7 depèn de cada escola" },
        { label: "Botigues", value: "Poden obrir el diumenge 6 i el dimarts 8 a Barcelona i als municipis sense dies propis" },
      ]),
      callout(
        "official",
        "D'on surten aquestes dates",
        "Del calendari oficial de festes laborals del 2026, l'Ordre EMT/66/2025 (DOGC del 6 de maig de 2025), que fixa dotze festius a tot Catalunya; del desembre, només el 8, el 25 i el 26. L'hem tornat a llegir al DOGC el 26 d'octubre de 2026 i no ha estat modificada.",
      ),
      ...h2(
        "Quins dies són festius al desembre del 2026 a Catalunya?",
        "Tres: el **dimarts 8** (la Immaculada), el **divendres 25** (Nadal) i el **dissabte 26** (Sant Esteve). A l'Aran, el 26 de desembre no és festiu: el substitueix la Festa d'Aran, el 17 de juny.",
      ),
      dayTable("ca"),
      ...h2(
        "El 6 de desembre és festiu a Catalunya el 2026?",
        "No. El Dia de la Constitució cau en diumenge, i l'ordre que fixa el calendari laboral de Catalunya del 2026 no l'inclou ni el passa al dilluns. Dels dotze festius de l'any, l'únic d'aquella setmana és el dimarts 8.",
        "Quan una festa nacional cau en diumenge, cada comunitat autònoma pot fer festa el dilluns següent o, en lloc d'això, afegir al seu calendari una festa pròpia. Catalunya no ha posat el dilluns 7 al seu.",
      ),
      ...h2(
        "El 7 de desembre és festiu a Catalunya?",
        `No a tot Catalunya: és un dilluns feiner. Sí que és **festa local a ${n} municipis**, com ${examples}, segons l'Ordre EMT/208/2025 (DOGC del 17 de desembre de 2025). Alguns nuclis de població, com Escaladei i Escart, també en fan festa. Barcelona no hi és: les seves festes locals del 2026 són el 25 de maig i el 24 de setembre.`,
        `Per saber si el teu municipi en fa festa, busca'l a ${sibling("local", "ca", "les festes locals de cada municipi")}.`,
      ),
      ...h2(
        "Com fer pont al desembre del 2026: quins dies demanar",
        "Si treballes de dilluns a divendres, aquestes són les combinacions que deixa el calendari. És un càlcul nostre, no un dret: les vacances s'han de demanar i pactar amb l'empresa, i els torns i els convenis ho poden canviar tot.",
      ),
      optionTable("ca"),
      ...paras(
        "Sense demanar cap dia, el dimarts 8 queda sol entre dos dies feiners. Per Nadal no cal demanar res per tenir tres dies: el 25 és divendres i el 26, dissabte.",
      ),
      ...h2(
        "I a la resta d'Espanya? On el dilluns 7 sí que és festiu",
        `Segons la relació de festes laborals del 2026 que va publicar el BOE el 28 d'octubre de 2025, el dilluns 7 de desembre és festiu a ${regions}. A Catalunya no, i tampoc a les Illes Balears, les Canàries, Castella-la Manxa, Galícia, Navarra, el País Basc, la Comunitat Valenciana ni Ceuta. El dimarts 8 és festiu a tot Espanya.`,
        "Per això, en aquelles comunitats el pont del dissabte 5 al dimarts 8 surt sense demanar cap dia, i a Catalunya no. Si viatges o tens família en una altra comunitat, compta amb el seu calendari, no amb el català.",
      ),
      ...h2(
        "Hi ha escola el 7 i el 8 de desembre?",
        "**El dimarts 8, no.** L'Ordre EDF/66/2026, que fixa el calendari escolar, diu que són festius els dies que determina el calendari laboral del Departament d'Empresa i Treball i els dos dies de festa local del municipi. On el 7 és festa local, tampoc no hi ha classe.",
        "**El dilluns 7, depèn de l'escola.** L'ordre no el fa festiu, però cada centre pot «establir quatre dies festius de lliure disposició», repartits entre els tres trimestres, i els consells escolars municipals han de fixar els que convindria que fessin tots els centres del municipi. A **Barcelona**, el Consell d'Educació Municipal proposa el dilluns 7 de desembre de 2026, «pont del 8 de desembre», en la proposta aprovada el 10 de juny de 2026. És una proposta de ciutat: cada escola decideix. Fora de Barcelona, pregunta-ho a l'escola o a l'ajuntament.",
        `Les vacances de Nadal del curs 2026-2027 van del 22 de desembre de 2026 al 7 de gener de 2027, tots dos inclosos. Tot el curs, al ${sibling("school", "ca", "calendari escolar 2026-2027")}.`,
      ),
      ...h2(
        "Obren les botigues el 6 i el 8 de desembre?",
        `A Barcelona poden obrir els dos dies. El diumenge 6 és un dels vuit dies d'obertura del calendari comercial general del 2026 (Ordre EMT/77/2025), i el dimarts 8 és un dels dos que hi afegeix Barcelona (Resolució EMT/4342/2025). Als municipis que no van comunicar dies propis, el 8 de desembre també és dia d'obertura per defecte. Alguns ajuntaments n'han canviat alguna data: el detall, municipi per municipi, és a ${b2link("shops", "ca", "la guia de botigues obertes en diumenges i festius")}.`,
        "Poder obrir no vol dir que obrin: cada botiga decideix. Les que la llei de comerç exclou de l'horari general (forns i pastisseries, botigues de conveniència, farmàcies...) poden obrir igualment.",
      ),
      ...h2(
        "Què fer el pont de desembre del 2026",
        "Algunes idees amb data oficial i les guies on les seguim:",
      ),
      list(
        `**Mercats de Nadal.** La 45a Fira de l'Avet d'Espinelves (Osona) és del 28 de novembre al 8 de desembre de 2026, segons l'Ajuntament d'Espinelves, i el Mercat Medieval de Vic comença el 5 de desembre, segons l'agenda de l'Ajuntament de Vic (mireu-ne el programa abans d'anar-hi). Les dates de la Fira de Santa Llúcia de Barcelona del 2026 encara no s'han publicat. Tots, a ${b2link("christmas", "ca", "la guia de mercats de Nadal")}.`,
        `**Pessebres vivents.** El calendari, amb les dates de cada un quan les publiquen, és a ${b2link("pessebres", "ca", "la guia de pessebres vivents")}.`,
        `**Nadal a Barcelona.** Els llums, el pessebre de la plaça de Sant Jaume i què obre per les festes, a ${b2link("christmasBarcelona", "ca", "Nadal a Barcelona")}.`,
        `**Neu i esquí.** Baqueira Beret té previst obrir la temporada el 28 de novembre, si la meteorologia i la neu ho permeten (notícia de l'estació del 28 de juliol de 2026); cap obertura és segura fins que no hi ha neu. Mira ${b2link("snowNow", "ca", "si hi ha neu al Pirineu avui")} i ${b2link("ski", "ca", "les estacions d'esquí de Catalunya")}.`,
        `**El temps.** Les mitjanes del desembre són a ${b2link("climate", "ca", "la guia del temps a Barcelona mes a mes")}.`,
      ),
      ...paras(
        `I el diumenge següent, 13 de desembre, és ${b2link("marato", "ca", "La Marató de 3Cat")}, dedicada enguany a les malalties neurodegeneratives i neuromusculars.`,
      ),
      faq([
        { question: "Hi ha pont al desembre del 2026 a Catalunya?", answer: `Només si demanes el dilluns 7. L'únic festiu és el dimarts 8; el diumenge 6 no és festiu a Catalunya. Amb el 7 lliure, el pont va ${runWords(bridge, "ca")}.` },
        { question: "Quan és el pont de la Puríssima del 2026?", answer: `La Puríssima (la Immaculada, 8 de desembre) cau en dimarts el 2026 i és festiu a tot Catalunya. Per fer pont cal demanar el dilluns 7, que a Catalunya és feiner llevat de ${n} municipis: així el pont va ${runWords(bridge, "ca")}.` },
        { question: "El 7 de desembre de 2026 és festiu a Catalunya?", answer: `No a tot Catalunya: és dia feiner. És festa local a ${n} municipis, com ${examples}. En canvi, sí que és festiu a Madrid o a Andalusia, que han passat al dilluns el festiu del 6.` },
        { question: "El 6 de desembre de 2026 és festiu?", answer: "Cau en diumenge. A Catalunya no és festiu i no es passa al dilluns; en nou comunitats autònomes i a Melilla, sí: hi fan festa el dilluns 7." },
        { question: "Quins dies són festius al desembre del 2026 a Catalunya?", answer: "El dimarts 8 (la Immaculada), el divendres 25 (Nadal) i el dissabte 26 (Sant Esteve). A l'Aran, el 26 no és festiu." },
        { question: "Hi ha classe el 7 de desembre?", answer: "Depèn de l'escola: no és festiu escolar a tot Catalunya, però els centres poden fer-hi un dels seus quatre dies festius de lliure disposició. A Barcelona, el Consell d'Educació Municipal proposa que les escoles no facin classe aquell dia." },
        { question: "Obren les botigues el 8 de desembre a Barcelona?", answer: "Poden obrir: el dimarts 8 és un dels dos dies que Barcelona afegeix al calendari comercial del 2026. El diumenge 6 també és dia d'obertura." },
      ]),
      ...paras(verifiedLine("ca", BRIDGE_VERIFIED)),
      ...b2Related([...RELATED], "ca"),
    ];
  }

  if (locale === "es") {
    return [
      lead(
        `**En 2026, en Cataluña, el único festivo del puente de diciembre es el martes 8 (la Inmaculada).** El 6 de diciembre, Día de la Constitución, cae en domingo y no está en el calendario de fiestas laborales de Cataluña, y el lunes 7 es laborable: para tener ${bridge.days} días seguidos, ${runWords(bridge, "es")}, hay que pedir el lunes 7.`,
      ),
      keyFacts("El puente de diciembre de 2026, de un vistazo", [
        { label: "Festivo en toda Cataluña", value: "Martes 8 de diciembre (la Inmaculada)" },
        { label: "Domingo 6 de diciembre", value: "No es festivo en Cataluña: el Día de la Constitución cae en domingo y no se pasa al lunes" },
        { label: "Lunes 7 de diciembre", value: `Laborable, salvo en los ${n} municipios que tienen fiesta local` },
        { label: "Para hacer puente", value: `Pedir el lunes 7: ${bridge.days} días, ${runWords(bridge, "es")}` },
        { label: "Colegios", value: "El día 8 no hay clase; el 7 depende de cada centro" },
        { label: "Tiendas", value: "Pueden abrir el domingo 6 y el martes 8 en Barcelona y en los municipios sin días propios" },
      ]),
      callout(
        "official",
        "De dónde salen estas fechas",
        "Del calendario oficial de fiestas laborales de 2026, la Orden EMT/66/2025 (DOGC del 6 de mayo de 2025), que fija doce festivos en toda Cataluña; de diciembre, solo el 8, el 25 y el 26. La hemos vuelto a leer en el DOGC el 26 de octubre de 2026 y no ha sido modificada.",
      ),
      ...h2(
        "¿Qué días son festivos en diciembre de 2026 en Cataluña?",
        "Tres: el **martes 8** (la Inmaculada), el **viernes 25** (Navidad) y el **sábado 26** (San Esteban). En Arán, el 26 de diciembre no es festivo: lo sustituye la Fiesta de Arán, el 17 de junio.",
      ),
      dayTable("es"),
      ...h2(
        "¿El 6 de diciembre es festivo en Cataluña en 2026?",
        "No. El Día de la Constitución cae en domingo, y la orden que fija el calendario laboral de Cataluña de 2026 no lo incluye ni lo pasa al lunes. De los doce festivos del año, el único de esa semana es el martes 8.",
        "Cuando una fiesta nacional cae en domingo, cada comunidad autónoma puede dar fiesta el lunes siguiente o, en su lugar, añadir a su calendario una fiesta propia. Cataluña no ha puesto el lunes 7 en el suyo.",
      ),
      ...h2(
        "¿El 7 de diciembre es festivo en Cataluña?",
        `No en toda Cataluña: es un lunes laborable. Sí es **fiesta local en ${n} municipios**, como ${examples}, según la Orden EMT/208/2025 (DOGC del 17 de diciembre de 2025). Algunos núcleos de población, como Escaladei y Escart, también tienen fiesta. Barcelona no está entre ellos: sus fiestas locales de 2026 son el 25 de mayo y el 24 de septiembre.`,
        `Para saber si tu municipio tiene fiesta, búscalo en ${sibling("local", "es", "los festivos locales de cada municipio")}.`,
      ),
      ...h2(
        "Cómo hacer puente en diciembre de 2026: qué días pedir",
        "Si trabajas de lunes a viernes, estas son las combinaciones que deja el calendario. Es un cálculo nuestro, no un derecho: las vacaciones se piden y se pactan con la empresa, y los turnos y los convenios pueden cambiarlo todo.",
      ),
      optionTable("es"),
      ...paras(
        "Sin pedir ningún día, el martes 8 queda suelto entre dos laborables. En Navidad no hace falta pedir nada para tener tres días: el 25 es viernes y el 26, sábado.",
      ),
      ...h2(
        "¿Y en el resto de España? Dónde el lunes 7 sí es festivo",
        `Según la relación de fiestas laborales de 2026 que publicó el BOE el 28 de octubre de 2025, el lunes 7 de diciembre es festivo en ${regions}. En Cataluña no, y tampoco en Baleares, Canarias, Castilla-La Mancha, Galicia, Navarra, el País Vasco, la Comunidad Valenciana ni Ceuta. El martes 8 es festivo en toda España.`,
        "Por eso, en esas comunidades el puente del sábado 5 al martes 8 sale sin pedir ningún día, y en Cataluña no. Si viajas o tienes familia en otra comunidad, cuenta con su calendario, no con el catalán.",
      ),
      ...h2(
        "¿Hay colegio el 7 y el 8 de diciembre?",
        "**El martes 8, no.** La Orden EDF/66/2026, que fija el calendario escolar, establece que son festivos los días que determina el calendario laboral del Departament d'Empresa i Treball y los dos días de fiesta local del municipio. Donde el 7 es fiesta local, tampoco hay clase.",
        "**El lunes 7, depende del centro.** La orden no lo hace festivo, pero cada centro puede fijar «quatre dies festius de lliure disposició» (cuatro días festivos de libre disposición), repartidos entre los tres trimestres, y los consejos escolares municipales deben fijar los que convendría que hicieran todos los centros del municipio. En **Barcelona**, el Consell d'Educació Municipal propone el lunes 7 de diciembre de 2026, «pont del 8 de desembre», en la propuesta aprobada el 10 de junio de 2026. Es una propuesta de ciudad: cada colegio decide. Fuera de Barcelona, pregúntalo en el colegio o en el ayuntamiento.",
        `Las vacaciones de Navidad del curso 2026-2027 van del 22 de diciembre de 2026 al 7 de enero de 2027, ambos incluidos. Todo el curso, en ${sibling("school", "es", "el calendario escolar 2026-2027")}.`,
      ),
      ...h2(
        "¿Abren las tiendas el 6 y el 8 de diciembre?",
        `En Barcelona pueden abrir los dos días. El domingo 6 es uno de los ocho días de apertura del calendario comercial general de 2026 (Orden EMT/77/2025), y el martes 8 es uno de los dos que añade Barcelona (Resolución EMT/4342/2025). En los municipios que no comunicaron días propios, el 8 de diciembre también es día de apertura por defecto. Algunos ayuntamientos han cambiado alguna fecha: el detalle, municipio por municipio, está en ${b2link("shops", "es", "la guía de tiendas abiertas en domingos y festivos")}.`,
        "Poder abrir no quiere decir que abran: cada tienda decide. Las que la ley de comercio excluye del horario general (panaderías y pastelerías, tiendas de conveniencia, farmacias...) pueden abrir igualmente.",
      ),
      ...h2(
        "Qué hacer en el puente de diciembre de 2026",
        "Algunas ideas con fecha oficial y las guías donde las seguimos:",
      ),
      list(
        `**Mercados de Navidad.** La 45ª Fira de l'Avet de Espinelves (Osona) es del 28 de noviembre al 8 de diciembre de 2026, según el Ayuntamiento de Espinelves, y el Mercat Medieval de Vic empieza el 5 de diciembre, según la agenda del Ayuntamiento de Vic (consultad el programa antes de ir). Las fechas de la Fira de Santa Llúcia de Barcelona de 2026 aún no se han publicado. Todos, en ${b2link("christmas", "es", "la guía de mercados de Navidad")}.`,
        `**Belenes vivientes.** El calendario, con las fechas de cada uno cuando se publican, está en ${b2link("pessebres", "es", "la guía de belenes vivientes")}.`,
        `**Navidad en Barcelona.** Las luces, el belén de la plaza de Sant Jaume y qué abre en las fiestas, en ${b2link("christmasBarcelona", "es", "Navidad en Barcelona")}.`,
        `**Nieve y esquí.** Baqueira Beret tiene previsto abrir la temporada el 28 de noviembre «siempre que las condiciones meteorológicas y de nieve lo permitan» (noticia de la estación del 28 de julio de 2026); ninguna apertura es segura hasta que hay nieve. Mira ${b2link("snowNow", "es", "si hay nieve en el Pirineo hoy")} y ${b2link("ski", "es", "las estaciones de esquí de Cataluña")}.`,
        `**El tiempo.** Las medias de diciembre están en ${b2link("climate", "es", "la guía del tiempo en Barcelona mes a mes")}.`,
      ),
      ...paras(
        `Y el domingo siguiente, 13 de diciembre, es ${b2link("marato", "es", "La Marató de 3Cat")}, dedicada este año a las enfermedades neurodegenerativas y neuromusculares.`,
      ),
      faq([
        { question: "¿Hay puente en diciembre de 2026 en Cataluña?", answer: `Solo si pides el lunes 7. El único festivo es el martes 8; el domingo 6 no es festivo en Cataluña. Con el 7 libre, el puente va ${runWords(bridge, "es")}.` },
        { question: "¿Cuándo es el puente de la Purísima de 2026?", answer: `La Purísima (la Inmaculada, 8 de diciembre) cae en martes en 2026 y es festivo en toda Cataluña. Para hacer puente hay que pedir el lunes 7, que en Cataluña es laborable salvo en ${n} municipios: así el puente va ${runWords(bridge, "es")}.` },
        { question: "¿El 7 de diciembre de 2026 es festivo en Cataluña?", answer: `No en toda Cataluña: es laborable. Es fiesta local en ${n} municipios, como ${examples}. En cambio, sí es festivo en Madrid o en Andalucía, que han pasado al lunes el festivo del 6.` },
        { question: "¿El 6 de diciembre de 2026 es festivo?", answer: "Cae en domingo. En Cataluña no es festivo y no se pasa al lunes; en nueve comunidades autónomas y en Melilla, sí: tienen fiesta el lunes 7." },
        { question: "¿Qué días son festivos en diciembre de 2026 en Cataluña?", answer: "El martes 8 (la Inmaculada), el viernes 25 (Navidad) y el sábado 26 (San Esteban). En Arán, el 26 no es festivo." },
        { question: "¿Hay clase el 7 de diciembre?", answer: "Depende del centro: no es festivo escolar en toda Cataluña, pero los centros pueden hacer ese día uno de sus cuatro días festivos de libre disposición. En Barcelona, el Consell d'Educació Municipal propone que los colegios no tengan clase ese día." },
        { question: "¿Abren las tiendas el 8 de diciembre en Barcelona?", answer: "Pueden abrir: el martes 8 es uno de los dos días que Barcelona añade al calendario comercial de 2026. El domingo 6 también es día de apertura." },
      ]),
      ...paras(verifiedLine("es", BRIDGE_VERIFIED)),
      ...b2Related([...RELATED], "es"),
    ];
  }

  return [
    lead(
      `**In 2026 the only public holiday of the December bridge in Catalonia is Tuesday 8 December (the Immaculate Conception).** 6 December, Constitution Day, falls on a Sunday and is not in Catalonia's holiday calendar, and Monday the 7th is a working day: to get ${bridge.days} days in a row, ${runWords(bridge, "en")}, you have to take Monday the 7th off.`,
    ),
    keyFacts("The December 2026 bridge at a glance", [
      { label: "Public holiday across Catalonia", value: "Tuesday 8 December (Immaculate Conception)" },
      { label: "Sunday 6 December", value: "Not a holiday in Catalonia: Constitution Day falls on a Sunday and is not moved to the Monday" },
      { label: "Monday 7 December", value: `A working day, except in the ${n} towns that have a local holiday` },
      { label: "For a long weekend", value: `Take Monday the 7th off: ${bridge.days} days, ${runWords(bridge, "en")}` },
      { label: "Schools", value: "No school on the 8th; the 7th depends on each school" },
      { label: "Shops", value: "May open on Sunday 6 and Tuesday 8 December in Barcelona and in towns without their own days" },
    ]),
    callout(
      "official",
      "Where these dates come from",
      "The official 2026 holiday calendar, Order EMT/66/2025 (DOGC, Catalonia's official gazette, 6 May 2025), which sets twelve holidays across Catalonia; in December, only the 8th, 25th and 26th. We re-read it in the DOGC on 26 October 2026; it has not been amended.",
    ),
    ...h2(
      "Which days are public holidays in Catalonia in December 2026?",
      "Three: **Tuesday 8** (Immaculate Conception), **Friday 25** (Christmas Day) and **Saturday 26** (Sant Esteve, St Stephen's Day). In Aran, 26 December is not a holiday: the Festa d'Aran on 17 June replaces it.",
    ),
    dayTable("en"),
    ...h2(
      "Is 6 December 2026 a public holiday in Catalonia?",
      "No. Constitution Day falls on a Sunday, and the order that sets Catalonia's 2026 holiday calendar neither includes it nor moves it to the Monday. Of the year's twelve holidays, the only one that week is Tuesday the 8th.",
      "When a national holiday falls on a Sunday, each autonomous community can give the following Monday off or add a holiday of its own to its calendar instead. Catalonia has not put Monday the 7th in its calendar.",
    ),
    ...h2(
      "Is 7 December a holiday in Catalonia?",
      `Not across Catalonia: it is an ordinary working Monday. It **is a local holiday in ${n} towns**, such as ${examples}, according to Order EMT/208/2025 (DOGC, 17 December 2025). A few villages within other municipalities, such as Escaladei and Escart, have the day off too. Barcelona is not one of them: its 2026 local holidays are 25 May and 24 September.`,
      `To check your own town, look it up in ${sibling("local", "en", "local holidays for every town in Catalonia")}.`,
    ),
    ...h2(
      "How to make a long weekend of it: which days to take off",
      "If you work Monday to Friday, these are the combinations the calendar allows. They are our calculation, not an entitlement: leave has to be requested and agreed with your employer, and shifts or collective agreements can change everything.",
    ),
    optionTable("en"),
    ...paras(
      "Without booking anything, Tuesday the 8th is a single day off between two working days. At Christmas you get three days without booking any: the 25th is a Friday and the 26th a Saturday.",
    ),
    ...h2(
      "What about the rest of Spain? Where Monday the 7th is a holiday",
      `According to the national list of 2026 public holidays published in the BOE (Spain's official state gazette) on 28 October 2025, Monday 7 December is a holiday in ${regions}. Not in Catalonia, nor in the Balearic Islands, the Canary Islands, Castilla-La Mancha, Galicia, Navarre, the Basque Country, the Valencian Community or Ceuta. Tuesday the 8th is a holiday everywhere in Spain.`,
      "That is why in those regions the Saturday 5 to Tuesday 8 break comes without booking a day, and in Catalonia it does not. If you are travelling to or have family in another region, go by its calendar, not Catalonia's.",
    ),
    ...h2(
      "Is there school on 7 and 8 December?",
      "**Not on Tuesday the 8th.** Order EDF/66/2026, which sets the school calendar, says the school holidays are the days in the Department of Business and Labour's holiday calendar plus the town's two local holidays. Where the 7th is a local holiday, there is no school either.",
      "**On Monday the 7th, it depends on the school.** The order does not make it a holiday, but each school may set \"quatre dies festius de lliure disposició\" (four free-choice days off), spread over the three terms, and each town's school council proposes the days all its schools should ideally share. In **Barcelona**, the municipal education council (Consell d'Educació Municipal) proposes Monday 7 December 2026, \"pont del 8 de desembre\", in the proposal it approved on 10 June 2026. It is a city-wide recommendation and each school decides. Outside Barcelona, ask the school or the town council.",
      `Christmas holidays in the 2026-2027 school year run from 22 December 2026 to 7 January 2027 inclusive. The whole year is in ${sibling("school", "en", "the 2026-2027 school calendar")}.`,
    ),
    ...h2(
      "Are shops open on 6 and 8 December?",
      `In Barcelona they may open on both days. Sunday the 6th is one of the eight opening days in the general 2026 shopping calendar (Order EMT/77/2025), and Tuesday the 8th is one of the two Barcelona adds (Resolution EMT/4342/2025). In towns that did not send in their own days, 8 December is also an opening day by default. Some councils swapped a date: town-by-town details are in ${b2link("shops", "en", "our guide to shops open on Sundays and holidays")}.`,
      "Being allowed to open does not mean every shop will: each decides. Shops the retail law exempts from the general hours (bakeries and cake shops, convenience stores, pharmacies...) can open anyway.",
    ),
    ...h2(
      "Things to do over the December 2026 bridge",
      "A few ideas with official dates, and the guides where we follow them:",
    ),
    list(
      `**Christmas markets.** The 45th Fira de l'Avet in Espinelves (Osona) runs from 28 November to 8 December 2026, according to Espinelves town council, and the Vic Medieval Market starts on 5 December, according to Vic town council's listings (check the programme before you go). Barcelona's Fira de Santa Llúcia has not published its 2026 dates yet. All of them are in ${b2link("christmas", "en", "our Christmas markets guide")}.`,
      `**Living nativity scenes.** The calendar, with each one's dates once published, is in ${b2link("pessebres", "en", "our living nativity scenes guide")}.`,
      `**Christmas in Barcelona.** The lights, the Plaça de Sant Jaume nativity scene and what is open over the holidays: ${b2link("christmasBarcelona", "en", "Christmas in Barcelona")}.`,
      `**Snow and skiing.** Baqueira Beret plans to open its season on 28 November, weather and snow permitting (the resort's news item of 28 July 2026); no opening is certain until the snow is there. Check ${b2link("snowNow", "en", "whether there is snow in the Pyrenees today")} and ${b2link("ski", "en", "Catalonia's ski resorts")}.`,
      `**Weather.** December averages are in ${b2link("climate", "en", "our Barcelona weather by month guide")}.`,
    ),
    ...paras(
      `And the following Sunday, 13 December, is ${b2link("marato", "en", "La Marató de 3Cat")}, the TV3 telethon, this year for neurodegenerative and neuromuscular diseases.`,
    ),
    faq([
      { question: "Is there a long weekend in December 2026 in Catalonia?", answer: `Only if you take Monday the 7th off. The only holiday is Tuesday the 8th; Sunday the 6th is not a holiday in Catalonia. With the 7th off, the break runs ${runWords(bridge, "en")}.` },
      { question: "Is 7 December 2026 a holiday in Catalonia?", answer: `Not across Catalonia: it is a working day. It is a local holiday in ${n} towns, such as ${examples}. It is, however, a holiday in Madrid or Andalusia, which moved the 6th to the Monday.` },
      { question: "Is 6 December 2026 a public holiday?", answer: "It falls on a Sunday. In Catalonia it is not a holiday and is not moved to the Monday; in nine autonomous communities and Melilla it is, with Monday the 7th off." },
      { question: "Which days are public holidays in Catalonia in December 2026?", answer: "Tuesday 8 (Immaculate Conception), Friday 25 (Christmas Day) and Saturday 26 (Sant Esteve). In Aran, the 26th is not a holiday." },
      { question: "Is there school on 7 December?", answer: "It depends on the school: it is not a school holiday across Catalonia, but schools may use one of their four free-choice days on it. In Barcelona, the municipal education council recommends that schools take that day off." },
      { question: "Are shops open on 8 December in Barcelona?", answer: "They may open: Tuesday the 8th is one of the two days Barcelona adds to its 2026 shopping calendar. Sunday the 6th is an opening day too." },
    ]),
    ...paras(verifiedLine("en", BRIDGE_VERIFIED)),
    ...b2Related([...RELATED], "en"),
  ];
}

export const DECEMBER_BRIDGE: B2Article = {
  key: "decemberBridge",
  entryKey: "guide-december-bridge-catalonia",
  categoryKey: "calendar",
  sources: SOURCES,
  // Reused from the manifest (no new photographs this round). Same alt and
  // caption as SHOPS's second image: media rows are keyed by file.
  heroKey: SHOPS.secondaryKey,
  heroAlt: SHOPS.secondaryAlt,
  heroCaption: SHOPS.secondaryCaption,
  verifiedAt: BRIDGE_VERIFIED,
  publishedAt: "2026-10-26T12:00:00+01:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...DECEMBER_BRIDGE_META[locale], blocks: buildDecemberBridgeBody(locale) }]),
  ) as B2Article["editions"],
};
