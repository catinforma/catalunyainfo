"use client";

import { useActionState } from "react";

import { signIn, type ActionResult } from "@/lib/admin/actions";

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<ActionResult | undefined, FormData>(
    signIn,
    undefined,
  );

  return (
    <form action={formAction} className="flex max-w-sm flex-col gap-4">
      <input type="hidden" name="next" value={next} />

      <div>
        <label htmlFor="email" className="ci-label mb-1 block">
          Correu electrònic
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          className="ci-field"
        />
      </div>

      <div>
        <label htmlFor="password" className="ci-label mb-1 block">
          Contrasenya
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="ci-field"
        />
      </div>

      {state?.error ? (
        <p role="alert" className="text-sm text-[var(--color-danger)]">
          {state.error}
        </p>
      ) : null}

      <button type="submit" className="ci-btn ci-btn-primary" disabled={pending}>
        {pending ? "Entrant…" : "Entra"}
      </button>
    </form>
  );
}
