---
name: scrollfx
description: Scroll-driven website effects with GSAP ScrollTrigger and Lenis in React/Next.js. Use when the user wants smooth scrolling, scroll-scrubbed animations, word-by-word text reveals, horizontal marquees that move with scroll, hero images that grow into place, 3D flip tiles, a draggable 3D image dome, or when existing GSAP/Lenis code is janky, leaks between pages, or breaks on mobile.
argument-hint: "[smooth | reveal | marquee | grow | flip | dome | audit] [target]"
user-invocable: true
---

# ScrollFX

Scroll-driven sites with **GSAP + ScrollTrigger + Lenis**. Each pattern comes from a hackathon event site
I built with an AI agent, including the bugs it already ran into and fixed.

## Commands

| Command | What it does |
|---|---|
| `/scrollfx smooth` | Adds smooth scroll to the whole site: one Lenis instance synced to ScrollTrigger, mounted in the root layout |
| `/scrollfx reveal [section]` | Text that fills in word by word as you scroll |
| `/scrollfx marquee [section]` | Image rows that slide sideways as you scroll down, optionally in opposite directions |
| `/scrollfx grow [image]` | A hero image that scales up and lands on a target spot as you scroll |
| `/scrollfx flip [grid]` | Tiles that do a 3D flip on hover |
| `/scrollfx dome [images]` | Images on a 3D sphere you can drag and spin, with inertia (CSS only, no WebGL) |
| `/scrollfx audit` | Reviews the existing scroll code against the rules and checklist below and fixes what fails |
| `/scrollfx` (no command) | Asks what the page should do, then suggests 2–3 of the above that fit |

Whatever the command: read the project first (framework, React version, whether `gsap`, `@gsap/react` and `lenis`
are installed, where the root layout is), install what's missing, then follow the rules.

## Before writing anything

1. Use `gsap`, `@gsap/react` and `lenis` (not the old `@studio-freight/lenis`).
   All GSAP plugins (ScrollTrigger, SplitText, MorphSVG) are free and ship inside `gsap`.
2. Decide per section: **scrubbed** (the animation follows the scrollbar, `scrub: true | number`)
   or **triggered** (it plays once when reached, `toggleActions`). Don't mix the two on one element.
3. Animate only `transform` (x, y, xPercent, scale, rotation) and `opacity`. Animating `color` word by word is fine.
   Never animate `width`, `height`, `top` or `left` on scroll.

## Rule 1: one Lenis instance, driven by the GSAP ticker (`smooth`)

Mount it once in the root layout, never per page.

```tsx
"use client";
import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger); // fine at module level inside a "use client" file

export default function SmoothScroll({ disabled = false }: { disabled?: boolean }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Respect the OS setting: no smooth-scroll hijack at all.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const mobile = window.matchMedia("(max-width: 768px)").matches;
    const lenis = new Lenis({
      lerp: mobile ? 0.05 : 0.1, // lower = floatier; mobile feels better slower
      smoothWheel: true,
      syncTouch: true,           // current names. `smooth` / `smoothTouch` are dead options and silently do nothing
    });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);             // keep triggers in sync with Lenis' virtual scroll
    const raf = (time: number) => lenis.raf(time * 1000); // GSAP gives seconds, Lenis wants ms
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);                          // otherwise GSAP "catches up" after a tab switch and jumps

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  // Pause scroll while a loader or modal is open instead of unmounting Lenis.
  useEffect(() => {
    if (disabled) lenisRef.current?.stop();
    else lenisRef.current?.start();
  }, [disabled]);

  return null;
}
```

Never add a second `requestAnimationFrame` loop for Lenis. Two clocks means stutter.

## Rule 2: every animation lives inside `useGSAP` with a scope

`useGSAP` reverts every tween and ScrollTrigger it created when the component unmounts. A raw `useEffect` leaks
triggers across route changes, and the next page then scrolls wrong. Selectors are limited to `scope`, so `.word`
in one section never grabs `.word` in another.

```tsx
const container = useRef<HTMLElement>(null);

useGSAP(() => {
  gsap.fromTo(".word", { color: "#d4d4d4" }, {
    color: "#0a0a0a",
    stagger: 0.1,
    scrollTrigger: { trigger: container.current, start: "top bottom", end: "center center", scrub: true },
  });
}, { scope: container });
```

Hover and click handlers that start tweens must be wrapped in `contextSafe` so they get cleaned up too:

```tsx
const { contextSafe } = useGSAP({ scope: containerRef });
const onEnter = contextSafe(() => {
  if (gsap.isTweening(flipper.current)) return; // ignore re-hover mid-flip
  gsap.to(flipper.current, {
    rotationX: "+=360", duration: 1.2, ease: "back.out(2)", force3D: true,
    onComplete: () => gsap.set(flipper.current, { rotationX: 0 }), // reset so the next flip starts at 0
  });
});
```

## Rule 3: split desktop / mobile / reduced motion with `gsap.matchMedia`

`matchMedia` builds and **tears down** animations when a breakpoint flips (phone rotated, window resized).
Use it instead of `if (window.innerWidth > 768)`.

```tsx
const mm = gsap.matchMedia();
mm.add({
  desktop: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
  mobile: "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
  reduce: "(prefers-reduced-motion: reduce)",
}, (ctx) => {
  const { desktop, reduce } = ctx.conditions!;
  if (reduce) { gsap.set(".word", { color: "#0a0a0a" }); return; } // show the end state, no motion
  gsap.fromTo(marquee.current, { xPercent: -25 }, {
    xPercent: desktop ? centerPercent() : 0,
    ease: "none", force3D: true,
    scrollTrigger: { trigger: container.current, start: "top bottom", end: desktop ? "85% center" : "bottom top",
                     scrub: 0.5, fastScrollEnd: true },
  });
});
```

## Recipes

| Command | Recipe |
|---|---|
| `reveal` | Split the text into `<span class="word inline-block">`. Scrub `color` (or `opacity`) with `stagger: 0.1`, `end: "center center"` |
| `marquee` | A wide flex row of images: `xPercent: 0 → -35`, `ease: "none"`, `scrub: 0.5`, `fastScrollEnd: true`, `force3D: true`. Two rows moving in opposite directions read as depth. To stop with a chosen image centred, compute `xPercent` from `item.offsetLeft + item.offsetWidth / 2` against `innerWidth / 2`, divided by `scrollWidth`, and pass it as a **function** so it recomputes |
| `grow` | `y: () => targetY()`, `scale: 2.5`, `scrub: 1`, `invalidateOnRefresh: true` so positions recompute after a resize. For a background colour change mid-scroll, switch in `onUpdate` at `progress >= 0.55` and switch back at `< 0.5`. The gap stops flicker at the boundary. Fire a `CustomEvent` so the navbar can follow |
| `flip` | Parent `perspective: 1000px`; inner `transform-style: preserve-3d`; faces `backface-visibility: hidden`. Hover → `rotationX: "+=360"` through `contextSafe` (Rule 2) |
| `dome` | See below |

### `dome`: images on a sphere, drag with inertia

No WebGL needed. Place each tile with `rotateY(θ) rotateX(φ) translateZ(var(--radius))`, then rotate the sphere:

```js
sphere.style.transform =
  `translateZ(calc(var(--radius) * -1)) rotateX(${x}deg) rotateY(${y}deg)`;
```

- Drag with `@use-gesture/react` and write the transform **straight to the DOM**. React state at 60fps re-renders everything.
- Inertia: on release, multiply the velocity by a friction factor each frame (`~0.94–0.995`). Stop below a threshold
  **or** after a maximum number of frames, and always `cancelAnimationFrame` before starting a new spin.
- Clamp the vertical angle so the dome never flips upside down; let the horizontal angle wrap.
- Set `--radius` from a `ResizeObserver` on the container, not `window.onresize`.

## Ship checklist (`audit` checks every line)

- [ ] One Lenis instance, ticker-driven, `lagSmoothing(0)`, destroyed on unmount
- [ ] Every animation is inside `useGSAP({ scope })`; every handler uses `contextSafe`
- [ ] `gsap.matchMedia` covers desktop, mobile **and** `prefers-reduced-motion: reduce` (show the final state)
- [ ] Positions that depend on layout are functions, with `invalidateOnRefresh: true`
- [ ] `ScrollTrigger.refresh()` runs once after images and fonts load (late images shift every trigger)
- [ ] Only transform and opacity move; `will-change: transform` only on elements that are actually animating
- [ ] Scrubbed sections have real height (e.g. `min-h-[200vh]`), or `end` lands before the animation finishes
- [ ] No `markers: true` left in
- [ ] Tested on a real phone. The iOS address bar fires `resize`, so set `ScrollTrigger.config({ ignoreMobileResize: true })`
