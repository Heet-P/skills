const CATEGORIES = [
  {
    id: "security",
    name: "Security Audit",
    eyebrow: "Skills 01 — 14",
    titleText: "Read the diff like an ",
    titleEm: "attacker",
    titleTail: " would.",
    desc: "Static review skills that scan handlers, middleware, auth flows and secrets boundaries — looking for the assumption the agent didn't realise it was making.",
    skills: [
      ["S-01", "Authorisation re-check", "authz"],
      ["S-02", "Secrets & key handling", "crypto"],
      ["S-03", "Input validation & canonicalisation", "input"],
      ["S-04", "Server-side session integrity", "session"],
      ["S-05", "CSRF, CORS, and origin policy", "browser"],
      ["S-06", "Authenticated SSRF audit", "network"]
    ]
  },
  {
    id: "owasp",
    name: "OWASP & Adversarial Testing",
    eyebrow: "Skills 15 — 24",
    titleText: "Replay the ",
    titleEm: "OWASP top ten",
    titleTail: " against your own code.",
    desc: "Adversarial review skills that simulate the canonical exploit patterns and write the failing test cases the agent should have written first.",
    skills: [
      ["O-01", "Injection (SQL, NoSQL, command)", "owasp"],
      ["O-02", "Broken access control playbook", "owasp"],
      ["O-03", "Cryptographic failures sweep", "owasp"],
      ["O-04", "Server-side request forgery", "owasp"],
      ["O-05", "Deserialisation & prototype pollution", "owasp"]
    ]
  },
  {
    id: "scale",
    name: "Scalability & Architecture",
    eyebrow: "Skills 25 — 36",
    titleText: "Find the call that's ",
    titleEm: "fine on seed data",
    titleTail: " and fatal in prod.",
    desc: "Skills that read endpoints and queries with a load profile in mind — N+1s, missing indexes, unbounded scans, fan-out reads, and shared mutable state at the edges.",
    skills: [
      ["A-01", "N+1 & query budget review", "db"],
      ["A-02", "Index & cardinality audit", "db"],
      ["A-03", "Cache key design & invalidation", "cache"],
      ["A-04", "Read/write split & replica lag", "db"],
      ["A-05", "Hot partition & tenant skew", "db"]
    ]
  },
  {
    id: "reliability",
    name: "Reliability & Failure Analysis",
    eyebrow: "Skills 37 — 48",
    titleText: "Assume something ",
    titleEm: "will break.",
    titleTail: " Then check.",
    desc: "Skills written from on-call experience — retry policies, idempotency, timeouts, partial failure, graceful degradation, and observability you actually need at 3am.",
    skills: [
      ["R-01", "Retry, backoff & jitter review", "sre"],
      ["R-02", "Idempotency key audit", "sre"],
      ["R-03", "Timeout budget & cascade map", "sre"],
      ["R-04", "Circuit breakers & bulkheads", "sre"],
      ["R-05", "Observability completeness check", "obs"]
    ]
  },
  {
    id: "legal",
    name: "Legal & Compliance",
    eyebrow: "Skills 49 — 58",
    titleText: "Catch the line that becomes a ",
    titleEm: "regulator's question.",
    titleTail: "",
    desc: "Compliance-aware skills for data handling, retention, consent, cross-border transfer, accessibility, and the seams where engineering decisions become legal posture.",
    skills: [
      ["L-01", "PII inventory & data map", "privacy"],
      ["L-02", "GDPR / CCPA retention check", "privacy"],
      ["L-03", "Consent flow integrity", "privacy"],
      ["L-04", "Accessibility (WCAG 2.2) review", "a11y"],
      ["L-05", "Cross-border transfer audit", "privacy"]
    ]
  },
  {
    id: "supply",
    name: "Dependency & Supply Chain",
    eyebrow: "Skills 59 — 68",
    titleText: "Every new import is a ",
    titleEm: "trust decision.",
    titleTail: "",
    desc: "Skills that inspect the dependency graph the agent just expanded — maintainers, age, install scripts, transitive risk, and known advisories.",
    skills: [
      ["D-01", "New dependency review", "deps"],
      ["D-02", "Install-script & postinstall audit", "deps"],
      ["D-03", "Lockfile drift & pinning", "deps"],
      ["D-04", "Transitive advisory sweep", "deps"],
      ["D-05", "Maintainer & provenance check", "deps"]
    ]
  },
  {
    id: "devops",
    name: "DevOps & Production Readiness",
    eyebrow: "Skills 69 — 78",
    titleText: "Is this actually ",
    titleEm: "deployable",
    titleTail: ", or just runnable?",
    desc: "Skills for the gap between feature-complete and production-ready — health checks, configuration, rollouts, migrations, rollback, secrets, and on-call hand-off.",
    skills: [
      ["P-01", "Production readiness checklist", "prod"],
      ["P-02", "Migration safety & reversibility", "prod"],
      ["P-03", "Config & secrets at runtime", "prod"],
      ["P-04", "Health, readiness & liveness", "prod"],
      ["P-05", "Rollout, rollback & canary plan", "prod"]
    ]
  },
  {
    id: "payments",
    name: "Payment & Fraud Analysis",
    eyebrow: "Skills 79 — 84",
    titleText: "Money flows demand a ",
    titleEm: "different posture.",
    titleTail: "",
    desc: "Skills for charge, refund, payout and webhook code — signature verification, replay protection, idempotency, currency handling, and the fraud heuristics that catch the obvious losses.",
    skills: [
      ["F-01", "Webhook signature & replay", "pay"],
      ["F-02", "Charge / refund idempotency", "pay"],
      ["F-03", "Currency & rounding integrity", "pay"],
      ["F-04", "Velocity & fraud heuristics", "fraud"],
      ["F-05", "PCI scope minimisation", "pay"]
    ]
  }
];

const listEl = document.getElementById("cat-list");
const detailEl = document.getElementById("cat-detail");

let active = 0;

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

function makeTitleEl(c) {
  const h = document.createElement("h3");
  h.className = "cat-d-title";
  h.appendChild(document.createTextNode(c.titleText));
  const em = document.createElement("em");
  em.textContent = c.titleEm;
  h.appendChild(em);
  if (c.titleTail) h.appendChild(document.createTextNode(c.titleTail));
  return h;
}

function renderList() {
  listEl.replaceChildren();
  CATEGORIES.forEach((c, i) => {
    const btn = el("button", "cat-item" + (i === active ? " is-active" : ""));
    btn.dataset.i = i;
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", i === active);
    btn.appendChild(el("span", "cat-num", String(i + 1).padStart(2, "0")));
    btn.appendChild(el("span", "cat-name", c.name));
    btn.appendChild(el("span", "cat-arrow", "→"));
    btn.addEventListener("click", () => {
      active = parseInt(btn.dataset.i, 10);
      renderList();
      renderDetail();
    });
    listEl.appendChild(btn);
  });
}

function renderDetail() {
  const c = CATEGORIES[active];

  const top = el("div", "cat-d-top");
  top.appendChild(el("span", "cat-d-eyebrow", c.eyebrow));

  const skillList = el("div", "cat-skill-list");
  c.skills.forEach(s => {
    const row = el("div", "cat-skill");
    row.appendChild(el("span", "cat-skill-i", s[0]));
    row.appendChild(el("span", "cat-skill-name", s[1]));
    row.appendChild(el("span", "cat-skill-tag", s[2]));
    skillList.appendChild(row);
  });

  const cmd = `npx skills add Heet-P/skills --skill ${c.id} && claude --skill ${c.id} 'review my changes'`;
  const copyBtn = el("button", "copy-btn");
  const lbl = el("span", "lbl", "Copy install + invoke command");
  copyBtn.appendChild(el("span", "ic", "⌘"));
  copyBtn.appendChild(lbl);
  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(cmd);
      copyBtn.classList.add("copied");
      lbl.textContent = "Copied to clipboard";
      setTimeout(() => {
        copyBtn.classList.remove("copied");
        lbl.textContent = "Copy install + invoke command";
      }, 1800);
    } catch (e) {
      lbl.textContent = "Press ⌘+C to copy";
    }
  });

  detailEl.replaceChildren(top, makeTitleEl(c), el("p", "cat-d-desc", c.desc), skillList, copyBtn);
}

renderList();
renderDetail();

// Theme toggle
document.getElementById('theme-toggle').addEventListener('click', function () {
  var next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  localStorage.setItem('theme', next);
});
