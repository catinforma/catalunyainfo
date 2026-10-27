import type { Metadata } from "next";

import type { Locale } from "@/lib/i18n/config";
import { buildMetadata } from "@/lib/seo/metadata";

import {
  electionDescription,
  electionPath,
  electionTitle,
  electionTranslations,
  hubMeta,
  hubPath,
  hubTranslations,
} from "./pages";
import type { Municipality } from "./types";

/** Same builder as every other page: canonical, hreflang + x-default, robots, Open Graph. */
export function electionMetadata(locale: Locale, m: Municipality): Metadata {
  return buildMetadata({
    locale,
    path: electionPath(locale, m.slug),
    title: electionTitle(locale, m),
    description: electionDescription(locale, m),
    translations: electionTranslations(m),
    type: "website",
  });
}

export function electionsHubMetadata(locale: Locale): Metadata {
  const meta = hubMeta(locale);
  return buildMetadata({
    locale,
    path: hubPath(locale),
    title: meta.title,
    description: meta.description,
    translations: hubTranslations(),
    type: "website",
  });
}
