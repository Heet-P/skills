# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **greenfield website project** for showcasing an open-source collection of AI engineering "skills" (system prompts) designed for production-grade software development. The full product brief is in [prompt.md](prompt.md).

The site's purpose: present deeply engineered, production-focused AI skills (security audits, OWASP testing, scalability analysis, compliance review, etc.) that developers can drop into AI coding tools like Claude Code, Cursor, Codex, Cline, and OpenHands. The GitHub repo is the central product — the website drives traffic there.

**Tone**: engineering-focused, developer-first, minimal, trustworthy. Not corporate, not marketing-heavy.

## Tech Stack (to be decided)

No framework has been chosen yet. When starting the build, prefer a simple static site approach unless interactivity requires more:
- **Recommended**: plain HTML/CSS/JS or a minimal static site generator (e.g., Astro, Eleventy, or Vite)
- Keep dependencies minimal — this is a developer-credibility site; bloat undermines trust
- The site should work without JavaScript where possible

## Site Structure (from brief)

Single-page or multi-section site with these sections:
1. Hero — core value prop and GitHub CTA
2. What These Skills Do
3. Skill Categories (Security, OWASP, Scalability, Reliability, Legal/Compliance, Supply Chain, DevOps, Payment/Fraud)
4. Example Engineering Problems They Catch
5. Why Traditional AI Coding Misses These Issues
6. Real Production Failure Scenarios
7. GitHub CTA + Open Source / Community section

## Design Principles

- Clean, minimal, modern — no flashy animations or heavy design
- Developer-first aesthetic (monospace fonts for code/skill examples work well)
- Primary CTA always redirects to the GitHub repository
- Copy should feel like it was written by a senior engineer, not a marketer
- Key messaging: "Think like a real security engineer", "Test sad paths, not just happy paths", "Never trust the browser as a security boundary"

## Development Commands

*(To be filled in once a framework is chosen and scaffolded.)*

## Adding Skills

Skills live in [skills/](skills/), one subfolder per category:

- `skills/security-audit/`
- `skills/owasp-adversarial/`
- `skills/scalability-architecture/`
- `skills/reliability-failure-analysis/`
- `skills/legal-compliance/`
- `skills/dependency-supply-chain/`
- `skills/devops-production-readiness/`
- `skills/payment-fraud-analysis/`

Each skill is a `.md` file with a YAML frontmatter block (`name`, `description`, `tools`) followed by the system prompt body. See [skills/README.md](skills/README.md) for the full convention.

## Key Constraint

The GitHub repository is the core product. Every design and copy decision should serve the goal of getting developers to visit, star, fork, and use the skills from that repo.
