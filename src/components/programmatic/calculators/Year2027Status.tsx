import { year2027Notices, type Notice, type NoticeItem } from "@/lib/programmatic/calculators/year-2027";
import type { CalcLocale, CalculatorId } from "@/lib/programmatic/calculators/paths";
import { madridDay } from "@/lib/seo/article-dates";

import { DateSwitch } from "./DateSwitch";

/**
 * "Ya oficial para 2027" / "Cifras de 2026": the block under each tool
 * (lib/programmatic/calculators/year-2027.ts decides what it says and when).
 * Server-rendered for the day of the render; DateSwitch flips it in the
 * browser on the switch day, so a page built before 1 January never presents
 * 2026 figures as 2027 ones afterwards.
 */

function Items({ items }: { items: NoticeItem[] }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.text}>
          {item.text}{" "}
          {item.links.map((link, i) => (
            <span key={link.url}>
              {i > 0 ? " · " : null}
              <a href={link.url} rel="noopener" target="_blank">
                {link.label}
              </a>
            </span>
          ))}
          {item.note ? <> {item.note}</> : null}
        </li>
      ))}
    </ul>
  );
}

function Block({ notice }: { notice: Notice }) {
  const official = notice.official.length ? (
    <>
      <p>
        <strong>{notice.officialHeading}</strong>
      </p>
      <Items items={notice.official} />
    </>
  ) : null;
  const pending = notice.pending.length ? (
    <>
      <p>
        <strong>{notice.pendingHeading}</strong>
      </p>
      <Items items={notice.pending} />
    </>
  ) : null;
  return (
    <aside className={`ci-callout ${notice.tone === "warning" ? "ci-callout-warning" : "ci-callout-info"}`} aria-labelledby="ci-year-2027-title">
      <p id="ci-year-2027-title">
        <strong>{notice.title}</strong>
      </p>
      <p>{notice.intro}</p>
      {notice.officialFirst ? (
        <>
          {notice.title === notice.officialHeading ? <Items items={notice.official} /> : official}
          {pending}
        </>
      ) : (
        <>
          {pending}
          {official}
        </>
      )}
    </aside>
  );
}

export function Year2027Status({ id, locale }: { id: CalculatorId; locale: CalcLocale }) {
  const states = year2027Notices(id, locale);
  if (!states) return null;
  const before = states.before ? <Block notice={states.before} /> : null;
  const after = states.after ? <Block notice={states.after} /> : null;
  return <DateSwitch on={states.switchOn} serverToday={madridDay(new Date())} before={before} after={after} />;
}
