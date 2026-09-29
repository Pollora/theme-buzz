# Browser tests

Playwright specs for this theme, run on the framework's E2E harness: CI checks out
`pollora/framework`'s `tests/e2e` at the version the site runs, copies these files to
`specs/buzz/` and runs them there (so they import `../../support/site`).

The spec creates the content it needs with WP-CLI and deletes it afterwards. The theme
must be the active one. `bin/` is stripped by the scaffolder: none of this reaches a
project generated from Buzz.
