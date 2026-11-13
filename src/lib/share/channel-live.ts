import "server-only";

import { freshness } from "@/lib/programmatic/fuel/live";
import { loadCatalonia } from "@/lib/programmatic/fuel/upstream";
import { snapshotReadings } from "@/lib/programmatic/reservoirs/data";
import { formatDate, mergeReadings, readingAge } from "@/lib/programmatic/reservoirs/live";
import { buildLevelsResponse } from "@/lib/programmatic/reservoirs/upstream";
import { TODAY_LABELS } from "@/lib/programmatic/today/labels";
import { fill, fuelMedians, reservoirTotal } from "@/lib/programmatic/today/logic";

import type { ChannelLive } from "./channel-message";

/**
 * The two live facts of today's channel post, read the way the fuel and
 * reservoir endpoints read them (same loaders, same timeouts, never throws).
 * A fact that fails, or is not current, is left out: never an old number
 * passed off as today's.
 */
export async function loadChannelLive(now: Date = new Date()): Promise<ChannelLive> {
  const [fuel, levels] = await Promise.all([loadCatalonia().catch(() => null), buildLevelsResponse(fetch, now).catch(() => null)]);
  const out: ChannelLive = { fuel: null, reservoirs: null };

  if (fuel?.ok && freshness(fuel.payload.updated, now.getTime()) === "fresh") {
    const medians = fuelMedians(fuel.payload.stations);
    // "HH:MM" from the parsed instant (Madrid wall time): the raw Fecha drops the hour's leading zero.
    const time = (fuel.payload.updated ?? "").slice(11, 16);
    const count = Math.max(medians.e95.count, medians.goa.count);
    if (count > 0 && time) out.fuel = { e95: medians.e95.median, goa: medians.goa.median, count, time };
  }

  if (levels) {
    const merged = mergeReadings(levels.body, snapshotReadings());
    const total = merged.live > 0 ? reservoirTotal(merged.readings) : null;
    if (total) {
      const age = readingAge(total.date, now);
      const t = TODAY_LABELS.ca.reservoirs;
      if (age !== "stale") {
        out.reservoirs = {
          percent: total.percent,
          when: age === "today" ? t.today : age === "yesterday" ? t.yesterday : fill(t.on, { date: formatDate(total.date, "ca") }),
        };
      }
    }
  }
  return out;
}
