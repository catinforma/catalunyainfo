/**
 * When did the main content of a code-rendered page family last change?
 * (src/lib/seo/body-dates.ts reads the answer; scripts/body-dates.ts writes it.)
 *
 * A family's pages are rendered by route files (`src/app/(public)/[locale]/…/page.tsx`)
 * from the modules and data files they import. Its "body" is that import
 * closure, kept to the places where page content lives (CONTENT_DIRS) and
 * minus the site chrome (what the locale layout imports: header, footer,
 * navigation), which is boilerplate on every page and not a reason to recrawl
 * thousands of URLs. A change to the body is a change to the pages.
 *
 * Changes are detected on normalised source: TypeScript is re-printed without
 * comments or formatting, JSON is re-serialised, so editing a comment or
 * re-indenting a file does not move any date. A change to a string, a table,
 * a data snapshot, a link or a heading does.
 */
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

import ts from "typescript";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

/** Bump when the closure or normalisation rules change (every family then moves once). */
export const BODY_DATES_VERSION = 1;

/** The public routes, one folder per first path segment after the locale. */
export const LOCALE_ROUTES = "src/app/(public)/[locale]";

/** Imported by every page: header, footer, navigation, consent. Not a page's own content. */
export const CHROME_ROOTS = [`${LOCALE_ROUTES}/layout.tsx`, `${LOCALE_ROUTES}/not-found.tsx`];

/** Where page content lives. Imports anywhere else (i18n, db, seo helpers, ui kit) are infrastructure. */
export const CONTENT_DIRS = [
  "src/app/(public)/",
  "src/lib/programmatic/",
  "src/lib/content/",
  "src/components/programmatic/",
  "src/components/blocks/",
];

/** Inside CONTENT_DIRS but plumbing, not content. */
export const INFRA_FILES = new Set([
  "src/lib/content/repository.ts",
  "src/lib/content/publish-article.ts",
  "src/lib/content/types.ts",
  "src/lib/content/seed-taxonomy.ts",
  "src/lib/content/blocks.ts",
  "src/lib/content/inline.tsx",
  "src/lib/content/fit-column.ts",
  "src/lib/content/packed-rows.ts",
  "src/lib/content/images.ts",
  "src/lib/content/day-dependent.ts",
  "src/lib/content/search-query.ts",
  "src/lib/content/related-terms.ts",
  "src/lib/content/author.ts",
  // Re-ranked by a script from analytics: a list of popular pages, not a page's content.
  "src/lib/content/most-read.ts",
  "src/lib/content/most-read.json",
]);

const SOURCE_EXTENSIONS = [".ts", ".tsx", ".json", ".mts", ".js", ".mjs"];

const toRepo = (absolute: string, root: string) => relative(root, absolute).split(sep).join("/");

/* -------------------------------------------------------------------------- */
/* URL -> route files                                                         */
/* -------------------------------------------------------------------------- */

/**
 * The route files that render a public URL (`/es/calculadoras/sueldo-neto/`):
 * the `page.tsx` Next's file-system router picks, and any `layout.tsx` between
 * it and the locale folder. Static folders win over `[param]` folders, which
 * win over catch-alls, as in Next. [] when nothing matches.
 */
export function routeFiles(urlPath: string, root: string = ROOT): string[] {
  const segments = (urlPath.split("?")[0] ?? "").split("/").filter(Boolean).slice(1);
  let dir = join(root, LOCALE_ROUTES);
  const found: string[] = [];
  for (const segment of segments) {
    const entries = existsSync(dir) ? readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory()) : [];
    const exact = entries.find((e) => e.name === segment);
    const param = entries.find((e) => /^\[[^.[\]]+\]$/.test(e.name));
    const catchAll = entries.find((e) => /^\[\[?\.\.\./.test(e.name));
    const next = exact ?? param ?? catchAll;
    if (!next) return [];
    dir = join(dir, next.name);
    const layout = join(dir, "layout.tsx");
    if (existsSync(layout)) found.push(toRepo(layout, root));
    if (next === catchAll) break;
  }
  const page = join(dir, "page.tsx");
  if (!existsSync(page)) return [];
  return [...found, toRepo(page, root)];
}

/* -------------------------------------------------------------------------- */
/* Import closure                                                             */
/* -------------------------------------------------------------------------- */

/** Value imports of a module (`import type` and `export type` carry no content and are skipped). */
export function importSpecifiers(source: string): string[] {
  const out = new Set<string>();
  const patterns = [
    /(?:^|[\s;])import\s+(?!type\s)(?:[\w*{}\s,$]+?\s+from\s+)?["']([^"']+)["']/g,
    /(?:^|[\s;])export\s+(?!type\s)(?:\*(?:\s+as\s+\w+)?|\{[^}]*\})\s+from\s+["']([^"']+)["']/g,
    /\bimport\(\s*["']([^"']+)["']\s*\)/g,
  ];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) if (match[1]) out.add(match[1]);
  }
  return [...out];
}

/** Repo-relative file an import points at, or null for packages and anything unresolved. */
export function resolveImport(fromFile: string, specifier: string, root: string = ROOT): string | null {
  let base: string;
  if (specifier.startsWith("@/")) base = join(root, "src", specifier.slice(2));
  else if (specifier.startsWith("./") || specifier.startsWith("../")) base = resolve(root, dirname(fromFile), specifier);
  else return null;
  const candidates = [base, ...SOURCE_EXTENSIONS.map((ext) => base + ext), ...SOURCE_EXTENSIONS.map((ext) => join(base, `index${ext}`))];
  const hit = candidates.find((candidate) => existsSync(candidate) && statSync(candidate).isFile());
  return hit ? toRepo(hit, root) : null;
}

const importCache = new Map<string, string[]>();

/** The local modules a file imports, resolved (cached per root). */
function localImports(file: string, root: string): string[] {
  const key = `${root}\0${file}`;
  let targets = importCache.get(key);
  if (!targets) {
    targets = file.endsWith(".json")
      ? []
      : importSpecifiers(readFileSync(join(root, file), "utf8"))
          .map((specifier) => resolveImport(file, specifier, root))
          .filter((target): target is string => target !== null);
    importCache.set(key, targets);
  }
  return targets;
}

/**
 * Every local module reachable from the roots (the roots included), following
 * only the files `follow` accepts (the roots are always followed).
 */
export function importClosure(
  roots: readonly string[],
  root: string = ROOT,
  follow: (file: string) => boolean = () => true,
): Set<string> {
  const seen = new Set<string>();
  const queue = roots.filter((file) => existsSync(join(root, file)));
  const rootSet = new Set(queue);
  while (queue.length > 0) {
    const file = queue.pop()!;
    if (seen.has(file)) continue;
    seen.add(file);
    if (!rootSet.has(file) && !follow(file)) continue;
    for (const target of localImports(file, root)) if (!seen.has(target)) queue.push(target);
  }
  return seen;
}

const isContent = (file: string) => CONTENT_DIRS.some((dir) => file.startsWith(dir)) && !INFRA_FILES.has(file);

/**
 * The content family a file belongs to: a folder under lib/programmatic or
 * components/programmatic (the same name in both is one family), a folder
 * under lib/content, the route files, or "shared" (loose files in those
 * folders, the content blocks).
 */
export function contentFamily(file: string): string {
  if (file.startsWith("src/app/")) return "route";
  const programmatic = /^src\/(?:lib|components)\/programmatic\/([^/]+)\//.exec(file);
  if (programmatic) return `p:${programmatic[1]}`;
  if (/^src\/components\/programmatic\/[^/]+$/.test(file)) return "p:loose";
  const content = /^src\/lib\/content\/([^/]+)\//.exec(file);
  if (content) return `c:${content[1]}`;
  return "shared";
}

/**
 * The files that make up a family's body, sorted: its route files and the
 * content they import, without the chrome. Only the family's home content
 * families are followed (`home`, e.g. "p:elections"; by default those its
 * roots import directly); other families reached from there are cross-links
 * (a "next step" box, a link to the fuel prices, a shared not-found constant)
 * and are left out, so that a strike update does not re-date the election
 * pages. Imports through infrastructure (i18n, seo helpers, shared
 * components) are not followed either.
 */
export function bodyFiles(
  routes: readonly string[],
  chrome: ReadonlySet<string>,
  root: string = ROOT,
  homeFamilies?: readonly string[],
): string[] {
  const own = new Set(routes);
  const home = new Set<string>(["route", ...(homeFamilies ?? [])]);
  if (!homeFamilies) {
    for (const file of routes) {
      home.add(contentFamily(file));
      for (const target of localImports(file, root)) home.add(contentFamily(target));
    }
  }
  home.delete("shared");
  // The chrome is subtracted from the shared files only: the footer linking the
  // fuel hub does not make fuel/paths.ts any less part of the fuel pages.
  const inBody = (file: string) => {
    if (!isContent(file)) return false;
    const family = contentFamily(file);
    return home.has(family) || (family === "shared" && !chrome.has(file));
  };
  return [...importClosure(routes, root, inBody)].filter((file) => own.has(file) || inBody(file)).sort();
}

/* -------------------------------------------------------------------------- */
/* Fingerprints                                                               */
/* -------------------------------------------------------------------------- */

const printer = ts.createPrinter({ removeComments: true });

/** What a file means, without its comments and layout. */
export function normalizedSource(file: string, text: string): string {
  if (file.endsWith(".json")) {
    try {
      return JSON.stringify(JSON.parse(text));
    } catch {
      return text;
    }
  }
  const kind = file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sourceFile = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, false, kind);
  return printer.printFile(withoutAdBoxes(sourceFile));
}

/** The server-rendered ad box (components/AdSlot.tsx): `<AdSlot kind=… />`. */
function isAdBox(node: ts.Node): boolean {
  return ts.isJsxSelfClosingElement(node) && ts.isIdentifier(node.tagName) && node.tagName.text === "AdSlot";
}

/** True for a JSX child that is an ad box, or an expression that is only one (`{cond ? <AdSlot … /> : null}`, `{cond && <AdSlot … />}`). */
function isAdChild(node: ts.Node): boolean {
  if (isAdBox(node)) return true;
  if (!ts.isJsxExpression(node) || !node.expression) return false;
  let e: ts.Expression = node.expression;
  while (ts.isParenthesizedExpression(e)) e = e.expression;
  if (ts.isConditionalExpression(e)) {
    const empty = (x: ts.Expression) => x.kind === ts.SyntaxKind.NullKeyword;
    return (isAdBox(e.whenTrue) && empty(e.whenFalse)) || (empty(e.whenTrue) && isAdBox(e.whenFalse));
  }
  return ts.isBinaryExpression(e) && e.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken && isAdBox(e.right);
}

/**
 * An ad box is not page content (the words, tables and links around it are
 * unchanged), so a body that gains or moves one keeps its date: the
 * `<AdSlot … />` elements are dropped, and so are the imports only they used
 * (AdSlot itself, crumbPath for its path).
 */
function withoutAdBoxes(sourceFile: ts.SourceFile): ts.SourceFile {
  if (!sourceFile.text.includes("AdSlot")) return sourceFile;
  const used = new Set<string>();
  const collect = (n: ts.Node) => {
    if (isAdBox(n) || isAdChild(n)) {
      const names = (m: ts.Node) => {
        if (ts.isIdentifier(m)) used.add(m.text);
        ts.forEachChild(m, names);
      };
      names(n);
      return;
    }
    ts.forEachChild(n, collect);
  };
  collect(sourceFile);
  // Identifiers still used once the boxes are gone.
  const stillUsed = new Set<string>();
  const count = (n: ts.Node) => {
    if (isAdBox(n) || isAdChild(n) || ts.isImportDeclaration(n)) return;
    if (ts.isIdentifier(n)) stillUsed.add(n.text);
    ts.forEachChild(n, count);
  };
  count(sourceFile);
  const dropImport = (name: string) => name === "AdSlot" || (used.has(name) && !stillUsed.has(name));
  const result = ts.transform(sourceFile, [
    (ctx) => {
      const visit = (node: ts.Node): ts.Node | undefined => {
        if (ts.isImportDeclaration(node)) {
          const clause = node.importClause;
          if (clause && !clause.name && clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
            const all = clause.namedBindings.elements;
            const keep = all.filter((e) => !dropImport(e.name.text));
            if (keep.length === 0) return undefined;
            if (keep.length === all.length) return node;
            return ctx.factory.updateImportDeclaration(
              node,
              node.modifiers,
              ctx.factory.updateImportClause(clause, clause.isTypeOnly, undefined, ctx.factory.updateNamedImports(clause.namedBindings, keep)),
              node.moduleSpecifier,
              node.attributes,
            );
          }
          return node;
        }
        if ((ts.isJsxElement(node) || ts.isJsxFragment(node)) && node.children.some(isAdChild)) {
          const blank = (c: ts.JsxChild | undefined) => c !== undefined && ts.isJsxText(c) && c.containsOnlyTriviaWhiteSpaces;
          const kept: ts.JsxChild[] = [];
          for (const c of node.children) {
            if (isAdChild(c)) continue;
            // The two blanks either side of a dropped box are one.
            if (blank(c) && blank(kept[kept.length - 1])) continue;
            kept.push(ts.visitNode(c, visit) as ts.JsxChild);
          }
          const children = ctx.factory.createNodeArray(kept);
          return ts.isJsxElement(node)
            ? ctx.factory.updateJsxElement(node, node.openingElement, children, node.closingElement)
            : ctx.factory.updateJsxFragment(node, node.openingFragment, children, node.closingFragment);
        }
        return ts.visitEachChild(node, visit, ctx);
      };
      return (root) => ts.visitEachChild(root, visit, ctx);
    },
  ]);
  return result.transformed[0] as ts.SourceFile;
}

const normalizedCache = new Map<string, string>();

function normalizedFile(file: string, root: string): string {
  const key = `${root}\0${file}`;
  let value = normalizedCache.get(key);
  if (value === undefined) {
    value = normalizedSource(file, readFileSync(join(root, file), "utf8"));
    normalizedCache.set(key, value);
  }
  return value;
}

/** One hash over the normalised files, their paths included. */
export function fingerprint(files: readonly string[], root: string = ROOT): string {
  const hash = createHash("sha256");
  for (const file of [...files].sort()) {
    hash.update(file).update("\0").update(normalizedFile(file, root)).update("\0");
  }
  return `v${BODY_DATES_VERSION}:${hash.digest("hex").slice(0, 32)}`;
}

/* -------------------------------------------------------------------------- */
/* Dates                                                                      */
/* -------------------------------------------------------------------------- */

export interface BodyRecord {
  /** ISO instant the body last changed (went live, when written by a deploy). */
  date: string;
  fingerprint: string;
  /** How many files the body has: a sanity number for reviews. */
  files: number;
}

export interface BodyDatesFile {
  version: number;
  about: string;
  families: Record<string, BodyRecord>;
}

/**
 * The record for a family: the previous one while the body is the same,
 * otherwise a new one dated `changedAt` (the deploy's time, or when the
 * change was committed).
 */
export function nextRecord(previous: BodyRecord | undefined, current: { fingerprint: string; files: number }, changedAt: () => string): BodyRecord {
  if (previous && previous.fingerprint === current.fingerprint) return { ...previous, files: current.files };
  return { date: changedAt(), fingerprint: current.fingerprint, files: current.files };
}
