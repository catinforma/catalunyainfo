/**
 * What a council itself prints about its shop opening days, for the town pages
 * that quote it (25 Nov 2026, plan item 1: "el 8/12/2026 és d'obertura
 * autoritzada a Barcelona; a Badalona, el calendari propi i les excepcions").
 * No imports: read by the town copy and by tests.
 *
 * Read on 25 Nov 2026 with curl (a browser User-Agent is needed; the default
 * one gets a 403 from both sites), text extracted from the HTML:
 *
 * - Barcelona: https://guia.barcelona.cat/ca/detall/_99400749658.html, 15:38
 *   UTC (16:38 in Catalonia). Page "Calendari d'obertura de comerços en
 *   diumenges i dies festius 2026" (Guia Barcelona, Ajuntament de Barcelona),
 *   "Quan: Des de 01/01/2026 al 31/12/2026", Dies: "4 gener, 15 agost, 12
 *   octubre, 29 novembre, 6 desembre, 8 desembre, 13 desembre, 20 desembre i
 *   27 desembre", Hores: "En horari comercial", Observacions: "Dies de lliure
 *   obertura dins l'horari habitual a la ciutat de Barcelona". The same page
 *   gives the tourist zone: "Diumenge, Dilluns 25 de maig i dimecres de 24
 *   juny de 12.00 h a 20.00 h" between 15 May and 15 September. It lists no
 *   exception by type of shop.
 *   The DOGC text (Resolució EMT/4342/2025, DOGC 9551, 27.11.2025,
 *   documentId=1030324) was read in its PDF earlier on 25 Nov (see
 *   shops-towns-nov-dec.ts): Barcelona's own entry is "4 i 11 de gener. 15
 *   d'agost. 12 d'octubre. 29 de novembre. 6, 8, 13, 20 i 27 de desembre." The
 *   DOGC HTML page loads the text by script, so the PDF could not be fetched
 *   again at 16:38; the council's own page agrees with it for December.
 * - Badalona: https://www.badalona.cat/ca/serveis-ajuntament/activitat-economica/
 *   comerc-1/actualitzacio-de-la-normativa-dhoraris-comercials/calendari-
 *   dobertura-destabliments-comercials-en-diumenges-i-festius, 15:39 UTC
 *   (16:39 in Catalonia). Heading "Calendari d'obertura d'establiments
 *   comercials en diumenges i festius"; under "PER A L'ANY 2026": "Dies
 *   festius amb obertura comercial autoritzada a Badalona (2026): 4 de gener.
 *   15 d'agost. 12 d'octubre. 29 de novembre. 6, 13, 20 i 27 de desembre.
 *   L'Ajuntament de Badalona ha escollit, a petició de les associacions de
 *   comerciants i de les grans superfícies de la ciutat, els dos dies festius
 *   addicionals d'obertura comercial: 11 de gener i 10 de maig." The page
 *   names no exception by type of shop; its only pointer is "Per a una
 *   informació més acurada adreceu-vos al Departament d'empresa i coneixement
 *   – Direcció General de Comerç de la Generalitat de Catalunya." (It cites
 *   "l'ordre EMC/77/2025"; the DOGC calls it EMT/77/2025.) A block "PER A
 *   L'ANY 2027" also lists days for 2027 ("3 de gener. 27 de juny. 1 de
 *   novembre. 28 de novembre. 6, 8, 12 i 19 de desembre", council days 10 de
 *   gener and 16 de maig): not used here, the 2027 municipal lists are not
 *   in the DOGC.
 *
 * COUNCIL_CALENDARS_REREAD_BY: a test fails from the day after it.
 */

export const COUNCIL_CALENDARS_READ = { date: "2026-11-25", time: "16:40" } as const;
export const COUNCIL_CALENDARS_REREAD_BY = "2026-12-03";

export interface CouncilCalendar {
  slug: "barcelona" | "badalona";
  /** The page read, and what it is called there. */
  url: string;
  pageTitle: string;
  /** The council's own words, in Catalan, exactly as printed (quotes are never translated). */
  quotes: string[];
  /** The December 2026 days the council's text names, ISO. A test holds them to the town's snapshot days. */
  december2026: string[];
  /** Whether the council's text names an exception by type of shop. */
  typeExceptions: false;
}

export const COUNCIL_CALENDARS: Record<CouncilCalendar["slug"], CouncilCalendar> = {
  barcelona: {
    slug: "barcelona",
    url: "https://guia.barcelona.cat/ca/detall/_99400749658.html",
    pageTitle: "Calendari d'obertura de comerços en diumenges i dies festius 2026",
    quotes: [
      "4 gener, 15 agost, 12 octubre, 29 novembre, 6 desembre, 8 desembre, 13 desembre, 20 desembre i 27 desembre",
      "Dies de lliure obertura dins l'horari habitual a la ciutat de Barcelona",
    ],
    december2026: ["2026-12-06", "2026-12-08", "2026-12-13", "2026-12-20", "2026-12-27"],
    typeExceptions: false,
  },
  badalona: {
    slug: "badalona",
    url: "https://www.badalona.cat/ca/serveis-ajuntament/activitat-economica/comerc-1/actualitzacio-de-la-normativa-dhoraris-comercials/calendari-dobertura-destabliments-comercials-en-diumenges-i-festius",
    pageTitle: "Calendari d'obertura d'establiments comercials en diumenges i festius",
    quotes: ["Dies festius amb obertura comercial autoritzada a Badalona (2026): 4 de gener. 15 d'agost. 12 d'octubre. 29 de novembre. 6, 13, 20 i 27 de desembre."],
    december2026: ["2026-12-06", "2026-12-13", "2026-12-20", "2026-12-27"],
    typeExceptions: false,
  },
};

/** Barcelona's own entry in Resolució EMT/4342/2025 (DOGC 9551, 27.11.2025), as printed. */
export const BARCELONA_DOGC_ENTRY = "4 i 11 de gener. 15 d'agost. 12 d'octubre. 29 de novembre. 6, 8, 13, 20 i 27 de desembre.";
