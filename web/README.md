# SAGEC Ltd — website and CMS

Next.js 15 · Prisma + PostgreSQL · Cloudflare R2 · hand-built CMS at `/admin` (same design as the BrightLink CMS,
English only). **Read `docs/PROGRESS.md` first** — it says what is finished, what is not, and what was and was
not tested.

## Run it on your computer

```bash
cd web
cp .env.example .env              # then fill in what you have (R2 can wait: uploads stay off until it is set)
docker compose up -d              # PostgreSQL on port 5434
npm install
npx prisma migrate deploy         # creates the tables
npm run user:create               # asks for your email, name and password
npm run dev                       # http://localhost:3000  ·  CMS: http://localhost:3000/admin
```

## Commands (run inside `web/`)

| Command | What it does |
|---|---|
| `npm run dev` | development server |
| `npm run typecheck` | TypeScript check |
| `npm test` | unit tests (passwords, login lockout, storage keys, photo addresses) |
| `npm run build` | production build |
| `npm run db:migrate` | create a new migration after you change `prisma/schema.prisma` |
| `npm run user:create` | add a CMS user, or reset a password |
