import assert from "node:assert/strict";
import { test } from "node:test";

/**
 * The same official figure, typed in several modules, must be the same
 * number everywhere. On 17 Nov 2026 every copy agreed, but each module's own
 * test compared it with a literal (1221, 5101.2…), so a yearly update that
 * missed one copy would still pass, and two pages would state two values —
 * the kind of disagreement that makes an AI assistant cite the wrong one.
 * These tests tie every copy to the module that quotes the BOE.
 */

const { SMI_HISTORY } = await import("../src/lib/programmatic/smi/rules.ts");
const employment = await import("../src/lib/programmatic/employment/rules.ts");
const netSalary = await import("../src/lib/programmatic/net-salary/rules-2026.ts");
const sickLeave = await import("../src/lib/programmatic/sick-leave/rules.ts");
const selfEmployed = await import("../src/lib/programmatic/self-employed/rules-2026.ts");
const subsidy = await import("../src/lib/programmatic/unemployment-subsidy/rules.ts");
const { hubCards } = await import("../src/lib/programmatic/calculators/hub.ts");

const smi2026 = SMI_HISTORY.find((y) => y.year === 2026)!;

test("SMI 2026 (RD 126/2026): one value in every module", () => {
  assert.equal(employment.SMI_MONTHLY, smi2026.monthly);
  assert.equal(employment.SMI_ANNUAL, smi2026.annual);
  // The net-salary deduction (DA 61ª LIRPF) is defined at the 2026 SMI.
  assert.equal(netSalary.SMI_DEDUCTION.fullUpTo, smi2026.annual);
  // The subsidy income limit is 75 % of the monthly SMI without extra payments, as SEPE prints it.
  assert.equal(subsidy.INCOME_LIMIT, subsidy.SEPE_INCOME_LIMIT_2026);
});

test("2026 maximum contribution base (Orden PJC/297/2026): one value in every module", () => {
  const max = employment.MAX_CONTRIBUTION_BASE;
  assert.equal(netSalary.SOCIAL_SECURITY.maxBaseMonthly, max);
  assert.equal(sickLeave.MAX_BASE_2026, max);
  assert.equal(selfEmployed.MAX_BASE, max);
  for (const band of selfEmployed.BANDS_2026) assert.ok(band.maxBase <= max, `band ${band.table} ${band.n}: ${band.maxBase} above ${max}`);
});

test("2026 minimum contribution base (groups 4-7): one value in every module", () => {
  const min = employment.MIN_CONTRIBUTION_BASE;
  assert.equal(netSalary.SOCIAL_SECURITY.minBaseMonthly, min);
  assert.equal(selfEmployed.CORPORATE_MIN_BASE, min);
});

test("unemployment subsidy amounts: the SEPE figures, the IPREM shares, and the calculators hub card", () => {
  assert.deepEqual([...employment.SUBSIDY_MONTHLY], [...subsidy.SEPE_AMOUNTS_2026]);
  assert.deepEqual(
    [0.95, 0.9, 0.8].map((share) => Math.round(employment.IPREM_MONTHLY * share * 100) / 100),
    [...subsidy.SEPE_AMOUNTS_2026],
  );
  const card = hubCards().find((c) => c.key === "unemployment-subsidy")!;
  const [a, b, c] = subsidy.SEPE_AMOUNTS_2026;
  for (const locale of ["ca", "es"] as const) assert.ok(card.answers[locale].includes(`${a}, ${b}, ${c} €`), `${locale} card`);
  assert.ok(card.answers.en.includes(`€${a}, €${b}, €${c}`), "en card");
});
