import { expect, test } from '@playwright/test';
import { homeUrl, renderedTemplate, runId, wp } from '../../support/site';

/**
 * Buzz is a block theme: WordPress resolves templates/*.html itself, so the framework's
 * marker names the canvas (`template-canvas`), never a Blade view. What tells the
 * templates apart is the body class WordPress writes for the request, and what each
 * template's pattern puts on the page.
 */

const tag = `buzz-e2e-${runId}`;
const ids: Record<string, string> = {};
const urls: Record<string, string> = {};

test.beforeAll(() => {
    const create = (...args: string[]): string => wp('post', 'create', '--post_status=publish', '--porcelain', ...args);
    const link = (id: string): string => new URL(wp('post', 'get', id, '--field=url')).pathname;

    const category = wp('term', 'create', 'category', `${tag}-cat`, '--porcelain');
    ids.post = create('--post_type=post', `--post_title=Headline ${tag}`, `--post_content=<!-- wp:paragraph --><p>Body ${tag}</p><!-- /wp:paragraph -->`, `--post_category=${category}`);
    ids.page = create('--post_type=page', `--post_title=Page ${tag}`, `--post_content=<!-- wp:paragraph --><p>Page body ${tag}</p><!-- /wp:paragraph -->`);
    ids.category = category;

    urls.post = link(ids.post);
    urls.page = link(ids.page);
    urls.category = new URL(wp('term', 'get', 'category', category, '--field=url')).pathname;
});

test.afterAll(() => {
    for (const key of ['post', 'page']) {
        if (ids[key]) {
            wp('post', 'delete', ids[key], '--force');
        }
    }

    if (ids.category) {
        wp('term', 'delete', 'category', ids.category);
    }
});

async function visit(page: import('@playwright/test').Page, path: string, status = 200): Promise<string> {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));

    const response = await page.goto(homeUrl(path));

    expect(response?.status(), `status of ${path}`).toBe(status);
    expect(errors, 'no uncaught page error').toEqual([]);

    return page.content();
}

test('the theme under test is Buzz, a block theme', () => {
    expect(wp('theme', 'list', '--status=active', '--field=name')).toBe('buzz');
    expect(wp('eval', 'echo wp_is_block_theme() ? "yes" : "no";')).toBe('yes');
});

test('the masthead and the colophon frame every template', async ({ page }) => {
    for (const path of ['/', urls.post, urls.page, '/?s=nothing', '/no-such-page-' + tag]) {
        await visit(page, path, path.startsWith('/no-such') ? 404 : 200);
        await expect(page.locator('header.buzz-masthead .buzz-nameplate'), path).toBeVisible();
        await expect(page.locator('footer.buzz-colophon'), path).toContainText(String(new Date().getFullYear()));
    }
});

test('the front page lists the posts', async ({ page }) => {
    const html = await visit(page, '/');

    expect(renderedTemplate(html)?.template).toBe('template-canvas');
    await expect(page.locator('body')).toHaveClass(/\bhome\b/);
    await expect(page.locator('main .buzz-index-list')).toContainText(`Headline ${tag}`);
});

test('a post renders its title and body', async ({ page }) => {
    await visit(page, urls.post);

    await expect(page.locator('body')).toHaveClass(/\bsingle-post\b/);
    await expect(page.locator('main h1')).toContainText(`Headline ${tag}`);
    await expect(page.locator('main')).toContainText(`Body ${tag}`);
});

test('a page renders its title and body', async ({ page }) => {
    await visit(page, urls.page);

    await expect(page.locator('body')).toHaveClass(/\bpage\b/);
    await expect(page.locator('main h1')).toContainText(`Page ${tag}`);
    await expect(page.locator('main')).toContainText(`Page body ${tag}`);
});

test('a category archive lists its posts under its own title', async ({ page }) => {
    await visit(page, urls.category);

    await expect(page.locator('body')).toHaveClass(/\bcategory\b/);
    await expect(page.locator('main .wp-block-query-title')).toContainText(`${tag}-cat`);
    await expect(page.locator('main .buzz-index-list')).toContainText(`Headline ${tag}`);
});

test('a search finds a post, and says so when it finds nothing', async ({ page }) => {
    await visit(page, `/?s=${encodeURIComponent(`Headline ${tag}`)}`);
    await expect(page.locator('body')).toHaveClass(/\bsearch-results\b/);
    await expect(page.locator('main .buzz-index-list')).toContainText(`Headline ${tag}`);

    await visit(page, `/?s=zzz-no-match-${runId}`);
    await expect(page.locator('body')).toHaveClass(/\bsearch-no-results\b/);
    await expect(page.locator('main')).toContainText('Nothing here yet.');
});

test("an unknown URL renders the theme's 404, with a 404 status", async ({ page }) => {
    await visit(page, `/no-such-page-${tag}`, 404);

    await expect(page.locator('body')).toHaveClass(/\berror404\b/);
    await expect(page.locator('main h1')).toHaveText('Page missing');
    await expect(page.locator('main .buzz-index-list')).toHaveCount(0);
});

test('the design-system pattern is offered to authors', () => {
    const inserter = wp('eval', 'echo WP_Block_Patterns_Registry::get_instance()->is_registered("buzz/design-system") ? "yes" : "no";');

    expect(inserter).toBe('yes');
});

test.describe('on a phone', () => {
    test.use({ viewport: { width: 375, height: 700 } });

    test('the navigation collapses behind a button that opens and closes it', async ({ page }) => {
        await visit(page, '/');

        const open = page.locator('.wp-block-navigation__responsive-container-open');
        const menu = page.locator('.wp-block-navigation__responsive-container');

        await expect(open).toBeVisible();
        await expect(menu).not.toHaveClass(/\bis-menu-open\b/);

        await open.click();
        await expect(menu).toHaveClass(/\bis-menu-open\b/);
        await expect(menu.getByRole('link', { name: `Page ${tag}` })).toBeVisible();

        await page.locator('.wp-block-navigation__responsive-container-close').click();
        await expect(menu).not.toHaveClass(/\bis-menu-open\b/);
    });

    test('nothing overflows the viewport sideways', async ({ page }) => {
        for (const path of ['/', urls.post]) {
            await visit(page, path);

            const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
            expect(overflow, `horizontal overflow on ${path}`).toBeLessThanOrEqual(0);
        }
    });
});
