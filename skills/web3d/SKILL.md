---
name: web3d
description: Build 3D websites with three.js or React Three Fiber in Next.js/React. Use when the user wants a 3D hero or landing scene, a camera that flies through the scene as you scroll, glowing/bloom effects, labels pinned to 3D objects, clickable 3D objects, procedural scenes without model files, or when an existing 3D page is slow, crashes on mobile, leaks memory, or breaks server rendering.
argument-hint: "[scene | camera | glow | labels | pick | perf | audit] [target]"
user-invocable: true
---

# Web3D

3D websites with **three.js / React Three Fiber**, taken from two 3D landing pages I built with AI agents:
a solar-energy story (R3F, scroll-driven, postprocessing) and a semiconductor-fab scene (plain three.js, clickable wafers).
Both were built entirely from code: no model files, no Blender.

## Commands

| Command | What it does |
|---|---|
| `/web3d scene [idea]` | Sets up a 3D scene the right way: client-only canvas, capped pixel ratio, lighting, cleanup. Builds the idea from code (primitives, instancing, canvas textures) |
| `/web3d camera` | A camera that flies between keyframes as the page scrolls, one stop per section |
| `/web3d glow` | Bloom, ambient occlusion, vignette: only the things you choose glow, not the sky |
| `/web3d labels` | HTML labels that stick to points in the 3D scene and stay readable to screen readers |
| `/web3d pick` | Click or hover 3D objects (raycasting), lift the picked one toward the camera, and send the result to React |
| `/web3d perf` | Makes it smooth on weak laptops and phones: adaptive quality, pause when hidden, instancing, full cleanup |
| `/web3d audit` | Reviews the existing 3D code against the checklist at the bottom and fixes what fails |
| `/web3d` (no command) | Asks what the scene should show, then plans which of the above it needs |

Whatever the command: read the project first (Next/Vite, React version, whether `three`, `@react-three/fiber`,
`@react-three/drei` and `@react-three/postprocessing` are installed), then follow the rules.

**R3F or plain three?** Use R3F when the scene is mostly declarative and React owns the page. Use a plain three.js
class (`new Scene(canvas)` with `goTo()`, `pick()`, `dispose()` methods) when the scene is one big imperative object
the page only sends commands to. Both work. Don't mix them in one scene.

## Rule 1: the canvas only exists in the browser

three.js touches `window` and WebGL. Never let it render on the server.

```tsx
// R3F, in Next.js: load the whole scene client-side, with a placeholder the same size
const Scene = dynamic(() => import("./Scene"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-gradient-to-b from-sky-200 to-amber-100" />,
});
```

```ts
// Plain three: import inside the effect and guard against unmounting before it loads
useEffect(() => {
  let disposed = false;
  import("./FabScene").then(({ FabScene }) => {
    if (disposed || !canvasRef.current) return;
    sceneRef.current = new FabScene(canvasRef.current, { onPick, onHover });
  });
  return () => { disposed = true; sceneRef.current?.dispose(); sceneRef.current = null; };
}, []);
```

## Rule 2: scroll and UI drive the scene through refs, never React state

Scrolling must never re-render React. Write the progress into a ref and read it inside the render loop.

```tsx
useLenis((lenis) => {                // or a plain scroll listener
  progressRef.current = lenis.progress || 0;
});
```

In R3F, `useFrame` mutates three.js objects directly. React 19's compiler lint flags that, so put this at the top of
scene files: `/* eslint-disable react-hooks/immutability -- R3F animates by mutating three.js objects in useFrame */`.

## Rule 3: build from code, reuse everything

- **Instancing**: anything repeated (panels, trees, pylons, keys, needles) is one `InstancedMesh`, not 500 meshes.
- **Merge** static parts with `mergeGeometries` (e.g. a lattice tower from 40 beams becomes 1 draw call).
- **Canvas textures** for screens, signs, facades and dashboards: draw on a 2D canvas, then `new CanvasTexture(c)`.
  Set `colorSpace = SRGBColorSpace` and `anisotropy = 8`.
- **Patch, don't rewrite** materials: `onBeforeCompile` on `MeshStandardMaterial` adds wind sway to grass or noise
  colour to the ground while keeping lights and shadows. Set `customProgramCacheKey` when patched variants differ.
- Any custom `ShaderMaterial` ends with `#include <tonemapping_fragment>` and `#include <colorspace_fragment>`,
  or it won't match the rest of the scene.
- Use a seeded random number generator for layouts so the scene looks the same on every load.
- Allocate scratch `Vector3`s once (`useMemo` / class fields), never inside the loop.

## `camera`: fly between keyframes on scroll

One keyframe per page section. Ease toward the scroll target with a damp that doesn't depend on frame rate,
then interpolate between neighbouring keyframes:

```ts
useFrame((state, dt) => {
  scroll.current += (progress.current - scroll.current) * (1 - Math.exp(-dt * 4));
  const seg = Math.min(scroll.current * (KEYS.length - 1), KEYS.length - 1.0001);
  const i = Math.floor(seg), f = smoothstep(0, 1, seg - i);
  cam.position.lerpVectors(KEYS[i].pos, KEYS[i + 1].pos, f);
  look.lerpVectors(KEYS[i].target, KEYS[i + 1].target, f);
  cam.lookAt(look);
});
```

- Add a tiny "handheld" drift (small sine on position) so a still camera doesn't look frozen.
- Use **two clocks** if the story needs it: *scroll* for the camera and *story time* (a piecewise map of scroll)
  for the sun, particles and lights, so the story can pause while a section's content plays.
- Keep text on one side and frame the subject on the other: `camera.setViewOffset()` shifts it without moving the camera.
- On narrow screens use a wider field of view (`fov = aspect < 1 ? 48 : 32`) and centre the subject.

## `glow`: bloom only where you mean it

```tsx
<Canvas dpr={[1, 1.5]} gl={{ antialias: false }}>
  {/* ... */}
  <EffectComposer multisampling={0}>
    <N8AO halfRes quality="medium" aoRadius={1.8} intensity={2.4} />
    <Bloom mipmapBlur luminanceThreshold={1.5} intensity={0.9} />
    <SMAA />
    <Vignette offset={0.25} darkness={0.55} />
  </EffectComposer>
</Canvas>
```

Set the bloom threshold **above 1** and give only glowing things HDR colours (`new Color(0.35, 2.2, 4.2)`,
`toneMapped={false}`). The bright sky and white walls then never bloom. Turn antialias off when SMAA runs.

Lighting: start with `RoomEnvironment` through PMREM for instant lighting, then swap in an HDRI when it loads.
If shiny metal goes white under the HDRI, raise roughness (~0.26) and lower `envMapIntensity` (~0.3).
If you bake a sky into the environment, re-bake only when the sun has actually moved (e.g. > 0.6°).

## `labels`: HTML that follows 3D points

Real DOM text (headings, numbers) is sharper, accessible and translatable. Project the 3D point every frame
and write the transform directly:

```ts
p.set(obj.x, obj.top, obj.z).project(camera);
el.style.transform =
  `translate(${(p.x * 0.5 + 0.5) * size.width}px, ${(-p.y * 0.5 + 0.5) * size.height}px) translate(-50%, -100%)`;
```

Keep the label markup in a file that doesn't import three.js, so the text renders before the 3D bundle loads.
Update number text only when the value changes.

## `pick`: click and hover objects

- Raycast on `pointerup`. If the pointer moved more than ~6px it was a drag, not a click.
- To lift a picked object above everything, render clones with `depthTest: false` and `renderOrder` 100+.
  Don't move it through geometry.
- Send picks to React with callbacks (`onPick`, `onHover`). React sends commands back with methods
  (`goTo(i)`, `release()`). To drive the scene from anywhere (a demo autoplay, a keyboard shortcut),
  dispatch `window` CustomEvents (`scene:goto`, `scene:pick`) and listen in one place.
- When a pick triggers async work, ignore stale responses: check the picked object is still the same before applying.
- Escape releases the pick. Keyboard users get the same actions as the mouse.

## `perf`: smooth on a weak laptop

- `dpr={[1, 1.5]}` (R3F) or `setPixelRatio(Math.min(devicePixelRatio, 1.75))`. Never full DPR on a phone.
- **Adaptive quality**: average frame time over frames 30–90. If it's slower than 1/45s, drop DPR to 1, turn shadows
  off and set `material.needsUpdate = true` on every material.
- **Pause** when nobody's looking: skip the loop while `document.hidden`, and stop when the canvas is scrolled offscreen
  (`IntersectionObserver`; in R3F, switch `frameloop` to `"never"`).
- Clamp `dt` to 0.05 so particles don't teleport after a tab switch.
- Hide groups whose fade is below ~0.002 (`visible = false`) instead of drawing them at zero opacity.
- **Cleanup**: route every geometry, material and texture through an `own()` helper that adds it to a list,
  then `dispose()` everything plus `renderer.dispose()` on unmount. R3F disposes what it created; anything you made
  by hand (PMREM targets, canvas textures) you dispose yourself.
- Z-fighting (flickering where two surfaces overlap) gets worse while the camera drifts. Lift parts slightly off the
  surface or use `polygonOffset`.

## Ship checklist (`audit` checks every line)

- [ ] three.js never runs on the server (dynamic import / `ssr: false`) and the placeholder is the canvas' size
- [ ] Scroll and UI reach the scene through refs or events; scrolling triggers zero React re-renders
- [ ] Pixel ratio capped; adaptive quality fallback for slow GPUs
- [ ] Loop pauses when the tab is hidden and when the canvas is offscreen
- [ ] `prefers-reduced-motion: reduce` → no camera drift or autoplay; jump between stops instead of flying
- [ ] If WebGL fails to start, show a static image or poster instead of a blank box
- [ ] Repeated objects are instanced; static parts merged
- [ ] Everything created by hand is disposed on unmount
- [ ] Canvas is `aria-hidden`; the real content (headings, numbers, results) is in the DOM, with `aria-live` for changing results
- [ ] Tested on a phone: narrow-screen field of view, touch picking, no horizontal scroll
