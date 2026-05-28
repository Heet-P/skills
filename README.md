# Skills /oss

> Production-grade engineering skills for AI coding agents.

A curated, open-source library of system prompts that make Claude Code, Codex, Cursor, Cline, and other AI coding agents reason like senior engineers — auditing security, scalability, reliability, and compliance **before code ships**.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![Skills](https://img.shields.io/badge/skills-84-ff0080)
![Categories](https://img.shields.io/badge/categories-8-blueviolet)

---

## The Problem

Most AI coding agents optimise for code that _runs_. They rarely think about code that _fails_ — under load, under attack, under audit.

- **Generic prompts miss specialist context.** A senior security engineer doesn't think like a senior SRE. Skills encode the mental model of each discipline.
- **Agents trust their own output.** Skills force adversarial review — re-reading the agent's own diff with the posture of an attacker, an auditor, or an on-call engineer at 3am.
- **Production fails at the seams.** Race conditions, retry storms, expired tokens, broken webhooks. Skills include checklists drawn from real post-mortems.

---

## Compatible With

| Agent | Integration |
|-------|-------------|
| Claude Code | `--skill <name>` flag or system prompt |
| OpenAI Codex | System prompt injection |
| Cursor | `.cursorrules` or Composer context |
| Cline | System prompt / MCP context |
| Roo | Rules file |
| OpenHands | System prompt |

---

## Quick Start

```bash
# Clone the skill library into your project
gh repo clone open-skills/skills .claude/skills

# Run a focused security review on a PR
claude --skill security-audit "review the auth changes in this PR"

# Or load multiple skills for a full production-readiness pass
claude --skill security-audit --skill reliability --skill scalability "review this new endpoint"
```

---

## Skill Categories

### 01 · Security Audit _(Skills 01 – 14)_

Read the diff like an _attacker_ would.

Static review skills that scan handlers, middleware, auth flows and secrets boundaries — looking for the assumption the agent didn't realise it was making.

| ID | Skill | Tag |
|----|-------|-----|
| S-01 | Authorisation re-check | `authz` |
| S-02 | Secrets & key handling | `crypto` |
| S-03 | Input validation & canonicalisation | `input` |
| S-04 | Server-side session integrity | `session` |
| S-05 | CSRF, CORS, and origin policy | `browser` |
| S-06 | Authenticated SSRF audit | `network` |

---

### 02 · OWASP & Adversarial Testing _(Skills 15 – 24)_

Replay the _OWASP top ten_ against your own code.

Adversarial review skills that simulate the canonical exploit patterns and write the failing test cases the agent should have written first.

| ID | Skill | Tag |
|----|-------|-----|
| O-01 | Injection (SQL, NoSQL, command) | `owasp` |
| O-02 | Broken access control playbook | `owasp` |
| O-03 | Cryptographic failures sweep | `owasp` |
| O-04 | Server-side request forgery | `owasp` |
| O-05 | Deserialisation & prototype pollution | `owasp` |

---

### 03 · Scalability & Architecture _(Skills 25 – 36)_

Find the call that's _fine on seed data_ and fatal in prod.

Skills that read endpoints and queries with a load profile in mind — N+1s, missing indexes, unbounded scans, fan-out reads, and shared mutable state at the edges.

| ID | Skill | Tag |
|----|-------|-----|
| A-01 | N+1 & query budget review | `db` |
| A-02 | Index & cardinality audit | `db` |
| A-03 | Cache key design & invalidation | `cache` |
| A-04 | Read/write split & replica lag | `db` |
| A-05 | Hot partition & tenant skew | `db` |

---

### 04 · Reliability & Failure Analysis _(Skills 37 – 48)_

Assume something _will break._ Then check.

Skills written from on-call experience — retry policies, idempotency, timeouts, partial failure, graceful degradation, and observability you actually need at 3am.

| ID | Skill | Tag |
|----|-------|-----|
| R-01 | Retry, backoff & jitter review | `sre` |
| R-02 | Idempotency key audit | `sre` |
| R-03 | Timeout budget & cascade map | `sre` |
| R-04 | Circuit breakers & bulkheads | `sre` |
| R-05 | Observability completeness check | `obs` |

---

### 05 · Legal & Compliance _(Skills 49 – 58)_

Catch the line that becomes a _regulator's question._

Compliance-aware skills for data handling, retention, consent, cross-border transfer, accessibility, and the seams where engineering decisions become legal posture.

| ID | Skill | Tag |
|----|-------|-----|
| L-01 | PII inventory & data map | `privacy` |
| L-02 | GDPR / CCPA retention check | `privacy` |
| L-03 | Consent flow integrity | `privacy` |
| L-04 | Accessibility (WCAG 2.2) review | `a11y` |
| L-05 | Cross-border transfer audit | `privacy` |

---

### 06 · Dependency & Supply Chain _(Skills 59 – 68)_

Every new import is a _trust decision._

Skills that inspect the dependency graph the agent just expanded — maintainers, age, install scripts, transitive risk, and known advisories.

| ID | Skill | Tag |
|----|-------|-----|
| D-01 | New dependency review | `deps` |
| D-02 | Install-script & postinstall audit | `deps` |
| D-03 | Lockfile drift & pinning | `deps` |
| D-04 | Transitive advisory sweep | `deps` |
| D-05 | Maintainer & provenance check | `deps` |

---

### 07 · DevOps & Production Readiness _(Skills 69 – 78)_

Is this actually _deployable_, or just runnable?

Skills for the gap between feature-complete and production-ready — health checks, configuration, rollouts, migrations, rollback, secrets, and on-call hand-off.

| ID | Skill | Tag |
|----|-------|-----|
| P-01 | Production readiness checklist | `prod` |
| P-02 | Migration safety & reversibility | `prod` |
| P-03 | Config & secrets at runtime | `prod` |
| P-04 | Health, readiness & liveness | `prod` |
| P-05 | Rollout, rollback & canary plan | `prod` |

---

### 08 · Payment & Fraud Analysis _(Skills 79 – 84)_

Money flows demand a _different posture._

Skills for charge, refund, payout and webhook code — signature verification, replay protection, idempotency, currency handling, and the fraud heuristics that catch the obvious losses.

| ID | Skill | Tag |
|----|-------|-----|
| F-01 | Webhook signature & replay | `pay` |
| F-02 | Charge / refund idempotency | `pay` |
| F-03 | Currency & rounding integrity | `pay` |
| F-04 | Velocity & fraud heuristics | `fraud` |
| F-05 | PCI scope minimisation | `pay` |

---

## Real Failure Patterns the Library Catches

| Code | Scenario | Caught By |
|------|----------|-----------|
| SEC-014 | IDOR hiding behind a UUID — resource fetched without tenant scope check | `security-audit` · `authz-review` |
| REL-022 | `retry: 5` with no backoff or jitter → self-inflicted DDoS on upstream blip | `reliability` · `sre-readiness` |
| SCALE-007 | N+1 dressed as "clean code" — `user.org.plan` called inside a list loop | `scalability` · `db-readiness` |
| PAY-003 | Payment webhook parsed & credited without HMAC signature verification | `payments-fraud` · `webhooks` |
| SUPPLY-011 | Single utility import pulled in deprecated maintainer's 412-dep graph | `supply-chain` · `dep-audit` |

---

## Operating Principles

These convictions run through every skill in the library:

> **"Think like a real security engineer, not a tutorial."**  
> Reason about the system as an attacker would. Assume credentials leak, tokens get replayed, and inputs are crafted, not typed.

> **"Test sad paths, not just happy paths."**  
> Every new function deserves at least three failure tests: wrong input, missing dependency, partial success. The happy path is the easy one.

> **"Never trust the browser as a security boundary."**  
> Client validation is UX. Server validation is the contract. Authorisation is checked on every read, every write, every join.

> **"Production-grade means recoverable, not perfect."**  
> Assume something will break. Skills emphasise observability, graceful degradation, and reversible deploys over heroic correctness.

---

## How to Use a Skill

Skills are plain Markdown files — no runtime, no SDK.

**Option 1 — Focused pass (recommended for reviews):**
```bash
claude --skill security-audit "review my auth middleware"
claude --skill reliability "check this new queue consumer"
claude --skill scalability "audit the /search endpoint"
```

**Option 2 — Always-on (add to system prompt):**
Copy the content of any skill file directly into your agent's system prompt to keep it active for every session.

**Option 3 — On-demand file load:**
Reference the skill file path in your prompt so the agent reads it when the domain becomes relevant:
```bash
claude "using .claude/skills/security-audit.md, review src/api/payments.ts"
```

---

## Repository Structure

```
skills-website/         ← this website
├── index.html          ← page structure
├── css/
│   └── styles.css      ← all styles & design tokens
├── js/
│   ├── app.js          ← categories data + UI rendering + theme toggle
│   └── chase.js        ← hero logo animation
├── images/             ← brand SVG assets
│   ├── gemini-black.svg
│   ├── gemini-white.svg
│   ├── cursor-black.svg
│   ├── cursor-whte.svg
│   ├── codex-black.svg
│   ├── codex-white.svg
│   ├── claudecode-black.svg
│   └── claudecode-whte.svg
└── skills/             ← the actual skill Markdown files
    ├── emil-design-eng/
    └── impeccable/
```

---

## Contributing

Skills are designed to be edited. The best contributions come from engineers who've been on-call and found a failure mode the library doesn't catch yet.

1. **Fork** the repository
2. **Write** your skill as a self-contained Markdown file
3. **Test it** by loading it into your agent and running it against real code
4. **Open a PR** describing what failure mode it catches and what it missed before

See the [contribution guide](https://github.com) for the skill format spec and review checklist.

---

## Stats

| Metric | Value |
|--------|-------|
| Total skills | 84 |
| Categories | 8 |
| Contributors | 37 |
| Forks | 1.2k |
| License | MIT |

---

## License

MIT — free forever. See [LICENSE](LICENSE).

---

*Designed for engineers, not marketers. v0.4.2 · 2026*
