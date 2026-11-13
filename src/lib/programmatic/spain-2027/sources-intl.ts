import type { Region } from "@/lib/programmatic/holidays/boe-2027";

import { CITY_ROWS, type LocalDay } from "./cities-data";
import { SOURCES } from "./sources";

/**
 * Catalan and English words for the prose fields of `sources.ts` and the
 * notes of `cities-data.ts`, for the ca and en editions of the Spain 2027
 * pages. Same facts as the Spanish, written for each language: every number,
 * date and bulletin reference is the one the Spanish gives. Document titles,
 * references, bulletin and dataset names, verbatim quotes (`quotes`,
 * `boeNote`) and the names of the festivals stay as the bulletins print them.
 * `missingProse()` (held to [] by a test) lists any Spanish field left
 * without its two counterparts.
 */

export type IntlLocale = "ca" | "en";

export interface SourceProse {
  /** sources.ts local.how; the page renders `${how} <a>{bulletinName}</a>.`, so ca ends "… al", en "… in the". */
  how: string;
  /** local.note, null when the Spanish is null. */
  note: string | null;
  /** decreeNote, only when present in Spanish. */
  decreeNote?: string;
  /** decree.note when decree.status === "not-found". */
  decreeNotFound?: string;
  /** decree.differences when non-null. */
  differences?: string;
  /** local.bulletinShort with its article: ca "el BOJA", en "the BOJA". In Catalan use `caAt()` after "a". */
  bulletinShort: string;
  /** subRegional (Canarias only). */
  subRegional?: { unit: string; short: string; title: string; faq: string };
}

export const SOURCE_PROSE: Record<Region, Record<IntlLocale, SourceProse>> = {
  CT: {
    ca: {
      how: "A Catalunya els fixa una sola ordre del Departament d'Empresa i Treball per als 947 municipis, que es publica al",
      note: "Mentre l'ordre no surt, els dies que ja han aprovat els ajuntaments són a la pàgina de cada municipi.",
      bulletinShort: "el DOGC",
    },
    en: {
      how: "In Catalonia a single order of the Department of Business and Labour sets them for all 947 municipalities, published in the",
      note: "Until the order is out, the days councils have already approved are on each town's page.",
      bulletinShort: "the DOGC",
    },
  },
  AN: {
    ca: {
      how: "A Andalusia els publica una resolució de la Direcció General de Treball, Seguretat i Salut Laboral per a tots els municipis, al",
      note: "La resolució recull les festes que els ajuntaments havien comunicat fins aquella data; en anys anteriors la Junta va publicar correccions mesos després.",
      bulletinShort: "el BOJA",
    },
    en: {
      how: "In Andalusia a resolution of the Directorate-General for Labour, Safety and Occupational Health publishes them for every municipality, in the",
      note: "The resolution lists the days councils had reported by that date; in earlier years the Junta published corrections months later.",
      bulletinShort: "the BOJA",
    },
  },
  AR: {
    ca: {
      how: "A l'Aragó els fixa una resolució del director general de Treball per als municipis d'Osca, Terol i Saragossa, al",
      note: "Els ajuntaments tenien fins al 15 d'octubre de 2026 per proposar els seus dies (Decreto 163/2026). El 2026 també hi va haver una resolució complementària per als municipis que van arribar tard (BOA núm. 56, de 23.3.2026).",
      bulletinShort: "el BOA",
    },
    en: {
      how: "In Aragon a resolution of the Director-General for Labour sets them for the municipalities of Huesca, Teruel and Zaragoza, in the",
      note: "Councils had until 15 October 2026 to put forward their days (Decreto 163/2026). In 2026 there was also a supplementary resolution for the municipalities that were late (BOA núm. 56, de 23.3.2026).",
      bulletinShort: "the BOA",
    },
  },
  AS: {
    ca: {
      how: "A Astúries els aprova una resolució de la Conselleria de Ciència, Indústria i Ocupació per a tots els concejos (municipis), al",
      note: "Alguns concejos tenen dies diferents segons la parròquia o la zona, com indica la mateixa resolució.",
      bulletinShort: "el BOPA",
    },
    en: {
      how: "In Asturias a resolution of the Regional Ministry of Science, Industry and Employment approves them for every concejo (municipality), in the",
      note: "Some concejos have different days by parish or area, as the resolution itself sets out.",
      bulletinShort: "the BOPA",
    },
  },
  IB: {
    ca: {
      how: "A les Illes Balears els fa públics una resolució de la Conselleria de Treball, Funció Pública i Diàleg Social, juntament amb el calendari general, al",
      note: "La llista va per illes (Mallorca, Menorca, Eivissa i Formentera), amb dies diferents en alguns nuclis d'un mateix municipi.",
      bulletinShort: "el BOIB",
    },
    en: {
      how: "In the Balearic Islands a resolution of the Regional Ministry of Labour, Civil Service and Social Dialogue makes them public, together with the general calendar, in the",
      note: "The list goes island by island (Mallorca, Menorca, Eivissa and Formentera), with different days in some villages of the same municipality.",
      bulletinShort: "the BOIB",
    },
  },
  CN: {
    ca: {
      how: "A Canàries els fixa una ordre de la Conselleria de Turisme i Ocupació per als 88 municipis, al",
      note: "A més de les 2 festes locals, cada illa té la seva festa insular. El Dia de Canàries, el 30 de maig, cau en diumenge el 2027 i el decret no l'inclou.",
      bulletinShort: "el BOC",
      subRegional: {
        unit: "festa insular",
        short: "insular",
        title: "La festa de cada illa el 2027",
        faq: "Cada illa hi afegeix la seva festa insular, que fixa el mateix decret (per exemple, Tenerife el 2 de febrer i Gran Canària el 8 de setembre).",
      },
    },
    en: {
      how: "In the Canary Islands an order of the Regional Ministry of Tourism and Employment sets them for the 88 municipalities, in the",
      note: "On top of the 2 local days, each island has its own island holiday. Canary Islands Day, 30 May, falls on a Sunday in 2027 and the decree leaves it out.",
      bulletinShort: "the BOC",
      subRegional: {
        unit: "island holiday",
        short: "island",
        title: "Each island's holiday in 2027",
        faq: "Each island adds its own island holiday, set by the same decree (Tenerife on 2 February and Gran Canaria on 8 September, for example).",
      },
    },
  },
  CB: {
    ca: {
      how: "A Cantàbria els publica una resolució de la Direcció General de Treball, Economia Social i Ocupació Autònoma juntament amb les festes estatals i autonòmiques, al",
      note: null,
      bulletinShort: "el BOC de Cantàbria",
    },
    en: {
      how: "In Cantabria a resolution of the Directorate-General for Labour, Social Economy and Self-Employment publishes them alongside the national and regional holidays, in the",
      note: null,
      bulletinShort: "the BOC of Cantabria",
    },
  },
  CM: {
    ca: {
      how: "A Castella-la Manxa els dona a conèixer un anunci de la Direcció General d'Autònoms, Treball i Economia Social per a tots els municipis, al",
      note: null,
      bulletinShort: "el DOCM",
    },
    en: {
      how: "In Castile-La Mancha a notice from the Directorate-General for the Self-Employed, Labour and Social Economy announces them for every municipality, in the",
      note: null,
      bulletinShort: "the DOCM",
    },
  },
  CL: {
    ca: {
      how: "A Castella i Lleó els fixa l'Oficina Territorial de Treball de cada província i es publiquen als 9 butlletins provincials; la Junta els reuneix al seu",
      note: "Les llistes de Palència i Valladolid deixen com a «no comunicado» els dies d'alguns municipis (43 i 35); es poden publicar més endavant.",
      bulletinShort: "els butlletins oficials de les 9 províncies",
    },
    en: {
      how: "In Castile and León each province's Territorial Labour Office sets them and they appear in the 9 provincial gazettes; the Junta gathers them on its",
      note: "The Palencia and Valladolid lists mark some municipalities' days as «no comunicado» (not reported: 43 and 35); they may be published later.",
      bulletinShort: "the official gazettes of the 9 provinces",
    },
  },
  EX: {
    ca: {
      how: "A Extremadura els fa públics una resolució de la Direcció General de Treball per a tots els municipis, al",
      note: "La llista també inclou entitats locals menors i nuclis de població amb dies propis.",
      bulletinShort: "el DOE",
    },
    en: {
      how: "In Extremadura a resolution of the Directorate-General for Labour makes them public for every municipality, in the",
      note: "The list also covers minor local entities and villages with days of their own.",
      bulletinShort: "the DOE",
    },
  },
  GA: {
    ca: {
      how: "A Galícia els aplega una resolució de la Secretaria General d'Ocupació i Relacions Laborals amb els 313 ajuntaments de les quatre províncies, al",
      note: null,
      bulletinShort: "el DOG",
    },
    en: {
      how: "In Galicia a resolution of the General Secretariat for Employment and Labour Relations brings them together for the 313 councils of the four provinces, in the",
      note: null,
      bulletinShort: "the DOG",
    },
  },
  MD: {
    ca: {
      how: "A la Comunitat de Madrid els declara una resolució de la Direcció General de Treball per a tots els municipis, al",
      note: "La llista del 2026 es va corregir després amb una altra resolució (BOCM núm. 6, de 8.1.2026).",
      decreeNote: "El 2 de maig, Dia de la Comunitat de Madrid, cau en diumenge el 2027: el decret no l'inclou entre els festius ni el trasllada al dilluns.",
      bulletinShort: "el BOCM",
    },
    en: {
      how: "In the Community of Madrid a resolution of the Directorate-General for Labour declares them for every municipality, in the",
      note: "The 2026 list was later corrected by a further resolution (BOCM núm. 6, de 8.1.2026).",
      decreeNote: "2 May, Community of Madrid Day, falls on a Sunday in 2027: the decree neither lists it as a holiday nor moves it to the Monday.",
      bulletinShort: "the BOCM",
    },
  },
  MC: {
    ca: {
      how: "A la Regió de Múrcia, la mateixa resolució de la Direcció General de Treball que publica el calendari regional fixa els 2 dies de cadascun dels 45 municipis, al",
      note: "La resolució publica l'acord del Consell de Govern del 9 d'abril de 2026 amb els dies regionals.",
      bulletinShort: "el BORM",
    },
    en: {
      how: "In the Region of Murcia the same resolution of the Directorate-General for Labour that publishes the regional calendar sets the 2 days of each of the 45 municipalities, in the",
      note: "The resolution publishes the Governing Council's agreement of 9 April 2026 with the regional days.",
      bulletinShort: "the BORM",
    },
  },
  NC: {
    ca: {
      how: "A Navarra un dels 2 dies locals és comú a tota la comunitat; l'altre el proposa cada ajuntament i el publica una resolució de la Direcció General d'Economia Social i Treball, al",
      note: "Els ajuntaments tenen fins al 15 de novembre de 2026 per proposar el seu dia (Resolución 232/2026).",
      decreeNote: "La resolució afegeix el 3 de desembre, Sant Francesc Xavier, com a festa local a tota Navarra: per això no surt a la taula del BOE, que només recull les festes estatals i autonòmiques.",
      bulletinShort: "el BON",
    },
    en: {
      how: "In Navarre one of the 2 local days is shared by the whole region; councils put forward the other, and a resolution of the Directorate-General for Social Economy and Labour publishes it in the",
      note: "Councils have until 15 November 2026 to put forward their day (Resolución 232/2026).",
      decreeNote: "The resolution adds 3 December, St Francis Xavier, as a local holiday across Navarre: that is why it is not in the BOE table, which only lists national and regional holidays.",
      bulletinShort: "the BON",
    },
  },
  PV: {
    ca: {
      how: "Al País Basc els fixa la delegació territorial de Treball de cada territori històric, al seu butlletí provincial; el Govern Basc els reuneix al seu",
      note: "El fitxer de dades obertes del calendari laboral d'Euskadi per al 2027 no inclou l'1 de novembre entre els festius de tota la comunitat: la llista correcta és la del decret i el BOE.",
      decreeNote: "El decret no trasllada el 15 d'agost, que cau en diumenge; el Dilluns de Pasqua i el 7 d'octubre són els dies propis d'Euskadi.",
      bulletinShort: "els butlletins de cada territori històric (BOTHA, BOB i BOG)",
    },
    en: {
      how: "In the Basque Country each historical territory's Labour delegation sets them, in its provincial gazette; the Basque Government gathers them on its",
      note: "The open-data file of the Basque 2027 work calendar leaves 1 November out of the region-wide holidays: the correct list is the decree's and the BOE's.",
      decreeNote: "The decree does not move 15 August, which falls on a Sunday; Easter Monday and 7 October are the Basque Country's own days.",
      bulletinShort: "the gazettes of each historical territory (BOTHA, BOB and BOG)",
    },
  },
  RI: {
    ca: {
      how: "A la Rioja els publica la Direcció General de Treball i Salut Laboral, al",
      note: "La llista no esmenta tots els municipis: per als que no hi surten diu «Restantes municipios de La Rioja: Las dos fiestas tradicionales de cada uno de ellos».",
      bulletinShort: "el BOR",
    },
    en: {
      how: "In La Rioja the Directorate-General for Labour and Occupational Health publishes them, in the",
      note: "The list does not name every municipality: for those left out it says «Restantes municipios de La Rioja: Las dos fiestas tradicionales de cada uno de ellos» (each keeps its two traditional days).",
      bulletinShort: "the BOR",
    },
  },
  VC: {
    ca: {
      how: "A la Comunitat Valenciana els aprova una resolució de la conselleria competent en treball, amb els 2 dies de cadascun dels 542 municipis, al",
      note: "La llista del 2025 va sortir el 18 de novembre de 2024 i la del 2026, el 14 de novembre de 2025; després es va corregir dues vegades (DOGV de 15.1.2026 i 3.3.2026). Alguns ajuntaments publiquen abans el seu acord al DOGV, però la llista que val és la resolució.",
      bulletinShort: "el DOGV",
    },
    en: {
      how: "In the Valencian Community a resolution of the regional ministry responsible for labour approves them, with the 2 days of each of the 542 municipalities, in the",
      note: "The 2025 list came out on 18 November 2024 and the 2026 one on 14 November 2025; it was then corrected twice (DOGV of 15.1.2026 and 3.3.2026). Some councils publish their own agreement in the DOGV earlier, but the list that counts is the resolution.",
      bulletinShort: "the DOGV",
    },
  },
  CE: {
    ca: {
      how: "Ceuta és un sol municipi: el Ple de l'Assemblea proposa les seves 2 festes locals i la Delegació del Govern les publica al",
      note: null,
      decreeNotFound:
        "No hem trobat al Butlletí Oficial de la Ciutat de Ceuta el decret de la Presidència amb el calendari del 2027 (el del 2026 només apareix citat al BOCCE núm. 6.551, de 26.9.2025). Els dies de la ciutat són, per tant, els que publica el BOE.",
      bulletinShort: "el BOCCE",
    },
    en: {
      how: "Ceuta is a single municipality: the Assembly's plenary proposes its 2 local days and the Government Delegation publishes them in the",
      note: null,
      decreeNotFound:
        "We have not found the Presidency's decree with the 2027 calendar in Ceuta's official gazette (the 2026 one is only cited, in BOCCE núm. 6.551, de 26.9.2025). The city's days are therefore the ones the BOE publishes.",
      bulletinShort: "the BOCCE",
    },
  },
  ML: {
    ca: {
      how: "Melilla és un sol municipi: el Consell de Govern fixa les seves 2 festes locals en el mateix acord del calendari laboral, publicat al",
      note: null,
      decreeNote: "El mateix acord també fixa les 2 festes locals de la ciutat (8 i 17 de setembre), que el BOE no recull.",
      bulletinShort: "el BOME",
    },
    en: {
      how: "Melilla is a single municipality: the Governing Council sets its 2 local days in the same work calendar agreement, published in the",
      note: null,
      decreeNote: "The same agreement also sets the city's 2 local days (8 and 17 September), which the BOE does not list.",
      bulletinShort: "the BOME",
    },
  },
};

/** Catalan "a" + a bulletin with its article: "el BOJA" → "al BOJA", "els butlletins…" → "als butlletins…". */
export function caAt(bulletinShort: string): string {
  return bulletinShort.replace(/^el /, "al ").replace(/^els /, "als ");
}

/** cities-data.ts CityRow.note, by city slug. */
export const CITY_NOTE: Record<string, Record<IntlLocale, string>> = {
  burgos: {
    ca: "La llista del 2027 de la província de Burgos (BOP de Burgos núm. 145, de 4.8.2026) no hi inclou la capital.",
    en: "The 2027 list for the province of Burgos (BOP de Burgos núm. 145, de 4.8.2026) leaves the capital out.",
  },
  valladolid: {
    ca: "La llista del 2027 de la província de Valladolid (BOP de Valladolid núm. 129, de 9.7.2026) dona els dos dies de la capital com a «No comunicada».",
    en: "The 2027 list for the province of Valladolid (BOP de Valladolid núm. 129, de 9.7.2026) gives both of the capital's days as «No comunicada» (not reported).",
  },
};

/** LocalDay.note strings, by the exact Spanish text. */
export const LOCAL_DAY_NOTE: Record<string, Record<IntlLocale, string>> = {
  "en todo el concejo": { ca: "a tot el municipi", en: "across the whole municipality" },
  "en todo el concejo excepto en la parroquia de Lugones/Llugones": {
    ca: "a tot el municipi excepte la parròquia de Lugones/Llugones",
    en: "across the whole municipality except the parish of Lugones/Llugones",
  },
  "en la parroquia de Lugones/Llugones": { ca: "a la parròquia de Lugones/Llugones", en: "in the parish of Lugones/Llugones" },
  "para todo el municipio": { ca: "per a tot el municipi", en: "for the whole municipality" },
  "en todo el Territorio Histórico de Bizkaia": { ca: "a tot el territori històric de Biscaia", en: "across the historical territory of Bizkaia" },
  "en todo el Territorio Histórico de Gipuzkoa": { ca: "a tot el territori històric de Guipúscoa", en: "across the historical territory of Gipuzkoa" },
  "día de fiesta del territorio histórico de Álava": { ca: "festa del territori històric d'Àlaba", en: "holiday of the historical territory of Álava" },
  "común a toda Navarra": { ca: "comuna a tota Navarra", en: "shared by the whole of Navarre" },
  // The 20,000+ wave (cities-more.ts): Mieres, BOPA núm. 110.
  "en todo el Municipio": { ca: "a tot el municipi", en: "across the whole municipality" },
  "en todo el Municipio excepto en el Valle de Turón": { ca: "a tot el municipi excepte la vall de Turón", en: "across the whole municipality except the Turón valley" },
  "en el Valle de Turón": { ca: "a la vall de Turón", en: "in the Turón valley" },
};

/** Place names that differ from the Spanish. */
export const PLACE_NAME: Record<string, Record<IntlLocale, string>> = {
  "Lanzarote y La Graciosa": { ca: "Lanzarote i La Graciosa", en: "Lanzarote and La Graciosa" },
  "Gran Canaria": { ca: "Gran Canària", en: "Gran Canaria" },
  "Parroquia de Lugones/Llugones": { ca: "Parròquia de Lugones/Llugones", en: "Parish of Lugones/Llugones" },
  Álava: { ca: "Àlaba", en: "Álava" },
  Bizkaia: { ca: "Biscaia", en: "Bizkaia" },
  Gipuzkoa: { ca: "Guipúscoa", en: "Gipuzkoa" },
  Palencia: { ca: "Palència", en: "Palencia" },
  León: { ca: "Lleó", en: "León" },
  Zamora: { ca: "Zamora", en: "Zamora" },
};

/** The place in the reader's language; the Spanish when it is the same. */
export function placeName(place: string, locale: IntlLocale): string {
  return PLACE_NAME[place]?.[locale] ?? place;
}

/** Every Spanish prose field with no Catalan and English counterpart here (a test holds it to []). */
export function missingProse(): string[] {
  const missing: string[] = [];
  const locales: IntlLocale[] = ["ca", "en"];
  for (const [region, s] of Object.entries(SOURCES) as [Region, (typeof SOURCES)[Region]][]) {
    for (const l of locales) {
      const p = SOURCE_PROSE[region]?.[l];
      const at = `${region}.${l}`;
      if (!p) {
        missing.push(at);
        continue;
      }
      if (!p.how) missing.push(`${at}.how`);
      if (!p.bulletinShort) missing.push(`${at}.bulletinShort`);
      if ((s.local.note === null) !== (p.note === null)) missing.push(`${at}.note`);
      if (Boolean(s.decreeNote) !== Boolean(p.decreeNote)) missing.push(`${at}.decreeNote`);
      if (s.decree.status === "not-found" && !p.decreeNotFound) missing.push(`${at}.decreeNotFound`);
      if (s.decree.status === "published" && s.decree.differences && !p.differences) missing.push(`${at}.differences`);
      if (s.subRegional && !p.subRegional) missing.push(`${at}.subRegional`);
    }
    for (const d of s.local.days ?? []) {
      const note = (d as LocalDay).note;
      if (note && !LOCAL_DAY_NOTE[note]) missing.push(`${region}.local.days: ${note}`);
    }
  }
  for (const row of CITY_ROWS) {
    if (row.note && !CITY_NOTE[row.slug]) missing.push(`city ${row.slug}.note`);
    const lists = [row.local2027, row.local2026].filter((x) => x !== null);
    for (const list of lists) {
      const days = [...list.days, ...(list.zones ?? []).flatMap((z) => z.days)];
      for (const d of days) if (d.note && !LOCAL_DAY_NOTE[d.note]) missing.push(`city ${row.slug}: ${d.note}`);
    }
  }
  return missing;
}
