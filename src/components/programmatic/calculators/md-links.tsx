import Link from "next/link";
import { Fragment, type ReactNode } from "react";

/**
 * The small markdown the programmatic pages write their bullets in: `**bold**`
 * and `[label](/internal/path/)`. A superset of the local `md` helpers they
 * used before (text without a link renders the same). Only paths starting
 * with "/" become links.
 */
export function mdLinks(text: string): ReactNode[] {
  return text.split(/\*\*/).map((part, i) => {
    const out: ReactNode[] = [];
    let last = 0;
    for (const m of part.matchAll(/\[([^\]]+)\]\((\/[^)\s]+)\)/g)) {
      if (m.index > last) out.push(part.slice(last, m.index));
      out.push(
        <Link key={`${i}-${m.index}`} href={m[2]!}>
          {m[1]}
        </Link>,
      );
      last = m.index + m[0].length;
    }
    if (last < part.length) out.push(part.slice(last));
    return i % 2 ? <strong key={i}>{out}</strong> : <Fragment key={i}>{out}</Fragment>;
  });
}
