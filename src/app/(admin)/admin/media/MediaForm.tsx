"use client";

import { useState, useTransition } from "react";

import { saveMedia, type ActionResult } from "@/lib/admin/actions";

export function MediaForm() {
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(formData: FormData) {
    startTransition(async () => {
      const width = formData.get("width");
      const height = formData.get("height");
      const response = await saveMedia({
        url: formData.get("url"),
        mimeType: formData.get("mimeType") || "image/jpeg",
        width: width ? Number(width) : null,
        height: height ? Number(height) : null,
        credit: formData.get("credit") || null,
        creditUrl: formData.get("creditUrl") || null,
        license: formData.get("license") || null,
        alt: {
          ca: String(formData.get("altCa") ?? ""),
          es: String(formData.get("altEs") ?? ""),
          en: String(formData.get("altEn") ?? ""),
        },
        caption: {},
      });
      setResult(response);
    });
  }

  return (
    <form action={submit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <Input name="url" label="URL" required />
      <Input name="mimeType" label="Tipus MIME" defaultValue="image/jpeg" />
      <Input name="license" label="Llicència" placeholder="CC BY-SA 4.0" />
      <Input name="width" label="Amplada (px)" type="number" />
      <Input name="height" label="Alçada (px)" type="number" />
      <Input name="credit" label="Crèdit" />
      <Input name="creditUrl" label="URL del crèdit" />
      <Input name="altCa" label="Alt (CA)" />
      <Input name="altEs" label="Alt (ES)" />
      <Input name="altEn" label="Alt (EN)" />

      <div className="flex items-end">
        <button type="submit" className="ci-btn ci-btn-primary" disabled={pending}>
          {pending ? "Desant…" : "Desa"}
        </button>
      </div>

      {result ? (
        <p
          role="status"
          className={
            result.ok
              ? "text-sm text-[var(--color-moss)] sm:col-span-2 lg:col-span-3"
              : "text-sm text-[var(--color-danger)] sm:col-span-2 lg:col-span-3"
          }
        >
          {result.ok ? "Desat." : result.error}
        </p>
      ) : null}
    </form>
  );
}

function Input({
  name,
  label,
  type = "text",
  required = false,
  defaultValue,
  placeholder,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={`media-${name}`} className="ci-label mb-1 block">
        {label}
      </label>
      <input
        id={`media-${name}`}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="ci-field"
      />
    </div>
  );
}
