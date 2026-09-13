import { fileURLToPath, pathToFileURL } from "node:url";
import { existsSync } from "node:fs";
import { dirname, isAbsolute, join, resolve as resolvePath } from "node:path";

/**
 * Resolution hooks that make the application's module graph loadable by the
 * bare Node test runner:
 *
 *  - the `@/` path alias from tsconfig;
 *  - extensionless relative imports, which TypeScript allows and Node does not;
 *  - `server-only`, a build-time marker with no runtime behaviour outside a
 *    Next bundle.
 *
 * Without these, only modules that happen to use fully-specified relative
 * imports could be unit-tested, which would quietly exclude most of the code.
 */

const projectRoot = resolvePath(dirname(fileURLToPath(import.meta.url)), "..");
const srcRoot = join(projectRoot, "src");

const EXTENSIONS = [".ts", ".tsx", ".mts", ".js", ".mjs"];

function firstExisting(base) {
  const candidates = [
    base,
    ...EXTENSIONS.map((ext) => base + ext),
    ...EXTENSIONS.map((ext) => join(base, `index${ext}`)),
  ];
  return candidates.find((candidate) => existsSync(candidate) && !candidate.endsWith("\\"));
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier === "server-only") {
    return {
      url: pathToFileURL(join(projectRoot, "tests", "server-only-stub.mjs")).href,
      shortCircuit: true,
    };
  }

  if (specifier.startsWith("@/")) {
    const found = firstExisting(join(srcRoot, specifier.slice(2)));
    if (found) return nextResolve(pathToFileURL(found).href, context);
  }

  const isRelative = specifier.startsWith("./") || specifier.startsWith("../");
  const hasExtension = /\.[cm]?[jt]sx?$/.test(specifier);

  if (isRelative && !hasExtension && context.parentURL) {
    const parentDir = dirname(fileURLToPath(context.parentURL));
    const base = isAbsolute(specifier) ? specifier : resolvePath(parentDir, specifier);
    const found = firstExisting(base);
    if (found) return nextResolve(pathToFileURL(found).href, context);
  }

  return nextResolve(specifier, context);
}
