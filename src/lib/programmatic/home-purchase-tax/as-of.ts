/**
 * When the per-community tax laws were read, and when they must be read again.
 * Small on purpose: the calculators hub imports it without the data.
 *
 * COMMUNITIES_REREAD_BY: the January budget and fiscal-measures laws often
 * change the ITP and AJD rates from 1 January; tests/home-purchase-tax.test.ts
 * fails from this day until every community is re-read for 2027.
 */
export const COMMUNITIES_AS_OF = "2026-11-13";
export const COMMUNITIES_REREAD_BY = "2027-02-01";
