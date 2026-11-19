/**
 * Phase 1 of the payload harness: render server components to the React
 * Flight stream, the RSC payload Next inlines in the page's HTML.
 *
 *   node --conditions=react-server --import ./tests/rsc/register.mjs tests/rsc/flight.mjs <jobs.json>
 *
 * jobs.json: [{ "name", "module", "export", "props", "setup"? }]; `module`
 * and `setup` are "@/…" or project-relative paths; `setup` is imported first
 * (fixtures, e.g. a fetch stub). Prints one JSON object per job:
 * { name, flight } (or { name, error }).
 */
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { Writable } from "node:stream";
import { pathToFileURL } from "node:url";

import { createElement } from "react";
import rsdw from "react-server-dom-webpack/server";

const projectRoot = resolve(import.meta.dirname, "..", "..");
const spec = (p) => (p.startsWith("@/") ? p : pathToFileURL(join(projectRoot, p)).href);

/** Every client reference resolves; ids are short like webpack's, with production-sized chunk lists. */
const ids = new Map();
const chunkList = (n) => Array.from({ length: 4 }, (_, i) => `/_next/static/chunks/${(n * 7 + i).toString(36).padStart(13, "0")}.js`);
const manifest = new Proxy(
  {},
  {
    get(_, key) {
      if (typeof key !== "string") return undefined;
      const [path, name = ""] = key.split("#");
      if (!ids.has(path)) ids.set(path, 10000 + ids.size);
      return { id: path, chunks: chunkList(ids.get(path)), name };
    },
  },
);

function render(element) {
  return new Promise((done, fail) => {
    const parts = [];
    const sink = new Writable({
      write(chunk, _enc, cb) {
        parts.push(Buffer.from(chunk));
        cb();
      },
      final(cb) {
        done(Buffer.concat(parts).toString("utf8"));
        cb();
      },
    });
    const errors = [];
    const stream = rsdw.renderToPipeableStream(element, manifest, {
      onError(error) {
        errors.push(error);
        return "";
      },
    });
    sink.on("finish", () => {
      if (errors.length) fail(errors[0]);
    });
    stream.pipe(sink);
  });
}

const jobs = JSON.parse(readFileSync(process.argv[2], "utf8"));
for (const job of jobs) {
  try {
    if (job.setup) await import(spec(job.setup));
    const mod = await import(spec(job.module));
    const Component = mod[job.export];
    if (typeof Component !== "function") throw new Error(`${job.module} has no export ${job.export}`);
    const flight = await render(createElement(Component, job.props ?? {}));
    process.stdout.write(JSON.stringify({ name: job.name, flight }) + "\n");
  } catch (error) {
    process.stdout.write(JSON.stringify({ name: job.name, error: String(error?.stack ?? error) }) + "\n");
  }
}
