import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { chromium } from '@playwright/test'

const origin = process.env.PREVIEW_ORIGIN || 'https://parthawe.github.io'
const base = `${origin}/portfolio-split`
const screenshots = process.env.PREVIEW_SCREENSHOTS
if (screenshots) await mkdir(screenshots, { recursive: true })
const browser = await chromium.launch()
const cases = {
  product: {
    heading: 'Designing product systems people trust.',
    featured: ['mentra', 'transfi-project', 'raahi-project', 'clawed-chat'],
    other: 'jugalbandi',
    caseStudy: ['mentra', 'Mentra'],
    supporting: 'mentra-brand',
  },
  experimental: {
    heading: 'Design That Plays',
    featured: ['jugalbandi', 'enigma', 'shuffle', 'sea-of-salt'],
    other: 'mentra',
    caseStudy: ['jugalbandi', 'Jugalbandi'],
    supporting: 'moniac-machine',
  },
}

try {
  const index = await fetch(`${base}/`)
  assert.equal(index.status, 200)
  const directory = await index.text()
  for (const [variant, details] of Object.entries(cases)) {
    assert.ok(directory.includes(`/portfolio-split/${variant}/`))
    for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
      const page = await browser.newPage({ viewport, reducedMotion: 'reduce' })
      const errors = []
      page.on('pageerror', error => errors.push(error.message))
      page.on('response', response => {
        if (response.url().startsWith(origin) && response.status() >= 400) {
          errors.push(`${response.status()} ${response.url()}`)
        }
      })
      const url = `${base}/${variant}`
      const home = await page.goto(`${url}/`)
      assert.equal(home.status(), 200)
      await page.getByRole('heading', { level: 1, name: details.heading }).waitFor()
      assert.match(await page.locator('meta[name="robots"]').first().getAttribute('content'), /noindex/)
      for (const slug of details.featured) {
        assert.ok(await page.locator(`#works a[href$="/${slug}"]`).count(), slug)
      }
      assert.equal(await page.locator(`#works a[href$="/${details.other}"]`).count(), 0)
      assert.ok(await page.evaluate(async () => { await document.fonts.ready; return [...document.fonts].some(font => font.status === 'loaded') }))
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))
      if (screenshots) await page.screenshot({ path: `${screenshots}/${variant}-${viewport.width}.png` })

      assert.equal((await page.goto(`${url}/work/`)).status(), 200)
      await page.getByRole('heading', { level: 1, name: 'Work', exact: true }).waitFor()
      assert.ok(await page.locator(`main a[href$="/${details.supporting}"]`).count())
      assert.equal(await page.locator(`main a[href$="/${details.other}"]`).count(), 0)
      assert.equal((await page.goto(`${url}/about/`)).status(), 200)
      await page.getByRole('heading', { level: 1, name: 'About Parth Pawar' }).waitFor({ state: 'attached' })

      const [slug, title] = details.caseStudy
      assert.equal((await page.goto(`${url}/${slug}/`)).status(), 200)
      await page.getByRole('heading', { level: 1, name: title, exact: true }).waitFor()
      assert.equal((await page.reload()).status(), 200)
      await page.getByRole('heading', { level: 1, name: title, exact: true }).waitFor()
      await page.locator('main img').first().evaluate(async image => { await image.decode() })
      if (variant === 'product') {
        assert.equal((await page.goto(`${url}/transfi-project/`)).status(), 200)
        await page.getByRole('link', { name: 'Request access on the live portfolio' }).waitFor()
      } else {
        assert.equal((await page.goto(`${url}/shuffle/simulation/`)).status(), 200)
        await page.getByRole('heading', { name: /Shuffle/ }).first().waitFor()
      }
      assert.deepEqual(errors, [], `${variant} at ${viewport.width}px`)
      console.log(`${variant} passed at ${viewport.width}px`)
      await page.close()
    }
  }
} finally {
  await browser.close()
}
