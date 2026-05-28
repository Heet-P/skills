const CATEGORIES = [
  {
    id: "security-reviewer",
    name: "Security Audit",
    eyebrow: "Skill 01",
    titleText: "Think like an ",
    titleEm: "attacker",
    titleTail: " — not a developer.",
    desc: "A deep adversarial security audit engine. Asks the agent to map the full attack surface, simulate real exploits step-by-step, and produce a structured findings report.",
    skills: [
      ["S-01", "OWASP Top 10", "owasp"],
      ["S-02", "IDOR & Access Control", "authz"],
      ["S-03", "Payment Tampering", "pay"],
      ["S-04", "Rate Limiting Gaps", "sec"]
    ],
    npxCommand: "npx skills add Heet-P/skills --skill security-reviewer"
  },
  {
    id: "scale-check",
    name: "Scale Check",
    eyebrow: "Skill 02",
    titleText: "Find the thing that's ",
    titleEm: "fine on seed data",
    titleTail: " and fatal in prod.",
    desc: "A scalability and architecture audit engine. Maps the entire system, simulates traffic at each stage (100 concurrent → viral spike), and produces tiered recommendations.",
    skills: [
      ["SC-01", "Connection Pooling", "db"],
      ["SC-02", "Missing Indexes", "db"],
      ["SC-03", "Traffic Simulation", "scale"],
      ["SC-04", "Tiered Recommendations", "scale"]
    ],
    npxCommand: "npx skills add Heet-P/skills --skill scale-check"
  },
  {
    id: "legal-check",
    name: "Legal Check",
    eyebrow: "Skill 03",
    titleText: "Catch the compliance ",
    titleEm: "gaps",
    titleTail: " that matter.",
    desc: "A legal, privacy, and compliance audit engine. Scans the codebase for compliance gaps: missing consent flows, unsigned webhooks, and GDPR/CCPA issues.",
    skills: [
      ["L-01", "GDPR / CCPA / PIPEDA", "privacy"],
      ["L-02", "Consent Flow Integrity", "privacy"],
      ["L-03", "Data Retention Policy", "legal"],
      ["L-04", "Cookie & AI Disclosures", "legal"]
    ],
    npxCommand: "npx skills add Heet-P/skills --skill legal-check"
  },
  {
    id: "design-taste-frontend",
    name: "Design Taste",
    eyebrow: "Skill 04",
    titleText: "Ship interfaces that ",
    titleEm: "don't look",
    titleTail: " templated.",
    desc: "An anti-slop frontend skill for landing pages. Covers typography discipline, color calibration, layout rules, and real asset generation.",
    skills: [
      ["D-01", "Typography Discipline", "design"],
      ["D-02", "Color Calibration", "design"],
      ["D-03", "Layout & Anti-Center Bias", "design"],
      ["D-04", "Scroll Reveal Skeletons", "ux"]
    ],
    npxCommand: "npx skills add https://github.com/Leonxlnx/taste-skill --skill \"design-taste-frontend\""
  },
  {
    id: "emil-design-eng",
    name: "Emil Design",
    eyebrow: "Skill 05",
    titleText: "The invisible ",
    titleEm: "details",
    titleTail: " that make software feel great.",
    desc: "UI polish and animation philosophy, based on Emil Kowalski's design engineering work. Covers spring animations, clip-path patterns, and performance rules.",
    skills: [
      ["E-01", "Animation Philosophy", "anim"],
      ["E-02", "Spring & Clip-Path Patterns", "anim"],
      ["E-03", "Gesture Interactions", "ux"],
      ["E-04", "Accessibility (Reduced Motion)", "a11y"]
    ],
    npxCommand: "npx skills add emilkowalski/skill"
  },
  {
    id: "impeccable",
    name: "Impeccable",
    eyebrow: "Skill 06",
    titleText: "A full-featured ",
    titleEm: "design system",
    titleTail: " with 20+ commands.",
    desc: "The most structured design skill. Features context loading, brand vs. product registers, and a rich command menu covering the full design workflow.",
    skills: [
      ["I-01", "Craft & Shape (Build)", "sys"],
      ["I-02", "Critique & Audit (Evaluate)", "sys"],
      ["I-03", "Polish & Harden (Refine)", "sys"],
      ["I-04", "Animate & Overdrive (Enhance)", "sys"]
    ],
    npxCommand: "npx skills add pbakaus/impeccable"
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

  const cmd = `${c.npxCommand} && claude --skill ${c.id} 'review my changes'`;
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
