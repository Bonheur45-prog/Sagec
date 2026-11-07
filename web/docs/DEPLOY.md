# Putting sagecltd.com live on the VPS

Same setup as BrightLink and Oak Elite Home: the site is **built on GitHub** (not on the VPS, to save its memory),
copied to `/var/www/sagec`, run by **PM2 on port 3022** and served by **Caddy** (which also handles HTTPS).
PostgreSQL is the one already running on the VPS for BrightLink: SAGEC gets its own database and user in it.

Nothing here touches StockPro, BrightLink or Oak Elite Home. The old site keeps running on Cloudflare until step 9,
so visitors never see a gap.

Order: **1** database → **2** folder + settings file → **3** GitHub secrets → **4** first deploy → **5** first CMS
login → **6** copy the content from the old CMS → **7** look it over privately → **8** Caddy → **9** switch the
domain → **10** backups.

---

## 1. Database (on the VPS, once)

```bash
ssh <you>@<VPS>
openssl rand -base64 24 | tr -d '/+=' > ~/.pg-sagec-pass && chmod 600 ~/.pg-sagec-pass   # a strong password, kept on the VPS
sudo -u postgres psql <<SQL
CREATE USER sagec WITH PASSWORD '$(cat ~/.pg-sagec-pass)';
CREATE DATABASE sagec OWNER sagec;
ALTER DATABASE sagec SET timezone TO 'UTC';
SQL
```
`timezone = UTC` matters: dates are stored without a zone and the site expects UTC.

## 2. Folder and settings file (on the VPS, once)

```bash
sudo ss -ltnp | grep 3022 || echo "port 3022 is free"   # must say free (3020 = Oak, 3021 = BrightLink)
sudo mkdir -p /var/www/sagec/releases && sudo chown -R $USER: /var/www/sagec
nano /var/www/sagec/.env && chmod 600 /var/www/sagec/.env
```
Content of `/var/www/sagec/.env` (fill in the `<…>`):
```dotenv
DATABASE_URL="postgresql://sagec:<password from ~/.pg-sagec-pass>@localhost:5432/sagec?schema=public"
SITE_URL="https://sagecltd.com"

# Cloudflare R2 (bucket sagec-media; the token is shown once when you create it)
R2_ACCOUNT_ID="<Account ID>"
R2_ACCESS_KEY_ID="<Access Key ID>"
R2_SECRET_ACCESS_KEY="<Secret Access Key>"
R2_BUCKET="sagec-media"
R2_PUBLIC_HOSTNAME="media.sagecltd.com"

# Brevo (SMTP & API → SMTP tab). The sender must be on the domain authenticated in Brevo.
SMTP_HOST="smtp-relay.brevo.com"
SMTP_PORT="587"
SMTP_USER="<SMTP login shown by Brevo, e.g. 9a1b2c001@smtp-brevo.com>"
SMTP_PASS="<SMTP key>"
EMAIL_FROM="SAGEC website <website@sagecltd.com>"

# Optional, recommended: Cloudflare Turnstile (spam check on the contact form)
TURNSTILE_SITE_KEY=""
TURNSTILE_SECRET_KEY=""
```

## 3. GitHub secrets (once)

GitHub → the Sagec repo → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Value |
|---|---|
| `DATABASE_URL` | exactly the same as in the VPS `.env` |
| `SITE_URL` | `https://sagecltd.com` |
| `R2_PUBLIC_HOSTNAME` | `media.sagecltd.com` |
| `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY` | the same three values as in the BrightLink repo (same server, same login) |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` | as in the `.env` (only the import in step 6 uses them) |
| `PAYLOAD_EMAIL`, `PAYLOAD_PASSWORD` | optional: your login of the old CMS, to also copy contact messages and unapproved comments |

The database is never opened to the internet: GitHub reaches it through an SSH tunnel to the VPS.

## 4. First deploy

GitHub → **Actions → Deploy to VPS → Run workflow** → tick **"Also create the starter Site settings"** → Run.
It applies the database tables, builds, uploads, starts `sagec` in PM2 and waits until it answers.
After that, every merge to `main` that changes `web/` deploys by itself.

Check on the VPS: `pm2 ls` shows `sagec` online next to the others; `curl -sI http://127.0.0.1:3022/ | head -1` → `200`.

## 5. First CMS login

There is no sign-up page, so the first user is made with a script from your own copy of the repo, through a tunnel:
```bash
ssh -N -L 15432:127.0.0.1:5432 <you>@<VPS>        # terminal 1: leave it open
cd Sagec/web && npm ci                             # terminal 2
DATABASE_URL="postgresql://sagec:<password>@127.0.0.1:15432/sagec?schema=public" npm run user:create
```
More users are added later in the CMS itself (**Users**).

## 6. Copy the content from the old CMS

GitHub → **Actions → Import from the old CMS → Run workflow**:
1. **Address of the old CMS**: the address you log in at today, without `/admin`.
2. First run with **Check only** ticked: it changes nothing and lists what it would copy (and any photo it cannot
   download).
3. Run again with **Check only** unticked. Photos and videos are downloaded from the old CMS, resized and stored in
   R2; texts, pages, services, projects, reviews, partners, jobs, articles, comments (and messages, with the login
   secrets) are copied. Safe to run again: nothing is duplicated, and pages already edited in the new CMS are kept.

If the old CMS only runs on your computer (GitHub cannot reach it), run the same thing locally instead: start the
old CMS, open the tunnel from step 5, then in `web/`:
`DATABASE_URL=… R2_…=… PAYLOAD_URL=http://localhost:3000 npm run import:payload -- --check` (then without `--check`).

## 7. Look it over before anyone else sees it

```bash
ssh -N -L 3022:127.0.0.1:3022 <you>@<VPS>
```
Open http://localhost:3022 (the site) and http://localhost:3022/admin/login (the CMS). Check the pages, the photos,
**CMS → Pages**, **Media library** (photos without a description are listed there), and send yourself a message
from the contact form (it should arrive by email and appear in **CMS → Messages**).

## 8. Caddy

Add the two blocks from `web/deploy/Caddyfile.sagec` to the end of `/etc/caddy/Caddyfile`, then:
```bash
sudo caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile && sudo systemctl reload caddy
```
A reload does not interrupt the other sites; a file with a mistake is refused and the old settings stay.

## 9. Switch the domain (the moment it goes live)

In Cloudflare:
1. **Workers & Pages** → the old SAGEC site → **Custom domains** → remove `sagecltd.com` and `www.sagecltd.com`.
2. **sagecltd.com → DNS → Records**: add `A` `@` → the VPS IP, and `CNAME` `www` → `sagecltd.com`, both
   **DNS only (grey cloud)**. Leave `media` (R2) and the Brevo records as they are.
3. Within a minute Caddy gets the HTTPS certificates. Open https://sagecltd.com and https://www.sagecltd.com.

Then: Google Search Console → add `sagecltd.com` (if not there) → Sitemaps → `https://sagecltd.com/sitemap.xml`.
Google Analytics keeps counting in the same property (`G-862Z8TQWQM`, already in Site settings).

Keep the old CMS for a week, then switch it off.

## 10. Nightly backup

```bash
install -m 700 <repo>/web/deploy/backup-sagec.sh /var/www/sagec/backup-sagec.sh   # or paste it with nano
crontab -e     # add this line:
17 2 * * * /var/www/sagec/backup-sagec.sh >> /var/www/sagec/backup.log 2>&1
```
Every night at 02:17 the database is saved to `/var/www/sagec/backups` (14 days kept). If an rclone remote called
`gdrive` exists on the VPS, each copy also goes to Google Drive (`sagec-backups`, 30 days). The photos themselves
are safe in R2. Restore: `gunzip -c backups/sagec-<date>.sql.gz | psql "<DATABASE_URL without ?schema=public>"`.

---

## Everyday

- **Deploys**: merge to `main`. A deploy that does not answer within 30 s fails and prints the log; the previous
  release keeps running.
- **Roll back**: `cd /var/www/sagec && ls -1dt releases/*` then
  `ln -sfn releases/<older> current && pm2 reload sagec`.
- **After changing `.env`**: `pm2 restart sagec --update-env`.
- **Logs**: `pm2 logs sagec --lines 100`.
- **Memory**: one Node process, heap capped at 384 MB, restarted by PM2 above 600 MB.
