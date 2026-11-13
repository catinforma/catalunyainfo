"use client";

import { useState } from "react";

/**
 * "Copia" for the channel post. The Clipboard API where the page may use it
 * (HTTPS, a user gesture); otherwise the post's own textarea is selected and
 * copied with execCommand, which older in-app browsers still support; and if
 * that fails too, the text stays selected for a long-press copy.
 */
export function CopyPostButton({ targetId }: { targetId: string }) {
  const [state, setState] = useState<"idle" | "copied" | "manual">("idle");

  async function copy() {
    const area = document.getElementById(targetId) as HTMLTextAreaElement | null;
    if (!area) return;
    const text = area.value;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        setState("copied");
        return;
      }
    } catch {
      // Fall through to the textarea.
    }
    area.focus();
    area.select();
    area.setSelectionRange(0, text.length);
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    setState(ok ? "copied" : "manual");
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-3">
      <button type="button" className="ci-btn ci-btn-primary" onClick={copy}>
        Copia
      </button>
      <span role="status" className="text-sm text-[var(--color-muted)]">
        {state === "copied" ? "Copiat. Enganxa'l al canal." : state === "manual" ? "Text seleccionat: mantén premut i copia." : ""}
      </span>
    </span>
  );
}
