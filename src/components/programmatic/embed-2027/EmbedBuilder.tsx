"use client";

import { useEffect, useId, useMemo, useState } from "react";

import type { PickerGroup } from "@/lib/programmatic/embed-2027/places";

/**
 * The picker, the live preview and the code to copy. Server-rendered with
 * `initial` (Barcelona) so the page works without JavaScript; in the browser
 * the choice follows the URL hash a town page links with ("#sabadell",
 * "#andalucia/sevilla") and is written back to it.
 */

export interface BuilderLabels {
  picker: string;
  previewTitle: string;
  codeTitle: string;
  codeHelp: string;
  copy: string;
  copied: string;
  linkTitle: string;
  linkHelp: string;
  snippetTitle: string;
}

interface Choice {
  value: string;
  label: string;
  embed: string;
  page: string;
}

const HEIGHT = 640;

function attr(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function choicesOf(groups: PickerGroup[]): Map<string, Choice> {
  const out = new Map<string, Choice>();
  for (const g of groups) {
    for (const [value, label, flag] of g.items) {
      const slug = value.split("/").at(-1) ?? value;
      // places.ts PickerGroup: 1 = the page in another language, 2 = the indexable 2027 hub.
      const page = flag === 2 ? g.hubPath : `${flag === 1 && g.altPagePrefix ? g.altPagePrefix : g.pagePrefix}${slug}/`;
      out.set(value, { value, label, embed: `${g.embedPrefix}${value}/`, page });
    }
  }
  return out;
}

export function EmbedBuilder({ groups, initial, origin, labels }: { groups: PickerGroup[]; initial: string; origin: string; labels: BuilderLabels }) {
  const id = useId();
  const choices = useMemo(() => choicesOf(groups), [groups]);
  const [value, setValue] = useState(initial);
  const [copied, setCopied] = useState<"iframe" | "link" | null>(null);

  // The hash is only known in the browser: read it after mount, never during render.
  useEffect(() => {
    const fromHash = () => {
      const wanted = decodeURIComponent(window.location.hash.slice(1));
      if (choices.has(wanted)) setValue(wanted);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [choices]);

  const choice = choices.get(value) ?? choices.get(initial)!;
  const title = `${labels.snippetTitle}: ${choice.label}`;
  const iframeCode =
    `<iframe src="${attr(origin + choice.embed)}" title="${attr(title)}" width="100%" height="${HEIGHT}" style="border:0;max-width:520px" loading="lazy"></iframe>\n` +
    `<p><a href="${attr(origin + choice.page)}">${attr(title)}</a> · CatalunyaInfo</p>`;
  const linkCode = `<a href="${attr(origin + choice.page)}">${attr(title)}</a>`;

  function pick(next: string) {
    setValue(next);
    setCopied(null);
    window.history.replaceState(null, "", `#${next}`);
  }

  async function copy(text: string, which: "iframe" | "link", area: HTMLTextAreaElement | null) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      area?.select();
      document.execCommand("copy");
    }
    setCopied(which);
  }

  return (
    <div className="mt-6">
      <label htmlFor={`${id}-place`} className="block font-semibold">
        {labels.picker}
      </label>
      <select id={`${id}-place`} className="ci-field mt-2 w-full max-w-md" value={choice.value} onChange={(e) => pick(e.target.value)}>
        {groups.map((g) => (
          <optgroup key={g.label} label={g.label}>
            {g.items.map(([v, label]) => (
              <option key={v} value={v}>
                {label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      <h2 className="mt-8">{labels.previewTitle}</h2>
      <iframe
        key={choice.embed}
        src={choice.embed}
        title={title}
        width="100%"
        height={HEIGHT}
        loading="lazy"
        className="mt-4 block w-full max-w-[520px] rounded border border-[var(--color-rule)] bg-white"
      />

      <h2 className="mt-8">{labels.codeTitle}</h2>
      <p>{labels.codeHelp}</p>
      <CodeBox id={`${id}-iframe`} code={iframeCode} button={copied === "iframe" ? labels.copied : labels.copy} onCopy={(area) => copy(iframeCode, "iframe", area)} />

      <h2 className="mt-8">{labels.linkTitle}</h2>
      <p>{labels.linkHelp}</p>
      <CodeBox id={`${id}-link`} code={linkCode} button={copied === "link" ? labels.copied : labels.copy} onCopy={(area) => copy(linkCode, "link", area)} />
    </div>
  );
}

function CodeBox({ id, code, button, onCopy }: { id: string; code: string; button: string; onCopy: (area: HTMLTextAreaElement | null) => void }) {
  return (
    <div className="mt-3">
      <textarea
        id={id}
        readOnly
        value={code}
        rows={code.split("\n").length + 2}
        className="ci-field block w-full font-mono text-xs"
        onFocus={(e) => e.currentTarget.select()}
      />
      <button type="button" className="ci-btn ci-btn-primary mt-2" onClick={() => onCopy(document.getElementById(id) as HTMLTextAreaElement | null)}>
        {button}
      </button>
    </div>
  );
}
