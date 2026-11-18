import { type Locale } from "@/lib/i18n/config";
import { BLACKOUT_VIEW } from "@/lib/programmatic/polls/routing";

import { PollsView } from "./PollsView";

/**
 * The polls page as it must look inside the LOREG 69.7 window: the fixed
 * blackout state, no clock, no figure. Static, so the proxy can serve it at
 * the public URLs from 24 Nov 00:00 to 29 Nov 21:00 without a render per
 * request (lib/programmatic/polls/routing.ts). This module does not import the
 * data gate, so nothing it renders can carry a poll at any date.
 */
export function PollsBlackoutPage({ locale }: { locale: Locale }) {
  return <PollsView locale={locale} data={BLACKOUT_VIEW} />;
}
