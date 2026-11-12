#!/usr/bin/env bash
# /usr/local/bin/catalunyainfo-db-backup (installed from ops/vps/db-backup.sh)
#
# Nightly backup of the local PostgreSQL database (moved here from Supabase on
# 12 Nov 2026, when the Supabase free plan ran out of egress):
#   1. pg_dump (custom format) to /srv/catalunyainfo/backups/db/, 30 days kept;
#   2. off-site copy: the same dump restored into the old Supabase project
#      (public schema only), which stays a warm standby. Restoring there is
#      ingress, which the free plan does not meter. Skipped when
#      SUPABASE_DATABASE_URL is unset.
#
# Run as root by catalunyainfo-db-backup.service. Never prints a URL.
# Restore locally:  sudo -u postgres pg_restore --clean --if-exists --no-owner \
#                     --role=catinfo -d catalunyainfo <file.dump>
set -euo pipefail

DIR=/srv/catalunyainfo/backups/db
KEEP_DAYS=30
PGBIN=/usr/lib/postgresql/17/bin
install -d -m 700 -o postgres -g postgres "$DIR"

stamp=$(date -u +%Y%m%dT%H%M%SZ)
file="$DIR/catalunyainfo-$stamp.dump"
runuser -u postgres -- "$PGBIN/pg_dump" -Fc --no-owner --no-acl -n public -d catalunyainfo -f "$file"
# A dump that pg_restore cannot list is not a backup.
runuser -u postgres -- "$PGBIN/pg_restore" --list "$file" >/dev/null
echo "local dump ok: $(basename "$file") $(stat -c %s "$file") bytes"
find "$DIR" -name 'catalunyainfo-*.dump' -mtime +"$KEEP_DAYS" -delete

if [ -n "${SUPABASE_DATABASE_URL:-}" ]; then
  # The transaction pooler (6543) refuses DDL; the session pooler (5432) takes it.
  url=${SUPABASE_DATABASE_URL/:6543\//:5432\/}
  if "$PGBIN/pg_restore" --dbname="$url" --clean --if-exists --no-owner --no-acl \
       --single-transaction -n public "$file" 2>&1 | sed -E 's#postgres(ql)?://[^ ]*#<url>#g'; then
    # Tables recreated there must stay closed to Supabase's Data API roles
    # (same lock as `node scripts/db-copy.mjs lock`, 26 Oct 2026).
    "$PGBIN/psql" "$url" -q -v ON_ERROR_STOP=1 >/dev/null <<'SQL'
DO $$
DECLARE t text; r text;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
  FOREACH r IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
      EXECUTE format('REVOKE ALL ON ALL TABLES IN SCHEMA public FROM %I', r);
      EXECUTE format('REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM %I', r);
      EXECUTE format('REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM %I', r);
    END IF;
  END LOOP;
END $$;
SQL
    open=$("$PGBIN/psql" "$url" -Atc "select count(*) from information_schema.role_table_grants where table_schema='public' and grantee in ('anon','authenticated')")
    norls=$("$PGBIN/psql" "$url" -Atc "select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and not c.relrowsecurity")
    if [ "$open" != "0" ] || [ "$norls" != "0" ]; then
      echo "off-site copy NOT locked: grants=$open tables_without_rls=$norls" >&2
      exit 1
    fi
    echo "off-site copy ok (Supabase standby, locked)"
  else
    echo "off-site copy FAILED (local dump is fine)" >&2
    exit 1
  fi
fi
