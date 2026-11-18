"use client";

import { useState } from "react";

/**
 * A read-only box with code to paste and a copy button. Named by the heading
 * above it (`labelledBy`) or by `label` (it had no label: axe "label",
 * critical). Works without JavaScript: the code is in the HTML and selectable.
 */
export function CodeBox({
  id,
  labelledBy,
  label,
  code,
  copyLabel,
  copiedLabel,
}: {
  id: string;
  labelledBy?: string;
  label?: string;
  code: string;
  copyLabel: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const area = document.getElementById(id) as HTMLTextAreaElement | null;
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      area?.select();
      document.execCommand("copy");
    }
    setCopied(true);
  }

  return (
    <div className="mt-3">
      <textarea
        id={id}
        aria-labelledby={labelledBy}
        aria-label={labelledBy ? undefined : label}
        readOnly
        value={code}
        rows={code.split("\n").length + 2}
        className="ci-field block w-full font-mono text-xs"
        onFocus={(e) => e.currentTarget.select()}
      />
      <button type="button" className="ci-btn ci-btn-primary mt-2" onClick={copy} aria-live="polite">
        {copied ? copiedLabel : copyLabel}
      </button>
    </div>
  );
}
