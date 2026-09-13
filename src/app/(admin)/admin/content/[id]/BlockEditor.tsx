"use client";

import { useId } from "react";

import { BLOCK_SPECS, BLOCK_SPEC_BY_TYPE, type FieldSpec } from "@/lib/admin/block-fields";
import type { Block, BlockType } from "@/lib/content/blocks";

export interface EditorOptions {
  media: { id: string; url: string; alt: Record<string, string> | null }[];
  sources: { id: string; name: string }[];
  entries: { id: string; title: string }[];
}

type Draft = Record<string, unknown>;

/**
 * The block list editor.
 *
 * Every block is edited through the same declarative field renderer, so the UI
 * cannot drift from the content schema. Reordering is done with buttons rather
 * than drag and drop: buttons work with a keyboard and a screen reader, and
 * this editor is used by people writing long reference pages, not by people
 * arranging a mood board.
 */
export function BlockEditor({
  blocks,
  onChange,
  options,
}: {
  blocks: Block[];
  onChange: (next: Block[]) => void;
  options: EditorOptions;
}) {
  function update(index: number, next: Draft) {
    const copy = blocks.slice();
    copy[index] = next as Block;
    onChange(copy);
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= blocks.length) return;
    const copy = blocks.slice();
    const [item] = copy.splice(index, 1);
    if (item) copy.splice(target, 0, item);
    onChange(copy);
  }

  function remove(index: number) {
    onChange(blocks.filter((_, i) => i !== index));
  }

  function insert(type: BlockType, at: number) {
    const spec = BLOCK_SPEC_BY_TYPE.get(type);
    if (!spec) return;
    const copy = blocks.slice();
    copy.splice(at, 0, structuredClone(spec.initial) as Block);
    onChange(copy);
  }

  return (
    <div className="flex flex-col gap-4">
      {blocks.map((block, index) => {
        const spec = BLOCK_SPEC_BY_TYPE.get(block.type);
        return (
          <fieldset
            key={index}
            className="border border-[var(--color-rule)] bg-[var(--color-surface)] p-4"
          >
            <legend className="flex items-center gap-2 px-1 text-sm font-semibold">
              {spec?.label ?? block.type}
            </legend>

            <div className="mb-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="ci-btn ci-btn-quiet"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label={`Move ${spec?.label} up`}
              >
                Amunt
              </button>
              <button
                type="button"
                className="ci-btn ci-btn-quiet"
                onClick={() => move(index, 1)}
                disabled={index === blocks.length - 1}
                aria-label={`Move ${spec?.label} down`}
              >
                Avall
              </button>
              <button
                type="button"
                className="ci-btn ci-btn-quiet"
                onClick={() => remove(index)}
                aria-label={`Remove ${spec?.label}`}
              >
                Elimina
              </button>
            </div>

            {spec?.description ? (
              <p className="mb-3 text-xs text-[var(--color-muted)]">{spec.description}</p>
            ) : null}

            <div className="flex flex-col gap-3">
              {spec?.fields.map((field) => (
                <Field
                  key={field.key}
                  spec={field}
                  value={(block as Draft)[field.key]}
                  onChange={(value) => update(index, { ...(block as Draft), [field.key]: value })}
                  options={options}
                />
              ))}
            </div>

            <AddBlock onInsert={(type) => insert(type, index + 1)} label="Insereix a sota" />
          </fieldset>
        );
      })}

      <AddBlock onInsert={(type) => insert(type, blocks.length)} label="Afegeix un bloc" />
    </div>
  );
}

function AddBlock({
  onInsert,
  label,
}: {
  onInsert: (type: BlockType) => void;
  label: string;
}) {
  const id = useId();
  return (
    <div className="mt-3 flex items-end gap-2">
      <div>
        <label htmlFor={id} className="ci-label mb-1 block">
          {label}
        </label>
        <select
          id={id}
          className="ci-field"
          defaultValue=""
          onChange={(event) => {
            const value = event.target.value as BlockType | "";
            if (value) onInsert(value);
            event.target.value = "";
          }}
        >
          <option value="">—</option>
          {BLOCK_SPECS.map((spec) => (
            <option key={spec.type} value={spec.type}>
              {spec.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Field renderer                                                             */
/* -------------------------------------------------------------------------- */

function Field({
  spec,
  value,
  onChange,
  options,
}: {
  spec: FieldSpec;
  value: unknown;
  onChange: (value: unknown) => void;
  options: EditorOptions;
}) {
  const id = useId();

  const label = (
    <label htmlFor={id} className="ci-label mb-1 block">
      {spec.label}
      {spec.required ? <span aria-hidden="true"> *</span> : null}
    </label>
  );

  const help = spec.help ? (
    <p className="mt-1 text-xs text-[var(--color-muted)]">{spec.help}</p>
  ) : null;

  switch (spec.kind) {
    case "boolean":
      return (
        <div className="flex items-center gap-2">
          <input
            id={id}
            type="checkbox"
            checked={value === true}
            onChange={(e) => onChange(e.target.checked)}
          />
          <label htmlFor={id} className="text-sm">
            {spec.label}
          </label>
        </div>
      );

    case "number":
      return (
        <div>
          {label}
          <input
            id={id}
            type="number"
            className="ci-field"
            value={typeof value === "number" ? value : ""}
            min={spec.min}
            max={spec.max}
            step={spec.step ?? 1}
            onChange={(e) =>
              onChange(e.target.value === "" ? undefined : Number(e.target.value))
            }
          />
          {help}
        </div>
      );

    case "select":
      return (
        <div>
          {label}
          <select
            id={id}
            className="ci-field"
            value={String(value ?? spec.options?.[0]?.value ?? "")}
            onChange={(e) => {
              const raw = e.target.value;
              const numeric = Number(raw);
              onChange(spec.key === "level" && Number.isFinite(numeric) ? numeric : raw);
            }}
          >
            {spec.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {help}
        </div>
      );

    case "richText":
    case "textarea":
      return (
        <div>
          {label}
          <textarea
            id={id}
            className="ci-field min-h-24 font-mono text-sm"
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
          />
          {help}
        </div>
      );

    case "media":
      return (
        <div>
          {label}
          <select
            id={id}
            className="ci-field"
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value || undefined)}
          >
            <option value="">—</option>
            {options.media.map((m) => (
              <option key={m.id} value={m.id}>
                {m.alt?.ca || m.alt?.es || m.alt?.en || m.url.split("/").pop()}
              </option>
            ))}
          </select>
          {help}
        </div>
      );

    case "sourceRef":
      return (
        <div>
          {label}
          <select
            id={id}
            className="ci-field"
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value || undefined)}
          >
            <option value="">—</option>
            {options.sources.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      );

    case "mediaList":
    case "entryList": {
      const list = Array.isArray(value) ? (value as string[]) : [];
      const pool = spec.kind === "mediaList" ? options.media : options.entries;
      return (
        <div>
          {label}
          <select
            id={id}
            multiple
            className="ci-field min-h-32"
            value={list}
            onChange={(e) =>
              onChange([...e.target.selectedOptions].map((option) => option.value))
            }
          >
            {pool.map((item) => (
              <option key={item.id} value={item.id}>
                {"title" in item ? item.title : item.url}
              </option>
            ))}
          </select>
          {help}
        </div>
      );
    }

    case "stringList": {
      const list = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div>
          {label}
          <div className="flex flex-col gap-2">
            {list.map((item, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className="ci-field"
                  value={item}
                  onChange={(e) => {
                    const copy = list.slice();
                    copy[i] = e.target.value;
                    onChange(copy);
                  }}
                />
                <button
                  type="button"
                  className="ci-btn ci-btn-quiet"
                  onClick={() => onChange(list.filter((_, j) => j !== i))}
                  aria-label={`Remove item ${i + 1}`}
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              className="ci-btn ci-btn-quiet self-start"
              onClick={() => onChange([...list, ""])}
            >
              Afegeix
            </button>
          </div>
          {help}
        </div>
      );
    }

    case "table": {
      const rows = Array.isArray(value) ? (value as string[][]) : [];
      const width = rows[0]?.length ?? 2;
      return (
        <div>
          {label}
          <div className="flex flex-col gap-2">
            {rows.map((row, r) => (
              <div key={r} className="flex gap-2">
                {row.map((cell, c) => (
                  <input
                    key={c}
                    className="ci-field"
                    value={cell}
                    onChange={(e) => {
                      const copy = rows.map((x) => x.slice());
                      const target = copy[r];
                      if (target) target[c] = e.target.value;
                      onChange(copy);
                    }}
                  />
                ))}
                <button
                  type="button"
                  className="ci-btn ci-btn-quiet"
                  onClick={() => onChange(rows.filter((_, j) => j !== r))}
                  aria-label={`Remove row ${r + 1}`}
                >
                  ×
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <button
                type="button"
                className="ci-btn ci-btn-quiet"
                onClick={() => onChange([...rows, Array.from({ length: width }, () => "")])}
              >
                Afegeix fila
              </button>
              <button
                type="button"
                className="ci-btn ci-btn-quiet"
                onClick={() => onChange(rows.map((row) => [...row, ""]))}
              >
                Afegeix columna
              </button>
            </div>
          </div>
          {help}
        </div>
      );
    }

    case "objectList": {
      const list = Array.isArray(value) ? (value as Draft[]) : [];
      return (
        <div>
          <p className="ci-label mb-1">{spec.label}</p>
          <div className="flex flex-col gap-3">
            {list.map((item, i) => (
              <div
                key={i}
                className="border border-[var(--color-rule)] bg-[var(--color-surface-sunk)] p-3"
              >
                <div className="flex flex-col gap-2">
                  {spec.itemFields?.map((sub) => (
                    <Field
                      key={sub.key}
                      spec={sub}
                      value={item[sub.key]}
                      onChange={(next) => {
                        const copy = list.slice();
                        copy[i] = { ...item, [sub.key]: next };
                        onChange(copy);
                      }}
                      options={options}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  className="ci-btn ci-btn-quiet mt-2"
                  onClick={() => onChange(list.filter((_, j) => j !== i))}
                >
                  Elimina
                </button>
              </div>
            ))}
            <button
              type="button"
              className="ci-btn ci-btn-quiet self-start"
              onClick={() => onChange([...list, {}])}
            >
              Afegeix
            </button>
          </div>
          {help}
        </div>
      );
    }

    default:
      return (
        <div>
          {label}
          <input
            id={id}
            className="ci-field"
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value || undefined)}
          />
          {help}
        </div>
      );
  }
}
