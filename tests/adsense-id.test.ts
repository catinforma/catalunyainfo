import assert from "node:assert/strict";
import { test } from "node:test";

import { adsensePublisherId } from "../src/lib/site.ts";

test("adsensePublisherId accepts only a pub- ID", () => {
  const before = process.env.ADSENSE_PUBLISHER_ID;
  try {
    process.env.ADSENSE_PUBLISHER_ID = " pub-3574717751788007 ";
    assert.equal(adsensePublisherId(), "pub-3574717751788007");
    for (const bad of ["", "ca-pub-3574717751788007", "pub-12", "pub-XXXXXXXXXXXXXXXX"]) {
      process.env.ADSENSE_PUBLISHER_ID = bad;
      assert.equal(adsensePublisherId(), null, bad);
    }
  } finally {
    if (before === undefined) delete process.env.ADSENSE_PUBLISHER_ID;
    else process.env.ADSENSE_PUBLISHER_ID = before;
  }
});
