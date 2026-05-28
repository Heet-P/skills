# Scaling Tiers & Traffic Stage Reference

Use this file when generating architecture tier recommendations and traffic stage roadmaps.

---

## Implementation Tiers

For every major system recommendation, provide all three tiers. Match the recommendation to the project's actual stage — do not default to enterprise.

| Tier                        | Suitable For                                 | Priority                             |
| --------------------------- | -------------------------------------------- | ------------------------------------ |
| **FREE / BEGINNER**         | MVPs, student projects, early-stage, <1K DAU | Lowest cost, easiest ops             |
| **LOW-COST / GROWTH**       | Startups with real traffic, 1K–50K DAU       | Reliability + maintainability        |
| **HIGH-SCALE / ENTERPRISE** | 100K+ DAU, global traffic, large teams       | Fault tolerance, distributed systems |

---

## Tier Tables by System

### Database

| Tier       | Option                                                        | Notes                                           |
| ---------- | ------------------------------------------------------------- | ----------------------------------------------- |
| Free       | Supabase (free tier), Neon, Turso, SQLite, MongoDB Atlas free | Limited connections, storage caps               |
| Free       | Firebase Firestore                                            | NoSQL, real-time, generous free tier            |
| Low-cost   | PostgreSQL on Railway / Render / DigitalOcean                 | $7–25/mo, more control                          |
| Low-cost   | PlanetScale (MySQL serverless)                                | Branching, zero-downtime migrations             |
| Low-cost   | Managed Supabase Pro                                          | $25/mo, connection pooling, more storage        |
| Enterprise | AWS Aurora (PostgreSQL compatible)                            | Auto-scaling storage, multi-AZ                  |
| Enterprise | CockroachDB / YugabyteDB                                      | Distributed SQL, global replication             |
| Enterprise | DynamoDB                                                      | Infinite write scale, key-value access patterns |
| Enterprise | Sharded PostgreSQL (Citus)                                    | Horizontal Postgres scaling                     |

### Caching

| Tier       | Option                             | Notes                                  |
| ---------- | ---------------------------------- | -------------------------------------- |
| Free       | Next.js ISR / HTTP cache headers   | Built-in, no infra needed              |
| Free       | Upstash Redis (free tier)          | 10K requests/day free                  |
| Free       | Edge caching via Vercel/Cloudflare | CDN-level cache, zero cost             |
| Low-cost   | Upstash Redis pro ($10–20/mo)      | Higher limits, persistence             |
| Low-cost   | Redis on Railway ($5/mo)           | Full Redis, good for sessions + cache  |
| Enterprise | ElastiCache (AWS Redis)            | Cluster mode, read replicas            |
| Enterprise | Cloudflare Workers KV              | Global edge key-value store            |
| Enterprise | Varnish / custom CDN layer         | Sub-millisecond cache, high throughput |

### Queue & Background Jobs

| Tier       | Option                          | Notes                                     |
| ---------- | ------------------------------- | ----------------------------------------- |
| Free       | Supabase Edge Functions (cron)  | Good for simple scheduled tasks           |
| Free       | Vercel Cron (hobby tier)        | 1 cron job, daily minimum                 |
| Free       | pg-boss (Postgres-backed queue) | No extra infra, uses existing DB          |
| Low-cost   | BullMQ + Upstash Redis          | Full-featured queue, retries, concurrency |
| Low-cost   | Railway worker + Redis          | Dedicated worker process, $5–15/mo        |
| Enterprise | AWS SQS + Lambda                | Managed, infinite scale, pay per message  |
| Enterprise | RabbitMQ                        | Complex routing, fanout, pub/sub          |
| Enterprise | Apache Kafka                    | High-throughput event streaming           |
| Enterprise | Google Cloud Tasks / Pub-Sub    | Managed, global                           |

### Deployment & Infra

| Tier       | Option                       | Notes                                    |
| ---------- | ---------------------------- | ---------------------------------------- |
| Free       | Vercel (hobby)               | Great DX, cold starts, 10s timeout limit |
| Free       | Railway / Render free tier   | Sleeps after inactivity                  |
| Free       | Cloudflare Pages             | Static + edge functions                  |
| Low-cost   | Vercel Pro ($20/mo)          | Longer timeouts, team features           |
| Low-cost   | Railway / Render ($10–25/mo) | Always-on, custom domains                |
| Low-cost   | DigitalOcean App Platform    | Managed containers, $12+/mo              |
| Low-cost   | Hetzner VPS + Docker Compose | Best price/performance ratio             |
| Enterprise | AWS ECS / Fargate            | Managed containers, auto-scaling         |
| Enterprise | Kubernetes (EKS/GKE)         | Full control, complex ops                |
| Enterprise | Cloudflare Workers           | Global edge, sub-ms cold start           |
| Enterprise | Multi-region deployment      | Active-active or active-passive          |

### Observability

| Tier       | Option                      | Notes                                  |
| ---------- | --------------------------- | -------------------------------------- |
| Free       | Sentry (free tier)          | Error tracking, 5K errors/mo           |
| Free       | Better Stack (free)         | Uptime monitoring, 3 monitors          |
| Free       | Vercel Analytics            | Core Web Vitals, basic traffic         |
| Free       | Supabase built-in logs      | DB query logs                          |
| Low-cost   | Sentry Team ($26/mo)        | More volume, releases, performance     |
| Low-cost   | Better Stack Logs ($25/mo)  | Log aggregation + uptime               |
| Low-cost   | PostHog (free/paid)         | Product analytics + session replay     |
| Enterprise | Datadog                     | Full observability platform, expensive |
| Enterprise | Grafana + Prometheus + Loki | Open-source stack, self-hosted         |
| Enterprise | OpenTelemetry               | Vendor-neutral traces + metrics        |
| Enterprise | AWS CloudWatch              | Native AWS observability               |

---

## Traffic Stage Roadmap

Use this table when generating the `/scalability-architecture roadmap` output.

### Stage 1 — 1K DAU / ~50 Concurrent Users

**Goal:** Get to a stable, working production deployment without over-engineering.

| System        | Recommended Setup                      | Key Actions                                                    |
| ------------- | -------------------------------------- | -------------------------------------------------------------- |
| Database      | Supabase free or Neon                  | Enable connection pooler, add indexes on hot columns           |
| Caching       | Next.js ISR + HTTP cache headers       | Cache static pages, avoid per-request DB calls for public data |
| Queues        | None or pg-boss                        | Only if you have async work (emails, exports)                  |
| Deployment    | Vercel Hobby or Railway starter        | Fine for this scale                                            |
| Auth          | Clerk / Supabase Auth                  | JWT-based, stateless                                           |
| Monitoring    | Sentry free + Better Stack free uptime | Basic error + uptime coverage                                  |
| Rate limiting | Upstash ratelimit middleware           | Protect AI and auth endpoints                                  |

**Bottlenecks to fix before growth:**

- Add DB indexes now (zero cost, high impact)
- Set up error tracking (Sentry)
- Ensure no plaintext secrets in code

---

### Stage 2 — 10K DAU / ~200–500 Concurrent Users

**Goal:** Reliability + survivability. The app should recover from failures automatically.

| System             | Recommended Setup                    | Key Actions                               |
| ------------------ | ------------------------------------ | ----------------------------------------- |
| Database           | Supabase Pro or Railway Postgres     | Upgrade for more connections + storage    |
| Connection pooling | Supabase pooler or PgBouncer         | Critical at this stage                    |
| Caching            | Redis (Upstash or Railway)           | Cache session, hot queries, API responses |
| Queues             | BullMQ + Redis                       | Move emails, PDF gen, notifications async |
| Deployment         | Vercel Pro or Railway + auto-scaling | Multiple function instances               |
| CDN                | Cloudflare in front of everything    | DDoS basic protection, asset caching      |
| Monitoring         | Sentry + Better Stack Logs           | Start aggregating structured logs         |
| Rate limiting      | Per-user Redis-backed limits         | Protect all public endpoints              |

**New failure risks to address:**

- DB connection exhaustion (fix with pooler)
- Memory leaks in long-running processes
- Unhandled promise rejections crashing workers
- Webhook replay / idempotency for payments

---

### Stage 3 — 100K DAU / ~2K–5K Concurrent Users

**Goal:** Horizontal scaling, fault isolation, no single points of failure.

| System        | Recommended Setup                     | Key Actions                              |
| ------------- | ------------------------------------- | ---------------------------------------- |
| Database      | Postgres with read replica            | Route read-heavy queries to replica      |
| Database      | Consider Aurora or CockroachDB        | If write throughput is the ceiling       |
| Caching       | Redis Cluster or ElastiCache          | More nodes, replication                  |
| Queues        | SQS or Kafka (if event-driven)        | Managed, auto-scaling                    |
| Deployment    | Kubernetes (EKS/GKE) or ECS           | Horizontal pod autoscaling               |
| CDN           | Cloudflare Pro or AWS CloudFront      | Custom rules, WAF, rate limiting at edge |
| Observability | Datadog or Grafana+Prometheus+Loki    | Full observability, SLO tracking         |
| Auth          | Stateless JWT + Redis token blocklist | Scale auth layer independently           |
| Media         | S3 + CloudFront CDN                   | Never serve media from app server        |

**Architecture shifts:**

- Separate worker tier from web tier
- Add health checks + graceful shutdown
- Implement circuit breakers for external APIs
- Zero-downtime deployments (blue/green or rolling)

---

### Stage 4 — 1M+ DAU / Global Traffic

**Goal:** Regional distribution, extreme fault tolerance, full SRE practices.

| System        | Recommended Setup                         | Key Actions                                |
| ------------- | ----------------------------------------- | ------------------------------------------ |
| Database      | Multi-region PostgreSQL or Aurora Global  | Sub-100ms reads globally                   |
| Database      | CQRS pattern                              | Separate read/write models                 |
| Caching       | Cloudflare Workers KV / global edge cache | Cache at every PoP                         |
| Queues        | Kafka with replication                    | Event sourcing, replay capability          |
| Deployment    | Multi-region Kubernetes                   | Active-active or active-passive per region |
| CDN           | Custom CDN configuration                  | Custom cache rules, origin shield          |
| Observability | OpenTelemetry + Datadog or Honeycomb      | Distributed tracing across all services    |
| API           | API Gateway + service mesh (Istio)        | Traffic management, mTLS                   |
| Reliability   | SLOs, error budgets, chaos engineering    | Formal reliability engineering             |

**Architecture patterns at this scale:**

- Event-driven architecture (publish/subscribe)
- CQRS + Event Sourcing for write-heavy domains
- Feature flags for safe rollouts (LaunchDarkly, Unleash)
- On-call rotation + incident runbooks

---

## Real-World Architecture Patterns

Reference these when explaining how industry-standard systems solve specific problems.

| Pattern                      | Used By                     | When to Apply                               |
| ---------------------------- | --------------------------- | ------------------------------------------- |
| CDN-first static delivery    | Vercel, Netlify, Cloudflare | All public content                          |
| Read replica offloading      | Shopify, GitHub             | Analytics, reporting, heavy reads           |
| Queue-based async processing | Stripe, Airbnb              | Emails, exports, webhooks, notifications    |
| Idempotent webhook handling  | Stripe                      | All payment webhooks                        |
| Blue/green deployment        | Netflix, AWS                | Zero-downtime deploys                       |
| Circuit breaker pattern      | Netflix Hystrix             | Graceful degradation on third-party failure |
| Rate limiting at edge        | Cloudflare, Fastly          | Before requests hit origin                  |
| Separate worker fleet        | Discord, Slack              | CPU-intensive or long-running jobs          |
| Event sourcing               | Uber, LinkedIn              | Audit logs, replay, debugging               |
| Horizontal pod autoscaling   | Any Kubernetes shop         | Traffic spike handling                      |

---

## Failure Simulation Reference

Use this when running the reliability analysis (`/scalability-architecture reliability`).

| Failure Scenario                | Impact Without Mitigation       | Mitigation                                      |
| ------------------------------- | ------------------------------- | ----------------------------------------------- |
| DB connection limit hit         | All API routes 500              | Connection pooler (PgBouncer/Supabase pooler)   |
| Redis unavailable               | Session loss, cache miss        | Graceful fallback to DB, TTL-based resilience   |
| Payment webhook duplicate       | Double-charge or double-fulfill | Idempotency key on webhook handler              |
| Deploy with migration           | Table lock = downtime           | CONCURRENTLY index, non-blocking migrations     |
| Serverless cold start           | 1–3s latency spike              | Edge runtime, pre-warming, ISR                  |
| Unhandled rejection in worker   | Worker crash = queue stalls     | Global error handler, worker restart policy     |
| Upstream API (OpenAI) down      | Feature fully broken            | Circuit breaker, fallback response, queue retry |
| Viral traffic spike             | Origin overload                 | CDN + ISR absorbs static, rate limit dynamic    |
| Bot flood on auth endpoint      | DB overload, lockouts           | Rate limiting + CAPTCHA on auth routes          |
| Large file upload on API server | Memory spike, timeout           | Pre-signed upload URLs (S3/Supabase Storage)    |
