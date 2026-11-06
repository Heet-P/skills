# Changelog

All notable changes to this repo. Versions follow [semver](https://semver.org): a new skill or command is a minor release; renaming or removing one is a major release, because it breaks `npx skills add --skill <name>`.

## [1.0.0] - 2026-11-06

The repo's focus changes from code-audit skills to building things: scroll sites, 3D sites and demo videos.

### Added
- **`scrollfx`**: GSAP ScrollTrigger + Lenis scroll sites. Commands: `smooth`, `reveal`, `marquee`, `grow`, `flip`, `dome`, `audit`.
- **`web3d`**: three.js / React Three Fiber websites built from code. Commands: `scene`, `camera`, `glow`, `labels`, `pick`, `perf`, `audit`.
- **`demovideo`**: hackathon launch films and app walkthroughs in Remotion. Commands: `launch`, `walkthrough`, `hook`, `music`, `render`.
- One-command install for all three: `npx skills add Heet-P/skills --skill scrollfx web3d demovideo`.
- Live, scrollable 3D demos on the site: SolarLeads and YieldGuard.
- Showcase of five hackathon videos made with `demovideo`.
- "Skills I use but didn't write" section crediting Emil Kowalski, pbakaus and Leonxlnx.
- MIT `LICENSE`, `CONTRIBUTING.md`, issue templates, and CI that checks skill frontmatter, links and JS.

### Removed
- `security-audit`, `scalability-architecture` and `legal-check`. Use an earlier commit if you still need them.

[1.0.0]: https://github.com/Heet-P/skills/releases/tag/v1.0.0
