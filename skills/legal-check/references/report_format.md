# Issue Report Format

Use this format for every compliance issue found during a legal-check audit.

---

## Issue Block Template

```
────────────────────────────────────────────────
[SEVERITY EMOJI] ISSUE: <Short title>
────────────────────────────────────────────────

SEVERITY:          🔴 CRITICAL | 🟠 HIGH | 🟡 MEDIUM | 🟢 LOW
CATEGORY:          Privacy | Consent | Auth | Payment | Cookie | AI | Content | Security
AFFECTED SYSTEMS:  e.g. "signup flow, users table, /api/auth/register"

DETECTED BEHAVIOR:
  What the code actually does — be specific.
  Reference file paths and function names where possible.
  e.g. "User email is stored in users.email at signup (auth/register.ts:42)
        but no consent checkbox exists in the UI (app/signup/page.tsx)"

LEGAL RISK:
  Applicable regulations: GDPR Art. X | CCPA | COPPA | etc.
  Liability exposure:     e.g. "Up to €20M or 4% of global annual turnover"
  User harm potential:    e.g. "Users have no knowledge their data is being sold"

REQUIRED DISCLOSURE:
  What must be communicated to users and/or regulators.

REQUIRED CONSENT:
  What explicit consent must be collected and stored.

RECOMMENDED FIX:
  Developer protection:  What to add to protect the platform legally
  Platform protection:   Policy language, terms clause, or technical control
  User protection:       What UI/UX change protects the user

IMPLEMENTATION:
  ☑ Mandatory           (legal requirement)
  ☐ Strongly Recommended (significant liability risk)
  ☐ Optional            (best practice)

BREAKING RISK IF FIXED:  None | Low | Moderate | High
────────────────────────────────────────────────
```

---

## Severity Definitions

| Level | Label    | When to Use                                                                                |
| ----- | -------- | ------------------------------------------------------------------------------------------ |
| 🔴    | CRITICAL | Active legal violation risk; could result in regulatory fine, lawsuit, or user data breach |
| 🟠    | HIGH     | Significant liability exposure; fix before launch or next major release                    |
| 🟡    | MEDIUM   | Compliance gap; could become a problem as user base grows                                  |
| 🟢    | LOW      | Best practice improvement; reduces risk, improves trust                                    |

---

## Common Issue Templates

### Missing Consent Checkbox at Signup

```
[🔴] ISSUE: No terms/privacy acceptance at account creation

SEVERITY:          🔴 CRITICAL
CATEGORY:          Consent
AFFECTED SYSTEMS:  Signup form, user registration API

DETECTED BEHAVIOR:
  Users can create accounts without agreeing to any terms or privacy policy.
  No checkbox, no modal, no acceptance record stored in DB.
  File: app/(auth)/signup/page.tsx — form submits name/email/password only.

LEGAL RISK:
  Regulations: GDPR Art. 7 (conditions for consent), Art. 13 (information at collection)
  Exposure: Processing personal data without lawful basis is a GDPR violation.
  User harm: Users are unaware of how their data is used.

REQUIRED DISCLOSURE:
  Link to Privacy Policy and Terms of Service must be visible at signup.

REQUIRED CONSENT:
  Unchecked checkbox: "I agree to the Terms of Service and Privacy Policy"
  Timestamp + policy version must be stored alongside user record.

RECOMMENDED FIX:
  Add checkbox to signup form (NOT pre-checked).
  Store accepted_tos_at and tos_version in users table.
  Block form submission if checkbox is unchecked.

IMPLEMENTATION:  ☑ Mandatory
BREAKING RISK:   Low
```

---

### Missing Cookie Consent Banner (EU)

```
[🟠] ISSUE: No cookie consent banner for non-essential cookies

SEVERITY:          🟠 HIGH
CATEGORY:          Cookie
AFFECTED SYSTEMS:  Analytics integration, localStorage, tracking scripts

DETECTED BEHAVIOR:
  Google Analytics / PostHog initialized on page load unconditionally.
  No cookie banner, no consent check, no opt-out mechanism.
  File: app/layout.tsx — GA script loads globally without consent gate.

LEGAL RISK:
  Regulations: GDPR Art. 6, ePrivacy Directive
  Applies to: All EU/EEA users
  Exposure: Fines from national DPAs; France CNIL issued €150M in GA fines.

REQUIRED CONSENT:
  Opt-in (not opt-out) consent required before non-essential cookies load.
  Consent must be granular: analytics vs. marketing vs. functional.

RECOMMENDED FIX:
  Add cookie consent banner (e.g. via Cookiebot, CookieYes, or custom).
  Gate analytics initialization behind consent check.
  Store consent choice in first-party cookie (not third-party).

IMPLEMENTATION:  ☑ Mandatory (for EU users)
BREAKING RISK:   Low
```

---

### No Account Deletion Flow

```
[🟠] ISSUE: Users cannot delete their account or data

SEVERITY:          🟠 HIGH
CATEGORY:          User Rights
AFFECTED SYSTEMS:  Settings page, user API, database

DETECTED BEHAVIOR:
  No DELETE /api/user endpoint found.
  Settings page has no "Delete Account" option.
  Users table has no deleted_at or is_deleted column.

LEGAL RISK:
  Regulations: GDPR Art. 17 (Right to Erasure), CCPA right to delete
  Exposure: Regulatory complaint and enforcement action.

REQUIRED FIX:
  Add "Delete My Account" button in account settings.
  Implement soft-delete (mark deleted_at) or hard-delete with data purge.
  Send confirmation email on deletion.
  Purge or anonymize all personal data within 30 days.

IMPLEMENTATION:  ☑ Mandatory
BREAKING RISK:   Moderate (requires API + DB changes)
```

---

### AI Output Without Disclosure

```
[🟡] ISSUE: AI-generated content not disclosed to users

SEVERITY:          🟡 MEDIUM
CATEGORY:          AI
AFFECTED SYSTEMS:  AI response rendering, UI output components

DETECTED BEHAVIOR:
  LLM API (Anthropic/OpenAI) used to generate content shown to users.
  No "Generated by AI" label, disclaimer, or disclosure in UI.
  File: components/AIResponse.tsx — renders markdown output with no badge.

LEGAL RISK:
  Regulations: EU AI Act Art. 50 (transparency for AI-generated content)
  Applies to: Platforms serving EU users
  Risk: FTC Act in US (deceptive practices) if AI impersonates a human.

REQUIRED DISCLOSURE:
  Label AI-generated content clearly.
  Add disclaimer: "This content was generated by AI and may contain errors."

RECOMMENDED FIX:
  Add "AI Generated" badge to all LLM output components.
  Include hallucination disclaimer in UI and Terms of Service.
  Add AI limitations clause to Terms of Service.

IMPLEMENTATION:  ☐ Strongly Recommended
BREAKING RISK:   None
```
