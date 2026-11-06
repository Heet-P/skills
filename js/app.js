// My own skills. Each `commands` row is [slash command, what it does, tag].
const CATEGORIES = [
  {
    id: "scrollfx",
    name: "ScrollFX",
    eyebrow: "Skill 01 · scroll",
    titleText: "Scroll-driven sites that ",
    titleEm: "don't stutter",
    titleTail: ".",
    desc: "GSAP ScrollTrigger + Lenis smooth scroll for React/Next. Word reveals, scroll marquees, growing hero images, flip tiles and a draggable 3D dome. Every effect is cleaned up on unmount, split for mobile, and respects reduced motion.",
    commands: [
      ["/scrollfx smooth", "Smooth scroll for the whole site", "setup"],
      ["/scrollfx reveal", "Text fills in word by word", "text"],
      ["/scrollfx marquee", "Image rows slide as you scroll", "motion"],
      ["/scrollfx dome", "Drag-to-spin 3D image sphere", "3d"],
      ["/scrollfx audit", "Find and fix janky scroll code", "fix"]
    ],
    npxCommand: "npx skills add Heet-P/skills --skill scrollfx"
  },
  {
    id: "web3d",
    name: "Web3D",
    eyebrow: "Skill 02 · 3d",
    titleText: "3D websites built ",
    titleEm: "entirely from code",
    titleTail: ".",
    desc: "three.js / React Three Fiber scenes with no model files: a camera that flies through the page as you scroll, bloom only where you want it, clickable objects, labels pinned to 3D points, and quality that adapts to slow laptops.",
    commands: [
      ["/web3d scene", "Set up a fast, client-only 3D scene", "setup"],
      ["/web3d camera", "Camera flies between sections on scroll", "motion"],
      ["/web3d glow", "Bloom + AO that only hits what you choose", "look"],
      ["/web3d pick", "Click and hover 3D objects", "ui"],
      ["/web3d perf", "Smooth on weak GPUs and phones", "fix"]
    ],
    npxCommand: "npx skills add Heet-P/skills --skill web3d"
  },
  {
    id: "demovideo",
    name: "DemoVideo",
    eyebrow: "Skill 03 · video",
    titleText: "Hackathon videos ",
    titleEm: "made in code",
    titleTail: ", not an editor.",
    desc: "Remotion launch films and app walkthroughs. Cuts land on the beat, the soundtrack is generated in code, and the real app is recorded with Playwright and timed to the narration, with captions and camera zooms.",
    commands: [
      ["/demovideo launch", "45–65s launch film on the beat", "film"],
      ["/demovideo walkthrough", "Record the real app + narration", "demo"],
      ["/demovideo hook", "A 10-second slam-cut opener", "film"],
      ["/demovideo music", "Soundtrack + SFX synced to cuts", "audio"],
      ["/demovideo render", "1080p + 4K, loudness normalised", "ship"]
    ],
    npxCommand: "npx skills add Heet-P/skills --skill demovideo"
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

  const cmdList = el("div", "cat-skill-list");
  c.commands.forEach(s => {
    const row = el("div", "cat-skill");
    row.appendChild(el("code", "cat-skill-i", s[0]));
    row.appendChild(el("span", "cat-skill-name", s[1]));
    row.appendChild(el("span", "cat-skill-tag", s[2]));
    cmdList.appendChild(row);
  });

  const copyBtn = el("button", "copy-btn");
  const lbl = el("span", "lbl", c.npxCommand);
  copyBtn.appendChild(el("span", "ic", "$"));
  copyBtn.appendChild(lbl);
  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(c.npxCommand);
      copyBtn.classList.add("copied");
      lbl.textContent = "Copied to clipboard";
      setTimeout(() => {
        copyBtn.classList.remove("copied");
        lbl.textContent = c.npxCommand;
      }, 1800);
    } catch (e) {
      lbl.textContent = "Press Ctrl/⌘+C to copy";
    }
  });

  detailEl.replaceChildren(top, makeTitleEl(c), el("p", "cat-d-desc", c.desc), cmdList, copyBtn);
}

renderList();
renderDetail();

// Hovering a poster for this long counts as intent: start loading before the click.
const INTENT_MS = 400;
const isNarrow = () => window.matchMedia("(max-width: 900px)").matches;

// Run `fn` once the pointer (or keyboard focus) has rested on `el` for INTENT_MS.
function onIntent(el, fn) {
  let timer;
  const start = () => { timer = setTimeout(fn, INTENT_MS); };
  const cancel = () => clearTimeout(timer);
  el.addEventListener("pointerenter", start);
  el.addEventListener("pointerleave", cancel);
  el.addEventListener("focus", start);
  el.addEventListener("blur", cancel);
}

// YouTube facade: the thumbnail is a plain link (works without JS);
// clicking swaps in the player so YouTube's ~1MB of scripts only loads on demand.
// On hover we only warm up the connections. A hidden player would start autoplaying.
let ytWarmed = false;
function warmYouTube() {
  if (ytWarmed) return;
  ytWarmed = true;
  ["https://www.youtube-nocookie.com", "https://www.youtube.com", "https://i.ytimg.com"].forEach(href => {
    const l = document.createElement("link");
    l.rel = "preconnect";
    l.href = href;
    l.crossOrigin = "";
    document.head.appendChild(l);
  });
}

document.querySelectorAll("a.yt").forEach(a => {
  onIntent(a, warmYouTube);
  a.addEventListener("click", e => {
    e.preventDefault();
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube-nocookie.com/embed/${a.dataset.id}?autoplay=1`;
    iframe.title = a.getAttribute("aria-label");
    iframe.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    a.replaceWith(iframe);
  });
});

// Live 3D demos. The iframe loads *under* the poster: after INTENT_MS of hover,
// or on click. A click just reveals it, instantly if the hover already loaded it.
// ponytail: a preloaded demo keeps rendering under its poster if the user never clicks.
// Fine for two demos; pause them via postMessage if more get added.
function demoFrame(box) {
  let f = box.querySelector("iframe");
  if (f) return f;
  const a = box.querySelector("a.live");
  f = document.createElement("iframe");
  f.src = a.getAttribute("href");
  f.title = a.dataset.title;
  f.className = "live-frame";
  f.allow = "fullscreen";
  f.addEventListener("load", () => {
    box.classList.add("is-loaded");
    if (box.classList.contains("is-open")) f.focus();
  }, { once: true });
  box.appendChild(f);
  return f;
}

function openDemo(box) {
  const f = demoFrame(box);
  box.classList.add("is-open");
  if (box.classList.contains("is-loaded")) f.focus();
}

document.querySelectorAll(".live-box").forEach(box => {
  const poster = box.querySelector("a.live");
  onIntent(poster, () => { if (!isNarrow()) demoFrame(box); });
  poster.addEventListener("click", e => {
    if (isNarrow()) return; // phones: the link opens the demo on its own page
    e.preventDefault();
    openDemo(box);
  });
});

// "Full screen": put the demo frame itself into fullscreen. Where the Fullscreen API
// isn't available (iPhone Safari) the link falls back to opening the demo page.
document.querySelectorAll("a.fs").forEach(link => {
  link.addEventListener("click", e => {
    const box = link.closest(".show").querySelector(".live-box");
    if (!box || !document.fullscreenEnabled) return;
    e.preventDefault();
    openDemo(box);
    demoFrame(box).requestFullscreen().catch(() => window.open(link.href, "_blank", "noopener"));
  });
});

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
