import Link from "next/link";
import type { ReactNode } from "react";

/**
 * The lottery checkers' tiny markup (Christmas, El Niño, La Grossa):
 * `**bold**` and `[label](href)` → React, internal links with next/link,
 * official ones in a new tab.
 */
export function Rich({ text }: { text: string }) {
  const out: ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  const inline = (s: string): ReactNode[] => {
    const parts: ReactNode[] = [];
    const lr = /\[([^\]]+)\]\(([^)\s]+)\)/g;
    let p = 0;
    let lm: RegExpExecArray | null;
    while ((lm = lr.exec(s))) {
      if (lm.index > p) parts.push(s.slice(p, lm.index));
      parts.push(
        <A key={`l${i++}`} href={lm[2]!}>
          {lm[1]}
        </A>,
      );
      p = lm.index + lm[0].length;
    }
    if (p < s.length) parts.push(s.slice(p));
    return parts;
  };
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(...inline(text.slice(last, m.index)));
    if (m[1] !== undefined) out.push(<strong key={`b${i++}`}>{inline(m[1])}</strong>);
    else
      out.push(
        <A key={`a${i++}`} href={m[3]!}>
          {m[2]}
        </A>,
      );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(...inline(text.slice(last)));
  return <>{out}</>;
}

export function A({ href, children }: { href: string; children: ReactNode }) {
  if (href.startsWith("/")) return <Link href={href}>{children}</Link>;
  return (
    <a href={href} rel="noopener" target="_blank">
      {children}
    </a>
  );
}

/** A verbatim official quote, with its source under it. */
export function Quote({ text, label, href, lang }: { text: string; label: string; href: string; lang: string }) {
  return (
    <blockquote lang={lang}>
      <p>«{text}»</p>
      <footer className="text-sm">
        <A href={href}>{label}</A>
      </footer>
    </blockquote>
  );
}
