import type { Block } from "@/lib/content/blocks";
import { NATIVITY_SOURCE } from "@/lib/content/pessebres/agenda";
import { EVERGREEN as WEEKEND } from "@/lib/content/weekend/evergreen";
import { fairsHubPath } from "@/lib/programmatic/christmas-fairs/paths";
import type { Locale } from "@/lib/i18n/config";

import { CHRISTMAS } from "./christmas";
import {
  b2Related,
  b2link,
  callout,
  faq,
  h2,
  lead,
  paras,
  table,
  verifiedLine,
  type B2Article,
  type B2Source,
} from "./shared";

/**
 * Living nativity scenes ("pessebres vivents") in Catalonia.
 *
 * The calendar itself is the `livingNativities` block: read every day from
 * the Generalitat's open-data agenda (`rhpv-yr4f`), upcoming rows only, so
 * the page cannot show last season. On 25 October 2026 the agenda held no
 * living nativity for the 2026-27 season yet; the block says so and explains
 * when they usually appear.
 *
 * Everything this text says about timing, tickets and where they are comes
 * from the same agenda's 2025-26 rows, read on 25 Oct 2026 and always labelled
 * as last season: 44 living nativities in 22 comarques; first opened 29 Nov
 * 2025, last closed 11 Jan 2026; 36 started on or after 20 Dec and 40 had
 * ended by 6 Jan; 32 started on a Saturday or Sunday; 3 were free, 3 asked for
 * a donation, 22 had an online ticket link; the first was posted on 19 Nov,
 * 22 by 30 Nov and 41 by 15 Dec. Public holidays: the Generalitat's 2026 and
 * 2027 calendars (treball.gencat.cat), checked the same day.
 *
 * The best-known nativities (`KNOWN`) are named with a link to their own site
 * and their 2026-27 dates only when that site has published them, all read
 * on 25 Oct 2026: Corbera (tickets site, 28 Nov 2026 - 9 Jan 2027, online
 * only), Tona (55th; box office only), les Torres de Fals, Sant Guim de la
 * Plana (online only; not wheelchair or pushchair accessible), les Gunyoles
 * (49th), l'Espluga de Francolí (biennial; advance tickets from 22 Nov) and
 * the Torre del Suro in Barcelona (21 Dec, free). Bàscara, els Prats de Rei,
 * Rupit and Peralada still showed 2025-26 and are "not yet published". Pals
 * was left out: its only site is a free-hosted page whose owner could not be
 * confirmed. No date from 2025 is ever written as a 2026 date
 * (tests/living-nativities-guide.test.ts). Re-check the pending four in
 * November, and replace the whole table for the 2027-28 season.
 *
 * 31 Oct 2026 (striking-distance push): two more added from their own sites,
 * Sant Fost de Campsentelles (dates with '26/'27, 60 minutes, online only,
 * adults 10 EUR; no edition printed, the page gives none) and the Pessebre
 * dels Estels at the Masia de Castelló (5, 6, 12, 13 Dec, "Entrades Pessebre
 * 2026", access from 16.30, half-hour slots, 15/10 EUR). Castelló links to its
 * tickets page: its home page carried an unrelated betting promotion. The
 * pending four still showed 2025-26 (els Prats de Rei's "54a" and "Feliç
 * 2026" are last season's). Castell d'Aro's site did not load; Navata and
 * Celrà had nothing for 2026-27. The open-data agenda had no living nativity
 * for 2026-27 yet and the federation no 2026-27 list.
 *
 * 3 Nov 2026 (Christmas cluster refresh): the pending four re-read (Bàscara:
 * no dates; els Prats de Rei: "Feliç 2026" message of last season; Rupit:
 * 2025-26 edition, last updated 27 Dec 2025; Peralada: nothing for 2026-27),
 * so they stay "not yet published". The open-data agenda (rhpv-yr4f) still
 * had no living nativity for 2026-27. Descriptions now name the dated ones
 * instead of promising a calendar that is still empty; a paragraph links
 * Barcelona in December, Christmas in Barcelona, the traditions and the
 * Three Kings parade.
 *
 * 13 Nov 2026 (December freshness pass; fact pack
 * research_notes/pessebres-vivents-2026-13nov.md): every organiser page in
 * KNOWN re-read with a browser user agent and grepped; each entry now carries
 * its `readOn` and `quote`. Three of the four pending ones have published:
 * Bàscara (its own site elpessebre.cat, linked from the council's page),
 * els Prats de Rei (55th; the cultural agenda says 21 Dec, the organiser 20
 * Dec: the organiser's is printed and the note says so) and Peralada (43rd).
 * Rupit still shows 2025-26 and says "2026 no confirmat". This season's
 * prices and times added where the page gives them (Corbera, Tona, Torres de
 * Fals, Sant Fost, Bàscara, Peralada); the Torres de Fals times read on 25
 * Oct are no longer on its page and were dropped. Sant Guim's ticket sale is
 * "properament" (recheck). Castellar de n'Hug and l'Arboç were checked: no
 * living nativity in the agenda and no official page, so neither is listed.
 * The open-data agenda carries the first 2026-27 living nativities since 10
 * Nov (Cànoves, Corró d'Avall, Canyelles, la Torreta…); the live block shows
 * them. Date guards: `recheck` entries re-read every 10 days until
 * KNOWN_SEASON_STARTS; after KNOWN_SEASON_ENDS the page needs its
 * after-season pass (tests/living-nativities-guide.test.ts).
 *
 * The lead image reuses the Christmas markets guide's photograph of nativity
 * figures, with the same alt text and caption: the publisher requires a lead
 * photo, the media row is keyed by file, and identical wording keeps the
 * other article's row unchanged.
 */

const VERIFIED = "2026-11-13";

/** The day the table's organiser pages were last read, as the note prints it. */
const CHECKED_ON: Record<Locale, string> = {
  ca: "13 de novembre de 2026",
  es: "13 de noviembre de 2026",
  en: "13 November 2026",
};

const HOLIDAYS_2026 = "https://treball.gencat.cat/ca/ambits/relacions_laborals/ci/calendari_laboral/calendari-festes-2026/";
const HOLIDAYS_2027 = "https://treball.gencat.cat/ca/ambits/relacions_laborals/ci/calendari_laboral/calendari-festes-2027/";

const SOURCES: B2Source[] = [
  { name: "Agenda Cultural de Catalunya: Nadal", url: NATIVITY_SOURCE.url, publisher: "Departament de Cultura, Generalitat de Catalunya" },
  { name: "Agenda cultural de Catalunya (dades obertes)", url: NATIVITY_SOURCE.dataUrl, publisher: NATIVITY_SOURCE.publisher },
  { name: "Calendari oficial de festes laborals a Catalunya 2026", url: HOLIDAYS_2026, publisher: "Departament d'Empresa i Treball, Generalitat de Catalunya" },
  { name: "Calendari oficial de festes laborals a Catalunya 2027", url: HOLIDAYS_2027, publisher: "Departament d'Empresa i Treball, Generalitat de Catalunya" },
  { name: "51 municipis d'arreu de Catalunya acolliran més de 300 representacions de pessebres vivents", url: "https://www.pessebresvivents.cat/51-municipis-darreu-de-catalunya-acolliran-mes-de-300-representacions-de-pessebres-vivents/", publisher: "Federació de Pessebres Vivents de Catalunya" },
];

/**
 * The best-known living nativities, each read on its own organiser's or town
 * council's site on the date in `readOn`. `dates` only when that site gives
 * the 2026-27 season (with this season's hours and prices when the same page
 * gives them); otherwise null, rendered as "2026 not confirmed" — never last
 * season's days. `quote` is what the page says, as it writes it. Corbera
 * links to its tickets pages: its home page carried injected spam text on 25
 * Oct.
 */
export interface Known {
  /** The organiser's own name, kept in Catalan in every edition. */
  name: string;
  place: string;
  dates: Record<Locale, string> | null;
  url: string;
  label: string;
  publisher: string;
  /** ISO day the page was last read. */
  readOn: string;
  /** The page's own words for this season (or, for a pending one, what it still shows). */
  quote: string;
  /**
   * Something on the page is still to come (the dates, or the ticket sale):
   * re-read at least every 10 days until KNOWN_SEASON_STARTS
   * (tests/living-nativities-guide.test.ts).
   */
  recheck?: boolean;
}

export const KNOWN: Known[] = [
  {
    name: "Pessebre Vivent de Corbera de Llobregat",
    place: "Corbera de Llobregat (Baix Llobregat)",
    dates: {
      ca: "Del 28 de novembre de 2026 al 9 de gener de 2027, en dies concrets, amb passis a les 18, 19 o 20 h; entrades només per internet (adults, 17 €; menors de 14 anys, Carnet Jove i majors de 65, 12 €; fins a 6 anys, gratis)",
      es: "Del 28 de noviembre de 2026 al 9 de enero de 2027, en días concretos, con pases a las 18, 19 o 20 h; entradas solo por internet (adultos, 17 €; menores de 14 años, Carnet Jove y mayores de 65, 12 €; hasta 6 años, gratis)",
      en: "28 November 2026 to 9 January 2027, on set days, with sessions at 18:00, 19:00 or 20:00; tickets online only (adults €17; under-14s, Carnet Jove and over-65s €12; under-6s free)",
    },
    url: "https://tickets.pessebrecorbera.cat/",
    label: "tickets.pessebrecorbera.cat",
    publisher: "Pessebre Vivent de Corbera de Llobregat",
    readOn: "2026-11-13",
    quote: "torna del 28 de novembre de 2026 al 9 de gener de 2027 … la venda de les entrades es fa exclusivament online … Adults 17 € … Menors de 14 anys 12 €",
  },
  {
    name: "55è Pessebre Vivent d'Osona",
    place: "Tona (Osona)",
    dates: {
      ca: "20, 25, 26 i 27 de desembre de 2026 i 1, 3, 6 i 10 de gener de 2027, de 18 a 20 h (el 20 de desembre i el 6 i el 10 de gener, fins a les 19.30 h); entrades només a taquilla (adults, 10 €; de 6 a 13 anys, 3 €)",
      es: "20, 25, 26 y 27 de diciembre de 2026 y 1, 3, 6 y 10 de enero de 2027, de 18 a 20 h (el 20 de diciembre y el 6 y el 10 de enero, hasta las 19.30 h); entradas solo en taquilla (adultos, 10 €; de 6 a 13 años, 3 €)",
      en: "20, 25, 26 and 27 December 2026 and 1, 3, 6 and 10 January 2027, 18:00 to 20:00 (to 19:30 on 20 December and 6 and 10 January); tickets at the box office only (adults €10; ages 6 to 13, €3)",
    },
    url: "https://pessebre-vivent-osona.cat/",
    label: "pessebre-vivent-osona.cat",
    publisher: "Agrupació Pessebre Vivent de Tona",
    readOn: "2026-11-13",
    quote: "55è Pessebre Vivent d'Osona (2026-2027) … 20 de Desembre de 18h a 19:30 · 25, 26 i 27 de Desembre, 1 i 3 de Gener de 18h a 20h · 6 i 10 de Gener de 18h a 19:30 … Adults, 10€",
  },
  {
    name: "Pessebre Vivent del Bages a les Torres de Fals",
    place: "Fonollosa (Bages)",
    dates: {
      ca: "19, 20, 26 i 27 de desembre de 2026 i 1, 2, 3 i 6 de gener de 2027; entrada general, 15 € (majors de 65 anys, 12 €; de 6 a 12 anys, 6 €)",
      es: "19, 20, 26 y 27 de diciembre de 2026 y 1, 2, 3 y 6 de enero de 2027; entrada general, 15 € (mayores de 65 años, 12 €; de 6 a 12 años, 6 €)",
      en: "19, 20, 26 and 27 December 2026 and 1, 2, 3 and 6 January 2027; general admission €15 (over-65s €12; ages 6 to 12, €6)",
    },
    url: "https://pessebre.cat/",
    label: "pessebre.cat",
    publisher: "Pessebre vivent del Bages a les Torres de Fals",
    readOn: "2026-11-13",
    quote: "19, 20, 26 i 27 de desembre de 2026 · 1, 2, 3 i 6 de gener de 2027 … Entrada general: 15€",
  },
  {
    name: "Pessebre Vivent dels Oficis Perduts (40è aniversari)",
    place: "Sant Guim de la Plana (Segarra)",
    dates: {
      ca: "19, 20, 26 i 27 de desembre de 2026 i 2, 3, 9 i 10 de gener de 2027, a les 18.30 h; entrades només per internet (el 13 de novembre, venda encara no oberta: «properament»)",
      es: "19, 20, 26 y 27 de diciembre de 2026 y 2, 3, 9 y 10 de enero de 2027, a las 18.30 h; entradas solo por internet (el 13 de noviembre, venta aún no abierta: «properament», próximamente)",
      en: "19, 20, 26 and 27 December 2026 and 2, 3, 9 and 10 January 2027, at 18:30; tickets online only (on 13 November not on sale yet: \"properament\", coming soon)",
    },
    url: "https://pessebre.org/",
    label: "pessebre.org",
    publisher: "Associació Cultural La Marinada",
    readOn: "2026-11-13",
    quote: "Desembre 2026: 19, 20, 26 i 27 · Gener 2027: 2, 3, 9 i 10 … Hora: 18.30h … VENDA D'ENTRADES PROPERAMENT",
    recheck: true,
  },
  {
    name: "49è Pessebre Vivent parlat de les Gunyoles",
    place: "Avinyonet del Penedès (Alt Penedès)",
    dates: {
      ca: "20, 25, 26 i 27 de desembre de 2026 i 1, 2 i 3 de gener de 2027, a les 18, 18.45 i 19.30 h",
      es: "20, 25, 26 y 27 de diciembre de 2026 y 1, 2 y 3 de enero de 2027, a las 18, 18.45 y 19.30 h",
      en: "20, 25, 26 and 27 December 2026 and 1, 2 and 3 January 2027, at 18:00, 18:45 and 19:30",
    },
    url: "https://pessebrelesgunyoles.cat/",
    label: "pessebrelesgunyoles.cat",
    publisher: "Pessebre Vivent de les Gunyoles",
    readOn: "2026-11-13",
    quote: "Desembre 2026: 20, 25, 26 i 27 · Gener 2027: 1, 2 i 3 · a les 18:00h, a les 18:45h i a les 19:30h",
  },
  {
    name: "Pessebre Vivent de l'Espluga de Francolí",
    place: "l'Espluga de Francolí (Conca de Barberà)",
    dates: {
      ca: "27, 28 i 29 de desembre de 2026 (es fa cada dos anys); entrades només anticipades, des del 22 de novembre a les 9 h, sense taquilla",
      es: "27, 28 y 29 de diciembre de 2026 (se hace cada dos años); entradas solo anticipadas, desde el 22 de noviembre a las 9 h, sin taquilla",
      en: "27, 28 and 29 December 2026 (held every two years); advance tickets only, on sale from 22 November at 9:00, no box office",
    },
    url: "https://pessebredelespluga.com/",
    label: "pessebredelespluga.com",
    publisher: "Associació del Pessebre Vivent de l'Espluga de Francolí",
    readOn: "2026-11-13",
    quote: "27, 28 i 29 de desembre de 2026 … Entrades NOMÉS anticipades a partir del 22 de novembre de 2026 a les 9 del matí FINS EXHAURIR AFORAMENT (no hi haurà taquilla)",
  },
  {
    name: "33è Pessebre Vivent de la Torre del Suro",
    place: "Barcelona (el Guinardó)",
    dates: {
      ca: "21 de desembre de 2026 a les 18 h; entrada lliure, sense inscripció",
      es: "21 de diciembre de 2026 a las 18 h; entrada libre, sin inscripción",
      en: "21 December 2026 at 18:00; free entry, no booking needed",
    },
    url: "https://www.pessebrevivent.cat/",
    label: "pessebrevivent.cat",
    publisher: "Pessebre Vivent de la Torre del Suro",
    readOn: "2026-11-13",
    quote: "Propera representació 21 de desembre de 2026 a les 18 h … NO CAL INSCRIPCIÓ PREVIA · L'ENTRADA ÉS LLIURE",
  },
  {
    name: "Pessebre Vivent de Sant Fost de Campsentelles",
    place: "Sant Fost de Campsentelles (Vallès Oriental)",
    dates: {
      ca: "13, 19, 20, 25, 26 i 27 de desembre de 2026 i 1, 3, 6 i 10 de gener de 2027; uns 60 minuts; entrades només per internet (adults, 10 €; de 6 a 12 anys, 4 €; Carnet Jove, 6 €; menors de 6, gratis)",
      es: "13, 19, 20, 25, 26 y 27 de diciembre de 2026 y 1, 3, 6 y 10 de enero de 2027; unos 60 minutos; entradas solo por internet (adultos, 10 €; de 6 a 12 años, 4 €; Carnet Jove, 6 €; menores de 6, gratis)",
      en: "13, 19, 20, 25, 26 and 27 December 2026 and 1, 3, 6 and 10 January 2027; about 60 minutes; tickets online only (adults €10; ages 6 to 12, €4; Carnet Jove €6; under-6s free)",
    },
    url: "https://www.pessebreviventsantfost.cat/",
    label: "pessebreviventsantfost.cat",
    publisher: "Pessebre Vivent de Sant Fost de Campsentelles",
    readOn: "2026-11-13",
    quote: "13, 19, 20, 25, 26 i 27 DE DESEMBRE '26 · 1, 3, 6 i 10 DE GENER '27 … El preu de l'entrada per adults és de 10€. Nens entre 6 i 12 anys paguen 4 €",
  },
  {
    name: "Pessebre dels Estels",
    place: "Masia de Castelló, Vandellòs i l'Hospitalet de l'Infant (Baix Camp)",
    dates: {
      ca: "5, 6, 12 i 13 de desembre de 2026, des de les 16.30 h, amb entrada per franges de mitja hora; entrades per internet (15 €; de 4 a 9 anys, 10 €)",
      es: "5, 6, 12 y 13 de diciembre de 2026, desde las 16.30 h, con entrada por franjas de media hora; entradas por internet (15 €; de 4 a 9 años, 10 €)",
      en: "5, 6, 12 and 13 December 2026, from 16:30, entry in half-hour slots; tickets online (€15; ages 4 to 9, €10)",
    },
    url: "https://www.masiacastello.cat/entrades-del-pessebre/",
    label: "masiacastello.cat",
    publisher: "Masia de Castelló",
    readOn: "2026-11-13",
    quote: "Pessebre dels Estels 2026 … Entrades per al 5 de desembre · 6 · 12 · 13 de desembre … General: 10 anys i endavant (15€) · Infantil: de 4 a 9 anys (10€); l'accés és a partir de les 16.30 h",
  },
  {
    name: "El Pessebre de Bàscara",
    place: "Bàscara (Alt Empordà)",
    dates: {
      ca: "20, 25, 26 i 27 de desembre de 2026 i 1, 2 i 3 de gener de 2027, a les 19 h; entrades per internet i a taquilla (des de 30 minuts abans)",
      es: "20, 25, 26 y 27 de diciembre de 2026 y 1, 2 y 3 de enero de 2027, a las 19 h; entradas por internet y en taquilla (desde 30 minutos antes)",
      en: "20, 25, 26 and 27 December 2026 and 1, 2 and 3 January 2027, at 19:00; tickets online and at the box office (from 30 minutes before)",
    },
    // The organiser's own site, which the council's page links to.
    url: "https://www.elpessebre.cat/",
    label: "elpessebre.cat",
    publisher: "El Pessebre de Bàscara",
    readOn: "2026-11-13",
    quote: "Nadal 2026–2027 · Venda d'entrades · 20, 25, 26 i 27 de desembre de 2026 · 1, 2 i 3 de gener de 2027 · Totes les representacions a les 19 h (7 del vespre) … TAQUILLA: des de 30 minuts abans",
  },
  {
    name: "55è Pessebre Vivent dels Prats de Rei",
    place: "els Prats de Rei (Anoia)",
    dates: {
      ca: "20, 26 i 27 de desembre de 2026 i 1, 3 i 6 de gener de 2027, a les 18.30 h",
      es: "20, 26 y 27 de diciembre de 2026 y 1, 3 y 6 de enero de 2027, a las 18.30 h",
      en: "20, 26 and 27 December 2026 and 1, 3 and 6 January 2027, at 18:30",
    },
    url: "https://www.acrsigarra.cat/pessebreprats/?page_id=69",
    label: "acrsigarra.cat",
    publisher: "Agrupació Cultural i Recreativa Sigarra",
    readOn: "2026-11-13",
    // The Generalitat's cultural agenda (2026111000027) gives 21 Dec as the
    // first day; the organiser's page says 20 Dec. The organiser's is
    // printed, and the table note says the agenda differs.
    quote: "REPRESENTACIONS 20, 26 i 27 de desembre de 2026 · 1,3 i 6 de gener de 2027 · A 2/4 de 7 de la tarda",
  },
  {
    name: "43è Pessebre Vivent de Peralada",
    place: "Peralada (Alt Empordà)",
    dates: {
      ca: "25, 26 i 27 de desembre de 2026 i 1, 2 i 3 de gener de 2027, a les 18.30 h, al casc històric; venda anticipada (6 €; de 4 a 13 anys, 3 €)",
      es: "25, 26 y 27 de diciembre de 2026 y 1, 2 y 3 de enero de 2027, a las 18.30 h, en el casco histórico; venta anticipada (6 €; de 4 a 13 años, 3 €)",
      en: "25, 26 and 27 December 2026 and 1, 2 and 3 January 2027, at 18:30, in the old town; advance tickets (€6; ages 4 to 13, €3)",
    },
    url: "https://www.visitperalada.cat/ca/agenda/pessebre-vivent/",
    label: "visitperalada.cat",
    publisher: "Ajuntament de Peralada",
    readOn: "2026-11-13",
    quote: "El Pessebre Vivent de Peralada arriba a la seva 43a edició … Venda anticipada d'entrades · 25 de desembre de 2026 · A les 18:30 · Casc Històric de Peralada · 6€ / 3€ de 4 a 13 anys",
  },
  {
    name: "Pessebre Vivent de la Vila de Rupit",
    place: "Rupit i Pruit (Osona)",
    dates: null,
    url: "https://www.rupitpruit.cat/pessebre-vivent",
    label: "rupitpruit.cat",
    publisher: "Ajuntament de Rupit i Pruit",
    readOn: "2026-11-13",
    quote: "NOVES DATES: 3 i 4 DE GENER DE 2026 … Darrera actualització: 27.12.2025",
    recheck: true,
  },
];

/** The re-read guard on `recheck` entries runs until this day (the first big weekend of the season). */
export const KNOWN_SEASON_STARTS = "2026-12-19";
/** Last performance in the table (Tona, Sant Guim, Sant Fost: 10 Jan 2027); the page needs its after-season pass after it. */
export const KNOWN_SEASON_ENDS = "2027-01-10";

export const PENDING: Record<Locale, string> = {
  ca: "2026 no confirmat: el web encara mostra la temporada 2025-26",
  es: "2026 no confirmado: la web aún muestra la temporada 2025-26",
  en: "2026 not confirmed: the website still shows 2025-26",
};

function knownTable(locale: Locale): Block {
  const caption: Record<Locale, string> = {
    ca: "Pessebres vivents coneguts i les seves dates de la temporada 2026-27",
    es: "Belenes vivientes conocidos y sus fechas de la temporada 2026-27",
    en: "Well-known living nativity scenes and their 2026-27 dates",
  };
  const headers: Record<Locale, string[]> = {
    ca: ["Pessebre vivent", "On", "Temporada 2026-27", "Web oficial"],
    es: ["Belén viviente", "Dónde", "Temporada 2026-27", "Web oficial"],
    en: ["Living nativity", "Where", "2026-27 season", "Official website"],
  };
  const note: Record<Locale, string> = {
    ca: `Dates, horaris i preus del web oficial de cada organitzador o ajuntament, comprovats el ${CHECKED_ON.ca}. «2026 no confirmat» vol dir que encara no han publicat la temporada 2026-27: no hi posem les dates de l'any passat. Als Prats de Rei, l'Agenda Cultural de la Generalitat dona el 21 de desembre com a primer dia; posem el 20, que és el que diu el web de l'organització.`,
    es: `Fechas, horarios y precios de la web oficial de cada organizador o ayuntamiento, comprobados el ${CHECKED_ON.es}. «2026 no confirmado» significa que aún no han publicado la temporada 2026-27: no ponemos las fechas del año pasado. En els Prats de Rei, la Agenda Cultural de la Generalitat da el 21 de diciembre como primer día; ponemos el 20, que es lo que dice la web de la organización.`,
    en: `Dates, times and prices from each organiser's or town council's official website, checked on ${CHECKED_ON.en}. "2026 not confirmed" means the 2026-27 season is not out yet: we do not repeat last year's dates. For els Prats de Rei, the Generalitat's cultural agenda gives 21 December as the first day; we give 20 December, as the organiser's own website does.`,
  };
  const rows = KNOWN.map((item) => [item.name, item.place, item.dates?.[locale] ?? PENDING[locale], `[${item.label}](${item.url})`]);
  return table(caption[locale], headers[locale], rows, note[locale]);
}

for (const item of KNOWN) {
  SOURCES.push({ name: item.name, url: item.url, publisher: item.publisher });
}

const META: Record<Locale, { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    path: "tradicions/pessebres-vivents-catalunya",
    title: "Pessebres vivents 2026 a Catalunya: calendari, dates i on veure'ls",
    seoTitle: "Pessebres vivents 2026 a Catalunya: calendari i dates",
    seoDescription:
      "Pessebres vivents 2026-27 amb data oficial: Corbera (des del 28 de novembre), Tona, les Torres de Fals, l'Espluga, la Torre del Suro… i el calendari diari.",
    excerpt:
      "Els pessebres vivents d'aquest Nadal a Catalunya, llegits cada dia de l'agenda oficial: on es fan, quins dies i com saber si cal comprar entrada.",
  },
  es: {
    path: "tradiciones/belenes-vivientes-cataluna",
    title: "Belenes vivientes en Cataluña 2026: calendario, fechas y dónde verlos",
    seoTitle: "Belenes vivientes Cataluña 2026: calendario y fechas",
    seoDescription:
      "Belenes vivientes en Cataluña 2026-27 con fecha oficial: Corbera (desde el 28 de noviembre), Tona, les Torres de Fals, l'Espluga… y el calendario diario.",
    excerpt:
      "Los belenes vivientes de esta Navidad en Cataluña, leídos cada día de la agenda oficial: dónde son, qué días y cómo saber si hace falta entrada.",
  },
  en: {
    path: "traditions/living-nativity-scenes-catalonia",
    title: "Living nativity scenes in Catalonia 2026: calendar and where to see them",
    seoTitle: "Living nativity scenes in Catalonia 2026 (near Barcelona)",
    seoDescription:
      "Living nativity scenes in Catalonia 2026-27 with official dates: Corbera from 28 November, Tona, Barcelona's Torre del Suro on 21 December, and more.",
    excerpt:
      "This Christmas's living nativity scenes in Catalonia, read daily from the official agenda: where they are, which days, and whether you need a ticket.",
  },
};

const LIVE: Block = { type: "livingNativities" } as Block;

function body(locale: Locale): Block[] {
  if (locale === "ca") {
    return [
      lead(
        "**Els pessebres vivents 2026 a Catalunya comencen el 28 de novembre a Corbera de Llobregat; el Pessebre dels Estels (Vandellòs) es fa el 5, 6, 12 i 13 de desembre, i la majoria, entre el 19 de desembre i el 10 de gener.** Ja tenen dies oficials, i molts també horari i preu, Tona, les Torres de Fals, Sant Guim de la Plana, les Gunyoles, l'Espluga de Francolí, Bàscara, els Prats de Rei, Peralada, Sant Fost de Campsentelles i la Torre del Suro, a Barcelona (21 de desembre, gratuït): són a la taula de més avall, comprovats el 13 de novembre al web de cada organitzador. El calendari d'aquí sota afegeix cada pessebre vivent quan l'organitzador el publica a l'Agenda Cultural de la Generalitat, que es llegeix cada dia: només hi surten els que encara no han acabat, amb poble, comarca, dates i l'enllaç a la fitxa oficial.",
      ),
      LIVE,
      callout(
        "info",
        "Com es fa aquesta llista",
        "Hi surten les activitats que el seu organitzador ha publicat a l'Agenda Cultural amb «pessebre vivent» al nom, i mai les que ja han acabat. Les mostres i exposicions de pessebres hi surten a part. Si en busques un que no hi és, pot ser que encara no s'hagi publicat o que l'organitzador no l'hagi donat d'alta a l'agenda: mira el web de l'ajuntament del poble.",
      ),
      ...h2(
        "Què és un pessebre vivent",
        "Un pessebre vivent és un pessebre fet amb persones en lloc de figures. La gent del poble fa de Maria i Josep, de pastors, de Reis i, sovint, dels oficis de sempre, i normalment el visitant no s'asseu a mirar una obra, sinó que recorre a peu carrers, places, masies o boscos on cada escena està parada.",
        "N'hi ha de molts tipus, i el nom que els posa l'organitzador ja ho diu: el de les Gunyoles és un «pessebre vivent parlat», amb diàlegs, i el de Sant Guim de la Plana, el «pessebre vivent dels oficis perduts». No s'han de confondre amb les **mostres de pessebres**, que exposen pessebres i diorames fets amb figures, ni amb **els Pastorets**, que són una obra de teatre.",
      ),
      ...h2(
        "Quan es fan els pessebres vivents 2026",
        "Cada organitzador tria els seus dies i els publica a l'agenda quan els té: la temporada passada, el primer hi va aparèixer el 19 de novembre, la meitat hi eren a finals de novembre i 41 dels 44 abans del 15 de desembre. Aquesta temporada, el 13 de novembre ja n'hi havia nou, i la llista anirà creixent fins a mitjan desembre.",
        "Com a referència, la temporada 2025-26 l'Agenda Cultural en va recollir **44, en 22 comarques**. El primer va obrir el 29 de novembre de 2025 i l'últim va tancar l'11 de gener de 2026; 36 van començar el 20 de desembre o més tard, i 40 havien acabat per Reis. Les dates de cada un són el primer i l'últim dia: dins d'aquest interval, molts només es representen alguns dies.",
        "L'agenda no els recull tots: per a la mateixa temporada, la Federació de Pessebres Vivents de Catalunya, que agrupa els organitzadors, va anunciar més de 300 representacions en 51 municipis, entre el 6 de desembre i l'11 de gener.",
        "La temporada passada, 32 dels 44 van començar en dissabte o diumenge, i les representacions es concentraven en caps de setmana i festius. A tot Catalunya són festius el **dimarts 8**, el **divendres 25** i el **dissabte 26 de desembre de 2026** (a l'Aran, el 26 no ho és), i l'**1 de gener** (divendres) i el **6 de gener de 2027** (dimecres), segons el calendari oficial de la Generalitat.",
      ),
      ...h2(
        "Els pessebres vivents més coneguts: dates 2026-27",
        "Aquests són alguns dels pessebres vivents més coneguts de Catalunya. Les dates surten del web de cada organitzador o ajuntament, i només hi són quan ja han publicat les d'aquesta temporada; quan les donin d'alta a l'agenda, també sortiran al calendari de dalt.",
      ),
      knownTable("ca"),
      ...paras(
        "Alguns tenen molta història. Segons els seus organitzadors, el de **Corbera de Llobregat** va fer la primera representació la nit del 24 de desembre de 1962 i es presenta com «el primer Pessebre Vivent de Catalunya»; el de l'**Espluga de Francolí** es fa des del 1964, i el de **Tona** va néixer el 1972. El de **Bàscara**, segons l'Ajuntament, es representa des del Nadal de 1973 al nucli antic i a la riba del Fluvià. A **Barcelona**, el de la Torre del Suro, al Guinardó, arriba a la 33a edició.",
      ),
      ...h2(
        "Cal entrada per veure un pessebre vivent?",
        "Gairebé sempre. Dels 44 pessebres vivents de la temporada 2025-26 a l'agenda, només 3 eren gratuïts (Celrà, la Seu d'Urgell i Fornells de la Selva) i 3 més demanaven un donatiu; la resta cobraven entrada, i 22 tenien un enllaç de venda d'entrades a la fitxa.",
        "Cada organitzador ho fa a la seva manera. Aquesta temporada, Corbera de Llobregat, Sant Guim de la Plana i Sant Fost de Campsentelles venen les entrades només per internet; l'Espluga de Francolí, només anticipades i a partir del 22 de novembre; Tona, només a taquilla; Bàscara, per internet i a taquilla, i el de la Torre del Suro, a Barcelona, és d'entrada lliure.",
        "Els preus d'aquesta temporada que ja han publicat, per a un adult: **17 € a Corbera**, 15 € a les Torres de Fals i al Pessebre dels Estels, 10 € a Tona i a Sant Fost, i 6 € a Peralada; la mainada i els majors de 65 paguen menys, i els més petits hi entren gratis (cada web en diu l'edat). Les condicions completes són al web de cada un: mira-ho abans d'anar-hi.",
        "La temporada passada, gairebé tots es feien a la tarda o al vespre, molts per passis amb hora fixa. Si vas amb canalla o amb cotxet, pregunta quant dura el recorregut i si és accessible: el de Sant Guim de la Plana, per exemple, avisa que no ho és ni amb cadira de rodes ni amb cotxet.",
      ),
      ...h2(
        "Com combinar-ho amb altres plans de Nadal",
        `Si vols combinar-ho amb una fira, mira [les fires de Nadal 2026 poble per poble](${fairsHubPath("ca")}) i ${b2link("christmas", "ca", "els mercats i fires de Nadal de Catalunya")}, amb Santa Llúcia. Si vols aprofitar per comprar, ${b2link("shops", "ca", "quins diumenges i festius obren les botigues")}; per als ponts, ${b2link("workCalendar", "ca", "el calendari de festius")}, i per a la resta de plans del cap de setmana, [l'agenda d'aquest cap de setmana](/ca/${WEEKEND.ca.path}/).`,
        `Si ets a Barcelona, tot el mes dia a dia és a ${b2link("barcelonaDecember", "ca", "Barcelona al desembre del 2026")}, i el pessebre de la plaça de Sant Jaume i els llums, a ${b2link("christmasBarcelona", "ca", "Nadal a Barcelona")}. El tió, el caganer i com es fa el pessebre a casa, a ${b2link("christmasTraditions", "ca", "les tradicions de Nadal a Catalunya")}, i per tancar les festes, ${b2link("reis", "ca", "la Cavalcada de Reis 2027")}.`,
      ),
      faq([
        {
          question: "Quan són els pessebres vivents 2026?",
          answer:
            "Cada organitzador fixa els seus dies i els publica a l'Agenda Cultural de la Generalitat, la temporada passada entre el 19 de novembre i mitjan desembre. El calendari d'aquesta pàgina els afegeix a mesura que surten. La temporada 2025-26, la majoria es van fer entre el 20 de desembre i Reis.",
        },
        {
          question: "Quin és el primer pessebre vivent del 2026?",
          answer:
            "El de Corbera de Llobregat, que comença el 28 de novembre de 2026. El segueix el Pessebre dels Estels de la Masia de Castelló, a Vandellòs, el 5, 6, 12 i 13 de desembre, amb entrades per internet. Tots dos ho diuen al seu web.",
        },
        {
          question: "Cal pagar per veure un pessebre vivent?",
          answer:
            "Normalment sí. Aquesta temporada, l'entrada d'adult va dels 6 € de Peralada als 17 € de Corbera de Llobregat, i el de la Torre del Suro, a Barcelona, és gratuït. La temporada 2025-26 només 3 dels 44 de l'agenda eren gratuïts i 3 més anaven amb donatiu. El preu i on comprar l'entrada són a la fitxa de cada un.",
        },
        {
          question: "Hi ha pessebre vivent a Barcelona?",
          answer:
            "Sí. El 33è Pessebre Vivent de la Torre del Suro, al Guinardó, es fa el 21 de desembre de 2026 a les 18 h, amb entrada lliure i sense inscripció, segons el seu web.",
        },
        {
          question: "On hi ha pessebres vivents a prop de Barcelona?",
          answer:
            "Aquesta temporada ja tenen dates el de Corbera de Llobregat (Baix Llobregat), des del 28 de novembre, i el de Sant Fost de Campsentelles (Vallès Oriental), del 13 de desembre al 10 de gener. La temporada passada n'hi va haver, entre d'altres, al Baix Llobregat (Corbera de Llobregat, Viladecans, Sant Feliu de Llobregat), al Vallès Oriental, al Vallès Occidental, al Maresme (Premià de Dalt) i al Garraf (Canyelles, Sant Pere de Ribes). El calendari de dalt els agrupa per comarques.",
        },
        {
          question: "Quin és el pessebre vivent més antic de Catalunya?",
          answer:
            "El de Corbera de Llobregat es presenta com el primer pessebre vivent de Catalunya: segons els seus organitzadors, la primera representació va ser la nit del 24 de desembre de 1962. El de l'Espluga de Francolí es fa des del 1964.",
        },
        {
          question: "Quina diferència hi ha entre un pessebre vivent i una mostra de pessebres?",
          answer:
            "En un pessebre vivent les escenes les fan persones; en una mostra o exposició s'hi veuen pessebres i diorames fets amb figures. A la llista surten per separat.",
        },
      ]),
      ...paras(verifiedLine("ca", VERIFIED)),
      ...b2Related(["christmas", "shops", "workCalendar", "climate", "barcelonaHub"], "ca"),
    ];
  }

  if (locale === "es") {
    return [
      lead(
        "**Los belenes vivientes 2026 en Cataluña («pessebres vivents») empiezan el 28 de noviembre en Corbera de Llobregat; el Pessebre dels Estels (Vandellòs) es el 5, 6, 12 y 13 de diciembre, y la mayoría, entre el 19 de diciembre y el 10 de enero.** Ya tienen días oficiales, y muchos también horario y precio, Tona, les Torres de Fals, Sant Guim de la Plana, les Gunyoles, l'Espluga de Francolí, Bàscara, els Prats de Rei, Peralada, Sant Fost de Campsentelles y la Torre del Suro, en Barcelona (21 de diciembre, gratis): están en la tabla de más abajo, comprobados el 13 de noviembre en la web de cada organizador. El calendario de abajo añade cada belén viviente cuando el organizador lo publica en la Agenda Cultural de la Generalitat, que se lee cada día: solo salen los que aún no han terminado, con pueblo, comarca, fechas y el enlace a la ficha oficial.",
      ),
      LIVE,
      callout(
        "info",
        "Cómo se hace esta lista",
        "Aparecen las actividades que su organizador ha publicado en la Agenda Cultural con «pessebre vivent» en el nombre, y nunca las que ya han terminado. Las muestras y exposiciones de belenes salen aparte. Si buscas uno que no está, puede que aún no se haya publicado o que el organizador no lo haya dado de alta en la agenda: mira la web del ayuntamiento del pueblo.",
      ),
      ...h2(
        "Qué es un belén viviente",
        "Un belén viviente es un belén hecho con personas en lugar de figuras. La gente del pueblo hace de María y José, de pastores, de Reyes y, a menudo, de los oficios de siempre, y normalmente el visitante no se sienta a ver una función, sino que recorre a pie calles, plazas, masías o bosques donde cada escena está montada.",
        "Los hay de muchos tipos, y el nombre que les pone el organizador ya lo dice: el de les Gunyoles es un «pessebre vivent parlat», con diálogos, y el de Sant Guim de la Plana, el de los oficios perdidos («dels oficis perduts»). No hay que confundirlos con las **muestras de belenes**, que exponen belenes y dioramas hechos con figuras, ni con **els Pastorets**, que son una obra de teatro.",
      ),
      ...h2(
        "Cuándo son los belenes vivientes 2026",
        "Cada organizador elige sus días y los publica en la agenda cuando los tiene: la temporada pasada, el primero apareció el 19 de noviembre, la mitad estaban a finales de noviembre y 41 de los 44 antes del 15 de diciembre. Esta temporada, el 13 de noviembre ya había nueve, y la lista irá creciendo hasta mediados de diciembre.",
        "Como referencia, en la temporada 2025-26 la Agenda Cultural recogió **44, en 22 comarcas**. El primero abrió el 29 de noviembre de 2025 y el último cerró el 11 de enero de 2026; 36 empezaron el 20 de diciembre o más tarde, y 40 habían terminado por Reyes. Las fechas de cada uno son el primer y el último día: dentro de ese intervalo, muchos solo se representan algunos días.",
        "La agenda no los recoge todos: para la misma temporada, la Federació de Pessebres Vivents de Catalunya, que agrupa a los organizadores, anunció más de 300 representaciones en 51 municipios, entre el 6 de diciembre y el 11 de enero.",
        "La temporada pasada, 32 de los 44 empezaron en sábado o domingo, y las representaciones se concentraban en fines de semana y festivos. En toda Cataluña son festivos el **martes 8**, el **viernes 25** y el **sábado 26 de diciembre de 2026** (en Arán, el 26 no lo es), y el **1 de enero** (viernes) y el **6 de enero de 2027** (miércoles), según el calendario oficial de la Generalitat.",
      ),
      ...h2(
        "Los belenes vivientes más conocidos: fechas 2026-27",
        "Estos son algunos de los belenes vivientes más conocidos de Cataluña. Las fechas salen de la web de cada organizador o ayuntamiento, y solo aparecen cuando ya han publicado las de esta temporada; cuando los den de alta en la agenda, también saldrán en el calendario de arriba. Los nombres van en catalán, como los escribe cada organizador.",
      ),
      knownTable("es"),
      ...paras(
        "Algunos tienen mucha historia. Según sus organizadores, el de **Corbera de Llobregat** hizo su primera representación la noche del 24 de diciembre de 1962 y se presenta como «el primer Pessebre Vivent de Catalunya»; el de **l'Espluga de Francolí** se hace desde 1964, y el de **Tona** nació en 1972. El de **Bàscara**, según su ayuntamiento, se representa desde la Navidad de 1973 en el casco antiguo y a orillas del Fluvià. En **Barcelona**, el de la Torre del Suro, en el Guinardó, llega a su 33.ª edición.",
      ),
      ...h2(
        "¿Hace falta entrada para ver un belén viviente?",
        "Casi siempre. De los 44 belenes vivientes de la temporada 2025-26 en la agenda, solo 3 eran gratuitos (Celrà, la Seu d'Urgell y Fornells de la Selva) y otros 3 pedían un donativo; el resto cobraban entrada, y 22 tenían un enlace de venta de entradas en la ficha.",
        "Cada organizador lo hace a su manera. Esta temporada, Corbera de Llobregat, Sant Guim de la Plana y Sant Fost de Campsentelles venden las entradas solo por internet; l'Espluga de Francolí, solo anticipadas y a partir del 22 de noviembre; Tona, solo en taquilla; Bàscara, por internet y en taquilla, y el de la Torre del Suro, en Barcelona, es de entrada libre.",
        "Los precios de esta temporada que ya han publicado, para un adulto: **17 € en Corbera**, 15 € en les Torres de Fals y en el Pessebre dels Estels, 10 € en Tona y en Sant Fost, y 6 € en Peralada; los niños y los mayores de 65 pagan menos, y los más pequeños entran gratis (cada web dice la edad). Las condiciones completas están en la web de cada uno: míralo antes de ir.",
        "La temporada pasada, casi todos se hacían por la tarde o al anochecer, muchos en pases con hora fija. Si vas con niños o con carrito, pregunta cuánto dura el recorrido y si es accesible: el de Sant Guim de la Plana, por ejemplo, avisa de que no lo es ni en silla de ruedas ni con carrito.",
      ),
      ...h2(
        "Cómo combinarlo con otros planes de Navidad",
        `Si quieres combinarlo con una feria, mira [los mercados de Navidad 2026 pueblo a pueblo](${fairsHubPath("es")}) y ${b2link("christmas", "es", "los mercados y ferias de Navidad de Cataluña")}, con Santa Llúcia. Si quieres aprovechar para comprar, ${b2link("shops", "es", "qué domingos y festivos abren las tiendas")}; para los puentes, ${b2link("workCalendar", "es", "el calendario de festivos")}, y para el resto de planes, [la agenda de este fin de semana](/es/${WEEKEND.es.path}/).`,
        `Si estás en Barcelona, todo el mes día a día está en ${b2link("barcelonaDecember", "es", "Barcelona en diciembre de 2026")}, y el belén de la plaza de Sant Jaume y las luces, en ${b2link("christmasBarcelona", "es", "Navidad en Barcelona")}. El tió, el caganer y cómo se monta el belén en casa, en ${b2link("christmasTraditions", "es", "las tradiciones de Navidad en Cataluña")}, y para cerrar las fiestas, ${b2link("reis", "es", "la Cabalgata de Reyes 2027")}.`,
      ),
      faq([
        {
          question: "¿Cuándo son los belenes vivientes 2026 en Cataluña?",
          answer:
            "Cada organizador fija sus días y los publica en la Agenda Cultural de la Generalitat, la temporada pasada entre el 19 de noviembre y mediados de diciembre. El calendario de esta página los añade a medida que salen. En la temporada 2025-26, la mayoría se hicieron entre el 20 de diciembre y Reyes.",
        },
        {
          question: "¿Cuál es el primer belén viviente de 2026?",
          answer:
            "El de Corbera de Llobregat, que empieza el 28 de noviembre de 2026. Le sigue el Pessebre dels Estels de la Masia de Castelló, en Vandellòs, el 5, 6, 12 y 13 de diciembre, con entradas por internet. Los dos lo indican en su web.",
        },
        {
          question: "¿Hay que pagar para ver un belén viviente?",
          answer:
            "Normalmente sí. Esta temporada, la entrada de adulto va de los 6 € de Peralada a los 17 € de Corbera de Llobregat, y el de la Torre del Suro, en Barcelona, es gratuito. En la temporada 2025-26 solo 3 de los 44 de la agenda eran gratuitos y otros 3 iban con donativo. El precio y dónde comprar la entrada están en la ficha de cada uno.",
        },
        {
          question: "¿Hay belén viviente en Barcelona?",
          answer:
            "Sí. El 33.º Pessebre Vivent de la Torre del Suro, en el Guinardó, se hace el 21 de diciembre de 2026 a las 18 h, con entrada libre y sin inscripción, según su web.",
        },
        {
          question: "¿Dónde hay belenes vivientes cerca de Barcelona?",
          answer:
            "Esta temporada ya tienen fechas el de Corbera de Llobregat (Baix Llobregat), desde el 28 de noviembre, y el de Sant Fost de Campsentelles (Vallès Oriental), del 13 de diciembre al 10 de enero. La temporada pasada los hubo, entre otros, en el Baix Llobregat (Corbera de Llobregat, Viladecans, Sant Feliu de Llobregat), el Vallès Oriental, el Vallès Occidental, el Maresme (Premià de Dalt) y el Garraf (Canyelles, Sant Pere de Ribes). El calendario de arriba los agrupa por comarcas.",
        },
        {
          question: "¿Cuál es el belén viviente más antiguo de Cataluña?",
          answer:
            "El de Corbera de Llobregat se presenta como el primer belén viviente de Cataluña: según sus organizadores, la primera representación fue la noche del 24 de diciembre de 1962. El de l'Espluga de Francolí se hace desde 1964.",
        },
        {
          question: "¿Qué diferencia hay entre un belén viviente y una muestra de belenes?",
          answer:
            "En un belén viviente las escenas las hacen personas; en una muestra o exposición se ven belenes y dioramas hechos con figuras. En la lista salen por separado.",
        },
      ]),
      ...paras(verifiedLine("es", VERIFIED)),
      ...b2Related(["christmas", "shops", "workCalendar", "climate", "barcelonaHub"], "es"),
    ];
  }

  return [
    lead(
      "**Catalonia's living nativity scenes (\"pessebres vivents\") for Christmas 2026 start on 28 November in Corbera de Llobregat; the Pessebre dels Estels (Vandellòs) is on 5, 6, 12 and 13 December, and most run between 19 December and 10 January.** Tona, les Torres de Fals, Sant Guim de la Plana, les Gunyoles, l'Espluga de Francolí, Bàscara, els Prats de Rei, Peralada, Sant Fost de Campsentelles and the Torre del Suro in Barcelona (21 December, free) have published their official days, most with times and prices: they are in the table further down, checked on 13 November on each organiser's website. The calendar below adds each living nativity as its organiser posts it in the Generalitat's cultural agenda, which is read every day: only those that have not finished are shown, with town, comarca (county), dates and a link to the official listing.",
    ),
    LIVE,
    callout(
      "info",
      "How this list is made",
      "It shows events whose organiser has posted them in the cultural agenda with \"pessebre vivent\" in the name, and never one that has already ended. Nativity exhibitions are listed separately. If one you are looking for is missing, it may not be posted yet, or the organiser may not use the agenda: check the town council's website.",
    ),
    ...h2(
      "What is a living nativity scene?",
      "A living nativity is a nativity scene made with people instead of figures. Villagers play Mary and Joseph, the shepherds, the Three Kings and, very often, the traditional trades, and usually you do not sit and watch a show: you walk a route through streets, squares, farmhouses or woods where each scene is set up.",
      "They come in many kinds, and the organiser's own name for it usually tells you which: les Gunyoles has a \"pessebre vivent parlat\", with spoken dialogue, and Sant Guim de la Plana one \"of the lost trades\". Do not confuse them with **nativity exhibitions** (\"mostres de pessebres\"), which show nativity scenes and dioramas made with figures, or with **els Pastorets**, a Christmas play.",
    ),
    ...h2(
      "When are the living nativity scenes in 2026?",
      "Each organiser picks its own days and posts them in the agenda when they are set: last season the first appeared on 19 November, half were listed by the end of November and 41 of the 44 before 15 December. This season nine were already listed on 13 November, and the list will keep growing until mid-December.",
      "For reference, in the 2025-26 season the cultural agenda listed **44, in 22 comarques**. The first opened on 29 November 2025 and the last closed on 11 January 2026; 36 started on 20 December or later, and 40 had finished by Epiphany. Each one's dates are its first and last day: in between, many are performed only on some days.",
      "The agenda does not list them all: for the same season, the Federació de Pessebres Vivents de Catalunya, the organisers' association, announced more than 300 performances in 51 towns between 6 December and 11 January.",
      "Last season, 32 of the 44 started on a Saturday or Sunday, and performances were concentrated on weekends and public holidays. Catalonia-wide public holidays are **Tuesday 8**, **Friday 25** and **Saturday 26 December 2026** (26 December is not a holiday in Aran), and **1 January** (Friday) and **6 January 2027** (Wednesday), according to the Generalitat's official calendar.",
    ),
    ...h2(
      "The best-known living nativity scenes: 2026-27 dates",
      "These are some of the best-known living nativities in Catalonia. Dates come from each organiser's or town council's website and are given only once they have published this season's; when they post them in the agenda, they will also appear in the calendar above. Names are in Catalan, as each organiser writes them.",
    ),
    knownTable("en"),
    ...paras(
      "Some go back a long way. According to its organisers, **Corbera de Llobregat** first performed on the night of 24 December 1962 and calls itself \"the first living nativity in Catalonia\"; **l'Espluga de Francolí** has held one since 1964, and **Tona**'s began in 1972. **Bàscara**'s, according to its town council, has been performed since Christmas 1973 in the old town and along the river Fluvià. In **Barcelona**, the Torre del Suro nativity in the Guinardó district reaches its 33rd edition.",
    ),
    ...h2(
      "Do you need a ticket for a living nativity?",
      "Almost always. Of the 44 living nativities in the agenda in 2025-26, only 3 were free (Celrà, la Seu d'Urgell and Fornells de la Selva) and 3 more asked for a donation; the rest charged for entry, and 22 had an online ticket link on their listing.",
      "Each organiser does it differently. This season Corbera de Llobregat, Sant Guim de la Plana and Sant Fost de Campsentelles sell tickets online only; l'Espluga de Francolí sells advance tickets only, from 22 November; Tona sells them only at the box office; Bàscara both online and at the box office; and the Torre del Suro nativity in Barcelona is free.",
      "This season's adult prices published so far: **€17 in Corbera**, €15 at les Torres de Fals and the Pessebre dels Estels, €10 in Tona and Sant Fost, and €6 in Peralada; children and over-65s pay less, and the youngest go free (each website gives the ages). Full conditions are on each website, so check before you go.",
      "Last season nearly all of them took place in the late afternoon or evening, many in timed sessions. If you are going with children or a pushchair, ask how long the route takes and whether it is accessible: Sant Guim de la Plana, for example, warns that its route is not suitable for wheelchairs or pushchairs.",
    ),
    ...h2(
      "Combining it with other Christmas plans",
      `To combine it with a fair, see [every Christmas market of 2026 by date and town](${fairsHubPath("en")}) and ${b2link("christmas", "en", "Christmas markets in Barcelona and Catalonia")}, with Santa Llúcia. If you want to shop too, see ${b2link("shops", "en", "which Sundays and holidays shops may open")}; for long weekends, ${b2link("workCalendar", "en", "the public holiday calendar")}; and for everything else, [things to do this weekend](/en/${WEEKEND.en.path}/).`,
      `In Barcelona, the whole month day by day is in ${b2link("barcelonaDecember", "en", "Barcelona in December 2026")}, and the Plaça de Sant Jaume nativity scene and the lights in ${b2link("christmasBarcelona", "en", "Christmas in Barcelona")}. The tió, the caganer and how Catalans build a nativity scene at home: ${b2link("christmasTraditions", "en", "Catalan Christmas traditions")}; and to close the season, ${b2link("reis", "en", "the 2027 Three Kings parade")}.`,
    ),
    faq([
      {
        question: "When are the living nativity scenes in Catalonia in 2026?",
        answer:
          "Each organiser sets its own days and posts them in the Generalitat's cultural agenda; last season that happened between 19 November and mid-December. The calendar on this page adds each one as it appears. In 2025-26 most ran between 20 December and 6 January.",
      },
      {
        question: "Which is the first living nativity of 2026?",
        answer:
          "Corbera de Llobregat's, which opens on 28 November 2026. Next comes the Pessebre dels Estels at the Masia de Castelló in Vandellòs, on 5, 6, 12 and 13 December, with tickets online. Both say so on their websites.",
      },
      {
        question: "Is there a living nativity scene in Barcelona?",
        answer:
          "Yes. The 33rd Torre del Suro living nativity, in the Guinardó district, is on 21 December 2026 at 18:00, free and with no booking needed, according to its website.",
      },
      {
        question: "Are there living nativity scenes near Barcelona?",
        answer:
          "This season Corbera de Llobregat (Baix Llobregat), from 28 November, and Sant Fost de Campsentelles (Vallès Oriental), from 13 December to 10 January, have already published their dates. Last season there were, among others, in the Baix Llobregat (Corbera de Llobregat, Viladecans, Sant Feliu de Llobregat), the Vallès Oriental, the Vallès Occidental, the Maresme (Premià de Dalt) and the Garraf (Canyelles, Sant Pere de Ribes). The calendar above groups them by comarca.",
      },
      {
        question: "What is the oldest living nativity in Catalonia?",
        answer:
          "Corbera de Llobregat's calls itself the first in Catalonia: according to its organisers, it was first performed on the night of 24 December 1962. L'Espluga de Francolí has held one since 1964.",
      },
      {
        question: "Do living nativity scenes cost money?",
        answer:
          "Usually, yes. This season adult tickets range from €6 in Peralada to €17 in Corbera de Llobregat, and the Torre del Suro nativity in Barcelona is free. In 2025-26 only 3 of the 44 in the agenda were free and 3 more asked for a donation. The price and where to buy a ticket are on each listing.",
      },
      {
        question: "What is the difference between a living nativity and a nativity exhibition?",
        answer:
          "In a living nativity the scenes are played by people; an exhibition (\"mostra\") shows nativity scenes and dioramas made with figures. The list shows them separately.",
      },
    ]),
    ...paras(verifiedLine("en", VERIFIED)),
    ...b2Related(["christmas", "shops", "workCalendar", "climate", "barcelonaHub"], "en"),
  ];
}

export const PESSEBRES: B2Article = {
  key: "pessebres",
  entryKey: "guide-living-nativity-scenes-catalonia",
  categoryKey: "festivals",
  sources: SOURCES,
  heroKey: CHRISTMAS.secondaryKey,
  heroAlt: CHRISTMAS.secondaryAlt,
  heroCaption: CHRISTMAS.secondaryCaption,
  verifiedAt: VERIFIED,
  publishedAt: "2026-10-25T09:00:00+02:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...META[locale], blocks: body(locale) }]),
  ) as B2Article["editions"],
};
