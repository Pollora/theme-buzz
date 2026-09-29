#!/usr/bin/env php
<?php

declare(strict_types=1);

/**
 * Put the commit under test on a site the way `pollora:make:theme` would.
 *
 *   php bin/ci/install.php --source=<this repository> --themes=<site>/themes [--slug=buzz]
 *
 * This repository is a template: `style.css` carries `%theme_name%`, the
 * provider `%theme_namespace%`, every pattern slug `%theme_name%/…`. A user only
 * ever sees them substituted. So CI copies the commit under test, drops what the
 * scaffolder drops (bin/, .github/, .git/) and substitutes the placeholders with
 * the same table — measuring the branch, as a user would receive it.
 *
 * It installs. It asserts nothing: the browser tests do that.
 */

require_once dirname(__DIR__).'/replacements.php';

$options = getopt('', ['source:', 'themes:', 'slug::']);

if (! isset($options['source'], $options['themes'])) {
    fwrite(STDERR, "Usage: php bin/ci/install.php --source=<repo> --themes=<site>/themes [--slug=buzz]\n");
    exit(2);
}

$source = rtrim((string) $options['source'], '/');
$slug = (string) ($options['slug'] ?? 'buzz');
$target = rtrim((string) $options['themes'], '/').'/'.$slug;
$replacements = scaffolderReplacements($slug);
$dropped = ['.git', '.github', 'bin', 'node_modules'];
$binary = ['woff2', 'woff', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'ico'];

if (is_dir($target)) {
    fwrite(STDERR, "{$target} already exists.\n");
    exit(1);
}

$files = new RecursiveIteratorIterator(
    new RecursiveCallbackFilterIterator(
        new RecursiveDirectoryIterator($source, FilesystemIterator::SKIP_DOTS),
        fn (SplFileInfo $file): bool => ! in_array($file->getFilename(), $dropped, true),
    ),
);

foreach ($files as $file) {
    $relative = substr($file->getPathname(), strlen($source) + 1);
    $destination = $target.'/'.$relative;

    if (! is_dir(dirname($destination))) {
        mkdir(dirname($destination), 0775, true);
    }

    $contents = (string) file_get_contents($file->getPathname());

    if (! in_array(strtolower($file->getExtension()), $binary, true)) {
        $contents = strtr($contents, $replacements);
    }

    file_put_contents($destination, $contents);
}

echo "Installed {$slug} in {$target}\n";
