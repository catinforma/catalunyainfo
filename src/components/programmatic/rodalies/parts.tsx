import Link from "next/link";

import { renderInline } from "@/lib/content/inline";
import type { CompensationCopy, LinkItem, LinePageCopy } from "@/lib/programmatic/rodalies/copy";

/** Shared, server-rendered pieces of the Rodalies pages. */

export function Paragraphs({ items }: { items: string[] }) {
  return (
    <>
      {items.map((text) => (
        <p key={text}>{renderInline(text)}</p>
      ))}
    </>
  );
}

export function Compensation({ copy, id }: { copy: CompensationCopy; id: string }) {
  return (
    <>
      <h2 id={id}>{copy.title}</h2>
      <p>{renderInline(copy.intro)}</p>
      <div className="ci-table-scroll mt-4">
        <table className="ci-local-table">
          <thead>
            <tr>
              <th scope="col">{copy.headers[0]}</th>
              <th scope="col">{copy.headers[1]}</th>
            </tr>
          </thead>
          <tbody>
            {copy.rows.map(([delay, what]) => (
              <tr key={delay}>
                <td className="whitespace-nowrap font-semibold">{delay}</td>
                <td>{what}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Paragraphs items={copy.where} />
      <Paragraphs items={copy.notes} />
    </>
  );
}

export function LinkList({ title, id, links }: { title: string; id: string; links: LinkItem[] }) {
  return (
    <nav aria-labelledby={id}>
      <h2 id={id}>{title}</h2>
      <ul>
        {links.map((item) => (
          <li key={item.href}>
            <Link href={item.href}>{item.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Sources({ title, note, items }: { title: string; note: string; items: LinePageCopy["sources"] }) {
  return (
    <section className="mt-12">
      <h2 className="font-sans text-base font-semibold">{title}</h2>
      <p className="mt-1 text-xs text-[var(--color-muted)]">{note}</p>
      <ol className="ci-sources mt-3">
        {items.map((source) => (
          <li key={source.url}>
            <span>
              <a href={source.url} rel="noopener nofollow" target="_blank">
                {source.name}
              </a>
              <span className="text-[var(--color-muted)]"> — {source.publisher}</span>
              <span className="ml-1 text-xs text-[var(--color-faint)]">({source.note})</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function Faq({ title, items }: { title: string; items: { question: string; answer: string }[] }) {
  return (
    <section>
      <h2>{title}</h2>
      <dl className="m-0">
        {items.map((item) => (
          <div key={item.question} className="border-b border-[var(--color-rule)] py-4 last:border-b-0">
            <dt className="font-semibold">{item.question}</dt>
            <dd className="m-0 mt-1 text-[var(--color-ink-soft)]">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
