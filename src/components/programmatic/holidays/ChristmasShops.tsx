import Link from "next/link";

import { todayInCatalonia } from "@/lib/content/holidays/calendar";
import { christmasShopsCopy, showChristmasShops } from "@/lib/programmatic/holidays/christmas-shops";
import { GUIDES } from "@/lib/programmatic/holidays/links";
import type { MuniLocale } from "@/lib/programmatic/holidays/paths";
import type { SnapshotMunicipality } from "@/lib/programmatic/holidays/types";

/**
 * "Obertura comercial a Nadal" on a town holiday page (5 Nov 2026): can
 * shops open on each Sunday and holiday from 6 December to 6 January, from
 * the town's own 2026 opening days and the retail law. Its own module so the
 * page renderer only gains one line. The page is static: on a build after
 * Reis the section is gone.
 */
export function ChristmasShops({ m, locale, today = todayInCatalonia() }: { m: SnapshotMunicipality; locale: MuniLocale; today?: string }) {
  if (!showChristmasShops(today)) return null;
  const t = christmasShopsCopy(m, locale);
  return (
    <>
      <h2 id="botigues-nadal">{t.title}</h2>
      <p>{t.lead}</p>
      <div className="ci-table-scroll mt-4">
        <table className="ci-local-table">
          <caption className="sr-only">{t.caption}</caption>
          <thead>
            <tr>
              <th scope="col">{t.cols.day}</th>
              <th scope="col">{t.cols.answer}</th>
            </tr>
          </thead>
          <tbody>
            {t.rows.map((row) => (
              <tr key={row.iso}>
                <td>
                  <time dateTime={row.iso}>{row.day}</time>
                </td>
                <td>
                  <strong>{row.verdict}</strong>
                  {row.reason}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>{t.after}</p>
      <p className="text-sm">
        {t.source} <Link href={GUIDES.shops[locale]}>{t.guide}</Link>
      </p>
    </>
  );
}
