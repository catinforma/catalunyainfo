import { SNAPSHOT } from "@/lib/programmatic/holidays/data";

/**
 * The open-data calendar (b4eh-r8up) rebuilt from the committed holiday
 * snapshot, served to LocalHolidays' fetch: the payload test renders the
 * full ~1,400-row table offline, with real names and dates.
 */
const rows = SNAPSHOT.municipalities.flatMap((m) => [
  ...m.local.map((date) => ({ data: `${date}T00:00:00.000`, ajuntament_o_nucli_municipal: m.dogcName, codi_municipal: `${m.ine}000`, pedania: "000", festiu: "Festa local" })),
  ...m.nuclei.flatMap((n, i) => {
    const code = String(i + 1).padStart(3, "0");
    return n.dates.map((date) => ({ data: `${date}T00:00:00.000`, ajuntament_o_nucli_municipal: n.name, codi_municipal: `${m.ine}${code}`, pedania: code, festiu: "Festa local" }));
  }),
]);

const realFetch = globalThis.fetch;
globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = String(input instanceof Request ? input.url : input);
  if (url.includes("b4eh-r8up")) return new Response(JSON.stringify(rows), { headers: { "content-type": "application/json" } });
  if (process.env.RSC_ALLOW_NETWORK) return realFetch(input, init);
  throw new Error(`no network in the payload test: ${url}`);
}) as typeof fetch;

export const LOCAL_HOLIDAY_ROWS = rows.length;
