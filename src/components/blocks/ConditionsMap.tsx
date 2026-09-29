import Link from "next/link";
import type { z } from "zod";

import type { conditionsMapBlock } from "@/lib/content/blocks";
import { formatDate } from "@/lib/format";
import { getMessages } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";

/**
 * Conditions by comarca.
 *
 * Presented as a labelled grid rather than a drawn map, and that is a
 * deliberate limit rather than a shortcut. A shape we do not have licensed
 * geodata for would have to be approximated, and an approximated boundary on a
 * page about where to go is a claim about a place. Named areas with a level and
 * a measurement say exactly as much as we can support.
 *
 * The level is rendered as a word as well as a colour, so it survives
 * greyscale, colour blindness and a screen reader — a chip whose only content
 * is a background colour says nothing to any of them.
 *
 * The verification date is printed at the top, not buried in a footnote: for a
 * page whose whole value is that it is current, a stale date is the single most
 * important thing a reader can know.
 */

type Block = z.infer<typeof conditionsMapBlock>;

const LEVEL_CLASS: Record<Block["areas"][number]["level"], string> = {
  favourable: "ci-cond-favourable",
  moderate: "ci-cond-moderate",
  limiting: "ci-cond-limiting",
  unknown: "ci-cond-unknown",
};

export function ConditionsMap({ block, locale }: { block: Block; locale: Locale }) {
  const t = getMessages(locale);
  const labelFor = new Map(block.legend.map((item) => [item.level, item.label]));

  return (
    <section className="ci-conditions" aria-label={block.title}>
      <div className="ci-conditions-head">
        <h3 className="ci-conditions-title">{block.title}</h3>
        <p className="ci-conditions-verified">
          <strong>{t.meta.verifiedOn}</strong>{" "}
          <time dateTime={block.verifiedAt}>
            {formatDate(new Date(`${block.verifiedAt}T12:00:00Z`), locale)}
          </time>
        </p>
      </div>

      {block.intro ? <p className="ci-conditions-intro">{block.intro}</p> : null}

      <ul className="ci-conditions-legend" aria-label={t.conditions.legend}>
        {block.legend.map((item) => (
          <li key={item.level}>
            <span className={`ci-cond-chip ${LEVEL_CLASS[item.level]}`} aria-hidden="true" />
            {item.label}
          </li>
        ))}
      </ul>

      <ul className="ci-conditions-grid">
        {block.areas.map((area) => (
          <li key={area.name} className={`ci-conditions-area ${LEVEL_CLASS[area.level]}`}>
            <p className="ci-conditions-area-name">
              {area.href ? <Link href={area.href}>{area.name}</Link> : area.name}
            </p>
            <p className="ci-conditions-area-level">{labelFor.get(area.level) ?? area.level}</p>
            {area.note ? <p className="ci-conditions-area-note">{area.note}</p> : null}
          </li>
        ))}
      </ul>

      <p className="ci-conditions-note">
        {t.conditions.disclaimer}{" "}
        <a href={block.source.url} rel="noopener" target="_blank">
          {block.source.name}
        </a>
        .
      </p>
      {block.note ? <p className="ci-conditions-note">{block.note}</p> : null}
    </section>
  );
}
