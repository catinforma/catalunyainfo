/**
 * Teaches the Node test runner the `@/` path alias that tsconfig defines for
 * the application. Without it, unit tests could only exercise modules that
 * happen to use relative imports, which would quietly exclude most of the code.
 */
import { register } from "node:module";
import { pathToFileURL } from "node:url";

register("./alias-hooks.mjs", pathToFileURL(import.meta.filename));
