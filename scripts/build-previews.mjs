import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import path from 'node:path'

const portfolios = JSON.parse(await readFile('src/config/portfolios.json', 'utf8'))
const root = '/portfolio-split'
const origin = 'https://parthawe.github.io'
const dist = 'dist'

const escapeAttribute = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;')

function run(command, args, env = process.env) {
  const result = spawnSync(command, args, { env, stdio: 'inherit' })
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error(`${command} exited with ${result.status}`)
}

function assertPublicFile(file) {
  if (/(?:private(?:[-_ ]?(?:prototype|nda|review))|reviewer|prototype-studies-2026|interfaceprototypes|breakgen|keyboard-project)/i.test(file)) {
    throw new Error(`Unexpected non-public file: ${file}`)
  }
}

await rm(dist, { recursive: true, force: true })
for (const file of await readdir('public', { recursive: true })) assertPublicFile(file)
run('bunx', ['tsc', '-b'])

for (const [variant, portfolio] of Object.entries(portfolios)) {
  run('bunx', ['vite', 'build'], { ...process.env, VITE_PORTFOLIO: variant })
  const directory = path.join(dist, variant)
  // Tailwind resolves imported stylesheets after Vite's source transforms.
  const bundle = path.join(directory, 'bundle')
  for (const file of await readdir(bundle)) {
    if (!file.endsWith('.css')) continue
    const target = path.join(bundle, file)
    const css = await readFile(target, 'utf8')
    await writeFile(target, css.replace(/url\((['"]?)\/Assets\//g, (_, quote) => `url(${quote}${root}/Assets/`))
  }
  const index = await readFile(path.join(directory, 'index.html'), 'utf8')
  const routes = ['work', 'about', 'accessibility', ...portfolio.pages, ...portfolio.featured, ...portfolio.supporting, ...portfolio.archive]
  if (variant === 'product') routes.push('mentra-website')
  if (variant === 'experimental') {
    routes.push('project-experiences', ...['jugalbandi', 'enigma', 'shuffle', 'black-hole', 'revolving-stage', 'moniac-machine'].map(slug => `${slug}/world`))
  }
  const documentFor = (route = '') => {
    const title = `${portfolio.name} · Parth Pawar`
    const url = `${origin}${root}/${variant}/${route ? route + '/' : ''}`
    const image = `${origin}${root}${portfolio.shareImage}`
    const meta = [
      ['name', 'description', portfolio.description],
      ['property', 'og:type', 'website'],
      ['property', 'og:title', title],
      ['property', 'og:description', portfolio.description],
      ['property', 'og:url', url],
      ['property', 'og:image', image],
      ['property', 'og:image:alt', portfolio.shareImageAlt],
      ['name', 'twitter:card', 'summary_large_image'],
      ['name', 'twitter:title', title],
      ['name', 'twitter:description', portfolio.description],
      ['name', 'twitter:image', image],
      ['name', 'twitter:image:alt', portfolio.shareImageAlt],
    ].map(([attribute, key, value]) => `<meta data-rh="true" ${attribute}="${key}" content="${escapeAttribute(value)}" />`)
    return index.replace('<title>Parth Pawar</title>', [
      `<title>${escapeAttribute(title)}</title>`,
      ...meta,
      `<link data-rh="true" rel="canonical" href="${escapeAttribute(url)}" />`,
    ].join('\n    '))
  }
  await writeFile(path.join(directory, 'index.html'), documentFor())
  for (const route of routes) {
    const target = path.join(directory, route)
    await mkdir(target, { recursive: true })
    await writeFile(path.join(target, 'index.html'), documentFor(route))
  }
}

await cp('public', dist, { recursive: true })
await writeFile(path.join(dist, '.nojekyll'), '')
await writeFile(path.join(dist, 'robots.txt'), 'User-agent: *\nAllow: /\n')
const directoryPage = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>Parth Pawar · Portfolios</title>
<style>@font-face{font-family:Nikolas;src:url(${root}/Assets/fonts/nikolas.woff2)}body{margin:0;background:#fafaf8;color:#171717;font:1rem/1.5 system-ui}main{max-width:40rem;margin:14vh auto;padding:1.5rem}h1{font:clamp(2.5rem,7vw,5rem)/1.1 Nikolas,serif;margin:0 0 2rem}a{display:block;padding:1rem 0;border-top:1px solid #d1d1ca;color:inherit;text-underline-offset:.22em}a:last-child{border-bottom:1px solid #d1d1ca}</style></head>
<body><main><h1>Parth Pawar</h1><a href="${root}/product/">Product Design →</a><a href="${root}/experimental/">Design That Plays →</a></main></body></html>`
await writeFile(path.join(dist, 'index.html'), directoryPage)
await writeFile(path.join(dist, '404.html'), directoryPage.replace('<h1>Parth Pawar</h1>', '<h1>Page not found</h1>'))
