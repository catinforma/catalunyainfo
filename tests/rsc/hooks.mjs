import { existsSync, readFileSync, statSync } from "node:fs";
import { createRequire, registerHooks } from "node:module";
import { dirname, join, resolve as resolvePath } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

/**
 * Module hooks that let the bare Node runner render a page the way Next
 * does, without `next build` (tests/rsc-payload.test.ts):
 *
 * Phase "flight" (process started with --conditions=react-server): server
 * components render to the real React Flight stream, the RSC payload Next
 * inlines in every HTML page.
 *  - a module whose first statement is "use client" becomes a set of client
 *    references, which is what Next's bundler hands the Flight renderer: its
 *    props are serialised, its code never runs;
 *  - `next/link` and `next/image` are client references too.
 *
 * Phase "ssr" (RSC_PHASE=ssr, no react-server condition): the Flight stream
 * is read back and rendered to HTML with the client components' real code,
 * as Next's SSR does; `next/link` renders a plain <a>, `next/image` an <img>.
 *
 * Both phases:
 *  - `@/` alias, extensionless imports and `server-only`, as tests/alias-hooks.mjs;
 *  - `.tsx` compiled with the project's TypeScript (JSX → react/jsx-runtime);
 *  - `react`, `react-dom` and React Flight are Next's vendored copies (the
 *    ones App Router pages run on), production builds;
 *  - `next/navigation`, `next/headers` and `next/cache` get inert stubs; the
 *    site header and footer render nothing (they read the database and are
 *    the same on every page: the test adds a fixed allowance for them).
 *
 * Synchronous hooks (module.registerHooks), so CommonJS `require` inside
 * React's own bundles is redirected too.
 */

const PHASE = process.env.RSC_PHASE === "ssr" ? "ssr" : "flight";
const projectRoot = resolvePath(dirname(fileURLToPath(import.meta.url)), "..", "..");
const srcRoot = join(projectRoot, "src");
const stubs = join(projectRoot, "tests", "rsc", "stubs");
const require = createRequire(import.meta.url);
const ts = require("typescript");

const nextCompiled = join(projectRoot, "node_modules", "next", "dist", "compiled");
const REACT =
  PHASE === "flight"
    ? {
        react: join(nextCompiled, "react", "react.react-server.js"),
        "react/jsx-runtime": join(nextCompiled, "react", "jsx-runtime.react-server.js"),
        "react/jsx-dev-runtime": join(nextCompiled, "react", "jsx-dev-runtime.react-server.js"),
        "react-dom": join(nextCompiled, "react-dom", "react-dom.react-server.js"),
      }
    : {
        react: join(nextCompiled, "react", "index.js"),
        "react/jsx-runtime": join(nextCompiled, "react", "jsx-runtime.js"),
        "react/jsx-dev-runtime": join(nextCompiled, "react", "jsx-dev-runtime.js"),
        "react-dom": join(nextCompiled, "react-dom", "index.js"),
        "react-dom/static": join(nextCompiled, "react-dom", "static.node.js"),
      };
const REDIRECT = {
  ...REACT,
  // Next's bundles require its vendored copies by path, which skips their
  // package "exports" (and so the react-server condition): map them as well.
  ...Object.fromEntries(Object.entries(REACT).map(([k, v]) => [`next/dist/compiled/${k}`, v])),
  "react-server-dom-webpack/server": join(nextCompiled, "react-server-dom-webpack", "server.node.js"),
  "react-server-dom-webpack/client": join(nextCompiled, "react-server-dom-webpack", "client.node.js"),
  "server-only": join(projectRoot, "tests", "server-only-stub.mjs"),
  "next/link": join(stubs, PHASE === "flight" ? "link.mjs" : "link-ssr.mjs"),
  "next/image": join(stubs, PHASE === "flight" ? "image.mjs" : "image-ssr.mjs"),
  "next/navigation": join(stubs, "navigation.mjs"),
  "next/headers": join(stubs, "headers.mjs"),
  "next/cache": join(stubs, "cache.mjs"),
  "@/components/SiteHeader": join(stubs, "empty-component.mjs"),
  "@/components/SiteFooter": join(stubs, "empty-component.mjs"),
};

const EXTENSIONS = [".ts", ".tsx", ".mts", ".js", ".mjs"];

function firstExisting(base) {
  const candidates = [base, ...EXTENSIONS.map((ext) => base + ext), ...EXTENSIONS.map((ext) => join(base, `index${ext}`))];
  return candidates.find((c) => existsSync(c) && statSync(c).isFile());
}

function resolve(specifier, context, nextResolve) {
  const redirect = REDIRECT[specifier];
  if (redirect) return { url: pathToFileURL(redirect).href, shortCircuit: true };
  if (specifier.startsWith("@/")) {
    const found = firstExisting(join(srcRoot, specifier.slice(2)));
    if (found) return { url: pathToFileURL(found).href, shortCircuit: true };
  }
  const isRelative = specifier.startsWith("./") || specifier.startsWith("../");
  if (isRelative && !/\.[cm]?[jt]sx?$|\.json$/.test(specifier) && context.parentURL?.startsWith("file:")) {
    const found = firstExisting(resolvePath(dirname(fileURLToPath(context.parentURL)), specifier));
    if (found) return { url: pathToFileURL(found).href, shortCircuit: true };
  }
  return nextResolve(specifier, context);
}

/** True when the module's first statement is the "use client" directive. */
function isClientModule(source) {
  return /^(?:\s|\/\/[^\n]*\n|\/\*[\s\S]*?\*\/)*["']use client["']/.test(source);
}

/** The value exports of a module, read from its syntax (types left out). */
function exportNames(source, fileName) {
  const kind = fileName.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sf = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, false, kind);
  const names = new Set();
  for (const st of sf.statements) {
    const mods = (ts.canHaveModifiers(st) ? ts.getModifiers(st) : undefined) ?? [];
    const exported = mods.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
    const isDefault = mods.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword);
    if (ts.isExportAssignment(st)) names.add("default");
    else if (ts.isExportDeclaration(st)) {
      if (!st.isTypeOnly && st.exportClause && ts.isNamedExports(st.exportClause)) {
        for (const el of st.exportClause.elements) if (!el.isTypeOnly) names.add(el.name.text);
      }
    } else if (exported && isDefault) names.add("default");
    else if (exported && (ts.isFunctionDeclaration(st) || ts.isClassDeclaration(st)) && st.name) names.add(st.name.text);
    else if (exported && ts.isVariableStatement(st)) {
      for (const d of st.declarationList.declarations) if (ts.isIdentifier(d.name)) names.add(d.name.text);
    }
  }
  return [...names];
}

function clientReferenceModule(id, names) {
  const lines = [`import rsdw from ${JSON.stringify(pathToFileURL(REDIRECT["react-server-dom-webpack/server"]).href)};`];
  const ref = (name) =>
    `rsdw.registerClientReference(function () { throw new Error(${JSON.stringify(`${id}#${name} is a client component`)}); }, ${JSON.stringify(id)}, ${JSON.stringify(name)})`;
  for (const name of names) lines.push(name === "default" ? `export default ${ref(name)};` : `export const ${name} = ${ref(name)};`);
  return lines.join("\n");
}

function load(url, context, nextLoad) {
  if (url.startsWith("file:") && /\.(tsx|ts)$/.test(url) && !url.includes("/node_modules/")) {
    const file = fileURLToPath(url);
    const source = readFileSync(file, "utf8");
    if (PHASE === "flight" && isClientModule(source)) {
      const id = file.slice(projectRoot.length + 1).replaceAll("\\", "/");
      return { format: "module", source: clientReferenceModule(id, exportNames(source, file)), shortCircuit: true };
    }
    if (file.endsWith(".tsx")) {
      const out = ts.transpileModule(source, {
        fileName: file,
        compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, isolatedModules: true },
      });
      return { format: "module", source: out.outputText, shortCircuit: true };
    }
    // Plain .ts: Node strips the types itself; say it is ESM (no package "type").
    return { ...nextLoad(url, { ...context, format: "module-typescript" }), shortCircuit: true };
  }
  return nextLoad(url, context);
}

registerHooks({ resolve, load });
