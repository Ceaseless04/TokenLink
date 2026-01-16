# backend-express (Express + TypeScript + Supabase Auth) 🚀

A small Express + TypeScript backend that demonstrates how to integrate Supabase Auth and use the Supabase JS client (`@supabase/supabase-js`) for server-side database operations. It provides a lightweight API for users, organizations (clubs), organization memberships, attendees (students), events, and basic RSVP handling.

---

## Quickstart ⚡

1. Copy environment variables:

```bash
cd backend-express
cp .env.example .env
# then edit .env and set your Supabase credentials
```

2. Install dependencies:

```bash
npm install
```

3. Run in development mode:

```bash
npm run dev
```

4. Run tests:

```bash
npm test
```

---

## Environment Variables 🔑

- `SUPABASE_URL` — Your Supabase project URL
- `SUPABASE_ANON_KEY` — Public anon key (used for non-admin actions)
- `SUPABASE_SERVICE_ROLE_KEY` — Service role key (admin access). **Never expose this key in the browser or public repos.**
- `PORT` — Optional, defaults to `4000`

The server creates two clients in `src/supabaseClient.ts`:
- `supabase` (anon client)
- `supabaseAdmin` (service role client, falls back to anon if service key not provided)

> The admin client is used server-side to read/write database tables and to validate tokens.

---

## API Endpoints 📚

All routes are mounted under `/api`.

- `GET /api/health` — Health check, returns `{ status: 'ok' }`.

Auth
- `GET /api/auth/me` — Protected route; requires `Authorization: Bearer <access_token>` and returns the Supabase user object (validated using `supabaseAdmin.auth.getUser`).

Users
- `POST /api/users` — Create a user record linked to a Supabase user (fields: `email`, `supabaseId`)
- `GET /api/users/:id` — Read user by id
- `PUT /api/users/:id` — Update user
- `DELETE /api/users/:id` — Delete user

Organizations
- `POST /api/organizations` — Create an organization (club)
- `GET /api/organizations/:id` — Read organization
- `PUT /api/organizations/:id` — Update organization
- `DELETE /api/organizations/:id` — Delete organization

Organization Members
- `POST /api/organization_members` — Add member to organization (fields: `organization_id`, `user_id`, `role`)
- `GET /api/organization_members/:id` — Read membership
- `PUT /api/organization_members/:id` — Update membership
- `DELETE /api/organization_members/:id` — Remove membership

Attendees
- `POST /api/attendees` — Create attendee (student) record
- `GET /api/attendees/:id` — Read attendee
- `PUT /api/attendees/:id` — Update attendee
- `DELETE /api/attendees/:id` — Delete attendee

Events
- `POST /api/events` — Create event
- `POST /api/events/:id/rsvp` — RSVP / upsert attendance for an event (basic upsert, no atomic capacity enforcement yet)
- `GET /api/events/:id` — Read event
- `PUT /api/events/:id` — Update event
- `DELETE /api/events/:id` — Delete event

Authentication
- Protected endpoints expect an `Authorization: Bearer <access_token>` header. The middleware `supabaseAuth` validates the token via `supabaseAdmin.auth.getUser(token)` and attaches the Supabase user to `req.supabaseUser`.

---

## Database / Migrations 🗄️

This project does not embed an ORM. Instead, the database schema is defined via SQL migrations in the `migrations/` folder. These are intended for use with Postgres (Supabase).

Key migration files:
- `001_create_tables.sql` — `users`, `organizations`, `attendees`, `events` tables
- `002_create_event_attendees.sql` — `event_attendees` table and `set_updated_at` trigger
- `003_create_organization_members.sql` — `organization_members` table

Apply these either via the Supabase SQL editor or `psql` against your database.

---

## Testing 🧪

Tests live under `src/__tests__/` and use `jest` + `supertest`.

Run:

```bash
npm test
```

The tests mock or simulate Supabase responses (see individual test files) to validate routing and business logic.

---

## Implementation notes & TODOs 📝

- RSVP endpoint currently performs a simple `upsert` into `event_attendees`; capacity enforcement, waitlists, and atomic reservation checking should be implemented in the database (transactions) or with row-level locking for production readiness.
- The server uses `supabaseAdmin` to perform all read/write operations; take care to keep the `SERVICE_ROLE` key secret.
- If you prefer an ORM (Prisma/TypeORM), this project can be extended to use one, but it intentionally keeps DB logic minimal and close to the migrations.

---

## Scripts

- `npm run dev` — start dev server (auto-restarts via `ts-node-dev`)
- `npm run build` — compile TypeScript
- `npm start` — run compiled JS
- `npm test` — run unit/integration tests

---

## Contributing & License

Contributions are welcome — please open issues or PRs. See the top-level `LICENSE` for licensing details.

---

If you'd like, I can also add example curl commands for each endpoint or update tests to cover outstanding edge-cases. 💡
