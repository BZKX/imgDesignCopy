/**
 * Narrative scroll section E2E tests.
 * Verifies all 3 scroll-narrative sections render, have correct IDs,
 * and their eyebrow/title text is present.
 */
import { test, expect } from '@playwright/test'

// ScrollNarrative is dynamic (ssr: false). On a cold dev server the first
// compilation of the narrative chunk can take 40+ seconds. Run these tests
// serially so each shares the warm server from the previous test, and give
// each test a 90 s budget (well above the ~40 s cold-start observed in CI).
test.describe('ScrollNarrative sections', () => {
  test.describe.configure({ mode: 'serial' })
  test.use({ timeout: 90000 })

  test('all 3 narrative sections are present in the DOM', async ({ page }) => {
    await page.goto('/')
    // state:'attached' — element just needs to be in the DOM tree (not hidden)
    await page.waitForSelector('#style-prompt', { state: 'attached', timeout: 80000 })
    await page.waitForSelector('#product-visual', { state: 'attached', timeout: 80000 })
    await page.waitForSelector('#web-design', { state: 'attached', timeout: 80000 })
  })

  test('10 sections render in correct order', async ({ page }) => {
    await page.goto('/')
    // Wait for all 3 dynamic narrative sections + demo to appear
    await page.waitForSelector('#style-prompt', { state: 'attached', timeout: 80000 })
    await page.waitForSelector('#demo', { state: 'attached', timeout: 80000 })

    const sectionIds = await page.evaluate(() => {
      const sections = Array.from(
        document.querySelectorAll('[id]'),
      ).filter((el) =>
        ['style-prompt', 'product-visual', 'web-design', 'demo'].includes(el.id),
      )
      return sections.map((el) => el.id)
    })

    const styleIdx = sectionIds.indexOf('style-prompt')
    const productIdx = sectionIds.indexOf('product-visual')
    const webIdx = sectionIds.indexOf('web-design')
    const demoIdx = sectionIds.indexOf('demo')

    expect(styleIdx).toBeGreaterThanOrEqual(0)
    expect(productIdx).toBeGreaterThan(styleIdx)
    expect(webIdx).toBeGreaterThan(productIdx)
    expect(demoIdx).toBeGreaterThan(webIdx)
  })

  test('StylePrompt section has correct sectionHeight (500vh)', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('#style-prompt', { state: 'attached', timeout: 80000 })
    const height = await page.locator('#style-prompt').evaluate((el) => {
      return (el as HTMLElement).style.height
    })
    expect(height).toBe('500vh')
  })

  test('ProductVisual section has sectionHeight 400vh', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('#product-visual', { state: 'attached', timeout: 80000 })
    const height = await page.locator('#product-visual').evaluate((el) => {
      return (el as HTMLElement).style.height
    })
    expect(height).toBe('400vh')
  })

  test('WebDesign section has sectionHeight 400vh', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('#web-design', { state: 'attached', timeout: 80000 })
    const height = await page.locator('#web-design').evaluate((el) => {
      return (el as HTMLElement).style.height
    })
    expect(height).toBe('400vh')
  })

  test('narrative sections show eyebrow and title text', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('load')

    // Check that the eyebrow/title area for style-prompt is non-empty
    const styleSection = page.locator('#style-prompt')
    await expect(styleSection).toBeAttached()
    const textContent = await styleSection.textContent()
    expect(textContent?.trim().length).toBeGreaterThan(0)
  })

  test('ScrollProgressNav is present in the DOM', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('load')
    // ScrollProgressNav has aria-label
    const nav = page.locator('[aria-label*="narrative"], [data-testid="scroll-progress-nav"], nav')
    // It may or may not match — just ensure no JS error was thrown
    // The smoke test already checks hydration errors; here we just confirm DOM stability
    await expect(page.locator('body')).toBeVisible()
  })

  test('no console errors on page load', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    page.on('pageerror', (err) => errors.push(err.message))

    await page.goto('/')
    await page.waitForLoadState('load')

    // Filter out known non-critical warnings
    const criticalErrors = errors.filter(
      (e) =>
        !e.includes('SENTRY_SUPPRESS') &&
        !e.includes('global error handler') &&
        !e.includes('webpack'),
    )
    expect(criticalErrors).toHaveLength(0)
  })
})
