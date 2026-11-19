/**
 * SELAE's 2027 El Niño programme as the site uses it: programme-2027.json,
 * transcribed by a person from SELAE's PDF and validated on load
 * (programme.ts, programmeProblems). Server-side only, so the JSON never
 * lands in the browser bundle: the client checker gets the programme inside
 * /data/loteria-nino.json and re-validates it there.
 */

import programmeJson from "./programme-2027.json" with { type: "json" };
import { loadProgramme, type NinoProgramme } from "./programme";

/** SELAE's 2027 programme, once a person has read and transcribed it; null until then. */
export const PROGRAMME_2027: NinoProgramme | null = loadProgramme(programmeJson as unknown);
