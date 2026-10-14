import { NextResponse } from "next/server";

import { isMunicipalityCode, loadMunicipalHistory } from "@/lib/content/elections/history";

export const runtime = "nodejs";

/**
 * Municipal election results for one municipality, for the lookup on the
 * municipal-results guide. Read-only and public: it only relays the
 * Generalitat's open data, cached for a day like the rest of the results.
 */
export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code") ?? "";
  if (!isMunicipalityCode(code)) return NextResponse.json({ error: "bad code" }, { status: 400 });

  const history = await loadMunicipalHistory(code);
  return NextResponse.json(history, {
    status: history.error ? 502 : 200,
    headers: history.error ? {} : { "cache-control": "public, s-maxage=86400, stale-while-revalidate=86400" },
  });
}
