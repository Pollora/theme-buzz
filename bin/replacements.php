<?php

declare(strict_types=1);

/**
 * The placeholders the scaffolder substitutes when it generates a theme.
 *
 * Mirrors MakeThemeCommand::getReplacements() in the framework, for
 * bin/ci/install.php, which substitutes them in the commit under test so CI
 * measures the theme as a user receives it, not the template.
 *
 * @return array<string, string>  placeholder => a plausible substituted value
 */
function scaffolderReplacements(string $slug = 'my-theme'): array
{
    $studly = str_replace(' ', '', ucwords(str_replace(['-', '_'], ' ', $slug)));

    return [
        '%theme_name%' => $slug,
        '%theme_camel%' => lcfirst($studly),
        '%theme_namespace%' => 'Theme\\'.$studly,
        '%theme_author%' => 'Pollora',
        '%theme_author_uri%' => 'https://pollora.dev',
        '%theme_uri%' => 'https://pollora.dev',
        '%theme_description%' => 'Theme under test',
        '%theme_version%' => '1.0.0',
    ];
}
