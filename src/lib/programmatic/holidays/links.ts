import type { DateLocale } from "./format";

/**
 * The existing guides these pages send readers on to. Paths are the published
 * ones (the tests compare them with the modules that publish each guide).
 */
export const GUIDES = {
  workCalendar: { ca: "/ca/guies/calendari-laboral-catalunya/", es: "/es/guias/calendario-laboral-cataluna/", en: "/en/guides/catalonia-public-holidays/" },
  holidayToday: { ca: "/ca/guies/es-festiu-avui-catalunya/", es: "/es/guias/es-festivo-hoy-cataluna/", en: "/en/guides/is-today-a-holiday-in-catalonia/" },
  localHolidays: { ca: "/ca/guies/festius-locals-catalunya/", es: "/es/guias/festivos-locales-cataluna/", en: "/en/guides/local-holidays-catalonia/" },
  shops: { ca: "/ca/guies/botigues-obertes-festius-catalunya/", es: "/es/guias/tiendas-abiertas-festivos-cataluna/", en: "/en/guides/shops-open-sundays-holidays-catalonia/" },
  school: { ca: "/ca/guies/calendari-escolar-catalunya/", es: "/es/guias/calendario-escolar-cataluna/", en: "/en/guides/catalonia-school-calendar/" },
  decemberBridge: { ca: "/ca/guies/pont-desembre-catalunya/", es: "/es/guias/puente-diciembre-cataluna/", en: "/en/guides/december-long-weekend-catalonia/" },
  metroHours: { ca: "/ca/guies/horaris-metro-barcelona/", es: "/es/guias/horarios-metro-barcelona/", en: "/en/guides/barcelona-metro-hours/" },
  christmasTraditions: { ca: "/ca/tradicions/tradicions-de-nadal-catalunya/", es: "/es/tradiciones/tradiciones-navidad-cataluna/", en: "/en/traditions/catalan-christmas-traditions/" },
  christmasBarcelona: { ca: "/ca/guies/nadal-a-barcelona/", es: "/es/guias/navidad-en-barcelona/", en: "/en/guides/christmas-in-barcelona/" },
  newYear: { ca: "/ca/guies/cap-d-any-barcelona/", es: "/es/guias/nochevieja-barcelona/", en: "/en/guides/new-years-eve-barcelona/" },
  castanyada: { ca: "/ca/tradicions/castanyada-catalunya/", es: "/es/tradiciones/castanyada-cataluna/", en: "/en/traditions/castanyada-catalonia/" },
  strikes: { ca: "/ca/guies/vaga-avui-catalunya/", es: "/es/guias/huelga-hoy-cataluna/", en: "/en/guides/strike-barcelona-catalonia-today/" },
  easter2027: { ca: "/ca/guies/setmana-santa-2027-catalunya/", es: "/es/guias/semana-santa-2027-cataluna/", en: "/en/guides/easter-2027-catalonia/" },
  bridges2027: { ca: "/ca/guies/ponts-2027-catalunya/", es: "/es/guias/puentes-2027-cataluna/", en: "/en/guides/long-weekends-2027-catalonia/" },
  // 1 Nov 2026: targets of the date pages' one-sentence notices.
  barcelonaDecember: { ca: "/ca/guies/barcelona-al-desembre/", es: "/es/guias/barcelona-en-diciembre/", en: "/en/guides/barcelona-in-december/" },
  grossa: { ca: "/ca/guies/la-grossa-cap-d-any/", es: "/es/guias/la-grossa-fin-de-ano/", en: "/en/guides/la-grossa-new-years-eve-lottery/" },
  reis: { ca: "/ca/guies/cavalcada-de-reis-barcelona/", es: "/es/guias/cabalgata-de-reyes-barcelona/", en: "/en/guides/three-kings-parade-barcelona/" },
  // 5 Nov 2026: school free days 2026-27 per town (is there school on Monday 7 December?).
  schoolFreeDays: { ca: "/ca/guies/dies-lliure-disposicio-escoles/", es: "/es/guias/dias-libre-disposicion-colegios/", en: "/en/guides/catalonia-school-free-days/" },
  // 12 Nov 2026: Spain-wide December bridge (where Monday 7 December is a holiday), for the date pages read outside Catalonia.
  decemberBridgeSpain: { ca: "/ca/guies/pont-desembre-espanya/", es: "/es/guias/puente-diciembre-espana/", en: "/en/guides/december-holidays-spain/" },
} as const satisfies Record<string, Record<DateLocale, string>>;

export type GuideKey = keyof typeof GUIDES;

/** Where the official local-holiday order will appear (the Generalitat's calendar page and the DOGC). */
export const OFFICIAL = {
  treballCalendar: "https://treball.gencat.cat/ca/ambits/relacions_laborals/ci/calendari_laboral/",
  treballNormativa: "https://treball.gencat.cat/ca/ambits/relacions_laborals/ci/calendari_laboral/normativa/",
  dogc: "https://dogc.gencat.cat/ca/",
  boe2026: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2025-21667",
  llei18_2017: "https://www.boe.es/buscar/act.php?id=BOE-A-2017-11320",
  schoolOrder: "https://dogc.gencat.cat/ca/document-del-dogc/?documentId=1042830",
  shopsOrder2027: "https://dogc.gencat.cat/ca/document-del-dogc/?documentId=1045357",
} as const;
