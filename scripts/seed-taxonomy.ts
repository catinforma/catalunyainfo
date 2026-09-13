/**
 * CLI wrapper for the taxonomy seed. The logic lives in
 * src/lib/content/seed-taxonomy.ts so that it can also run inside a deployment,
 * where the database credentials actually exist.
 *
 * Usage: npm run db:seed:taxonomy
 */
export {};

async function main() {
  const { seedTaxonomy } = await import("../src/lib/content/seed-taxonomy.ts");
  const summary = await seedTaxonomy();
  console.log(
    `Taxonomy seeded: ${summary.categories} categories, ${summary.tags} tags. No content was created.`,
  );
  process.exit(0);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
