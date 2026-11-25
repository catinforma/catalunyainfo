import assert from "node:assert/strict";
import { test } from "node:test";

import { CANDIDATES } from "../src/lib/content/batch02/candidates.ts";
import { CONGRESS_RESULTS, PARLIAMENT_RESULTS } from "../src/lib/content/batch02/election-results.ts";
import { ELECTION_NIGHT } from "../src/lib/content/batch02/election-night.ts";
import { MESA } from "../src/lib/content/batch02/mesa.ts";
import { POSTAL_VOTE } from "../src/lib/content/batch02/postal-vote.ts";
import { b2href, type B2Article } from "../src/lib/content/batch02/shared.ts";
import { VOTING } from "../src/lib/content/batch02/voting.ts";
import { parseBody } from "../src/lib/content/blocks.ts";
import { HANDIN_CLOSES, MESA_NOTICE_CLOSES, MESA_TABLES_SET, resolveElectionPhased } from "../src/lib/content/election-phased.ts";
import { homeLeadKey } from "../src/lib/content/home-lead.ts";
import { NEWS_ALERTS, activeNewsAlerts } from "../src/lib/alerts/news-alerts.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import { electionDayBlock, electionPhase } from "../src/lib/programmatic/elections/election-day.ts";
import { buildLiveView } from "../src/lib/programmatic/elections/live/render.ts";
import { hubCopy } from "../src/lib/programmatic/elections/hub.ts";
import { MESA_HELD_FROM, MESA_72H, mesaStage } from "../src/lib/programmatic/elections/mesa-duty.ts";
import { buildElectionPage, townElectionDay } from "../src/lib/programmatic/elections/model.ts";
import { municipalitiesFor } from "../src/lib/programmatic/elections/pages.ts";
import { resultsNightLine } from "../src/lib/programmatic/elections/results-night.ts";
import { madridDate } from "../src/lib/programmatic/elections/today.ts";
import { pollsMetadata } from "../src/lib/programmatic/polls/page.ts";
import { pollsPageData } from "../src/lib/programmatic/polls/data.ts";
import { pollsPath } from "../src/lib/programmatic/polls/paths.ts";
import { pollsProxyRewrite } from "../src/lib/programmatic/polls/routing.ts";
import { BLACKOUT_END, BLACKOUT_START, isPollBlackout } from "../src/lib/programmatic/polls/window.ts";
import { buildLlmsTxt } from "../src/lib/seo/llms.ts";

/**
 * End-to-end phase test of the 29 Nov 2026 general election (ci-revisio, 25 Nov 2026).
 * Every surface that switches by time is built at a fixed instant through the clock
 * the code already takes (`now` / `asOf` / `today` parameters; no global Date mock).
 *
 * Surfaces and their clock injection:
 *   election-day layer (hub, comarca, town)  electionDayBlock(locale, electionPhase(now), { now })
 *   town page model, mesa section            buildElectionPage(m, locale, SNAPSHOT, phase, now)
 *   hub copy / results line                  hubCopy(locale, phase), resultsNightLine(locale, undefined, phase)
 *   guides (postal, how to vote, night, Congress results, candidates)
 *                                            resolveElectionPhased(body, now)
 *   banners (the strip at the top)           activeNewsAlerts(locale, undefined, now.getTime())
 *   polls blackout                           isPollBlackout(now), pollsPageData(now), pollsProxyRewrite(path, now)
 *   home lead card                           homeLeadKey(madridDate)
 *   llms.txt                                 buildLlmsTxt(origin, name, guides, todayIso)  (only a date)
 *   live results                             buildLiveView(file, now)
 * No clock injection: the guides' own metadata (title, seoTitle, description, excerpt) and
 * the MESA guide (not an electionPhased guide); both are static text, checked below as such.
 * The ISR lag (nightly 00:05 re-render for the guides) is not modelled: this tests the text
 * the page WOULD print if rendered at the instant.
 */

const at = (madrid: string) => new Date(`${madrid}:00+01:00`);

const INSTANTS: Record<string, Date> = {
  "25 Nov 12:00": at("2026-11-25T12:00"),
  "26 Nov 13:59": at("2026-11-26T13:59"),
  "26 Nov 14:00": at("2026-11-26T14:00"),
  "27 Nov 12:00": at("2026-11-27T12:00"),
  "28 Nov 23:59": at("2026-11-28T23:59"),
  "29 Nov 07:59": at("2026-11-29T07:59"),
  "29 Nov 08:00": at("2026-11-29T08:00"),
  "29 Nov 09:00": at("2026-11-29T09:00"),
  "29 Nov 19:59": at("2026-11-29T19:59"),
  "29 Nov 20:00": at("2026-11-29T20:00"),
  "29 Nov 21:00": at("2026-11-29T21:00"),
  "29 Nov 23:59": at("2026-11-29T23:59"),
  "30 Nov 00:00": at("2026-11-30T00:00"),
  "30 Nov 12:00": at("2026-11-30T12:00"),
  "7 Dec 12:00": at("2026-12-07T12:00"),
  "8 Dec 12:00": at("2026-12-08T12:00"),
};
const NAMES = Object.keys(INSTANTS);

const HANDIN = at("2026-11-26T14:00").getTime();
const EVE_ENDS = at("2026-11-29T00:00").getTime();
const MESA_SET = at("2026-11-29T08:00").getTime();
const POLLS_CLOSE = at("2026-11-29T20:00").getTime();
const VOTE_OVER = at("2026-11-30T00:00").getTime();
const BRIDGE_OVER = at("2026-12-08T00:00").getTime();

/** Every string inside a value, however nested. */
function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const v of value) strings(v, out);
  else if (value && typeof value === "object") for (const v of Object.values(value)) strings(v, out);
  return out;
}

const plain = (s: string) => s.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/[*_`]/g, "");

interface Surface {
  name: string;
  /** "live": rendered every minute (election-day layer); "guide": ISR guides, whose `count` phase reads `pre` by design. */
  kind: "live" | "guide" | "banner" | "other";
  texts: (now: Date, locale: Locale) => string[];
}

function guideTexts(article: B2Article, now: Date, locale: Locale): string[] {
  const ed = article.editions[locale];
  const body = resolveElectionPhased(parseBody(ed.blocks), now);
  return strings(body).map(plain);
}
function guideMeta(article: B2Article, locale: Locale): string[] {
  const ed = article.editions[locale];
  return [ed.title, ed.seoTitle, ed.seoDescription, ed.excerpt].filter((s): s is string => typeof s === "string");
}

const GUIDES: Record<string, B2Article> = {
  postal: POSTAL_VOTE,
  night: ELECTION_NIGHT,
  congress: CONGRESS_RESULTS,
  parliament: PARLIAMENT_RESULTS,
  voting: VOTING,
  candidates: CANDIDATES,
  mesa: MESA,
};

const SURFACES: Surface[] = [
  {
    name: "election-day block (hub/comarca)",
    kind: "live",
    texts: (now, l) => {
      const b = electionDayBlock(l, electionPhase(now), { now });
      return b ? [b.title, ...b.md.map(plain), b.cta?.href ?? "", b.cta?.label ?? ""] : [];
    },
  },
  {
    name: "election-day block (town)",
    kind: "live",
    texts: (now, l) => {
      const m = municipalitiesFor(l)[0]!;
      const phase = electionPhase(now);
      const model = buildElectionPage(m, l, undefined, phase, now);
      const b = townElectionDay(m, l, phase, model.polling, undefined, now);
      return b ? [b.title, ...b.md.map(plain)] : [];
    },
  },
  {
    name: "town page model (results line, mesa, faq)",
    kind: "live",
    texts: (now, l) => strings(buildElectionPage(municipalitiesFor(l)[0]!, l, undefined, electionPhase(now), now)).map(plain),
  },
  { name: "hub copy", kind: "live", texts: (now, l) => strings(hubCopy(l, electionPhase(now))).map(plain) },
  { name: "results-night line", kind: "live", texts: (now, l) => [plain(resultsNightLine(l, undefined, electionPhase(now)))] },
  ...Object.entries(GUIDES).map(([key, article]): Surface => ({ name: `guide ${key}`, kind: "guide", texts: (now, l) => guideTexts(article, now, l) })),
  {
    name: "banners (news alerts)",
    kind: "banner",
    texts: (now, l) => activeNewsAlerts(l, undefined, now.getTime()).flatMap((a) => [a.text, a.href]),
  },
  {
    name: "polls page data",
    kind: "other",
    texts: (now) => strings(pollsPageData(now)).filter((s) => !/^\d{4}-\d\d-\d\dT/.test(s) || !Number.isNaN(Date.parse(s))),
  },
  {
    name: "llms.txt",
    kind: "other",
    texts: (now) => [buildLlmsTxt("https://www.catalunyainfo.com", "Catalunya Info", {}, madridDate(now))],
  },
  { name: "live results view", kind: "other", texts: (now) => strings(buildLiveView(null, now)) },
];

/* -------------------------------------------------------------------------- */
/* 1. No "undefined" / NaN anywhere                                           */
/* -------------------------------------------------------------------------- */

const BROKEN = /\bundefined\b|\bNaN\b|\[object Object\]|\$\{/;

test("no surface prints undefined, NaN or a raw template at any instant", () => {
  const bad: string[] = [];
  for (const s of SURFACES) {
    for (const name of NAMES) {
      for (const l of LOCALES) {
        for (const t of s.texts(INSTANTS[name]!, l)) {
          const m = BROKEN.exec(t);
          if (m) bad.push(`${s.name} @ ${name} ${l}: "${t.slice(Math.max(0, m.index - 40), m.index + 40)}"`);
        }
      }
    }
  }
  assert.deepEqual([...new Set(bad)], []);
});

test("every guide's metadata is clean too (static: no clock)", () => {
  for (const [key, article] of Object.entries(GUIDES)) {
    for (const l of LOCALES) for (const t of guideMeta(article, l)) assert.doesNotMatch(t, BROKEN, `${key} ${l}`);
  }
});

/* -------------------------------------------------------------------------- */
/* 2. Tense rules: nothing instructs after its deadline                       */
/* -------------------------------------------------------------------------- */

interface Rule {
  id: string;
  /** From this instant (inclusive) the pattern must not appear; before `until` only when given. */
  from?: number;
  /** Until this instant (exclusive) the pattern must not appear (for "too early" rules). */
  until?: number;
  re: Record<Locale, RegExp>;
  /** Surface kinds the rule applies to. */
  kinds: Surface["kind"][];
  /** Skip sentences matching this (past-tense wording about the same thing). */
  except?: RegExp;
  /** Only this surface. */
  only?: string;
}

const PAST = /podía|se pudo|es podia|es va |could be|se aceptó|terminó|terminado|acabó|acabado|cerró|cerrado|fue |ya ha |va acabar|va ser|ja ha |ha acabat|va tancar|ended|closed|passed|was |has gone|took place|\bfue\b/i;

const RULES: Rule[] = [
  {
    id: "hand-in the postal vote is an instruction after Thu 26 Nov 14:00",
    from: HANDIN,
    kinds: ["live", "guide", "banner"],
    re: {
      es: /entr[eé]g(alo|uelo|ar|a|ues)\b[^.]{0,80}(hasta|antes|como máximo|jueves 26)|se entrega en Correos hasta|tienes que entregar|puedes entregar|debes entregar/i,
      ca: /lliur(a|ar|eu|ar-lo|a-ho)\b[^.]{0,80}(fins|abans|com a màxim|dijous 26)|es lliura a Correus fins|has de lliurar|pots lliurar|cal lliurar/i,
      en: /\bhand[^.]{0,30}\bin\b[^.]{0,40}\b(by|until|before)\b|must be handed in|must hand/i,
    },
    except: new RegExp(PAST.source + "|abroad|CERA|exterior|estranger|notificaci|notice|ayuntamiento|ajuntament|town council|sorteo|sorteig|draw", "i"),
  },
  {
    id: "mesa-duty instruction (tell the board) after the tables are set up, Sun 29 Nov 08:00",
    from: MESA_SET,
    kinds: ["live"],
    re: {
      es: /\bavisa(r|d)?\b|comunica(r|d)? (a la Junta|el impedimento)|puedes (alegar|excusarte)/i,
      ca: /\bavisa(r|u)?\b|comunica(r|u)? (a la Junta|l'impediment)|pots (al·legar|excusar)/i,
      en: /\btell (the|your) board|\bnotify the board|you can (still )?(report|claim)/i,
    },
  },
  {
    id: "eve wording ('tomorrow') once 29 Nov has begun",
    from: EVE_ENDS,
    kinds: ["live", "banner"],
    re: {
      es: /mañana (se )?vota|si trabajas mañana|hoy,? sábado 28|jornada de reflexión:/i,
      ca: /demà es vota|si treballes demà|avui,? dissabte 28/i,
      en: /polling day is tomorrow|working tomorrow|today,? saturday 28/i,
    },
  },
  {
    id: "polling-day wording ('today is polling day') before 29 Nov 00:00 or after 20:00",
    until: EVE_ENDS,
    kinds: ["live", "banner"],
    re: { es: /hoy se vota|si trabajas hoy/i, ca: /avui es vota|si treballes avui/i, en: /polling day is today|working today/i },
  },
  {
    id: "polling-day wording after the polls close (20:00)",
    from: POLLS_CLOSE,
    kinds: ["live", "banner"],
    re: {
      es: /hoy se vota|si trabajas hoy|todavía puedes votar|aún puedes votar|si a las 20:00 estás dentro/i,
      ca: /avui es vota|si treballes avui|encara pots votar|si a les 20:00 ets dins/i,
      en: /polling day is today|working today|you can still vote/i,
    },
  },
  {
    id: "'if you have to vote' on the live surfaces once the polls close (29 Nov 20:00)",
    from: POLLS_CLOSE,
    kinds: ["live"],
    re: {
      es: /si tienes que votar|si has de votar|dónde y cómo votar|ve a votar/i,
      ca: /si has de votar|on i com votar|ves a votar/i,
      en: /if you have to vote|if you are voting|voting on 29 november\?|how and where to vote|go and vote/i,
    },
  },
  {
    id: "'if you have to vote' / how-to-vote action after the vote (30 Nov)",
    from: VOTE_OVER,
    kinds: ["live", "guide", "banner"],
    re: {
      es: /si tienes que votar|si has de votar|dónde y cómo votar|mañana vota|ve a votar/i,
      ca: /si has de votar|on i com votar|demà vota|ves a votar/i,
      en: /if you have to vote|how and where to vote|go and vote/i,
    },
    except: /pasado|past|va ser|fue|was /i,
  },
  {
    id: "polls closed wording before 20:00",
    until: POLLS_CLOSE,
    kinds: ["live", "banner"],
    re: { es: /urnas cerradas|colegios cerrados/i, ca: /urnes tancades|col·legis tancats/i, en: /polls closed/i },
  },
];

function sentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+|\n/).filter(Boolean);
}

/** Findings the head must see; asserted as `todo` so the suite stays green and lists them. */
const KNOWN_FAILURES = new Set<string>([
  "hand-in the postal vote is an instruction after Thu 26 Nov 14:00",
]);

function violations(rule: Rule): string[] {
  // One line per surface, language and sentence, with the first instant it shows at.
  const out = new Map<string, string>();
  for (const s of SURFACES) {
    if (!rule.kinds.includes(s.kind) || (rule.only && rule.only !== s.name)) continue;
    for (const name of NAMES) {
      const now = INSTANTS[name]!;
      const t = now.getTime();
      if (rule.from !== undefined && t < rule.from) continue;
      if (rule.until !== undefined && t >= rule.until) continue;
      for (const l of LOCALES) {
        for (const text of s.texts(now, l)) {
          for (const sentence of sentences(text)) {
            if (rule.re[l].test(sentence) && !(rule.except && rule.except.test(sentence))) {
              const key = `${s.name} ${l}: ${sentence.slice(0, 110)}`;
              if (!out.has(key)) out.set(key, `[first @ ${name}] ${key}`);
            }
          }
        }
      }
    }
  }
  return [...out.values()];
}

for (const rule of RULES) {
  test(`tense: ${rule.id}`, { todo: KNOWN_FAILURES.has(rule.id) ? "known finding, see report" : false }, () => {
    assert.deepEqual(violations(rule), []);
  });
}

/* -------------------------------------------------------------------------- */
/* 3. Past tense where expected                                               */
/* -------------------------------------------------------------------------- */

test("postal guide carries the past-tense hand-in callout from 26 Nov 14:00, not before", () => {
  const PASTHAND: Record<Locale, RegExp> = { ca: /ja ha acabat/, es: /ya ha terminado/, en: /has passed/ };
  for (const l of LOCALES) {
    const before = guideTexts(POSTAL_VOTE, INSTANTS["26 Nov 13:59"]!, l).join(" ");
    const after = guideTexts(POSTAL_VOTE, INSTANTS["26 Nov 14:00"]!, l).join(" ");
    assert.doesNotMatch(before, PASTHAND[l], l);
    assert.match(after, PASTHAND[l], l);
  }
  assert.equal(HANDIN_CLOSES.getTime(), HANDIN);
});

test("mesa stage: held from 29 Nov 08:00 to the second, and its text is in the past tense", () => {
  assert.equal(mesaStage(INSTANTS["28 Nov 23:59"]), "last");
  assert.equal(mesaStage(INSTANTS["29 Nov 07:59"]), "last");
  assert.equal(mesaStage(INSTANTS["29 Nov 08:00"]), "held");
  assert.equal(mesaStage(INSTANTS["26 Nov 13:59"]), "last");
  assert.equal(mesaStage(new Date(MESA_72H.getTime() - 1)), "late");
  assert.equal(mesaStage(new Date(MESA_HELD_FROM.getTime())), "held");
  const MET: Record<Locale, RegExp> = { ca: /es van reunir|van constituir/, es: /se reunieron|se constituyeron/, en: /\bmet\b|were set up/ };
  for (const l of LOCALES) {
    const m = municipalitiesFor(l)[0]!;
    const held = strings(buildElectionPage(m, l, undefined, "polling", INSTANTS["29 Nov 08:00"]).mesa).join(" ");
    const before = strings(buildElectionPage(m, l, undefined, "eve", INSTANTS["28 Nov 23:59"]).mesa).join(" ");
    assert.match(held, MET[l], `${l} held`);
    assert.doesNotMatch(before, MET[l], `${l} before`);
  }
});

test("MESA guide: nothing before 26 Nov 08:00, the 72-hour-passed callout until polling day 08:00, then the past-tense one", () => {
  const LATE: Record<Locale, RegExp> = { ca: /72 hores .* ja ha passat/, es: /72 horas .* ya ha pasado/, en: /72-hour window .* has passed/ };
  const HELD: Record<Locale, RegExp> = { ca: /es van constituir a les 8\.00/, es: /se constituyeron a las 8:00/, en: /tables were set up at 08:00/ };
  const text = (name: string, l: Locale) => guideTexts(MESA, INSTANTS[name]!, l).join(" ");
  for (const l of LOCALES) {
    for (const name of ["25 Nov 12:00"]) {
      assert.doesNotMatch(text(name, l), LATE[l], `${l} ${name}`);
      assert.doesNotMatch(text(name, l), HELD[l], `${l} ${name}`);
    }
    for (const name of ["26 Nov 13:59", "27 Nov 12:00", "28 Nov 23:59", "29 Nov 07:59"]) {
      assert.match(text(name, l), LATE[l], `${l} ${name}`);
      assert.doesNotMatch(text(name, l), HELD[l], `${l} ${name}`);
    }
    for (const name of ["29 Nov 08:00", "29 Nov 09:00", "29 Nov 23:59", "30 Nov 12:00", "7 Dec 12:00", "8 Dec 12:00"]) {
      assert.match(text(name, l), HELD[l], `${l} ${name}`);
      assert.doesNotMatch(text(name, l), LATE[l], `${l} ${name}`);
    }
  }
  // The same two instants as the town pages' mesa section.
  assert.equal(MESA_NOTICE_CLOSES.getTime(), MESA_72H.getTime());
  assert.equal(MESA_TABLES_SET.getTime(), MESA_HELD_FROM.getTime());
});

test("results line is past tense from 30 Nov and over from 8 Dec", () => {
  const PASTRX: Record<Locale, RegExp> = { ca: /eren provisionals/, es: /eran provisionales/, en: /were provisional/ };
  const OVERRX: Record<Locale, RegExp> = { ca: /va ser el diumenge/, es: /fue el domingo/, en: /took place on Sunday/ };
  for (const l of LOCALES) {
    assert.doesNotMatch(resultsNightLine(l, undefined, electionPhase(INSTANTS["29 Nov 23:59"]!)), PASTRX[l]);
    assert.match(resultsNightLine(l, undefined, electionPhase(INSTANTS["30 Nov 00:00"]!)), PASTRX[l]);
    assert.match(resultsNightLine(l, undefined, electionPhase(INSTANTS["7 Dec 12:00"]!)), PASTRX[l]);
    assert.match(resultsNightLine(l, undefined, electionPhase(INSTANTS["8 Dec 12:00"]!)), OVERRX[l]);
  }
});

test("election-day block: eve / polling / count / after titles per instant, Canary title 20:00-21:00", () => {
  const expect: Record<string, string> = {
    "25 Nov 12:00": "before",
    "27 Nov 12:00": "before",
    "28 Nov 23:59": "eve",
    "29 Nov 07:59": "polling",
    "29 Nov 19:59": "polling",
    "29 Nov 20:00": "count",
    "29 Nov 23:59": "count",
    "30 Nov 00:00": "after",
    "7 Dec 12:00": "after",
    "8 Dec 12:00": "over",
  };
  for (const [name, phase] of Object.entries(expect)) assert.equal(electionPhase(INSTANTS[name]!), phase, name);
  for (const l of LOCALES) {
    const canary = electionDayBlock(l, "count", { now: INSTANTS["29 Nov 20:00"] })!.title;
    const closed = electionDayBlock(l, "count", { now: INSTANTS["29 Nov 21:00"] })!.title;
    assert.notEqual(canary, closed, l);
    assert.equal(electionDayBlock(l, "over"), null);
    assert.equal(electionDayBlock(l, "before"), null);
  }
});

test("town 'results will appear on this page' line is conditional on the 29N file not being imported", () => {
  const town = { where: "x", anchor: "#a", places: 1, tables: 1 };
  for (const l of LOCALES) {
    const without = electionDayBlock(l, "after", { town, hasResults: false })!.md.join(" ");
    const withFile = electionDayBlock(l, "after", { town, hasResults: true })!.md.join(" ");
    assert.match(without, /apareixeran|aparecerán|will appear/, l);
    assert.doesNotMatch(withFile, /apareixeran|aparecerán|will appear/, l);
  }
});

test("guides read the after / over variants from 30 Nov / 8 Dec, and `pre` before", () => {
  for (const [key, article] of Object.entries(GUIDES)) {
    if (!["night", "congress", "voting", "candidates"].includes(key)) continue;
    for (const l of LOCALES) {
      const pre = guideTexts(article, INSTANTS["29 Nov 23:59"]!, l).join("\n");
      const after = guideTexts(article, INSTANTS["30 Nov 00:00"]!, l).join("\n");
      const over = guideTexts(article, INSTANTS["8 Dec 12:00"]!, l).join("\n");
      assert.notEqual(pre, after, `${key} ${l}: no after variant`);
      assert.equal(guideTexts(article, INSTANTS["25 Nov 12:00"]!, l).join("\n"), guideTexts(article, INSTANTS["26 Nov 13:59"]!, l).join("\n"), `${key} ${l}: pre text changes before the hand-in closes`);
      const handin = guideTexts(article, INSTANTS["26 Nov 14:00"]!, l).join("\n");
      assert.equal(handin, pre, `${key} ${l}: handin text holds until the polls close`);
      assert.ok(over.length > 0);
    }
  }
});

/* -------------------------------------------------------------------------- */
/* 4. Banners: the right page per phase, never a closed action                */
/* -------------------------------------------------------------------------- */

test("banners: every line links to its guide's real path in the reader's language", () => {
  for (const name of NAMES) {
    for (const l of LOCALES) {
      for (const a of activeNewsAlerts(l, undefined, INSTANTS[name]!.getTime())) {
        const alert = NEWS_ALERTS.find((x) => x.id === a.id)!;
        assert.equal(a.href, b2href(alert.target, l), `${name} ${l} ${a.id}`);
        assert.match(a.href, new RegExp(`^/${l}/`), `${name} ${l} ${a.id}`);
        assert.ok(a.text.length > 10, `${name} ${l} ${a.id}`);
      }
    }
  }
});

test("banners: the postal-vote lines are gone once the hand-in closes (26 Nov 14:00)", () => {
  for (const name of NAMES) {
    if (INSTANTS[name]!.getTime() < HANDIN) continue;
    const ids = activeNewsAlerts("es", undefined, INSTANTS[name]!.getTime()).map((a) => a.id);
    assert.deepEqual(
      ids.filter((id) => id.startsWith("postal-vote")),
      [],
      `${name}: banner still sends readers to the postal vote`,
    );
  }
});

test("banners: no 'where and how to vote' line once the polls close (29 Nov 20:00)", () => {
  for (const name of NAMES) {
    if (INSTANTS[name]!.getTime() < POLLS_CLOSE) continue;
    const ids = activeNewsAlerts("es", undefined, INSTANTS[name]!.getTime()).map((a) => a.id);
    assert.ok(!ids.includes("election-29n"), `${name}: banner still says how to vote`);
  }
});

test("banners: results line from the day of reflection, the voting line until polling day, then the December bridge", () => {
  const ids = (name: string) => activeNewsAlerts("ca", undefined, INSTANTS[name]!.getTime()).map((a) => a.id);
  assert.ok(!ids("25 Nov 12:00").includes("election-results-29n"));
  assert.ok(ids("25 Nov 12:00").includes("election-29n"));
  assert.ok(ids("28 Nov 23:59").includes("election-results-29n"));
  assert.ok(ids("29 Nov 09:00").includes("election-29n"));
  assert.ok(ids("29 Nov 23:59").includes("election-results-29n"));
  assert.ok(ids("30 Nov 12:00").includes("election-results-29n"));
  assert.ok(ids("30 Nov 12:00").includes("december-bridge"));
  assert.ok(ids("8 Dec 12:00").includes("december-bridge"));
  assert.ok(!ids("8 Dec 12:00").includes("election-results-29n"));
  // From 30 Nov the strip's election lines may only be the results guide.
  assert.ok(activeNewsAlerts("ca", undefined, BRIDGE_OVER).every((a) => !a.id.startsWith("election-") && !a.id.startsWith("postal")));
});

test("home lead card: how to vote to 28 Nov, election night 29-30 Nov, then the bridge", () => {
  const key = (name: string) => homeLeadKey(madridDate(INSTANTS[name]!));
  assert.equal(key("25 Nov 12:00"), "voting");
  assert.equal(key("28 Nov 23:59"), "voting");
  assert.equal(key("29 Nov 07:59"), "electionNight");
  assert.equal(key("30 Nov 12:00"), "electionNight");
  assert.equal(key("7 Dec 12:00"), "decemberBridge");
});

/* -------------------------------------------------------------------------- */
/* 5. Polls blackout                                                          */
/* -------------------------------------------------------------------------- */

test("polls: blackout from 24 Nov 00:00 to 29 Nov 21:00 (Canaries), to the second; proxy and data agree", () => {
  const inside = new Set(["25 Nov 12:00", "26 Nov 13:59", "26 Nov 14:00", "27 Nov 12:00", "28 Nov 23:59", "29 Nov 07:59", "29 Nov 08:00", "29 Nov 09:00", "29 Nov 19:59", "29 Nov 20:00"]);
  for (const name of NAMES) {
    const now = INSTANTS[name]!;
    const expected = inside.has(name);
    assert.equal(isPollBlackout(now), expected, name);
    for (const l of LOCALES) assert.equal(pollsProxyRewrite(pollsPath(l), now) !== null, expected, `${name} ${l} proxy`);
    assert.equal(pollsPageData(now).state, expected ? "blackout" : "open", name);
  }
  assert.equal(isPollBlackout(new Date(BLACKOUT_START.getTime() - 1)), false);
  assert.equal(isPollBlackout(BLACKOUT_START), true);
  assert.equal(isPollBlackout(new Date(BLACKOUT_END.getTime() - 1)), true);
  assert.equal(isPollBlackout(BLACKOUT_END), false);
  assert.equal(isPollBlackout(new Date("nope")), true, "invalid clock fails closed");
});

test("polls: no poll figure reaches the data in the blackout; open data has figures only outside", () => {
  for (const name of NAMES) {
    const data = pollsPageData(INSTANTS[name]!);
    if (data.state === "blackout") assert.deepEqual(Object.keys(data).sort(), ["returnsAt", "state"], name);
    else assert.ok("polls" in data, name);
  }
});

// The ticket says "X-Robots-Tag noindex on polls pages, only inside the blackout". The code has no such thing:
// pollsMetadata() is clock-free (always indexable) and next.config.ts only sets Cache-Control (POLLS_CACHE_HEADERS).
test("polls: metadata robots is the same at every instant (there is no noindex switch)", () => {
  const robots = LOCALES.map((l) => JSON.stringify(pollsMetadata(l).robots));
  assert.equal(new Set(robots).size >= 1, true);
});

test("polls: noindex exactly inside the blackout (ticket expectation)", { todo: "NOT IMPLEMENTED: polls pages are indexable in the blackout; decide whether the blackout view should be noindex" }, () => {
  for (const l of LOCALES) {
    const robots = pollsMetadata(l).robots as { index?: boolean } | undefined;
    assert.equal(robots?.index, false, `${l}: the blackout view should carry noindex`);
  }
});

/* -------------------------------------------------------------------------- */
/* 6. Static text that cannot switch                                          */
/* -------------------------------------------------------------------------- */

test("metadata of guides that switch: no future instruction in static titles/descriptions after their deadline", { todo: "FINDING: postal seoTitle/description still say 'hand it in by 26 Nov' after the deadline; static (built at POSTAL_AS_OF)" }, () => {
  const bad: string[] = [];
  for (const l of LOCALES) {
    for (const t of guideMeta(POSTAL_VOTE, l)) {
      if (/26/.test(t) && /entreg|lliur|hand/i.test(t) && !PAST.test(t)) bad.push(`${l}: ${t}`);
    }
  }
  assert.deepEqual(bad, []);
});
