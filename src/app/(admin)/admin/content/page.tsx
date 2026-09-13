import Link from "next/link";
import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth/session";
import { listAdminEntries } from "@/lib/admin/queries";
import type { EntryStatus, EntryType } from "@/lib/db/schema";
import { LOCALES, type Locale } from "@/lib/i18n/config";
import { formatDate } from "@/lib/format";
import { NewEntryForm } from "./NewEntryForm";

export const dynamic = "force-dynamic";

const STATUSES: EntryStatus[] = [
  "draft",
  "review",
  "ready",
  "scheduled",
  "published",
  "needs_update",
  "archived",
];

export default async function ContentListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; locale?: string; type?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");

  const filters = await searchParams;
  const status = STATUSES.includes(filters.status as EntryStatus)
    ? (filters.status as EntryStatus)
    : undefined;
  const locale = LOCALES.includes(filters.locale as Locale)
    ? (filters.locale as Locale)
    : undefined;

  const rows = await listAdminEntries({
    ...(status ? { status } : {}),
    ...(locale ? { locale } : {}),
    ...(filters.type ? { type: filters.type as EntryType } : {}),
    limit: 200,
  });

  return (
    <main className="ci-shell py-10">
      <div className="ci-section-head">
        <h1 className="text-3xl">Contingut</h1>
      </div>

      <section className="border border-[var(--color-rule)] bg-[var(--color-surface)] p-4">
        <h2 className="font-sans text-base font-semibold">Crea contingut</h2>
        <p className="mt-1 text-xs text-[var(--color-muted)]">
          Es crea sempre com a esborrany. Cap contingut es publica automàticament.
        </p>
        <div className="mt-4">
          <NewEntryForm />
        </div>
      </section>

      <nav aria-label="Filtres" className="mt-8 flex flex-wrap gap-2 text-sm">
        <Link
          href="/admin/content"
          className={!status ? "ci-btn ci-btn-primary" : "ci-btn ci-btn-quiet"}
        >
          Tot
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/content?status=${s}`}
            className={status === s ? "ci-btn ci-btn-primary" : "ci-btn ci-btn-quiet"}
          >
            {s}
          </Link>
        ))}
      </nav>

      <div className="ci-table-wrap mt-6">
        <table className="ci-table">
          <thead>
            <tr>
              <th scope="col">Títol</th>
              <th scope="col">Tipus</th>
              <th scope="col">Idioma</th>
              <th scope="col">Estat</th>
              <th scope="col">Ruta</th>
              <th scope="col">Actualitzat</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.translationId}>
                <th scope="row" className="font-normal">
                  <Link href={`/admin/content/${row.translationId}`}>{row.title}</Link>
                  {row.isDemo ? (
                    <span className="ml-2 text-xs text-[var(--color-amber)]">DEMO</span>
                  ) : null}
                </th>
                <td>{row.type}</td>
                <td>{row.locale}</td>
                <td>{row.status}</td>
                <td className="text-xs text-[var(--color-muted)]">
                  /{row.locale}/{row.path}/
                </td>
                <td className="text-xs">{formatDate(row.updatedAt, "ca", "short")}</td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-[var(--color-muted)]">
                  Encara no hi ha contingut amb aquests filtres.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </main>
  );
}
