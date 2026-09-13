import { getMessages } from "@/lib/i18n";
import { sectionPath } from "@/lib/i18n/routes";
import type { Locale } from "@/lib/i18n/config";

/**
 * Plain HTML form, no JavaScript.
 *
 * It submits a GET to the localised search page, which renders results on the
 * server. That means search works before hydration, works with JS disabled,
 * and costs nothing on the critical path — and the results page is the only
 * page on the site that is deliberately noindexed.
 */
export function SearchBox({
  locale,
  size = "default",
  defaultValue = "",
  autoFocus = false,
}: {
  locale: Locale;
  size?: "default" | "hero";
  defaultValue?: string;
  autoFocus?: boolean;
}) {
  const t = getMessages(locale);
  const action = sectionPath("search", locale);
  const id = size === "hero" ? "ci-search-hero" : "ci-search";

  if (size === "hero") {
    return (
      <form action={action} method="get" role="search" className="w-full">
        <label htmlFor={id} className="ci-label mb-2 block">
          {t.home.searchLabel}
        </label>
        <div className="ci-ask">
          <input
            id={id}
            type="search"
            name="q"
            defaultValue={defaultValue}
            placeholder={t.common.searchPlaceholder}
            autoComplete="off"
            autoFocus={autoFocus}
            enterKeyHint="search"
          />
          <button type="submit">{t.common.searchSubmit}</button>
        </div>
      </form>
    );
  }

  return (
    <form action={action} method="get" role="search" className="flex gap-2">
      <label htmlFor={id} className="ci-visually-hidden">
        {t.common.search}
      </label>
      <input
        id={id}
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder={t.common.search}
        autoComplete="off"
        enterKeyHint="search"
        className="ci-field max-w-64"
      />
      <button type="submit" className="ci-btn ci-btn-quiet">
        {t.common.searchSubmit}
      </button>
    </form>
  );
}
