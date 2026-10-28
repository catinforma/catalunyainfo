import type { Body } from "@/lib/content/blocks";
import type { Locale } from "@/lib/i18n/config";
import { liveReservoirTitle, loadReservoirs } from "@/lib/content/reservoirs/levels";

/**
 * A page title computed at render time, for pages whose answer is a live
 * figure. Null means "use the stored seoTitle".
 *
 * Only the reservoir guide uses it so far. The fetch is the same one the
 * block makes in the same render, and Next memoises it, so the title costs
 * no extra request and no extra ISR write: it is regenerated exactly when the
 * page is.
 */
export async function liveEntryTitle(body: Body, locale: Locale): Promise<string | null> {
  if (!body.some((block) => block.type === "reservoirLevels")) return null;
  return liveReservoirTitle(locale, await loadReservoirs());
}
