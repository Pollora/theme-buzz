# %theme_name%

%theme_description%

Built with [Pollora](https://pollora.dev) from the [Buzz](https://github.com/Pollora/theme-buzz) template: a Full Site Editing block theme, so its templates, parts and styles are edited in the WordPress Site Editor (Appearance › Editor).

## What's inside

```
%theme_name%/
├── templates/           # index, archive, search, single, page, 404 (each points at a pattern)
├── parts/               # header.html, footer.html
├── patterns/            # Block patterns WordPress registers itself (masthead, article…)
├── resources/
│   ├── views/patterns/  # Patterns written in Blade (the colophon), registered by Pollora
│   └── assets/          # app.css (color tokens in @theme static), fonts
├── app/                 # PHP classes, namespace %theme_namespace%
│   └── Cms/Bindings/    # Block Bindings source %theme_name%/article (reading time)
├── style.css            # WordPress theme header
├── theme.json           # The design system: palette, type scale, spacing, block styles
└── vite.config.js       # Asset build
```

The theme root holds what WordPress reads itself; `resources/views/` holds Blade.

## Commands

Run from `themes/%theme_name%`:

```bash
npm run dev      # Vite dev server with hot reload
npm run build    # production assets
```

A new file in `patterns/` shows up once WordPress's pattern cache is cleared, or at once with `WP_DEVELOPMENT_MODE=theme`:

```bash
wp eval 'wp_get_theme()->delete_pattern_cache();'
```

When something fails without an error, run `php artisan pollora:doctor` from the project root.

## Read more

- [Block themes (Full Site Editing)](https://pollora.dev/theming/theme-structure/#block-themes-full-site-editing)
- [Block Bindings](https://pollora.dev/blocks/block-bindings/) and [Patterns](https://pollora.dev/blocks/patterns/)
