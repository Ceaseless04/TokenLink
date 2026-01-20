# backend-express (Express + TypeScript + Supabase Auth) 🚀

A small Express + TypeScript backend demonstrating Supabase Auth and `@supabase/supabase-js` for server-side DB operations. Provides a lightweight API for users, organizations (clubs), memberships, attendees (students), events, and basic RSVP handling.

---

## Quickstart — run & test locally ⚡

1. Copy environment variables and edit:

```bash
cp .env.example .env
# then edit .env and set your SupABASE credentials and PORT if needed
```

2. Install dependencies:

```bash
npm install
```

3. Start in development mode (hot reload):

```bash
npm run dev
```

4. Run tests (includes OpenAPI validation test):

```bash
npm test
```

---

## Environment Variables 🔑

- `SUPABASE_URL` — Your Supabase project URL
- `SUPABASE_ANON_KEY` — Public anon key (used for non-admin actions)
- `SUPABASE_SERVICE_ROLE_KEY` — Service role key (admin access). **Never commit this key.**
- `PORT` — Optional, defaults to `4000`
- `EXPOSE_API_DOCS` — Set to `true` to expose `/api-docs` in production (default: disabled)
- `SWAGGER_SERVER_URL` — Optional override for the server URL shown in the OpenAPI spec

The server creates these clients in `src/supabaseClient.ts`:
- `supabase` (anon)
- `supabaseAdmin` (service role; falls back to anon if not provided)

---

## Development & API docs (Swagger) 📖🔧

- Swagger UI is available at: `http://localhost:4000/api-docs` (mounted only when `NODE_ENV !== 'production'`, unless `EXPOSE_API_DOCS=true`).
- Raw OpenAPI JSON: `http://localhost:4000/api-docs.json`
- Spec file: `src/swagger.ts` — edit/add path definitions or switch to auto-generated docs via JSDoc + `swagger-jsdoc`.

### Testing protected routes in Swagger UI (step-by-step) 🔐

1. Create or use an existing Supabase user (via Supabase dashboard or admin endpoint).
   - Example admin create (replace `<PROJECT>` and service role key):

```bash
curl -X POST "https://<PROJECT>.supabase.co/auth/v1/admin/users" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'
```

2. Exchange credentials for an access token (get `access_token`):

```bash
curl -X POST "https://<PROJECT>.supabase.co/auth/v1/token?grant_type=password" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=test@example.com&password=pass123"
```

3. Open `http://localhost:4000/api-docs` and click the **Authorize** button in Swagger UI. Paste the token as `Bearer <access_token>` and click *Authorize*.

4. Test protected endpoints directly in Swagger UI (e.g., `POST /api/organizations`, `POST /api/events`, `POST /api/events/{id}/rsvp`). The Bearer token will be sent automatically with requests.

### Example flow to test the app (Swagger or curl)

1. Create organization (requires auth):

```json
POST /api/organizations
{
  "name": "Chess Club",
  "slug": "chess-club"
}
```

2. Create an attendee for the current auth user:

```json
POST /api/attendees
{
  "first_name": "Alice",
  "last_name": "A"
}
```

3. Create an event under the organization (requires an organizer role):

```json
POST /api/events
{
  "club_id": "<org_id>",
  "title": "Weekly Meetup",
  "start_time": "2026-01-20T18:00:00Z",
  "end_time": "2026-01-20T20:00:00Z"
}
```

4. RSVP to the event:

```json
POST /api/events/{id}/rsvp
{
  "attendee_id": "<attendee_id>",
  "status": "going"
}
```

> Tip: Use Swagger UI to run these sequences quickly — responses and request bodies are interactive.

---

## Testing & validation 🧪

- Run the full test suite:

```bash
npm test
```

- Run only the OpenAPI validation test (useful after editing `src/swagger.ts`):

```bash
npx jest src/__tests__/openapi.test.ts -i
```

- Validate the OpenAPI JSON manually with `swagger-cli` or `swagger-parser`:

```bash
npm install -g @apidevtools/swagger-cli
swagger-cli validate ./src/swagger.ts
```

or programmatically (the repository includes a Jest test that calls `swagger-parser`).

---

## API Endpoints (summary) 📚

All routes are mounted under `/api`.

**Auth**
- `GET /api/auth/me` — Protected; requires `Authorization: Bearer <access_token>` and returns the Supabase user object.

**Users**
- `POST /api/users`
- `GET /api/users/:id`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

**Organizations**
- `POST /api/organizations`
- `GET /api/organizations/:id`
- `PUT /api/organizations/:id`
- `DELETE /api/organizations/:id`

**Organization Members**
- `POST /api/organization_members`
- `GET /api/organization_members/:id`
- `PUT /api/organization_members/:id`
- `DELETE /api/organization_members/:id`

**Attendees**
- `POST /api/attendees`
- `GET /api/attendees/:id`
- `PUT /api/attendees/:id`
- `DELETE /api/attendees/:id`

**Events**
- `POST /api/events`
- `POST /api/events/:id/rsvp`
- `GET /api/events/:id`
- `PUT /api/events/:id`
- `DELETE /api/events/:id`

---

## Implementation notes & TODOs 📝

- The RSVP endpoint is a simple `upsert` into `event_attendees`; production readiness would require atomic reservation logic, waitlists, and capacity enforcement in the DB.
- Consider migrating to JSDoc + `swagger-jsdoc` for auto-generated OpenAPI specs derived from route JSDoc comments (helps docs stay in sync with code).

---

## Scripts

- `npm run dev` — start dev server (auto-restarts via `ts-node-dev`)
- `npm run build` — compile TypeScript
- `npm start` — run compiled JS
- `npm test` — run unit/integration tests

---