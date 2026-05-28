const CATEGORIES = [
  {
    id: "security-audit",
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
    npxCommand: "npx skills add Heet-P/skills --skill security-audit"
  },
  {
    id: "scalability-architecture",
    name: "Scalability Architecture",
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
    npxCommand: "npx skills add Heet-P/skills --skill scalability-architecture"
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

// Fetch Live GitHub Stars
async function fetchGitHubStars() {
  try {
    const res = await fetch("https://api.github.com/repos/Heet-P/skills");
    if (!res.ok) return;
    const data = await res.json();
    const count = data.stargazers_count;
    if (count !== undefined) {
      const formatted = new Intl.NumberFormat('en-US').format(count);
      const navEl = document.getElementById("nav-star-count");
      if (navEl) navEl.textContent = `Star on GitHub ★ ${formatted}`;
      
      const heroEl = document.getElementById("hero-star-count");
      if (heroEl) {
        heroEl.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.74.4-1.25.73-1.54-2.56-.29-5.25-1.28-5.25-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11.05 11.05 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.11 3.04.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.26 5.68.41.35.78 1.05.78 2.11 0 1.53-.01 2.76-.01 3.13 0 .31.21.68.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" /></svg> ${formatted}`;
      }
    }
  } catch (e) {
    console.error("Could not fetch stars", e);
  }
}
fetchGitHubStars();
