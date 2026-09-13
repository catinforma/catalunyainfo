import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth/session";
import { listMedia } from "@/lib/admin/queries";
import { LOCALES } from "@/lib/i18n/config";
import { MediaForm } from "./MediaForm";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");

  const rows = await listMedia();

  return (
    <main className="ci-shell py-10">
      <div className="ci-section-head">
        <h1 className="text-3xl">Imatges</h1>
      </div>

      <section className="border border-[var(--color-rule)] bg-[var(--color-surface)] p-4">
        <h2 className="font-sans text-base font-semibold">Registra una imatge</h2>
        <p className="mt-1 text-xs text-[var(--color-muted)]">
          El crèdit i la llicència són obligatoris a la pràctica: sense ells no es pot
          publicar la imatge.
        </p>
        <div className="mt-4">
          <MediaForm />
        </div>
      </section>

      <div className="ci-table-wrap mt-8">
        <table className="ci-table">
          <thead>
            <tr>
              <th scope="col">Fitxer</th>
              <th scope="col">Mida</th>
              <th scope="col">Crèdit</th>
              <th scope="col">Llicència</th>
              <th scope="col">Alt</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <th scope="row" className="font-normal">
                  <a href={row.url} target="_blank" rel="noopener">
                    {row.url.split("/").pop()}
                  </a>
                </th>
                <td className="text-xs">
                  {row.width && row.height ? `${row.width}×${row.height}` : "—"}
                </td>
                <td className="text-xs">
                  {row.credit ?? (
                    <span className="text-[var(--color-danger)]">falta</span>
                  )}
                </td>
                <td className="text-xs">{row.license ?? "—"}</td>
                <td className="text-xs">
                  {LOCALES.filter((l) => (row.alt?.[l] ?? "").length > 0).join(", ") || (
                    <span className="text-[var(--color-danger)]">falta</span>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-[var(--color-muted)]">
                  Encara no hi ha imatges.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </main>
  );
}
