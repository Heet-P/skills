# Issue Report Format

Use this format for every security vulnerability found during an audit.
Every finding must include the **exact exploit steps** — not just a description.

---

## Issue Block Template

```
────────────────────────────────────────────────
[SEVERITY EMOJI] VULN: <Short title>
────────────────────────────────────────────────

SEVERITY:         🔴 CRITICAL | 🟠 HIGH | 🟡 MEDIUM | 🟢 LOW
CATEGORY:         Access Control | Injection | Auth | Payment | Upload | CSRF | SSRF |
                  Crypto | Config | RLS | Rate Limiting | Deployment
AFFECTED SYSTEMS: e.g. "GET /api/orders/:id, orders table, order detail page"
OWASP:            A01–A10 reference

DETECTED BEHAVIOR:
  What the code actually does — be specific.
  Reference file paths, route handlers, DB queries.
  e.g. "Route fetches order by ID with no ownership check.
        File: app/api/orders/[id]/route.ts:18
        SELECT * FROM orders WHERE id = $1 — no user_id filter."

EXPLOIT SCENARIO:
  Step-by-step attack an adversary would execute:
  1. Attacker logs in as User A (id: 123)
  2. Sends GET /api/orders/456 (belonging to User B)
  3. Server returns full order including address, items, payment method
  4. Attacker iterates order IDs 1–10000 to scrape all customer orders

IMPACT:
  What data or capability does a successful exploit give the attacker?

RECOMMENDED FIX:
  Server-side fix with code example where possible.

IMPLEMENTATION COMPLEXITY:  Easy | Moderate | High
BREAKING RISK IF FIXED:     None | Low | Moderate | High
────────────────────────────────────────────────
```

---

## Severity Definitions

| Level       | Meaning                                                                                 |
| ----------- | --------------------------------------------------------------------------------------- |
| 🔴 CRITICAL | Exploitable now — data breach, account takeover, financial loss, full system compromise |
| 🟠 HIGH     | Serious risk — exploitable with moderate effort, significant impact                     |
| 🟡 MEDIUM   | Real vulnerability — harder to exploit or limited impact                                |
| 🟢 LOW      | Defense-in-depth hardening — no immediate exploit path                                  |

---

## Worked Examples

### IDOR — Insecure Direct Object Reference

```
[🔴] VULN: IDOR on order details endpoint — any user can read any order

SEVERITY:         🔴 CRITICAL
CATEGORY:         Access Control
AFFECTED SYSTEMS: GET /api/orders/[id], orders table
OWASP:            A01 — Broken Access Control

DETECTED BEHAVIOR:
  Route handler fetches order by ID from URL parameter.
  No check that the requesting user owns the order.
  File: app/api/orders/[id]/route.ts:18
  Query: SELECT * FROM orders WHERE id = $1

EXPLOIT SCENARIO:
  1. Attacker authenticates as user@attacker.com
  2. Places one order, observes response includes order ID (e.g. 5041)
  3. Sends GET /api/orders/1, /api/orders/2, ... /api/orders/9999
  4. Server returns full order details for every customer:
     — shipping addresses, phone numbers, item lists, payment method tails
  5. Attacker scripts this to dump entire order history in minutes

IMPACT:
  Full exposure of all customer PII (name, address, phone, order history).
  Regulatory breach (GDPR, CCPA). Reputational damage.

RECOMMENDED FIX:
  Add ownership check server-side before returning data:

  const session = await getServerSession();
  const order = await db.query(
    'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
    [params.id, session.user.id]
  );
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  Return 404 (not 403) to avoid confirming the resource exists.

IMPLEMENTATION COMPLEXITY:  Easy
BREAKING RISK IF FIXED:     None
```

---

### Payment Amount Tampering

```
[🔴] VULN: Frontend cart total trusted server-side — price manipulation possible

SEVERITY:         🔴 CRITICAL
CATEGORY:         Payment / Business Logic
AFFECTED SYSTEMS: POST /api/checkout, Razorpay/Stripe order creation
OWASP:            A04 — Insecure Design

DETECTED BEHAVIOR:
  Checkout API receives { items, total } from client request body.
  Server passes client-provided `total` directly to payment provider.
  File: app/api/checkout/route.ts:44
  razorpay.orders.create({ amount: body.total, currency: 'INR' })

EXPLOIT SCENARIO:
  1. Attacker adds ₹5,000 item to cart
  2. Intercepts POST /api/checkout request in Burp Suite
  3. Modifies body: { "items": [...], "total": 1 }
  4. Server creates Razorpay order for ₹0.01
  5. Attacker completes payment, receives full order fulfillment
  6. Repeat at scale with a script

IMPACT:
  Unlimited purchase of any product at attacker-chosen price.
  Direct financial loss proportional to inventory value.

RECOMMENDED FIX:
  Never accept amount from client. Always recalculate server-side:

  // Server recalculates total from item IDs
  const items = await db.query(
    'SELECT price FROM products WHERE id = ANY($1)',
    [body.itemIds]
  );
  const total = items.rows.reduce((sum, item) => sum + item.price, 0);
  razorpay.orders.create({ amount: total, currency: 'INR' });

IMPLEMENTATION COMPLEXITY:  Easy
BREAKING RISK IF FIXED:     None
```

---

### Missing Webhook Signature Verification

```
[🔴] VULN: Payment webhook not verified — forged webhooks can trigger fulfillment

SEVERITY:         🔴 CRITICAL
CATEGORY:         Payment
AFFECTED SYSTEMS: POST /api/webhooks/razorpay, order fulfillment logic
OWASP:            A08 — Software and Data Integrity Failures

DETECTED BEHAVIOR:
  Webhook handler processes payment.captured events without verifying
  Razorpay signature. Any POST to this endpoint triggers order fulfillment.
  File: app/api/webhooks/razorpay/route.ts — no signature check found.

EXPLOIT SCENARIO:
  1. Attacker discovers or guesses the webhook URL (/api/webhooks/razorpay)
  2. Sends a crafted POST with a forged payment.captured event body:
     { "event": "payment.captured", "payload": { "order": { "id": "order_XYZ" } } }
  3. Server processes event, marks order as paid, ships goods
  4. No actual payment was made

RECOMMENDED FIX:
  Verify Razorpay webhook signature before processing:

  import crypto from 'crypto';

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = request.headers.get('x-razorpay-signature');
  const body = await request.text();

  const expectedSig = crypto
    .createHmac('sha256', webhookSecret)
    .update(body)
    .digest('hex');

  if (signature !== expectedSig) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

IMPLEMENTATION COMPLEXITY:  Easy
BREAKING RISK IF FIXED:     None
```

---

### SQL Injection via Unsanitized Input

```
[🔴] VULN: SQL injection in search endpoint via string concatenation

SEVERITY:         🔴 CRITICAL
CATEGORY:         Injection
AFFECTED SYSTEMS: GET /api/search, products table
OWASP:            A03 — Injection

DETECTED BEHAVIOR:
  Search query built with string concatenation instead of parameterized query.
  File: app/api/search/route.ts:22
  const query = `SELECT * FROM products WHERE name LIKE '%${searchTerm}%'`

EXPLOIT SCENARIO:
  1. Attacker sends: GET /api/search?q='; DROP TABLE users; --
  2. Or: GET /api/search?q=' UNION SELECT email,password,null FROM users --
  3. Second payload returns all user emails and password hashes in search results
  4. With write permissions: can modify or delete entire tables

IMPACT:
  Full database read, potential write/delete access.
  Complete data breach of all user records.

RECOMMENDED FIX:
  Always use parameterized queries:

  // WRONG
  `SELECT * FROM products WHERE name LIKE '%${searchTerm}%'`

  // CORRECT
  db.query('SELECT * FROM products WHERE name ILIKE $1', [`%${searchTerm}%`])

  Use an ORM (Prisma, Drizzle) or query builder that parameterizes by default.

IMPLEMENTATION COMPLEXITY:  Easy
BREAKING RISK IF FIXED:     None
```

---

### Missing Rate Limiting on Auth Endpoints

```
[🟠] VULN: No brute-force protection on login endpoint

SEVERITY:         🟠 HIGH
CATEGORY:         Rate Limiting / Auth
AFFECTED SYSTEMS: POST /api/auth/login, users table
OWASP:            A07 — Identification and Authentication Failures

DETECTED BEHAVIOR:
  Login endpoint has no rate limiting, lockout, or delay mechanism.
  No middleware found in middleware.ts for auth routes.
  Unlimited attempts accepted with identical response time regardless of validity.

EXPLOIT SCENARIO:
  1. Attacker targets known email (from leak or signup probing)
  2. Scripts 10,000 password attempts per minute using common password lists
  3. No lockout, no CAPTCHA, no cooldown — attempts succeed freely
  4. Statistical probability: common passwords (~1000 most used) crack
     a significant percentage of accounts within hours

RECOMMENDED FIX:
  Add rate limiting with Upstash ratelimit (10 lines of middleware):

  import { Ratelimit } from '@upstash/ratelimit';
  import { Redis } from '@upstash/redis';

  const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 attempts per 15 min per IP
  });

  const { success } = await ratelimit.limit(ip);
  if (!success) return NextResponse.json({ error: 'Too many attempts' }, { status: 429 });

  Also: implement exponential backoff and account lockout after 10 failures.

IMPLEMENTATION COMPLEXITY:  Easy
BREAKING RISK IF FIXED:     None
```

---

### Account Enumeration via Auth Response Differences

```
[🟡] VULN: Login error reveals whether email exists in system

SEVERITY:         🟡 MEDIUM
CATEGORY:         Auth / Information Disclosure
AFFECTED SYSTEMS: POST /api/auth/login, POST /api/auth/forgot-password
OWASP:            A07 — Identification and Authentication Failures

DETECTED BEHAVIOR:
  Login returns different error messages depending on whether email exists:
  — "Email not found" when email doesn't exist
  — "Incorrect password" when email exists but password is wrong
  File: app/api/auth/login/route.ts:31

EXPLOIT SCENARIO:
  1. Attacker sends list of 100,000 emails to POST /api/auth/login
  2. Responses: "Email not found" vs "Incorrect password" reveal which exist
  3. Attacker now has a confirmed list of registered users
  4. Uses list for targeted phishing, credential stuffing, or spam

RECOMMENDED FIX:
  Always return the same generic message regardless of which step fails:

  // WRONG
  if (!user) return 'Email not found';
  if (!validPassword) return 'Incorrect password';

  // CORRECT
  if (!user || !validPassword) return 'Invalid credentials';

  Apply the same fix to password reset: "If this email is registered,
  you will receive a reset link" — never confirm email existence.

IMPLEMENTATION COMPLEXITY:  Easy
BREAKING RISK IF FIXED:     None
```

---

### Supabase RLS Disabled or Missing on Sensitive Tables

```
[🔴] VULN: Row Level Security not enabled — direct API access exposes all rows

SEVERITY:         🔴 CRITICAL
CATEGORY:         RLS / Access Control
AFFECTED SYSTEMS: Supabase client, orders table, profiles table, documents table
OWASP:            A01 — Broken Access Control

DETECTED BEHAVIOR:
  Supabase client initialized with anon key used directly in frontend.
  RLS not enabled on orders or profiles tables (verified via schema inspection).
  Any browser can query: supabase.from('orders').select('*') and get all rows.

EXPLOIT SCENARIO:
  1. Attacker opens browser devtools on the app
  2. Finds supabase URL and anon key in client bundle (they're public by design)
  3. Runs in console: supabase.from('orders').select('*')
  4. Without RLS: receives every order from every customer
  5. Can also run: supabase.from('profiles').select('*') for all user data

RECOMMENDED FIX:
  Enable RLS on ALL tables that contain user data:

  -- Enable RLS
  ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

  -- Users can only see their own orders
  CREATE POLICY "users_own_orders" ON orders
    FOR ALL USING (auth.uid() = user_id);

  -- Admins bypass via service_role key (server-side only, never in client)
  -- Never use service_role key in frontend code

IMPLEMENTATION COMPLEXITY:  Moderate (requires policy design per table)
BREAKING RISK IF FIXED:     Low (existing server-side queries using service_role unaffected)
```

---

### Secrets Exposed in Client Bundle

```
[🟠] VULN: Server-only secrets accessible in frontend JavaScript bundle

SEVERITY:         🟠 HIGH
CATEGORY:         Deployment / Secret Exposure
AFFECTED SYSTEMS: .env, Next.js bundle, client components
OWASP:            A02 — Cryptographic Failures

DETECTED BEHAVIOR:
  NEXT_PUBLIC_ prefix used on variables that should be server-only:
  NEXT_PUBLIC_STRIPE_SECRET_KEY, NEXT_PUBLIC_DB_PASSWORD found in .env.
  Or: private API keys imported in client components (no 'use server' directive).
  File: components/PaymentForm.tsx imports process.env.STRIPE_SECRET_KEY

EXPLOIT SCENARIO:
  1. Attacker opens browser devtools → Sources tab
  2. Searches bundled JS for 'sk_live_', 'secret', 'password', 'private'
  3. Finds Stripe secret key or DB password in client bundle
  4. Uses Stripe secret key to issue refunds, list customers, modify subscriptions
  5. Uses DB credentials to connect directly to database

RECOMMENDED FIX:
  — Never use NEXT_PUBLIC_ prefix on secrets
  — Server-only secrets used only in: route handlers, server components, server actions
  — Audit all client components for process.env usage:
    grep -r "process.env" components/ app/(client)/
  — Use next.config.js serverRuntimeConfig for server-only values

IMPLEMENTATION COMPLEXITY:  Easy
BREAKING RISK IF FIXED:     Low (move logic to server components/actions)
```
