#!/usr/bin/env bash
# Changes the SAGEC database password on the VPS (run by Actions → Server setup, "Change the database
# password"). The new password arrives on stdin, so it never appears in a command line or a log.
# It logs in with the current password (from /var/www/sagec/.env) and changes it for that same user;
# the workflow then writes the new address into .env and restarts the site.
set -euo pipefail
NEW=$(cat)
ENV_FILE=${ENV_FILE:-/var/www/sagec/.env}
OLD=$(grep -E '^DATABASE_URL=' "$ENV_FILE" | head -1 | cut -d= -f2- | tr -d '"')
OLD=${OLD%%\?*}
DBUSER=$(printf '%s' "$OLD" | sed -E 's#^postgres(ql)?://([^:]+):.*#\2#')
DBHOST=$(printf '%s' "$OLD" | sed -E 's#^[^@]+@([^:/]+).*#\1#')
DBPORT=$(printf '%s' "$OLD" | sed -nE 's#^[^@]+@[^:/]+:([0-9]+)/.*#\1#p')
DBNAME=$(printf '%s' "$OLD" | sed -E 's#.*/([^/?]+)$#\1#')
if PGPASSWORD="$NEW" psql -h "$DBHOST" -p "${DBPORT:-5432}" -U "$DBUSER" -d "$DBNAME" -tAc 'select 1' >/dev/null 2>&1; then
  echo "The database already uses the new password."
  exit 0
fi
psql "$OLD" -v ON_ERROR_STOP=1 -v pw="$NEW" -q <<'SQL'
ALTER ROLE CURRENT_USER WITH PASSWORD :'pw';
SQL
echo "Database password changed."
