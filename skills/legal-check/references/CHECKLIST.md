# Mandatory Compliance Checklist

Use this checklist at the end of every audit. Mark each item ✅ (present), ❌ (missing), or N/A (not applicable based on codebase).

Only mark N/A if the feature genuinely does not exist in the app.

---

## Consent & Legal Agreements

| #   | Item                                                    | Status | Notes |
| --- | ------------------------------------------------------- | ------ | ----- |
| C1  | Signup form has unchecked ToS + Privacy checkbox        |        |       |
| C2  | Policy links are visible before account creation        |        |       |
| C3  | Consent timestamp stored in database                    |        |       |
| C4  | Policy version tracked at time of consent               |        |       |
| C5  | Purchase flow requires payment terms acceptance         |        |       |
| C6  | Marketing email requires explicit opt-in                |        |       |
| C7  | Cookie consent banner present for non-essential cookies |        |       |
| C8  | Cookie consent distinguishes analytics vs. marketing    |        |       |
| C9  | Consent can be revoked by the user                      |        |       |
| C10 | AI-generated content is disclosed to users              |        |       |

---

## Published Policies

| #   | Policy                                                         | Status | Notes |
| --- | -------------------------------------------------------------- | ------ | ----- |
| P1  | Privacy Policy published and linked at signup                  |        |       |
| P2  | Terms & Conditions published and linked at signup              |        |       |
| P3  | Cookie Policy published (if cookies used)                      |        |       |
| P4  | Refund Policy published (if payments exist)                    |        |       |
| P5  | AI Usage Policy published (if AI used)                         |        |       |
| P6  | Community Guidelines published (if UGC exists)                 |        |       |
| P7  | DMCA/Copyright Policy published (if uploads exist)             |        |       |
| P8  | Data Retention Policy published or described in Privacy Policy |        |       |

---

## User Rights (GDPR / CCPA)

| #   | Right                                     | Status | Notes |
| --- | ----------------------------------------- | ------ | ----- |
| R1  | User can access / export their data       |        |       |
| R2  | User can delete their account             |        |       |
| R3  | User can request data deletion            |        |       |
| R4  | User can opt out of tracking/analytics    |        |       |
| R5  | User can update/correct their data        |        |       |
| R6  | Contact method exists for rights requests |        |       |
| R7  | Rights requests processed within 30 days  |        |       |

---

## Auth & Account Security

| #   | Item                                        | Status | Notes |
| --- | ------------------------------------------- | ------ | ----- |
| A1  | Passwords hashed (bcrypt / argon2 / scrypt) |        |       |
| A2  | No plaintext passwords in logs or DB        |        |       |
| A3  | Session expiry configured                   |        |       |
| A4  | CSRF protection on state-changing endpoints |        |       |
| A5  | OAuth integrations use state parameter      |        |       |
| A6  | Rate limiting on login / signup endpoints   |        |       |
| A7  | Account lockout after failed login attempts |        |       |

---

## Payment Compliance

| #   | Item                                                 | Status | Notes |
| --- | ---------------------------------------------------- | ------ | ----- |
| PM1 | Refund/cancellation policy displayed before purchase |        |       |
| PM2 | Recurring billing disclosed before charge            |        |       |
| PM3 | Tax handling disclosed where applicable              |        |       |
| PM4 | Failed payment retry behavior disclosed              |        |       |
| PM5 | No raw card data stored (PCI-DSS)                    |        |       |
| PM6 | Payment processor (Stripe/Razorpay) DPA in place     |        |       |
| PM7 | Chargeback process described in policy               |        |       |

---

## Data Handling

| #   | Item                                                        | Status | Notes |
| --- | ----------------------------------------------------------- | ------ | ----- |
| D1  | Personal data encrypted at rest                             |        |       |
| D2  | Personal data encrypted in transit (HTTPS)                  |        |       |
| D3  | Sensitive fields not logged                                 |        |       |
| D4  | Third-party processors listed in Privacy Policy             |        |       |
| D5  | International data transfers disclosed (GDPR SCCs)          |        |       |
| D6  | Data minimization practiced (only necessary data collected) |        |       |
| D7  | Retention periods defined and enforced                      |        |       |
| D8  | Backups protected and retention-limited                     |        |       |

---

## AI / LLM Compliance

| #   | Item                                                             | Status | Notes |
| --- | ---------------------------------------------------------------- | ------ | ----- |
| AI1 | AI-generated content labeled in UI                               |        |       |
| AI2 | Hallucination disclaimer present                                 |        |       |
| AI3 | AI usage disclosed in Terms of Service                           |        |       |
| AI4 | User prompts/inputs retention policy defined                     |        |       |
| AI5 | AI output moderation in place                                    |        |       |
| AI6 | AI cannot impersonate humans without disclosure                  |        |       |
| AI7 | Training data usage disclosed (if prompts are used for training) |        |       |

---

## Cookie & Tracking

| #   | Item                                                       | Status | Notes |
| --- | ---------------------------------------------------------- | ------ | ----- |
| CK1 | Cookie inventory documented (essential vs. non-essential)  |        |       |
| CK2 | Non-essential cookies gated behind consent                 |        |       |
| CK3 | Analytics does not fire before consent                     |        |       |
| CK4 | Cookie consent choice stored (not re-prompted every visit) |        |       |
| CK5 | Third-party tracking scripts listed in Cookie Policy       |        |       |
| CK6 | Secure + HttpOnly flags set on session cookies             |        |       |
| CK7 | SameSite attribute set on cookies                          |        |       |

---

## Platform Liability

| #   | Item                                               | Status | Notes |
| --- | -------------------------------------------------- | ------ | ----- |
| L1  | Limitation of liability clause in ToS              |        |       |
| L2  | Warranty disclaimer in ToS                         |        |       |
| L3  | Acceptable Use Policy covers prohibited activities |        |       |
| L4  | Account termination rights reserved                |        |       |
| L5  | Content moderation / takedown process exists       |        |       |
| L6  | DMCA takedown contact/process exists (if UGC)      |        |       |
| L7  | Dispute resolution / arbitration clause in ToS     |        |       |
| L8  | Governing law and jurisdiction specified in ToS    |        |       |

---

## Scoring Guide

Count checked items vs. applicable items.

```
90-100%  → Compliance-ready
75-89%   → Minor gaps — fix before scaling
50-74%   → Significant gaps — fix before launch
<50%     → Critical compliance work needed
```
