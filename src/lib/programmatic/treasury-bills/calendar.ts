import type { Term } from "./results";

/**
 * The Letras del Tesoro auction calendar, typed in from the Tesoro Público's
 * official PDF "2026 Calendario de subastas de los valores del Tesoro"
 * (CALENDAR_2026_PDF, created 3 Dec 2025, read 13 Nov 2026; the monthly
 * tables "Subastas del Tesoro: Letras 6 y 12 / Letras 3 y 9"). The PDF
 * also carries January 2027. tests/treasury-bills.test.ts checks every row
 * against the PDF's text (tests/fixtures/tesoro-calendario-2026-letras.txt).
 *
 * Each row's four dates, as the PDF's footnotes define them:
 *  - requestsBy ("Peticiones**"): the last day for private investors with a
 *    Cuenta Directa at the Banco de España, before 14:00 (peninsular time);
 *  - auction ("Subastas"): market members bid from 8:30 to 10:00;
 *  - payBy ("Pago particulares***"): Cuenta Directa investors who requested
 *    at a Banco de España branch pay before 14:00;
 *  - issue ("Emisión"): the bills are issued (settlement date).
 *
 * The 2027 calendar: the Tesoro publishes it in December (2026's PDF is
 * dated 3 Dec 2025). Until it is typed in here, CALENDAR_2027 is null, the
 * page says so and links the Tesoro's calendar page, and the server looks for
 * the PDF link on tesoro.es (server.ts). A test fails from CALENDAR_2027_DUE.
 * Client-safe.
 */

export const CALENDAR_2026_PDF = "https://www.tesoro.es/documents/d/tesoro/calendario-tesoro-publico-2026-espanol-121";
export const CALENDAR_PAGE_URL = "https://www.tesoro.es/deuda-publica/subastas/calendario";
/** When the 2026 PDF was read and the rows typed in. */
export const CALENDAR_READ_ON = "2026-11-13";
/** From this day a test fails while CALENDAR_2027 is null: read the Tesoro's 2027 PDF and type its rows in. */
export const CALENDAR_2027_DUE = "2026-12-15";

export interface CalendarRow {
  terms: readonly [Term, Term];
  requestsBy: string;
  auction: string;
  payBy: string;
  issue: string;
}

export interface Calendar {
  year: number;
  pdf: string;
  /** Rows of this calendar, auction order (may run into the next January). */
  rows: readonly CalendarRow[];
}

const SIX_TWELVE: readonly [Term, Term] = [6, 12];
const THREE_NINE: readonly [Term, Term] = [3, 9];

/** dd/mm/yyyy as in the PDF → ISO. */
function d(s: string): string {
  const [dd, mm, yyyy] = s.split("/");
  return `${yyyy}-${mm}-${dd}`;
}

/** One month of the PDF: the "Letras 6 y 12" and "Letras 3 y 9" columns, dates as printed. */
function month(sixTwelve: [string, string, string, string], threeNine: [string, string, string, string]): CalendarRow[] {
  const row = (terms: readonly [Term, Term], [r, a, p, i]: [string, string, string, string]): CalendarRow => ({ terms, requestsBy: d(r), auction: d(a), payBy: d(p), issue: d(i) });
  return [row(SIX_TWELVE, sixTwelve), row(THREE_NINE, threeNine)];
}

export const CALENDAR_2026: Calendar = {
  year: 2026,
  pdf: CALENDAR_2026_PDF,
  rows: [
    ...month(["09/01/2026", "13/01/2026", "15/01/2026", "16/01/2026"], ["16/01/2026", "20/01/2026", "22/01/2026", "23/01/2026"]),
    ...month(["30/01/2026", "03/02/2026", "05/02/2026", "06/02/2026"], ["06/02/2026", "10/02/2026", "12/02/2026", "13/02/2026"]),
    ...month(["27/02/2026", "03/03/2026", "05/03/2026", "06/03/2026"], ["06/03/2026", "10/03/2026", "12/03/2026", "13/03/2026"]),
    ...month(["01/04/2026", "07/04/2026", "09/04/2026", "10/04/2026"], ["10/04/2026", "14/04/2026", "16/04/2026", "17/04/2026"]),
    ...month(["30/04/2026", "05/05/2026", "07/05/2026", "08/05/2026"], ["08/05/2026", "12/05/2026", "14/05/2026", "15/05/2026"]),
    ...month(["29/05/2026", "02/06/2026", "04/06/2026", "05/06/2026"], ["05/06/2026", "09/06/2026", "11/06/2026", "12/06/2026"]),
    ...month(["03/07/2026", "07/07/2026", "09/07/2026", "10/07/2026"], ["10/07/2026", "14/07/2026", "16/07/2026", "17/07/2026"]),
    ...month(["31/07/2026", "04/08/2026", "06/08/2026", "07/08/2026"], ["07/08/2026", "11/08/2026", "13/08/2026", "14/08/2026"]),
    ...month(["28/08/2026", "01/09/2026", "03/09/2026", "04/09/2026"], ["04/09/2026", "08/09/2026", "10/09/2026", "11/09/2026"]),
    ...month(["02/10/2026", "06/10/2026", "08/10/2026", "09/10/2026"], ["08/10/2026", "13/10/2026", "15/10/2026", "16/10/2026"]),
    ...month(["30/10/2026", "03/11/2026", "05/11/2026", "06/11/2026"], ["06/11/2026", "10/11/2026", "12/11/2026", "13/11/2026"]),
    ...month(["27/11/2026", "01/12/2026", "03/12/2026", "04/12/2026"], ["04/12/2026", "09/12/2026", "10/12/2026", "11/12/2026"]),
    // January 2027, printed in the 2026 PDF.
    ...month(["08/01/2027", "12/01/2027", "14/01/2027", "15/01/2027"], ["15/01/2027", "19/01/2027", "21/01/2027", "22/01/2027"]),
  ],
};

/** The 2027 calendar once the Tesoro publishes it (null until typed in from its PDF). */
export const CALENDAR_2027 = null as Calendar | null;

export const CALENDARS: readonly Calendar[] = [CALENDAR_2026, ...(CALENDAR_2027 ? [CALENDAR_2027] : [])];

/** Every known Letras auction, one row per auction day (two terms each), auction order, no duplicates. */
export function allRows(calendars: readonly Calendar[] = CALENDARS): CalendarRow[] {
  const byDay = new Map<string, CalendarRow>();
  for (const c of calendars) for (const r of c.rows) byDay.set(r.auction, r);
  return [...byDay.values()].sort((a, b) => (a.auction < b.auction ? -1 : 1));
}

/** Auctions still to come on `today` (an auction on `today` counts: results come out that morning). */
export function upcoming(today: string, calendars: readonly Calendar[] = CALENDARS): CalendarRow[] {
  return allRows(calendars).filter((r) => r.auction >= today);
}

/** The next auction of one term on or after `today`, or null past the last known calendar row. */
export function nextAuctionOf(term: Term, today: string, calendars: readonly Calendar[] = CALENDARS): CalendarRow | null {
  return upcoming(today, calendars).find((r) => r.terms.includes(term)) ?? null;
}

/** The newest auction of one term held on or before `day`. */
export function lastScheduledOf(term: Term, day: string, calendars: readonly Calendar[] = CALENDARS): CalendarRow | null {
  return (
    allRows(calendars)
      .filter((r) => r.terms.includes(term) && r.auction <= day)
      .at(-1) ?? null
  );
}

/** The last day any known calendar covers (its last auction). */
export function calendarEnd(calendars: readonly Calendar[] = CALENDARS): string {
  return allRows(calendars).at(-1)!.auction;
}

/** Whether requests for this row are still open on `today` (before 14:00 on requestsBy; the page cannot know the hour, so the day counts as open). */
export function requestsOpen(row: CalendarRow, today: string): boolean {
  return today <= row.requestsBy;
}
