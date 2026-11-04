import { renderInline } from "@/lib/content/inline";
import type { MesaDutyModel } from "@/lib/programmatic/elections/mesa-duty";

/**
 * "Mesa electoral a <town>": a compact, server-rendered block (no client
 * code). Our own copy goes through the inline formatter; the JEZ's name,
 * address and telephones are plain text, as the JEC directory writes them,
 * with the numbers as tap-to-call links for phones.
 */
export function MesaSection({ mesa, headingId }: { mesa: MesaDutyModel; headingId: string }) {
  const { board } = mesa;
  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId}>{mesa.title}</h2>
      <p>{renderInline(mesa.intro)}</p>
      <dl className="ci-facts">
        {mesa.rows.map((row) => (
          <div key={row.label} className="contents">
            <dt>{row.label}</dt>
            <dd>{renderInline(row.value)}</dd>
          </div>
        ))}
        <div className="contents">
          <dt>{board.label}</dt>
          <dd>
            <strong>{board.name}</strong>
            <span className="block">{board.address}</span>
            <span className="block">
              {board.phoneLabel}:{" "}
              {board.phones.map((phone, i) => (
                <span key={phone.href}>
                  {i > 0 ? " · " : null}
                  <a href={phone.href} className="whitespace-nowrap">
                    {phone.display}
                  </a>
                </span>
              ))}
            </span>
            <span className="mt-1 block text-[var(--color-ink-soft)]">{board.note}</span>
            <span className="block text-xs text-[var(--color-muted)]">{board.credit}</span>
          </dd>
        </div>
        <div className="contents">
          <dt>{mesa.pay.label}</dt>
          <dd>{renderInline(mesa.pay.value)}</dd>
        </div>
      </dl>
      <p className="mt-3">{renderInline(mesa.guide)}</p>
      <p className="mt-1 text-xs text-[var(--color-muted)]">{renderInline(mesa.source)}</p>
    </section>
  );
}
