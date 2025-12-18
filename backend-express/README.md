# backend-express (Express + TypeScript + Supabase Auth)

This is a minimal scaffold demonstrating how to use Supabase Auth in an Express + TypeScript backend and use the Supabase JS client to interact with Supabase services.

Setup

1. Copy environment variables from `.env.example` to `.env` and set appropriate values (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` for server admin tasks).

2. Install dependencies:

```bash
cd backend-express
npm install
```

3. Start in development:

```bash
npm run dev
```

Endpoints
- `GET /api/health` — simple health check
- `GET /api/auth/me` — protected; supply `Authorization: Bearer <access_token>` to return the supabase user object

Notes
This scaffold uses the Supabase auth REST endpoint (`/auth/v1/user`) to validate access tokens and the `@supabase/supabase-js` client for server operations.

Notes
- The project no longer uses Prisma. Database models should be managed in Supabase (via SQL migrations or the dashboard). If you prefer an ORM like Prisma, we can reintroduce it, but currently the server uses Supabase client directly.
