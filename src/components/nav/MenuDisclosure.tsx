"use client";

import { useEffect, useRef } from "react";

/**
 * A menu that is a <details> element, enhanced.
 *
 * Why <details> rather than a JavaScript-only button: the menu opens and its
 * links work before hydration, with JavaScript off and when a script fails to
 * load, and the links are in the server HTML for crawlers either way. The
 * browser already exposes <summary> as a button with its expanded state and
 * makes it keyboard-operable (Enter and Space).
 *
 * Once hydrated, this component adds what a disclosure menu needs on top:
 *  - `aria-expanded` mirrored on the summary (set from the DOM, never during
 *    server rendering, where a fixed "false" would lie to a no-JS reader);
 *  - Escape closes it and returns focus to the button;
 *  - a tap or click outside closes it, and so does focus leaving it;
 *  - following one of its links closes it, as does history navigation.
 */
export function MenuDisclosure({
  panelId,
  className,
  summaryClassName,
  panelClassName,
  summary,
  children,
}: {
  /** id of the panel, the target of the summary's `aria-controls`. */
  panelId: string;
  className: string;
  summaryClassName?: string;
  panelClassName: string;
  summary: React.ReactNode;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const details = ref.current;
    const button = details?.querySelector("summary");
    if (!details || !button) return;

    const sync = () => button.setAttribute("aria-expanded", details.open ? "true" : "false");
    const close = (refocus: boolean) => {
      if (!details.open) return;
      details.open = false;
      sync();
      if (refocus) button.focus();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && details.open) {
        event.preventDefault();
        close(true);
      }
    };
    const onPointer = (event: PointerEvent) => {
      if (details.open && !details.contains(event.target as Node)) close(false);
    };
    const onFocusOut = (event: FocusEvent) => {
      const next = event.relatedTarget as Node | null;
      if (next && !details.contains(next)) close(false);
    };
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest("a[href]");
      if (link && details.contains(link)) close(false);
    };
    const onPopState = () => close(false);

    sync();
    details.addEventListener("toggle", sync);
    document.addEventListener("keydown", onKey);
    details.addEventListener("focusout", onFocusOut);
    details.addEventListener("click", onClick);
    document.addEventListener("pointerdown", onPointer);
    window.addEventListener("popstate", onPopState);
    return () => {
      details.removeEventListener("toggle", sync);
      document.removeEventListener("keydown", onKey);
      details.removeEventListener("focusout", onFocusOut);
      details.removeEventListener("click", onClick);
      document.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  return (
    <details ref={ref} className={className}>
      <summary className={summaryClassName} aria-controls={panelId}>
        {summary}
      </summary>
      <div id={panelId} className={panelClassName}>
        {children}
      </div>
    </details>
  );
}
