"use client";

import Link from "next/link";
import { useState, type ComponentProps } from "react";

/**
 * A `next/link` that prefetches on intent (pointer over it, keyboard focus or
 * a touch), never just for being on screen. For the links that sit on every
 * page: header menu, wordmark, breadcrumbs.
 *
 * Why: a plain Link prefetches its target's RSC payload as soon as it enters
 * the viewport, and Cloudflare never caches those (they vary on router
 * headers, ops/vps/README.md section 10), so every page view sent the origin
 * a burst of prefetches for the same eight hubs. Caddy logs, 18 Nov 2026:
 * RSC prefetches were 41% of all origin requests (55% from 08:00 to 12:00),
 * about four in five of them for the menu, breadcrumb and footer targets.
 *
 * This is the "Hover-triggered prefetch" pattern of the Next 16 prefetching
 * guide (node_modules/next/dist/docs/01-app/02-guides/prefetching.md):
 * `prefetch={false}` until the first sign of intent, then `null`, the default
 * behaviour, so the click that follows is still a client-side navigation
 * with the payload usually already there.
 */
export function IntentLink({ onMouseEnter, onFocus, onTouchStart, ...props }: Omit<ComponentProps<typeof Link>, "prefetch">) {
  const [intent, setIntent] = useState(false);
  return (
    <Link
      {...props}
      prefetch={intent ? null : false}
      onMouseEnter={(event) => {
        setIntent(true);
        onMouseEnter?.(event);
      }}
      onFocus={(event) => {
        setIntent(true);
        onFocus?.(event);
      }}
      onTouchStart={(event) => {
        setIntent(true);
        onTouchStart?.(event);
      }}
    />
  );
}
