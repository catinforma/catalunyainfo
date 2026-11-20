import Link from "next/link";

import { decemberBridgeLine } from "@/lib/content/batch02/december-bridge-spain";
import { todayInCatalonia } from "@/lib/content/holidays/calendar";
import type { Locale } from "@/lib/i18n/config";
import type { Region } from "@/lib/programmatic/holidays/boe-2027";

/**
 * "¿Y este diciembre?" on the Spain-wide 2027 hub and community pages
 * (20 Nov 2026, docs/SEO_EXPERIMENTS.md). The words and the link come from
 * `decemberBridgeLine`; the line is gone from the first render (or deploy)
 * after 8 December 2026.
 */
export function DecemberBridgeLine({ locale, region, inPlace }: { locale: Locale; region?: Region; inPlace?: string }) {
  const line = decemberBridgeLine(locale, todayInCatalonia(), region, inPlace);
  if (!line) return null;
  return (
    <p>
      <strong>{line.lead}</strong> {line.text} <Link href={line.href}>{line.label}</Link>.
    </p>
  );
}
