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
    otherFeatured: [['transfi-project', 'TransFi']],
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
      await expect(homeCards.locator('.pcard-ribbon')).toHaveCount(featured.length)
      await expect(homeCards.locator('.pcard-visual .pcard-name')).toHaveCount(featured.length)
      if (viewport.width > 540) {
        await page.locator('.wr-feat-grid[data-packed]').waitFor()
        const first = await homeCards.nth(0).boundingBox()
        const second = await homeCards.nth(1).boundingBox()
        const third = await homeCards.nth(2).boundingBox()
        const fourth = await homeCards.nth(3).boundingBox()
        assert.equal(first.y, second.y)
        assert.equal(first.x, third.x)
        assert.equal(second.x, fourth.x)
        assert.ok(fourth.y < third.y - 20, 'Featured cards should stagger like the original')
      }
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
      await expect(cards.locator('.pcard-visual .pcard-name')).toHaveCount(projects.length)
      await page.locator('.work-group--selected .work-project-grid[data-packed]').waitFor()
      const first = await cards.nth(0).boundingBox()
      const second = await cards.nth(1).boundingBox()
      const tallCover = await cards.nth(0).locator('.pcard-visual').boundingBox()
      const shortCover = await cards.nth(2).locator('.pcard-visual').boundingBox()
      assert.ok(tallCover.height > tallCover.width * 1.2 && Math.abs(shortCover.height - shortCover.width) < 2)
      const archiveCovers = page.locator('.work-group--archive .pcard-visual')
      const tallArchive = await archiveCovers.nth(0).boundingBox()
      const shortArchive = await archiveCovers.nth(1).boundingBox()
      assert.ok(tallArchive.height > tallArchive.width && Math.abs(shortArchive.height - shortArchive.width) < 2)
      if (viewport.width > 540) {
        assert.equal(first.y, second.y)
        const fourth = await cards.nth(3).boundingBox()
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
        const quote = page.getByRole('region', { name: 'Reviewing a buy quote' })
        await expect(quote.locator('img')).toHaveCount(2)
        await quote.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode())))
        const contribution = page.getByRole('heading', { name: 'What I did', exact: true })
        const requestAccess = page.getByRole('link', { name: 'Request access on the live portfolio' })
        assert.ok(await quote.evaluate(node => node.compareDocumentPosition(document.querySelector('#overview')) & Node.DOCUMENT_POSITION_FOLLOWING))
        assert.ok((await contribution.boundingBox()).y < (await requestAccess.boundingBox()).y)
        assert.equal((await page.goto(`${url}/raahi-project/`)).status(), 200)
        const trip = page.getByRole('region', { name: 'One trip across Pune' })
        await expect(trip.getByRole('heading', { level: 3 })).toHaveText([
          'Plan from Vanaz', 'Find the feeder at Ramwadi', 'Check the next stop',
        ])
        await expect(trip.locator('img')).toHaveCount(3)
        await trip.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode())))
        await page.getByRole('heading', { name: 'What I designed', exact: true }).waitFor()
        assert.equal((await page.goto(`${url}/clawed-chat/`)).status(), 200)
        const macSetup = page.getByRole('region', { name: 'Set up Clawed on your Mac' })
        await expect(macSetup.getByRole('heading', { level: 3 })).toHaveText([
          '1. Choose Mac Companion', '2. Find the Mac Companion guide',
        ])
        const setupScreens = macSetup.locator('img')
        await expect(setupScreens).toHaveCount(2)
        await setupScreens.evaluateAll(images => Promise.all(images.map(image => image.decode())))
        const designRole = page.getByRole('region', { name: 'What I designed' })
        await expect(designRole).toContainText('sole product designer, working with three engineers')
        assert.ok((await macSetup.boundingBox()).y < (await designRole.boundingBox()).y)
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
      const portfolioSwitch = page.getByRole('group', { name: 'Portfolio', exact: true })
      await expect(portfolioSwitch.getByRole('link', { name: portfolios[variant].name, exact: true })).toHaveAttribute('aria-current', 'true')
      await portfolioSwitch.getByRole('link', { name: portfolios[other].name, exact: true }).click()
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
  const trace = touch.getByRole('button', { name: 'Trace a connection', exact: true })
  await trace.tap()
  await expect(touch.locator('.hero-object-response')).toContainText('Mentra puts MiniApps first')
  await expect(touch.getByRole('link', { name: 'Compare the Mentra home screens' })).toHaveAttribute('href', '/portfolio-split/product/mentra/#cs-design-proof')
  await touch.getByRole('button', { name: 'Explore the skills and projects web' }).tap()
  await touch.locator('.wr-hero--web-open').waitFor()
  await touch.getByRole('button', { name: 'Close the web and return to the hero' }).tap()
  await touch.locator('.wr-hero--web-open').waitFor({ state: 'detached' })
  await touch.close()
  console.log('Mobile 3D hero and compact lighting passed')
} finally {
  await browser.close()
}
