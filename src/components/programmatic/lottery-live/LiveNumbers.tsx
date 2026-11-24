"use client";

import Link from "next/link";

import { LiveStatus } from "@/components/programmatic/lottery-live/LiveStatus";
import type { Locale } from "@/lib/i18n/config";
import type { CheckerData } from "@/lib/programmatic/lottery-check/data";
import { CATEGORY_LABEL } from "@/lib/programmatic/lottery-check/client-copy";
import { DRAWN, perDecimo, type CategoryId } from "@/lib/programmatic/lottery-check/programme";
import { money } from "@/lib/programmatic/lottery-tax/copy";
import { useLiveFeed } from "@/lib/programmatic/lottery-live/use-live-feed";

/**
 * The Christmas lottery's main numbers on the results hub, read in the
 * browser from the same live feed as the checker (no deploy on the draw day):
 * the Gordo, the second and third prizes and the fourth and fifth as they
 * come out, each "pending" until SELAE publishes it, numbers as five-digit
 * strings so 00012 stays 00012. The server-rendered tables further down the
 * page (where each prize was sold) follow with the post-draw deploy.
 */

const COPY: Record<Locale, { heading: string; pending: string; perDecimo: string; check: string }> = {
  es: { heading: "Números premiados, en directo", pending: "pendiente", perDecimo: "por décimo", check: "Comprueba tu décimo" },
  ca: { heading: "Números premiats, en directe", pending: "pendent", perDecimo: "per dècim", check: "Comprova el teu dècim" },
  en: { heading: "Winning numbers, live", pending: "pending", perDecimo: "per décimo", check: "Check your ticket" },
};

const ROWS: { id: "first" | "second" | "third" | "fourth" | "fifth"; count: number }[] = [
  { id: "first", count: DRAWN.first },
  { id: "second", count: DRAWN.second },
  { id: "third", count: DRAWN.third },
  { id: "fourth", count: DRAWN.fourth },
  { id: "fifth", count: DRAWN.fifth },
];

/** Lines a row of `count` five-digit numbers may take in a narrow cell (about 18 characters a line), reserved so numbers arriving do not push the rows below. */
const rowLines = (count: number): number => Math.max(1, Math.ceil((count * 7) / 18));

export function LiveNumbers({ locale, dataUrl, officialHref, checkerHref, initial = null }: { locale: Locale; dataUrl: string; officialHref: string; checkerHref: string; initial?: CheckerData | null }) {
  const t = COPY[locale];
  const feed = useLiveFeed<CheckerData>("navidad", dataUrl, initial);
  const draw = feed.data?.available ? feed.data.draw : null;
  const numbersOf = (id: CategoryId): string[] => {
    if (!draw) return [];
    if (id === "first" || id === "second" || id === "third") return draw[id] ? [draw[id]] : [];
    if (id === "fourth" || id === "fifth") return draw[id];
    return [];
  };
  return (
    <section aria-labelledby="live-numbers-title" className="mb-8">
      <h2 id="live-numbers-title">{t.heading}</h2>
      <LiveStatus game="navidad" locale={locale} feed={feed} officialHref={officialHref} />
      <div className="ci-table-scroll mt-4">
        <table className="ci-local-table">
          <tbody>
            {ROWS.map((r) => {
              const numbers = numbersOf(r.id);
              return (
                <tr key={r.id}>
                  <th scope="row" className="font-normal">
                    {CATEGORY_LABEL[r.id][locale]}
                  </th>
                  <td style={{ height: `${rowLines(r.count) * 1.6}em` }}>
                    <strong>{numbers.length ? numbers.join(", ") : t.pending}</strong>
                    {numbers.length && numbers.length < r.count ? ` (${numbers.length}/${r.count})` : ""}
                  </td>
                  <td>
                    {money(perDecimo(r.id), locale)} {t.perDecimo}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3">
        <Link href={checkerHref}>{t.check}</Link>
      </p>
    </section>
  );
}
