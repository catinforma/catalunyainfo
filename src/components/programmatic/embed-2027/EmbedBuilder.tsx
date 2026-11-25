"use client";

import { useEffect, useId, useMemo, useState } from "react";

import { track } from "@/lib/analytics/events";
import type { PickerGroup } from "@/lib/programmatic/embed-2027/places";
import { CALENDAR_HEIGHT, iframeSnippet, linkSnippet } from "@/lib/programmatic/embed-2027/snippet";

import { CodeBox } from "./CodeBox";

/**
 * The picker, the live preview and the code to copy. Server-rendered with
 * `initial` (Barcelona, 2027) so the page works without JavaScript; in the
 * browser the choice follows the URL hash a town page links with
 * ("#sabadell", "#andalucia/sevilla") and is written back to it. The year
 * picker offers 2026 for the Catalan towns only (the cities have 2027 only).
 */

export interface BuilderLabels {
  picker: string;
  year: string;
  /** The 2026 option, saying it is for the Catalan towns only. */
  year2026: string;
  previewTitle: string;
  codeTitle: string;
  codeHelp: string;
  copy: string;
  copied: string;
  linkTitle: string;
  linkHelp: string;
  snippetTitle: string;
  snippetTitle2026: string;
}

type Year = 2027 | 2026;

interface Choice {
  value: string;
  label: string;
  embed: string;
  embed2026: string | null;
  page: string;
}

function choicesOf(groups: PickerGroup[]): Map<string, Choice> {
  const out = new Map<string, Choice>();
  for (const g of groups) {
    for (const [value, label, flag] of g.items) {
      const slug = value.split("/").at(-1) ?? value;
      // places.ts PickerGroup: 1 = the page in another language, 2 = the indexable 2027 hub.
      const page = flag === 2 ? g.hubPath : `${flag === 1 && g.altPagePrefix ? g.altPagePrefix : g.pagePrefix}${slug}/`;
      out.set(value, { value, label, embed: `${g.embedPrefix}${value}/`, embed2026: g.embedPrefix2026 ? `${g.embedPrefix2026}${value}/` : null, page });
    }
  }
  return out;
}

export function EmbedBuilder({ groups, initial, origin, labels, locale }: { groups: PickerGroup[]; initial: string; origin: string; labels: BuilderLabels; locale: string }) {
  const id = useId();
  const choices = useMemo(() => choicesOf(groups), [groups]);
  const [value, setValue] = useState(initial);
  const [year, setYear] = useState<Year>(2027);

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

  const picked = choices.get(value) ?? choices.get(initial)!;
  // 2026 exists for the Catalan towns only: a city falls back to the default town.
  const choice = year === 2026 && !picked.embed2026 ? choices.get(initial)! : picked;
  const embed = year === 2026 && choice.embed2026 ? choice.embed2026 : choice.embed;
  const title = `${year === 2026 ? labels.snippetTitle2026 : labels.snippetTitle}: ${choice.label}`;
  const snippet = { origin, embed, page: choice.page, title, height: CALENDAR_HEIGHT };
  const iframeCode = iframeSnippet(snippet);
  const linkCode = linkSnippet(snippet);
  const visible = year === 2026 ? groups.filter((g) => g.embedPrefix2026) : groups;

  function pick(next: string) {
    track({ name: "town_select", params: { tool: "embed_builder_town", locale } });
    setValue(next);
    window.history.replaceState(null, "", `#${next}`);
  }

  return (
    <div className="mt-6">
      <label htmlFor={`${id}-place`} className="block font-semibold">
        {labels.picker}
      </label>
      <select id={`${id}-place`} className="ci-field mt-2 w-full max-w-md" value={choice.value} onChange={(e) => pick(e.target.value)}>
        {visible.map((g) => (
          <optgroup key={g.label} label={g.label}>
            {g.items.map(([v, label]) => (
              <option key={v} value={v}>
                {label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      <label htmlFor={`${id}-year`} className="mt-4 block font-semibold">
        {labels.year}
      </label>
      <select id={`${id}-year`} className="ci-field mt-2 w-full max-w-md" value={year} onChange={(e) => {
          track({ name: "town_select", params: { tool: "embed_builder_year", locale } });
          setYear(e.target.value === "2026" ? 2026 : 2027);
        }}
      >
        <option value="2027">2027</option>
        <option value="2026">{labels.year2026}</option>
      </select>

      <h2 className="mt-8">{labels.previewTitle}</h2>
      <iframe
        key={embed}
        src={embed}
        title={title}
        width="100%"
        height={CALENDAR_HEIGHT}
        loading="lazy"
        className="mt-4 block w-full max-w-[520px] rounded border border-[var(--color-rule)] bg-white"
      />

      <h2 id={`${id}-iframe-title`} className="mt-8">
        {labels.codeTitle}
      </h2>
      <p>{labels.codeHelp}</p>
      <CodeBox key={`i-${embed}`} id={`${id}-iframe`} labelledBy={`${id}-iframe-title`} code={iframeCode} copyLabel={labels.copy} copiedLabel={labels.copied} />

      <h2 id={`${id}-link-title`} className="mt-8">
        {labels.linkTitle}
      </h2>
      <p>{labels.linkHelp}</p>
      <CodeBox key={`l-${embed}`} id={`${id}-link`} labelledBy={`${id}-link-title`} code={linkCode} copyLabel={labels.copy} copiedLabel={labels.copied} />
    </div>
  );
}
