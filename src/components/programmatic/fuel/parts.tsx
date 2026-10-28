import Link from "next/link";

import { renderInline } from "@/lib/content/inline";
import { attribution, BOE_ORDER_URL, driverGuides, guidance, sectionTitles } from "@/lib/programmatic/fuel/copy";
import { MUNICIPALITIES } from "@/lib/programmatic/fuel/data";
import type { FuelLocale } from "@/lib/programmatic/fuel/paths";

/** Shared pieces of the fuel pages, all server-rendered and price-free. */

export function Guidance({ locale }: { locale: FuelLocale }) {
  return (
    <>
      {guidance(locale).map((section, i) => (
        <section key={section.title} aria-labelledby={`ci-fuel-guide-${i}`}>
          <h2 id={`ci-fuel-guide-${i}`}>{section.title}</h2>
          {section.paragraphs.map((text) => (
            <p key={text}>{renderInline(text)}</p>
          ))}
        </section>
      ))}
    </>
  );
}

export function LinkList({ title, links, id }: { title: string; id: string; links: { label: string; href: string; note?: string }[] }) {
  if (links.length === 0) return null;
  return (
    <section className="mt-10" aria-labelledby={id}>
      <h2 id={id}>{title}</h2>
      <ul className="mt-4 grid list-none gap-2 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((l) => (
          <li key={l.href} className="!mt-0">
            <Link href={l.href}>{l.label}</Link>
            {l.note ? <span className="block text-xs text-[var(--color-muted)]">{l.note}</span> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function DriverGuides({ locale }: { locale: FuelLocale }) {
  const t = sectionTitles(locale);
  return <LinkList title={t.guides} id="ci-fuel-guides" links={driverGuides(locale)} />;
}

export function Sources({ locale }: { locale: FuelLocale }) {
  const t = sectionTitles(locale);
  const { prices, comarques } = MUNICIPALITIES.sources;
  const items = [
    { name: prices.name, publisher: prices.publisher, url: prices.url },
    {
      name: locale === "es" ? "Servicio REST de precios de carburantes (Comunidad Autónoma 09, Cataluña)" : "Servei REST de preus de carburants (comunitat autònoma 09, Catalunya)",
      publisher: prices.publisher,
      url: prices.api,
    },
    { name: "Geoportal Gasolineras", publisher: prices.publisher, url: "https://geoportalgasolineras.es/geoportal-instalaciones/Inicio" },
    { name: "Orden ITC/2308/2007, de 25 de julio", publisher: "BOE", url: BOE_ORDER_URL },
    { name: comarques.name, publisher: comarques.publisher, url: comarques.url },
  ];
  return (
    <section className="mt-12" aria-labelledby="ci-fuel-sources">
      <h2 id="ci-fuel-sources" className="font-sans text-base font-semibold">
        {t.sources}
      </h2>
      <p className="mt-1 text-sm">{renderInline(attribution(locale, prices.url))}</p>
      <ol className="ci-sources mt-3">
        {items.map((source) => (
          <li key={source.url}>
            <span>
              <a href={source.url} rel="noopener nofollow" target="_blank">
                {source.name}
              </a>
              <span className="text-[var(--color-muted)]"> — {source.publisher}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function CountTable({
  caption,
  cols,
  rows,
}: {
  caption: string;
  cols: [string, string];
  rows: { label: string; href?: string; count: number }[];
}) {
  return (
    <div className="ci-table-scroll mt-4">
      <table className="ci-local-table">
        <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">{cols[0]}</th>
            <th scope="col" className="text-right">
              {cols[1]}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <td>{r.href ? <Link href={r.href}>{r.label}</Link> : r.label}</td>
              <td className="text-right tabular-nums">{r.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
