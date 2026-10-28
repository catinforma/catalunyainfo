import type { ForecastText } from "./types";

/**
 * ============================================================================
 *  HOOK: official mountain forecast (AEMET OpenData). NOT BUILT YET.
 * ============================================================================
 *
 * The pages never write a forecast of their own. The only forecast they may
 * show is AEMET's text, relayed as published. On 28 Oct 2026 no AEMET key was
 * available to this project, so this returns null and the pages show
 * observations plus links to the official forecasts (Meteocat's ski and
 * Pyrenees forecasts, AEMET's "Predicción montaña. Pirineo Catalán").
 *
 * Verified on 28 Oct 2026:
 *  - Reuse terms: www.aemet.es/es/nota_legal (dated "Noviembre de 2016"):
 *    reuse allowed "para fines comerciales y no comerciales"; for information
 *    passed on unchanged, "Incluir el Copyright de AEMET (© AEMET) o en su
 *    lugar el texto: «Información elaborada por la Agencia Estatal de
 *    Meteorología»"; "Está prohibido desnaturalizar el sentido de la
 *    información"; keep the update date; do not imply AEMET endorses us.
 *  - The key is requested at opendata.aemet.es/centrodedescargas/inicio
 *    ("Obtención de API Key" -> "Solicitar").
 *  - Endpoint (AEMET_OpenData_specification.json):
 *      GET https://opendata.aemet.es/opendata/api/prediccion/especifica/montaña/pasada/area/cat1/dia/{0..3}
 *    "cat1" = Pirineo Catalán; dia 0 = today, 1 = tomorrow. The call answers
 *    with a `datos` URL that must be fetched in a second request.
 *    (The Montseny, Montsec and Ports pages are outside AEMET's mountain
 *    areas: for those, `prediccion/especifica/municipio/diaria/{INE code}`.)
 *
 * To turn it on (lead):
 *  1. Request the key; add it in Vercel as AEMET_API_KEY (Production only).
 *  2. Implement `loadForecast` below: when the key is set, fetch dia 0 for
 *     "cat1" with `cache: "no-store"` and a timeout, follow `datos`, and
 *     return { provider: "aemet", area: "cat1", text, issuedAt,
 *     attribution: "© AEMET" } with the text untouched; return null on any
 *     failure (the page then simply has no forecast block).
 *  3. Record a fixture of both AEMET answers and add a known-answer test.
 *  4. MountainLive already renders `payload.forecast` (text + attribution +
 *     link) when it is not null, and only for Pyrenean places.
 */
export const FORECAST_PROVIDER = "aemet" as const;
export const AEMET_MOUNTAIN_AREA = "cat1";
export const AEMET_REUSE_TERMS_URL = "https://www.aemet.es/es/nota_legal";

/** Not built: always null (see above). Kept async so the handler's shape does not change when it is. */
export async function loadForecast(): Promise<ForecastText | null> {
  return null;
}
