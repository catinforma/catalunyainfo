import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { FOLLOW_CHANNEL_COPY, WHATSAPP_CHANNEL_URL } from "../src/lib/share/channel.ts";

test("WhatsApp channel: the owner's channel URL, copy in ca/es/en", () => {
  assert.match(WHATSAPP_CHANNEL_URL, /^https:\/\/whatsapp\.com\/channel\/[A-Za-z0-9]+$/);
  for (const l of ["ca", "es", "en"] as const) {
    const c = FOLLOW_CHANNEL_COPY[l];
    assert.ok(c.title && c.text && c.cta && c.short, l);
  }
});

test("WhatsApp channel: linked at the end of every article and in the footer, as a plain link", () => {
  assert.match(readFileSync("src/components/pages/EntryArticle.tsx", "utf8"), /<FollowChannel locale=\{locale\} \/>/);
  assert.match(readFileSync("src/components/SiteFooter.tsx", "utf8"), /<FollowChannelLink locale=\{locale\} \/>/);
  // No WhatsApp script or widget: nothing third-party loads before a tap.
  assert.doesNotMatch(readFileSync("src/components/share/FollowChannel.tsx", "utf8"), /<script|next\/script/);
});
