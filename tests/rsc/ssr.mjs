/**
 * Phase 2 of the payload harness: read the Flight streams printed by
 * tests/rsc/flight.mjs back, as the browser and Next's SSR do, and render
 * them to HTML with the client components' real code.
 *
 *   RSC_PHASE=ssr node --import ./tests/rsc/hooks.mjs tests/rsc/ssr.mjs <flight.jsonl>
 *
 * Prints one JSON object per job: { name, html } (or { name, error }).
 */
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { Readable } from "node:stream";
import { pathToFileURL } from "node:url";

import { createElement, use } from "react";
import { prerenderToNodeStream } from "react-dom/static";
import { createFromNodeStream } from "react-server-dom-webpack/client";

const projectRoot = resolve(import.meta.dirname, "..", "..");

const modules = new Map();
globalThis.__next_require__ = (id) => modules.get(id);
globalThis.__webpack_chunk_load__ = () => Promise.resolve();

const moduleMap = new Proxy({}, { get: (_, id) => new Proxy({}, { get: (__, name) => ({ id, chunks: [], name }) }) });

async function loadClientModules(flight) {
  for (const m of flight.matchAll(/^[0-9a-f]+:I\["([^"]+)"/gm)) {
    const id = m[1];
    if (modules.has(id)) continue;
    modules.set(id, await import(id.startsWith("next/") ? id : pathToFileURL(join(projectRoot, id)).href));
  }
}

async function toHtml(flight) {
  await loadClientModules(flight);
  const response = createFromNodeStream(Readable.from([Buffer.from(flight, "utf8")]), { moduleMap, serverModuleMap: null, moduleLoading: null });
  const Root = () => use(response);
  const { prelude } = await prerenderToNodeStream(createElement(Root), {
    onError(error) {
      throw error;
    },
  });
  const parts = [];
  for await (const chunk of prelude) parts.push(Buffer.from(chunk));
  return Buffer.concat(parts).toString("utf8");
}

for (const line of readFileSync(process.argv[2], "utf8").split("\n")) {
  if (!line.trim()) continue;
  const job = JSON.parse(line);
  if (job.error) {
    process.stdout.write(JSON.stringify({ name: job.name, error: job.error }) + "\n");
    continue;
  }
  try {
    process.stdout.write(JSON.stringify({ name: job.name, html: await toHtml(job.flight) }) + "\n");
  } catch (error) {
    process.stdout.write(JSON.stringify({ name: job.name, error: String(error?.stack ?? error) }) + "\n");
  }
}
