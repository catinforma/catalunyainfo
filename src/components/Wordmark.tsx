import Image from "next/image";
import { IntentLink } from "@/components/nav/IntentLink";

/**
 * The brand lock-up: the Catalonia mark beside the wordmark.
 *
 * The mark is the app icon, on its own white tile, so it reads the same on the
 * light and the dark theme. The name stays live text rather than part of the
 * image: it scales with the type, it is what a screen reader announces, and it
 * is the link text a crawler sees.
 *
 * `fetchPriority="low"`: React's server renderer adds a high-priority
 * `<link rel="preload" as="image">` to the head for every image that is
 * neither lazy nor low priority (react-dom-server, `case "img"`). For this
 * 36 px mark that meant one more high-priority request on every page, in the
 * same window as the fonts, the stylesheet and, on articles, the hero image
 * that is the LCP element (PSI mobile, 21 Nov 2026: hero and mark both "High",
 * requested together; the mark from the origin, since Cloudflare bypasses
 * /_next/image). Low priority keeps it eager, out of the head and behind the
 * LCP candidate. See docs/SEO_EXPERIMENTS.md, 21 Nov 2026.
 */
export function Wordmark({ href, className = "" }: { href: string; className?: string }) {
  return (
    <IntentLink href={href} className={`ci-wordmark ${className}`.trim()}>
      <Image src="/icon-192.png" alt="" width={36} height={36} className="ci-wordmark-mark" loading="eager" fetchPriority="low" />
      <span className="ci-wordmark-name">
        Catalunya<span>Info</span>
      </span>
    </IntentLink>
  );
}
