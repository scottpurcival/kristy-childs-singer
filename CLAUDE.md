# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static single-page website for Kristy Childs, a pop/country singer-songwriter. No build step, no package manager, no framework — just `index.html`, `style.css`, and `script.js`. Deployed automatically to GitHub Pages on every push to `main`.

Live URL: `https://kristychilds.github.io`

## Development

Open `index.html` directly in a browser or serve locally:

```bash
npx serve .
# or
python -m http.server 8080
```

Deployment is automatic via `.github/workflows/static.yml` — push to `main` and GitHub Pages picks it up within a minute or two.

## Architecture

Everything is in three files:

- **`index.html`** — single page with five sections in order: `#home` (hero), `#music` (player), `#about`, `#gallery`, `#contact`, plus a footer and lightbox overlay.
- **`style.css`** — all styles. No preprocessor. CSS custom properties are used for the colour palette/theming.
- **`script.js`** — all behaviour. No libraries, plain vanilla JS. Sections are clearly delimited by comment banners.

### script.js sections

| Section | What it does |
|---|---|
| Track List / State | `TRACKS` array drives the player; module-level state vars (`current`, `playing`, `shuffle`, `repeat`) |
| Playlist / Player | Builds playlist DOM, handles play/pause/prev/next, seek, volume, keyboard shortcuts (Space/←/→) |
| Particles | Canvas animation on the hero — floating music symbols |
| Navigation | Scroll-based `scrolled` class on navbar, mobile toggle, active link highlighting |
| Scroll Reveal | `IntersectionObserver` adds `.in` class to `.reveal` elements |
| Gallery & Lightbox | Filter buttons (all/photo/video), lightbox open/close/prev/next, keyboard nav (Escape/←/→) |
| Contact Form | Client-side validation only; submission is simulated with `setTimeout` — needs a real backend (Formspree, Netlify Forms, etc.) wired up |

### Media

All assets are local:
- `media/audio/*.mp3` — 8 tracks
- `media/img/*.jfif` / `*.jpg` — 5 photos
- `media/video/*.mp4` — 2 videos

### External dependencies (CDN only)

- Google Fonts: Playfair Display + Inter
- Font Awesome 6.5 (icons)

## Key things to know

- Social media links in the nav, contact section, and footer are all `href="#"` placeholders — they need real URLs.
- Contact email addresses (`hello@kristychilds.com`, `bookings@kristychilds.com`) are placeholder text, not functional.
- The contact form does **not** send anything — the `setTimeout` in `script.js:504` simulates a successful send. Wire up to a form service before going live.
- The `data-src` attribute on `.g-item` elements drives the lightbox; the `data-type` attribute (`photo`/`video`) drives both the filter and lightbox rendering.
