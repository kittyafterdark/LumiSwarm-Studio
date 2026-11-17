import { chromium } from 'playwright'
import { readFile, mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { existsSync } from 'node:fs'
import assert from 'node:assert/strict'

const exe = process.env.STUDIO_CHROMIUM_PATH || (existsSync(chromium.executablePath()) ? chromium.executablePath() : '/usr/bin/chromium')
const browser = await chromium.launch({ executablePath: exe, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] })
const markup = await readFile(resolve('tests/ui-harness.html'), 'utf8')
const bundled = await readFile(resolve('dist/frontend.js'), 'utf8')
const fixture = markup.replace('import { setup } from "../dist/frontend.js"', bundled.replaceAll('</script', '<\\/script'))
const shots = resolve('docs/screenshots')
await mkdir(shots, { recursive: true })
const errors = []

async function mount(width, height) {
  const page = await browser.newPage({ viewport: { width, height }, hasTouch: width <= 720 })
  page.on('pageerror', e => errors.push(`${width}: ${e.message}`))
  await page.setContent(fixture)
  await page.locator('.ss-shell').waitFor()
  {
    await page.locator('[data-role="mobile-quick-create"]').evaluate(el => {
      el.checked = true
      el.dispatchEvent(new Event('change', { bubbles: true }))
    })
  }
  await page.locator('[data-action="close-studio"]').first().click()
  return page
}

async function checkRail(page, width, saveScreenshot = false) {
  const mini = page.locator('[data-role="miniplayer"]')
  const portrait = page.locator('.ss-mini-preview')
  const buttons = page.locator('.ss-mini-actions .ss-mini-button')
  const rect = await mini.boundingBox()
  const image = await portrait.boundingBox()
  assert.ok(rect && image, `${width}px rail and portrait mounted`)
  assert.ok(rect.x >= -1 && rect.x + rect.width <= width + 1, `${width}px rail stays in viewport`)
  if (width > 720) {
    assert.equal(await mini.getAttribute('data-rail-layout'), 'vertical')
    assert.equal(Math.round(rect.width), 66)
    assert.equal(Math.round(rect.height), 360)
    const ys = []
    for (let i = 0; i < 3; i++) {
      const btn = await buttons.nth(i).boundingBox()
      assert.ok(btn.y >= image.y + image.height + 4, 'desktop actions sit BELOW the portrait')
      assert.ok(Math.abs((btn.x + btn.width / 2) - (image.x + image.width / 2)) <= 2, 'portrait and actions share one center line')
      ys.push(btn.y)
    }
    assert.ok(ys[0] < ys[1] && ys[1] < ys[2], 'desktop buttons stack vertically below artwork')
  } else {
    assert.equal(await mini.getAttribute('data-rail-layout'), 'horizontal')
    assert.equal(Math.round(rect.width), Math.min(318, width - 16))
    assert.equal(Math.round(rect.height), 64)
    for (let i = 0; i < 3; i++) {
      const btn = await buttons.nth(i).boundingBox()
      assert.ok(Math.abs(btn.y - image.y) < 9, 'mobile buttons share artwork row')
    }
  }
  if (saveScreenshot) await page.screenshot({ path: resolve(shots, `v20-rail-${width}.png`) })
}

try {
  for (const width of [320, 360, 390, 720, 900, 1440]) {
    const page = await mount(width, 820)
    const mini = page.locator('[data-role="miniplayer"]')
    await mini.click({ button: 'right', position: { x: 15, y: 15 } })
    assert.equal(await page.locator('[data-role="mini-context-menu"]').isVisible(), true)
    await page.locator('[data-action="mini-menu-toggle"]').click()
    await checkRail(page, width, width === 390 || width === 1440)
    await page.locator('[data-action="mini-show-menu"]').first().click()
    assert.equal(await page.locator('[data-role="mini-strip-menu"]').isVisible(), true, 'rail ⋯ opens dedicated toolkit menu')
    await page.keyboard.press('Escape')
    await page.locator('[data-action="mini-compose"]').click()
    assert.equal(await mini.getAttribute('data-quick-view'), 'composer')
    await page.locator('[data-role="mini-prompt"]').fill('Preserved draft')
    await page.locator('[data-action="mini-close-compose"]').click()
    await checkRail(page, width)
    await page.locator('[data-action="mini-compose"]').click()
    assert.equal(await page.locator('[data-role="mini-prompt"]').inputValue(), 'Preserved draft')
    await page.close()
  }
  const page = await mount(900, 820)
  await page.locator('.ss-miniplayer').click({ button: 'right' })
  await page.locator('[data-action="mini-menu-toggle"]').click()
  await page.setViewportSize({ width: 390, height: 820 })
  await checkRail(page, 390)
  await page.setViewportSize({ width: 900, height: 820 })
  await checkRail(page, 900)
  await page.close()
  assert.deepEqual(errors, [])
  console.log('v20 portrait-first desktop rail, responsive mobile, ⋯ menu, composer and draft preservation: PASS')
} finally {
  await browser.close()
}
