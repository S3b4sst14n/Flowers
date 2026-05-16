# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A cinematic, romantic landing-page prototype: an animated CSS bouquet (three flowers blooming over growing grass) layered over a starfield, drifting fireflies, a glowing moon, a vignette, a fade-in title block, a click-to-open letter modal, and a playful "prank" button (top-right) that opens a "¿Te gusta bañarte?" modal where the "Sí" button flees from the cursor. Made as a gift. No build system, no package manager, no dependencies beyond Google Fonts (loaded via `<link>`).

## Files

- [index.html](index.html) — markup. Loads Google Fonts (Cormorant Garamond + Inter), [style.css](style.css), and [script.js](script.js).
- [style.css](style.css) — large stylesheet. Top ~1800 lines are the original flower animation (unchanged). Bottom (~500 lines, marked with the comment `TEMA ROMÁNTICO PREMIUM`) adds the cinematic layer + prank modal.
- [script.js](script.js) — all interactive behavior: stars/fireflies canvases, parallax, loader, letter modal, click sparkles, prank modal.

## Running / previewing

Open [index.html](index.html) directly in a browser. No server, install, or build step is needed. There is no lint or test command — visual inspection in the browser is the only verification path.

## Where to customize (most common edits)

All personalization lives in the **`CONFIG` object** at the top of [script.js](script.js):
- `CONFIG.nombre` — the dedication text shown after "Para " in the title.
- `CONFIG.veredictosNo` — array of messages picked at random when "No" is clicked in the prank modal.

The **letter text** is *not* in `CONFIG`. It is the static `<div class="letter__body">` block inside [index.html](index.html) (look for the `✏️ Edita el texto de la carta` comment).

## Architecture notes worth knowing before editing

- **Animation gating with `.not-loaded` + `.is-loading`**: `<body>` starts with both classes. `.is-loading` keeps the full-screen `#loader` visible. `.not-loaded` pauses every descendant animation (`animation-play-state: paused !important` on `.not-loaded *`). The loader in [script.js](script.js) waits for `window.load` AND a 1.8 s minimum, then removes `.is-loading` (fades out loader), then 200 ms later removes `.not-loaded` (all bloom animations start in sync). Don't bypass this — it's what makes the entrance cinematic.
- **Z-index stack** (low → high): `stars canvas` (0) → `night` (1) → `moon-glow` (2) → `fireflies canvas` (4) → `flowers` (5) → `vignette` (6) → `poem` (10) → `prank toggle` (200) → `letter modal` (1000) → `prank modal` (1100) → `fleeing yes button` (1200) → `loader` (9999).
- **Parallax via CSS variables**: any element with a `data-parallax="<factor>"` attribute is moved by the loop in `initParallax()` ([script.js](script.js)). The script sets `--px` / `--py` on the element; the element's CSS reads those vars in `transform: translate(var(--px), var(--py))`. To add a new parallax layer, add the attribute *and* read the vars in CSS — both are required.
- **Flowers stay BEM**: `flower`, `flower__leaf`, `flower__leaf--1`. The `--N` suffix is a per-instance modifier (typically driving `animation-delay`), not a state.
- **Romantic palette via filter, not rewriting gradients**: the original flowers were cyan/teal/yellow. Instead of editing every gradient, `.flowers` has `filter: hue-rotate(-42deg) saturate(0.85) ... drop-shadow(...)` which shifts everything toward warm pinks while preserving the original animation tuning. If you want bolder color changes, prefer adjusting this filter over editing the keyframes.
- **Sizing uses `vmin`** so the scene scales with the smaller viewport dimension. Stick to `vmin` (or `clamp()`) for layout; reserve `px` for hairlines and small UI like the prank toggle.
- **Reduce-motion is honored**: a `@media (prefers-reduced-motion: reduce)` block at the bottom of [style.css](style.css) collapses all animations to ~0 s. Don't add long transitions without a reduced-motion fallback.
- **Mobile breakpoints** at 720px and 420px scale `.flowers` down (so they fit the viewport) and tighten `.poem` typography. There's also a `(max-height: 480px) and (orientation: landscape)` rule for phones held sideways.

## Behavioral details that look like bugs but aren't

- **Letter opens on flower click *and* via the "Un mensaje para ti" button**. The flower click has a 220 ms delay so the sparkle effect is visible before the modal appears.
- **Prank `<button id="prankYes">` flees on `mouseenter`, `focus`, `touchstart`, and `click`**: it gets `position: fixed` (`.is-fleeing` class) and random `left/top`. The `flee()` function in [script.js](script.js) clamps the destination to the viewport (with a 24 px margin) so the button is **guaranteed** to remain on-screen — never hidden. If the viewport is smaller than the button itself, it centers instead. There's also a `resize` listener that re-positions the button if the window shrinks mid-flight.
  - **Gotcha**: `.prank__card` has `transform: scale(...)` for its open/close animation. A transformed ancestor becomes the containing block for `position: fixed` descendants — meaning a fixed-position child is positioned relative to the *card*, not the viewport, and ends up off-screen with viewport-pixel coordinates. The fix in `flee()` is to **append `yesBtn` to `document.body`** as soon as it starts fleeing, escaping the card's transform context. On modal open/close, `backHome()` puts it back. Don't refactor this away — removing the body-append makes the button disappear.
- **Fonts come from Google Fonts via CDN**: opening the file offline degrades to system fonts. Acceptable; the page still works.
