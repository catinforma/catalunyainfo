import { SNAPSHOT as GORDO } from "@/lib/programmatic/gordo/data";
import { loadSnapshot as loadGordo } from "@/lib/programmatic/gordo/validate";
import type { GordoSnapshot } from "@/lib/programmatic/gordo/types";
import { SNAPSHOT as GROSSA } from "@/lib/programmatic/grossa-check/data";
import { loadSnapshot as loadGrossa, type GrossaSnapshot } from "@/lib/programmatic/grossa-check/validate";
import { SNAPSHOT as NINO } from "@/lib/programmatic/nino-check/data";
import { PROGRAMME_2027 } from "@/lib/programmatic/nino-check/programme-data";
import { loadSnapshot as loadNino, type NinoSnapshot } from "@/lib/programmatic/nino-check/validate";

import { createFeed, type FeedSpec } from "./feed";

/**
 * The three games' feeds (see feed.ts): file names, validators, and the
 * count of official numbers each snapshot holds. Server only (route handlers).
 */

export const navidadSpec: Omit<FeedSpec<GordoSnapshot>, "committed"> = {
  file: "navidad.json",
  load: (json) => loadGordo(json),
  richness: (s) => s.prizes.reduce((n, p) => n + p.numbers.length, 0) + (s.pedrea?.length ?? 0),
  readAt: (s) => s.readAt,
};

export const grossaSpec: Omit<FeedSpec<GrossaSnapshot>, "committed"> = {
  file: "grossa.json",
  load: (json) => loadGrossa(json),
  richness: (s) => {
    const n = s.numbers;
    return [n.first, n.second, n.third].filter(Boolean).length + n.fourth.length + n.fifth.length;
  },
  readAt: (s) => s.readAt,
};

export const ninoSpec: Omit<FeedSpec<NinoSnapshot>, "committed"> = {
  file: "nino.json",
  load: (json) => loadNino(json, PROGRAMME_2027),
  richness: (s) => {
    const n = s.numbers;
    return [n.first, n.second, n.third].filter(Boolean).length + n.x5.length + n.x4.length + n.x3.length + n.x2.length + n.x1.length;
  },
  readAt: (s) => s.readAt,
};

export const navidadFeed = createFeed<GordoSnapshot>({ ...navidadSpec, committed: GORDO });
export const grossaFeed = createFeed<GrossaSnapshot>({ ...grossaSpec, committed: GROSSA });
export const ninoFeed = createFeed<NinoSnapshot>({ ...ninoSpec, committed: NINO });

/**
 * Cache-Control of the three JSON answers. Short on purpose: the CDN holds a
 * copy for 30 s (one origin request per edge location per half minute, however
 * many readers), a browser for 15 s, and a stale copy is served for a minute
 * while it refreshes. Nothing needs purging when a new file is written.
 */
export const LIVE_CACHE_CONTROL = "public, max-age=15, s-maxage=30, stale-while-revalidate=60";
