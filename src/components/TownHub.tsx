import Link from "next/link";
import { Fragment } from "react";

import type { TownHub as TownHubData } from "@/lib/engagement/town-hub";

/**
 * "<Town>: tot el que hi ha a CatalunyaInfo": the town's other pages
 * (lib/engagement/town-hub.ts decides which), low on each per-town page,
 * after the answer and the "next useful step" box. Server-rendered plain
 * links, no state, no script.
 *
 * `prefetch={false}`: low on long pages, a viewport prefetch would pull each
 * target's RSC payload from the origin, which Cloudflare never caches (the
 * election pages' sibling links do the same). `data-ci-placement="town_hub"`
 * is what the click listener reports as `related_content_click`.
 */
export function TownHub({ hub }: { hub: TownHubData | null }) {
  if (!hub || hub.links.length === 0) return null;
  return (
    <nav aria-labelledby="ci-town-hub" className="ci-town-hub" data-ci-placement="town_hub">
      <h2 id="ci-town-hub" className="ci-town-hub-title">
        {hub.title}
      </h2>
      <ul className="ci-town-hub-list">
        {hub.links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} prefetch={false}>
              {link.label}
            </Link>
            {link.more?.map((m) => (
              <Fragment key={m.href}>
                {" · "}
                <Link href={m.href} prefetch={false}>
                  {m.label}
                </Link>
              </Fragment>
            ))}
          </li>
        ))}
      </ul>
    </nav>
  );
}
