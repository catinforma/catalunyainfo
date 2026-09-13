/**
 * Creates or updates a CMS account.
 *
 * There is no self-service sign-up anywhere in the application: accounts exist
 * only because someone with database access ran this. That removes a whole
 * class of exposure from a backoffice that has publish rights.
 *
 * Usage:
 *   node --experimental-strip-types scripts/create-user.ts \
 *     --email you@example.com --name "Your Name" --role admin
 *
 * The password is read from the CI_PASSWORD environment variable so it never
 * lands in the shell history:
 *   CI_PASSWORD='…' node --experimental-strip-types scripts/create-user.ts …
 */
import { parseArgs } from "node:util";
import { createInterface } from "node:readline/promises";

const { values } = parseArgs({
  options: {
    email: { type: "string" },
    name: { type: "string" },
    role: { type: "string", default: "editor" },
  },
});

const ROLES = ["admin", "editor", "author", "viewer"] as const;
type Role = (typeof ROLES)[number];

async function main() {
  const email = values.email?.trim().toLowerCase();
  const name = values.name?.trim();
  const role = (values.role ?? "editor") as Role;

  if (!email || !name) {
    console.error("Usage: --email <address> --name <name> [--role admin|editor|author|viewer]");
    process.exit(1);
  }
  if (!ROLES.includes(role)) {
    console.error(`Role must be one of: ${ROLES.join(", ")}`);
    process.exit(1);
  }

  let password = process.env.CI_PASSWORD;
  if (!password) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    password = await rl.question("Password (at least 12 characters): ");
    rl.close();
  }

  // Imported lazily so the argument checks above run without loading the app.
  const { hashPassword } = await import("../src/lib/auth/password.ts");
  const { requireDb, schema } = await import("../src/lib/db/client.ts");
  const { eq, sql } = await import("drizzle-orm");

  const passwordHash = await hashPassword(password);
  const db = requireDb();

  // Upsert by hand: the uniqueness constraint is a functional index on
  // lower(email), which ON CONFLICT cannot target directly.
  const existing = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(sql`lower(${schema.users.email}) = ${email}`)
    .limit(1);

  if (existing[0]) {
    await db
      .update(schema.users)
      .set({ name, passwordHash, role, isActive: true, updatedAt: new Date() })
      .where(eq(schema.users.id, existing[0].id));
    console.log(`Account updated: ${email} (${role})`);
    process.exit(0);
  }

  await db.insert(schema.users).values({ email, name, passwordHash, role });

  console.log(`Account created: ${email} (${role})`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
