/**
 * Prints the AdSense readiness report to the terminal and writes a timestamped
 * snapshot into docs/ADSENSE_READINESS.md.
 *
 * The verdict is never better than READY FOR MANUAL REVIEW. A script cannot
 * judge originality or usefulness; it can only confirm that the things Google
 * asks a publisher to have are actually there.
 *
 * Usage: npm run audit:readiness
 */
export {};

async function main() {
  const { buildReadinessReport } = await import("../src/lib/admin/readiness.ts");
  const report = await buildReadinessReport();

  const width = Math.max(...report.checks.map((c) => c.label.length), 10);
  console.log("");
  console.log(`CatalunyaInfo readiness — ${report.verdict}`);
  console.log(`generated ${report.generatedAt.toISOString()}`);
  console.log("");

  for (const check of report.checks) {
    const marker =
      check.status === "pass"
        ? "ok  "
        : check.status === "fail"
          ? "FAIL"
          : check.status === "warn"
            ? "warn"
            : "info";
    console.log(`${marker}  ${check.label.padEnd(width)}  ${check.detail}`);
  }
  console.log("");

  process.exit(report.verdict === "NOT READY" ? 1 : 0);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
