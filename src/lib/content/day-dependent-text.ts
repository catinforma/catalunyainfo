import type { Locale } from "@/lib/i18n/config";

/**
 * Stable plain text for the day-dependent blocks (25 Nov 2026).
 *
 * `bodyToPlainText` feeds `search_text` (site search, reading time, word count),
 * and these blocks carry no text of their own: the answer is worked out at
 * render time from the date. They used to drop out of `search_text` entirely.
 * What goes in is a neutral, date-independent description of what the block
 * answers, built from nothing but the block's type and `scope`: no figure, no
 * "today"'s result, no clock. Two calls on different days give the same string,
 * so `search_text`, the body-dates hash and `lastmod` do not move every night.
 * Kept free of imports (besides a type) because `blocks.ts` is bundled into the
 * editor.
 */
type Words = Record<Locale, string>;

const TEXT: Record<string, Words> = {
  holidayToday: {
    ca: "Avui és festiu a Catalunya? Calendari de festius oficials de la Generalitat.",
    es: "¿Hoy es festivo en Cataluña? Calendario de festivos oficiales de la Generalitat.",
    en: "Is today a public holiday in Catalonia? Official Generalitat holiday calendar.",
  },
  schoolCalendar: {
    ca: "Calendari escolar de Catalunya: inici i final de curs, vacances i dies festius escolars.",
    es: "Calendario escolar de Cataluña: inicio y fin de curso, vacaciones y días festivos escolares.",
    en: "Catalonia school calendar: start and end of term, school holidays and days off.",
  },
  clockChange: {
    ca: "Proper canvi d'hora a Espanya: horari d'estiu i d'hivern, quan s'avança i es retarda el rellotge.",
    es: "Próximo cambio de hora en España: horario de verano e invierno, cuándo se adelanta y se atrasa el reloj.",
    en: "Next clock change in Spain: summer and winter time, when the clocks go forward and back.",
  },
  weekendAgenda: {
    ca: "Activitats del cap de setmana a Catalunya: agenda cultural de la Generalitat, plans i esdeveniments.",
    es: "Actividades del fin de semana en Cataluña: agenda cultural de la Generalitat, planes y eventos.",
    en: "Things to do this weekend in Catalonia: the Generalitat's cultural agenda, plans and events.",
  },
  reservoirLevels: {
    ca: "Nivell dels embassaments de Catalunya: percentatge d'aigua de les conques internes, dades de l'Agència Catalana de l'Aigua.",
    es: "Nivel de los embalses de Cataluña: porcentaje de agua de las cuencas internas, datos de la Agència Catalana de l'Aigua.",
    en: "Catalonia reservoir levels: water percentage of the internal basins, data from the Catalan Water Agency.",
  },
  metroTonight: {
    ca: "Horari del metro de Barcelona aquesta nit i demà: obertura, tancament i servei nocturn de TMB.",
    es: "Horario del metro de Barcelona esta noche y mañana: apertura, cierre y servicio nocturno de TMB.",
    en: "Barcelona metro hours tonight and tomorrow: opening, closing and night service from TMB.",
  },
  livingNativities: {
    ca: "Pessebres vivents de Catalunya: propers pessebres vivents, dates i municipis, agenda cultural de la Generalitat.",
    es: "Belenes vivientes de Cataluña: próximos belenes vivientes, fechas y municipios, agenda cultural de la Generalitat.",
    en: "Living nativity scenes in Catalonia: upcoming pessebres vivents, dates and towns, from the Generalitat's cultural agenda.",
  },
  snowDepth: {
    ca: "Gruix de neu a les estacions d'esquí i al Pirineu de Catalunya: centímetres de neu, Meteocat.",
    es: "Espesor de nieve en las estaciones de esquí y el Pirineo de Cataluña: centímetros de nieve, Meteocat.",
    en: "Snow depth at the ski resorts and in the Catalan Pyrenees: centimetres of snow, Meteocat.",
  },
  candidateLists: {
    ca: "Llistes de candidats a les eleccions: candidatures proclamades, partits i caps de llista.",
    es: "Listas de candidatos a las elecciones: candidaturas proclamadas, partidos y cabezas de lista.",
    en: "Candidate lists for the elections: proclaimed candidacies, parties and list leaders.",
  },
  spainSchoolCalendar: {
    ca: "Calendari escolar d'Espanya per comunitats autònomes: inici de curs, vacances de Nadal, Setmana Santa i final de curs.",
    es: "Calendario escolar de España por comunidades autónomas: inicio de curso, vacaciones de Navidad, Semana Santa y fin de curso.",
    en: "Spain school calendar by region: start of term, Christmas holidays, Easter and end of term.",
  },
  shopsToday: {
    ca: "Poden obrir les botigues avui a Barcelona? I aquest diumenge? Festius i diumenges d'obertura comercial.",
    es: "¿Pueden abrir las tiendas hoy en Barcelona? ¿Y este domingo? Festivos y domingos de apertura comercial.",
    en: "Can shops open today in Barcelona? And this Sunday? Public holidays and Sunday trading days.",
  },
  parkingToday: {
    ca: "Cal pagar la zona blava i verda avui a Barcelona? Horari de l'àrea regulada d'aparcament, AREA.",
    es: "¿Hay que pagar la zona azul y verde hoy en Barcelona? Horario del aparcamiento regulado, AREA.",
    en: "Do I pay for the blue and green parking zones today in Barcelona? Regulated parking hours, AREA.",
  },
  railStrikeNext: {
    ca: "Hi ha vaga de Renfe o Rodalies ara? Propera vaga de trens, dates i serveis mínims.",
    es: "¿Hay huelga de Renfe o Rodalies ahora? Próxima huelga de trenes, fechas y servicios mínimos.",
    en: "Is there a Renfe or Rodalies strike now? The next train strike, dates and minimum services.",
  },
};

const SHOPS_SUNDAYS: Record<"catalonia" | "spainRest" | "spain", Words> = {
  catalonia: {
    ca: "Quan comencen a obrir les botigues els diumenges per Nadal a Barcelona i Catalunya? Diumenges d'obertura de desembre.",
    es: "¿Cuándo empiezan a abrir las tiendas los domingos por Navidad en Barcelona y Cataluña? Domingos de apertura de diciembre.",
    en: "When do shops start opening on Sundays for Christmas in Barcelona and Catalonia? December Sunday opening days.",
  },
  spainRest: {
    ca: "Quan comencen a obrir les botigues els diumenges per Nadal a la resta d'Espanya? Diumenges d'obertura de desembre.",
    es: "¿Cuándo empiezan a abrir las tiendas los domingos por Navidad en el resto de España? Domingos de apertura de diciembre.",
    en: "When do shops start opening on Sundays for Christmas in the rest of Spain? December Sunday opening days.",
  },
  spain: {
    ca: "Quan comencen a obrir les botigues els diumenges per Nadal a Espanya? Diumenges d'obertura de desembre per comunitats.",
    es: "¿Cuándo empiezan a abrir las tiendas los domingos por Navidad en España? Domingos de apertura de diciembre por comunidades.",
    en: "When do shops start opening on Sundays for Christmas in Spain? December Sunday opening days by region.",
  },
};

/** Stable text of a day-dependent block, or "" for any other type. */
export function dayDependentText(block: { type: string; scope?: string }, locale: Locale): string {
  if (block.type === "shopsSundays") {
    return SHOPS_SUNDAYS[(block.scope as keyof typeof SHOPS_SUNDAYS) ?? "catalonia"]?.[locale] ?? "";
  }
  return TEXT[block.type]?.[locale] ?? "";
}
