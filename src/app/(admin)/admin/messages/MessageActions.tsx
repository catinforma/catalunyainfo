"use client";

import { useState, useTransition } from "react";

import { deleteContactMessage, setContactStatus } from "@/lib/admin/actions";
import type { ContactMessage } from "@/lib/db/schema";

/**
 * Status controls for one message.
 *
 * There is no edit control on purpose: an inbox that can rewrite what somebody
 * sent stops being a record of what they sent. Only the status changes, and
 * deletion — which is how a deletion request is honoured — is separate and
 * asks first.
 */
const STATUSES: { value: ContactMessage["status"]; label: string }[] = [
  { value: "new", label: "Nou" },
  { value: "read", label: "Llegit" },
  { value: "answered", label: "Respost" },
  { value: "spam", label: "Brossa" },
];

export function MessageActions({ message }: { message: ContactMessage }) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(status: ContactMessage["status"]) {
    setError(null);
    startTransition(async () => {
      const result = await setContactStatus({ id: message.id, status });
      if (!result.ok) setError(result.error ?? "No s'ha pogut desar.");
    });
  }

  function remove() {
    setError(null);
    startTransition(async () => {
      const result = await deleteContactMessage({ id: message.id });
      if (!result.ok) setError(result.error ?? "No s'ha pogut esborrar.");
      setConfirming(false);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="sr-only" htmlFor={`status-${message.id}`}>
        Estat del missatge
      </label>
      <select
        id={`status-${message.id}`}
        className="ci-field w-auto text-xs"
        defaultValue={message.status}
        disabled={pending}
        onChange={(event) => update(event.target.value as ContactMessage["status"])}
      >
        {STATUSES.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </select>

      {confirming ? (
        <>
          <button
            type="button"
            className="ci-btn ci-btn-quiet text-xs"
            disabled={pending}
            onClick={remove}
          >
            Esborrar definitivament
          </button>
          <button
            type="button"
            className="ci-btn ci-btn-quiet text-xs"
            disabled={pending}
            onClick={() => setConfirming(false)}
          >
            Cancel·la
          </button>
        </>
      ) : (
        <button
          type="button"
          className="ci-btn ci-btn-quiet text-xs"
          disabled={pending}
          onClick={() => setConfirming(true)}
        >
          Esborrar
        </button>
      )}

      {error ? <span className="text-xs text-[var(--color-amber)]">{error}</span> : null}
    </div>
  );
}
