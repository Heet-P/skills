# ENHANCED SECURITY AUDIT ENGINE (MERGED VERSION)

# SECURITY AUDIT ENGINE

Perform a DEEP adversarial security audit across the ENTIRE codebase.

You MUST think like:

* attacker
* penetration tester
* fraudster
* malicious insider
* bot operator
* red-team engineer

Do NOT stop at obvious vulnerabilities.

Actively search for:

* chained exploits
* replay opportunities
* state inconsistencies
* trust-boundary failures
* hidden escalation paths
* concurrency vulnerabilities
* operational abuse vectors

---

# ZERO TRUST SECURITY MODEL

The browser is NOT a security boundary.

NEVER trust:

* frontend validation
* hidden fields
* localStorage
* sessionStorage
* disabled UI states
* client-side roles
* client-side permissions
* frontend pricing
* frontend totals
* frontend auth state

Attackers can:

* disable JavaScript
* intercept requests
* use Postman/Insomnia
* forge payloads
* replay requests
* bypass frontend validation
* manipulate hidden fields

ALL validation MUST happen server-side.

Client-side validation exists ONLY for UX.

Server-side validation is MANDATORY.

---

# SERVER-SIDE VALIDATION REQUIREMENTS

You MUST verify ALL APIs enforce:

* schema validation
* auth validation
* authorization validation
* ownership validation
* business logic validation
* payment validation
* file validation
* rate limiting

Examples:

* Zod
* Valibot
* Joi
* Yup
* Pydantic
* class-validator

or equivalent validation systems depending on framework/language.

HIGH PRIORITY if:

* frontend totals trusted
* frontend pricing trusted
* frontend permissions trusted
* frontend roles trusted

Flag any API relying only on frontend validation.

---

# FRONTEND SECURITY

Analyze:

* exposed secrets
* unsafe env variables
* client-side trust
* XSS
* dangerouslySetInnerHTML
* localStorage misuse
* session leakage
* token exposure
* open redirects
* unsafe URL handling
* CSP weaknesses
* browser cache exposure
* hydration inconsistencies
* SSR leaks
* API exposure
* source map exposure

Verify:

* no sensitive logic exists only client-side
* no sensitive authorization checks exist only client-side

---

# BACKEND SECURITY

Analyze:

* missing auth
* weak auth
* missing authorization
* broken access control
* IDOR
* CSRF
* SSRF
* request forgery
* origin spoofing
* header spoofing
* insecure middleware
* validation gaps
* sanitization gaps
* insecure file handling
* injection risks
* privilege escalation
* admin exposure
* insecure defaults

---

# ROW LEVEL SECURITY (RLS) ANALYSIS

If using:

* PostgreSQL
* Supabase
* Firebase Rules
* Appwrite
* Hasura
* PocketBase
* Mongo permission layers

You MUST audit:

## RLS COVERAGE

* whether enabled
* whether bypassable
* ownership enforcement
* tenant isolation
* anonymous access risks
* admin bypasses
* privilege escalation

---

# RLS FAILURE TESTS

You MUST simulate:

* accessing another user's records
* modifying another user's records
* querying unauthorized rows
* bypassing filters manually
* forged JWTs
* tampered user IDs
* direct API calls

Flag ANY:

* missing ownership checks
* missing tenant isolation
* weak policy conditions

HIGH PRIORITY if users can access other users’ data.

---

# PAYMENT SECURITY

Analyze:

* replay attacks
* webhook forgery
* idempotency failures
* duplicate charges
* race conditions
* stale payment states
* frontend amount tampering
* missing signature verification
* server-side verification gaps
* inconsistent order states
* retry abuse
* refund inconsistencies
* orphaned payments
* orphaned orders

Verify:

* frontend totals are NEVER trusted
* payment success NEVER depends only on frontend state
* all payment amounts are recalculated server-side

---

# SAD-PATH / FAILURE-PATH TESTING

Do NOT only test happy paths.

Aggressively test SAD PATHS.

The application must behave safely when:

* requests fail
* APIs timeout
* retries happen
* dependencies fail
* malformed input is received
* steps partially fail
* workflows are interrupted
* concurrent requests occur

---

# AUTHENTICATION SAD PATH TESTING

You MUST test:

## LOGIN FAILURES

* wrong password attempts (5-10+)
* brute force attempts
* credential stuffing
* rate limiting
* lockouts
* timing attacks

Verify:

* account existence is NOT leaked
* generic auth responses are used
* raw auth errors are NOT exposed

GOOD:
"Invalid credentials"

BAD:
"Email does not exist"

---

## PASSWORD RESET TESTING

Test:

* reset requests for nonexistent emails
* malformed reset tokens
* expired reset tokens
* reused reset tokens
* brute-force reset attempts

Verify:

* generic responses only
* no account enumeration
* proper expiration handling
* token invalidation after use

---

## SESSION TESTING

Test:

* expired sessions
* revoked sessions
* stolen token reuse
* session fixation
* concurrent sessions
* refresh token reuse

Verify:

* proper invalidation
* proper expiration
* refresh token rotation

---

# INPUT VALIDATION SAD PATHS

Test:

* malformed JSON
* invalid types
* null values
* undefined values
* oversized payloads
* unicode edge cases
* emoji edge cases
* extremely long strings
* SQL/meta characters
* script payloads

Verify:

* graceful handling
* sanitized errors
* no raw stack traces
* no crashes
* no memory exhaustion

---

# MULTI-STEP WORKFLOW FAILURE ANALYSIS

Deeply analyze workflows where:

* step 3 depends on step 2
* step 2 depends on step 1

Examples:

* checkout
* onboarding
* OAuth login
* invoice generation
* uploads
* admin approvals
* payment verification

Test scenarios where:

* one step silently fails
* retries happen
* duplicate requests happen
* network interruptions occur
* partial state exists

Identify:

* stale state
* orphaned state
* inconsistent state
* replayable state
* duplicate execution

---

# OWASP TOP 10 SECURITY REVIEW

Audit against the latest OWASP Top 10.

---

## A01 — Broken Access Control

Check:

* IDOR
* privilege escalation
* forced browsing
* missing ownership validation
* admin bypasses

---

## A02 — Cryptographic Failures

Check:

* plaintext secrets
* weak hashing
* insecure JWTs
* missing HTTPS
* weak encryption

---

## A03 — Injection

Check:

* SQL injection
* NoSQL injection
* command injection
* CSV injection
* formula injection
* template injection
* header injection
* HTML injection

---

## A04 — Insecure Design

Check:

* flawed trust boundaries
* unsafe workflows
* weak recovery systems
* dangerous assumptions

---

## A05 — Security Misconfiguration

Check:

* verbose errors
* exposed admin routes
* weak security headers
* debug mode exposure
* public storage exposure

---

## A06 — Vulnerable Components

Check:

* outdated packages
* known CVEs
* abandoned dependencies
* supply chain risks

---

## A07 — Authentication Failures

Check:

* weak session handling
* brute force risks
* credential stuffing risks
* weak password policies

---

## A08 — Software/Data Integrity Failures

Check:

* unsafe deserialization
* insecure CI/CD
* unverified webhooks
* unsafe package installs

---

## A09 — Logging & Monitoring Failures

Check:

* missing auth logs
* missing audit logs
* missing incident visibility

---

## A10 — SSRF

Check:

* server-side fetch abuse
* URL fetch abuse
* webhook abuse
* image-fetch abuse

---

# SECURITY HEADERS AUDIT

You MUST audit:

* Content-Security-Policy
* Strict-Transport-Security
* X-Frame-Options
* Referrer-Policy
* X-Content-Type-Options
* Permissions-Policy
* CORS configuration

Priority order:

1. security headers
2. OWASP review
3. injection prevention
4. broken access control
5. auth hardening

---

# ERROR HANDLING REQUIREMENTS

Applications MUST fail gracefully.

Verify:

* no raw stack traces
* no SQL errors leaked
* no auth internals leaked
* no framework internals leaked
* no payment internals leaked

GOOD:
generic safe errors

BAD:
raw exception traces

HIGH PRIORITY if implementation details leak in production.

---

# RATE LIMITING + ABUSE PROTECTION

Test:

* login brute force
* signup spam
* OTP spam
* password reset spam
* webhook floods
* scraping
* API abuse
* bot abuse

Verify:

* rate limits
* cooldowns
* IP throttling
* CAPTCHA where appropriate
* lockouts
* abuse monitoring

---

# BUSINESS LOGIC SECURITY TESTING

Test:

* coupon abuse
* referral abuse
* free-trial abuse
* inventory race conditions
* duplicate discounts
* negative pricing
* payment replay abuse

Think like:

* attacker
* fraudster
* bot operator

---

# FILE UPLOAD SECURITY TESTING

If uploads exist:
test:

* MIME spoofing
* malicious extensions
* oversized files
* SVG injection
* ZIP bombs
* EXIF payloads
* script uploads

Verify:

* extension restrictions
* content validation
* MIME validation
* server-side scanning

---

# DEPLOYMENT SECURITY

Analyze:

* exposed env files
* insecure Docker configs
* leaked secrets
* unsafe build configs
* SSR secret exposure
* public admin routes
* debug mode exposure
* verbose production errors
