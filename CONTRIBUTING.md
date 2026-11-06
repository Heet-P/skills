# Contributing

Thanks for wanting to help. This repo is a handful of Markdown skills plus a static site, so contributing is mostly writing.

## What's most useful

- **A fix from a real build.** You used `/scrollfx`, `/web3d` or `/demovideo`, the agent got something wrong, and you know the rule that would have prevented it. That rule belongs in the skill.
- **A new recipe or command** for an existing skill, e.g. a scroll effect or a 3D technique you've shipped.
- **A showcase entry.** You built something with these skills? Open an issue with a link and a line about what you made.
- **Bug reports** for the site or for an install that didn't work.

## Rules for skill changes

1. **Every rule should come from something that actually happened.** Say in the PR where you hit it (a project, a bug, a commit). No speculative advice.
2. **Keep skills prompt-only.** They tell the agent what to build; they don't call APIs or ship code dependencies.
3. **Keep commands short and literal.** `/web3d glow` is good, `/web3d enhance-visual-experience` is not.
4. **Don't change the frontmatter `name`.** It's the install id (`npx skills add Heet-P/skills --skill <name>`) and must match the folder.

The three credited skills in `skills/` (`design-taste-frontend`, `emil-design-eng`, `impeccable`) belong to their authors. Send changes to their original repos instead.

## Checking your change

```bash
node scripts/check.mjs
```

It validates skill frontmatter, local links and anchors in `index.html` and `README.md`, and JS syntax. CI runs the same script on every PR.

To preview the site, run `python -m http.server` in the repo root and open http://localhost:8000. There's no build step.

To try a skill change in a real project:

```bash
npx skills add /path/to/your/clone --skill web3d
```

## Pull requests

- One topic per PR. Small is fine.
- Describe what changed and where the lesson came from.
- `demos/` is built output (static exports of two 3D sites). Don't edit it by hand.

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).
