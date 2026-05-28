# Issue Report Format

Use this format for every scalability or architecture issue found during an audit.

---

## Issue Block Template

```
────────────────────────────────────────────────
[SEVERITY EMOJI] ISSUE: <Short title>
────────────────────────────────────────────────

SEVERITY:          🔴 CRITICAL | 🟠 HIGH | 🟡 MEDIUM | 🟢 LOW
LAYER:             Frontend | Backend | Database | Deployment | Cache | Queue | Realtime | Observability
AFFECTED SYSTEMS:  e.g. "Postgres, /api/products, serverless functions"

DETECTED BEHAVIOR:
  What the code actually does — be specific.
  Reference file paths, function names, query patterns.
  e.g. "Every request to /api/feed runs SELECT * FROM posts JOIN users JOIN likes
        with no pagination or index. File: app/api/feed/route.ts:34"

BOTTLENECK:
  Root cause:       Why this is a problem technically
  Traffic behavior: What happens as load increases
  Failure scenario: At what point / traffic level does this break

SCALING CEILING:
  Estimated breaking point (e.g. "~200 concurrent users on free Supabase")

IMPACT:
  Performance:  e.g. "P99 latency spikes to 8s under 500 concurrent requests"
  Reliability:  e.g. "Single Postgres instance = full outage if DB restarts"
  Cost:         e.g. "Unindexed table scan costs 10x more on managed DB"

RECOMMENDED FIX:
  Free version:         <Simplest, cheapest fix>
  Low-cost version:     <Growth-stage fix>
  Enterprise version:   <Full production-grade solution>

IMPLEMENTATION COMPLEXITY:  Easy | Moderate | High
MIGRATION RISK:             None | Low | Moderate | High
BREAKING RISK IF FIXED:     None | Low | Moderate | High
────────────────────────────────────────────────
```

---

## Severity Definitions

| Level       | When to Use                                                 |
| ----------- | ----------------------------------------------------------- |
| 🔴 CRITICAL | Will cause outage or severe degradation under moderate load |
| 🟠 HIGH     | Significant risk that materializes at growth stage          |
| 🟡 MEDIUM   | Scalability ceiling that matters at 10K–100K DAU            |
| 🟢 LOW      | Cost or operational improvement, not an immediate risk      |

---

## Common Issue Templates

### No Database Connection Pooling (Serverless)

```
[🔴] ISSUE: No connection pooling — Postgres will exhaust connections under load

SEVERITY:          🔴 CRITICAL
LAYER:             Database
AFFECTED SYSTEMS:  Postgres (Supabase/Neon/Railway), all API routes

DETECTED BEHAVIOR:
  Direct pg or Prisma client initialized per serverless function invocation.
  No PgBouncer or connection pooler configured.
  File: lib/db.ts — new PrismaClient() called at module level in serverless context.

BOTTLENECK:
  Root cause:       Each serverless function spawn opens a new DB connection.
                    Postgres has a hard connection limit (typically 25-100 on free tier).
  Traffic behavior: At ~50 concurrent requests, connection pool is exhausted.
                    Subsequent requests hang then fail with "too many connections".
  Failure scenario: Any moderate traffic spike causes cascading DB failures.

SCALING CEILING:
  ~50–100 concurrent requests on Supabase free/pro without a pooler.

IMPACT:
  Performance:  DB connections queue up, P99 latency explodes
  Reliability:  All API routes fail simultaneously when limit is hit
  Cost:         Upgrading DB tier just to get more connections is wasteful

RECOMMENDED FIX:
  Free version:         Use Supabase's built-in connection pooler (Transaction mode).
                        Set DATABASE_URL to the pooler URL in .env.
  Low-cost version:     Self-host PgBouncer on the same VPS as the app.
  Enterprise version:   RDS Proxy (AWS) or PgBouncer on dedicated infra with
                        pool sizing tuned to concurrency requirements.

IMPLEMENTATION COMPLEXITY:  Easy (just change DATABASE_URL)
MIGRATION RISK:             Low
BREAKING RISK IF FIXED:     None
```

---

### Missing Database Indexes on Hot Query Columns

```
[🔴] ISSUE: Unindexed columns on high-frequency query paths

SEVERITY:          🔴 CRITICAL
LAYER:             Database
AFFECTED SYSTEMS:  posts table, users table, orders table

DETECTED BEHAVIOR:
  Frequent queries filter on user_id, status, created_at with no indexes.
  e.g. SELECT * FROM orders WHERE user_id = $1 AND status = 'pending'
  No CREATE INDEX statements found in migrations/schema.sql.

BOTTLENECK:
  Root cause:       Sequential table scan on every query.
  Traffic behavior: Query time grows linearly with table size.
                    At 100K rows: ~5ms. At 10M rows: ~3-8 seconds.
  Failure scenario: High-traffic endpoints time out as data grows.

SCALING CEILING:
  Performance degrades significantly past ~500K rows without indexes.

RECOMMENDED FIX:
  Free version:         Add composite indexes in migration:
                        CREATE INDEX idx_orders_user_status ON orders(user_id, status);
                        CREATE INDEX idx_posts_created ON posts(created_at DESC);
  Low-cost version:     Use EXPLAIN ANALYZE on all hot queries before adding indexes.
                        Add partial indexes for frequent filtered subsets.
  Enterprise version:   Implement query performance monitoring (pg_stat_statements).
                        Automate slow query detection and alerting.

IMPLEMENTATION COMPLEXITY:  Easy
MIGRATION RISK:             Low (indexes can be added CONCURRENTLY without table lock)
BREAKING RISK IF FIXED:     None
```

---

### CPU-Intensive Work on Request Thread

```
[🟠] ISSUE: Heavy synchronous processing blocking API responses

SEVERITY:          🟠 HIGH
LAYER:             Backend
AFFECTED SYSTEMS:  PDF generation, image processing, email rendering endpoints

DETECTED BEHAVIOR:
  PDF or image generation runs synchronously inside API route handler.
  File: app/api/export/route.ts — puppeteer.launch() called inline.
  Response waits for full PDF generation before returning.

BOTTLENECK:
  Root cause:       CPU-bound work blocks the Node.js event loop.
  Traffic behavior: A single PDF export can take 2–8 seconds.
                    10 concurrent exports = all other requests stall.
  Failure scenario: Serverless function timeout (default 10s on Vercel).

SCALING CEILING:
  ~5–10 concurrent heavy operations will saturate a serverless function budget.

RECOMMENDED FIX:
  Free version:         Move to async: return job ID immediately, poll for result.
                        Use Supabase Edge Functions or Vercel background functions.
  Low-cost version:     BullMQ + Redis queue. Worker process on Railway/Render.
                        Webhook or polling to notify client when complete.
  Enterprise version:   Dedicated worker fleet (ECS tasks, Cloud Run jobs).
                        SQS + Lambda for fan-out processing.
                        Pre-signed S3 URL returned when job completes.

IMPLEMENTATION COMPLEXITY:  Moderate
MIGRATION RISK:             Low (existing endpoint can return job_id, add polling route)
BREAKING RISK IF FIXED:     Low (requires frontend to handle async job flow)
```

---

### No Rate Limiting on Public Endpoints

```
[🟠] ISSUE: Public API endpoints have no rate limiting

SEVERITY:          🟠 HIGH
LAYER:             Backend
AFFECTED SYSTEMS:  All /api/* routes, especially auth, search, AI endpoints

DETECTED BEHAVIOR:
  No rate limiting middleware found in middleware.ts or API routes.
  No Upstash, Redis, or in-memory rate limit configuration.
  AI endpoints (which cost money per call) are publicly accessible without limits.

BOTTLENECK:
  Root cause:       No throttling = bot scraping, credential stuffing, cost abuse.
  Traffic behavior: A single bot can trigger thousands of AI API calls per minute.
  Failure scenario: OpenAI/Anthropic bill spike, service degradation for real users.

RECOMMENDED FIX:
  Free version:         Vercel Edge Middleware with in-memory sliding window.
                        Use @upstash/ratelimit with Upstash Redis free tier.
  Low-cost version:     Per-user rate limits stored in Redis (Upstash or Railway Redis).
                        Different limits per endpoint type (auth: strict, read: relaxed).
  Enterprise version:   API Gateway (Kong, AWS API GW) with per-key rate limiting.
                        DDoS protection at CDN layer (Cloudflare).

IMPLEMENTATION COMPLEXITY:  Easy (Upstash ratelimit is ~10 lines of middleware)
MIGRATION RISK:             None
BREAKING RISK IF FIXED:     Low (legitimate users won't hit reasonable limits)
```

---

### Stateful Server — Sessions in Memory

```
[🟡] ISSUE: Session state stored in server memory, preventing horizontal scaling

SEVERITY:          🟡 MEDIUM
LAYER:             Deployment
AFFECTED SYSTEMS:  Auth session handling, in-memory cache

DETECTED BEHAVIOR:
  express-session or custom session map stored in process memory.
  File: server/index.ts — MemoryStore or Map() used for sessions.
  Works fine on single instance, breaks when multiple instances run.

BOTTLENECK:
  Root cause:       Memory is local to one process. Load balancer sends requests
                    to multiple instances — user logged in on instance A appears
                    logged out on instance B.
  Traffic behavior: Fine at 1 server. Breaks the moment you add a second instance.
  Failure scenario: Server restart logs out all users.

RECOMMENDED FIX:
  Free version:         Switch to JWT (stateless). No server-side session store needed.
  Low-cost version:     Redis session store (connect-redis + Upstash or Railway Redis).
  Enterprise version:   Redis Cluster with session affinity and TTL management.

IMPLEMENTATION COMPLEXITY:  Moderate
MIGRATION RISK:             Moderate (existing sessions will be invalidated during migration)
BREAKING RISK IF FIXED:     Low
```
