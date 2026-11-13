import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

// Release f1b4bda served /favicon.ico, /site.webmanifest, /apple-touch-icon.png,
// /logo.png (the Organization logo) and the IndexNow key file as 404: file
// tracing had already created .next/standalone/public/images (the /img route
// reads it), so `cp -a public "$SA/public"` copied the folder to
// .next/standalone/public/public instead of merging into it.
const deploy = readFileSync(new URL("../ops/vps/deploy.sh", import.meta.url), "utf8");

test("deploy.sh merges public/ into the standalone bundle instead of nesting it", () => {
  assert.doesNotMatch(deploy, /cp -a public "\$SA\/public"\s*$/m);
  assert.match(deploy, /mkdir -p "\$SA\/public"\ncp -a public\/\. "\$SA\/public\/"/);
});

test("deploy.sh health check covers root files from public/", () => {
  const loop = deploy.match(/for path in ([^;]+); do/);
  assert.ok(loop, "health_check path loop not found");
  for (const path of ["/favicon.ico", "/site.webmanifest"]) {
    assert.ok(loop[1]!.split(/\s+/).includes(path), `${path} missing from the health check`);
  }
});

test("the files the head and the JSON-LD reference exist in public/", () => {
  for (const file of ["favicon.ico", "favicon-32.png", "apple-touch-icon.png", "site.webmanifest", "logo.png"]) {
    assert.ok(readFileSync(new URL(`../public/${file}`, import.meta.url)).length > 0, file);
  }
});
