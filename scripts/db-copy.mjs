/**
 * Copies the whole database from one Postgres to another (Neon -> Supabase,
 * 26 Oct 2026, when the Neon free plan ran out of compute hours).
 *
 *   node scripts/db-copy.mjs info     row counts and size on both sides
 *   node scripts/db-copy.mjs schema   create the schema on the target (drizzle/*.sql)
 *   node scripts/db-copy.mjs diff     compare columns, indexes, constraints, triggers
 *   node scripts/db-copy.mjs copy     truncate the target and COPY every table across
 *   node scripts/db-copy.mjs verify   row counts and an md5 of every table, both sides
 *   node scripts/db-copy.mjs lock     enable RLS and revoke the Supabase API roles
 *   node scripts/db-copy.mjs backup source|target   COPY dump of every table to backups/
 *   node scripts/db-copy.mjs app-url | vercel env add ...   production URL, pipe only
 *
 * Connection strings are read from `.env.migrate` (gitignored) as SOURCE_URL
 * and TARGET_URL (NEON_URL / SUPABASE_URL also accepted) and never printed.
 * A Supabase transaction-pooler URL (port 6543) is switched to the session
 * pooler (5432) here, because DDL and COPY need a session.
 */
import { readFileSync } from "node:fs";
import { pipeline } from "node:stream/promises";
import { join } from "node:path";
import { readdirSync } from "node:fs";
import postgres from "postgres";

const env = Object.fromEntries(
  readFileSync(".env.migrate", "utf8")
    .split(/\r?\n/)
    .map((line) => line.match(/^\s*([A-Z_]+)\s*=\s*"?([^"]*?)"?\s*$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2]]),
);
/**
 * Passwords pasted from a dashboard are often not percent-encoded ("#" or "!"
 * break URL parsing), so the password part is re-encoded here. Everything up
 * to the last "@" after the user name is the password.
 */
export function encodePassword(url) {
  const m = url.match(/^(postgres(?:ql)?:\/\/)([^:@/]+):(.*)@([^@/]+\/.*)$/);
  if (!m) return url;
  let password = m[3];
  try {
    password = decodeURIComponent(password);
  } catch {
    // a literal "%" that is not an escape: keep it as typed
  }
  return `${m[1]}${m[2]}:${encodeURIComponent(password)}@${m[4]}`;
}

const sourceUrl = encodePassword(env.SOURCE_URL || env.NEON_URL || env.DATABASE_URL_UNPOOLED || "");
const targetUrl = encodePassword((env.TARGET_URL || env.SUPABASE_URL || "").replace(/:6543\//, ":5432/"));
if (!sourceUrl || !targetUrl) {
  console.error("Missing SOURCE_URL/NEON_URL or TARGET_URL/SUPABASE_URL in .env.migrate");
  process.exit(1);
}

const opts = { max: 1, ssl: "require", prepare: false, onnotice: () => {}, idle_timeout: 20, connect_timeout: 30 };
function connect(label, url) {
  try {
    return postgres(url, opts);
  } catch {
    // Never echo the URL: it carries the password.
    console.error(`${label} connection string is not a valid URL (not printed)`);
    process.exit(1);
  }
}
const src = connect("source", sourceUrl);
const dst = connect("target", targetUrl);

/**
 * postgres.js leaves a connection stuck after a large COPY ... TO STDOUT (the
 * next query never runs), so every COPY gets a connection of its own.
 */
async function once(url, run) {
  const sql = postgres(url, opts);
  try {
    return await run(sql);
  } finally {
    await sql.end({ timeout: 1 });
  }
}
const host = (url) => new URL(url).hostname;

/** Tables in public, parents before children (foreign keys). */
async function tablesInOrder(sql) {
  const tables = (await sql`select tablename from pg_tables where schemaname = 'public' order by tablename`).map((r) => r.tablename);
  const fks = await sql`
    select c.conrelid::regclass::text as child, c.confrelid::regclass::text as parent
    from pg_constraint c join pg_namespace n on n.oid = c.connamespace
    where c.contype = 'f' and n.nspname = 'public'`;
  const strip = (name) => name.replace(/^public\./, "").replace(/"/g, "");
  const deps = new Map(tables.map((t) => [t, new Set()]));
  for (const { child, parent } of fks) if (strip(child) !== strip(parent)) deps.get(strip(child))?.add(strip(parent));
  const ordered = [];
  const seen = new Set();
  const visit = (t, stack = new Set()) => {
    if (seen.has(t)) return;
    if (stack.has(t)) throw new Error(`foreign-key cycle at ${t}`);
    stack.add(t);
    for (const p of deps.get(t) ?? []) visit(p, stack);
    stack.delete(t);
    seen.add(t);
    ordered.push(t);
  };
  tables.forEach((t) => visit(t));
  return ordered;
}

async function counts(sql, tables) {
  const out = {};
  for (const t of tables) out[t] = Number((await sql.unsafe(`select count(*)::int as n from "${t}"`))[0].n);
  return out;
}

async function info() {
  for (const [label, sql, url] of [["source", src, sourceUrl], ["target", dst, targetUrl]]) {
    const [{ size, version }] = await sql`select pg_size_pretty(pg_database_size(current_database())) as size, current_setting('server_version') as version`;
    const schemas = (await sql`select nspname from pg_namespace where nspname not like 'pg_%' and nspname <> 'information_schema' order by 1`).map((r) => r.nspname);
    const ext = (await sql`select extname || ' ' || extversion as e from pg_extension order by 1`).map((r) => r.e);
    const tables = await tablesInOrder(sql);
    console.log(`\n${label} ${host(url)} pg ${version} size ${size}`);
    console.log(`  schemas: ${schemas.join(", ")}`);
    console.log(`  extensions: ${ext.join(", ")}`);
    console.log(`  public tables (${tables.length}):`, JSON.stringify(await counts(sql, tables)));
  }
}

async function schema() {
  const existing = await dst`select count(*)::int as n from pg_tables where schemaname = 'public'`;
  if (existing[0].n > 0) console.log(`target already has ${existing[0].n} public tables; statements that exist are skipped`);
  const srcExt = (await src`select extname from pg_extension where extname <> 'plpgsql'`).map((r) => r.extname);
  for (const e of srcExt) {
    try {
      await dst.unsafe(`create extension if not exists "${e}"`);
      console.log(`extension ${e} ok`);
    } catch (error) {
      console.log(`extension ${e}: ${error.message}`);
    }
  }
  const dir = "drizzle";
  let applied = 0;
  let skipped = 0;
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
    const statements = readFileSync(join(dir, file), "utf8").split("--> statement-breakpoint").map((s) => s.trim()).filter(Boolean);
    for (const statement of statements) {
      try {
        await dst.unsafe(statement);
        applied += 1;
      } catch (error) {
        if (/already exists|42P07|42710|42P06/i.test(error.message)) {
          skipped += 1;
          continue;
        }
        console.error(`${file}: ${error.message}\n  ${statement.slice(0, 200)}`);
        throw error;
      }
    }
  }
  console.log(`schema: ${applied} applied, ${skipped} skipped`);
}

async function describe(sql) {
  const columns = await sql`
    select table_name || '.' || column_name || ' ' || data_type || coalesce('(' || udt_name || ')', '') || ' null=' || is_nullable || ' default=' || coalesce(column_default, '-') as d
    from information_schema.columns where table_schema = 'public'`;
  const indexes = await sql`select indexdef as d from pg_indexes where schemaname = 'public'`;
  const constraints = await sql`
    select conrelid::regclass::text || ' ' || conname || ' ' || pg_get_constraintdef(c.oid) as d
    from pg_constraint c join pg_namespace n on n.oid = c.connamespace
    -- Postgres 18 also lists NOT NULL as constraints (contype n); 17 keeps them
    -- only as column nullability, which the columns check already compares.
    where n.nspname = 'public' and c.contype <> 'n'`;
  const triggers = await sql`
    select event_object_table || ' ' || trigger_name || ' ' || action_timing || ' ' || event_manipulation as d
    from information_schema.triggers where trigger_schema = 'public'`;
  const functions = await sql`
    select p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')' as d
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public'`;
  const types = await sql`
    select t.typname || ' ' || string_agg(e.enumlabel, ',' order by e.enumsortorder) as d
    from pg_type t join pg_enum e on e.enumtypid = t.oid join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' group by t.typname`;
  return { columns, indexes, constraints, triggers, functions, types };
}

async function diff() {
  const [a, b] = [await describe(src), await describe(dst)];
  let differences = 0;
  for (const kind of Object.keys(a)) {
    const left = new Set(a[kind].map((r) => r.d));
    const right = new Set(b[kind].map((r) => r.d));
    const onlySource = [...left].filter((d) => !right.has(d));
    const onlyTarget = [...right].filter((d) => !left.has(d));
    console.log(`${kind}: source ${left.size}, target ${right.size}`);
    for (const d of onlySource) console.log(`  only in source: ${d}`);
    for (const d of onlyTarget) console.log(`  only in target: ${d}`);
    differences += onlySource.length + onlyTarget.length;
  }
  console.log(differences === 0 ? "schemas match" : `${differences} differences`);
  return differences;
}

async function copy() {
  const tables = await tablesInOrder(src);
  const targetTables = new Set((await dst`select tablename from pg_tables where schemaname = 'public'`).map((r) => r.tablename));
  const missing = tables.filter((t) => !targetTables.has(t));
  if (missing.length) throw new Error(`target is missing tables: ${missing.join(", ")} (run schema first)`);
  await dst.unsafe(`truncate ${tables.map((t) => `"${t}"`).join(", ")} cascade`);
  for (const t of tables) {
    const columns = (await src`select column_name from information_schema.columns where table_schema = 'public' and table_name = ${t} order by ordinal_position`).map((r) => `"${r.column_name}"`).join(", ");
    await once(sourceUrl, (from) =>
      once(targetUrl, async (to) => {
        const readable = await from.unsafe(`copy "${t}" (${columns}) to stdout`).readable();
        const writable = await to.unsafe(`copy "${t}" (${columns}) from stdin`).writable();
        await pipeline(readable, writable);
      }),
    );
    console.log(`copied ${t}`);
  }
  const sequences = await src`select sequencename, last_value from pg_sequences where schemaname = 'public'`;
  for (const { sequencename, last_value } of sequences) {
    if (last_value === null) continue;
    await dst.unsafe(`select setval('public."${sequencename}"', ${Number(last_value)}, true)`);
    console.log(`sequence ${sequencename} -> ${last_value}`);
  }
}

async function fingerprint(sql, t) {
  const [{ n, h }] = await sql.unsafe(`select count(*)::int as n, md5(coalesce(string_agg(md5(x::text), '' order by md5(x::text)), '')) as h from "${t}" x`);
  return `${n} ${h}`;
}

async function verify() {
  await src`set timezone = 'UTC'`;
  await dst`set timezone = 'UTC'`;
  let bad = 0;
  for (const t of await tablesInOrder(src)) {
    const [a, b] = [await fingerprint(src, t), await fingerprint(dst, t)];
    const ok = a === b;
    if (!ok) bad += 1;
    console.log(`${ok ? "OK  " : "DIFF"} ${t}: source ${a.split(" ")[0]} rows, target ${b.split(" ")[0]} rows${ok ? "" : ` (${a} vs ${b})`}`);
  }
  console.log(bad === 0 ? "all tables identical" : `${bad} tables differ`);
  return bad;
}

/**
 * Supabase exposes the public schema through its Data API to the anon and
 * authenticated roles. The site never uses that API, so it gets nothing:
 * RLS on with no policies, and no table privileges. The site connects as the
 * owner (postgres), which RLS does not restrict.
 */
async function lock() {
  for (const t of await tablesInOrder(dst)) await dst.unsafe(`alter table "${t}" enable row level security`);
  for (const role of ["anon", "authenticated"]) {
    const [{ exists }] = await dst`select exists(select 1 from pg_roles where rolname = ${role}) as exists`;
    if (!exists) continue;
    await dst.unsafe(`revoke all on all tables in schema public from ${role}`);
    await dst.unsafe(`revoke all on all sequences in schema public from ${role}`);
    await dst.unsafe(`revoke all on all functions in schema public from ${role}`);
    await dst.unsafe(`alter default privileges in schema public revoke all on tables from ${role}`);
    await dst.unsafe(`alter default privileges in schema public revoke all on sequences from ${role}`);
    await dst.unsafe(`alter default privileges in schema public revoke all on functions from ${role}`);
  }
  const open = await dst`
    select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity`;
  const grants = await dst`
    select table_name, grantee, privilege_type from information_schema.role_table_grants
    where table_schema = 'public' and grantee in ('anon', 'authenticated')`;
  console.log(`tables without RLS: ${open.length}; grants left to anon/authenticated: ${grants.length}`);
}

/**
 * `backup source|target`: every public table as a COPY text file under
 * backups/<date>-<side>/ (gitignored: it holds contact messages and admin
 * password hashes). Restore = `schema`, then `copy "t" from stdin` per file in
 * the order written to ORDER.txt. The Supabase free plan has no backups.
 */
async function backup() {
  const side = process.argv[3] === "source" ? "source" : "target";
  const sql = side === "source" ? src : dst;
  const { mkdirSync, createWriteStream, writeFileSync } = await import("node:fs");
  const dir = join("backups", `${new Date().toISOString().slice(0, 10)}-${side}`);
  mkdirSync(dir, { recursive: true });
  const tables = await tablesInOrder(sql);
  for (const t of tables) {
    await once(side === "source" ? sourceUrl : targetUrl, async (one) => {
      const readable = await one.unsafe(`copy "${t}" to stdout`).readable();
      await pipeline(readable, createWriteStream(join(dir, `${t}.copy`)));
    });
  }
  writeFileSync(join(dir, "ORDER.txt"), tables.join("\n") + "\n");
  writeFileSync(join(dir, "COUNTS.json"), JSON.stringify(await counts(sql, tables), null, 2));
  console.log(`backup of ${side} (${host(side === "source" ? sourceUrl : targetUrl)}): ${tables.length} tables in ${dir}`);
}

/**
 * `app-url`: the production APP_DATABASE_URL (transaction pooler, encoded
 * password, sslmode=require), for piping only:
 *   node scripts/db-copy.mjs app-url | npx vercel env add APP_DATABASE_URL production --sensitive --force
 * Refuses to print to a terminal.
 */
async function appUrl() {
  if (process.stdout.isTTY) throw new Error("app-url only writes to a pipe (it contains the password)");
  const url = encodePassword(env.TARGET_URL || env.SUPABASE_URL || "");
  if (!/:6543\//.test(url)) throw new Error("SUPABASE_URL is not the transaction pooler (port 6543)");
  process.stdout.write(`${url.split("?")[0]}?sslmode=require`);
}

const steps = { info, schema, diff, copy, verify, lock, backup, "app-url": appUrl };
const step = steps[process.argv[2]];
if (!step) {
  console.error(`usage: node scripts/db-copy.mjs ${Object.keys(steps).join("|")}`);
  process.exit(1);
}
try {
  const result = await step();
  process.exitCode = typeof result === "number" && result > 0 ? 2 : 0;
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  // A connection left stuck by COPY keeps the event loop alive: close with a
  // deadline and exit explicitly.
  await Promise.race([Promise.all([src.end({ timeout: 1 }), dst.end({ timeout: 1 })]), new Promise((r) => setTimeout(r, 3000))]);
  process.exit(process.exitCode ?? 0);
}
