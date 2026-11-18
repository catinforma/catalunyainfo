import { connection } from "next/server";

import { type Locale } from "@/lib/i18n/config";
import { pollsPageData } from "@/lib/programmatic/polls/data";

import { PollsView } from "./PollsView";

/**
 * The 29N official-polls page (CIS, CEO), rendered at request time.
 *
 * `connection()` makes rendering wait for a real request before the clock is
 * read (the route is also `force-dynamic`), and `pollsPageData(now)` is the
 * only way a figure reaches the tree. Inside the LOREG 69.7 window it returns
 * no poll at all, so the HTML and the RSC payload cannot carry one.
 *
 * Inside the window the proxy normally sends the public URLs to the static
 * `PollsBlackoutPage` instead (src/proxy.ts, lib/programmatic/polls/routing.ts),
 * so this render runs only while figures may be shown, or if the proxy did not
 * run, in which case the clock check here still applies.
 */
export async function PollsPage({ locale }: { locale: Locale }) {
  await connection();
  const data = pollsPageData(new Date());
  return <PollsView locale={locale} data={data} />;
}
