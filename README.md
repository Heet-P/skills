# Skills /oss

> My personal AI coding skills, shared in case they're useful to someone else.

These are prompts and skill files I've collected and refined while working with AI coding agents — Claude Code, Cursor, Codex, and others. They've helped me catch real problems and build better interfaces. I'm sharing them because if they've helped me, maybe they'll help someone like me.

**They come with no guarantees. Use your own judgement.**

> **Note on the design skills:** Three of the skills here — `design-taste-frontend`, `emil-design-eng`, and `impeccable` — are not mine. They were some of the first design-focused skills I tried and they gave me noticeably better output than anything I'd been using, so I kept them here for reference. Full credit goes to their real owners, detailed in each skill's section below.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## What this is

When I started using AI agents for real work, I noticed two gaps:

1. **Agents are blind to what can go wrong.** Security holes, N+1 queries, unsigned webhooks, retry storms — they sail right past all of it.
2. **Agents default to safe, generic design.** Landing pages that look like every other SaaS landing page. Animations that are technically present but not thoughtful.

These skills are my attempt to close both gaps. Some are audit engines that ask the agent to re-read its own output through a specific lens. Others are design philosophy documents that push it toward better aesthetic decisions.

**What these are:**
- Plain Markdown (and `.skill`) files you drop into your agent's context
- Things that have worked for me across real projects

**What these aren't:**
- A guarantee your code is secure, scalable, or compliant
- A substitute for actual expert review
- A product with a team behind it

---

## The Skills

### 🔒 Security Audit (`security-reviewer/`)

A deep adversarial security audit engine. Think like an attacker — not a developer.

This one asks the agent to map the full attack surface, simulate real exploits step-by-step, test sad paths and race conditions, and produce a structured findings report. It covers OWASP Top 10, IDOR, broken access control, payment tampering, file upload exploits, webhook forgery, RLS bypass, rate limiting gaps, and deployment secret exposure.

Comes with:
- `references/REPORT_FORMAT.md` — per-issue format with worked exploit examples
- `references/ATTACK_VECTORS.md` — OWASP checklist, security headers audit, RLS table, rate limiting matrix, sad-path test matrix, injection payload reference

```bash
/security-audit full          # Full adversarial audit
/security-audit auth          # Auth and session only
/security-audit payments      # Payment security and business logic
/security-audit access-control # IDOR and broken access control
/security-audit score         # Full audit + security score (0-100)
```

---

### 📈 Scale Check (`scale-check/`)

A scalability and architecture audit engine. Find the thing that's fine on seed data and fatal in prod.

Maps the entire system, simulates traffic at each stage (100 concurrent → viral spike), identifies breaking points by layer, and produces tiered recommendations — Free, Low-Cost, and Enterprise — so you can pick the right fix for your actual stage.

Comes with:
- `references/REPORT_FORMAT.md` — per-issue format with worked examples (connection pooling, missing indexes, CPU on request thread, stateful sessions)
- `references/SCALING_TIERS.md` — tier tables for database, caching, queues, deployment, observability; traffic stage roadmap from 1K to 1M+ DAU; failure simulation reference

```bash
/scalability-architecture audit       # Full audit
/scalability-architecture db          # Database layer only
/scalability-architecture roadmap     # 1K → 1M user roadmap
/scalability-architecture reliability # Failure analysis
/scalability-architecture score       # Full audit + production readiness score
```

---

### ⚖️ Legal Check (`legal-check/`)

A legal, privacy, and compliance audit engine. Not legal advice — but better than nothing.

Scans the codebase for what it actually does (auth, payments, AI, analytics, uploads), then surfaces the specific compliance gaps that matter: missing consent flows, unsigned webhooks, no account deletion, unconsented cookies, AI output not disclosed, data retained without a policy. Covers GDPR, CCPA, COPPA, LGPD, PIPEDA, UK GDPR, PCI-DSS, and the EU AI Act.

Comes with:
- `references/CHECKLIST.md` — mandatory compliance checklist across consent, policies, user rights, auth, payments, data handling, AI, cookies, and platform liability
- `references/REPORT_FORMAT.md` — per-issue format with worked examples (missing signup consent, no cookie banner, no account deletion, AI output not labeled)

```bash
/legal-check audit        # Full audit
/legal-check gdpr         # GDPR only
/legal-check consent      # Consent flow implementation only
/legal-check user-rights  # User rights gaps only
/legal-check score        # Full audit + compliance score (0-100)
```

---

### 🎨 Design Taste — Frontend (`design-taste-frontend/`)

> **Credit:** I did not write this skill. I found it, used it, got good results, and kept it here so I always have it to hand. If you know who originally wrote it, let me know and I'll update this attribution properly.

An anti-slop frontend skill for landing pages, portfolios, and redesigns.

This is the one I reach for when I want the agent to stop defaulting to Inter + slate-900 + centered hero + three equal feature cards. It reads the brief first, infers the right design direction, and ships interfaces that don't look like they came from a template.

Covers: typography discipline (why not to default to serif, which display fonts to reach for), color calibration (the specific palette families that are banned as defaults and what to use instead), layout rules (anti-center bias, bento grids, section-repetition ban), image strategy (generate real assets, no div-based fake screenshots), copy self-audit, responsive discipline, accessibility.

It also includes canonical code skeletons for the scroll patterns that agents usually get wrong — sticky stack, horizontal pan, scroll reveal.

---

### ✨ Emil Design Engineering (`emil-design-eng/`)

> **Credit:** This skill encodes [Emil Kowalski](https://emilkowalski.com)'s philosophy on UI polish, component design, animation decisions, and the invisible details that make software feel great. I did not write it — all credit goes to Emil. If you want to go deeper, his course is at [animations.dev](https://animations.dev/).

UI polish and animation philosophy, based on Emil Kowalski's design engineering work.

This one is less about audits and more about taste. It covers the animation decision framework (should this animate at all? what easing? how fast?), spring animations, clip-path patterns, gesture and drag interactions, performance rules (only animate transform and opacity), accessibility (prefers-reduced-motion), and the Sonner principles for building components people actually love.

I started using this one early on and kept it because it genuinely changed how I thought about animation decisions — and more importantly, how my agent made them.

---

### 🔧 Impeccable (`impeccable/`)

> **Credit:** This skill is based on [Anthropic's frontend-design skill](https://github.com/anthropics/claude-code-skills), licensed under Apache 2.0. I did not write it. Full attribution is in the skill's own metadata (`license: Apache 2.0. Based on Anthropic's frontend-design skill.`). I kept it here because it was one of the first structured design skills I used that produced reliably good results.

A full-featured frontend design system with 20+ sub-commands for every phase of UI work.

This is the most structured of the design skills. It has context loading (PRODUCT.md + DESIGN.md), a brand vs. product register system, and a command menu covering the full design workflow:

| Category | Commands |
|----------|----------|
| Build | `craft`, `shape`, `teach`, `document`, `extract` |
| Evaluate | `critique`, `audit` |
| Refine | `polish`, `bolder`, `quieter`, `distill`, `harden`, `onboard` |
| Enhance | `animate`, `colorize`, `typeset`, `layout`, `delight`, `overdrive` |
| Fix | `clarify`, `adapt`, `optimize` |
| Iterate | `live` |

I use this for bigger UI projects where I want the agent working within a defined design system rather than making up decisions from scratch.

---

## What These Have Helped Me Catch

| Pattern | What happened |
|---------|---------------|
| IDOR behind a UUID | Route loaded a resource by UUID without checking it belonged to the calling user. "Unguessable" isn't "authorised". |
| Retry storm on 5xx | `retry: 5` with no backoff turned a 30-second upstream blip into a self-inflicted DDoS. |
| N+1 in a list endpoint | `user.org.plan` called inside a loop. Fine on the seed DB, lethal on real data. |
| Unsigned webhook | Payment webhook parsed and credited without verifying the HMAC signature. |
| Generic landing page design | Default Inter + purple gradient + centered hero. Replaced with something that actually felt like the project. |

---

## How I Use These

Plain Markdown — nothing to install, no SDK, no account. I usually load a skill right before a focused pass.

```bash
# Clone or copy individual folders into your agent's context directory
gh repo clone Heet-P/skills .claude/skills

# Before a security review
claude --skill security-reviewer "audit the auth changes in this PR"

# Or just paste the SKILL.md content directly into your system prompt
```

The simplest approach: find the skill that matches what you're about to do, paste it into context, and ask the agent to re-read its own output through that lens.

---

## Repository Structure

```
skills/
├── security-reviewer/          ← adversarial security audit
│   ├── SKILL.md
│   └── references/
│       ├── REPORT_FORMAT.md
│       └── ATTACK_VECTORS.md
├── scale-check/                ← scalability & architecture audit
│   ├── SKILL.md
│   └── references/
│       ├── REPORT_FORMAT.md
│       └── SCALING_TIERS.md
├── legal-check/                ← legal, privacy & compliance audit
│   ├── SKILL.md
│   └── references/
│       ├── CHECKLIST.md
│       └── REPORT_FORMAT.md
├── design-taste-frontend/      ← anti-slop frontend design
│   └── SKILL.md
├── emil-design-eng/            ← UI polish & animation philosophy
│   └── SKILL.md
└── impeccable/                 ← full frontend design system (20+ commands)
    ├── SKILL.md
    ├── reference/              ← per-command reference files
    ├── agents/
    └── scripts/
```

---

## A Note on Using These

These skills are a starting point, not a checklist that makes your code safe or your design good. They're most useful when:

- You're about to merge something sensitive and want a second lens
- You've been heads-down on a feature and want to surface blind spots
- You want the agent thinking about craft instead of just correctness

They're less useful as a replacement for:
- Actual security audits by people who know what they're doing
- Real design feedback from people with taste
- Legal and compliance review by a professional
- Load testing

Take what helps. Leave what doesn't. Adapt freely.

---

## License

The skill files in this repo are individually licensed — check the `LICENSE.txt` in each folder. Most are Apache 2.0. The website code is MIT.

---

*Shared openly, with no strings and no guarantees. 2026.*
