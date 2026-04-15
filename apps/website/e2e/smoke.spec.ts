/**
 * Website smoke tests — always run in CI (including fork PRs).
 * Demo flow uses NEXT_PUBLIC_DEMO_MOCK=1 so no provider secrets are needed.
 */
import { test, expect } from '@playwright/test'

test.describe('Page basics', () => {
  test('root renders with correct title and dark class', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/PromptLens/)
    // dark class must be on <html> server-side (no FOUC)
    const htmlClass = await page.locator('html').getAttribute('class')
    expect(htmlClass).toContain('dark')
  })

  test('returns HTML with <title> on first byte (SSR)', async ({ page }) => {
    const response = await page.goto('/')
    expect(response?.status()).toBe(200)
    const body = await response?.text()
    expect(body).toContain('<title>')
    expect(body).toMatch(/PromptLens/)
  })

  test('no hydration errors in console', async ({ page }) => {
    const hydrationErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error' && /hydration/i.test(msg.text())) {
        hydrationErrors.push(msg.text())
      }
    })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    expect(hydrationErrors).toHaveLength(0)
  })
})

test.describe('OG / meta tags', () => {
  test('og:title and og:image are present', async ({ page }) => {
    await page.goto('/')
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content')
    expect(ogTitle).toBeTruthy()
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content')
    expect(ogImage).toBeTruthy()
  })

  test('twitter:card is set', async ({ page }) => {
    await page.goto('/')
    const card = await page.locator('meta[name="twitter:card"]').getAttribute('content')
    expect(card).toBeTruthy()
  })
})

test.describe('Sitemap + robots', () => {
  test('sitemap.xml responds 200', async ({ page }) => {
    const response = await page.goto('/sitemap.xml')
    expect(response?.status()).toBe(200)
  })

  test('robots.txt allows crawlers', async ({ page }) => {
    const response = await page.goto('/robots.txt')
    expect(response?.status()).toBe(200)
    const body = await response?.text()
    expect(body).toContain('Allow: /')
  })
})

test.describe('Demo mock flow', () => {
  // Only meaningful when NEXT_PUBLIC_DEMO_MOCK=1 is set at build time
  test.skip(
    !process.env.NEXT_PUBLIC_DEMO_MOCK,
    'NEXT_PUBLIC_DEMO_MOCK not set — skipping mock demo flow',
  )

  test('demo section is reachable by scrolling', async ({ page }) => {
    await page.goto('/')
    await page.locator('#demo').scrollIntoViewIfNeeded()
    await expect(page.locator('#demo')).toBeVisible()
  })
})

test.describe('Reduced-motion', () => {
  test('no R3F canvas mounts with prefers-reduced-motion', async ({ browser }) => {
    const ctx = await browser.newContext({
      reducedMotion: 'reduce',
    })
    const page = await ctx.newPage()
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const canvasCount = await page.locator('canvas').count()
    expect(canvasCount).toBe(0)
    await ctx.close()
  })
})

test.describe('Sentry scrubbing (envelope intercept)', () => {
  test('Sentry envelope contains no base64 or API key fragments', async ({ page }) => {
    const sentryPayloads: string[] = []

    await page.route('**/api/envelope*', async (route) => {
      const body = route.request().postData() ?? ''
      sentryPayloads.push(body)
      await route.fulfill({ status: 200, body: '{}' })
    })

    // Also intercept sentry.io ingestion
    await page.route('https://sentry.io/**', async (route) => {
      const body = route.request().postData() ?? ''
      sentryPayloads.push(body)
      await route.fulfill({ status: 200, body: '{}' })
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    for (const payload of sentryPayloads) {
      // No long base64 strings (>100 chars of base64 chars)
      expect(payload).not.toMatch(/[A-Za-z0-9+/]{100,}={0,2}/)
      // No API key patterns
      expect(payload.toLowerCase()).not.toMatch(/sk-[a-z0-9]{20,}/)
      expect(payload.toLowerCase()).not.toMatch(/x-api-key/)
    }
  })
})
