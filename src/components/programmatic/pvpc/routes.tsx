import type { Metadata } from "next";

import type { Locale } from "@/lib/i18n/config";
import { pvpcMetadata } from "@/lib/programmatic/pvpc/pages";
import type { PvpcDayView } from "@/lib/programmatic/pvpc/paths";
import { loadServerPvpc } from "@/lib/programmatic/pvpc/server";

import { PvpcPage } from "./PvpcPage";

/**
 * What the six PVPC page.tsx files render. Page and metadata read the same
 * memoised REE answer (lib/programmatic/pvpc/server.ts), so title, snippet
 * and body never disagree.
 */

export async function pvpcRouteMetadata(locale: Locale, which: PvpcDayView): Promise<Metadata> {
  return pvpcMetadata(locale, which, await loadServerPvpc());
}

export async function PvpcRoute({ locale, which }: { locale: Locale; which: PvpcDayView }) {
  return <PvpcPage locale={locale} which={which} view={await loadServerPvpc()} />;
}
