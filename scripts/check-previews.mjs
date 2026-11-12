import assert from 'node:assert/strict'
import { mkdir, readFile } from 'node:fs/promises'
import { chromium, expect } from '@playwright/test'

const origin = process.env.PREVIEW_ORIGIN || 'https://parthawe.github.io'
const base = `${origin}/portfolio-split`
const screenshots = process.env.PREVIEW_SCREENSHOTS
if (screenshots) await mkdir(screenshots, { recursive: true })
const browser = await chromium.launch()
const portfolios = JSON.parse(await readFile(new URL('../src/config/portfolios.json', import.meta.url), 'utf8'))
const cases = {
  product: {
    heading: 'Designing product systems people trust.',
    caseStudy: ['mentra', 'Mentra'],
  },
  experimental: {
    heading: 'Design That Plays',
    caseStudy: ['jugalbandi', 'Jugalbandi'],
  },
}

try {
  const index = await fetch(`${base}/`)
  assert.equal(index.status, 200)
  const directory = await index.text()
  for (const [variant, details] of Object.entries(cases)) {
    assert.ok(directory.includes(`/portfolio-split/${variant}/`))
    const { featured, supporting, archive } = portfolios[variant]
    const projects = [...featured, ...supporting, ...archive]
    const listSlugs = locator => locator.evaluateAll(links => links.map(link => link.pathname.split('/').filter(Boolean).at(-1)))
    await Promise.all(projects.map(async slug => {
      const route = await fetch(`${base}/${variant}/${slug}/`, { method: 'HEAD' })
      assert.equal(route.status, 200, slug)
    }))
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
      assert.deepEqual(await listSlugs(page.locator('#works .pcard')), featured)
      assert.deepEqual(await listSlugs(page.locator('#homepage-project-archive .pcard')), [...supporting, ...archive])
      assert.ok(await page.evaluate(async () => { await document.fonts.ready; return [...document.fonts].some(font => font.status === 'loaded') }))
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))
      await page.locator('.page-loader').waitFor({ state: 'detached' })
      if (screenshots) await page.screenshot({ path: `${screenshots}/${variant}-${viewport.width}.png` })

      assert.equal((await page.goto(`${url}/work/`)).status(), 200)
      await page.getByRole('heading', { level: 1, name: 'Work', exact: true }).waitFor()
      const cards = page.locator('#work-project-results .pcard')
      assert.deepEqual(await listSlugs(cards), projects)
      const first = await cards.nth(0).boundingBox()
      const second = await cards.nth(1).boundingBox()
      if (viewport.width > 540) {
        assert.equal(first.y, second.y)
        assert.ok(Math.abs(first.height - second.height) < 1)
      } else {
        assert.equal(first.x, second.x)
        assert.ok(first.y < second.y)
      }
      const filters = page.getByRole('toolbar', { name: 'Filter projects', exact: true })
      assert.equal(await filters.count(), 1)
      assert.equal(await filters.evaluate(element => getComputedStyle(element).position), 'static')
      const category = filters.getByRole('button').nth(1)
      await category.click()
      await expect.poll(() => cards.count()).toBeLessThan(projects.length)
      assert.ok(await cards.count() > 0)
      await filters.getByRole('button', { name: 'All', exact: true }).click()
      await expect(cards).toHaveCount(projects.length)
      assert.deepEqual(await listSlugs(cards), projects)
      if (screenshots) await page.screenshot({ path: `${screenshots}/${variant}-work-${viewport.width}.png` })
      assert.equal((await page.goto(`${url}/work/?view=index`)).status(), 200)
      const rows = page.locator('a.work-library-row')
      await rows.first().waitFor()
      assert.deepEqual((await listSlugs(rows)).sort(), [...projects].sort())
      assert.equal((await page.goto(`${url}/work/?view=timeline`)).status(), 200)
      const timeline = page.locator('a.work-timeline-feature, a.work-timeline-support-row')
      await timeline.first().waitFor()
      assert.deepEqual((await listSlugs(timeline)).sort(), [...projects].sort())
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
        const film = page.getByLabel('Jugalbandi Performance', { exact: true })
        await film.waitFor({ state: 'attached' })
        const duration = await film.evaluate(video => new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Film metadata did not load')), 12000)
          video.addEventListener('loadedmetadata', () => { clearTimeout(timeout); resolve(video.duration) }, { once: true })
          video.preload = 'metadata'
          video.load()
        }))
        assert.ok(duration > 0)
        assert.equal((await page.goto(`${url}/shuffle/simulation/`)).status(), 200)
        await page.getByRole('heading', { name: /Shuffle/ }).first().waitFor()
        const controls = page.locator('.shuffle-controls')
        if (await controls.getAttribute('open') === null) await controls.locator('summary').click()
        const slider = page.getByRole('slider').first()
        const before = await slider.inputValue()
        await slider.press('ArrowRight')
        assert.notEqual(await slider.inputValue(), before)
      }
      assert.deepEqual(errors, [], `${variant} at ${viewport.width}px`)
      console.log(`${variant} passed at ${viewport.width}px`)
      await page.close()
    }
  }
} finally {
  await browser.close()
}
