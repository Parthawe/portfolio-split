import assert from 'node:assert/strict'
import { mkdir, readFile } from 'node:fs/promises'
import { chromium, expect } from '@playwright/test'

const origin = process.env.PREVIEW_ORIGIN || 'https://parthawe.github.io'
const base = `${origin}/portfolio-split`
const screenshots = process.env.PREVIEW_SCREENSHOTS
if (screenshots) await mkdir(screenshots, { recursive: true })
const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] })
const portfolios = JSON.parse(await readFile(new URL('../src/config/portfolios.json', import.meta.url), 'utf8'))
const cases = {
  product: {
    heading: 'Designing product systems people trust.',
    caseStudy: ['mentra', 'Mentra'],
    otherFeatured: [['transfi-project', 'TransFi'], ['raahi-project', 'Raahi'], ['clawed-chat', 'Clawed']],
  },
  experimental: {
    heading: 'Design That Plays',
    caseStudy: ['jugalbandi', 'Jugalbandi'],
    otherFeatured: [['enigma', 'Enigma'], ['shuffle', 'Shuffle'], ['sea-of-salt', 'Why the Sea is Salt']],
  },
}

try {
  const index = await fetch(`${base}/`)
  assert.equal(index.status, 200)
  const directory = await index.text()
  for (const [variant, details] of Object.entries(cases)) {
    assert.ok(directory.includes(`/portfolio-split/${variant}/`))
    const rawHome = await (await fetch(`${base}/${variant}/`)).text()
    assert.ok(rawHome.includes(`property="og:image" content="https://parthawe.github.io/portfolio-split${portfolios[variant].shareImage}"`))
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
      const homeCards = page.locator('#works .pcard')
      await expect(homeCards.locator('.pcard-caption p')).toHaveCount(featured.length)
      if (viewport.width <= 540) {
        const firstCard = await homeCards.first().boundingBox()
        assert.ok(firstCard && firstCard.y < viewport.height, 'Selected work should start in the first mobile screen')
      }
      assert.deepEqual(await listSlugs(page.locator('#homepage-project-archive .pcard')), [...supporting, ...archive])
      assert.ok(await page.evaluate(async () => { await document.fonts.ready; return [...document.fonts].some(font => font.status === 'loaded') }))
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))
      await page.locator('.page-loader').waitFor({ state: 'detached' })
      if (screenshots) await page.screenshot({ path: `${screenshots}/${variant}-${viewport.width}.png` })
      if (viewport.width === 1440) {
        await page.setViewportSize({ width: 900, height: 844 })
        const tablet = await homeCards.first().boundingBox()
        await page.setViewportSize({ width: 901, height: 844 })
        const smallDesktop = await homeCards.first().boundingBox()
        assert.ok(Math.abs(smallDesktop.y - tablet.y) < 80, `Selected work jumps at 901px: ${tablet.y} → ${smallDesktop.y}`)
        await page.setViewportSize(viewport)
      }

      assert.equal((await page.goto(`${url}/work/`)).status(), 200)
      await page.getByRole('heading', { level: 1, name: 'Work', exact: true }).waitFor()
      const cards = page.locator('#work-project-results .pcard')
      assert.deepEqual(await listSlugs(cards), projects)
      await expect(cards.locator('.pcard-caption__title')).toHaveCount(projects.length)
      await page.locator('.work-group--selected .work-project-grid[data-packed]').waitFor()
      const first = await cards.nth(0).boundingBox()
      const second = await cards.nth(1).boundingBox()
      const tallCover = await cards.nth(0).locator('.pcard-visual').boundingBox()
      const shortCover = await cards.nth(1).locator('.pcard-visual').boundingBox()
      assert.ok(tallCover.height > tallCover.width && shortCover.height < shortCover.width)
      const archiveCovers = page.locator('.work-group--archive .pcard-visual')
      const tallArchive = await archiveCovers.nth(0).boundingBox()
      const shortArchive = await archiveCovers.nth(1).boundingBox()
      assert.ok(tallArchive.height > tallArchive.width && shortArchive.height < shortArchive.width)
      if (viewport.width > 540) {
        assert.equal(first.y, second.y)
        const fourth = await cards.nth(3).boundingBox()
        assert.equal(fourth.x, second.x)
        assert.ok(fourth.y < first.y + first.height)
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
      if (variant === 'product') {
        const comparison = page.locator('#cs-design-proof')
        const screens = comparison.locator('img')
        await expect(screens).toHaveCount(2)
        await screens.evaluateAll(images => Promise.all(images.map(image => image.decode())))
        assert.equal((await page.goto(`${url}/transfi-project/`)).status(), 200)
        await page.getByRole('link', { name: 'Request access on the live portfolio' }).waitFor()
      } else {
        const opening = page.locator('#cs-film')
        const film = opening.getByLabel('Jugalbandi Performance', { exact: true })
        assert.ok(await film.evaluate(video => video.paused))
        await opening.getByRole('button', { name: 'Play the duet' }).click()
        await expect.poll(() => film.evaluate(video => video.currentTime), { timeout: 15000 }).toBeGreaterThan(0)
        await film.evaluate(video => video.pause())
        assert.equal((await page.goto(`${url}/shuffle/simulation/`)).status(), 200)
        await page.getByRole('heading', { name: /Shuffle/ }).first().waitFor()
        const controls = page.locator('.shuffle-controls')
        if (await controls.getAttribute('open') === null) await controls.locator('summary').click()
        const slider = page.getByRole('slider').first()
        const before = await slider.inputValue()
        await slider.press('ArrowRight')
        assert.notEqual(await slider.inputValue(), before)
      }
      const other = variant === 'product' ? 'experimental' : 'product'
      if (viewport.width === 390) {
        for (const [featuredSlug, featuredTitle] of details.otherFeatured) {
          assert.equal((await page.goto(`${url}/${featuredSlug}/`)).status(), 200)
          await page.getByRole('heading', { level: 1, name: featuredTitle, exact: true }).waitFor()
        }
      }
      await page.goto(`${url}/${slug}/`)
      await page.locator('#nav').getByRole('link', { name: portfolios[other].name, exact: true }).click()
      await page.waitForURL(`${base}/${other}/`)
      await page.getByRole('heading', { level: 1, name: cases[other].heading, exact: true }).waitFor()
      assert.deepEqual(errors, [], `${variant} at ${viewport.width}px`)
      console.log(`${variant} passed at ${viewport.width}px`)
      await page.close()
    }
  }

  const touch = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  await touch.addInitScript(() => {
    Object.defineProperty(navigator, 'hardwareConcurrency', { value: 8 })
    Object.defineProperty(navigator, 'deviceMemory', { value: 8 })
  })
  await touch.goto(`${base}/product/`)
  await touch.locator('.wr-hero.is-scene-ready canvas').waitFor({ timeout: 18000 })
  const lighting = await touch.evaluate(() => performance.getEntriesByType('resource').filter(entry => entry.name.includes('potsdamer_platz')))
  assert.deepEqual(lighting.map(entry => new URL(entry.name).pathname.split('/').at(-1)), ['potsdamer_platz_512.rgbe.gz'])
  await touch.getByRole('button', { name: 'Explore the skills and projects web' }).tap()
  await touch.locator('.wr-hero--web-open').waitFor()
  await touch.getByRole('button', { name: 'Close the web and return to the hero' }).tap()
  await touch.locator('.wr-hero--web-open').waitFor({ state: 'detached' })
  await touch.close()
  console.log('Mobile 3D hero and compact lighting passed')
} finally {
  await browser.close()
}
