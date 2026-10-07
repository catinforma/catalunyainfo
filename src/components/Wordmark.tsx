import Image from "next/image";
import Link from "next/link";

/**
 * The brand lock-up: the Catalonia mark beside the wordmark.
 *
 * The mark is the app icon, on its own white tile, so it reads the same on the
 * light and the dark theme. The name stays live text rather than part of the
 * image: it scales with the type, it is what a screen reader announces, and it
 * is the link text a crawler sees.
 */
export function Wordmark({ href, className = "" }: { href: string; className?: string }) {
  return (
    <Link href={href} className={`ci-wordmark ${className}`.trim()}>
      <Image src="/icon-192.png" alt="" width={36} height={36} className="ci-wordmark-mark" priority />
      <span className="ci-wordmark-name">
        Catalunya<span>Info</span>
      </span>
    </Link>
  );
}
