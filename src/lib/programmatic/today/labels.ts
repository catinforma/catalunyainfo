import type { TodayLocale } from "./logic";

/**
 * Words of the daily answers. They live in the browser bundle, not in the
 * page props: the server HTML then carries only the dated fallbacks, never a
 * sentence such as "today is not a holiday" that only the browser, which
 * knows the date, can say.
 */

export interface TodayLabels {
  /** "{date}": the long date. */
  today: string;
  timezone: string;
  holiday: {
    regional: string;
    exceptAran: string;
    aranOnly: string;
    weekend: string;
    working: string;
    unknown: string;
    localSome: string;
    localNone: string;
    localUnknown: string;
    /** Link to a date page: "{day}". */
    datePage: string;
    more: string;
    tomorrow: string;
    tomorrowRegional: string;
    tomorrowLocal: string;
    tomorrowNone: string;
    tomorrowUnknown: string;
    tomorrowLocalUnknown: string;
  };
  strikes: {
    today: string;
    todayNone: string;
    tomorrow: string;
    tomorrowNone: string;
    next: string;
    nextValue: string;
    nextNone: string;
    asOf: string;
    stale: string;
  };
  rodalies: {
    loading: string;
    one: string;
    many: string;
    none: string;
    lines: string;
    everyLine: string;
  };
  reservoirs: {
    loading: string;
    total: string;
    today: string;
    yesterday: string;
    on: string;
    stale: string;
    snapshot: string;
  };
  fuel: {
    loading: string;
    e95: string;
    goa: string;
    median: string;
    old: string;
    stale: string;
    failed: string;
  };
  weekend: {
    current: string;
    long: string;
    nextHoliday: string;
    nextHolidayValue: string;
    inOneDay: string;
    nextLong: string;
    bridge: string;
    bridgeValue: string;
    none: string;
  };
  snow: {
    inSeason: string;
    outSeason: string;
  };
}

const CA: TodayLabels = {
  today: "Avui és {date}.",
  timezone: "Hora de Catalunya.",
  holiday: {
    regional: "Sí: avui és festiu a tot Catalunya ({name}).",
    exceptAran: "A l'Aran no ho és: hi fan la Festa d'Aran un altre dia.",
    aranOnly: "Avui és festiu només a l'Aran ({name}); a la resta de Catalunya, no.",
    weekend: "Avui és {weekday}: no és cap festiu oficial a Catalunya.",
    working: "No: avui no és festiu a Catalunya.",
    unknown: "El calendari oficial de festius de {year} encara no s'ha publicat.",
    localSome: "Festa local avui a:",
    localNone: "Cap dels {towns} municipis amb festius locals no en fa avui.",
    localUnknown: "Les festes locals de {year} encara no s'han publicat.",
    datePage: "És festiu el {day}?",
    more: "i {n} més",
    tomorrow: "Demà",
    tomorrowRegional: "festiu a tot Catalunya ({name})",
    tomorrowLocal: "festa local a {list}",
    tomorrowNone: "no és festiu a Catalunya",
    tomorrowUnknown: "calendari de {year} encara no publicat",
    tomorrowLocalUnknown: "no és festiu a tot Catalunya; les festes locals de {year} encara no s'han publicat",
  },
  strikes: {
    today: "Sí: avui hi ha {title}.",
    todayNone: "No: avui no hi ha cap vaga a la nostra llista.",
    tomorrow: "Demà",
    tomorrowNone: "cap vaga a la llista",
    next: "Propera",
    nextValue: "{title}, {date}",
    nextNone: "cap altra vaga convocada a la llista",
    asOf: "Llista revisada {date}.",
    stale: "La llista té més d'una setmana: comprova les convocatòries noves a la pàgina de vagues.",
  },
  rodalies: {
    loading: "Carregant els avisos de Rodalies de Catalunya…",
    one: "1 avís oficial actiu ara mateix.",
    many: "{n} avisos oficials actius ara mateix.",
    none: "Cap avís actiu a cap línia ara mateix.",
    lines: "Línies afectades:",
    everyLine: "Un dels avisos afecta totes les línies.",
  },
  reservoirs: {
    loading: "Carregant la lectura d'avui de l'ACA…",
    total: "{pct} de capacitat",
    today: "lectura de l'ACA d'avui",
    yesterday: "lectura de l'ACA d'ahir",
    on: "lectura de l'ACA del {date}",
    stale: "L'ACA no ha publicat cap lectura nova des del {date}.",
    snapshot: "No hem pogut llegir la d'avui; aquesta és la darrera que tenim.",
  },
  fuel: {
    loading: "Carregant els preus del Ministeri…",
    e95: "Gasolina 95",
    goa: "Gasoil",
    median: "Preu mitjà (mediana) de {n} benzineres de Catalunya, segons el Ministeri el {date} a les {time}.",
    old: "Atenció: el Ministeri no ha actualitzat els preus des del {date} a les {time}.",
    stale: "El Ministeri no publica preus des del {when}: no els mostrem com a actuals.",
    failed: "Ara mateix no podem llegir els preus del Ministeri.",
  },
  weekend: {
    current: "{range}.",
    long: "Cap de setmana llarg: {range} ({names}).",
    nextHoliday: "Proper festiu",
    nextHolidayValue: "{name}, {date} (d'aquí a {n} dies)",
    inOneDay: "{name}, demà",
    nextLong: "Proper cap de setmana llarg",
    bridge: "Pont",
    bridgeValue: "{name} cau en {weekday}: fent pont el {bridge}, són quatre dies ({range})",
    none: "cap més al calendari publicat",
  },
  snow: {
    inSeason: "És temporada de neu: el gruix d'avui a les estacions de muntanya, amb l'hora de cada lectura.",
    outSeason: "Fora de temporada: la pàgina segueix la neu del {from} al {to}.",
  },
};

const ES: TodayLabels = {
  today: "Hoy es {date}.",
  timezone: "Hora de Cataluña.",
  holiday: {
    regional: "Sí: hoy es festivo en toda Cataluña ({name}).",
    exceptAran: "En Arán no lo es: allí celebran la Fiesta de Arán otro día.",
    aranOnly: "Hoy es festivo solo en Arán ({name}); en el resto de Cataluña, no.",
    weekend: "Hoy es {weekday}: no es ningún festivo oficial en Cataluña.",
    working: "No: hoy no es festivo en Cataluña.",
    unknown: "El calendario oficial de festivos de {year} aún no se ha publicado.",
    localSome: "Fiesta local hoy en:",
    localNone: "Ninguno de los {towns} municipios con festivos locales tiene fiesta hoy.",
    localUnknown: "Las fiestas locales de {year} aún no se han publicado.",
    datePage: "¿Es festivo el {day}?",
    more: "y {n} más",
    tomorrow: "Mañana",
    tomorrowRegional: "festivo en toda Cataluña ({name})",
    tomorrowLocal: "fiesta local en {list}",
    tomorrowNone: "no es festivo en Cataluña",
    tomorrowUnknown: "calendario de {year} aún no publicado",
    tomorrowLocalUnknown: "no es festivo en toda Cataluña; las fiestas locales de {year} aún no se han publicado",
  },
  strikes: {
    today: "Sí: hoy hay {title}.",
    todayNone: "No: hoy no hay ninguna huelga en nuestra lista.",
    tomorrow: "Mañana",
    tomorrowNone: "ninguna huelga en la lista",
    next: "Próxima",
    nextValue: "{title}, {date}",
    nextNone: "ninguna otra huelga convocada en la lista",
    asOf: "Lista revisada {date}.",
    stale: "La lista tiene más de una semana: comprueba las convocatorias nuevas en la página de huelgas.",
  },
  rodalies: {
    loading: "Cargando los avisos de Rodalies de Catalunya…",
    one: "1 aviso oficial activo ahora mismo.",
    many: "{n} avisos oficiales activos ahora mismo.",
    none: "Ningún aviso activo en ninguna línea ahora mismo.",
    lines: "Líneas afectadas:",
    everyLine: "Uno de los avisos afecta a todas las líneas.",
  },
  reservoirs: {
    loading: "Cargando la lectura de hoy de la ACA…",
    total: "{pct} de capacidad",
    today: "lectura de la ACA de hoy",
    yesterday: "lectura de la ACA de ayer",
    on: "lectura de la ACA del {date}",
    stale: "La ACA no ha publicado ninguna lectura nueva desde el {date}.",
    snapshot: "No hemos podido leer la de hoy; esta es la última que tenemos.",
  },
  fuel: {
    loading: "Cargando los precios del Ministerio…",
    e95: "Gasolina 95",
    goa: "Gasóleo",
    median: "Precio medio (mediana) de {n} gasolineras de Cataluña, según el Ministerio el {date} a las {time}.",
    old: "Atención: el Ministerio no ha actualizado los precios desde el {date} a las {time}.",
    stale: "El Ministerio no publica precios desde el {when}: no los mostramos como actuales.",
    failed: "Ahora mismo no podemos leer los precios del Ministerio.",
  },
  weekend: {
    current: "{range}.",
    long: "Fin de semana largo: {range} ({names}).",
    nextHoliday: "Próximo festivo",
    nextHolidayValue: "{name}, {date} (dentro de {n} días)",
    inOneDay: "{name}, mañana",
    nextLong: "Próximo fin de semana largo",
    bridge: "Puente",
    bridgeValue: "{name} cae en {weekday}: haciendo puente el {bridge}, son cuatro días ({range})",
    none: "ninguno más en el calendario publicado",
  },
  snow: {
    inSeason: "Es temporada de nieve: el espesor de hoy en las estaciones de montaña, con la hora de cada lectura.",
    outSeason: "Fuera de temporada: la página sigue la nieve del {from} al {to}.",
  },
};

const EN: TodayLabels = {
  today: "Today is {date}.",
  timezone: "Catalan time.",
  holiday: {
    regional: "Yes: today is a public holiday across Catalonia ({name}).",
    exceptAran: "Not in Aran, which has its Festa d'Aran on another day.",
    aranOnly: "Today is a public holiday in Aran only ({name}); not in the rest of Catalonia.",
    weekend: "Today is {weekday}: not a public holiday in Catalonia.",
    working: "No: today is not a public holiday in Catalonia.",
    unknown: "The official holiday calendar for {year} has not been published yet.",
    localSome: "Local holiday today in:",
    localNone: "None of the {towns} towns with local holidays has one today.",
    localUnknown: "Local holidays for {year} have not been published yet.",
    datePage: "Is {day} a holiday?",
    more: "and {n} more",
    tomorrow: "Tomorrow",
    tomorrowRegional: "public holiday across Catalonia ({name})",
    tomorrowLocal: "local holiday in {list}",
    tomorrowNone: "not a public holiday in Catalonia",
    tomorrowUnknown: "{year} calendar not published yet",
    tomorrowLocalUnknown: "not a Catalonia-wide holiday; local holidays for {year} not published yet",
  },
  strikes: {
    today: "Yes: today there is a {title}.",
    todayNone: "No: there is no strike on our list today.",
    tomorrow: "Tomorrow",
    tomorrowNone: "no strike on the list",
    next: "Next",
    nextValue: "{title}, {date}",
    nextNone: "no other strike called on the list",
    asOf: "List checked {date}.",
    stale: "The list is over a week old: check for new calls on the strikes page.",
  },
  rodalies: {
    loading: "Loading Rodalies de Catalunya's notices…",
    one: "1 official notice active right now.",
    many: "{n} official notices active right now.",
    none: "No active notice on any line right now.",
    lines: "Lines affected:",
    everyLine: "One of the notices affects every line.",
  },
  reservoirs: {
    loading: "Loading today's ACA reading…",
    total: "{pct} full",
    today: "today's ACA reading",
    yesterday: "yesterday's ACA reading",
    on: "ACA reading of {date}",
    stale: "The ACA has published no new reading since {date}.",
    snapshot: "We could not read today's; this is the latest we have.",
  },
  fuel: {
    loading: "Loading the Ministry's prices…",
    e95: "Petrol 95",
    goa: "Diesel",
    median: "Median price at {n} stations in Catalonia, from the Ministry on {date} at {time}.",
    old: "Note: the Ministry has not updated prices since {date} at {time}.",
    stale: "The Ministry has published no prices since {when}: we do not show them as current.",
    failed: "We cannot read the Ministry's prices right now.",
  },
  weekend: {
    current: "{range}.",
    long: "Long weekend: {range} ({names}).",
    nextHoliday: "Next public holiday",
    nextHolidayValue: "{name}, {date} (in {n} days)",
    inOneDay: "{name}, tomorrow",
    nextLong: "Next long weekend",
    bridge: "Bridge day",
    bridgeValue: "{name} falls on a {weekday}: with {bridge} off, that is four days in a row ({range})",
    none: "none left in the published calendar",
  },
  snow: {
    inSeason: "It is snow season: today's depth at the mountain stations, with the time of each reading.",
    outSeason: "Out of season: the page follows the snow from {from} to {to}.",
  },
};

export const TODAY_LABELS: Record<TodayLocale, TodayLabels> = { ca: CA, es: ES, en: EN };
