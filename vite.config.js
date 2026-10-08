import { defineConfig } from 'vite';
import pollora from '@pollora/vite-config';

export default defineConfig({
    plugins: [
        pollora({
            type: 'theme',
            // A block theme: its templates and parts reload the page too
            refresh: ['templates/**/*.html', 'parts/**/*.html'],
            reloadOn: ['.blade.php', '.html'],
            themeJson: {
                // The type scale, the two families (with their own @font-face) and
                // the border radii are all hand-authored in theme.json: only the
                // colour palette is meant to flow in from @theme static.
                disableTailwindFonts: true,
                disableTailwindFontSizes: true,
                disableTailwindBorderRadius: true,
            },
        }),
    ],
});
