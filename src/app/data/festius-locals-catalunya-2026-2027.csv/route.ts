import { CSV_FILENAME, reportCsv } from "@/lib/programmatic/holidays/report";
import { reportPath } from "@/lib/programmatic/holidays/report-copy";
import { absoluteUrl } from "@/lib/site";

/**
 * /data/festius-locals-catalunya-2026-2027.csv — the data report's download
 * (lib/programmatic/holidays/report.ts `reportCsv`): every local holiday of
 * the 2026 DOGC order and the 2027 days (the councils' approvals until the
 * order is parsed), one per row, with each row's official source.
 *
 * Built at deploy and kept until the next one (the data only change with a
 * deploy). The `Link` header names the report as the file's canonical page
 * (a CSV has no <head>) and its licence, CC BY 4.0.
 */
export const dynamic = "force-static";
export const revalidate = false;

export function GET() {
  return new Response(reportCsv(), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${CSV_FILENAME}"`,
      link: `<${absoluteUrl(reportPath("ca"))}>; rel="canonical", <https://creativecommons.org/licenses/by/4.0/>; rel="license"`,
    },
  });
}
