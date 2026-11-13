import portfolios from './portfolios.json'

export const portfolioOptions = [
  { name: portfolios.product.name, shortName: 'Product' },
  { name: portfolios.experimental.name, shortName: 'Plays' },
]

export const isExperimental = import.meta.env.VITE_PORTFOLIO === 'experimental'
export const portfolio = isExperimental ? portfolios.experimental : portfolios.product
export const sibling = isExperimental ? portfolios.product : portfolios.experimental
export const previewRoot = '/portfolio-split'
export const siblingHome = `${previewRoot}/${isExperimental ? 'product' : 'experimental'}/`
export const projectSlugs = [...portfolio.featured, ...portfolio.supporting, ...portfolio.archive]
export const siblingSlugs = [...sibling.featured, ...sibling.supporting, ...sibling.archive]

/** React Router keeps same-portfolio links local and follows a sibling URL normally. */
export function projectLink(path: string) {
  const slug = path.split('/')[1]
  return siblingSlugs.includes(slug) ? new URL(siblingHome + path.slice(1), window.location.origin).href : path
}
