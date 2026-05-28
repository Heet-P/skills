# Skills /oss

> My personal AI coding skills, shared in case they're useful to someone else.

These are prompts I've collected and refined while working with AI coding agents like Claude Code, Cursor, Codex and Cline. They've helped me catch real problems — security holes, reliability gaps, things that would've been fine in dev and broken in prod.

I'm not sharing these because they're perfect or because I've proven them at scale. I'm sharing them because if they've helped me, maybe they'll help someone like me. **They come with no guarantees. Use your own judgement.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## What this is

When I started using AI agents for real coding work, I noticed a gap: the agent was great at writing code that worked on the happy path, and pretty blind to everything else. Security edge cases, retry logic, N+1 queries, unsigned webhooks — it would sail right past all of it.

So I started writing prompts that asked it to slow down and look harder at specific things. Over time those prompts became more refined. This is that collection.

**What these are:**
- Plain Markdown files you drop into your agent's context
- Prompts that ask your agent to review code through a specific lens (security, reliability, etc.)
- Things that have worked for me across real projects

**What these aren't:**
- A security audit tool
- A guarantee that your code is safe, scalable, or compliant
- A substitute for actual expert review
- A product with a team behind it

If a skill helps you catch something before it ships — great. If it misses something critical — that's on both of us for not doing proper due diligence.

---

## Compatible Agents

I mostly use these with Claude Code and Cursor, but they're plain text so they work anywhere you can pass a system prompt:

- Claude Code
- Cursor
- OpenAI Codex
- Cline
- Roo
- OpenHands
- Any agent that accepts a system prompt or context file

---

## How I Use Them

```bash
# Clone the repo
gh repo clone <your-fork>/skills .claude/skills

# Before reviewing auth changes
claude --skill security-audit "review the auth changes in this PR"

# Before shipping a new async worker
claude --skill reliability "check this queue consumer for failure modes"

# Or just paste the skill content directly into your system prompt
```

The simplest approach: find the skill that matches what you're about to do, paste it into context, and ask your agent to re-read its own output through that lens.

---

## The Collection

### 01 · Security Audit _(Skills 01–14)_

When I'm reviewing auth flows, middleware, or anything that touches credentials — I want the agent looking at it like someone who's trying to break it, not someone who wrote it.

| ID | Skill | Tag |
|----|-------|-----|
| S-01 | Authorisation re-check | `authz` |
| S-02 | Secrets & key handling | `crypto` |
| S-03 | Input validation & canonicalisation | `input` |
| S-04 | Server-side session integrity | `session` |
| S-05 | CSRF, CORS, and origin policy | `browser` |
| S-06 | Authenticated SSRF audit | `network` |

---

### 02 · OWASP & Adversarial Testing _(Skills 15–24)_

The canonical exploit patterns are well-documented. These skills ask the agent to run through them against your actual code rather than generic examples.

| ID | Skill | Tag |
|----|-------|-----|
| O-01 | Injection (SQL, NoSQL, command) | `owasp` |
| O-02 | Broken access control playbook | `owasp` |
| O-03 | Cryptographic failures sweep | `owasp` |
| O-04 | Server-side request forgery | `owasp` |
| O-05 | Deserialisation & prototype pollution | `owasp` |

---

### 03 · Scalability & Architecture _(Skills 25–36)_

The thing that's fine on a seed database and lethal on a real one. I got burned by N+1s enough times that I wrote a whole category around this.

| ID | Skill | Tag |
|----|-------|-----|
| A-01 | N+1 & query budget review | `db` |
| A-02 | Index & cardinality audit | `db` |
| A-03 | Cache key design & invalidation | `cache` |
| A-04 | Read/write split & replica lag | `db` |
| A-05 | Hot partition & tenant skew | `db` |

---

### 04 · Reliability & Failure Analysis _(Skills 37–48)_

Retry logic, idempotency, timeouts. The stuff that seems fine until something flaps and you find out your retries have no backoff.

| ID | Skill | Tag |
|----|-------|-----|
| R-01 | Retry, backoff & jitter review | `sre` |
| R-02 | Idempotency key audit | `sre` |
| R-03 | Timeout budget & cascade map | `sre` |
| R-04 | Circuit breakers & bulkheads | `sre` |
| R-05 | Observability completeness check | `obs` |

---

### 05 · Legal & Compliance _(Skills 49–58)_

I'm not a lawyer and these are not legal advice. But they've helped me spot the places where an engineering decision becomes a compliance conversation — better to catch those before the conversation happens with a regulator.

| ID | Skill | Tag |
|----|-------|-----|
| L-01 | PII inventory & data map | `privacy` |
| L-02 | GDPR / CCPA retention check | `privacy` |
| L-03 | Consent flow integrity | `privacy` |
| L-04 | Accessibility (WCAG 2.2) review | `a11y` |
| L-05 | Cross-border transfer audit | `privacy` |

---

### 06 · Dependency & Supply Chain _(Skills 59–68)_

Every new `npm install` is a trust decision. These ask the agent to slow down and think about what it just brought in.

| ID | Skill | Tag |
|----|-------|-----|
| D-01 | New dependency review | `deps` |
| D-02 | Install-script & postinstall audit | `deps` |
| D-03 | Lockfile drift & pinning | `deps` |
| D-04 | Transitive advisory sweep | `deps` |
| D-05 | Maintainer & provenance check | `deps` |

---

### 07 · DevOps & Production Readiness _(Skills 69–78)_

The gap between "it runs locally" and "it's actually deployable." Health checks, rollbacks, migration safety, secrets at runtime.

| ID | Skill | Tag |
|----|-------|-----|
| P-01 | Production readiness checklist | `prod` |
| P-02 | Migration safety & reversibility | `prod` |
| P-03 | Config & secrets at runtime | `prod` |
| P-04 | Health, readiness & liveness | `prod` |
| P-05 | Rollout, rollback & canary plan | `prod` |

---

### 08 · Payment & Fraud Analysis _(Skills 79–84)_

Anything touching money deserves a more careful pass. Signature verification, replay protection, idempotency — the things you really don't want to get wrong.

| ID | Skill | Tag |
|----|-------|-----|
| F-01 | Webhook signature & replay | `pay` |
| F-02 | Charge / refund idempotency | `pay` |
| F-03 | Currency & rounding integrity | `pay` |
| F-04 | Velocity & fraud heuristics | `fraud` |
| F-05 | PCI scope minimisation | `pay` |

---

## Things These Have Helped Me Catch

A few examples of the kinds of issues that came up when I started using these more consistently. Not claiming they caught everything — just the things I noticed.

| Pattern | What happened |
|---------|---------------|
| IDOR behind a UUID | Route loaded a resource by UUID without checking it belonged to the calling user. "Unguessable" isn't "authorised". |
| Retry storm on 5xx | `retry: 5` with no backoff turned a 30-second upstream blip into a self-inflicted DDoS. |
| N+1 in a list endpoint | `user.org.plan` called inside a loop. Fine on the seed DB, lethal on real data. |
| Unsigned webhook | Payment webhook parsed and credited without verifying the HMAC signature. |
| Import with 400+ transitive deps | One utility pulled in a deprecated maintainer's entire package graph. |

---

## Some Things I Keep Reminding Myself (and the Agent)

These aren't rules — just patterns I kept running into that I baked into the skills:

- **"Think like someone trying to break it, not someone who built it."** The agent is predisposed to assume its own output is correct. These skills try to counteract that.
- **"Test the sad paths."** The happy path always works in dev. The question is what happens when it doesn't.
- **"Client validation is UX. Server validation is the contract."** Caught myself (and the agent) relying on frontend checks more than once.
- **"Recoverable is better than perfect."** Observability and rollback plans matter more than getting it right first time.

---

## Repository Structure

```
skills-website/
├── index.html          ← the website
├── README.md           ← this file
├── css/
│   └── styles.css
├── js/
│   ├── app.js
│   └── chase.js
├── images/             ← brand SVGs
└── skills/             ← the actual skill Markdown files
```

---

## A Note on Using These

These skills are a starting point, not a checklist that makes your code safe. They're most useful when:

- You're about to merge something in a sensitive area and want a second lens
- You've been heads-down on a feature and want to surface blind spots
- You're doing a code review and want domain-specific questions to ask

They're less useful as a replacement for:
- Actual security audits by people who know what they're doing
- Load testing
- Legal and compliance review
- Experienced colleagues reading your code

Take what helps. Leave what doesn't. Adapt freely.

---

## License

MIT. Do whatever you want with it.

---

*Shared openly, with no strings and no guarantees. 2026.*
