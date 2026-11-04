import type { B2Key } from "./shared";

/**
 * Christmas lights switch-on ("encesa de llums de Nadal") in 25 towns of
 * Catalonia: the data behind the town table of the lights page
 * (christmas-lights.ts). Barcelona is not here: its dates live in festive.ts
 * (ANNOUNCED_2026.lightsSwitchOn, PAST, SWITCH_ON_HISTORY).
 *
 * Every row was read on 4 November 2026 on the council's own site (news,
 * press room, Christmas site or municipal agenda); the URL and the quote are
 * next to each row, and the fact pack is research_notes/llums-nadal-2026.md.
 * Newspapers, aggregators, merchants' associations and social media were used
 * only to find the council page, never as the source (escapadaambnens.com and
 * similar sites carry "2026" headlines over 2025 details).
 *
 * On that day no council of the 25 had published its 2026 switch-on: the
 * newest items on their news pages ran to 2-4 Nov 2026 with nothing on it
 * (Manresa's note of 2 Nov 2026 on this year's lights gives no date). Every
 * `y2026` is therefore null and every row shows its 2025 date, labelled 2025.
 * In 2025 the councils announced between 12 and 25 November, so the re-read
 * that matters is around 15-25 November.
 *
 * Gaps: Vic and Rubí have no 2025 date on any council page we could read (Vic's
 * pages do not mention it; rubi.cat refuses automated requests), Sant Cugat
 * only 2024's (`y2024`). Times: the one the council gives for the switch-on
 * event; Igualada's and Castelldefels' pages contradict themselves, so their
 * time is left out. Girona's and Sabadell's 2025 pages print no year; the
 * weekday fixes it (see the rows). Terrassa's date comes from its Christmas
 * site's own iCal export (the page shows a maintenance notice). Santa Coloma's
 * site refuses plain requests; it was read through a translation proxy.
 *
 * HOW TO UPDATE (by hand or from a watch):
 *  - Read each town's `watch` page (the council's news or press room) and, if
 *    its 2026 switch-on is out, fill `y2026` with what the council's own page
 *    says: ISO date, start time and place if it gives them, the page's URL and
 *    the read date. A newspaper, an aggregator, a merchants' association or a
 *    social-media post is not a source; switchOnProblems() refuses any host
 *    that is not the council's (`hosts`).
 *  - Move LIGHTS_TOWNS_AS_OF to the day every row was re-read (only then: it
 *    is printed as the check date of the whole table).
 *  - Run the tests, deploy, publish `?only=llums-nadal`.
 *  - `y2025` stays as it is: it is printed with its year, never as 2026's.
 */

/** The day every row below was last read on the councils' own sites. */
export const LIGHTS_TOWNS_AS_OF = "2026-11-04";

export interface TownSwitchOn {
  /** ISO day of the switch-on. */
  date: string;
  /** Start time as the council gives it, "18:00". */
  time?: string;
  /** Where, as the council names it (a place name, printed as written in every language). */
  place?: string;
  /** The council's own page that says it. */
  url: string;
  /** A second council page that gives part of the row (the place, say), when `url` does not. */
  alsoUrl?: string;
  /** The day that page was read, ISO. */
  read: string;
}

export interface LightsTown {
  key: string;
  /** The town's name as printed in every language. */
  name: string;
  /** The council's hosts: every `url` must be on one of them. */
  hosts: RegExp;
  /** Where the council publishes its news (for the next re-read). */
  watch: string;
  /** This year's switch-on, or `null` while the council has not published it. */
  y2026: TownSwitchOn | null;
  /** Last year's, from the council's own page, always printed with "2025". */
  y2025: TownSwitchOn | null;
  /** 2024's, only for a town whose 2025 date is on no council page we could read. */
  y2024?: TownSwitchOn;
  /** Our guide to the town, when there is one. */
  guide?: B2Key;
}

const READ = "2026-11-04";

export const LIGHTS_TOWNS: readonly LightsTown[] = [
  {
    key: "girona",
    name: "Girona",
    hosts: /(^|\.)girona\.cat$/,
    watch: "https://www.girona.cat/turisme/cat/agenda.php",
    y2026: null,
    // Council agenda: "DIVENDRES 28 DE NOVEMBRE · Encesa de llums de Nadal [...] Plaça de Catalunya 17.50 h Parlament 18 h Encesa de llums 18.05 h Actuació musical amb Els Beta de SX3". The page prints no year: Friday 28 November is 2025 (in 2026 it is a Saturday; SX3 rules out 2014).
    y2025: { date: "2025-11-28", time: "18:00", place: "plaça de Catalunya", url: "https://www.girona.cat/turisme/cat/index_agenda.php?idReg=4658", read: READ },
    guide: "girona",
  },
  {
    key: "figueres",
    name: "Figueres",
    hosts: /(^|\.)figueres\.cat$/,
    watch: "https://www.figueres.cat/actualitat/noticies",
    y2026: null,
    // "L'encesa de llums de Nadal marcarà l'inici de la temporada aquest divendres 28 de novembre (18 h) a la Rambla, i a les 20 h a la plaça de l'Església" (24 Nov 2025).
    y2025: { date: "2025-11-28", time: "18:00", place: "la Rambla", url: "https://www.figueres.cat/actualitat/noticies/figueres-presenta-la-campanya-de-nadal-amb-mes-il-luminacio-nadalenca-arbres-naturals-parc-d2019atraccions-i-pista-de-gel", read: READ },
    guide: "figueres",
  },
  {
    key: "olot",
    name: "Olot",
    hosts: /(^|\.)olot\.cat$/,
    watch: "https://www.olot.cat/ajuntament/comunicacio/actualitat",
    y2026: null,
    // "Tindrà lloc el divendres 28 de novembre a les 19.30 h a la Plaça Major" (19 Nov 2025).
    y2025: { date: "2025-11-28", time: "19:30", place: "plaça Major", url: "https://www.olot.cat/ajuntament/comunicacio/actualitat/pln217/olot-el-millor-regal-de-nadal-2", read: READ },
  },
  {
    key: "blanes",
    name: "Blanes",
    hosts: /(^|\.)blanes\.cat$/,
    watch: "https://www.blanes.cat/noticies",
    y2026: null,
    // Report of 28 Nov 2025: "ha estat el vespre d'aquest divendres, 28 de novembre [...] A les sis del vespre s'ha fet el tret de sortida de l'encesa dels llums". The place is described, not named (the button "al costat del muntatge del pessebre"): left out.
    y2025: { date: "2025-11-28", time: "18:00", url: "https://www.blanes.cat/docweb/2025-11-28-nadal1", read: READ },
  },
  {
    key: "vic",
    name: "Vic",
    hosts: /(^|\.)vic\.cat$/,
    watch: "https://www.vic.cat/ajuntament/comunicacio-i-protocol/noticies",
    y2026: null,
    // No council page gives the 2025 switch-on: the news of 14 Oct-12 Dec 2025, the 12 Dec 2025 Christmas note and the 2025 programme PDF do not mention it (the newest council pages are 2018 and 2019). A newspaper's date is not used.
    y2025: null,
  },
  {
    key: "terrassa",
    name: "Terrassa",
    hosts: /(^|\.)terrassa\.cat$/,
    watch: "https://terrassanadal.terrassa.cat/",
    y2026: null,
    // The council's Christmas site, event "Acte d'encesa de llums" (organiser Ajuntament de Terrassa). The page shows a maintenance notice; its own iCal export (same URL + ?ical=1) reads "DTSTART;TZID=Europe/Paris:20251129T180000", "LOCATION:Raval de Montserrat, 14, Terrassa". www.terrassa.cat answers with a bot challenge.
    y2025: { date: "2025-11-29", time: "18:00", place: "Raval de Montserrat", url: "https://terrassanadal.terrassa.cat/esdeveniment/acte-dencesa-de-llums/", read: READ },
  },
  {
    key: "sabadell",
    name: "Sabadell",
    hosts: /(^|\.)sabadell\.cat$/,
    watch: "https://web.sabadell.cat/servei-de-premsa/notes-premsa",
    y2026: null,
    // Press note of 13 Nov 2025: "Divendres, 28 de novembre, hi haurà encesa a les 18 h al Passeig, a les 19 h a la plaça del Pi i a les 20 h a la plaça de la Creu de Barberà. Al dia següent, dissabte, 29, els llums s'encendran a les 18 h a l'Eix Macià." The row gives the first.
    y2025: { date: "2025-11-28", time: "18:00", place: "el Passeig", url: "https://web.sabadell.cat/servei-de-premsa/notes-premsa/item/el-nadal-portara-noves-cancons-i-personatges-del-somriu-nova-decoracio-i-un-espectacle-de-llum-musica-i-aigua-al-passeig", read: READ },
  },
  {
    key: "rubi",
    name: "Rubí",
    hosts: /(^|\.)rubi\.cat$/,
    watch: "https://www.rubi.cat/",
    y2026: null,
    // rubi.cat answers every automated request with a bot challenge (403), so no council page could be read for either year. Check it by hand.
    y2025: null,
  },
  {
    key: "sant-cugat",
    name: "Sant Cugat del Vallès",
    hosts: /(^|\.)santcugat\.cat$/,
    watch: "https://premsa.santcugat.cat/",
    y2026: null,
    // The council's 2025 Christmas note (2 Dec 2025) does not mention the switch-on. 2024, press room 26 Nov 2024: "Sant Cugat s'il·luminarà [...] el proper divendres, 29 de novembre, amb la tradicional festa de l'Encesa de llums, que es farà a les 18.30 h, a la plaça d'Octavià."
    y2025: null,
    y2024: { date: "2024-11-29", time: "18:30", place: "plaça d'Octavià", url: "https://premsa.santcugat.cat/ajuntament/bon-nadal-sant-cugat-programa-mes-de-300-activitats-de-l1-de-desembre-al-5-de-gener/", read: READ },
  },
  {
    key: "granollers",
    name: "Granollers",
    hosts: /(^|\.)granollers\.cat$/,
    watch: "https://www.granollers.cat/noticies",
    y2026: null,
    // Press room, 20 Nov 2025: "L'encesa de Nadal serà aquest dilluns 1 de desembre, a les 18 h, amb l'arribada del Patge Gregori, la Patgessa Llum i en Picarol a la plaça Barangé."
    y2025: { date: "2025-12-01", time: "18:00", place: "plaça Barangé", url: "https://www.granollers.cat/noticies/sala-de-premsa/granollers-torna-encendre-la-ciutat-de-llum-colors-m%C3%BAsica-i-la-m%C3%A0gia-de-0", read: READ },
  },
  {
    key: "tarragona",
    name: "Tarragona",
    hosts: /(^|\.)tarragona\.cat$/,
    watch: "https://www.tarragona.cat/comerc/noticies/noticies-2026",
    y2026: null,
    // "L'arrencada de la programació s'iniciarà el proper divendres 28 de novembre a partir de les 18.30 hores des de la Plaça de la Font on enguany tindrà lloc la festa de l'encesa." (20 Nov 2025)
    y2025: { date: "2025-11-28", time: "18:30", place: "plaça de la Font", url: "https://www.tarragona.cat/comerc/noticies/noticies-2025/lencesa-de-llums-de-nadal-de-tarragona-se-celebrara-el-28-de-novembre-des-de-la-placa-de-la-font", read: READ },
    guide: "tarragona",
  },
  {
    key: "reus",
    name: "Reus",
    hosts: /(^|\.)reus\.cat$/,
    watch: "https://www.reus.cat/ajuntament/notes-de-premsa",
    y2026: null,
    // "La festa començarà el dijous, 27 de novembre, a les 18.45 h, amb l'espectacle lumínic inaugural [...] que donarà pas a l'encesa dels llums de Nadal de la ciutat, que serà a les 19 h." (25 Nov 2025); the place from the photo gallery of 27 Nov 2025 ("des de qualsevol punt de la plaça del Mercadal").
    y2025: {
      date: "2025-11-27",
      time: "18:45",
      place: "plaça del Mercadal",
      url: "https://www.reus.cat/noticia/reus-es-prepara-lespectacle-de-lencesa-dels-llums-de-la-campanya-de-nadal-2025",
      alsoUrl: "https://www.reus.cat/noticia/galeria-fotografica-lespectacle-el-batec-del-nadal-encen-els-llums-de-nadal-reus",
      read: READ,
    },
  },
  {
    key: "tortosa",
    name: "Tortosa",
    hosts: /(^|\.)tortosa\.cat$/,
    watch: "https://www2.tortosa.cat/noticies/",
    y2026: null,
    // Published Monday 24 Nov 2025: "L'encesa dels llums de Nadal aquest divendres [...] començarà a partir de les 18.15 a la plaça de l'Ajuntament [...] aproximadament a les 18.45 serà el moment d'il·luminar Tortosa." "Aquest divendres" = 28 Nov 2025.
    y2025: { date: "2025-11-28", time: "18:15", place: "plaça de l'Ajuntament", url: "https://www2.tortosa.cat/noticies/noticia.php?lang=ca&id=14202", read: READ },
  },
  {
    key: "lleida",
    name: "Lleida",
    hosts: /(^|\.)paeria\.cat$/,
    watch: "https://www.paeria.cat/ca/actualitat/noticies",
    y2026: null,
    // "Aquest divendres, 28 de novembre, es donarà el tret de sortida a la campanya amb l'encesa de llums, primer a la Plaça de la Paeria [...], després a la Zona Alta [...] i finalment, a La Bordeta." (24 Nov 2025). No time on any council page.
    y2025: { date: "2025-11-28", place: "plaça de la Paeria", url: "https://www.paeria.cat/ca/actualitat/noticies/presentacio-campanya-de-nadal", read: READ },
  },
  {
    key: "sitges",
    name: "Sitges",
    hosts: /(^|\.)sitges\.cat$/,
    watch: "https://www.sitges.cat/actualitat/noticies",
    y2026: null,
    // Council agenda, "Encesa de llums i xocolatada amb xurros": "Quan 28/11/2025 de 17:30 a 18:30 [...] On Cap de la Vila".
    y2025: { date: "2025-11-28", time: "17:30", place: "Cap de la Vila", url: "https://www.sitges.cat/serveis/promocio-economica/actualitat/agenda/encesa-de-llums-i-xocolatada-amb-xurros", read: READ },
    guide: "sitges",
  },
  {
    key: "badalona",
    name: "Badalona",
    hosts: /(^|\.)badalona\.cat$/,
    watch: "https://www.badalona.cat/ca/actualitat/noticies",
    y2026: null,
    // "Divendres 21 a les 18 hores s'encendrà l'arbre de Nadal de la plaça de la Vila i la il·luminació de tots els carrers" (20 Nov 2025). The 42 m tree in plaça del President Tarradellas was lit the next day.
    y2025: { date: "2025-11-21", time: "18:00", place: "plaça de la Vila", url: "https://www.badalona.cat/ca/actualitat/noticies/el-nadal-arriba-aquest-cap-de-setmana-a-badalona-amb-lencesa-del-gran-arbre-de-la-placa-del-president-tarradellas", read: READ },
  },
  {
    key: "hospitalet",
    name: "L'Hospitalet de Llobregat",
    hosts: /(^|\.)l-h\.cat$/,
    watch: "https://www.l-h.cat/",
    y2026: null,
    // Christmas programme 2025 (PDF): "Dijous, 27 de novembre / Plaça de l'Ajuntament / 18 h / Encesa dels llums de Nadal".
    y2025: { date: "2025-11-27", time: "18:00", place: "plaça de l'Ajuntament", url: "https://l-h.cat/webs/especials/nadal/2025/docs/PROGRAMA_nadal_2025.pdf", read: READ },
  },
  {
    key: "santa-coloma",
    name: "Santa Coloma de Gramenet",
    hosts: /(^|\.)gramenet\.cat$/,
    watch: "https://ajuntamentinforma.gramenet.cat/",
    y2026: null,
    // Christmas site 2025: "Encesa dels llums de Nadal / 28 de novembre de 2025"; the mayor's message: "l'encesa dels llums de Nadal a la plaça de la Vila". The site refuses plain requests (403); read through a translation proxy. No time on a page we could read.
    y2025: {
      date: "2025-11-28",
      place: "plaça de la Vila",
      url: "https://www.gramenet.cat/sites/nadal-2025/encesa-dels-llums/",
      alsoUrl: "https://www.gramenet.cat/sites/nadal-2025/missatge-de-lalcaldessa/",
      read: READ,
    },
  },
  {
    key: "cornella",
    name: "Cornellà de Llobregat",
    hosts: /(^|\.)cornella\.cat$/,
    watch: "https://www.cornella.cat/ca/actualitat/noticies",
    y2026: null,
    // "Com sempre, es farà a la plaça de Catalunya, a partir de les 18.30 h, el dissabte 29 de novembre." (24 Nov 2025); the lights themselves at 19 h.
    y2025: { date: "2025-11-29", time: "18:30", place: "plaça de Catalunya", url: "https://www.cornella.cat/ca/actualitat/noticies/la-festa-de-lencesa-dels-llums-de-nadal-se-celebra-aquest-dissabte", read: READ },
  },
  {
    key: "el-prat",
    name: "El Prat de Llobregat",
    hosts: /(^|\.)elprat\.cat$/,
    watch: "https://www.elprat.cat/actualitat/noticies",
    y2026: null,
    // Council agenda: "Quan 20/11/2025 [...] A les 18:30 h, encesa de llums On Plaça de Catalunya" (entertainment from earlier in the afternoon).
    y2025: { date: "2025-11-20", time: "18:30", place: "plaça de Catalunya", url: "https://www.elprat.cat/la-ciutat/guia-agenda/encesa-dels-llums-de-nadal", read: READ },
  },
  {
    key: "mataro",
    name: "Mataró",
    hosts: /(^|\.)mataro\.cat$/,
    watch: "https://www.mataro.cat/ca/actualitat/noticies",
    y2026: null,
    // "L'encesa de l'enllumenat es farà a les 19 h a la plaça de l'Ajuntament" on Friday 28 November (20 Nov 2025); three neighbourhood switch-ons followed on the 29th.
    y2025: { date: "2025-11-28", time: "19:00", place: "plaça de l'Ajuntament", url: "https://www.mataro.cat/ca/actualitat/noticies/2025/tot-a-punt-per-viure-un-nadal-amb-mes-llums-que-mai-i-amb-noves-carrosses-i-nous-personatges-a-la-cavalcada-1", read: READ },
  },
  {
    key: "manresa",
    name: "Manresa",
    hosts: /(^|\.)manresa\.cat$/,
    watch: "https://web.manresa.cat/web/noticies",
    y2026: null,
    // "L'encesa dels llums de Nadal, que es farà el divendres 28 de novembre a Sant Domènec" (12 Nov 2025). No time. The council's 2 Nov 2026 note on this year's lights gives no date.
    y2025: { date: "2025-11-28", place: "Sant Domènec", url: "https://web.manresa.cat/web/noticies/13499-la-placa-de-nadal-es-renova-amb-mes-activitat-i-l-arribada-d-un-nou-personatge-magic-i-ple-de-llum", read: READ },
  },
  {
    key: "igualada",
    name: "Igualada",
    hosts: /(^|\.)igualada\.cat$/,
    watch: "https://www.igualada.cat/ca/noticies",
    y2026: null,
    // "El bosc màgic del Passeig Verdaguer tornarà a ser l'escenari de l'encesa de llums divendres vinent 28 de novembre" (24 Nov 2025). Time left out: that page says the show starts at 20 h, the council's 12 Nov page said "a partir de dos quarts de vuit del vespre".
    y2025: { date: "2025-11-28", place: "passeig de Verdaguer", url: "https://www.igualada.cat/ca/noticies/el-bosc-magic-del-passeig-verdaguer-escenari-de-l2019encesa-amb-l2019espectacle-interactiu-201ccolors-per-tornar-a-casa201d", read: READ },
  },
  {
    key: "vilanova",
    name: "Vilanova i la Geltrú",
    hosts: /(^|\.)vilanova\.cat$/,
    watch: "https://www.vilanova.cat/noticies",
    y2026: null,
    // "L'encesa de l'enllumenat nadalenc —que romandrà actiu del 28 de novembre al 6 de gener, de 17.30 h a 23 h—" (27 Nov 2025). No ceremony, time or place given.
    y2025: { date: "2025-11-28", url: "https://www.vilanova.cat/noticies/detall?id=99998178", read: READ },
  },
  {
    key: "castelldefels",
    name: "Castelldefels",
    hosts: /(^|\.)castelldefels\.org$/,
    watch: "https://www.castelldefels.org/ca/actualitat/elcastell/noticies",
    y2026: null,
    // "la Plaça de l'Església acull aquest dissabte 22 de novembre (a les 17 h) l'acte oficial d'encesa dels llums de Nadal". Time left out: the same page's detail line says "de 18:00 a 22:00".
    y2025: { date: "2025-11-22", place: "plaça de l'Església", url: "https://www.castelldefels.org/ca/actualitat/agenda/encesa-de-llum-de-nadal", read: READ },
  },
];

/** The windows a switch-on of each year must fall in. */
export const SEASONS = {
  2026: { from: "2026-11-01", to: "2026-12-24" },
  2025: { from: "2025-11-01", to: "2025-12-24" },
  2024: { from: "2024-11-01", to: "2024-12-24" },
} as const;

/** Why a row's slot cannot be printed, or nothing when it can. */
export function switchOnProblems(town: LightsTown, year: 2024 | 2025 | 2026): string[] {
  const slot = year === 2026 ? town.y2026 : year === 2025 ? town.y2025 : town.y2024;
  if (year === 2024 && slot && town.y2025) return [`${town.name}: a 2024 slot is only for towns without a 2025 one`];
  if (!slot) return [];
  const problems: string[] = [];
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  const valid = (value: string) => iso.test(value) && new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value;
  const season = SEASONS[year];
  if (!valid(slot.date)) problems.push(`${town.name} ${year}: date ${slot.date} is not an ISO date`);
  else if (slot.date < season.from || slot.date > season.to) problems.push(`${town.name} ${year}: ${slot.date} is outside its season`);
  if (slot.time !== undefined && !/^([01]\d|2[0-3]):[0-5]\d$/.test(slot.time)) problems.push(`${town.name} ${year}: time ${slot.time} is not HH:MM`);
  if (slot.place !== undefined && !slot.place.trim()) problems.push(`${town.name} ${year}: empty place`);
  for (const href of [slot.url, ...(slot.alsoUrl ? [slot.alsoUrl] : [])]) {
    try {
      const url = new URL(href);
      if (url.protocol !== "https:") problems.push(`${href} is not https`);
      if (!town.hosts.test(url.host)) problems.push(`${town.name} ${year}: ${url.host} is not the council's own site`);
      if (/[?&]utm_/.test(href)) problems.push(`${href} carries tracking`);
    } catch {
      problems.push(`${town.name} ${year}: ${href} is not a URL`);
    }
  }
  if (!valid(slot.read)) problems.push(`${town.name} ${year}: read ${slot.read} is not an ISO date`);
  else if (slot.read > LIGHTS_TOWNS_AS_OF) problems.push(`${town.name} ${year}: read ${slot.read} is after LIGHTS_TOWNS_AS_OF`);
  return problems;
}

/** Towns whose 2026 switch-on is out, in date order. */
export function announcedTowns(towns: readonly LightsTown[] = LIGHTS_TOWNS): LightsTown[] {
  return towns.filter((t) => t.y2026).sort((a, b) => a.y2026!.date.localeCompare(b.y2026!.date) || a.name.localeCompare(b.name, "ca"));
}
