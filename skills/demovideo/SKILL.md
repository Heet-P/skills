---
name: demovideo
description: Make hackathon and product demo videos in code with Remotion. Use when the user wants a launch video, promo, trailer, product walkthrough, pitch video, or submission video for their app; kinetic typography; screen recordings of their real app with captions and zooms; or background music and sound effects timed to the cuts.
argument-hint: "[launch | walkthrough | hook | music | render] [notes]"
user-invocable: true
---

# DemoVideo

Hackathon and launch videos made **entirely in code with Remotion**, driven by prompts to an AI agent.
Taken from the videos I made for my own hackathon projects: walkthroughs of the real app with narration, and
50-second launch films with beat-synced cuts.

## Commands

| Command | What it does |
|---|---|
| `/demovideo launch` | A 45–65s launch film: kinetic type, the app's real UI components, cuts on the beat, logo close |
| `/demovideo walkthrough` | A 2–5 min walkthrough: records the real app with Playwright, adds narration, captions, zooms and a music bed |
| `/demovideo hook` | Just the first 10 seconds: rapid slam-cuts that state the problem |
| `/demovideo music` | Generates the soundtrack and sound effects in code, timed to the same cue sheet as the picture (no samples, no licences) |
| `/demovideo render` | Renders 1080p + 4K, normalises loudness, checks the output |
| `/demovideo` (no command) | Reads the project, asks what the video is for (submission, launch, pitch) and how long it can be, then proposes a scene list |

Before writing anything: read the project's README, landing page and main screens to find **the one sentence the
video sells**, and pull the real brand colours, fonts and components. The video should look like the app.

## Setup in the app's own repo

Put Remotion **inside** the app (a `remotion/` folder) so the video can use the real components and design tokens:

- `remotion.config.ts`: enable Tailwind, add the same `@` path alias, `setPublicDir("remotion/public")`.
- `remotion/style.css` imports the app's `globals.css`.
- Load fonts with `@remotion/google-fonts` (`loadFont()`), not a CSS `@import`, which can be missing at render time.
  Map them onto the same CSS variables the app uses, so `font-sans` means the same thing in both.
  Load script fonts for any non-Latin text you show (e.g. Hind Vadodara for Gujarati, Mukta for Devanagari).
- Every animation is driven by `useCurrentFrame()`. No CSS transitions, no `setTimeout`.
- Scripts in `package.json`: `video` (studio), `video:render`, `video:music`, and `video:walkthrough` if needed.

## Story shapes

**Launch film (~52s):** hook → pain → solution → features (each with real UI) → proof (stats, a counter) → logo close.

| Scene | Length | What's on screen |
|---|---|---|
| intro | 4s | Logo springs in, "Say hello to X." word by word, the tile zooms through into the next scene |
| problem | 6s | The mess today (e.g. six scattered chat bubbles pop in on the beat) collapsing into one clean thing |
| feature × 3 | 8–10s each | The real component, tilted and blurred into focus, with one short line of text |
| proof | 8s | Stat tiles, one number counting to its target |
| close | 8s | Three short slogan lines blur into the logotype + "Built with ..." |

**Walkthrough (2–5 min):** one real task from start to finish, told like a founder showing a friend.
Split it into numbered chapters, one per user role or step (e.g. customer → support → technician → done).

**Hook only (10s):** six 40-frame cuts. Huge italic uppercase lines slam in over changing background colours,
with a "01 / 06" counter. The last line turns the problem around ("THIS ENDS NOW.").

## One clock for picture and sound (`launch`, `music`)

Put timing in `remotion/timeline.ts` and import it everywhere, so music, sound effects and cuts can't drift apart:

```ts
export const FPS = 30, BEAT = 15, BAR = 4 * BEAT;   // 120 BPM
export const SCENE_BARS = { intro: 2, problem: 3, feature1: 5, feature2: 4, feature3: 4, proof: 4, close: 4 };
export const T = BEAT;                              // every transition lasts one beat
// START[scene] = running sum of SCENE_BARS * BAR
export const CUE = { problem: { bubbles: [0, 15, 30, 45, 60, 75], collapse: 120 } }; // scene-relative frames
```

Use `TransitionSeries`, and make every scene one transition longer so the next one starts **exactly on its bar line**:

```tsx
<TransitionSeries.Sequence durationInFrames={SCENE_BARS[k] * BAR + (i < last ? T : 0)}>
```

Don't animate text during a transition. Start each scene's lines after the cut.

## Motion kit

Write these once in `remotion/kit.tsx` and reuse them in every scene:

- `easeOut = Easing.bezier(0.23, 1, 0.32, 1)`. Use the app's own ease curve if it has one.
- `useEnter(delay)` = `spring({ frame: frame - delay, fps, config: { damping: 200 } })`. Use bouncier
  `{ damping: 14, stiffness: 120 }` for logos only.
- **Slam**: `spring({ config: { damping: 12, stiffness: 380, mass: 0.4 }, from: 1.22, to: 1 })` plus a white flash
  for frames 0–4. Add a small zoom (1 → 1.06) in the last 8 frames before a cut.
- **Words**: each word rises 0.4em out of a 10px blur, staggered 4 frames.
- **Typed**: slice text by grapheme (`Intl.Segmenter`) so non-Latin scripts never break mid-character, and draw a caret.
- **Zoom-blur transition**: the outgoing scene scales up 14% and blurs to 18px while the incoming one goes from 0.92 to 1
  and sharpens. It reads as one continuous move, not a crossfade.
- **Device frames**: a CSS phone (nested radii, notch, status bar) and a browser window (traffic-light dots),
  so the real UI sits in context.
- **Font size that fills the width**: `size ≈ 1720 / (chars × 0.68)` for 1920px. Put the maths in a comment.
- A huge faded copy of the word behind it at ~7% opacity, so a frame never looks empty.
- A `<Stage dark>` wrapper that flips `colorScheme`, so every `light-dark()` token switches with the scene.

## `walkthrough`: record the real app

The order matters: **script → voice → reset data → record → edit → render.**

1. **Script**: `scripts/demo/script.ts` is a list of takes, each a list of beats `{ id, say, action }`.
   Short, plain sentences.
2. **Voice**: one audio file per beat, from whatever text-to-speech the user already has, or recorded by the user.
   Save the real duration of each file to `durations.json`. With no voice yet, estimate `words / 2.7` seconds,
   but expect to re-record once the voice exists.
3. **Reset**: a `demo:reset` script that seeds clean demo data and fixes user settings (language, theme), so leftover
   test data never shows up.
4. **Record** with Playwright, one take per scene:
   - Launch the installed Chrome (`channel: "chrome"`). Sign in through a dev-only route.
   - Device presets: desktop 1440×900 at DPR 1.5; phone 402×874 at DPR 2.5 with touch.
   - Capture with the CDP screencast (`Page.startScreencast`, jpeg quality 92), not Playwright's built-in video.
     Its frames arrive at a variable rate, so rebuild the timing from their timestamps with ffmpeg's concat demuxer,
     then `fps=30`, `libx264 -crf 16`, and force even dimensions with `scale=trunc(iw/2)*2:trunc(ih/2)*2`.
   - `beat(id, action)`: run the action, then wait until that beat's narration has finished (+0.45s).
     Log a warning when an action runs longer than its line.
   - Make input look human: the pointer glides to its target (22-step ease-out), typing goes grapheme by grapheme
     with jittered speed, scrolling uses slow wheel steps. Inject a visible cursor (an arrow on desktop, a touch dot on
     phones) and hide dev badges.
   - Wait ~1.5s after page load before rolling (fonts and live connections settle). Scroll elements into view
     before clicking; on phones a floating tab bar can cover them.
   - Save `focus` boxes (the element's position as fractions of the viewport) and each beat's start time to `takes.json`.
5. **Edit** in Remotion:
   - Place the takes back to back; each beat's narration sits in a `<Sequence from={beat.t * FPS}>`.
   - **Camera lean**: spring-zoom toward the focus box, `scale = min(1.35, 0.7 / max(w, h))`, with
     `transform-origin` at the box centre.
   - **Captions**: one sentence at a time. Give each sentence a share of the beat's duration in proportion to its length.
   - A chapter pill, plus a small tag naming the feature on screen.
   - **Music bed** looped under the narration at ~0.14 volume, ducking to ~0.05 while someone speaks. Average the
     "is speaking" signal over ±10 frames so the dip ramps instead of clicking.
   - Use the screen recordings `muted`; place narration as separate audio.

## `music`: generate the soundtrack in code

`remotion/score.ts` synthesises the whole track in TypeScript and writes a WAV, then converts it to MP3 with ffmpeg:

- Instruments: pad, plucked arpeggio, sub bass, kick with sidechain duck, hats, claps, a simple reverb.
- Sound effects (whoosh, pop, tick, click, ding, impact, riser) placed from the **same `CUE` sheet** the picture uses.
- Sections follow the scenes (e.g. `groove` / `dark` / `tense` ranges keyed off `START[scene]`).
- Seed the noise generator so every render sounds identical. Soft-clip with `tanh` and normalise to about -1 dBFS.
- Loop the bed in a walkthrough with `trimAfter` so the launch film's fade-out tail doesn't loop.

## `render`

- Launch film: `remotion render LaunchVideo out/launch-1080p.mp4`, then the same with `--scale=2` for 4K.
- Walkthrough: render raw, then normalise for YouTube/judges at -14 LUFS:
  `ffmpeg -i raw.mp4 -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:a aac -b:a 192k out/walkthrough.mp4`
- Gitignore `out/`, raw takes and generated voice files. Commit `takes.json` and the final music file.
- Before calling it done: watch it once start to finish. Check that no text is cut off at 1080p, the captions match
  the voice, nothing animates during a cut, and the final frame holds for at least 2 seconds with the URL or call to action.
