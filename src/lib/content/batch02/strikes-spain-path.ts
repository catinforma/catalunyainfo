/**
 * The path of the Spain-wide strikes hub (`strikes-spain.ts`), in a module
 * with no imports, so that the Catalan strikes hub (`strikes.ts`) and the 11N
 * page (`strike-11n.ts`) can link to it without an import cycle: the hub
 * imports both of them.
 *
 * Spanish only, like the 11N city pages: the demand for Spain-wide strike
 * searches ("huelgas noviembre 2026", "próximas huelgas España") is in
 * Spanish, so there is no Catalan or English edition and nothing in a ca or en
 * page links here. No year or month in the path: the same URL serves every
 * strike, so it keeps its authority from one month to the next.
 */

/** Path after `/es/`, no leading or trailing slash. */
export const STRIKES_SPAIN_PATH = "guias/huelgas-espana";

/** "/es/guias/huelgas-espana/" */
export const STRIKES_SPAIN_HREF = `/es/${STRIKES_SPAIN_PATH}/`;

/** The anchor text other Spanish pages use for it. */
export const STRIKES_SPAIN_NAME = "calendario de huelgas en España";
