import Link from "next/link";
import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth/session";
import { dueForReview, statusCounts, translationGaps } from "@/lib/admin/queries";
import { buildReadinessReport } from "@/lib/admin/readiness";
import { isDatabaseConfigured } from "@/lib/db/client";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_ORDER = [
  "draft",
  "review",
  "ready",
  "scheduled",
  "published",
  "needs_update",
  "archived",
] as const;

const STATUS_LABEL: Record<(typeof STATUS_ORDER)[number], string> = {
  draft: "Esborrany",
  review: "En revisió",
  ready: "A punt",
  scheduled: "Programat",
  published: "Publicat",
  needs_update: "Cal actualitzar",
  archived: "Arxivat",
};

export default async function AdminDashboard() {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");

  if (!isDatabaseConfigured()) {
    return (
      <main className="ci-shell py-10">
        <h1>Configuració pendent</h1>
        <p className="ci-measure mt-3 text-[var(--color-muted)]">
          Cal una base de dades per fer servir el CMS. Consulta{" "}
          <code>docs/DEPLOYMENT.md</code>.
        </p>
      </main>
    );
  }

  const [counts, review, gaps, readiness] = await Promise.all([
    statusCounts(),
    dueForReview(10),
    translationGaps(),
    buildReadinessReport(),
  ]);

  return (
    <main className="ci-shell py-10">
      <h1>Redacció</h1>

      <section className="mt-8">
        <div className="ci-section-head">
          <h2 className="text-xl">Flux de treball</h2>
          <Link href="/admin/content" className="text-sm">
            Tot el contingut
          </Link>
        </div>

        <ul className="ci-grid list-none p-0">
          {STATUS_ORDER.map((status) => (
            <li key={status}>
              <Link
                href={`/admin/content?status=${status}`}
                className="block border border-[var(--color-rule)] bg-[var(--color-surface)] p-4 no-underline"
              >
                <span className="ci-label block">{STATUS_LABEL[status]}</span>
                <span className="ci-numeric mt-1 block text-3xl">{counts[status] ?? 0}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <div className="ci-section-head">
          <h2 className="text-xl">Preparació per a AdSense</h2>
          <span
            className={
              readiness.verdict === "READY FOR MANUAL REVIEW"
                ? "ci-verified"
                : "ci-verified ci-stale"
            }
          >
            <span className="ci-verified-dot" aria-hidden="true" />
            {readiness.verdict}
          </span>
        </div>

        <ul className="m-0 list-none p-0 text-sm">
          {readiness.checks.map((check) => (
            <li
              key={check.id}
              className="grid gap-1 border-b border-[var(--color-rule)] py-3 sm:grid-cols-[12rem_5rem_1fr] sm:gap-4"
            >
              <span className="font-semibold">{check.label}</span>
              <span
                className={
                  check.status === "pass"
                    ? "text-[var(--color-moss)]"
                    : check.status === "fail"
                      ? "text-[var(--color-danger)]"
                      : check.status === "warn"
                        ? "text-[var(--color-amber)]"
                        : "text-[var(--color-muted)]"
                }
              >
                {check.status}
              </span>
              <span className="text-[var(--color-muted)]">{check.detail}</span>
            </li>
          ))}
        </ul>
      </section>

      {review.length > 0 ? (
        <section className="mt-12">
          <div className="ci-section-head">
            <h2 className="text-xl">Cal reverificar</h2>
          </div>
          <ul className="m-0 list-none p-0 text-sm">
            {review.map((row) => (
              <li
                key={row.translationId}
                className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--color-rule)] py-2"
              >
                <Link href={`/admin/content/${row.translationId}`}>{row.title}</Link>
                <span className="ci-numeric text-xs text-[var(--color-amber)]">
                  {row.reviewDueAt ? formatDate(row.reviewDueAt, "ca", "short") : ""}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {gaps.length > 0 ? (
        <section className="mt-12">
          <div className="ci-section-head">
            <h2 className="text-xl">Traduccions pendents</h2>
          </div>
          <ul className="m-0 list-none p-0 text-sm">
            {gaps.slice(0, 15).map((row) => (
              <li
                key={row.entryId}
                className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--color-rule)] py-2"
              >
                <span>{row.title}</span>
                <span className="text-xs text-[var(--color-muted)]">
                  {row.have.join(", ")} → falta {row.missing.join(", ")}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
