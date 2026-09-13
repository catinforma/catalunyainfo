/**
 * CLI wrapper for the weekend guide publisher. The logic lives in
 * src/lib/content/weekend/publish.ts so that it can also run inside a
 * deployment, where the database credentials actually exist.
 *
 * Usage: DATABASE_URL=postgres://... npm run publish:weekend
 */
export {};

async function main() {
  const { publishWeekendGuide } = await import("../src/lib/content/weekend/publish.ts");
  const summary = await publishWeekendGuide();

  console.log(`entry:   ${summary.entryId}`);
  console.log(`sources: ${summary.sources}`);
  for (const edition of summary.editions) {
    console.log(
      `${edition.locale}: ${edition.action}  /${edition.locale}/${edition.path}/  (${edition.blocks} blocks)`,
    );
  }
  console.log(`published_at:     ${summary.publishedAt}`);
  console.log(`last_verified_at: ${summary.lastVerifiedAt}`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
