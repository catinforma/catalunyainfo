"use client";

import { useId, useState } from "react";

import { CodeBox } from "@/components/programmatic/embed-2027/CodeBox";
import { CALC_BOX_COPY } from "@/lib/programmatic/embed-calc/copy";
import { WORKING_DAYS_HEIGHT, workingDaysEmbedPath, type CalcEmbedLocale } from "@/lib/programmatic/embed-calc/paths";
import { iframeSnippet } from "@/lib/programmatic/embed-2027/snippet";
import { NATIONAL_ID, workingDaysPath, type WdData } from "@/lib/programmatic/working-days/copy";

/**
 * The working-days calculator's "embed this" code, with the place picked from
 * the calculator's own list (`data` is the object the calculator already gets:
 * the RSC payload sends it once). Server-rendered with all of Spain, so the
 * code is in the HTML without JavaScript.
 */
export function WorkingDaysEmbedPicker({ locale, data, origin }: { locale: CalcEmbedLocale; data: WdData; origin: string }) {
  const id = useId();
  const t = CALC_BOX_COPY[locale];
  const [value, setValue] = useState(NATIONAL_ID);
  const label = data.groups.flatMap((g) => g.items).find((i) => i[0] === value)?.[1] ?? value;
  const code = iframeSnippet({
    origin,
    embed: workingDaysEmbedPath(locale, value === NATIONAL_ID ? null : value),
    page: workingDaysPath(locale),
    title: t.wdTitle(label),
    height: WORKING_DAYS_HEIGHT,
  });
  return (
    <>
      <label htmlFor={`${id}-place`} className="block font-semibold">
        {t.place}
      </label>
      <select id={`${id}-place`} className="ci-field mt-2 w-full max-w-md" value={value} aria-describedby={`${id}-help`} onChange={(e) => setValue(e.target.value)}>
        {data.groups.map((g) => (
          <optgroup key={g.label} label={g.label}>
            {g.items.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <p id={`${id}-help`} className="text-sm text-[var(--color-muted)]">
        {t.placeHelp}
      </p>
      <CodeBox key={value} id={`${id}-code`} label={t.codeLabel} code={code} copyLabel={t.copy} copiedLabel={t.copied} />
    </>
  );
}
