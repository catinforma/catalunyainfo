import Link from "next/link";

import { todayInCatalonia } from "@/lib/content/holidays/calendar";
import { christmasShopsCopy, christmasShopsCopyEn, showChristmasShops, type ChristmasShopsCopy } from "@/lib/programmatic/holidays/christmas-shops";
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
  return <ShopsSection t={christmasShopsCopy(m, locale)} id="botigues-nadal" guideHref={GUIDES.shops[locale]} />;
}

/** The English town pages' version (24 Nov 2026). */
export function EnglishChristmasShops({ m, today = todayInCatalonia() }: { m: SnapshotMunicipality; today?: string }) {
  if (!showChristmasShops(today)) return null;
  return <ShopsSection t={christmasShopsCopyEn(m)} id="christmas-shops" guideHref={GUIDES.shops.en} />;
}

function ShopsSection({ t, id, guideHref }: { t: ChristmasShopsCopy; id: string; guideHref: string }) {
  return (
    <>
      <h2 id={id}>{t.title}</h2>
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
      {t.council ? (
        <p>
          {t.council.text} <a href={t.council.href} rel="noopener" target="_blank">{t.council.label}</a>
        </p>
      ) : null}
      <p className="text-sm">
        {t.source} <Link href={guideHref}>{t.guide}</Link>
      </p>
    </>
  );
}
