/**
 * Mobile fallback E2E tests.
 * At <768px viewport, ScrollNarrative renders NarrativeMobileFallback (static cards).
 * No pinned scroll sections, no canvas elements.
 */
import { test, expect } from '@playwright/test'

test.describe('Mobile fallback layout', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('no canvas elements at mobile viewport', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('load')
    const canvasCount = await page.locator('canvas').count()
    expect(canvasCount).toBe(0)
  })

  test('no horizontal overflow at 375px', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('load')
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth
    })
    expect(overflow).toBe(false)
  })

  test('narrative sections still present (as mobile fallback)', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('load')
    // Sections exist even on mobile (rendered as static cards by NarrativeMobileFallback)
    await expect(page.locator('#style-prompt')).toBeAttached()
    await expect(page.locator('#product-visual')).toBeAttached()
    await expect(page.locator('#web-design')).toBeAttached()
  })

  test('no pinned sticky position on mobile narrative sections', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('load')

    // On mobile, the sticky inner div should NOT be position:sticky (belt-and-suspenders check)
    const styleSection = page.locator('#style-prompt')
    await expect(styleSection).toBeAttached()

    // If ScrollNarrativeDesktop is not rendered, there is no sticky child
    // (NarrativeMobileFallback renders a plain div)
    const stickyDivs = await styleSection.locator('div[style*="sticky"]').count()
    expect(stickyDivs).toBe(0)
  })

  test('page renders without JS errors on mobile', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))
    await page.goto('/')
    await page.waitForLoadState('load')
    expect(errors).toHaveLength(0)
  })
})
