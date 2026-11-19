import { CSV_LICENCE, compareCsv } from "@/lib/programmatic/inheritance-compare/csv";
import { CSV_FILENAME, cmpPath } from "@/lib/programmatic/inheritance-compare/paths";
import { absoluteUrl } from "@/lib/site";

/**
 * /data/impuesto-sucesiones-por-comunidad-2026.csv — the comparison's
 * download (lib/programmatic/inheritance-compare/csv.ts): one row per
 * territory and item, with its status, article, law, date and the URL of the
 * text read, plus the worked example's figures.
 *
 * Built at deploy and kept until the next one (the data only change with a
 * deploy). The `Link` header names the Spanish page as the file's canonical
 * page (a CSV has no <head>) and its licence, CC BY 4.0.
 */
export const dynamic = "force-static";
export const revalidate = false;

export function GET() {
  return new Response(compareCsv(), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${CSV_FILENAME}"`,
      link: `<${absoluteUrl(cmpPath("es"))}>; rel="canonical", <${CSV_LICENCE}>; rel="license"`,
    },
  });
}
