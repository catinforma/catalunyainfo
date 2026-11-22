import { dayMonthYear } from "@/lib/programmatic/holidays/format";
import { CITIES as ZA_CITIES } from "@/lib/programmatic/zona-azul/data";
import { BARCELONA_GUIDE, zaCityPath, zaHubPath } from "@/lib/programmatic/zona-azul/paths";

import { labelAnswer, mainRestriction } from "./logic";
import { offText, scheduleText } from "./schedule-text";
import { LABELS, type Fact, type FactKind, type Label, type LabelAnswer, type ZbeCity, type ZbeLocale } from "./types";

/**
 * Every sentence of the family that is not a sourced fact of a city: titles,
 * headings, the words around the answer and the FAQ, which only rearranges
 * the city's sourced facts under the words people search ("mapa", "etiqueta
 * B", "hoy", the year, "cámaras", "multa"). Nothing here states a rule.
 */

const pick = (locale: ZbeLocale, es: string, ca: string, en: string): string => (locale === "es" ? es : locale === "ca" ? ca : en);

/** Markdown links out of a text: for JSON-LD and for sentences built from a fact. */
export function plain(text: string): string {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

/** "de Tarragona" / "d'Oviedo" (Catalan elides before a vowel or h). */
export function ofCity(name: string, locale: ZbeLocale): string {
  if (locale === "ca" && /^[aeiouàèéíòóúh]/i.test(name)) return `d'${name}`;
  return `de ${name}`;
}

export function labelName(label: Label, locale: ZbeLocale): string {
  if (label === "none") return pick(locale, "Sin etiqueta", "Sense etiqueta", "No label");
  return pick(locale, `Etiqueta ${label}`, `Etiqueta ${label}`, `${label} label`);
}

function joinWords(words: string[], conjunction: string): string {
  if (words.length < 2) return words.join("");
  return `${words.slice(0, -1).join(", ")} ${conjunction} ${words[words.length - 1]}`;
}

/** "con etiqueta B o sin etiqueta": a set of labels as the vehicles that carry them. */
function vehiclesWith(labels: Label[], locale: ZbeLocale): string {
  const stickers = labels.filter((label) => label !== "none");
  const parts: string[] = [];
  if (stickers.length > 0) {
    parts.push(pick(locale, `con etiqueta ${joinWords(stickers, "o")}`, `amb etiqueta ${joinWords(stickers, "o")}`, `with a ${joinWords(stickers, "or")} label`));
  }
  if (labels.includes("none")) parts.push(pick(locale, "sin etiqueta ambiental", "sense etiqueta ambiental", "with no environmental label"));
  return parts.join(pick(locale, " o ", " o ", " or "));
}

const capital = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1);
const sentence = (text: string): string => (/[.!?]$/.test(text) ? text : `${text}.`);

/* ------------------------------ the answer ------------------------------ */

export interface AnswerCell {
  /** "Sí", "No, de lunes a viernes laborables, de 7 a 19 h", "Depende". */
  verdict: string;
  /** The vehicles, the conditions and what is left open, as sentences. */
  detail: string;
}

/**
 * The authority with its article. Its names are Catalan and start with a vowel
 * ("l'Ajuntament", "l'Àrea"); Spanish takes "el" for both; English takes none.
 */
export function authorityAs(city: Pick<ZbeCity, "authority">, locale: ZbeLocale, role: "subject" | "of" | "with"): string {
  const name = city.authority;
  if (locale === "en") return name;
  if (locale === "ca") return role === "subject" ? `L'${name}` : role === "of" ? `de l'${name}` : `amb l'${name}`;
  return role === "subject" ? `El ${name}` : role === "of" ? `del ${name}` : `con el ${name}`;
}

/**
 * One row of the answer table. "Yes" is never more than "no restriction by
 * label"; a "no" carries its days, its hours and who is still let in; a
 * "depends" prints the condition the council gives.
 */
export function answerCell(city: Pick<ZbeCity, "authority">, answer: LabelAnswer, locale: ZbeLocale): AnswerCell {
  if (answer.kind === "yes") {
    return {
      verdict: pick(locale, "Sí", "Sí", "Yes"),
      detail: pick(locale, "Sin restricción de acceso por etiqueta ambiental.", "Sense restricció d'accés per etiqueta ambiental.", "No access restriction by environmental label."),
    };
  }
  if (answer.restrictions.length === 0) {
    return {
      verdict: pick(locale, "Depende", "Depèn", "It depends"),
      detail: pick(
        locale,
        `La página oficial de la zona no dice si esta etiqueta puede entrar: hay que consultarlo ${authorityAs(city, locale, "with")}.`,
        `La pàgina oficial de la zona no diu si aquesta etiqueta pot entrar: cal consultar-ho ${authorityAs(city, locale, "with")}.`,
        `The zone's official page does not say whether this label may drive in: check with ${city.authority}.`,
      ),
    };
  }
  if (answer.kind === "depends") {
    return {
      verdict: pick(locale, "Depende", "Depèn", "It depends"),
      detail: answer.restrictions.map((r) => sentence(r.condition?.[locale] ?? r.vehicles[locale])).join(" "),
    };
  }
  const firm = answer.restrictions.filter((r) => !r.condition);
  const details = firm.map((r) => {
    const out = [sentence(r.vehicles[locale])];
    if (r.unless) out.push(sentence(capital(r.unless[locale])));
    const off = offText(r.schedule, locale);
    if (off) out.push(off);
    return out.join(" ");
  });
  for (const r of answer.restrictions) if (r.condition) details.push(sentence(r.condition[locale]));
  const main = firm[0];
  const when = main ? `, ${scheduleText(main.schedule, locale)}` : "";
  return { verdict: `No${when}`, detail: details.join(" ") };
}

export function cityAnswers(city: ZbeCity): LabelAnswer[] {
  return LABELS.map((label) => labelAnswer(city, label));
}

/** The lead: who cannot drive in and when, who depends on a condition, who can. Built from the table. */
export function cityLead(city: ZbeCity, locale: ZbeLocale): string {
  const answers = cityAnswers(city);
  const of = (kind: LabelAnswer["kind"]) => answers.filter((a) => a.kind === kind).map((a) => a.label);
  const no = of("no");
  const depends = of("depends");
  const yes = of("yes").filter((label) => label !== "none");
  const zone = city.zoneName[locale];
  const out: string[] = [];
  if (no.length > 0) {
    const when = scheduleText(mainRestriction(city).schedule, locale);
    out.push(
      pick(
        locale,
        `En la ${zone} no pueden entrar los vehículos ${vehiclesWith(no, locale)} ${when}, salvo exenciones y autorizaciones.`,
        `A la ${zone} no hi poden entrar els vehicles ${vehiclesWith(no, locale)} ${when}, tret d'exempcions i autoritzacions.`,
        `In the ${zone}, vehicles ${vehiclesWith(no, locale)} cannot drive in ${when}, unless exempt or authorised.`,
      ),
    );
  }
  if (depends.length > 0) {
    const where = no.length > 0 ? "" : pick(locale, `En la ${zone}, `, `A la ${zone}, `, `In the ${zone}, `);
    const body = pick(
      locale,
      `para los vehículos ${vehiclesWith(depends, locale)} la respuesta depende de condiciones que la tabla detalla.`,
      `per als vehicles ${vehiclesWith(depends, locale)} la resposta depèn de condicions que la taula detalla.`,
      `for vehicles ${vehiclesWith(depends, locale)} the answer depends on conditions set out in the table.`,
    );
    out.push(where ? `${where}${body}` : capital(body));
  }
  if (yes.length > 0) {
    out.push(
      pick(
        locale,
        `Con etiqueta ${joinWords(yes, "o")} no hay restricción por etiqueta.`,
        `Amb etiqueta ${joinWords(yes, "o")} no hi ha restricció per etiqueta.`,
        `With a ${joinWords(yes, "or")} label there is no restriction by label.`,
      ),
    );
  }
  return out.join(" ");
}

/* ------------------------------ city page ------------------------------ */

const TITLE_MAX = 60;

function firstThatFits(candidates: string[]): string {
  return candidates.find((title) => title.length <= TITLE_MAX) ?? candidates[candidates.length - 1] ?? "";
}

export function cityMeta(city: ZbeCity, locale: ZbeLocale): { title: string; description: string; h1: string } {
  const name = city.name[locale];
  const of = ofCity(name, locale);
  return {
    title: firstThatFits(
      locale === "es"
        ? [`ZBE ${name}: etiquetas, horario, mapa y multa`, `ZBE ${name}: etiquetas, horario y multa`, `ZBE ${name}: etiquetas y horario`]
        : locale === "ca"
          ? [`ZBE ${name}: etiquetes, horari, mapa i multa`, `ZBE ${name}: etiquetes, horari i multa`, `ZBE ${name}: etiquetes i horari`]
          : [`${name} low-emission zone (ZBE): labels, hours, fines`, `${name} ZBE: labels, hours and fines`, `${name} ZBE: labels and hours`],
    ),
    description: pick(
      locale,
      `¿Puedo entrar en la ZBE ${of}? Respuesta por etiqueta DGT (0, ECO, C, B, sin etiqueta), días y horas, autorizaciones, mapa oficial y multa.`,
      `Puc entrar a la ZBE ${of}? Resposta per etiqueta DGT (0, ECO, C, B, sense etiqueta), dies i hores, autoritzacions, mapa oficial i multa.`,
      `Can I drive into the ${name} low-emission zone? Answer by DGT label (0, ECO, C, B, none), days and hours, permits, official map and fine.`,
    ),
    h1: pick(locale, `ZBE ${of}: ¿puedo entrar con mi coche?`, `ZBE ${of}: hi puc entrar amb el cotxe?`, `${name} low-emission zone (ZBE): can I drive in?`),
  };
}

const guideLink = (locale: ZbeLocale): string =>
  pick(locale, "ZBE de Barcelona con coche extranjero", "ZBE de Barcelona amb cotxe estranger", "Barcelona's low-emission zone with a foreign car");

export const FACT_LABEL: Record<FactKind, Record<ZbeLocale, string>> = {
  area: { es: "Zona", ca: "Zona", en: "Area" },
  since: { es: "Desde cuándo", ca: "Des de quan", en: "Since when" },
  next: { es: "Próximo cambio", ca: "Proper canvi", en: "Next change" },
  occasional: { es: "Acceso esporádico", ca: "Accés esporàdic", en: "Occasional access" },
  residents: { es: "Residentes", ca: "Residents", en: "Residents" },
  foreign: { es: "Matrícula extranjera", ca: "Matrícula estrangera", en: "Foreign plates" },
  parking: { es: "Aparcamientos", ca: "Aparcaments", en: "Car parks" },
  exempt: { es: "Exenciones", ca: "Exempcions", en: "Exemptions" },
  control: { es: "Control", ca: "Control", en: "Enforcement" },
  fine: { es: "Multa", ca: "Multa", en: "Fine" },
};

export interface CityCopy {
  tableCaption: string;
  colLabel: string;
  colAnswer: string;
  colDetail: string;
  tableSource: string;
  checkedLine: string;
  whenTitle: string;
  when: string;
  areaTitle: string;
  mapLink: string;
  phasesTitle: string;
  permitsTitle: string;
  enforcementTitle: string;
  noControl: string;
  dgtTitle: string;
  dgtAgree: string;
  dgtAttribution: string;
  notPublishedTitle: string;
  notPublishedLead: string;
  faqTitle: string;
  sourcesTitle: string;
  source: string;
  officialSite: string;
  moreTitle: string;
  hubLink: string;
  guideTitle: string;
  guideLink: string;
}

export function cityCopy(city: ZbeCity, locale: ZbeLocale): CityCopy {
  const name = city.name[locale];
  const of = ofCity(name, locale);
  const main = mainRestriction(city);
  const checked = dayMonthYear(city.checked, locale);
  const off = offText(main.schedule, locale);
  return {
    tableCaption: pick(
      locale,
      `¿Puedo entrar en la ${city.zoneName.es}? Respuesta por etiqueta ambiental de la DGT`,
      `Puc entrar a la ${city.zoneName.ca}? Resposta per etiqueta ambiental de la DGT`,
      `Can I drive into the ${city.zoneName.en}? Answer by DGT environmental label`,
    ),
    colLabel: pick(locale, "Etiqueta DGT", "Etiqueta DGT", "DGT label"),
    colAnswer: pick(locale, "¿Puede entrar?", "Pot entrar?", "Can it drive in?"),
    colDetail: pick(locale, "Vehículos y condiciones", "Vehicles i condicions", "Vehicles and conditions"),
    tableSource: pick(locale, "Fuente de la tabla", "Font de la taula", "Source of the table"),
    checkedLine: pick(
      locale,
      `Regla leída en la web ${authorityAs(city, locale, "of")} y comprobada el ${checked}.`,
      `Regla llegida al web ${authorityAs(city, locale, "of")} i comprovada el ${checked}.`,
      `Rule read on the website of ${city.authority} and checked on ${checked}.`,
    ),
    whenTitle: pick(locale, `Días y horas: ¿se aplica hoy la ZBE ${of}?`, `Dies i hores: s'aplica avui la ZBE ${of}?`, `Days and hours: does the ${name} ZBE apply today?`),
    when: [
      pick(
        locale,
        `La restricción se aplica ${scheduleText(main.schedule, locale)}.`,
        `La restricció s'aplica ${scheduleText(main.schedule, locale)}.`,
        `The restriction applies ${scheduleText(main.schedule, locale)}.`,
      ),
      off,
    ]
      .filter(Boolean)
      .join(" "),
    areaTitle: pick(locale, `Mapa y calles de la ZBE ${of}`, `Mapa i carrers de la ZBE ${of}`, `Map and streets of the ${name} ZBE`),
    mapLink: pick(locale, "Mapa oficial de la zona", "Mapa oficial de la zona", "Official map of the zone"),
    phasesTitle: pick(locale, "Desde cuándo y próximos cambios", "Des de quan i propers canvis", "Since when and what changes next"),
    permitsTitle: pick(locale, "Exenciones y autorizaciones", "Exempcions i autoritzacions", "Exemptions and authorisations"),
    enforcementTitle: pick(locale, "Cámaras, control y multa", "Càmeres, control i multa", "Cameras, enforcement and fine"),
    noControl: pick(
      locale,
      "Las páginas oficiales consultadas no describen cómo se controla el acceso (cámaras u otro sistema); esta página no lo publica.",
      "Les pàgines oficials consultades no descriuen com es controla l'accés (càmeres o un altre sistema); aquesta pàgina no ho publica.",
      "The official pages read do not describe how access is enforced (cameras or otherwise); this page does not state it.",
    ),
    dgtTitle: pick(locale, "Qué dice el fichero de la DGT", "Què diu el fitxer de la DGT", "What the DGT file says"),
    dgtAgree: pick(
      locale,
      "El fichero de la DGT y la web municipal coinciden en horario y fecha de inicio.",
      "El fitxer de la DGT i el web municipal coincideixen en horari i data d'inici.",
      "The DGT file and the council's website agree on hours and start date.",
    ),
    dgtAttribution: pick(
      locale,
      `La regla de acceso de esta página no sale de ese fichero, sino de la web ${authorityAs(city, locale, "of")}.`,
      `La regla d'accés d'aquesta pàgina no surt d'aquest fitxer, sinó del web ${authorityAs(city, locale, "of")}.`,
      `The access rule on this page does not come from that file but from the website of ${city.authority}.`,
    ),
    notPublishedTitle: pick(locale, "Lo que esta página no publica", "El que aquesta pàgina no publica", "What this page does not publish"),
    notPublishedLead: pick(
      locale,
      "Solo se publica lo que se ha leído en una página oficial. Queda fuera:",
      "Només es publica el que s'ha llegit en una pàgina oficial. En queda fora:",
      "Only what was read on an official page is published. Left out:",
    ),
    faqTitle: pick(locale, `Preguntas frecuentes sobre la ZBE ${of}`, `Preguntes freqüents sobre la ZBE ${of}`, `${name} ZBE: frequent questions`),
    sourcesTitle: pick(locale, `Fuentes oficiales, comprobadas el ${checked}`, `Fonts oficials, comprovades el ${checked}`, `Official sources, checked on ${checked}`),
    source: pick(locale, "Fuente", "Font", "Source"),
    officialSite: pick(locale, "Web oficial de la zona", "Web oficial de la zona", "Official website of the zone"),
    moreTitle: pick(locale, "Otras zonas de bajas emisiones", "Altres zones de baixes emissions", "Other low-emission zones"),
    hubLink: pick(locale, "Todas las ZBE de España, con etiquetas y horarios", "Totes les ZBE d'Espanya, amb etiquetes i horaris", "Every low-emission zone in Spain, with labels and hours"),
    guideTitle: pick(locale, "Guía relacionada", "Guia relacionada", "Related guide"),
    guideLink: guideLink(locale),
  };
}

/** What the "today" answer knows about holidays, printed under it. */
export function holidayNote(input: { locale: ZbeLocale; cityName: string; regionName: string; local: boolean; calendarPath: string | null }): string {
  const { locale, cityName, regionName, local, calendarPath } = input;
  const base = pick(
    locale,
    `Festivos que cuenta esta respuesta: los estatales y los de ${regionName} de 2026 y 2027`,
    `Festius que compta aquesta resposta: els estatals i els de ${regionName} de 2026 i 2027`,
    `Public holidays this answer counts: the national ones and those of ${regionName} for 2026 and 2027`,
  );
  if (local && calendarPath) {
    return pick(
      locale,
      `${base}, y los dos festivos locales ${ofCity(cityName, locale)} de 2026 ([calendario](${calendarPath})). Los festivos locales de 2027 aún no están publicados: ese día la respuesta dirá que la restricción se aplica aunque sea festivo.`,
      `${base}, i els dos festius locals ${ofCity(cityName, locale)} de 2026 ([calendari](${calendarPath})). Els festius locals de 2027 encara no estan publicats: aquell dia la resposta dirà que la restricció s'aplica encara que sigui festiu.`,
      `${base}, plus the two local holidays of ${cityName} for 2026 ([calendar](${calendarPath})). The local holidays of 2027 are not published yet: on those days the answer will say the restriction applies although it is a holiday.`,
    );
  }
  return pick(
    locale,
    `${base}. No cuenta los festivos locales: ese día la respuesta dirá que la restricción se aplica aunque sea festivo en la ciudad.`,
    `${base}. No compta els festius locals: aquell dia la resposta dirà que la restricció s'aplica encara que sigui festiu a la ciutat.`,
    `${base}. Local holidays are not counted: on those days the answer will say the restriction applies although it is a holiday in the city.`,
  );
}

const factsOf = (city: ZbeCity, kind: FactKind): Fact[] => city.facts.filter((fact) => fact.kind === kind);
const textOf = (facts: Fact[], locale: ZbeLocale): string => facts.map((fact) => sentence(fact.text[locale])).join(" ");

/**
 * The questions in the words of the queries. Each answer is the table or a
 * sourced fact of the city again; where the council's pages are silent the
 * answer says so. A question about a fact the city does not have is left out.
 */
export function cityFaq(city: ZbeCity, locale: ZbeLocale): { q: string; a: string }[] {
  const name = city.name[locale];
  const of = ofCity(name, locale);
  const year = city.checked.slice(0, 4);
  const copy = cityCopy(city, locale);
  const faq: { q: string; a: string }[] = [];

  const area = textOf(factsOf(city, "area"), locale);
  faq.push({
    q: pick(locale, `¿Dónde está el mapa de la ZBE ${of}?`, `On és el mapa de la ZBE ${of}?`, `Where is the map of the ${name} ZBE?`),
    a: [
      pick(
        locale,
        `${authorityAs(city, locale, "subject")} publica el [mapa oficial de la zona](${city.mapUrl}).`,
        `${authorityAs(city, locale, "subject")} publica el [mapa oficial de la zona](${city.mapUrl}).`,
        `${city.authority} publishes the [official map of the zone](${city.mapUrl}).`,
      ),
      area,
    ]
      .filter(Boolean)
      .join(" "),
  });

  const b = answerCell(city, labelAnswer(city, "B"), locale);
  const next = textOf(factsOf(city, "next"), locale);
  faq.push({
    q: pick(locale, `¿Puedo entrar en la ZBE ${of} con etiqueta B?`, `Puc entrar a la ZBE ${of} amb etiqueta B?`, `Can I drive into the ${name} ZBE with a B label?`),
    // A condition that already opens with the verdict ("Depends on the fuel…") is not said twice.
    a: [b.detail.toLowerCase().startsWith(b.verdict.toLowerCase()) ? b.detail : `${sentence(b.verdict)} ${b.detail}`, next ? `${pick(locale, "Cambio anunciado:", "Canvi anunciat:", "Announced change:")} ${next}` : ""].filter(Boolean).join(" "),
  });

  faq.push({
    q: pick(locale, `¿Se aplica hoy la ZBE ${of}?`, `S'aplica avui la ZBE ${of}?`, `Does the ${name} ZBE apply today?`),
    a: `${copy.when} ${pick(
      locale,
      "Al principio de la página se indica si hoy es uno de esos días y si la restricción está en vigor a esta hora.",
      "Al principi de la pàgina s'indica si avui és un d'aquests dies i si la restricció és vigent a aquesta hora.",
      "The top of the page says whether today is one of those days and whether the restriction is in force at this hour.",
    )}`,
  });

  const since = textOf(factsOf(city, "since"), locale);
  faq.push({
    q: pick(locale, `¿Qué restricciones tiene la ZBE ${of} en ${year}?`, `Quines restriccions té la ZBE ${of} el ${year}?`, `What are the ${name} ZBE restrictions in ${year}?`),
    a: [cityLead(city, locale), since, next].filter(Boolean).join(" "),
  });

  const control = textOf(factsOf(city, "control"), locale);
  faq.push({
    q: pick(locale, `¿Hay cámaras en la ZBE ${of}?`, `Hi ha càmeres a la ZBE ${of}?`, `Are there cameras in the ${name} ZBE?`),
    a: control || copy.noControl,
  });

  const fine = textOf(factsOf(city, "fine"), locale);
  if (fine) {
    faq.push({
      q: pick(locale, `¿De cuánto es la multa de la ZBE ${of}?`, `De quant és la multa de la ZBE ${of}?`, `How much is the fine in the ${name} ZBE?`),
      a: fine,
    });
  }

  const foreign = textOf(factsOf(city, "foreign"), locale);
  if (foreign) {
    faq.push({
      q: pick(
        locale,
        `¿Puede entrar un coche con matrícula extranjera en la ZBE ${of}?`,
        `Pot entrar un cotxe amb matrícula estrangera a la ZBE ${of}?`,
        `Can a foreign-registered car drive into the ${name} ZBE?`,
      ),
      a: foreign,
    });
  }

  return faq;
}

/** The DGT record of the zone, in one sentence. */
export function dgtSentence(input: { locale: ZbeLocale; name: string; builtOn: string; hours: { from: string; to: string } | null; holidays: boolean; start: string | null }): string {
  const { locale, name, builtOn, hours, holidays, start } = input;
  const copyDay = dayMonthYear(builtOn, locale);
  const parts: string[] = [];
  if (hours) {
    parts.push(
      pick(
        locale,
        `horario de días laborables de ${hours.from} a ${hours.to}`,
        `horari de dies feiners de ${hours.from} a ${hours.to}`,
        `working-day hours ${hours.from} to ${hours.to}`,
      ),
    );
  }
  parts.push(
    holidays
      ? pick(locale, "con un periodo propio para festivos", "amb un període propi per a festius", "with a separate period for public holidays")
      : pick(locale, "sin periodo para festivos", "sense període per a festius", "with no period for public holidays"),
  );
  if (start) parts.push(pick(locale, `fecha de inicio ${dayMonthYear(start, locale)}`, `data d'inici ${dayMonthYear(start, locale)}`, `start date ${dayMonthYear(start, locale)}`));
  return pick(
    locale,
    `El fichero DATEX II de la DGT (copia del ${copyDay}) registra esta zona como «${name}»: ${parts.join(", ")}.`,
    `El fitxer DATEX II de la DGT (còpia del ${copyDay}) registra aquesta zona com a «${name}»: ${parts.join(", ")}.`,
    `The DGT's DATEX II file (copy of ${copyDay}) records this zone as "${name}": ${parts.join(", ")}.`,
  );
}

export function dgtCredit(locale: ZbeLocale, dataset: string, licence: string): string {
  return pick(
    locale,
    `Datos del fichero: Dirección General de Tráfico, [Zonas de bajas emisiones](${dataset}) (Punto de Acceso Nacional de tráfico y movilidad), licencia [CC BY 4.0](${licence}).`,
    `Dades del fitxer: Dirección General de Tráfico, [Zonas de bajas emisiones](${dataset}) (Punt d'Accés Nacional de trànsit i mobilitat), llicència [CC BY 4.0](${licence}).`,
    `File data: Dirección General de Tráfico, [Zonas de bajas emisiones](${dataset}) (Spain's National Access Point for traffic and mobility), [CC BY 4.0](${licence}) licence.`,
  );
}

/* --------------------------------- hub --------------------------------- */

export function hubMeta(locale: ZbeLocale): { title: string; description: string; h1: string } {
  return {
    title: pick(locale, "ZBE en España: ciudades, etiquetas y horarios", "ZBE a Espanya: ciutats, etiquetes i horaris", "Low-emission zones in Spain (ZBE): cities, labels, hours"),
    description: pick(
      locale,
      "Zonas de bajas emisiones ciudad a ciudad: qué etiquetas DGT tienen restricción, qué días y horas y si ya se multa. Cataluña aparte y fuente oficial.",
      "Zones de baixes emissions ciutat a ciutat: quines etiquetes DGT tenen restricció, quins dies i hores i si ja es multa. Catalunya a part i font oficial.",
      "Spain's low-emission zones city by city: which DGT labels are restricted, on which days and hours, and whether fines apply. Official sources.",
    ),
    h1: pick(locale, "ZBE en España: ciudades, etiquetas y horarios", "ZBE a Espanya: ciutats, etiquetes i horaris", "Low-emission zones in Spain (ZBE): cities, labels and hours"),
  };
}

export interface HubCopy {
  lead: string;
  tableTitle: string;
  tableCaption: string;
  colCity: string;
  colFines: string;
  colLabels: string;
  colHours: string;
  colChecked: string;
  finesYes: string;
  finesNo: string;
  conditional: string;
  cataloniaTitle: string;
  cataloniaLead: string;
  cataloniaPending: string;
  restTitle: string;
  restLead: string;
  none: string;
  guideLine: string;
  guideLink: string;
  faqTitle: string;
  sourcesTitle: string;
}

export function hubCopy(locale: ZbeLocale, counts: { cities: number; zones: number; files: number; builtOn: string }): HubCopy {
  const copyDay = dayMonthYear(counts.builtOn, locale);
  return {
    lead: pick(
      locale,
      `Qué etiqueta de la DGT puede entrar en cada zona de bajas emisiones, qué días y a qué horas. Cada regla está leída en la web oficial de la ciudad, con su fecha de comprobación; el directorio de la DGT (copia del ${copyDay}) lista ${counts.zones} zonas en ${counts.files} ficheros municipales.`,
      `Quina etiqueta de la DGT pot entrar a cada zona de baixes emissions, quins dies i a quines hores. Cada regla està llegida al web oficial de la ciutat, amb la data de comprovació; el directori de la DGT (còpia del ${copyDay}) llista ${counts.zones} zones en ${counts.files} fitxers municipals.`,
      `Which DGT label may drive into each low-emission zone, on which days and at what hours. Every rule was read on the city's official website and carries the date it was checked; the DGT directory (copy of ${copyDay}) lists ${counts.zones} zones in ${counts.files} municipal files.`,
    ),
    tableTitle: pick(locale, "Ciudades con la regla comprobada", "Ciutats amb la regla comprovada", "Cities with a verified rule"),
    tableCaption: pick(
      locale,
      "Etiquetas con restricción, días y horas de cada ZBE, según la web oficial de cada ciudad",
      "Etiquetes amb restricció, dies i hores de cada ZBE, segons el web oficial de cada ciutat",
      "Restricted labels, days and hours of each ZBE, as stated on each city's official website",
    ),
    colCity: pick(locale, "Ciudad", "Ciutat", "City"),
    colFines: pick(locale, "¿Se multa ya?", "Ja es multa?", "Fines in force?"),
    colLabels: pick(locale, "Etiquetas con restricción", "Etiquetes amb restricció", "Restricted labels"),
    colHours: pick(locale, "Días y horas", "Dies i hores", "Days and hours"),
    colChecked: pick(locale, "Comprobado", "Comprovat", "Checked"),
    finesYes: pick(locale, "Sí", "Sí", "Yes"),
    finesNo: pick(locale, "No: periodo de aviso", "No: període d'avís", "No: warning period"),
    conditional: pick(locale, "con condiciones", "amb condicions", "with conditions"),
    cataloniaTitle: pick(locale, "ZBE en Cataluña", "ZBE a Catalunya", "Low-emission zones in Catalonia"),
    cataloniaLead: pick(
      locale,
      "Ciudades catalanas con la regla comprobada en la web municipal o del Área Metropolitana de Barcelona:",
      "Ciutats catalanes amb la regla comprovada al web municipal o de l'Àrea Metropolitana de Barcelona:",
      "Catalan cities whose rule was checked on the council's website or on that of the Barcelona Metropolitan Area:",
    ),
    cataloniaPending: pick(
      locale,
      "El directorio de la DGT lista también zonas en estos municipios catalanes. Su regla aún no está comprobada en la web municipal y por eso no se publica aquí:",
      "El directori de la DGT llista també zones en aquests municipis catalans. La seva regla encara no està comprovada al web municipal i per això no es publica aquí:",
      "The DGT directory also lists zones in these Catalan municipalities. Their rule has not yet been checked on the council's website, so it is not published here:",
    ),
    restTitle: pick(locale, "Las demás zonas del directorio de la DGT", "Les altres zones del directori de la DGT", "The other zones in the DGT directory"),
    restLead: pick(
      locale,
      "Municipios del resto de España con al menos una zona en el directorio de la DGT. Las etiquetas y fechas de esos ficheros no siempre coinciden con las ordenanzas municipales, así que esta página no publica su regla hasta leerla en la web oficial de cada ciudad:",
      "Municipis de la resta d'Espanya amb almenys una zona al directori de la DGT. Les etiquetes i dates d'aquests fitxers no sempre coincideixen amb les ordenances municipals, de manera que aquesta pàgina no en publica la regla fins a llegir-la al web oficial de cada ciutat:",
      "Municipalities in the rest of Spain with at least one zone in the DGT directory. The labels and dates in those files do not always match the councils' by-laws, so this page does not publish their rule until it has been read on each city's official website:",
    ),
    none: pick(locale, "Ninguno por ahora.", "Cap de moment.", "None for now."),
    guideLine: pick(
      locale,
      "Para un coche con matrícula extranjera en Barcelona, la guía del registro y de las autorizaciones diarias:",
      "Per a un cotxe amb matrícula estrangera a Barcelona, la guia del registre i de les autoritzacions diàries:",
      "For a foreign-registered car in Barcelona, the guide to registration and daily permits:",
    ),
    guideLink: guideLink(locale),
    faqTitle: pick(locale, "Preguntas frecuentes sobre las ZBE", "Preguntes freqüents sobre les ZBE", "Low-emission zones in Spain: frequent questions"),
    sourcesTitle: pick(locale, "Fuentes oficiales", "Fonts oficials", "Official sources"),
  };
}

/** The labels a city restricts, for the hub table: "Sin etiqueta", "B (con condiciones)". */
export function restrictedLabels(city: ZbeCity, locale: ZbeLocale, conditional: string): string {
  return cityAnswers(city)
    .filter((answer) => answer.kind !== "yes")
    .map((answer) => (answer.kind === "depends" ? `${labelName(answer.label, locale)} (${conditional})` : labelName(answer.label, locale)))
    .join(", ");
}

export function hubFaq(
  locale: ZbeLocale,
  input: { cities: number; zones: number; files: number; builtOn: string; index: string; lawUrl: string },
): { q: string; a: string }[] {
  const copyDay = dayMonthYear(input.builtOn, locale);
  return [
    {
      q: pick(locale, "¿Cuántas ZBE hay en España?", "Quantes ZBE hi ha a Espanya?", "How many low-emission zones are there in Spain?"),
      a: pick(
        locale,
        `El [directorio de zonas de bajas emisiones de la DGT](${input.index}) contenía ${input.zones} zonas en ${input.files} ficheros municipales el ${copyDay}. No todas las ciudades con zona aprobada han enviado su fichero, y algunos ficheros describen varias zonas de una misma ciudad.`,
        `El [directori de zones de baixes emissions de la DGT](${input.index}) contenia ${input.zones} zones en ${input.files} fitxers municipals el ${copyDay}. No totes les ciutats amb zona aprovada hi han enviat el fitxer, i alguns fitxers descriuen diverses zones d'una mateixa ciutat.`,
        `The [DGT's directory of low-emission zones](${input.index}) held ${input.zones} zones in ${input.files} municipal files on ${copyDay}. Not every city with an approved zone has sent its file, and some files describe several zones of one city.`,
      ),
    },
    {
      q: pick(locale, "¿Dónde está el mapa de cada ZBE?", "On és el mapa de cada ZBE?", "Where is the map of each ZBE?"),
      a: pick(
        locale,
        "Cada ayuntamiento publica el suyo. La página de cada ciudad enlaza el mapa oficial y describe el perímetro con las calles que da la web municipal.",
        "Cada ajuntament publica el seu. La pàgina de cada ciutat enllaça el mapa oficial i descriu el perímetre amb els carrers que dona el web municipal.",
        "Each council publishes its own. Each city page links the official map and describes the perimeter with the streets given on the council's website.",
      ),
    },
    {
      q: pick(locale, "¿Puedo entrar en una ZBE con etiqueta B?", "Puc entrar en una ZBE amb etiqueta B?", "Can I drive into a ZBE with a B label?"),
      a: pick(
        locale,
        "Depende de la ciudad y, en algunas, de si el vehículo es de un residente o de si hay un episodio de contaminación. La tabla de esta página dice en qué ciudades la etiqueta B tiene restricción, y la página de cada ciudad, con qué condiciones.",
        "Depèn de la ciutat i, en algunes, de si el vehicle és d'un resident o de si hi ha un episodi de contaminació. La taula d'aquesta pàgina diu en quines ciutats l'etiqueta B té restricció, i la pàgina de cada ciutat, amb quines condicions.",
        "It depends on the city and, in some, on whether the vehicle belongs to a resident or on a pollution episode. The table on this page says in which cities the B label is restricted, and each city page gives the conditions.",
      ),
    },
    {
      q: pick(locale, "¿De cuánto es la multa por entrar en una ZBE?", "De quant és la multa per entrar en una ZBE?", "How much is the fine for driving into a ZBE?"),
      a: pick(
        locale,
        `La [ley estatal de tráfico](${input.lawUrl}) considera infracción grave no respetar las restricciones de una zona de bajas emisiones (artículo 76, letra z3) y sanciona las graves con 200 euros (artículo 80.1), con una reducción del 50 % si se paga en los 20 días naturales siguientes a la notificación (artículo 94). La página de cada ciudad dice lo que publica su ayuntamiento.`,
        `La [llei estatal de trànsit](${input.lawUrl}) considera infracció greu no respectar les restriccions d'una zona de baixes emissions (article 76, lletra z3) i sanciona les greus amb 200 euros (article 80.1), amb una reducció del 50 % si es paga dins dels 20 dies naturals següents a la notificació (article 94). La pàgina de cada ciutat diu el que publica el seu ajuntament.`,
        `The [Spanish traffic act](${input.lawUrl}) makes ignoring the restrictions of a low-emission zone a serious offence (article 76, letter z3) and sets the fine for serious offences at 200 euros (article 80.1), reduced by 50% when paid within 20 calendar days of the notice (article 94). Each city page says what its council publishes.`,
      ),
    },
  ];
}

/**
 * Where to read about street parking for a ZBE city: its own blue zone page
 * when the family has one, the Barcelona parking guide, or the blue zone hub.
 */
export function parkingLink(city: Pick<ZbeCity, "slug" | "name">, locale: ZbeLocale): { href: string; label: string } {
  const name = city.name[locale];
  if (city.slug === "barcelona") {
    return {
      href: BARCELONA_GUIDE[locale],
      label: pick(locale, "Aparcar en Barcelona: zona azul y verde, horarios y precios", "Aparcar a Barcelona: zona blava i verda, horaris i preus", "Parking in Barcelona: blue and green zones, hours and prices"),
    };
  }
  if (ZA_CITIES.some((c) => c.slug === city.slug)) {
    return {
      href: zaCityPath(locale, city.slug),
      label: pick(locale, `Zona azul ${ofCity(name, locale)}: horario y precio`, `Zona blava ${ofCity(name, locale)}: horari i preu`, `${name} blue zone parking: hours and prices`),
    };
  }
  return {
    href: zaHubPath(locale),
    label: pick(locale, "Zona azul por ciudades: horario y precio", "Zona blava per ciutats: horari i preu", "Blue zone parking by city: hours and prices"),
  };
}

export const HOME_ZBE_LABEL: Record<ZbeLocale, string> = { es: "ZBE", ca: "ZBE", en: "Low-emission zones" };
