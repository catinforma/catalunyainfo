import { madridDate } from "@/lib/programmatic/pvpc/time";

/**
 * The one clock read of the butane page: today in Madrid. The routes
 * regenerate every hour (SERVER_REVALIDATE_SECONDS), so a revision or a tax
 * month that starts at 00:00 shows within the hour.
 */
export const SERVER_REVALIDATE_SECONDS = 3600;

export function butaneToday(now: number = Date.now()): string {
  return madridDate(now);
}
