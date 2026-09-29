# Buzz

A typographic, journal/magazine [Pollora](https://pollora.dev) theme, built in WordPress's **Full
Site Editing** (block theme) mode: real `templates/*.html` and `parts/*.html`, editable in the Site
Editor, instead of Pollora's usual Blade-based template hierarchy.

## Why a block theme, in a Blade-first framework

Pollora normally resolves every page through its own Blade template hierarchy, and its guidance is
explicit: never ship a WordPress PHP template. A genuine WordPress block theme is a deliberate
exception to that — its `templates/*.html` and `parts/*.html` are what makes the WordPress Site
Editor's page (colours, typography, the templates themselves) editable at all. Pollora's front
controller falls through to WordPress core's own template resolution when nothing in its Blade
hierarchy matches, which is what lets a real block theme render through it. Verified end to end
(homepage, single post, page, archive, search, 404 — all with the correct HTTP status) before this
theme was built.

## Structure

```
buzz/
├── templates/           # Thin delegators: each just points at a pattern
│   ├── index.html
│   ├── archive.html
│   ├── search.html
│   ├── single.html
│   ├── page.html
│   └── 404.html
├── parts/                # header.html / footer.html, each delegating to a pattern too
├── resources/views/patterns/
│   ├── masthead.html      # The actual header markup — no PHP needed
│   ├── colophon.blade.php # The footer — Blade, for the one thing that needs real PHP: the year
│   ├── index-list.html    # The journal index: a post loop, large titles, hairline rules
│   ├── article.html       # A single post's body, plus comments
│   ├── page-body.html     # A plain page's body
│   └── not-found.html     # The 404 message
├── theme.json             # The design system: palette, the two-family type scale, spacing, styles
├── resources/assets/
│   ├── css/app.css        # @theme static tokens (colour only — see below) + the few hand-authored rules
│   └── fonts/              # Self-hosted Playfair Display + Source Serif 4 (OFL, Google Fonts, latin subset)
└── app/Providers/AssetServiceProvider.php
```

A theme's `resources/views/patterns` can hold both `.blade.php` (compiled, for real PHP) and plain
`.html` files (used verbatim, for a pattern that needs none) — most of Buzz's patterns are plain
`.html`, since a block theme's patterns are mostly static block markup once the dynamic blocks
(`post-title`, `post-content`, `post-terms`…) are doing the work themselves.

## Design system

One committed editorial direction — ink on newsprint, one accent used sparingly:

- **Palette**: `paper` (warm off-white), `ink` (near-black), `caption` (muted grey), `rule`
  (hairline), `rubric` (a restrained editorial red — kickers, the masthead rule, a link on hover;
  never a colour field).
- **Type**: Playfair Display (display — high-contrast, the classic magazine masthead serif) +
  Source Serif 4 (body/UI text) — a two-family discipline, no third face. A magazine-scale, fluid
  type ladder (`caption` → `masthead`) is hand-authored in `theme.json`, not Tailwind's defaults.
- **Rhythm**: a narrow reading column (`contentSize: 42rem`), drop caps on, a journal index list
  with large serif titles and hairline dividers instead of cards.

Only the **colour** palette flows from Tailwind's `@theme static` block into the built `theme.json`
(`disableTailwindFonts` / `FontSizes` / `BorderRadius` in `vite.config.js`) — the type scale, the two
font families (each with its own `fontFace`) and the border radii (none — a sharp, print-like
edge everywhere) are the design system itself, authored by hand.

## Local development

```bash
npm install
npm run dev    # HMR
npm run build  # Writes public/build/theme/<theme-folder-name>/…
```

The build's output folder name is derived from the theme's own directory name on disk — so build
from the path WordPress actually serves the theme from (`wp-content/themes/<slug>`), not from a
symlink or a clone under a different name: Node resolves `__dirname` to the real path, and a
mismatch there breaks every asset and font URL silently.

## Status

A first, deliberately simple version: six templates, six patterns, no style variations. See
[`Pollora/framework`](https://github.com/Pollora/framework) for the FSE support this theme relies
on, and the framework's changelog for the two fixes this theme's construction found and fixed
(`.html` block patterns, a block theme's `404.html` answering the right HTTP status).
