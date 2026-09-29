#!/bin/bash
set -euo pipefail

# Package a Buzz theme developed on a site back into this template.
#
# Usage: ./bin/package-theme.sh <site>/themes/buzz
#
# Develop on a theme generated from this template under the slug "buzz"
# (`php artisan pollora:make:theme buzz --repository=Pollora/theme-buzz`), then
# run this: it copies the theme back and turns the slug and namespace into the
# placeholders the scaffolder substitutes. Only the anchored forms are
# replaced — `buzz/` (pattern slugs, handles), `Theme\Buzz` and the style.css
# header — so the design's own vocabulary, the `buzz-*` classes and the
# `buzz_card` image size, is left alone.

SOURCE="${1:?Usage: $0 <site>/themes/buzz}"
TARGET="$(cd "$(dirname "$0")/.." && pwd)"

[ -d "$SOURCE" ] || { echo "Not a directory: $SOURCE"; exit 1; }

rsync -a --delete \
    --exclude='.git' --exclude='.github' --exclude='bin/' \
    --exclude='node_modules' --exclude='package-lock.json' \
    "$SOURCE/" "$TARGET/"

find "$TARGET" -type f \
    -not -path "*/.git/*" -not -path "*/bin/*" -not -path "*/.github/*" \
    -not -path "*/node_modules/*" -not -name "README.md" \
    -not -name "*.woff2" -not -name "*.png" -not -name "*.jpg" \
    | while read -r file; do
        sed -i \
            -e 's|Theme\\Buzz|%theme_namespace%|g' \
            -e 's|buzz/|%theme_name%/|g' \
            -e "s|'name' => 'buzz'|'name' => '%theme_name%'|g" \
            -e "s|'label' => 'buzz'|'label' => '%theme_name%'|g" \
            "$file"
    done

# The theme header, in style.css only.
sed -i \
    -e 's|^Theme Name: .*|Theme Name: %theme_name%|' \
    -e 's|^Theme URI: .*|Theme URI: %theme_uri%|' \
    -e 's|^Description: .*|Description: %theme_description%|' \
    -e 's|^Author: .*|Author: %theme_author%|' \
    -e 's|^Author URI: .*|Author URI: %theme_author_uri%|' \
    -e 's|^Version: .*|Version: %theme_version%|' \
    "$TARGET/style.css"

cd "$TARGET"
git status --short
echo "Review with git diff, then commit."
