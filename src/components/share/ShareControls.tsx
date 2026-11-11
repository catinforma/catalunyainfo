"use client";

import { useRef, useState, useSyncExternalStore } from "react";

import { track } from "@/lib/analytics/events";
import type { Locale } from "@/lib/i18n/config";
import type { ShareCopy, ShareLink, ShareMethod } from "@/lib/share/links";

import { ShareIcon } from "./icons";

/**
 * The interactive half of the share bar (ShareBar.tsx builds every URL on the
 * server, so the links work before hydration and without JavaScript).
 *
 * Where the browser has the Web Share API, a "Share" button opens the native
 * sheet - the only way to reach Instagram, and the shortest way to WhatsApp or
 * Telegram on a phone. On phones it replaces the icon row; from md up the row
 * stays next to it. The row's box has a fixed height, so swapping one for the
 * other after hydration moves nothing on the page.
 *
 * Measurement goes through `track()`, which is a no-op until the visitor has
 * granted analytics consent (ConsentGate loads gtag only then).
 */

function subscribeNothing() {
  return () => {};
}

function hasNativeShare(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

export function ShareControls({
  locale,
  path,
  title,
  contentType,
  links,
  nativeUrl,
  copyUrl,
  copy,
  variant,
}: {
  locale: Locale;
  path: string;
  title: string;
  contentType: string;
  links: ShareLink[];
  nativeUrl: string;
  copyUrl: string;
  copy: ShareCopy;
  variant: "compact" | "full";
}) {
  // false on the server and in the first client render, so hydration matches.
  const canShare = useSyncExternalStore(subscribeNothing, hasNativeShare, () => false);
  // Copying needs JavaScript: the button appears once hydrated, at the end of
  // the row, where it pushes nothing.
  const hydrated = useSyncExternalStore(subscribeNothing, () => true, () => false);
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function send(method: ShareMethod) {
    track({ name: "share", params: { method, content_type: contentType, item_id: path, locale } });
  }

  async function nativeShare() {
    try {
      await navigator.share({ title, url: nativeUrl });
      send("native");
    } catch {
      // Cancelled by the reader (AbortError) or refused: nothing to report.
    }
  }

  async function copyLink() {
    let ok = false;
    try {
      await navigator.clipboard.writeText(copyUrl);
      ok = true;
    } catch {
      ok = legacyCopy(copyUrl);
    }
    setStatus(ok ? "copied" : "failed");
    if (ok) send("copy");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("idle"), 2500);
  }

  const full = variant === "full";
  // Phones with the native sheet get the one button; the row stays from md up.
  const rowItem = canShare ? "max-md:hidden" : "";

  return (
    <div className={full ? "ci-share ci-share-full" : "ci-share"} role="group" aria-label={copy.group}>
      {canShare ? (
        <button type="button" className="ci-share-btn ci-share-native" onClick={nativeShare}>
          <ShareIcon name="share" />
          <span>{copy.share}</span>
        </button>
      ) : null}
      {links.map((link) => (
        <a
          key={link.channel}
          href={link.href}
          className={`ci-share-btn ${rowItem}`}
          aria-label={link.label}
          title={link.label}
          {...(link.channel === "email" ? {} : { target: "_blank", rel: "noopener noreferrer nofollow" })}
          onClick={() => send(link.channel)}
        >
          <ShareIcon name={link.channel} />
        </a>
      ))}
      {hydrated ? (
        <button
          type="button"
          className={`ci-share-btn ${rowItem}`}
          aria-label={copy.copyLink}
          title={copy.copyLink}
          onClick={copyLink}
        >
          <ShareIcon name={status === "copied" ? "check" : "link"} />
        </button>
      ) : null}
      {/* Always in the DOM, so screen readers announce the change. */}
      <span className="ci-visually-hidden" role="status" aria-live="polite">
        {status === "copied" ? copy.copied : status === "failed" ? copy.copyFailed : ""}
      </span>
      {status !== "idle" ? (
        <span className="ci-share-toast" aria-hidden="true">
          {status === "copied" ? copy.copied : copy.copyFailed}
        </span>
      ) : null}
    </div>
  );
}

/** Clipboard API refused (older browser, insecure context): the textarea route. */
function legacyCopy(text: string): boolean {
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  } catch {
    return false;
  }
}
