import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth/session";
import { listRedirects } from "@/lib/admin/queries";
import { formatDate } from "@/lib/format";
import { RedirectForm } from "./RedirectForm";

export const dynamic = "force-dynamic";

export default async function RedirectsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");

  const rows = await listRedirects();

  return (
    <main className="ci-shell py-10">
      <div className="ci-section-head">
        <h1 className="text-3xl">Redireccions</h1>
      </div>

      <section className="border border-[var(--color-rule)] bg-[var(--color-surface)] p-4">
        <h2 className="font-sans text-base font-semibold">Nova redirecció</h2>
        <p className="mt-1 text-xs text-[var(--color-muted)]">
          Les redireccions heretades de la versió 1 viuen a{" "}
          <code>migration/redirects.csv</code> i s&apos;apliquen a la vora. Aquesta taula és
          per a canvis fets després de publicar.
        </p>
        <div className="mt-4">
          <RedirectForm />
        </div>
      </section>

      <div className="ci-table-wrap mt-8">
        <table className="ci-table">
          <thead>
            <tr>
              <th scope="col">Des de</th>
              <th scope="col">Cap a</th>
              <th scope="col">Tipus</th>
              <th scope="col">Visites</th>
              <th scope="col">Creada</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <th scope="row" className="font-mono text-xs font-normal">
                  {row.fromPath}
                </th>
                <td className="font-mono text-xs">{row.toPath ?? "—"}</td>
                <td className="text-xs">{row.kind}</td>
                <td className="text-xs">{row.hits}</td>
                <td className="text-xs">{formatDate(row.createdAt, "ca", "short")}</td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-[var(--color-muted)]">
                  Cap redirecció gestionada des del CMS.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </main>
  );
}
