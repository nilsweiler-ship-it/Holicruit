# Postgres + migrations

Holicruit now runs on **PostgreSQL** with **Prisma Migrate** (versioned,
committed migrations) instead of SQLite + `db push`. This gives real
concurrency, backups, and a schema history you can evolve safely once trial
users have real data.

The migration files live in `prisma/migrations/` and **are committed to git**.
Production applies them automatically; you generate them locally.

---

## One-time setup (do this once, on your Mac, before the next deploy)

Prisma can't generate a migration without a live Postgres to diff against, so we
spin one up locally with Docker.

1. **Start a local Postgres** (Docker Desktop must be running):

   ```
   docker compose up -d
   ```

   This runs Postgres 16 on `localhost:5432` with db/user/password all
   `holicruit` (see `docker-compose.yml`).

2. **Point your local `.env` at it** (copy from `.env.example` if you don't have
   a `.env` yet):

   ```
   DATABASE_URL=postgresql://holicruit:holicruit@localhost:5432/holicruit?schema=public
   ```

3. **Generate the initial migration** — this creates every table and writes
   `prisma/migrations/…_init/migration.sql`:

   ```
   npx prisma migrate dev --name init
   ```

4. **Seed the demo data** (optional locally, automatic in prod):

   ```
   npm run db:seed
   ```

5. **Run the app** and confirm it works against Postgres:

   ```
   npm run dev
   ```

6. **Commit the migration** and push:

   ```
   git add prisma/migrations
   git commit -m "Postgres: initial migration"
   git push
   ```

> ⚠️ **Deploy only after the init migration is committed.** Production's start
> command runs `prisma migrate deploy`, which applies committed migrations. If
> none are committed yet, it applies nothing, the database has no tables, and the
> app will error with "relation … does not exist".

---

## Making schema changes later

Whenever you edit `prisma/schema.prisma`:

```
npm run db:migrate -- --name describe_the_change    # e.g. add_feedback_tags
git add prisma/migrations && git commit -m "…" && git push
```

`migrate dev` creates the migration, applies it to your local db, and
regenerates the Prisma client. On deploy, `migrate deploy` applies the same
migration to production. Never hand-edit an already-applied migration — add a
new one.

---

## Production (Railway)

1. In your Railway project, click **New → Database → Add PostgreSQL**. Railway
   provisions it and exposes a `DATABASE_URL`.
2. In the **app service → Variables**, set `DATABASE_URL` to reference the
   database (Railway lets you reference another service's variable):

   ```
   DATABASE_URL = ${{Postgres.DATABASE_URL}}
   ```

   (Use whatever name Railway gave the Postgres service.)
3. Deploy. The start command (`prisma migrate deploy && seed && next start`)
   creates the tables from your committed migrations and seeds demo data on an
   empty database.

No persistent volume is needed anymore — the managed Postgres holds the data,
and Railway backs it up.

---

## Handy commands

| Command | What it does |
|---|---|
| `docker compose up -d` | Start local Postgres |
| `npm run db:migrate -- --name x` | Create + apply a migration locally |
| `npm run db:deploy` | Apply committed migrations (what prod runs) |
| `npm run db:seed` | Load demo data |
| `npm run db:studio` | Open Prisma Studio to browse the data |
