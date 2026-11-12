import type { Locale } from "@/lib/i18n/config";
import { SITE } from "@/lib/site";

/**
 * Share links: plain URLs to each network's own share endpoint.
 *
 * No SDK, no iframe, no pixel and no third-party script: a link only leaves
 * the site when the reader taps it, so the CSP and the consent model stay as
 * they are. Instagram has no web share endpoint; on phones it is reached
 * through the native share sheet (navigator.share), which ShareControls offers
 * where the browser has it.
 *
 * The shared URL is the canonical one plus `utm_source=share&utm_medium=<channel>`,
 * so GA4 can attribute the visits it brings. The page's canonical tag is
 * untouched (lib/seo/metadata.ts builds it from the path alone).
 */

export const SHARE_CHANNELS = ["whatsapp", "telegram", "x", "facebook", "email"] as const;
export type ShareChannel = (typeof SHARE_CHANNELS)[number];
/** Every value `utm_medium` can take, and the `method` of the GA4 `share` event. */
export type ShareMethod = ShareChannel | "copy" | "native";

export interface ShareLink {
  channel: ShareChannel;
  href: string;
  /** Accessible name of the icon link ("Share on WhatsApp"). */
  label: string;
}

export interface ShareCopy {
  /** The native share button. */
  share: string;
  /** Lead-in shown above the end-of-article bar. */
  heading: string;
  copyLink: string;
  copied: string;
  copyFailed: string;
  /** Accessible name of the whole group. */
  group: string;
}

/** Accessible name of each icon link. */
const CHANNEL_LABEL: Record<ShareChannel, Record<Locale, string>> = {
  whatsapp: { ca: "Comparteix a WhatsApp", es: "Compartir en WhatsApp", en: "Share on WhatsApp" },
  telegram: { ca: "Comparteix a Telegram", es: "Compartir en Telegram", en: "Share on Telegram" },
  x: { ca: "Comparteix a X", es: "Compartir en X", en: "Share on X" },
  facebook: { ca: "Comparteix a Facebook", es: "Compartir en Facebook", en: "Share on Facebook" },
  email: { ca: "Envia per correu electrònic", es: "Enviar por correo electrónico", en: "Send by email" },
};

export const SHARE_COPY: Record<Locale, ShareCopy> = {
  ca: {
    share: "Compartir",
    heading: "Comparteix aquesta pàgina",
    copyLink: "Copiar enllaç",
    copied: "Enllaç copiat",
    copyFailed: "No s'ha pogut copiar l'enllaç",
    group: "Compartir",
  },
  es: {
    share: "Compartir",
    heading: "Comparte esta página",
    copyLink: "Copiar enlace",
    copied: "Enlace copiado",
    copyFailed: "No se ha podido copiar el enlace",
    group: "Compartir",
  },
  en: {
    share: "Share",
    heading: "Share this page",
    copyLink: "Copy link",
    copied: "Link copied",
    copyFailed: "Could not copy the link",
    group: "Share",
  },
};

/** Site path ("/es/guias/x/") to the absolute canonical URL, with no query or hash. */
export function canonicalUrl(path: string): string {
  const [clean = "/"] = path.split(/[?#]/);
  const withSlash = clean.endsWith("/") ? clean : `${clean}/`;
  return `${SITE.productionOrigin}${withSlash.startsWith("/") ? "" : "/"}${withSlash}`;
}

/** The URL a reader shares through `method`: canonical plus the two UTM parameters. */
export function sharedUrl(path: string, method: ShareMethod): string {
  return `${canonicalUrl(path)}?utm_source=share&utm_medium=${method}`;
}

const enc = encodeURIComponent;

/** One link per channel, in display order. */
export function shareLinks(path: string, title: string, locale: Locale): ShareLink[] {
  const href: Record<ShareChannel, string> = {
    whatsapp: `https://wa.me/?text=${enc(`${title} ${sharedUrl(path, "whatsapp")}`)}`,
    telegram: `https://t.me/share/url?url=${enc(sharedUrl(path, "telegram"))}&text=${enc(title)}`,
    x: `https://x.com/intent/post?text=${enc(title)}&url=${enc(sharedUrl(path, "x"))}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${enc(sharedUrl(path, "facebook"))}`,
    email: `mailto:?subject=${enc(title)}&body=${enc(`${title}\n\n${sharedUrl(path, "email")}`)}`,
  };
  return SHARE_CHANNELS.map((channel) => ({
    channel,
    href: href[channel],
    label: CHANNEL_LABEL[channel][locale],
  }));
}
