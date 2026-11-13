import "server-only";

import { addDays } from "@/lib/programmatic/holidays/format";
import { todayInMadrid } from "@/lib/programmatic/holidays/status";

import { channelMessage } from "./channel-data";
import { loadChannelLive } from "./channel-live";
import type { ChannelMessage } from "./channel-message";

/** Everything the channel page shows, for the day it is opened (Europe/Madrid). */
export async function channelPosts(now: Date = new Date()): Promise<{ today: ChannelMessage; tomorrow: ChannelMessage; liveNote: string }> {
  const date = todayInMadrid(now);
  const live = await loadChannelLive(now);
  const missing = [live.fuel ? null : "els preus del carburant", live.reservoirs ? null : "els embassaments"].filter(Boolean);
  const liveNote =
    missing.length === 0
      ? "Els preus i els embassaments d'avui s'han llegit en obrir la pàgina; el de demà no en porta."
      : `Ara no s'han pogut llegir ${missing.join(" ni ")}: el missatge d'avui no en parla. Torna a carregar la pàgina per tornar-ho a provar.`;
  return { today: channelMessage(date, live), tomorrow: channelMessage(addDays(date, 1)), liveNote };
}
