// Repo checks, run by CI and locally with `node scripts/check.mjs`. No dependencies.
// Catches the mistakes this repo can actually have:
//   1. a skill whose frontmatter `npx skills add` can't read (missing name/description,
//      or a name that doesn't match its folder, so `--skill <name>` wouldn't find it)
//   2. local links/images in index.html or README.md that point at missing files
//   3. #anchor links in index.html with no matching id
//   4. JavaScript syntax errors in js/
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const errors = [];
const fail = (msg) => errors.push(msg);

// 1. Skills
for (const dir of readdirSync("skills")) {
  if (!statSync(join("skills", dir)).isDirectory()) continue;
  const file = join("skills", dir, "SKILL.md");
  if (!existsSync(file)) { fail(`${dir}: missing SKILL.md`); continue; }
  const text = readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  const fm = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!fm) { fail(`${file}: no frontmatter block at the top`); continue; }
  const name = fm[1].match(/^name:\s*(.+)$/m)?.[1].trim();
  const desc = fm[1].match(/^description:\s*(.*)$/m)?.[1].trim();
  if (name !== dir) fail(`${file}: name is "${name}", must match folder "${dir}"`);
  if (!desc) fail(`${file}: description is empty`);
}

// On the site a folder link needs an index.html (how the demos are served);
// in the README any folder is fine, since GitHub shows folder listings.
const isLocal = (u) => u && !/^(https?:|mailto:|data:|#|\/\/)/.test(u);
const exists = (p, folderOk = false) =>
  existsSync(p) && (statSync(p).isFile() || folderOk || existsSync(join(p, "index.html")));
const clean = (u) => decodeURIComponent(u.split(/[?#]/)[0]);

// 2 + 3. Site
const html = readFileSync("index.html", "utf8");
for (const [, url] of html.matchAll(/\s(?:href|src|poster)="([^"]+)"/g)) {
  if (isLocal(url) && !exists(clean(url))) fail(`index.html: ${url} does not exist`);
}
const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
for (const [, id] of html.matchAll(/\shref="#([^"]+)"/g)) {
  if (!ids.has(id)) fail(`index.html: #${id} has no matching id`);
}

// 2. README
const readme = readFileSync("README.md", "utf8");
for (const [, url] of readme.matchAll(/\]\(([^)\s]+)\)/g)) {
  if (isLocal(url) && !exists(clean(url), true)) fail(`README.md: ${url} does not exist`);
}

// 4. JavaScript syntax
for (const f of readdirSync("js").filter((f) => f.endsWith(".js"))) {
  try { execFileSync(process.execPath, ["--check", join("js", f)], { stdio: "pipe" }); }
  catch (e) { fail(`js/${f}: ${e.stderr.toString().split("\n").find((l) => /Error/.test(l))}`); }
}

if (errors.length) {
  console.error(`✗ ${errors.length} problem(s):\n  ` + errors.join("\n  "));
  process.exit(1);
}
console.log("✓ skills, links, anchors and JS all check out");
