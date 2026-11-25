/**
 * The code-rendered families of the sitemap, by the key `src/app/sitemap.ts`
 * dates them with (`dated("<key>", …)`), and how to find their route files:
 * from the URLs the family's own sitemap function lists (`urls`), or named
 * (`roots`) when Next serves them through a rewrite or they are content
 * blocks rather than pages. A test holds this list and sitemap.ts together.
 */
import type { MetadataRoute } from "next";

import { electionsSitemap } from "@/lib/programmatic/elections/pages";
import { holidaySitemapEntries } from "@/lib/programmatic/holidays/paths";
import { fuelSitemapEntries } from "@/lib/programmatic/fuel/sitemap";
import { spainFuelSitemapEntries } from "@/lib/programmatic/fuel/spain-sitemap";
import { rodaliesSitemap } from "@/lib/programmatic/rodalies/pages";
import { reservoirSitemapEntries } from "@/lib/programmatic/reservoirs/pages";
import { weekendSitemapEntries } from "@/lib/programmatic/weekend/sitemap";
import { todaySitemapEntries } from "@/lib/programmatic/today/page";
import { christmasFairsSitemapEntries } from "@/lib/programmatic/christmas-fairs/sitemap";
import { gordoSitemapEntries } from "@/lib/programmatic/gordo/sitemap";
import { checkSitemapEntries } from "@/lib/programmatic/lottery-check/sitemap";
import { grossaCheckSitemapEntries } from "@/lib/programmatic/grossa-check/sitemap";
import { ninoCheckSitemapEntries } from "@/lib/programmatic/nino-check/sitemap";
import { editionSitemapEntries } from "@/lib/programmatic/spain-2027/editions";
import { spainDaySitemapEntries, spainSitemapEntries } from "@/lib/programmatic/spain-2027/paths";
import { widgetSitemapEntries } from "@/lib/programmatic/embed-2027/places";
import { REPORT_PAGE_AS_OF, reportSitemapEntries } from "@/lib/programmatic/holidays/report-copy";
import { leaveSitemapEntries } from "@/lib/programmatic/leave-2027/places";
import { calculatorsHubSitemapEntries } from "@/lib/programmatic/calculators/sitemap";
import { netSalarySitemapEntries } from "@/lib/programmatic/net-salary/sitemap";
import { extraPaySitemapEntries } from "@/lib/programmatic/extra-pay/sitemap";
import { selfEmployedSitemapEntries } from "@/lib/programmatic/self-employed/sitemap";
import { employmentSitemapEntries } from "@/lib/programmatic/employment/sitemap";
import { sickLeaveSitemapEntries } from "@/lib/programmatic/sick-leave/sitemap";
import { paidLeaveSitemapEntries } from "@/lib/programmatic/paid-leave/sitemap";
import { subsidySitemapEntries } from "@/lib/programmatic/unemployment-subsidy/sitemap";
import { rentSitemapEntries } from "@/lib/programmatic/rent-update/page";
import { pvpcSitemapEntries } from "@/lib/programmatic/pvpc/pages";
import { butaneSitemapEntries } from "@/lib/programmatic/butane/page";
import { warningsSitemapEntries } from "@/lib/programmatic/warnings/page";
import { pensionSitemapEntries } from "@/lib/programmatic/pensions-2027/page";
import { workingDaysSitemapEntries } from "@/lib/programmatic/working-days/places";
import { smiSitemapEntries } from "@/lib/programmatic/smi/page";
import { ipremSitemapEntries } from "@/lib/programmatic/iprem/page";
import { ipcSitemapEntries } from "@/lib/programmatic/ipc/page";
import { wageSitemapEntries } from "@/lib/programmatic/average-salary/page";
import { letrasSitemapEntries } from "@/lib/programmatic/treasury-bills/page";
import { LETRAS_SNAPSHOT } from "@/lib/programmatic/treasury-bills/data";
import { euriborSitemapEntries } from "@/lib/programmatic/euribor/page";
import { EURIBOR_SNAPSHOT } from "@/lib/programmatic/euribor/data";
import { mortgageSitemapEntries } from "@/lib/programmatic/mortgage/page";
import { itvSitemapEntries } from "@/lib/programmatic/itv/page";
import { weeklyMarketsSitemapEntries } from "@/lib/programmatic/weekly-markets/sitemap";
import { zonaAzulSitemapEntries } from "@/lib/programmatic/zona-azul/sitemap";
import { htSitemapEntries } from "@/lib/programmatic/home-purchase-tax/page";
import { pcSitemapEntries } from "@/lib/programmatic/purchase-costs/page";
import { pvSitemapEntries } from "@/lib/programmatic/plusvalia/page";
import { isdSitemapEntries } from "@/lib/programmatic/inheritance-tax/page";
import { regionSitemapEntries as isdRegionSitemapEntries } from "@/lib/programmatic/inheritance-tax/regional-page";
import { giftSitemapEntries } from "@/lib/programmatic/gift-tax/page";
import { cmpSitemapEntries } from "@/lib/programmatic/inheritance-compare/paths";
import { lotteryTaxSitemapEntries } from "@/lib/programmatic/lottery-tax/page";
import { bonoSocialSitemapEntries } from "@/lib/programmatic/bono-social/page";
import { retirementSitemapEntries } from "@/lib/programmatic/retirement-age/page";
import { widowSitemapEntries } from "@/lib/programmatic/widow-pension/page";
import { ncSitemapEntries } from "@/lib/programmatic/non-contributory-pension/page";
import { trafficFinesSitemapEntries } from "@/lib/programmatic/traffic-fines/page";
import { zbeSitemapEntries } from "@/lib/programmatic/zbe/sitemap";
import { ztSitemapEntries } from "@/lib/programmatic/zona-tensionada/page";
import { pollsSitemapEntries } from "@/lib/programmatic/polls/page";
import { DATA_BLOCK_COMPONENTS, blockBodyKey } from "@/lib/seo/body-dates";

import { LOCALE_ROUTES } from "./body-dates.ts";

/**
 * `home`: the content families whose files are the family's body (see
 * bodyFiles in ./body-dates.ts); by default the programmatic folder named like
 * the key. Content blocks have none: their component's own imports decide.
 */
export type FamilySource = ({ urls: () => string[] } | { roots: readonly string[] }) & { home?: readonly string[] };

const TODAY = "2026-11-21";
const paths = (entries: MetadataRoute.Sitemap) => entries.map((entry) => new URL(entry.url).pathname);

/** The sitemap functions list nothing off production (indexingAllowed): ask them as production does. */
function asProduction<T>(run: () => T): T {
  const saved = { VERCEL_ENV: process.env.VERCEL_ENV, NEXT_PUBLIC_ALLOW_INDEXING: process.env.NEXT_PUBLIC_ALLOW_INDEXING };
  process.env.VERCEL_ENV = "production";
  process.env.NEXT_PUBLIC_ALLOW_INDEXING = "true";
  try {
    return run();
  } finally {
    for (const [name, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
}

const urls = (entries: () => MetadataRoute.Sitemap, home?: readonly string[]): FamilySource => ({
  urls: () => asProduction(() => paths(entries())),
  ...(home ? { home } : {}),
});

export const BODY_FAMILIES: Record<string, FamilySource> = {
  // The election components are the loose files of components/programmatic (ElectionResultsPage.tsx…).
  elections: urls(() => electionsSitemap(), ["p:elections", "p:loose"]),
  holidays: urls(() => holidaySitemapEntries()),
  "spain-2027": urls(() => spainSitemapEntries(), ["p:spain-2027"]),
  "spain-2027-days": urls(() => spainDaySitemapEntries(), ["p:spain-2027"]),
  "spain-2027-editions": urls(() => editionSitemapEntries(), ["p:spain-2027"]),
  "embed-2027": urls(() => widgetSitemapEntries()),
  "holidays-report": urls(() => reportSitemapEntries(REPORT_PAGE_AS_OF), ["p:holidays"]),
  "leave-2027": urls(() => leaveSitemapEntries()),
  calculators: urls(() => calculatorsHubSitemapEntries()),
  "net-salary": urls(() => netSalarySitemapEntries()),
  "extra-pay": urls(() => extraPaySitemapEntries()),
  "self-employed": urls(() => selfEmployedSitemapEntries()),
  employment: urls(() => employmentSitemapEntries()),
  "sick-leave": urls(() => sickLeaveSitemapEntries()),
  "paid-leave": urls(() => paidLeaveSitemapEntries()),
  "unemployment-subsidy": urls(() => subsidySitemapEntries()),
  "rent-update": urls(() => rentSitemapEntries()),
  pvpc: urls(() => pvpcSitemapEntries(TODAY)),
  butane: urls(() => butaneSitemapEntries(TODAY)),
  warnings: urls(() => warningsSitemapEntries(Date.parse(`${TODAY}T12:00:00Z`))),
  "pensions-2027": urls(() => pensionSitemapEntries()),
  "working-days": urls(() => workingDaysSitemapEntries()),
  smi: urls(() => smiSitemapEntries()),
  iprem: urls(() => ipremSitemapEntries()),
  ipc: urls(() => ipcSitemapEntries()),
  "average-salary": urls(() => wageSitemapEntries()),
  "treasury-bills": urls(() => letrasSitemapEntries(LETRAS_SNAPSHOT.results)),
  euribor: urls(() => euriborSitemapEntries(EURIBOR_SNAPSHOT.series)),
  mortgage: urls(() => mortgageSitemapEntries(EURIBOR_SNAPSHOT.series)),
  itv: urls(() => itvSitemapEntries()),
  "zona-azul": urls(() => zonaAzulSitemapEntries()),
  "mercats-setmanals": urls(() => weeklyMarketsSitemapEntries()),
  "home-purchase-tax": urls(() => htSitemapEntries()),
  "purchase-costs": urls(() => pcSitemapEntries()),
  plusvalia: urls(() => pvSitemapEntries()),
  "inheritance-tax": urls(() => isdSitemapEntries()),
  "inheritance-tax-regions": urls(() => isdRegionSitemapEntries(), ["p:inheritance-tax"]),
  "gift-tax": urls(() => giftSitemapEntries()),
  "inheritance-compare": urls(() => cmpSitemapEntries()),
  "lottery-tax": urls(() => lotteryTaxSitemapEntries()),
  "bono-social": urls(() => bonoSocialSitemapEntries()),
  "retirement-age": urls(() => retirementSitemapEntries()),
  "widow-pension": urls(() => widowSitemapEntries()),
  "non-contributory-pension": urls(() => ncSitemapEntries()),
  "traffic-fines": urls(() => trafficFinesSitemapEntries()),
  zbe: urls(() => zbeSitemapEntries()),
  "zona-tensionada": urls(() => ztSitemapEntries()),
  fuel: urls(() => fuelSitemapEntries(TODAY)),
  "fuel-spain": urls(() => spainFuelSitemapEntries()),
  rodalies: urls(() => rodaliesSitemap(TODAY)),
  reservoirs: urls(() => reservoirSitemapEntries()),
  weekend: urls(() => weekendSitemapEntries(TODAY)),
  today: urls(() => todaySitemapEntries()),
  "christmas-fairs": urls(() => christmasFairsSitemapEntries()),
  gordo: urls(() => gordoSitemapEntries()),
  "lottery-check": urls(() => checkSitemapEntries()),
  "grossa-check": urls(() => grossaCheckSitemapEntries()),
  "nino-check": urls(() => ninoCheckSitemapEntries()),
  // Guide URLs rewritten to the force-dynamic internal-polls route (next.config.ts, pollsRewrites).
  polls: { home: ["p:polls"], roots: [`${LOCALE_ROUTES}/internal-polls/page.tsx`, `${LOCALE_ROUTES}/internal-polls/blackout/page.tsx`] },
  // Content blocks that render code data inside database articles (src/components/blocks/BlockRenderer.tsx).
  ...Object.fromEntries(
    Object.entries(DATA_BLOCK_COMPONENTS).map(([type, file]) => [blockBodyKey(type), { roots: [file] }]),
  ),
};

/** The content families a family's body is made of. */
export function familyHome(key: string): readonly string[] | undefined {
  const source = BODY_FAMILIES[key];
  if (!source) return undefined;
  if (source.home) return source.home;
  return key.startsWith("block:") ? undefined : [`p:${key}`];
}

/** Kept for the tests: the sitemap functions above must keep listing URLs. */
export function familyUrls(key: string): string[] {
  const source = BODY_FAMILIES[key];
  return source && "urls" in source ? source.urls() : [];
}
