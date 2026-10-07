<p align="center">
  <a href="https://pollora.dev">
    <img src="https://raw.githubusercontent.com/Pollora/.github/main/brand/banners/theme-buzz.png" width="100%" alt="Buzz: a Full Site Editing magazine theme for Pollora">
  </a>
</p>

<p align="center">
  <a href="https://github.com/Pollora/theme-buzz/tags"><img src="https://img.shields.io/github/v/tag/Pollora/theme-buzz?label=version" alt="Version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/Pollora/theme-buzz" alt="License"></a>
</p>

Buzz is a typographic journal and magazine theme for [Pollora](https://pollora.dev), built as a WordPress **Full Site Editing** block theme: real `templates/*.html` and `parts/*.html`, editable in the Site Editor, instead of Pollora's usual Blade template hierarchy. It is for sites whose editors want to change the layout themselves, while the theme keeps Laravel at hand for what needs PHP.

<p align="center">
  <img src="https://pollora.dev/press/theme-buzz.png" width="100%" alt="The Buzz magazine theme">
</p>

## Installation

Buzz is the "Magazine" template of `pollora:make:theme`:

```bash
php artisan pollora:make:theme my-journal   # then choose "Magazine"
# or, without the prompt
php artisan pollora:make:theme my-journal --repository=Pollora/theme-buzz
```

This repository is that template: its files carry <code>&#37;theme_name%</code>, <code>&#37;theme_namespace%</code>… which the
command substitutes, so the pattern slugs (`my-journal/masthead`), the namespace
(`Theme\MyJournal`) and the `style.css` header are the new theme's own. The design's vocabulary
— the `buzz-*` classes, the `buzz_card` image size — keeps its name.

The command downloads the latest tag, runs `npm install` and `npm run build`, and offers to activate the theme.

Requirements: a Pollora project (PHP 8.4+ and WordPress 7.1+ for a new one) and Node.js 20.19+ or 22.12+ (Vite 8) for the asset build.

## Why a block theme, in a Blade-first framework

Pollora normally resolves every page through its own Blade template hierarchy, and its guidance is
explicit: never ship a WordPress PHP template. A genuine WordPress block theme is a deliberate
exception to that — its `templates/*.html` and `parts/*.html` are what makes the WordPress Site
Editor's page (colors, typography, the templates themselves) editable at all. Pollora's front
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
├── patterns/              # Static patterns, registered by WordPress itself
│   ├── masthead.php       # The actual header markup
│   ├── index-list.php     # The journal index: a post loop, large titles, hairline rules
│   ├── article.php        # A single post's body, plus comments
│   ├── page-body.php      # A plain page's body
│   ├── not-found.php      # The 404 message
│   └── design-system.php  # Every native block, styled — offered in the inserter
├── resources/views/patterns/
│   └── colophon.blade.php # The footer — Blade, for the one thing that needs real PHP: the year
├── theme.json             # The design system: palette, the two-family type scale, spacing, styles
├── resources/assets/
│   ├── css/app.css        # @theme static tokens (color only — see below) + the few hand-authored rules
│   └── fonts/              # Self-hosted Playfair Display + Source Serif 4 (OFL, Google Fonts, latin subset)
└── app/
    ├── Cms/Bindings/ArticleBinding.php  # Block Bindings source: the byline's reading time
    └── Providers/AssetServiceProvider.php
```

One rule decides where a file goes: **the theme root holds what WordPress reads itself**
(`templates/`, `parts/`, `patterns/`, `theme.json`, `style.css` — the layout the Site Editor exports
too), and **`resources/views/` holds Blade, compiled by Pollora**.

So a static pattern is a native WordPress one, `patterns/*.php`: block markup under a header
docblock (`Title`, `Slug`, `Categories`…). Most of Buzz's patterns are, since the dynamic blocks
(`post-title`, `post-content`, `post-terms`…) do the work themselves. A pattern that needs Laravel
— the colophon's year, here — is a Blade view in `resources/views/patterns/*.blade.php`, registered
by Pollora.

The byline's reading time ("4 min read", in the article and in the index) is a plain
`core/paragraph` bound to the theme's own [Block Bindings](https://pollora.dev/blocks/block-bindings/)
source, `app/Cms/Bindings/ArticleBinding.php` (`%theme_name%/article`, fields `reading_time` and
`word_count`): a PHP method computes it from the post's words, in a query loop for each post, and
the editor shows it too. Add a field to the class, and it is offered in the block's "Attributes" panel.

WordPress caches the list of a theme's `patterns/` files: a new file shows up once that cache is
cleared (`wp eval 'wp_get_theme()->delete_pattern_cache();'`), or at once with
`WP_DEVELOPMENT_MODE=theme`.

## Design system

One committed editorial direction — ink on newsprint, one accent used sparingly:

- **Palette**: `paper` (warm off-white), `ink` (near-black), `caption` (muted grey), `rule`
  (hairline), `rubric` (a restrained editorial red — kickers, the masthead rule, a link on hover;
  never a color field).
- **Type**: Playfair Display (display — high-contrast, the classic magazine masthead serif) +
  Source Serif 4 (body/UI text) — a two-family discipline, no third face. A magazine-scale, fluid
  type ladder (`caption` → `masthead`) is hand-authored in `theme.json`, not Tailwind's defaults.
- **Rhythm**: a narrow reading column (`contentSize: 42rem`), drop caps on, a journal index list
  with large serif titles and hairline dividers instead of cards.

Only the **color** palette flows from Tailwind's `@theme static` block into the built `theme.json`
(`disableTailwindFonts` / `FontSizes` / `BorderRadius` in `vite.config.js`) — the type scale, the two
font families (each with its own `fontFace`) and the border radii (none — a sharp, print-like
edge everywhere) are the design system itself, authored by hand.

## Status

A first, deliberately simple version: six templates, six patterns, no style variations. See
[`Pollora/framework`](https://github.com/Pollora/framework) for the FSE support this theme relies
on, and the framework's changelog for the two fixes this theme's construction found and fixed
(a block theme's `404.html` answering the right HTTP status, its `error404` body class).

## Documentation

- [Block themes (Full Site Editing)](https://pollora.dev/theming/theme-structure/#block-themes-full-site-editing)
- [Block Bindings](https://pollora.dev/blocks/block-bindings/) and [Patterns](https://pollora.dev/blocks/patterns/)

## Template development

Develop on a theme generated from this template, never in this repository — its placeholders do
not run:

```bash
php artisan pollora:make:theme buzz --repository=Pollora/theme-buzz   # in a test project
cd themes/buzz && npm install && npm run dev
# … then package the changes back into this repository:
./bin/package-theme.sh /path/to/project/themes/buzz
git diff   # review: only buzz/, Theme\Buzz and the style.css header become placeholders
```

The build's output folder is named after the theme's directory on disk, so build from where
WordPress serves the theme (`themes/<slug>`), not from a symlink: Node resolves `__dirname` to the
real path, and a mismatch breaks every asset and font URL silently.

`bin/` is dropped by the scaffolder. It holds the packaging script, `bin/ci/install.php` (the
commit under test, substituted as `make:theme` would — what CI installs) and the browser tests.

## Contributing

Contributions are welcome: see the [contributing guide](https://github.com/Pollora/.github/blob/main/CONTRIBUTING.md). Report security issues privately, as described in the [security policy](https://github.com/Pollora/.github/blob/main/SECURITY.md).

## License

Buzz is open-source software licensed under the [MIT license](LICENSE). © [RuBee group](https://rubee.group)
