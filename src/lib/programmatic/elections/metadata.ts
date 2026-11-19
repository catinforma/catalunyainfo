import type { Metadata } from "next";

import { photoMetaImage, townPhoto } from "@/lib/content/place-photos";
import type { Locale } from "@/lib/i18n/config";
import { cardImage } from "@/lib/seo/cards";
import { buildMetadata } from "@/lib/seo/metadata";

import {
  comarcaDescription,
  comarcaPath,
  comarcaTitle,
  comarcaTranslations,
  electionDescription,
  electionPath,
  electionTitle,
  electionTranslations,
  hubMeta,
  hubPath,
  hubTranslations,
  type ComarcaGroup,
  type ComarcaLocale,
} from "./pages";
import type { Municipality } from "./types";

export function electionComarcaMetadata(locale: ComarcaLocale, g: ComarcaGroup): Metadata {
  return buildMetadata({
    locale,
    path: comarcaPath(locale, g.slug),
    title: comarcaTitle(locale, g),
    description: comarcaDescription(locale, g),
    translations: comarcaTranslations(g.slug),
    type: "website",
  });
}

/** Same builder as every other page: canonical, hreflang + x-default, robots, Open Graph. */
export function electionMetadata(locale: Locale, m: Municipality): Metadata {
  return buildMetadata({
    locale,
    path: electionPath(locale, m.slug),
    title: electionTitle(locale, m),
    description: electionDescription(locale, m),
    translations: electionTranslations(m),
    type: "website",
    // The town's licensed photograph, when it has one (lib/content/place-photos.ts); else the site card.
    image: photoMetaImage(townPhoto(m.slug, locale)),
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
    // Its own share card (H1, 29N date, brand) instead of the site-wide one: lib/seo/cards.ts.
    image: cardImage("elections", locale),
  });
}
