"use client";

import { useState, useTransition } from "react";

import { saveRedirect, type ActionResult } from "@/lib/admin/actions";

export function RedirectForm() {
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(formData: FormData) {
    startTransition(async () => {
      const response = await saveRedirect({
        fromPath: formData.get("fromPath"),
        toPath: formData.get("toPath") || null,
        kind: formData.get("kind"),
        note: formData.get("note") || null,
      });
      setResult(response);
    });
  }

  return (
    <form action={submit} className="grid gap-3 sm:grid-cols-[1fr_1fr_10rem_1fr_auto]">
      <div>
        <label htmlFor="r-from" className="ci-label mb-1 block">
          Des de
        </label>
        <input id="r-from" name="fromPath" required placeholder="/ca/vella-ruta/" className="ci-field" />
      </div>
      <div>
        <label htmlFor="r-to" className="ci-label mb-1 block">
          Cap a
        </label>
        <input id="r-to" name="toPath" placeholder="/ca/nova-ruta/" className="ci-field" />
      </div>
      <div>
        <label htmlFor="r-kind" className="ci-label mb-1 block">
          Tipus
        </label>
        <select id="r-kind" name="kind" className="ci-field" defaultValue="permanent">
          <option value="permanent">301 permanent</option>
          <option value="temporary">307 temporal</option>
          <option value="gone">410 eliminat</option>
        </select>
      </div>
      <div>
        <label htmlFor="r-note" className="ci-label mb-1 block">
          Nota
        </label>
        <input id="r-note" name="note" className="ci-field" />
      </div>
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
              ? "text-sm text-[var(--color-moss)] sm:col-span-5"
              : "text-sm text-[var(--color-danger)] sm:col-span-5"
          }
        >
          {result.ok ? "Desat." : result.error}
        </p>
      ) : null}
    </form>
  );
}
