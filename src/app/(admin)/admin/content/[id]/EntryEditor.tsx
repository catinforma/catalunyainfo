"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  saveEntryMeta,
  saveTranslation,
  setTranslationStatus,
  createTranslationDraft,
  type ActionResult,
} from "@/lib/admin/actions";
import type { Block } from "@/lib/content/blocks";
import { bodyToPlainText, readingMinutes, wordCount } from "@/lib/content/blocks";
import { LOCALES, LOCALE_LABEL, type Locale } from "@/lib/i18n/config";
import type { EntryStatus, EntryType } from "@/lib/db/schema";
import { BlockEditor, type EditorOptions } from "./BlockEditor";

export interface EditorInitialState {
  translationId: string;
  entryId: string;
  locale: Locale;
  status: EntryStatus;
  title: string;
  slug: string;
  path: string;
  excerpt: string;
  body: Block[];
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
  noindex: boolean;
  publishedAt: string;
  scheduledFor: string;
  lastVerifiedAt: string;
  reviewDueAt: string;
  tagIds: string[];
  categoryIds: string[];
  relatedEntryIds: string[];
  sources: { sourceId: string; note: string; accessedAt: string }[];
  entry: {
    type: EntryType;
    key: string;
    primaryCategoryId: string;
    authorId: string;
    heroMediaId: string;
    parentId: string;
    isFeatured: boolean;
    isDemo: boolean;
  };
  siblingLocales: Locale[];
}

const STATUS_OPTIONS: { value: EntryStatus; label: string }[] = [
  { value: "draft", label: "Esborrany" },
  { value: "review", label: "En revisió" },
  { value: "ready", label: "A punt" },
  { value: "scheduled", label: "Programat" },
  { value: "published", label: "Publicat" },
  { value: "needs_update", label: "Cal actualitzar" },
  { value: "archived", label: "Arxivat" },
];

/**
 * The editing screen.
 *
 * Content and metadata are saved together in one action so a page can never end
 * up half-saved. The word count and the SEO field lengths are shown live
 * because they are the two things an editor otherwise only discovers after
 * publishing.
 */
export function EntryEditor({
  initial,
  options,
}: {
  initial: EditorInitialState;
  options: EditorOptions & {
    authors: { id: string; name: string }[];
    categories: { id: string; name: string; section: string }[];
    tags: { id: string; name: string }[];
  };
}) {
  const router = useRouter();
  const [state, setState] = useState(initial);
  const [message, setMessage] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  const plain = bodyToPlainText(state.body);
  const words = wordCount(plain);

  function set<K extends keyof EditorInitialState>(key: K, value: EditorInitialState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  function setEntry<K extends keyof EditorInitialState["entry"]>(
    key: K,
    value: EditorInitialState["entry"][K],
  ) {
    setState((prev) => ({ ...prev, entry: { ...prev.entry, [key]: value } }));
  }

  function save() {
    startTransition(async () => {
      const metaResult = await saveEntryMeta({
        entryId: state.entryId,
        type: state.entry.type,
        key: state.entry.key || null,
        primaryCategoryId: state.entry.primaryCategoryId || null,
        authorId: state.entry.authorId || null,
        heroMediaId: state.entry.heroMediaId || null,
        parentId: state.entry.parentId || null,
        isFeatured: state.entry.isFeatured,
        isDemo: state.entry.isDemo,
      });

      if (!metaResult.ok) {
        setMessage(metaResult);
        return;
      }

      const result = await saveTranslation({
        translationId: state.translationId,
        entryId: state.entryId,
        locale: state.locale,
        status: state.status,
        title: state.title,
        slug: state.slug,
        path: state.path,
        excerpt: state.excerpt || null,
        body: state.body,
        seoTitle: state.seoTitle || null,
        seoDescription: state.seoDescription || null,
        canonicalUrl: state.canonicalUrl || null,
        noindex: state.noindex,
        publishedAt: state.publishedAt || undefined,
        scheduledFor: state.scheduledFor || undefined,
        lastVerifiedAt: state.lastVerifiedAt || undefined,
        reviewDueAt: state.reviewDueAt || undefined,
        tagIds: state.tagIds,
        categoryIds: state.categoryIds,
        relatedEntryIds: state.relatedEntryIds,
        sources: state.sources.map((s) => ({
          sourceId: s.sourceId,
          note: s.note || null,
          accessedAt: s.accessedAt || undefined,
        })),
      });

      setMessage(result.ok ? { ok: true, error: undefined } : result);
    });
  }

  function transition(status: EntryStatus) {
    startTransition(async () => {
      const result = await setTranslationStatus(
        state.translationId,
        status as Exclude<EntryStatus, "scheduled">,
      );
      if (result.ok) set("status", status);
      setMessage(result);
    });
  }

  function startTranslation(target: Locale) {
    startTransition(async () => {
      const result = await createTranslationDraft(state.entryId, state.locale, target);
      setMessage(result);
      if (result.ok && result.id) router.push(`/admin/content/${result.id}`);
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div>
        <div className="flex flex-col gap-3">
          <div>
            <label htmlFor="ed-title" className="ci-label mb-1 block">
              Títol
            </label>
            <input
              id="ed-title"
              className="ci-field text-lg"
              value={state.title}
              onChange={(e) => set("title", e.target.value)}
              maxLength={300}
            />
          </div>

          <div>
            <label htmlFor="ed-excerpt" className="ci-label mb-1 block">
              Entradilla
            </label>
            <textarea
              id="ed-excerpt"
              className="ci-field min-h-20"
              value={state.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
              maxLength={600}
            />
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              {state.excerpt.length}/600
            </p>
          </div>
        </div>

        <h2 className="mt-8 font-sans text-base font-semibold">Cos</h2>
        <p className="mb-3 text-xs text-[var(--color-muted)]">
          {words} paraules · {readingMinutes(plain)} min de lectura
        </p>

        <BlockEditor
          blocks={state.body}
          onChange={(next) => set("body", next)}
          options={options}
        />
      </div>

      <aside className="flex flex-col gap-6 lg:sticky lg:top-4 lg:self-start">
        <section className="border border-[var(--color-rule)] bg-[var(--color-surface)] p-4">
          <h2 className="font-sans text-base font-semibold">Publicació</h2>

          <div className="mt-3 flex flex-col gap-3">
            <div>
              <label htmlFor="ed-status" className="ci-label mb-1 block">
                Estat
              </label>
              <select
                id="ed-status"
                className="ci-field"
                value={state.status}
                onChange={(e) => set("status", e.target.value as EntryStatus)}
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="ed-scheduled" className="ci-label mb-1 block">
                Programat per a
              </label>
              <input
                id="ed-scheduled"
                type="datetime-local"
                className="ci-field"
                value={state.scheduledFor}
                onChange={(e) => set("scheduledFor", e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="ed-verified" className="ci-label mb-1 block">
                Verificat el
              </label>
              <input
                id="ed-verified"
                type="date"
                className="ci-field"
                value={state.lastVerifiedAt}
                onChange={(e) => set("lastVerifiedAt", e.target.value)}
              />
              <p className="mt-1 text-xs text-[var(--color-muted)]">
                Data en què una persona ha comprovat les dades.
              </p>
            </div>

            <div>
              <label htmlFor="ed-review" className="ci-label mb-1 block">
                Reverificar abans de
              </label>
              <input
                id="ed-review"
                type="date"
                className="ci-field"
                value={state.reviewDueAt}
                onChange={(e) => set("reviewDueAt", e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className="ci-btn ci-btn-primary"
              onClick={save}
              disabled={pending}
            >
              {pending ? "Desant…" : "Desa"}
            </button>
            <button
              type="button"
              className="ci-btn ci-btn-quiet"
              onClick={() => transition("review")}
              disabled={pending}
            >
              A revisió
            </button>
            <button
              type="button"
              className="ci-btn ci-btn-quiet"
              onClick={() => transition("published")}
              disabled={pending}
            >
              Publica
            </button>
            <a
              className="ci-btn ci-btn-quiet"
              href={`/${state.locale}/${state.path}/`}
              target="_blank"
              rel="noopener"
            >
              Previsualitza
            </a>
          </div>

          {message ? (
            <p
              role="status"
              className={
                message.ok
                  ? "mt-3 text-sm text-[var(--color-moss)]"
                  : "mt-3 text-sm text-[var(--color-danger)]"
              }
            >
              {message.ok ? "Desat." : message.error}
            </p>
          ) : null}
        </section>

        <section className="border border-[var(--color-rule)] bg-[var(--color-surface)] p-4">
          <h2 className="font-sans text-base font-semibold">URL</h2>
          <div className="mt-3 flex flex-col gap-3">
            <div>
              <label htmlFor="ed-path" className="ci-label mb-1 block">
                Ruta
              </label>
              <input
                id="ed-path"
                className="ci-field font-mono text-sm"
                value={state.path}
                onChange={(e) => set("path", e.target.value)}
              />
              <p className="mt-1 text-xs text-[var(--color-muted)]">
                /{state.locale}/{state.path}/
              </p>
            </div>
            <div>
              <label htmlFor="ed-slug" className="ci-label mb-1 block">
                Slug
              </label>
              <input
                id="ed-slug"
                className="ci-field font-mono text-sm"
                value={state.slug}
                onChange={(e) => set("slug", e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="border border-[var(--color-rule)] bg-[var(--color-surface)] p-4">
          <h2 className="font-sans text-base font-semibold">SEO</h2>
          <div className="mt-3 flex flex-col gap-3">
            <div>
              <label htmlFor="ed-seotitle" className="ci-label mb-1 block">
                Títol SEO
              </label>
              <input
                id="ed-seotitle"
                className="ci-field"
                value={state.seoTitle}
                onChange={(e) => set("seoTitle", e.target.value)}
                maxLength={200}
              />
              <p className="mt-1 text-xs text-[var(--color-muted)]">
                {(state.seoTitle || state.title).length} caràcters. Google en mostra uns 60.
              </p>
            </div>
            <div>
              <label htmlFor="ed-seodesc" className="ci-label mb-1 block">
                Meta descripció
              </label>
              <textarea
                id="ed-seodesc"
                className="ci-field min-h-20"
                value={state.seoDescription}
                onChange={(e) => set("seoDescription", e.target.value)}
                maxLength={400}
              />
              <p className="mt-1 text-xs text-[var(--color-muted)]">
                {(state.seoDescription || state.excerpt).length} caràcters. Uns 155 es mostren.
              </p>
            </div>
            <div>
              <label htmlFor="ed-canonical" className="ci-label mb-1 block">
                Canonical alternatiu
              </label>
              <input
                id="ed-canonical"
                className="ci-field font-mono text-sm"
                value={state.canonicalUrl}
                onChange={(e) => set("canonicalUrl", e.target.value)}
                placeholder="Deixa-ho buit per autocanonical"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={state.noindex}
                onChange={(e) => set("noindex", e.target.checked)}
              />
              No indexar
            </label>
          </div>
        </section>

        <section className="border border-[var(--color-rule)] bg-[var(--color-surface)] p-4">
          <h2 className="font-sans text-base font-semibold">Fitxa</h2>
          <div className="mt-3 flex flex-col gap-3">
            <div>
              <label htmlFor="ed-author" className="ci-label mb-1 block">
                Autor
              </label>
              <select
                id="ed-author"
                className="ci-field"
                value={state.entry.authorId}
                onChange={(e) => setEntry("authorId", e.target.value)}
              >
                <option value="">—</option>
                {options.authors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="ed-category" className="ci-label mb-1 block">
                Categoria principal
              </label>
              <select
                id="ed-category"
                className="ci-field"
                value={state.entry.primaryCategoryId}
                onChange={(e) => setEntry("primaryCategoryId", e.target.value)}
              >
                <option value="">—</option>
                {options.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.section} · {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="ed-hero" className="ci-label mb-1 block">
                Imatge principal
              </label>
              <select
                id="ed-hero"
                className="ci-field"
                value={state.entry.heroMediaId}
                onChange={(e) => setEntry("heroMediaId", e.target.value)}
              >
                <option value="">—</option>
                {options.media.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.alt?.ca || m.url.split("/").pop()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="ed-tags" className="ci-label mb-1 block">
                Etiquetes
              </label>
              <select
                id="ed-tags"
                multiple
                className="ci-field min-h-24"
                value={state.tagIds}
                onChange={(e) =>
                  set("tagIds", [...e.target.selectedOptions].map((o) => o.value))
                }
              >
                {options.tags.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={state.entry.isFeatured}
                onChange={(e) => setEntry("isFeatured", e.target.checked)}
              />
              Destacat a la portada
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={state.entry.isDemo}
                onChange={(e) => setEntry("isDemo", e.target.checked)}
              />
              Dada de prova (DEMO, mai pública)
            </label>
          </div>
        </section>

        <section className="border border-[var(--color-rule)] bg-[var(--color-surface)] p-4">
          <h2 className="font-sans text-base font-semibold">Fonts</h2>
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            Cita la font oficial sempre que sigui possible.
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {state.sources.map((source, i) => (
              <div key={i} className="flex gap-2">
                <select
                  className="ci-field"
                  value={source.sourceId}
                  onChange={(e) => {
                    const copy = state.sources.slice();
                    copy[i] = { ...source, sourceId: e.target.value };
                    set("sources", copy);
                  }}
                >
                  <option value="">—</option>
                  {options.sources.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="ci-btn ci-btn-quiet"
                  onClick={() => set("sources", state.sources.filter((_, j) => j !== i))}
                  aria-label={`Elimina font ${i + 1}`}
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              className="ci-btn ci-btn-quiet self-start"
              onClick={() =>
                set("sources", [...state.sources, { sourceId: "", note: "", accessedAt: "" }])
              }
            >
              Afegeix font
            </button>
          </div>
        </section>

        <section className="border border-[var(--color-rule)] bg-[var(--color-surface)] p-4">
          <h2 className="font-sans text-base font-semibold">Idiomes</h2>
          <ul className="mt-3 flex list-none flex-col gap-2 p-0 text-sm">
            {LOCALES.map((l) => (
              <li key={l} className="flex items-center justify-between gap-2">
                <span>{LOCALE_LABEL[l]}</span>
                {l === state.locale ? (
                  <span className="text-xs text-[var(--color-muted)]">actual</span>
                ) : state.siblingLocales.includes(l) ? (
                  <span className="text-xs text-[var(--color-moss)]">existeix</span>
                ) : (
                  <button
                    type="button"
                    className="ci-btn ci-btn-quiet"
                    onClick={() => startTranslation(l)}
                    disabled={pending}
                  >
                    Crea esborrany
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      </aside>
    </div>
  );
}
