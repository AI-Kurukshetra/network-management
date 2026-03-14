# AI Network Operations Center

AI-NOC is a Next.js 14 full-stack application that simulates a 5G telecom network operations center. Operators can monitor slices and network functions, review threshold-based alerts, inspect live charts, and use an AI assistant to diagnose network problems.

## Stack

- Next.js 14 App Router
- TypeScript with strict mode
- TailwindCSS
- Shadcn-style UI components
- Next.js API routes
- Supabase PostgreSQL
- OpenAI API
- Recharts
- Vercel-ready deployment layout

## Project Structure

```text
app/
  api/
  alerts/
  assistant/
  functions/
  slices/
components/
  alerts/
  assistant/
  dashboard/
  functions/
  layout/
  slices/
  ui/
database/
hooks/
lib/
supabase/
types/
```

## Environment Variables

Create `.env.local` from `.env.example`.

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
OPENAI_API_KEY=your-openai-api-key
SUPABASE_DB_URL=your-supabase-postgres-connection-string
```

If Supabase variables are not set, the app runs against an in-memory fallback dataset so the UI remains usable locally.

## Admin Login

Protected routes:

- `/dashboard`
- `/slices`
- `/functions`
- `/alerts`
- `/assistant`

Unauthenticated users are redirected to `/login`.

Create the initial admin user in Supabase Auth with:

- Email: `admin@ainoc.com`
- Password: `admin123`

Create this user manually from the Supabase dashboard:

1. Open `Authentication`.
2. Go to `Users`.
3. Click `Add user`.
4. Enter email `admin@ainoc.com`.
5. Enter password `admin123`.
6. Mark the email as confirmed if Supabase prompts for it.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Set up the Supabase database.

If you prefer to manage schema and seed data manually in the Supabase dashboard, run these files in the SQL editor:

```sql
-- run database/schema.sql
-- then run supabase/seed.sql
```

Or use the provided npm commands with `SUPABASE_DB_URL` set:

```bash
npm run migrate
npm run migrate:throughput
npm run seed
```

3. Start development:

```bash
npm run dev
```

4. Open `http://localhost:3000`.

## Database Files

These files are included in the repo for reproducible setup, even if you choose to apply them manually in Supabase:

- [database/schema.sql](/home/bacancy/Documents/cloud-native-network-management-platform/database/schema.sql)
- [database/migrations/20260314_add_throughput_columns.sql](/home/bacancy/Documents/cloud-native-network-management-platform/database/migrations/20260314_add_throughput_columns.sql)
- [supabase/seed.sql](/home/bacancy/Documents/cloud-native-network-management-platform/supabase/seed.sql)

## API Routes


- `GET|POST|PUT|DELETE /api/slices`
- `GET /api/functions`
- `GET|PUT /api/alerts`
- `GET /api/metrics`
- `POST /api/metrics/simulate`
- `POST /api/ai`

## Simulation Model

- Metrics advance every 5 seconds through `POST /api/metrics/simulate`.
- `GET /api/metrics` also performs a stale-state refresh for local fallback mode.
- Alerts are created when `cpu_usage > 90` or `latency > 50`.
- Function state transitions across `healthy`, `degraded`, and `down`.

For horizontally scaled production, replace the polling heartbeat with a Supabase cron job, queue worker, or scheduled function. The current implementation is safe for demo and single-instance deployments.

## AI Assistant

System prompt:

```text
You are a telecom network operations assistant.
You analyze network metrics, alerts, and system health.
Your job is to diagnose network issues and suggest solutions.
```

If `OPENAI_API_KEY` is missing, the app falls back to a deterministic diagnosis generator based on live telemetry.

## Deployment

Deploy to Vercel with the same environment variables configured. Supabase should be reachable from the deployed environment. The application uses only standard Next.js API routes and does not require a separate backend service.
