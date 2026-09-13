"use client";

import { useActionState } from "react";

import { createEntryDraft, type ActionResult } from "@/lib/admin/actions";
import { LOCALES, LOCALE_LABEL } from "@/lib/i18n/config";

const TYPES = [
  { value: "guide", label: "Guia" },
  { value: "article", label: "Article" },
  { value: "destination", label: "Destinació" },
  { value: "place", label: "Lloc" },
  { value: "event", label: "Esdeveniment" },
  { value: "route", label: "Ruta" },
  { value: "news", label: "Notícia" },
  { value: "page", label: "Pàgina fixa" },
] as const;

export function NewEntryForm() {
  const [state, formAction, pending] = useActionState<ActionResult | undefined, FormData>(
    createEntryDraft,
    undefined,
  );

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-[10rem_9rem_1fr_1fr_auto]">
      <div>
        <label htmlFor="new-type" className="ci-label mb-1 block">
          Tipus
        </label>
        <select id="new-type" name="type" className="ci-field" defaultValue="guide">
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="new-locale" className="ci-label mb-1 block">
          Idioma
        </label>
        <select id="new-locale" name="locale" className="ci-field" defaultValue="ca">
          {LOCALES.map((l) => (
            <option key={l} value={l}>
              {LOCALE_LABEL[l]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="new-title" className="ci-label mb-1 block">
          Títol
        </label>
        <input id="new-title" name="title" required maxLength={300} className="ci-field" />
      </div>

      <div>
        <label htmlFor="new-path" className="ci-label mb-1 block">
          Ruta (opcional)
        </label>
        <input
          id="new-path"
          name="path"
          placeholder="montserrat/com-arribar-hi"
          className="ci-field"
        />
      </div>

      <div className="flex items-end">
        <button type="submit" className="ci-btn ci-btn-primary" disabled={pending}>
          {pending ? "Creant…" : "Crea esborrany"}
        </button>
      </div>

      {state?.error ? (
        <p role="alert" className="text-sm text-[var(--color-danger)] sm:col-span-5">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
