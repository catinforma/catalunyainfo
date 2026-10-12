import assert from "node:assert/strict";
import { test } from "node:test";

import { buildHistory } from "../src/lib/content/elections/history.ts";

// Real figures for the 2023 general election in Catalonia (Generalitat open data).
const elections = [
  { id_eleccio: "G20231", data_eleccio: "2023-07-23T00:00:00.000" },
  { id_eleccio: "G20191", data_eleccio: "2019-04-28T00:00:00.000" },
];
const turnout = [
  { id_eleccio: "G20231", cens_electoral: "5703784", votants: "3575234", vots_valids: "3543029", escons: "48" },
  { id_eleccio: "G20191", cens_electoral: "5588108", votants: "4167172", vots_valids: "4146563", escons: "48" },
];
const votes = [
  { id_eleccio: "G20231", candidatura_sigles: "PSC", vots: "1221335", escons: "19" },
  { id_eleccio: "G20231", candidatura_sigles: "VOX", vots: "275080", escons: "2" },
  { id_eleccio: "G20231", candidatura_sigles: "CUP-PR", vots: "99644", escons: "0" },
  // April 2019: the dataset carries votes but no seats.
  { id_eleccio: "G20191", candidatura_sigles: "ERC-SOBIRAN", vots: "1020392" },
  { id_eleccio: "G20191", candidatura_sigles: "PSC", vots: "962257" },
];

test("percentages are computed from the counts, newest election first", () => {
  const history = buildHistory("congress", elections, turnout, votes);
  assert.equal(history.error, null);
  const [latest] = history.elections;
  assert.equal(latest?.id, "G20231");
  assert.equal(latest?.turnout.toFixed(1), "62.7");
  assert.equal(latest?.lists[0]?.share.toFixed(1), "34.5");
  assert.deepEqual(latest?.lists.map((list) => list.short), ["PSC", "VOX"], "lists without seats are dropped");
});

test("an election with no seat data is flagged, not shown as zero seats", () => {
  const april = buildHistory("congress", elections, turnout, votes).elections[1];
  assert.equal(april?.seatsMissing, true);
  assert.deepEqual(april?.lists.map((list) => list.short), ["ERC-SOBIRAN", "PSC"]);
});

test("nothing usable is an error", () => {
  assert.notEqual(buildHistory("parliament", [], [], []).error, null);
});
