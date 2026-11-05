/**
 * The legal blackout for electoral polls, 29 November 2026 general election.
 *
 * LOREG art. 69.7 (BOE consolidated text, read 5 Nov 2026): "Durante los
 * cinco días anteriores al de la votación queda prohibida la publicación y
 * difusión o reproducción de sondeos electorales por cualquier medio de
 * comunicación." The five days are Tuesday 24 to Saturday 28 November (JEC
 * and Interior calendars: "Prohibición de publicación, difusión o
 * reproducción de sondeos electorales: 24 a 28 de noviembre").
 *
 * The window then runs on through polling day until the LAST polling
 * stations close: the Canary Islands, 20:00 local = 21:00 Madrid. Junta
 * Electoral Central doctrine: estimates may be released "a partir de las 20
 * horas ... debiendo tenerse en cuenta la diferencia horaria con las Islas
 * Canarias donde el cierre de los colegios electorales se produce a las 21
 * horas (hora peninsular)" (Acuerdo 99/2005), and "no debe emitirse en el
 * ámbito de la Comunidad Autónoma de Canarias antes de las 21 horas, hora
 * peninsular" (Acuerdo 458/1999). A web page reaches the Canaries too, so the
 * stricter end applies (the brief said 20:00; logged in DECISION_LOG).
 *
 * The two instants are written with their UTC offset: Spain is on CET
 * (UTC+1) in November (summer time ended on 25 Oct 2026), so nothing here
 * depends on the server's time zone. A test checks both against
 * Intl.DateTimeFormat in Europe/Madrid.
 *
 * No poll figures in this file, on purpose: anything may import it.
 */

/** First instant at which no poll figure may be served: Tue 24 Nov 2026, 00:00 Madrid. */
export const BLACKOUT_START = new Date("2026-11-24T00:00:00+01:00");

/** First instant at which figures may be served again: Sun 29 Nov 2026, 21:00 Madrid (20:00 in the Canaries). */
export const BLACKOUT_END = new Date("2026-11-29T21:00:00+01:00");

/** True inside [BLACKOUT_START, BLACKOUT_END). Fails closed on an invalid date. */
export function isPollBlackout(now: Date): boolean {
  const t = now.getTime();
  if (Number.isNaN(t)) return true;
  return t >= BLACKOUT_START.getTime() && t < BLACKOUT_END.getTime();
}
