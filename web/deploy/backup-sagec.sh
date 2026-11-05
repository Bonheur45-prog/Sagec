#!/usr/bin/env bash
# Nightly copy of the SAGEC database (texts, settings, messages; the photos themselves are in Cloudflare R2).
# Install once on the VPS (as the user that owns /var/www/sagec):
#   install -m 700 deploy/backup-sagec.sh /var/www/sagec/backup-sagec.sh
#   crontab -e   →   add:   17 2 * * * /var/www/sagec/backup-sagec.sh >> /var/www/sagec/backup.log 2>&1
# Keeps the last 14 days in /var/www/sagec/backups. If an rclone remote named "gdrive" exists
# (rclone config, e.g. Google Drive), each copy is also sent to gdrive:sagec-backups.
set -euo pipefail
DIR=/var/www/sagec/backups
mkdir -p "$DIR"
# DATABASE_URL from the site's .env (postgresql://user:pass@localhost:5432/sagec?schema=public)
DATABASE_URL=$(grep -E '^DATABASE_URL=' /var/www/sagec/.env | head -1 | cut -d= -f2- | tr -d '"')
FILE="$DIR/sagec-$(date +%Y-%m-%d).sql.gz"
pg_dump --no-owner --no-privileges "${DATABASE_URL%%\?*}" | gzip -9 > "$FILE.tmp"
mv "$FILE.tmp" "$FILE"
find "$DIR" -name 'sagec-*.sql.gz' -mtime +14 -delete
if command -v rclone >/dev/null && rclone listremotes | grep -qx 'gdrive:'; then
  rclone copy "$FILE" gdrive:sagec-backups --quiet
  rclone delete gdrive:sagec-backups --min-age 30d --quiet || true
fi
echo "$(date -Is) backup ok: $FILE ($(du -h "$FILE" | cut -f1))"
