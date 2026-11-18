"use client";

import { useId, useMemo, useState } from "react";

import { useCalculatorUse } from "@/lib/analytics/use-calculator-use";
import { CHECKER_COPY, COMMUNITY_LABEL, displayName, matchTowns, townAnswer, type CheckerTown, type Context, type ZtLocale } from "@/lib/programmatic/zona-tensionada/copy";
import { SOURCES } from "@/lib/programmatic/zona-tensionada/rules";

/**
 * "¿Está tu municipio en zona tensionada?": type a town, pick it, read the
 * answer (declared or not, since and until when, the Generalitat's 2026 acts)
 * and what changes for a tenant. Every town of Catalonia is in `towns`, and
 * every declared town elsewhere. Server-rendered on `initial` (Barcelona), so
 * the answer is in the HTML without JavaScript.
 */

export function ZonaTensionadaChecker({ locale, towns, ctx, initial }: { locale: ZtLocale; towns: CheckerTown[]; ctx: Context; initial: string }) {
  const t = CHECKER_COPY[locale];
  const id = useId();
  const start = towns.find((x) => x.ine === initial) ?? towns[0]!;
  const [query, setQuery] = useState(displayName(start.name));
  const [picked, setPicked] = useState<CheckerTown>(start);

  const matches = useMemo(() => (query.trim() === displayName(picked.name) ? [] : matchTowns(towns, query)), [query, picked, towns]);
  const exact = matches.length === 1 ? matches[0] : undefined;
  const town = exact ?? picked;
  const noMatch = query.trim().length >= 2 && matches.length === 0 && query.trim() !== displayName(picked.name);
  const answer = townAnswer(town, ctx, locale);

  // First result change by the visitor, once per session (lib/analytics/calculator-use.ts).
  const calcUse = useCalculatorUse("zona-tensionada", locale, town.ine);

  const pick = (x: CheckerTown) => {
    setPicked(x);
    setQuery(displayName(x.name));
  };

  return (
    <section className="ci-calc" {...calcUse} aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="ci-calc-title">
        {t.title}
      </h2>
      <p className="ci-calc-intro">{t.intro}</p>
      <noscript>
        <p className="ci-calc-note">{t.noscript}</p>
      </noscript>

      <div className="ci-calc-inputs">
        <p className="ci-calc-row ci-calc-wide">
          <label htmlFor={`${id}-town`}>{t.label}</label>
          <input
            id={`${id}-town`}
            className="ci-field"
            type="search"
            autoComplete="off"
            spellCheck={false}
            placeholder={t.placeholder}
            aria-describedby={`${id}-hint`}
            aria-controls={`${id}-matches`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && matches[0]) {
                e.preventDefault();
                pick(matches[0]);
              }
            }}
          />
          <span id={`${id}-hint`} className="ci-calc-note">
            {t.hint}
          </span>
        </p>
        {matches.length > 1 ? (
          <div id={`${id}-matches`} className="ci-calc-row ci-calc-wide">
            <span className="text-sm font-medium">{t.results}</span>
            <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
              {matches.map((m) => (
                <li key={m.ine}>
                  <button type="button" className="ci-btn ci-btn-quiet" onClick={() => pick(m)}>
                    {displayName(m.name)} <span className="text-[var(--color-muted)]">· {COMMUNITY_LABEL[m.community][locale]}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div id={`${id}-matches`} hidden />
        )}
      </div>

      <div aria-live="polite">
        {noMatch ? (
          <p role="status">{t.noMatch(query.trim())}</p>
        ) : (
          <>
            <dl className="ci-calc-results">
              <div className="ci-calc-total">
                <dt>
                  {displayName(town.name)} · {COMMUNITY_LABEL[town.community][locale]}
                </dt>
                <dd>{answer.headline}</dd>
              </div>
            </dl>
            {answer.lines.map((line) => (
              <p key={line} className="ci-calc-note">
                {line}
              </p>
            ))}
            {answer.changesTitle ? (
              <>
                <p className="ci-calc-note font-medium">{answer.changesTitle}</p>
                <ul className="ci-calc-note">
                  {answer.changes.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
                <p className="ci-calc-note">
                  <a href={SOURCES.serpaviApp.url} rel="noopener" target="_blank">
                    {t.index}
                  </a>
                  . {t.indexNote}
                </p>
              </>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
