import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { readFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const executable=process.env.STUDIO_CHROMIUM_PATH || (existsSync(chromium.executablePath()) ? chromium.executablePath() : '/usr/bin/chromium')
const browser=await chromium.launch({executablePath:executable,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']})
const fixture=(await readFile(resolve('tests/ui-harness.html'),'utf8'))
  .replace('import { setup } from "../dist/frontend.js"', (await readFile(resolve('dist/frontend.js'),'utf8')).replaceAll('</script','<\\/script'))
const output=resolve('docs/screenshots')
await mkdir(output,{recursive:true})
const errors=[]
try {
  const page=await browser.newPage({viewport:{width:1440,height:900}})
  page.on('pageerror',e=>errors.push(e.message))
  await page.setContent(fixture)
  await page.locator('.ss-shell').waitFor()
  // The visible swatch must reflect the real computed accent, rather than a
  // different alias or an invented blue fallback.
  await page.locator('[data-action="toggle-config"]').click()
  await page.locator('[data-action="settings-tab"][data-settings-tab="theme"]').click()
  const inherited=await page.evaluate(()=>({
    swatch:document.querySelector('[data-color-key="accent"]').value,
    actual:getComputedStyle(document.querySelector('.ss-shell')).getPropertyValue('--ss-accent').trim(),
    host:getComputedStyle(document.documentElement).getPropertyValue('--lumiverse-accent').trim(),
  }))
  assert.equal(inherited.swatch.toLowerCase(),inherited.actual.toLowerCase(),'The Accent swatch should show the exact active Studio highlight')
  // Nuclear colors: accent cyan, every ordinary and primary button burgundy.
  await page.locator('[data-color-key="accent"]').fill('#05c5e8')
  await page.locator('[data-color-key="button"]').fill('#831c28')
  await page.waitForTimeout(240) // let Studio's 160ms color transitions settle
  const applied=await page.evaluate(()=>{
    const el=s=>document.querySelector(s)
    const css=s=>getComputedStyle(el(s))
    const field=el('.ss-tune-group .ss-select');field.focus()
    return {
      accent:css('.ss-shell').getPropertyValue('--ss-accent').trim(),
      swatch:el('[data-color-key="accent"]').value,
      primaryBg:css('.ss-desktop-generate').backgroundColor,
      primaryText:css('.ss-desktop-generate').color,
      normalBg:css('.ss-top-actions .ss-icon-button').backgroundColor,
      normalText:css('.ss-top-actions .ss-icon-button').color,
      selectedTab:css('.ss-view-nav .ss-button[aria-current="page"]').color,
      icon:css('.ss-brand > svg').color,
      slider:css('.ss-tune-group input[type="range"]').accentColor,
      fieldBorder:getComputedStyle(field).borderColor,
      host:getComputedStyle(document.documentElement).getPropertyValue('--lumiverse-accent').trim(),
    }
  })
  assert.equal(applied.accent,'#05c5e8')
  assert.equal(applied.swatch,'#05c5e8')
  assert.equal(applied.primaryBg,'rgb(131, 28, 40)')
  assert.equal(applied.normalBg,'rgb(131, 28, 40)')
  assert.equal(applied.primaryText,'rgb(255, 255, 255)')
  assert.equal(applied.normalText,'rgb(255, 255, 255)')
  assert.equal(applied.selectedTab,'rgb(5, 197, 232)')
  assert.equal(applied.icon,'rgb(5, 197, 232)')
  assert.equal(applied.fieldBorder,'rgb(5, 197, 232)')
  assert.equal(applied.host,inherited.host,'The host theme cannot be rewritten by Studio')
  // Not all fixtures expose a range in the default inspector disclosure.
  if (applied.slider) assert.equal(applied.slider,'rgb(5, 197, 232)')
  await page.locator('[data-action="close-settings"]').last().click()
  await page.screenshot({path:resolve(output,'v9-nuclear-theme.png')})
  // Reset clears the override; choosing Accent alone should make Generate use
  // that accent. Bright backgrounds must get legible dark foregrounds.
  await page.locator('[data-action="toggle-config"]').click()
  await page.locator('[data-action="settings-tab"][data-settings-tab="theme"]').click()
  await page.locator('[data-action="reset-appearance"]').click()
  await page.locator('[data-color-key="accent"]').fill('#ffe45e')
  await page.waitForTimeout(240)
  const bright=await page.evaluate(()=>({
    bg:getComputedStyle(document.querySelector('.ss-desktop-generate')).backgroundColor,
    text:getComputedStyle(document.querySelector('.ss-desktop-generate')).color,
    button:getComputedStyle(document.querySelector('.ss-top-actions .ss-icon-button')).backgroundColor,
  }))
  assert.equal(bright.bg,'rgb(255, 228, 94)')
  assert.equal(bright.text,'rgb(9, 9, 11)')
  assert.notEqual(bright.button,bright.bg,'Button fill should not change when only Accent is customized')
  await page.screenshot({path:resolve(output,'v9-accent-alone.png')})
  await page.close()
  assert.deepEqual(errors,[],'No JS errors in the live compiled Studio')
  console.log('v9 browser theme contract: inherited swatch, separate blue accent/red buttons, primary actions, focus, readability and reset: PASS',applied,bright)
} finally {await browser.close()}
