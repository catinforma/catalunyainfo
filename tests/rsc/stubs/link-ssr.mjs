// next/link in the SSR phase: the <a> Next renders, without the router.
import { createElement } from "react";

export default function Link({ href, prefetch: _prefetch, replace: _replace, scroll: _scroll, shallow: _shallow, locale: _locale, onNavigate: _onNavigate, ...rest }) {
  return createElement("a", { href: typeof href === "string" ? href : String(href?.pathname ?? ""), ...rest });
}

export function useLinkStatus() {
  return { pending: false };
}
